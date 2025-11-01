const User = require('../../../src/models/User');
const { query } = require('../../../src/config/database');

// Mock the database query function
jest.mock('../../../src/config/database');

describe('User Model', () => {
  const mockUserData = {
    id: 1,
    email: 'test@example.com',
    password_hash: 'hashed_password',
    first_name: 'John',
    last_name: 'Doe',
    is_verified: false,
    is_active: true,
    role: 'user',
    otp_code: '123456',
    otp_expires_at: new Date(Date.now() + 10 * 60 * 1000),
    last_login: null,
    created_at: new Date(),
    updated_at: new Date()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    test('should create User instance with correct properties', () => {
      const user = new User(mockUserData);

      expect(user.id).toBe(mockUserData.id);
      expect(user.email).toBe(mockUserData.email);
      expect(user.password_hash).toBe(mockUserData.password_hash);
      expect(user.first_name).toBe(mockUserData.first_name);
      expect(user.last_name).toBe(mockUserData.last_name);
      expect(user.is_verified).toBe(mockUserData.is_verified);
      expect(user.is_active).toBe(mockUserData.is_active);
      expect(user.role).toBe(mockUserData.role);
    });
  });

  describe('create', () => {
    const createData = {
      email: 'new@example.com',
      password: 'password123',
      first_name: 'Jane',
      last_name: 'Smith'
    };

    test('should create new user successfully', async () => {
      const mockResult = {
        rows: [mockUserData]
      };
      query.mockResolvedValue(mockResult);

      const user = await User.create(createData);

      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO users'),
        expect.arrayContaining([createData.email, expect.any(String), createData.first_name, createData.last_name])
      );
      expect(user).toBeInstanceOf(User);
      expect(user.email).toBe(mockUserData.email);
    });

    test('should hash password before storing', async () => {
      const mockResult = {
        rows: [mockUserData]
      };
      query.mockResolvedValue(mockResult);

      await User.create(createData);

      const queryCall = query.mock.calls[0];
      const passwordHash = queryCall[1][1]; // Second parameter should be hashed password

      // Password should be hashed (bcrypt hash is longer than plain text)
      expect(passwordHash).not.toBe(createData.password);
      expect(passwordHash.length).toBeGreaterThan(createData.password.length);
    });
  });

  describe('findByEmail', () => {
    test('should find user by email', async () => {
      const mockResult = {
        rows: [mockUserData]
      };
      query.mockResolvedValue(mockResult);

      const user = await User.findByEmail(mockUserData.email);

      expect(query).toHaveBeenCalledWith('SELECT * FROM users WHERE email = $1', [mockUserData.email]);
      expect(user).toBeInstanceOf(User);
      expect(user.email).toBe(mockUserData.email);
    });

    test('should return null if user not found', async () => {
      const mockResult = {
        rows: []
      };
      query.mockResolvedValue(mockResult);

      const user = await User.findByEmail('nonexistent@example.com');

      expect(user).toBeNull();
    });
  });

  describe('findById', () => {
    test('should find user by ID', async () => {
      const mockResult = {
        rows: [mockUserData]
      };
      query.mockResolvedValue(mockResult);

      const user = await User.findById(mockUserData.id);

      expect(query).toHaveBeenCalledWith('SELECT * FROM users WHERE id = $1', [mockUserData.id]);
      expect(user).toBeInstanceOf(User);
      expect(user.id).toBe(mockUserData.id);
    });

    test('should return null if user not found', async () => {
      const mockResult = {
        rows: []
      };
      query.mockResolvedValue(mockResult);

      const user = await User.findById(999);

      expect(user).toBeNull();
    });
  });

  describe('update', () => {
    test('should update user successfully', async () => {
      const user = new User(mockUserData);
      const updateData = { first_name: 'Updated Name' };
      const mockResult = {
        rows: [{ ...mockUserData, first_name: 'Updated Name' }]
      };
      query.mockResolvedValue(mockResult);

      const updatedUser = await user.update(updateData);

      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE users SET'),
        expect.arrayContaining([updateData.first_name, user.id])
      );
      expect(updatedUser.first_name).toBe('Updated Name');
    });

    test('should not update if no fields provided', async () => {
      const user = new User(mockUserData);

      const result = await user.update({});

      expect(query).not.toHaveBeenCalled();
      expect(result).toBe(user);
    });
  });

  describe('verifyPassword', () => {
    test('should verify correct password', async () => {
      const user = new User(mockUserData);
      const plainPassword = 'password123';

      // Mock bcrypt.compare to return true
      const bcrypt = require('bcryptjs');
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);

      const result = await user.verifyPassword(plainPassword);

      expect(bcrypt.compare).toHaveBeenCalledWith(plainPassword, user.password_hash);
      expect(result).toBe(true);
    });

    test('should reject incorrect password', async () => {
      const user = new User(mockUserData);
      const wrongPassword = 'wrongpassword';

      const bcrypt = require('bcryptjs');
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);

      const result = await user.verifyPassword(wrongPassword);

      expect(result).toBe(false);
    });
  });

  describe('setOTP', () => {
    test('should set OTP code and expiration', async () => {
      const user = new User(mockUserData);
      const otpCode = '654321';
      const minutes = 5;

      user.update = jest.fn();

      await user.setOTP(otpCode, minutes);

      expect(user.update).toHaveBeenCalledWith({
        otp_code: otpCode,
        otp_expires_at: expect.any(Date)
      });
    });

    test('should use default expiration time', async () => {
      const user = new User(mockUserData);
      const otpCode = '654321';

      user.update = jest.fn();

      await user.setOTP(otpCode);

      expect(user.update).toHaveBeenCalledWith({
        otp_code: otpCode,
        otp_expires_at: expect.any(Date)
      });
    });
  });

  describe('verifyOTP', () => {
    test('should verify correct OTP within time limit', async () => {
      const user = new User({
        ...mockUserData,
        otp_code: '123456',
        otp_expires_at: new Date(Date.now() + 5 * 60 * 1000) // 5 minutes from now
      });

      user.update = jest.fn();

      const result = await user.verifyOTP('123456');

      expect(result).toBe(true);
      expect(user.update).toHaveBeenCalledWith({
        otp_code: null,
        otp_expires_at: null,
        is_verified: true
      });
    });

    test('should reject incorrect OTP', async () => {
      const user = new User({
        ...mockUserData,
        otp_code: '123456',
        otp_expires_at: new Date(Date.now() + 5 * 60 * 1000)
      });

      const result = await user.verifyOTP('654321');

      expect(result).toBe(false);
    });

    test('should reject expired OTP', async () => {
      const user = new User({
        ...mockUserData,
        otp_code: '123456',
        otp_expires_at: new Date(Date.now() - 5 * 60 * 1000) // 5 minutes ago
      });

      const result = await user.verifyOTP('123456');

      expect(result).toBe(false);
    });

    test('should handle missing OTP data', async () => {
      const user = new User({
        ...mockUserData,
        otp_code: null,
        otp_expires_at: null
      });

      const result = await user.verifyOTP('123456');

      expect(result).toBe(false);
    });
  });

  describe('clearOTP', () => {
    test('should clear OTP data', async () => {
      const user = new User(mockUserData);

      user.update = jest.fn();

      await user.clearOTP();

      expect(user.update).toHaveBeenCalledWith({
        otp_code: null,
        otp_expires_at: null
      });
    });
  });

  describe('updateLastLogin', () => {
    test('should update last login timestamp', async () => {
      const user = new User(mockUserData);

      user.update = jest.fn();

      await user.updateLastLogin();

      expect(user.update).toHaveBeenCalledWith({
        last_login: expect.any(Date)
      });
    });
  });

  describe('getters', () => {
    test('fullName should return concatenated name', () => {
      const user = new User(mockUserData);

      expect(user.fullName).toBe('John Doe');
    });

    test('fullName should handle missing last name', () => {
      const user = new User({ ...mockUserData, last_name: null });

      expect(user.fullName).toBe('John');
    });

    test('fullName should handle undefined last name', () => {
      const user = new User({ ...mockUserData, last_name: undefined });

      expect(user.fullName).toBe('John');
    });
  });

  describe('toJSON', () => {
    test('should exclude sensitive data', () => {
      const user = new User(mockUserData);

      const json = user.toJSON();

      expect(json.password_hash).toBeUndefined();
      expect(json.otp_code).toBeUndefined();
      expect(json.otp_expires_at).toBeUndefined();
      expect(json.email).toBe(mockUserData.email);
      expect(json.first_name).toBe(mockUserData.first_name);
    });
  });

  describe('edge cases', () => {
    test('should handle database errors during create', async () => {
      const invalidUserData = { ...mockUserData };
      delete invalidUserData.password; // Remove password to cause bcrypt error

      await expect(User.create(invalidUserData)).rejects.toThrow();
    });

    test('should handle database errors during findByEmail', async () => {
      query.mockRejectedValue(new Error('Query failed'));

      await expect(User.findByEmail('test@example.com')).rejects.toThrow('Query failed');
    });

    test('should handle null values in constructor', () => {
      const userWithNulls = new User({
        ...mockUserData,
        first_name: null,
        last_name: null
      });

      expect(userWithNulls.first_name).toBeNull();
      expect(userWithNulls.last_name).toBeNull();
      expect(userWithNulls.fullName).toBe('');
    });

    test('should handle empty strings in names', () => {
      const userWithEmptyNames = new User({
        ...mockUserData,
        first_name: '',
        last_name: ''
      });

      expect(userWithEmptyNames.fullName).toBe('');
    });
  });
});