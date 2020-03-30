import { validate } from 'class-validator';
import User from '../../../src/db/entity/User';
import { StringUtil } from '../../../src/utils';

const createUser = (): User => {
  const user: User = new User();

  user.name = 'Steve';
  user.surname = 'McQueen';
  user.username = 'McQueenS';
  user.email = 'ggwp@gmail.com';
  user.password = 'ffjdffff';
  return user;
};

describe('Valid User', () => {
  test('It should pass validation due to correct values', async () => {
    const user = createUser();
    const errors = await validate(user);
    expect(errors.length).toBe(0);
  });
});

describe('Invalid User', () => {
  test('It should fail validation due to name minimum length', async () => {
    const user = createUser();
    user.name = '';
    const errors = await validate(user);
    expect(errors.length).toBe(1);
  });
  test('It should fail validation due to name maximum length', async () => {
    const user = createUser();
    user.name = StringUtil.generateRandom(129);
    const errors = await validate(user);
    expect(errors.length).toBe(1);
  });
  test('It should fail validation due to surname minimum length', async () => {
    const user = createUser();
    user.surname = '';
    const errors = await validate(user);
    expect(errors.length).toBe(1);
  });
  test('It should fail validation due to surname maximum length', async () => {
    const user = createUser();
    user.surname = StringUtil.generateRandom(129);
    const errors = await validate(user);
    expect(errors.length).toBe(1);
  });
  test('It should fail validation due to username minimum length', async () => {
    const user = createUser();
    user.username = '';
    const errors = await validate(user);
    expect(errors.length).toBe(1);
  });
  test('It should fail validation due to username maximum length', async () => {
    const user = createUser();
    user.username = StringUtil.generateRandom(129);
    const errors = await validate(user);
    expect(errors.length).toBe(1);
  });
  test('It should fail validation due to email maximum length', async () => {
    const user = createUser();
    user.email = StringUtil.generateRandom(129);
    const errors = await validate(user);
    expect(errors.length).toBe(1);
  });
  test('It should fail validation due to password minimum length', async () => {
    const user = createUser();
    user.email = StringUtil.generateRandom(9);
    const errors = await validate(user);
    expect(errors.length).toBe(1);
  });
  test('It should fail validation due to password maximum length', async () => {
    const user = createUser();
    user.email = StringUtil.generateRandom(129);
    const errors = await validate(user);
    expect(errors.length).toBe(1);
  });
});
