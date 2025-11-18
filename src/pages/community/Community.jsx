import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentChallenge, getMyProfile, getChallengeStats, getToken } from "../../api/backend";
import { Card, CardContent } from "./components/ui/Card";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "./components/ui/Tabs";
import RankingTab from "./RankingTab";
import FeedTab from "./FeedTab";
import ChallengeTab from "./ChallengeTab";

const feedPosts = [
    {
        username: "비건러버",
        level: "Lv.15",
        location: "서울 강남구",
        time: "2시간 전",
        content: "오늘의 비건 볼! 퀴노아, 아보카도, 방울토마토로 만든 건강한 한 끼 🥗 #비건챌린지 #건강식단",
        hashtags: ["#비건", "#볼", "#퀴노아"],
        likes: 47,
        comments: 12,
        avatar: null,
        buttonIcon: "https://c.animaapp.com/mh1f3wszSXzzY1/img/button.svg",
    },
    {
        username: "그린라이프",
        level: "Lv.12",
        location: "서울 강남구",
        time: "4시간 전",
        content: "집에서 만든 비건 파스타! 캐슈 크림 소스가 정말 맛있어요 🍝 레시피 공유할게요!",
        hashtags: ["#비건", "#파스타", "#레시피"],
        likes: 35,
        comments: 8,
        avatar: "그",
        buttonIcon: "https://c.animaapp.com/mh1f3wszSXzzY1/img/button.svg",
    },
    {
        username: "플랜트베이스",
        level: "Lv.10",
        location: "서울 강남구",
        time: "6시간 전",
        content: "주말 브런치로 만든 비건 팬케이크 🥞 바나나와 블루베리 토핑이 환상적!",
        hashtags: ["#비건", "#팬케이크", "#브런치"],
        likes: 28,
        comments: 5,
        avatar: null,
        buttonIcon: "https://c.animaapp.com/mh1f3wszSXzzY1/img/button-2.svg",
    },
];

const popularHashtags = [
    "#비건",
    "#건강식단",
    "#플랜트베이스",
    "#레시피",
    "#환경보호",
    "#동물권",
];

const statsData = [
    {
        icon: "https://c.animaapp.com/mh1j2gpo64vpvu/img/icon-6.svg",
        value: "1,247",
        label: "활성 사용자",
        color: "text-[#155cfb]",
    },
    {
        icon: "https://c.animaapp.com/mh1j2gpo64vpvu/img/icon-12.svg",
        value: "8,934",
        label: "좋아요",
        color: "text-[#e60076]",
    },
    {
        icon: "https://c.animaapp.com/mh1j2gpo64vpvu/img/icon-4.svg",
        value: "2,156",
        label: "댓글",
        color: "text-[#00a63e]",
    },
    {
        icon: "https://c.animaapp.com/mh1j2gpo64vpvu/img/icon-3.svg",
        value: "156톤",
        label: "CO₂ 절약",
        color: "text-[#009966]",
    },
];

const rankingData = [
    {
        avatar: "https://c.animaapp.com/mh1j2gpo64vpvu/img/container-4.svg",
        name: "비건러버",
        level: "Lv.15",
        streak: "🔥 23일 연속",
        points: "4850pts",
        badges: ["🥇", "🌱", "🔥"],
    },
    {
        avatar: "https://c.animaapp.com/mh1j2gpo64vpvu/img/container-3.svg",
        name: "그린라이프",
        level: "Lv.12",
        streak: "🔥 18일 연속",
        points: "3920pts",
        badges: ["🥈", "🌿", "💚"],
        fallback: "그",
    },
    {
        avatar: "https://c.animaapp.com/mh1j2gpo64vpvu/img/container.svg",
        name: "플랜트베이스",
        level: "Lv.10",
        streak: "🔥 15일 연속",
        points: "3100pts",
        badges: ["🥉", "🌾"],
    },
    {
        avatar: "https://c.animaapp.com/mh1j2gpo64vpvu/img/container-1.svg",
        name: "헬시푸드",
        level: "Lv.8",
        streak: "🔥 12일 연속",
        points: "2750pts",
        badges: ["🌱", "💪"],
    },
    {
        avatar: "https://c.animaapp.com/mh1j2gpo64vpvu/img/container-1.svg",
        name: "어스프렌들리",
        level: "Lv.7",
        streak: "🔥 9일 연속",
        points: "2380pts",
        badges: ["🌍", "♻"],
    },
];

const userBadgesData = [
    { emoji: "🥉", label: "연속 달성", bg: "bg-yellow-50" },
    { emoji: "🌱", label: "비건 입문", bg: "bg-green-50" },
    { emoji: "💪", label: "건강지킴이", bg: "bg-blue-50" },
];

