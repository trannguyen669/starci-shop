# Xác thực và quản lý phiên

Tài liệu này mô tả cách xác thực đang được triển khai trong Starci Shop: đăng ký, đăng nhập, access token, refresh token, phân quyền và tích hợp storefront. Các endpoint backend đều có tiền tố `/api/v1`.

## 1. Tổng quan

Ứng dụng dùng hai loại token với mục đích khác nhau:

| Token | Thời hạn | Nơi lưu/gửi | Công dụng |
| --- | --- | --- | --- |
| Access token (JWT) | 15 phút | Backend trả trong JSON; client gửi qua `Authorization: Bearer ...` | Xác thực các request tới route được bảo vệ. |
| Refresh token | 7 ngày | Cookie `refreshToken` có `httpOnly`; trình duyệt tự gửi tới auth routes | Đổi access token mới mà không cần nhập lại mật khẩu. |

Access JWT có claim `sub`, `email`, `role`. Refresh token là chuỗi ngẫu nhiên 32 byte ở dạng hex. Backend chỉ lưu SHA-256 hash của refresh token, không lưu token thô. Khi refresh, token cũ bị thu hồi và token mới được phát hành trong cùng một nhóm phiên (`familyId`).

```text
Đăng nhập
  ├─ JSON: accessToken + user
  └─ Set-Cookie: refreshToken (httpOnly, 7 ngày)

Request bảo vệ: Authorization: Bearer <accessToken>
Access hết hạn: POST /api/v1/auth/refresh (trình duyệt gửi cookie)
Đăng xuất mọi phiên: POST /api/v1/auth/logout-all
```

## 2. Các thành phần trong source

| Thành phần | Trách nhiệm |
| --- | --- |
| `backend/src/http/auth.controller.ts` | Khai báo các route auth, đọc request cookie và thiết lập/xóa refresh cookie. |
| `backend/src/domain/auth.service.ts` | Chuẩn hóa email, đăng ký/đăng nhập, cấp JWT, xoay vòng và thu hồi refresh token. |
| `backend/src/domain/password.ts` | Băm/xác minh mật khẩu với Argon2id. |
| `backend/src/domain/refresh-token.ts` | Sinh refresh token ngẫu nhiên và băm SHA-256. |
| `backend/src/data/user/*` | Entity và truy vấn người dùng; password hash chỉ được lấy rõ ràng trong truy vấn đăng nhập. |
| `backend/src/data/refresh-token/*` | Entity và thao tác lưu/tìm/thu hồi refresh token. |
| `backend/src/http/jwt.strategy.ts` | Đọc bearer JWT, xác minh chữ ký/hạn và ánh xạ claim sang `request.user`. |
| `backend/src/http/jwt-auth.guard.ts` | Bảo vệ route bằng Passport JWT strategy. |
| `backend/src/http/roles.guard.ts` / `roles.decorator.ts` | Từ chối người dùng chưa có role cần thiết. |
| `backend/src/http/register.dto.ts` / `login.dto.ts` | Kiểm tra body đăng ký và đăng nhập. |
| `backend/src/http/all-exceptions.filter.ts` | Chuẩn hóa cấu trúc JSON cho lỗi HTTP. |
| `backend/src/main.ts` | Cài cookie parser, CORS, validation, prefix `/api/v1` và exception filter. |

## 3. Quy tắc dữ liệu và xác thực đầu vào

### Email

DTO dùng `IsEmail`. Trước khi truy vấn/lưu, service gọi `trim()` và `toLowerCase()`, vì vậy email có khoảng trắng đầu/cuối hoặc chữ hoa được chuẩn hóa về dạng thường. Cột email có ràng buộc unique trong database.

### Mật khẩu

- Đăng ký: chuỗi từ 8 đến 128 ký tự.
- Đăng nhập: chuỗi từ 1 đến 128 ký tự.
- Mật khẩu được băm bằng Argon2id trước khi lưu. Backend không lưu mật khẩu dạng rõ.
- Entity đánh dấu `passwordHash` là `select: false`. `UserRepository.findByEmailWithPasswordHash()` chủ động thêm cột này để xác minh đăng nhập; truy vấn người dùng bình thường không lấy hash.

