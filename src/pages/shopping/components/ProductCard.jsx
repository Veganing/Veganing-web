/*function ProductCard({ product }) {
    return (
        <a 
            href={product.link} 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-full group cursor-pointer block"
        >
            
            <div className="relative w-full aspect-square bg-gray-100 rounded-lg overflow-hidden mb-3">
                <img 
                    src={product.image || "https://via.placeholder.com/200x200/10b981/ffffff?text=Vegan"} 
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {product.isNew && (
                    <div className="absolute top-2 left-2 px-2 py-0.5 bg-emerald-500 rounded text-white text-[10px] font-medium">
                        신상품
                    </div>
                )}
            </div>

            
            <div className="flex flex-col gap-1">
                <div className="text-gray-500 text-[10px] font-normal">
                    {product.brand || 'VeganHealth'}
                </div>
                
                <h3 className="text-gray-900 text-sm font-normal line-clamp-2 leading-tight">
                    {product.title}
                </h3>
                
                <div className="flex items-center gap-1 mt-1">
                    <div className="flex text-[10px]">
                        <span className="text-yellow-400">★★★★★</span>
                    </div>
                    <span className="text-gray-500 text-[10px]">(267)</span>
                </div>
                
                <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-lg font-bold text-gray-900">
                        {product.price?.toLocaleString() || '28,000'}원
                    </span>
                </div>
                
                <div className="text-emerald-600 text-xs font-medium">
                    내일(화) 도착 보장
                </div>
            </div>
        </a>
    );
}

export default ProductCard;*/

// 위치: src/pages/shopping/components/ProductCard.jsx

import React from "react";
// [수정] 네이버 링크 대신 라우터로 이동해야 하니까 useNavigate 추가
import { useNavigate } from "react-router-dom";

function ProductCard({ product }) {
    // [수정] 훅으로 navigate 함수 꺼내오기
    const navigate = useNavigate();

    // [수정] 카드 클릭 시 실행되는 함수
    const handleClick = (e) => {
        // a 태그 기본 동작(새로고침, 외부 링크 이동) 막기
        e.preventDefault();

        // 우리 앱 내부 라우트로 이동
        // 예: /store/1, /store/2 ...
        // products 더미 데이터 안에 id가 있어야 함
        navigate(`/store/${product.id}`);
    };

    return (
        // [수정] 원래는 <a href=...> 였는데
        //  - href로 외부 URL 이동 X
        //  - onClick으로 라우터 이동 O
        <a
            href="#"
            onClick={handleClick}
            className="w-full group cursor-pointer block"
        >
            {/* 상품 이미지 */}
            <div className="relative w-full aspect-square bg-gray-100 rounded-lg overflow-hidden mb-3">
                <img
                    // 이미지가 없으면 기본 placeholder 사용
                    src={
                        product.image ||
                        "https://via.placeholder.com/200x200/10b981/ffffff?text=Vegan"
                    }
                    // name이 있으면 name, 없으면 title 사용
                    alt={product.name || product.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {product.isNew && (
                    <div className="absolute top-2 left-2 px-2 py-0.5 bg-emerald-500 rounded text-white text-[10px] font-medium">
                        신상품
                    </div>
                )}
            </div>

            {/* 상품 정보 */}
            <div className="flex flex-col gap-1">
                <div className="text-gray-500 text-[10px] font-normal">
                    {/* brand 없으면 기본 텍스트 */}
                    {product.brand || "VeganHealth"}
                </div>

                <h3 className="text-gray-900 text-sm font-normal line-clamp-2 leading-tight">
                    {/* name 우선, 없으면 title */}
                    {product.name || product.title}
                </h3>

                <div className="flex items-center gap-1 mt-1">
                    <div className="flex text-[10px]">
                        <span className="text-yellow-400">★★★★★</span>
                    </div>
                    <span className="text-gray-500 text-[10px]">(267)</span>
                </div>

                <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-lg font-bold text-gray-900">
                        {/* price 없을 때 대비해서 기본값 28000 */}
                        {(product.price || 28000).toLocaleString()}원
                    </span>
                </div>

                <div className="text-emerald-600 text-xs font-medium">
                    내일(화) 도착 보장
                </div>
            </div>
        </a>
    );
}

export default ProductCard;
