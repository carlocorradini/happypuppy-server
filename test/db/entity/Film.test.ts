import { validate } from 'class-validator';
import Film from '../../../src/db/entity/Film';
import { StringUtil } from '../../../src/utils';

const createFilm = (): Film => {
  const film: Film = new Film();

  film.title = 'The Great Escape';
  film.rating = 80;
  film.release_date = '1963-07-04';
  film.poster = 'https://image.tmdb.org/t/p/w600_and_h900_bestv2/qhy4HgUqhEbwQ1ekKTv7yEB3b0e.jpg';

  return film;
};

describe('Valid Film', () => {
  test('It should pass validation due to correct values', async () => {
    const film = createFilm();
    const errors = await validate(film);
    expect(errors.length).toBe(0);
  });
});

describe('Invalid Film', () => {
  test('It should fail validation due to title minimum length', async () => {
    const film = createFilm();
    film.title = '';
    const errors = await validate(film);
    expect(errors.length).toBe(1);
  });
  test('It should fail validation due to title maximum length', async () => {
    const film = createFilm();
    film.title = StringUtil.generateRandom(257);
    const errors = await validate(film);
    expect(errors.length).toBe(1);
  });
  test('It should fail validation due to minimal rating not reached', async () => {
    const film = createFilm();
    film.rating = 0;
    const errors = await validate(film);
    expect(errors.length).toBe(1);
  });
  test('It should fail validation due to maximal rating reached', async () => {
    const film = createFilm();
    film.rating = 101;
    const errors = await validate(film);
    expect(errors.length).toBe(1);
  });
  test('It should fail due to invalid release date type', async () => {
    const film = createFilm();
    film.release_date = '2019-2019-2019';
    const errors = await validate(film);
    expect(errors.length).toBe(1);
  });
  test('It should fail validation due to invalid poster URL', async () => {
    const film = createFilm();
    film.poster = 'htt://invalid.com/profile.jpg';
    let errors = await validate(film);
    expect(errors.length).toBe(1);
    film.poster = 'http//invalid.com/profile.jpg';
    errors = await validate(film);
    expect(errors.length).toBe(1);
    film.poster = 'http:/invalid.com/profile.jpg';
    errors = await validate(film);
    expect(errors.length).toBe(1);
  });
});
