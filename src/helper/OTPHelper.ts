// eslint-disable-next-line no-unused-vars
import User from '@app/db/entity/User';
// eslint-disable-next-line no-unused-vars
import UserVerification from '@app/db/entity/UserVerification';
import { EmailService, PhoneService } from '@app/service';
import config from '@app/config';

export default class OTPHelper {
  public static async send(user: User, userVerification: UserVerification): Promise<void> {
    await EmailService.send({
      from: '"Happy Puppy" <otp@happypuppy.com>',
      to: user.email,
      subject: 'Happy Puppy OTP code',
      template: 'otp',
      context: {
        name: user.name,
        surname: user.surname,
        otp_code: userVerification.otp_email,
      },
    });

    await PhoneService.send({
      body: `${user.name} ${user.surname} OTP code: ${userVerification.otp_phone}`,
      from: config.SERVICE.PHONE.NUMBER_FROM,
      to: user.phone,
    });

    Promise.resolve();
  }
}
