import React from 'react';
import { 
  Box, Container, Paper, Accordion, AccordionSummary, AccordionDetails, 
  Rating, Chip, Divider, Button 
} from '@mui/material';
import { 
  ExpandMore, PlayCircleOutline, Star, 
  AccessTime, Group, Update, Language, AllInclusive 
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

// --- MOCK DATA ---
const mockCourseData = {
  id: 1,
  title: "Fullstack Web Development with React & Node.js",
  description: "Khóa học toàn diện giúp bạn trở thành lập trình viên Fullstack. Học cách xây dựng ứng dụng web hiện đại từ Frontend đến Backend sử dụng các công nghệ mới nhất.",
  priceVND: 1299000,
  image: "https://images.unsplash.com/photo-1587620962725-abab7fe55159?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
  updatedAt: "2023-11-15T08:00:00Z",
  instructor: {
    firstName: "Huy",
    lastName: "Duong",
    profileImageUrl: "https://i.pravatar.cc/150?img=11" // Avatar mẫu
  },
  modules: [
    {
      id: 1, title: "Giới thiệu & Cài đặt môi trường", order: 1,
      lessons: [
        { id: 101, title: "Giới thiệu khóa học", durationSeconds: 300 },
        { id: 102, title: "Cài đặt VS Code & Node.js", durationSeconds: 600 },
      ]
    },
    {
      id: 2, title: "Kiến thức React căn bản", order: 2,
      lessons: [
        { id: 201, title: "Components & Props", durationSeconds: 1200 },
        { id: 202, title: "State & Lifecycle", durationSeconds: 1500 },
        { id: 203, title: "Handling Events", durationSeconds: 900 },
      ]
    },
    {
      id: 3, title: "Kết nối Backend Prisma", order: 3,
      lessons: [
        { id: 301, title: "Khởi tạo Project Express", durationSeconds: 1800 },
      ]
    }
  ],
  reviews: [
    { id: 1, rating: 5, comment: "Khóa học rất chi tiết, giảng viên dạy dễ hiểu!", userId: 101 },
    { id: 2, rating: 4, comment: "Nội dung tốt nhưng cần thêm bài tập thực hành.", userId: 102 },
    { id: 3, rating: 5, comment: "Tuyệt vời!", userId: 103 },
  ],
  _count: { enrollments: 1245 }
};

// --- HELPER FUNCTIONS ---
const calculateTotalDuration = (modules) => {
  let totalSeconds = 0;
  modules.forEach(mod => mod.lessons.forEach(l => totalSeconds += (l.durationSeconds || 0)));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  return hours > 0 ? `${hours} giờ ${minutes} phút` : `${minutes} phút`;
};

const calculateRating = (reviews) => {
  if (!reviews || reviews.length === 0) return 0;
  return (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1);
};

const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

// --- MAIN COMPONENT ---
const CourseDetailPage = () => {
  const course = mockCourseData;
  const navigate = useNavigate();
  const totalDuration = calculateTotalDuration(course.modules);
  const totalLessons = course.modules.reduce((acc, mod) => acc + mod.lessons.length, 0);
  const avgRating = calculateRating(course.reviews);

  // Component Sidebar (Tách ra để tái sử dụng cho Mobile/Desktop)
  const SidebarContent = () => (
    <Paper elevation={4} className="overflow-hidden rounded-none border border-white">
      {/* Video Preview */}
      <div className="relative aspect-video bg-black cursor-pointer group">
        <img src={course.image} alt={course.title} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-white rounded-full p-2 group-hover:scale-110 transition-transform">
             <PlayCircleOutline color="primary" sx={{ fontSize: 40 }} />
          </div>
        </div>
        <div className="absolute bottom-4 left-0 w-full text-center text-white font-bold">Xem trước khóa học</div>
      </div>

      <div className="p-5 text-gray-800">
        <div className="text-3xl font-bold mb-4">
          {course.priceVND === 0 ? "Miễn phí" : formatCurrency(course.priceVND)}
        </div>
        
        <Button 
          variant="contained" 
          fullWidth 
          size="large"
          className="!bg-[#a435f0] hover:!bg-[#8710d8] !font-bold !py-3 !text-lg !mb-3"
          onClick={() => navigate(`/course/${course.id}/checkout`)}
        >
          Đăng ký ngay
        </Button>
        
        <p className="text-xs text-center text-gray-500 mb-4">Đảm bảo hoàn tiền trong 7 ngày</p>
        
        <div className="space-y-3">
          <p className="font-bold text-sm">Khóa học bao gồm:</p>
          <ul className="text-sm space-y-2 text-gray-600">
            <li className="flex items-center gap-2"><AccessTime fontSize="small"/> {totalDuration} video bài giảng</li>
            <li className="flex items-center gap-2"><AllInclusive fontSize="small"/> Truy cập trọn đời</li>
            <li className="flex items-center gap-2"><Language fontSize="small"/> Ngôn ngữ: Tiếng Việt</li>
            <li className="flex items-center gap-2"><Group fontSize="small"/> {course._count.enrollments} học viên</li>
          </ul>
        </div>
      </div>
    </Paper>
  );

  return (
    <div className="bg-white min-h-screen pb-20 font-sans">
      
      {/* --- HERO SECTION --- */}
      {/* Dùng relative để làm điểm neo cho Sidebar Desktop */}
      <div className="bg-[#1c1d1f] text-white py-8 relative">
        <Container maxWidth="lg" className="relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* LEFT CONTENT (Thông tin khóa học) */}
            <div className="lg:col-span-8 z-0">
              {/* Breadcrumb */}
              <div className="text-[#cec0fc] text-sm font-bold mb-4 flex items-center gap-2">
                <span>Khám phá</span> 
                <span className="text-xs text-white">/</span>
                <span>Lập trình Web</span>
                <span className="text-xs text-white">/</span>
                <span>Backend</span>
              </div>

              <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight font-serif">
                {course.title}
              </h1>

              <p className="text-lg mb-6 max-w-2xl text-gray-200">
                {course.description}
              </p>

              {/* Badges */}
              <div className="flex flex-wrap items-center gap-4 mb-4 text-sm">
                <div className="flex items-center bg-[#eceb98] text-[#3d3c0a] px-2 py-1 rounded font-bold">
                  <span className="mr-1">{avgRating}</span>
                  <Star fontSize="inherit" />
                </div>
                <span className="text-[#cec0fc] underline cursor-pointer">({course.reviews.length} đánh giá)</span>
                <span>{course._count.enrollments.toLocaleString()} học viên</span>
              </div>

              <div className="text-sm mb-2">
                Giảng viên: <span className="text-[#cec0fc] underline cursor-pointer">{course.instructor.firstName} {course.instructor.lastName}</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-300">
                <Update fontSize="small" />
                <span>Cập nhật lần cuối: {new Date(course.updatedAt).toLocaleDateString('vi-VN')}</span>
              </div>
            </div>

            {/* SIDEBAR FOR DESKTOP (Overlapping) */}
            {/* Logic: Ẩn trên mobile/tablet, Hiện trên lg. Absolute position để đè lên */}
            <div className="hidden lg:block lg:col-span-4 relative">
               <div className="absolute top-0 right-0 w-[340px] z-10 shadow-2xl">
                 <SidebarContent />
               </div>
            </div>

          </div>
        </Container>
      </div>

      {/* --- SIDEBAR FOR MOBILE (Nằm dưới Header) --- */}
      <div className="lg:hidden p-4">
         <SidebarContent />
      </div>

      {/* --- MAIN CONTENT BODY --- */}
      <Container maxWidth="lg" className="mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Column (Chiếm 2/3 bên trái trên desktop) */}
          <div className="lg:col-span-8">
            
            {/* What you'll learn (Box màu xám) */}
            <div className="border border-gray-300 p-6 mb-8">
              <h2 className="text-xl font-bold mb-4">Bạn sẽ học được gì</h2>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-700">
                 <li className="flex gap-2"><span className="text-gray-400">✓</span> Xây dựng Fullstack App hoàn chỉnh</li>
                 <li className="flex gap-2"><span className="text-gray-400">✓</span> Làm chủ React Hooks & Redux</li>
                 <li className="flex gap-2"><span className="text-gray-400">✓</span> Thiết kế CSDL với Prisma & SQL</li>
                 <li className="flex gap-2"><span className="text-gray-400">✓</span> Deploy ứng dụng lên Vercel/Render</li>
              </ul>
            </div>

            {/* Course Content (Accordion) */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Nội dung khóa học</h2>
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                 <span>{course.modules.length} phần • {totalLessons} bài học • {totalDuration}</span>
                 <span className="text-blue-700 font-bold cursor-pointer">Mở rộng tất cả</span>
              </div>
              
              <div className="border border-gray-200">
                {course.modules.map((module) => (
                  <Accordion key={module.id} disableGutters square elevation={0} className="border-b border-gray-200 last:border-b-0">
                    <AccordionSummary expandIcon={<ExpandMore />} className="bg-[#f7f9fa] hover:bg-gray-100">
                      <div className="font-bold text-gray-800 w-full flex justify-between mr-2">
                        <span>{module.title}</span>
                        <span className="text-xs font-normal text-gray-500 mt-1">{module.lessons.length} bài</span>
                      </div>
                    </AccordionSummary>
                    <AccordionDetails className="!p-0">
                      <ul className="bg-white">
                        {module.lessons.map((lesson) => (
                          <li key={lesson.id} className="flex justify-between items-center py-3 px-4 hover:bg-gray-50 cursor-pointer text-sm text-gray-600">
                            <div className="flex items-center gap-3">
                              <PlayCircleOutline fontSize="small" className="text-gray-400" />
                              <span>{lesson.title}</span>
                            </div>
                            <span>{Math.floor(lesson.durationSeconds / 60)}:{String(lesson.durationSeconds % 60).padStart(2, '0')}</span>
                          </li>
                        ))}
                      </ul>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </div>
            </div>

            {/* Instructor */}
            <div className="mb-8">
               <h2 className="text-2xl font-bold mb-4">Giảng viên</h2>
               <div className="flex gap-4">
                  <div className="w-24 h-24 rounded-full overflow-hidden border border-gray-200 shrink-0">
                    <img src={course.instructor.profileImageUrl} alt="Instructor" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <div className="text-[#a435f0] font-bold text-lg hover:underline cursor-pointer">
                      {course.instructor.firstName} {course.instructor.lastName}
                    </div>
                    <p className="text-gray-500 text-sm mb-2">Senior Fullstack Developer</p>
                    <div className="flex gap-3 text-xs">
                       <span className="flex items-center gap-1"><Star fontSize="inherit"/> {avgRating} Đánh giá</span>
                       <span className="flex items-center gap-1"><Group fontSize="inherit"/> {course._count.enrollments} Học viên</span>
                    </div>
                    <p className="mt-3 text-sm text-gray-700">
                       Huy là một kỹ sư phần mềm với 5 năm kinh nghiệm làm việc tại các công ty công nghệ lớn. Anh đam mê chia sẻ kiến thức về lập trình Web hiện đại.
                    </p>
                  </div>
               </div>
            </div>

            {/* Reviews */}
            <div>
               <h2 className="text-2xl font-bold mb-4">Đánh giá từ học viên</h2>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {course.reviews.map((review) => (
                     <div key={review.id} className="border-t border-gray-200 py-4">
                        <div className="flex items-center gap-3 mb-2">
                           <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-white font-bold text-xs">
                              U{review.userId}
                           </div>
                           <div>
                              <div className="font-bold text-sm">Học viên hệ thống</div>
                              <Rating value={review.rating} readOnly size="small" />
                           </div>
                        </div>
                        <p className="text-gray-600 text-sm">"{review.comment}"</p>
                     </div>
                  ))}
               </div>
            </div>

          </div>
          
          {/* Right Column (Placeholder for Layout Integrity) */}
          <div className="hidden lg:block lg:col-span-4">
             {/* Cột này để trống để giữ chỗ (spacing) cho Sidebar 'absolute' ở trên không che mất nội dung bên dưới khi scroll */}
          </div>

        </div>
      </Container>
    </div>
  );
};

export default CourseDetailPage;