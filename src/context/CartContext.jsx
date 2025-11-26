// 위치: src/context/CartContext.jsx

import React, { createContext, useContext, useState } from "react";

// 1) 처음부터 장바구니에 들어 있을 더미 데이터
const initialCartItems = [/*
    {
        id: 1,
        name: "비건 단백질 쉐이크",
        price: 35000,
        quantity: 2,
        image:
            "https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=400&h=400&fit=crop",
        category: "건강식품",
    },
    {
        id: 2,
        name: "유기농 두부 세트",
        price: 12000,
        quantity: 1,
        image:
            "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=400&h=400&fit=crop",
        category: "신선식품",
    },
    {
        id: 3,
        name: "비건 김치",
        price: 18000,
        quantity: 1,
        image:
            "https://images.unsplash.com/photo-1582169296194-e4d644c48063?w=400&h=400&fit=crop",
        category: "반찬",
    },
    {
        id: 4,
        name: "식물성 우유 (귀리)",
        price: 4500,
        quantity: 3,
        image:
            "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&h=400&fit=crop",
        category: "음료",
    },*/
];

const CartContext = createContext(null);

export function CartProvider({ children }) {
    // 2) 더미데이터로 상태 초기화
    const [cartItems, setCartItems] = useState(initialCartItems);

    // 장바구니에 추가
    const addToCart = (product, quantity = 1) => {
        setCartItems((prev) => {
            const existing = prev.find((item) => item.id === product.id);
            if (existing) {
                // 이미 있으면 수량만 +추가
                return prev.map((item) =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            }
            // 없으면 새 항목 추가
            return [
                ...prev,
                {
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    image: product.image,
                    category: product.category,
                    quantity: quantity,
                },
            ];
        });
    };

    // 수량 변경
    const updateQuantity = (id, delta) => {
        setCartItems((prev) =>
            prev.map((item) =>
                item.id === id
                    ? {
                          ...item,
                          quantity: Math.max(1, item.quantity + delta),
                      }
                    : item
            )
        );
    };

    // 항목 삭제
    const removeFromCart = (id) => {
        setCartItems((prev) => prev.filter((item) => item.id !== id));
    };

    // 전체 비우기
    const clearCart = () => {
        setCartItems([]);
    };

    return (
        <CartContext.Provider
            value={{
                cartItems,
                addToCart,
                updateQuantity,
                removeFromCart,
                clearCart,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const ctx = useContext(CartContext);
    if (!ctx) {
        throw new Error("useCart는 CartProvider 안에서만 사용할 수 있습니다.");
    }
    return ctx;
}
