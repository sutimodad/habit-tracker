# HabitFlow - Habit Tracker cho gia đình

Web app theo dõi thói quen hàng ngày cho các thành viên trong gia đình.

## Chạy ứng dụng

### 1. Cài đặt dependencies

```bash
# Server
cd server
npm install

# Client
cd ../client
npm install
```

### 2. Chạy development

Mở 2 terminal:

```bash
# Terminal 1: Server (port 3001)
cd server
npm run dev

# Terminal 2: Client (port 5173)
cd client
npm run dev
```

Mở trình duyệt: http://localhost:5173

### 3. Build production

```bash
cd client
npm run build

cd ../server
NODE_ENV=production npm start
```

## Tính năng

- Quản lý thành viên gia đình
- Tạo & quản lý thói quen (hàng ngày / tùy chỉnh)
- Check-in hàng ngày
- Streak & thống kê (heatmap, biểu đồ)
- Bảng xếp hạng gia đình
- Nhắc nhở thói quen (Browser Notification)

## Tech Stack

- **Frontend**: React + Vite + TailwindCSS
- **Backend**: Node.js + Express
- **Database**: SQLite (better-sqlite3)
