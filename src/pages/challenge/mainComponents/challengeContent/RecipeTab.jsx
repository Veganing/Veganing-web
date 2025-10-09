import React, { useState } from 'react';

const RecipeTab = () => {
    // 더미 데이터
    const [recipes] = useState([
        {
            id: 1,
            title: "고단백 닭가슴살 샐러드",
            description: "부족한 단백질을 보충할 수 있는 건강한 샐러드",
            cookingTime: 15,
            difficulty: "쉬움",
            servings: 1,
            ingredients: ["닭가슴살 150g", "로메인 상추 100g", "방울토마토 50g", "올리브유 1큰술", "발사믹 식초 1큰술"],
            nutrition: {
                calories: 280,
                carbohydrates: 12,
                protein: 35,
                fat: 10,
                fiber: 4,
                sodium: 320
            },
            recommendReason: "단백질 부족"
        },
        {
            id: 2,
            title: "시금치 두부 된장국",
            description: "철분과 칼슘이 풍부한 영양 만점 국",
            cookingTime: 20,
            difficulty: "쉬움",
            servings: 2,
            ingredients: ["시금치 100g", "두부 1/2모", "된장 1큰술", "멸치육수 500ml", "마늘 1쪽"],
            nutrition: {
                calories: 120,
                carbohydrates: 8,
                protein: 12,
                fat: 5,
                fiber: 3,
                sodium: 580
            },
            recommendReason: "철분 부족"
        },
        {
            id: 3,
            title: "연어 아보카도 덮밥",
            description: "오메가3와 비타민이 풍부한 영양 덮밥",
            cookingTime: 25,
            difficulty: "보통",
            servings: 1,
            ingredients: ["연어 100g", "아보카도 1/2개", "현미밥 1공기", "간장 1큰술", "참기름 약간", "김 약간"],
            nutrition: {
                calories: 520,
                carbohydrates: 55,
                protein: 28,
                fat: 22,
                fiber: 8,
                sodium: 420
            },
            recommendReason: "오메가3 부족"
        }
    ]);

    const [selectedRecipe, setSelectedRecipe] = useState(null);

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-6xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">오늘의 추천 레시피</h1>
                    <p className="text-gray-600">식단 분석 결과를 바탕으로 추천하는 레시피입니다</p>
                </div>

                {/* 레시피 테이블 */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">레시피명</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">추천 이유</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">조리시간</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">난이도</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">칼로리</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">단백질</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {recipes.map((recipe) => (
                                <tr key={recipe.id} className="hover:bg-gray-50 transition">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-900">{recipe.title}</div>
                                        <div className="text-sm text-gray-500">{recipe.description}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                            {recipe.recommendReason}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-700">{recipe.cookingTime}분</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2 py-1 rounded text-sm ${recipe.difficulty === '쉬움' ? 'bg-green-100 text-green-800' :
                                                recipe.difficulty === '보통' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-red-100 text-red-800'
                                            }`}>
                                            {recipe.difficulty}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-700">{recipe.nutrition.calories}kcal</td>
                                    <td className="px-6 py-4 text-gray-700">{recipe.nutrition.protein}g</td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => setSelectedRecipe(recipe)}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                                        >
                                            상세보기
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

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