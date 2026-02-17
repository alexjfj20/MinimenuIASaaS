import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI("TU_API_KEY");

const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

async function run() {
    const result = await model.generateContent("Explícame qué es SaaS");
    console.log(result.response.text());
}

run();
