import StringUtil from '../../src/utils/StringUtil';

const RANDOM_STRING_LENGTH: number = 64;

describe('String Util functionality', () => {
  test('It should return a String type', () => {
    expect(typeof StringUtil.generateRandom(RANDOM_STRING_LENGTH)).toBe('string');
  });

  test(`It should return a string of ${RANDOM_STRING_LENGTH} characters length`, () => {
    expect(StringUtil.generateRandom(RANDOM_STRING_LENGTH)).toHaveLength(RANDOM_STRING_LENGTH);
  });
});
