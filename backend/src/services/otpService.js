const emailService = require('./emailService');
const msg91Service = require('./msg91Service');
const logger = console; // Assuming a logger; replace with actual logging service if available

/**
 * Generates a 6-digit numeric OTP as a string.
 * @returns {string} The generated OTP.
 */
function generateOtp() {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  return otp;
}

/**
 * Sends OTP via email using emailService.
 * @param {string} email - The recipient's email address.
 * @param {string} otp - The OTP to send.
 * @returns {Promise<void>}
 */
async function sendEmailOtp(email, otp) {
  try {
    await emailService.sendOTP(email, otp, 'agency_registration');
    logger.info(`========== EMAIL OTP ==========`);
    logger.info(`Email: ${email}`);
    logger.info(`OTP: ${otp}`);
    logger.info(`==============================`);
  } catch (error) {
    logger.error(`Failed to send OTP email to ${email}: ${error.message}`);
    logger.info(`========== EMAIL OTP FALLBACK ==========`);
    logger.info(`Email: ${email}`);
    logger.info(`OTP: ${otp}`);
    logger.info(`=======================================`);
    throw error;
  }
}

/**
 * Attempts to send OTP via phone using msg91 API.
 * On failure, logs the OTP to console.
 * @param {string} phone - The recipient's phone number.
 * @param {string} otp - The OTP to send.
 * @returns {Promise<void>}
 */
async function sendPhoneOtp(phone, otp) {
  try {
    const result = await msg91Service.sendSMS(phone, otp);
    if (result.fallback) {
      logger.info(`========== MSG91 FALLBACK - PHONE OTP ==========`);
      logger.info(`Phone: ${phone}`);
      logger.info(`OTP: ${otp}`);
      logger.info(`===============================================`);
    } else {
      logger.info(`========== PHONE OTP ==========`);
      logger.info(`Phone: ${phone}`);
      logger.info(`OTP: ${otp}`);
      logger.info(`===============================`);
    }
  } catch (error) {
    logger.error(`Failed to send OTP to phone ${phone}: ${error.message}`);
    logger.info(`========== MSG91 FALLBACK - PHONE OTP ==========`);
    logger.info(`Phone: ${phone}`);
    logger.info(`OTP: ${otp}`);
    logger.info(`===============================================`);
  }
}

/**
 * Attempts to send OTP via WhatsApp using msg91 API.
 * On failure, logs the OTP to console.
 * @param {string} whatsapp - The recipient's WhatsApp number.
 * @param {string} otp - The OTP to send.
 * @returns {Promise<void>}
 */
async function sendWhatsAppOtp(whatsapp, otp) {
  try {
    const result = await msg91Service.sendWhatsApp(whatsapp, otp);
    if (result.fallback) {
      logger.info(`========== MSG91 FALLBACK - WHATSAPP OTP ==========`);
      logger.info(`WhatsApp: ${whatsapp}`);
      logger.info(`OTP: ${otp}`);
      logger.info(`====================================================`);
    } else {
      logger.info(`WhatsApp OTP sent successfully to ${whatsapp}`);
    }
  } catch (error) {
    logger.error(`Failed to send OTP to WhatsApp ${whatsapp}: ${error.message}`);
    logger.info(`========== MSG91 FALLBACK - WHATSAPP OTP ==========`);
    logger.info(`WhatsApp: ${whatsapp}`);
    logger.info(`OTP: ${otp}`);
    logger.info(`====================================================`);
  }
}

module.exports = {
  generateOtp,
  sendEmailOtp,
  sendPhoneOtp,
  sendWhatsAppOtp,
};