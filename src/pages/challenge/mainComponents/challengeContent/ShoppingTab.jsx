import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const STORAGE_KEY = 'challenge_meal_index_state';

const ShoppingTab = () => {
    const navigate = useNavigate();
    const [requiredIngredients, setRequiredIngredients] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const [selectedIngredient, setSelectedIngredient] = useState(null);

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

    // 더미 레시피 데이터 (퀴노아와 채소 볶음)
    const DUMMY_RECIPE = {
        id: 'dummy-quinoa-stir-fry',
        title: '퀴노아와 채소 볶음',
        ingredients: [
            { name: '퀴노아', amount: '1컵', unit: '(조리된 것)' },
            { name: '브로콜리', amount: '1컵', unit: '(잘라서)' },
            { name: '당근', amount: '1개', unit: '(얇게 썬 것)' },
            { name: '파프리카', amount: '1개', unit: '(채썬 것)' },
            { name: '올리브 오일', amount: '1큰술', unit: '' },
            { name: '간장', amount: '1큰술', unit: '' },
            { name: '생강가루', amount: '약간', unit: '' }
        ],
        recommendReason: '퀴노아는 완전 단백질이 포함되어 있어 영양가가 높습니다.'
    };

    // 저장된 식단에서 식재료 추출
    useEffect(() => {
        loadIngredients();
        
        // 탭이 보일 때마다 새로고침
        const handleVisibilityChange = () => {
            if (!document.hidden) {
                loadIngredients();
            }
        };
        
        const handleFocus = () => {
            loadIngredients();
        };
        
        window.addEventListener('focus', handleFocus);
        document.addEventListener('visibilitychange', handleVisibilityChange);
        
        return () => {
            window.removeEventListener('focus', handleFocus);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

    const loadIngredients = () => {
        setIsLoading(true);
        try {
            // localStorage에서 식단 가져오기
            const meals = getMealsFromStorage();
            
            // window.getAllMeals도 시도 (fallback)
            let allMeals = meals;
            if (meals.length === 0) {
                allMeals = window.getAllMeals?.() || [];
            }
            
            console.log('🔵 ShoppingTab - 가져온 식단 개수:', allMeals.length);
            
            // 모든 식단의 식재료 수집
            const ingredientMap = new Map();
            const dummyIngredientIds = new Set(); // 더미 레시피 식재료 ID 추적
            
            // 더미 레시피의 식재료를 항상 첫 번째로 추가 (우선순위 높음)
            if (DUMMY_RECIPE.ingredients) {
                let dummyId = 1;
                for (const ing of DUMMY_RECIPE.ingredients) {
                    const key = ing.name.toLowerCase().trim();
                    const fullName = ing.name;
                    const amountText = `${ing.amount} ${ing.unit}`.trim();
                    
                    // 더미 레시피 식재료는 항상 추가 (중복이어도 덮어쓰기)
                    ingredientMap.set(key, {
                        id: dummyId++,
                        name: fullName,
                        amount: amountText,
                        reason: '추천 레시피',
                        priority: '높음',
                        isDummy: true // 더미 레시피 식재료 표시
                    });
                    dummyIngredientIds.add(key);
                }
            }
            
            for (const meal of allMeals) {
                // ingredients 배열이 있으면 사용
                if (meal.ingredients && Array.isArray(meal.ingredients) && meal.ingredients.length > 0) {
                    for (const ing of meal.ingredients) {
                        const key = (ing.name?.toLowerCase().trim() || ing.toLowerCase().trim()).split(/\s+/)[0];
                        const existing = ingredientMap.get(key);
                        
                        // 더미 레시피 식재료가 이미 있으면 건너뛰기 (더미가 우선)
                        if (dummyIngredientIds.has(key)) {
                            continue;
                        }
                        
                        if (existing) {
                            // 이미 존재하면 양 합치기
                            existing.amount = `${existing.amount} + ${ing.amount || ing}`;
                        } else {
                            ingredientMap.set(key, {
                                id: ingredientMap.size + 1,
                                name: ing.name || ing,
                                amount: ing.amount || (typeof ing === 'string' ? ing : '필요량 확인'),
                                reason: meal.recommendReason || '추천 식단',
                                priority: '보통'
                            });
                        }
                    }
                } else if (meal.recommendedRecipe) {
                    // recommendedRecipe에서 식재료 추출 시도 (여러 레시피 지원)
                    const recipeSections = meal.recommendedRecipe.split(/---레시피 \d+---/).filter(section => section.trim());
                    
                    // 레시피 섹션이 있으면 각 섹션에서 식재료 추출
                    if (recipeSections.length > 0) {
                        for (const section of recipeSections) {
                            const ingredientsMatch = section.match(/📋\s*\*\*필요한 식재료\*\*\s*\n([\s\S]*?)(?=👨‍🍳|💡|---|$)/);
                            if (ingredientsMatch) {
                                const ingredientsText = ingredientsMatch[1].trim();
                                const ingredientLines = ingredientsText.split('\n').filter(line => line.trim());
                                
                                for (const line of ingredientLines) {
                                    const cleaned = line.replace(/^[-•\s*]/, '').trim();
                                    if (cleaned) {
                                        const key = cleaned.toLowerCase().split(/\s+/)[0]; // 첫 단어만 키로 사용
                                        
                                        // 더미 레시피 식재료가 이미 있으면 건너뛰기 (더미가 우선)
                                        if (dummyIngredientIds.has(key)) {
                                            continue;
                                        }
                                        
                                        const existing = ingredientMap.get(key);
                                        
                                        if (existing) {
                                            // 이미 존재하면 양 합치기
                                            existing.amount = `${existing.amount} + ${cleaned.replace(/^\S+\s*/, '').trim() || '필요량 확인'}`;
                                        } else {
                                            ingredientMap.set(key, {
                                                id: ingredientMap.size + 1,
                                                name: cleaned.split(/\s+/)[0] || cleaned,
                                                amount: cleaned.replace(/^\S+\s*/, '').trim() || '필요량 확인',
                                                reason: meal.recommendReason || '추천 식단',
                                                priority: '보통'
                                            });
                                        }
                                    }
                                }
                            }
                        }
                    } else {
                        // 구분자가 없으면 전체 텍스트에서 식재료 추출 시도
                        const ingredientsMatch = meal.recommendedRecipe.match(/📋\s*\*\*필요한 식재료\*\*\s*\n([\s\S]*?)(?=👨‍🍳|💡|---|$)/);
                        if (ingredientsMatch) {
                            const ingredientsText = ingredientsMatch[1].trim();
                            const ingredientLines = ingredientsText.split('\n').filter(line => line.trim());
                            
                            for (const line of ingredientLines) {
                                const cleaned = line.replace(/^[-•\s*]/, '').trim();
                                if (cleaned) {
                                    const key = cleaned.toLowerCase().split(/\s+/)[0];
                                    
                                    // 더미 레시피 식재료가 이미 있으면 건너뛰기 (더미가 우선)
                                    if (dummyIngredientIds.has(key)) {
                                        continue;
                                    }
                                    
                                    const existing = ingredientMap.get(key);
                                    
                                    if (existing) {
                                        existing.amount = `${existing.amount} + ${cleaned.replace(/^\S+\s*/, '').trim() || '필요량 확인'}`;
                                    } else {
                                        ingredientMap.set(key, {
                                            id: ingredientMap.size + 1,
                                            name: cleaned.split(/\s+/)[0] || cleaned,
                                            amount: cleaned.replace(/^\S+\s*/, '').trim() || '필요량 확인',
                                            reason: meal.recommendReason || '추천 식단',
                                            priority: '보통'
                                        });
                                    }
                                }
                            }
                        }
                    }
                }
            }
            
            // 더미 레시피 식재료를 먼저 정렬하고, 나머지를 뒤에 추가
            const ingredients = Array.from(ingredientMap.values());
            const sortedIngredients = ingredients.sort((a, b) => {
                // 더미 레시피 식재료를 우선 정렬
                if (a.isDummy && !b.isDummy) return -1;
                if (!a.isDummy && b.isDummy) return 1;
                // 둘 다 더미이거나 둘 다 아니면 원래 순서 유지
                return a.id - b.id;
            });
            
            console.log('🔵 ShoppingTab - 추출된 식재료 개수:', sortedIngredients.length);
            console.log('🔵 ShoppingTab - 더미 레시피 식재료:', sortedIngredients.filter(ing => ing.isDummy).map(ing => ing.name));
            setRequiredIngredients(sortedIngredients);
        } catch (error) {
            console.error('식재료 로드 실패:', error);
            setRequiredIngredients([]);
        } finally {
            setIsLoading(false);
        }
    };

    // 식재료 선택 시 상세 정보 표시
    const handleIngredientClick = (ingredient) => {
        setSelectedIngredient(ingredient);
    };

    // 사이트 내 쇼핑몰로 이동
    const handleGoToShopping = (ingredientName) => {
        navigate(`/store?search=${encodeURIComponent(ingredientName)}`);
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">추천 식단 쇼핑 목록</h1>
                    <p className="text-gray-600">식단 분석 결과를 바탕으로 필요한 식재료를 검색해보세요</p>
                    <button
                        onClick={loadIngredients}
                        disabled={isLoading}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium disabled:bg-gray-400"
                    >
                        {isLoading ? '로딩 중...' : '식재료 목록 새로고침'}
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* 왼쪽: 필요 식재료 목록 */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow p-4">
                            <h2 className="text-lg font-semibold text-gray-800 mb-4">필요한 식재료</h2>
                            {isLoading ? (
                                <div className="text-center py-8">
                                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
                                    <p className="mt-4 text-sm text-gray-600">식재료를 불러오는 중...</p>
                                </div>
                            ) : requiredIngredients.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <p className="text-sm mb-2">저장된 식단이 없습니다.</p>
                                    <p className="text-xs">식단을 분석하고 저장하면 추천 식재료가 표시됩니다.</p>
                                </div>
                            ) : (
                            <div className="space-y-2 max-h-[693px] overflow-y-auto">
                                {requiredIngredients.map((ingredient) => (
                                    <button
                                        key={ingredient.id}
                                        onClick={() => handleIngredientClick(ingredient)}
                                        className={`w-full text-left p-3 rounded-lg border-2 transition ${selectedIngredient?.id === ingredient.id
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-gray-200 hover:border-blue-300'
                                            }`}
                                    >
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="font-medium text-gray-800">{ingredient.name}</span>
                                            <span className={`text-xs px-2 py-1 rounded ${ingredient.priority === '높음' ? 'bg-red-100 text-red-700' :
                                                    ingredient.priority === '보통' ? 'bg-yellow-100 text-yellow-700' :
                                                        'bg-green-100 text-green-700'
                                                }`}>
                                                {ingredient.priority}
                                            </span>
                                        </div>
                                        <div className="text-sm text-gray-600">{ingredient.amount}</div>
                                        <div className="text-xs text-gray-500 mt-1">{ingredient.reason}</div>
                                    </button>
                                ))}
                            </div>
                            )}
                        </div>
                    </div>

                    {/* 오른쪽: 식재료 상세 정보 */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-lg shadow">
                            {!selectedIngredient ? (
                                <div className="p-12 text-center text-gray-500">
                                    <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                    <p className="text-lg font-medium text-gray-700 mb-2">식재료를 선택해주세요</p>
                                    <p className="text-sm text-gray-500">왼쪽에서 식재료를 선택하면<br />상세 정보와 구매 링크를 확인할 수 있습니다</p>
                                </div>
                            ) : (
                                <div className="p-6">
                                    <div className="mb-6 pb-4 border-b">
                                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                            {selectedIngredient.name}
                                        </h2>
                                        <div className="flex items-center gap-4 text-sm text-gray-600">
                                            <span>필요량: <strong className="text-gray-800">{selectedIngredient.amount}</strong></span>
                                            <span>·</span>
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                {selectedIngredient.reason}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        {/* 구매 링크 */}
                                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                                            <h3 className="text-lg font-semibold text-gray-800 mb-4">구매하기</h3>
                                            <p className="text-sm text-gray-600 mb-4">
                                                {selectedIngredient.name}을(를) 쇼핑몰에서 검색해보세요.
                                            </p>
                                            <button
                                                onClick={() => handleGoToShopping(selectedIngredient.name)}
                                                className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium shadow-md hover:shadow-lg"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                                </svg>
                                                쇼핑몰에서 검색하기
                                            </button>
                                        </div>

                                        {/* 식재료 정보 */}
                                        <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                                            <h3 className="text-lg font-semibold text-gray-800 mb-4">식재료 정보</h3>
                                            <div className="space-y-3">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm text-gray-600">식재료명</span>
                                                    <span className="text-sm font-medium text-gray-800">{selectedIngredient.name}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm text-gray-600">필요량</span>
                                                    <span className="text-sm font-medium text-gray-800">{selectedIngredient.amount}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm text-gray-600">추천 이유</span>
                                                    <span className="text-sm font-medium text-gray-800">{selectedIngredient.reason}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* 쇼핑 팁 */}
                                        <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-200">
                                            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                                <span>💡</span>
                                                쇼핑 팁
                                            </h3>
                                            <ul className="space-y-2 text-sm text-gray-700">
                                                <li className="flex items-start gap-2">
                                                    <span className="text-yellow-600 mt-1">•</span>
                                                    <span>유기농이나 친환경 제품을 우선 선택하세요</span>
                                                </li>
                                                <li className="flex items-start gap-2">
                                                    <span className="text-yellow-600 mt-1">•</span>
                                                    <span>신선도와 유통기한을 꼭 확인하세요</span>
                                                </li>
                                                <li className="flex items-start gap-2">
                                                    <span className="text-yellow-600 mt-1">•</span>
                                                    <span>필요량에 맞는 적정 포장 크기를 선택하세요</span>
                                                </li>
                                                <li className="flex items-start gap-2">
                                                    <span className="text-yellow-600 mt-1">•</span>
                                                    <span>비건 인증이 있는 제품을 확인하세요</span>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShoppingTab;