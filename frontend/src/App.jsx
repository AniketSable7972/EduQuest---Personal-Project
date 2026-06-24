import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import JoinContest from './pages/JoinContest';
import HostCreateContest from './pages/HostCreateContest';
import HostLobby from './pages/HostLobby';
import HostAnalytics from './pages/HostAnalytics';
import ContestWaiting from './pages/ContestWaiting';
import ContestPlay from './pages/ContestPlay';
import ContestResults from './pages/ContestResults';
import Analytics from './pages/Analytics';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/join" element={<ProtectedRoute><JoinContest /></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />

          <Route path="/host/create" element={<ProtectedRoute><HostCreateContest /></ProtectedRoute>} />
          <Route path="/host/lobby/:roomId" element={<ProtectedRoute><HostLobby /></ProtectedRoute>} />
          <Route path="/host/analytics/:roomId" element={<ProtectedRoute><HostAnalytics /></ProtectedRoute>} />

          <Route path="/contest/:roomId/waiting" element={<ProtectedRoute><ContestWaiting /></ProtectedRoute>} />
          <Route path="/contest/:roomId/play" element={<ProtectedRoute><ContestPlay /></ProtectedRoute>} />
          <Route path="/contest/:roomId/results" element={<ProtectedRoute><ContestResults /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
