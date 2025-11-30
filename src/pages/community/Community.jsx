import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentChallenge, getMyProfile, getChallengeStats, getToken, getPosts, removeToken, logout } from "../../api/backend";
import { clearAuth } from "../../hooks/auth";
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
import RecipeRankingTab from "./RecipeRankingTab";

// 시간 변환 헬퍼 함수
const formatTimeAgo = (dateString) => {
    if (!dateString) return "방금 전";

    const now = new Date();
    const postDate = new Date(dateString);
    const diffMs = now - postDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "방금 전";
    if (diffMins < 60) return `${diffMins}분 전`;
    if (diffHours < 24) return `${diffHours}시간 전`;
    if (diffDays < 7) return `${diffDays}일 전`;
    return postDate.toLocaleDateString("ko-KR");
};

// 더 이상 사용되지 않는 하드코딩된 데이터 (주석 처리)
/*
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
*/

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
    const [feedPosts, setFeedPosts] = useState([]);
    const [feedLoading, setFeedLoading] = useState(true);

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
                    setIsLoggedIn(false);
                    setProfileLoading(false);
                    return;
                }

                setIsLoggedIn(true); // 토큰이 있으면 로그인 상태로 설정

                // MyPage.jsx와 동일한 방식으로 프로필 가져오기
                try {
                    console.log("🔵 프로필 API 호출 시작, 토큰:", token ? "존재" : "없음");
                    const profileResponse = await getMyProfile(token);
                    console.log("🔍 프로필 응답 전체:", JSON.stringify(profileResponse, null, 2));
                    console.log("🔍 profileResponse.user:", profileResponse?.user);

                    if (profileResponse && profileResponse.user) {
                        const user = profileResponse.user;
                        console.log("✅ 사용자 데이터:", user);
                        setUserProfile(user);
                        console.log("✅ 프로필 설정 완료!");
                    } else {
                        console.warn("⚠️ 프로필 응답 형식이 예상과 다릅니다.");
                        console.warn("전체 응답:", profileResponse);
                        // 응답이 있지만 user가 없는 경우, 응답 자체가 user일 수도 있음
                        if (profileResponse && (profileResponse.id || profileResponse.email || profileResponse.nickname)) {
                            console.log("응답 자체가 user 객체인 것으로 보입니다. 직접 설정합니다.");
                            setUserProfile(profileResponse);
                        }
                    }
                } catch (error) {
                    console.error("❌ 프로필 조회 실패:");
                    console.error("에러 메시지:", error.message);

                    // 토큰 만료 체크
                    if (error.message && (error.message.includes("Token expired") || error.message.includes("401"))) {
                        console.warn("⚠️ 토큰이 만료되었습니다. 자동 로그아웃합니다.");
                        // 토큰 제거 및 로그아웃
                        removeToken();
                        clearAuth();
                        logout();
                        // 로그인 페이지로 리다이렉트
                        alert("세션이 만료되었습니다. 다시 로그인해주세요.");
                        navigate("/login");
                        return;
                    }

                    // 프로필 로딩 실패해도 로그인 상태는 유지 (토큰이 있으므로)
                }

                // 통계 데이터 가져오기
                try {
                    const statsResponse = await getChallengeStats(token);
                    if (statsResponse && statsResponse.stats) {
                        setUserStats(statsResponse.stats);
                    }
                } catch (error) {
                    console.error("통계 조회 실패:", error);
                    // 토큰 만료 체크
                    if (error.message && (error.message.includes("Token expired") || error.message.includes("401"))) {
                        console.warn("⚠️ 통계 조회 중 토큰 만료 감지");
                        // 이미 위에서 처리했으므로 중복 처리 방지
                    }
                    // 통계 실패는 치명적이지 않음
                }
            } catch (error) {
                console.error("사용자 데이터 조회 실패:", error);
                // 에러가 발생해도 토큰이 있으면 로그인 상태는 유지
                const token = getToken();
                if (token) {
                    setIsLoggedIn(true);
                }
            } finally {
                setProfileLoading(false);
            }
        };

        fetchUserData();
    }, []);

    // 게시글 목록 가져오기
    useEffect(() => {
        const fetchPosts = async () => {
            try {
                setFeedLoading(true);
                const response = await getPosts({ limit: 50 });

                if (response.posts) {
                    // 백엔드 데이터를 프론트엔드 형식으로 변환
                    const formattedPosts = response.posts.map((post) => ({
                        id: post.id,
                        username: post.author?.nickname || "익명",
                        level: `Lv.${post.author?.level || 1}`,
                        location: "서울 강남구", // 백엔드에 위치 정보가 없으면 기본값
                        time: formatTimeAgo(post.createdAt),
                        content: post.content,
                        hashtags: post.content?.match(/#[\w가-힣]+/g) || [],
                        likes: post.likes || 0,
                        comments: post.commentCount || 0,
                        avatar: post.author?.profileImage || null,
                        imageUrl: post.imageUrl,
                        category: post.category,
                        buttonIcon: "https://c.animaapp.com/mh1f3wszSXzzY1/img/button.svg",
                    }));
                    setFeedPosts(formattedPosts);
                }
            } catch (error) {
                console.error("게시글 목록 조회 실패:", error);
                // 에러 발생 시 빈 배열 유지 또는 기본 데이터 사용 가능
            } finally {
                setFeedLoading(false);
            }
        };

        fetchPosts();

        // 페이지가 다시 보일 때마다 데이터 새로고침
        const handleVisibilityChange = () => {
            if (!document.hidden) {
                fetchPosts();
            }
        };

        window.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            window.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, []);

    const goToChallenge = () => {
        navigate("/challenge");
    };

    const goToCreatePost = () => {
        navigate("/community/create");
    };

    // 게시글 업데이트 핸들러 (좋아요 등)
    const handlePostUpdate = (postId, updates) => {
        setFeedPosts(prevPosts =>
            prevPosts.map(post =>
                post.id === postId
                    ? { ...post, ...updates }
                    : post
            )
        );
    };

    return (
        <main className="flex-1 relative">
            <div className="bg-white w-full flex flex-col animate-fadeIn">
                {/* Hero Section */}
                <div className="w-full text-center space-y-6 mb-16 mt-40">
                    <h1 className="text-6xl font-normal font-['Inter'] leading-[60px] tracking-tight text-primary-dark">
                        비건 커뮤니티
                    </h1>
                    <p className="text-xl font-normal font-['Inter'] leading-7 text-gray-700">
                        함께하는 비건 여정, 서로의 경험을 나누고 응원해보세요
                    </p>
                </div>
                <section className="container mx-auto px-4 py-16 relative">
                    <div className="flex flex-col items-center gap-12 max-w-7xl mx-auto">

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
                                        value="recipe-ranking"
                                        className="[font-family:'Nunito',Helvetica] font-medium text-[#00a63e] text-sm rounded-[14px] data-[state=active]:bg-white"
                                    >
                                        레시피 랭킹
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
                                        feedLoading={feedLoading}
                                        challengeLoading={challengeLoading}
                                        isLoggedIn={isLoggedIn}
                                        currentChallenge={currentChallenge}
                                        goToChallenge={goToChallenge}
                                        popularHashtags={popularHashtags}
                                        onCreatePost={goToCreatePost}
                                        onPostUpdate={handlePostUpdate}
                                    />
                                </TabsContent>

                                <TabsContent value="recipe-ranking">
                                    <RecipeRankingTab />
                                </TabsContent>
                            </Tabs>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
};

export default Community;

