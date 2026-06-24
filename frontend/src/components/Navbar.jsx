import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Trophy, User, BarChart3, Plus, LogIn } from 'lucide-react';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="navbar-brand">
          <Trophy size={28} />
          <span>EduQuest</span>
        </Link>

        {user ? (
          <div className="navbar-links">
            <Link to="/dashboard"><BarChart3 size={18} /> Dashboard</Link>
            <Link to="/join"><LogIn size={18} /> Join Contest</Link>
            <Link to="/host/create"><Plus size={18} /> Host</Link>
            <Link to="/analytics"><BarChart3 size={18} /> Analytics</Link>
            <Link to="/profile"><User size={18} /> Profile</Link>
            <button className="btn-logout" onClick={handleLogout}>
              <LogOut size={18} /> Logout
            </button>
          </div>
        ) : (
          <div className="navbar-links">
            <Link to="/login">Login</Link>
            <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
          </div>
        )}
      </div>
    </nav>
  );
}
