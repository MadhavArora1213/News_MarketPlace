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