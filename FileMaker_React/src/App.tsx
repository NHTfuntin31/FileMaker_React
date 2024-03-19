import { Route, BrowserRouter as Router, Routes } from "react-router-dom"
import MyPage from "./pages/mypage"
import { Index } from "./pages/Index"
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'

const queryClient = new QueryClient()

function App() {
  return (
    <Router>
      <ToastContainer />
      <QueryClientProvider client={queryClient}>
        <Routes>
          <Route path="/mypage" element={<MyPage />} />
          <Route path="/" element={<Index />} />
        </Routes>
      </QueryClientProvider>
    </Router>
  )
}

export default App
