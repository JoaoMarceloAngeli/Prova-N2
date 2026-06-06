import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { usuarioService } from "../services/usuarioService";
import { assinaturaService } from "../services/assinaturaService";

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  const { login, register, usuario } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (usuario) {
      navigate(usuario.role === "admin" ? "/admin" : "/student", { replace: true });
    }
  }, [usuario, navigate]);

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault();
    setErro("");
    setLoading(true);
    try {
      if (mode === "login") {
        const ok = await login(email, senha);
        if (!ok) { setErro("E-mail ou senha incorretos."); return; }
        const allUsers = await usuarioService.getAll();
        const user = allUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (user?.role === "admin") {
          navigate("/admin");
        } else if (user) {
          const subs = await assinaturaService.getAtiva(user.id);
          navigate(subs.length > 0 ? "/student" : "/checkout");
        }
      } else {
        if (senha.length < 6) { setErro("A senha deve ter pelo menos 6 caracteres."); return; }
        if (senha !== confirmar) { setErro("As senhas não coincidem."); return; }
        const newUser = await register(nome, email, senha);
        if (newUser.role === "admin") navigate("/admin");
        else navigate("/checkout");
      }
    } catch {
      setErro("Erro ao conectar. Verifique se o servidor está rodando.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="d-flex align-items-center justify-content-center min-vh-100"
      style={{ background: "linear-gradient(135deg,#0d1b4b 0%,#1a3a8f 50%,#1565c0 100%)" }}
    >
      <style>{`
        .jm-card { background:#fff; border-radius:16px; box-shadow:0 20px 60px rgba(13,27,75,.45); width:100%; max-width:420px; padding:2.5rem 2rem; }
        .jm-input { border:1.5px solid #d0d9ef; border-radius:8px; padding:.6rem .85rem; font-size:.95rem; width:100%; transition:border-color .2s,box-shadow .2s; outline:none; }
        .jm-input:focus { border-color:#1565c0; box-shadow:0 0 0 3px rgba(21,101,192,.15); }
        .jm-toggle { background:#f0f4ff; border:none; border-radius:8px; padding:.45rem 1.2rem; font-weight:600; font-size:.92rem; color:#1a3a8f; }
        .jm-toggle.active { background:linear-gradient(135deg,#1a3a8f,#1565c0); color:#fff; }
        .jm-btn { background:linear-gradient(135deg,#1a3a8f,#1565c0); border:none; border-radius:8px; color:#fff; font-weight:700; font-size:1rem; padding:.65rem; width:100%; }
      `}</style>
      <div className="jm-card">
        <div className="d-flex flex-column align-items-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 48" width="140" height="56" style={{ marginBottom: "0.5rem" }}>
            <defs>
              <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: "#1a3a8f" }} />
                <stop offset="100%" style={{ stopColor: "#1565c0" }} />
              </linearGradient>
            </defs>
            <rect width="48" height="48" rx="10" fill="url(#logoGrad)" />
            <text x="24" y="50%" dominantBaseline="middle" textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight="800" fontSize="20" fill="#ffffff" letterSpacing="-1">JM</text>
            <text x="62" y="30" fontFamily="Arial, sans-serif" fontWeight="800" fontSize="16" fill="#1a3a8f">JM</text>
            <text x="81" y="30" fontFamily="Arial, sans-serif" fontWeight="400" fontSize="16" fill="#1565c0">Cursos</text>
            <text x="62" y="44" fontFamily="Arial, sans-serif" fontWeight="400" fontSize="8" fill="#6b7a9a" letterSpacing="2">PLATAFORMA EAD</text>
          </svg>
        </div>
        <div className="d-flex gap-2 justify-content-center mb-4">
          <button className={`jm-toggle ${mode === "login" ? "active" : ""}`} onClick={() => { setMode("login"); setErro(""); }}>Entrar</button>
          <button className={`jm-toggle ${mode === "register" ? "active" : ""}`} onClick={() => { setMode("register"); setErro(""); }}>Criar conta</button>
        </div>
        <form onSubmit={handleSubmit}>
          {mode === "register" && (
            <div className="mb-3">
              <label className="d-block fw-semibold mb-1" style={{ fontSize: ".85rem", color: "#1a3a8f" }}>Nome completo</label>
              <input className="jm-input" value={nome} onChange={e => setNome(e.target.value)} required />
            </div>
          )}
          <div className="mb-3">
            <label className="d-block fw-semibold mb-1" style={{ fontSize: ".85rem", color: "#1a3a8f" }}>E-mail</label>
            <input type="email" className="jm-input" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="mb-3">
            <label className="d-block fw-semibold mb-1" style={{ fontSize: ".85rem", color: "#1a3a8f" }}>Senha</label>
            <input type="password" className="jm-input" value={senha} onChange={e => setSenha(e.target.value)} required />
          </div>
          {mode === "register" && (
            <div className="mb-3">
              <label className="d-block fw-semibold mb-1" style={{ fontSize: ".85rem", color: "#1a3a8f" }}>Confirmar senha</label>
              <input type="password" className="jm-input" value={confirmar} onChange={e => setConfirmar(e.target.value)} required />
            </div>
          )}
          {erro && (
            <div className="rounded-2 p-2 mb-3 small" style={{ background: "#fff0f0", border: "1px solid #f5c2c7", color: "#842029" }}>{erro}</div>
          )}
          <button type="submit" className="jm-btn" disabled={loading}>
            {loading ? "Aguarde..." : mode === "login" ? "Entrar na plataforma" : "Criar minha conta"}
          </button>
        </form>
        <div className="text-center mt-3" style={{ fontSize: ".87rem", color: "#6b7a9a" }}>
          {mode === "login" ? "Não tem uma conta? " : "Já tem uma conta? "}
          <button
            className="border-0 bg-transparent p-0 fw-semibold"
            style={{ color: "#1565c0", cursor: "pointer" }}
            onClick={() => { setMode(mode === "login" ? "register" : "login"); setErro(""); }}
          >
            {mode === "login" ? "Criar conta" : "Entrar"}
          </button>
        </div>
      </div>
    </div>
  );
}
