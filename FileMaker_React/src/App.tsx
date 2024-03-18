import { Route, BrowserRouter as Router, Routes } from "react-router-dom"
import MyPage from "./pages/mypage"
import { Index } from "./pages/Index"
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <Router>
      <ToastContainer />
			<Routes>
        <Route path="/mypage" element={<MyPage />} />
        <Route path="/" element={<Index />} />
      </Routes>
    </Router>
  )
}

export default App
