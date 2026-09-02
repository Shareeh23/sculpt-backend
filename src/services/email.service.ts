import nodemailer from "nodemailer";

import { env } from "../config/env.js";

class EmailService {
  private readonly transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: "gmail",

      auth: {
        user: env.EMAIL_USERNAME,
        pass: env.EMAIL_PASSWORD,
      },
    });
  }

  async sendPasswordResetEmail(email: string, resetUrl: string): Promise<void> {
    await this.transporter.sendMail({
      from: env.EMAIL_USERNAME,
      to: email,

      subject: "Reset your Sculpt password",

      text: `
Password Reset Request

We received a request to reset your Sculpt password.

Use the link below to reset your password:

${resetUrl}

This password reset link will expire after the configured reset period.

If you did not request a password reset, you can safely ignore this email.

Sculpt
      `.trim(),

      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>Reset your Sculpt password</h2>

          <p>
            We received a request to reset your Sculpt password.
          </p>

          <p>
            Click the button below to choose a new password:
          </p>

          <p>
            <a
              href="${resetUrl}"
              style="
                display: inline-block;
                padding: 12px 20px;
                background-color: #000;
                color: #fff;
                text-decoration: none;
                border-radius: 6px;
              "
            >
              Reset Password
            </a>
          </p>

          <p>
            If the button doesn't work, copy and paste the following URL
            into your browser:
          </p>

          <p>${resetUrl}</p>

          <p>
            This password reset link will expire after the configured
            reset period.
          </p>

          <p>
            If you did not request a password reset, you can safely
            ignore this email.
          </p>

          <p>
            Sculpt
          </p>
        </div>
      `.trim(),
    });
  }
}

export const emailService = new EmailService();
