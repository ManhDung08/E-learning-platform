import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";

import LessonQuiz from "../components/lesson/LessonQuiz";
import api from "../Redux/api";

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
  const [savedNote, setSavedNote] = useState(""); // Track saved note content
  const [noteLoading, setNoteLoading] = useState(false);
  const [noteSaving, setNoteSaving] = useState(false);
  const [noteError, setNoteError] = useState(null);
  const videoRef = useRef(null);
  const lastUpdateTimeRef = useRef(0);

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

  // Update lesson progress periodically during video playback
  const updateLessonProgress = async (lessonId, watchedSeconds, isCompleted = false) => {
    try {
      await api.patch(`/lesson/${lessonId}/progress`, {
        watchedSeconds,
        isCompleted
      });
    } catch (error) {
      console.error('Error updating lesson progress:', error);
    }
  };

  // Setup video progress tracking
  useEffect(() => {
    if (!selectedLesson || !videoRef.current) return;

    const video = videoRef.current;

    // Resume from last watched position
    if (selectedLesson.progress?.watchedSeconds) {
      video.currentTime = selectedLesson.progress.watchedSeconds;
    }

    const handleTimeUpdate = () => {
      const currentTime = Math.floor(video.currentTime);
      const duration = Math.floor(video.duration);

      // Update progress every 10 seconds
      if (currentTime - lastUpdateTimeRef.current >= 10) {
        updateLessonProgress(selectedLesson.id, currentTime);
        lastUpdateTimeRef.current = currentTime;
        
        // Update local lesson state to reflect progress
        setLessons(prevLessons => 
          prevLessons.map(l => 
            l.id === selectedLesson.id 
              ? { ...l, progress: { ...l.progress, watchedSeconds: currentTime, lastAccessedAt: new Date() } }
              : l
          )
        );
      }

      // Check if video is near completion (95% watched)
      if (duration > 0 && currentTime >= duration * 0.95 && !selectedLesson.progress?.isCompleted) {
        updateLessonProgress(selectedLesson.id, currentTime, true);
        
        // Update local lesson state to mark as completed
        setLessons(prevLessons => 
          prevLessons.map(l => 
            l.id === selectedLesson.id 
              ? { ...l, progress: { ...l.progress, isCompleted: true, watchedSeconds: currentTime } }
              : l
          )
        );
        
        setSelectedLesson(prev => ({
          ...prev,
          progress: { ...prev.progress, isCompleted: true, watchedSeconds: currentTime }
        }));
      }
    };

    const handleEnded = () => {
      const duration = Math.floor(video.duration);
      updateLessonProgress(selectedLesson.id, duration, true);
      
      // Mark as completed
      setLessons(prevLessons => 
        prevLessons.map(l => 
          l.id === selectedLesson.id 
            ? { ...l, progress: { ...l.progress, isCompleted: true, watchedSeconds: duration } }
            : l
        )
      );
      
      setSelectedLesson(prev => ({
        ...prev,
        progress: { ...prev.progress, isCompleted: true, watchedSeconds: duration }
      }));
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
      lastUpdateTimeRef.current = 0;
    };
  }, [selectedLesson]);

  // Load saved notes for the current lesson from API
  useEffect(() => {
    if (!selectedLesson) {
      setNote("");
      setSavedNote("");
      return;
    }

    const fetchNote = async () => {
      try {
        setNoteLoading(true);
        setNoteError(null); // Clear error before fetching
        const response = await api.get(`/lessonNote/lesson/${selectedLesson.id}`);
        
        if (response.data && response.data.success) {
          // Success - clear any previous errors
          setNoteError(null);
          const noteContent = response.data.data?.content || "";
          setNote(noteContent);
          setSavedNote(noteContent);
        } else {
          // Response not successful but no error thrown
          setNoteError(null);
          setNote("");
          setSavedNote("");
        }
      } catch (error) {
        // If note doesn't exist (404), that's fine - just set empty note
        if (error.response?.status === 404) {
          setNoteError(null); // 404 is not an error, it just means no note exists
          setNote("");
          setSavedNote("");
        } else {
          console.error("Error fetching note:", error);
          setNoteError("Không thể tải ghi chú");
        }
      } finally {
        setNoteLoading(false);
      }
    };

    fetchNote();
  }, [selectedLesson]);

  // Handle save note
  const handleSaveNote = async () => {
    if (!selectedLesson) return;

    try {
      setNoteSaving(true);
      setNoteError(null); // Clear error before saving

      const noteContent = note.trim();

      const response = await api.put(`/lessonNote/lesson/${selectedLesson.id}`, {
        content: noteContent
      });

      if (response.data && response.data.success) {
        setNoteError(null); // Clear error on success
        setSavedNote(noteContent);
        console.log("Note saved successfully");
      }
    } catch (error) {
      console.error("Error saving note:", error);
      setNoteError("Không thể lưu ghi chú. Vui lòng thử lại.");
    } finally {
      setNoteSaving(false);
    }
  };

  // Handle delete note
  const handleDeleteNote = async () => {
    if (!selectedLesson) return;

    try {
      setNoteSaving(true);
      setNoteError(null);
      await api.delete(`/lessonNote/lesson/${selectedLesson.id}`);
      setNote("");
      setSavedNote("");
    } catch (error) {
      console.error("Error deleting note:", error);
      // Even if delete fails, clear local state
      setNote("");
      setSavedNote("");
      if (error.response?.status !== 404) {
        setNoteError("Không thể xóa ghi chú");
      }
    } finally {
      setNoteSaving(false);
    }
  };

  const onSelectModule = (module) => {
    setSelectedModule(module);
  };

  const onSelectLesson = (lesson) => {
    // Save current progress before switching
    if (selectedLesson && videoRef.current && !videoRef.current.paused) {
      const currentTime = Math.floor(videoRef.current.currentTime);
      updateLessonProgress(selectedLesson.id, currentTime);
    }
    
    setSelectedLesson(lesson);
    if (videoRef.current) {
      try { 
        videoRef.current.pause(); 
      } catch {
        // Ignore errors if video cannot be paused
      }
    }
    lastUpdateTimeRef.current = 0;
  };

  const handleNextLesson = () => {
    if (!selectedLesson || !lessons.length) return;

    const currentIndex = lessons.findIndex(l => l.id === selectedLesson.id);
    
    if (currentIndex !== -1 && currentIndex < lessons.length - 1) {
        const nextLesson = lessons[currentIndex + 1];
        onSelectLesson(nextLesson);
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
        alert("Chúc mừng! Bạn đã hoàn thành module này.");
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
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h2 className="text-lg font-semibold">{selectedLesson?.title}</h2>
                          {selectedLesson?.progress?.isCompleted && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                              </svg>
                              Completed
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">Duration: {formatDuration(selectedLesson?.durationSeconds)}</p>
                        
                        {/* Progress Bar */}
                        {selectedLesson?.durationSeconds > 0 && (
                          <div className="mt-3">
                            <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                              <span>Progress: {formatDuration(selectedLesson?.progress?.watchedSeconds || 0)} / {formatDuration(selectedLesson?.durationSeconds)}</span>
                              <span className="font-semibold">
                                {Math.min(100, Math.round(((selectedLesson?.progress?.watchedSeconds || 0) / selectedLesson?.durationSeconds) * 100))}%
                              </span>
                            </div>
                            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className={`h-full transition-all duration-300 ${
                                  selectedLesson?.progress?.isCompleted ? 'bg-green-500' : 'bg-blue-500'
                                }`}
                                style={{ 
                                  width: `${Math.min(100, ((selectedLesson?.progress?.watchedSeconds || 0) / selectedLesson?.durationSeconds) * 100)}%` 
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="text-sm text-gray-400">ID: {selectedLesson?.id}</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded shadow-lg p-6 border-gray-200">
                  <h3 className="text-lg font-bold mb-4 border-b pb-2 text-gray-700">
                    Quiz for Lesson
                  </h3>
                  <LessonQuiz key={selectedLesson.id} lessonId={selectedLesson.id} courseId={courseId} onNextLesson={handleNextLesson} />
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
                      {lessons.map((l) => {
                        const progressPercent = l.durationSeconds > 0 
                          ? Math.min(100, ((l.progress?.watchedSeconds || 0) / l.durationSeconds) * 100)
                          : 0;
                        
                        return (
                          <li
                            key={l.id}
                            className={`relative flex items-center gap-3 p-2 rounded-md cursor-pointer transition-shadow ${l.id === selectedLesson?.id ? 'bg-indigo-50 shadow-sm ring-1 ring-indigo-200 border border-indigo-100' : 'hover:shadow-sm hover:bg-gray-50'}`}
                            onClick={() => onSelectLesson(l)}
                          >
                            <div className="w-20 h-12 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-500 overflow-hidden relative">
                              {l.videoUrl ? 'Video' : 'No Video'}
                              {l.progress?.isCompleted && (
                                <div className="absolute inset-0 bg-green-500 bg-opacity-20 flex items-center justify-center">
                                  <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                                  </svg>
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <div className="font-medium text-sm text-gray-800 truncate">{l.title}</div>
                                {l.progress?.isCompleted && (
                                  <svg className="w-4 h-4 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                                  </svg>
                                )}
                              </div>
                              <div className="text-xs text-gray-500">{formatDuration(l.durationSeconds)}</div>
                              {/* Mini progress bar */}
                              {l.durationSeconds > 0 && (
                                <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden mt-1">
                                  <div 
                                    className={`h-full transition-all ${l.progress?.isCompleted ? 'bg-green-500' : 'bg-blue-400'}`}
                                    style={{ width: `${progressPercent}%` }}
                                  />
                                </div>
                              )}
                            </div>
                            <div className="text-xs text-indigo-600 font-medium flex-shrink-0">
                              {l.progress?.isCompleted ? 'Replay' : 'Play'}
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              )}

              {/* Notes */}
              {selectedLesson && (
                <div className="bg-white rounded shadow p-3" style={{ maxHeight: '50vh', overflowY: 'auto' }}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium">Ghi chú</h3>
                    {noteError && (
                      <span className="text-xs text-red-500">{noteError}</span>
                    )}
                  </div>

                  {noteLoading ? (
                    <div className="w-full h-56 flex items-center justify-center border border-gray-200 rounded">
                      <span className="text-sm text-gray-500">Đang tải ghi chú...</span>
                    </div>
                  ) : (
                    <>
                      <textarea
                        value={note}
                        onChange={(e) => {
                          setNote(e.target.value);
                          setNoteError(null);
                        }}
                        placeholder="Ghi chú cho video này..."
                        className="w-full h-56 border border-gray-200 rounded p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
                        disabled={noteLoading}
                      />
                      <div className="flex items-center justify-between mt-3">
                        <button
                          className="text-sm text-red-600 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                          onClick={handleDeleteNote}
                          disabled={noteSaving || noteLoading || (!note && !savedNote)}
                        >
                          Xóa
                        </button>
                        <div className="flex items-center gap-2">
                          {noteSaving && (
                            <span className="text-xs text-blue-500">Đang lưu...</span>
                          )}
                          {!noteSaving && note.trim() === savedNote && savedNote && (
                            <span className="text-xs text-green-500">Đã lưu</span>
                          )}
                          <button
                            className="px-4 py-1.5 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            onClick={handleSaveNote}
                            disabled={noteSaving || noteLoading || note.trim() === savedNote}
                          >
                            {noteSaving ? "Đang lưu..." : "Lưu"}
                          </button>
                        </div>
                      </div>
                    </>
                  )}
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
