# Quy tắc và quy trình xây dựng nền tảng Frontend

Tài liệu này đúc kết từ khung FE của Starci_Shop để làm điểm xuất phát cho các dự án sau. Đây là hướng dẫn theo stack hiện tại: Next.js App Router, React, TypeScript, Tailwind CSS v4 và HeroUI. Khi dự án chọn stack khác, giữ nguyên nguyên tắc tổ chức và thay phần lệnh/công cụ tương ứng.

## 1. Mục tiêu của phần khung

Phần nền tảng cần cung cấp trước các tính năng nghiệp vụ:

- Cấu trúc route và layout dùng chung.
- Quy tắc đặt tên, import và chia sẻ component.
- Điểm cấu hình cho theme, font, metadata và thư viện UI.
- Mẫu xử lý gọi API, trạng thái loading/empty/error và thông báo.
- Các trang mẫu để kiểm tra navigation, tích hợp backend và component nền.

Không đưa logic nghiệp vụ giả vào thành chức năng thật. Trang showcase là nơi kiểm tra trạng thái UI; cần ghi rõ hoặc loại khỏi điều hướng sản phẩm khi bắt đầu phát triển nghiệp vụ.

## 2. Cấu trúc thư mục tham khảo

```text
app/                    # Route, layout và error/loading theo App Router
  components/            # Thành phần chỉ phục vụ app shell, ví dụ header
  <route>/page.tsx       # Mỗi thư mục route có page.tsx
  layout.tsx             # Root layout, metadata, font và app shell
  providers.tsx          # Client providers ở một điểm tập trung
  globals.css            # Import stylesheet và token toàn cục
components/
  ui/                    # Primitive và component UI dùng lại
lib/                     # API client, notify và tiện ích dùng chung
public/                  # Tài nguyên tĩnh
docs/                    # Tài liệu quy ước và hướng dẫn dự án
```

Quy tắc phân loại:

- Đặt route, layout, loading và error theo đúng quy ước của App Router trong `app/`.
- Đặt component chỉ dùng cho header/navigation của app shell trong `app/components/`.
- Đặt component dùng lại giữa nhiều route trong `components/ui/` hoặc nhóm theo miền tính năng khi dự án lớn lên.
- Đặt tích hợp bên ngoài và hàm thuần dùng chung trong `lib/`; tránh nhét API fetch vào component trình bày.
- Tránh tạo thư mục hoặc lớp trừu tượng chỉ có một nơi dùng nếu chưa có lý do rõ ràng.

## 3. Quy tắc code

### TypeScript và React

- Bật `strict: true`; khai báo kiểu dữ liệu cho props, kết quả API và dữ liệu biên.
- Ưu tiên component hàm và export có tên; page/layout dùng default export theo yêu cầu framework.
- Component mặc định là Server Component. Chỉ thêm `"use client";` khi cần state, effect, event handler hoặc API chỉ chạy phía trình duyệt.
- Giữ ranh giới Server/Client nhỏ: đưa tương tác vào component con thay vì biến cả route thành Client Component.
- Dùng `ReactNode` cho children/fallback có thể nhận nội dung React.
- Không dùng `any` để né kiểu; kiểm tra dữ liệu từ API thay vì coi generic là xác thực runtime.

### Tên file và import

- Route theo tên thư mục chữ thường: `app/products/page.tsx`.
- Component React dùng PascalCase cho tên export; file component dùng kebab-case như `header-nav.tsx`.
- Hàm/hằng dùng camelCase; hằng cấu hình dùng UPPER_SNAKE_CASE khi phù hợp.
- Dùng alias `@/*` cho import từ gốc storefront; dùng relative import cho các file gần nhau trong cùng nhóm.
- Gom import theo nhóm: thư viện/framework, alias nội bộ, relative. Không thêm dấu phẩy hoặc xuống dòng không cần thiết.

### UI và style

- Dùng component HeroUI làm nền thống nhất cho button, card, typography, alert, switch, skeleton và toast.
- Dùng Tailwind cho layout, khoảng cách và responsive; tránh style inline trừ giá trị động thật sự.
- Đặt token màu/font toàn cục trong stylesheet dùng chung; mọi theme phải được kiểm tra cùng provider và cấu hình CSS.
- Dùng ngữ nghĩa HTML phù hợp, nhãn có thể đọc được, trạng thái focus rõ và thuộc tính accessibility như `aria-current` cho link điều hướng hiện hành.
- Component UI nhận dữ liệu/hành vi qua props, tránh gắn trực tiếp vào route hay API.

## 4. Layout, provider và điều hướng

- Root layout sở hữu `<html>`, `<body>`, ngôn ngữ, metadata, font, stylesheet và khung chung.
- Đặt provider phía client trong một component riêng như `app/providers.tsx`; bọc ứng dụng tại root layout.
- Chỉ đăng ký provider thực sự dùng. Thứ tự provider phải bảo đảm component con truy cập được context cần thiết.
- Dùng `next/link` cho điều hướng nội bộ và `usePathname` trong client component khi cần trạng thái active.
- Danh sách link nên khai báo tập trung, có key ổn định, và route active cần hỗ trợ accessibility.
- Không nhân bản header/footer trong từng page; route chỉ render nội dung riêng.

## 5. API và cấu hình môi trường

