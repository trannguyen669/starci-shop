# StarCi Shop Backend

Backend API cho dự án StarCi Shop, được xây dựng bằng NestJS, TypeScript, TypeORM và PostgreSQL.

## Kiến trúc

Dự án đang đi theo hướng tách lớp đơn giản:

```text
HTTP layer -> Domain layer -> Data layer
```

- `src/http`: controller, nhận request và trả response.
- `src/domain`: service xử lý logic nghiệp vụ.
- `src/data`: repository hoặc adapter làm việc với database/hạ tầng ngoài.
- `src/app.module.ts`: cấu hình module chính, dependency injection, config và database.
- `src/main.ts`: bootstrap NestJS application.

Luồng hiện tại của health check:

```text
GET /health
  -> HealthController
  -> HealthService
  -> DbRepository.ping()
  -> PostgreSQL SELECT 1
```

## Công nghệ chính

- Node.js
- NestJS 11
- TypeScript
- TypeORM
- PostgreSQL
- Jest
- ESLint
- Prettier

## Yêu cầu môi trường

- Node.js đã cài sẵn.
- PostgreSQL đang chạy.
- Database đã được tạo trước khi chạy app.

Ví dụ database mặc định theo file `.env` hiện tại:

```text
starci_shop
```

## Cài đặt

```bash
npm install
```

## Cấu hình môi trường

Tạo file `.env` ở thư mục gốc dự án:

```env
PORT=3000

DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_postgres_password
DB_DATABASE=starci_shop
```

Ý nghĩa các biến:

| Biến | Mô tả |
| --- | --- |
| `PORT` | Port HTTP server sẽ lắng nghe. Mặc định trong code là `3000` nếu không cấu hình. |
| `DB_HOST` | Host PostgreSQL. |
| `DB_PORT` | Port PostgreSQL. |
| `DB_USERNAME` | Username kết nối database. |
| `DB_PASSWORD` | Password kết nối database. |
| `DB_DATABASE` | Tên database của ứng dụng. |

## Chạy ứng dụng

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

## API hiện có

### Health check

Kiểm tra server và kết nối database:

```http
GET /health
```

Response thành công: `200 OK`

```json
{
  "status": "ok"
}
```

Smoke test nhanh:

```bash
curl http://localhost:3000/health
```

Endpoint này sẽ gọi xuống PostgreSQL bằng câu query:

```sql
SELECT 1
```

Vì vậy nếu database chưa chạy hoặc cấu hình database sai, `/health` sẽ lỗi.

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

Database được cấu hình trong `TypeOrmModule.forRootAsync()` tại `src/app.module.ts`.

Hiện tại app dùng:

```ts
synchronize: true
autoLoadEntities: true
```

Lưu ý: `synchronize: true` tiện khi phát triển local, nhưng không nên bật ở production vì TypeORM có thể tự thay đổi schema database.

## Graceful shutdown

Trong `src/main.ts`, app có bật:

```ts
app.enableShutdownHooks();
```

Dòng này giúp NestJS gọi các lifecycle hook khi process nhận tín hiệu shutdown như `SIGTERM` hoặc `SIGINT`. Nó hữu ích để đóng kết nối database, queue, cache hoặc các tài nguyên nền một cách gọn gàng.

## Ghi chú test

E2E test trong `test/app.e2e-spec.ts` gọi `GET /health`, nên cần PostgreSQL đang chạy và file `.env` đúng cấu hình database trước khi chạy `npm run test:e2e`.
