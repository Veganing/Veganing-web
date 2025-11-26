import React, { useState, useEffect } from 'react';
import { recommendMealRecipe } from '../../../../api/openai';

const STORAGE_KEY = 'challenge_meal_index_state';

const RecipeTab = () => {
    const [recipes, setRecipes] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const [selectedRecipe, setSelectedRecipe] = useState(null);

    // localStorage에서 식단 가져오기
    const getMealsFromStorage = () => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                return parsed || [];
            }
        } catch (error) {
            console.error('localStorage에서 식단 가져오기 실패:', error);
        }
        return [];
    };

    // 저장된 식단 분석 결과를 기반으로 레시피 추천
    useEffect(() => {
        loadRecommendedRecipes();
        
        // 탭이 보일 때마다 (포커스될 때마다) 새로고침
        const handleVisibilityChange = () => {
            if (!document.hidden) {
                loadRecommendedRecipes();
            }
        };
        
        const handleFocus = () => {
            loadRecommendedRecipes();
        };
        
        window.addEventListener('focus', handleFocus);
        document.addEventListener('visibilitychange', handleVisibilityChange);
        
        return () => {
            window.removeEventListener('focus', handleFocus);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

    const loadRecommendedRecipes = async () => {
        setIsLoading(true);
        try {
            // localStorage에서 직접 식단 가져오기
            let meals = getMealsFromStorage();
            
            console.log('🔵 RecipeTab - localStorage에서 가져온 식단 개수:', meals.length);
            
            // window.getAllMeals도 시도 (fallback)
            if (meals.length === 0) {
                const windowMeals = window.getAllMeals?.() || [];
                console.log('🔵 RecipeTab - window.getAllMeals에서 가져온 식단 개수:', windowMeals.length);
                if (windowMeals.length > 0) {
                    meals = windowMeals;
                }
            }
            
            console.log('🔵 RecipeTab - 최종 가져온 식단 개수:', meals.length);
            console.log('🔵 RecipeTab - 식단 데이터:', meals);
            
            // localStorage 내용도 직접 확인
            const rawStorage = localStorage.getItem(STORAGE_KEY);
            console.log('🔵 RecipeTab - localStorage 원본:', rawStorage);
            
            if (meals.length === 0) {
                setRecipes([]);
                return;
            }

            // 이미 저장된 추천 레시피가 있으면 그것을 사용
            const recommendedRecipes = [];
            
            for (const meal of meals) {
                // 이미 추천 레시피가 저장되어 있으면 사용
                if (meal.recommendedRecipe) {
                    // 3개의 레시피를 파싱
                    const parsedRecipes = parseMultipleRecipes(meal.recommendedRecipe, meal.analysis);
                    recommendedRecipes.push(...parsedRecipes);
                } else if (meal.analysis) {
                    // 추천 레시피가 없으면 새로 생성
                    try {
                        const recipeText = await recommendMealRecipe(meal.analysis);
                        if (recipeText) {
                            // 3개의 레시피를 파싱
                            const parsedRecipes = parseMultipleRecipes(recipeText, meal.analysis);
                            recommendedRecipes.push(...parsedRecipes);
                        }
                    } catch (error) {
                        console.error('레시피 추천 실패:', error);
                    }
                }
            }
            
            setRecipes(recommendedRecipes);
        } catch (error) {
            console.error('레시피 로드 실패:', error);
            setRecipes([]);
        } finally {
            setIsLoading(false);
        }
    };

    // 여러 레시피를 파싱하는 함수 (3개 추출)
    const parseMultipleRecipes = (recipeText, analysisResult) => {
        if (!recipeText) return [];
        
        const recipes = [];
        
        // 레시피를 구분자로 분리
        const recipeSections = recipeText.split(/---레시피 \d+---/).filter(section => section.trim());
        
        // 각 레시피 섹션을 파싱
        for (const section of recipeSections) {
            const parsed = parseRecommendedRecipe(section.trim(), analysisResult);
            if (parsed) {
                recipes.push(parsed);
            }
        }
        
        // 구분자가 없으면 하나의 레시피로 간주
        if (recipes.length === 0) {
            const singleRecipe = parseRecommendedRecipe(recipeText, analysisResult);
            if (singleRecipe) {
                recipes.push(singleRecipe);
            }
        }
        
        return recipes;
    };

    // 추천 레시피 파싱 함수 (LLMAnalysis와 유사하지만 구조화된 형태로)
    const parseRecommendedRecipe = (recipeText, analysisResult) => {
        if (!recipeText) return null;

        // 분석 결과에서 영양 정보 추출
        const parseAnalysis = (text) => {
            const caloriesMatch = text.match(/칼로리:\s*([^\n]+)/);
            const proteinMatch = text.match(/단백질:\s*([^\n]+)/);
            const carbsMatch = text.match(/탄수화물:\s*([^\n]+)/);
            const fatMatch = text.match(/지방:\s*([^\n]+)/);
            
            return {
                calories: caloriesMatch?.[1]?.trim()?.replace(/[^\d.]/g, '') || null,
                protein: proteinMatch?.[1]?.trim()?.replace(/[^\d.]/g, '') || null,
                carbs: carbsMatch?.[1]?.trim()?.replace(/[^\d.]/g, '') || null,
                fat: fatMatch?.[1]?.trim()?.replace(/[^\d.]/g, '') || null
            };
        };

        const analysis = parseAnalysis(analysisResult || '');
        
        // 추천 이유 추출 (분석 결과에서 부족한 영양소)
        const getRecommendReason = (text) => {
            if (!text) return '영양 보완';
            
            const proteinMatch = text.match(/단백질:\s*([^\n]+)/);
            const caloriesMatch = text.match(/칼로리:\s*([^\n]+)/);
            
            // 간단한 추천 이유 생성
            if (proteinMatch && parseFloat(proteinMatch[1]) < 20) {
                return '단백질 부족';
            }
            if (caloriesMatch && parseFloat(caloriesMatch[1]) < 300) {
                return '칼로리 부족';
            }
            return '영양 균형';
        };

        const recipeNameMatch = recipeText.match(/🍽️\s*\*\*추천 식단명\*\*\s*\n([^\n]+)/) ||
                                recipeText.match(/추천 식단명:\s*([^\n]+)/) ||
                                recipeText.match(/^([^\n]+)/);
        
        const ingredientsMatch = recipeText.match(/📋\s*\*\*필요한 식재료\*\*\s*\n([\s\S]*?)(?=👨‍🍳|💡|$)/);
        const recipeMatch = recipeText.match(/👨‍🍳\s*\*\*간단한 조리법\*\*\s*\n([\s\S]*?)(?=💡|$)/);
        const reasonMatch = recipeText.match(/💡\s*\*\*추천 이유\*\*\s*\n([\s\S]*?)$/);

        const title = recipeNameMatch?.[1]?.trim() || '추천 레시피';
        const ingredients = ingredientsMatch?.[1]?.trim()?.split('\n').filter(Boolean) || [];
        const instructions = recipeMatch?.[1]?.trim() || '';
        const recommendReason = reasonMatch?.[1]?.trim() || getRecommendReason(analysisResult);

        return {
            id: Date.now() + Math.random(),
            title: title.replace(/^\*\*|\*\*$/g, ''),
            description: recommendReason,
            cookingTime: 20, // 기본값, 실제로는 레시피에서 추출 필요
            difficulty: "보통", // 기본값
            servings: 1,
            ingredients: ingredients.length > 0 
                ? ingredients.map(ing => ing.replace(/^[-•]\s*/, '').trim()).filter(Boolean)
                : ['식재료 정보 없음'],
            nutrition: {
                calories: parseInt(analysis.calories) || 300,
                carbohydrates: parseInt(analysis.carbs) || 0,
                protein: parseInt(analysis.protein) || 15,
                fat: parseInt(analysis.fat) || 5,
                fiber: 3,
                sodium: 400
            },
            recommendReason: recommendReason,
            instructions: instructions,
            rawRecipe: recipeText // 원본 텍스트 저장
        };
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-6xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">오늘의 추천 레시피</h1>
                    <p className="text-gray-600">식단 분석 결과를 바탕으로 추천하는 레시피입니다</p>
                    <button
                        onClick={loadRecommendedRecipes}
                        disabled={isLoading}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium disabled:bg-gray-400"
                    >
                        {isLoading ? '로딩 중...' : '레시피 새로고침'}
                    </button>
                </div>

                {/* 레시피 테이블 */}
                {isLoading ? (
                    <div className="bg-white rounded-lg shadow p-12 text-center">
                        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-600">AI가 레시피를 추천하고 있습니다...</p>
                    </div>
                ) : recipes.length === 0 ? (
                    <div className="bg-white rounded-lg shadow p-12 text-center">
                        <p className="text-gray-600 mb-4">저장된 식단이 없습니다.</p>
                        <p className="text-sm text-gray-500 mb-4">식단을 분석하고 저장하면 추천 레시피가 표시됩니다.</p>
                        <div className="text-sm text-gray-500">
                            <p>💡 팁: "오늘의 식단" 탭에서 식단을 분석한 후</p>
                            <p>"식단 저장" 버튼을 눌러 저장하세요!</p>
                        </div>
                    </div>
                ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {recipes.map((recipe) => (
                        <div 
                            key={recipe.id} 
                            className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
                        >
                            <div className="p-6">
                                {/* 레시피명 */}
                                <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                                    {recipe.title}
                                </h3>
                                
                                {/* 추천 이유 설명 - 배지 없이 일반 텍스트로 표시 */}
                                {recipe.description && (
                                    <p className="text-sm text-gray-600 mb-4 leading-relaxed line-clamp-10">
                                        {recipe.description}
                                    </p>
                                )}
                                
                                {/* 정보 그리드 */}
                                <div className="grid grid-cols-2 gap-3 mb-4">
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-500 text-sm">⏱️</span>
                                        <span className="text-sm text-gray-700">{recipe.cookingTime}분</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-500 text-sm">🔥</span>
                                        <span className={`text-sm font-medium ${
                                            recipe.difficulty === '쉬움' ? 'text-green-600' :
                                            recipe.difficulty === '보통' ? 'text-yellow-600' :
                                            'text-red-600'
                                        }`}>
                                            {recipe.difficulty}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-500 text-sm">📊</span>
                                        <span className="text-sm text-gray-700">{recipe.nutrition.calories}kcal</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-500 text-sm">💪</span>
                                        <span className="text-sm text-gray-700">{recipe.nutrition.protein}g</span>
                                    </div>
                                </div>
                                
                                {/* 상세보기 버튼 */}
                                <button
                                    onClick={() => setSelectedRecipe(recipe)}
                                    className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-emerald-500 text-white rounded-lg hover:from-cyan-600 hover:to-emerald-600 transition-all text-sm font-medium shadow-md hover:shadow-lg"
                                >
                                    상세보기
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                )}

                {/* 상세 정보 모달 */}
                {selectedRecipe && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <h2 className="text-2xl font-bold text-gray-800">{selectedRecipe.title}</h2>
                                    <button
                                        onClick={() => setSelectedRecipe(null)}
                                        className="text-gray-400 hover:text-gray-600 text-2xl"
                                    >
                                        ×
                                    </button>
                                </div>

                                <p className="text-gray-600 mb-6">{selectedRecipe.description}</p>

                                <div className="grid grid-cols-3 gap-4 mb-6">
                                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                                        <div className="text-sm text-gray-500">조리시간</div>
                                        <div className="text-lg font-semibold text-gray-800">{selectedRecipe.cookingTime}분</div>
                                    </div>
                                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                                        <div className="text-sm text-gray-500">난이도</div>
                                        <div className="text-lg font-semibold text-gray-800">{selectedRecipe.difficulty}</div>
                                    </div>
                                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                                        <div className="text-sm text-gray-500">인분</div>
                                        <div className="text-lg font-semibold text-gray-800">{selectedRecipe.servings}인분</div>
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-3">영양 정보 (1인분 기준)</h3>
                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="p-3 bg-blue-50 rounded-lg">
                                            <div className="text-sm text-gray-600">칼로리</div>
                                            <div className="text-lg font-semibold text-gray-800">{selectedRecipe.nutrition.calories}kcal</div>
                                        </div>
                                        <div className="p-3 bg-green-50 rounded-lg">
                                            <div className="text-sm text-gray-600">탄수화물</div>
                                            <div className="text-lg font-semibold text-gray-800">{selectedRecipe.nutrition.carbohydrates}g</div>
                                        </div>
                                        <div className="p-3 bg-purple-50 rounded-lg">
                                            <div className="text-sm text-gray-600">단백질</div>
                                            <div className="text-lg font-semibold text-gray-800">{selectedRecipe.nutrition.protein}g</div>
                                        </div>
                                        <div className="p-3 bg-yellow-50 rounded-lg">
                                            <div className="text-sm text-gray-600">지방</div>
                                            <div className="text-lg font-semibold text-gray-800">{selectedRecipe.nutrition.fat}g</div>
                                        </div>
                                        <div className="p-3 bg-orange-50 rounded-lg">
                                            <div className="text-sm text-gray-600">식이섬유</div>
                                            <div className="text-lg font-semibold text-gray-800">{selectedRecipe.nutrition.fiber}g</div>
                                        </div>
                                        <div className="p-3 bg-red-50 rounded-lg">
                                            <div className="text-sm text-gray-600">나트륨</div>
                                            <div className="text-lg font-semibold text-gray-800">{selectedRecipe.nutrition.sodium}mg</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-3">재료</h3>
                                    <ul className="space-y-2">
                                        {selectedRecipe.ingredients.map((ingredient, index) => (
                                            <li key={index} className="flex items-center text-gray-700">
                                                <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                                                {ingredient}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {selectedRecipe.instructions && (
                                    <div className="mb-6">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-3">조리법</h3>
                                        <div className="bg-gray-50 rounded-lg p-4 whitespace-pre-line text-gray-700">
                                            {selectedRecipe.instructions}
                                        </div>
                                    </div>
                                )}

                                <button
                                    onClick={() => setSelectedRecipe(null)}
                                    className="w-full py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
                                >
                                    닫기
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RecipeTab;