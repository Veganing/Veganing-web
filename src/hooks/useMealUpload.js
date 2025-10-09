import { useState } from 'react';

/**
 * 식단 업로드 및 분석 관련 상태를 관리하는 hook
 */
function useMealUpload() {
    const [analysisResult, setAnalysisResult] = useState("");
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [currentImage, setCurrentImage] = useState(null);
    const [currentDescription, setCurrentDescription] = useState("");
    const [resetTrigger, setResetTrigger] = useState(0);

    // 전체 리셋
    const resetUpload = () => {
        setAnalysisResult("");
        setCurrentImage(null);
        setCurrentDescription("");
        setResetTrigger(prev => prev + 1);
    };

    // 분석 완료 처리
    const handleAnalysisComplete = (result) => {
        setAnalysisResult(result);
        setIsAnalyzing(false);
    };

    // 분석 시작
    const startAnalysis = () => {
        setIsAnalyzing(true);
    };

    return {
        // 상태
        analysisResult,
        isAnalyzing,
        currentImage,
        currentDescription,
        resetTrigger,
        
        // 액션
        setAnalysisResult,
        setIsAnalyzing,
        setCurrentImage,
        setCurrentDescription,
        resetUpload,
        handleAnalysisComplete,
        startAnalysis
    };
}

export default useMealUpload;