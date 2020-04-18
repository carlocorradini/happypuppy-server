import {
  EntityRepository,
  AbstractRepository,
  // eslint-disable-next-line no-unused-vars
  EntityManager,
  getManager,
} from 'typeorm';
import Personality from '@app/db/entity/Personality';

@EntityRepository(Personality)
export default class PersonalityRepository extends AbstractRepository<Personality> {
  public static async idsToEntity(
    ids: any[] | undefined,
    entityManager?: EntityManager
  ): Promise<Personality[]> {
    const callback = async (em: EntityManager) => {
      if (!ids) return [];

      const validPersonalities: Personality[] = await em.find(Personality, {
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
          personalities.push(em.getRepository(Personality).create({ id }));
        });

      return personalities;
    };

    if (entityManager === undefined) return getManager().transaction(callback);
    return callback(entityManager);
  }
}
