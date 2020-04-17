// eslint-disable-next-line no-unused-vars
import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import logger from '@app/logger';
import Personality from '@app/db/entity/Personality';
import { ResponseHelper, HttpStatusCode } from '@app/helper';

export default class PersonalityController {
  public static all(_req: Request, res: Response): void {
    getRepository(Personality)
      .find()
      .then((personalities) => {
        logger.info(`Found ${personalities.length} Personalities`);

        ResponseHelper.send(res, HttpStatusCode.OK, { personalities });
      })
      .catch((ex) => {
        logger.warn(`Failed to find Personalities due to ${ex.message}`);

        ResponseHelper.send(res, HttpStatusCode.INTERNAL_SERVER_ERROR);
      });
  }

  public static find(req: Request, res: Response): void {
    const { id } = req.params;

    getRepository(Personality)
      .findOneOrFail(id)
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