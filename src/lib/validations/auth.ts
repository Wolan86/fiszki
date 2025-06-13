import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email jest wymagany")
    .email("Podaj poprawny adres email"),
  password: z
    .string()
    .min(1, "Hasło jest wymagane")
    .min(8, "Hasło musi mieć co najmniej 8 znaków"),
});

export const registerSchema = z.object({
  email: z
    .string()
    .min(1, "Email jest wymagany")
    .email("Podaj poprawny adres email"),
  password: z
    .string()
    .min(1, "Hasło jest wymagane")
    .min(8, "Hasło musi mieć co najmniej 8 znaków")
    .regex(
      /(?=.*\d)(?=.*[!@#$%^&*])/,
      "Hasło musi zawierać przynajmniej jedną cyfrę i jeden znak specjalny"
    ),
  confirmPassword: z.string().min(1, "Potwierdzenie hasła jest wymagane"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Hasła nie są identyczne",
  path: ["confirmPassword"],
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>; 