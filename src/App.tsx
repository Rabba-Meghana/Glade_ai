import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import WarRoom from './pages/WarRoom'
import CaseDetail from './pages/CaseDetail'
import AgentOrchestration from './pages/AgentOrchestration'
import EvalDashboard from './pages/EvalDashboard'
import './index.css'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/war-room" replace />} />
          <Route path="war-room" element={<WarRoom />} />
          <Route path="case/:id" element={<CaseDetail />} />
          <Route path="case/:id/agents" element={<AgentOrchestration />} />
          <Route path="eval" element={<EvalDashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
