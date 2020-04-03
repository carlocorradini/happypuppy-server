export enum Status {
  // eslint-disable-next-line no-unused-vars
  SUCCESS = 'success',
  // eslint-disable-next-line no-unused-vars
  FAIL = 'fail',
  // eslint-disable-next-line no-unused-vars
  ERROR = 'error',
}

export interface Response {
  status: Status;
  // eslint-disable-next-line camelcase
  is_success: boolean;
  // eslint-disable-next-line camelcase
  http_status_code: number;
  // eslint-disable-next-line camelcase
  http_status_code_name: string;
  // eslint-disable-next-line camelcase
  status_code: number;
  data: any;
}
