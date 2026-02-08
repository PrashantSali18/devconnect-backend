export const passwordResetTemplate = (resetUrl, userName) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .container {
          background: #f9f9f9;
          padding: 30px;
          border-radius: 10px;
          border: 1px solid #ddd;
        }
        .header {
          background: #4F46E5;
          color: white;
          padding: 20px;
          border-radius: 10px 10px 0 0;
          text-align: center;
        }
        .content {
          background: white;
          padding: 30px;
          border-radius: 0 0 10px 10px;
        }
        .button {
          display: inline-block;
          padding: 12px 30px;
          background: #4F46E5;
          color: white;
          text-decoration: none;
          border-radius: 5px;
          margin: 20px 0;
        }
        .footer {
          margin-top: 20px;
          font-size: 12px;
          color: #666;
          text-align: center;
        }
        .warning {
          background: #FEF3C7;
          border-left: 4px solid #F59E0B;
          padding: 15px;
          margin: 20px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔐 Password Reset Request</h1>
        </div>
        <div class="content">
          <p>Hi ${userName},</p>
          
          <p>You recently requested to reset your password for your DevConnect account. Click the button below to reset it:</p>
          
          <div style="text-align: center;">
            <a href="${resetUrl}" class="button">Reset Password</a>
          </div>
          
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #4F46E5;">${resetUrl}</p>
          
          <div class="warning">
            <strong>⚠️ Important:</strong> This password reset link will expire in 10 minutes. If you didn't request this, please ignore this email.
          </div>
          
          <p>If you're having trouble clicking the button, copy and paste the URL into your web browser.</p>
          
          <p>Best regards,<br>DevConnect Team</p>
        </div>
        <div class="footer">
          <p>This is an automated email. Please do not reply.</p>
          <p>&copy; ${new Date().getFullYear()} DevConnect. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

export const emailVerificationTemplate = (verifyUrl, userName) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .container {
          background: #f9f9f9;
          padding: 30px;
          border-radius: 10px;
          border: 1px solid #ddd;
        }
        .header {
          background: #10B981;
          color: white;
          padding: 20px;
          border-radius: 10px 10px 0 0;
          text-align: center;
        }
        .content {
          background: white;
          padding: 30px;
          border-radius: 0 0 10px 10px;
        }
        .button {
          display: inline-block;
          padding: 12px 30px;
          background: #10B981;
          color: white;
          text-decoration: none;
          border-radius: 5px;
          margin: 20px 0;
        }
        .footer {
          margin-top: 20px;
          font-size: 12px;
          color: #666;
          text-align: center;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✉️ Verify Your Email</h1>
        </div>
        <div class="content">
          <p>Hi ${userName},</p>
          
          <p>Welcome to DevConnect! 🎉</p>
          
          <p>Please verify your email address by clicking the button below:</p>
          
          <div style="text-align: center;">
            <a href="${verifyUrl}" class="button">Verify Email</a>
          </div>
          
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #10B981;">${verifyUrl}</p>
          
          <p>This link will expire in 24 hours.</p>
          
          <p>If you didn't create an account, please ignore this email.</p>
          
          <p>Best regards,<br>DevConnect Team</p>
        </div>
        <div class="footer">
          <p>This is an automated email. Please do not reply.</p>
          <p>&copy; ${new Date().getFullYear()} DevConnect. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

export const passwordResetSuccessTemplate = (userName) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .container {
          background: #f9f9f9;
          padding: 30px;
          border-radius: 10px;
          border: 1px solid #ddd;
        }
        .header {
          background: #10B981;
          color: white;
          padding: 20px;
          border-radius: 10px 10px 0 0;
          text-align: center;
        }
        .content {
          background: white;
          padding: 30px;
          border-radius: 0 0 10px 10px;
        }
        .footer {
          margin-top: 20px;
          font-size: 12px;
          color: #666;
          text-align: center;
        }
        .success {
          background: #D1FAE5;
          border-left: 4px solid #10B981;
          padding: 15px;
          margin: 20px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ Password Reset Successful</h1>
        </div>
        <div class="content">
          <p>Hi ${userName},</p>
          
          <div class="success">
            <strong>Success!</strong> Your password has been reset successfully.
          </div>
          
          <p>You can now log in to your DevConnect account with your new password.</p>
          
          <p>If you didn't make this change, please contact our support team immediately.</p>
          
          <p>Best regards,<br>DevConnect Team</p>
        </div>
        <div class="footer">
          <p>This is an automated email. Please do not reply.</p>
          <p>&copy; ${new Date().getFullYear()} DevConnect. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};