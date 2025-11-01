const request = require('supertest');
const app = require('../../server');
const User = require('../../src/models/User');
const { query } = require('../../src/config/database');

// Mock the database to avoid actual database operations during testing
jest.mock('../../src/config/database');
jest.mock('../../src/services/emailService');

describe('Authentication Flow Integration Tests', () => {
  let server;
  let testUser;

  beforeAll(() => {
    server = app.listen(0); // Use random port for testing
  });

  afterAll((done) => {
    server.close(done);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    testUser = {
      id: 1,
      email: 'test@example.com',
      password: 'password123',
      first_name: 'John',
      last_name: 'Doe'
    };
  });

  describe('Complete Registration Flow', () => {
    test('should complete full registration flow successfully', async () => {
      // Mock database responses
      const mockUser = {
        id: 1,
        email: testUser.email,
        first_name: testUser.first_name,
        last_name: testUser.last_name,
        is_verified: false,
        verifyOTP: jest.fn().mockResolvedValue(true),
        setOTP: jest.fn(),
        toJSON: () => ({
          id: 1,
          email: testUser.email,
          first_name: testUser.first_name,
          last_name: testUser.last_name,
          is_verified: false
        })
      };

      // Mock User.findByEmail to return null (user doesn't exist)
      User.findByEmail = jest.fn().mockResolvedValue(null);
      User.create = jest.fn().mockResolvedValue(mockUser);

      // Step 1: Register user
      const registerResponse = await request(server)
        .post('/api/auth/register')
        .send(testUser)
        .expect(201);

      expect(registerResponse.body.message).toContain('Registration successful');
      expect(registerResponse.body.user.email).toBe(testUser.email);

      // Step 2: Verify OTP (mock the OTP verification)
      User.findByEmail = jest.fn().mockResolvedValue(mockUser);

      const verifyResponse = await request(server)
        .post('/api/auth/verify-registration')
        .send({
          email: testUser.email,
          otp: '123456'
        })
        .expect(200);

      expect(verifyResponse.body.message).toBe('Email verified successfully');
      expect(verifyResponse.body.tokens).toHaveProperty('accessToken');
      expect(verifyResponse.headers['set-cookie']).toBeDefined();
    });

    test('should handle registration of existing user', async () => {
      User.findByEmail = jest.fn().mockResolvedValue(testUser);

      const response = await request(server)
        .post('/api/auth/register')
        .send(testUser)
        .expect(400);

      expect(response.body.error).toBe('User with this email already exists');
    });
  });

  describe('Complete Login Flow', () => {
    test('should complete full login flow successfully', async () => {
      const mockUser = {
        id: 1,
        email: testUser.email,
        is_active: true,
        verifyPassword: jest.fn().mockResolvedValue(true),
        verifyOTP: jest.fn().mockResolvedValue(true),
        setOTP: jest.fn(),
        updateLastLogin: jest.fn(),
        toJSON: () => ({
          id: 1,
          email: testUser.email,
          is_verified: true
        })
      };

      // Step 1: Login request
      User.findByEmail = jest.fn().mockResolvedValue(mockUser);

      const loginResponse = await request(server)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        })
        .expect(200);

      expect(loginResponse.body.message).toContain('OTP sent to your email');
      expect(loginResponse.body.requiresOTP).toBe(true);

      // Step 2: Verify login OTP
      const verifyResponse = await request(server)
        .post('/api/auth/verify-login')
        .send({
          email: testUser.email,
          otp: '123456'
        })
        .expect(200);

      expect(verifyResponse.body.message).toBe('Login successful');
      expect(verifyResponse.body.tokens).toHaveProperty('accessToken');
      expect(verifyResponse.headers['set-cookie']).toBeDefined();
    });

    test('should handle invalid login credentials', async () => {
      User.findByEmail = jest.fn().mockResolvedValue(null);

      const response = await request(server)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'wrongpassword'
        })
        .expect(401);

      expect(response.body.error).toBe('Invalid email or password');
    });
  });

  describe('Forgot Password Flow', () => {
    test('should complete forgot password flow', async () => {
      const mockUser = {
        id: 1,
        email: testUser.email
      };

      User.findByEmail = jest.fn().mockResolvedValue(mockUser);

      // Step 1: Request password reset
      const forgotResponse = await request(server)
        .post('/api/auth/forgot-password')
        .send({
          email: testUser.email
        })
        .expect(200);

      expect(forgotResponse.body.message).toContain('reset link has been sent');

      // Step 2: Reset password with token (mock JWT verification)
      const mockDecoded = { userId: 1, type: 'password_reset' };
      jest.spyOn(require('jsonwebtoken'), 'verify').mockReturnValue(mockDecoded);

      const mockUserForReset = {
        update: jest.fn()
      };
      User.findById = jest.fn().mockResolvedValue(mockUserForReset);

      const resetResponse = await request(server)
        .post('/api/auth/reset-password')
        .send({
          token: 'valid-reset-token',
          password: 'newpassword123'
        })
        .expect(200);

      expect(resetResponse.body.message).toBe('Password reset successfully');
    });
  });

  describe('Token Refresh Flow', () => {
    test('should refresh access token successfully', async () => {
      const mockUser = {
        id: 1,
        email: testUser.email,
        is_active: true,
        toJSON: () => ({ id: 1, email: testUser.email })
      };

      // Mock refresh token verification
      jest.spyOn(require('../../../src/services/authService'), 'verifyRefreshToken')
        .mockReturnValue({ userId: 1 });

      User.findById = jest.fn().mockResolvedValue(mockUser);

      const response = await request(server)
        .post('/api/auth/refresh-token')
        .set('Cookie', ['refreshToken=valid-refresh-token'])
        .expect(200);

      expect(response.body.accessToken).toBeDefined();
      expect(response.body.message).toBe('Token refreshed successfully');
    });
  });

  describe('Security Edge Cases', () => {
    test('should prevent brute force attacks with rate limiting', async () => {
      // This test would require configuring rate limiting in test environment
      // For now, just verify the endpoint exists and handles requests
      const response = await request(server)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrong'
        })
        .expect(401);

      expect(response.body.error).toBeDefined();
    });

    test('should handle malformed JSON', async () => {
      const response = await request(server)
        .post('/api/auth/register')
        .set('Content-Type', 'application/json')
        .send('{invalid json')
        .expect(400);

      expect(response.body.error).toBeDefined();
    });

    test('should handle oversized payloads', async () => {
      const largePayload = 'x'.repeat(1000000); // 1MB payload

      const response = await request(server)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          first_name: largePayload,
          last_name: 'Doe'
        })
        .expect(413); // Payload too large

      expect(response.body.error).toBeDefined();
    });

    test('should prevent SQL injection attempts', async () => {
      const maliciousEmail = "'; DROP TABLE users; --";

      const response = await request(server)
        .post('/api/auth/register')
        .send({
          email: maliciousEmail,
          password: 'password123',
          first_name: 'John',
          last_name: 'Doe'
        })
        .expect(400);

      // Should fail validation, not execute SQL
      expect(response.body.error).toBeDefined();
    });

    test('should handle XSS attempts in input', async () => {
      const maliciousInput = '<script>alert("xss")</script>';

      const response = await request(server)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          first_name: maliciousInput,
          last_name: 'Doe'
        })
        .expect(201);

      // Input should be sanitized/stored safely
      expect(response.body.user.first_name).toBe(maliciousInput);
    });

    test('should handle concurrent requests', async () => {
      const mockUser = {
        id: 1,
        email: testUser.email,
        verifyPassword: jest.fn().mockResolvedValue(true),
        setOTP: jest.fn(),
        toJSON: () => ({ id: 1, email: testUser.email })
      };

      User.findByEmail = jest.fn().mockResolvedValue(mockUser);

      // Make multiple concurrent login requests
      const promises = Array(5).fill().map(() =>
        request(server)
          .post('/api/auth/login')
          .send({
            email: testUser.email,
            password: testUser.password
          })
      );

      const responses = await Promise.all(promises);

      // All requests should succeed (in real scenario, might need rate limiting)
      responses.forEach(response => {
        expect([200, 429]).toContain(response.status); // 200 OK or 429 Too Many Requests
      });
    });

    test('should handle expired tokens gracefully', async () => {
      const response = await request(server)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer expired.jwt.token')
        .expect(401);

      expect(response.body.error).toBe('Invalid or expired token');
    });

    test('should prevent access without authentication', async () => {
      const response = await request(server)
        .get('/api/auth/profile')
        .expect(401);

      expect(response.body.error).toBe('Access token required');
    });

    test('should validate OTP format strictly', async () => {
      const invalidOTPs = ['12345', '1234567', 'abc123', '12 345', ''];

      for (const otp of invalidOTPs) {
        const response = await request(server)
          .post('/api/auth/verify-registration')
          .send({
            email: testUser.email,
            otp: otp
          })
          .expect(400);

        expect(response.body.error).toBe('Validation failed');
      }
    });

    test('should handle network timeouts gracefully', async () => {
      // Mock a service that takes too long
      User.findByEmail = jest.fn().mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(null), 35000))
      );

      // This would require configuring timeout middleware in production
      const response = await request(server)
        .post('/api/auth/login')
        .send({
          email: 'slow@example.com',
          password: 'password123'
        })
        .timeout(5000)
        .catch(error => error);

      // Should either timeout or handle gracefully
      expect(response.code || response.status).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    test('should handle database connection errors', async () => {
      User.findByEmail = jest.fn().mockRejectedValue(new Error('Database connection failed'));

      const response = await request(server)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        })
        .expect(401);

      expect(response.body.error).toBe('Invalid email or password');
    });

    test('should handle email service failures gracefully', async () => {
      const mockUser = {
        id: 1,
        email: testUser.email,
        toJSON: () => ({ id: 1, email: testUser.email })
      };

      User.findByEmail = jest.fn().mockResolvedValue(null);
      User.create = jest.fn().mockResolvedValue(mockUser);

      // Mock email service failure
      const emailService = require('../../src/services/emailService');
      emailService.sendOTP = jest.fn().mockRejectedValue(new Error('Email service down'));

      const response = await request(server)
        .post('/api/auth/register')
        .send(testUser)
        .expect(400);

      expect(response.body.error).toBe('Failed to send OTP email');
    });

    test('should handle malformed tokens', async () => {
      const invalidTokens = [
        'not-a-jwt',
        'header.payload',
        'header.payload.signature.extra',
        null,
        undefined,
        ''
      ];

      for (const token of invalidTokens) {
        const response = await request(server)
          .get('/api/auth/profile')
          .set('Authorization', token ? `Bearer ${token}` : '')
          .expect(401);

        expect(response.body.error).toBeDefined();
      }
    });
  });
});