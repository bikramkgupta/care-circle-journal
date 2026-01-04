import { z } from 'zod';
export declare const SignupSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    name: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    name: string;
    password: string;
}, {
    email: string;
    name: string;
    password: string;
}>;
export declare const LoginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
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
export declare const CareProfileSchema: z.ZodObject<{
    name: z.ZodString;
    dateOfBirth: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    dateOfBirth?: string | undefined;
    notes?: string | undefined;
}, {
    name: string;
    dateOfBirth?: string | undefined;
    notes?: string | undefined;
}>;
export type CareProfileInput = z.infer<typeof CareProfileSchema>;
export declare const EntryTypeSchema: z.ZodEnum<["NOTE", "SLEEP", "MEAL", "SYMPTOM", "ACTIVITY", "MEDICATION"]>;
export declare const EntrySchema: z.ZodObject<{
    timestamp: z.ZodOptional<z.ZodString>;
    type: z.ZodEnum<["NOTE", "SLEEP", "MEAL", "SYMPTOM", "ACTIVITY", "MEDICATION"]>;
    freeText: z.ZodString;
    moodScore: z.ZodOptional<z.ZodNumber>;
    tags: z.ZodOptional<z.ZodAny>;
    structuredPayload: z.ZodOptional<z.ZodAny>;
}, "strip", z.ZodTypeAny, {
    type: "NOTE" | "SLEEP" | "MEAL" | "SYMPTOM" | "ACTIVITY" | "MEDICATION";
    freeText: string;
    timestamp?: string | undefined;
    moodScore?: number | undefined;
    tags?: any;
    structuredPayload?: any;
}, {
    type: "NOTE" | "SLEEP" | "MEAL" | "SYMPTOM" | "ACTIVITY" | "MEDICATION";
    freeText: string;
    timestamp?: string | undefined;
    moodScore?: number | undefined;
    tags?: any;
    structuredPayload?: any;
}>;
export type EntryInput = z.infer<typeof EntrySchema>;
export * from './prisma';
//# sourceMappingURL=index.d.ts.map