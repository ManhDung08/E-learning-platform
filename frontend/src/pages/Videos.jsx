import React, { useEffect, useState, useRef } from "react";

const Videos = ({ courseId }) => {
  const [modules, setModules] = useState([]);
  const [selectedModule, setSelectedModule] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [note, setNote] = useState("");
  const videoRef = useRef(null);

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

  // helpers for comments per lesson (stored in localStorage)
  const commentsKey = (id) => `lesson_comments_${id}`;

  const loadComments = (id) => {
    try {
      const raw = localStorage.getItem(commentsKey(id));
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  };

  const [comments, setComments] = useState(() => selectedLesson ? loadComments(selectedLesson.id) : []);
  const [commentInput, setCommentInput] = useState("");
  const [commentAuthor, setCommentAuthor] = useState("");

  // reload comments when changing lesson
  useEffect(() => {
    if (!selectedLesson) return;
    setComments(loadComments(selectedLesson.id));
  }, [selectedLesson]);

  const addComment = () => {
    if (!commentInput.trim()) return;
    const c = {
      id: Date.now().toString(),
      author: commentAuthor?.trim() || "Khách",
      text: commentInput.trim(),
      createdAt: new Date().toISOString(),
    };
    const next = [c, ...comments];
    setComments(next);
    localStorage.setItem(commentsKey(selectedLesson.id), JSON.stringify(next));
    setCommentInput("");
  };

  const removeComment = (id) => {
    const next = comments.filter((c) => c.id !== id);
    setComments(next);
    localStorage.setItem(commentsKey(selectedLesson.id), JSON.stringify(next));
  };

  if (loading) return <div className="w-full min-h-screen bg-gray-50 flex items-center justify-center">Đang tải...</div>;
  if (error) return <div className="w-full min-h-screen bg-gray-50 flex items-center justify-center text-red-500">{error}</div>;

  return (
    <div className="w-full min-h-screen bg-gray-50">
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
                      src={selectedLesson?.videoKey}
                    >
                      Your browser does not support the video tag.
                    </video>
                  </div>

                  <div className="p-4 bg-white border-t">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h2 className="text-lg font-semibold">{selectedLesson?.title}</h2>
                        <p className="text-sm text-gray-500 mt-1">Duration: {selectedLesson?.duration || 'N/A'}</p>
                      </div>
                      <div className="text-sm text-gray-400">ID: {selectedLesson?.id}</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded shadow p-4">
                  <h3 className="font-medium mb-3">Bình luận</h3>

                  <div className="space-y-2 mb-3">
                    <input
                      value={commentAuthor}
                      onChange={(e) => setCommentAuthor(e.target.value)}
                      placeholder="Tên của bạn (tùy chọn)"
                      className="w-full border border-gray-200 rounded p-2 text-sm"
                    />
                    <textarea
                      value={commentInput}
                      onChange={(e) => setCommentInput(e.target.value)}
                      placeholder="Viết bình luận..."
                      className="w-full h-24 border border-gray-200 rounded p-2 text-sm resize-y"
                    />
                    <div className="flex justify-end">
                      <button
                        onClick={addComment}
                        className="bg-indigo-600 text-white px-3 py-1.5 rounded text-sm hover:bg-indigo-700"
                      >
                        Gửi
                      </button>
                    </div>
                  </div>

                  <div className="divide-y max-h-56 overflow-y-auto">
                    {comments.length === 0 && <div className="text-sm text-gray-500">Chưa có bình luận nào.</div>}
                    {comments.map((c) => (
                      <div key={c.id} className="py-2 flex justify-between items-start gap-2">
                        <div>
                          <div className="text-sm font-medium">{c.author}</div>
                          <div className="text-sm text-gray-800">{c.text}</div>
                          <div className="text-xs text-gray-400 mt-1">{new Date(c.createdAt).toLocaleString()}</div>
                        </div>
                        <div>
                          <button className="text-xs text-red-500" onClick={() => removeComment(c.id)}>Xóa</button>
                        </div>
                      </div>
                    ))}
                  </div>
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
                            {l.videoKey ? 'Video' : 'No Video'}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-sm text-gray-800">{l.title}</div>
                            <div className="text-xs text-gray-500">{l.duration || 'N/A'}</div>
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
