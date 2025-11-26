import { useState } from 'react';
import ChallengeTabs from './ChallengeTab';
import MealContainer from '../todaysMealTab/MealContainer';
import ProgressContainer from '../progressTab/ProgressContainer';
import ShoppingTab from './ShoppingTab';
import RecipeTab from "./RecipeTab";

function ChallengeContent() {
    const [activeTab, setActiveTab] = useState('오늘의 식단');

    // 탭에 따라 다른 컨텐츠 렌더링
    const renderContent = () => {
        switch(activeTab) {
            case '오늘의 식단':
                return <MealContainer />;
            case '진행 현황':
                return <ProgressContainer />;
            case '레시피':
                return <RecipeTab key={activeTab} />; // key를 추가하여 탭 전환 시 재마운트
            case '쇼핑':
                return <ShoppingTab />;
            default:
                return <MealContainer />;
        }
    };

    return (
        <div className="w-full flex flex-col gap-8">
            {/* 탭 - activeTab state를 props로 전달 */}
            <ChallengeTabs activeTab={activeTab} setActiveTab={setActiveTab} />
            
            {/* 선택된 탭의 컨텐츠 */}
            {renderContent()}
        </div>
    );
}

export default ChallengeContent;