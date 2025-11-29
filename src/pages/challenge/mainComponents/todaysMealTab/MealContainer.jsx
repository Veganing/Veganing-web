import {useState, memo} from 'react'
import useMealUpload from "../../../../hooks/useMealUpload";

import MealUploadCard from "./MealUploadCard";
import LLMAnalysis from "./LLMAnalysis";
import MealIndex from "./MealIndex";
import UploadButton from './UploadButton';

const MealContainer = memo(function MealContainer() {
    const [mealsCount, setMealsCount] = useState(0);
    const [isSaved, setIsSaved] = useState(false); // 저장 완료 상태
    const {
        analysisResult,
        isAnalyzing,
        currentImage,
        currentDescription,
        resetTrigger,
        setAnalysisResult,
        setIsAnalyzing,
        setCurrentImage,
        setCurrentDescription,
        resetUpload
    } = useMealUpload();

    const handleSaveComplete = () => {
        // 업로드 폼 리셋
        resetUpload();
        // UI상으로는 식단 기록을 숨기기 위해 상태 변경
        setIsSaved(true);
        // 식단은 localStorage에 이미 저장되어 있으므로 삭제하지 않음
        // (레시피 탭에서 추천 레시피를 계속 볼 수 있도록 유지)
        // window.resetMealIndex?.(); // 주석 처리: 추천 레시피 유지를 위해
    };

    return (
        <div className='w-full flex flex-col gap-8'>
            <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-2">
                <MealUploadCard
                    onAnalysisComplete={setAnalysisResult}
                    setIsAnalyzing={setIsAnalyzing}
                    setCurrentImage={setCurrentImage}
                    setCurrentDescription={setCurrentDescription}
                    resetTrigger={resetTrigger}
                />
                <div className="md:col-span-2">
                    <LLMAnalysis
                        output={analysisResult}
                        isAnalyzing={isAnalyzing}
                        currentImage={currentImage}
                        currentDescription={currentDescription}
                        onUploadComplete={resetUpload}
                    />
                </div>
            </div>

            {!isSaved && <MealIndex onMealsCountChange={setMealsCount} />}
            <UploadButton mealsCount={mealsCount} onSaveComplete={handleSaveComplete} />
        </div>
    );
});

export default MealContainer;