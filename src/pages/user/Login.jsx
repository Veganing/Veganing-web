// 위치: src/pages/user/Login.jsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { motion } from "motion/react";

import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "../../components/ui/card";

import { Leaf, Mail, Lock, Eye, EyeOff } from "lucide-react";

// 1) 하드코딩(로컬) 유저 목록 — 필요하면 자유롭게 추가/수정
const SEED_USERS = [
    { email: "vegan@example.com", password: "vegan1234", name: "김비건" },
    { email: "test@example.com",  password: "test1234",  name: "테스터"  },
];

function Login({ onSignupClick, onLoginSuccess }) {
    const navigate = useNavigate();

    // 입력 상태
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // 2) 간단한 로컬 로그인 검증 함수
    const verifyLocalUser = (email, password) => {
        const found = SEED_USERS.find(u => u.email === email && u.password === password);
        return found || null;
    };

    // 3) 제출 처리
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isLoading) return;
        setIsLoading(true);

        try {
            // (a) 하드코딩된 유저로 검증
            const user = verifyLocalUser(email.trim(), password);

            if (!user) {
                alert("이메일 또는 비밀번호가 올바르지 않습니다.");
                return;
            }

            // (b) 로그인 성공 시 로컬스토리지에 저장
            //     Header.jsx가 localStorage('auth')를 참고하므로 여기서 반드시 저장
            localStorage.setItem("auth", JSON.stringify({ email: user.email, name: user.name }));

            // (c) 필요 시 상위 콜백 호출
            if (typeof onLoginSuccess === "function") onLoginSuccess();

            alert("로그인에 성공하셨습니다!");

            navigate("/");  //로그인 성공 시 홈으로 이동
        } catch (err) {
            console.error(err);
            alert("로그인 중 오류가 발생했습니다.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-gradient-to-br from-teal-50/50 via-emerald-50/50 to-cyan-50/50">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                <Card className="border-0 shadow-2xl shadow-teal-100/50 rounded-3xl overflow-hidden">
                    {/* 상단 비주얼 */}
                    <CardHeader className="space-y-4 bg-gradient-to-br from-teal-400 to-emerald-400 text-white pb-8 pt-10">
                        <div className="flex justify-center mb-2">
                            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center shadow-lg">
                                <Leaf className="w-10 h-10 text-white" />
                            </div>
                        </div>
                        <CardTitle className="text-3xl text-center">veganing</CardTitle>
                        <CardDescription className="text-center text-white/90 text-base">
                            비건 라이프스타일과 함께하세요
                        </CardDescription>
                    </CardHeader>

                    {/* 본문: 로그인 폼 */}
                    <CardContent className="pt-8 pb-8 px-8">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* 이메일 */}
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-gray-700">이메일</Label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-teal-500" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="vegan@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="pl-12 h-12 rounded-2xl border-2 border-teal-100 focus:border-teal-400 bg-teal-50/30"
                                        required
                                    />
                                </div>
                            </div>

                            {/* 비밀번호 */}
                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-gray-700">비밀번호</Label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-teal-500" />
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="pl-12 pr-12 h-12 rounded-2xl border-2 border-teal-100 focus:border-teal-400 bg-teal-50/30"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(v => !v)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-teal-500 transition-colors"
                                        aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            {/* 보조행 */}
                            <div className="flex items-center justify-between text-sm">
                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 rounded border-2 border-teal-300 text-teal-500 focus:ring-teal-400"
                                    />
                                    <span className="text-gray-600">로그인 상태 유지</span>
                                </label>
                                <button
                                    type="button"                         // 폼 제출 방지
                                    onClick={() => navigate("/forgot-password")} // 비번 찾기 페이지로 이동
                                    className="text-teal-600 hover:text-teal-700 transition-colors underline-offset-2 hover:underline"
                                >
                                비밀번호 찾기
                                </button>
                            </div>

                            {/* 버튼 */}
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-12 bg-gradient-to-r from-teal-400 to-emerald-400 hover:from-teal-500 hover:to-emerald-500 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
                            >
                                {isLoading ? "로그인 중..." : "로그인"}
                            </Button>
                        </form>

                        {/* 회원가입 유도 */}
                        <div className="mt-8 pt-6 border-t-2 border-gray-100">
                            <p className="text-center text-gray-600">
                                아직 회원이 아니신가요?{" "}
                                <button
                                    type="button"
                                    onClick={() => navigate("/signup")}
                                    className="bg-transparent p-0 m-0 border-0 text-teal-600 hover:text-teal-700 font-semibold transition-colors underline-offset-2 hover:underline cursor-pointer"
                                    aria-label="회원가입 페이지로 이동"
                                >
                                    회원가입
                                </button>
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}

// PropTypes: 옵션으로 완화(넘기지 않아도 에러 안 남)
Login.propTypes = {
    onSignupClick: PropTypes.func,
    onLoginSuccess: PropTypes.func,
};

// 기본값: no-op
Login.defaultProps = {
    onSignupClick: () => {},
    onLoginSuccess: () => {},
};

export default Login;
