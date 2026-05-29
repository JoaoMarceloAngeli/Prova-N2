import { useState } from "react";
import type { User } from "./types";

interface LoginPageProps {
  users: User[];
  onLogin: (email: string, password: string) => boolean;
  onRegister: (data: { name: string; email: string; password: string }) => void;
}

export default function LoginPage({ users, onLogin, onRegister }: LoginPageProps) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  function switchMode(next: "login" | "register") {
    setMode(next);
    setError("");
  }

  function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault();
    setError("");

    if (mode === "login") {
      const ok = onLogin(email, password);
      if (!ok) setError("E-mail ou senha incorretos.");
    } else {
      if (password.length < 6) {
        setError("A senha deve ter pelo menos 6 caracteres.");
        return;
      }
      if (password !== confirmPassword) {
        setError("As senhas não coincidem.");
        return;
      }
      if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
        setError("Este e-mail já está cadastrado.");
        return;
      }
      onRegister({ name, email, password });
    }
  }

  return (
    <div className="jm-login-bg d-flex align-items-center justify-content-center min-vh-100">
      <style>{`
        .jm-login-bg {
          background: linear-gradient(135deg, #0d1b4b 0%, #1a3a8f 50%, #1565c0 100%);
        }
        .jm-card {
          background: #fff;
          border-radius: 16px;
          box-shadow: 0 20px 60px rgba(13, 27, 75, 0.45);
          width: 100%;
          max-width: 420px;
          padding: 2.5rem 2rem;
        }
        .jm-brand-title {
          font-size: 2rem;
          font-weight: 800;
          letter-spacing: -0.5px;
        }
        .jm-brand-jm { color: #0d1b4b; }
        .jm-brand-cursos { color: #1565c0; }
        .jm-cap { font-size: 2.4rem; line-height: 1; }
        .jm-divider {
          height: 3px;
          width: 48px;
          background: linear-gradient(90deg, #0d1b4b, #1565c0);
          border-radius: 2px;
          margin: 0 auto 1.5rem;
        }
        .jm-toggle-btn {
          background: #f0f4ff;
          border: none;
          border-radius: 8px;
          padding: 0.45rem 1.2rem;
          font-weight: 600;
          font-size: 0.92rem;
          color: #1a3a8f;
          transition: all 0.2s;
        }
        .jm-toggle-btn.active {
          background: linear-gradient(135deg, #1a3a8f, #1565c0);
          color: #fff;
          box-shadow: 0 2px 10px rgba(21, 101, 192, 0.35);
        }
        .jm-toggle-btn:hover:not(.active) { background: #dce8ff; }
        .jm-input {
          border: 1.5px solid #d0d9ef;
          border-radius: 8px;
          padding: 0.6rem 0.85rem;
          font-size: 0.95rem;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .jm-input:focus {
          border-color: #1565c0;
          box-shadow: 0 0 0 3px rgba(21, 101, 192, 0.15);
          outline: none;
        }
        .jm-submit-btn {
          background: linear-gradient(135deg, #1a3a8f, #1565c0);
          border: none;
          border-radius: 8px;
          color: #fff;
          font-weight: 700;
          font-size: 1rem;
          padding: 0.65rem;
          width: 100%;
          transition: opacity 0.2s, transform 0.1s;
          box-shadow: 0 4px 15px rgba(21, 101, 192, 0.35);
        }
        .jm-submit-btn:hover { opacity: 0.92; transform: translateY(-1px); }
        .jm-submit-btn:active { transform: translateY(0); }
        .jm-label {
          font-size: 0.85rem;
          font-weight: 600;
          color: #1a3a8f;
          margin-bottom: 0.3rem;
        }
        .jm-switch-text { font-size: 0.87rem; color: #6b7a9a; }
        .jm-switch-link {
          color: #1565c0;
          font-weight: 600;
          cursor: pointer;
          text-decoration: none;
          background: none;
          border: none;
          padding: 0;
          font-size: 0.87rem;
        }
        .jm-switch-link:hover { text-decoration: underline; }
        .jm-error {
          background: #fff0f0;
          border: 1px solid #f5c2c7;
          border-radius: 8px;
          color: #842029;
          font-size: 0.85rem;
          padding: 0.55rem 0.85rem;
        }
      `}</style>

      <div className="jm-card">
        <div className="text-center mb-1">
          <div className="jm-cap">🎓</div>
          <div className="jm-brand-title mt-1">
            <span className="jm-brand-jm">JM</span>{" "}
            <span className="jm-brand-cursos">Cursos</span>
          </div>
          <p className="text-muted mt-1 mb-3" style={{ fontSize: "0.83rem" }}>
            Plataforma de ensino online
          </p>
        </div>

        <div className="jm-divider" />

        <div className="d-flex gap-2 justify-content-center mb-4">
          <button
            className={`jm-toggle-btn ${mode === "login" ? "active" : ""}`}
            onClick={() => switchMode("login")}
          >
            Entrar
          </button>
          <button
            className={`jm-toggle-btn ${mode === "register" ? "active" : ""}`}
            onClick={() => switchMode("register")}
          >
            Criar conta
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {mode === "register" && (
            <div className="mb-3">
              <label className="jm-label d-block">Nome completo</label>
              <input
                type="text"
                className="jm-input w-100"
                placeholder="Seu nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}

          <div className="mb-3">
            <label className="jm-label d-block">E-mail</label>
            <input
              type="email"
              className="jm-input w-100"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="jm-label d-block">Senha</label>
            <input
              type="password"
              className="jm-input w-100"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {mode === "register" && (
            <div className="mb-3">
              <label className="jm-label d-block">Confirmar senha</label>
              <input
                type="password"
                className="jm-input w-100"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          )}

          {error && <div className="jm-error mb-3">{error}</div>}

          <button type="submit" className="jm-submit-btn mt-1">
            {mode === "login" ? "Entrar na plataforma" : "Criar minha conta"}
          </button>
        </form>

        <div className="text-center mt-3">
          <span className="jm-switch-text">
            {mode === "login" ? "Não tem uma conta? " : "Já tem uma conta? "}
          </span>
          <button
            className="jm-switch-link"
            onClick={() => switchMode(mode === "login" ? "register" : "login")}
          >
            {mode === "login" ? "Criar conta" : "Entrar"}
          </button>
        </div>
      </div>
    </div>
  );
}
