import { useState, useEffect } from 'react';
import { analyzeMealWithLLM, fileToDataUrl } from "../../../../api/openai";

function MealUploadCard({ onAnalysisComplete, setIsAnalyzing, setCurrentImage, setCurrentDescription, resetTrigger }) {
    const [selectedImage, setSelectedImage] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [description, setDescription] = useState('');

    // resetTrigger가 변경되면 초기화
    useEffect(() => {
        if (resetTrigger > 0) {
            setSelectedImage(null);
            setSelectedFile(null);
            setDescription('');
        }
    }, [resetTrigger]);

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            const imageUrl = URL.createObjectURL(file);
            setSelectedImage(imageUrl);
            setCurrentImage(imageUrl);
        }
    };

    const handleDescriptionChange = (e) => {
        const newDescription = e.target.value;
        setDescription(newDescription);
        setCurrentDescription(newDescription);
    };

    const handleAnalyze = async () => {
        if (!selectedFile && !description) {
            alert("사진을 업로드하거나 설명을 입력해주세요.");
            return;
        }

        setIsAnalyzing(true);
        try {
            let imageDataUrl = null;
            if (selectedFile) {
                imageDataUrl = await fileToDataUrl(selectedFile);
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
            console.error(err);
            onAnalysisComplete("에러 발생: " + err.message);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const isFormComplete = selectedImage && description.trim();

    return (
        <div className="w-full max-w-[480px] bg-white/90 rounded-[48px] shadow-xl p-6">
            <h3 className="text-base font-normal font-['Nunito'] text-gray-900 mb-6">
                오늘의 식단 등록
            </h3>

            <div className="space-y-4">
                <label className="block h-72 bg-teal-50/30 rounded-3xl border-2 border-teal-300 cursor-pointer hover:bg-teal-50/50 transition-colors">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                    />

                    {selectedImage ? (
                        <img
                            src={selectedImage}
                            alt="업로드된 식단"
                            className="w-full h-full object-cover rounded-3xl"
                        />
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center gap-4">
                            <div className="text-4xl text-cyan-500">📷</div>
                            <p className="text-base text-gray-500 font-['Nunito']">
                                식단 사진을 업로드해주세요
                            </p>
                            <div className="px-6 py-2 bg-white rounded-2xl shadow-sm border-2 border-cyan-500 text-teal-600 text-sm font-medium font-['Nunito']">
                                사진 선택
                            </div>
                        </div>
                    )}
                </label>

                <textarea
                    value={description}
                    onChange={handleDescriptionChange}
                    placeholder="식단에 대한 설명을 입력해주세요..."
                    className="w-full h-24 px-3 py-2 bg-zinc-100 rounded-2xl border-2 border-teal-200 text-sm font-['Nunito'] text-gray-900 placeholder:text-gray-500 resize-none focus:outline-none focus:border-teal-400"
                />

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
}

export default MealUploadCard;