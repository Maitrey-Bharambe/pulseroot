import nodemailer from 'nodemailer';

/**
 * Standardized email service for PulseRoot Smart Plant Platform.
 * Configured dynamically from environment variables:
 * - SMTP_HOST: SMTP server hostname (e.g. smtp.gmail.com)
 * - SMTP_PORT: SMTP port (e.g. 587 or 465)
 * - SMTP_USER: SMTP authentication username (email address)
 * - SMTP_PASS: SMTP authentication password (or Gmail App Password)
 * - SMTP_FROM: Default sender identity (e.g. "PulseRoot Alert Gateway" <alerts@pulseroot.ag>)
 */

// Initialize transporter
function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    // Return null to signify that SMTP credentials are not yet configured
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // true for 465, false for other ports
    auth: {
      user,
      pass
    },
    tls: {
      rejectUnauthorized: false
    }
  });
}

/**
 * Send a generic email.
 * Falls back to local console mock logs if not configured.
 */
export async function sendEmail({ to, subject, html, text }) {
  const transporter = getTransporter();
  const from = process.env.SMTP_FROM || '"PulseRoot Alert Gateway" <alerts@pulseroot.ag>';

  if (!transporter) {
    console.log('\n======================================================');
    console.log('🤖 [PulseRoot Mailer MOCK MODE] Sending Alert Email:');
    console.log(`To:      ${to}`);
    console.log(`From:    ${from}`);
    console.log(`Subject: ${subject}`);
    console.log('------------------------------------------------------');
    console.log(text || '(HTML Content generated successfully)');
    console.log('======================================================\n');
    return { success: true, mock: true, message: 'Email logged to local system console.' };
  }

  try {
    const info = await transporter.sendMail({
      from,
      to,
      subject,
      text: text || 'This is an automated agronomic warning alert from PulseRoot.',
      html
    });
    console.log(`[PulseRoot Mailer] Email sent successfully: ${info.messageId}`);
    return { success: true, mock: false, messageId: info.messageId };
  } catch (err) {
    console.error('[PulseRoot Mailer] Error dispatching SMTP message:', err);
    throw err;
  }
}

/**
 * Generates and dispatches a beautifully themed agronomic alert notification.
 */
