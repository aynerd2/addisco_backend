// src/config/email.js - Email Configuration and Templates
// ========================================================

const nodemailer = require('nodemailer');

// Create reusable transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

/**
 * Send email
 * @param {Object} options - Email options
 * @param {String} options.to - Recipient email
 * @param {String} options.subject - Email subject
 * @param {String} options.html - HTML content
 * @param {String} options.text - Plain text content (optional)
 * @returns {Promise<Object>} Email result
 */
const sendEmail = async ({ to, subject, html, text }) => {
  // Check if email is configured
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log('⚠️  Email not configured - skipping send');
    console.log(`   Would have sent: ${subject} to ${to}`);
    return { success: false, message: 'Email not configured' };
  }

  try {
    const mailOptions = {
      from: `"Addisco & Company" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, '') // Strip HTML for text version
    };

    const info = await transporter.sendMail(mailOptions);
    
    console.log(`✉️  Email sent successfully`);
    console.log(`   To: ${to}`);
    console.log(`   Subject: ${subject}`);
    console.log(`   Message ID: ${info.messageId}`);
    
    return {
      success: true,
      messageId: info.messageId,
      response: info.response
    };
  } catch (error) {
    console.error(`❌ Email sending failed`);
    console.error(`   To: ${to}`);
    console.error(`   Error: ${error.message}`);
    
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * McKinsey-style email template wrapper
 * @param {String} content - Main email content
 * @returns {String} Full HTML email template
 */
const emailTemplate = (content) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Addisco & Company</title>
      <style>
        body {
          font-family: Arial, Helvetica, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
          background-color: #f4f4f4;
        }
        .email-wrapper {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
        }
        .header {
          background-color: #00356B;
          color: #ffffff;
          padding: 30px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-family: Georgia, serif;
          font-size: 28px;
          font-weight: 700;
        }
        .header p {
          margin: 5px 0 0;
          font-size: 11px;
          letter-spacing: 2px;
          text-transform: uppercase;
          opacity: 0.9;
        }
        .content {
          padding: 40px 30px;
          background-color: #ffffff;
        }
        .content p {
          margin: 0 0 15px;
          font-size: 15px;
          line-height: 1.7;
        }
        .content h2 {
          color: #00356B;
          font-family: Georgia, serif;
          font-size: 24px;
          margin: 0 0 20px;
        }
        .info-box {
          background-color: #f9f9f9;
          border-left: 4px solid #00356B;
          padding: 20px;
          margin: 25px 0;
        }
        .info-box p {
          margin: 8px 0;
        }
        .info-box strong {
          color: #00356B;
          display: inline-block;
          min-width: 120px;
        }
        .button {
          display: inline-block;
          padding: 14px 35px;
          background-color: #00356B;
          color: #ffffff;
          text-decoration: none;
          border-radius: 3px;
          margin: 20px 0;
          font-weight: 600;
        }
        .divider {
          height: 1px;
          background-color: #e0e0e0;
          margin: 30px 0;
        }
        .footer {
          background-color: #00356B;
          color: #ffffff;
          padding: 30px;
          text-align: center;
          font-size: 13px;
        }
        .footer p {
          margin: 5px 0;
          opacity: 0.9;
        }
        .footer a {
          color: #ffffff;
          text-decoration: underline;
        }
      </style>
    </head>
    <body>
      <div class="email-wrapper">
        <div class="header">
          <h1>Addisco</h1>
          <p>& COMPANY</p>
        </div>
        <div class="content">
          ${content}
        </div>
        <div class="footer">
          <p><strong>Addisco & Company</strong></p>
          <p>Management Consulting</p>
          <p style="margin-top: 15px; opacity: 0.7;">Accelerating Africa's Prosperity</p>
          <div class="divider" style="background-color: rgba(255,255,255,0.2); margin: 20px 50px;"></div>
          <p>&copy; ${new Date().getFullYear()} Addisco & Company. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Send consultation request emails
 * Sends to both admin and client
 * @param {Object} consultation - Consultation request data
 */
const sendConsultationRequestEmail = async (consultation) => {
  // Admin notification email
  const adminContent = `
    <h2>New Consultation Request</h2>
    <p>A new consultation request has been submitted through the Addisco website.</p>
    
    <div class="info-box">
      <p><strong>Name:</strong> ${consultation.name}</p>
      <p><strong>Email:</strong> ${consultation.email}</p>
      <p><strong>Phone:</strong> ${consultation.phone}</p>
      <p><strong>Organization:</strong> ${consultation.organization || 'Not specified'}</p>
      <p><strong>Service:</strong> ${consultation.service.charAt(0).toUpperCase() + consultation.service.slice(1)}</p>
      <p><strong>Request ID:</strong> ${consultation._id}</p>
      <p><strong>Date:</strong> ${new Date(consultation.createdAt).toLocaleString()}</p>
    </div>

    <p><strong>Message:</strong></p>
    <div class="info-box">
      <p>${consultation.message}</p>
    </div>

    <p>Please review and respond to this request within 24 hours.</p>
  `;

  // Client confirmation email
  const clientContent = `
    <h2>Thank You for Contacting Addisco</h2>
    <p>Dear ${consultation.name},</p>
    
    <p>We have received your consultation request and truly appreciate your interest in working with Addisco & Company.</p>

    <div class="info-box">
      <p><strong>Service Requested:</strong> ${consultation.service.charAt(0).toUpperCase() + consultation.service.slice(1)}</p>
      <p><strong>Request ID:</strong> ${consultation._id}</p>
      <p><strong>Status:</strong> Pending Review</p>
    </div>

    <p>Our team of experts will carefully review your requirements and reach out to you within <strong>24 hours</strong> to discuss how we can help accelerate your organization's success.</p>

    <div class="divider"></div>

    <p>In the meantime, feel free to explore our insights and case studies at <a href="https://addisco.com">addisco.com</a>.</p>

    <p style="margin-top: 30px;">Best regards,<br><strong>The Addisco Team</strong></p>
  `;

  // Send both emails in parallel
  await Promise.all([
    sendEmail({
      to: process.env.ADMIN_EMAIL || 'admin@addisco.com',
      subject: `New Consultation Request - ${consultation.service}`,
      html: emailTemplate(adminContent)
    }),
    sendEmail({
      to: consultation.email,
      subject: 'Consultation Request Received - Addisco & Company',
      html: emailTemplate(clientContent)
    })
  ]);
};

/**
 * Send status update email to client
 * @param {Object} consultation - Consultation with updated status
 */
const sendStatusUpdateEmail = async (consultation) => {
  const statusMessages = {
    'contacted': 'Our team has reached out to you regarding your request.',
    'in-progress': 'Your consultation is now in progress. Our team is working on your requirements.',
    'completed': 'Your consultation has been completed. Thank you for choosing Addisco.',
    'cancelled': 'Your consultation request has been cancelled as per your request.'
  };

  const content = `
    <h2>Consultation Request Update</h2>
    <p>Dear ${consultation.name},</p>
    
    <p>We wanted to update you on the status of your consultation request.</p>

    <div class="info-box">
      <p><strong>Request ID:</strong> ${consultation._id}</p>
      <p><strong>Service:</strong> ${consultation.service.charAt(0).toUpperCase() + consultation.service.slice(1)}</p>
      <p><strong>New Status:</strong> ${consultation.status.charAt(0).toUpperCase() + consultation.status.slice(1).replace('-', ' ')}</p>
      <p><strong>Updated:</strong> ${new Date().toLocaleString()}</p>
    </div>

    <p>${statusMessages[consultation.status] || 'Your request status has been updated.'}</p>

    <p>If you have any questions, please don't hesitate to contact us.</p>

    <p style="margin-top: 30px;">Best regards,<br><strong>The Addisco Team</strong></p>
  `;

  await sendEmail({
    to: consultation.email,
    subject: `Consultation Update - ${consultation.status.replace('-', ' ')}`,
    html: emailTemplate(content)
  });
};

module.exports = {
  sendEmail,
  emailTemplate,
  sendConsultationRequestEmail,
  sendStatusUpdateEmail,
  transporter
};
