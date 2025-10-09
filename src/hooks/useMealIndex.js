import { useState, useEffect } from 'react';

/**
 * 식단 목록(인덱스)을 관리하는 hook
 */
function useMealIndex() {
    const [meals, setMeals] = useState([]);

    // 식단 추가
    const addMeal = (mealData) => {
        const newMeal = {
            id: Date.now(),
            ...mealData,
            timestamp: new Date()
        };
        setMeals(prev => [...prev, newMeal]);
        return newMeal;
    };

    // 식단 삭제
    const deleteMeal = (id) => {
        setMeals(prev => prev.filter(meal => meal.id !== id));
    };

    // 전체 초기화
    const resetMeals = () => {
        setMeals([]);
    };

    // 모든 식단 가져오기
    const getAllMeals = () => {
        return meals;
    };

    // window 객체에 함수 등록 (기존 코드와 호환성)
    useEffect(() => {
        window.addMealToIndex = addMeal;
        window.getAllMeals = getAllMeals;
        window.resetMealIndex = resetMeals;

        return () => {
            delete window.addMealToIndex;
            delete window.getAllMeals;
            delete window.resetMealIndex;
        };
    }, [meals]);

    return {
        meals,
        mealsCount: meals.length,
        addMeal,
        deleteMeal,
        resetMeals,
        getAllMeals
    };
}

export default useMealIndex;