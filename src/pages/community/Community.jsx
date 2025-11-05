import {
    HomeIcon,
    MailIcon,
    MapPinIcon,
    MapPinnedIcon,
    PhoneIcon,
    ShoppingBagIcon,
    TrophyIcon,
    UsersIcon,
    HeartIcon, // <-- 피드 탭 '좋아요'용
    MessageCircleIcon, // <-- 피드 탭 '댓글'용
} from "lucide-react";

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentChallenge, getMyProfile, getChallengeStats, getToken } from "../../api/backend";
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "./components/ui/Avatar";
import { Badge } from "./components/ui/Badge";
import { Button } from "./components/ui/Button";
import { Card, CardContent } from "./components/ui/Card";
import { Progress } from "./components/ui/Progress";
// Progress 컴포넌트는 아래에 직접 만들어 사용합니다
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "./components/ui/Tabs";


const feedPosts = [

    {

        username: "비건러버",
        level: "Lv.15",
        location: "서울 강남구",
        time: "2시간 전",
        content:

            "오늘의 비건 볼! 퀴노아, 아보카도, 방울토마토로 만든 건강한 한 끼 🥗 #비건챌린지 #건강식단",

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
        content:
            "집에서 만든 비건 파스타! 캐슈 크림 소스가 정말 맛있어요 🍝 레시피 공유할게요!",
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
        content:
            "주말 브런치로 만든 비건 팬케이크 🥞 바나나와 블루베리 토핑이 환상적!",
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
// --- 데이터 영역 끝 ---


const Community = () => {
    const navigate = useNavigate();
    const [currentChallenge, setCurrentChallenge] = useState(null);
    const [challengeLoading, setChallengeLoading] = useState(true);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userProfile, setUserProfile] = useState(null);
    const [userStats, setUserStats] = useState(null);
    const [profileLoading, setProfileLoading] = useState(true);

    // 현재 챌린지 정보 가져오기
    useEffect(() => {
        const fetchCurrentChallenge = async () => {
            try {
                setChallengeLoading(true);
                const token = getToken();

                if (!token) {
                    // 로그인하지 않은 상태
                    setIsLoggedIn(false);
                    setChallengeLoading(false);
                    return;
                }

                setIsLoggedIn(true);
                const response = await getCurrentChallenge(token);
                setCurrentChallenge(response.userChallenge);
            } catch (error) {
                console.error('챌린지 조회 실패:', error);
                setCurrentChallenge(null);
            } finally {
                setChallengeLoading(false);
            }
        };

        fetchCurrentChallenge();

        // 페이지가 다시 보일 때마다 데이터 새로고침
        const handleVisibilityChange = () => {
            if (!document.hidden) {
                fetchCurrentChallenge();
            }
        };

        const handleFocus = () => {
            fetchCurrentChallenge();
        };

        // 이벤트 리스너 등록
        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('focus', handleFocus);

        // 클린업
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('focus', handleFocus);
        };
    }, []);

    // 사용자 정보 및 통계 가져오기
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                setProfileLoading(true);
                const token = getToken();

                if (!token) {
                    setProfileLoading(false);
                    return;
                }

                // 사용자 프로필과 통계 동시에 가져오기
                const [profileResponse, statsResponse] = await Promise.all([
                    getMyProfile(token).catch(err => {
                        console.error('프로필 조회 실패:', err);
                        return null;
                    }),
                    getChallengeStats(token).catch(err => {
                        console.error('통계 조회 실패:', err);
                        return null;
                    })
                ]);

                if (profileResponse && profileResponse.user) {
                    setUserProfile(profileResponse.user);
                }

                if (statsResponse && statsResponse.stats) {
                    setUserStats(statsResponse.stats);
                }
            } catch (error) {
                console.error('사용자 데이터 조회 실패:', error);
            } finally {
                setProfileLoading(false);
            }
        };

        fetchUserData();
    }, []);

    // 챌린지 페이지로 이동
    const goToChallenge = () => {
        navigate('/challenge');
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
                                    랭킹
                                </TabsTrigger>
                                <TabsTrigger
                                    value="challenge"
                                    className="[font-family:'Nunito',Helvetica] font-medium text-[#00a63e] text-sm rounded-[14px] data-[state=active]:bg-white"
                                >
                                    챌린지
                                </TabsTrigger>
                            </TabsList>

                            {/* --- 랭킹 탭 내용 --- */}
                            <TabsContent value="ranking" className="mt-8">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    <Card className="bg-[#fffffff2] border-[0.67px] border-[#0000001a] rounded-[14px]">
                                        <CardContent className="p-6">
                                            <div className="flex items-center gap-2 mb-6">
                                                <img
                                                    className="w-5 h-5"
                                                    alt="Icon"
                                                    src="https://c.animaapp.com/mh1j2gpo64vpvu/img/icon-8.svg"
                                                />
                                                <h2 className="[font-family:'Nunito',Helvetica] font-normal text-[#00a63e] text-base tracking-[0] leading-4">
                                                    전체 랭킹 (서울 강남구)
                                                </h2>
                                            </div>

                                            <div className="flex flex-col gap-4">
                                                {rankingData.map((user, index) => (
                                                    <div
                                                        key={index}
                                                        className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-[10px] transition-colors hover:bg-gray-100"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <Avatar className="w-8 h-8">
                                                                <AvatarImage src={user.avatar} />
                                                                {user.fallback && (
                                                                    <AvatarFallback className="bg-[#ececf0] text-neutral-950 [font-family:'Nunito',Helvetica] font-normal text-base">
                                                                        {user.fallback}
                                                                    </AvatarFallback>
                                                                )}
                                                            </Avatar>

                                                            <div className="flex flex-col gap-1">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="[font-family:'Nunito',Helvetica] font-semibold text-neutral-950 text-base tracking-[0] leading-6">
                                                                        {user.name}
                                                                    </span>
                                                                    <Badge className="bg-green-100 text-[#008235] border-transparent hover:bg-green-100">
                                                                        <span className="[font-family:'Nunito',Helvetica] font-medium text-xs">
                                                                            {user.level}
                                                                        </span>
                                                                    </Badge>
                                                                </div>
                                                                <span className="[font-family:'Nunito',Helvetica] font-normal text-[#495565] text-sm tracking-[0] leading-5">
                                                                    {user.streak}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        <div className="flex flex-col items-end gap-1">
                                                            <span className="[font-family:'Nunito',Helvetica] font-semibold text-[#00a63e] text-base text-right tracking-[0] leading-6">
                                                                {user.points}
                                                            </span>
                                                            <div className="flex items-center gap-1">
                                                                {user.badges.map((badge, badgeIndex) => (
                                                                    <span
                                                                        key={badgeIndex}
                                                                        className="[font-family:'Nunito',Helvetica] font-normal text-neutral-950 text-sm"
                                                                    >
                                                                        {badge}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card className="bg-[#fffffff2] border-[0.67px] border-[#0000001a] rounded-[14px]">
                                        <CardContent className="p-6">
                                            <h2 className="[font-family:'Nunito',Helvetica] font-normal text-[#00a63e] text-base tracking-[0] leading-4 mb-6">
                                                나의 프로필
                                            </h2>

                                            {profileLoading ? (
                                                <div className="flex items-center justify-center py-12">
                                                    <div className="text-2xl">⏳</div>
                                                    <p className="ml-2 text-gray-600">로딩 중...</p>
                                                </div>
                                            ) : !isLoggedIn || !userProfile ? (
                                                <div className="flex flex-col items-center gap-4 py-8">
                                                    <div className="text-4xl">🌱</div>
                                                    <p className="text-gray-600">로그인하고 프로필을 확인하세요!</p>
                                                </div>
                                            ) : (<>
                                                <div className="flex flex-col gap-6">
                                                    <div className="flex flex-col items-center gap-4">
                                                        <div className="flex items-center justify-center w-20 h-20 bg-green-100 rounded-full">
                                                            <span className="[font-family:'Nunito',Helvetica] font-normal text-neutral-950 text-3xl text-center tracking-[0] leading-9">
                                                                🌱
                                                            </span>
                                                        </div>

                                                        <div className="flex items-center gap-2">
                                                            <span className="[font-family:'Nunito',Helvetica] font-normal text-neutral-950 text-2xl text-center tracking-[0] leading-8">
                                                                {userProfile.nickname || '비건러버'}
                                                            </span>
                                                            <Badge className="bg-green-100 text-[#008235] border-transparent hover:bg-green-100">
                                                                <span className="[font-family:'Nunito',Helvetica] font-medium text-xs">
                                                                    Lv.{userProfile.level || 1}
                                                                </span>
                                                            </Badge>
                                                        </div>

                                                        <div className="grid grid-cols-2 gap-8 w-full">
                                                            <div className="flex flex-col items-center gap-1">
                                                                <span className="[font-family:'Nunito',Helvetica] font-normal text-[#00a63e] text-2xl text-center tracking-[0] leading-8">
                                                                    {userStats?.currentStreak || 0}일
                                                                </span>
                                                                <span className="[font-family:'Nunito',Helvetica] font-normal text-[#495565] text-sm text-center tracking-[0] leading-5">
                                                                    연속 달성
                                                                </span>
                                                            </div>

                                                            <div className="flex flex-col items-center gap-1">
                                                                <span className="[font-family:'Nunito',Helvetica] font-normal text-[#155cfb] text-2xl text-center tracking-[0] leading-8">
                                                                    {userStats?.currentPoints || userProfile.points || 0}
                                                                </span>
                                                                <span className="[font-family:'Nunito',Helvetica] font-normal text-[#495565] text-sm text-center tracking-[0] leading-5">
                                                                    포인트
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-col gap-3">
                                                        <h3 className="[font-family:'Nunito',Helvetica] font-semibold text-neutral-950 text-base tracking-[0] leading-6">
                                                            보유 뱃지
                                                        </h3>

                                                        <div className="grid grid-cols-3 gap-3">
                                                            {userBadgesData.map((badge, index) => (
                                                                <div
                                                                    key={index}
                                                                    className={`flex flex-col items-center gap-1 p-3 ${badge.bg} rounded-[10px]`}
                                                                >
                                                                    <span className="[font-family:'Nunito',Helvetica] font-normal text-neutral-950 text-2xl text-center tracking-[0] leading-8">
                                                                        {badge.emoji}
                                                                    </span>
                                                                    <span className="[font-family:'Nunito',Helvetica] font-normal text-[#495565] text-xs text-center tracking-[0] leading-4">
                                                                        {badge.label}
                                                                    </span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-col gap-3">
                                                        <h3 className="[font-family:'Nunito',Helvetica] font-semibold text-neutral-950 text-base tracking-[0] leading-6">
                                                            다음 레벨까지
                                                        </h3>

                                                        <div className="flex items-center justify-between text-sm">
                                                            <span className="[font-family:'Nunito',Helvetica] font-normal text-[#495565]">
                                                                Lv.{userProfile.level || 1}
                                                            </span>
                                                            <span className="[font-family:'Nunito',Helvetica] font-normal text-[#495565]">
                                                                {userProfile.points || 0}/1000 XP
                                                            </span>
                                                            <span className="[font-family:'Nunito',Helvetica] font-normal text-[#495565]">
                                                                Lv.{(userProfile.level || 1) + 1}
                                                            </span>
                                                        </div>

                                                        <Progress value={((userProfile.points || 0) / 1000) * 100} className="h-2" />
                                                    </div>
                                                </div>
                                            </>)}
                                        </CardContent>
                                    </Card>
                                </div>
                            </TabsContent>

                            {/* --- 피드 탭 내용 --- */}
                            <TabsContent value="feed">
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full max-w-6xl ">

                                    <div className="lg:col-span-2 flex flex-col gap-6">

                                        {feedPosts.map((post, index) => (

                                            <Card

                                                key={index}

                                                className="bg-[#fffffff2] rounded-[14px] border-[0.67px] border-[#0000001a]"

                                            >

                                                <CardContent className="p-6">

                                                    <div className="flex items-start justify-between mb-4">

                                                        <div className="flex items-start gap-3">

                                                            <Avatar className="w-10 h-10">

                                                                <AvatarFallback className="bg-[#ececf0] text-neutral-950 [font-family:'Nunito',Helvetica] font-normal text-base">

                                                                    {post.avatar || ""}

                                                                </AvatarFallback>

                                                            </Avatar>

                                                            <div className="flex flex-col gap-1">

                                                                <div className="flex items-center gap-2">

                                                                    <span className="[font-family:'Nunito',Helvetica] font-semibold text-neutral-950 text-base tracking-[0] leading-6">

                                                                        {post.username}

                                                                    </span>

                                                                    <Badge className="bg-green-100 text-[#008235] border-[0.67px] border-transparent [font-family:'Nunito',Helvetica] font-medium text-xs">

                                                                        {post.level}

                                                                    </Badge>

                                                                </div>

                                                                <div className="flex items-center gap-1 text-[#697282] text-sm">

                                                                    <MapPinIcon className="w-3 h-3" />

                                                                    <span className="[font-family:'Nunito',Helvetica] font-normal tracking-[0] leading-5">

                                                                        {post.location} • {post.time}

                                                                    </span>

                                                                </div>

                                                            </div>

                                                        </div>

                                                        <Button variant="ghost" size="icon" className="h-8 w-9">

                                                            <img alt="Button" src={post.buttonIcon} />

                                                        </Button>

                                                    </div>



                                                    <p className="[font-family:'Nunito',Helvetica] font-normal text-[#354152] text-base tracking-[0] leading-6 mb-3">

                                                        {post.content}

                                                    </p>



                                                    <div className="flex flex-wrap gap-2 mb-4">
                                                        {post.hashtags.map((tag, tagIndex) => (
                                                            <Badge
                                                                key={tagIndex}
                                                                variant="outline"
                                                                className="border-[#00a63e] text-[#00a63e] [font-family:'Nunito',Helvetica] font-medium text-xs"
                                                            >
                                                                {tag}
                                                            </Badge>
                                                        ))}
                                                    </div>

                                                    <div className="flex items-center gap-4">
                                                        <Button
                                                            variant="ghost"
                                                            className="h-auto p-0 flex items-center gap-2"
                                                        >

                                                            <HeartIcon className="w-4 h-4 text-[#495565]" />
                                                            <span className="[font-family:'Nunito',Helvetica] font-medium text-[#495565] text-sm tracking-[0] leading-5">
                                                                {post.likes}
                                                            </span>
                                                        </Button>

                                                        <Button
                                                            variant="ghost"
                                                            className="h-auto p-0 flex items-center gap-2"
                                                        >

                                                            <MessageCircleIcon className="w-4 h-4 text-[#495565]" />

                                                            <span className="[font-family:'Nunito',Helvetica] font-medium text-[#495565] text-sm tracking-[0] leading-5">
                                                                {post.comments}
                                                            </span>

                                                        </Button>

                                                    </div>

                                                </CardContent>

                                            </Card>

                                        ))}

                                    </div>



                                    <div className="flex flex-col gap-6">

                                        <Card className="bg-[#fffffff2] rounded-[14px] border-[0.67px] border-[#0000001a]">

                                            <CardContent className="p-6 flex flex-col gap-[30px]">

                                                <h3 className="text-[#00a63e] text-lg leading-7 [font-family:'Nunito',Helvetica] font-normal tracking-[0]">

                                                    이번 주 챌린지

                                                </h3>

                                                {challengeLoading ? (
                                                    // 로딩 중
                                                    <div className="flex flex-col gap-4 items-center py-8">
                                                        <div className="text-2xl">⏳</div>
                                                        <p className="[font-family:'Nunito',Helvetica] font-normal text-[#495565] text-sm">
                                                            로딩 중...
                                                        </p>
                                                    </div>
                                                ) : !isLoggedIn || !currentChallenge ? (
                                                    // 로그인 안 했거나 챌린지 없음
                                                    <div className="flex flex-col gap-4 items-center py-4">
                                                        <div className="text-4xl">🌱</div>
                                                        <h4 className="[font-family:'Nunito',Helvetica] font-semibold text-neutral-950 text-base text-center tracking-[0] leading-6">
                                                            {!isLoggedIn ? '로그인하고 챌린지를 시작하세요!' : '새로운 챌린지를 시작해보세요!'}
                                                        </h4>
                                                        <p className="[font-family:'Nunito',Helvetica] font-normal text-[#495565] text-sm text-center tracking-[0] leading-5">
                                                            {!isLoggedIn
                                                                ? '비건 여정을 함께 시작해볼까요?'
                                                                : '다양한 비건 챌린지에 도전해보세요!'}
                                                        </p>
                                                        <Button
                                                            onClick={goToChallenge}
                                                            className="w-full bg-[#00a63e] text-white [font-family:'Nunito',Helvetica] font-medium text-sm rounded-lg h-auto py-2 hover:bg-[#008235] transition-colors"
                                                        >
                                                            챌린지 페이지로 이동
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    // 진행 중인 챌린지 표시
                                                    <div className="flex flex-col gap-4">
                                                        <div className="text-3xl text-center">
                                                            {currentChallenge.difficulty === 'easy' ? '🌱' :
                                                                currentChallenge.difficulty === 'medium' ? '🌿' : '🌳'}
                                                        </div>

                                                        <h4 className="[font-family:'Nunito',Helvetica] font-semibold text-neutral-950 text-base text-center tracking-[0] leading-6">
                                                            {currentChallenge.title}
                                                        </h4>

                                                        <p className="[font-family:'Nunito',Helvetica] font-normal text-[#495565] text-sm text-center tracking-[0] leading-5">
                                                            {currentChallenge.description || '비건 챌린지에 도전 중입니다!'}
                                                        </p>

                                                        <div className="flex items-center justify-between text-[#495565] text-sm">
                                                            <span className="[font-family:'Nunito',Helvetica] font-normal tracking-[0] leading-5">
                                                                진행률
                                                            </span>
                                                            <span className="[font-family:'Nunito',Helvetica] font-normal tracking-[0] leading-5">
                                                                {currentChallenge.progress || 0}%
                                                            </span>
                                                        </div>

                                                        <div className="w-full h-2 bg-[#03021333] rounded-[22369600px] overflow-hidden">
                                                            <div
                                                                className="h-full bg-[#00a63e] transition-all duration-500"
                                                                style={{ width: `${currentChallenge.progress || 0}%` }}
                                                            />
                                                        </div>

                                                        <div className="flex items-center justify-center gap-4 text-sm">
                                                            <span className="[font-family:'Nunito',Helvetica] font-normal text-[#00a63e]">
                                                                ⭐ {currentChallenge.points || 0}pts
                                                            </span>
                                                            <span className="[font-family:'Nunito',Helvetica] font-normal text-[#495565]">
                                                                난이도: {currentChallenge.difficulty === 'easy' ? '쉬움' :
                                                                    currentChallenge.difficulty === 'medium' ? '보통' : '어려움'}
                                                            </span>
                                                        </div>

                                                        <Button
                                                            onClick={goToChallenge}
                                                            className="w-full bg-[#00a63e] text-white [font-family:'Nunito',Helvetica] font-medium text-sm rounded-lg h-auto py-2 hover:bg-[#008235] transition-colors"
                                                        >
                                                            챌린지 상세보기
                                                        </Button>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>



                                        <Card className="bg-[#fffffff2] rounded-[14px] border-[0.67px] border-[#0000001a]">
                                            <CardContent className="p-6 flex flex-col gap-[30px]">
                                                <h3 className="text-[#00a63e] text-lg leading-7 [font-family:'Nunito',Helvetica] font-normal tracking-[0]">
                                                    인기 해시태그
                                                </h3>



                                                <div className="flex flex-wrap gap-2">
                                                    {popularHashtags.map((tag, index) => (
                                                        <Badge
                                                            key={index}
                                                            variant="outline"
                                                            className="border-[#0000001a] text-neutral-950 [font-family:'Nunito',Helvetica] font-medium text-xs cursor-pointer hover:border-[#00a63e] hover:text-[#00a63e] transition-colors"

                                                        >
                                                            {tag}
                                                        </Badge>

                                                    ))}

                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </div>


                            </TabsContent>

                            {/* --- 챌린지 탭 내용 --- */}
                            <TabsContent value="challenge">
                                <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    {/* 진행 중인 챌린지 */}
                                    <Card className="bg-[#fffffff2] border-[0.67px] border-[#0000001a] rounded-[14px]">
                                        <CardContent className="p-6">
                                            <h2 className="[font-family:'Nunito',Helvetica] font-normal text-[#00a63e] text-base leading-4 mb-6">
                                                진행 중인 챌린지
                                            </h2>

                                            {challengeLoading ? (
                                                // 로딩 중
                                                <div className="flex flex-col gap-4 items-center py-12">
                                                    <div className="text-2xl">⏳</div>
                                                    <p className="[font-family:'Nunito',Helvetica] font-normal text-[#495565] text-sm">
                                                        로딩 중...
                                                    </p>
                                                </div>
                                            ) : !isLoggedIn ? (
                                                // 로그인 안 함
                                                <div className="flex flex-col gap-4 items-center py-8">
                                                    <div className="text-4xl">🌱</div>
                                                    <h4 className="[font-family:'Nunito',Helvetica] font-semibold text-neutral-950 text-base text-center tracking-[0] leading-6">
                                                        로그인하고 챌린지를 시작하세요!
                                                    </h4>
                                                    <p className="[font-family:'Nunito',Helvetica] font-normal text-[#495565] text-sm text-center tracking-[0] leading-5">
                                                        비건 여정을 함께 시작해볼까요?
                                                    </p>
                                                    <Button
                                                        onClick={goToChallenge}
                                                        className="w-full bg-[#00a63e] text-white [font-family:'Nunito',Helvetica] font-medium text-sm rounded-lg h-auto py-2 hover:bg-[#008235] transition-colors"
                                                    >
                                                        챌린지 페이지로 이동
                                                    </Button>
                                                </div>
                                            ) : !currentChallenge ? (
                                                // 진행 중인 챌린지 없음
                                                <div className="flex flex-col gap-4 items-center py-8">
                                                    <div className="text-4xl">🎯</div>
                                                    <h4 className="[font-family:'Nunito',Helvetica] font-semibold text-neutral-950 text-base text-center tracking-[0] leading-6">
                                                        새로운 챌린지를 시작해보세요!
                                                    </h4>
                                                    <p className="[font-family:'Nunito',Helvetica] font-normal text-[#495565] text-sm text-center tracking-[0] leading-5">
                                                        다양한 비건 챌린지에 도전해보세요!
                                                    </p>
                                                    <Button
                                                        onClick={goToChallenge}
                                                        className="w-full bg-[#00a63e] text-white [font-family:'Nunito',Helvetica] font-medium text-sm rounded-lg h-auto py-2 hover:bg-[#008235] transition-colors"
                                                    >
                                                        챌린지 시작하기
                                                    </Button>
                                                </div>
                                            ) : (
                                                // 진행 중인 챌린지 있음
                                                <div className="space-y-4">
                                                    <Card className="border-[0.67px] border-[#b8f7cf] rounded-[10px]">
                                                        <CardContent className="p-4 space-y-3">
                                                            <div className="flex items-center justify-between">
                                                                <h3 className="[font-family:'Nunito',Helvetica] font-semibold text-neutral-950 text-base leading-6">
                                                                    {currentChallenge.title}
                                                                </h3>
                                                                <Badge className="bg-green-100 text-[#008235] border-[0.67px] border-transparent hover:bg-green-100">
                                                                    <span className="[font-family:'Nunito',Helvetica] font-medium text-xs leading-4">
                                                                        진행중
                                                                    </span>
                                                                </Badge>
                                                            </div>

                                                            {currentChallenge.description && (
                                                                <p className="[font-family:'Nunito',Helvetica] font-normal text-[#495565] text-sm leading-5">
                                                                    {currentChallenge.description}
                                                                </p>
                                                            )}

                                                            <div className="flex items-center justify-between">
                                                                <span className="[font-family:'Nunito',Helvetica] font-normal text-[#495565] text-sm leading-5">
                                                                    진행률
                                                                </span>
                                                                <span className="[font-family:'Nunito',Helvetica] font-normal text-[#495565] text-sm leading-5">
                                                                    {currentChallenge.currentDay || 0}/{currentChallenge.totalDays || currentChallenge.duration || 30}일
                                                                </span>
                                                            </div>

                                                            <Progress value={currentChallenge.progress || 0} className="h-2 bg-[#03021333]" />

                                                            <div className="flex items-center gap-4">
                                                                <span className="[font-family:'Nunito',Helvetica] font-normal text-[#00a63e] text-sm leading-5">
                                                                    🔥 {userStats?.currentStreak || 0}일 연속
                                                                </span>
                                                                <span className="[font-family:'Nunito',Helvetica] font-normal text-[#155cfb] text-sm leading-5">
                                                                    ⭐ {currentChallenge.points || 0}pts
                                                                </span>
                                                            </div>

                                                            <Button
                                                                onClick={goToChallenge}
                                                                className="w-full h-auto bg-[#00a63e] hover:bg-[#008235] text-white rounded-lg transition-colors"
                                                            >
                                                                <span className="[font-family:'Nunito',Helvetica] font-medium text-sm leading-5">
                                                                    챌린지 상세보기
                                                                </span>
                                                            </Button>
                                                        </CardContent>
                                                    </Card>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>

                                    {/* 완료된 챌린지 */}
                                    <Card className="bg-[#fffffff2] border-[0.67px] border-[#0000001a] rounded-[14px]">
                                        <CardContent className="p-6">
                                            <h2 className="[font-family:'Nunito',Helvetica] font-normal text-[#00a63e] text-base leading-4 mb-6">
                                                완료된 챌린지
                                            </h2>

                                            {profileLoading ? (
                                                // 로딩 중
                                                <div className="flex flex-col gap-4 items-center py-12">
                                                    <div className="text-2xl">⏳</div>
                                                    <p className="[font-family:'Nunito',Helvetica] font-normal text-[#495565] text-sm">
                                                        로딩 중...
                                                    </p>
                                                </div>
                                            ) : !isLoggedIn ? (
                                                // 로그인 안 함
                                                <div className="flex flex-col gap-4 items-center py-8">
                                                    <div className="text-4xl">🏆</div>
                                                    <p className="[font-family:'Nunito',Helvetica] font-normal text-[#495565] text-sm text-center tracking-[0] leading-5">
                                                        로그인하고 완료한 챌린지를 확인하세요!
                                                    </p>
                                                </div>
                                            ) : userStats?.completedChallenges && userStats.completedChallenges.length > 0 ? (
                                                // 완료된 챌린지 목록
                                                <div className="space-y-4">
                                                    {userStats.completedChallenges.map((challenge, index) => (
                                                        <Card key={index} className="bg-gray-50 border rounded-[10px]">
                                                            <CardContent className="p-4 space-y-3">
                                                                <div className="flex items-center justify-between">
                                                                    <h3 className="[font-family:'Nunito',Helvetica] font-semibold text-[#354152] text-base leading-6">
                                                                        {challenge.title}
                                                                    </h3>
                                                                    <Badge className="bg-green-100 text-[#008235] border-[0.67px] border-transparent hover:bg-green-100">
                                                                        <span className="[font-family:'Nunito',Helvetica] font-medium text-xs leading-4">
                                                                            완료
                                                                        </span>
                                                                    </Badge>
                                                                </div>

                                                                <div className="flex items-center gap-4 flex-wrap">
                                                                    <span className="[font-family:'Nunito',Helvetica] font-normal text-[#495565] text-sm leading-5">
                                                                        ✅ {challenge.completedDays || challenge.duration}/{challenge.duration || challenge.totalDays}일 완료
                                                                    </span>
                                                                    <span className="[font-family:'Nunito',Helvetica] font-normal text-[#00a63e] text-sm leading-5">
                                                                        +{challenge.earnedPoints || challenge.points}pts
                                                                    </span>
                                                                    {challenge.badge && (
                                                                        <span className="[font-family:'Nunito',Helvetica] font-normal text-[#495565] text-sm leading-5">
                                                                            {challenge.badge} 뱃지 획득
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </CardContent>
                                                        </Card>
                                                    ))}
                                                </div>
                                            ) : (
                                                // 완료된 챌린지 없음
                                                <div className="flex flex-col gap-4 items-center py-8">
                                                    <div className="text-4xl">📝</div>
                                                    <h4 className="[font-family:'Nunito',Helvetica] font-semibold text-neutral-950 text-base text-center tracking-[0] leading-6">
                                                        아직 완료한 챌린지가 없어요
                                                    </h4>
                                                    <p className="[font-family:'Nunito',Helvetica] font-normal text-[#495565] text-sm text-center tracking-[0] leading-5">
                                                        첫 챌린지를 완료하고 뱃지를 획득해보세요!
                                                    </p>
                                                    <Button
                                                        onClick={goToChallenge}
                                                        className="w-full bg-[#00a63e] text-white [font-family:'Nunito',Helvetica] font-medium text-sm rounded-lg h-auto py-2 hover:bg-[#008235] transition-colors"
                                                    >
                                                        챌린지 시작하기
                                                    </Button>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </section>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </section>
        </main>
    );
};

export default Community;