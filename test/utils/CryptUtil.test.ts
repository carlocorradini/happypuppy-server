import CryptUtil from '../../src/utils/CryptUtil';

const LENGTH: number = 60;
const ROUND: number = 10;
describe('CryptUtil functionality', () => {
  test('It should pass due to correct hash length', async () => {
    expect(await CryptUtil.hash('Test')).toHaveLength(LENGTH);
  });
  test('It should fail due to different string input and hash ', async () => {
    expect(await CryptUtil.compare('Test', await CryptUtil.hash('Test2'))).toBeFalsy();
  });
  test('It should pass due to correct string input and hash', async () => {
    expect(await CryptUtil.compare('Test', await CryptUtil.hash('Test'))).toBeTruthy();
  });
  test('It should return 10 as round of hashing', async () => {
    expect(await CryptUtil.getRounds(await CryptUtil.hash('Test'))).toBe(ROUND);
  });
});
