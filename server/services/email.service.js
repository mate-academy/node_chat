import nodemailer from 'nodemailer';
import 'dotenv/config';

const {
  SMPT_HOST,
  SMPT_PORT,
  SMPT_USER,
  SMPT_PASSWORD,
  CLIENT_URL,
  CLIENT_PORT,
} = process.env;

const transporter = nodemailer.createTransport({
  host: SMPT_HOST,
  port: Number(SMPT_PORT),
  secure: false,
  auth: {
    user: SMPT_USER,
    pass: SMPT_PASSWORD,
  },
  tls: {
    ciphers: 'SSLv3',
    rejectUnauthorized: false,
  },
});

const send = async ({ email, subject, html }) => {
  const res = await transporter.sendMail({
    to: email,
    subject,
    html,
  });

  return res;
};

export const sendActivationEmail = (email, token) => {
  const href = `${CLIENT_URL}${CLIENT_PORT}/activate/${token}`;
  const html = `
  <h1>Activate Acount</h1>
  <a href="${href}">${href}</a>
  `;

  send({ email, html, subject: 'Activate' });
};

export const sendPassResetEmail = (email, token) => {
  const href = `${CLIENT_URL}${CLIENT_PORT}/password-reset/${token}`;
  const html = `
  <h1>Reset Password</h1>
  <a href="${href}">${href}</a>
  `;

  send({ email, html, subject: 'Reset Password' });
};

export const sendUpdateEmailEmail = (email, confirmEmail, token) => {
  const oldEmailHtml = `
  <h1>Account Email was updated</h1>
  <p>New email on file${confirmEmail}</p>
  `;

  const href = `${CLIENT_URL}/activate/${token}`;
  const html = `
  <h1>Activate Acount</h1>
  <a href="${href}">${href}</a>
  `;

  send({ email, html: oldEmailHtml, subject: 'Account Email was updated' });

  send({ email: confirmEmail, html, subject: 'Activate Acount' });
};
