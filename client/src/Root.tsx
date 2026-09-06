import { Routes, HashRouter as Router, Route, Navigate} from "react-router-dom"
import { App } from "./App"
import { Chat } from "./components/Chat"


export const Root = () => (
  <Router>
    <Routes>
      <Route path="/" element={<App />}>
        <Route index element={<Chat />} />
        <Route path="rooms/:roomId" element={<Chat />} />

        <Route path="chat" element={<Navigate to="/" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  </Router>
)
