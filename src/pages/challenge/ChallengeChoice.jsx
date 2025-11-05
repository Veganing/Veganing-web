import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import VeganTypeStep from './choiceComponents/VeganTypeStep';
import PeriodStep from './choiceComponents/PeriodStep';
import GoalStep from './choiceComponents/GoalStep';
import { startChallenge, getCurrentChallenge, getToken } from '../../api/backend';

function ChallengeChoice() {
    const navigate = useNavigate();
    const [veganType, setVeganType] = useState('');
    const [period, setPeriod] = useState('');
    const [goal, setGoal] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isCheckingChallenge, setIsCheckingChallenge] = useState(true);

    const isActive = veganType && period && goal;

    // 페이지 로드 시 이미 진행 중인 챌린지가 있는지 확인
    useEffect(() => {
        const checkExistingChallenge = async () => {
            try {
                const token = getToken();
                if (!token) {
                    setIsCheckingChallenge(false);
                    return;
                }

                // 진행 중인 챌린지 확인
                const response = await getCurrentChallenge(token);

                if (response && response.userChallenge) {
                    console.log('이미 진행 중인 챌린지가 있습니다. 메인 페이지로 이동합니다.');
                    navigate('/challenge/main/meal');
                }
            } catch (error) {
                // 404 에러는 정상 (진행 중인 챌린지 없음)
                console.log('진행 중인 챌린지 없음 - 새로 시작할 수 있습니다.');
            } finally {
                setIsCheckingChallenge(false);
            }
        };

        checkExistingChallenge();
    }, [navigate]);

    const handleStartChallenge = async () => {
        if (!isActive || isLoading) return;

        try {
            setIsLoading(true);
            const token = getToken();

            if (!token) {
                alert('로그인이 필요합니다.');
                navigate('/login');
                return;
            }

            // period 변환: "1주일 챌린지" → 7, "1개월 챌린지" → 30
            let periodDays = 7; // 기본값
            if (period.includes('1주일')) {
                periodDays = 7;
            } else if (period.includes('1개월')) {
                periodDays = 30;
            }

            // 백엔드 API 호출
            const response = await startChallenge({
                veganType,
                period: periodDays,
                goal
            }, token);

            console.log('챌린지 시작 성공:', response);

            // 챌린지 메인 페이지로 이동
            navigate('/challenge/main/meal');
        } catch (error) {
            console.error('챌린지 시작 실패:', error);

            // 에러 메시지 확인
            const errorMessage = error?.error || error?.message || '';

            if (errorMessage.includes('already have an active challenge')) {
                alert('이미 진행 중인 챌린지가 있습니다.\n챌린지 메인 페이지로 이동합니다.');
                navigate('/challenge/main/meal');
            } else if (errorMessage.includes('required')) {
                alert('모든 항목을 선택해주세요.');
            } else {
                alert(`챌린지 시작에 실패했습니다.\n${errorMessage || '다시 시도해주세요.'}`);
            }
        } finally {
            setIsLoading(false);
        }
    };

    // 챌린지 확인 중일 때 로딩 화면
    if (isCheckingChallenge) {
        return (
            <div className="min-h-screen bg-white pt-[157px] pb-[80px] flex items-center justify-center">
                <div className="text-center">
                    <div className="text-4xl mb-4">⏳</div>
                    <p className="text-gray-600">챌린지 확인 중...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white pt-[157px] pb-[80px]">
            <div className="max-w-7xl mx-auto px-4 flex flex-col gap-8">
                
                {/* Challenge Hero */}
                <div className="w-full text-center space-y-6 mb-12">
                    <h1 className="text-6xl font-normal font-['Inter'] leading-[60px] tracking-tight text-primary-dark">
                        비건 챌린지 시작하기
                    </h1>
                    <p className="text-xl font-normal font-['Inter'] leading-7 text-gray-700">
                        당신에게 맞는 비건 단계와 챌린지 기간, 목표를 선택해보세요
                    </p>
                </div>

                {/* Steps */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <VeganTypeStep selected={veganType} onSelect={setVeganType} />
                    <PeriodStep selected={period} onSelect={setPeriod} />
                    <GoalStep selected={goal} onSelect={setGoal} />
                </div>

                {/* Challenge Button */}
                <div className="flex justify-center">
                    <button
                        type="button"
                        onClick={handleStartChallenge}
                        disabled={!isActive || isLoading}
                        className={`px-20 py-4 rounded-2xl shadow-lg text-lg font-semibold transition-all ${
                            isActive && !isLoading
                                ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white hover:from-teal-600 hover:to-emerald-600 cursor-pointer'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                    >
                        {isLoading ? '챌린지 시작 중...' : '챌린지 시작하기'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ChallengeChoice;