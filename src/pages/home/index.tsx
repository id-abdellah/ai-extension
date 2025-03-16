import { Link } from "react-router-dom";

export default function Home() {

    return (
        <div className="flex flex-col items-center gap-2 p-2 *:block *:bg-surface *:text-sm *:p-3 *:rounded-lg *:w-[200px] *:border-[2px] *:border-transparent *:transition-all hover:*:border-surface hover:*:bg-transparent">

            <Link to="/chat">
                Chat wit AI
            </Link>

            <Link to="/explain">
                Explain a problem
            </Link>

        </div>
    )
}