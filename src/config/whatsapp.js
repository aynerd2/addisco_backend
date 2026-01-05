const twilio = require('twilio');

// Initialize Twilio client (only if credentials exist)
const client = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

// Send WhatsApp message
const sendWhatsApp = async (to, message) => {
  // Check if configured
  if (!client) {
    console.log('⚠️  WhatsApp not configured - skipping send');
    return { success: false, message: 'WhatsApp not configured' };
  }

  try {
    // Send via Twilio
    const result = await client.messages.create({
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_FROM}`,
      to: `whatsapp:${to}`,
      body: message
    });

    console.log(`📱 WhatsApp sent: ${result.sid}`);
    return { success: true, sid: result.sid };
  } catch (error) {
    console.error(`❌ WhatsApp error: ${error.message}`);
    return { success: false, error: error.message };
  }
};

module.exports = { sendWhatsApp };