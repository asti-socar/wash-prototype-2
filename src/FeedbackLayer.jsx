import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabaseClient';
import { X, Send } from 'lucide-react';

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function FeedbackLayer({ isModeActive, pageId, isHideComments }) {
  const [feedbacks, setFeedbacks] = useState([]);
  const [newComment, setNewComment] = useState(null); // { x, y, x_percent, y_percent }
  const [lockedPinId, setLockedPinId] = useState(null);
  const [resolvingId, setResolvingId] = useState(null); // 1. 처리 중 상태를 관리할 state 추가
  const [author, setAuthor] = useState(() => localStorage.getItem('feedback_author') || '');
  const [message, setMessage] = useState('');

  // 1. 초기 데이터 패칭
  useEffect(() => {
    const fetchFeedbacks = async () => {
      const { data, error } = await supabase
        .from('prototype_comments')
        .select('*')
        .eq('page_path', pageId)
        .eq('is_resolved', false)
        .order('created_at', { ascending: true });

      if (error) console.error('Error fetching feedbacks:', error);
      else setFeedbacks(data);
    };
    fetchFeedbacks();
  }, [pageId]);

  // 2. 실시간 구독 설정
  useEffect(() => {
    const channel = supabase
      .channel(`comments:${pageId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'prototype_comments', filter: `page_path=eq.${pageId}` },
        (payload) => {
          if (payload.eventType === 'INSERT' && !payload.new.is_resolved) {
            setFeedbacks((prev) => [...prev, payload.new]);
          } else if (payload.eventType === 'UPDATE') {
            if (payload.new.is_resolved) {
              setFeedbacks((prev) => prev.filter((f) => f.id !== payload.new.id));
            } else {
              setFeedbacks((prev) => prev.map(f => f.id === payload.new.id ? payload.new : f));
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [pageId]);

  // 3. ESC 키 핸들러 추가 (팝업 닫기)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key !== 'Escape') return;

      if (lockedPinId) {
        setLockedPinId(null);
        return;
      }

      if (newComment) {
        if (message.trim() && !window.confirm('작성 중인 내용이 있습니다. 정말로 닫으시겠습니까?')) {
          return; // 사용자가 취소한 경우
        }
        setNewComment(null);
        setMessage('');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lockedPinId, newComment, message]);

  // 4. 외부 클릭 핸들러 로직 수정
  const handleLayerClick = (e) => {
    // 핀(팝업 포함)이나 새 댓글 폼 내부를 클릭한 경우 무시
    if (e.target.closest('.qna-pin') || e.target.closest('.feedback-form')) {
      return;
    }

    // 고정된 핀이 있다면 해제하고 종료
    if (lockedPinId) {
      setLockedPinId(null);
      return;
    }

    // 새 댓글 창이 열려있다면 확인 후 닫고 종료
    if (newComment) {
      if (message.trim() && !window.confirm('작성 중인 내용이 있습니다. 정말로 닫으시겠습니까?')) {
        return; // 사용자가 취소한 경우
      }
      setNewComment(null);
      setMessage('');
      return;
    }

    // 입력 모드이고, 열린 팝업이 없을 때만 새 댓글 창 생성
    if (isModeActive) {
      setNewComment({ x: e.clientX, y: e.clientY, x_percent: e.pageX / document.documentElement.scrollWidth, y_percent: e.pageY / document.documentElement.scrollHeight });
    }
  };

  // 5. 댓글 DB 저장
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!author.trim() || !message.trim() || !newComment) return;

    localStorage.setItem('feedback_author', author);

    const { error } = await supabase.from('prototype_comments').insert({
      author,
      message,
      x_percent: newComment.x_percent,
      y_percent: newComment.y_percent,
      page_path: pageId,
    });

    if (error) alert('댓글 저장에 실패했습니다.');
    else {
      setNewComment(null);
      setMessage('');
    }
  };

  // 6. 댓글 해결(완료) 처리
  const handleResolve = async (e, id) => {
    e.preventDefault();
    e.stopPropagation();

    // 중복 클릭 방지
    if (resolvingId) return;

    setResolvingId(id); // 로딩 상태로 즉시 변경하여 UI 피드백 제공

    const { data, error } = await supabase
      .from('prototype_comments')
      .update({ is_resolved: true })
      .eq('id', id)
      .select();

    if (error) {
      console.error('Error resolving comment:', error);
      // 실패 시, 원인 파악을 위해 Supabase의 에러 메시지를 함께 표시합니다.
      alert(`댓글을 해결 처리하는 중 오류가 발생했습니다: ${error.message}`);
    } else if (data && data.length === 0) {
      // 쿼리는 성공했지만, 실제 업데이트된 행이 없는 경우 (RLS 정책 또는 잘못된 ID)
      console.warn('Supabase update warning: No rows were updated. Check RLS policy and row ID.', { id });
      alert(`[Update Failed] 댓글을 찾을 수 없거나 업데이트할 권한이 없습니다. (ID: ${id})`);
    } else {
      // 성공: DB 업데이트가 확인되었으므로, UI 상태를 즉시 업데이트합니다.
      console.log('Successfully resolved comment:', data[0]);
      setFeedbacks(prev => prev.filter(f => f.id !== id));
      setLockedPinId(null);
    }
    setResolvingId(null); // 모든 경우에 대해 로딩 상태를 마지막에 해제합니다.
  };

  const getPosition = (x, y) => {
    const formW = 320, formH = 220;
    const newX = x + formW > window.innerWidth ? window.innerWidth - formW - 20 : x;
    const newY = y + formH > window.innerHeight ? window.innerHeight - formH - 20 : y;
    return { left: newX, top: newY };
  }

  return (
    <div
      onClick={handleLayerClick}
      className={cn(
        "absolute inset-0 z-[9999]",
        // 입력 모드가 활성화되었거나, 핀이 고정되었을 때만 레이어 전체가 클릭 가능하도록 설정
        isModeActive || lockedPinId ? "pointer-events-auto" : "pointer-events-none",
        // 입력 모드일 때만 파란색 배경과 점선 테두리 표시
        isModeActive && "bg-blue-500/10 border-2 border-dashed border-blue-600"
      )}
    >
      {/* 기존 피드백 핀 렌더링 */}
      {!isHideComments && feedbacks.map((fb, index) => {
          const isLocked = lockedPinId === fb.id;
          return (
            <div
              key={fb.id}
              onClick={(e) => {
                e.stopPropagation();
                setLockedPinId(prevId => (prevId === fb.id ? null : fb.id));
                if (newComment) setNewComment(null);
              }}
              className={cn(
                // 입력모드 OFF여도 핀 자체는 상호작용이 가능해야 하므로 pointer-events-auto를 명시
                "qna-pin group absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer pointer-events-auto",
                isLocked && "z-10" // 고정된 핀이 다른 핀들보다 위에 오도록 z-index 조정
              )}
              style={{ left: `${fb.x_percent * 100}%`, top: `${fb.y_percent * 100}%` }}
            >
              <div className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white font-bold shadow-lg ring-2 ring-white transition-all",
                isLocked && "ring-4 ring-blue-400 scale-110" // 고정 시 시각적 강조
              )}>
                {index + 1}
              </div>
              <div className={cn(
                "qna-popup absolute bottom-full mb-3 w-72 rounded-lg bg-slate-800 p-3 text-sm text-white shadow-xl transition-opacity",
                // 호버 또는 고정 상태일 때만 팝업이 보이고 상호작용 가능
                "opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto",
                isLocked && "opacity-100 pointer-events-auto"
              )}>
                <div className="font-bold text-blue-300 mb-1">{fb.author}</div>
                <p className="mb-3 whitespace-pre-wrap break-words">{fb.message}</p>
                <button 
                  onClick={(e) => handleResolve(e, fb.id)} 
                  disabled={!!resolvingId} // 3. 처리 중 다른 버튼 비활성화
                  // 버튼이 다른 요소에 가려지지 않도록 z-index를 높게 설정
                  className="relative z-[100] w-full cursor-pointer text-center py-1.5 px-3 text-xs font-semibold bg-blue-600 hover:bg-blue-700 rounded-md transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed"
                >
                  {resolvingId === fb.id ? '처리 중...' : '해결(완료)'}
                </button>
                <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-slate-800"></div>
              </div>
            </div>
          );
        })
      }

      {/* 신규 댓글 입력 폼 */}
      {newComment && (
        <div
          className="feedback-form fixed w-80 rounded-xl bg-white shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95"
          style={getPosition(newComment.x, newComment.y)}
        >
          <form onSubmit={handleCommentSubmit}>
            <div className="p-4 space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-gray-800">피드백 남기기</h3>
                <button type="button" onClick={() => setNewComment(null)} className="p-1 rounded-full hover:bg-gray-100 text-gray-500">
                  <X size={18} />
                </button>
              </div>
              <textarea placeholder="피드백 내용을 입력하세요..." value={message} onChange={(e) => setMessage(e.target.value)} className="w-full rounded-md border-gray-300 px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 min-h-[80px]" required autoFocus />
              <input type="text" placeholder="작성자 이름" value={author} onChange={(e) => setAuthor(e.target.value)} className="w-full rounded-md border-gray-300 px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500" required />
            </div>
            <div className="bg-gray-50 px-4 py-3 text-right rounded-b-xl">
              <button type="submit" className="inline-flex items-center justify-center rounded-lg font-semibold transition-all text-sm h-9 px-3.5 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50" disabled={!author.trim() || !message.trim()}>
                <Send size={14} className="mr-2" />
                저장
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}