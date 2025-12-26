import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Calendar, Users, BookOpen, Award, Lock, Check, Edit2, Save, X, ArrowLeft, ExternalLink } from 'lucide-react';
import InputField from '../components/InputField';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import CourseCard from '../components/courses/CourseCard';
import api from '../Redux/api';

function AccountProfile() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  // --- Tab Thông tin cá nhân ---
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editedProfile, setEditedProfile] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  // --- Tab Chứng chỉ (NEW) ---
  const [certificates, setCertificates] = useState([]);
  const [certLoading, setCertLoading] = useState(false);

  // --- Tab Bảo mật ---
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Dialog xác nhận
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');

  // Fetch Profile & Certificates
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await api.get('/user/me');
        const data = response.data.data;
        setProfile(data);
        setEditedProfile(data);
      } catch (err) {
        console.error(err);
        if (err?.status === 401) {
          setError('Session expired. Please log in again.');
        } else {
          setError(err?.message || 'Unable to load user profile.');
        }
      } finally {
        setLoading(false);
      }
    };

    const fetchCertificates = async () => {
      try {
        setCertLoading(true);
        const response = await api.get('/certificate/me');
        if (response.data?.success) {
          setCertificates(response.data.data || []);
        }
      } catch (err) {
        console.error("Error fetching certificates:", err);
      } finally {
        setCertLoading(false);
      }
    };

    fetchProfile();
    fetchCertificates();
  }, []);

  // Fake courses data (Bạn có thể muốn sửa cái này sau nếu có API course)
  const courses = [
    {
      id: 1,
      title: 'Lập trình Web với React',
      image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=300',
      progress: 75,
      instructor: 'Nguyễn Văn A',
      enrolledAt: '2024-01-15'
    },
    // ... các course khác giữ nguyên
  ];

  // --- Handlers ---
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
        alert('Image size must not exceed 5MB.');
        return;
      }
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file.');
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

      if (avatarFile) {
        const formData = new FormData();
        formData.append('avatar', avatarFile);

        const uploadResponse = await api.post('/user/upload-avatar', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        uploadedImageUrl = uploadResponse.data.data.profileImageUrl + '?t=' + Date.now();
      }

      const response = await api.put('/user/update-profile', {
        ...editedProfile,
        profileImageUrl: uploadedImageUrl
      });
      
      const updatedData = { ...response.data.data, profileImageUrl: uploadedImageUrl };
      setProfile(prev => ({ ...prev, ...updatedData }));
      setEditedProfile(prev => ({ ...prev, ...updatedData }));
      setAvatarPreview(uploadedImageUrl);
      setIsEditing(false);
      setAvatarFile(null);
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);

    } catch (err) {
      console.error('Error update profile:', err);
      alert(err?.message || 'Unable to update profile. Please try again!');
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
      setDialogMessage("New password and confirm password do not match!");
      setOpenDialog(true);
      return;
    }
    if (newPassword.length < 6) {
      setDialogMessage("New password must be at least 6 characters!");
      setOpenDialog(true);
      return;
    }
    if (!currentPassword || !newPassword || !confirmPassword) {
      setDialogMessage("Please enter all required fields.");
      setOpenDialog(true);
      return;
    }
    if (newPassword === currentPassword) {
      setDialogMessage("New password cannot be the same as current password!");
      setOpenDialog(true);
      return;
    }

    try {
      await api.put("/user/change-password", { currentPassword, newPassword });
      setDialogMessage("Password changed successfully!");
      setOpenDialog(true);
    } catch (err) {
      console.error("Error change password:", err);
      setDialogMessage(err?.message || "Password change failed. Please try again!");
      setOpenDialog(true);
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    if (dialogMessage === "Password changed successfully!") {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  const handleViewCertificate = (url) => {
    if (url) {
        window.open(url, '_blank');
    } else {
        alert("Certificate URL not found");
    }
  };

  const getInitials = () => {
    if (!profile) return '';
    return `${profile.firstName?.[0] || ''}${profile.lastName?.[0] || ''}`.toUpperCase();
  };

  const getRoleInfo = (role) => {
    const info = {
      student: { label: 'Student', color: 'bg-blue-100 text-blue-800' },
      instructor: { label: 'Instructor', color: 'bg-green-100 text-green-800' },
      admin: { label: 'Admin', color: 'bg-red-100 text-red-800' }
    };
    return info[role] || info.student;
  };

  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    if (dateString.includes('T')) return dateString.split('T')[0];
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const tabs = [
    { id: 0, label: 'Personal Info', icon: User },
    { id: 2, label: 'Certificates', icon: Award },
    { id: 3, label: 'Security', icon: Lock }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
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
          <h2 className="text-xl font-bold text-gray-900 mb-2">An error occurred</h2>
          <p className="text-red-600 mb-6">{error || 'Can not load information'}</p>
          <div className="flex gap-3 justify-center">
             <button
              onClick={() => navigate('/')}
              className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Back to Dashboard
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Try Again
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
          <span className="font-medium">Back to Dashboard</span>
        </button>

        {showAlert && (
          <div className="mb-4 sm:mb-6 bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4 flex items-center gap-3">
            <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
            <p className="text-sm sm:text-base text-green-800 font-medium">Profile updated successfully!</p>
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
                  <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
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
                  <span className="hidden sm:inline">Email verified</span>
                  <span className="sm:hidden">Verified</span>
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
                    <Edit2 className="h-4 w-4" /> Edit
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleSave}
                      className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium"
                    >
                      <Save className="h-4 w-4" /> Save
                    </button>
                    <button
                      onClick={handleCancel}
                      className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                    >
                      <X className="h-4 w-4" /> Cancel
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
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">Personal Info</h2>
                  <div className="h-1 w-16 bg-blue-600 rounded-full mb-4 sm:mb-6"></div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <InputField
                      label="First Name"
                      value={isEditing ? editedProfile.firstName : profile.firstName}
                      onChange={(val) => handleChange('firstName', val)}
                      disabled={!isEditing}
                      icon={User}
                    />
                    <InputField
                      label="Last Name"
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
                      label="Phone Number"
                      value={isEditing ? editedProfile.phoneNumber : profile.phoneNumber}
                      onChange={(val) => handleChange('phoneNumber', val)}
                      disabled={!isEditing}
                      icon={Phone}
                    />
                    <InputField
                      label="Date of Birth"
                      type="date"
                      value={isEditing ? formatDateForInput(editedProfile.dateOfBirth) : formatDateForInput(profile.dateOfBirth)}
                      onChange={(val) => handleChange('dateOfBirth', val)}
                      disabled={!isEditing}
                      icon={Calendar}
                    />
                    <InputField
                      label="Gender"
                      value={isEditing ? editedProfile.gender : profile.gender}
                      onChange={(val) => handleChange('gender', val)}
                      disabled={!isEditing}
                      icon={Users}
                      select
                      options={[
                        { value: 'male', label: 'Male' },
                        { value: 'female', label: 'Female' },
                        { value: 'other', label: 'Other' }
                      ]}
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 2 && (
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">Earned Certificates ({certificates.length})</h2>
                <div className="h-1 w-16 bg-blue-600 rounded-full mb-4 sm:mb-6"></div>

                {certLoading ? (
                    <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                ) : certificates.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-100">
                        <Award className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500">No certificates found.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                      {certificates.map((cert) => {
                        // Lấy URL từ cert.certificateUrl (ưu tiên) hoặc cert.url
                        const finalUrl = cert.certificateUrl || cert.url;
                        return (
                          <div
                            key={cert.id || Math.random()}
                            className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 hover:shadow-md transition-all"
                          >
                            <div className="flex-shrink-0">
                              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                                <Award className="h-7 w-7 sm:h-8 sm:w-8 text-white" />
                              </div>
                            </div>
                            <div className="flex-1">
                              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1">
                                {cert.course?.title || 'Course Name'}
                              </h3>
                              {cert.course?.instructor && (
                                <p className="text-sm text-gray-600 mb-1">
                                    Instructor: {cert.course.instructor.fullname}
                                </p>
                              )}
                              <p className="text-sm text-gray-600">
                                Issued on: {formatDate(cert.issuedAt)}
                              </p>
                            </div>
                            <button 
                                onClick={() => handleViewCertificate(finalUrl)}
                                className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-white border-2 border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors font-medium text-sm sm:text-base flex items-center justify-center gap-2"
                            >
                              <ExternalLink className="h-4 w-4" />
                              View Certificate
                            </button>
                          </div>
                        );
                      })}
                    </div>
                )}
              </div>
            )}

            {/* TAB 3: Security */}
            {activeTab === 3 && (
              <div className="space-y-4 sm:space-y-6">
                <div className="border border-gray-200 rounded-xl p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4">Change Password</h3>
                  <div className="space-y-4">
                    <InputField
                      label="Current Password"
                      type="password"
                      value={currentPassword}
                      onChange={setCurrentPassword}
                      icon={Lock}
                    />
                    <InputField
                      label="New Password"
                      type="password"
                      value={newPassword}
                      onChange={setNewPassword}
                      icon={Lock}
                    />
                    <InputField
                      label="Confirm New Password"
                      type="password"
                      value={confirmPassword}
                      onChange={setConfirmPassword}
                      icon={Lock}
                    />
                    <button
                      className="w-full sm:w-auto px-4 sm:px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm sm:text-base"
                      onClick={handleChangePassword}
                    >
                      Update Password
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dialog thông báo */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Notification</DialogTitle>
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