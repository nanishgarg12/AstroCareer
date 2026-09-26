import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "../components/Layout";
import { api, unwrap } from "../lib/api";

type AuthProps = { register?: boolean };

export function Auth({ register = false }: AuthProps) {
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      const response = await api.post(`/auth/${register ? "register" : "login"}`, Object.fromEntries(form));
      localStorage.setItem("token", unwrap(response).token);
      navigate("/profile");
    } catch (err: any) {
      setError(err.response?.data?.error?.message || "Unable to continue");
    }
  };

  return <Layout><form className="form" onSubmit={submit}>
    <h1>{register ? "Create account" : "Welcome back"}</h1>
    {register && <input name="name" placeholder="Name" required />}
    <input name="email" type="email" placeholder="Email" required />
    <input name="password" type="password" placeholder="Password (8+ characters)" required />
    <button type="submit">{register ? "Register" : "Login"}</button>
    {error && <p className="error">{error}</p>}
  </form></Layout>;
}
