// eslint-disable-next-line no-unused-vars
import { Request, Response } from 'express';
import { getManager } from 'typeorm';
import logger from '@app/logger';
import AnimalSpecie from '@app/db/entity/AnimalSpecie';
import { ResponseHelper, HttpStatusCode } from '@app/helper';

export default class AnimalSpecieController {
  public static all(_req: Request, res: Response): void {
    getManager()
      .find(AnimalSpecie)
      .then((animalSpecies) => {
        logger.info(`Found ${animalSpecies.length} Animal Species`);

        ResponseHelper.send(res, HttpStatusCode.OK, animalSpecies);
      })
      .catch((ex) => {
        logger.warn(`Failed to find Animal Species due to ${ex.message}`);

        ResponseHelper.send(res, HttpStatusCode.INTERNAL_SERVER_ERROR);
      });
  }

  public static find(req: Request, res: Response): void {
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
