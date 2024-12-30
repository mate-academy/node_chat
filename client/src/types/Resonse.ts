export interface Response<T> {
  data: T;
  status: number;
  statusText: string;
}

export interface ErrorResponse {
  message: string;
}
