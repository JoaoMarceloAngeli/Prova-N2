import { useState } from "react";
import LoginPage from "./LoginPage";
import type { User, Trail, TrailCourse, Course, CourseVideo, CourseProgress, Plan, Subscription } from "./types";

type Page = "home" | "sgcursos";
type AdminSubPage = "trilhas" | "cursos" | "usuarios" | "planos" | "assinaturas" | "certificados";
type StudentSubPage = "trilhas" | "cursos" | "meu-plano" | "certificados";

function getYoutubeThumbnail(url: string): string | null {
  const m = url.match(/(?:youtu\.be\/|(?:www\.)?youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/);
  return m ? `https://img.youtube.com/vi/${m[1]}/mqdefault.jpg` : null;
}

const TRAIL_CATEGORIES = [
  "Tecnologia", "Negócios", "Design", "Marketing",
  "Desenvolvimento", "Saúde", "Educação", "Outro",
];

const adminSubPages: { label: string; key: AdminSubPage }[] = [
  { label: "Trilhas", key: "trilhas" },
  { label: "Cursos", key: "cursos" },
  { label: "Usuários", key: "usuarios" },
  { label: "Planos", key: "planos" },
  { label: "Assinaturas", key: "assinaturas" },
  { label: "Certificados", key: "certificados" },
];

const studentSubPages: { label: string; key: StudentSubPage }[] = [
  { label: "Trilhas", key: "trilhas" },
  { label: "Cursos", key: "cursos" },
  { label: "Meu Plano", key: "meu-plano" },
  { label: "Certificados", key: "certificados" },
];

function load<T>(key: string): T[] {
  try { return JSON.parse(localStorage.getItem(key) || "[]"); } catch { return []; }
}
function save<T>(key: string, data: T[]) {
  localStorage.setItem(key, JSON.stringify(data));
}

// ─── TrilhasTab ───────────────────────────────────────────────────────────────

function TrilhasTab({
  trails, trailCourses, courses,
  onAddTrail, onDeleteTrail, onAddAssoc, onDeleteAssoc,
}: {
  trails: Trail[];
  trailCourses: TrailCourse[];
  courses: Course[];
  onAddTrail: (d: { title: string; description: string; category: string }) => void;
  onDeleteTrail: (id: string) => void;
  onAddAssoc: (d: { trailId: string; courseId: string; order: number }) => void;
  onDeleteAssoc: (id: string) => void;
}) {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [cat, setCat] = useState("");
  const [assocTrail, setAssocTrail] = useState("");
  const [assocCourse, setAssocCourse] = useState("");
  const [assocOrder, setAssocOrder] = useState(1);

  function submitTrail(e: { preventDefault(): void }) {
    e.preventDefault();
    if (!title.trim() || !cat) return;
    onAddTrail({ title, description: desc, category: cat });
    setTitle(""); setDesc(""); setCat("");
  }

  function submitAssoc(e: { preventDefault(): void }) {
    e.preventDefault();
    if (!assocTrail || !assocCourse) return;
    onAddAssoc({ trailId: assocTrail, courseId: assocCourse, order: assocOrder });
    setAssocTrail(""); setAssocCourse(""); setAssocOrder(1);
  }

  return (
    <>
      <style>{`
        .jm-trilha-badge {
          background: linear-gradient(135deg, #1a3a8f, #1565c0);
          color: #fff; padding: 0.2rem 0.7rem;
          border-radius: 20px; font-size: 0.78rem; font-weight: 600;
        }
        .jm-section-label { color: #1565c0; font-weight: 700; margin-bottom: 1rem; font-size: 1rem; }
      `}</style>

      {/* Top: form + table */}
      <div className="row g-4 mb-4">
        {/* Create form */}
        <div className="col-12 col-md-4">
          <div className="border rounded-3 p-4 bg-white h-100">
            <p className="jm-section-label mb-3">Nova Trilha</p>
            <form onSubmit={submitTrail}>
              <div className="mb-3">
                <label className="form-label small fw-semibold text-muted">Título da Trilha</label>
                <input type="text" className="form-control form-control-sm" value={title}
                  onChange={e => setTitle(e.target.value)} required />
              </div>
              <div className="mb-3">
                <label className="form-label small fw-semibold text-muted">Descrição</label>
                <textarea className="form-control form-control-sm" rows={3} value={desc}
                  onChange={e => setDesc(e.target.value)} />
              </div>
              <div className="mb-3">
                <label className="form-label small fw-semibold text-muted">Categoria</label>
                <select className="form-select form-select-sm" value={cat}
                  onChange={e => setCat(e.target.value)} required>
                  <option value="">Selecione...</option>
                  {TRAIL_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <button type="submit" className="btn w-100 text-white fw-semibold"
                style={{ background: "linear-gradient(135deg, #1a3a8f, #1565c0)" }}>
                Criar Trilha
              </button>
            </form>
          </div>
        </div>

        {/* Trails table */}
        <div className="col-12 col-md-8">
          <div className="border rounded-3 bg-white overflow-hidden">
            {trails.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <i className="bi bi-map fs-1 d-block mb-2 opacity-50" />
                <p className="mb-0">Nenhuma trilha criada ainda.</p>
              </div>
            ) : (
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="ps-3">ID</th>
                    <th>Título</th>
                    <th>Categoria</th>
                    <th className="text-end pe-3">Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {trails.map(t => (
                    <tr key={t.id}>
                      <td className="ps-3 text-muted small">#{t.id}</td>
                      <td className="fw-medium">{t.title}</td>
                      <td><span className="jm-trilha-badge">{t.category}</span></td>
                      <td className="text-end pe-3">
                        <button className="btn btn-sm btn-outline-danger"
                          onClick={() => { if (window.confirm(`Excluir "${t.title}"?`)) onDeleteTrail(t.id); }}>
                          <i className="bi bi-trash" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Course association */}
      <div className="border rounded-3 p-4 bg-white">
        <h6 className="fw-semibold mb-3">Associar Curso à Trilha</h6>
        <form onSubmit={submitAssoc}>
          <div className="row g-3 align-items-end mb-3">
            <div className="col-12 col-md-4">
              <label className="form-label small fw-semibold" style={{ color: "#1565c0" }}>Trilha</label>
              <select className="form-select form-select-sm" value={assocTrail}
                onChange={e => setAssocTrail(e.target.value)} required>
                <option value="">Selecione a Trilha...</option>
                {trails.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
              </select>
            </div>
            <div className="col-12 col-md-4">
              <label className="form-label small fw-semibold" style={{ color: "#1565c0" }}>Curso</label>
              <select className="form-select form-select-sm" value={assocCourse}
                onChange={e => setAssocCourse(e.target.value)} required>
                <option value="">Selecione o Curso...</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
            </div>
            <div className="col-6 col-md-2">
              <label className="form-label small fw-semibold" style={{ color: "#1565c0" }}>Ordem</label>
              <input type="number" min={1} className="form-control form-control-sm" value={assocOrder}
                onChange={e => setAssocOrder(Math.max(1, parseInt(e.target.value) || 1))} />
            </div>
            <div className="col-6 col-md-2">
              <button type="submit" className="btn btn-secondary btn-sm w-100">Associar</button>
            </div>
          </div>
        </form>

        {trailCourses.length > 0 ? (
          <table className="table table-sm align-middle mt-2 mb-0">
            <thead>
              <tr>
                <th>Trilha</th><th>Curso</th><th>Ordem</th><th className="text-end">Ação</th>
              </tr>
            </thead>
            <tbody>
              {trailCourses.map(tc => (
                <tr key={tc.id}>
                  <td>{trails.find(t => t.id === tc.trailId)?.title || "—"}</td>
                  <td>{courses.find(c => c.id === tc.courseId)?.title || "—"}</td>
                  <td>{tc.order}</td>
                  <td className="text-end">
                    <button className="btn btn-sm btn-outline-danger"
                      onClick={() => { if (window.confirm("Remover associação?")) onDeleteAssoc(tc.id); }}>
                      <i className="bi bi-trash" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-muted small mb-0 mt-2">Nenhuma associação criada ainda.</p>
        )}
      </div>
    </>
  );
}

// ─── CursosTab ────────────────────────────────────────────────────────────────

function CursosTab({
  courses, onAddCourse, onDeleteCourse, onAddVideo, onRemoveVideo,
}: {
  courses: Course[];
  onAddCourse: (d: { title: string; description: string }) => void;
  onDeleteCourse: (id: string) => void;
  onAddVideo: (courseId: string, v: { title: string; url: string }) => void;
  onRemoveVideo: (courseId: string, videoId: string) => void;
}) {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [selCourse, setSelCourse] = useState("");
  const [videoTitle, setVideoTitle] = useState("");
  const [videoUrl, setVideoUrl] = useState("");

  function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault();
    if (!title.trim()) return;
    onAddCourse({ title, description: desc });
    setTitle(""); setDesc("");
  }

  function handleAddVideo(e: { preventDefault(): void }) {
    e.preventDefault();
    if (!selCourse || !videoTitle.trim() || !videoUrl.trim()) return;
    onAddVideo(selCourse, { title: videoTitle, url: videoUrl });
    setVideoTitle(""); setVideoUrl("");
  }

  const selCourseData = courses.find(c => c.id === selCourse);

  return (
    <>
      <div className="row g-4 mb-4">
        <div className="col-12 col-md-4">
          <div className="border rounded-3 p-4">
            <p className="fw-bold mb-3" style={{ color: "#1565c0" }}>Novo Curso</p>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label small fw-semibold text-muted">Título</label>
                <input type="text" className="form-control form-control-sm" value={title}
                  onChange={e => setTitle(e.target.value)} required />
              </div>
              <div className="mb-3">
                <label className="form-label small fw-semibold text-muted">Descrição</label>
                <textarea className="form-control form-control-sm" rows={3} value={desc}
                  onChange={e => setDesc(e.target.value)} />
              </div>
              <button type="submit" className="btn w-100 text-white"
                style={{ background: "linear-gradient(135deg, #1a3a8f, #1565c0)" }}>
                Criar Curso
              </button>
            </form>
          </div>
        </div>
        <div className="col-12 col-md-8">
          <div className="border rounded-3 overflow-hidden">
            {courses.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <i className="bi bi-mortarboard fs-1 d-block mb-2 opacity-50" />
                <p className="mb-0">Nenhum curso criado ainda.</p>
              </div>
            ) : (
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="ps-3">Título</th>
                    <th>Descrição</th>
                    <th>Vídeos</th>
                    <th className="text-end pe-3">Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map(c => (
                    <tr key={c.id}>
                      <td className="ps-3 fw-medium">{c.title}</td>
                      <td className="text-muted small">{c.description || "—"}</td>
                      <td>
                        <span className="badge rounded-pill"
                          style={{ background: "#1565c0", fontSize: "0.75rem" }}>
                          {(c.videos || []).length}
                        </span>
                      </td>
                      <td className="text-end pe-3">
                        <button className="btn btn-sm btn-outline-danger"
                          onClick={() => { if (window.confirm(`Excluir "${c.title}"?`)) onDeleteCourse(c.id); }}>
                          <i className="bi bi-trash" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      <div className="border rounded-3 p-4 bg-white">
        <h6 className="fw-semibold mb-3">Gerenciar Vídeos do Curso</h6>
        <form onSubmit={handleAddVideo}>
          <div className="row g-3 align-items-end mb-3">
            <div className="col-12 col-md-3">
              <label className="form-label small fw-semibold text-muted">Curso</label>
              <select className="form-select form-select-sm" value={selCourse}
                onChange={e => setSelCourse(e.target.value)} required>
                <option value="">Selecione o curso...</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
            </div>
            <div className="col-12 col-md-4">
              <label className="form-label small fw-semibold text-muted">Título do Vídeo</label>
              <input type="text" className="form-control form-control-sm"
                placeholder="Ex: Introdução ao módulo 1"
                value={videoTitle} onChange={e => setVideoTitle(e.target.value)} />
            </div>
            <div className="col-12 col-md-4">
              <label className="form-label small fw-semibold text-muted">URL do Vídeo</label>
              <input type="url" className="form-control form-control-sm"
                placeholder="https://youtube.com/..."
                value={videoUrl} onChange={e => setVideoUrl(e.target.value)} />
            </div>
            <div className="col-12 col-md-1">
              <button type="submit" className="btn btn-secondary btn-sm w-100">Adicionar</button>
            </div>
          </div>
        </form>

        {selCourseData && (
          (selCourseData.videos || []).length > 0 ? (
            <table className="table table-sm align-middle mt-2 mb-0">
              <thead>
                <tr><th>#</th><th>Título</th><th>URL</th><th className="text-end">Ação</th></tr>
              </thead>
              <tbody>
                {(selCourseData.videos || []).map((v, i) => (
                  <tr key={v.id}>
                    <td className="text-muted small">{i + 1}</td>
                    <td className="fw-medium">{v.title}</td>
                    <td>
                      <a href={v.url} target="_blank" rel="noopener noreferrer"
                        className="text-primary small text-truncate d-block" style={{ maxWidth: 220 }}>
                        {v.url}
                      </a>
                    </td>
                    <td className="text-end">
                      <button className="btn btn-sm btn-outline-danger"
                        onClick={() => { if (window.confirm(`Remover "${v.title}"?`)) onRemoveVideo(selCourseData.id, v.id); }}>
                        <i className="bi bi-trash" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-muted small mb-0 mt-2">Nenhum vídeo adicionado a este curso ainda.</p>
          )
        )}
      </div>
    </>
  );
}

// ─── UsuariosTab ──────────────────────────────────────────────────────────────

function UsuariosTab({ users, onDeleteUser }: { users: User[]; onDeleteUser: (id: string) => void }) {
  const [search, setSearch] = useState("");
  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <style>{`
        .jm-avatar {
          width: 36px; height: 36px; border-radius: 50%;
          background: linear-gradient(135deg, #1a3a8f, #1565c0);
          display: flex; align-items: center; justify-content: center;
          color: #fff; font-weight: 700; font-size: 0.85rem; flex-shrink: 0;
        }
      `}</style>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold mb-0" style={{ color: "#0d1b4b" }}>Usuários</h3>
          <p className="text-muted small mb-0">Gerencie os usuários cadastrados na plataforma</p>
        </div>
        <span className="badge rounded-pill"
          style={{ background: "#1565c0", fontSize: "0.85rem", padding: "0.45rem 1rem" }}>
          {users.length} usuário{users.length !== 1 ? "s" : ""}
        </span>
      </div>
      <div className="mb-3">
        <div className="input-group" style={{ maxWidth: 360 }}>
          <span className="input-group-text bg-white border-end-0">
            <i className="bi bi-search text-muted" />
          </span>
          <input type="text" className="form-control border-start-0 ps-0"
            placeholder="Buscar por nome ou e-mail..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>
      {filtered.length === 0 ? (
        <div className="text-center py-5 text-muted">
          <i className="bi bi-people fs-1 d-block mb-3 opacity-50" />
          <p className="mb-0">{search ? "Nenhum resultado." : "Nenhum usuário cadastrado ainda."}</p>
        </div>
      ) : (
        <div className="table-responsive rounded border">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th className="ps-3">Usuário</th><th>E-mail</th><th>Perfil</th>
                <th>Cadastrado em</th><th className="text-end pe-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id}>
                  <td className="ps-3">
                    <div className="d-flex align-items-center gap-2">
                      <div className="jm-avatar">{u.name[0].toUpperCase()}</div>
                      <span className="fw-medium">{u.name}</span>
                    </div>
                  </td>
                  <td className="text-muted">{u.email}</td>
                  <td>
                    <span className={`badge ${u.role === "admin" ? "bg-danger" : "bg-primary bg-opacity-10 text-primary"}`}>
                      {u.role === "admin" ? "Admin" : "Aluno"}
                    </span>
                  </td>
                  <td className="text-muted small">
                    {new Date(u.createdAt).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="text-end pe-3">
                    <button className="btn btn-sm btn-outline-danger"
                      onClick={() => { if (window.confirm(`Excluir "${u.name}"?`)) onDeleteUser(u.id); }}>
                      <i className="bi bi-trash" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── PlanosTab (admin) ────────────────────────────────────────────────────────

function PlanosTab({
  plans, onAddPlan, onEditPlan, onDeletePlan,
}: {
  plans: Plan[];
  onAddPlan: (d: Omit<Plan, "id" | "createdAt">) => void;
  onEditPlan: (id: string, d: Partial<Omit<Plan, "id" | "createdAt">>) => void;
  onDeletePlan: (id: string) => void;
}) {
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Plan | null>(null);
  const [form, setForm] = useState({ name: "", type: "mensal" as Plan["type"], price: 0, features: [] as string[] });
  const [featureInput, setFeatureInput] = useState("");
  const [nameError, setNameError] = useState(false);

  function openNew() {
    setEditing(null);
    setForm({ name: "", type: "mensal", price: 0, features: [] });
    setFeatureInput(""); setNameError(false); setShowModal(true);
  }

  function openEdit(p: Plan) {
    setEditing(p);
    setForm({ name: p.name, type: p.type, price: p.price, features: [...p.features] });
    setFeatureInput(""); setNameError(false); setShowModal(true);
  }

  function addFeature() {
    const f = featureInput.trim();
    if (!f || form.features.includes(f)) return;
    setForm({ ...form, features: [...form.features, f] });
    setFeatureInput("");
  }

  function handleSave() {
    if (!form.name.trim()) { setNameError(true); return; }
    setNameError(false);
    if (editing) onEditPlan(editing.id, form);
    else onAddPlan(form);
    setShowModal(false);
  }

  return (
    <>
      <style>{`
        .jm-plan-card {
          background: #fff; border: 1px solid #e0e8f8; border-radius: 12px; padding: 1.25rem; margin-bottom: 1rem;
        }
        .jm-plan-badge {
          background: #1565c0; color: #fff; padding: 0.2rem 0.7rem;
          border-radius: 20px; font-size: 0.75rem; font-weight: 600;
        }
        .jm-feat-chip {
          display: inline-flex; align-items: center; background: #f3f4f6;
          color: #374151; border-radius: 20px; padding: 0.2rem 0.65rem;
          font-size: 0.8rem; border: 1px solid #e5e7eb;
        }
        .jm-plan-modal-overlay {
          position: fixed; inset: 0; background: rgba(13,27,75,0.45);
          z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 1rem;
        }
        .jm-plan-modal {
          background: #fff; border-radius: 16px; width: 100%; max-width: 520px;
          box-shadow: 0 20px 60px rgba(13,27,75,0.35); overflow: hidden;
        }
        .jm-plan-modal-hdr {
          background: linear-gradient(135deg, #1a3a8f, #1565c0);
          color: #fff; padding: 1.25rem 1.5rem;
          display: flex; justify-content: space-between; align-items: center;
        }
      `}</style>

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center gap-2">
          <i className="bi bi-list-ul" />
          <span className="fw-semibold">Planos cadastrados</span>
          <span className="badge rounded-pill" style={{ background: "#1565c0", fontSize: "0.78rem" }}>
            {plans.length}
          </span>
        </div>
        <button className="btn btn-sm text-white"
          style={{ background: "linear-gradient(135deg, #1a3a8f, #1565c0)" }} onClick={openNew}>
          <i className="bi bi-plus-circle me-1" /> Novo Plano
        </button>
      </div>

      {plans.length === 0 ? (
        <div className="text-center py-5 text-muted">
          <i className="bi bi-credit-card fs-1 d-block mb-3 opacity-50" />
          <p className="mb-2">Nenhum plano cadastrado ainda.</p>
          <button className="btn btn-sm text-white"
            style={{ background: "linear-gradient(135deg, #1a3a8f, #1565c0)" }} onClick={openNew}>
            <i className="bi bi-plus-circle me-1" /> Criar primeiro plano
          </button>
        </div>
      ) : plans.map(p => (
        <div key={p.id} className="jm-plan-card">
          <div className="d-flex justify-content-between align-items-start mb-2">
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <span className="fw-semibold">{p.name}</span>
              <span className="jm-plan-badge">{p.type}</span>
            </div>
            <div className="d-flex gap-2">
              <button className="btn btn-sm btn-outline-primary" onClick={() => openEdit(p)}>
                <i className="bi bi-pencil" />
              </button>
              <button className="btn btn-sm btn-outline-danger"
                onClick={() => { if (window.confirm(`Excluir "${p.name}"?`)) onDeletePlan(p.id); }}>
                <i className="bi bi-trash" />
              </button>
            </div>
          </div>
          <div className="fw-bold fs-4 mb-2">
            R$ {p.price.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}
          </div>
          <div className="d-flex flex-wrap gap-2">
            {p.features.map(f => <span key={f} className="jm-feat-chip">{f}</span>)}
          </div>
        </div>
      ))}

      {showModal && (
        <div className="jm-plan-modal-overlay"
          onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div className="jm-plan-modal">
            <div className="jm-plan-modal-hdr">
              <span className="fw-bold fs-6">{editing ? "Editar Plano" : "Novo Plano"}</span>
              <button className="btn-close btn-close-white btn-sm" onClick={() => setShowModal(false)} />
            </div>
            <div className="p-4">
              <div className="mb-3">
                <label className="form-label fw-semibold small" style={{ color: "#1565c0" }}>
                  Nome do plano *
                </label>
                <input type="text" className={`form-control ${nameError ? "is-invalid" : ""}`}
                  placeholder="Ex: Plano Mensal Pro"
                  value={form.name} onChange={e => { setForm({ ...form, name: e.target.value }); setNameError(false); }} />
                {nameError && <div className="invalid-feedback">Nome obrigatório</div>}
              </div>
              <div className="row g-3 mb-3">
                <div className="col-6">
                  <label className="form-label fw-semibold small" style={{ color: "#1565c0" }}>Tipo</label>
                  <select className="form-select" value={form.type}
                    onChange={e => setForm({ ...form, type: e.target.value as Plan["type"] })}>
                    <option value="mensal">Mensal</option>
                    <option value="anual">Anual</option>
                    <option value="vitalício">Vitalício</option>
                  </select>
                </div>
                <div className="col-6">
                  <label className="form-label fw-semibold small" style={{ color: "#1565c0" }}>Preço (R$)</label>
                  <input type="number" min={0} step={0.01} className="form-control"
                    value={form.price}
                    onChange={e => setForm({ ...form, price: Math.max(0, parseFloat(e.target.value) || 0) })} />
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label fw-semibold small" style={{ color: "#1565c0" }}>
                  Benefícios
                </label>
                <div className="d-flex gap-2 mb-2">
                  <input type="text" className="form-control form-control-sm"
                    placeholder="Ex: Acesso ilimitado"
                    value={featureInput}
                    onChange={e => setFeatureInput(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addFeature(); } }} />
                  <button type="button" className="btn btn-sm btn-outline-secondary" onClick={addFeature}>
                    + Add
                  </button>
                </div>
                <div className="d-flex flex-wrap gap-2">
                  {form.features.map(f => (
                    <span key={f} className="jm-feat-chip">
                      {f}
                      <button type="button"
                        className="btn p-0 border-0 bg-transparent ms-1"
                        style={{ fontSize: "0.7rem", color: "#6b7280", lineHeight: 1 }}
                        onClick={() => setForm({ ...form, features: form.features.filter(x => x !== f) })}>
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              </div>
              <div className="d-flex justify-content-end gap-2 mt-4">
                <button className="btn btn-outline-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                <button className="btn text-white"
                  style={{ background: "linear-gradient(135deg, #1a3a8f, #1565c0)" }}
                  onClick={handleSave}>
                  {editing ? "Salvar alterações" : "Criar plano"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─── AssinaturasTab (admin) ────────────────────────────────────────────────────

function AssinaturasTab({
  subscriptions, users, plans,
}: {
  subscriptions: Subscription[];
  users: User[];
  plans: Plan[];
}) {
  const enriched = subscriptions.map(s => ({
    ...s,
    user: users.find(u => u.id === s.userId),
    plan: plans.find(p => p.id === s.planId),
  }));

  const active = enriched.filter(s => s.status === "active");

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold mb-0" style={{ color: "#0d1b4b" }}>Assinaturas</h3>
          <p className="text-muted small mb-0">Planos contratados pelos usuários</p>
        </div>
        <span className="badge rounded-pill"
          style={{ background: "#1565c0", fontSize: "0.85rem", padding: "0.45rem 1rem" }}>
          {active.length} ativa{active.length !== 1 ? "s" : ""}
        </span>
      </div>

      {enriched.length === 0 ? (
        <div className="text-center py-5 text-muted">
          <i className="bi bi-receipt fs-1 d-block mb-3 opacity-50" />
          <p className="mb-0">Nenhuma assinatura registrada ainda.</p>
        </div>
      ) : (
        <div className="table-responsive rounded border">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th className="ps-3">Usuário</th>
                <th>E-mail</th>
                <th>Plano</th>
                <th>Tipo</th>
                <th>Valor</th>
                <th>Início</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {enriched.map(s => (
                <tr key={s.id}>
                  <td className="ps-3 fw-medium">{s.user?.name || "—"}</td>
                  <td className="text-muted">{s.user?.email || "—"}</td>
                  <td>{s.plan?.name || "—"}</td>
                  <td>
                    {s.plan && (
                      <span className="badge" style={{ background: "#1565c0", fontSize: "0.75rem" }}>
                        {s.plan.type}
                      </span>
                    )}
                  </td>
                  <td>{s.plan ? `R$ ${s.plan.price.toLocaleString("pt-BR")}` : "—"}</td>
                  <td className="text-muted small">
                    {new Date(s.startDate).toLocaleDateString("pt-BR")}
                  </td>
                  <td>
                    <span className={`badge ${s.status === "active" ? "bg-success" : "bg-secondary"}`}>
                      {s.status === "active" ? "Ativa" : "Cancelada"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── PlanSelectionScreen (student) ────────────────────────────────────────────

function PlanSelectionScreen({
  plans, userName, onSelectPlan,
}: {
  plans: Plan[];
  userName: string;
  onSelectPlan: (planId: string) => void;
}) {
  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #f0f4ff 0%, #e8f0fe 100%)",
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", padding: "2rem",
    }}>
      <style>{`
        .jm-ps-card {
          background: #fff; border: 1px solid #e0e8f8; border-radius: 16px;
          padding: 2rem; display: flex; flex-direction: column; align-items: center;
          transition: box-shadow 0.2s, border-color 0.2s;
        }
        .jm-ps-card:hover {
          box-shadow: 0 8px 30px rgba(21,101,192,0.15);
          border-color: #90b4e8;
        }
      `}</style>

      <div style={{ maxWidth: 960, width: "100%" }}>
        <div className="text-center mb-5">
          <div className="fw-bold mb-2" style={{ fontSize: "1.8rem", color: "#0d1b4b" }}>
            JM <span style={{ color: "#1565c0" }}>Cursos</span>
          </div>
          <h2 className="fw-bold" style={{ color: "#0d1b4b" }}>
            Bem-vindo, {userName.split(" ")[0]}!
          </h2>
          <p className="text-muted">Escolha o plano que melhor se adapta a você para começar.</p>
        </div>

        {plans.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <i className="bi bi-credit-card fs-1 d-block mb-3 opacity-50" />
            <p>Nenhum plano disponível no momento. Contate o administrador.</p>
          </div>
        ) : (
          <div className="row g-4 justify-content-center">
            {plans.map(p => (
              <div key={p.id} className="col-12 col-sm-6 col-md-4">
                <div className="jm-ps-card h-100">
                  <span className="badge mb-3 px-3 py-2"
                    style={{ background: "#1565c0", borderRadius: 20, fontSize: "0.85rem" }}>
                    {p.type}
                  </span>
                  <h4 className="fw-bold mb-2 text-center" style={{ color: "#0d1b4b" }}>{p.name}</h4>
                  <div className="fw-bold my-3 text-center"
                    style={{ fontSize: "2.5rem", color: "#1565c0", lineHeight: 1 }}>
                    R$ {p.price.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}
                    <span className="text-muted fw-normal" style={{ fontSize: "0.95rem" }}>
                      /{p.type === "anual" ? "ano" : p.type === "mensal" ? "mês" : "única vez"}
                    </span>
                  </div>
                  <ul className="list-unstyled w-100 mb-4">
                    {p.features.map(f => (
                      <li key={f} className="d-flex align-items-center gap-2 mb-2">
                        <i className="bi bi-check-circle-fill text-success flex-shrink-0" />
                        <span className="small">{f}</span>
                      </li>
                    ))}
                    {p.features.length === 0 && (
                      <li className="text-muted small text-center">Sem benefícios listados</li>
                    )}
                  </ul>
                  <button className="btn text-white w-100 mt-auto"
                    style={{ background: "linear-gradient(135deg, #1a3a8f, #1565c0)", borderRadius: 8 }}
                    onClick={() => onSelectPlan(p.id)}>
                    Escolher plano
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── MeuPlanoTab (student) ────────────────────────────────────────────────────

function MeuPlanoTab({
  plans, subscriptions, currentUserId, onSelectPlan,
}: {
  plans: Plan[];
  subscriptions: Subscription[];
  currentUserId: string;
  onSelectPlan: (planId: string) => void;
}) {
  const activeSub = subscriptions.find(s => s.userId === currentUserId && s.status === "active");
  const currentPlan = activeSub ? plans.find(p => p.id === activeSub.planId) : null;

  return (
    <div>
      <style>{`
        .jm-myplan-card {
          border: 1px solid #e0e8f8; border-radius: 12px; padding: 1.5rem;
          display: flex; flex-direction: column; align-items: center; text-align: center;
          transition: box-shadow 0.2s, border-color 0.2s;
        }
        .jm-myplan-card:hover { box-shadow: 0 4px 20px rgba(21,101,192,0.12); border-color: #90b4e8; }
        .jm-myplan-card.active-plan { border-color: #1565c0; background: #f0f6ff; }
      `}</style>

      <div className="mb-4">
        <h3 className="fw-bold mb-0" style={{ color: "#0d1b4b" }}>Meu Plano</h3>
        <p className="text-muted small mb-0">Gerencie sua assinatura</p>
      </div>

      {/* Current plan highlight */}
      {currentPlan && activeSub && (
        <div className="border rounded-3 p-4 mb-4"
          style={{ borderColor: "#1565c0", background: "#f0f6ff" }}>
          <div className="d-flex align-items-center gap-2 mb-3">
            <i className="bi bi-check-circle-fill text-primary" />
            <span className="fw-semibold" style={{ color: "#1565c0" }}>Plano atual</span>
          </div>
          <div className="d-flex align-items-center gap-3 flex-wrap">
            <div>
              <div className="fw-bold fs-5">{currentPlan.name}</div>
              <span className="badge" style={{ background: "#1565c0" }}>{currentPlan.type}</span>
            </div>
            <div className="fw-bold fs-3 ms-2" style={{ color: "#1565c0" }}>
              R$ {currentPlan.price.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}
            </div>
            <div className="text-muted small">
              Desde {new Date(activeSub.startDate).toLocaleDateString("pt-BR")}
            </div>
          </div>
          <div className="d-flex flex-wrap gap-2 mt-3">
            {currentPlan.features.map(f => (
              <span key={f} className="badge bg-light text-dark border"
                style={{ fontSize: "0.8rem", padding: "0.35rem 0.65rem" }}>
                {f}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* All plans */}
      <h6 className="fw-semibold text-muted mb-3">
        {currentPlan ? "Trocar de plano" : "Escolher um plano"}
      </h6>

      {plans.length === 0 ? (
        <p className="text-muted">Nenhum plano disponível no momento.</p>
      ) : (
        <div className="row g-4">
          {plans.map(p => {
            const isCurrent = currentPlan?.id === p.id;
            return (
              <div key={p.id} className="col-12 col-sm-6 col-md-4">
                <div className={`jm-myplan-card h-100 ${isCurrent ? "active-plan" : ""}`}>
                  <span className="badge mb-2 px-3"
                    style={{ background: "#1565c0", borderRadius: 20 }}>
                    {p.type}
                  </span>
                  <h5 className="fw-bold mb-1">{p.name}</h5>
                  <div className="fw-bold my-3" style={{ fontSize: "2rem", color: "#1565c0" }}>
                    R$ {p.price.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}
                  </div>
                  <ul className="list-unstyled text-start w-100 mb-4 small">
                    {p.features.map(f => (
                      <li key={f} className="d-flex align-items-center gap-2 mb-1">
                        <i className="bi bi-check-circle-fill text-success flex-shrink-0"
                          style={{ fontSize: "0.8rem" }} />
                        {f}
                      </li>
                    ))}
                    {p.features.length === 0 && (
                      <li className="text-muted text-center">Sem benefícios listados</li>
                    )}
                  </ul>
                  <button
                    className="btn w-100 mt-auto text-white"
                    style={{ background: "linear-gradient(135deg, #1a3a8f, #1565c0)", borderRadius: 8 }}
                    disabled={isCurrent}
                    onClick={() => { if (!isCurrent) onSelectPlan(p.id); }}>
                    {isCurrent ? "Plano atual" : "Escolher plano"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showPlanSelection, setShowPlanSelection] = useState(false);
  const [page, setPage] = useState<Page>("home");
  const [adminSub, setAdminSub] = useState<AdminSubPage>("trilhas");
  const [studentSub, setStudentSub] = useState<StudentSubPage>("meu-plano");

  const [users, setUsers] = useState<User[]>(() => load<User>("jm_users"));
  const [trails, setTrails] = useState<Trail[]>(() => load<Trail>("jm_trails"));
  const [trailCourses, setTrailCourses] = useState<TrailCourse[]>(() => load<TrailCourse>("jm_trail_courses"));
  const [courses, setCourses] = useState<Course[]>(() => load<Course>("jm_courses"));
  const [plans, setPlans] = useState<Plan[]>(() => load<Plan>("jm_plans"));
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(() => load<Subscription>("jm_subscriptions"));
  const [courseProgresses, setCourseProgresses] = useState<CourseProgress[]>(() => load<CourseProgress>("jm_course_progresses"));
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  // ── Auth ────────────────────────────────────────────────────────────────────

  function handleRegister(data: { name: string; email: string; password: string }) {
    const role = users.length === 0 ? "admin" : "student";
    const newUser: User = {
      id: crypto.randomUUID(),
      name: data.name, email: data.email, password: data.password,
      role, createdAt: new Date().toISOString(),
    };
    const updated = [...users, newUser];
    setUsers(updated); save("jm_users", updated);
    setCurrentUser(newUser); setLoggedIn(true);
    if (role === "student") {
      const hasPlan = subscriptions.some(s => s.userId === newUser.id && s.status === "active");
      if (!hasPlan && plans.length > 0) setShowPlanSelection(true);
    }
  }

  function handleLogin(email: string, password: string): boolean {
    const user = users.find(u =>
      u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (!user) return false;
    setCurrentUser(user); setLoggedIn(true);
    if (user.role === "student") {
      const hasPlan = subscriptions.some(s => s.userId === user.id && s.status === "active");
      if (!hasPlan && plans.length > 0) setShowPlanSelection(true);
    }
    return true;
  }

  function logout() {
    setLoggedIn(false); setCurrentUser(null);
    setShowPlanSelection(false); setPage("home");
    setAdminSub("trilhas"); setStudentSub("meu-plano");
  }

  // ── Users ───────────────────────────────────────────────────────────────────

  function deleteUser(id: string) {
    const u = users.filter(u => u.id !== id);
    setUsers(u); save("jm_users", u);
  }

  // ── Trails ──────────────────────────────────────────────────────────────────

  function addTrail(d: { title: string; description: string; category: string }) {
    const t: Trail = { id: Date.now().toString(), ...d, createdAt: new Date().toISOString() };
    const u = [...trails, t]; setTrails(u); save("jm_trails", u);
  }

  function deleteTrail(id: string) {
    const t = trails.filter(t => t.id !== id);
    const tc = trailCourses.filter(tc => tc.trailId !== id);
    setTrails(t); setTrailCourses(tc);
    save("jm_trails", t); save("jm_trail_courses", tc);
  }

  // ── TrailCourses ─────────────────────────────────────────────────────────────

  function addTrailCourse(d: { trailId: string; courseId: string; order: number }) {
    const tc: TrailCourse = { id: crypto.randomUUID(), ...d };
    const u = [...trailCourses, tc]; setTrailCourses(u); save("jm_trail_courses", u);
  }

  function deleteTrailCourse(id: string) {
    const u = trailCourses.filter(tc => tc.id !== id);
    setTrailCourses(u); save("jm_trail_courses", u);
  }

  // ── Courses ─────────────────────────────────────────────────────────────────

  function addCourse(d: { title: string; description: string }) {
    const c: Course = { id: crypto.randomUUID(), ...d, videos: [], createdAt: new Date().toISOString() };
    const u = [...courses, c]; setCourses(u); save("jm_courses", u);
  }

  function deleteCourse(id: string) {
    const c = courses.filter(c => c.id !== id);
    const tc = trailCourses.filter(tc => tc.courseId !== id);
    setCourses(c); setTrailCourses(tc);
    save("jm_courses", c); save("jm_trail_courses", tc);
  }

  function addVideoToCourse(courseId: string, v: { title: string; url: string }) {
    const course = courses.find(c => c.id === courseId);
    if (!course) return;
    const video: CourseVideo = {
      id: crypto.randomUUID(), title: v.title, url: v.url,
      order: (course.videos || []).length + 1,
    };
    const u = courses.map(c => c.id === courseId ? { ...c, videos: [...(c.videos || []), video] } : c);
    setCourses(u); save("jm_courses", u);
  }

  function removeVideoFromCourse(courseId: string, videoId: string) {
    const u = courses.map(c => c.id === courseId
      ? { ...c, videos: (c.videos || []).filter(v => v.id !== videoId) }
      : c
    );
    setCourses(u); save("jm_courses", u);
  }

  function watchVideo(courseId: string, videoId: string) {
    if (!currentUser) return;
    const course = courses.find(c => c.id === courseId);
    if (!course) return;
    const existing = courseProgresses.find(p => p.userId === currentUser.id && p.courseId === courseId);
    const prevWatched = existing?.watchedVideoIds || [];
    const watchedVideoIds = prevWatched.includes(videoId) ? prevWatched : [...prevWatched, videoId];
    const allVideos = course.videos || [];
    const completed = allVideos.length > 0 && allVideos.every(v => watchedVideoIds.includes(v.id));
    let updated: CourseProgress[];
    if (existing) {
      updated = courseProgresses.map(p => p.id === existing.id
        ? { ...p, watchedVideoIds, completed, ...(completed && !existing.completed ? { completedAt: new Date().toISOString() } : {}) }
        : p
      );
    } else {
      const progress: CourseProgress = {
        id: crypto.randomUUID(), userId: currentUser.id, courseId,
        watchedVideoIds, completed, ...(completed ? { completedAt: new Date().toISOString() } : {}),
      };
      updated = [...courseProgresses, progress];
    }
    setCourseProgresses(updated); save("jm_course_progresses", updated);
  }

  // ── Plans ───────────────────────────────────────────────────────────────────

  function addPlan(d: Omit<Plan, "id" | "createdAt">) {
    const p: Plan = { id: crypto.randomUUID(), ...d, createdAt: new Date().toISOString() };
    const u = [...plans, p]; setPlans(u); save("jm_plans", u);
  }

  function editPlan(id: string, d: Partial<Omit<Plan, "id" | "createdAt">>) {
    const u = plans.map(p => p.id === id ? { ...p, ...d } : p);
    setPlans(u); save("jm_plans", u);
  }

  function deletePlan(id: string) {
    const u = plans.filter(p => p.id !== id);
    setPlans(u); save("jm_plans", u);
  }

  // ── Subscriptions ────────────────────────────────────────────────────────────

  function selectPlan(planId: string) {
    if (!currentUser) return;
    const cancelled = subscriptions.map(s =>
      s.userId === currentUser.id && s.status === "active"
        ? { ...s, status: "cancelled" as const }
        : s
    );
    const newSub: Subscription = {
      id: crypto.randomUUID(),
      userId: currentUser.id,
      planId,
      startDate: new Date().toISOString(),
      status: "active",
    };
    const u = [...cancelled, newSub];
    setSubscriptions(u); save("jm_subscriptions", u);
    setShowPlanSelection(false);
    setStudentSub("meu-plano");
    setPage("sgcursos");
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  if (!loggedIn) {
    return <LoginPage users={users} onLogin={handleLogin} onRegister={handleRegister} />;
  }

  if (showPlanSelection && currentUser?.role === "student") {
    return (
      <PlanSelectionScreen
        plans={plans}
        userName={currentUser.name}
        onSelectPlan={selectPlan}
      />
    );
  }

  const isAdmin = currentUser?.role === "admin";

  return (
    <>
      <nav className="navbar bg-white border-bottom shadow-sm px-4 py-2 d-flex justify-content-between">
        <div className="d-flex align-items-center gap-3">
          <span className="fw-bold fs-5" style={{ color: "#0d1b4b" }}>
            JM <span style={{ color: "#1565c0" }}>Cursos</span>
          </span>
          <div className="d-flex gap-3 ms-2">
            <button
              className={`btn btn-link p-0 text-decoration-none ${page === "home" ? "fw-bold text-dark" : "text-primary"}`}
              onClick={() => setPage("home")}>
              Home
            </button>
            <button
              className={`btn btn-link p-0 text-decoration-none ${page === "sgcursos" ? "fw-bold text-dark" : "text-primary"}`}
              onClick={() => setPage("sgcursos")}>
              SG Cursos
            </button>
          </div>
        </div>
        <div className="d-flex align-items-center gap-3">
          {currentUser && (
            <span className="text-muted small d-flex align-items-center gap-2">
              Olá, {currentUser.name.split(" ")[0]}
              {isAdmin && (
                <span className="badge bg-danger" style={{ fontSize: "0.68rem" }}>Admin</span>
              )}
            </span>
          )}
          <button className="btn btn-outline-secondary btn-sm" onClick={logout}>Sair</button>
        </div>
      </nav>

      <main className="container py-5">
        {page === "home" && (
          <div>
            {isAdmin && (
              <div className="row g-3 mb-4">
                {[
                  { icon: "bi-play-circle-fill", count: courses.length, label: "Cursos" },
                  { icon: "bi-map-fill", count: trails.length, label: "Trilhas de Aprendizado" },
                  { icon: "bi-people-fill", count: users.filter(u => u.role === "student").length, label: "Alunos" },
                  { icon: "bi-credit-card-fill", count: plans.length, label: "Planos" },
                ].map(stat => (
                  <div key={stat.label} className="col-6 col-md-4 col-lg">
                    <div className="adm-stat-card">
                      <div className="adm-stat-icon">
                        <i className={`bi ${stat.icon}`} />
                      </div>
                      <div className="fw-bold lh-1" style={{ fontSize: "1.6rem", color: "#0d1b4b" }}>{stat.count}</div>
                      <div className="text-muted mt-1" style={{ fontSize: "0.77rem" }}>{stat.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="text-center py-4">
              <h2 className="fw-bold" style={{ color: "#0d1b4b" }}>Bem-vindo ao JM Cursos</h2>
            </div>
            {!isAdmin && (() => {
              const activeSub = subscriptions.find(s => s.userId === currentUser!.id && s.status === "active");
              const currentPlan = activeSub ? plans.find(p => p.id === activeSub.planId) : null;
              return currentPlan ? (
                <div className="bg-white rounded-3 p-4 mb-4" style={{ border: "1px solid #e5e7eb" }}>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6 className="fw-bold mb-0" style={{ color: "#0d1b4b" }}>
                      <i className="bi bi-credit-card-2-front me-2" style={{ color: "#1565c0" }} />
                      Meu Plano
                    </h6>
                    <button className="btn btn-link p-0 text-decoration-none small fw-medium"
                      style={{ color: "#1565c0" }}
                      onClick={() => { setPage("sgcursos"); setStudentSub("meu-plano"); }}>
                      Gerenciar →
                    </button>
                  </div>
                  <div className="p-3 rounded-3" style={{ background: "#f8faff", border: "1px solid #e0e8f8" }}>
                    <div className="fw-bold" style={{ color: "#0d1b4b", fontSize: "0.95rem" }}>{currentPlan.name}</div>
                    <div className="fw-bold mt-1" style={{ color: "#1565c0", fontSize: "1.2rem" }}>
                      R$ {currentPlan.price.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}
                      <span style={{ fontSize: "0.75rem", fontWeight: 400, color: "#888" }}>/{currentPlan.type}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center mb-4">
                  <button className="btn text-white"
                    style={{ background: "linear-gradient(135deg, #1a3a8f, #1565c0)" }}
                    onClick={() => { setPage("sgcursos"); setStudentSub("meu-plano"); }}>
                    Escolher plano
                  </button>
                </div>
              );
            })()}
            {courses.length > 0 && (
              <div className="mt-2">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="fw-semibold mb-0" style={{ color: "#0d1b4b" }}>Cursos</h5>
                  <button className="btn btn-link p-0 text-decoration-none small fw-medium"
                    style={{ color: "#1565c0" }}
                    onClick={() => { setPage("sgcursos"); isAdmin ? setAdminSub("cursos") : setStudentSub("cursos"); }}>
                    Ver todos →
                  </button>
                </div>
                <div className="row g-3">
                  {courses.slice(0, 4).map(c => {
                    const firstVideo = (c.videos || [])[0];
                    const thumb = firstVideo ? getYoutubeThumbnail(firstVideo.url) : null;
                    const videos = c.videos || [];
                    const progress = !isAdmin
                      ? courseProgresses.find(p => p.userId === currentUser!.id && p.courseId === c.id)
                      : undefined;
                    const isCompleted = progress?.completed || false;
                    return (
                      <div key={c.id} className="col-6 col-md-4 col-lg-3">
                        <div className="jm-course-card"
                          onClick={() => { setPage("sgcursos"); isAdmin ? setAdminSub("cursos") : setStudentSub("cursos"); }}>
                          <div className="jm-course-thumb">
                            {thumb
                              ? <img src={thumb} alt={c.title} />
                              : <div className="jm-course-thumb-empty"><i className="bi bi-play-circle" /></div>}
                            {isCompleted && (
                              <span className="jm-course-done">
                                <i className="bi bi-check-circle-fill me-1" />Concluído
                              </span>
                            )}
                          </div>
                          <div className="jm-course-body">
                            <div className="fw-semibold lh-sm" style={{ fontSize: "0.88rem" }}>{c.title}</div>
                            <div className="text-muted mt-1" style={{ fontSize: "0.75rem" }}>
                              {videos.length} vídeo{videos.length !== 1 ? "s" : ""}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {page === "sgcursos" && (
          <>
            <ul className="nav nav-tabs mb-4">
              {(isAdmin ? adminSubPages : studentSubPages).map(s => (
                <li className="nav-item" key={s.key}>
                  <button
                    className={`nav-link ${(isAdmin ? adminSub : studentSub) === s.key ? "active" : ""}`}
                    onClick={() => isAdmin
                      ? setAdminSub(s.key as AdminSubPage)
                      : setStudentSub(s.key as StudentSubPage)
                    }>
                    {s.label}
                  </button>
                </li>
              ))}
            </ul>

            {/* Admin tabs */}
            {isAdmin && (
              <>
                {adminSub === "trilhas" && (
                  <TrilhasTab trails={trails} trailCourses={trailCourses} courses={courses}
                    onAddTrail={addTrail} onDeleteTrail={deleteTrail}
                    onAddAssoc={addTrailCourse} onDeleteAssoc={deleteTrailCourse} />
                )}
                {adminSub === "cursos" && (
                  <CursosTab courses={courses} onAddCourse={addCourse} onDeleteCourse={deleteCourse}
                    onAddVideo={addVideoToCourse} onRemoveVideo={removeVideoFromCourse} />
                )}
                {adminSub === "usuarios" && (
                  <UsuariosTab users={users} onDeleteUser={deleteUser} />
                )}
                {adminSub === "planos" && (
                  <PlanosTab plans={plans} onAddPlan={addPlan} onEditPlan={editPlan} onDeletePlan={deletePlan} />
                )}
                {adminSub === "assinaturas" && (
                  <AssinaturasTab subscriptions={subscriptions} users={users} plans={plans} />
                )}
                {adminSub === "certificados" && (
                  <h3 className="fw-semibold">Certificados</h3>
                )}
              </>
            )}

            {/* Student tabs */}
            {!isAdmin && (
              <>
                {studentSub === "trilhas" && (
                  <div>
                    <h3 className="fw-bold mb-4" style={{ color: "#0d1b4b" }}>Trilhas</h3>
                    {trails.length === 0 ? (
                      <p className="text-muted">Nenhuma trilha disponível ainda.</p>
                    ) : (
                      <div className="row g-3">
                        {trails.map(t => (
                          <div key={t.id} className="col-12 col-md-6 col-lg-4">
                            <div className="border rounded-3 p-3 h-100">
                              <div className="fw-semibold mb-2">{t.title}</div>
                              <span className="badge"
                                style={{ background: "linear-gradient(135deg, #1a3a8f, #1565c0)" }}>
                                {t.category}
                              </span>
                              {t.description && (
                                <p className="text-muted small mt-2 mb-0">{t.description}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                {studentSub === "cursos" && (() => {
                  const selCourse = courses.find(c => c.id === selectedCourseId);
                  return (
                    <div>
                      <h3 className="fw-bold mb-4" style={{ color: "#0d1b4b" }}>Cursos</h3>
                      {courses.length === 0 ? (
                        <p className="text-muted">Nenhum curso disponível ainda.</p>
                      ) : (
                        <>
                          <div className="row g-3 mb-4">
                            {courses.map(c => {
                              const firstVideo = (c.videos || [])[0];
                              const thumb = firstVideo ? getYoutubeThumbnail(firstVideo.url) : null;
                              const videos = c.videos || [];
                              const progress = courseProgresses.find(
                                p => p.userId === currentUser!.id && p.courseId === c.id
                              );
                              const isCompleted = progress?.completed || false;
                              const isSelected = selectedCourseId === c.id;
                              return (
                                <div key={c.id} className="col-6 col-md-4 col-lg-3">
                                  <div
                                    className={`jm-course-card${isSelected ? " selected" : ""}`}
                                    onClick={() => setSelectedCourseId(isSelected ? null : c.id)}>
                                    <div className="jm-course-thumb">
                                      {thumb
                                        ? <img src={thumb} alt={c.title} />
                                        : <div className="jm-course-thumb-empty"><i className="bi bi-play-circle" /></div>}
                                      {isCompleted && (
                                        <span className="jm-course-done">
                                          <i className="bi bi-check-circle-fill me-1" />Concluído
                                        </span>
                                      )}
                                    </div>
                                    <div className="jm-course-body">
                                      <div className="fw-semibold lh-sm" style={{ fontSize: "0.88rem" }}>{c.title}</div>
                                      <div className="text-muted mt-1" style={{ fontSize: "0.75rem" }}>
                                        {videos.length} vídeo{videos.length !== 1 ? "s" : ""}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {selCourse && (() => {
                            const videos = selCourse.videos || [];
                            const progress = courseProgresses.find(
                              p => p.userId === currentUser!.id && p.courseId === selCourse.id
                            );
                            const watchedCount = videos.filter(v => progress?.watchedVideoIds.includes(v.id)).length;
                            return (
                              <div className="border rounded-3 p-3">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                  <div>
                                    <h6 className="fw-bold mb-0">{selCourse.title}</h6>
                                    {videos.length > 0 && (
                                      <span className="text-muted" style={{ fontSize: "0.78rem" }}>
                                        {watchedCount}/{videos.length} vídeos assistidos
                                      </span>
                                    )}
                                  </div>
                                  <button className="btn-close" onClick={() => setSelectedCourseId(null)} />
                                </div>
                                {videos.length === 0 ? (
                                  <p className="text-muted small mb-0">Sem vídeos disponíveis.</p>
                                ) : (
                                  <div className="d-flex flex-column gap-2">
                                    {videos.map(v => {
                                      const watched = progress?.watchedVideoIds.includes(v.id) || false;
                                      return (
                                        <div key={v.id} className="d-flex align-items-center gap-2 border rounded p-2">
                                          <i className={`bi ${watched ? "bi-check-circle-fill text-success" : "bi-play-circle"} flex-shrink-0`}
                                            style={{ fontSize: "1.1rem" }} />
                                          <span className="small flex-grow-1 text-truncate">{v.title}</span>
                                          <a href={v.url} target="_blank" rel="noopener noreferrer"
                                            className="btn btn-sm text-white flex-shrink-0"
                                            style={{ background: "linear-gradient(135deg, #1a3a8f, #1565c0)", fontSize: "0.75rem", borderRadius: 6 }}
                                            onClick={() => watchVideo(selCourse.id, v.id)}>
                                            Assistir
                                          </a>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            );
                          })()}
                        </>
                      )}
                    </div>
                  );
                })()}
                {studentSub === "meu-plano" && (
                  <MeuPlanoTab plans={plans} subscriptions={subscriptions}
                    currentUserId={currentUser!.id} onSelectPlan={selectPlan} />
                )}
                {studentSub === "certificados" && (
                  <h3 className="fw-semibold">Certificados</h3>
                )}
              </>
            )}
          </>
        )}
      </main>
    </>
  );
}
