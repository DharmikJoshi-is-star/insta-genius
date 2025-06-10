
"use client";

import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface CaptionSelectorProps {
  captions: string[];
  selectedCaption: string; // The original selected from generated
  editedCaption: string;   // The current text in textarea
  onSelect: (caption: string) => void;
  onEdit: (newCaption: string) => void;
  feedback?: string;
  isLoading: boolean;
}

export function CaptionSelector({
  captions,
  selectedCaption,
  editedCaption,
  onSelect,
  onEdit,
  feedback,
  isLoading,
}: CaptionSelectorProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-3/4" />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center space-x-2">
              <Skeleton className="h-4 w-4 rounded-full" />
              <Skeleton className="h-4 w-full" />
            </div>
          ))}
        </div>
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  if (captions.length === 0 && !editedCaption) {
    return null; // Don't render if no captions and not even an initial edited caption
  }

  return (
    <div className="space-y-6">
      {captions.length > 0 && (
        <div>
          <Label className="font-body text-base font-medium mb-2 block">Choose a suggestion:</Label>
          <RadioGroup
            value={selectedCaption}
            onValueChange={(value) => onSelect(value)}
            className="space-y-2"
          >
            {captions.map((caption, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-secondary/30 rounded-md hover:bg-secondary/60 transition-colors">
                <RadioGroupItem value={caption} id={`caption-${index}`} />
                <Label htmlFor={`caption-${index}`} className="font-body text-sm cursor-pointer flex-1">
                  {caption}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      )}

      <div>
        <Label htmlFor="editedCaption" className="font-body text-base font-medium mb-2 block">
          {captions.length > 0 ? "Edit your caption:" : "Write your caption:"}
        </Label>
        <Textarea
          id="editedCaption"
          value={editedCaption}
          onChange={(e) => onEdit(e.target.value)}
          placeholder="Your engaging caption..."
          className="min-h-[100px] font-body text-sm rounded-md shadow-sm"
          rows={4}
        />
        {feedback && <p className="text-xs text-green-600 mt-2 font-body">{feedback}</p>}
      </div>
    </div>
  );
}
