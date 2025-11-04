// 위치: src/pages/user/Login.jsx

import React, { useState } from "react";          // React와 상태 훅 가져오기
import { useNavigate } from "react-router-dom"; // ★ 라우팅 이동 훅
import PropTypes from "prop-types";                // 런타임 props 검증용(선택)
import { motion } from "motion/react";            // 가벼운 애니메이션 라이브러리

// 우리가 방금 만든 재사용 UI 컴포넌트들 불러오기
// 현재 파일이 src/pages/user 이므로 ../../ 로 두 단계 올라간 경로가 맞음
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

// 아이콘 컴포넌트들 (lucide-react)
import { Leaf, Mail, Lock, Eye, EyeOff } from "lucide-react";

// Login: 부모에서 onSignupClick, onLoginSuccess 콜백을 전달받아 사용
function Login({ onSignupClick, onLoginSuccess }) {
    const navigate = useNavigate(); // ★ 페이지 이동 함수
  // 이메일 입력값 상태
    const [email, setEmail] = useState("");
  // 비밀번호 입력값 상태
    const [password, setPassword] = useState("");
  // 비밀번호 눈 아이콘(보기/숨기기) 토글 상태
    const [showPassword, setShowPassword] = useState(false);
  // 로그인 버튼 로딩 상태 (중복 클릭 방지)
    const [isLoading, setIsLoading] = useState(false);

  // 폼 제출 시 실행되는 함수
    const handleSubmit = async (e) => {
    e.preventDefault();          // form의 기본 동작(페이지 새로고침) 방지
    setIsLoading(true);          // 버튼에 로딩 표시/비활성화

    // 실제 백엔드 연동 전 임시 테스트용 타이머
    // TODO: 여기에서 로그인 API를 호출하면 됨 (await login({email, password}))
    setTimeout(() => {
      setIsLoading(false);       // 로딩 종료
      // 부모에서 넘어온 성공 콜백이 함수면 호출
        if (typeof onLoginSuccess === "function") onLoginSuccess();
        }, 1000);
    };

  // JSX 반환(렌더링)
    return (
    // 전체 화면 높이로 가운데 정렬 + 배경 그라디언트
    <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-gradient-to-br from-teal-50/50 via-emerald-50/50 to-cyan-50/50">
      {/* 처음 나타날 때 부드럽게 페이드+위치 애니메이션 */}
        <motion.div
        initial={{ opacity: 0, y: 20 }}      // 시작 상태
        animate={{ opacity: 1, y: 0 }}       // 끝 상태
        transition={{ duration: 0.5 }}        // 재생 시간
        className="w-full max-w-md"           // 카드 최대 너비
        >
        {/* 모서리가 둥근 카드 컨테이너 */}
        <Card className="border-0 shadow-2xl shadow-teal-100/50 rounded-3xl overflow-hidden">
          {/* 카드의 상단 영역(그라디언트 배경, 로고/타이틀) */}
            <CardHeader className="space-y-4 bg-gradient-to-br from-teal-400 to-emerald-400 text-white pb-8 pt-10">
            {/* 로고(아이콘) 배경을 중앙에 배치 */}
            <div className="flex justify-center mb-2">
              {/* 유리 효과(backdrop-blur)와 라운드 박스 */}
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center shadow-lg">
                {/* 잎사귀 아이콘(서비스 컨셉에 맞춤) */}
                <Leaf className="w-10 h-10 text-white" />
                </div>
            </div>

            {/* 서비스명 타이틀 */}
            <CardTitle className="text-3xl text-center">veganing</CardTitle>

            {/* 한 줄 소개 텍스트 */}
            <CardDescription className="text-center text-white/90 text-base">
                비건 라이프스타일과 함께하세요
            </CardDescription>
            </CardHeader>

          {/* 카드 본문(입력 폼) */}
            <CardContent className="pt-8 pb-8 px-8">
            {/* 폼을 제출하면 handleSubmit 실행 */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 이메일 입력 영역 */}
                <div className="space-y-2">
                {/* 접근성: Label과 input의 연결 (htmlFor=id) */}
                <Label htmlFor="email" className="text-gray-700">
                    이메일
                </Label>

                {/* 아이콘을 input 안쪽 왼편에 포지셔닝하기 위해 relative 컨테이너 */}
                <div className="relative">
                  {/* 메일 아이콘(absolute로 배치) */}
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-teal-500" />
                  {/* 실제 이메일 입력창 */}
                    <Input
                    id="email"                        // Label과 연결
                    type="email"                      // HTML5 이메일 유효성 체크
                    placeholder="your@email.com"     // 빈칸 힌트
                    value={email}                     // 상태값 바인딩
                    onChange={(e) => setEmail(e.target.value)} // 타이핑 시 상태 업데이트
                    className="pl-12 h-12 rounded-2xl border-2 border-teal-100 focus:border-teal-400 bg-teal-50/30" // 왼쪽 아이콘 공간 확보(pl-12)
                    required                          // 필수 입력
                    />
                </div>
                </div>

              {/* 비밀번호 입력 영역 */}
                <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700">
                    비밀번호
                </Label>

                <div className="relative">
                  {/* 자물쇠 아이콘 */}
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-teal-500" />

                  {/* 비밀번호 입력창 (보기/숨기기 토글 반영) */}
                    <Input
                    id="password"
                    type={showPassword ? "text" : "password"}  // 토글에 따라 타입 변경
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-12 pr-12 h-12 rounded-2xl border-2 border-teal-100 focus:border-teal-400 bg-teal-50/30" // 오른쪽 아이콘 공간(pr-12)
                    required
                    />

                  {/* 오른쪽 눈 아이콘 버튼: 비밀번호 보기/숨기기 */}
                    <button
                    type="button"                                   // 버튼 클릭이 form submit 되지 않도록
                    onClick={() => setShowPassword((v) => !v)}      // 상태 토글
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-teal-500 transition-colors"
                    aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"} // 스크린리더 접근성
                    >
                    {/* 상태에 따라 Eye/EyeOff 아이콘 전환 */}
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                </div>
                </div>

              {/* 아래 보조 행: 로그인 유지 체크박스 + 비밀번호 찾기 링크 */}
                <div className="flex items-center justify-between text-sm">
                {/* 체크박스와 문구를 한 덩어리로 클릭 가능하게 label로 감싸기 */}
                <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                    type="checkbox"                                   // 실제 체크박스
                    className="w-4 h-4 rounded border-2 border-teal-300 text-teal-500 focus:ring-teal-400"
                    />
                    <span className="text-gray-600">로그인 상태 유지</span>
                </label>

                {/* 비밀번호 찾기(라우팅을 쓸 경우 Link로 교체) */}
                <a href="#" className="text-teal-600 hover:text-teal-700 transition-colors">
                    비밀번호 찾기
                </a>
                </div>

              {/* 제출 버튼: 로딩 중이면 비활성화 + 문구 변경 */}
            <Button
                type="submit"
                disabled={isLoading} // 중복 클릭 방지
                className="w-full h-12 bg-gradient-to-r from-teal-400 to-emerald-400 hover:from-teal-500 hover:to-emerald-500 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
                {isLoading ? "로그인 중..." : "로그인"}
            </Button>
            </form>

            {/* 카드 하단: 회원가입 유도 문구 */}
            <div className="mt-8 pt-6 border-t-2 border-gray-100">
                <p className="text-center text-gray-600">
                아직 회원이 아니신가요?{" "}
                {/* 회원가입 버튼: 부모에서 onSignupClick 전달받아 실행 */}
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

// props 타입 검증: 둘 다 함수가 필수
Login.propTypes = {
    onSignupClick: PropTypes.func.isRequired,
    onLoginSuccess: PropTypes.func.isRequired,
};

export default Login;
