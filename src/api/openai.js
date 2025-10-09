// export -> 파일 바깥에서 함수를 가져다 쓸 수 있게 내보낸다
// async -> 비동기로 동작할거라 선언 (나중에 실제 api 호출시 await을 씀)
export async function analyzeMealWithLLM({ prompt, imageDataUrl, systemPrompt }) {

    const apiKey = import.meta.env.VITE_OPENAI_API_KEY; // env에서 키 읽기

    if (!apiKey) {
        throw new Error("❌ OpenAI API 키가 없습니다. .env 확인하세요!");
    }

    // 📝 메시지 배열을 먼저 만듦
    const messages = [];

    // 🎭 시스템 프롬프트가 있으면 맨 앞에 추가
    if (systemPrompt) {
        messages.push({
            role: "system",
            content: systemPrompt
        });
    }

    // 👤 사용자 메시지 추가
    messages.push({
        role: "user",
        content: [
            { type: "text", text: prompt },
            imageDataUrl ? { type: "image_url", image_url: { url: imageDataUrl } } : null,
        ].filter(Boolean) // imageDataUrl 없으면 제외
    });

    // 🚀 API 요청 body 생성
    const body = {
        model: "gpt-4o-mini",
        messages: messages,  // 위에서 만든 messages 배열 사용!
    };

    // await -> 서버의 응답이 들어올 때까지 멈춤
    // 브라우저의 fetch로 openai chat completions api에 요청 보냄
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json", // 보낼 데이터가 JSON이라는 뜻
            Authorization: `Bearer ${apiKey}`, // Bearer 토큰 형식으로 API키 전달
        },
        body: JSON.stringify(body),
    });

    // 응답의 HTTP 상태코드가 200대가 아니면(오류면) 서버가 보낸 에러 메시지까지 읽어서 자세한 오류로 다시 던짐
    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`OpenAI API 오류: ${response.status}\n${errText}`);
    }

    const data = await response.json(); // 응답 바디를 JSON 객체로 파싱
    return data.choices[0].message.content; // 모델이 생성한 텍스트 -> 모델의 첫번째 응답(choices[0])에서 텍스트 결과만 꺼내서 반환
    // 이 값이 App.jsx로 넘어가서 화면에 표시
}

// 파일 -> Data URL 변환 헬퍼
export function fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => reject(new Error("이미지 변환 오류"));
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(file);
    });
}

// 탄소발자국 계산 프롬프팅
export async function calculateCarbonFootprint(mealsData) {
    const systemPrompt = `
당신은 환경 영향 분석 전문가입니다.

**CO2 절약량 기준 (일반 육류 식사 7.2kg 대비):**
- 완전 비건: 5.7kg 절약
- 락토-오보 (달걀/우유): 4.7kg 절약
- 페스코 (생선): 2.7kg 절약
- 육류 포함: 0kg 절약

**계산 방식:**
각 식단의 비건 친화도를 정확히 판단하고, 위 기준에 따라 CO2 절약량 합산

JSON만 응답:
{
    "totalCO2Saved": 숫자,
    "veganRate": 숫자,
    "mealCount": 숫자
}
`;

    const userPrompt = `
총 ${mealsData.length}개 식단 분석:

${mealsData.map((meal, idx) => `
=== ${idx + 1}번째 식단 ===
${meal.analysis}
`).join('\n\n')}

**각 식단마다:**
1. 동물성 재료 확인
    - 육류(소/돼지/닭 등) 있음 → 육류 포함 (0kg)
    - 생선만 있음 → 페스코 (2.7kg)
    - 달걀/우유만 있음 → 락토-오보 (4.7kg)
    - 동물성 전혀 없음 → 완전 비건 (5.7kg)

2. totalCO2Saved = 각 식단의 절약량 합산
3. veganRate = (완전 비건 개수 ÷ ${mealsData.length}) × 100

**예시:**
- 완전 비건 2개 + 페스코 1개 = 5.7+5.7+2.7 = 14.1kg, 비건율 66%
- 락토-오보 1개 + 육류 1개 = 4.7+0 = 4.7kg, 비건율 0%

지금 계산해서 JSON으로 응답하세요.
`;

    try {
        const result = await analyzeMealWithLLM({
            prompt: userPrompt,
            systemPrompt,
            imageDataUrl: null
        });

        console.log("LLM 원본 응답:", result);

        let jsonStr = result.trim();
        if (jsonStr.includes('```json')) {
            jsonStr = jsonStr.split('```json')[1].split('```')[0].trim();
        } else if (jsonStr.includes('```')) {
            jsonStr = jsonStr.split('```')[1].split('```')[0].trim();
        }

        const parsed = JSON.parse(jsonStr);
        console.log("파싱된 결과:", parsed);

        return {
            co2Saved: parseFloat(parsed.totalCO2Saved).toFixed(1),
            veganRate: Math.round(parsed.veganRate),
            mealCount: parsed.mealCount
        };
    } catch (e) {
        console.error('탄소발자국 계산 실패:', e);
        return {
            co2Saved: '0.0',
            veganRate: 0,
            mealCount: mealsData.length
        };
    }
}