import nodemailer from 'nodemailer';
import { mailConfig } from '../../config/mail.js';
import NotificationStrategy from './notificationStrategy.js';

class NodemailerStrategy extends NotificationStrategy {
  constructor(options = {}) {
    super(options);
    this.transporter = nodemailer.createTransport(mailConfig);
  }

  async send({ to, subject, html, text }) {
    const mailOptions = {
      from: mailConfig.from,
      to,
      subject,
      html,
      text,
    };

    const info = await this.transporter.sendMail(mailOptions);
    return info;
  }
}

export default NodemailerStrategy;