const Community = () => {
    const navigate = useNavigate();
    const [currentChallenge, setCurrentChallenge] = useState(null);
    const [challengeLoading, setChallengeLoading] = useState(true);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userProfile, setUserProfile] = useState(null);
    const [userStats, setUserStats] = useState(null);
    const [profileLoading, setProfileLoading] = useState(true);

    useEffect(() => {
        const fetchCurrentChallenge = async () => {
            try {
                setChallengeLoading(true);
                const token = getToken();

                if (!token) {
                    setIsLoggedIn(false);
                    setChallengeLoading(false);
                    return;
                }

                setIsLoggedIn(true);
                const response = await getCurrentChallenge(token);
                setCurrentChallenge(response.userChallenge);
            } catch (error) {
                console.error("챌린지 조회 실패:", error);
                setCurrentChallenge(null);
            } finally {
                setChallengeLoading(false);
            }
        };

        fetchCurrentChallenge();

        const handleVisibilityChange = () => {
            if (!document.hidden) {
                fetchCurrentChallenge();
            }
        };

        const handleFocus = () => {
            fetchCurrentChallenge();
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        window.addEventListener("focus", handleFocus);

        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            window.removeEventListener("focus", handleFocus);
        };
    }, []);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                setProfileLoading(true);
                const token = getToken();

                if (!token) {
                    setProfileLoading(false);
                    return;
                }

                const [profileResponse, statsResponse] = await Promise.all([
                    getMyProfile(token).catch(err => {
                        console.error("프로필 조회 실패:", err);
                        return null;
                    }),
                    getChallengeStats(token).catch(err => {
                        console.error("통계 조회 실패:", err);
                        return null;
                    }),
                ]);

                if (profileResponse && profileResponse.user) {
                    setUserProfile(profileResponse.user);
                }

                if (statsResponse && statsResponse.stats) {
                    setUserStats(statsResponse.stats);
                }
            } catch (error) {
                console.error("사용자 데이터 조회 실패:", error);
            } finally {
                setProfileLoading(false);
            }
        };

        fetchUserData();
    }, []);

    const goToChallenge = () => {
        navigate("/challenge");
    };

    const goToCreatePost = () => {
        navigate("/community/create");
    };

    return (
        <main className="flex-1 relative">
            <section className="container mx-auto px-4 py-16 relative">
                <div className="flex flex-col items-center gap-12 max-w-7xl mx-auto">
                    <div className="flex flex-col items-center gap-6 text-center translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:200ms]">
                        <h1 className="[font-family:'Nunito',Helvetica] font-normal text-white text-6xl tracking-[0] leading-[60px]">
                            비건 커뮤니티
                        </h1>
                        <p className="[font-family:'Nunito',Helvetica] font-normal text-[#fffefee6] text-xl tracking-[0] leading-7 max-w-2xl">
                            함께하는 비건 여정, 서로의 경험을 나누고 응원해보세요
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full ">
                        {statsData.map((stat, index) => (
                            <Card
                                key={index}
                                className="bg-[#fffffff2] border-[0.67px] border-[#0000001a] rounded-[14px] transition-transform hover:scale-105"
                            >
                                <CardContent className="flex flex-col items-center gap-2 p-6">
                                    <img className="w-8 h-8" alt="Icon" src={stat.icon} />
                                    <div
                                        className={`[font-family:'Nunito',Helvetica] font-normal ${stat.color} text-2xl text-center tracking-[0] leading-8`}
                                    >
                                        {stat.value}
                                    </div>
                                    <div className="[font-family:'Nunito',Helvetica] font-normal text-[#495565] text-sm text-center tracking-[0] leading-5">
                                        {stat.label}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <div className="flex flex-col gap-8 w-full ">
                        <Tabs defaultValue="ranking" className="w-full">
                            <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto bg-[#ffffffe6] rounded-[14px] p-1">
                                <TabsTrigger
                                    value="feed"
                                    className="[font-family:'Nunito',Helvetica] font-medium text-[#00a63e] text-sm rounded-[14px] data-[state=active]:bg-white"
                                >
                                    피드
                                </TabsTrigger>
                                <TabsTrigger
                                    value="ranking"
                                    className="[font-family:'Nunito',Helvetica] font-medium text-[#00a63e] text-sm rounded-[14px] data-[state=active]:bg-white"
                                >
                                    전체 랭킹
                                </TabsTrigger>
                                <TabsTrigger
                                    value="challenge"
                                    className="[font-family:'Nunito',Helvetica] font-medium text-[#00a63e] text-sm rounded-[14px] data-[state=active]:bg-white"
                                >
                                    피드 랭킹
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="ranking" className="mt-8">
                                <RankingTab
                                    rankingData={rankingData}
                                    profileLoading={profileLoading}
                                    isLoggedIn={isLoggedIn}
                                    userProfile={userProfile}
                                    userStats={userStats}
                                    userBadgesData={userBadgesData}
                                />
                            </TabsContent>

                            <TabsContent value="feed">
                                <FeedTab
                                    feedPosts={feedPosts}
                                    challengeLoading={challengeLoading}
                                    isLoggedIn={isLoggedIn}
                                    currentChallenge={currentChallenge}
                                    goToChallenge={goToChallenge}
                                    popularHashtags={popularHashtags}
                                    onCreatePost={goToCreatePost}
                                />
                            </TabsContent>

                            <TabsContent value="challenge">
                                <ChallengeTab feedPosts={feedPosts} />
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </section>
        </main>
    );
};

export default Community;

