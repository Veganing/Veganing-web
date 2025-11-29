// 위치: src/pages/shopping/ProductDetail.jsx

import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PRODUCTS } from "../../data/products";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { useCart } from "../../context/CartContext.jsx";

function ProductDetail() {
    const { productId } = useParams();
    const navigate = useNavigate();

    // CartContext에서 장바구니 함수 가져오기
    const { addToCart } = useCart();

    // URL의 :productId로 상품 찾기
    const product = PRODUCTS.find(
        (p) => String(p.id) === String(productId)
    );

    const [quantity, setQuantity] = useState(1);

    // 팝업 표시 여부
    const [showPopup, setShowPopup] = useState(false);

    const handleBuyNow = () => {
        if (!product) return;

        const totalPrice = product.price * quantity;
        const shippingFee = totalPrice >= 30000 ? 0 : 3000;   // 과제용: 3만원 이상 무료, 아니면 3,000원
        const finalAmount = totalPrice + shippingFee;

        navigate("/order", {
            state: {
                items: [
                    {
                        id: product.id,
                        name: product.name,
                        image: product.image,
                        price: product.price,
                        quantity: quantity
                    }
                ],
                totalPrice,
                shippingFee,
                finalAmount
            }
        });
    };
    
    if (!product) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center space-y-4">
                    <p className="text-lg text-gray-600">
                        해당 상품을 찾을 수 없습니다.
                    </p>
                    <Button
                        onClick={() => navigate("/store")}
                        className="rounded-2xl bg-gradient-to-r from-teal-400 to-emerald-400"
                    >
                        쇼핑몰로 돌아가기
                    </Button>
                </div>
            </div>
        );
    }

    // ✅ 장바구니에 실제로 담기 + 팝업 열기
    const handleAddToCart = () => {
        // 1) 전역 장바구니에 추가
        addToCart(product, quantity);

        // 2) 예/아니요 팝업 열기
        setShowPopup(true);
    };

    return (
        <div className="min-h-screen bg-white py-10 px-4 animate-fadeIn">
            <div className="max-w-5xl mx-auto">
                {/* 상단 뒤로가기 */}
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-3xl font-semibold text-gray-800">
                        상품 상세
                    </h1>
                    <Button
                        variant="outline"
                        className="rounded-2xl border-teal-200"
                        onClick={() => navigate("/store")}
                    >
                        ← 목록으로
                    </Button>
                </div>

                <Card className="rounded-3xl shadow-lg border-2 border-teal-50">
                    <CardContent className="p-8 grid grid-cols-1 md:grid-cols-[1.2fr,1.5fr] gap-8">
                        {/* 이미지 영역 */}
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-72 h-72 rounded-3xl overflow-hidden bg-gray-100">
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <span className="px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-sm">
                                {product.category}
                            </span>
                        </div>

                        {/* 정보 영역 */}
                        <div className="space-y-5">
                            <div>
                                <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                                    {product.name}
                                </h2>
                                <p className="text-gray-500 text-sm">
                                    {product.description}
                                </p>
                            </div>

                            <div className="text-3xl font-bold text-teal-600">
                                {product.price.toLocaleString()}원
                            </div>

                            <div className="space-y-3 text-sm text-gray-600">
                                <p>원산지: {product.origin || "국산"}</p>
                                <p>배송: 3만원 이상 무료배송</p>
                            </div>

                            {/* 수량 선택 + 버튼들 */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <span className="text-gray-700 text-sm">
                                        수량
                                    </span>
                                    <div className="flex items-center border rounded-2xl overflow-hidden">
                                        <button
                                            className="px-3 py-1 text-gray-600"
                                            onClick={() =>
                                                setQuantity((q) =>
                                                    Math.max(1, q - 1)
                                                )
                                            }
                                        >
                                            -
                                        </button>
                                        <span className="px-4 py-1">
                                            {quantity}
                                        </span>
                                        <button
                                            className="px-3 py-1 text-gray-600"
                                            onClick={() =>
                                                setQuantity((q) => q + 1)
                                            }
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-3 mt-4">
                                    <Button
                                        className="flex-1 h-12 rounded-2xl bg-gradient-to-r from-teal-400 to-emerald-400 hover:from-teal-500 hover:to-emerald-500"
                                        onClick={handleAddToCart}
                                    >
                                        장바구니 담기
                                    </Button>

                                    <Button
                                        className="flex-1 h-12 rounded-2xl border-2 border-teal-200 text-teal-700 bg-white"
                                        variant="outline"
                                        onClick={handleBuyNow}
                                    >
                                        바로 구매
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* ✅ 예 / 아니요 팝업 UI */}
            {showPopup && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-6 shadow-xl w-72 text-center">
                        <p className="text-gray-800 font-medium mb-5">
                            장바구니 담기 완료! <br />
                            장바구니로 이동하시겠습니까?
                        </p>

                        <div className="flex justify-center gap-3">
                            <button
                                className="px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-700"
                                onClick={() => {
                                    setShowPopup(false)
                                    navigate("/store");
                                }} // 아니요
                            >
                                아니요
                            </button>
                            <button
                                className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-600 text-white"
                                onClick={() => navigate("/cart")} // 예
                            >
                                예
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ProductDetail;
