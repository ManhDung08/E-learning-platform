import React from 'react';
import { useNavigate } from 'react-router-dom';

const formatPrice = (price) => {
    if (price === 0) return 'Free';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

const CourseCard = ({ course }) => {
    const navigate = useNavigate();

    const handleCardClick = () => {
        // LOGIC CHUYỂN HƯỚNG:
        // 1. Kiểm tra xem khóa học có Slug (đường dẫn đẹp) không?
        if (course.slug) {
            // Nếu có -> Chuyển sang: /course/ten-khoa-hoc-slug
            navigate(`/course/${course.slug}`); 
        } else {
            // Nếu không -> Chuyển sang: /course/123 (ID)
            navigate(`/course/${course.id}`);
        }
    };

    const instructorName = course.instructor
        ? `${course.instructor.firstName} ${course.instructor.lastName}`
        : 'Unknown Instructor';

    const instructorAvatar = course.instructor?.profileImageUrl
        || 'https://www.w3schools.com/howto/img_avatar.png';

    return (
        <div 
            onClick={handleCardClick} // <--- ĐÂY LÀ DÒNG QUAN TRỌNG NHẤT
            style={{
                backgroundColor: 'white', borderRadius: '16px', overflow: 'hidden',
                width: '280px', cursor: 'pointer', transition: 'all 0.3s ease',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)', margin: '10px',
                display: 'flex', flexDirection: 'column', height: '360px'
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 20px rgba(0,0,0,0.12)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
            }}
        >
            <div style={{ position: 'relative', paddingTop: '56.25%', backgroundColor: '#f0f0f0' }}>
                <img
                    src={course.image || ''}
                    alt={course.title}
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                />
            </div>

            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <h3 style={{
                    fontSize: '16px', fontWeight: '700', margin: '0 0 8px 0', lineHeight: '1.4',
                    color: '#333', display: '-webkit-box', WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical', overflow: 'hidden', minHeight: '44px'
                }}>
                    {course.title}
                </h3>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <div style={{
                        width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#eee',
                        backgroundImage: `url(${instructorAvatar})`,
                        backgroundSize: 'cover'
                    }} />
                    <p style={{ fontSize: '12px', color: '#666', margin: 0 }}>
                        {instructorName}
                    </p>
                </div>

                <p style={{
                    fontSize: '13px', color: '#888', margin: '0 0 16px 0',
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                    flex: 1
                }}>
                    {course.description}
                </p>

                <div style={{ borderTop: '1px solid #eee', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '15px', fontWeight: '700', color: '#608f4d' }}>
                        {formatPrice(course.priceVND)}
                    </span>

                    <span style={{ fontSize: '12px', color: '#999', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <i className="fa-regular fa-file-lines"></i>
                        {course.modules?.length || 0} bài học
                    </span>
                </div>
            </div>
        </div>
    )
}

export default CourseCard;