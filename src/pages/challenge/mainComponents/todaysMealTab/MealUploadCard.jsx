import { useState, useEffect, useRef, memo } from 'react';
import { analyzeMealWithLLM, fileToDataUrl } from "../../../../api/openai";

const MealUploadCard = memo(function MealUploadCard({ onAnalysisComplete, setIsAnalyzing, setCurrentImage, setCurrentDescription, resetTrigger }) {
    const [selectedImage, setSelectedImage] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [imageUrl, setImageUrl] = useState(''); // URL 입력 추가
    const [description, setDescription] = useState('');
    const [imageLoading, setImageLoading] = useState(false);
    const fileInputRef = useRef(null);

    // resetTrigger가 변경되면 초기화
    useEffect(() => {
        if (resetTrigger > 0) {
            setSelectedImage(null);
            setSelectedFile(null);
            setImageUrl('');
            setDescription('');
            setCurrentImage(null);
            setCurrentDescription('');
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    }, [resetTrigger, setCurrentImage, setCurrentDescription]);
    
    // imageUrl이 변경되면 이미지 설정
    useEffect(() => {
        if (imageUrl && imageUrl.trim()) {
            setSelectedImage(imageUrl);
            setCurrentImage(imageUrl);
        }
    }, [imageUrl, setCurrentImage]);

    // 이미지 업로드 핸들러 (커뮤니티처럼 단순하게)
    const handleImageChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) {
            console.warn("⚠️ 파일이 선택되지 않았습니다.");
            return;
        }

        console.log("📷 파일 선택됨:", file.name, file.type, file.size);

        // 이미지 파일인지 확인
        if (!file.type.startsWith('image/')) {
            alert("이미지 파일만 업로드 가능합니다.");
            e.target.value = '';
            return;
        }

        // 파일 크기 제한 (10MB)
        if (file.size > 10 * 1024 * 1024) {
            alert("이미지 크기는 10MB 이하여야 합니다.");
            e.target.value = '';
            return;
        }

        setImageLoading(true);
        setSelectedFile(file);
        
        // 미리보기 생성 (커뮤니티처럼)
        const reader = new FileReader();
        reader.onloadend = () => {
            const dataUrl = reader.result;
            console.log("✅ 이미지 로드 성공!");
            
            setSelectedImage(dataUrl);
            setCurrentImage(dataUrl);
            setImageLoading(false);
            
            console.log("✅✅✅ 상태 업데이트 완료 - 이미지가 화면에 표시되어야 합니다 ✅✅✅");
        };
        
        reader.onerror = () => {
            console.error("❌ FileReader 에러");
            alert("이미지 파일을 불러올 수 없습니다.");
            setImageLoading(false);
            setSelectedFile(null);
            setSelectedImage(null);
            setCurrentImage(null);
            e.target.value = '';
        };
        
        reader.readAsDataURL(file);
    };

    const handleRemoveImage = () => {
        console.log("🗑️ 이미지 제거 요청");
        // 이전 이미지 URL 메모리 해제 (Blob URL인 경우만)
        if (selectedImage && selectedImage.startsWith('blob:')) {
            URL.revokeObjectURL(selectedImage);
        }
        setSelectedImage(null);
        setSelectedFile(null);
        setImageUrl('');
        setCurrentImage(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        console.log("✅ 이미지 제거 완료");
    };

    const handleDescriptionChange = (e) => {
        const newDescription = e.target.value;
        setDescription(newDescription);
        setCurrentDescription(newDescription);
    };

    const handleAnalyze = async () => {
        if (!selectedFile && !imageUrl.trim() && !description.trim()) {
            alert("사진(파일 또는 URL)을 업로드하거나 설명을 입력해주세요.");
            return;
        }

        // API 키 확인
        const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
        if (!apiKey) {
            alert("⚠️ OpenAI API 키가 설정되지 않았습니다.\n\n.env 파일에 VITE_OPENAI_API_KEY를 추가해주세요.");
            return;
        }

        setIsAnalyzing(true);
        try {
            let imageDataUrl = null;
            if (selectedFile) {
                imageDataUrl = await fileToDataUrl(selectedFile);
            } else if (imageUrl && imageUrl.trim()) {
                // URL을 그대로 사용
                imageDataUrl = imageUrl.trim();
            }

            const systemPrompt = `
당신은 20년 경력의 전문 영양사이자 비건 식단 전문가입니다.

**당신의 역할:**
- 음식의 영양성분을 정확하게 분석
- 비건 친화도를 명확하게 평가
- 숨어있는 동물성 재료까지 꼼꼼히 체크
- 실용적인 건강 조언 제공

**중요: 숨은 동물성 재료 체크리스트**
다음 재료들은 보통 동물성 성분을 포함합니다:
- 마요네즈 (달걀, 우유)
- 튀김옷/빵가루 (달걀, 우유)
- 버터, 크림, 치즈
- 육수 (멸치, 사골, 치킨스톡)
- 젤라틴 (동물 뼈)
- 우스터 소스 (멸치 액젓)
- 파르메산 치즈 (동물성 레닛)
- 꿀 (벌이 만든 것)
- 화이트 와인 (동물성 청징제)

**분석 원칙:**
1. 일반적인 1인분 기준으로 계산
2. 정확한 수치 제공 (추정치는 "약" 표시)
3. 비건이 아닌 음식은 대체 방안 필수 제시

**응답 규칙:**
- 이모지를 활용해 가독성 높이기
- 전문 용어는 쉽게 설명
- 긍정적이고 격려하는 톤 유지
- "일반적으로 ~에는 ~이 들어갑니다" 형태로 숨은 재료 설명
`.trim();

            const responseFormat = `
🍽️ **음식 정보**
- 음식명: 
- 예상 중량: 약 [숫자]g
- 주요 재료: [보이는 재료 나열]

📊 **영양성분** (1인분 기준)
- 칼로리: [숫자] kcal
- 탄수화물: [숫자]g
- 단백질: [숫자]g
- 지방: [숫자]g
- 식이섬유: [숫자]g
- 나트륨: [숫자]mg

🌱 **비건 분석**
- 비건 친화도: [완전 비건 ⭐⭐⭐ / 락토-오보 ⭐⭐ / 페스코 ⭐ / 비건 아님 ❌]
- 확인된 동물성 재료: [직접 보이는 동물성 재료]
- ⚠️ 숨어있을 가능성: [마요네즈, 튀김옷, 소스 등에 포함 가능한 동물성 재료]

💡 **비건 대체 제안**
[비건이 아닐 경우 구체적인 대체 방법]

⚠️ **주의사항**
- 구매 시 체크: [레스토랑이나 제품 구매시 확인해야 할 사항]
- 알레르기: [유발 가능 성분]

✨ **건강 조언**
[한 줄 조언]
`;

            const instruction = imageDataUrl
                ? `이미지의 음식을 분석해주세요.\n추가 정보: ${description || '없음'}`
                : `"${description}" 음식의 영양성분을 분석해주세요.`;

            const userPrompt = `${instruction}\n\n다음 형식으로 응답해주세요:\n${responseFormat}`.trim();

            const result = await analyzeMealWithLLM({
                prompt: userPrompt,
                imageDataUrl,
                systemPrompt
            });

            onAnalysisComplete(result);
        } catch (err) {
            console.error("영양 분석 에러:", err);
            const errorMessage = err.message || "알 수 없는 오류가 발생했습니다.";
            onAnalysisComplete(`❌ 에러 발생: ${errorMessage}\n\n문제가 계속되면 브라우저 콘솔을 확인해주세요.`);
            alert(`영양 분석 실패: ${errorMessage}`);
        } finally {
            setIsAnalyzing(false);
        }
    };

    // 사진(파일 또는 URL) 또는 설명 중 하나만 있어도 분석 가능
    const isFormComplete = (selectedImage || imageUrl.trim()) || description.trim();

    // 디버깅: selectedImage 상태 변화 확인
    useEffect(() => {
        console.log("🔄 selectedImage 상태 변경:", selectedImage ? "이미지 있음" : "이미지 없음");
        if (selectedImage) {
            console.log("이미지 URL 타입:", selectedImage.substring(0, 50));
        }
    }, [selectedImage]);

    return (
        <div className="w-full max-w-[480px] bg-white/90 rounded-[48px] shadow-xl p-6">
            <h3 className="text-base font-normal font-['Nunito'] text-gray-900 mb-6">
                오늘의 식단 등록
            </h3>

            <div className="space-y-4">
                <div className="relative h-72 bg-teal-50/30 rounded-3xl border-2 border-teal-300 overflow-hidden shadow-inner">
                    {/* 파일 입력 (완전히 숨김) */}
                    <input
                        id="meal-image-upload"
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                    />

                    {selectedImage ? (
                        <>
                            <div className="relative w-full h-full bg-white flex items-center justify-center">
                                {imageLoading && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/90 z-10">
                                        <div className="w-8 h-8 border-3 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div>
                                        <p className="text-xs text-gray-600 font-['Nunito']">
                                            로딩 중...
                                        </p>
                                    </div>
                                )}
                                <img
                                    src={selectedImage}
                                    alt="업로드된 식단"
                                    className="w-full h-full object-contain"
                                    style={{
                                        maxWidth: '100%',
                                        maxHeight: '100%',
                                        display: 'block'
                                    }}
                                    onLoad={(e) => {
                                        console.log("✅✅✅ 이미지 렌더링 완료! ✅✅✅");
                                        console.log("이미지 크기:", e.target.naturalWidth, "x", e.target.naturalHeight);
                                        setImageLoading(false);
                                    }}
                                    onError={(e) => {
                                        console.error("❌❌❌ 이미지 렌더링 에러! ❌❌❌", e);
                                        console.error("이미지 URL:", selectedImage?.substring(0, 100));
                                        alert("이미지를 표시할 수 없습니다.");
                                        handleRemoveImage();
                                    }}
                                    onLoadStart={() => {
                                        console.log("🔄 이미지 로드 시작...");
                                    }}
                                />
                                <div
                                    className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                                    onClick={() => {
                                        console.log("🔵 이미지 영역 클릭");
                                        fileInputRef.current?.click();
                                    }}
                                >
                                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-white/90 rounded-full text-gray-800 text-xs font-medium shadow-lg">
                                        클릭하여 사진 변경
                                    </div>
                                </div>
                                <div className="absolute top-2 left-2 px-3 py-1 bg-green-500/90 text-white text-xs font-medium rounded-full shadow-md flex items-center gap-1 z-20">
                                    <span>✓</span>
                                    <span>이미지 업로드 완료</span>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center gap-4">
                            <div className="text-5xl text-cyan-500 animate-pulse">📷</div>
                            <p className="text-base text-gray-600 font-['Nunito'] font-medium">
                                식단 사진을 업로드해주세요
                            </p>
                            <label
                                htmlFor="meal-image-upload"
                                className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-emerald-500 text-white rounded-2xl shadow-lg text-sm font-medium font-['Nunito'] hover:shadow-xl transition-shadow cursor-pointer inline-block"
                            >
                                사진 선택
                            </label>
                            <p className="text-xs text-gray-400 font-['Nunito']">
                                JPG, PNG, GIF (최대 10MB)
                            </p>
                        </div>
                    )}

                    {selectedImage && !imageLoading && (
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleRemoveImage();
                            }}
                            className="absolute top-2 right-2 w-9 h-9 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-colors z-30 hover:scale-110"
                            title="사진 제거"
                        >
                            <span className="text-lg font-bold">×</span>
                        </button>
                    )}
                </div>

                {/* URL 입력 옵션 (커뮤니티처럼) */}
                {!selectedImage && !imageUrl.trim() && (
                    <div className="space-y-2">
                        <p className="[font-family:'Nunito',Helvetica] font-normal text-gray-500 text-xs text-center">
                            또는
                        </p>
                        <input
                            type="url"
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                            placeholder="이미지 URL을 입력하세요 (예: https://example.com/image.jpg)"
                            className="w-full px-3 py-2 bg-zinc-100 rounded-2xl border-2 border-teal-200 text-sm font-['Nunito'] text-gray-900 placeholder:text-gray-500 focus:outline-none focus:border-teal-400"
                        />
                    </div>
                )}

                <textarea
                    value={description}
                    onChange={handleDescriptionChange}
                    placeholder="식단에 대한 설명을 입력해주세요... (선택사항)"
                    className="w-full h-24 px-3 py-2 bg-zinc-100 rounded-2xl border-2 border-teal-200 text-sm font-['Nunito'] text-gray-900 placeholder:text-gray-500 resize-none focus:outline-none focus:border-teal-400"
                />
                {!selectedImage && !imageUrl.trim() && !description.trim() && (
                    <p className="text-xs text-gray-500 text-center">
                        💡 사진(파일 또는 URL) 또는 설명 중 하나만 입력해도 분석이 가능합니다
                    </p>
                )}

                <button
                    onClick={handleAnalyze}
                    disabled={!isFormComplete}
                    className={`w-full h-9 rounded-2xl shadow-lg text-sm font-medium font-['Nunito'] flex items-center justify-center gap-2 transition-all ${isFormComplete
                        ? 'bg-gradient-to-r from-cyan-500 to-emerald-500 text-white hover:from-cyan-600 hover:to-emerald-600 cursor-pointer'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-50'
                        }`}
                >
                    <span>📊</span>
                    영양 분석하기
                </button>
            </div>
        </div>
    );
});

export default MealUploadCard;