import { motion } from "framer-motion";
import { Leaf, Heart, Globe, Sprout } from "lucide-react";

function WhatIsVegan() {
    const principles = [
        {
            icon: <Heart className="w-8 h-8 text-teal-600" />,
            title: "동물 보호",
            desc: "모든 동물의 권리를 존중하고 동물성 제품을 사용하지 않습니다."
        },
        {
            icon: <Globe className="w-8 h-8 text-teal-600" />,
            title: "환경 보호",
            desc: "지구 환경을 위해 지속 가능한 생활 방식을 추구합니다."
        },
        {
            icon: <Sprout className="w-8 h-8 text-teal-600" />,
            title: "건강한 삶",
            desc: "식물성 식품으로 더 건강하고 활기찬 삶을 만들어갑니다."
        }
    ];

    return (
        <section className="py-24 bg-white">
            {/* 제목 */}
            <div className="text-center mb-16">
                <div className="inline-block px-4 py-2 border border-teal-300 rounded-full text-teal-600 text-sm font-medium bg-white shadow">
                    <Leaf className="w-4 h-4 inline mr-2" />
                    비건이란?
                </div>

                <h2 className="mt-6 text-4xl md:text-5xl font-extrabold text-teal-700 leading-snug">
                    식물 기반의 <br />
                    <span className="text-emerald-600">생활 철학</span>
                </h2>

                <p className="mt-4 text-gray-600 max-w-2xl mx-auto text-lg">
                    비건(Vegan)은 동물을 해치지 않고 환경을 보호하며, 건강한 삶을 추구하는 라이프스타일입니다.
                </p>
            </div>

            {/* 내용 */}
            <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-10 px-6">
                {principles.map((item, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: idx * 0.15 }}
                        viewport={{ once: true }}
                        className="p-8 bg-white rounded-2xl shadow-lg border hover:shadow-2xl transition"
                    >
                        <div className="mb-4">{item.icon}</div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">{item.title}</h3>
                        <p className="text-gray-600">{item.desc}</p>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}

export default WhatIsVegan;
