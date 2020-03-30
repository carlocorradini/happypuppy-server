// eslint-disable-next-line no-unused-vars
import { Response } from 'express';
import logger from '../logger';
import StatusCode from './StatusCode';
import StatusMessage from './StatusMessage';

export default (res: Response, statusCode: StatusCode, data?: any) => {
  if (!(statusCode in StatusCode)) {
    // Invalid statusCode
    // eslint-disable-next-line no-param-reassign
    statusCode = StatusCode.UNKNOWN_ERROR;
  }

  res
    .status(statusCode)
    .json({
      success: statusCode < StatusCode.BAD_REQUEST,
      status_code: statusCode,
      status_message: StatusMessage[statusCode],
      metadata: {
        ...(data !== undefined && Array.isArray(data) && { total: data.length }),
      },
      ...(statusCode < StatusCode.BAD_REQUEST && { data }),
      ...(statusCode >= StatusCode.BAD_REQUEST && { error_message: data }),
    })
    .end();

  // eslint-disable-next-line no-param-reassign
  if (!data) data = '?';
  logger.debug(`Sending Response data: ${data instanceof Object ? JSON.stringify(data) : data}`);
};