### Role

`UserRole` hiện có `user` và `admin`. Entity đặt mặc định `user`; endpoint đăng ký không nhận role từ body. Role được đưa vào access JWT lúc phát hành. Người dùng chỉ nên được cấp quyền admin qua thao tác quản trị dữ liệu đáng tin cậy, không qua dữ liệu do client gửi.

## 4. Hợp đồng API

### 4.1 Đăng ký — `POST /api/v1/auth/register`

Request:

```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "at-least-8-characters"
}
```

Response thành công: `201 Created`.

```json
{
  "id": "<user-uuid>",
  "email": "user@example.com",
  "role": "user"
}
```

Service thực hiện theo thứ tự: chuẩn hóa email, tìm email đã tồn tại, băm mật khẩu bằng Argon2id, tạo user. Endpoint chỉ tạo tài khoản; nó không tự đăng nhập và không phát token.

Nếu email đã tồn tại, service ném `409 Conflict` với message `EMAIL_TAKEN`. Nếu body sai validation, phản hồi là `400 Bad Request` (xem mục lỗi).

### 4.2 Đăng nhập — `POST /api/v1/auth/login`

Request:

```json
{
  "email": "user@example.com",
  "password": "your-password"
}
```

Response thành công: `200 OK`.

```json
{
  "accessToken": "<signed-jwt>",
  "user": {
    "id": "<user-uuid>",
    "email": "user@example.com",
    "role": "user"
  }
}
```

Ngoài JSON, response đặt cookie:

| Thuộc tính | Giá trị hiện tại |
| --- | --- |
| Tên | `refreshToken` |
| `HttpOnly` | `true` |
| `Secure` | `true` khi `NODE_ENV === 'production'`, ngược lại `false` |
| `SameSite` | `Lax` |
| `Path` | `/api/v1/auth` |
| `Max-Age` | 7 ngày, mili giây trong cấu hình Express |

Nếu email không tồn tại hoặc mật khẩu sai, cả hai trường hợp cùng trả `401 Unauthorized`, message `INVALID_CREDENTIALS`. Dùng chung lỗi tránh tiết lộ email nào đã đăng ký. Mỗi lần đăng nhập thành công tạo `familyId` mới và refresh token đầu tiên cho family đó.

### 4.3 Làm mới token — `POST /api/v1/auth/refresh`

Request không cần body. Trình duyệt phải gửi cookie `refreshToken`:

```http
POST /api/v1/auth/refresh
Cookie: refreshToken=<opaque-token>
```

Response `200 OK` có cấu trúc access token và user giống đăng nhập. Backend cũng đặt lại cookie `refreshToken` bằng refresh token mới.

Quy trình phía server:

1. Đọc cookie `refreshToken`; nếu không có, trả `401 MISSING_REFRESH_TOKEN`.
2. Băm token nhận được bằng SHA-256 và tìm hash trong bảng `refresh_tokens`.
3. Không tìm thấy thì trả `401 INVALID_REFRESH_TOKEN`.
4. Nếu token đã bị thu hồi, coi là token bị dùng lại; thu hồi toàn bộ token trong family rồi trả `401 TOKEN_REUSE_DETECTED`.
5. Nếu token hết hạn, đánh dấu token đó đã thu hồi rồi trả `401 REFRESH_TOKEN_EXPIRED`.
6. Đánh dấu token hiện tại đã thu hồi, tải user, rồi phát hành access JWT mới và refresh token mới cùng `familyId`.

Nếu user của token không còn tồn tại, backend thu hồi family và trả `401 INVALID_REFRESH_TOKEN`.

**Lưu ý về request đồng thời:** rotation chỉ cho phép sử dụng mỗi refresh token một lần. Nếu nhiều request refresh cùng gửi một cookie cũ, request đến sau có thể bị xem là replay và làm thu hồi cả family. Client nên chỉ chạy một thao tác refresh tại một thời điểm (single-flight), rồi chia sẻ access token mới cho các request đang chờ.

### 4.4 Người dùng hiện tại — `GET /api/v1/auth/me`

