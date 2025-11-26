
import { CarbonFootprint } from "./components/CarbonFootprint";
import HeroSection from "./components/HeroSection";
import { VeganBenefits } from "./components/VeganBenefits";
import WhatIsVegan from "./components/WhatIsVegan";
import React, { useEffect, useState } from "react";
import Login from "../user/Login.jsx";
function Home() {
    //로그인 화면 표시 여부
    const [showLogin, setShowLogin] = useState(false);

    //이 페이지 (Home)가 마운트될 떄 전역 함수 등록
    useEffect(() => {
        window.openLogin = () => setShowLogin(true); //Header의 버튼이 이걸 부름
        return () => {delete window.openLogin; }; //페이지 떠나면 정리
    }, []);

    //Login.jsx에서 성공 시 다시 홈으로 돌아오게
    const handleLoginSuccess = () => {
        //TODO : 토큰 저장/유저 상태 갱신 등 실제 로직 추가 가능
        setShowLogin(false);
    };

    //회원가입 버튼 (임시)
    const handleSignupClick = () => {
        alert("추후 연결");
    };

    //로그인 화면을 띄워야 할 때 : 홈 대신 Login을 전면 렌더
    if (showLogin) {
        return (
            <Login
                onSignupClick={handleSignupClick}
                onLoginSuccess={handleLoginSuccess}
            />
        );
    }
    
    return (
        <>
            <HeroSection />
            <WhatIsVegan />
            <VeganBenefits />
            <CarbonFootprint />
        </>
    );
}

export default Home;

