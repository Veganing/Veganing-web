import { useState } from 'react';
import EnvImpactPopup from './EnvimpactPopup';
import { calculateCarbonFootprint, recommendMealRecipe } from '../../../../api/openai';
import { addPoints, getToken } from '../../../../api/backend';

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
                // 각 식단에 대해 추천 레시피 생성
                console.log("🍽️ 추천 레시피 생성 시작...");
                const mealsWithRecipes = await Promise.all(
                    meals.map(async (meal) => {
                        // 이미 추천 레시피가 있으면 그대로 사용
                        if (meal.recommendedRecipe) {
                            return meal;
                        }
                        
                        // 분석 결과가 있으면 추천 레시피 생성
                        if (meal.analysis) {
                            try {
                                const recipe = await recommendMealRecipe(meal.analysis);
                                if (recipe) {
                                    console.log(`✅ 식단 ${meal.id}에 대한 추천 레시피 생성 완료`);
                                    return { ...meal, recommendedRecipe: recipe };
                                }
                            } catch (error) {
                                console.error(`식단 ${meal.id}의 추천 레시피 생성 실패:`, error);
                            }
                        }
                        return meal;
                    })
                );
                
                // 추천 레시피가 포함된 식단들을 localStorage에 저장
                try {
                    const STORAGE_KEY = 'challenge_meal_index_state';
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(mealsWithRecipes));
                    console.log("✅ 추천 레시피와 함께 식단 저장 완료");
                } catch (error) {
                    console.error('localStorage 저장 실패:', error);
                }
                
                // LLM으로 탄소발자국 계산
                const calculatedData = await calculateCarbonFootprint(meals);
                
                // 포인트 추가 및 레벨업 (200포인트)
                try {
                    const token = getToken();
                    if (token) {
                        const pointsResult = await addPoints(200, token);
                        console.log('✅ 포인트 추가 완료:', pointsResult);
                        
                        // 레벨업 알림
                        if (pointsResult.user.leveledUp && pointsResult.user.levelUps > 0) {
                            const levelUpMessage = pointsResult.user.levelUps > 1 
                                ? `🎉 레벨업 ${pointsResult.user.levelUps}회!\n\nLevel ${pointsResult.user.level - pointsResult.user.levelUps} → Level ${pointsResult.user.level} 달성!`
                                : `🎉 레벨업! Level ${pointsResult.user.level} 달성!`;
                            alert(`${levelUpMessage}\n\n+200 포인트 추가!\n현재 포인트: ${pointsResult.user.points} / 600`);
                            
                            // 레벨업 시 페이지 새로고침하여 상단 카드 업데이트
                            setTimeout(() => {
                                window.location.reload();
                            }, 1000);
                        } else {
                            alert(`+200 포인트 추가!\n\n현재 포인트: ${pointsResult.user.points} / 600\n레벨: ${pointsResult.user.level}`);
                            
                            // 포인트 업데이트 반영을 위해 상단 데이터 새로고침 (페이지 리로드 없이)
                            window.dispatchEvent(new CustomEvent('pointsUpdated'));
                        }
                    }
                } catch (pointsError) {
                    console.error('포인트 추가 실패:', pointsError);
                    // 포인트 추가 실패해도 탄소발자국 계산은 계속 진행
                }
                
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