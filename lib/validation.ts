import { z } from 'zod';

export const usernameSchema = z
  .string()
  .min(1, 'Username is required')
  .max(50, 'Username must be less than 50 characters')
  .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores');

export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Please enter a valid email address')
  .max(100, 'Email must be less than 100 characters');

export const loginPasswordSchema = z
  .string()
  .min(1, 'Password is required')
  .max(100, 'Password must be less than 100 characters');

export const registerPasswordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(100, 'Password must be less than 100 characters')
  .regex(
    /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).{8,}$/,
    'Password must contain at least 1 number, 1 uppercase, and 1 lowercase letter'
  );

export const loginSchema = z.object({
  username: usernameSchema,
  password: loginPasswordSchema,
});

export const registerSchema = z.object({
  username: usernameSchema,
  email: emailSchema,
  password: registerPasswordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const changePasswordSchema = z.object({
  oldPassword: loginPasswordSchema,
  newPassword: registerPasswordSchema,
}).refine((data) => data.oldPassword !== data.newPassword, {
  message: 'New password must be different from old password',
  path: ['newPassword'],
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
