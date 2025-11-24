require('dotenv').config();
const msg91Service = require('./src/services/msg91Service');

console.log('Testing MSG91 Email Service...');

async function testMsg91Email() {
  try {
    console.log('MSG91 Service initialized');

    // Test email data
    const testEmail = 'test@example.com'; // Replace with actual test email if needed
    const testOtp = '123456';
    const testSubject = 'Test OTP from News Marketplace';

    console.log('Attempting to send test email OTP...');

    // Test the sendEmail method
    const result = await msg91Service.sendEmail(testEmail, testOtp, testSubject);

    if (result.success) {
      if (result.fallback) {
        console.log('Email sent via fallback (console.log) - no API key configured');
        console.log('Fallback result:', result);
      } else {
        console.log('Email sent successfully via MSG91 API');
        console.log('Message ID:', result.messageId);
      }
    } else {
      console.error('Failed to send email:', result.error);
    }

  } catch (error) {
    console.error('Error testing MSG91 Email service:', error.message);
  }
}

// Run the test
testMsg91Email();