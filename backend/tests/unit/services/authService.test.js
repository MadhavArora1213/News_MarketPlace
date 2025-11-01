const authService = require('../../../src/services/authService');
const User = require('../../../src/models/User');
const emailService = require('../../../src/services/emailService');

// Mock dependencies
jest.mock('../../../src/models/User');
jest.mock('../../../src/services/emailService');

// Set up environment variables for JWT
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';

describe('Auth Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    const userData = {
      email: 'test@example.com',
      password: 'password123',
      first_name: 'John',
      last_name: 'Doe'
    };

    test('should register user successfully', async () => {
      const mockUser = {
        id: 1,
        email: userData.email,
        setOTP: jest.fn(),
        toJSON: () => ({ id: 1, email: userData.email })
      };

      User.findByEmail.mockResolvedValue(null);
      User.create.mockResolvedValue(mockUser);
      emailService.sendOTP.mockResolvedValue(true);

      const result = await authService.register(userData);

      expect(User.findByEmail).toHaveBeenCalledWith(userData.email);
      expect(User.create).toHaveBeenCalledWith({
        email: userData.email,
        password: userData.password,
        first_name: userData.first_name,
        last_name: userData.last_name
      });
      expect(mockUser.setOTP).toHaveBeenCalledWith(expect.any(String));
      expect(emailService.sendOTP).toHaveBeenCalledWith(userData.email, expect.any(String), 'registration');
      expect(result.user).toEqual(mockUser.toJSON());
      expect(result.message).toContain('Registration successful');
    });

    test('should throw error if user already exists', async () => {
      User.findByEmail.mockResolvedValue({ id: 1, email: userData.email });

      await expect(authService.register(userData)).rejects.toThrow('User with this email already exists');
      expect(User.create).not.toHaveBeenCalled();
    });

    test('should handle email service errors', async () => {
      const mockUser = {
        id: 1,
        email: userData.email,
        setOTP: jest.fn(),
        toJSON: () => ({ id: 1, email: userData.email })
      };

      User.findByEmail.mockResolvedValue(null);
      User.create.mockResolvedValue(mockUser);
      emailService.sendOTP.mockRejectedValue(new Error('Email service error'));

      await expect(authService.register(userData)).rejects.toThrow('Email service error');
    });
  });

  describe('verifyRegistration', () => {
    const email = 'test@example.com';
    const otp = '123456';

    test('should verify registration OTP successfully', async () => {
      const mockUser = {
        id: 1,
        email,
        verifyOTP: jest.fn().mockResolvedValue(true),
        toJSON: () => ({ id: 1, email })
      };

      User.findByEmail.mockResolvedValue(mockUser);

      const result = await authService.verifyRegistration(email, otp);

      expect(User.findByEmail).toHaveBeenCalledWith(email);
      expect(mockUser.verifyOTP).toHaveBeenCalledWith(otp);
      expect(result.user).toEqual(mockUser.toJSON());
      expect(result.tokens).toHaveProperty('accessToken');
      expect(result.tokens).toHaveProperty('refreshToken');
      expect(result.message).toBe('Email verified successfully');
    });

    test('should throw error if user not found', async () => {
      User.findByEmail.mockResolvedValue(null);

      await expect(authService.verifyRegistration(email, otp)).rejects.toThrow('User not found');
    });

    test('should throw error for invalid OTP', async () => {
      const mockUser = {
        verifyOTP: jest.fn().mockResolvedValue(false)
      };

      User.findByEmail.mockResolvedValue(mockUser);

      await expect(authService.verifyRegistration(email, otp)).rejects.toThrow('Invalid or expired OTP');
    });
  });

  describe('login', () => {
    const loginData = {
      email: 'test@example.com',
      password: 'password123',
      rememberMe: false
    };

    test('should login user successfully', async () => {
      const mockUser = {
        id: 1,
        email: loginData.email,
        is_active: true,
        verifyPassword: jest.fn().mockResolvedValue(true),
        setOTP: jest.fn(),
        toJSON: () => ({ id: 1, email: loginData.email })
      };

      User.findByEmail.mockResolvedValue(mockUser);
      emailService.sendOTP.mockResolvedValue(true);

      const result = await authService.login(loginData.email, loginData.password, loginData.rememberMe);

      expect(User.findByEmail).toHaveBeenCalledWith(loginData.email);
      expect(mockUser.verifyPassword).toHaveBeenCalledWith(loginData.password);
      expect(mockUser.setOTP).toHaveBeenCalledWith(expect.any(String));
      expect(emailService.sendOTP).toHaveBeenCalledWith(loginData.email, expect.any(String), 'login');
      expect(result.user).toEqual(mockUser.toJSON());
      expect(result.requiresOTP).toBe(true);
    });

    test('should throw error for non-existent user', async () => {
      User.findByEmail.mockResolvedValue(null);

      await expect(authService.login(loginData.email, loginData.password)).rejects.toThrow('Invalid email or password');
    });

    test('should throw error for inactive user', async () => {
      const mockUser = {
        is_active: false
      };

      User.findByEmail.mockResolvedValue(mockUser);

      await expect(authService.login(loginData.email, loginData.password)).rejects.toThrow('Account is deactivated');
    });

    test('should throw error for wrong password', async () => {
      const mockUser = {
        is_active: true,
        verifyPassword: jest.fn().mockResolvedValue(false)
      };

      User.findByEmail.mockResolvedValue(mockUser);

      await expect(authService.login(loginData.email, loginData.password)).rejects.toThrow('Invalid email or password');
    });
  });

  describe('verifyLogin', () => {
    const verifyData = {
      email: 'test@example.com',
      otp: '123456',
      rememberMe: false
    };

    test('should verify login OTP successfully', async () => {
      const mockUser = {
        id: 1,
        email: verifyData.email,
        verifyOTP: jest.fn().mockResolvedValue(true),
        updateLastLogin: jest.fn(),
        toJSON: () => ({ id: 1, email: verifyData.email })
      };

      User.findByEmail.mockResolvedValue(mockUser);

      const result = await authService.verifyLogin(verifyData.email, verifyData.otp, verifyData.rememberMe);

      expect(mockUser.verifyOTP).toHaveBeenCalledWith(verifyData.otp);
      expect(mockUser.updateLastLogin).toHaveBeenCalled();
      expect(result.user).toEqual(mockUser.toJSON());
      expect(result.tokens).toHaveProperty('accessToken');
      expect(result.tokens).toHaveProperty('refreshToken');
      expect(result.message).toBe('Login successful');
    });

    test('should handle invalid OTP', async () => {
      const mockUser = {
        verifyOTP: jest.fn().mockResolvedValue(false)
      };

      User.findByEmail.mockResolvedValue(mockUser);

      await expect(authService.verifyLogin(verifyData.email, verifyData.otp)).rejects.toThrow('Invalid or expired OTP');
    });
  });

  describe('forgotPassword', () => {
    const email = 'test@example.com';

    test('should send reset email for existing user', async () => {
      const mockUser = { id: 1, email };
      User.findByEmail.mockResolvedValue(mockUser);
      emailService.sendPasswordReset.mockResolvedValue(true);

      const result = await authService.forgotPassword(email);

      expect(User.findByEmail).toHaveBeenCalledWith(email);
      expect(emailService.sendPasswordReset).toHaveBeenCalledWith(email, expect.any(String));
      expect(result.message).toContain('reset link has been sent');
    });

    test('should not reveal if user exists', async () => {
      User.findByEmail.mockResolvedValue(null);

      const result = await authService.forgotPassword(email);

      expect(emailService.sendPasswordReset).not.toHaveBeenCalled();
      expect(result.message).toContain('reset link has been sent');
    });
  });

  describe('resetPassword', () => {
    const token = 'valid-jwt-token';
    const newPassword = 'newpassword123';

    test('should reset password successfully', async () => {
      const mockUser = {
        update: jest.fn()
      };

      // Mock JWT verification
      const mockDecoded = { userId: 1, type: 'password_reset' };
      jest.spyOn(require('jsonwebtoken'), 'verify').mockReturnValue(mockDecoded);

      User.findById.mockResolvedValue(mockUser);

      const result = await authService.resetPassword(token, newPassword);

      expect(User.findById).toHaveBeenCalledWith(1);
      expect(mockUser.update).toHaveBeenCalledWith({ password_hash: expect.any(String) });
      expect(result.message).toBe('Password reset successfully');
    });

    test('should throw error for invalid token type', async () => {
      const mockDecoded = { userId: 1, type: 'invalid' };
      jest.spyOn(require('jsonwebtoken'), 'verify').mockReturnValue(mockDecoded);

      await expect(authService.resetPassword(token, newPassword)).rejects.toThrow('Invalid or expired reset token');
    });

    test('should throw error for expired token', async () => {
      jest.spyOn(require('jsonwebtoken'), 'verify').mockImplementation(() => {
        throw new Error('Token expired');
      });

      await expect(authService.resetPassword(token, newPassword)).rejects.toThrow('Invalid or expired reset token');
    });
  });

  describe('generateTokens', () => {
    test('should generate access and refresh tokens', () => {
      const mockUser = { id: 1, email: 'test@example.com', role: 'user' };

      const tokens = authService.generateTokens(mockUser);

      expect(tokens).toHaveProperty('accessToken');
      expect(tokens).toHaveProperty('refreshToken');
      expect(typeof tokens.accessToken).toBe('string');
      expect(typeof tokens.refreshToken).toBe('string');
    });
  });

  describe('generateOTP', () => {
    test('should generate 6-digit OTP', () => {
      const otp = authService.generateOTP();

      expect(otp).toMatch(/^\d{6}$/);
      expect(otp.length).toBe(6);
    });
  });

  describe('verifyAccessToken', () => {
    test('should verify valid token', () => {
      const mockUser = { userId: 1, email: 'test@example.com' };
      const mockToken = 'valid-token';

      jest.spyOn(require('jsonwebtoken'), 'verify').mockReturnValue(mockUser);

      const result = authService.verifyAccessToken(mockToken);

      expect(result).toEqual(mockUser);
    });

    test('should throw error for invalid token', () => {
      jest.spyOn(require('jsonwebtoken'), 'verify').mockImplementation(() => {
        throw new Error('Invalid token');
      });

      expect(() => authService.verifyAccessToken('invalid-token')).toThrow('Invalid or expired access token');
    });
  });

  describe('refreshAccessToken', () => {
    test('should refresh access token successfully', async () => {
      const refreshToken = 'valid-refresh-token';
      const mockDecoded = { userId: 1 };
      const mockUser = { id: 1, is_active: true };

      jest.spyOn(authService, 'verifyRefreshToken').mockReturnValue(mockDecoded);
      User.findById.mockResolvedValue(mockUser);
      jest.spyOn(authService, 'generateTokens').mockReturnValue({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token'
      });

      const result = await authService.refreshAccessToken(refreshToken);

      expect(result).toHaveProperty('accessToken', 'new-access-token');
      expect(result).toHaveProperty('refreshToken', 'new-refresh-token');
    });

    test('should throw error for inactive user', async () => {
      const mockUser = { id: 1, is_active: false };
      User.findById.mockResolvedValue(mockUser);

      await expect(authService.refreshAccessToken('token')).rejects.toThrow('User not found or inactive');
    });
  });
});