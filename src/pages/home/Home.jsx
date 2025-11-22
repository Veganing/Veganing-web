import HeroSection from "./components/HeroSection";
import { VeganBenefits } from "./components/VeganBenefits";
import WhatIsVegan from "./components/WhatIsVegan";
function Home() {
    return (
        <>
            <HeroSection />
            <WhatIsVegan />
            <VeganBenefits />
        </>
    );
}

export default Home;

