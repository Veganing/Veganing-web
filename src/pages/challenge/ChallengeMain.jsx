import { Outlet } from 'react-router-dom';
import ChallengeTabs from "./mainComponents/challengeContent/ChallengeTab";

function ChallengeMain() {
    // 카드 데이터
    const cards = [
        { emoji: '📅', value: '7', label: '일째 진행' },
        { emoji: '🔥', value: '7', label: '연속 달성' },
        { emoji: '⭐', value: '1250', label: '포인트' },
        { emoji: '🏆', value: 'Lv.3', label: '레벨' }
    ];

    // 진행률 데이터
    const currentDay = 7;
    const totalDays = 30;
    const progress = (currentDay / totalDays) * 100;

    return (
        <div className="min-h-screen bg-white pt-[157px] pb-[80px]">
            <div className="max-w-7xl mx-auto px-4 flex flex-col gap-8">
                
                {/* Challenge Hero */}
                <div className="w-full text-center space-y-6 mb-12">
                    <h1 className="text-6xl font-normal font-['Inter'] leading-[60px] tracking-tight text-primary-dark">
                        1개월 비건 챌린지
                    </h1>
                    <div className="flex justify-center">
                        <div className="p-[2px] bg-gradient-to-r from-cyan-400 to-emerald-400 rounded-full">
                            <div className="px-6 py-2 bg-white rounded-full">
                                <span className="text-teal-600 text-bold font-medium font-['Nunito']">
                                    플렉시테리언
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Challenge State Cards */}
                <div className="w-full flex justify-center mb-12">
                    <div className="flex gap-4 flex-wrap justify-center">
                        {cards.map((card, idx) => (
                            <div 
                                key={idx} 
                                className="w-[236px] h-[160px] bg-white/90 rounded-[35px] shadow-2xl p-6 flex flex-col items-center justify-center gap-3"
                            >
                                <div className="text-4xl">{card.emoji}</div>
                                <div className="text-3xl font-bold font-['Nunito'] text-gray-900">
                                    {card.value}
                                </div>
                                <div className="text-sm font-normal font-['Nunito'] text-gray-600">
                                    {card.label}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Challenge Progress */}
                <div className="w-full bg-white/90 rounded-[48px] shadow-2xl p-6 flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-normal font-['Nunito'] text-gray-900">
                            챌린지 진행률
                        </h3>
                        <div className="px-4 py-1 bg-teal-50 rounded-full">
                            <span className="text-sm font-medium font-['Nunito'] text-gray-600">
                                {currentDay}/{totalDays}일
                            </span>
                        </div>
                    </div>
                    <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full transition-all"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                {/* Challenge Tabs */}
                <ChallengeTabs />

                {/* Tab Content (Outlet) */}
                <Outlet />
            </div>
        </div>
    );
}

export default ChallengeMain;