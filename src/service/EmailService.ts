import nodemailer from 'nodemailer';
// eslint-disable-next-line no-unused-vars
import Mail from 'nodemailer/lib/mailer';
import config from '@app/config';
import logger from '@app/logger';

export default class EmailService {
  private static readonly transport = nodemailer.createTransport({
    host: config.SERVICE.EMAIL.HOST,
    port: config.SERVICE.EMAIL.PORT,
    secure: config.SERVICE.EMAIL.SECURE,
    auth: {
      user: config.SERVICE.EMAIL.USERNAME,
      pass: config.SERVICE.EMAIL.PASSWORD,
    },
  });

  public static send(mailOptions: Mail.Options): Promise<any> {
    return new Promise((resolve, reject) => {
      this.transport.sendMail(mailOptions, (err, info) => {
        if (err) {
          logger.error(`Error sending email due to ${JSON.stringify(err)}`);
          reject(err);
        } else {
          logger.info(`Successfully sended email ${JSON.stringify(info)}`);
          resolve(info);
        }
      });
    });
  }
}
