// eslint-disable-next-line no-unused-vars
import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import logger from '@app/logger';
import Puppy from '@app/db/entity/Puppy';
import { ResponseHelper, HttpStatusCode } from '@app/helper';

export default class PuppyController {
  public static find(req: Request, res: Response): void {
    const { id } = req.params;

    getRepository(Puppy)
      .findOneOrFail(id)
      .then((puppy) => {
        ResponseHelper.send(res, HttpStatusCode.OK, puppy);
      })
      .catch((ex) => {
        logger.warn(`Failed to find Puppy with id ${id} due to ${ex.message}`);

        if (ex.name === 'EntityNotFound') ResponseHelper.send(res, HttpStatusCode.NOT_FOUND);
        else ResponseHelper.send(res, HttpStatusCode.INTERNAL_SERVER_ERROR);
      });
  }
}
