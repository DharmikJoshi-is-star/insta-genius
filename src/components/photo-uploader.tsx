
"use client";

import type { ChangeEvent } from 'react';
import React, { useState } from 'react';
import Image from 'next/image';
import { ImagePlus, UploadCloud } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';

interface PhotoUploaderProps {
  onImageUpload: (imageDataUri: string) => void;
  label?: string;
}

export function PhotoUploader({ onImageUpload, label = "Upload Photo" }: PhotoUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file.');
        return;
      }
      setFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUri = reader.result as string;
        setPreview(dataUri);
        onImageUpload(dataUri);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
      setFileName(null);
      onImageUpload(''); // Clear image
    }
  };

  return (
    <div className="space-y-4">
      <Label htmlFor="photo-upload" className="font-body text-sm font-medium">
        {label}
      </Label>
      <Card className="border-2 border-dashed border-muted-foreground/50 hover:border-primary transition-colors">
        <CardContent className="p-0">
          <label
            htmlFor="photo-upload-input"
            className="flex flex-col items-center justify-center p-6 cursor-pointer"
          >
            {preview ? (
              <div className="relative w-full h-48 md:h-64 rounded-md overflow-hidden">
                <Image
                  src={preview}
                  alt="Uploaded preview"
                  layout="fill"
                  objectFit="contain"
                  data-ai-hint="user uploaded content"
                />
              </div>
            ) : (
              <div className="text-center space-y-2 text-muted-foreground">
                <UploadCloud className="mx-auto h-12 w-12" />
                <p className="font-semibold font-body">Click to upload or drag and drop</p>
                <p className="text-xs font-body">PNG, JPG, GIF up to 10MB</p>
              </div>
            )}
          </label>
          <Input
            id="photo-upload-input"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="sr-only"
          />
        </CardContent>
      </Card>
      {fileName && <p className="text-xs text-muted-foreground font-body">Selected file: {fileName}</p>}
    </div>
  );
}
