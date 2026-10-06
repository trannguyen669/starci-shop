# StarCi Shop Backend

Backend API cho StarCi Shop, được xây dựng bằng NestJS, TypeScript, TypeORM, PostgreSQL, Zod và Pino.

Mục tiêu hiện tại của backend là boot theo chuẩn 12-factor: cấu hình được đọc từ môi trường, validate ngay lúc khởi động, fail-fast nếu thiếu hoặc sai biến bắt buộc, và mọi request có `requestId` để truy vết log từ đầu tới cuối.

## Kiến Trúc

Dự án đang đi theo hướng tách lớp đơn giản:

```text
HTTP layer -> Domain layer -> Data layer
```

- `src/http`: controller, nhận request và trả response.
- `src/domain`: service xử lý logic nghiệp vụ.
- `src/data`: repository hoặc adapter làm việc với database/hạ tầng ngoài.
- `src/config`: schema và loader cho typed environment config.
- `src/context`: request context dựa trên `AsyncLocalStorage`.
- `src/middleware`: middleware gắn correlation id cho mỗi request.
- `src/logger.ts`: Pino logger có redact secret và helper `getLogger()`.
- `src/app.module.ts`: cấu hình Nest module và TypeORM.
- `src/main.ts`: bootstrap app, validate env trước khi listen port.

Luồng hiện tại của health check:

```text
GET /health
  -> requestId middleware
  -> HealthController
  -> HealthService
  -> DbRepository.ping()
  -> PostgreSQL SELECT 1
```

## Công Nghệ Chính

- Node.js
- NestJS 11
- TypeScript
- TypeORM
- PostgreSQL
- Zod
- Pino
- Jest
- ESLint
- Prettier

## Cài Đặt

```bash
npm install
```

## Cấu Hình Môi Trường

Tạo file `.env` ở thư mục gốc dự án.

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://postgres:your_postgres_password@localhost:5432/starci_shop
JWT_SECRET=your-super-secret-key
LOG_LEVEL=info
```

Các biến môi trường được định nghĩa tập trung trong `src/config/env.schema.ts`.

| Biến | Bắt buộc | Mô tả |
| --- | --- | --- |
| `NODE_ENV` | Không | `development`, `test`, hoặc `production`. Mặc định `development`. |
| `PORT` | Không | Port HTTP server. Mặc định `3000`. |
| `DATABASE_URL` | Có | PostgreSQL connection string. |
| `JWT_SECRET` | Có | JWT secret, tối thiểu 16 ký tự. |
| `LOG_LEVEL` | Không | `debug`, `info`, `warn`, hoặc `error`. Mặc định `info`. |

App không đọc `process.env.X` rải rác trong codebase. Tất cả env đi qua `loadEnv()` và được validate bằng Zod.

## Typed Config Và Fail-Fast

Khi app khởi động, `loadEnv()` parse `process.env` qua Zod schema. Nếu thiếu hoặc sai biến bắt buộc, app in lỗi rõ ràng và thoát với exit code khác `0`.

Ví dụ smoke test khi thiếu `DATABASE_URL` và `JWT_SECRET`:

```text
[12:02:21 PM] Starting compilation in watch mode...

[12:02:24 PM] Found 0 errors. Watching for file changes.

Invalid environment: [
  {
    expected: 'string',
    code: 'invalid_type',
    path: [ 'DATABASE_URL' ],
    message: 'Invalid input: expected string, received undefined'
  },
  {
    expected: 'string',
    code: 'invalid_type',
    path: [ 'JWT_SECRET' ],
    message: 'Invalid input: expected string, received undefined'
  }
]
```

Điều này giúp app không boot nửa vời khi config database hoặc JWT bị sai.

## Logging Và Request Correlation

App dùng Pino để phát structured logs.

- Dev mode dùng `pino-pretty` để log dễ đọc khi phát triển.
- Production/test không dùng pretty transport, phù hợp cho log JSON machine-readable.
- Logger có `redact` để che thông tin nhạy cảm như authorization header, password và JWT secret.
- Mỗi request có một `requestId`.
- Nếu client gửi header `x-request-id`, app sẽ tái sử dụng id đó.
- Nếu client không gửi, app tự tạo UUID.
- `requestId` được trả lại cho client qua response header `x-request-id`.
- `AsyncLocalStorage` giúp `getLogger()` trong service/repository vẫn lấy đúng logger của request hiện tại.

Ví dụ gọi health check với request id tự truyền vào:

```powershell
curl.exe -i http://localhost:3000/health -H "x-request-id: abc-123"
```

Response:

```http
HTTP/1.1 200 OK
X-Powered-By: Express
x-request-id: abc-123
Content-Type: application/json; charset=utf-8
Content-Length: 15
ETag: W/"f-VaSQ4oDUiZblZNAEkkN+sX+q3Sg"
Date: Sun, 09 Aug 2026 05:03:24 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"status":"ok"}
```

Log dev thực tế:

```text
[12:03:24.397] INFO (27116): request received
    requestId: "abc-123"
    method: "GET"
    url: "/health"
