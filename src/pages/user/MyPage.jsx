// 위치: src/pages/user/MyPage.jsx

import React, { useState } from "react";                           // 리액트/상태
import { motion } from "motion/react";                              // 등장 애니메이션
import { useNavigate } from "react-router-dom";                     // 필요 시 사용
// 프로젝트에 존재하는 UI 컴포넌트만 임포트
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
// 아이콘
import { MapPin, Mail, Trophy, Leaf, CheckCircle2, Calendar, Edit, Save, X, User, Lock, Eye, EyeOff, TrendingUp, Star, Medal, Target } from "lucide-react";

// ──────────────────────────────────────────────────────────────
// 로컬 대체 컴포넌트들 (Avatar / Badge / Tabs 간단 버전)
// 외부 ui/avatar, ui/badge, ui/tabs 파일이 없어서 여기서 정의
// ──────────────────────────────────────────────────────────────

// 1) 아바타: 사용자의 이니셜을 원형으로 표시
function AvatarCircle({ text }) {
    return (
        <div className="w-32 h-32 rounded-full border-4 border-white shadow-xl flex items-center justify-center bg-gradient-to-br from-teal-500 to-emerald-500">
            <span className="text-white text-3xl">{text?.[0] ?? "?"}</span>
        </div>
    );
}

// 2) 필 뱃지: 작은 라벨
function PillBadge({ children, className = "" }) {
    return (
        <span className={`inline-block text-xs px-2.5 py-1 rounded-full text-white ${className}`}>
            {children}
        </span>
    );
}

// 3) 탭(아주 단순): state로 활성 탭 관리
function SimpleTabs({ tabs, active, onChange }) {
    return (
        <div className="bg-teal-50/50 rounded-2xl p-1 border-2 border-teal-100 flex gap-1">
            {tabs.map((t) => (
                <button
                    key={t.value}
                    onClick={() => onChange(t.value)}
                    className={`px-4 py-2 rounded-xl transition-all ${
                        active === t.value
                            ? "bg-gradient-to-r from-teal-400 to-emerald-400 text-white"
                            : "text-teal-700 hover:bg-teal-100"
                    }`}
                >
                    <div className="flex items-center gap-2">
                        {t.icon ? <t.icon className="w-4 h-4" /> : null}
                        <span>{t.label}</span>
                    </div>
                </button>
            ))}
        </div>
    );
}

