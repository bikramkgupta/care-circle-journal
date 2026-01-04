import { z } from 'zod';

export const SignupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
});

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export type SignupInput = z.infer<typeof SignupSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export const CareProfileSchema = z.object({
  name: z.string().min(1),
  dateOfBirth: z.string().optional(),
  notes: z.string().optional(),
});

export type CareProfileInput = z.infer<typeof CareProfileSchema>;

export const EntryTypeSchema = z.enum([
  'NOTE',
  'SLEEP',
  'MEAL',
  'SYMPTOM',
  'ACTIVITY',
  'MEDICATION',
]);

export const EntrySchema = z.object({
  timestamp: z.string().optional(),
  type: EntryTypeSchema,
  freeText: z.string(),
  moodScore: z.number().min(1).max(5).optional(),
  tags: z.any().optional(),
  structuredPayload: z.any().optional(),
});

export type EntryInput = z.infer<typeof EntrySchema>;

export * from './prisma';



