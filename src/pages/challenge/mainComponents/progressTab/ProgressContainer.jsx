import { useEffect } from "react";
import useCarbonHistory from "../../../../hooks/useCarbonHistory";

function ProgressContainer() {
    const { carbonHistory, totalCO2, getGrowthStage, loadData } = useCarbonHistory();

    // 페이지가 보일 때마다 데이터 새로고침
    useEffect(() => {
        // 초기 로드
        if (loadData) {
            loadData();
        }

        // 페이지 포커스 시 데이터 새로고침
        const handleFocus = () => {
            if (loadData) {
                loadData();
            }
        };

        // visibilitychange 이벤트로 페이지가 다시 보일 때 데이터 새로고침
        const handleVisibilityChange = () => {
            if (!document.hidden && loadData) {
                loadData();
            }
        };

        window.addEventListener('focus', handleFocus);
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            window.removeEventListener('focus', handleFocus);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [loadData]);

    return (
        <div className="w-full flex flex-col bg-white/90 rounded-[48px] shadow-2xl p-6 gap-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold font-['Nunito'] text-gray-900">
                    진행 현황
                </h3>
                <div className="text-2xl font-bold text-emerald-600 font-['Inter']">
                    {totalCO2.toFixed(1)}kg
                </div>
            </div>

            {/* 총 절약량 카드 */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-200">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600 font-['Inter']">총 CO₂ 절약량</span>
                    <span className="text-xs text-gray-500 font-['Inter']">
                        {carbonHistory.length}회 저장됨
                    </span>
                </div>
                <div className="text-4xl font-bold text-emerald-700 font-['Inter'] mb-2">
                    {totalCO2.toFixed(1)} kg
                </div>
                <div className="text-xs text-gray-500 font-['Inter']">
                    나무 {(totalCO2 / 1).toFixed(1)}그루가 1년간 흡수하는 양
                </div>
            </div>

            {/* 범례 */}
            <div className="flex flex-wrap gap-3 text-xs font-['Inter']">
                <div className="flex items-center gap-1">
                    <span>🌰</span>
                    <span className="text-gray-600">0kg</span>
                </div>
                <div className="flex items-center gap-1">
                    <span>🌱</span>
                    <span className="text-gray-600">~5kg</span>
                </div>
                <div className="flex items-center gap-1">
                    <span>🌿</span>
                    <span className="text-gray-600">~10kg</span>
                </div>
                <div className="flex items-center gap-1">
                    <span>🌳</span>
                    <span className="text-gray-600">~20kg</span>
                </div>
                <div className="flex items-center gap-1">
                    <span>🍁</span>
                    <span className="text-gray-600">20kg+</span>
                </div>
            </div>

            {/* 그래프 */}
            {carbonHistory.length > 0 ? (
                <div>
                    <h4 className="text-sm font-medium text-gray-700 font-['Nunito'] mb-3">
                        저장 기록
                    </h4>
                    <div className="overflow-x-auto pb-2">
                        <div className="flex items-end gap-6 min-w-max py-4">
                            {carbonHistory.map((entry, index) => {
                                const date = new Date(entry.date);
                                const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;
                                const stage = getGrowthStage(entry.co2Saved);

                                return (
                                    <div key={index} className="flex flex-col items-center gap-3">
                                        {/* 이모지 - 나중에 애니메이션 추가 */}
                                        <div className={`${stage.size} transition-all hover:scale-110 cursor-pointer`}>
                                            {stage.emoji}
                                        </div>

                                        {/* CO2 값 */}
                                        <div className="text-sm font-bold text-emerald-700 font-['Inter']">
                                            {entry.co2Saved.toFixed(1)}kg
                                        </div>

                                        {/* 날짜와 단계 */}
                                        <div className="flex flex-col items-center gap-0.5">
                                            <span className="text-xs text-gray-500 font-['Inter']">
                                                {dateStr}
                                            </span>
                                            <span className="text-xs text-gray-400 font-['Inter']">
                                                {stage.label}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-center py-8 text-gray-500 font-['Nunito'] text-sm">
                    아직 저장된 데이터가 없습니다.<br />
                    식단을 저장하고 '좋아요!'를 눌러보세요.
                </div>
            )}
        </div>
    );
}

export default ProgressContainer;