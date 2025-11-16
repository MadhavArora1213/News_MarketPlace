describe('Msg91Service - Email OTP', () => {
  let msg91Service;

  beforeAll(() => {
    // Set environment variables for testing
    process.env.MSG91_API_KEY = 'test-api-key';
    process.env.MSG91_FROM_EMAIL = 'noreply@newsmarketplace.com';
    process.env.MSG91_FROM_NAME = 'News Marketplace';

    // Mock axios to avoid actual API calls
    jest.mock('axios', () => ({
      post: jest.fn().mockResolvedValue({
        data: { type: 'success', message: 'Email sent successfully' }
      })
    }));

    // Clear module cache and require fresh instance
    jest.resetModules();
    msg91Service = require('../../../src/services/msg91Service');
  });

  afterAll(() => {
    // Clean up environment variables
    delete process.env.MSG91_API_KEY;
    delete process.env.MSG91_FROM_EMAIL;
    delete process.env.MSG91_FROM_NAME;
  });

  test('should send email OTP using MSG91 service', async () => {
    const testEmail = 'test@example.com';
    const testOtp = '123456';

    const result = await msg91Service.sendEmail(testEmail, testOtp);

    // Verify the method exists and returns expected structure
    expect(result).toHaveProperty('success');
    expect(result).toHaveProperty('messageId');
    expect(result.success).toBe(true);
    expect(result.messageId).toBe('Email sent successfully');
  });

  test('should generate email OTP template with correct content', () => {
    const otp = '654321';
    const template = msg91Service.generateEmailOTPTemplate(otp);

    expect(template).toContain('News Marketplace');
    expect(template).toContain(otp);
    expect(template).toContain('Your Verification Code');
    expect(template).toContain('expire in 10 minutes');
    expect(typeof template).toBe('string');
  });
});