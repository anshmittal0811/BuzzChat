import { z } from "zod";

export const registerSchema = z
    .object({
        firstName: z
            .string()
            .min(2, { message: "First name must be at least 2 characters long" }),
        lastName: z
            .string()
            .min(2, { message: "Last name must be at least 2 characters long" }),
        email: z.string().email({ message: "Invalid email address" }),
        password: z
            .string()
            .min(8, { message: "Password must be at least 8 characters long" })
            .regex(/[a-zA-Z0-9]/, { message: "Password must be alphanumeric" }),
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        path: ["confirmPassword"],
        message: "Passwords do not match",
    });

export type RegisterSchema = z.infer<typeof registerSchema>;