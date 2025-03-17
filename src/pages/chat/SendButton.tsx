import { ArrowUp, LoaderCircle } from "lucide-react"

type Props = {
    isDisabled: () => boolean
    onClick: () => void
    isLoading: boolean
}

export default function SendButton({ isDisabled, onClick, isLoading }: Props) {
    return (
        <button
            onClick={onClick}
            disabled={isDisabled()}
            className="grid place-content-center absolute top-1/2 -translate-y-[9px] right-2 bg-white text-black size-7 rounded-full hover:brightness-75 transition-all active:scale-95 disabled:bg-on_surface/40">
            {
                isLoading
                    ?
                    <LoaderCircle size={14} className="transition-all animate-spin" />
                    :
                    <ArrowUp size={22} color={`${isDisabled() ? "#303030" : "black"}`} />
            }
        </button>
    )
}