import { Route, BrowserRouter as Router, Routes } from "react-router-dom"
import MyPage from "./pages/mypage"
import { Index } from "./pages/Index"

function App() {
  return (
    <Router>
			<Routes>
        <Route path="/mypage" element={<MyPage />} />
        <Route path="/" element={<Index />} />
      </Routes>
    </Router>
  )
}

export default App
