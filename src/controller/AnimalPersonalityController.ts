/* eslint-disable camelcase */
// eslint-disable-next-line no-unused-vars
import { Request, Response } from 'express';
import { getManager } from 'typeorm';
import logger from '@app/logger';
import AnimalPersonality from '@app/db/entity/AnimalPersonality';
import { ResponseHelper, HttpStatusCode } from '@app/helper';

export default class AnimalPersonalityController {
  public static find(req: Request, res: Response): void {
    const { limit, offset, sort, sort_order, id, name } = req.query;

    getManager()
      .find(AnimalPersonality, {
        ...(limit !== undefined && { take: (limit as unknown) as number }),
        ...(offset !== undefined && { skip: (offset as unknown) as number }),
        ...(sort !== undefined &&
          sort_order !== undefined && {
            order: {
              [sort as keyof AnimalPersonality]: sort_order,
            },
          }),
        loadRelationIds: true,
        where: {
          ...(id !== undefined && { id }),
          ...(name !== undefined && { name }),
        },
      })
      .then((personalities) => {
        logger.info(`Found ${personalities.length} Animal Personalities`);

        ResponseHelper.send(res, HttpStatusCode.OK, personalities);
      })
      .catch((ex) => {
        logger.warn(`Failed to find Animal Personalities due to ${ex.message}`);

        ResponseHelper.send(res, HttpStatusCode.INTERNAL_SERVER_ERROR);
      });
  }

  public static findById(req: Request, res: Response): void {
    const { id } = req.params;

    getManager()
      .findOneOrFail(AnimalPersonality, id)
      .then((personality) => {
        logger.info(`Found Animal Personality ${personality.id}`);

        ResponseHelper.send(res, HttpStatusCode.OK, personality);
      })
      .catch((ex) => {
        logger.warn(`Failed to find Animal Personality ${id} due to ${ex.message}`);

        if (ex.name === 'EntityNotFound') ResponseHelper.send(res, HttpStatusCode.NOT_FOUND);
        else ResponseHelper.send(res, HttpStatusCode.INTERNAL_SERVER_ERROR);
      });
  }
}
