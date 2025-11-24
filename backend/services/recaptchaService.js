const { RecaptchaEnterpriseServiceClient } = require('@google-cloud/recaptcha-enterprise');

class RecaptchaService {
  constructor() {
    this.client = new RecaptchaEnterpriseServiceClient();
    this.projectID = process.env.GOOGLE_CLOUD_PROJECT_ID || "gen-lang-client-0132366074";
    this.recaptchaKey = "6LdNzrErAAAAAB1EB7ETPEhUrynf0wSQftMt-COT";
  }

  /**
   * Create an assessment to analyze the risk of a UI action.
   * @param {string} token - The generated token obtained from the client
   * @param {string} recaptchaAction - Action name corresponding to the token
   * @param {number} minScore - Minimum acceptable score (default: 0.5)
   * @returns {Promise<{valid: boolean, score: number, action: string}>}
   */
  async createAssessment(token, recaptchaAction = 'CONTACT_FORM', minScore = 0.5) {
    try {
      const projectPath = this.client.projectPath(this.projectID);

      // Build the assessment request
      const request = {
        assessment: {
          event: {
            token: token,
            siteKey: this.recaptchaKey,
          },
        },
        parent: projectPath,
      };

      const [response] = await this.client.createAssessment(request);

      // Check if the token is valid
      if (!response.tokenProperties.valid) {
        console.log(`reCAPTCHA token invalid: ${response.tokenProperties.invalidReason}`);
        return {
          valid: false,
          score: 0,
          action: response.tokenProperties.action,
          reason: response.tokenProperties.invalidReason
        };
      }

      // Check if the expected action was executed
      if (response.tokenProperties.action !== recaptchaAction) {
        console.log(`Action mismatch. Expected: ${recaptchaAction}, Got: ${response.tokenProperties.action}`);
        return {
          valid: false,
          score: response.riskAnalysis.score,
          action: response.tokenProperties.action,
          reason: 'Action mismatch'
        };
      }

      const score = response.riskAnalysis.score;
      console.log(`reCAPTCHA score: ${score}`);

      // Log risk analysis reasons
      if (response.riskAnalysis.reasons.length > 0) {
        console.log('Risk analysis reasons:', response.riskAnalysis.reasons);
      }

      return {
        valid: score >= minScore,
        score: score,
        action: response.tokenProperties.action,
        reasons: response.riskAnalysis.reasons
      };

    } catch (error) {
      console.error('reCAPTCHA assessment failed:', error);
      return {
        valid: false,
        score: 0,
        action: recaptchaAction,
        reason: 'Assessment failed'
      };
    }
  }

  /**
   * Verify reCAPTCHA token for contact form
   * @param {string} token - reCAPTCHA token
   * @returns {Promise<boolean>}
   */
  async verifyContactForm(token) {
    if (!token) {
      return false;
    }

    const assessment = await this.createAssessment(token, 'CONTACT_FORM', 0.5);
    return assessment.valid;
  }

  /**
   * Verify reCAPTCHA token and return score
   * @param {string} token - reCAPTCHA token
   * @returns {Promise<number|null>} Score or null if failed
   */
  async verifyRecaptcha(token) {
    if (!token) {
      return null;
    }

    try {
      const assessment = await this.createAssessment(token, 'CONTACT_FORM', 0.5);
      return assessment.valid ? assessment.score : null;
    } catch (error) {
      console.error('reCAPTCHA verification error:', error);
      return null;
    }
  }
}

/**
 * Verify reCAPTCHA token using standard API
 * @param {string} token - reCAPTCHA token
 * @param {string} secretKey - reCAPTCHA secret key
 * @returns {Promise<number|null>} Score or null if failed
 */
async function verifyRecaptcha(token, secretKey) {
  if (!token || !secretKey) {
    return null;
  }

  try {
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        secret: secretKey,
        response: token,
      }),
    });

    const data = await response.json();

    if (data.success) {
      return data.score || 1.0; // v2 doesn't have score, so assume 1.0
    } else {
      console.log('reCAPTCHA verification failed:', data['error-codes']);
      return null;
    }
  } catch (error) {
    console.error('reCAPTCHA API error:', error);
    return null;
  }
}

module.exports = new RecaptchaService();
module.exports.verifyRecaptcha = verifyRecaptcha;
