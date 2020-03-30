export default class DateUtil {
  public static tomorrow(): Date {
    const tomorrow = new Date();
    tomorrow.setDate(new Date().getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow;
  }
}
