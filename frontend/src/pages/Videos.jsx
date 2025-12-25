import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";

import LessonQuiz from "../components/lesson/LessonQuiz";
import CourseCompletionModal from "../components/modal/CourseCompletionModal";
import IncompleteCourseModal from "../components/modal/IncompleteCourseModal";
import api from "../Redux/api";
import { generateCertificatePDF, uploadCertificatePDF, downloadCertificatePDF } from "../utils/certificateGenerator";

const Videos = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [modules, setModules] = useState([]);
  const [selectedModule, setSelectedModule] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [expandedModules, setExpandedModules] = useState({}); // Track which modules are expanded
  const [modulesWithLessons, setModulesWithLessons] = useState({}); // Store lessons for each module
  const [loading, setLoading] = useState(true);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [error, setError] = useState(null);
  const [note, setNote] = useState("");
  const [savedNote, setSavedNote] = useState(""); // Track saved note content
  const [noteLoading, setNoteLoading] = useState(false);
  const [noteSaving, setNoteSaving] = useState(false);
  const [noteError, setNoteError] = useState(null);
  const [lastSavedTime, setLastSavedTime] = useState(null);
  const [currentMaxWatchedSeconds, setCurrentMaxWatchedSeconds] = useState(0); // State for UI updates
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [showIncompleteModal, setShowIncompleteModal] = useState(false);
  const [incompleteLessons, setIncompleteLessons] = useState(0);
  const [incompleteQuizzes, setIncompleteQuizzes] = useState(0);
  const [courseName, setCourseName] = useState("");
  const [isGeneratingCertificate, setIsGeneratingCertificate] = useState(false);
  const videoRef = useRef(null);
  const lastUpdateTimeRef = useRef(0);
  const maxWatchedSecondsRef = useRef(0); // Track maximum watched seconds (never decrease)
  const isInitialLoadRef = useRef(true); // Track if this is the first load of the lesson
  const wasPlayingRef = useRef(false); // Track if video was playing before visibility change
  const previousTimeRef = useRef(0); // Track previous time to detect seeking
  const isSeekingRef = useRef(false); // Track if video is currently seeking

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
        
        // Fetch course details
        const courseResponse = await fetch(`http://localhost:3000/api/course/${courseId}`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        if (courseResponse.ok) {
          const courseResult = await courseResponse.json();
          const fetchedCourseName = courseResult.data?.title || 'Course Title';
          setCourseName(fetchedCourseName);
          console.log('📚 Course name set in state:', fetchedCourseName);
        }
        
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
        const fetchedModules = result.data || [];
        setModules(fetchedModules);
        
        // Fetch lessons for ALL modules to display them
        const allModuleLessons = {};
        for (const module of fetchedModules) {
          try {
            const lessonsResponse = await fetch(`http://localhost:3000/api/lesson/module/${module.id}`, {
              method: 'GET',
              credentials: 'include',
              headers: {
                'Content-Type': 'application/json'
              }
            });
            if (lessonsResponse.ok) {
              const lessonsResult = await lessonsResponse.json();
              allModuleLessons[module.id] = lessonsResult.data || [];
            }
          } catch (err) {
            console.error(`Error fetching lessons for module ${module.id}:`, err);
          }
        }
        setModulesWithLessons(allModuleLessons);
        
        // Auto-expand first module and set it as selected
        if (fetchedModules.length > 0) {
          setSelectedModule(fetchedModules[0]);
          setExpandedModules({ [fetchedModules[0].id]: true });
          
          // Set first lesson of first module as selected
          const firstModuleLessons = allModuleLessons[fetchedModules[0].id] || [];
          if (firstModuleLessons.length > 0) {
            setLessons(firstModuleLessons);
            setSelectedLesson(firstModuleLessons[0]);
          }
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

  // Fetch lessons for selected module (includes progress data automatically)
  useEffect(() => {
    const fetchLessons = async () => {
      if (!selectedModule) return;
      
      // Check if we already have lessons for this module
      if (modulesWithLessons[selectedModule.id]) {
        setLessons(modulesWithLessons[selectedModule.id]);
        if (modulesWithLessons[selectedModule.id].length > 0 && !selectedLesson) {
          setSelectedLesson(modulesWithLessons[selectedModule.id][0]);
        }
        return;
      }
      
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
        const fetchedLessons = result.data || [];
        
        setLessons(fetchedLessons);
        setModulesWithLessons(prev => ({ ...prev, [selectedModule.id]: fetchedLessons }));
        
        if (fetchedLessons.length > 0 && !selectedLesson) {
          setSelectedLesson(fetchedLessons[0]);
        }
      } catch (err) {
        console.error(err);
        setError(err.message);
      }
    };
    fetchLessons();
  }, [selectedModule]);

  // Fetch detailed lesson data when lesson is selected to get latest progress
  useEffect(() => {
    if (!selectedLesson?.id) return;

    const fetchLessonDetails = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/lesson/${selectedLesson.id}`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        if (!response.ok) {
          throw new Error('Không thể tải lesson details');
        }
        const result = await response.json();
        const lessonData = result.data;
        
        // Update selected lesson with latest progress data
        setSelectedLesson(lessonData);
        
        // Also update in lessons array
        setLessons(prevLessons => 
          prevLessons.map(l => 
            l.id === lessonData.id ? lessonData : l
          )
        );

        // Initialize maxWatchedSeconds from fetched progress
        maxWatchedSecondsRef.current = lessonData.progress?.watchedSeconds || 0;
        setCurrentMaxWatchedSeconds(lessonData.progress?.watchedSeconds || 0);
        isInitialLoadRef.current = true;
      } catch (err) {
        console.error('Error fetching lesson details:', err);
      }
    };

    fetchLessonDetails();
  }, [selectedLesson?.id]);

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

  // Setup video progress tracking with resume, increasing-only progress, and visibility handling
  useEffect(() => {
    if (!selectedLesson || !videoRef.current) return;

    const video = videoRef.current;

    // Resume from last watched position on initial load
    if (isInitialLoadRef.current && selectedLesson.progress?.watchedSeconds) {
      video.currentTime = selectedLesson.progress.watchedSeconds;
      previousTimeRef.current = selectedLesson.progress.watchedSeconds;
      isInitialLoadRef.current = false;
    }

    const handleTimeUpdate = () => {
      const currentTime = Math.floor(video.currentTime);
      const duration = Math.floor(video.duration);

      // Skip update if video is seeking
      if (isSeekingRef.current) {
        return;
      }

      // Check if this is continuous playback (time difference <= 2 seconds)
      // This prevents progress update when user fast-forwards
      const timeDifference = currentTime - previousTimeRef.current;
      const isContinuousPlayback = timeDifference >= 0 && timeDifference <= 2;

      // Only update max watched seconds if it's continuous playback and moving forward
      if (isContinuousPlayback && currentTime > maxWatchedSecondsRef.current) {
        maxWatchedSecondsRef.current = currentTime;
        setCurrentMaxWatchedSeconds(currentTime); // Update state for UI

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
          
          setSelectedLesson(prev => ({
            ...prev,
            progress: { ...prev.progress, watchedSeconds: currentTime, lastAccessedAt: new Date() }
          }));
        }
      }

      // Update previous time for next comparison
      previousTimeRef.current = currentTime;

      // Check if video is near completion (95% watched) or fully watched
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
        
        // Check if this is the final lesson and trigger completion check
        // The check will only proceed if this is the final lesson without quiz
        setTimeout(() => checkCourseCompletionForFinalLesson(), 500);
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
      
      // Check if this is the final lesson and trigger completion check
      setTimeout(() => checkCourseCompletionForFinalLesson(), 500);
    };

    // Handle seeking: prevent fast-forward beyond max watched + 5 seconds
    const handleSeeking = () => {
      isSeekingRef.current = true;
      const currentSeekTime = Math.floor(video.currentTime);
      const maxAllowedSeekTime = maxWatchedSecondsRef.current + 5;

      // If user tries to seek forward beyond allowed limit, restrict them
      if (currentSeekTime > maxAllowedSeekTime) {
        video.currentTime = maxAllowedSeekTime;
      }
    };

    const handleSeeked = () => {
      // Update previousTime after seeking is complete
      previousTimeRef.current = Math.floor(video.currentTime);
      isSeekingRef.current = false;
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('seeking', handleSeeking);
    video.addEventListener('seeked', handleSeeked);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('seeking', handleSeeking);
      video.removeEventListener('seeked', handleSeeked);
      lastUpdateTimeRef.current = 0;
    };
  }, [selectedLesson]);

  // Handle visibility change: pause video when user leaves tab, resume when returning
  useEffect(() => {
    const handleVisibilityChange = () => {
      const video = videoRef.current;
      if (!video) return;

      if (document.visibilityState === 'hidden') {
        // User switched to another tab - check if video is currently playing
        if (!video.paused && !video.ended) {
          wasPlayingRef.current = true;
          video.pause();
        }
      } else if (document.visibilityState === 'visible') {
        // User returned to tab - resume playing if video was playing before
        if (wasPlayingRef.current) {
          const playPromise = video.play();
          if (playPromise !== undefined) {
            playPromise.catch(err => {
              console.log('Auto-play prevented:', err);
            });
          }
          wasPlayingRef.current = false;
        }
      }
    };

    // Also handle window blur/focus as backup
    const handleBlur = () => {
      const video = videoRef.current;
      if (video && !video.paused && !video.ended) {
        wasPlayingRef.current = true;
        video.pause();
      }
    };

    const handleFocus = () => {
      const video = videoRef.current;
      if (video && wasPlayingRef.current) {
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise.catch(err => {
            console.log('Auto-play prevented:', err);
          });
        }
        wasPlayingRef.current = false;
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // Save progress before unmount or when user closes tab
  useEffect(() => {
    const saveProgressOnExit = () => {
      if (selectedLesson && maxWatchedSecondsRef.current > 0) {
        // Use fetch with keepalive for reliable delivery on page unload
        // Note: sendBeacon doesn't support PATCH method, so we use fetch
        try {
          fetch(`http://localhost:3000/api/lesson/${selectedLesson.id}/progress`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              watchedSeconds: maxWatchedSecondsRef.current,
              isCompleted: selectedLesson.progress?.isCompleted || false
            }),
            credentials: 'include',
            keepalive: true // Keep request alive even if page is closing
          }).catch(err => {
            console.error('Failed to save progress on exit:', err);
          });
        } catch (err) {
          console.error('Error saving progress on exit:', err);
        }
      }
    };

    // Save on beforeunload (user closing tab/window)
    window.addEventListener('beforeunload', saveProgressOnExit);

    // Save on component unmount
    return () => {
      window.removeEventListener('beforeunload', saveProgressOnExit);
      saveProgressOnExit();
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
        setLastSavedTime(new Date());
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

  const onSelectModule = (module, moduleIndex) => {
    // Check if module is locked
    if (isModuleLocked(module, moduleIndex)) {
      return; // Don't allow selection
    }
    
    setSelectedModule(module);
    
    // Expand/collapse the clicked module
    setExpandedModules(prev => ({
      ...prev,
      [module.id]: !prev[module.id]
    }));
    
    // Update lessons for the selected module
    const moduleLessons = modulesWithLessons[module.id] || [];
    setLessons(moduleLessons);
    
    // Select first unlocked lesson in the module
    const firstUnlockedLesson = moduleLessons.find((lesson, idx) => !isLessonLocked(lesson, moduleLessons));
    if (firstUnlockedLesson) {
      onSelectLesson(firstUnlockedLesson, moduleLessons);
    }
  };

  const isLessonLocked = (lesson, moduleLessons) => {
    const lessonIndex = moduleLessons.findIndex(l => l.id === lesson.id);
    
    // Find which module this lesson belongs to
    let currentModuleIndex = -1;
    for (let i = 0; i < modules.length; i++) {
      const modLessons = modulesWithLessons[modules[i].id] || [];
      if (modLessons.some(l => l.id === lesson.id)) {
        currentModuleIndex = i;
        break;
      }
    }
    
    // Check if this is the first lesson of the first module
    if (currentModuleIndex === 0 && lessonIndex === 0) return false; // First lesson of first module is always unlocked
    
    // Check if all previous lessons in current module are completed
    for (let i = 0; i < lessonIndex; i++) {
      if (!moduleLessons[i].progress?.isCompleted) {
        return true; // Previous lesson not completed, so this is locked
      }
    }
    
    // If this is the first lesson of a module (but not first module), check if previous module is completed
    if (lessonIndex === 0 && currentModuleIndex > 0) {
      const previousModule = modules[currentModuleIndex - 1];
      const previousModuleLessons = modulesWithLessons[previousModule.id] || [];
      
      if (previousModuleLessons.length === 0) return true;
      
      // Check if all lessons in previous module are completed
      return !previousModuleLessons.every(l => l.progress?.isCompleted);
    }
    
    return false; // All previous lessons completed
  };

  const isModuleLocked = (module, moduleIndex) => {
    if (moduleIndex === 0) return false; // First module is always unlocked
    
    // Check if all lessons in previous module are completed
    const previousModule = modules[moduleIndex - 1];
    const previousModuleLessons = modulesWithLessons[previousModule.id] || [];
    
    if (previousModuleLessons.length === 0) return true; // If no lessons fetched, keep locked
    
    return !previousModuleLessons.every(l => l.progress?.isCompleted);
  };

  const onSelectLesson = (lesson, moduleLessons) => {
    // Check if lesson is locked
    if (isLessonLocked(lesson, moduleLessons)) {
      return; // Don't allow selection
    }
    
    // Save current progress before switching using max watched seconds
    if (selectedLesson && maxWatchedSecondsRef.current > 0) {
      updateLessonProgress(selectedLesson.id, maxWatchedSecondsRef.current, selectedLesson.progress?.isCompleted || false);
    }
    
    // Find which module this lesson belongs to and update selectedModule
    const lessonModule = modules.find(module => {
      const moduleTheLessons = modulesWithLessons[module.id] || [];
      return moduleTheLessons.some(l => l.id === lesson.id);
    });
    
    if (lessonModule && lessonModule.id !== selectedModule?.id) {
      setSelectedModule(lessonModule);
      setLessons(moduleLessons);
    }
    
    setSelectedLesson(lesson);
    if (videoRef.current) {
      try { 
        videoRef.current.pause(); 
      } catch {
        // Ignore errors if video cannot be paused
      }
    }
    
    // Reset tracking refs for new lesson
    lastUpdateTimeRef.current = 0;
    maxWatchedSecondsRef.current = 0;
    setCurrentMaxWatchedSeconds(0);
    isInitialLoadRef.current = true;
    previousTimeRef.current = 0;
    isSeekingRef.current = false;
  };

  const toggleModule = (moduleId) => {
    setExpandedModules(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId]
    }));
  };

  // Check if all lessons (videos) and quizzes are completed
  const checkFullCourseCompletion = async () => {
    let incompleteLessonCount = 0;
    let incompleteQuizCount = 0;

    console.log('=== Starting Full Course Completion Check ===');

    // Check all lessons are completed
    for (const module of modules) {
      const moduleLessons = modulesWithLessons[module.id] || [];
      
      for (const lesson of moduleLessons) {
        if (!lesson.progress?.isCompleted) {
          incompleteLessonCount++;
          console.log(`Incomplete lesson found: ${lesson.title} (ID: ${lesson.id})`);
        }
      }
    }

    console.log(`Total incomplete lessons: ${incompleteLessonCount}`);

    // Check all quizzes are completed - fetch quiz attempts for user
    try {
      const quizAttemptsResponse = await api.get('/quiz/me/attempts');
      const userAttempts = quizAttemptsResponse.data?.data || [];
      
      console.log(`User has ${userAttempts.length} quiz attempts`);

      // Get all quizzes for all lessons
      for (const module of modules) {
        const moduleLessons = modulesWithLessons[module.id] || [];
        
        for (const lesson of moduleLessons) {
          try {
            const quizzesResponse = await api.get(`/quiz/lessons/${lesson.id}/quizzes`);
            const lessonQuizzes = quizzesResponse.data?.data || [];
            
            console.log(`Lesson "${lesson.title}" has ${lessonQuizzes.length} quizzes`);
            
            // Check if each quiz has a completed attempt
            for (const quiz of lessonQuizzes) {
              const hasCompleted = userAttempts.some(attempt => 
                attempt.quizId === quiz.id && (attempt.completedAt || attempt.score != null)
              );
              
              if (!hasCompleted) {
                incompleteQuizCount++;
                console.log(`Incomplete quiz found: "${quiz.title}" (ID: ${quiz.id}) in lesson "${lesson.title}"`);
              } else {
                console.log(`Quiz completed: "${quiz.title}" (ID: ${quiz.id})`);
              }
            }
          } catch (err) {
            // If 404, it means no quizzes for this lesson - that's OK, skip it
            if (err.response?.status === 404) {
              console.log(`No quizzes found for lesson "${lesson.title}" (404) - OK`);
            } else {
              console.error(`Error fetching quizzes for lesson ${lesson.id}:`, err);
            }
          }
        }
      }
    } catch (err) {
      console.error('Error fetching quiz attempts:', err);
    }

    console.log(`Total incomplete quizzes: ${incompleteQuizCount}`);
    console.log('=== Full Course Completion Check Complete ===');

    setIncompleteLessons(incompleteLessonCount);
    setIncompleteQuizzes(incompleteQuizCount);

    const isComplete = incompleteLessonCount === 0 && incompleteQuizCount === 0;
    console.log(`Course completion status: ${isComplete ? 'COMPLETE' : 'INCOMPLETE'}`);
    return { isComplete, incompleteLessonCount, incompleteQuizCount };
  };

  // Check if certificate exists for this course
  const checkCertificateExists = async (courseId) => {
    try {
      console.log('Checking if certificate exists for courseId:', courseId);
      const response = await api.get('/certificate/me');
      if (response.data && response.data.success) {
        const certificates = response.data.data || [];
        console.log('User certificates:', certificates);
        const exists = certificates.some(cert => cert.courseId === parseInt(courseId));
        console.log('Certificate exists:', exists);
        return exists;
      }
      return false;
    } catch (error) {
      console.error('Error checking certificate:', error);
      return false;
    }
  };

  // Generate and upload certificate
  const generateAndUploadCertificate = async (userId, userName, courseId, courseName) => {
    try {
      setIsGeneratingCertificate(true);
      console.log('=== CERTIFICATE GENERATION START ===');
      console.log('📋 Parameters received:', { 
        userId, 
        userName, 
        courseId, 
        courseName: courseName,
        courseNameLength: courseName?.length,
        courseNameType: typeof courseName
      });
      
      // First check if certificate already exists
      const exists = await checkCertificateExists(courseId);
      if (exists) {
        console.log('Certificate already exists for this course');
        return { success: true, alreadyExists: true };
      }
      
      // ALWAYS fetch fresh course name to ensure accuracy
      console.log('🔍 Fetching fresh course title from backend...');
      console.log('Current courseName from parameter:', courseName);
      
      // First priority: use the courseName passed as parameter (from state)
      let validatedCourseName = courseName;
      
      // If parameter is empty or default, fetch from API
      if (!validatedCourseName || validatedCourseName.trim() === '' || validatedCourseName === 'Course Title') {
        console.log('Parameter courseName is empty/default, fetching from API...');
        validatedCourseName = await fetchCourseName(courseId);
        console.log('Fetched course title from API:', validatedCourseName);
      } else {
        console.log('Using courseName from parameter:', validatedCourseName);
      }
      
      // Final validation
      if (!validatedCourseName || validatedCourseName.trim() === '' || validatedCourseName === 'Completed Course') {
        console.error('CRITICAL: Could not get valid course title!');
        validatedCourseName = 'Course Completion Certificate'; // Last resort fallback
      }
      
      console.log('✅ Final validated course name:', validatedCourseName);
      
      console.log('✅ Generating new certificate PDF');
      console.log('📝 Final values being passed to PDF generator:', {
        userName,
        courseName: validatedCourseName,
        courseNameLength: validatedCourseName?.length,
        completionDate: new Date()
      });
      // Generate PDF with validated course title and current date as completion date
      const pdf = generateCertificatePDF(userName, validatedCourseName, new Date());
      
      console.log('✓ Converting PDF to file...');
      // Convert to file
      const certificateFile = await uploadCertificatePDF(pdf, `${validatedCourseName || 'certificate'}-certificate.pdf`);
      
      console.log('✓ Creating FormData and uploading to backend...');
      // Create FormData
      const formData = new FormData();
      formData.append('userId', userId);
      formData.append('courseId', courseId);
      formData.append('certificate', certificateFile);
      
      // Upload to backend
      const response = await api.post('/certificate', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      console.log('✓ Certificate uploaded successfully:', response.data);
      console.log('=== CERTIFICATE GENERATION END ===');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error generating/uploading certificate:', error);
      throw error;
    } finally {
      setIsGeneratingCertificate(false);
    }
  };

  // Helper function to fetch course name if not available
  const fetchCourseName = async (courseId) => {
    try {
      console.log('🔄 Fetching course name for courseId:', courseId);
      
      // Use fetch with credentials to match the working initial load
      const response = await fetch(`http://localhost:3000/api/course/${courseId}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        const name = result.data?.title || 'Completed Course';
        console.log('✅ Fetched course name successfully:', name);
        return name;
      } else {
        console.warn('⚠️ Response not OK, status:', response.status);
        console.log('Falling back to state value or default');
        return 'Completed Course';
      }
    } catch (error) {
      console.error('❌ Error fetching course name:', error);
      return 'Completed Course';
    }
  };

  // Modified completion check
  const checkCourseCompletion = () => {
    // Check if all lessons in all modules are completed
    for (const module of modules) {
      const moduleLessons = modulesWithLessons[module.id] || [];
      if (moduleLessons.length === 0) return false;
      
      for (const lesson of moduleLessons) {
        if (!lesson.progress?.isCompleted) {
          return false;
        }
      }
    }
    return true;
  };

  // Handle quiz completion for the final lesson
  const handleQuizComplete = async () => {
    console.log('handleQuizComplete called');
    // Check if all lessons and quizzes are complete
    const { isComplete, incompleteLessonCount, incompleteQuizCount } = await checkFullCourseCompletion();
    
    console.log('Course completion status:', { isComplete, incompleteLessonCount, incompleteQuizCount });
    
    if (isComplete) {
      console.log('Course is complete! Checking/generating certificate...');
      // Generate and upload certificate
      try {
        const userResponse = await api.get('/user/me');
        const userData = userResponse.data?.data;
        
        console.log('User data:', userData);
        console.log('🔍 BEFORE CERTIFICATE GENERATION - courseName state value:', courseName);
        
        if (userData) {
          // Check if certificate exists, if not generate it
          const certExists = await checkCertificateExists(courseId);
          if (!certExists) {
            await generateAndUploadCertificate(
              userData.id,
              userData.fullname || userData.email,
              courseId,
              courseName
            );
            console.log('Certificate created successfully');
          } else {
            console.log('Certificate already exists, skipping generation');
          }
        }
        
        // Show completion modal
        console.log('Showing completion modal');
        setShowCompletionModal(true);
      } catch (error) {
        console.error('Error in completion process:', error);
        // Show completion modal even if certificate generation fails
        setShowCompletionModal(true);
      }
    } else {
      console.log('Course incomplete, showing incomplete modal');
      // Show incomplete modal
      setShowIncompleteModal(true);
    }
  };

  const handleNextLesson = async () => {
    if (!selectedLesson || !lessons.length) return;

    const currentIndex = lessons.findIndex(l => l.id === selectedLesson.id);
    
    if (currentIndex !== -1 && currentIndex < lessons.length - 1) {
        // Move to next lesson in current module
        const nextLesson = lessons[currentIndex + 1];
        onSelectLesson(nextLesson, lessons);
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
        // Last lesson of current module - try to move to first lesson of next module
        const currentModuleIndex = modules.findIndex(m => m.id === selectedModule?.id);
        
        if (currentModuleIndex !== -1 && currentModuleIndex < modules.length - 1) {
            // There is a next module
            const nextModule = modules[currentModuleIndex + 1];
            const nextModuleLessons = modulesWithLessons[nextModule.id] || [];
            
            if (nextModuleLessons.length > 0 && !isModuleLocked(nextModule, currentModuleIndex + 1)) {
                // Select next module and its first lesson
                setSelectedModule(nextModule);
                setExpandedModules(prev => ({
                  ...prev,
                  [nextModule.id]: true
                }));
                setLessons(nextModuleLessons);
                
                const firstLesson = nextModuleLessons[0];
                onSelectLesson(firstLesson, nextModuleLessons);
                
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                alert("The next module is locked. Please complete the current module first.");
            }
        }
        // Note: For last lesson of last module, we don't do anything here
        // The completion check will be handled by the continuous monitoring useEffect
    }
  };

  // Check course completion when final lesson video is completed (only if no quiz exists)
  const checkCourseCompletionForFinalLesson = async () => {
    console.log('Checking course completion for final lesson');
    
    // Check if this is the final lesson
    const currentModuleIndex = modules.findIndex(m => m.id === selectedModule?.id);
    const isLastModule = currentModuleIndex === modules.length - 1;
    
    // Use modulesWithLessons to get the correct lessons for the current module
    const currentModuleLessons = selectedModule ? (modulesWithLessons[selectedModule.id] || []) : [];
    const currentLessonIndex = currentModuleLessons.findIndex(l => l.id === selectedLesson?.id);
    const isLastLesson = currentLessonIndex === currentModuleLessons.length - 1;
    
    console.log('Final lesson check:', { 
      currentModuleIndex, 
      isLastModule, 
      currentLessonIndex, 
      isLastLesson,
      totalModules: modules.length,
      totalLessonsInModule: currentModuleLessons.length
    });
    
    if (!isLastModule || !isLastLesson) {
      console.log('Not the final lesson, skipping completion check');
      return; // Not the final lesson, don't check
    }
    
    // Check if final lesson has quizzes
    try {
      console.log('Fetching quizzes for lesson:', selectedLesson.id);
      const quizzesResponse = await api.get(`/quiz/lessons/${selectedLesson.id}/quizzes`);
      const lessonQuizzes = quizzesResponse.data?.data || [];
      
      console.log('Quizzes found for final lesson:', lessonQuizzes.length);
      
      if (lessonQuizzes.length > 0) {
        console.log('Final lesson has quizzes, completion check will happen after quiz');
        return; // Has quizzes, completion will be checked after quiz is done
      }
      
      // No quizzes on final lesson, check full completion now
      console.log('Final lesson has no quizzes, checking full completion');
      const { isComplete, incompleteLessonCount, incompleteQuizCount } = await checkFullCourseCompletion();
      
      console.log('Full completion check result:', { isComplete, incompleteLessonCount, incompleteQuizCount });
      
      if (isComplete) {
        console.log('Course is complete! Checking/generating certificate...');
        try {
          const userResponse = await api.get('/user/me');
          const userData = userResponse.data?.data;
          
          if (userData) {
            // Check if certificate exists, if not generate it
            const certExists = await checkCertificateExists(courseId);
            if (!certExists) {
              await generateAndUploadCertificate(
                userData.id,
                userData.fullname || userData.email,
                courseId,
                courseName
              );
            } else {
              console.log('Certificate already exists, skipping generation');
            }
          }
          
          console.log('Setting completion modal to true');
          setShowCompletionModal(true);
        } catch (error) {
          console.error('Error in completion process:', error);
          console.log('Setting completion modal to true (after error)');
          setShowCompletionModal(true);
        }
      } else {
        console.log('Course incomplete, showing incomplete modal');
        setShowIncompleteModal(true);
      }
    } catch (error) {
      // If 404 or no quizzes found, treat as no quizzes and check completion
      console.log('Error fetching quizzes (likely 404 - no quizzes exist), treating as no quizzes');
      console.log('Final lesson has no quizzes, checking full completion');
      
      try {
        const { isComplete, incompleteLessonCount, incompleteQuizCount } = await checkFullCourseCompletion();
        
        console.log('Full completion check result:', { isComplete, incompleteLessonCount, incompleteQuizCount });
        
        if (isComplete) {
          console.log('Course is complete! Checking/generating certificate...');
          try {
            const userResponse = await api.get('/user/me');
            const userData = userResponse.data?.data;
            
            if (userData) {
              // Check if certificate exists, if not generate it
              const certExists = await checkCertificateExists(courseId);
              if (!certExists) {
                await generateAndUploadCertificate(
                  userData.id,
                  userData.fullname || userData.email,
                  courseId,
                  courseName
                );
              } else {
                console.log('Certificate already exists, skipping generation');
              }
            }
            
            console.log('Setting completion modal to true');
            setShowCompletionModal(true);
          } catch (certError) {
            console.error('Error in completion process:', certError);
            console.log('Setting completion modal to true (after error)');
            setShowCompletionModal(true);
          }
        } else {
          console.log('Course incomplete, showing incomplete modal');
          setShowIncompleteModal(true);
        }
      } catch (completionError) {
        console.error('Error checking course completion:', completionError);
      }
    }
  };

  // Show loading while checking access
  if (checkingAccess) {
    return <div className="w-full min-h-screen bg-gray-50 flex items-center justify-center">Checking access...</div>;
  }

  if (loading) return <div className="w-full min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
  if (error) return <div className="w-full min-h-screen bg-gray-50 flex items-center justify-center text-red-500">{error}</div>;

  return (
    <div className="w-full bg-gray-50">
      <div className="p-6 pb-8">
        <h1 className="text-2xl font-bold mb-6 text-gray-900">{selectedModule?.title || 'Select a module'}</h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left column: video + quiz stacked */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            {selectedLesson && (
              <>
                <div className="rounded-lg shadow overflow-hidden bg-black">
                  <div className="w-full h-[260px] md:h-[420px] lg:h-[540px]">
                    <video
                      ref={videoRef}
                      key={selectedLesson?.id}
                      controls
                      controlsList="nodownload nopictureinpicture"
                      disablePictureInPicture
                      className="w-full h-full object-contain bg-black"
                      src={selectedLesson?.videoUrl}
                    >
                      Your browser does not support the video tag.
                    </video>
                  </div>

                  <div className="p-4 bg-white border-t">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h2 className="text-lg font-semibold text-gray-900">{selectedLesson?.title}</h2>
                          {selectedLesson?.progress?.isCompleted && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-200">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                              </svg>
                              Completed
                            </span>
                          )}
                        </div>
                        
                        {/* Progress Bar */}
                        {selectedLesson?.durationSeconds > 0 && (
                          <div className="mt-3">
                            <div className="flex items-center justify-between text-xs text-gray-600 mb-1.5">
                              <span className="font-medium">
                                {formatDuration(Math.max(selectedLesson?.progress?.watchedSeconds || 0, currentMaxWatchedSeconds))} / {formatDuration(selectedLesson?.durationSeconds)}
                              </span>
                              <span className="font-semibold text-blue-600">
                                {Math.min(100, Math.round(((Math.max(selectedLesson?.progress?.watchedSeconds || 0, currentMaxWatchedSeconds)) / selectedLesson?.durationSeconds) * 100))}%
                              </span>
                            </div>
                            <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className={`h-full transition-all duration-300 ${
                                  selectedLesson?.progress?.isCompleted ? 'bg-emerald-500' : 'bg-blue-600'
                                }`}
                                style={{ 
                                  width: `${Math.min(100, ((Math.max(selectedLesson?.progress?.watchedSeconds || 0, currentMaxWatchedSeconds)) / selectedLesson?.durationSeconds) * 100)}%` 
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow border border-gray-200">
                  <div className="px-4 py-3 border-b border-gray-200 bg-slate-50">
                    <h3 className="font-semibold text-gray-900 text-base">Lesson Quiz</h3>
                  </div>
                  <div className="p-6">
                    <LessonQuiz 
                      key={selectedLesson.id} 
                      lessonId={selectedLesson.id}
                      isVideoCompleted={selectedLesson?.progress?.isCompleted || false}
                      isLastLesson={(() => {
                        const currentModuleIndex = modules.findIndex(m => m.id === selectedModule?.id);
                        const isLastModule = currentModuleIndex === modules.length - 1;
                        
                        // Use modulesWithLessons to get the correct lessons for the current module
                        const currentModuleLessons = selectedModule ? (modulesWithLessons[selectedModule.id] || []) : [];
                        const currentLessonIndex = currentModuleLessons.findIndex(l => l.id === selectedLesson?.id);
                        const isLastLesson = currentLessonIndex === currentModuleLessons.length - 1;
                        
                        const result = isLastModule && isLastLesson;
                        console.log('Calculating isLastLesson:', {
                          currentModuleIndex,
                          totalModules: modules.length,
                          isLastModule,
                          currentLessonIndex,
                          totalLessons: currentModuleLessons.length,
                          isLastLesson,
                          finalResult: result
                        });
                        return result;
                      })()}
                      onNextLesson={handleNextLesson}
                      onQuizComplete={async () => {
                        // Always check completion when quiz is done, regardless of which lesson
                        // This handles the case where final lesson has a quiz
                        const currentModuleIndex = modules.findIndex(m => m.id === selectedModule?.id);
                        const currentLessonIndex = lessons.findIndex(l => l.id === selectedLesson?.id);
                        const isLastModule = currentModuleIndex === modules.length - 1;
                        const isLastLesson = currentLessonIndex === lessons.length - 1;
                        
                        if (isLastModule && isLastLesson) {
                          // This is the final lesson with quiz - check full completion
                          console.log('Final lesson quiz completed, checking full course completion');
                          await handleQuizComplete();
                        }
                      }}
                    />
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Right column: Course content (modules + lessons) and notes */}
          <aside className="lg:col-span-4">
            <div className="space-y-4 sticky top-6">
              {/* Course Content - Combined Modules and Lessons */}
              <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
                <div className="bg-slate-800 px-4 py-3.5 border-b border-slate-700">
                  <h3 className="font-semibold text-white text-base">Course Content</h3>
                </div>
                
                <div className="max-h-[calc(100vh-300px)] overflow-y-auto">
                  {modules.map((module, moduleIndex) => {
                    const moduleLessons = modulesWithLessons[module.id] || [];
                    const isExpanded = expandedModules[module.id];
                    const completedCount = moduleLessons.filter(l => l.progress?.isCompleted).length;
                    const totalLessons = moduleLessons.length;
                    const isModuleDisabled = isModuleLocked(module, moduleIndex);
                    
                    return (
                      <div key={module.id} className="border-b border-gray-200 last:border-b-0">
                        {/* Module Header */}
                        <div
                          className={`flex items-start gap-3 p-4 transition-colors relative ${
                            isModuleDisabled
                              ? 'bg-gray-50 opacity-60'
                              : selectedModule?.id === module.id
                              ? 'bg-blue-50 border-l-4 border-blue-600 cursor-pointer'
                              : 'hover:bg-gray-50 cursor-pointer'
                          }`}
                          onClick={() => onSelectModule(module, moduleIndex)}
                        >
                          {isModuleDisabled && (
                            <div className="absolute top-3 right-3">
                              <div className="flex items-center gap-1 px-2 py-1 bg-gray-200 rounded-md">
                                <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
                                </svg>
                                <span className="text-xs font-medium text-gray-600">Locked</span>
                              </div>
                            </div>
                          )}
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleModule(module.id);
                            }}
                            className="mt-1 flex-shrink-0 transition-transform text-gray-600 hover:text-gray-800"
                          >
                            <svg
                              className={`w-5 h-5 transition-transform duration-200 ${
                                isExpanded ? 'transform rotate-90' : ''
                              }`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </button>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <h4 className={`font-semibold text-sm leading-tight ${
                                isModuleDisabled ? 'text-gray-500' : 'text-gray-900'
                              }`}>
                                {moduleIndex + 1}. {module.title}
                              </h4>
                              {totalLessons > 0 && (
                                <span className={`text-xs whitespace-nowrap flex-shrink-0 font-medium ${
                                  completedCount === totalLessons ? 'text-emerald-600' : 'text-gray-500'
                                }`}>
                                  {completedCount}/{totalLessons}
                                </span>
                              )}
                            </div>
                            {module.description && (
                              <p className={`text-xs mt-1 line-clamp-2 ${
                                isModuleDisabled ? 'text-gray-400' : 'text-gray-600'
                              }`}>
                                {module.description}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Lessons List */}
                        {isExpanded && moduleLessons.length > 0 && (
                          <div className="bg-gray-50">
                            {moduleLessons.map((lesson, lessonIndex) => {
                              const isSelected = selectedLesson?.id === lesson.id;
                              // Use currentMaxWatchedSeconds for selected lesson to show real-time progress
                              const watchedSeconds = isSelected 
                                ? Math.max(lesson.progress?.watchedSeconds || 0, currentMaxWatchedSeconds)
                                : (lesson.progress?.watchedSeconds || 0);
                              const progressPercent = lesson.durationSeconds > 0
                                ? Math.min(100, (watchedSeconds / lesson.durationSeconds) * 100)
                                : 0;
                              const isLocked = isLessonLocked(lesson, moduleLessons);

                              return (
                                <div
                                  key={lesson.id}
                                  className={`flex items-start gap-3 pl-12 pr-4 py-3 transition-colors border-t border-gray-200 relative ${
                                    isLocked
                                      ? 'bg-gray-100 opacity-60 cursor-not-allowed'
                                      : isSelected
                                      ? 'bg-blue-100 border-l-4 border-blue-600 cursor-pointer'
                                      : 'hover:bg-gray-100 cursor-pointer'
                                  }`}
                                  onClick={() => !isLocked && onSelectLesson(lesson, moduleLessons)}
                                >
                                  {isLocked && (
                                    <div className="absolute top-2 right-3">
                                      <div className="flex items-center gap-1 px-2 py-1 bg-gray-200 rounded-md">
                                        <svg className="w-3.5 h-3.5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                                          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
                                        </svg>
                                        <span className="text-xs font-medium text-gray-600">Locked</span>
                                      </div>
                                    </div>
                                  )}
                                  
                                  {/* Play/Check Icon */}
                                  <div className="flex-shrink-0 mt-0.5">
                                    {lesson.progress?.isCompleted ? (
                                      <svg className="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path
                                          fillRule="evenodd"
                                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                          clipRule="evenodd"
                                        />
                                      </svg>
                                    ) : (
                                      <svg className={`w-5 h-5 ${isLocked ? 'text-gray-400' : 'text-gray-500'}`} fill="currentColor" viewBox="0 0 20 20">
                                        <path
                                          fillRule="evenodd"
                                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                                          clipRule="evenodd"
                                        />
                                      </svg>
                                    )}
                                  </div>

                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2 mb-1">
                                      <h5
                                        className={`text-sm font-medium leading-tight ${
                                          isLocked ? 'text-gray-500' : isSelected ? 'text-blue-900' : 'text-gray-900'
                                        }`}
                                      >
                                        {lessonIndex + 1}. {lesson.title}
                                      </h5>
                                      <span className={`text-xs whitespace-nowrap flex-shrink-0 ${
                                        isLocked ? 'text-gray-400' : 'text-gray-600'
                                      }`}>
                                        {formatDuration(lesson.durationSeconds)}
                                      </span>
                                    </div>
                                    
                                    {lesson.content && (
                                      <p className={`text-xs mt-1 line-clamp-2 mb-2 ${
                                        isLocked ? 'text-gray-400' : 'text-gray-600'
                                      }`}>
                                        {lesson.content}
                                      </p>
                                    )}

                                    {/* Progress Bar */}
                                    {lesson.durationSeconds > 0 && (
                                      <div className={`w-full h-1 rounded-full overflow-hidden ${
                                        isLocked ? 'bg-gray-300' : 'bg-gray-200'
                                      }`}>
                                        <div
                                          className={`h-full transition-all ${
                                            lesson.progress?.isCompleted ? 'bg-emerald-500' : 'bg-blue-600'
                                          }`}
                                          style={{ width: `${progressPercent}%` }}
                                        />
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Notes */}
              {selectedLesson && (
                <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-200">
                  {/* Header */}
                  <div className="px-5 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 bg-blue-500 rounded-lg">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 text-base">Lesson Notes</h3>
                          <p className="text-xs text-gray-600 mt-0.5">Keep track of important points</p>
                        </div>
                      </div>
                      {noteError && (
                        <div className="flex items-center gap-1.5 bg-red-50 px-3 py-1.5 rounded-full">
                          <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                          <span className="text-xs text-red-600 font-medium">{noteError}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    {noteLoading ? (
                      <div className="w-full h-64 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-3"></div>
                        <span className="text-sm text-gray-500 font-medium">Loading notes...</span>
                      </div>
                    ) : (
                      <>
                        {/* Textarea with enhanced styling */}
                        <div className="relative">
                          <textarea
                            value={note}
                            onChange={(e) => {
                              setNote(e.target.value);
                              setNoteError(null);
                            }}
                            placeholder="✍️ Start writing your notes here...\n\nTip: Organize your thoughts, highlight key concepts, or jot down questions!"
                            className="w-full h-64 border-2 border-gray-300 rounded-xl p-4 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-all duration-200 placeholder-gray-400 hover:border-gray-400"
                            disabled={noteLoading}
                            style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
                          />
                          
                          {/* Character count indicator */}
                          <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full border border-gray-200 shadow-sm">
                            <span className={`text-xs font-medium ${
                              note.length > 5000 ? 'text-red-600' : 
                              note.length > 4000 ? 'text-amber-600' : 
                              'text-gray-500'
                            }`}>
                              {note.length.toLocaleString()} chars
                            </span>
                          </div>
                        </div>

                        {/* Status bar with last saved time */}
                        {lastSavedTime && note.trim() === savedNote && savedNote && (
                          <div className="mt-3 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-lg">
                            <div className="flex items-center gap-2 text-emerald-700">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                              </svg>
                              <span className="text-xs font-medium">
                                Last saved at {lastSavedTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Action buttons */}
                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                          {/* Delete button */}
                          <button
                            className="flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:text-white hover:bg-red-600 font-medium rounded-lg border-2 border-red-600 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-red-600 transition-all duration-200"
                            onClick={handleDeleteNote}
                            disabled={noteSaving || noteLoading || (!note && !savedNote)}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Clear Notes
                          </button>

                          {/* Save section */}
                          <div className="flex items-center gap-3">
                            {/* Saving indicator */}
                            {noteSaving && (
                              <div className="flex items-center gap-2 text-blue-600">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                <span className="text-xs font-medium">Saving...</span>
                              </div>
                            )}
                            
                            {/* Saved indicator */}
                            {!noteSaving && note.trim() === savedNote && savedNote && (
                              <span className="text-xs text-emerald-600 flex items-center gap-1.5 font-semibold px-3 py-1.5 bg-emerald-50 rounded-full">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                                </svg>
                                Saved
                              </span>
                            )}
                            
                            {/* Unsaved changes indicator */}
                            {!noteSaving && note.trim() !== savedNote && note.trim() && (
                              <span className="text-xs text-amber-600 flex items-center gap-1.5 font-medium px-3 py-1.5 bg-amber-50 rounded-full">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                Unsaved
                              </span>
                            )}
                            
                            {/* Save button */}
                            <button
                              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-blue-600 disabled:hover:to-indigo-600 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                              onClick={handleSaveNote}
                              disabled={noteSaving || noteLoading || note.trim() === savedNote}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                              </svg>
                              {noteSaving ? "Saving..." : "Save Notes"}
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>

      {/* Course Completion Modal */}
      <CourseCompletionModal 
        open={showCompletionModal}
        onClose={() => setShowCompletionModal(false)}
        courseName={courseName}
        isGeneratingCertificate={isGeneratingCertificate}
      />

      {/* Incomplete Course Modal */}
      <IncompleteCourseModal 
        open={showIncompleteModal}
        onClose={() => setShowIncompleteModal(false)}
        incompleteLessons={incompleteLessons}
        incompleteQuizzes={incompleteQuizzes}
      />
    </div>
  );
};

export default Videos;
