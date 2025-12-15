import React from 'react';
import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom';
import './App.css';
import DashboardPage from './pages/DashboardPage';
import ProjectsPage from './pages/ProjectsPage';
import TasksPage from './pages/TasksPage';
import SessionsPage from './pages/SessionsPage';
import ReportsPage from './pages/ReportsPage';

// PUBLIC_INTERFACE
function App() {
  /** Root app with sidebar navigation and routed pages */
  return (
    <BrowserRouter>
      <div className="app-shell" role="application" aria-label="Freelancer Time Tracker">
        <aside className="sidebar">
          <div className="brand" aria-label="Brand">
            <span className="dot" />
            FreeTrack
          </div>
          <nav className="nav" aria-label="Main navigation">
            <NavLink to="/" end>Dashboard</NavLink>
            <NavLink to="/projects">Projects</NavLink>
            <NavLink to="/tasks">Tasks</NavLink>
            <NavLink to="/sessions">Sessions</NavLink>
            <NavLink to="/reports">Reports</NavLink>
          </nav>
        </aside>
        <main>
          <header className="header">
            <div>
              <span className="badge gray">Light</span>
            </div>
            <div className="muted">Freelancer Time Tracking & Analytics</div>
          </header>
          <div className="container">
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/projects" element={<ProjectsPage />} />
              <Route path="/tasks" element={<TasksPage />} />
              <Route path="/sessions" element={<SessionsPage />} />
              <Route path="/reports" element={<ReportsPage />} />
            </Routes>
          </div>
          <footer className="footer">© {new Date().getFullYear()} FreeTrack • Accents: #3b82f6 & #06b6d4</footer>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
