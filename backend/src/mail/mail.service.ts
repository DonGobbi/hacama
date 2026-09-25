import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly resend?: Resend;
  private readonly from: string;
  private readonly notifyTo: string;

  constructor(config: ConfigService) {
    const apiKey = config.get<string>('RESEND_API_KEY', '');
    this.from = config.get<string>('MAIL_FROM', 'Hacama Website <onboarding@resend.dev>');
    this.notifyTo = config.get<string>('ADMIN_NOTIFY_EMAIL', '');
    if (apiKey) {
      this.resend = new Resend(apiKey);
    } else {
      this.logger.warn('RESEND_API_KEY not set - email notifications are disabled');
    }
  }

  /** Fire-and-forget admin notification. Never throws - mail failure must not break requests. */
  notifyAdmin(subject: string, html: string): void {
    if (!this.resend || !this.notifyTo) return;
    this.resend.emails
      .send({ from: this.from, to: this.notifyTo, subject, html })
      .then(({ error }) => {
        if (error) this.logger.error(`Resend rejected "${subject}": ${error.message}`);
      })
      .catch((err: Error) => this.logger.error(`Failed to send "${subject}": ${err.message}`));
  }

  notifyApplication(details: { jobTitle: string; fullName: string; email: string; phone: string }): void {
    this.notifyAdmin(
      `New application: ${details.fullName} - ${details.jobTitle}`,
      this.wrap(
        'New job application',
        `
        <tr><td style="${this.tdLabel}">Position</td><td style="${this.tdValue}">${this.esc(details.jobTitle)}</td></tr>
        <tr><td style="${this.tdLabel}">Name</td><td style="${this.tdValue}">${this.esc(details.fullName)}</td></tr>
        <tr><td style="${this.tdLabel}">Email</td><td style="${this.tdValue}"><a href="mailto:${this.esc(details.email)}">${this.esc(details.email)}</a></td></tr>
        <tr><td style="${this.tdLabel}">Phone</td><td style="${this.tdValue}">${this.esc(details.phone || '-')}</td></tr>
        `,
        'Open the admin dashboard to review the cover letter and CV.',
      ),
    );
  }

  notifyEnquiry(details: {
    type: string;
    name: string;
    organization: string;
    email: string;
    phone: string;
    message: string;
  }): void {
    const kind = details.type === 'quote' ? 'Quote request' : 'Contact enquiry';
    this.notifyAdmin(
      `New ${kind.toLowerCase()}: ${details.name}`,
      this.wrap(
        `New ${kind.toLowerCase()}`,
        `
        <tr><td style="${this.tdLabel}">Name</td><td style="${this.tdValue}">${this.esc(details.name)}</td></tr>
        <tr><td style="${this.tdLabel}">Organization</td><td style="${this.tdValue}">${this.esc(details.organization || '-')}</td></tr>
        <tr><td style="${this.tdLabel}">Email</td><td style="${this.tdValue}"><a href="mailto:${this.esc(details.email)}">${this.esc(details.email)}</a></td></tr>
        <tr><td style="${this.tdLabel}">Phone</td><td style="${this.tdValue}">${this.esc(details.phone || '-')}</td></tr>
        <tr><td style="${this.tdLabel}">Message</td><td style="${this.tdValue}">${this.esc(details.message || '-')}</td></tr>
        `,
        'Open the admin dashboard to respond.',
      ),
    );
  }

  /** Send a password-reset link directly to a user. Never throws. */
  sendPasswordReset(to: string, name: string, resetUrl: string): void {
    if (!this.resend) return;
    this.resend.emails
      .send({
        from: this.from,
        to,
        subject: 'Reset your Hacama admin password',
        html: this.wrap(
          'Reset your password',
          `
          <tr><td style="${this.tdLabel}">Hi</td><td style="${this.tdValue}">${this.esc(name)}</td></tr>
          <tr><td style="${this.tdLabel}">Reset link</td><td style="${this.tdValue}"><a href="${this.esc(resetUrl)}">${this.esc(resetUrl)}</a></td></tr>
          `,
          'This link expires in 1 hour. If you did not request a reset, you can ignore this email.',
        ),
      })
      .then(({ error }) => {
        if (error) this.logger.error(`Resend rejected password reset for ${to}: ${error.message}`);
      })
      .catch((err: Error) => this.logger.error(`Failed to send password reset to ${to}: ${err.message}`));
  }

  private readonly tdLabel =
    'padding:8px 12px;font-size:13px;color:#64748b;border-bottom:1px solid #f1f5f9;white-space:nowrap;vertical-align:top';
  private readonly tdValue = 'padding:8px 12px;font-size:13px;color:#1d1d22;border-bottom:1px solid #f1f5f9';

  private wrap(title: string, rows: string, footer: string): string {
    return `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden">
        <div style="background:#a84b38;padding:16px 20px">
          <h1 style="margin:0;font-size:16px;color:#ffffff">${this.esc(title)}</h1>
        </div>
        <table style="width:100%;border-collapse:collapse">${rows}</table>
        <p style="margin:0;padding:14px 20px;font-size:12px;color:#94a3b8;background:#f8fafc">${this.esc(footer)}</p>
      </div>`;
  }

  private esc(value: string): string {
    return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
}
