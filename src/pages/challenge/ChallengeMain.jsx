import { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import ChallengeTabs from "./mainComponents/challengeContent/ChallengeTab";
import { getCurrentChallenge, getChallengeStats, getToken } from '../../api/backend';

function ChallengeMain() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [challengeData, setChallengeData] = useState(null);
    const [statsData, setStatsData] = useState(null);

    useEffect(() => {
        const fetchChallengeData = async () => {
            try {
                setIsLoading(true);
                const token = getToken();

                if (!token) {
                    console.error('로그인이 필요합니다.');
                    navigate('/challenge/choice');
                    return;
                }

                // 현재 챌린지와 통계 데이터를 동시에 가져오기
                const [challengeResponse, statsResponse] = await Promise.all([
                    getCurrentChallenge(token).catch(err => {
                        console.error('챌린지 조회 실패:', err);
                        return null;
                    }),
                    getChallengeStats(token).catch(err => {
                        console.error('통계 조회 실패:', err);
                        return null;
                    })
                ]);

                if (!challengeResponse || !challengeResponse.userChallenge) {
                    console.log('진행 중인 챌린지가 없습니다.');
                    navigate('/challenge/choice');
                    return;
                }

                setChallengeData(challengeResponse.userChallenge);
                setStatsData(statsResponse?.stats);
            } catch (error) {
                console.error('데이터 조회 실패:', error);
                navigate('/challenge/choice');
            } finally {
                setIsLoading(false);
            }
        };

        fetchChallengeData();

        // 페이지 포커스 시 데이터 새로고침
        const handleFocus = () => {
            fetchChallengeData();
        };

        window.addEventListener('focus', handleFocus);
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                fetchChallengeData();
            }
        });

        return () => {
            window.removeEventListener('focus', handleFocus);
        };
    }, [navigate]);

    // 로딩 중일 때
    if (isLoading) {
        return (
            <div className="min-h-screen bg-white pt-[157px] pb-[80px] flex items-center justify-center">
                <div className="text-center">
                    <div className="text-4xl mb-4">⏳</div>
                    <p className="text-gray-600">챌린지 데이터 불러오는 중...</p>
                </div>
            </div>
        );
    }

    // 챌린지 데이터가 없을 때 (실패 시)
    if (!challengeData) {
        return null;
    }

    // 카드 데이터 (백엔드에서 받은 실제 데이터 사용)
    const cards = [
        { emoji: '📅', value: challengeData.currentDay || 0, label: '일째 진행' },
        { emoji: '🔥', value: statsData?.currentStreak || 0, label: '연속 달성' },
        { emoji: '⭐', value: statsData?.currentPoints || 0, label: '포인트' },
        { emoji: '🏆', value: `Lv.${statsData?.level || 1}`, label: '레벨' }
    ];

    // 진행률 데이터 (백엔드에서 받은 실제 데이터 사용)
    const currentDay = challengeData.currentDay || 0;
    const totalDays = challengeData.totalDays || 30;
    const progress = challengeData.progress || 0;

    return (
        <div className="min-h-screen bg-white pt-[157px] pb-[80px]">
            <div className="max-w-7xl mx-auto px-4 flex flex-col gap-8">
                
                {/* Challenge Hero */}
                <div className="w-full text-center space-y-6 mb-12">
                    <h1 className="text-6xl font-normal font-['Inter'] leading-[60px] tracking-tight text-primary-dark">
                        {challengeData.title || '비건 챌린지'}
                    </h1>
                    <div className="flex justify-center">
                        <div className="p-[2px] bg-gradient-to-r from-cyan-400 to-emerald-400 rounded-full">
                            <div className="px-6 py-2 bg-white rounded-full">
                                <span className="text-teal-600 text-bold font-medium font-['Nunito']">
                                    {challengeData.veganType || '비건'}
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