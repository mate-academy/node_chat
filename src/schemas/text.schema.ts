import { z } from 'zod';

export const textSchema = z.object({
  text: z
    .string({
      required_error: 'Message is required',
      invalid_type_error: 'Message must be a string',
    })
    .trim()
    .min(6, 'Message must be at least 6 characters long')
    .max(100, 'Message must be at most 50 characters long'),
});

export type TextSchema = z.infer<typeof textSchema>;
