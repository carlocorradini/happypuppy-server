// eslint-disable-next-line no-unused-vars
import { Request, Response } from 'express';
import { getManager } from 'typeorm';
import logger from '@app/logger';
import Personality from '@app/db/entity/AnimalPersonality';
import { ResponseHelper, HttpStatusCode } from '@app/helper';

export default class AnimalPersonalityController {
  public static all(_req: Request, res: Response): void {
    getManager()
      .find(Personality)
      .then((personalities) => {
        logger.info(`Found ${personalities.length} Personalities`);

        ResponseHelper.send(res, HttpStatusCode.OK, personalities);
      })
      .catch((ex) => {
        logger.warn(`Failed to find Personalities due to ${ex.message}`);

        ResponseHelper.send(res, HttpStatusCode.INTERNAL_SERVER_ERROR);
      });
  }

  public static find(req: Request, res: Response): void {
    const { id } = req.params;

    getManager()
      .findOneOrFail(Personality, id)
      .then((personality) => {
        logger.info(`Found Personality ${personality.id}`);

        ResponseHelper.send(res, HttpStatusCode.OK, personality);
      })
      .catch((ex) => {
        logger.warn(`Failed to find Personality ${id} due to ${ex.message}`);

        if (ex.name === 'EntityNotFound') ResponseHelper.send(res, HttpStatusCode.NOT_FOUND);
        else ResponseHelper.send(res, HttpStatusCode.INTERNAL_SERVER_ERROR);
      });
  }
}