Request:

```http
GET /api/v1/auth/me
Authorization: Bearer <accessToken>
```

Response thành công:

```json
{
  "id": "<user-uuid>",
  "email": "user@example.com",
  "role": "user"
}
```

`JwtAuthGuard` gọi strategy `jwt`. Passport lấy bearer token từ header, kiểm tra chữ ký bằng `JWT_SECRET` và từ chối token hết hạn. `validate()` ánh xạ `{ sub, email, role }` thành `{ id, email, role }` và Passport gắn vào `request.user`. Controller trả object này.

Endpoint này trả thông tin từ JWT, không truy vấn lại user trong database. Vì vậy thay đổi email/role hoặc trạng thái user sau khi phát hành token không cập nhật trong token đang có; claim cũ còn hiệu lực cho tới khi JWT hết hạn.

### 4.5 Đăng xuất mọi phiên — `POST /api/v1/auth/logout-all`

Request cần access bearer hợp lệ:

```http
POST /api/v1/auth/logout-all
Authorization: Bearer <accessToken>
```

Backend đánh dấu mọi refresh token có `userId` tương ứng là revoked, xóa cookie cùng `Path=/api/v1/auth`, rồi trả `200 OK`:

```json
{
  "success": true
}
```

Route này yêu cầu access token còn hợp lệ. Các access JWT đã cấp không được đưa vào denylist nên có thể dùng cho tới hạn 15 phút. Nếu cần đăng xuất tức thời khỏi mọi API, cần bổ sung cơ chế thu hồi access JWT hoặc kiểm tra phiên/user ở mỗi request.

### 4.6 Route yêu cầu role

`AdminController` áp dụng `JwtAuthGuard` và `RolesGuard` cho controller. `GET /api/v1/admin/stats` yêu cầu role `admin` qua `@Roles('admin')`:

- Không có/không hợp lệ access token: `401 Unauthorized`.
- Token hợp lệ nhưng role không nằm trong danh sách cho phép: `403 Forbidden`, message `FORBIDDEN`.
- Role được đọc từ claim token; nâng/hạ role trong database không đổi claim cho đến khi người dùng đăng nhập hoặc refresh để phát hành JWT mới.

## 5. Cấu trúc lưu trữ refresh token

Bảng `refresh_tokens` có các trường:

| Trường | Ý nghĩa |
| --- | --- |
| `id` | UUID định danh bản ghi. |
| `familyId` | UUID gom chuỗi refresh token bắt nguồn từ một lần đăng nhập. |
| `userId` | UUID người dùng sở hữu phiên. |
| `tokenHash` | SHA-256 dạng hex, dài 64 ký tự; có unique index. |
| `revoked` | Đánh dấu token đã dùng hoặc bị thu hồi. |
| `expiresAt` | Thời điểm hết hạn, lưu `timestamptz`. |

Migration `AddRefreshTokensAndRoles` tạo bảng, unique index cho token hash, index cho family và thêm role vào users với mặc định `user`. `synchronize` TypeORM đang tắt; database cần được cập nhật bằng migration hiện có trước khi dùng các route mới.

Refresh token thô chỉ xuất hiện trong cookie gửi cho trình duyệt và trong bộ nhớ xử lý request cấp token; không ghi vào response JSON hay database. Việc lưu hash giúp giảm tác động nếu bảng token bị lộ: giá trị trong DB không thể gửi trực tiếp làm refresh request.

## 6. Validation và định dạng lỗi

`main.ts` bật global `ValidationPipe` với `whitelist: true`, `forbidNonWhitelisted: true`, `transform: true`:

- Thuộc tính không nằm trong DTO bị từ chối, không âm thầm bỏ qua.
- Email/password không đạt validator trả lỗi `400`.
- Controller auth dùng `@Res({ passthrough: true })`, vì vậy có thể set cookie và vẫn để Nest gửi JSON response.

`AllExceptionsFilter` trả envelope:

```json
{
  "statusCode": 401,
  "error": "REQUEST_ERROR",
  "message": "INVALID_CREDENTIALS"
}
```

