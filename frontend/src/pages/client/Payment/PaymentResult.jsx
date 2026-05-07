import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Navbar from '../../../components/layout/Navbar';
import './PaymentResult.css';

export default function PaymentResult() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [isSuccess, setIsSuccess] = useState(false);

    useEffect(() => {
        // Khang xử lý: VNPay trả về mã vnp_ResponseCode = '00' là thành công
        const responseCode = searchParams.get('vnp_ResponseCode');
        if (responseCode === '00') {
            setIsSuccess(true);
        } else {
            setIsSuccess(false);
        }
    }, [searchParams]);

    return (
        <div className="result-page">
            <Navbar />
            <div className="result-container">
                <div className="result-card">
                    {isSuccess ? (
                        <div className="status-content">
                            <div className="icon success">✔️</div>
                            <h1>Thanh toán thành công!</h1>
                            <p>Cảm ơn Hà đã tin tưởng <strong>H2KT</strong>. Tour của bạn đã được xác nhận và hệ thống đang xử lý vé.</p>
                        </div>
                    ) : (
                        <div className="status-content">
                            <div className="icon error">❌</div>
                            <h1>Thanh toán thất bại</h1>
                            <p>Có lỗi xảy ra trong quá trình giao dịch hoặc bạn đã hủy thanh toán. Vui lòng thử lại hoặc liên hệ hỗ trợ.</p>
                        </div>
                    )}
                    
                    <div className="result-actions">
                        <button className="btn-home" onClick={() => navigate('/')}>
                            Quay về trang chủ
                        </button>
                        {!isSuccess && (
                            <button className="btn-retry" onClick={() => navigate(-1)}>
                                Thử lại
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}