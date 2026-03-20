import { loginSchema, registerSchema } from '../lib/validation';

describe('Zod Validation Schemas', () => {
  describe('loginSchema', () => {
    it('fails when fields are empty', () => {
      const result = loginSchema.safeParse({ username: '', password: '' });
      expect(result.success).toBe(false);
    });

    it('passes with valid input', () => {
      const result = loginSchema.safeParse({ username: 'valid_user', password: 'securePassword123' });
      expect(result.success).toBe(true);
    });
  });

  describe('registerSchema', () => {
    it('fails when email is invalid', () => {
      const result = registerSchema.safeParse({
        username: 'user123',
        email: 'not-an-email',
        password: 'ValidPass123',
        confirmPassword: 'ValidPass123'
      });
      expect(result.success).toBe(false);
    });

    it('fails when passwords do not match', () => {
      const result = registerSchema.safeParse({
        username: 'user123',
        email: 'test@example.com',
        password: 'ValidPass123',
        confirmPassword: 'DifferentPass123'
      });
      expect(result.success).toBe(false);
    });

    it('passes with all valid fields', () => {
      const result = registerSchema.safeParse({
        username: 'user123',
        email: 'test@example.com',
        password: 'ValidPassword123',
        confirmPassword: 'ValidPassword123'
      });
      expect(result.success).toBe(true);
    });
  });
});
