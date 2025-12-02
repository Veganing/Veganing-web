import { CarbonFootprint } from "./components/CarbonFootprint";
import HeroSection from "./components/HeroSection";
import { VeganBenefits } from "./components/VeganBenefits";
import WhatIsVegan from "./components/WhatIsVegan";
import React, { useEffect, useState } from "react";
import Login from "../user/Login.jsx";

function Home() {
    const [showLogin, setShowLogin] = useState(false);

    useEffect(() => {
        window.openLogin = () => setShowLogin(true);
        return () => { delete window.openLogin; };
    }, []);

    const handleLoginSuccess = () => {
        setShowLogin(false);
    };

    const handleSignupClick = () => {
        alert("추후 연결");
    };

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