Quy ước hiện tại:

| Tình huống | HTTP | `error` | `message` |
| --- | ---: | --- | --- |
| Validation thất bại | 400 | `VALIDATION_FAILED` | `Validation failed`; `details` chứa danh sách lỗi validator. |
| Email đã đăng ký | 409 | `REQUEST_ERROR` | `EMAIL_TAKEN` |
| Credentials sai | 401 | `REQUEST_ERROR` | `INVALID_CREDENTIALS` |
| Refresh cookie thiếu | 401 | `REQUEST_ERROR` | `MISSING_REFRESH_TOKEN` |
| Refresh token không tồn tại | 401 | `REQUEST_ERROR` | `INVALID_REFRESH_TOKEN` |
| Refresh token hết hạn | 401 | `REQUEST_ERROR` | `REFRESH_TOKEN_EXPIRED` |
| Phát hiện dùng lại token | 401 | `REQUEST_ERROR` | `TOKEN_REUSE_DETECTED` |
| Thiếu/sai/hết hạn access JWT | 401 | `REQUEST_ERROR` | Message Passport/Nest tương ứng. |
| Không đủ role | 403 | `REQUEST_ERROR` | `FORBIDDEN` |
| Lỗi server ngoài dự kiến | 500 | `INTERNAL_ERROR` | `Unexpected error` |

Các chuỗi `message` là mã lỗi hiện được ném từ service/controller. Client nên dựa vào status và message khi cần xử lý cụ thể, đồng thời có fallback cho mã mới.

## 7. Cấu hình backend và khởi động

Các biến môi trường được kiểm tra bởi `envSchema`:

| Biến | Quy tắc | Mục đích |
| --- | --- | --- |
| `NODE_ENV` | `development`, `test` hoặc `production`; mặc định `development` | Quyết định môi trường và thuộc tính `Secure` của cookie. |
| `PORT` | Số nguyên dương; mặc định `3000` | Cổng HTTP backend. |
| `DATABASE_URL` | URL PostgreSQL hợp lệ | Kết nối database. |
| `JWT_SECRET` | Chuỗi tối thiểu 16 ký tự | Ký và xác minh access JWT. |
| `LOG_LEVEL` | `debug`, `info`, `warn`, `error`; mặc định `info` | Cấp log. |

Ví dụ `.env` phát triển (thay thông tin kết nối phù hợp):

```dotenv
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/starci_shop
JWT_SECRET=replace_with_a_random_secret_of_at_least_16_chars
LOG_LEVEL=info
```

`JWT_SECRET` phải là giá trị ngẫu nhiên mạnh, ổn định giữa các instance backend và khác nhau giữa môi trường. Thay secret sẽ khiến JWT đã phát hành không còn xác minh được. Không đặt secret trong biến `NEXT_PUBLIC_*`, mã storefront hoặc repository.

JWT được ký qua `JwtModule` với `expiresIn: 15 * 60` giây. `JwtStrategy` tải cùng secret qua `loadEnv()` và đặt `ignoreExpiration: false`. `main.ts` cài `cookie-parser` trước các route, bật CORS cho origin `http://localhost:3001` với `credentials: true`, và thiết lập global prefix `api/v1`.

## 8. Tích hợp storefront

`storefront/lib/api.ts` hiện:

1. Lấy base URL từ `NEXT_PUBLIC_API_URL` và báo lỗi nếu chưa cấu hình.
2. Đặt `Content-Type: application/json` khi request có body và chưa khai báo header.
3. Trong browser, đọc `accessToken` từ `localStorage` rồi gắn bearer header.
4. Gửi `credentials: "include"` để browser nhận/gửi refresh cookie.
5. Tắt cache với `cache: "no-store"`.

Login form lưu `accessToken` và `user` vào `localStorage`, phát event `auth-changed`, sau đó điều hướng về trang chủ. Register form chỉ gọi đăng ký; người dùng cần đăng nhập riêng.

### Trình tự client nên dùng

