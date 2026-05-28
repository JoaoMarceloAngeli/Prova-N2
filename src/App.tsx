import { useState } from "react";

type Page = "home" | "sgcursos";
type SubPage =
  | "trilhas"
  | "cursos"
  | "modulos"
  | "aulas"
  | "usuarios"
  | "assinaturas"
  | "certificados";

const subPages: { label: string; key: SubPage }[] = [
  { label: "Trilhas", key: "trilhas" },
  { label: "Cursos", key: "cursos" },
  { label: "Módulos", key: "modulos" },
  { label: "Aulas", key: "aulas" },
  { label: "Usuários", key: "usuarios" },
  { label: "Assinaturas", key: "assinaturas" },
  { label: "Certificados", key: "certificados" },
];

export default function App() {
  const [page, setPage] = useState<Page>("home");
  const [sub, setSub] = useState<SubPage>("trilhas");

  return (
    <>
      {/* Navbar */}
      <nav className="navbar bg-white border-bottom shadow-sm px-4 py-2">
        <span className="fw-bold fs-5">SG Cursos</span>
        <div className="d-flex gap-3 ms-4">
          <button
            className={`btn btn-link p-0 text-decoration-none ${
              page === "home" ? "fw-bold text-dark" : "text-primary"
            }`}
            onClick={() => setPage("home")}
          >
            Home
          </button>
          <button
            className={`btn btn-link p-0 text-decoration-none ${
              page === "sgcursos" ? "fw-bold text-dark" : "text-primary"
            }`}
            onClick={() => setPage("sgcursos")}
          >
            SG Cursos
          </button>
        </div>
      </nav>

      {/* Content */}
      <main className="container py-5">
        {page === "home" && (
          <div className="text-center py-5">
            <h2 className="fw-bold">Bem-vindo ao Dev.JM</h2>
          </div>
        )}

        {page === "sgcursos" && (
          <>
            {/* Sub-tabs */}
            <ul className="nav nav-tabs mb-4">
              {subPages.map((s) => (
                <li className="nav-item" key={s.key}>
                  <button
                    className={`nav-link ${sub === s.key ? "active" : ""}`}
                    onClick={() => setSub(s.key)}
                  >
                    {s.label}
                  </button>
                </li>
              ))}
            </ul>

            {/* Each sub-page shows only its title */}
            <h3 className="fw-semibold">
              {subPages.find((s) => s.key === sub)?.label}
            </h3>
          </>
        )}
      </main>
    </>
  );
}
