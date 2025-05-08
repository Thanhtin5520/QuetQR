# Barcode Scanner Web App

Ứng dụng web cho phép quét mã vạch từ điện thoại và hiển thị trên máy tính, tương tự như Barcode to PC.

## Tính năng

- Quét mã vạch từ điện thoại
- Hiển thị mã vạch realtime trên máy tính
- Lưu lịch sử quét vào database
- Xem lịch sử quét theo phiên
- Xóa lịch sử quét
- Giao diện thân thiện với người dùng
- Hỗ trợ đa thiết bị

## Cài đặt

1. Clone repository:
```bash
git clone [URL_REPOSITORY]
cd barcode-scanner-web
```

2. Cài đặt dependencies:
```bash
npm install
```

3. Khởi động server:
```bash
npm start
```

4. Truy cập ứng dụng:
- Trên máy tính: http://localhost:3000
- Trên điện thoại: Quét mã QR hiển thị trên trang web máy tính

## Yêu cầu

- Node.js
- npm
- Trình duyệt web hiện đại
- Camera trên điện thoại

## Công nghệ sử dụng

- Node.js
- Express
- Socket.IO
- SQLite
- HTML5 QR Code Scanner
- Bootstrap 5

## Cấu trúc dự án

```
barcode-scanner-web/
├── public/
│   ├── index.html      # Trang chính (máy tính)
│   └── scanner.html    # Trang quét mã vạch (điện thoại)
├── server.js           # Server Node.js
├── package.json        # Dependencies
└── README.md          # Tài liệu
```

## Đóng góp

Mọi đóng góp đều được hoan nghênh! Vui lòng tạo issue hoặc pull request để đóng góp.

## Giấy phép

MIT 