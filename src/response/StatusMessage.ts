import StatusCode from './StatusCode';

type EnumDictionary<T extends string | symbol | number, U> = {
  [K in T]: U;
};

const StatusMessage: EnumDictionary<StatusCode, string> = {
  [StatusCode.OK]: 'Success',
  [StatusCode.CREATED]: 'Resource created',
  [StatusCode.ACCEPTED]: 'Request accepted',
  [StatusCode.BAD_REQUEST]: 'Invalid request message',
  [StatusCode.UNAUTHORIZED]: 'Unauthorized request',
  [StatusCode.NOT_FOUND]: 'Resource not found',
  [StatusCode.INTERNAL_SERVER_ERROR]: 'Internal Server error',
  [StatusCode.UNKNOWN_ERROR]: 'Unknown Error',
};

export default StatusMessage;
