import { Route, BrowserRouter as Router, Routes } from "react-router-dom"
import Login from "./pages/login"
import MyPage from "./pages/mypage"
import Testzero from "./pages/TestPage_01"
import Testiti from "./pages/TestPage_02"
import Register from "./pages/register"

function App() {

  return (
    <Router>
			<Routes>
        <Route path="/" element={<Login />} />
        <Route path="/mypage" element={<MyPage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/testzero" element={<Testzero />} />
        <Route path="/testiti" element={<Testiti />} />
      </Routes>
    </Router>
  )
}

export default App
