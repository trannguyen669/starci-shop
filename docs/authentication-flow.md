# Quy trình xác thực

Tài liệu này mô tả quy trình xác thực đang được triển khai trong backend Starci Shop và cung cấp checklist để áp dụng mô hình tương tự cho dự án NestJS khác.

## Các thành phần

| Thành phần | Trách nhiệm |
| --- | --- |
| `AuthController` | Cung cấp các endpoint HTTP để đăng ký, đăng nhập và lấy thông tin người dùng hiện tại. |
| `AuthService` | Chuẩn hóa email, kiểm tra thông tin đăng nhập, băm mật khẩu và cấp access token. |
| `UserRepository` | Đọc và ghi dữ liệu người dùng. Truy vấn đăng nhập chủ động lấy thêm password hash. |
| `password.ts` | Cung cấp các hàm băm và xác minh mật khẩu. |
| `JwtStrategy` | Trích xuất, xác minh bearer token và tạo đối tượng người dùng đã xác thực. |
| `JwtAuthGuard` | Chặn các route được bảo vệ nếu JWT strategy không chấp nhận token. |
| `LoginDto` / `RegisterDto` | Định nghĩa và kiểm tra dữ liệu body của các endpoint xác thực. |
| `AppModule` | Đăng ký các module TypeORM, Passport và JWT. |

## Các endpoint HTTP

### Đăng ký: `POST /auth/register`

Body được kiểm tra bởi `RegisterDto`, gồm email và mật khẩu. Service thực hiện:

1. Xóa khoảng trắng ở đầu/cuối email và chuyển email thành chữ thường.
2. Kiểm tra email sau chuẩn hóa đã được đăng ký chưa.
3. Nếu email đã tồn tại, ném `ConflictException('EMAIL_TAKEN')`.
4. Băm mật khẩu bằng `hashPassword()` và chỉ lưu chuỗi hash.
5. Trả về `id` và `email` của người dùng mới; không trả mật khẩu hoặc hash.

### Đăng nhập: `POST /auth/login`

Body được kiểm tra bởi `LoginDto`, gồm email và mật khẩu. Service thực hiện:

1. Chuẩn hóa email giống như khi đăng ký.
2. Gọi `findByEmailWithPasswordHash()` để tìm người dùng và chủ động lấy password hash.
3. Dùng `verifyPassword()` so sánh mật khẩu vừa nhập với hash đã lưu.
4. Nếu không tìm thấy user hoặc mật khẩu không khớp, trả cùng lỗi `UnauthorizedException('INVALID_CREDENTIALS')`. Dùng chung một lỗi giúp tránh tiết lộ thông tin đăng nhập nào sai.
5. Ký JWT có payload `sub: user.id` và `email: user.email`, sau đó trả về `{ accessToken }`.

Password hash chỉ cần thiết bên trong backend để xác minh đăng nhập. Không đưa hash vào response API hoặc payload JWT.

### Người dùng hiện tại: `GET /auth/me`

Route này sử dụng `@UseGuards(JwtAuthGuard)`. Client gửi access token trong header:

```http
Authorization: Bearer <accessToken>
```

Nếu token hợp lệ và chưa hết hạn, Passport gọi `JwtStrategy.validate()`. Hàm này ánh xạ payload của token thành `{ id, email }`; Passport gắn object đó vào `request.user`. Controller trả về `request.user`. Nếu token bị thiếu, không hợp lệ hoặc hết hạn, request bị từ chối trước khi chạy hàm controller.

## Cấu hình JWT

`JwtModule.register()` được cấu hình với:

- `secret: env.JWT_SECRET`: khóa bí mật của backend dùng để ký token và xác minh chữ ký.
- `signOptions.expiresIn: 15 * 60`: thời hạn token là 900 giây (15 phút).

`JwtStrategy` tải cùng khóa bí mật thông qua `loadEnv()`, lấy bearer token từ header Authorization và đặt `ignoreExpiration: false`. Giá trị secret phải giống nhau khi ký và xác minh token. Hãy lưu secret trong cấu hình môi trường backend, dùng giá trị ngẫu nhiên đủ mạnh, không đưa vào mã chạy trên trình duyệt hoặc commit lên Git.

## Luồng request và response

