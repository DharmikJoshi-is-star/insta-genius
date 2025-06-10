'use server';

/**
 * @fileOverview Generates caption options for an uploaded photo.
 *
 * - generateCaptions - A function that generates caption options for an uploaded photo.
 * - GenerateCaptionsInput - The input type for the generateCaptions function.
 * - GenerateCaptionsOutput - The return type for the generateCaptions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateCaptionsInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo to generate captions for, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  topic: z.string().describe('The topic of the photo.'),
});
export type GenerateCaptionsInput = z.infer<typeof GenerateCaptionsInputSchema>;

const GenerateCaptionsOutputSchema = z.object({
  captions: z.array(z.string()).describe('Generated caption options for the photo.'),
});
export type GenerateCaptionsOutput = z.infer<typeof GenerateCaptionsOutputSchema>;

export async function generateCaptions(input: GenerateCaptionsInput): Promise<GenerateCaptionsOutput> {
  return generateCaptionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateCaptionsPrompt',
  input: {schema: GenerateCaptionsInputSchema},
  output: {schema: GenerateCaptionsOutputSchema},
  prompt: `You are an AI caption generator for social media.

  Generate multiple relevant caption options for the uploaded photo, so the user can quickly choose one that fits.
  The captions should be engaging and relevant to the photo's content.

  Topic: {{{topic}}}
  Photo: {{media url=photoDataUri}}

  Format the output as a JSON object with a \"captions\" key, which is an array of strings. Each string should be a caption option.
  Include at least 3 captions.
  `,
});

const generateCaptionsFlow = ai.defineFlow(
  {
    name: 'generateCaptionsFlow',
    inputSchema: GenerateCaptionsInputSchema,
    outputSchema: GenerateCaptionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
