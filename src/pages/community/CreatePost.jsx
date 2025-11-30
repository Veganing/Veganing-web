import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "./components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/Card";
import { Input } from "./components/ui/Input";
import { Badge } from "./components/ui/Badge";
import { ImageIcon, X, Hash, Upload } from "lucide-react";
import { createPost, getToken, removeToken } from "../../api/backend";
import { clearAuth } from "../../hooks/auth";

const CreatePost = () => {
    const navigate = useNavigate();
    const [content, setContent] = useState("");
    const [hashtags, setHashtags] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState("");
    const [category, setCategory] = useState("story");
    const [isLoading, setIsLoading] = useState(false);

    // 파일 선택 핸들러
    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // 이미지 파일인지 확인
        if (!file.type.startsWith('image/')) {
            alert("이미지 파일만 업로드 가능합니다.");
            return;
        }

        // 파일 크기 제한 (5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert("이미지 크기는 5MB 이하여야 합니다.");
            return;
        }

        setImageFile(file);
        
        // 미리보기 생성
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result);
            // Base64 데이터를 imageUrl로 설정
            setImageUrl(reader.result);
        };
        reader.readAsDataURL(file);
    };

    // 이미지 제거 핸들러
    const handleRemoveImage = () => {
        setImageFile(null);
        setImagePreview("");
        setImageUrl("");
        // 파일 input 초기화
        const fileInput = document.getElementById('image-file-input');
        if (fileInput) fileInput.value = '';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content.trim()) {
            alert("내용을 입력해주세요.");
            return;
        }

        setIsLoading(true);
        try {
            const token = getToken();
            if (!token) {
                alert("로그인이 필요합니다.");
                navigate("/login");
                return;
            }

            console.log("🔵 게시글 작성 시작:", {
                contentLength: content.trim().length,
                category: category,
                hasImage: !!imageUrl
            });

            // 해시태그 파싱 (#으로 시작하는 것들 추출)
            const tagArray = hashtags
                .split(/[\s,]+/)
                .filter((tag) => tag.startsWith("#"))
                .map((tag) => tag.trim());

            // imageUrl이 있으면 사용 (파일 업로드 시 Base64, URL 입력 시 URL)
            const postData = {
                content: content.trim(),
                category: category,
                ...(imageUrl && { imageUrl: imageUrl.trim() }),
            };

            console.log("🔵 게시글 데이터:", postData);
            console.log("🔵 토큰 존재 여부:", token ? "있음" : "없음");

            const response = await createPost(postData, token);
            console.log("✅ 게시글 작성 성공:", response);
            alert("게시글이 작성되었습니다!");
            // 커뮤니티 페이지로 이동하면서 리프레시 트리거
            navigate("/community", { replace: true });
            // 페이지 새로고침으로 최신 게시글 반영
            window.location.reload();
        } catch (error) {
            console.error("게시글 작성 실패:", error);
            console.error("에러 상세:", {
                message: error.message,
                status: error.status,
                error: error.error,
                details: error.details
            });
            
            // 토큰 만료 처리
            if (error.message.includes("Token expired") || error.status === 401) {
                removeToken();
                clearAuth();
                alert("세션이 만료되었습니다. 다시 로그인해주세요.");
                navigate("/login");
                return;
            }
            
            // 더 자세한 에러 메시지 표시
            let errorMessage = error.message || "알 수 없는 오류가 발생했습니다.";
            
            // 백엔드에서 반환한 에러 메시지가 있으면 사용
            if (error.error) {
                errorMessage = error.error;
            } else if (error.details) {
                errorMessage = error.details;
            }
            
            alert(`게시글 작성에 실패했습니다.\n\n오류: ${errorMessage}\n\n원인:\n- 로그인이 필요할 수 있습니다.\n- 백엔드 서버가 실행 중인지 확인해주세요.\n- 브라우저 콘솔(F12)에서 자세한 에러를 확인할 수 있습니다.`);
        } finally {
            setIsLoading(false);
        }
    };

    const categories = [
        { value: "story", label: "스토리" },
        { value: "recipe", label: "레시피" },
        { value: "tip", label: "팁" },
        { value: "question", label: "질문" },
    ];

    return (
        <main className="flex-1 relative">
            <section className="container mx-auto px-4 py-16 relative">
                <div className="flex flex-col items-center gap-8 max-w-3xl mx-auto">
                    <div className="flex flex-col items-center gap-4 text-center w-full">
                        <h1 className="[font-family:'Nunito',Helvetica] font-normal text-white text-4xl tracking-[0] leading-[48px]">
                            게시글 작성
                        </h1>
                        <p className="[font-family:'Nunito',Helvetica] font-normal text-[#fffefee6] text-lg tracking-[0] leading-7">
                            비건 커뮤니티에 글을 작성해보세요
                        </p>
                    </div>

                    <Card className="bg-[#fffffff2] border-[0.67px] border-[#0000001a] rounded-[14px] w-full">
                        <CardHeader>
                            <CardTitle className="[font-family:'Nunito',Helvetica] font-semibold text-[#00a63e] text-xl">
                                새 게시글
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                                {/* 카테고리 선택 */}
                                <div className="flex flex-col gap-2">
                                    <label className="[font-family:'Nunito',Helvetica] font-medium text-[#495565] text-sm">
                                        카테고리
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {categories.map((cat) => (
                                            <button
                                                key={cat.value}
                                                type="button"
                                                onClick={() => setCategory(cat.value)}
                                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                                    category === cat.value
                                                        ? "bg-[#00a63e] text-white"
                                                        : "bg-gray-100 text-[#495565] hover:bg-gray-200"
                                                }`}
                                            >
                                                {cat.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* 내용 입력 */}
                                <div className="flex flex-col gap-2">
                                    <label className="[font-family:'Nunito',Helvetica] font-medium text-[#495565] text-sm">
                                        내용
                                    </label>
                                    <textarea
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        placeholder="게시글 내용을 입력해주세요..."
                                        className="w-full min-h-[200px] p-4 rounded-lg border-2 border-gray-200 focus:border-[#00a63e] focus:outline-none resize-y [font-family:'Nunito',Helvetica] text-sm"
                                        required
                                    />
                                </div>

                                {/* 이미지 업로드 */}
                                <div className="flex flex-col gap-2">
                                    <label className="[font-family:'Nunito',Helvetica] font-medium text-[#495565] text-sm flex items-center gap-2">
                                        <ImageIcon className="w-4 h-4" />
                                        이미지 (선택사항)
                                    </label>
                                    
                                    {/* 파일 선택 버튼 */}
                                    {!imagePreview && (
                                        <div className="flex flex-col gap-2">
                                            <label
                                                htmlFor="image-file-input"
                                                className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#00a63e] hover:bg-green-50 transition-colors"
                                            >
                                                <Upload className="w-5 h-5 text-[#495565]" />
                                                <span className="[font-family:'Nunito',Helvetica] font-medium text-[#495565] text-sm">
                                                    이미지 파일 선택 (최대 5MB)
                                                </span>
                                            </label>
                                            <input
                                                id="image-file-input"
                                                type="file"
                                                accept="image/*"
                                                onChange={handleFileSelect}
                                                className="hidden"
                                            />
                                        </div>
                                    )}

                                    {/* 이미지 미리보기 */}
                                    {imagePreview && (
                                        <div className="relative">
                                            <img
                                                src={imagePreview}
                                                alt="미리보기"
                                                className="w-full h-auto max-h-96 object-contain rounded-lg border-2 border-gray-200"
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={handleRemoveImage}
                                                className="absolute top-2 right-2 bg-white hover:bg-gray-100 rounded-full shadow-lg"
                                            >
                                                <X className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    )}

                                    {/* 또는 URL 입력 */}
                                    {!imagePreview && (
                                        <div className="mt-2">
                                            <p className="[font-family:'Nunito',Helvetica] font-normal text-[#697282] text-xs mb-2 text-center">
                                                또는
                                            </p>
                                            <Input
                                                type="url"
                                                value={imageUrl}
                                                onChange={(e) => setImageUrl(e.target.value)}
                                                placeholder="https://example.com/image.jpg"
                                                className="rounded-lg"
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* 해시태그 입력 */}
                                <div className="flex flex-col gap-2">
                                    <label className="[font-family:'Nunito',Helvetica] font-medium text-[#495565] text-sm flex items-center gap-2">
                                        <Hash className="w-4 h-4" />
                                        해시태그 (선택사항)
                                    </label>
                                    <Input
                                        type="text"
                                        value={hashtags}
                                        onChange={(e) => setHashtags(e.target.value)}
                                        placeholder="#비건 #레시피 (띄어쓰기 또는 쉼표로 구분)"
                                        className="rounded-lg"
                                    />
                                    {hashtags && (
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {hashtags
                                                .split(/[\s,]+/)
                                                .filter((tag) => tag.startsWith("#"))
                                                .map((tag, index) => (
                                                    <Badge
                                                        key={index}
                                                        variant="outline"
                                                        className="border-[#00a63e] text-[#00a63e] [font-family:'Nunito',Helvetica] font-medium text-xs"
                                                    >
                                                        {tag.trim()}
                                                    </Badge>
                                                ))}
                                        </div>
                                    )}
                                </div>

                                {/* 버튼들 */}
                                <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => navigate("/community")}
                                        className="[font-family:'Nunito',Helvetica] font-medium"
                                    >
                                        취소
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={isLoading || !content.trim()}
                                        className="bg-[#00a63e] text-white hover:bg-[#008235] [font-family:'Nunito',Helvetica] font-medium"
                                    >
                                        {isLoading ? "작성 중..." : "작성하기"}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </section>
        </main>
    );
};

export default CreatePost;
