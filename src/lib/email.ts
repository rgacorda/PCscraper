import nodemailer from 'nodemailer';

// Create reusable transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
});

export async function sendVerificationEmail(email: string, token: string) {
  const verificationUrl = `${process.env.NEXTAUTH_URL}/api/auth/verify?token=${token}`;

  const mailOptions = {
    from: process.env.EMAIL_FROM || 'noreply@pcbuilder.com',
    to: email,
    subject: 'Verify your email address',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .container {
              background-color: #f8f9fa;
              border-radius: 10px;
              padding: 30px;
              margin: 20px 0;
            }
            .header {
              background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
              color: white;
              padding: 30px;
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
              background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
              color: white;
              padding: 15px 30px;
              text-decoration: none;
              border-radius: 8px;
              margin: 20px 0;
              font-weight: bold;
            }
            .footer {
              text-align: center;
              color: #6b7280;
              font-size: 14px;
              margin-top: 30px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to PC Builder!</h1>
            </div>
            <div class="content">
              <h2>Verify Your Email Address</h2>
              <p>Thank you for registering! Please click the button below to verify your email address and activate your account.</p>

              <div style="text-align: center;">
                <a href="${verificationUrl}" class="button">Verify Email Address</a>
              </div>

              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #2563eb;">${verificationUrl}</p>

              <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                <strong>Note:</strong> This link will expire in 24 hours.
              </p>
            </div>
          </div>
          <div class="footer">
            <p>If you didn't create an account, you can safely ignore this email.</p>
            <p>&copy; 2025 PC Builder. All rights reserved.</p>
          </div>
        </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Verification email sent to:', email);
  } catch (error) {
    console.error('Failed to send verification email:', error);
    throw error;
  }
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${token}`;

  const mailOptions = {
    from: process.env.EMAIL_FROM || 'noreply@pcbuilder.com',
    to: email,
    subject: 'Reset your password',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .container {
              background-color: #f8f9fa;
              border-radius: 10px;
              padding: 30px;
              margin: 20px 0;
            }
            .header {
              background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
              color: white;
              padding: 30px;
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
              background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
              color: white;
              padding: 15px 30px;
              text-decoration: none;
              border-radius: 8px;
              margin: 20px 0;
              font-weight: bold;
            }
            .footer {
              text-align: center;
              color: #6b7280;
              font-size: 14px;
              margin-top: 30px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Password Reset Request</h1>
            </div>
            <div class="content">
              <h2>Reset Your Password</h2>
              <p>We received a request to reset your password. Click the button below to create a new password.</p>

              <div style="text-align: center;">
                <a href="${resetUrl}" class="button">Reset Password</a>
              </div>

              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #dc2626;">${resetUrl}</p>

              <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                <strong>Note:</strong> This link will expire in 1 hour.
              </p>
            </div>
          </div>
          <div class="footer">
            <p>If you didn't request a password reset, you can safely ignore this email.</p>
            <p>&copy; 2025 PC Builder. All rights reserved.</p>
          </div>
        </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Password reset email sent to:', email);
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    throw error;
  }
}
