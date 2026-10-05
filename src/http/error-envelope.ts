export interface ErrorEnvelope {
  statusCode: number;
  error: string;
  message: string;
  details?: unknown;
}
//định dạng lỗi chuẩn của toàn bộ backend