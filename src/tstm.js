// test-ng-email.js
require('dotenv').config();
const { sendEmail } = require('./src/config/email');

sendEmail({
  to: 'your-personal@gmail.com',
  subject: 'Test from addisco.ng',
  html: '<h1>Success! ✅</h1><p>Email working from info@addisco.ng</p>'
}).then(result => {
  console.log(result.success ? '✅ SENT!' : '❌ FAILED:', result.error);
});