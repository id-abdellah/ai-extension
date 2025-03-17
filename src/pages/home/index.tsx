import { BotMessageSquare, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export default function Home() {

    return (
        <div className="flex items-center gap-2 p-2 *:flex *:justify-between *:items-center *:bg-surface *:text-sm *:p-3 *:rounded-lg *:w-[200px] *:border-[2px] *:border-transparent *:transition-all hover:*:border-surface hover:*:bg-transparent">

            <Link to="/chat">
                <span>
                    Chat wit AI
                </span>
                <span><BotMessageSquare size={18} /></span>
            </Link>

            <Link to="/explain">
                <span>
                    Explain a problem
                </span>
                <span><Sparkles size={18} /></span>
            </Link>

        </div>
    )
}