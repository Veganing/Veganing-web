import { useState } from 'react';
import EnvImpactPopup from './EnvimpactPopup';
import { calculateCarbonFootprint } from '../../../../api/openai';

function UploadButton({ mealsCount, onSaveComplete }) {
    const [showPopup, setShowPopup] = useState(false);
    const [impactData, setImpactData] = useState(null);
    const [isCalculating, setIsCalculating] = useState(false);

    const handleClick = async () => {
        const confirmed = confirm("정말 저장하시겠습니까?\n\n저장 후에는 되돌릴 수 없습니다.");
        
        if (confirmed) {
            const meals = window.getAllMeals?.() || [];
            
            console.log("가져온 식단 데이터:", meals);
            console.log("첫번째 식단 분석 내용:", meals[0]?.analysis); // 추가
            
            if (meals.length === 0) {
                alert("저장할 식단이 없습니다.");
                return;
            }

            setIsCalculating(true);
            
            try {
                // LLM으로 탄소발자국 계산
                const calculatedData = await calculateCarbonFootprint(meals);
                
                setImpactData(calculatedData);
                setShowPopup(true);
                
                // 인덱스 리셋
                onSaveComplete();
            } catch (error) {
                console.error('계산 중 오류:', error);
                alert("계산 중 오류가 발생했습니다.");
            } finally {
                setIsCalculating(false);
            }
        }
    };

    const handleClosePopup = () => {
        setShowPopup(false);
    };

    const isDisabled = mealsCount === 0 || isCalculating;

    return (
        <>
            <div className="w-full">
                <button 
                    onClick={handleClick}
                    disabled={isDisabled}
                    className={`w-full h-14 rounded-[48px] shadow-2xl text-lg font-semibold font-['Nunito'] transition-colors flex items-center justify-center gap-2 ${
                        isDisabled
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-gradient-to-r from-cyan-500 to-emerald-500 text-white hover:from-cyan-600 hover:to-emerald-600'
                    }`}
                >
                    {isCalculating ? '계산 중...' : '오늘의 식단 전체 저장하기'}
                </button>
            </div>

            <EnvImpactPopup 
                isOpen={showPopup}
                onClose={handleClosePopup}
                data={impactData}
            />
        </>
    );
}

export default UploadButton;