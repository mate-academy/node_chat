import { z } from 'zod';

export const nameSchema = z.object({
  name: z
    .string({
      required_error: 'Name is required',
      invalid_type_error: 'Name must be a string',
    })
    .trim()
    .min(6, 'Name must be at least 6 characters long')
    .max(50, 'Name must be at most 50 characters long'),
});

export type NameSchema = z.infer<typeof nameSchema>;
