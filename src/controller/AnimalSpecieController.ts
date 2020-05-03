/* eslint-disable camelcase */
// eslint-disable-next-line no-unused-vars
import { Request, Response } from 'express';
import { getManager } from 'typeorm';
import logger from '@app/logger';
import AnimalSpecie from '@app/db/entity/AnimalSpecie';
import { ResponseHelper, HttpStatusCode } from '@app/helper';
import { StringUtil, ArrayUtil } from '@app/util';

export default class AnimalSpecieController {
  public static find(req: Request, res: Response): void {
    const { limit, offset, sort, sort_order, id, name, breeds } = req.query;

    const breedsArray: number[] = StringUtil.toNumberArray(breeds as string);

    getManager()
      .find(AnimalSpecie, {
        ...(limit !== undefined && { take: (limit as unknown) as number }),
        ...(offset !== undefined && { skip: (offset as unknown) as number }),
        ...(sort !== undefined &&
          sort_order !== undefined && {
            order: {
              [sort as keyof AnimalSpecie]: sort_order,
            },
          }),
        loadRelationIds: true,
        where: {
          ...(id !== undefined && { id }),
          ...(name !== undefined && { name }),
        },
      })
      .then((animalSpecies) => {
        // eslint-disable-next-line no-param-reassign
        animalSpecies = animalSpecies.filter((specie) =>
          ArrayUtil.contains(specie.breeds, breedsArray)
        );

        logger.info(`Found ${animalSpecies.length} Animal Species`);

        ResponseHelper.send(res, HttpStatusCode.OK, animalSpecies);
      })
      .catch((ex) => {
        logger.warn(`Failed to find Animal Species due to ${ex.message}`);

        ResponseHelper.send(res, HttpStatusCode.INTERNAL_SERVER_ERROR);
      });
  }

  public static findById(req: Request, res: Response): void {
    const { id } = req.params;

    getManager()
      .findOneOrFail(AnimalSpecie, id)
      .then((animalSpecie) => {
        logger.info(`Found Animal Specie ${animalSpecie.id}`);

        ResponseHelper.send(res, HttpStatusCode.OK, animalSpecie);
      })
      .catch((ex) => {
        logger.warn(`Failed to find Animal Specie ${id} due to ${ex.message}`);

        if (ex.name === 'EntityNotFound') ResponseHelper.send(res, HttpStatusCode.NOT_FOUND);
        else ResponseHelper.send(res, HttpStatusCode.INTERNAL_SERVER_ERROR);
      });
  }
}
