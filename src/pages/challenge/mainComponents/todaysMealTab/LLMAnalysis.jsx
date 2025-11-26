import { useState, useEffect } from 'react';
import { recommendMealRecipe, extractIngredients, calculateSingleMealCarbonFootprint } from '../../../../api/openai';

function LLMAnalysis({ output, isAnalyzing, currentImage, currentDescription, onUploadComplete }) {
    const [recommendedRecipe, setRecommendedRecipe] = useState(null);
    const [ingredients, setIngredients] = useState([]);
    const [carbonFootprint, setCarbonFootprint] = useState(null);
    const [isRecommending, setIsRecommending] = useState(false);
    const [isExtracting, setIsExtracting] = useState(false);
    const [isCalculating, setIsCalculating] = useState(false);

    // output이 리셋되면 추천 결과도 리셋
    useEffect(() => {
        if (!output) {
            setRecommendedRecipe(null);
            setIngredients([]);
            setCarbonFootprint(null);
            setIsRecommending(false);
            setIsExtracting(false);
            setIsCalculating(false);
        }
    }, [output]);

    // 분석 결과가 나오면 자동으로 추천 → 식재료 추출 → 탄소발자국 계산
    useEffect(() => {
        if (output && !isAnalyzing && !recommendedRecipe && !isRecommending) {
            handleAutoRecommend();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [output, isAnalyzing]);

    const handleAutoRecommend = async () => {
        if (!output) return;

        try {
            // 1. 식단 추천
            setIsRecommending(true);
            console.log("🍽️ 식단 추천 시작...");
            const recipe = await recommendMealRecipe(output);
            if (recipe) {
                setRecommendedRecipe(recipe);
                console.log("✅ 식단 추천 완료");
                
                // 2. 식재료 추출
                setIsExtracting(true);
                console.log("📋 식재료 추출 시작...");
                const extracted = await extractIngredients(recipe);
                if (extracted && extracted.length > 0) {
                    setIngredients(extracted);
                    console.log("✅ 식재료 추출 완료:", extracted);
                    
                    // 3. 탄소발자국 계산
                    setIsCalculating(true);
                    console.log("🌱 탄소발자국 계산 시작...");
                    const carbon = await calculateSingleMealCarbonFootprint(output, extracted);
                    setCarbonFootprint(carbon);
                    console.log("✅ 탄소발자국 계산 완료:", carbon);
                }
            }
        } catch (error) {
            console.error("자동 추천 중 오류:", error);
        } finally {
            setIsRecommending(false);
            setIsExtracting(false);
            setIsCalculating(false);
        }
    };

    const handleUpload = () => {
        console.log("🔵 handleUpload 호출됨");
        console.log("🔵 output:", output ? "있음" : "없음");
        console.log("🔵 currentImage:", currentImage ? "있음" : "없음");
        console.log("🔵 recommendedRecipe:", recommendedRecipe ? "있음" : "없음");
        console.log("🔵 window.addMealToIndex:", typeof window.addMealToIndex);
        
        if (!output) {
            alert("분석 결과가 없습니다. 먼저 식단을 분석해주세요.");
            return;
        }
        
        if (!currentImage) {
            alert("이미지가 없습니다. 식단 사진을 업로드해주세요.");
            return;
        }

        if (typeof window.addMealToIndex !== 'function') {
            console.error("❌ window.addMealToIndex가 함수가 아닙니다:", window.addMealToIndex);
            alert("식단 저장 기능을 사용할 수 없습니다. 페이지를 새로고침해주세요.");
            return;
        }

        try {
            const mealData = {
                image: currentImage,
                description: currentDescription || '',
                analysis: output,
                recommendedRecipe: recommendedRecipe || null,
                ingredients: ingredients || [],
                carbonFootprint: carbonFootprint || null
            };
            
            console.log("🔵 저장할 식단 데이터:", mealData);
            const result = window.addMealToIndex(mealData);
            console.log("✅ 식단 저장 완료:", result);
            
            // localStorage에 저장되었는지 확인
            setTimeout(() => {
                const storedMeals = localStorage.getItem('challenge_meal_index_state');
                console.log("🔵 localStorage 확인:", storedMeals ? JSON.parse(storedMeals).length + "개 식단 저장됨" : "저장된 식단 없음");
            }, 100);
            
            alert("식단이 저장되었습니다!");
            onUploadComplete();
        } catch (error) {
            console.error("❌ 식단 저장 중 오류:", error);
            alert("식단 저장 중 오류가 발생했습니다: " + error.message);
        }
    };

    // GPT 응답 파싱 (수정됨)
    // 추천 식단 파싱
    const parseRecommendedRecipe = (text) => {
        if (!text) return null;

        const recipeNameMatch = text.match(/🍽️\s*\*\*추천 식단명\*\*\s*\n([^\n]+)/);
        const ingredientsMatch = text.match(/📋\s*\*\*필요한 식재료\*\*\s*\n([\s\S]*?)(?=👨‍🍳|💡|$)/);
        const recipeMatch = text.match(/👨‍🍳\s*\*\*간단한 조리법\*\*\s*\n([\s\S]*?)(?=💡|$)/);
        const reasonMatch = text.match(/💡\s*\*\*추천 이유\*\*\s*\n([\s\S]*?)$/);

        return {
            name: recipeNameMatch?.[1]?.trim(),
            ingredients: ingredientsMatch?.[1]?.trim(),
            recipe: recipeMatch?.[1]?.trim(),
            reason: reasonMatch?.[1]?.trim()
        };
    };

    const parseAnalysis = (text) => {
        if (!text) return null;

        // 음식 정보
        const foodMatch = text.match(/음식명:\s*([^\n]+)/);
        const weightMatch = text.match(/예상 중량:\s*([^\n]+)/);
        const ingredientsMatch = text.match(/주요 재료:\s*([^\n]+)/);

        // 영양성분
        const caloriesMatch = text.match(/칼로리:\s*([^\n]+)/);
        const carbsMatch = text.match(/탄수화물:\s*([^\n]+)/);
        const proteinMatch = text.match(/단백질:\s*([^\n]+)/);
        const fatMatch = text.match(/지방:\s*([^\n]+)/);
        const fiberMatch = text.match(/식이섬유:\s*([^\n]+)/);
        const sodiumMatch = text.match(/나트륨:\s*([^\n]+)/);

        // 비건 분석
        const veganMatch = text.match(/비건 친화도:\s*([^\n]+)/);
        const animalMatch = text.match(/확인된 동물성 재료:\s*([^\n]+)/);
        const hiddenMatch = text.match(/⚠️ 숨어있을 가능성:\s*([^\n]+)/);

        // 비건 대체 제안 (수정)
        const alternativeMatch = text.match(/💡 \*\*비건 대체 제안\*\*\s*\n([^\n⚠️✨]+)/);

        // 주의사항
        const cautionMatch = text.match(/⚠️ \*\*주의사항\*\*\s*\n([\s\S]*?)(?=✨|$)/);

        // 건강 조언
        const adviceMatch = text.match(/✨ \*\*건강 조언\*\*\s*\n([^\n]+)/);

        return {
            food: {
                name: foodMatch?.[1]?.trim(),
                weight: weightMatch?.[1]?.trim(),
                ingredients: ingredientsMatch?.[1]?.trim()
            },
            nutrition: {
                calories: caloriesMatch?.[1]?.trim(),
                carbs: carbsMatch?.[1]?.trim(),
                protein: proteinMatch?.[1]?.trim(),
                fat: fatMatch?.[1]?.trim(),
                fiber: fiberMatch?.[1]?.trim(),
                sodium: sodiumMatch?.[1]?.trim()
            },
            vegan: {
                level: veganMatch?.[1]?.trim(),
                animal: animalMatch?.[1]?.trim(),
                hidden: hiddenMatch?.[1]?.trim()
            },
            alternative: alternativeMatch?.[1]?.trim(),
            caution: cautionMatch?.[1]?.trim(),
            advice: adviceMatch?.[1]?.trim()
        };
    };

    const analysis = parseAnalysis(output);

    return (
        <div className="w-full bg-white/90 rounded-[48px] shadow-2xl p-6 flex flex-col gap-4 h-[555px]">
            <div className="flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold font-['Nunito'] text-gray-900">
                        영양 분석 결과
                    </h3>
                    <span className="px-3 py-1 bg-teal-50 rounded-full text-xs font-medium font-['Nunito'] text-teal-600">
                        AI 분석
                    </span>
                </div>

                <button
                    onClick={handleUpload}
                    disabled={!output}
                    className={`px-4 py-2 rounded-2xl text-sm font-medium font-['Nunito'] transition-colors ${output
                            ? 'bg-gradient-to-r from-cyan-500 to-emerald-500 text-white hover:from-cyan-600 hover:to-emerald-600'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                >
                    업로드
                </button>
            </div>

            <div className="flex-1 bg-gray-50 rounded-3xl p-4 overflow-y-auto">
                {isAnalyzing ? (
                    <div className="flex flex-col items-center justify-center h-full gap-4">
                        <div className="w-12 h-12 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div>
                        <p className="text-sm font-['Nunito'] text-gray-500">
                            AI가 식단을 분석하고 있습니다...
                        </p>
                    </div>
                ) : analysis ? (
                    <div className="space-y-3">
                        {/* 음식 정보 */}
                        {analysis.food.name && (
                            <div className="bg-white rounded-2xl p-4 border border-blue-100">
                                <div className="flex items-center gap-2 mb-3">
                                    <h4 className="font-semibold text-gray-900">음식 정보</h4>
                                </div>
                                <div className="space-y-1 text-sm">
                                    <p className="text-gray-700"><span className="font-medium">음식명:</span> {analysis.food.name}</p>
                                    {analysis.food.weight && <p className="text-gray-600">{analysis.food.weight}</p>}
                                    {analysis.food.ingredients && <p className="text-gray-600">주요 재료: {analysis.food.ingredients}</p>}
                                </div>
                            </div>
                        )}

                        {/* 영양성분 */}
                        {analysis.nutrition.calories && (
                            <div className="bg-white rounded-2xl p-4 border border-emerald-100">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="text-xl">📊</span>
                                    <h4 className="font-semibold text-gray-900">영양성분</h4>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    {analysis.nutrition.calories && (
                                        <div className="flex justify-between p-2 bg-orange-50 rounded-lg">
                                            <span className="text-gray-700">칼로리</span>
                                            <span className="font-semibold text-orange-700">{analysis.nutrition.calories}</span>
                                        </div>
                                    )}
                                    {analysis.nutrition.carbs && (
                                        <div className="flex justify-between p-2 bg-yellow-50 rounded-lg">
                                            <span className="text-gray-700">탄수화물</span>
                                            <span className="font-semibold text-yellow-700">{analysis.nutrition.carbs}</span>
                                        </div>
                                    )}
                                    {analysis.nutrition.protein && (
                                        <div className="flex justify-between p-2 bg-red-50 rounded-lg">
                                            <span className="text-gray-700">단백질</span>
                                            <span className="font-semibold text-red-700">{analysis.nutrition.protein}</span>
                                        </div>
                                    )}
                                    {analysis.nutrition.fat && (
                                        <div className="flex justify-between p-2 bg-purple-50 rounded-lg">
                                            <span className="text-gray-700">지방</span>
                                            <span className="font-semibold text-purple-700">{analysis.nutrition.fat}</span>
                                        </div>
                                    )}
                                    {analysis.nutrition.fiber && (
                                        <div className="flex justify-between p-2 bg-green-50 rounded-lg">
                                            <span className="text-gray-700">식이섬유</span>
                                            <span className="font-semibold text-green-700">{analysis.nutrition.fiber}</span>
                                        </div>
                                    )}
                                    {analysis.nutrition.sodium && (
                                        <div className="flex justify-between p-2 bg-gray-100 rounded-lg">
                                            <span className="text-gray-700">나트륨</span>
                                            <span className="font-semibold text-gray-700">{analysis.nutrition.sodium}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* 비건 분석 */}
                        {analysis.vegan.level && (
                            <div className="bg-white rounded-2xl p-4 border border-teal-100">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="text-xl">🌱</span>
                                    <h4 className="font-semibold text-gray-900">비건 분석</h4>
                                </div>
                                <div className="space-y-2 text-sm">
                                    <div className="p-2 bg-teal-50 rounded-lg">
                                        <span className="font-medium text-teal-700">{analysis.vegan.level}</span>
                                    </div>
                                    {analysis.vegan.animal && (
                                        <p className="text-gray-700"><span className="font-medium">동물성 재료:</span> {analysis.vegan.animal}</p>
                                    )}
                                    {analysis.vegan.hidden && (
                                        <p className="text-amber-700 text-xs">⚠️ {analysis.vegan.hidden}</p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* 비건 대체 제안 */}
                        {analysis.alternative && (
                            <div className="bg-white rounded-2xl p-4 border border-indigo-100">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-xl">💡</span>
                                    <h4 className="font-semibold text-gray-900">비건 대체 제안</h4>
                                </div>
                                <p className="text-sm text-gray-700">{analysis.alternative}</p>
                            </div>
                        )}

                        {/* 주의사항 */}
                        {analysis.caution && (
                            <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-xl">⚠️</span>
                                    <h4 className="font-semibold text-amber-900">주의사항</h4>
                                </div>
                                <div className="text-sm text-amber-800 whitespace-pre-line">
                                    {analysis.caution}
                                </div>
                            </div>
                        )}

                        {/* 건강 조언 */}
                        {analysis.advice && (
                            <div className="bg-gradient-to-r from-cyan-50 to-emerald-50 rounded-2xl p-4 border border-cyan-100">
                                <div className="flex items-center gap-2">
                                    <span className="text-xl">✨</span>
                                    <p className="text-sm text-gray-700 font-medium">{analysis.advice}</p>
                                </div>
                            </div>
                        )}

                        {/* 추천 식단 */}
                        {(isRecommending || recommendedRecipe) && (
                            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-4 border border-purple-200">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="text-xl">🍽️</span>
                                    <h4 className="font-semibold text-gray-900">추천 식단</h4>
                                    {isRecommending && (
                                        <div className="w-4 h-4 border-2 border-purple-300 border-t-purple-600 rounded-full animate-spin ml-2"></div>
                                    )}
                                </div>
                                {recommendedRecipe ? (
                                    (() => {
                                        const parsed = parseRecommendedRecipe(recommendedRecipe);
                                        return parsed && parsed.name ? (
                                            <div className="space-y-3 text-sm">
                                                {parsed.name && (
                                                    <div>
                                                        <p className="font-semibold text-purple-900 text-base">{parsed.name}</p>
                                                    </div>
                                                )}
                                                {parsed.ingredients && (
                                                    <div className="bg-white/60 rounded-lg p-2">
                                                        <p className="font-medium text-gray-800 mb-1">필요한 식재료:</p>
                                                        <p className="text-gray-700 whitespace-pre-line text-xs">{parsed.ingredients}</p>
                                                    </div>
                                                )}
                                                {parsed.recipe && (
                                                    <div className="bg-white/60 rounded-lg p-2">
                                                        <p className="font-medium text-gray-800 mb-1">조리법:</p>
                                                        <p className="text-gray-700 whitespace-pre-line text-xs">{parsed.recipe}</p>
                                                    </div>
                                                )}
                                                {parsed.reason && (
                                                    <div className="bg-purple-100/60 rounded-lg p-2">
                                                        <p className="font-medium text-purple-900 mb-1">추천 이유:</p>
                                                        <p className="text-purple-800 whitespace-pre-line text-xs">{parsed.reason}</p>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="text-sm text-gray-700 whitespace-pre-line">
                                                {recommendedRecipe}
                                            </div>
                                        );
                                    })()
                                ) : (
                                    <p className="text-xs text-gray-500">AI가 식단을 추천하고 있습니다...</p>
                                )}
                            </div>
                        )}

                        {/* 식재료 목록 */}
                        {(isExtracting || ingredients.length > 0) && (
                            <div className="bg-white rounded-2xl p-4 border border-green-200">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="text-xl">📋</span>
                                    <h4 className="font-semibold text-gray-900">필요한 식재료</h4>
                                    {isExtracting && (
                                        <div className="w-4 h-4 border-2 border-green-300 border-t-green-600 rounded-full animate-spin ml-2"></div>
                                    )}
                                </div>
                                {ingredients.length > 0 ? (
                                    <div className="space-y-2">
                                        {ingredients.map((ing, idx) => (
                                            <div key={idx} className="flex justify-between items-center p-2 bg-green-50 rounded-lg">
                                                <span className="text-sm text-gray-700 font-medium">{ing.name}</span>
                                                <span className="text-xs text-gray-600">
                                                    {ing.amount} {ing.unit || ''}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-xs text-gray-500">식재료를 추출하고 있습니다...</p>
                                )}
                            </div>
                        )}

                        {/* 탄소발자국 */}
                        {(isCalculating || carbonFootprint) && (
                            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-4 border border-emerald-200">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="text-xl">🌱</span>
                                    <h4 className="font-semibold text-gray-900">탄소발자국</h4>
                                    {isCalculating && (
                                        <div className="w-4 h-4 border-2 border-emerald-300 border-t-emerald-600 rounded-full animate-spin ml-2"></div>
                                    )}
                                </div>
                                {carbonFootprint ? (
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center p-3 bg-emerald-100 rounded-lg">
                                            <span className="text-sm font-medium text-gray-700">총 CO2 배출량</span>
                                            <span className="text-lg font-bold text-emerald-700">
                                                {carbonFootprint.totalCO2Emission} kg CO₂
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center p-3 bg-teal-100 rounded-lg">
                                            <span className="text-sm font-medium text-gray-700">절약된 CO2</span>
                                            <span className="text-lg font-bold text-teal-700">
                                                {carbonFootprint.co2Saved} kg CO₂
                                            </span>
                                        </div>
                                        {carbonFootprint.ingredientBreakdown && carbonFootprint.ingredientBreakdown.length > 0 && (
                                            <div className="mt-3 pt-3 border-t border-emerald-200">
                                                <p className="text-xs font-medium text-gray-600 mb-2">식재료별 배출량:</p>
                                                <div className="space-y-1">
                                                    {carbonFootprint.ingredientBreakdown.map((item, idx) => (
                                                        <div key={idx} className="flex justify-between text-xs">
                                                            <span className="text-gray-600">{item.name}</span>
                                                            <span className="text-gray-700 font-medium">
                                                                {item.co2Emission?.toFixed(2) || '0.00'} kg CO₂
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-xs text-gray-500">탄소발자국을 계산하고 있습니다...</p>
                                )}
                            </div>
                        )}
                    </div>
                ) : (
                    <p className="text-sm font-['Nunito'] text-gray-500 text-center">
                        식단 사진을 업로드하고 영양 분석하기 버튼을 눌러주세요.
                    </p>
                )}
            </div>
        </div>
    );
}

export default LLMAnalysis;