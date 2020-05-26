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
import AnimalSpecie from '@app/db/entity/AnimalSpecie';
import Personality from '@app/db/entity/AnimalPersonality';
import AnimalBreed from '@app/db/entity/AnimalBreed';
// eslint-disable-next-line no-unused-vars
import { DuplicateEntityError } from '@app/common/error';
// eslint-disable-next-line no-unused-vars
import { Duplicate } from '@app/common/error/DuplicateEntityError';
import { EntityUtil } from '@app/util';
import ImageService, { ImageType } from '@app/service/ImageService';

@EntityRepository(Puppy)
export default class PuppyRepository extends AbstractRepository<Puppy> {
  public saveOrFail(puppy: Puppy, entityManager?: EntityManager): Promise<Puppy> {
    const callback = async (em: EntityManager) => {
      // eslint-disable-next-line no-param-reassign
      puppy.specie = await em.findOneOrFail(AnimalSpecie, {
        id: (puppy.specie as unknown) as number,
      });
      // eslint-disable-next-line no-param-reassign
      puppy.breeds =
        puppy.breeds && puppy.breeds.length > 0
          ? [
              await em.findOneOrFail(
                AnimalBreed,
                { id: (puppy.breeds[0] as unknown) as number },
                { select: ['id', 'name'] }
              ),
              ...puppy.breeds
                .slice(1)
                .map((id) => em.create(AnimalBreed, { id: (id as unknown) as number })),
            ]
          : [];
      // eslint-disable-next-line no-param-reassign
      puppy.personalities = puppy.personalities
        ? puppy.personalities.map((id) => em.create(Personality, { id: (id as unknown) as number }))
        : [];

      return PuppyRepository.saveUnique(puppy, em);
    };

    return entityManager === undefined
      ? this.manager.transaction(callback)
      : callback(entityManager);
  }

  public updateOrFail(puppy: Puppy, entityManager?: EntityManager): Promise<Puppy> {
    const callback = async (em: EntityManager) => {
      if (puppy.personalities) {
        // eslint-disable-next-line no-param-reassign
        puppy.personalities = await puppy.personalities.map((id) =>
          em.create(Personality, { id: (id as unknown) as number })
        );
      }
      if (puppy.breeds) {
        // eslint-disable-next-line no-param-reassign
        puppy.breeds = await puppy.breeds.map((id) =>
          em.create(AnimalBreed, { id: (id as unknown) as number })
        );
      }
      const puppyToUpdate: Puppy = await em.findOneOrFail(Puppy, puppy.id, {
        where: { user: puppy.user },
      });
      await em.merge(Puppy, puppyToUpdate, puppy);
      return PuppyRepository.updateUnique(puppyToUpdate, em);
    };

    return entityManager === undefined
      ? this.manager.transaction(callback)
      : callback(entityManager);
  }

  public updateAvataOrFail(
    puppy: Puppy,
    avatar: Express.Multer.File,
    entityManager?: EntityManager
  ): Promise<Puppy> {
    const callback = async (em: EntityManager) => {
      const avatarResult = await ImageService.upload(avatar, {
        type: ImageType.AVATAR,
        folder: 'puppy/avatar',
      });
      // eslint-disable-next-line no-param-reassign
      puppy.avatar = avatarResult.secure_url;
      return this.updateOrFail(puppy, em);
    };

    return entityManager === undefined
      ? this.manager.transaction(callback)
      : callback(entityManager);
  }

  public deleteOrFail(puppy: Puppy, entityManager?: EntityManager): Promise<DeleteResult> {
    const callback = async (em: EntityManager) => {
      await em.findOneOrFail(Puppy, puppy.id, {
        where: { user: puppy.user },
      });
      return em.delete(Puppy, puppy.id);
    };

    return entityManager === undefined
      ? this.manager.transaction(callback)
      : callback(entityManager);
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

    if (
      !isUpdateOperation &&
      (await entityManager.findOne(Puppy, {
        where: {
          id: puppy.id,
        },
      })) !== undefined
    ) {
      duplicateFields.add({
        property: `id`,
        value: puppy.id,
      });
    }

    if (duplicateFields.size !== 0)
      throw new DuplicateEntityError(`Duplicate Puppy entity found`, Array.from(duplicateFields));

    return entityManager.save(Puppy, puppy, saveOptions);
  }

  private static updateUnique(
    puppy: Puppy,
    entityManager: EntityManager,
    saveOptions?: SaveOptions
  ): Promise<Puppy> {
    return this.saveUnique(puppy, entityManager, saveOptions, true);
  }
}
