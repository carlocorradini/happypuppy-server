/* eslint-disable camelcase */
// eslint-disable-next-line no-unused-vars
import { Request, Response } from 'express';
import { getManager, Between } from 'typeorm';
import logger from '@app/logger';
import AnimalPark from '@app/db/entity/AnimalPlace';
import { ResponseHelper, HttpStatusCode } from '@app/helper';
// eslint-disable-next-line no-unused-vars
import GisUtil, { BoundingBox } from '@app/util/GisUtil';

export default class AnimalPlaceController {
  public static find(req: Request, res: Response): void {
    const {
      limit,
      offset,
      sort,
      sort_order,
      id,
      name,
      type,
      latitude,
      longitude,
      radius,
    } = req.query;

    const boundingBox: BoundingBox | undefined =
      latitude !== undefined && longitude !== undefined && radius !== undefined
        ? GisUtil.calculateBoundingBox(
            GisUtil.toCoordinates(latitude as string, longitude as string),
            radius as string
          )
        : undefined;

    getManager()
      .find(AnimalPark, {
        ...(limit !== undefined && { take: (limit as unknown) as number }),
        ...(offset !== undefined && { skip: (offset as unknown) as number }),
        ...(sort !== undefined &&
          sort_order !== undefined && {
            order: {
              [sort as keyof AnimalPark]: sort_order,
            },
          }),
        loadRelationIds: true,
        where: {
          ...(id !== undefined && { id }),
          ...(name !== undefined && { name }),
          ...(type !== undefined && { type }),
          ...(boundingBox !== undefined && {
            latitude: Between(boundingBox.min.latitude, boundingBox.max.latitude),
            longitude: Between(boundingBox.min.longitude, boundingBox.max.longitude),
          }),
        },
      })
      .then((parks) => {
        if (boundingBox !== undefined) {
          // eslint-disable-next-line no-param-reassign
          parks = parks.filter(
            (park) =>
              GisUtil.distance(
                boundingBox.pivot,
                GisUtil.toCoordinates(park.latitude, park.longitude)
              ) < boundingBox.radius
          );
        }

        logger.info(`Found ${parks.length} Animal Parks`);

        ResponseHelper.send(res, HttpStatusCode.OK, parks);
      })
      .catch((ex) => {
        logger.warn(`Failed to find Animal Parks due to ${ex.message}`);

        ResponseHelper.send(res, HttpStatusCode.INTERNAL_SERVER_ERROR);
      });
  }

  public static findById(req: Request, res: Response): void {
    const { id } = req.params;

    getManager()
      .findOneOrFail(AnimalPark, id)
      .then((park) => {
        logger.info(`Found Animal Park ${park.id}`);

        ResponseHelper.send(res, HttpStatusCode.OK, park);
      })
      .catch((ex) => {
        logger.warn(`Failed to find Animal Park ${id} due to ${ex.message}`);

        if (ex.name === 'EntityNotFound') ResponseHelper.send(res, HttpStatusCode.NOT_FOUND);
        else ResponseHelper.send(res, HttpStatusCode.INTERNAL_SERVER_ERROR);
      });
  }
}
