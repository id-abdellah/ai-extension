import { Brain } from "lucide-react"
import { Route, Routes } from "react-router-dom"
import Home from "./pages/home"
import ChatAI from "./pages/chat"

export default function Popup() {

   return (
      <div className="w-[380px] h-[250px]" id="extensionWrapper" data-theme="dark">

         <nav className="bg-surface py-3 px-3 flex justify-between items-center font-semibold text-md">
            <div><Brain /></div>
            <div>ReadEase</div>
         </nav>

         <Routes>
            {/* <Route path="/index.html" element={<Home />} /> */}
            <Route path="/" element={<Home />} />
            <Route path="/chat" element={<ChatAI />} />
         </Routes>

      </div>
   )
}