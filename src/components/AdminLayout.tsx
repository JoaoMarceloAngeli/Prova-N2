import { NavLink, Outlet } from "react-router-dom";
import Navbar from "./Navbar";

const links = [
  { to: "/admin/categorias", label: "Categorias", icon: "bi-tag-fill" },
  { to: "/admin/cursos", label: "Cursos", icon: "bi-mortarboard-fill" },
  { to: "/admin/trilhas", label: "Trilhas", icon: "bi-map-fill" },
  { to: "/admin/usuarios", label: "Usuários", icon: "bi-people-fill" },
  { to: "/admin/planos", label: "Planos", icon: "bi-credit-card-fill" },
  { to: "/admin/assinaturas", label: "Assinaturas", icon: "bi-receipt" },
  { to: "/admin/certificados", label: "Certificados", icon: "bi-award-fill" },
  { to: "/admin/avaliacoes", label: "Avaliações", icon: "bi-star-fill" },
];

export default function AdminLayout() {
  return (
    <div className="d-flex flex-column" style={{ minHeight: "100vh" }}>
      <Navbar />
      <div className="d-flex flex-grow-1">
        <nav
          className="bg-white border-end d-flex flex-column py-3"
          style={{ width: 220, flexShrink: 0 }}
        >
          <div className="px-3 mb-2">
            <span
              className="text-uppercase fw-semibold text-muted"
              style={{ fontSize: "0.68rem", letterSpacing: "0.08em" }}
            >
              Administração
            </span>
          </div>
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `d-flex align-items-center gap-2 px-3 py-2 mx-2 rounded-2 text-decoration-none small fw-medium mb-1 ${
                  isActive
                    ? "text-white"
                    : "text-secondary"
                }`
              }
              style={({ isActive }) =>
                isActive
                  ? { background: "linear-gradient(135deg,#1a3a8f,#1565c0)" }
                  : undefined
              }
            >
              <i className={`bi ${l.icon}`} />
              {l.label}
            </NavLink>
          ))}
        </nav>
        <main className="flex-grow-1 p-4" style={{ background: "#f8fafc" }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
