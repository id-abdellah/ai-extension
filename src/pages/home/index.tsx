import { BotMessageSquare } from "lucide-react";
import { Link } from "react-router-dom";

export default function Home() {

    return (
        <div className="flex items-center justify-center gap-2 p-3 *:flex *:gap-2 *:justify-between *:items-center *:bg-surface *:text-sm *:font-medium *:p-3 *:rounded-lg *:w-[200px] *:border-[2px] *:border-transparent *:transition-all hover:*:border-surface hover:*:bg-transparent">

            <Link to="/chat">
                <span>
                    Chat wit AI
                </span>
                <span><BotMessageSquare size={18} /></span>
            </Link>

        </div>
    )
}