import React, { useState, useEffect } from "react";
import { Badge } from "./components/ui/Badge";
import { Button } from "./components/ui/Button";
import { Card, CardContent } from "./components/ui/Card";
import { Avatar, AvatarFallback } from "./components/ui/Avatar";
import { Input } from "./components/ui/Input";
import { MapPinIcon, HeartIcon, MessageCircleIcon, Plus, X, Send } from "lucide-react";
import { likePost, getToken, getComments, createComment, deleteComment } from "../../api/backend";

const FeedTab = ({
    feedPosts = [],
    feedLoading = false,
    challengeLoading,
    isLoggedIn,
    currentChallenge,
    goToChallenge,
    popularHashtags,
    onCreatePost,
    onPostUpdate, // 게시글 업데이트 콜백
}) => {
    const [likingPosts, setLikingPosts] = useState(new Set()); // 좋아요 중인 게시글 ID들
    const [likedPosts, setLikedPosts] = useState(new Set()); // 좋아요한 게시글 ID들 (중복 방지용)
    const [expandedComments, setExpandedComments] = useState(new Set()); // 댓글 목록이 열린 게시글 ID들
    const [comments, setComments] = useState({}); // { postId: [comments] }
    const [commentsLoading, setCommentsLoading] = useState({}); // { postId: true/false }
    const [commentTexts, setCommentTexts] = useState({}); // { postId: "text" }
    const [submittingComments, setSubmittingComments] = useState(new Set()); // 댓글 작성 중인 게시글 ID들

    // 좋아요 토글 핸들러
    const handleLike = async (postId, currentLikes) => {
        // 로그인 확인
        const token = getToken();
        if (!token) {
            alert("로그인이 필요합니다.");
            return;
        }

        // 이미 좋아요 중이면 무시
        if (likingPosts.has(postId)) {
            return;
        }

        const isLiked = likedPosts.has(postId);
        const newLikes = isLiked ? currentLikes - 1 : currentLikes + 2; // 좋아요 취소 시 -1, 좋아요 시 +2

        try {
            setLikingPosts(prev => new Set(prev).add(postId));
            
            // 낙관적 업데이트 (즉시 UI 업데이트)
            if (onPostUpdate) {
                onPostUpdate(postId, { likes: newLikes });
            }
            
            // 좋아요 상태 토글
            if (isLiked) {
                // 좋아요 취소
                setLikedPosts(prev => {
                    const next = new Set(prev);
                    next.delete(postId);
                    return next;
                });
                
                // TODO: 백엔드에 좋아요 취소 API가 추가되면 여기서 호출
                // 현재는 프론트엔드에서만 상태 관리
                
            } else {
                // 좋아요 추가
                setLikedPosts(prev => new Set(prev).add(postId));
                
                // 백엔드에 좋아요 요청
                const response = await likePost(postId, token);
                
                // 백엔드 응답으로 실제 좋아요 수 업데이트
                // 백엔드가 +1을 반환하므로, +2를 유지하려면 조정 필요
                if (onPostUpdate && response.likes !== undefined) {
                    // 백엔드가 +1을 했으므로, 추가로 +1을 더해서 총 +2가 되도록
                    onPostUpdate(postId, { likes: response.likes + 1 });
                }
            }
        } catch (error) {
            console.error("좋아요 처리 실패:", error);
            
            // 실패 시 이전 상태로 되돌리기
            if (isLiked) {
                // 좋아요 취소 실패 시 다시 좋아요 상태로
                setLikedPosts(prev => new Set(prev).add(postId));
            } else {
                // 좋아요 추가 실패 시 좋아요 상태 제거
                setLikedPosts(prev => {
                    const next = new Set(prev);
                    next.delete(postId);
                    return next;
                });
            }
            
            if (onPostUpdate) {
                onPostUpdate(postId, { likes: currentLikes });
            }
            
            alert(`좋아요 처리에 실패했습니다: ${error.message || "알 수 없는 오류"}`);
        } finally {
            setLikingPosts(prev => {
                const next = new Set(prev);
                next.delete(postId);
                return next;
            });
        }
    };

    // 댓글 목록 토글 핸들러
    const handleToggleComments = async (postId) => {
        const isExpanded = expandedComments.has(postId);
        
        if (isExpanded) {
            // 댓글 닫기
            setExpandedComments(prev => {
                const next = new Set(prev);
                next.delete(postId);
                return next;
            });
        } else {
            // 댓글 열기
            setExpandedComments(prev => new Set(prev).add(postId));
            
            // 댓글이 아직 로드되지 않았다면 로드
            if (!comments[postId]) {
                try {
                    setCommentsLoading(prev => ({ ...prev, [postId]: true }));
                    console.log("댓글 조회 요청 - postId:", postId);
                    const response = await getComments(postId);
                    console.log("댓글 조회 응답:", response);
                    
                    if (response.comments) {
                        setComments(prev => ({ ...prev, [postId]: response.comments }));
                    }
                } catch (error) {
                    console.error("댓글 조회 실패:", error);
                    console.error("요청 URL:", `http://localhost:3000/api/community/posts/${postId}/comments`);
                    alert(`댓글을 불러오는데 실패했습니다: ${error.message || "알 수 없는 오류"}`);
                } finally {
                    setCommentsLoading(prev => ({ ...prev, [postId]: false }));
                }
            }
        }
    };

    // 댓글 작성 핸들러
    const handleSubmitComment = async (postId) => {
        const token = getToken();
        if (!token) {
            alert("로그인이 필요합니다.");
            return;
        }

        const content = commentTexts[postId] || "";
        if (!content.trim()) {
            alert("댓글 내용을 입력해주세요.");
            return;
        }

        try {
            setSubmittingComments(prev => new Set(prev).add(postId));
            
            const response = await createComment(postId, { content: content.trim() }, token);
            
            // 댓글 목록에 추가
            if (response.comment) {
                setComments(prev => ({
                    ...prev,
                    [postId]: [...(prev[postId] || []), response.comment]
                }));
                
                // 댓글 수 업데이트
                if (onPostUpdate) {
                    const currentCount = feedPosts.find(p => p.id === postId)?.comments || 0;
                    onPostUpdate(postId, { comments: currentCount + 1 });
                }
                
                // 입력 필드 초기화
                setCommentTexts(prev => ({ ...prev, [postId]: "" }));
            }
        } catch (error) {
            console.error("댓글 작성 실패:", error);
            alert(`댓글 작성에 실패했습니다: ${error.message || "알 수 없는 오류"}`);
        } finally {
            setSubmittingComments(prev => {
                const next = new Set(prev);
                next.delete(postId);
                return next;
            });
        }
    };

    // 댓글 삭제 핸들러
    const handleDeleteComment = async (commentId, postId) => {
        if (!confirm("댓글을 삭제하시겠습니까?")) {
            return;
        }

        const token = getToken();
        if (!token) {
            alert("로그인이 필요합니다.");
            return;
        }

        try {
            await deleteComment(commentId, token);
            
            // 댓글 목록에서 제거
            setComments(prev => ({
                ...prev,
                [postId]: (prev[postId] || []).filter(c => c.id !== commentId)
            }));
            
            // 댓글 수 업데이트
            if (onPostUpdate) {
                const currentCount = feedPosts.find(p => p.id === postId)?.comments || 0;
                onPostUpdate(postId, { comments: Math.max(0, currentCount - 1) });
            }
        } catch (error) {
            console.error("댓글 삭제 실패:", error);
            alert(`댓글 삭제에 실패했습니다: ${error.message || "알 수 없는 오류"}`);
        }
    };

    // 시간 변환 헬퍼 함수
    const formatTimeAgo = (dateString) => {
        if (!dateString) return "방금 전";
        
        const now = new Date();
        const postDate = new Date(dateString);
        const diffMs = now - postDate;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return "방금 전";
        if (diffMins < 60) return `${diffMins}분 전`;
        if (diffHours < 24) return `${diffHours}시간 전`;
        if (diffDays < 7) return `${diffDays}일 전`;
        return postDate.toLocaleDateString("ko-KR");
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full max-w-6xl ">
            <div className="lg:col-span-2 flex flex-col gap-6">
                {/* 게시글 생성 버튼 */}
                <Button
                    onClick={onCreatePost}
                    className="w-full bg-[#00a63e] text-white hover:bg-[#008235] [font-family:'Nunito',Helvetica] font-medium text-sm rounded-lg h-auto py-3 transition-colors flex items-center justify-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    새 게시글 작성하기
                </Button>

                {/* 로딩 중 */}
                {feedLoading && (
                    <Card className="bg-[#fffffff2] rounded-[14px] border-[0.67px] border-[#0000001a]">
                        <CardContent className="p-12 text-center">
                            <div className="text-2xl mb-4">⏳</div>
                            <p className="[font-family:'Nunito',Helvetica] font-normal text-[#495565] text-sm">
                                게시글을 불러오는 중...
                            </p>
                        </CardContent>
                    </Card>
                )}

                {/* 게시글이 없을 때 */}
                {!feedLoading && feedPosts.length === 0 && (
                    <Card className="bg-[#fffffff2] rounded-[14px] border-[0.67px] border-[#0000001a]">
                        <CardContent className="p-12 text-center">
                            <div className="text-4xl mb-4">📝</div>
                            <p className="[font-family:'Nunito',Helvetica] font-normal text-[#495565] text-base mb-4">
                                아직 게시글이 없습니다.
                            </p>
                            <p className="[font-family:'Nunito',Helvetica] font-normal text-[#495565] text-sm">
                                첫 번째 게시글을 작성해보세요!
                            </p>
                        </CardContent>
                    </Card>
                )}

                {/* 게시글 목록 */}
                {!feedLoading && feedPosts.map((post, index) => (
                    <Card
                        key={index}
                        className="bg-[#fffffff2] rounded-[14px] border-[0.67px] border-[#0000001a]"
                    >
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-start gap-3">
                                    <Avatar className="w-10 h-10">
                                        <AvatarFallback className="bg-[#ececf0] text-neutral-950 [font-family:'Nunito',Helvetica] font-normal text-base">
                                            {post.avatar || ""}
                                        </AvatarFallback>
                                    </Avatar>

                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2">
                                            <span className="[font-family:'Nunito',Helvetica] font-semibold text-neutral-950 text-base tracking-[0] leading-6">
                                                {post.username}
                                            </span>
                                            <Badge className="bg-green-100 text-[#008235] border-[0.67px] border-transparent [font-family:'Nunito',Helvetica] font-medium text-xs">
                                                {post.level}
                                            </Badge>
                                        </div>

                                        <div className="flex items-center gap-1 text-[#697282] text-sm">
                                            <MapPinIcon className="w-3 h-3" />
                                            <span className="[font-family:'Nunito',Helvetica] font-normal tracking-[0] leading-5">
                                                {post.location} • {post.time}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <Button variant="ghost" size="icon" className="h-8 w-9">
                                    <img alt="Button" src={post.buttonIcon} />
                                </Button>
                            </div>

                            <p className="[font-family:'Nunito',Helvetica] font-normal text-[#354152] text-base tracking-[0] leading-6 mb-3">
                                {post.content}
                            </p>

                            {post.imageUrl && (
                                <div className="mb-4">
                                    <img 
                                        src={post.imageUrl} 
                                        alt="게시글 이미지" 
                                        className="w-full h-auto max-h-96 object-contain rounded-lg border-2 border-gray-200" 
                                    />
                                </div>
                            )}

                            <div className="flex flex-wrap gap-2 mb-4">
                                {post.hashtags.map((tag, tagIndex) => (
                                    <Badge
                                        key={tagIndex}
                                        variant="outline"
                                        className="border-[#00a63e] text-[#00a63e] [font-family:'Nunito',Helvetica] font-medium text-xs"
                                    >
                                        {tag}
                                    </Badge>
                                ))}
                            </div>

                            <div className="flex items-center gap-4">
                                <Button 
                                    variant="ghost" 
                                    className={`h-auto p-0 flex items-center gap-2 ${
                                        likedPosts.has(post.id) 
                                            ? 'text-[#e60076]' 
                                            : 'text-[#495565] hover:text-[#e60076]'
                                    } transition-colors`}
                                    onClick={() => handleLike(post.id, post.likes)}
                                    disabled={likingPosts.has(post.id) || likedPosts.has(post.id) || !isLoggedIn}
                                >
                                    <HeartIcon 
                                        className={`w-4 h-4 ${
                                            likedPosts.has(post.id) ? 'fill-[#e60076]' : ''
                                        }`} 
                                    />
                                    <span className="[font-family:'Nunito',Helvetica] font-medium text-sm tracking-[0] leading-5">
                                        {likingPosts.has(post.id) ? '...' : post.likes}
                                    </span>
                                </Button>

                                <Button 
                                    variant="ghost" 
                                    className={`h-auto p-0 flex items-center gap-2 ${
                                        expandedComments.has(post.id)
                                            ? 'text-[#00a63e]'
                                            : 'text-[#495565] hover:text-[#00a63e]'
                                    } transition-colors cursor-pointer`}
                                    onClick={() => handleToggleComments(post.id)}
                                >
                                    <MessageCircleIcon className="w-4 h-4" />
                                    <span className="[font-family:'Nunito',Helvetica] font-medium text-sm tracking-[0] leading-5">
                                        {post.comments}
                                    </span>
                                </Button>
                            </div>

                            {/* 댓글 섹션 */}
                            {expandedComments.has(post.id) && (
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                    {/* 댓글 목록 */}
                                    {commentsLoading[post.id] ? (
                                        <div className="text-center py-4 text-sm text-[#495565]">
                                            댓글을 불러오는 중...
                                        </div>
                                    ) : (
                                        <div className="space-y-3 mb-4">
                                            {comments[post.id] && comments[post.id].length > 0 ? (
                                                comments[post.id].map((comment) => (
                                                    <div key={comment.id} className="flex gap-3">
                                                        <Avatar className="w-8 h-8">
                                                            <AvatarFallback className="bg-[#ececf0] text-neutral-950 text-sm">
                                                                {comment.author?.nickname?.[0] || "?"}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className="[font-family:'Nunito',Helvetica] font-semibold text-sm text-neutral-950">
                                                                    {comment.author?.nickname || "익명"}
                                                                </span>
                                                                <span className="[font-family:'Nunito',Helvetica] font-normal text-xs text-[#697282]">
                                                                    {formatTimeAgo(comment.createdAt)}
                                                                </span>
                                                                {comment.author?.id && getToken() && 
                                                                 localStorage.getItem('authToken') && 
                                                                 JSON.parse(localStorage.getItem('user') || '{}').id === comment.author.id && (
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        className="h-auto p-0 text-xs text-red-500 hover:text-red-700"
                                                                        onClick={() => handleDeleteComment(comment.id, post.id)}
                                                                    >
                                                                        삭제
                                                                    </Button>
                                                                )}
                                                            </div>
                                                            <p className="[font-family:'Nunito',Helvetica] font-normal text-sm text-[#354152]">
                                                                {comment.content}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-center py-4 text-sm text-[#495565]">
                                                    아직 댓글이 없습니다. 첫 번째 댓글을 작성해보세요!
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* 댓글 작성 폼 */}
                                    {isLoggedIn && (
                                        <div className="flex gap-2">
                                            <Input
                                                type="text"
                                                placeholder="댓글을 입력하세요..."
                                                value={commentTexts[post.id] || ""}
                                                onChange={(e) => setCommentTexts(prev => ({
                                                    ...prev,
                                                    [post.id]: e.target.value
                                                }))}
                                                onKeyPress={(e) => {
                                                    if (e.key === 'Enter' && !e.shiftKey) {
                                                        e.preventDefault();
                                                        handleSubmitComment(post.id);
                                                    }
                                                }}
                                                className="flex-1 rounded-lg"
                                            />
                                            <Button
                                                onClick={() => handleSubmitComment(post.id)}
                                                disabled={submittingComments.has(post.id) || !commentTexts[post.id]?.trim()}
                                                className="bg-[#00a63e] text-white hover:bg-[#008235] rounded-lg"
                                            >
                                                <Send className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="flex flex-col gap-6">
                <Card className="bg-[#fffffff2] rounded-[14px] border-[0.67px] border-[#0000001a]">
                    <CardContent className="p-6 flex flex-col gap-[30px]">
                        <h3 className="text-[#00a63e] text-lg leading-7 [font-family:'Nunito',Helvetica] font-normal tracking-[0]">
                            이번 주 챌린지
                        </h3>

                        {challengeLoading ? (
                            <div className="flex flex-col gap-4 items-center py-8">
                                <div className="text-2xl">⏳</div>
                                <p className="[font-family:'Nunito',Helvetica] font-normal text-[#495565] text-sm">
                                    로딩 중...
                                </p>
                            </div>
                        ) : !isLoggedIn || !currentChallenge ? (
                            <div className="flex flex-col gap-4 items-center py-4">
                                <div className="text-4xl">🌱</div>
                                <h4 className="[font-family:'Nunito',Helvetica] font-semibold text-neutral-950 text-base text-center tracking-[0] leading-6">
                                    {!isLoggedIn ? "로그인하고 챌린지를 시작하세요!" : "새로운 챌린지를 시작해보세요!"}
                                </h4>
                                <p className="[font-family:'Nunito',Helvetica] font-normal text-[#495565] text-sm text-center tracking-[0] leading-5">
                                    {!isLoggedIn
                                        ? "비건 여정을 함께 시작해볼까요?"
                                        : "다양한 비건 챌린지에 도전해보세요!"}
                                </p>
                                <Button
                                    onClick={goToChallenge}
                                    className="w-full bg-[#00a63e] text-white [font-family:'Nunito',Helvetica] font-medium text-sm rounded-lg h-auto py-2 hover:bg-[#008235] transition-colors"
                                >
                                    챌린지 페이지로 이동
                                </Button>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-4">
                                <div className="text-3xl text-center">
                                    {currentChallenge.difficulty === "easy"
                                        ? "🌱"
                                        : currentChallenge.difficulty === "medium"
                                        ? "🌿"
                                        : "🌳"}
                                </div>

                                <h4 className="[font-family:'Nunito',Helvetica] font-semibold text-neutral-950 text-base text-center tracking-[0] leading-6">
                                    {currentChallenge.title}
                                </h4>

                                <p className="[font-family:'Nunito',Helvetica] font-normal text-[#495565] text-sm text-center tracking-[0] leading-5">
                                    {currentChallenge.description || "비건 챌린지에 도전 중입니다!"}
                                </p>

                                <div className="flex items-center justify-between text-[#495565] text-sm">
                                    <span className="[font-family:'Nunito',Helvetica] font-normal tracking-[0] leading-5">
                                        진행률
                                    </span>
                                    <span className="[font-family:'Nunito',Helvetica] font-normal tracking-[0] leading-5">
                                        {currentChallenge.progress || 0}%
                                    </span>
                                </div>

                                <div className="w-full h-2 bg-[#03021333] rounded-[22369600px] overflow-hidden">
                                    <div
                                        className="h-full bg-[#00a63e] transition-all duration-500"
                                        style={{ width: `${currentChallenge.progress || 0}%` }}
                                    />
                                </div>

                                <div className="flex items-center justify-center gap-4 text-sm">
                                    <span className="[font-family:'Nunito',Helvetica] font-normal text-[#00a63e]">
                                        ⭐ {currentChallenge.points || 0}pts
                                    </span>
                                    <span className="[font-family:'Nunito',Helvetica] font-normal text-[#495565]">
                                        난이도:{" "}
                                        {currentChallenge.difficulty === "easy"
                                            ? "쉬움"
                                            : currentChallenge.difficulty === "medium"
                                            ? "보통"
                                            : "어려움"}
                                    </span>
                                </div>

                                <Button
                                    onClick={goToChallenge}
                                    className="w-full bg-[#00a63e] text-white [font-family:'Nunito',Helvetica] font-medium text-sm rounded-lg h-auto py-2 hover:bg-[#008235] transition-colors"
                                >
                                    챌린지 상세보기
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="bg-[#fffffff2] rounded-[14px] border-[0.67px] border-[#0000001a]">
                    <CardContent className="p-6 flex flex-col gap-[30px]">
                        <h3 className="text-[#00a63e] text-lg leading-7 [font-family:'Nunito',Helvetica] font-normal tracking-[0]">
                            인기 해시태그
                        </h3>

                        <div className="flex flex-wrap gap-2">
                            {popularHashtags.map((tag, index) => (
                                <Badge
                                    key={index}
                                    variant="outline"
                                    className="border-[#0000001a] text-neutral-950 [font-family:'Nunito',Helvetica] font-medium text-xs cursor-pointer hover:border-[#00a63e] hover:text-[#00a63e] transition-colors"
                                >
                                    {tag}
                                </Badge>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default FeedTab;

