# TourGo Project Overview

## 1. Cấu trúc thư mục toàn bộ

TOURGO/
├── .gitignore
├── README.md
├── TourBooking.sql
├── .git/ (git repo metadata)
├── .vscode/
│ └── settings.json
├── backend/
│ ├── manage.py
│ ├── requirements.txt
│ ├── seed.py
│ ├── TK_Khanh.md
│ ├── venv/ (Python virtual environment)
│ ├── bookings/
│ │ ├── **init**.py
│ │ ├── admin.py
│ │ ├── apps.py
│ │ ├── migrations/
│ │ │ └── **pycache**/
│ │ ├── models.py
│ │ ├── tests.py
│ │ └── views.py
│ ├── core/
│ │ ├── **init**.py
│ │ ├── asgi.py
│ │ ├── settings.py
│ │ ├── urls.py
│ │ └── wsgi.py
│ ├── tours/
│ │ ├── **init**.py
│ │ ├── admin.py
│ │ ├── apps.py
│ │ ├── migrations/
│ │ │ ├── 0001_initial.py
│ │ │ ├── 0002_transaction.py
│ │ │ ├── 0003_payment_revenue.py
│ │ │ ├── 0004_alter_booking_status.py
│ │ │ ├── 0005_alter_booking_status.py
│ │ │ ├── **init**.py
│ │ │ └── **pycache**/
│ │ ├── models.py
│ │ ├── permissions.py
│ │ ├── serializers.py
│ │ ├── tests.py
│ │ ├── urls.py
│ │ └── views.py
│ └── users/
│ ├── **init**.py
│ ├── admin.py
│ ├── apps.py
│ ├── migrations/
│ │ ├── 0001_initial.py
│ │ ├── **init**.py
│ │ └── **pycache**/
│ ├── models.py
│ ├── serializers.py
│ ├── tests.py
│ ├── urls.py
│ └── views.py
├── frontend/
│ ├── .gitignore
│ ├── eslint.config.js
│ ├── index.html
│ ├── package-lock.json
│ ├── package.json
│ ├── README.md
│ ├── node_modules/ (frontend dependencies)
│ ├── vite.config.js
│ └── src/
│ ├── App.jsx
│ ├── main.jsx
│ ├── api/
│ │ ├── axios.js
│ │ ├── axiosClient.js
│ │ └── tourApi.js
│ ├── assets/
│ ├── components/
│ │ ├── common/
│ │ │ └── Header/
│ │ │ ├── Header.css
│ │ │ └── Header.jsx
│ │ ├── layout/
│ │ │ ├── Navbar.css
│ │ │ ├── Navbar.jsx
│ │ │ ├── SidebarFilter.css
│ │ │ └── SidebarFilter.jsx
│ │ └── tour/
│ │ ├── ImageUploadModal.css
│ │ ├── ImageUploadModal.jsx
│ │ └── ToursPage.jsx
│ └── pages/
│ ├── auth/
│ │ ├── ForgotPassword.css
│ │ ├── ForgotPassword.jsx
│ │ ├── Login.css
│ │ ├── Login.jsx
│ │ ├── Register.css
│ │ └── Register.jsx
│ └── client/
│ ├── Contact/
│ │ ├── Contact.css
│ │ └── Contact.jsx
│ ├── Home.css
│ ├── Home.jsx
│ ├── Introduce.css
│ ├── Introduce.jsx
│ ├── MyOrders/
│ │ ├── MyOrders.css
│ │ └── MyOrders.jsx
│ ├── Payment/
│ │ ├── PaymentResult.css
│ │ ├── PaymentResult.jsx
│ │ ├── PaymentSelection.css
│ │ └── PaymentSelection.jsx
│ ├── Profile.css
│ ├── Profile.jsx
│ ├── SearchResult/
│ │ ├── SearchResult.css
│ │ └── SearchResult.jsx
│ └── TourDetail/
│ ├── TourDetail.css
│ └── TourDetail.jsx

## 2. Mô tả dự án

TourGo là một ứng dụng web du lịch gồm backend Django và frontend React/Vite.

- Backend nằm trong `backend/`.
  - Dùng Django project `core` với cấu hình, URL, WSGI, ASGI.
  - Có 3 app chính:
    - `bookings`: xử lý đặt tour, đặt chỗ và liên quan booking.
    - `tours`: quản lý tour, transaction, payment, revenue và permission.
    - `users`: quản lý người dùng và xác thực.
  - File `manage.py` dùng để chạy server, migrate, seed dữ liệu.
  - `requirements.txt` chứa dependencies Python.
  - `seed.py` có thể dùng để khởi tạo dữ liệu mẫu.

- Frontend nằm trong `frontend/`.
  - Dùng React với Vite.
  - `src/App.jsx` là entry component, `src/main.jsx` là điểm khởi tạo React.
  - API client và endpoints nằm trong `src/api/`.
  - Components chung nằm trong `src/components/` gồm header, navbar, sidebar bộ lọc, và modal upload ảnh.
  - Giao diện client phân thành nhiều trang trong `src/pages/`:
    - `auth/`: đăng nhập, đăng ký, quên mật khẩu.
    - `client/`: trang chính, giới thiệu, profile, giỏ hàng/đơn hàng, thanh toán, tìm kiếm và chi tiết tour.

- Tài liệu và cấu hình dự án có thể bao gồm:
  - `README.md` ở root và `frontend/README.md`.
  - `.vscode/settings.json` cấu hình môi trường làm việc.
  - `TourBooking.sql` có thể là script cơ sở dữ liệu.

## 3. Prompt mô tả dự án để dùng với AI

"TourGo là một dự án web du lịch full-stack. Backend sử dụng Django với 3 app chính: bookings, tours, users. Frontend sử dụng React với Vite, gồm các trang authentication, home, profile, booking/order, payment, search result và tour detail. API client nằm trong `frontend/src/api/`, các component giao diện chung nằm trong `frontend/src/components/`, và layout chính được quản lý qua `frontend/src/pages/`. Dự án có cấu trúc rõ ràng giữa backend và frontend, dễ mở rộng tính năng booking, payment và quản lý người dùng."
