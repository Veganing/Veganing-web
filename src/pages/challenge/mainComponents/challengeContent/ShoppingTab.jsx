import React, { useState } from 'react';
import { searchNaverShopping } from '../../../../api/naver';

const ShoppingTab = () => {
    // LLM 추천 식단 기반 필요 식재료 목록
    const [requiredIngredients] = useState([
        { id: 1, name: "닭가슴살", amount: "300g", reason: "단백질 보충", priority: "높음" },
        { id: 2, name: "시금치", amount: "200g", reason: "철분 보충", priority: "높음" },
        { id: 3, name: "연어", amount: "150g", reason: "오메가3 보충", priority: "높음" },
        { id: 4, name: "로메인상추", amount: "1포기", reason: "비타민 보충", priority: "보통" },
        { id: 5, name: "방울토마토", amount: "100g", reason: "비타민C 보충", priority: "보통" },
        { id: 6, name: "현미", amount: "1kg", reason: "식이섬유 보충", priority: "보통" },
        { id: 7, name: "두부", amount: "1모", reason: "칼슘 보충", priority: "높음" },
        { id: 8, name: "아보카도", amount: "2개", reason: "건강한 지방", priority: "보통" }
    ]);

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedIngredient, setSelectedIngredient] = useState(null);

    // 네이버 쇼핑 API 호출
    const handleSearchNaverShopping = async (keyword) => {
        setLoading(true);
        try {
            const data = await searchNaverShopping(keyword, 20);
            setProducts(data.items || []);
        } catch (error) {
            console.error('네이버 쇼핑 API 호출 실패:', error);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    // 식재료 선택 시 상품 검색
    const handleIngredientClick = (ingredient) => {
        setSelectedIngredient(ingredient);
        handleSearchNaverShopping(ingredient.name);
    };

    // HTML 태그 제거 함수
    const removeHtmlTags = (text) => {
        return text.replace(/<[^>]*>/g, '');
    };

    // 가격 포맷팅
    const formatPrice = (price) => {
        return new Intl.NumberFormat('ko-KR').format(price);
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">추천 식단 쇼핑 목록</h1>
                    <p className="text-gray-600">식단 분석 결과를 바탕으로 필요한 식재료를 검색해보세요</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* 왼쪽: 필요 식재료 목록 */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow p-4">
                            <h2 className="text-lg font-semibold text-gray-800 mb-4">필요한 식재료</h2>
                            <div className="space-y-2 max-h-[600px] overflow-y-auto">
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
                        </div>
                    </div>

                    {/* 오른쪽: 네이버 쇼핑 검색 결과 */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-lg shadow">
                            {!selectedIngredient ? (
                                <div className="p-12 text-center text-gray-500">
                                    <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                    </svg>
                                    <p className="text-lg">왼쪽에서 식재료를 선택하면<br />쇼핑 상품을 검색해드립니다</p>
                                </div>
                            ) : (
                                <>
                                    <div className="p-4 border-b">
                                        <h2 className="text-xl font-semibold text-gray-800">
                                            "{selectedIngredient.name}" 검색 결과
                                        </h2>
                                        <p className="text-sm text-gray-600 mt-1">
                                            필요량: {selectedIngredient.amount} · {selectedIngredient.reason}
                                        </p>
                                    </div>

                                    {loading ? (
                                        <div className="p-12 text-center">
                                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                                            <p className="mt-4 text-gray-600">상품을 검색하는 중...</p>
                                        </div>
                                    ) : (
                                        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                                            <table className="w-full">
                                                <thead className="bg-gray-50 sticky top-0">
                                                    <tr>
                                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">상품명</th>
                                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">최저가</th>
                                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">브랜드</th>
                                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">카테고리</th>
                                                        <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">구매하기</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-200">
                                                    {products.length === 0 ? (
                                                        <tr>
                                                            <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                                                                검색 결과가 없습니다
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        products.map((product, index) => (
                                                            <tr key={index} className="hover:bg-gray-50 transition">
                                                                <td className="px-4 py-3">
                                                                    <div className="flex items-center space-x-3">
                                                                        <img
                                                                            src={product.image}
                                                                            alt={removeHtmlTags(product.title)}
                                                                            className="w-12 h-12 object-cover rounded"
                                                                            onError={(e) => {
                                                                                e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="48" height="48"%3E%3Crect fill="%23ddd" width="48" height="48"/%3E%3C/svg%3E';
                                                                            }}
                                                                        />
                                                                        <div className="flex-1 min-w-0">
                                                                            <div
                                                                                className="text-sm text-gray-800 line-clamp-2"
                                                                                dangerouslySetInnerHTML={{ __html: product.title }}
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td className="px-4 py-3">
                                                                    <div className="text-sm font-semibold text-gray-900">
                                                                        {formatPrice(product.lprice)}원
                                                                    </div>
                                                                    {product.hprice && product.hprice !== product.lprice && (
                                                                        <div className="text-xs text-gray-500 line-through">
                                                                            {formatPrice(product.hprice)}원
                                                                        </div>
                                                                    )}
                                                                </td>
                                                                <td className="px-4 py-3 text-sm text-gray-700">
                                                                    {product.brand || '-'}
                                                                </td>
                                                                <td className="px-4 py-3 text-sm text-gray-600">
                                                                    {product.category1 || '-'}
                                                                </td>
                                                                <td className="px-4 py-3 text-center">
                                                                    <a
                                                                        href={product.link}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="inline-block px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition"
                                                                    >
                                                                        네이버쇼핑
                                                                    </a>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShoppingTab;