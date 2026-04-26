import axiosClient from './axiosClient';

// Lấy danh sách tất cả tour (Khang đã làm)
export const getTours = async() => {
    const response = await axiosClient.get('tours/');
    return response.data;
};

// Lấy chi tiết 1 tour dựa trên ID (Hà dùng cái này)
export const getTourById = async(id) => {
    const response = await axiosClient.get(`tours/${id}/`);
    return response.data;
};
// gọi API xử lí thông báo người dùng (Hà làm)
export const createBooking = async(data) => {
    // Phải gửi kèm Token trong Header để Tân xác thực
    const response = await axiosClient.post('/bookings/', data);
    return response.data;
};

// Upload nhiều ảnh cho tour (Nhiệm vụ Khang)
export const uploadTourImages = async(tourId, files) => {
    const formData = new FormData();
    // Gắn các file vào field 'images' giống như Backend đang chờ
    files.forEach(file => {
        formData.append('images', file);
    });

    const token = localStorage.getItem('access_token');

    const response = await axiosClient.post(`tours/${tourId}/upload-images/`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
        },
    });
    return response.data;
};