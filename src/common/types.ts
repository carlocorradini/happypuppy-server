// eslint-disable-next-line no-unused-vars
import { UserRole } from '@app/db/entity/User';

export namespace JWT {
  export interface Payload {
    id: string;
    role: UserRole;
  }
}
