import { useState, useEffect } from "react";
import type { Trilha, Categoria, TrilhaCurso, Curso } from "../../models";
import { trilhaService } from "../../services/trilhaService";
import { categoriaService } from "../../services/categoriaService";
import { trilhaCursoService } from "../../services/trilhaCursoService";
import { cursoService } from "../../services/cursoService";

export default function TrilhasStudentPage() {
  const [trilhas, setTrilhas] = useState<Trilha[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [trilhasCursos, setTrilhasCursos] = useState<TrilhaCurso[]>([]);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandida, setExpandida] = useState<string | null>(null);
  const [filtroCategoria, setFiltroCategoria] = useState("");

  useEffect(() => {
    Promise.all([
      trilhaService.getAll(), categoriaService.getAll(),
      trilhaCursoService.getAll(), cursoService.getAll(),
    ]).then(([t, c, tc, cs]) => {
      setTrilhas(t); setCategorias(c); setTrilhasCursos(tc); setCursos(cs);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtradas = filtroCategoria
    ? trilhas.filter(t => t.idCategoria === filtroCategoria)
    : trilhas;

  if (loading) return <div className="text-center py-5"><div className="spinner-border text-primary" /></div>;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h5 className="fw-bold mb-0" style={{ color: "#0d1b4b" }}>Trilhas de Aprendizado</h5>
        <select className="form-select form-select-sm" style={{ maxWidth: 200 }} value={filtroCategoria} onChange={e => setFiltroCategoria(e.target.value)}>
          <option value="">Todas as categorias</option>
          {categorias.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
        </select>
      </div>

      {filtradas.length === 0 ? (
        <div className="text-center py-5 text-muted">
          <i className="bi bi-map fs-1 d-block mb-2 opacity-50" />
          <p>Nenhuma trilha disponível ainda.</p>
        </div>
      ) : (
        <div className="row g-3">
          {filtradas.map(t => {
            const cat = categorias.find(c => c.id === t.idCategoria);
            const cursosNaTrilha = trilhasCursos
              .filter(tc => tc.idTrilha === t.id)
              .sort((a, b) => a.ordem - b.ordem)
              .map(tc => cursos.find(c => c.id === tc.idCurso))
              .filter(Boolean) as Curso[];
            const aberta = expandida === t.id;

            return (
              <div key={t.id} className="col-12 col-md-6">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div>
                        <h6 className="fw-bold mb-1" style={{ color: "#0d1b4b" }}>{t.titulo}</h6>
                        {cat && (
                          <span className="badge" style={{ background: "linear-gradient(135deg,#1a3a8f,#1565c0)", fontSize: ".72rem" }}>
                            {cat.nome}
                          </span>
                        )}
                      </div>
                      <span className="badge bg-light text-muted border">{cursosNaTrilha.length} cursos</span>
                    </div>
                    {t.descricao && <p className="text-muted small mb-2">{t.descricao}</p>}
                    <button
                      className="btn btn-sm btn-outline-primary w-100"
                      onClick={() => setExpandida(aberta ? null : t.id)}
                    >
                      {aberta ? "Ocultar cursos" : "Ver cursos da trilha"}
                    </button>
                    {aberta && cursosNaTrilha.length > 0 && (
                      <div className="mt-3">
                        {cursosNaTrilha.map((c, i) => (
                          <div key={c.id} className="d-flex align-items-center gap-2 p-2 rounded mb-1" style={{ background: "#f8fafc" }}>
                            <span className="d-flex align-items-center justify-content-center rounded-circle text-white fw-bold flex-shrink-0"
                              style={{ width: 24, height: 24, background: "#1565c0", fontSize: ".72rem" }}>
                              {i + 1}
                            </span>
                            <div className="flex-grow-1">
                              <div className="fw-medium small">{c.titulo}</div>
                              <div className="text-muted" style={{ fontSize: ".72rem" }}>{c.nivel}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
