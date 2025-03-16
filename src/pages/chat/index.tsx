import { useEffect, useLayoutEffect, useState } from "react";
import SendButton from "./SendButton";
import { AIResponse } from "../../api/api";
import localforage from "localforage";

type Which = "user" | "ai"

type Message = {
    messageContent: string
    type: Which
}

export default function ChatAI() {

    const [prompt, setPrompt] = useState<string>("");

    const [converstaionStorage, setConversationStorage] = useState<null | Message[]>(null)


    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [, setIsError] = useState<boolean>(false)

    const isDisabled: () => boolean = () => prompt.length === 0 || isLoading;

    const onBtnClick = async () => {
        const text = prompt
        addToConversation(text, "user")
        setPrompt("")
        try {
            setIsLoading(true)
            setIsError(false)
            const res = await AIResponse(text)
            setIsLoading(false)
            addToConversation(res, "ai")
        } catch {
            setIsError(true)
            setIsLoading(false)
        }
    }

    const addToConversation = async (content: string, which: Which) => {
        let data: Message[] | null = await localforage.getItem("conversation")
        if (data === null) {
            await localforage.setItem("conversation", []);
            data = await localforage.getItem("conversation")
        }

        const message: Message = {
            messageContent: content,
            type: which
        }

        data?.push(message)
        await localforage.setItem("conversation", data)
        setConversationStorage(data)
    }

    const clearConversation = async () => {
        await localforage.setItem("conversation", [])
    }

    return (
        <div className="bg-bg h-[400px] p-2 flex flex-col">

            <div className="flex-1 overflow-auto">

            </div>

            <div className="relative" data-selector="chatInput">
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="bg-[#303030] font-sans rounded-md focus:outline-none block w-full mt-2 py-2 pl-2 pr-9 resize-none"
                    placeholder="Ask Anything"
                />
                <SendButton isDisabled={isDisabled} onClick={onBtnClick} />
            </div>
        </div>
    )
}