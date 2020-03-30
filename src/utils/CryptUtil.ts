import bcrypt from 'bcryptjs';

export default class CryptUtil {
  private static readonly SALT_ROUNDS: number = 10;

  public static async hash(s: string): Promise<string> {
    return bcrypt.hash(s, await bcrypt.genSalt(CryptUtil.SALT_ROUNDS));
  }

  public static async compare(s: string, hash: string): Promise<boolean> {
    return bcrypt.compare(s, hash);
  }

  public static async getRounds(hash: string): Promise<number> {
    return bcrypt.getRounds(hash);
  }

  public static async getSalt(hash: string): Promise<string> {
    return bcrypt.getSalt(hash);
  }
}
