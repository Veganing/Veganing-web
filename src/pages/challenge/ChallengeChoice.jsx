import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import VeganTypeStep from './choiceComponents/VeganTypeStep';
import PeriodStep from './choiceComponents/PeriodStep';
import GoalStep from './choiceComponents/GoalStep';

function ChallengeChoice() {
    const navigate = useNavigate();
    const [veganType, setVeganType] = useState('');
    const [period, setPeriod] = useState('');
    const [goal, setGoal] = useState('');

    const isActive = veganType && period && goal;

    const handleStartChallenge = () => {
        if (isActive) {
            navigate('/challenge/main/meal');
        }
    };

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
                        disabled={!isActive}
                        className={`px-20 py-4 rounded-2xl shadow-lg text-lg font-semibold transition-all ${
                            isActive
                                ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white hover:from-teal-600 hover:to-emerald-600 cursor-pointer'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                    >
                        챌린지 시작하기
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ChallengeChoice;