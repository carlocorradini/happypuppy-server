import DateUtil from '../../src/utils/DateUtil';

describe('Date Util functionality', () => {
  test('It should return a Date type', () => {
    expect(DateUtil.tomorrow()).toBeInstanceOf(Date);
  });

  test('It should return Tomorrow Date', () => {
    const tomorrow = new Date();
    tomorrow.setDate(new Date().getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    expect(tomorrow).toEqual(DateUtil.tomorrow());
  });
});