1. Gửi `POST /api/v1/auth/login` với email/password và `credentials: "include"`.
2. Lưu access token và user từ JSON theo chính sách lưu trữ của ứng dụng; cookie refresh do browser quản lý.
3. Gửi access token trong bearer header với mỗi request cần xác thực.
4. Khi gặp `401` do access token hết hạn, gọi `POST /api/v1/auth/refresh` với credentials. Nếu thành công, thay access token rồi thử lại request ban đầu đúng một lần.
5. Nếu refresh thất bại, xóa trạng thái đăng nhập phía client và yêu cầu đăng nhập lại.
6. Khi người dùng chọn đăng xuất mọi nơi, gọi `/api/v1/auth/logout-all` trước khi xóa local state.

Client cần đảm bảo chỉ có một refresh request đồng thời. Đồng thời, `apiFetch` hiện chưa tự refresh/retry; các bước 4–5 là hành vi tích hợp cần bổ sung ở client, không phải năng lực đang có trong hàm hiện tại.

### CORS, cookie và triển khai

Origin CORS hiện được hard-code thành `http://localhost:3001`. Khi triển khai frontend ở domain khác, backend phải cho phép đúng origin đó và tiếp tục bật credentials; không thể dùng wildcard origin với credential cookie. Cookie hiện `SameSite=Lax`. Nếu frontend và API được triển khai trên các site khác nhau, có thể cần `SameSite=None; Secure` cùng cấu hình CORS/HTTPS phù hợp. Cookie production chỉ được gửi qua HTTPS vì `Secure` bật trong production.

`NEXT_PUBLIC_API_URL` phải trỏ tới backend (ví dụ `http://localhost:3000/api/v1`, tùy cách ghép URL trong ứng dụng). `apiFetch` nối base URL với path được truyền, ví dụ `"/auth/login"`.

## 9. Giới hạn triển khai hiện tại cần biết

- Chỉ có `logout-all`, chưa có endpoint thu hồi một phiên riêng lẻ.
- Refresh token hết hạn sau 7 ngày cố định; không có sliding/absolute lifetime riêng ngoài việc mỗi token mới được cấp thêm hạn 7 ngày.
- Access JWT không có cơ chế thu hồi chủ động; hết hạn sau 15 phút.
- `/auth/me` chỉ dựa trên claim, không kiểm tra user còn tồn tại hoặc role hiện tại trong DB.
- Storefront lưu access token trong `localStorage`; mã chạy trên trang có thể đọc giá trị này. XSS có thể làm lộ access token. Refresh cookie được bảo vệ bằng `httpOnly`, nhưng cần cân nhắc CSRF và cấu hình same-site khi kiến trúc domain thay đổi.
- CORS hiện chỉ cho phép `http://localhost:3001`; đây là cấu hình phát triển cụ thể, không tự thích ứng domain triển khai.
- Refresh rotation hiện không dùng transaction bao quanh việc thu hồi token cũ và lưu token mới. Khi có lỗi giữa các thao tác hoặc request đồng thời, client có thể phải đăng nhập lại; cần cân nhắc transaction/đồng bộ nếu yêu cầu độ bền cao hơn.
- Kiểm tra email trùng trong service trước khi insert; database unique constraint vẫn là chốt cuối nếu hai đăng ký cùng email xảy ra đồng thời.

## 10. Checklist khi thay đổi auth

- Nếu thay đổi thời hạn access token, cập nhật cấu hình `JwtModule` và tài liệu/client refresh behavior.
- Nếu thay đổi thời hạn refresh token, đồng bộ TTL trong `AuthService` và `REFRESH_COOKIE_MAX_AGE` trong controller.
- Nếu thay đổi cookie name/path/same-site/secure, sửa đồng thời nơi set, đọc, clear cookie, CORS và client.
- Nếu thêm claim JWT, cập nhật kiểu payload, `validate()`, kiểu `request.user` và tài liệu response.
- Nếu thêm role, cập nhật `UserRole`, cách gán role đáng tin cậy, guard/decorator và policy của endpoint.
- Nếu thay đổi entity/migration, chạy migration trên database trước khi deploy backend phụ thuộc schema mới.
- Không trả `passwordHash`, raw refresh token hoặc `JWT_SECRET` trong API/log.
