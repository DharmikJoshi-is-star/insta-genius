
"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ClipboardCopyIcon } from 'lucide-react';

interface ClipboardCopyProps {
  textToCopy: string;
  buttonText?: string;
  className?: string;
}

export function ClipboardCopy({ textToCopy, buttonText = "Copy to Clipboard", className }: ClipboardCopyProps) {
  const { toast } = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      toast({
        title: "Copied!",
        description: "Content copied to clipboard.",
        variant: "default",
      });
    } catch (err) {
      console.error("Failed to copy: ", err);
      toast({
        title: "Error",
        description: "Failed to copy content.",
        variant: "destructive",
      });
    }
  };

  return (
    <Button onClick={handleCopy} className={className} variant="outline">
      <ClipboardCopyIcon className="mr-2 h-4 w-4" />
      {buttonText}
    </Button>
  );
}
