import { EntityRepository, AbstractRepository, getRepository } from 'typeorm';
import Personality from '../entity/Personality';

@EntityRepository(Personality)
export default class PersonalityRepository extends AbstractRepository<Personality> {
  public static async idsToEntity(ids: any[] | undefined): Promise<Personality[]> {
    if (!ids) return [];

    const validPersonalities: Personality[] = await getRepository(Personality).find({
      select: ['id'],
    });
    const personalities: Personality[] = [];

    ids
      .filter((id) => {
        return validPersonalities.some((personality) => {
          return personality.id === id;
        });
      })
      .forEach((id) => {
        personalities.push(getRepository(Personality).create({ id }));
      });

    return Promise.resolve(personalities);
  }
}
