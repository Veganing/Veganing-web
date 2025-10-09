import { useState, useEffect } from 'react';

/**
 * 탄소 발자국 히스토리를 관리하는 hook
 */
function useCarbonHistory() {
    const [carbonHistory, setCarbonHistory] = useState([]);
    const [totalCO2, setTotalCO2] = useState(0);

    // 데이터 로드
    const loadData = () => {
        const data = window.carbonHistory || [];
        setCarbonHistory(data);
        
        const total = data.reduce((sum, entry) => sum + entry.co2Saved, 0);
        setTotalCO2(total);
    };

    // 초기 로드 및 이벤트 리스너 등록
    useEffect(() => {
        loadData();

        const handleUpdate = () => {
            loadData();
        };

        window.addEventListener('carbonDataUpdated', handleUpdate);
        return () => window.removeEventListener('carbonDataUpdated', handleUpdate);
    }, []);

    // 새 데이터 추가
    const addCarbonData = (newEntry) => {
        const savedData = window.carbonHistory || [];
        
        const entry = {
            date: new Date().toISOString(),
            co2Saved: parseFloat(newEntry.co2Saved || 0),
            veganRate: newEntry.veganRate || 0,
            mealCount: newEntry.mealCount || 0
        };
        
        savedData.push(entry);
        window.carbonHistory = savedData;
        
        // 이벤트 발생
        window.dispatchEvent(new CustomEvent('carbonDataUpdated'));
        
        return entry;
    };

    // 성장 단계 계산
    const getGrowthStage = (co2) => {
        if (co2 === 0) {
            return { emoji: '🌰', label: '씨앗', size: 'text-4xl' };
        } else if (co2 <= 5) {
            return { emoji: '🌱', label: '새싹', size: 'text-5xl' };
        } else if (co2 <= 10) {
            return { emoji: '🌿', label: '풀', size: 'text-6xl' };
        } else if (co2 <= 20) {
            return { emoji: '🌳', label: '나무', size: 'text-7xl' };
        } else {
            return { emoji: '🍁', label: '단풍나무', size: 'text-8xl' };
        }
    };

    return {
        carbonHistory,
        totalCO2,
        addCarbonData,
        getGrowthStage
    };
}

export default useCarbonHistory;