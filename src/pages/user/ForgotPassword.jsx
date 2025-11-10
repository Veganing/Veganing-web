// src/pages/user/ForgotPassword.jsx
// [역할] 비밀번호 재설정 링크를 "보냈다"는 화면만 프론트에서 시뮬레이션으로 보여줌

// React의 기본 훅(useState) 사용
import React, { useState } from "react";
// 페이지 이동을 위해 useNavigate 훅 사용
import { useNavigate } from "react-router-dom";
// 간단한 등장 애니메이션을 위해 motion 사용(선택)
import { motion } from "motion/react";

// 프로젝트에서 쓰는 재사용 UI 컴포넌트들 불러오기
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Card,            // 카드 전체 컨테이너
  CardContent,     // 카드 본문 영역
  CardDescription, // 카드 설명 문구
  CardHeader,      // 카드 상단(타이틀 영역)
  CardTitle,       // 카드 제목
} from "../../components/ui/card";

// 아이콘(잎사귀, 메일, 뒤로가기 화살표, 체크 아이콘)
import { Leaf, Mail, ArrowLeft, CheckCircle2 } from "lucide-react";

export default function ForgotPassword() {
  // 페이지 이동 함수
  const navigate = useNavigate();

  // 사용자가 입력하는 이메일 상태값
  const [email, setEmail] = useState("");
  // 버튼을 눌렀을 때 잠깐 비활성화/로딩 표시용
  const [isLoading, setIsLoading] = useState(false);
  // "메일 보냄 완료" 화면으로 전환할지 여부
  const [isSent, setIsSent] = useState(false);

  // 폼 제출 시 호출되는 함수
  const handleSubmit = async (e) => {
    e.preventDefault();         // 폼의 기본 동작(새로고침) 막기
    if (isLoading) return;      // 중복 클릭 방지
    setIsLoading(true);         // 전송 중 표시 시작

    // [중요] 지금은 백엔드가 없으므로 "보냈다"는 연출만 0.8초 뒤에 보여줌
    setTimeout(() => {
      setIsLoading(false);      // 전송 중 표시 종료
      setIsSent(true);          // 완료 화면으로 전환
    }, 800);
  };

  // 실제 화면 렌더링
  return (
    // 화면 중앙 정렬 + 옅은 그라디언트 배경
    <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-gradient-to-br from-teal-50/50 via-emerald-50/50 to-cyan-50/50">
      {/* 카드가 부드럽게 나타나는 애니메이션 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}   // 시작 상태: 살짝 아래 + 투명
        animate={{ opacity: 1, y: 0 }}    // 끝 상태: 제자리 + 불투명
        transition={{ duration: 0.4 }}    // 재생 시간
        className="w-full max-w-md"       // 카드 최대 너비
      >
        {/* 둥근 카드 컨테이너 */}
        <Card className="border-0 shadow-2xl shadow-teal-100/50 rounded-3xl overflow-hidden">
          {/* 카드 상단(제목/설명) */}
          <CardHeader className="space-y-4 bg-gradient-to-br from-teal-400 to-emerald-400 text-white pb-8 pt-10">
            {/* 동그란 로고 상자 */}
            <div className="flex justify-center mb-2">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center shadow-lg">
                <Leaf className="w-10 h-10 text-white" /> {/* 잎사귀 아이콘 */}
              </div>
            </div>

            {/* 큰 제목 */}
            <CardTitle className="text-3xl text-center">비밀번호 찾기</CardTitle>

            {/* 설명 문구: 상태에 따라 문구가 바뀜 */}
            <CardDescription className="text-center text-white/90 text-base">
              {isSent ? "이메일을 확인해주세요" : "가입하신 이메일을 입력해주세요"}
            </CardDescription>
          </CardHeader>

          {/* 카드 본문 */}
          <CardContent className="pt-8 pb-8 px-8">
            {/* 아직 전송 전이면 입력 폼, 전송 후면 확인 메시지 */}
            {!isSent ? (
              // [전송 전] 이메일 입력 폼
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* 이메일 입력 영역 */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700">
                    이메일
                  </Label>

                  {/* 아이콘을 인풋 안쪽에 배치하기 위해 relative 컨테이너 사용 */}
                  <div className="relative">
                    {/* 왼쪽 메일 아이콘 */}
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-teal-500" />
                    {/* 실제 입력창: 왼쪽 아이콘 공간 확보용 padding-left(pl-12) */}
                    <Input
                      id="email"                       // Label과 연결되는 id
                      type="email"                     // 이메일 형식 유효성 검사
                      placeholder="your@email.com"    // 회색 힌트 텍스트
                      value={email}                    // 상태값 바인딩
                      onChange={(e) => setEmail(e.target.value)} // 타이핑하면 상태 업데이트
                      className="pl-12 h-12 rounded-2xl border-2 border-teal-100 focus:border-teal-400 bg-teal-50/30"
                      required                         // 빈값 제출 방지
                    />
                  </div>

                  {/* 안내 문구(작은 글씨) */}
                  <p className="text-sm text-gray-500 mt-2">
                    입력하신 이메일로 비밀번호 재설정 링크를 보내드립니다.
                  </p>
                </div>

                {/* 제출 버튼: 로딩 중이면 비활성화 + 문구 변경 */}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-gradient-to-r from-teal-400 to-emerald-400 hover:from-teal-500 hover:to-emerald-500 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {isLoading ? "전송 중..." : "재설정 링크 보내기"}
                </Button>
              </form>
            ) : (
              // [전송 후] “메일 보냄” 확인 화면(간단한 등장 애니메이션)
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6 text-center py-4"
              >
                {/* 큰 동그란 체크 아이콘 */}
                <div className="flex justify-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-teal-400 to-emerald-400 rounded-full flex items-center justify-center shadow-lg">
                    <CheckCircle2 className="w-12 h-12 text-white" />
                  </div>
                </div>

                {/* 안내 텍스트 묶음 */}
                <div className="space-y-3">
                  <h3 className="text-xl text-gray-800">이메일을 확인해주세요!</h3>
                  <p className="text-gray-600">
                    <span className="text-teal-600">{email}</span> 으로 재설정 링크를 보냈습니다.
                  </p>
                  <p className="text-sm text-gray-500 pt-2">
                    메일이 보이지 않으면 스팸함도 확인해주세요.
                  </p>
                </div>
              </motion.div>
            )}

            {/* 하단 구분선 + “로그인으로 돌아가기” 버튼 */}
            <div className="mt-8 pt-6 border-t-2 border-gray-100">
              <button
                type="button"                       // 폼 제출 방지용
                onClick={() => navigate("/login")}  // 로그인 페이지로 이동
                className="w-full flex items-center justify-center gap-2 text-teal-600 hover:text-teal-700 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>로그인으로 돌아가기</span>
              </button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
