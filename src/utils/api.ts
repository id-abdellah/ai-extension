
const APIKEY = import.meta.env.VITE_GEMINI_API_KEY

const BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?"

export async function AIResponse(prompt: string) {
    const options: RequestInit = {
        method: "POST",
        headers: {
            "Content-Type": "Application/json",
        },
        body: JSON.stringify({
            contents: [
                {
                    parts: [
                        {
                            text: prompt
                        }
                    ]
                }
            ]
        })
    }

    const response = await fetch(`${BASE_URL}key=${APIKEY}`, options);
    if (!response.ok) throw new Error("something went wrong")
    const data = await response.json();
    const aiResponse = data.candidates[0].content.parts[0].text
    return aiResponse
}