import React, { useEffect, useState, useRef } from "react";

const sampleVideos = [
  {
    id: "1",
    title: "Flower (sample)",
    src: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
    duration: "0:05",
  },
  {
    id: "2",
    title: "Big Buck Bunny",
    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    duration: "10:34",
  },
  {
    id: "3",
    title: "Sintel",
    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
    duration: "14:48",
  },
];

const Videos = () => {
  const [videos] = useState(sampleVideos);
  const [currentVideo, setCurrentVideo] = useState(sampleVideos[0]);
  const [note, setNote] = useState("");
  const videoRef = useRef(null);

  // Load saved notes for the current video
  useEffect(() => {
    if (!currentVideo) return;
    const saved = localStorage.getItem(`video_notes_${currentVideo.id}`) || "";
    setNote(saved);
  }, [currentVideo]);

  // Save notes on change
  useEffect(() => {
    if (!currentVideo) return;
    const key = `video_notes_${currentVideo.id}`;
    localStorage.setItem(key, note);
  }, [note, currentVideo]);

  const onSelect = (v) => {
    setCurrentVideo(v);
    if (videoRef.current) {
      try { videoRef.current.pause(); } catch (e) {}
    }
  };

  // helpers for comments per video (stored in localStorage)
  const commentsKey = (id) => `video_comments_${id}`;

  const loadComments = (id) => {
    try {
      const raw = localStorage.getItem(commentsKey(id));
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  };

  const [comments, setComments] = useState(() => loadComments(currentVideo.id));
  const [commentInput, setCommentInput] = useState("");
  const [commentAuthor, setCommentAuthor] = useState("");

  // reload comments when changing video
  useEffect(() => {
    if (!currentVideo) return;
    setComments(loadComments(currentVideo.id));
  }, [currentVideo]);

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
    localStorage.setItem(commentsKey(currentVideo.id), JSON.stringify(next));
    setCommentInput("");
  };

  const removeComment = (id) => {
    const next = comments.filter((c) => c.id !== id);
    setComments(next);
    localStorage.setItem(commentsKey(currentVideo.id), JSON.stringify(next));
  };

  return (
    <div className="w-full min-h-screen bg-gray-50">
      <div className="p-6">
        <h1 className="text-2xl font-semibold mb-4">Videos</h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left column: video + notes stacked */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            <div className="rounded shadow-lg overflow-hidden bg-black">
              <div className="w-full h-[260px] md:h-[420px] lg:h-[540px]">
                <video
                  ref={videoRef}
                  key={currentVideo?.id}
                  controls
                  className="w-full h-full object-contain bg-black"
                  src={currentVideo?.src}
                >
                  Your browser does not support the video tag.
                </video>
              </div>

              <div className="p-4 bg-white border-t">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold">{currentVideo?.title}</h2>
                    <p className="text-sm text-gray-500 mt-1">Duration: {currentVideo?.duration}</p>
                  </div>
                  <div className="text-sm text-gray-400">ID: {currentVideo?.id}</div>
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
          </div>

          {/* Right column: list of videos + comments */}
          <aside className="lg:col-span-4">
            <div className="space-y-4 sticky top-6">
              <div className="bg-white rounded shadow p-3 border border-gray-200">
                <h3 className="font-medium mb-3 pb-2 border-b border-gray-100">Danh sách video</h3>
                <div className="mt-2" style={{ maxHeight: '220px', overflowY: 'auto' }}>
                  <ul className="space-y-3 px-1">
                    {videos.map((v) => (
                      <li
                        key={v.id}
                        className={`flex items-center gap-3 p-2 rounded-md cursor-pointer transition-shadow ${v.id === currentVideo.id ? 'bg-indigo-50 shadow-sm ring-1 ring-indigo-200 border border-indigo-100' : 'hover:shadow-sm hover:bg-gray-50'}`}
                        onClick={() => onSelect(v)}
                      >
                        <div className="w-20 h-12 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-500 overflow-hidden">
                          <video src={v.src} className="w-full h-full object-cover" muted />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-sm text-gray-800">{v.title}</div>
                          <div className="text-xs text-gray-500">{v.duration}</div>
                        </div>
                        <div className="text-xs text-indigo-600 font-medium">Play</div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

            <div className="bg-white rounded shadow p-3" style={{ maxHeight: '50vh', overflowY: 'auto' }}>
              <h3 className="font-medium mb-3">Ghi chú</h3>
              <div className="flex items-center justify-between mb-3">
                <div />
                <div className="flex items-center gap-2">
                  <button
                    className="text-sm text-red-600 hover:underline"
                    onClick={() => { setNote(""); localStorage.removeItem(`video_notes_${currentVideo.id}`); }}
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
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Videos;
