import { Route, BrowserRouter as Router, Routes } from "react-router-dom"
import Login from "./pages/login"
import MyPage from "./pages/mypage"
import Testzero from "./pages/TestPage_01"

function App() {

  return (
    <Router>
			<Routes>
        <Route path="/" element={<Login />} />
        <Route path="/mypage" element={<MyPage />} />
        <Route path="/testzero" element={<Testzero />} />
      </Routes>
    </Router>
  )
}

export default App
