import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { useEffect, useState } from "react";
import Login from "./pages/Login";
import Chat from "./pages/Chat";
import Register from "./pages/Register";

function App() {
  const [token, setToken] = useState(() => localStorage.getItem("token"));

  const syncAuth = () => {
    setToken(localStorage.getItem("token"));
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  const isAuth = !!token;

  useEffect(() => {
    window.addEventListener("storage", syncAuth);
    return () => window.removeEventListener("storage", syncAuth);
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/register"
          element={<Register onAuthChange={syncAuth} />}
        />
        <Route path="/login" element={<Login onAuthChange={syncAuth} />} />
        <Route
          path="/"
          element={
            isAuth ? (
              <Chat onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="*"
          element={<Navigate to={isAuth ? "/" : "/login"} replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
