import { Link } from "react-router-dom";

export function Layout({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem("token");
  return (
    <>
      <nav>
        <Link to="/">✦ AstroCareer</Link>
        <Link to="/profile">Profile</Link><Link to="/resume">Resume</Link><Link to="/careers">Careers</Link>
        <Link to="/career-readiness">Readiness</Link>
        <Link to="/assessment">Assessment</Link><Link to="/interview">Interview</Link><Link to="/simulator">Simulator</Link>
        <Link to="/roadmap">Roadmap</Link><Link to="/stars-vs-skills">Stars vs Skills</Link>
        {!token ? <><Link to="/login">Login</Link><Link to="/register">Register</Link></> : <button onClick={() => { localStorage.removeItem("token"); window.location.href = "/login"; }}>Logout</button>}
      </nav>
      <main>{children}</main>
    </>
  );
}
