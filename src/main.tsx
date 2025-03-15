import "./index.scss"
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from "react-router-dom"
import Popup from "./popup"

createRoot(document.getElementById('root')!).render(
  <>
    <BrowserRouter>
      <Popup />
    </BrowserRouter>
  </>,
)