export async function sendAgronomicAlertEmail({ email, userName, deviceName, alertType, message }) {
  const subject = `⚠️ PulseRoot Alert: [${alertType}] Detected on ${deviceName}`;
  const timestamp = new Date().toLocaleString('en-US', { timeZoneName: 'short' });

  // Recommendations mapping based on alert keywords
  let recommendations = 'Maintain standard environmental monitoring and crop management programs.';
  const msgLower = message.toLowerCase();
  
  if (msgLower.includes('heat') || msgLower.includes('temperature')) {
    recommendations = '🚨 Recommendations:<br/>1. Check greenhouse ventilation and exhaust fans.<br/>2. Deploy shade nets if daylight levels are excessive.<br/>3. Initiate short misting or irrigation loop to cool down roots.';
  } else if (msgLower.includes('humidity') || msgLower.includes('dry')) {
    recommendations = '🚨 Recommendations:<br/>1. Inspect active greenhouse humidifiers.<br/>2. Close open windows to conserve transpiration moisture.<br/>3. Verify soil moisture and adjust automated water pump triggers.';
  } else if (msgLower.includes('dark') || msgLower.includes('light')) {
    recommendations = '🚨 Recommendations:<br/>1. Check if growth lamps are switched on or timer is desynced.<br/>2. Clean any structural dust or physical obstacles shading LDR arrays.<br/>3. Verify daytime cycles.';
  }

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>PulseRoot Agronomic Alert</title>
      <style>
        body {
          font-family: 'Segoe UI', Arial, sans-serif;
          background-color: #FCEDE8;
          color: #1C3B2B;
          margin: 0;
          padding: 20px;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(28, 59, 43, 0.08);
          border: 1px solid rgba(28, 59, 43, 0.05);
        }
        .header {
          background-color: #1C3B2B;
          color: #FCEDE8;
          padding: 30px;
          text-align: center;
        }
        .logo-circle {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          border: 2px solid #FCEDE8;
          margin: 0 auto 10px auto;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: rgba(255,255,255,0.1);
        }
        .header h1 {
          margin: 0;
          font-size: 22px;
          letter-spacing: 0.5px;
          font-weight: 800;
        }
        .header p {
          margin: 5px 0 0 0;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 2px;
          opacity: 0.8;
          font-weight: 600;
        }
        .content {
          padding: 40px 30px;
        }
        .salutation {
          font-size: 16px;
          font-weight: bold;
          margin-bottom: 20px;
        }
        .alert-card {
          background: rgba(200, 107, 79, 0.06);
          border: 1.5px solid rgba(200, 107, 79, 0.2);
          border-radius: 18px;
          padding: 20px;
          margin-bottom: 25px;
        }
        .alert-badge {
          background-color: #C86B4F;
          color: #ffffff;
          display: inline-block;
          font-size: 10px;
          font-weight: 800;
          padding: 4px 10px;
          border-radius: 50px;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 12px;
        }
        .alert-message {
          font-size: 14px;
          font-weight: bold;
          line-height: 1.5;
          margin: 0 0 10px 0;
        }
        .meta-list {
          font-size: 11px;
          color: #8B7B75;
          margin: 15px 0 0 0;
          padding: 0;
          list-style: none;
          border-top: 1px solid rgba(28, 59, 43, 0.1);
          pt: 10px;
        }
        .meta-list li {
          margin-top: 6px;
        }
        .recommendations {
          background-color: #FAF3EF;
          border-left: 4px solid #4A5E2B;
          border-radius: 8px;
          padding: 18px;
          font-size: 12.5px;
          line-height: 1.6;
          margin-bottom: 25px;
          color: #4A5E2B;
          font-weight: 500;
        }
        .button-container {
          text-align: center;
          margin: 35px 0 15px 0;
        }
        .cta-btn {
          background-color: #1C3B2B;
          color: #FCEDE8;
          text-decoration: none;
          font-size: 13px;
          font-weight: bold;
          padding: 14px 28px;
          border-radius: 50px;
          display: inline-block;
          box-shadow: 0 6px 18px rgba(28, 59, 43, 0.15);
          letter-spacing: 0.5px;
        }
        .footer {
          background-color: #FAF3EF;
          padding: 25px 30px;
          text-align: center;
          font-size: 10px;
          color: #8B7B75;
          border-top: 1px solid rgba(28, 59, 43, 0.05);
          line-height: 1.5;
        }
        .footer p {
          margin: 0 0 5px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo-circle">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FCEDE8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 20 2c1 5.5-2.2 14.5-9 18Z" />
              <path d="M9 22v-4.5" />
            </svg>
          </div>
          <h1>PulseRoot</h1>
          <p>Smart Plant Intelligence</p>
        </div>
        <div class="content">
          <div class="salutation">Hello ${userName},</div>
          <p style="font-size: 13.5px; line-height: 1.6; margin-bottom: 20px;">
            Our automated precision telemetry gateway has registered a critical environmental anomaly that has crossed your defined safety thresholds.
          </p>
          
          <div class="alert-card">
            <span class="alert-badge">${alertType}</span>
            <p class="alert-message">${message}</p>
            <ul class="meta-list">
              <li style="margin-top: 10px;"><strong>Device:</strong> ${deviceName}</li>
              <li><strong>Timestamp:</strong> ${timestamp}</li>
            </ul>
          </div>
          
          <div class="recommendations">
            ${recommendations}
          </div>
          
          <div class="button-container">
            <a href="http://localhost:3000/dashboard" class="cta-btn">Access Telemetry Console</a>
          </div>
        </div>
        <div class="footer">
          <p>© 2026 PulseRoot Agriculture Systems Inc. All rights reserved.</p>
          <p>Confidential alert generated automatically. Add alerts@pulseroot.ag to safe senders.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
    PulseRoot Critical Agronomic Warning Alert
    -------------------------------------------
    Hello ${userName},
    
    Our precision telemetry gateway registered a critical environmental anomaly on your device.
    
    Device: ${deviceName}
    Alert Type: [${alertType}]
    Anomalous Event: ${message}
    Timestamp: ${timestamp}
    
    Recommendations:
    ${recommendations.replace(/<br\/>/g, '\n').replace(/🚨 Recommendations:\n/g, '')}
    
    Please access the telemetry console to configure automatic pump overrides: http://localhost:3000/dashboard
  `;

  return sendEmail({ to: email, subject, html, text });
}
