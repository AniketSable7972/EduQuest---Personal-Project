import { Link } from 'react-router-dom';
import { Trophy, Zap, Users, Brain } from 'lucide-react';
import Layout from '../components/Layout';
import './Home.css';

export default function Home() {
  return (
    <Layout>
      <section className="hero">
        <h1 className="hero-title">Learn. Compete. Conquer.</h1>
        <p className="hero-subtitle">
          EduQuest is an AI-powered quiz platform for engaging contests,
          real-time leaderboards, and detailed performance analytics.
        </p>
        <div className="hero-actions">
          <Link to="/register" className="btn btn-primary">Get Started</Link>
          <Link to="/login" className="btn btn-secondary">Login</Link>
        </div>
      </section>

      <section className="features grid-2">
        <div className="card feature-card">
          <Trophy className="feature-icon" />
          <h3>Live Contests</h3>
          <p>Join secure virtual rooms with unique Room IDs and compete in real time.</p>
        </div>
        <div className="card feature-card">
          <Brain className="feature-icon" />
          <h3>AI Questions</h3>
          <p>Generate quiz questions by topic, difficulty, and count automatically.</p>
        </div>
        <div className="card feature-card">
          <Zap className="feature-icon" />
          <h3>Flexible Timers</h3>
          <p>Per-question or full-contest timing modes for any assessment style.</p>
        </div>
        <div className="card feature-card">
          <Users className="feature-icon" />
          <h3>Analytics</h3>
          <p>Track accuracy, scores, ranks, and completion times per contest.</p>
        </div>
      </section>
    </Layout>
  );
}