```text
Form đăng ký                   Backend
     |                            |
     | POST /auth/register        |
     |--------------------------->| chuẩn hóa email, kiểm tra trùng,
     |                            | băm mật khẩu, lưu người dùng
     |<---------------------------| trả id và email

Form đăng nhập                 Backend
     |                            |
     | POST /auth/login           |
     |--------------------------->| tìm user và password hash,
     |                            | xác minh mật khẩu, ký JWT
     |<---------------------------| trả accessToken

Request cần xác thực           Backend
     |                            |
     | Authorization: Bearer JWT  |
     |--------------------------->| guard chạy JWT strategy,
     |                            | xác minh chữ ký và thời hạn
     |                            | validate() gắn request.user
     |<---------------------------| controller trả dữ liệu user
```

## Áp dụng mô hình này cho dự án NestJS khác

1. **Tạo entity người dùng.** Lưu email đã chuẩn hóa với ràng buộc duy nhất và password hash. Nếu ORM hỗ trợ, cấu hình để hash không được lấy trong truy vấn thông thường; tạo truy vấn riêng chủ động lấy hash khi đăng nhập.
2. **Thêm hàm xử lý mật khẩu.** Cài đặt `hashPassword(password)` và `verifyPassword(hash, password)` bằng thuật toán băm phù hợp cho mật khẩu. Không lưu hoặc so sánh mật khẩu dạng văn bản thuần.
3. **Thêm DTO.** Định nghĩa dữ liệu request đăng ký và đăng nhập, kiểm tra email/mật khẩu tại lớp HTTP.
4. **Cài đặt repository.** Cung cấp hàm kiểm tra email tồn tại, tạo user, và tìm theo email đã chuẩn hóa kèm password hash chỉ phục vụ xác thực.
5. **Cài đặt authentication service.** Đăng ký cần chuẩn hóa email, ngăn email trùng, băm mật khẩu và lưu user. Đăng nhập cần chuẩn hóa email, lấy hash, xác minh thông tin rồi trả token đã ký. Dùng cùng một lỗi chung khi user không tồn tại hoặc mật khẩu sai.
6. **Cấu hình JWT và Passport.** Đăng ký `JwtModule` với secret lấy từ cấu hình môi trường và thời hạn token. Đăng ký `PassportModule`. Đảm bảo strategy dùng cùng secret và được thêm vào providers của module chứa các route xác thực.
7. **Tạo JWT strategy và guard.** Trích xuất bearer token, từ chối token hết hạn, và để `validate()` chỉ trả các thông tin định danh/claim mà handler cần. Áp dụng guard cho các route cần bảo vệ.
8. **Tạo các route controller.** Thêm endpoint đăng ký, đăng nhập và endpoint lấy user hiện tại có bảo vệ nếu dự án cần. Có thể đặt rõ HTTP 200 cho đăng nhập bằng `@HttpCode(HttpStatus.OK)`.
9. **Cấu hình môi trường và kết nối module.** Cung cấp `JWT_SECRET` cho backend runtime, đăng ký controllers/providers và bảo đảm module xác thực được import vào root module.
10. **Kết nối client.** Gửi thông tin đăng nhập qua HTTPS, lưu access token theo thiết kế bảo mật của ứng dụng và gửi token dạng bearer khi gọi endpoint được bảo vệ. Không bao giờ gửi secret ký JWT cho client.

## Ghi chú triển khai

- `AuthenticatedRequest` là kiểu TypeScript mô tả cấu trúc `request.user`. Nó không xác thực request hoặc tự gắn `user`; guard và strategy thực hiện việc đó khi chạy ứng dụng.
- Claim `sub` trong JWT chứa ID người dùng. `validate()` ánh xạ `sub` thành `request.user.id`.
- Endpoint lấy user hiện tại trả về danh tính được ghi trong token. Nếu ứng dụng cần trạng thái mới nhất từ database (ví dụ email đã đổi hoặc tài khoản bị vô hiệu hóa), hãy tải user từ database trong lúc xác thực hoặc trong service thay vì chỉ tin vào claim trong token.
- Access token 15 phút giới hạn khoảng thời gian token bị đánh cắp còn có thể sử dụng, nhưng không cung cấp cơ chế làm mới hoặc thu hồi token. Chỉ bổ sung các luồng đó nếu ứng dụng có nhu cầu.
