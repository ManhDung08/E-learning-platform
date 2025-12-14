// phần này không dùng nữa
import React, { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import TwitterIcon from '@mui/icons-material/Twitter';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import StarIcon from '@mui/icons-material/Star';

const instructorData = [
  {
    id: 1,
    name: "Kristin Watson",
    title: "Người sáng lập & Giảng viên",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=687&q=80",
    rating: 4.9,
    reviews: 153,
    courses: 30,
    experience: "10 năm",
    graduated: "Có",
    languages: "Tiếng Anh, Tiếng Pháp",
    about: "Kristin Watson bắt đầu sự nghiệp của mình với tư cách là một kỹ sư phần mềm tại thung lũng Silicon trước khi chuyển hướng sang giáo dục. Với hơn một thập kỷ kinh nghiệm thực chiến, cô đã từng tham gia xây dựng kiến trúc hệ thống cho các tập đoàn tài chính lớn và các startup kỳ lân.\n\nPhong cách giảng dạy của Kristin nổi tiếng với phương châm 'Code Less, Think More'. Cô không chỉ dạy học viên cách viết mã, mà còn dạy cách tư duy như một kỹ sư hệ thống thực thụ. Các bài giảng của cô luôn đi sâu vào bản chất vấn đề, từ cách quản lý bộ nhớ, tối ưu hóa thuật toán cho đến việc thiết kế các hệ thống có khả năng mở rộng cao (Scalable Systems).\n\nNgoài giờ lên lớp, Kristin thường xuyên là diễn giả chính tại các hội nghị công nghệ quốc tế như TechCrunch Disrupt và Google I/O. Cô tin rằng công nghệ là công cụ mạnh mẽ nhất để thay đổi thế giới và sứ mệnh của cô là trao công cụ đó vào tay thế hệ trẻ.",
    certification: "• Tiến sĩ Khoa học Máy tính – Đại học Harvard (2015)\n• Chứng chỉ Professional Scrum Master II (PSM II)\n• AWS Certified Solutions Architect – Professional\n• Giải thưởng 'Women in Tech' - Lãnh đạo truyền cảm hứng năm 2021"
  },
  {
    id: 2,
    name: "Brooklyn Simmons",
    title: "Người sáng lập & Giảng viên",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=687&q=80",
    rating: 4.8,
    reviews: 120,
    courses: 24,
    experience: "8 năm",
    graduated: "Có",
    languages: "Tiếng Anh, Tiếng Tây Ban Nha",
    about: "Brooklyn là một chuyên gia Full-stack Developer với niềm đam mê mãnh liệt dành cho JavaScript và hệ sinh thái React. Trước khi trở thành giảng viên, anh từng là Lead Developer tại một công ty thương mại điện tử đa quốc gia, nơi anh chịu trách nhiệm tối ưu hóa trải nghiệm người dùng cho hàng triệu lượt truy cập mỗi ngày.\n\nĐiểm đặc biệt trong các khóa học của Brooklyn là sự thẳng thắn và thực dụng. Anh loại bỏ hoàn toàn các lý thuyết sách vở khô khan, thay vào đó là các dự án thực tế 'sống còn'. Học viên của anh sẽ được trải nghiệm quy trình phát triển phần mềm hiện đại: từ việc setup môi trường CI/CD, viết Unit Test, cho đến việc deploy ứng dụng lên Cloud.\n\nBrooklyn cũng là một người đóng góp tích cực cho cộng đồng nguồn mở (Open Source). Anh tin rằng chia sẻ kiến thức là cách tốt nhất để học hỏi, và anh luôn khuyến khích học viên của mình tham gia vào các dự án cộng đồng ngay từ những ngày đầu.",
    certification: "• Thạc sĩ Giáo dục Công nghệ – Đại học Stanford\n• Meta Certified Frontend Developer Professional\n• MongoDB Certified Developer Associate\n• Chứng chỉ Node.js Application Development (OpenJS Foundation)"
  },
  {
    id: 3,
    name: "Robert Fox",
    title: "Người sáng lập & Giảng viên",
    image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=687&q=80",
    rating: 5.0,
    reviews: 200,
    courses: 45,
    experience: "12 năm",
    graduated: "Có",
    languages: "Tiếng Anh",
    about: "Robert Fox được mệnh danh là 'Phù thủy dữ liệu' trong giới Data Science. Với 12 năm kinh nghiệm làm việc với Big Data, Machine Learning và Deep Learning, Robert đã từng cố vấn chiến lược dữ liệu cho nhiều công ty trong danh sách Fortune 500.\n\nKhóa học của Robert không dành cho những người yếu tim. Anh đi sâu vào toán học đằng sau các thuật toán, giúp học viên hiểu rõ cơ chế hoạt động của Neural Networks, Natural Language Processing (NLP) và Computer Vision. Tuy nhiên, anh luôn biết cách biến những công thức phức tạp trở nên dễ hình dung thông qua các ví dụ thực tế như: dự đoán giá nhà đất, phân tích cảm xúc khách hàng hay xây dựng hệ thống gợi ý phim.\n\nPhương châm của Robert là: 'Dữ liệu không bao giờ nói dối, chỉ có người phân tích chưa đủ sâu'. Anh cam kết đào tạo ra những Data Scientist không chỉ giỏi kỹ thuật mà còn có tư duy phản biện sắc bén.",
    certification: "• Google Professional Data Engineer Certification\n• Microsoft Certified: Azure AI Engineer Associate\n• TensorFlow Developer Certificate\n• Tiến sĩ Thống kê học ứng dụng – MIT"
  },
  {
    id: 4,
    name: "Wade Warren",
    title: "Người sáng lập & Giảng viên",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=687&q=80",
    rating: 4.7,
    reviews: 98,
    courses: 15,
    experience: "5 năm",
    graduated: "Có",
    languages: "Tiếng Anh, Tiếng Đức",
    about: "Wade Warren là một nhà thiết kế sản phẩm (Product Designer) theo đuổi chủ nghĩa tối giản (Minimalism). Anh tin rằng một thiết kế tốt là một thiết kế 'vô hình' – nơi người dùng có thể tương tác một cách tự nhiên mà không cần suy nghĩ.\n\nCác khóa học của Wade tập trung mạnh mẽ vào tư duy Design Thinking và quy trình User-Centered Design (UCD). Anh hướng dẫn học viên từ khâu nghiên cứu người dùng (User Research), xây dựng Wireframe, tạo Prototype cho đến việc thực hiện Usability Testing. Wade không chỉ dạy cách sử dụng công cụ như Figma hay Sketch, mà anh dạy cách giải quyết vấn đề của người dùng thông qua ngôn ngữ hình ảnh.\n\nVới kinh nghiệm làm việc tại các agency thiết kế hàng đầu Châu Âu, Wade mang đến một góc nhìn hiện đại, tinh tế và đầy tính nhân văn trong từng bài giảng. Anh luôn nhấn mạnh tầm quan trọng của tính tiếp cận (Accessibility) trong thiết kế hiện đại.",
    certification: "• Chứng chỉ UX Management – Nielsen Norman Group (NN/g)\n• Google UX Design Professional Certificate\n• Adobe Certified Professional in Visual Design\n• Thành viên hiệp hội thiết kế AIGA"
  },
  {
    id: 5,
    name: "Bessie Cooper",
    title: "Người sáng lập & Giảng viên",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=1170&q=80",
    rating: 4.6,
    reviews: 80,
    courses: 12,
    experience: "6 năm",
    graduated: "Có",
    languages: "Tiếng Anh",
    about: "Bessie Cooper từng giữ vị trí Giám đốc Sáng tạo (Creative Director) tại một trong những công ty quảng cáo lớn nhất New York trước khi bén duyên với nghề giáo. Cô là người kết nối hoàn hảo giữa nghệ thuật truyền thống và thiết kế kỹ thuật số.\n\nTrong lớp học của Bessie, sự sáng tạo không có giới hạn. Cô khuyến khích học viên phá vỡ các quy tắc thông thường về bố cục, màu sắc và typography để tìm ra tiếng nói riêng của mình. Tuy nhiên, mọi sự phá cách đều phải dựa trên nền tảng vững chắc của nguyên lý thị giác mà cô dày công truyền đạt.\n\nBessie chia sẻ: 'Thiết kế không chỉ là làm cho đẹp, mà là kể một câu chuyện'. Cô giúp học viên hiểu cách xây dựng bộ nhận diện thương hiệu (Branding Identity) mạnh mẽ và cách truyền tải cảm xúc thông qua hình ảnh. Học viên của cô hiện đang làm việc tại các studio danh tiếng trên khắp thế giới.",
    certification: "• Cử nhân Mỹ thuật (BFA) – Rhode Island School of Design (RISD)\n• Certified Brand Specialist\n• Giải thưởng Cannes Lions hạng mục Digital Craft (2019)\n• Chứng chỉ Advanced Typography – The Futur"
  },
  {
    id: 6,
    name: "Ronald Richards",
    title: "Người sáng lập & Giảng viên",
    image: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=880&q=80",
    rating: 4.9,
    reviews: 180,
    courses: 32,
    experience: "9 năm",
    graduated: "Có",
    languages: "Tiếng Anh, Tiếng Bồ Đào Nha",
    about: "Ronald Richards là minh chứng sống cho việc 'biến điều phức tạp thành đơn giản'. Xuất thân là một lập trình viên tự học, Ronald hiểu rõ hơn ai hết những khó khăn, bế tắc mà người mới bắt đầu (newbie) thường gặp phải.\n\nPhương pháp sư phạm của Ronald tập trung vào việc chia nhỏ vấn đề. Anh không bao giờ ném cho học viên một đống code rối rắm. Thay vào đó, anh dẫn dắt họ đi từng bước nhỏ: từ việc hiểu cú pháp, luồng dữ liệu, cho đến việc debug lỗi. Ronald chuyên trị các ngôn ngữ backend như Java, C# và Python, đồng thời cũng rất mạnh về kiến trúc Microservices.\n\nNgoài kiến thức kỹ thuật, Ronald còn chia sẻ rất nhiều về kỹ năng mềm: cách viết CV, cách phỏng vấn xin việc và cách làm việc nhóm trong môi trường Agile/Scrum. Anh được học viên yêu mến gọi là 'Người anh cả' trong làng code.",
    certification: "• AWS Certified Solutions Architect – Associate\n• Oracle Certified Professional: Java SE 11 Developer\n• Microsoft Certified: DevOps Engineer Expert\n• Certified Kubernetes Administrator (CKA)"
  },
  {
    id: 7,
    name: "Guy Hawkins",
    title: "Người sáng lập & Giảng viên",
    image: "https://images.unsplash.com/photo-1531384441138-2736e62e0919?auto=format&fit=crop&w=687&q=80",
    rating: 4.9,
    reviews: 135,
    courses: 28,
    experience: "10 năm",
    graduated: "Có",
    languages: "Tiếng Anh, Tiếng Pháp",
    about: "Guy Hawkins là một chuyên gia chiến lược kinh doanh với tư duy sắc bén về tối ưu hóa vận hành. Anh đã có 10 năm kinh nghiệm làm việc với tư cách là Business Analyst (BA) cấp cao cho các tập đoàn bán lẻ và logistic hàng đầu.\n\nKhóa học của Guy là cầu nối giữa kỹ thuật và kinh doanh. Anh dạy học viên cách lấy yêu cầu (Requirement Gathering), cách mô hình hóa quy trình nghiệp vụ (BPMN) và quan trọng nhất là cách giao tiếp hiệu quả với các bên liên quan (Stakeholders). Guy tin rằng một dự án thành công không chỉ nhờ code giỏi, mà nhờ việc giải quyết đúng bài toán kinh doanh.\n\nCác case study trong lớp của Guy đều được lấy từ thực tế khốc liệt của thương trường. Học viên sẽ được học cách phân tích SWOT, quản lý rủi ro và tính toán ROI (Return on Investment) cho các dự án công nghệ. Đây là những kỹ năng sống còn cho bất kỳ ai muốn thăng tiến lên vị trí quản lý.",
    certification: "• Thạc sĩ Quản trị Kinh doanh (MBA) – Wharton School\n• Project Management Professional (PMP)®\n• Certified Business Analysis Professional (CBAP)\n• Lean Six Sigma Black Belt"
  },
  {
    id: 8,
    name: "Floyd Miles",
    title: "Người sáng lập & Giảng viên",
    image: "https://images.unsplash.com/photo-1463453091185-61582044d556?auto=format&fit=crop&w=1170&q=80",
    rating: 4.5,
    reviews: 60,
    courses: 10,
    experience: "4 năm",
    graduated: "Có",
    languages: "Tiếng Anh",
    about: "Floyd Miles là một gương mặt trẻ đầy triển vọng trong ngành Digital Marketing. Dù tuổi đời còn trẻ, nhưng Floyd đã kịp ghi dấu ấn với hàng loạt chiến dịch Growth Hacking giúp các startup tăng trưởng người dùng 300% chỉ trong vài tháng.\n\nFloyd không dạy marketing theo kiểu lý thuyết suông. Anh dạy 'Marketing thực chiến'. Học viên sẽ được học cách đốt tiền quảng cáo sao cho ra đơn, cách tối ưu hóa SEO để lên top Google, và cách xây dựng content viral trên TikTok và Facebook. Anh nắm rất vững các thuật toán của mạng xã hội và luôn cập nhật những xu hướng mới nhất.\n\nPhong cách của Floyd rất năng động, nhanh nhẹn và đôi khi hơi 'quái'. Anh khuyến khích học viên thử nghiệm (A/B Testing) liên tục và không ngại thất bại. Với Floyd, dữ liệu (Data) là vua, và mọi quyết định marketing đều phải dựa trên các con số biết nói.",
    certification: "• Google Ads Search & Display Certification\n• Meta Certified Digital Marketing Associate\n• HubSpot Content Marketing Certification\n• Google Analytics Individual Qualification (GAIQ)"
  }
];

const InstructorDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('About');

    const instructor = instructorData.find(i => i.id === parseInt(id)) || instructorData[0];

    if (!instructor) return (
        <div className='flex justify-center items-center h-screen'>
            <p className='text-xl text-gray-500'>Không tìm thấy thông tin giảng viên</p>
        </div>
    );

  return (
    <div>
      <div className='bg-gradient-to-r from-[#F0F4EF] to-[#FFFFFF] pb-16 pt-8 px-6 rounded-2xl'>
        <div className='container mx-auto max-w-7xl'>
            <div className='mb-8 text-sm text-gray-500 flex items-center gap-2'>
                <span className='cursor-pointer hover:text-[#97A87A] transition-colors' onClick={() => navigate('/instructors')}>Our Mentors</span>
                <span>|</span>
                <span className='text-[#97A87A] font-medium'>{instructor.name}</span>
            </div>

            <div className='flex flex-col lg:flex-row items-start lg:items-end justify-between gap-8'>
                <div className='flex flex-row items-end gap-6'>
                    <div className='w-32 h-32 rounded-lg overflow-hidden shadow-xl'>
                        <img src={instructor.image} alt={instructor.name} className='w-full h-full object-cover' />
                    </div>

                    <div className='text-center sm:text-left'>
                        <h1 className='text-3xl font-bold text-[#2D3A26] mb-2'>{instructor.name}</h1>
                        <p className='text-gray-500 text-base'>{instructor.title}</p>
                    </div>

                </div>
                
                <button className='bg-[#97A87A] text-white px-10 py-3 rounded-xl font-normal transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'>
                    Contact Now
                </button>
                
            </div>
        </div>
      </div>

      <div className='container mx-auto max-w-7xl px-6'>   
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
            {/* tỉ lệ 7 - 3 */}
            <div className='lg:col-span-2 -mt-8'>
                <div className='flex items-center gap-3 mb-10'>
                    {['About', 'Courses', 'Reviews'].map((tab) => (
                      <button 
                        key={tab} 
                        onClick={() => setActiveTab(tab)} 
                        className={`px-8 py-3 rounded-xl font-semibold transition-all shadow-md
                            ${activeTab === tab 
                              ? 'bg-[#97A87A] text-white shadow-lg scale-105' 
                              : 'bg-white text-gray-600 hover:bg-gray-50 hover:text-[#97A87A] hover:shadow-lg'
                            }`}>
                        {tab}
                      </button>  
                    ))}
                </div>

                {/*content */}
                <div>
                    {activeTab === 'About' && (
                        <div className='space-y-8'>
                            <div>
                                <h2 className='text-3xl font-bold text-[#2D3A26] mb-5'>About {instructor.name.split(' ')[0]}</h2>
                                <p className='text-gray-600 leading-relaxed text-base mb-4 whitespace-pre-line'>
                                    {instructor.about}
                                </p>
                            </div>
                            
                            <div>
                                <h2 className='text-3xl font-bold text-[#2D3A26] mb-5'>Certification</h2>
                                <p className='text-gray-600 leading-relaxed text-base whitespace-pre-line'>
                                    {instructor.certification}
                                </p>
                            </div>
                        </div>
                    )}

                    {activeTab === 'Courses' && (
                        <div>
                            <h2 className='text-3xl font-bold text-[#2D3A26] mb-5'>Courses by {instructor.name.split(' ')[0]}</h2>
                            <p className='text-gray-600'>Danh sách khóa học của ...</p>
                        </div>
                    )}

                    {activeTab === 'Reviews' && (
                        <div>
                            <h2 className='text-3xl font-bold text-[#2D3A26] mb-5'>Student Reviews</h2>
                            <p className='text-gray-600'>Đánh giá từ học viên.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* card rating */}
            <div className='lg:col-span-1 py-5'>
                <div className='bg-white rounded-xl p-6 top-6 border border-gray-100'>
                    <div className='space-y-2'>
                        <div className='flex justify-between items-center pb-2'>
                            <span className='text-gray-600 font-medium text-sm'>Total Course</span>
                            <span className='text-[#FF6B6B] text-2xl font-bold'>{instructor.courses}</span>
                        </div>
                        
                        <div className='flex justify-between items-center pb-2'>
                            <span className='text-gray-600 font-medium text-sm'>Ratings</span>
                            <div className='flex items-center gap-2'>
                                <StarIcon className='text-yellow-400' sx={{ fontSize: 22 }} />
                                <span className='text-gray-800 font-bold text-lg'>{instructor.rating}</span>
                                <span className='text-gray-500 text-sm'>({instructor.reviews})</span>
                            </div>
                        </div>
                        
                        <div className='flex justify-between items-center pb-2'>
                            <span className='text-gray-600 font-medium text-sm'>Experiences</span>
                            <span className='text-gray-800 font-bold text-sm'>{instructor.experience}</span>
                        </div>
                        
                        <div className='flex justify-between items-center pb-2'>
                            <span className='text-gray-600 font-medium text-sm'>Grauduated</span>
                            <span className='text-gray-800 font-bold text-sm'>{instructor.graduated}</span>
                        </div>
                        
                        <div className='flex justify-between items-center pb-2'>
                            <span className='text-gray-600 font-medium text-sm'>Language</span>
                            <span className='text-gray-800 font-bold text-sm'>{instructor.languages}</span>
                        </div>
                        
                        <div className='justify-between flex items-center pb-2'>
                            <span className='text-gray-600 font-medium text-sm block'>Social</span>
                            <div className='flex gap-1'>
                                <a href='#' className='w-7 h-7 rounded-full bg-[#1877F2] flex items-center justify-center text-white hover:opacity-80 transition-all hover:scale-110'>
                                    <FacebookIcon sx={{ fontSize: 20 }} />
                                </a>
                                <a href='#' className='w-7 h-7 rounded-full bg-[#FF6B6B] flex items-center justify-center text-white hover:opacity-80 transition-all hover:scale-110'>
                                    <InstagramIcon sx={{ fontSize: 20 }} />
                                </a>
                                <a href='#' className='w-7 h-7 rounded-full bg-[#1DA1F2] flex items-center justify-center text-white hover:opacity-80 transition-all hover:scale-110'>
                                    <TwitterIcon sx={{ fontSize: 20 }} />
                                </a>
                                <a href='#' className='w-7 h-7 rounded-full bg-[#0A66C2] flex items-center justify-center text-white hover:opacity-80 transition-all hover:scale-110'>
                                    <LinkedInIcon sx={{ fontSize: 20 }} />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  )
}

export default InstructorDetail