import {useState} from 'react'
import useMealUpload from "../../../../hooks/useMealUpload";

import MealUploadCard from "./MealUploadCard";
import LLMAnalysis from "./LLMAnalysis";
import MealIndex from "./MealIndex";
import UploadButton from './uploadButton';

function MealContainer() {
    const [mealsCount, setMealsCount] = useState(0);
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
        resetUpload();
        window.resetMealIndex?.();
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

            <MealIndex onMealsCountChange={setMealsCount} />
            <UploadButton mealsCount={mealsCount} onSaveComplete={handleSaveComplete} />
        </div>
    );
}

export default MealContainer;