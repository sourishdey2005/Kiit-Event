'use server';
/**
 * @fileOverview An AI assistant flow for generating engaging and detailed event descriptions.
 *
 * - generateEventDescription - A function that handles the generation of event descriptions.
 * - GenerateEventDescriptionInput - The input type for the generateEventDescription function.
 * - GenerateEventDescriptionOutput - The return type for the generateEventDescription function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateEventDescriptionInputSchema = z.object({
  textInput: z.string().describe('Keywords or a short outline for the event description. This should be the primary content for the AI to expand upon.'),
  eventName: z.string().optional().describe('The name of the event, if available. Use this to make the description more specific.'),
  eventDate: z.string().optional().describe('The date of the event, if available. Integrate this into the description.'),
  eventTime: z.string().optional().describe('The time of the event, if available. Integrate this into the description.'),
  eventVenue: z.string().optional().describe('The venue of the event, if available. Integrate this into the description.'),
});
export type GenerateEventDescriptionInput = z.infer<typeof GenerateEventDescriptionInputSchema>;

const GenerateEventDescriptionOutputSchema = z.object({
  description: z.string().describe('The generated engaging and detailed event description.'),
});
export type GenerateEventDescriptionOutput = z.infer<typeof GenerateEventDescriptionOutputSchema>;

const generateEventDescriptionPrompt = ai.definePrompt({
  name: 'generateEventDescriptionPrompt',
  input: { schema: GenerateEventDescriptionInputSchema },
  output: { schema: GenerateEventDescriptionOutputSchema },
  prompt: `You are an AI assistant specialized in writing engaging and detailed event descriptions for a university campus event management system.
Your goal is to help society admins create compelling event listings quickly and efficiently.

Based on the provided information, generate a detailed and engaging event description. The description should be well-structured, have a compelling introduction, highlight key aspects and benefits for participants, and include a clear call to action. Ensure the description is suitable for a college student audience and captures the essence of the event.

Event Name (if provided, integrate naturally): {{{eventName}}}
Event Date (if provided, integrate naturally): {{{eventDate}}}
Event Time (if provided, integrate naturally): {{{eventTime}}}
Event Venue (if provided, integrate naturally): {{{eventVenue}}}

Here are some keywords or a short outline for the event. Elaborate on these points to create a full description:
{{{textInput}}}`,
});

const generateEventDescriptionFlow = ai.defineFlow(
  {
    name: 'generateEventDescriptionFlow',
    inputSchema: GenerateEventDescriptionInputSchema,
    outputSchema: GenerateEventDescriptionOutputSchema,
  },
  async (input) => {
    const { output } = await generateEventDescriptionPrompt(input);
    return output!;
  },
);

export async function generateEventDescription(
  input: GenerateEventDescriptionInput,
): Promise<GenerateEventDescriptionOutput> {
  return generateEventDescriptionFlow(input);
}
