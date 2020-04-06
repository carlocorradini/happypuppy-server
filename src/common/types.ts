import { IsNumber, Length, IsNotEmpty } from 'class-validator';
// eslint-disable-next-line no-unused-vars
import { UserRole } from '@app/db/entity/User';

export namespace JWT {
  export interface Payload {
    id: string;
    role: UserRole;
  }
}

export namespace Account {
  export class Verfication {
    @IsNumber()
    @IsNotEmpty()
    @Length(8, 8)
    // eslint-disable-next-line camelcase
    phone_code!: number;

    @IsNumber()
    @IsNotEmpty()
    @Length(8, 8)
    // eslint-disable-next-line camelcase
    email_code!: number;
  }
}