// ──────────────────────────────────────────────────────────────
// 실제 MyPage 컴포넌트
// ──────────────────────────────────────────────────────────────
export default function MyPage() {
    const navigate = useNavigate();

    // 편집/비밀번호 변경 상태
    const [isEditing, setIsEditing] = useState(false);
    const [showPasswordChange, setShowPasswordChange] = useState(false);

    // 유저 데이터 (임시 목업)
    const [userData, setUserData] = useState({
        name: "김비건",
        email: "vegan@example.com",
        address: "서울시 강남구 비건로 123",
        joinDate: "2024.01.15",
    });

    // 편집용 버퍼
    const [editData, setEditData] = useState({ ...userData });

    // 비밀번호 변경 상태
    const [passwordData, setPasswordData] = useState({ current: "", new: "", confirm: "" });
    const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });

    // 통계/목업 데이터
    const stats = {
        totalDays: 45,
        consecutiveDays: 12,
        carbonSaved: 234.5,
        postsCount: 38,
        challengesCompleted: 3,
    };

    const badges = [
        { id: 1, name: "첫 걸음", icon: Star, color: "text-yellow-600", bgColor: "bg-yellow-100", earned: true, description: "첫 챌린지 시작" },
        { id: 2, name: "일주일 완주", icon: Trophy, color: "text-blue-600", bgColor: "bg-blue-100", earned: true, description: "7일 연속 인증" },
        { id: 3, name: "한 달 완주", icon: Trophy, color: "text-purple-600", bgColor: "bg-purple-100", earned: true, description: "30일 챌린지 완료" },
        { id: 4, name: "지구 지킴이", icon: Leaf, color: "text-green-600", bgColor: "bg-green-100", earned: true, description: "100kg CO2 절감" },
        { id: 5, name: "커뮤니티 스타", icon: Medal, color: "text-pink-600", bgColor: "bg-pink-100", earned: false, description: "좋아요 100개 받기" },
        { id: 6, name: "완벽주의자", icon: Target, color: "text-indigo-600", bgColor: "bg-indigo-100", earned: false, description: "100일 연속 인증" },
    ];

    const rankings = [
        { rank: 1, name: "박지연", region: "강남구", score: 1250, avatar: "PJ" },
        { rank: 2, name: "이민수", region: "강남구", score: 1180, avatar: "LM" },
        { rank: 3, name: "김비건", region: "강남구", score: 890, avatar: "KB", isMe: true },
        { rank: 4, name: "최서현", region: "강남구", score: 820, avatar: "CS" },
        { rank: 5, name: "정우진", region: "강남구", score: 765, avatar: "JW" },
    ];

    const recentPosts = [
        { date: "2024.10.24", title: "오늘의 비건 브런치", likes: 24, comments: 5 },
        { date: "2024.10.23", title: "비건 김치찌개 도전!", likes: 31, comments: 8 },
        { date: "2024.10.22", title: "새로운 비건 카페 발견", likes: 19, comments: 3 },
    ];

    // 저장/취소/비번변경
    const handleSaveProfile = () => {
        setUserData({ ...editData });
        setIsEditing(false);
    };

    const handleCancelEdit = () => {
        setEditData({ ...userData });
        setIsEditing(false);
    };

    const handlePasswordChange = () => {
        if (passwordData.new !== passwordData.confirm) {
            alert("새 비밀번호가 일치하지 않습니다.");
            return;
        }
        alert("비밀번호가 변경되었습니다.");
        setShowPasswordChange(false);
        setPasswordData({ current: "", new: "", confirm: "" });
    };

    // 탭 상태
    const [activeTab, setActiveTab] = useState("badges");

    return (
        <div className="min-h-screen bg-white py-8 px-4">
            <div className="max-w-6xl mx-auto">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                    {/* 상단 헤더 */}
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-3xl bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">마이페이지</h1>
                            <p className="text-gray-600 mt-2">나의 비건 라이프 여정을 확인하세요</p>
                        </div>
                    </div>

                    {/* 프로필 카드 */}
                    <Card className="border-0 shadow-lg shadow-teal-100/50 rounded-3xl overflow-hidden mb-8">
                        <div className="h-32 bg-gradient-to-r from-teal-400 to-emerald-400" />
                        <CardContent className="relative pt-0 pb-8 px-8">
                            <div className="flex flex-col md:flex-row items-start md:items-end gap-6 -mt-16">
                                {/* 아바타 대체 */}
                                <AvatarCircle text={userData.name} />

                                <div className="flex-1 bg-white rounded-2xl p-6 shadow-md">
                                    {!isEditing ? (
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h2 className="text-2xl text-gray-800">{userData.name}</h2>
                                                    <p className="text-sm text-gray-500 mt-1">가입일: {userData.joinDate}</p>
                                                </div>
                                                <Button
                                                    onClick={() => setIsEditing(true)}
                                                    className="rounded-2xl bg-gradient-to-r from-teal-400 to-emerald-400 hover:from-teal-500 hover:to-emerald-500"
                                                >
                                                    <Edit className="w-4 h-4 mr-2" />
                                                    프로필 수정
                                                </Button>
                                            </div>

                                            <div className="grid md:grid-cols-2 gap-4 pt-4">
                                                <div className="flex items-center gap-3 text-gray-600">
                                                    <Mail className="w-5 h-5 text-teal-500" />
                                                    <span>{userData.email}</span>
                                                </div>
                                                <div className="flex items-center gap-3 text-gray-600">
                                                    <MapPin className="w-5 h-5 text-teal-500" />
                                                    <span>{userData.address}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="text-xl text-gray-800">프로필 수정</h3>
                                                <div className="flex gap-2">
                                                    <Button onClick={handleCancelEdit} variant="outline" className="rounded-2xl">
                                                        <X className="w-4 h-4 mr-2" />
                                                        취소
                                                    </Button>
                                                    <Button onClick={handleSaveProfile} className="rounded-2xl bg-gradient-to-r from-teal-400 to-emerald-400">
                                                        <Save className="w-4 h-4 mr-2" />
                                                        저장
                                                    </Button>
                                                </div>
                                            </div>

                                            <div className="grid md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label>이름</Label>
                                                    <div className="relative">
                                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-teal-500" />
                                                        <Input
                                                            value={editData.name}
                                                            onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                                            className="pl-10 rounded-2xl border-2 border-teal-100 focus:border-teal-400"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>이메일</Label>
                                                    <div className="relative">
                                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-teal-500" />
                                                        <Input
                                                            value={editData.email}
                                                            onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                                                            className="pl-10 rounded-2xl border-2 border-teal-100 focus:border-teal-400"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label>주소</Label>
                                                <div className="relative">
                                                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-teal-500" />
                                                    <Input
                                                        value={editData.address}
                                                        onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                                                        className="pl-10 rounded-2xl border-2 border-teal-100 focus:border-teal-400"
                                                    />
                                                </div>
                                            </div>

                                            <div className="pt-4">
                                                <Button
                                                    onClick={() => setShowPasswordChange(!showPasswordChange)}
                                                    variant="outline"
                                                    className="rounded-2xl border-2 border-teal-200"
                                                >
                                                    <Lock className="w-4 h-4 mr-2" />
                                                    비밀번호 변경
                                                </Button>
                                            </div>

                                            {showPasswordChange && (
                                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-4 pt-4 border-t-2 border-gray-100">
                                                    {/* 현재 비밀번호 */}
                                                    <div className="space-y-2">
                                                        <Label>현재 비밀번호</Label>
                                                        <div className="relative">
                                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-teal-500" />
                                                            <Input
                                                                type={showPasswords.current ? "text" : "password"}
                                                                value={passwordData.current}
                                                                onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                                                                className="pl-10 pr-10 rounded-2xl border-2 border-teal-100"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                                                                className="absolute right-3 top-1/2 -translate-y-1/2"
                                                            >
                                                                {showPasswords.current ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* 새 비밀번호 */}
                                                    <div className="space-y-2">
                                                        <Label>새 비밀번호</Label>
                                                        <div className="relative">
                                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-teal-500" />
                                                            <Input
                                                                type={showPasswords.new ? "text" : "password"}
                                                                value={passwordData.new}
                                                                onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                                                                className="pl-10 pr-10 rounded-2xl border-2 border-teal-100"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                                                                className="absolute right-3 top-1/2 -translate-y-1/2"
                                                            >
                                                                {showPasswords.new ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* 새 비밀번호 확인 */}
                                                    <div className="space-y-2">
                                                        <Label>새 비밀번호 확인</Label>
                                                        <div className="relative">
                                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-teal-500" />
                                                            <Input
                                                                type={showPasswords.confirm ? "text" : "password"}
                                                                value={passwordData.confirm}
                                                                onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                                                                className="pl-10 pr-10 rounded-2xl border-2 border-teal-100"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                                                                className="absolute right-3 top-1/2 -translate-y-1/2"
                                                            >
                                                                {showPasswords.confirm ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <Button onClick={handlePasswordChange} className="w-full rounded-2xl bg-gradient-to-r from-teal-400 to-emerald-400">
                                                        비밀번호 변경
                                                    </Button>
                                                </motion.div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* 통계 카드 */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                        {[
                            { label: "총 챌린지 일수", value: stats.totalDays, icon: Calendar, color: "from-blue-400 to-cyan-400" },
                            { label: "연속 인증일", value: stats.consecutiveDays, icon: Target, color: "from-purple-400 to-pink-400" },
                            { label: "CO2 절감 (kg)", value: stats.carbonSaved, icon: Leaf, color: "from-green-400 to-emerald-400" },
                            { label: "식단 인증", value: stats.postsCount, icon: CheckCircle2, color: "from-teal-400 to-cyan-400" },
                            { label: "완료한 챌린지", value: stats.challengesCompleted, icon: Trophy, color: "from-yellow-400 to-orange-400" },
                        ].map((stat, idx) => (
                            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
                                <Card className="border-0 shadow-lg shadow-teal-100/50 rounded-3xl overflow-hidden hover:shadow-xl transition-shadow">
                                    <CardContent className="p-6">
                                        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4`}>
                                            <stat.icon className="w-6 h-6 text-white" />
                                        </div>
                                        <div className="text-2xl text-gray-800 mb-1">{stat.value}</div>
                                        <div className="text-sm text-gray-500">{stat.label}</div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>

                    {/* 탭 */}
                    <SimpleTabs
                        tabs={[
                            { value: "badges", label: "획득 뱃지", icon: Trophy },
                            { value: "ranking", label: "커뮤니티 순위", icon: TrendingUp },
                            { value: "posts", label: "최근 활동", icon: Leaf },
                        ]}
                        active={activeTab}
                        onChange={setActiveTab}
                    />

                    {/* 탭 콘텐츠 */}
                    <div className="mt-6 space-y-6">
                        {/* 1) 뱃지 */}
                        {activeTab === "badges" && (
                            <Card className="border-0 shadow-lg shadow-teal-100/50 rounded-3xl">
                                <CardHeader>
                                    <CardTitle className="text-gray-800">획득한 뱃지</CardTitle>
                                    <CardDescription>
                                        {badges.filter((b) => b.earned).length} / {badges.length} 개 획득
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {badges.map((badge) => (
                                            <motion.div
                                                key={badge.id}
                                                whileHover={{ scale: 1.03 }}
                                                className={`p-6 rounded-2xl border-2 transition-all ${
                                                    badge.earned ? `${badge.bgColor} border-transparent shadow-md` : "bg-gray-50 border-gray-200 opacity-60"
                                                }`}
                                            >
                                                <div className="flex items-start gap-4">
                                                    <div className={`p-3 rounded-2xl ${badge.earned ? badge.bgColor : "bg-gray-200"}`}>
                                                        <badge.icon className={`w-8 h-8 ${badge.earned ? badge.color : "text-gray-400"}`} />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="text-gray-800 mb-1">{badge.name}</h4>
                                                        <p className="text-sm text-gray-600">{badge.description}</p>
                                                        {badge.earned && <PillBadge className="bg-gradient-to-r from-teal-400 to-emerald-400">획득 완료</PillBadge>}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* 2) 지역 순위 */}
                        {activeTab === "ranking" && (
                            <Card className="border-0 shadow-lg shadow-teal-100/50 rounded-3xl">
                                <CardHeader>
                                    <CardTitle className="text-gray-800">강남구 지역 순위</CardTitle>
                                    <CardDescription>이번 달 나의 순위를 확인하세요</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {rankings.map((user, idx) => (
                                            <motion.div
                                                key={user.rank}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: idx * 0.1 }}
                                                className={`p-4 rounded-2xl flex items-center gap-4 ${
                                                    user.isMe ? "bg-gradient-to-r from-teal-50 to-emerald-50 border-2 border-teal-200" : "bg-gray-50"
                                                }`}
                                            >
                                                <div
                                                    className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white ${
                                                        user.rank === 1
                                                            ? "bg-gradient-to-br from-yellow-400 to-orange-400"
                                                            : user.rank === 2
                                                            ? "bg-gradient-to-br from-gray-300 to-gray-400"
                                                            : user.rank === 3
                                                            ? "bg-gradient-to-br from-amber-600 to-amber-700"
                                                            : "bg-gradient-to-br from-teal-400 to-emerald-400"
                                                    }`}
                                                >
                                                    {user.rank}
                                                </div>
                                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-emerald-400 text-white flex items-center justify-center">
                                                    {user.avatar}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-gray-800">{user.name}</span>
                                                        {user.isMe && <PillBadge className="bg-gradient-to-r from-teal-400 to-emerald-400">나</PillBadge>}
                                                    </div>
                                                    <p className="text-sm text-gray-500">{user.region}</p>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-lg text-gray-800">{user.score}</div>
                                                    <p className="text-sm text-gray-500">점</p>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* 3) 최근 활동 */}
                        {activeTab === "posts" && (
                            <Card className="border-0 shadow-lg shadow-teal-100/50 rounded-3xl">
                                <CardHeader>
                                    <CardTitle className="text-gray-800">최근 식단 인증</CardTitle>
                                    <CardDescription>나의 비건 식단 기록</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {recentPosts.map((post, idx) => (
                                            <motion.div
                                                key={idx}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: idx * 0.1 }}
                                                className="p-5 rounded-2xl bg-gradient-to-r from-teal-50/50 to-emerald-50/50 hover:shadow-md transition-shadow border border-teal-100"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex-1">
                                                        <h4 className="text-gray-800 mb-2">{post.title}</h4>
                                                        <p className="text-sm text-gray-500">{post.date}</p>
                                                    </div>
                                                    <div className="flex items-center gap-4 text-sm text-gray-600">
                                                        <span className="flex items-center gap-1">❤️ {post.likes}</span>
                                                        <span className="flex items-center gap-1">💬 {post.comments}</span>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