- Tập trung HTTP request dùng chung trong `lib/api.ts` hoặc module tương đương.
- API helper thống nhất base URL, headers, cache policy và thông báo lỗi; nơi gọi quyết định kiểu dữ liệu cụ thể.
- Xử lý riêng lỗi mạng, HTTP không thành công và payload không hợp lệ khi ứng dụng bắt đầu phụ thuộc dữ liệu thật.
- Client-side env phải có tiền tố công khai của framework (hiện tại: `NEXT_PUBLIC_`); không đưa secret vào biến công khai.
- Lưu URL backend trong file môi trường cục bộ, cung cấp file mẫu như `.env.example` không chứa bí mật; không commit `.env.local`.
- Tránh làm ứng dụng lỗi ngay khi module được import nếu cấu hình thiếu trong các trang không gọi API. Có thể kiểm tra cấu hình tại thời điểm gọi hoặc khởi động và cung cấp thông báo rõ.
- Xác định rõ cache/revalidate theo loại dữ liệu. Khung hiện tại chọn `cache: "no-store"` cho API helper; chỉ dùng khi cần dữ liệu mới ở mỗi request.

## 6. Trạng thái giao diện và lỗi

Mỗi tính năng có dữ liệu bất đồng bộ cần xác định đủ các trạng thái phù hợp:

1. Loading: dùng `loading.tsx` hoặc skeleton khớp bố cục nội dung.
2. Empty: giải thích dữ liệu đang trống và đưa hành động tiếp theo nếu có.
3. Error: hiển thị thông báo hữu ích, không làm lộ thông tin nhạy cảm; cho phép thử lại khi có thể.
4. Success: xác nhận kết quả bằng nội dung hoặc toast khi phù hợp.

- Dùng route error boundary của Next.js cho lỗi ở phạm vi route; dùng React Error Boundary cho vùng UI cô lập khi cần.
- Không để Error Boundary thay thế việc xử lý lỗi API hoặc validation của form.
- Dùng một lớp notify thống nhất để tránh các page gọi thư viện toast trực tiếp.
- Không đưa nội dung lỗi nội bộ hoặc URL có thông tin nhạy cảm ra UI production.

## 7. Quy trình khởi tạo FE cho dự án mới

1. **Chốt nền tảng:** xác nhận framework và phiên bản, router, thư viện UI, CSS, package manager và cách deploy.
2. **Khởi tạo cấu hình:** bật TypeScript strict, lint, alias import, CSS pipeline và file env mẫu.
3. **Lập cấu trúc:** tạo root layout, global styles, providers, nhóm component dùng chung và lib.
4. **Tạo app shell:** thiết lập font, metadata, ngôn ngữ, header/footer và responsive container.
5. **Tạo mẫu UI:** button/card wrapper nếu cần thống nhất, empty state, error fallback, skeleton và notify.
6. **Tạo route kiểm tra:** home, một route nghiệp vụ mẫu, trạng thái backend nếu cần và showcase các trạng thái UI.
7. **Kết nối API:** khai báo env, API client và kiểu dữ liệu; xác định cache, xử lý lỗi và ranh giới server/client.
8. **Rà soát accessibility/responsive:** keyboard, focus, nhãn, kích thước màn hình và nội dung tiếng Việt/đa ngôn ngữ.
9. **Kiểm tra lệnh dự án:** chạy lint và build theo script đã khai báo; xử lý lỗi trước khi bắt đầu feature.
10. **Ghi lại quyết định:** cập nhật README, tài liệu quy tắc, biến môi trường cần thiết và lệnh chạy.

## 8. Quy trình thêm một feature/route

1. Xác định route, người dùng, dữ liệu đầu vào/đầu ra và trạng thái thành công/rỗng/lỗi/loading.
2. Đặt `page.tsx` cùng route; tách component dùng lại theo phạm vi sử dụng.
3. Chọn Server Component trước; chỉ tạo client component nhỏ cho tương tác.
4. Đặt gọi API và kiểu dữ liệu tại lớp/module phù hợp; không nhân bản cấu hình fetch.
5. Dùng các thành phần UI nền, style token và ngôn ngữ giao diện nhất quán.
6. Thêm metadata hoặc điều hướng nếu route cần được khám phá.
7. Kiểm tra lint/build theo quy trình nhóm; tự rà soát màn hình hẹp và accessibility.
8. Xóa dữ liệu giả, log tạm, nút không có hành vi và trang showcase khỏi luồng người dùng nếu không còn cần.

## 9. Lệnh và tiêu chí bàn giao

Trong storefront hiện tại:

- `npm run dev`: chạy phát triển.
- `npm run lint`: kiểm tra ESLint.
- `npm run build`: kiểm tra build production.
- `npm run start`: chạy build đã tạo.

Một nền tảng FE sẵn sàng khi:

- Có thể chạy theo README và cấu hình môi trường được mô tả.
- Các route nền tảng render được, điều hướng hoạt động và layout nhất quán.
- Có cách xử lý lỗi/loading/empty phù hợp cho luồng dữ liệu mẫu.
- Lint và build thành công trên môi trường dự án.
- Không có secret trong mã nguồn hoặc file mẫu; tài liệu phản ánh đúng scripts/cấu hình.

## 10. Những điểm cần quyết định lại ở từng dự án

Các lựa chọn sau quan sát được ở Starci_Shop nhưng không bắt buộc cho mọi dự án:

- HeroUI và `next-themes` cho UI/theme.
- `Open Sans`, ngôn ngữ mặc định `vi`, tên và mô tả metadata.
- `NEXT_PUBLIC_API_URL`, route kiểm tra `/health`, cache `no-store`.
- Header có Home/Products/Login/Status và trang `showcase`.
- Container tối đa `max-w-5xl`.

Khi tái sử dụng, thay các giá trị trên theo yêu cầu sản phẩm, backend, thương hiệu và quyết định bảo mật của dự án. Luôn đọc tài liệu đúng phiên bản framework đang cài trước khi dùng API mới hoặc thay đổi cấu trúc. Trong Starci_Shop, `storefront/AGENTS.md` yêu cầu đối chiếu tài liệu Next.js cục bộ trong `node_modules/next/dist/docs/` trước khi sửa mã Next.js.
