import { describe, it, expect, beforeEach, vi } from 'vitest';
import nodemailer from 'nodemailer';

// email.ts creates its nodemailer transporter and validates required env
// vars at module-load time, so we must mock nodemailer and provide env
// defaults *before* importing it (mirrors the ??= pattern already used in
// src/lib/socket.test.ts and src/utils/jwt.test.ts) — otherwise import
// would throw or attempt a real SMTP connection.
vi.mock('nodemailer', () => ({
  default: {
    createTransport: vi.fn(),
  },
}));

process.env.EMAIL ??= 'auth@example.com';
process.env.EMAIL_PASSWORD ??= 'test-password';
process.env.SMTP_HOST ??= 'smtp.example.com';
process.env.SMTP_PORT ??= '465';
process.env.CLIENT_HOST ??= 'http://localhost:5173';

const sendMail = vi.fn();
vi.mocked(nodemailer.createTransport).mockReturnValue({
  sendMail,
} as unknown as ReturnType<typeof nodemailer.createTransport>);

const { mailer } = await import('./email.js');

describe('mailer', () => {
  const getFirstMailOptions = () => {
    const firstCall = sendMail.mock.calls[0];

    if (!firstCall) {
      throw new Error('Expected sendMail to be called');
    }

    return firstCall[0];
  };

  beforeEach(() => {
    sendMail.mockReset();
    sendMail.mockResolvedValue({ messageId: 'msg-1' });
  });

  it('creates the transporter once with SMTP config from env, at module load', () => {
    expect(nodemailer.createTransport).toHaveBeenCalledWith({
      host: 'smtp.example.com',
      port: 465,
      secure: true,
      auth: {
        user: 'auth@example.com',
        pass: 'test-password',
      },
    });
  });

  describe('sendActivationEmail', () => {
    it('sends to the given recipient with subject "Activate"', async () => {
      await mailer.sendActivationEmail('new-user@example.com', 'raw-token-1');

      expect(sendMail).toHaveBeenCalledTimes(1);
      const callArgs = getFirstMailOptions();

      expect(callArgs.to).toBe('new-user@example.com');
      expect(callArgs.subject).toBe('Activate');
    });

    it('embeds the raw token in the activation link', async () => {
      await mailer.sendActivationEmail('new-user@example.com', 'raw-token-1');

      const { html } = getFirstMailOptions();

      expect(html).toContain('http://localhost:5173/activation/raw-token-1');
    });

    it('does not encode/transform the token — the exact raw value appears in the link', async () => {
      const rawToken = 'aB3-xyz_token';

      await mailer.sendActivationEmail('user@example.com', rawToken);

      const { html } = getFirstMailOptions();

      expect(html).toContain(`/activation/${rawToken}`);
    });

    it('sends from the configured EMAIL address labeled "Auth API"', async () => {
      await mailer.sendActivationEmail('user@example.com', 'token-1');

      const { from } = getFirstMailOptions();

      expect(from).toBe('"Auth API" <auth@example.com>');
    });

    it('propagates a transport failure instead of swallowing it', async () => {
      const transportError = new Error('SMTP connection refused');
      sendMail.mockRejectedValueOnce(transportError);

      await expect(
        mailer.sendActivationEmail('user@example.com', 'token-1'),
      ).rejects.toThrow('SMTP connection refused');
    });

    it('rejects with the exact same error instance the transport threw', async () => {
      const transportError = new Error('ECONNREFUSED');
      sendMail.mockRejectedValueOnce(transportError);

      await expect(
        mailer.sendActivationEmail('user@example.com', 'token-1'),
      ).rejects.toBe(transportError);
    });
  });

  describe('sendResetPasswordEmail', () => {
    it('sends to the given recipient with subject "Reset your password"', async () => {
      await mailer.sendResetPasswordEmail('user@example.com', 'reset-token-1');

      expect(sendMail).toHaveBeenCalledTimes(1);
      const callArgs = getFirstMailOptions();

      expect(callArgs.to).toBe('user@example.com');
      expect(callArgs.subject).toBe('Reset your password');
    });

    it('embeds the raw token in the reset-password link', async () => {
      await mailer.sendResetPasswordEmail('user@example.com', 'reset-token-1');

      const { html } = getFirstMailOptions();

      expect(html).toContain(
        'http://localhost:5173/reset-password/reset-token-1',
      );
    });

    it('includes the expiry and "ignore if not requested" copy alongside the link', async () => {
      await mailer.sendResetPasswordEmail('user@example.com', 'reset-token-1');

      const { html } = getFirstMailOptions();

      expect(html).toMatch(/expires in 30 minutes/i);
      expect(html).toMatch(/safely ignore this email/i);
    });

    it('sends from the configured EMAIL address labeled "Auth API"', async () => {
      await mailer.sendResetPasswordEmail('user@example.com', 'token-1');

      const { from } = getFirstMailOptions();

      expect(from).toBe('"Auth API" <auth@example.com>');
    });

    it('propagates a transport failure instead of swallowing it', async () => {
      const transportError = new Error('SMTP timeout');
      sendMail.mockRejectedValueOnce(transportError);

      await expect(
        mailer.sendResetPasswordEmail('user@example.com', 'token-1'),
      ).rejects.toThrow('SMTP timeout');
    });

    it('does not call sendMail a second time or swallow the error after a failure', async () => {
      const transportError = new Error('SMTP timeout');
      sendMail.mockRejectedValueOnce(transportError);

      await expect(
        mailer.sendResetPasswordEmail('user@example.com', 'token-1'),
      ).rejects.toThrow();

      expect(sendMail).toHaveBeenCalledTimes(1);
    });
  });

  describe('send (shared helper both emails go through)', () => {
    it('forwards recipient, subject, and html verbatim to the transporter', async () => {
      await mailer.send('someone@example.com', 'A subject', '<p>body</p>');

      expect(sendMail).toHaveBeenCalledWith({
        from: '"Auth API" <auth@example.com>',
        to: 'someone@example.com',
        subject: 'A subject',
        html: '<p>body</p>',
      });
    });

    it('propagates whatever error the transporter rejects with', async () => {
      const transportError = new Error('auth failed');
      sendMail.mockRejectedValueOnce(transportError);

      await expect(
        mailer.send('someone@example.com', 'Subject', '<p>x</p>'),
      ).rejects.toBe(transportError);
    });
  });
});
