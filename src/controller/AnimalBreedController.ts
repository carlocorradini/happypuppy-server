/* eslint-disable camelcase */
// eslint-disable-next-line no-unused-vars
import { Request, Response } from 'express';
import { getManager } from 'typeorm';
import logger from '@app/logger';
import AnimalBreed from '@app/db/entity/AnimalBreed';
import { ResponseHelper, HttpStatusCode } from '@app/helper';

export default class AnimalSpecieController {
  public static find(req: Request, res: Response): void {
    const { limit, offset, sort, sort_order, id, name, specie } = req.query;

    getManager()
      .find(AnimalBreed, {
        ...(limit !== undefined && { take: (limit as unknown) as number }),
        ...(offset !== undefined && { skip: (offset as unknown) as number }),
        ...(sort !== undefined &&
          sort_order !== undefined && {
            order: {
              [sort as keyof AnimalBreed]: sort_order,
            },
          }),
        loadRelationIds: true,
        where: {
          ...(id !== undefined && { id }),
          ...(name !== undefined && { name }),
          ...(specie !== undefined && { specie }),
        },
      })
      .then((animalBreeds) => {
        logger.info(`Found ${animalBreeds.length} Animal Breeds`);

        ResponseHelper.send(res, HttpStatusCode.OK, animalBreeds);
      })
      .catch((ex) => {
        logger.warn(`Failed to find Animal Breeds due to ${ex.message}`);

        ResponseHelper.send(res, HttpStatusCode.INTERNAL_SERVER_ERROR);
      });
  }

  public static findById(req: Request, res: Response): void {
    const { id } = req.params;

    getManager()
      .findOneOrFail(AnimalBreed, id, { loadRelationIds: true })
      .then((animalBreed) => {
        logger.info(`Found Animal Breed ${animalBreed.id}`);

        ResponseHelper.send(res, HttpStatusCode.OK, animalBreed);
      })
      .catch((ex) => {
        logger.warn(`Failed to find Animal Breed ${id} due to ${ex.message}`);

        if (ex.name === 'EntityNotFound') ResponseHelper.send(res, HttpStatusCode.NOT_FOUND);
        else ResponseHelper.send(res, HttpStatusCode.INTERNAL_SERVER_ERROR);
      });
  }
}
