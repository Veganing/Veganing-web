import { CarbonFootprint } from "./components/CarbonFootprint";
import HeroSection from "./components/HeroSection";
import { VeganBenefits } from "./components/VeganBenefits";
import WhatIsVegan from "./components/WhatIsVegan";
function Home() {
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

