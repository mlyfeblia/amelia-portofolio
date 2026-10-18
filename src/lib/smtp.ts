import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { telemetry } from './telemetry';

let cachedTransporter: Transporter | null = null;
let cachedUser = '';
let cachedPass = '';

export function getSmtpUser(): string {
  return (
    process.env.SMTP_USER ||
    process.env.ADMIN_NOTIFICATION_EMAIL ||
    'mlyfeblia150207@gmail.com'
  ).trim();
}

export function getSmtpPass(): string {
  return (
    process.env.SMTP_APP_PASSWORD ||
    process.env.GMAIL_APP_PASSWORD ||
    ''
  )
    .trim()
    .replace(/\s+/g, '');
}

export function isSmtpConfigured(): boolean {
  const user = getSmtpUser();
  const pass = getSmtpPass();
  return Boolean(user && user.includes('@') && pass.length >= 8);
}

export function getSmtpTransporter(): Transporter | null {
  const user = getSmtpUser();
  const pass = getSmtpPass();

  if (!user || !pass) {
    return null;
  }

  if (!cachedTransporter || cachedUser !== user || cachedPass !== pass) {
    cachedUser = user;
    cachedPass = pass;
    cachedTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '465', 10),
      secure: process.env.SMTP_SECURE !== 'false', // true for 465 SSL
      auth: {
        user,
        pass,
      },
      connectionTimeout: 12000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
    });
  }

  return cachedTransporter;
}

export interface SmtpSendOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  fromName?: string;
}

export async function sendEmailViaSmtp(
  options: SmtpSendOptions
): Promise<{ success: boolean; messageId?: string; error?: unknown }> {
  const transporter = getSmtpTransporter();
  if (!transporter) {
    return { success: false, error: 'SMTP transporter is not configured' };
  }

  const senderUser = getSmtpUser();
  const senderName = (process.env.SMTP_FROM_NAME || 'Amelia BKI').trim();
  const from = `"${senderName}" <${senderUser}>`;

  try {
    const info = await transporter.sendMail({
      from,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      replyTo: options.replyTo,
    });

    telemetry.info('Email sent successfully via Gmail SMTP', {
      recipient: options.to,
      subject: options.subject,
      messageId: info.messageId,
    });

    return { success: true, messageId: info.messageId };
  } catch (error) {
    telemetry.error('Failed to send email via Gmail SMTP', error, {
      recipient: options.to,
      subject: options.subject,
    });
    return { success: false, error };
  }
}
