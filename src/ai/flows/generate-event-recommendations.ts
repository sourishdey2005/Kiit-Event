'use server';
/**
 * @fileOverview This file implements a Genkit flow for generating personalized event recommendations for students.
 *
 * - generateEventRecommendations - A function that provides personalized event recommendations based on student data.
 * - GenerateEventRecommendationsInput - The input type for the generateEventRecommendations function.
 * - GenerateEventRecommendationsOutput - The return type for the generateEventRecommendations function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateEventRecommendationsInputSchema = z.object({
  studentInterests: z
    .array(z.string())
    .describe(
      "A list of the student's declared interests or preferences (e.g., 'tech', 'music', 'sports')."
    ),
  pastEventTitles: z
    .array(z.string())
    .describe(
      "A list of titles of events the student has previously registered for. The availableEvents list passed to this flow should already be filtered to exclude these events."
    ),
  availableEvents: z
    .array(
      z.object({
        id: z.string().uuid().describe('The unique ID of the event.'),
        title: z.string().describe('The title of the event.'),
        description: z.string().describe('A brief description of the event.'),
        societyName: z.string().describe('The name of the organizing society.'),
        eventDate: z.string().datetime().describe('The date and time of the event in ISO 8601 format.'),
      })
    )
    .describe(
      "A list of available events for recommendation. This list should NOT include events the student has already registered for."
    ),
});
export type GenerateEventRecommendationsInput = z.infer<
  typeof GenerateEventRecommendationsInputSchema
>;

const GenerateEventRecommendationsOutputSchema = z.object({
  recommendedEvents: z
    .array(
      z.object({
        eventId: z
          .string()
          .uuid()
          .describe('The ID of the recommended event.'),
        reason: z
          .string()
          .describe(
            'A brief explanation (1-2 sentences) for why this event is recommended to the student, considering their interests and past activities.'
          ),
      })
    )
    .max(5) // Limit to a maximum of 5 recommendations
    .describe('A list of recommended events with reasons.'),
});
export type GenerateEventRecommendationsOutput = z.infer<
  typeof GenerateEventRecommendationsOutputSchema
>;

export async function generateEventRecommendations(
  input: GenerateEventRecommendationsInput
): Promise<GenerateEventRecommendationsOutput> {
  return generateEventRecommendationsFlow(input);
}

const recommendationPrompt = ai.definePrompt({
  name: 'eventRecommendationPrompt',
  input: { schema: GenerateEventRecommendationsInputSchema },
  output: { schema: GenerateEventRecommendationsOutputSchema },
  prompt: `You are an intelligent event recommendation system for students. Your goal is to provide personalized event suggestions based on the student's declared interests and their history of registered events.

Student's Interests:
{{#if studentInterests}}
{{#each studentInterests}}- {{this}}
{{/each}}
{{else}}No specific interests provided.
{{/if}}

Student's Past Registered Event Titles:
{{#if pastEventTitles}}
{{#each pastEventTitles}}- {{this}}
{{/each}}
{{else}}No past event registrations recorded.
{{/if}}

Available Events for Recommendation (IDs are important for output):
{{#if availableEvents}}
{{#each availableEvents}}
- Event ID: {{this.id}}
  Title: {{this.title}}
  Description: {{this.description}}
  Organizing Society: {{this.societyName}}
  Event Date: {{this.eventDate}}
{{/each}}
{{else}}No available events to recommend at this time.
{{/if}}

Please analyze the student's interests and past event preferences. From the 'Available Events for Recommendation' list, identify up to 5 events that would be most relevant and appealing to this student.
For each recommended event, you MUST provide its 'eventId' and a concise 'reason' (1-2 sentences) explaining why it's a good recommendation based on the student's profile.
Ensure that the 'eventId' corresponds exactly to one of the IDs from the 'Available Events for Recommendation' list. Do not invent events or event IDs.
If no suitable recommendations can be found, return an empty array for 'recommendedEvents'.

Output in the following JSON format:
`,
});

const generateEventRecommendationsFlow = ai.defineFlow(
  {
    name: 'generateEventRecommendationsFlow',
    inputSchema: GenerateEventRecommendationsInputSchema,
    outputSchema: GenerateEventRecommendationsOutputSchema,
  },
  async (input) => {
    const { output } = await recommendationPrompt(input);
    return output!;
  }
);
