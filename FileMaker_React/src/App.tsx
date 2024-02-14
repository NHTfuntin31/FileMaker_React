import { Route, BrowserRouter as Router, Routes } from "react-router-dom"
import MyPage from "./pages/mypage"

function App() {

  return (
    <Router>
			<Routes>
        <Route path="/mypage" element={<MyPage />} />
      </Routes>
    </Router>
  )
}

export default App
