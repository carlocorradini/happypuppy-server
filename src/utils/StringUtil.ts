export default class StringUtil {
  private static readonly ALPHABET: string =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~:/?#[]@!$&'()*+,;=";

  private static readonly ALPHABET_LENGTH: number = StringUtil.ALPHABET.length;

  public static generateRandom(length: number): string {
    let result = '';
    for (let i = 0; i < length; i += 1) {
      result += this.ALPHABET.charAt(Math.floor(Math.random() * this.ALPHABET_LENGTH));
    }
    return result;
  }
}
