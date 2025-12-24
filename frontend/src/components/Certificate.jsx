import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getCertificateByIdAction } from '../Redux/Certificate/certificate.action';
import './Certificate.css';

export default function Certificate() {
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { certificate, loading, error } = useSelector((state) => state.certificate);
  const certificateId = searchParams.get('id');

  useEffect(() => {
    // Nếu có ID trong URL params, gọi API để lấy certificate
    if (certificateId) {
      dispatch(getCertificateByIdAction(certificateId));
    }
  }, [certificateId, dispatch]);

  // Format dữ liệu từ API hoặc fallback về URL params/default
  const certificateData = certificate
    ? {
        name: certificate.user
          ? `${certificate.user.firstName || ''} ${certificate.user.lastName || ''}`.trim() || certificate.user.username
          : 'Tên Học Viên',
        course: certificate.course?.title || 'Tên Khóa Học',
        date: certificate.issuedAt
          ? new Date(certificate.issuedAt).toLocaleDateString('vi-VN')
          : new Date().toLocaleDateString('vi-VN'),
        code: `CERT-${certificate.id || '2025-001'}`,
        instructor: searchParams.get('instructor') || 'Giảng viên', // Backend chưa trả về instructor name
      }
    : {
        name: searchParams.get('name') || 'Tên Học Viên',
        course: searchParams.get('course') || 'Tên Khóa Học',
        date: searchParams.get('date') || new Date().toLocaleDateString('vi-VN'),
        code: searchParams.get('code') || 'CERT-2025-001',
        instructor: searchParams.get('instructor') || 'Giảng viên',
      };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const element = document.querySelector('.certificate-card');
    const html2pdf = window.html2pdf;
    
    if (html2pdf) {
      const options = {
        margin: 10,
        filename: `certificate-${certificateData.code}.pdf`,
        image: { type: 'png', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { orientation: 'landscape', unit: 'mm', format: 'a4' }
      };
      html2pdf().set(options).from(element).save();
    } else {
      alert('Vui lòng thêm thư viện html2pdf để tải PDF');
      handlePrint();
    }
  };

  // Hiển thị loading state
  if (certificateId && loading) {
    return (
      <div className="certificate-container">
        <div style={{ color: '#fff', fontSize: '18px' }}>Đang tải chứng chỉ...</div>
      </div>
    );
  }

  // Hiển thị error state
  if (certificateId && error) {
    return (
      <div className="certificate-container">
        <div style={{ color: '#fff', fontSize: '18px', textAlign: 'center' }}>
          <p>Lỗi: {error}</p>
          <button
            onClick={() => navigate(-1)}
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              backgroundColor: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
            }}
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="certificate-container">
      <div className="certificate-actions">
        <button className="btn btn-print" onClick={handlePrint}>
          🖨️ In
        </button>
        <button className="btn btn-download" onClick={handleDownload}>
          📥 Tải PDF
        </button>
      </div>

      <div className="certificate-card">
        <div className="certificate-header">
          <h1 className="certificate-title">CHỨNG CHỈ</h1>
          <div className="certificate-subtitle">Certificate of Completion</div>
        </div>

        <div className="certificate-body">
          <p className="certificate-text">
            Xác nhận rằng
          </p>
          
          <h2 className="certificate-name">{certificateData.name}</h2>
          
          <p className="certificate-text">
            đã hoàn thành thành công khóa học
          </p>
          
          <h3 className="certificate-course">{certificateData.course}</h3>

          <div className="certificate-footer">
            <p className="certificate-quote">
              "Hành động là bước đầu tiên để thành công. Bạn đã chứng minh rằng bạn có quyết tâm học hỏi và phát triển bản thân."
            </p>
            <p className="certificate-meta">
              {certificateData.instructor} • {certificateData.date}
            </p>
          </div>
        </div>

        <div className="certificate-seal">
          <div className="seal-circle">✓</div>
        </div>
      </div>
    </div>
  );
}
