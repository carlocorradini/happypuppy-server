// eslint-disable-next-line no-unused-vars
import {
  AbstractRepository,
  EntityRepository,
  // eslint-disable-next-line no-unused-vars
  EntityManager,
  // eslint-disable-next-line no-unused-vars
  SaveOptions,
  Not,
  // eslint-disable-next-line no-unused-vars
  DeleteResult,
} from 'typeorm';
import Puppy from '@app/db/entity/Puppy';
// eslint-disable-next-line no-unused-vars
import { DuplicateEntityError, OwnerMismatchError } from '@app/common/error';
// eslint-disable-next-line no-unused-vars
import { Duplicate } from '@app/common/error/DuplicateEntityError';
import { EntityUtil } from '@app/util';

@EntityRepository(Puppy)
export default class PuppyRepository extends AbstractRepository<Puppy> {
  public async saveOrFail(puppy: Puppy, entityManager?: EntityManager): Promise<Puppy> {
    const callback = (em: EntityManager) => {
      return PuppyRepository.saveUnique(puppy, em);
    };
    if (entityManager === undefined) return this.manager.transaction(callback);
    return callback(entityManager);
  }

  public async updateOrFail(puppy: Puppy, entityManager?: EntityManager): Promise<Puppy> {
    const callback = async (em: EntityManager) => {
      const puppyToUpdate: Puppy = await em.findOneOrFail(Puppy, puppy.id);
      if (puppy.user.id !== puppyToUpdate.user_id) {
        throw new OwnerMismatchError('Puppy owner does not match');
      }
      await em.merge(Puppy, puppyToUpdate, puppy);
      return PuppyRepository.updateUnique(puppyToUpdate, em);
    };

    if (entityManager === undefined) return this.manager.transaction(callback);
    return callback(entityManager);
  }

  public async deleteOrFail(puppy: Puppy, entityManager?: EntityManager): Promise<DeleteResult> {
    const callback = async (em: EntityManager) => {
      const puppyToDelete = await em.findOneOrFail(Puppy, puppy.id);
      if (puppy.user.id !== puppyToDelete.user_id) {
        throw new OwnerMismatchError('Puppy owner does not match');
      }
      return em.delete(Puppy, puppy.id);
    };

    if (entityManager === undefined) return this.manager.transaction(callback);
    return callback(entityManager);
  }

  private static async saveUnique(
    puppy: Puppy,
    entityManager: EntityManager,
    saveOptions?: SaveOptions,
    isUpdateOperation?: boolean
  ): Promise<Puppy> {
    const duplicateFields = new Set<Duplicate>();
    const uniqueColumns = EntityUtil.uniqueColumns(Puppy);
    const whereConditions = uniqueColumns.map((u) => {
      return {
        [u]: puppy[u],
        ...(isUpdateOperation === true && {
          id: Not(puppy.id),
        }),
      };
    });
    const duplicateEntities = await entityManager.find(Puppy, {
      where: whereConditions,
      select: uniqueColumns,
    });
    duplicateEntities.forEach((_puppy) => {
      uniqueColumns.forEach((u) => {
        if (puppy[u] === _puppy[u]) {
          duplicateFields.add({ property: u.toString(), value: puppy[u] });
        }
      });
    });

    if (duplicateFields.size !== 0)
      throw new DuplicateEntityError(`Duplicate Puppy entity found`, Array.from(duplicateFields));

    return entityManager.save(Puppy, puppy, saveOptions);
  }

  private static async updateUnique(
    puppy: Puppy,
    entityManager: EntityManager,
    saveOptions?: SaveOptions
  ): Promise<Puppy> {
    return this.saveUnique(puppy, entityManager, saveOptions, true);
  }
}
