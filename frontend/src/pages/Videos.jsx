import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { useDispatch } from "react-redux";
import LessonQuiz from "../components/lesson/LessonQuiz";

const Videos = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [modules, setModules] = useState([]);
  const [selectedModule, setSelectedModule] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [error, setError] = useState(null);
  const [note, setNote] = useState("");
  const videoRef = useRef(null);

  // Format duration from seconds to readable format (e.g., "5:30" or "1h 5m 30s")
  const formatDuration = (seconds) => {
    if (!seconds || seconds === 0) return 'N/A';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}:${secs.toString().padStart(2, '0')}`;
    } else {
      return `${secs}s`;
    }
  };

  // Check if user has access to this course (enrolled)
  useEffect(() => {
    const checkAccess = async () => {
      try {
        setCheckingAccess(true);
        const response = await fetch(`http://localhost:3000/api/course/me/enrollments`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          // If not authenticated or no enrollments, redirect to home
          navigate('/');
          return;
        }

        const result = await response.json();
        const enrollments = result.data?.enrollments || [];
        
        // Check if user is enrolled in this course
        const isEnrolled = enrollments.some(
          (enrollment) => enrollment.course?.id === parseInt(courseId)
        );

        if (!isEnrolled) {
          // User not enrolled, redirect to home
          navigate('/');
          return;
        }

        // User has access, allow to continue
        setCheckingAccess(false);
      } catch (err) {
        console.error('Error checking access:', err);
        // On error, redirect to home for safety
        navigate('/');
      }
    };

    if (courseId) {
      checkAccess();
    }
  }, [courseId, navigate]);

  // Fetch modules for the course
  useEffect(() => {
    const fetchModules = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:3000/api/module/course/${courseId}`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        if (!response.ok) {
          throw new Error('Không thể tải modules');
        }
        const result = await response.json();
        setModules(result.data || []);
        if (result.data && result.data.length > 0) {
          setSelectedModule(result.data[0]);
        }
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (courseId) {
      fetchModules();
    }
  }, [courseId]);

  // Fetch lessons for selected module
  useEffect(() => {
    const fetchLessons = async () => {
      if (!selectedModule) return;
      try {
        const response = await fetch(`http://localhost:3000/api/lesson/module/${selectedModule.id}`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        if (!response.ok) {
          throw new Error('Không thể tải lessons');
        }
        const result = await response.json();
        setLessons(result.data || []);
        if (result.data && result.data.length > 0) {
          setSelectedLesson(result.data[0]);
        }
      } catch (err) {
        console.error(err);
        setError(err.message);
      }
    };
    fetchLessons();
  }, [selectedModule]);

  // Load saved notes for the current lesson
  useEffect(() => {
    if (!selectedLesson) return;
    const saved = localStorage.getItem(`lesson_notes_${selectedLesson.id}`) || "";
    setNote(saved);
  }, [selectedLesson]);

  // Save notes on change
  useEffect(() => {
    if (!selectedLesson) return;
    const key = `lesson_notes_${selectedLesson.id}`;
    localStorage.setItem(key, note);
  }, [note, selectedLesson]);

  const onSelectModule = (module) => {
    setSelectedModule(module);
  };

  const onSelectLesson = (lesson) => {
    setSelectedLesson(lesson);
    if (videoRef.current) {
      try { videoRef.current.pause(); } catch (e) {}
    }
  };

  // Show loading while checking access
  if (checkingAccess) {
    return <div className="w-full min-h-screen bg-gray-50 flex items-center justify-center">Đang kiểm tra quyền truy cập...</div>;
  }

  if (loading) return <div className="w-full min-h-screen bg-gray-50 flex items-center justify-center">Đang tải...</div>;
  if (error) return <div className="w-full min-h-screen bg-gray-50 flex items-center justify-center text-red-500">{error}</div>;

  return (
    <div className="w-full bg-gray-50">
      <div className="p-6">
        <h1 className="text-2xl font-semibold mb-4">Videos - {selectedModule?.title || 'Chọn module'}</h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left column: video + notes stacked */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            {selectedLesson && (
              <>
                <div className="rounded shadow-lg overflow-hidden bg-black">
                  <div className="w-full h-[260px] md:h-[420px] lg:h-[540px]">
                    <video
                      ref={videoRef}
                      key={selectedLesson?.id}
                      controls
                      className="w-full h-full object-contain bg-black"
                      src={selectedLesson?.videoUrl}
                    >
                      Your browser does not support the video tag.
                    </video>
                  </div>

                  <div className="p-4 bg-white border-t">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h2 className="text-lg font-semibold">{selectedLesson?.title}</h2>
                        <p className="text-sm text-gray-500 mt-1">Duration: {formatDuration(selectedLesson?.durationSeconds)}</p>
                      </div>
                      <div className="text-sm text-gray-400">ID: {selectedLesson?.id}</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded shadow-lg p-6 border-gray-200">
                  <h3 className="text-lg font-bold mb-4 border-b pb-2 text-gray-700">
                    Quiz for Lesson
                  </h3>
                  <LessonQuiz key={selectedLesson.id} lessonId={selectedLesson.id} />
                </div>
              </>
            )}
          </div>

          {/* Right column: list of modules and lessons */}
          <aside className="lg:col-span-4">
            <div className="space-y-4 sticky top-6">
              {/* Modules list */}
              <div className="bg-white rounded shadow p-3 border border-gray-200">
                <h3 className="font-medium mb-3 pb-2 border-b border-gray-100">Danh sách module</h3>
                <div className="mt-2" style={{ maxHeight: '150px', overflowY: 'auto' }}>
                  <ul className="space-y-2 px-1">
                    {modules.map((m) => (
                      <li
                        key={m.id}
                        className={`p-2 rounded-md cursor-pointer transition-shadow ${m.id === selectedModule?.id ? 'bg-indigo-50 shadow-sm ring-1 ring-indigo-200 border border-indigo-100' : 'hover:shadow-sm hover:bg-gray-50'}`}
                        onClick={() => onSelectModule(m)}
                      >
                        <div className="font-medium text-sm text-gray-800">{m.title}</div>
                        <div className="text-xs text-gray-500">{m.description || 'Mô tả module'}</div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Lessons list */}
              {selectedModule && (
                <div className="bg-white rounded shadow p-3 border border-gray-200">
                  <h3 className="font-medium mb-3 pb-2 border-b border-gray-100">Danh sách video trong module</h3>
                  <div className="mt-2" style={{ maxHeight: '220px', overflowY: 'auto' }}>
                    <ul className="space-y-3 px-1">
                      {lessons.map((l) => (
                        <li
                          key={l.id}
                          className={`flex items-center gap-3 p-2 rounded-md cursor-pointer transition-shadow ${l.id === selectedLesson?.id ? 'bg-indigo-50 shadow-sm ring-1 ring-indigo-200 border border-indigo-100' : 'hover:shadow-sm hover:bg-gray-50'}`}
                          onClick={() => onSelectLesson(l)}
                        >
                          <div className="w-20 h-12 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-500 overflow-hidden">
                            {l.videoUrl ? 'Video' : 'No Video'}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-sm text-gray-800">{l.title}</div>
                            <div className="text-xs text-gray-500">{formatDuration(l.durationSeconds)}</div>
                          </div>
                          <div className="text-xs text-indigo-600 font-medium">Play</div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Notes */}
              {selectedLesson && (
                <div className="bg-white rounded shadow p-3" style={{ maxHeight: '50vh', overflowY: 'auto' }}>
                  <h3 className="font-medium mb-3">Ghi chú</h3>
                  <div className="flex items-center justify-between mb-3">
                    <div />
                    <div className="flex items-center gap-2">
                      <button
                        className="text-sm text-red-600 hover:underline"
                        onClick={() => { setNote(""); localStorage.removeItem(`lesson_notes_${selectedLesson.id}`); }}
                      >
                        Xóa
                      </button>
                      <span className="text-xs text-gray-400">(Tự lưu)</span>
                    </div>
                  </div>

                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Ghi chú cho video này..."
                    className="w-full h-56 border border-gray-200 rounded p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  />
                  <div className="text-right mt-2 text-xs text-gray-500">Ghi chú được lưu tự động vào trình duyệt</div>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Videos;
