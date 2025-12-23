import React, { useState, useEffect } from 'react';

import { useNavigate } from 'react-router-dom';

import { User, Mail, Phone, Calendar, Users, BookOpen, Award, Lock, Check, Edit2, Save, X, ArrowLeft } from 'lucide-react';
import InputField from '../components/InputField';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import CourseCard from '../components/courses/CourseCard';


const ToggleSwitch = ({ enabled, onToggle }) => (
  <button
    onClick={onToggle}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${enabled ? 'bg-blue-600' : 'bg-gray-300'}`}
  >
    <span
      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`}
    />
  </button>
);

function AccountProfile() {
  
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  // Tab thong tin ca nhan
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editedProfile, setEditedProfile] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  // Tab bao mat
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  //Dialog xac nhan doi mat khau
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    courseUpdates: true,
    newComments: false
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);

        const response = await fetch('http://localhost:3000/api/user/me', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
          }
          throw new Error('Không thể tải thông tin người dùng');
        }

        const result = await response.json();
        const data = result.data;
        setProfile(data);
        setEditedProfile(data);
      } catch (err) {
        console.error(err);
        setError(err.message || 'Không thể load thông tin người dùng');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const courses = [
    {
      id: 1,
      title: 'Lập trình Web với React',
      image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=300',
      progress: 75,
      instructor: 'Nguyễn Văn A',
      enrolledAt: '2024-01-15'
    },
    {
      id: 2,
      title: 'Machine Learning cơ bản',
      image: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=300',
      progress: 45,
      instructor: 'Trần Thị B',
      enrolledAt: '2024-02-20'
    },
    {
      id: 3,
      title: 'Node.js & Express',
      image: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=300',
      progress: 90,
      instructor: 'Lê Văn C',
      enrolledAt: '2023-12-10'
    }
  ];

  const certificates = [
    {
      id: 1,
      courseName: 'JavaScript Advanced',
      issuedAt: '2024-01-20',
      url: '#'
    },
    {
      id: 2,
      courseName: 'Python for Data Science',
      issuedAt: '2023-11-15',
      url: '#'
    }
  ];

  const handleEdit = () => {
    setIsEditing(true);
    setEditedProfile(profile);
    setAvatarFile(null);
    setAvatarPreview(null);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Kích thước ảnh không được vượt quá 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        alert('Vui lòng chọn file ảnh');
        return;
      }
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      let uploadedImageUrl = profile.profileImageUrl;

      // 1. Nếu có chọn avatar mới → upload
      if (avatarFile) {
        const formData = new FormData();
        formData.append('avatar', avatarFile);

        const uploadResponse = await fetch('http://localhost:3000/api/user/upload-avatar', {
          method: 'POST',
          credentials: 'include',
          body: formData
        });

        if (!uploadResponse.ok) {
          throw new Error('Không thể tải lên ảnh đại diện');
        }

        const uploadResult = await uploadResponse.json();
        uploadedImageUrl = uploadResult.data.profileImageUrl + '?t=' + Date.now();
      }

     
      const response = await fetch('http://localhost:3000/api/user/update-profile', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editedProfile,
          profileImageUrl: uploadedImageUrl  
        })
      });

      if (!response.ok) {
        throw new Error('Không thể cập nhật thông tin');
      }

      const result = await response.json();

      
      const updatedData = {
        ...result.data,
        profileImageUrl: uploadedImageUrl
      };

     
      setProfile(prev => ({ ...prev, ...updatedData }));
      setEditedProfile(prev => ({ ...prev, ...updatedData }));

      
      setAvatarPreview(uploadedImageUrl);

     
      setIsEditing(false);
      setAvatarFile(null);

      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);

    } catch (err) {
      console.error('Lỗi khi cập nhật:', err);
      alert(err.message || 'Không thể cập nhật thông tin. Vui lòng thử lại!');
    }
  };


  const handleCancel = () => {
    setIsEditing(false);
    setEditedProfile(profile);
    setAvatarFile(null);
    setAvatarPreview(null);
  };

  const handleChange = (field, value) => {
    setEditedProfile({ ...editedProfile, [field]: value });
  };


  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      setDialogMessage("Mật khẩu mới và xác nhận mật khẩu không khớp!");
      setOpenDialog(true);
      return;
    }
    if (newPassword.length < 6) {
      setDialogMessage("Mật khẩu mới phải có ít nhất 6 ký tự!");
      setOpenDialog(true);
      return;
    }
    if (!currentPassword || !newPassword || !confirmPassword) {
      setDialogMessage("Vui lòng nhập đầy đủ thông tin");
      setOpenDialog(true);
      return;
    }
    if (newPassword === currentPassword) {
      setDialogMessage("Mật khẩu mới không được trùng với mật khẩu hiện tại!");
      setOpenDialog(true);
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/api/user/change-password", {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setDialogMessage(data.message || "Đổi mật khẩu thất bại");
        setOpenDialog(true);
        return;
      }

  
      setDialogMessage("Đổi mật khẩu thành công!");
      setOpenDialog(true);

    } catch (err) {
      console.error("Lỗi khi đổi mật khẩu:", err);
      setDialogMessage("Đổi mật khẩu thất bại. Vui lòng thử lại!");
      setOpenDialog(true);
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);

    if (dialogMessage === "Đổi mật khẩu thành công!") {
     
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
  };



  const toggleNotification = (key) => {
    setNotifications({ ...notifications, [key]: !notifications[key] });
  };

  const getInitials = () => {
    if (!profile) return '';
    return `${profile.firstName?.[0] || ''}${profile.lastName?.[0] || ''}`.toUpperCase();
  };

  const getRoleInfo = (role) => {
    const info = {
      student: { label: 'Học viên', color: 'bg-blue-100 text-blue-800' },
      instructor: { label: 'Giảng viên', color: 'bg-green-100 text-green-800' },
      admin: { label: 'Quản trị viên', color: 'bg-red-100 text-red-800' }
    };
    return info[role] || info.student;
  };

  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    if (dateString.includes('T')) {
      return dateString.split('T')[0];
    }
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const tabs = [
    { id: 0, label: 'Thông tin cá nhân', icon: User },
    // { id: 1, label: 'Khóa học của tôi', icon: BookOpen },
    { id: 2, label: 'Chứng chỉ', icon: Award },
    { id: 3, label: 'Bảo mật', icon: Lock }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-xl shadow-sm p-8 max-w-md mx-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Có lỗi xảy ra</h2>
          <p className="text-red-600 mb-6">{error || 'Không thể tải thông tin'}</p>
          <div className="flex gap-3 justify-center">
             <button
              onClick={() => navigate('/')}
              className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Về trang chủ
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
       
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-4 transition-colors group"
        >
          <div className="p-2 bg-white rounded-full shadow-sm group-hover:shadow-md transition-all">
            <ArrowLeft className="h-5 w-5" />
          </div>
          <span className="font-medium">Trở về trang chủ</span>
        </button>

        {showAlert && (
          <div className="mb-4 sm:mb-6 bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4 flex items-center gap-3">
            <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
            <p className="text-sm sm:text-base text-green-800 font-medium">Thông tin cá nhân đã được cập nhật thành công!</p>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 md:p-8 mb-4 sm:mb-6">
          <div className="flex flex-col items-center text-center sm:flex-row sm:items-start sm:text-left gap-4 sm:gap-6">
            <div className="flex-shrink-0 relative">
              <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-3xl sm:text-4xl font-bold shadow-lg overflow-hidden">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar preview" className="w-full h-full object-cover" />
                ) : profile.profileImageUrl ? (
                  <img src={profile.profileImageUrl} alt={`${profile.firstName} ${profile.lastName}`} className="w-full h-full object-cover" />
                ) : (
                  getInitials()
                )}
              </div>
              {isEditing && (
                <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors shadow-lg">
                  <Edit2 className="h-4 w-4" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            <div className="flex-1 w-full sm:w-auto">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                {profile.firstName} {profile.lastName}
              </h1>
              <p className="text-gray-600 mb-3">@{profile.username}</p>
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleInfo(profile.role).color}`}>
                  {getRoleInfo(profile.role).label}
                </span>
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-50 text-green-700 border border-green-200 flex items-center gap-1">
                  <Check className="h-4 w-4" />
                  <span className="hidden sm:inline">Email đã xác thực</span>
                  <span className="sm:hidden">Đã xác thực</span>
                </span>
              </div>
            </div>

            {activeTab === 0 && (
              <div className="flex gap-2 w-full sm:w-auto">
                {!isEditing ? (
                  <button
                    onClick={handleEdit}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium"
                  >
                    <Edit2 className="h-4 w-4" />
                    Chỉnh sửa
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleSave}
                      className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium"
                    >
                      <Save className="h-4 w-4" />
                      Lưu
                    </button>
                    <button
                      onClick={handleCancel}
                      className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                    >
                      <X className="h-4 w-4" />
                      Hủy
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="border-b border-gray-200 bg-gray-50">
            <div className="flex overflow-x-auto scrollbar-hide">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 sm:px-6 py-3 sm:py-4 font-medium whitespace-nowrap transition-all border-b-2 text-sm sm:text-base ${activeTab === tab.id ? 'border-blue-600 text-blue-600 bg-white' : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}
                  >
                    <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-4 sm:p-6 md:p-8">
            {activeTab === 0 && (
              <div className="space-y-6 sm:space-y-8">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">Thông tin cơ bản</h2>
                  <div className="h-1 w-16 bg-blue-600 rounded-full mb-4 sm:mb-6"></div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <InputField
                      label="Họ"
                      value={isEditing ? editedProfile.firstName : profile.firstName}
                      onChange={(val) => handleChange('firstName', val)}
                      disabled={!isEditing}
                      icon={User}
                    />
                    <InputField
                      label="Tên"
                      value={isEditing ? editedProfile.lastName : profile.lastName}
                      onChange={(val) => handleChange('lastName', val)}
                      disabled={!isEditing}
                      icon={User}
                    />
                    <InputField
                      label="Email"
                      type="email"
                      value={isEditing ? editedProfile.email : profile.email}
                      onChange={(val) => handleChange('email', val)}
                      disabled={!isEditing}
                      icon={Mail}
                    />
                    <InputField
                      label="Số điện thoại"
                      value={isEditing ? editedProfile.phoneNumber : profile.phoneNumber}
                      onChange={(val) => handleChange('phoneNumber', val)}
                      disabled={!isEditing}
                      icon={Phone}
                    />
                    <InputField
                      label="Ngày sinh"
                      type="date"
                      value={isEditing ? formatDateForInput(editedProfile.dateOfBirth) : formatDateForInput(profile.dateOfBirth)}
                      onChange={(val) => handleChange('dateOfBirth', val)}
                      disabled={!isEditing}
                      icon={Calendar}
                    />
                    <InputField
                      label="Giới tính"
                      value={isEditing ? editedProfile.gender : profile.gender}
                      onChange={(val) => handleChange('gender', val)}
                      disabled={!isEditing}
                      icon={Users}
                      select
                      options={[
                        { value: 'male', label: 'Nam' },
                        { value: 'female', label: 'Nữ' },
                        { value: 'other', label: 'Khác' }
                      ]}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* {activeTab === 1 && (
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">Khóa học đang học ({courses.length})</h2>
                <div className="h-1 w-16 bg-blue-600 rounded-full mb-4 sm:mb-6"></div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                  {courses.map((course) => (
                    <CourseCard key={course.id} course={course} />
                  ))}
                </div>
              </div>
            )} */}

            {activeTab === 2 && (
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">Chứng chỉ đã đạt được ({certificates.length})</h2>
                <div className="h-1 w-16 bg-blue-600 rounded-full mb-4 sm:mb-6"></div>

                <div className="space-y-4">
                  {certificates.map((cert) => (
                    <div
                      key={cert.id}
                      className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 hover:shadow-md transition-all"
                    >
                      <div className="flex-shrink-0">
                        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                          <Award className="h-7 w-7 sm:h-8 sm:w-8 text-white" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1">{cert.courseName}</h3>
                        <p className="text-sm text-gray-600">Cấp ngày: {formatDate(cert.issuedAt)}</p>
                      </div>
                      <button className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-white border-2 border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors font-medium text-sm sm:text-base">
                        Xem chứng chỉ
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 3 && (
              <div className="space-y-4 sm:space-y-6">
                <div className="border border-gray-200 rounded-xl p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4">Đổi mật khẩu</h3>
                  <div className="space-y-4">
                    <InputField
                      label="Mật khẩu hiện tại"
                      type="password"
                      value={currentPassword}
                      onChange={setCurrentPassword}
                      icon={Lock}
                    />
                    <InputField
                      label="Mật khẩu mới"
                      type="password"
                      value={newPassword}
                      onChange={setNewPassword}
                      icon={Lock}
                    />
                    <InputField
                      label="Xác nhận mật khẩu mới"
                      type="password"
                      value={confirmPassword}
                      onChange={setConfirmPassword}
                      icon={Lock}
                    />
                    <button
                      className="w-full sm:w-auto px-4 sm:px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm sm:text-base"
                      onClick={handleChangePassword}
                    >
                      Cập nhật mật khẩu
                    </button>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-xl p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4">Cài đặt thông báo</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-3 border-b border-gray-100">
                      <div className="flex-1 mr-4">
                        <p className="font-medium text-gray-900 text-sm sm:text-base">Thông báo qua email</p>
                        <p className="text-xs sm:text-sm text-gray-500 mt-1">Nhận email về các cập nhật quan trọng</p>
                      </div>
                      <ToggleSwitch
                        enabled={notifications.emailNotifications}
                        onToggle={() => toggleNotification('emailNotifications')}
                      />
                    </div>

                    <div className="flex items-center justify-between py-3 border-b border-gray-100">
                      <div className="flex-1 mr-4">
                        <p className="font-medium text-gray-900 text-sm sm:text-base">Cập nhật khóa học</p>
                        <p className="text-xs sm:text-sm text-gray-500 mt-1">Thông báo khi có bài học mới</p>
                      </div>
                      <ToggleSwitch
                        enabled={notifications.courseUpdates}
                        onToggle={() => toggleNotification('courseUpdates')}
                      />
                    </div>

                    <div className="flex items-center justify-between py-3">
                      <div className="flex-1 mr-4">
                        <p className="font-medium text-gray-900 text-sm sm:text-base">Bình luận mới</p>
                        <p className="text-xs sm:text-sm text-gray-500 mt-1">Thông báo khi có người trả lời bình luận</p>
                      </div>
                      <ToggleSwitch
                        enabled={notifications.newComments}
                        onToggle={() => toggleNotification('newComments')}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dialog thông báo */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Thông báo</DialogTitle>
        <DialogContent>
          <p className="text-gray-700">{dialogMessage}</p>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary" variant="contained">
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default AccountProfile;