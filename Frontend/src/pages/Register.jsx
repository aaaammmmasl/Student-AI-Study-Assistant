import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleRegister = async () => {
    try {
      setError("");

      const res = await api.post("api/auth/register", {
        email,
        password,
      });

      localStorage.setItem("token", res.data.token);

      navigate("/");
    } catch (err) {
      setError("Registration failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white">
      <div className="w-[350px] p-6 bg-zinc-900 border border-white/10 rounded-2xl">
        <h1 className="text-xl font-bold mb-4">Register</h1>

        {error && <p className="text-red-400 text-sm mb-3">{error}</p>}

        <input
          className="w-full mb-3 p-2 bg-zinc-800 rounded"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="w-full mb-4 p-2 bg-zinc-800 rounded"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleRegister}
          className="w-full bg-lime-400 text-black py-2 rounded-xl font-semibold"
        >
          Create account
        </button>
      </div>
    </div>
  );
}
