import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useCarbonHistory from '../../../../hooks/useCarbonHistory';

function EnvImpactPopup({ isOpen, onClose, data }) {
    const { addCarbonData } = useCarbonHistory();
    const navigate = useNavigate();
    const [showNotification, setShowNotification] = useState(false);
    
    if (!isOpen && !showNotification) return null;

    const handleLike = () => {
        // 데이터 저장
        addCarbonData({
            co2Saved: data?.co2Saved || 0,
            veganRate: data?.veganRate || 0,
            mealCount: data?.mealCount || 0
        });
        
        // 알림 모달 표시 (팝업은 닫지 않음)
        setShowNotification(true);
    };

    const handleGoToProgress = () => {
        setShowNotification(false);
        onClose();
        navigate('/challenge/main/progress');
    };

    return (
        <>
            {/* 환경 기여도 팝업 */}
            {isOpen && !showNotification && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="w-[672px] h-[800px] relative bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 rounded-3xl shadow-2xl overflow-hidden">
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/80 hover:bg-white flex items-center justify-center z-10"
                        >
                            ✕
                        </button>

                        <div className="w-full h-full px-8 py-8 flex flex-col justify-between">
                            <div className="flex flex-col gap-2">
                                <div className="text-center text-3xl font-normal font-['Inter'] leading-9 tracking-tight">
                                    🌍 오늘의 환경 기여도
                                </div>
                                <div className="text-center text-gray-600 text-base font-normal font-['Inter'] leading-normal">
                                    점심 분석 결과
                                </div>
                            </div>

                            <div className="flex-1 bg-white/20 rounded-2xl flex items-center justify-center my-4">
                                <div className="text-8xl">🌳</div>
                            </div>

                            <div className="flex flex-col gap-3">
                                <div className="text-center text-emerald-700 text-xl font-normal font-['Inter'] leading-loose tracking-tight">
                                    나무가 자라고 있어요! 🌿
                                </div>

                                <div className="px-6 py-4 bg-white/95 rounded-2xl shadow-md flex flex-col gap-3">
                                    <div className="flex flex-col items-center gap-1">
                                        <div className="text-3xl font-normal font-['Inter'] leading-10 tracking-tight">
                                            {data?.co2Saved || '0'}kg
                                        </div>
                                        <div className="text-gray-600 text-sm font-normal font-['Inter'] leading-normal">
                                            CO₂ 절약
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        <div className="flex-1 px-3 py-2 bg-emerald-100 rounded-2xl flex flex-col items-center border border-emerald-200">
                                            <div className="text-emerald-700 text-xs font-normal font-['Inter'] leading-tight">
                                                비건 비율
                                            </div>
                                            <div className="text-emerald-600 text-lg font-normal font-['Inter'] leading-7">
                                                {data?.veganRate || '0'}%
                                            </div>
                                        </div>
                                        <div className="flex-1 px-3 py-2 bg-teal-100 rounded-2xl flex flex-col items-center border border-teal-200">
                                            <div className="text-teal-700 text-xs font-normal font-['Inter'] leading-tight">
                                                분석 음식
                                            </div>
                                            <div className="text-teal-600 text-sm font-normal font-['Inter'] leading-tight">
                                                {data?.mealCount || 0}개 항목
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-0.5 pt-1 border-gray-200">
                                        <div className="text-gray-500 text-xs font-normal font-['Inter'] text-center">
                                            🌱 1kg CO₂ = 나무 1그루가 1년간 흡수하는 양
                                        </div>
                                        <div className="text-gray-500 text-xs font-normal font-['Inter'] text-center">
                                            🌍 작은 실천이 지구를 구합니다!
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-center items-center gap-4 mt-2">
                                    <button
                                        onClick={handleLike}
                                        className="px-8 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl text-white text-sm font-medium font-['Inter'] hover:from-emerald-600 hover:to-teal-600"
                                    >
                                        좋아요! 🌿
                                    </button>
                                    <button className="px-8 py-2 bg-white rounded-2xl border border-emerald-300 text-emerald-700 text-sm font-medium font-['Inter'] hover:bg-emerald-50">
                                        공유하기 📱
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 알림 모달 */}
            {showNotification && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
                    <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full mx-4">
                        {/* 아이콘 */}
                        <div className="text-center mb-6">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full mb-4">
                                <span className="text-3xl">✅</span>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                저장 완료!
                            </h3>
                            <p className="text-gray-600">
                                데이터가 성공적으로 저장되었습니다
                            </p>
                        </div>

                        {/* 안내 메시지 */}
                        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-4 mb-6">
                            <div className="flex items-start gap-3">
                                <span className="text-2xl flex-shrink-0">💡</span>
                                <div className="text-sm text-gray-700">
                                    <p className="font-semibold mb-1">더 많은 기능을 확인하세요!</p>
                                    <p>• <span className="font-medium">레시피 탭</span>에서 AI 추천 식단을 확인하세요</p>
                                    <p>• <span className="font-medium">쇼핑 탭</span>에서 관련 상품을 둘러보세요</p>
                                </div>
                            </div>
                        </div>

                        {/* 버튼 */}
                        <button
                            onClick={handleGoToProgress}
                            className="w-full py-3 bg-gradient-to-r from-cyan-500 to-emerald-500 text-white rounded-2xl font-semibold hover:from-cyan-600 hover:to-emerald-600 transition-all shadow-lg"
                        >
                            진행 현황 보러가기 →
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}

export default EnvImpactPopup;