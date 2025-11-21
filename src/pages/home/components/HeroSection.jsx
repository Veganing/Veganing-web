import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Calendar } from "lucide-react";

const veganFoodImages = [
    "https://images.unsplash.com/photo-1607264021653-0a884a9740cd?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1692194741596-46ff868c4509?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1642497394078-4794e837019c?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1568158958563-c13c713d69f1?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1675092789086-4bd2b93ffc69?auto=format&fit=crop&w=1200&q=80"
];

// 임시 버튼 (UI 버튼 없어서 대신 만듦)
function Button({ children, className = "", ...props }) {
    return (
        <button
            {...props}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${className}`}
        >
            {children}
        </button>
    );
}

// 임시 배지
function Badge({ children, className = "" }) {
    return (
        <span
            className={`px-4 py-1 rounded-full border text-sm font-medium inline-block ${className}`}
        >
            {children}
        </span>
    );
}

export default function HeroSection() {
    const [currentImage, setCurrentImage] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImage((i) => (i + 1) % veganFoodImages.length);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    return (
        <section className="w-full min-h-[90vh] flex items-center relative mt-20">

            {/* 좌측 텍스트 */}
            <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 px-6 py-16 items-center">

                <div className="space-y-6">
                    <Badge className="border-teal-300 text-teal-700 bg-white">
                        🌱 지속 가능한 라이프스타일
                    </Badge>

                    <h1 className="text-5xl font-extrabold leading-tight">
                        <span className="text-teal-600">30일 비건</span>
                        <br />
                        <span className="text-emerald-600">챌린지</span>
                    </h1>

                    <p className="text-gray-600 text-lg max-w-md">
                        건강한 몸과 지구를 위한 첫 걸음을 내딛어보세요.
                        전문가와 함께하는 30일 맞춤형 비건 라이프스타일 여정입니다.
                    </p>

                    {/* 버튼 영역 */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-4">

                        <Button
                            className="bg-teal-400 text-white hover:bg-teal-500 shadow-md flex items-center gap-2"
                            onClick={() => {
                                const section = document.getElementById("challenge");
                                section?.scrollIntoView({ behavior: "smooth" });
                            }}
                        >
                            <Calendar size={18} />
                            30일 챌린지 시작하기
                            <ArrowRight size={16} />
                        </Button>

                        <Button className="border border-teal-400 text-teal-600 hover:bg-teal-50">
                            체험해보기
                        </Button>
                    </div>

                    {/* 3개의 카드 */}
                    <div className="grid grid-cols-3 gap-4 pt-6">
                        {[
                            { value: "15K+", label: "참여자" },
                            { value: "89%", label: "성공률" },
                            { value: "4.9★", label: "만족도" },
                        ].map((item, index) => (
                            <div
                                key={index}
                                className="text-center bg-white shadow-md rounded-xl py-4 hover:-translate-y-1 transition cursor-pointer"
                            >
                                <div className="text-2xl font-bold text-teal-600">{item.value}</div>
                                <div className="text-gray-500 text-sm">{item.label}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 우측 이미지 */}
                <div className="relative w-full h-[400px] rounded-3xl overflow-hidden shadow-xl">
                    <AnimatePresence mode="wait">
                        <motion.img
                            key={currentImage}
                            src={veganFoodImages[currentImage]}
                            alt="vegan"
                            className="absolute inset-0 w-full h-full object-cover"
                            initial={{ opacity: 0, scale: 1.1 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.8 }}
                        />
                    </AnimatePresence>
                </div>
            </div>
        </section>
    );
}
