// src/config/whatsapp.js - WhatsApp Configuration (Twilio)
// =========================================================

const twilio = require('twilio');

// Initialize Twilio client if credentials are provided
let twilioClient = null;

if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  try {
    twilioClient = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
    console.log('✓ Twilio WhatsApp client initialized');
  } catch (error) {
    console.error('❌ Twilio initialization failed:', error.message);
  }
}

/**
 * Send WhatsApp message via Twilio
 * @param {String} to - Recipient phone number (with country code)
 * @param {String} message - Message text
 * @returns {Promise<Object>} Send result
 */
const sendWhatsApp = async (to, message) => {
  if (!twilioClient) {
    console.log('⚠️  WhatsApp not configured - skipping send');
    console.log(`   Would have sent to: ${to}`);
    return { success: false, message: 'WhatsApp not configured' };
  }

  try {
    const result = await twilioClient.messages.create({
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_FROM}`,
      to: `whatsapp:${to}`,
      body: message
    });

    console.log(`📱 WhatsApp sent successfully`);
    console.log(`   To: ${to}`);
    console.log(`   SID: ${result.sid}`);

    return {
      success: true,
      sid: result.sid,
      status: result.status
    };
  } catch (error) {
    console.error(`❌ WhatsApp sending failed`);
    console.error(`   To: ${to}`);
    console.error(`   Error: ${error.message}`);

    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Send WhatsApp notification for new consultation
 * @param {Object} consultation - Consultation request data
 */
const sendConsultationWhatsAppNotification = async (consultation) => {
  if (!process.env.ADMIN_WHATSAPP) {
    return;
  }

  const message = `
🔔 NEW CONSULTATION REQUEST

Name: ${consultation.name}
Service: ${consultation.service}
Email: ${consultation.email}
Phone: ${consultation.phone}
Organization: ${consultation.organization || 'N/A'}

Message: ${consultation.message.substring(0, 100)}${consultation.message.length > 100 ? '...' : ''}

Request ID: ${consultation._id}
  `.trim();

  await sendWhatsApp(process.env.ADMIN_WHATSAPP, message);
};

module.exports = {
  sendWhatsApp,
  sendConsultationWhatsAppNotification,
  twilioClient
};