[12:03:24.397] INFO (27116): checking health
    requestId: "abc-123"
[12:03:24.397] INFO (27116): pinging database
    requestId: "abc-123"
[12:03:24.412] INFO (27116): health check passed
    requestId: "abc-123"
```

Như vậy một request có thể được truy vết từ middleware, xuống service, xuống repository bằng cùng một `requestId`.

## Chạy Ứng Dụng

Chạy ở môi trường development với watch mode:

```bash
npm run start:dev
```

Chạy bình thường:

```bash
npm run start
```

Build production:

```bash
npm run build
```

Chạy bản đã build:

```bash
npm run start:prod
```

## API Hiện Có

### Health Check

```http
GET /health
```

Response thành công:

```json
{
  "status": "ok"
}
```

Endpoint này gọi xuống PostgreSQL bằng:

```sql
SELECT 1
```

Nếu database chưa chạy hoặc `DATABASE_URL` sai, health check sẽ lỗi hoặc app sẽ không boot được nếu URL không hợp lệ.

## Smoke Test

### 1. Fail-Fast Khi Thiếu Env

Chạy app khi thiếu biến bắt buộc:

```bash
npm run start:dev
```

Kết quả mong đợi:

```text
Invalid environment: [...]
```

Process thoát, app không mở port.

### 2. Response Có `x-request-id`

```powershell
curl.exe -i http://localhost:3000/health -H "x-request-id: abc-123"
```

Kết quả mong đợi:

```http
HTTP/1.1 200 OK
x-request-id: abc-123

{"status":"ok"}
```

### 3. Log Có Cùng `requestId`

Dev log mong đợi:

```text
request received
    requestId: "abc-123"
checking health
    requestId: "abc-123"
pinging database
    requestId: "abc-123"
health check passed
    requestId: "abc-123"
```

Trong production/test, Pino phát log dạng JSON để các hệ thống như Loki, ELK hoặc CloudWatch dễ ingest.

## Verification

Các tiêu chí typed config, fail-fast, logger redact/JSON và request correlation có test tự động:

- `src/config/env.spec.ts`: chứng minh env được validate/coerce và thiếu biến bắt buộc sẽ `process.exit(1)`.
- `src/logger.spec.ts`: chứng minh Pino dùng `LOG_LEVEL`, production/test không bật pretty transport và có redact secret.
- `src/middleware/request-id.middleware.spec.ts`: chứng minh middleware tái sử dụng `x-request-id`, set response header và giữ child logger trong `AsyncLocalStorage`.

Chạy kiểm tra:

```bash
npm test
npm run build
```

## Scripts

| Lệnh | Chức năng |
| --- | --- |
| `npm run start` | Chạy NestJS app. |
| `npm run start:dev` | Chạy app ở watch mode. |
| `npm run start:debug` | Chạy app ở debug mode. |
| `npm run start:prod` | Chạy file build từ `dist/main`. |
| `npm run build` | Build source TypeScript sang `dist`. |
| `npm run lint` | Chạy ESLint và tự sửa lỗi có thể sửa. |
| `npm run format` | Format source bằng Prettier. |
| `npm run test` | Chạy unit test. |
| `npm run test:watch` | Chạy test ở watch mode. |
| `npm run test:cov` | Chạy test kèm coverage. |
| `npm run test:e2e` | Chạy e2e test. |

## Database

Database được cấu hình bằng TypeORM + PostgreSQL.

Nest runtime khởi tạo một `DataSource`/connection pool singleton lúc app boot thông qua `TypeOrmModule.forRootAsync()` trong `src/app.module.ts`. Các service inject `DataSource` từ Nest DI sẽ dùng chung pool này, không tạo connection mới theo từng request.

Migration CLI dùng `AppDataSource` trong `src/data/database/data-source.ts`. Cả Nest runtime và migration CLI đều dùng chung cấu hình từ `createTypeOrmOptions()` trong `src/data/database/typeorm.options.ts`.

Cấu hình hiện tại:

```ts
synchronize: false
extra: {
  max: 10
}
```

Schema database phải đi qua migration versioned. Không dùng `synchronize: true` cho database dùng chung hoặc production.

## Graceful Shutdown

Trong `src/main.ts`, app có bật:

```ts
app.enableShutdownHooks();
```

Dòng này giúp NestJS gọi lifecycle hook khi process nhận tín hiệu shutdown như `SIGTERM` hoặc `SIGINT`, hữu ích để đóng database connection, queue, cache hoặc tài nguyên nền một cách gọn gàng.

## Ghi Chú Test

E2E test trong `test/app.e2e-spec.ts` gọi `GET /health`, nên cần PostgreSQL đang chạy và `.env` hợp lệ trước khi chạy:

```bash
npm run test:e2e
```
