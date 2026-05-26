import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Login({ onAuthChange }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      setError("");
      setLoading(true);

      const res = await api.post("/api/auth/login", {
        email,
        password,
      });

      const token = res.data?.token;

      if (!token) {
        setError("Login failed: no token received");
        return;
      }

      localStorage.setItem("token", token);
      onAuthChange?.();
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
      <div className="w-[350px] rounded-2xl border border-white/10 bg-zinc-900 p-6">
        <h1 className="mb-4 text-xl font-bold">Login</h1>

        {error && <p className="mb-3 text-sm text-red-400">{error}</p>}

        <input
          className="mb-3 w-full rounded bg-zinc-800 p-2"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
        />

        <input
          className="mb-4 w-full rounded bg-zinc-800 p-2"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
        />

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full rounded-xl bg-lime-400 py-2 font-semibold text-black disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <button
          onClick={() => navigate("/register")}
          disabled={loading}
          className="mt-3 w-full text-sm text-zinc-400 hover:text-white disabled:cursor-not-allowed"
        >
          Create new account
        </button>
      </div>
    </div>
  );
}
