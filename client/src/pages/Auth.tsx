import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { api, unwrap } from "../lib/api";

type AuthProps = { register?: boolean };

export function Auth({ register = false }: AuthProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSignup, setIsSignup] = useState(register || new URLSearchParams(location.search).get("mode") === "signup");
  const [error, setError] = useState("");

  React.useEffect(() => {
    setIsSignup(register || new URLSearchParams(location.search).get("mode") === "signup");
    setError("");
  }, [register, location.search]);

  const changeMode = (signup: boolean) => {
    setIsSignup(signup);
    setError("");
    navigate(signup ? "/login?mode=signup" : "/login", { replace: true });
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      const response = await api.post(`/auth/${isSignup ? "register" : "login"}`, Object.fromEntries(form));
      localStorage.setItem("token", unwrap(response).token);
      navigate("/profile");
    } catch (err: any) {
      setError(err.response?.data?.error?.message || "Unable to continue");
    }
  };

  return <div className="auth-page">
    <Link className="auth-brand" to="/">✦ AstroCareer</Link>
    <div className="auth-layout">
      <aside className="auth-intro"><p className="eyebrow">YOUR FUTURE AWAITS</p><h1>Make your next move a meaningful one.</h1><p>Explore your strengths, prepare for opportunities, and create a career journey that is entirely your own.</p><div className="auth-stars" aria-hidden="true">✦　✧　✦</div></aside>
      <section className="auth-card" aria-labelledby="auth-title">
        <div className="auth-tabs" role="tablist" aria-label="Account options"><button className={!isSignup ? "active" : ""} type="button" onClick={() => changeMode(false)}>Log in</button><button className={isSignup ? "active" : ""} type="button" onClick={() => changeMode(true)}>Sign up</button></div>
        <div className="auth-content"><p className="eyebrow">{isSignup ? "START YOUR JOURNEY" : "WELCOME BACK"}</p><h2 id="auth-title">{isSignup ? "Create your account" : "Good to see you again"}</h2><p className="auth-subtitle">{isSignup ? "It only takes a moment to get started." : "Log in to continue building your future."}</p>
          <form onSubmit={submit}>{isSignup && <label>Name<input name="name" placeholder="Your name" required /></label>}<label>Email address<input name="email" type="email" placeholder="you@example.com" required /></label><label>Password<input name="password" type="password" minLength={8} placeholder="At least 8 characters" required /></label><button className="button auth-submit" type="submit">{isSignup ? "Create account" : "Log in"} <span>→</span></button>{error && <p className="error" role="alert">{error}</p>}</form>
          <p className="auth-switch">{isSignup ? "Already have an account?" : "New to AstroCareer?"} <button type="button" onClick={() => changeMode(!isSignup)}>{isSignup ? "Log in" : "Sign up"}</button></p>
        </div>
      </section>
    </div>
  </div>;
}
