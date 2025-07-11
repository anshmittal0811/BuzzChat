import { z } from "zod";

export const loginSchema = z.object({
    email: z.string().email({ message: "Invalid email address" }),
    password: z
        .string()
        .min(8, { message: "Password must be at least 8 characters long" })
        .regex(/[a-zA-Z0-9]/, { message: "Password must be alphanumeric" }),
});

export type LoginSchema = z.infer<typeof loginSchema>;