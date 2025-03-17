import { useEffect, useRef, useState } from "react";
import SendButton from "./SendButton";
import { AIResponse } from "../../api/api";
import localforage from "localforage";
import ReactMarkdown from "react-markdown"
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css"
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

type Which = "user" | "ai"

type Message = {
    messageContent: string
    type: Which
}

export default function ChatAI() {
    const navigate = useNavigate()

    /** inserted prompt & localforage stored conversations */
    const [prompt, setPrompt] = useState<string>("");
    const [converstaionStorage, setConversationStorage] = useState<null | Message[]>(null)

    /** for prompt fetching purpose */
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [, setIsError] = useState<boolean>(false)

    /** chat conversation element */
    const chatWrapperRef = useRef<null | HTMLDivElement>(null)

    useEffect(() => {
        /** always scroll to bottom in chat conversation element */
        if (chatWrapperRef.current) {
            const el = chatWrapperRef.current;
            const elChilds: ChildNode[] = Array.from(el.childNodes)
            if (elChilds.length !== 0) {
                const lastMessage = elChilds[elChilds.length - 1] as HTMLDivElement
                lastMessage.scrollIntoView({ behavior: "smooth" })
            }
        }

        /** bring stored conversation data in the localforage when the component is mounted */
        if (converstaionStorage) return;
        (async () => {
            setConversationStorage(await localforage.getItem("conversation"))
        })()
    }, [converstaionStorage])

    /** dicided if the send prompt button needs to be disabled or not */
    const isDisabled: () => boolean = () => prompt.length === 0 || isLoading;

    const onBtnClick = async () => {
        const text = prompt
        addToConversation(text, "user")
        setPrompt("")
        setIsLoading(true)
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

    /**
     * add conversation messages to the storage "localforage" one by one
     */
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

    /**
     * setting the "conversation" key in the localforage to empty array []
     */
    const clearConversation = async () => {
        if (!confirm("You wanna clear the conversation? ")) return
        await localforage.setItem("conversation", [])
        setConversationStorage([])
    }

    return (
        <div className="bg-bg h-[400px] px-2 pb-2 pt-0 flex flex-col" data-selector="chatConversation">
            <div className="flex gap-2 items-center justify-between py-[5px] mb-2">
                <ArrowLeft size={14} className="cursor-pointer transition-colors hover:brightness-90" onClick={() => navigate(-1)} />
                {
                    converstaionStorage?.length !== 0 && converstaionStorage !== null && <button className="block w-fit text-xs text-on_surface hover:underline" onClick={clearConversation}>Clear conversation</button>
                }
            </div>
            <div className="flex-1 overflow-auto flex flex-col gap-4" ref={chatWrapperRef}>
                {
                    converstaionStorage?.map((message: Message, i) => {
                        if (message.type === "user") {
                            return (
                                <div key={i} className="bg-surface p-3 rounded-md max-w-[80%] text-sm ml-auto">
                                    {message.messageContent}
                                </div>
                            )

                        } else if (message.type === "ai") {
                            return (
                                <div
                                    data-selector="generatedMDBody"
                                    key={i}>
                                    <ReactMarkdown rehypePlugins={[rehypeHighlight]}>{message.messageContent}</ReactMarkdown>
                                </div>
                            )
                        }
                    })
                }
            </div>

            <div className="relative" data-selector="chatInput">
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="bg-[#303030] font-sans rounded-md focus:outline-none block w-full mt-2 py-2 pl-2 pr-9 resize-none"
                    placeholder="Ask Anything"
                />
                <SendButton isDisabled={isDisabled} onClick={onBtnClick} isLoading={isLoading} />
            </div>
        </div>
    )
}