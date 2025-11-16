const axios = require('axios');

class Msg91Service {
  constructor() {
    this.apiKey = process.env.MSG91_API_KEY;
    this.senderId = process.env.MSG91_SENDER_ID || 'NEWSMK';
    this.route = process.env.MSG91_ROUTE || '4'; // Transactional route
    this.country = process.env.MSG91_COUNTRY || '91';

    if (!this.apiKey) {
      console.warn('MSG91 API key not configured. Using console.log fallback.');
    } else {
      console.log('MSG91 service initialized successfully');
    }
  }

  // Send SMS OTP
  async sendSMS(phone, otp) {
    try {
      if (!this.apiKey) {
        console.log(`MSG91 FALLBACK - SMS OTP for ${phone}: ${otp}`);
        return { success: true, fallback: true };
      }

      // Remove country code if present, MSG91 expects just the number
      const cleanPhone = phone.replace(/^\+\d+/, '');

      const response = await axios.post(
        `https://api.msg91.com/api/v5/otp?authkey=${this.apiKey}&template_id=&mobile=${cleanPhone}&otp=${otp}&sender=${this.senderId}&route=${this.route}&country=${this.country}`,
        {},
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.type === 'success') {
        console.log(`SMS OTP sent successfully to ${phone}`);
        return { success: true, messageId: response.data.message };
      } else {
        throw new Error(response.data.message || 'Failed to send SMS');
      }
    } catch (error) {
      console.error('MSG91 SMS error:', error.message);
      console.log(`MSG91 FALLBACK - SMS OTP for ${phone}: ${otp}`);
      return { success: false, fallback: true, error: error.message };
    }
  }

  // Send Email OTP
  async sendEmail(email, otp, subject = 'Your OTP Code') {
    try {
      if (!this.apiKey) {
        console.log(`MSG91 FALLBACK - Email OTP for ${email}: ${otp}`);
        return { success: true, fallback: true };
      }

      const payload = {
        to: [{ email: email }],
        from: {
          email: process.env.MSG91_FROM_EMAIL || 'noreply@msg91.com',
          name: process.env.MSG91_FROM_NAME || 'News Marketplace'
        },
        subject: subject,
        html: this.generateEmailOTPTemplate(otp),
        template_id: process.env.MSG91_EMAIL_TEMPLATE_ID || null
      };

      const response = await axios.post(
        `https://api.msg91.com/api/v5/email/send?authkey=${this.apiKey}`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.type === 'success') {
        console.log(`Email OTP sent successfully to ${email}`);
        return { success: true, messageId: response.data.message };
      } else {
        throw new Error(response.data.message || 'Failed to send email');
      }
    } catch (error) {
      console.error('MSG91 Email error:', error.message);
      console.log(`MSG91 FALLBACK - Email OTP for ${email}: ${otp}`);
      return { success: false, fallback: true, error: error.message };
    }
  }

  // Generate Email OTP Template
  generateEmailOTPTemplate(otp) {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #1976D2; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #FAFAFA; padding: 30px; border-radius: 0 0 8px 8px; }
            .otp-code { font-size: 32px; font-weight: bold; color: #1976D2; text-align: center; margin: 20px 0; letter-spacing: 4px; }
            .footer { text-align: center; margin-top: 20px; color: #757575; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>News Marketplace</h1>
            </div>
            <div class="content">
              <h2>Your Verification Code</h2>
              <p>Use the following code to verify your account:</p>
              <div class="otp-code">${otp}</div>
              <p>This code will expire in 10 minutes. Please do not share this code with anyone.</p>
              <p>If you didn't request this code, please ignore this email.</p>
            </div>
            <div class="footer">
              <p>&copy; 2024 News Marketplace. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  // Send WhatsApp OTP
  async sendWhatsApp(phone, otp) {
    try {
      if (!this.apiKey) {
        console.log(`MSG91 FALLBACK - WhatsApp OTP for ${phone}: ${otp}`);
        return { success: true, fallback: true };
      }

      // Remove country code if present
      const cleanPhone = phone.replace(/^\+\d+/, '');

      const payload = {
        integrated_number: process.env.MSG91_WHATSAPP_NUMBER, // Your WhatsApp business number
        content_type: "template",
        payload: {
          type: "template",
          template: {
            name: "otp_verification", // Your WhatsApp template name
            language: {
              code: "en",
              policy: "deterministic"
            },
            components: [
              {
                type: "body",
                parameters: [
                  {
                    type: "text",
                    text: otp
                  }
                ]
              }
            ]
          }
        },
        contacts: [
          {
            whatsapp_number: cleanPhone
          }
        ]
      };

      const response = await axios.post(
        `https://api.msg91.com/api/v5/whatsapp/whatsapp?authkey=${this.apiKey}`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.type === 'success') {
        console.log(`WhatsApp OTP sent successfully to ${phone}`);
        return { success: true, messageId: response.data.message };
      } else {
        throw new Error(response.data.message || 'Failed to send WhatsApp message');
      }
    } catch (error) {
      console.error('MSG91 WhatsApp error:', error.message);
      console.log(`MSG91 FALLBACK - WhatsApp OTP for ${phone}: ${otp}`);
      return { success: false, fallback: true, error: error.message };
    }
  }
}

module.exports = new Msg91Service();