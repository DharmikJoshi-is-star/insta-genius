
"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PhotoUploader } from '@/components/photo-uploader';
import { CaptionSelector } from '@/components/caption-selector';
import { HashtagSelector } from '@/components/hashtag-selector';
import { ClipboardCopy } from '@/components/clipboard-copy';
import { generateCaptions } from '@/ai/flows/generate-caption';
import type { GenerateCaptionsInput } from '@/ai/flows/generate-caption';
import { suggestHashtags } from '@/ai/flows/suggest-hashtags';
import type { SuggestHashtagsInput } from '@/ai/flows/suggest-hashtags';
import { Loader2, Sparkles, Tags, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";


export function InstaGeniusApp() {
  const [uploadedImageDataUri, setUploadedImageDataUri] = useState<string | null>(null);
  const [imageTopic, setImageTopic] = useState<string>('');

  const [generatedCaptionsList, setGeneratedCaptionsList] = useState<string[]>([]);
  const [selectedCaptionFromAI, setSelectedCaptionFromAI] = useState<string>('');
  const [editedCaption, setEditedCaption] = useState<string>('');
  const [captionFeedback, setCaptionFeedback] = useState<string>('');

  const [suggestedByAIHashtags, setSuggestedByAIHashtags] = useState<string[]>([]);
  const [activeHashtags, setActiveHashtags] = useState<string[]>([]);
  const [hashtagsFeedback, setHashtagsFeedback] = useState<string>('');
  
  const [isLoadingCaptions, setIsLoadingCaptions] = useState<boolean>(false);
  const [isLoadingHashtags, setIsLoadingHashtags] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const { toast } = useToast();

  const handleImageUpload = useCallback((imageDataUri: string) => {
    setUploadedImageDataUri(imageDataUri);
    // Reset subsequent steps if new image is uploaded
    setGeneratedCaptionsList([]);
    setSelectedCaptionFromAI('');
    setEditedCaption('');
    setSuggestedByAIHashtags([]);
    setActiveHashtags([]);
    setError(null);
  }, []);

  const handleGenerateCaptions = async () => {
    if (!uploadedImageDataUri || !imageTopic) {
      setError("Please upload an image and provide a topic.");
      return;
    }
    setIsLoadingCaptions(true);
    setError(null);
    setCaptionFeedback('');
    try {
      const input: GenerateCaptionsInput = { photoDataUri: uploadedImageDataUri, topic: imageTopic };
      const result = await generateCaptions(input);
      setGeneratedCaptionsList(result.captions || []);
      if (result.captions && result.captions.length > 0) {
        setSelectedCaptionFromAI(result.captions[0]);
        setEditedCaption(result.captions[0]);
        setCaptionFeedback('Captions generated. Select one or edit below.');
      } else {
        setCaptionFeedback('No captions generated. Try a different topic or image.');
      }
    } catch (e) {
      console.error("Failed to generate captions:", e);
      setError("Failed to generate captions. Please try again.");
      toast({ title: "Caption Generation Error", description: "Could not generate captions.", variant: "destructive" });
    } finally {
      setIsLoadingCaptions(false);
    }
  };
  
  const handleSelectCaption = useCallback((caption: string) => {
    setSelectedCaptionFromAI(caption);
    setEditedCaption(caption);
    setCaptionFeedback('Caption selected. You can edit it below.');
  }, []);

  const handleEditCaption = useCallback((newCaption: string) => {
    setEditedCaption(newCaption);
    setCaptionFeedback('Caption updated.');
  }, []);


  const handleGenerateHashtags = async () => {
    if (!uploadedImageDataUri || !editedCaption) {
      setError("Please ensure an image is uploaded and a caption is available.");
      return;
    }
    setIsLoadingHashtags(true);
    setError(null);
    setHashtagsFeedback('');
    try {
      const input: SuggestHashtagsInput = { photoDataUri: uploadedImageDataUri, caption: editedCaption };
      const result = await suggestHashtags(input);
      setSuggestedByAIHashtags(result.hashtags || []);
      if (result.hashtags && result.hashtags.length > 0) {
         setHashtagsFeedback('Hashtags suggested. Click to add them to your list.');
      } else {
         setHashtagsFeedback('No hashtags suggested for this caption.');
      }
      // Do not automatically add suggested hashtags to activeHashtags. Let user pick.
    } catch (e) {
      console.error("Failed to suggest hashtags:", e);
      setError("Failed to suggest hashtags. Please try again.");
      toast({ title: "Hashtag Suggestion Error", description: "Could not suggest hashtags.", variant: "destructive" });
    } finally {
      setIsLoadingHashtags(false);
    }
  };
  
  const handleAddActiveHashtag = useCallback((hashtag: string) => {
    const cleanHashtag = hashtag.replace(/^#/, '').trim();
    if (cleanHashtag && !activeHashtags.includes(cleanHashtag)) {
      setActiveHashtags(prev => [...prev, cleanHashtag]);
      setHashtagsFeedback(`Added #${cleanHashtag}.`);
    }
  }, [activeHashtags]);

  const handleRemoveActiveHashtag = useCallback((hashtagToRemove: string) => {
    const cleanHashtagToRemove = hashtagToRemove.replace(/^#/, '').trim();
    setActiveHashtags(prev => prev.filter(h => h !== cleanHashtagToRemove));
    setHashtagsFeedback(`Removed #${cleanHashtagToRemove}.`);
  }, []);


  const finalPostText = () => {
    const captionPart = editedCaption.trim();
    const hashtagsPart = activeHashtags.length > 0 
      ? activeHashtags.map(h => `#${h.replace(/^#/, '')}`).join(' ')
      : '';
    
    if (captionPart && hashtagsPart) {
      return `${captionPart}\n\n${hashtagsPart}`;
    }
    if (captionPart) return captionPart;
    if (hashtagsPart) return hashtagsPart;
    return "";
  };

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);


  return (
    <div className="container mx-auto px-2 py-8 md:px-4 min-h-screen flex flex-col items-center">
      <header className="my-6 md:my-10 text-center">
        <h1 className="text-4xl md:text-5xl font-headline text-primary">InstaGenius</h1>
        <p className="text-muted-foreground font-body mt-2 text-base md:text-lg">Your AI-powered Instagram assistant</p>
      </header>

      {error && (
         <Alert variant="destructive" className="w-full max-w-4xl mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 w-full max-w-5xl">
        {/* Left Column: Upload & Generation Trigger */}
        <Card className="shadow-lg rounded-xl">
          <CardHeader>
            <CardTitle className="font-headline text-2xl">1. Create Your Post</CardTitle>
            <CardDescription className="font-body">Upload an image and provide a topic to get started.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <PhotoUploader onImageUpload={handleImageUpload} />
            {uploadedImageDataUri && (
              <>
                <div>
                  <Label htmlFor="topic" className="font-body text-base font-medium mb-2 block">Photo Topic</Label>
                  <Input 
                    id="topic" 
                    value={imageTopic} 
                    onChange={(e) => setImageTopic(e.target.value)} 
                    placeholder="e.g., Sunset, Food, Travel Adventure" 
                    className="font-body text-sm rounded-md shadow-sm"
                  />
                </div>
                <Button 
                  onClick={handleGenerateCaptions} 
                  disabled={isLoadingCaptions || !imageTopic.trim() || !uploadedImageDataUri} 
                  className="w-full font-body py-3 text-base rounded-md shadow-md"
                >
                  {isLoadingCaptions ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Sparkles className="mr-2 h-5 w-5" />}
                  Generate Captions
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Right Column: Results & Editing */}
        <div className="space-y-6 md:space-y-8">
          {(generatedCaptionsList.length > 0 || isLoadingCaptions || editedCaption) && (
            <Card className="shadow-lg rounded-xl">
              <CardHeader>
                <CardTitle className="font-headline text-2xl">2. Caption</CardTitle>
                <CardDescription className="font-body">Choose a suggestion or write/edit your own.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <CaptionSelector
                  captions={generatedCaptionsList}
                  selectedCaption={selectedCaptionFromAI}
                  editedCaption={editedCaption}
                  onSelect={handleSelectCaption}
                  onEdit={handleEditCaption}
                  feedback={captionFeedback}
                  isLoading={isLoadingCaptions}
                />
                {editedCaption && !isLoadingCaptions && (
                    <Button 
                      onClick={handleGenerateHashtags} 
                      disabled={isLoadingHashtags} 
                      className="w-full font-body py-3 text-base rounded-md shadow-md"
                      variant="outline"
                    >
                      {isLoadingHashtags ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Tags className="mr-2 h-5 w-5" />}
                      Suggest Hashtags
                    </Button>
                )}
              </CardContent>
            </Card>
          )}
          
          {(suggestedByAIHashtags.length > 0 || activeHashtags.length > 0 || isLoadingHashtags || (editedCaption && !isLoadingCaptions)) && (
             <Card className="shadow-lg rounded-xl">
              <CardHeader>
                <CardTitle className="font-headline text-2xl">3. Hashtags</CardTitle>
                <CardDescription className="font-body">Select from suggestions or add your custom hashtags.</CardDescription>
              </CardHeader>
              <CardContent>
                 <HashtagSelector
                  suggestedByAI={suggestedByAIHashtags}
                  activeHashtags={activeHashtags}
                  onAdd={handleAddActiveHashtag}
                  onRemove={handleRemoveActiveHashtag}
                  isLoading={isLoadingHashtags}
                  feedback={hashtagsFeedback}
                />
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {(editedCaption || activeHashtags.length > 0) && (
        <Card className="mt-6 md:mt-8 w-full max-w-5xl shadow-lg rounded-xl">
          <CardHeader>
            <CardTitle className="font-headline text-2xl">4. Your Final Post</CardTitle>
            <CardDescription className="font-body">Preview your generated content below.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-muted/50 p-4 md:p-6 rounded-lg space-y-3 min-h-[100px] shadow-inner">
              {editedCaption && <p className="font-body text-sm md:text-base whitespace-pre-wrap">{editedCaption}</p>}
              {activeHashtags.length > 0 && (
                <p className="font-body text-accent-foreground/80 text-sm">
                  {activeHashtags.map(h => `#${h.replace(/^#/, '')}`).join(' ')}
                </p>
              )}
               {!editedCaption && activeHashtags.length === 0 && (
                <p className="font-body text-muted-foreground italic">Your caption and hashtags will appear here...</p>
               )}
            </div>
            <ClipboardCopy
              textToCopy={finalPostText()}
              className="mt-6 w-full font-body py-3 text-base rounded-md shadow-md"
              buttonText="Copy Post Content"
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
