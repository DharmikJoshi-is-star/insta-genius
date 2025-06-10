
"use client";

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { X, PlusCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface HashtagSelectorProps {
  suggestedByAI: string[];
  activeHashtags: string[];
  onAdd: (hashtag: string) => void;
  onRemove: (hashtag: string) => void;
  isLoading: boolean;
  feedback?: string;
}

export function HashtagSelector({
  suggestedByAI,
  activeHashtags,
  onAdd,
  onRemove,
  isLoading,
  feedback,
}: HashtagSelectorProps): JSX.Element {
  const [newHashtagInput, setNewHashtagInput] = useState('');

  const handleAddCustomHashtag = () => {
    if (newHashtagInput.trim() !== '') {
      onAdd(newHashtagInput.trim().replace(/^#/, ''));
      setNewHashtagInput('');
    }
  };

  const handleSuggestedClick = (hashtag: string) => {
    const cleanHashtag = hashtag.replace(/^#/, '');
    if (!activeHashtags.includes(cleanHashtag)) {
      onAdd(cleanHashtag);
    } else {
      onRemove(cleanHashtag);
    }
  };
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-1/2" />
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-8 w-20 rounded-full" />)}
        </div>
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  return (
    <section className="space-y-6">
      {suggestedByAI.length > 0 && (
        <div>
          <Label className="font-body text-base font-medium mb-2 block">Suggestions (click to add/remove):</Label>
          <div className="flex flex-wrap gap-2">
            {suggestedByAI.map((tag, index) => {
              const cleanTag = tag.replace(/^#/, '');
              const isActive = activeHashtags.includes(cleanTag);
              return (
                <Badge
                  key={`suggested-${index}`}
                  variant={isActive ? "default" : "secondary"}
                  onClick={() => handleSuggestedClick(tag)}
                  className="cursor-pointer transition-all hover:opacity-80 py-1.5 px-3 text-sm font-body rounded-full"
                >
                  #{cleanTag}
                </Badge>
              );
            })}
          </div>
        </div>
      )}

      <div>
        <Label htmlFor="customHashtag" className="font-body text-base font-medium mb-2 block">Add your own hashtags:</Label>
        <div className="flex space-x-2">
          <Input
            id="customHashtag"
            type="text"
            value={newHashtagInput}
            onChange={(e) => setNewHashtagInput(e.target.value)}
            placeholder="e.g., travelphotography"
            className="font-body text-sm rounded-md shadow-sm"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleAddCustomHashtag();
                e.preventDefault();
              }
            }}
          />
          <Button onClick={handleAddCustomHashtag} size="icon" variant="outline" aria-label="Add hashtag">
            <PlusCircle className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {activeHashtags.length > 0 && (
        <div>
          <Label className="font-body text-base font-medium mb-2 block">Your selected hashtags:</Label>
          <div className="flex flex-wrap gap-2">
            {activeHashtags.map((tag, index) => (
              <Badge key={`active-${index}`} variant="default" className="py-1.5 px-3 text-sm font-body rounded-full shadow-sm">
                #{tag.replace(/^#/, '')}
                <button
                  onClick={() => onRemove(tag)}
                  className="ml-2 appearance-none focus:outline-none"
                  aria-label={`Remove hashtag ${tag}`}
                >
                  <X className="h-3 w-3 text-primary-foreground hover:text-destructive-foreground" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
        )}
      {feedback && <p className="text-xs text-green-600 mt-2 font-body">{feedback}</p>}
    </section>
  );
}
