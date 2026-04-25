import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api/",
});

// ================= REQUEST =================
api.interceptors.request.use((config) => {
  const access = localStorage.getItem("access_token");
  // Kiểm tra cẩn thận chuỗi "undefined" do lưu lỗi từ trước
  if (access && access !== "undefined") {
    config.headers.Authorization = `Bearer ${access}`;
  }
  return config;
});

// Các biến cờ để xử lý việc nhiều request gọi cùng lúc khi token hết hạn
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// ================= RESPONSE =================
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Không có response → lỗi mạng
    if (!error.response) {
      return Promise.reject(error);
    }

    // Không phải lỗi 401 (Hết hạn Token) → Bỏ qua
    if (error.response.status !== 401) {
      return Promise.reject(error);
    }

    // Tránh loop vô hạn nếu ngay cả request lấy lại token cũng bị 401
    if (originalRequest._retry) {
      return Promise.reject(error);
    }

    const refresh = localStorage.getItem("refresh_token");

    // Không có refresh token hoặc token rác → đá ra login luôn
    if (!refresh || refresh === "undefined") {
      localStorage.clear();
      window.location.href = "/login";
      return Promise.reject(error);
    }

    // Nếu đang có một request khác tiến hành lấy token mới, đưa request này vào hàng đợi
    if (isRefreshing) {
      return new Promise(function (resolve, reject) {
        failedQueue.push({ resolve, reject });
      }).then(token => {
        originalRequest.headers['Authorization'] = 'Bearer ' + token;
        return api(originalRequest);
      }).catch(err => {
        return Promise.reject(err);
      });
    }

    // Đánh dấu request này là đã thử lại và đang tiến hành refresh
    originalRequest._retry = true;
    isRefreshing = true;

    console.log("🔥 Access token hết hạn → đang tự động refresh...");

    try {
      // GỌI REFRESH TOKEN LÊN SERVER
      const res = await axios.post(
        "http://127.0.0.1:8000/api/token/refresh/",
        { refresh }
      );

      // SimpleJWT mặc định trả về {"access": "..."} cho API refresh
      const newAccess = res.data.access;

      console.log("✅ Refresh thành công, không bắt đăng nhập lại");

      // Lưu access mới
      localStorage.setItem("access_token", newAccess);

      // GÁN LẠI TOKEN MỚI CHO REQUEST CŨ
      originalRequest.headers.Authorization = `Bearer ${newAccess}`;

      // Cho phép các request đang kẹt trong hàng đợi chạy tiếp bằng token mới
      processQueue(null, newAccess);

      // GỌI LẠI REQUEST BAN ĐẦU
      return api(originalRequest);

    } catch (err) {
      console.log("❌ Refresh token cũng đã hết hạn hoặc không hợp lệ → Bắt buộc logout");

      // Hủy bỏ các request đang nằm trong hàng đợi
      processQueue(err, null);

      localStorage.clear();
      window.location.href = "/login";

      return Promise.reject(err);
    } finally {
      // Dù thành công hay thất bại thì cũng mở lại cờ cho các lần sau
      isRefreshing = false;
    }
  }
);

export default api;
