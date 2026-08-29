import React, { useState, useEffect, useCallback } from "react";
import {
  Home as HomeIcon, Package, CheckSquare, Box as BoxIcon, MoreHorizontal,
  Plus, X, ChevronRight, ChevronLeft, Heart, DollarSign, Gift, Trash2,
  HelpCircle, Users, Camera, Image as ImageIcon, Circle,
  CheckCircle2, Search, Sparkles, ArrowRight, QrCode, Wallet, Moon,
  ClipboardList, Activity as ActivityIcon, MapPin, UserPlus, Pencil, LogOut
} from "lucide-react";
import { supabase } from "./supabaseClient";
import Login from "./Login";

/* ---------------------------------------------------------------------- */
/* DESIGN TOKENS                                                          */
/* ---------------------------------------------------------------------- */
const C = {
  bg: "#FAFAF7",
  card: "#FFFFFF",
  ink: "#171717",
  sub: "#737373",
  line: "#F3F3F0",
  lilac: { bg: "#F1E9FB", fg: "#8B5FBF", solid: "#B58FE0" },
  mint: { bg: "#E3F4EC", fg: "#3E9169", solid: "#7CC9A2" },
  yellow: { bg: "#FBF2DC", fg: "#B4863A", solid: "#EFC876" },
  sky: { bg: "#E6F1F7", fg: "#3E7EA0", solid: "#8BBED8" },
  peach: { bg: "#FBEAE1", fg: "#C17347", solid: "#EAA97C" },
  grey: { bg: "#F0F0ED", fg: "#8C8C86", solid: "#C6C6BF" },
};

const MEMBER_COLORS = [C.lilac, C.sky, C.mint, C.peach, C.yellow, C.grey];

const FONT = "'Manrope', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

const decisionMeta = {
  "Sin decidir": C.grey,
  "Me llevo": C.mint,
  "Vender": C.peach,
  "Donar": C.lilac,
  "Descartar": C.grey,
};

/* ---------------------------------------------------------------------- */
/* DEMO DATA                                                              */
/* ---------------------------------------------------------------------- */
const initialMembers = [
  { id: "u1", name: "Fabiola", role: "Administradora", seed: "fabiola", color: C.lilac },
  { id: "u2", name: "José", role: "Miembro", seed: "jose", color: C.sky },
  { id: "u3", name: "Fabiana", role: "Miembro", seed: "fabiana", color: C.mint },
  { id: "u4", name: "Mamá", role: "Miembro", seed: "mama", color: C.peach },
];

const initialItems = [
  { id: "i1", name: "Sofá 3 cuerpos", room: "Living", decision: "Sin decidir", by: "Fabiola", img: "sofa" },
  { id: "i2", name: "Cafetera", room: "Cocina", decision: "Me llevo", by: "José", img: "coffee" },
  { id: "i3", name: "Escritorio", room: "Dormitorio", decision: "Vender", by: "Fabiola", img: "desk" },
  { id: "i4", name: "Televisor", room: "Living", decision: "Sin decidir", by: "Fabiana", img: "tv" },
  { id: "i5", name: "Biblioteca", room: "Living", decision: "Donar", by: "Mamá", img: "shelf" },
  { id: "i6", name: "Lámpara de pie", room: "Living", decision: "Sin decidir", by: "Fabiola", img: "lamp" },
  { id: "i7", name: "Plantas", room: "Balcón", decision: "Me llevo", by: "Fabiana", img: "plants" },
  { id: "i8", name: "Mesa comedor", room: "Cocina", decision: "Sin decidir", by: "José", img: "table" },
  { id: "i9", name: "Espejo", room: "Dormitorio", decision: "Vender", by: "Mamá", img: "mirror" },
  { id: "i10", name: "Microondas", room: "Cocina", decision: "Me llevo", by: "Mamá", img: "microwave" },
];

const imgSeed = {
  sofa: "sofa-couch,furniture", coffee: "coffee-maker", desk: "desk,office",
  tv: "television", shelf: "bookshelf", lamp: "floor-lamp", plants: "houseplant",
  table: "dining-table", mirror: "mirror,frame", microwave: "microwave,kitchen",
  box1: "cardboard-boxes", box2: "moving-boxes", generic: "furniture,room",
};
const photoUrl = (key, w = 400, h = 400) => `https://source.unsplash.com/${w}x${h}/?${imgSeed[key] || key || "furniture"}`;

const initialTasks = [
  { id: "t1", title: "Comprar cajas", category: "Compras", due: "mañana", by: "Fabiana", priority: "Alta", done: true, completedNote: "Completada por Fabiana · hace 2 h" },
  { id: "t2", title: "Contratar transporte", category: "Transporte", due: "14 OCT", by: "José", priority: "Alta", done: false },
  { id: "t3", title: "Avisar al banco del cambio de domicilio", category: "Trámites", due: "18 OCT", by: "Fabiola", priority: "Media", done: false },
  { id: "t4", title: "Reservar ascensor del edificio nuevo", category: "Logística", due: "20 OCT", by: "Mamá", priority: "Media", done: false },
  { id: "t5", title: "Dar de baja internet en el depto viejo", category: "Trámites", due: "22 OCT", by: "José", priority: "Baja", done: false },
  { id: "t6", title: "Etiquetar cajas frágiles", category: "Embalaje", due: "hace 1 día", by: "Fabiola", priority: "Media", done: true, completedNote: "Completada por Fabiola · hace 1 día" },
];

const initialBoxes = [
  { id: "b1", label: "Caja 12", room: "Cocina", count: 8, fragile: true, by: "Fabiola", status: "Preparando", contents: ["Cafetera", "Platos", "Vasos", "Utensilios"] },
  { id: "b2", label: "Caja 08", room: "Dormitorio", count: 5, fragile: false, by: "Fabiana", status: "Cerrada", contents: ["Ropa de invierno", "Sábanas", "Almohadas"] },
  { id: "b3", label: "Caja 03", room: "Living", count: 3, fragile: true, by: "José", status: "Vacía", contents: [] },
  { id: "b4", label: "Caja 01", room: "Baño", count: 6, fragile: false, by: "Mamá", status: "Transportada", contents: ["Toallas", "Cosmética", "Botiquín"] },
];

const initialSales = [
  { id: "s1", item: "Escritorio", room: "Dormitorio", estimated: 90000, listed: 85000, status: "Publicado", by: "Fabiola" },
  { id: "s2", item: "Espejo", room: "Dormitorio", estimated: 40000, listed: 40000, status: "Reservado", by: "Mamá" },
  { id: "s3", item: "Silla de escritorio", room: "Dormitorio", estimated: 60000, listed: null, status: "Sacar fotos", by: "José" },
  { id: "s4", item: "Bicicleta fija", room: "Balcón", estimated: 130000, listed: 120000, status: "Vendido", by: "Fabiola" },
];

const initialActivity = [
  { id: "a1", who: "Fabiola", action: "marcó Escritorio como Vender", time: "hace 5 min", type: "objetos" },
  { id: "a2", who: "José", action: "completó Contratar transporte", time: "hace 1 h", type: "tareas" },
  { id: "a3", who: "Fabiana", action: "agregó Caja #08", time: "hace 3 h", type: "cajas" },
  { id: "a4", who: "Mamá", action: "agregó Microondas", time: "hace 5 h", type: "objetos" },
  { id: "a5", who: "Fabiola", action: "comentó en Escritorio", time: "ayer", type: "objetos" },
  { id: "a6", who: "José", action: "publicó Escritorio para la venta", time: "ayer", type: "ventas" },
];

const primeraNocheItems = ["Documentos", "Cargadores", "Medicamentos", "Ropa", "Higiene", "Toallas", "Papel higiénico", "Agua", "Comida", "Sábanas", "Llaves"];
const tramitesItems = ["Cambio de domicilio", "Internet", "Electricidad", "Gas", "Banco", "Seguro", "Correspondencia", "Suscripciones"];

const ROOMS = ["Living", "Cocina", "Dormitorio", "Baño", "Balcón"];
const TASK_CATEGORIES = ["Compras", "Transporte", "Trámites", "Logística", "Embalaje"];
const PRIORITIES = ["Alta", "Media", "Baja"];

function findMember(members, name) {
  return members.find((m) => m.name === name) || members[0] || { name: "?", color: C.grey };
}

function colorFor(colorKey) {
  return C[colorKey] || C.grey;
}

function keyForColor(colorObj) {
  return Object.keys(C).find((k) => C[k] === colorObj) || "grey";
}

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "ahora";
  if (min < 60) return `hace ${min} min`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `hace ${hr} h`;
  const day = Math.floor(hr / 24);
  if (day === 1) return "ayer";
  return `hace ${day} días`;
}

/* Mapea filas de Supabase (snake_case) al shape que ya usan los componentes */
const mapItem = (r) => ({ id: r.id, name: r.name, room: r.room, decision: r.decision, by: r.by_name, img: r.img || "generic" });
const mapTask = (r) => ({ id: r.id, title: r.title, category: r.category, due: r.due, by: r.by_name, priority: r.priority, done: r.done, completedNote: r.completed_note });
const mapBox = (r) => ({ id: r.id, label: r.label, room: r.room, count: (r.contents || []).length, fragile: r.fragile, by: r.by_name, status: r.status, contents: r.contents || [] });
const mapSale = (r) => ({ id: r.id, item: r.item, room: r.room, estimated: r.estimated, listed: r.listed, status: r.status, by: r.by_name });
const mapActivity = (r) => ({ id: r.id, who: r.who, action: r.action, type: r.type, time: timeAgo(r.created_at) });
const mapMember = (r) => ({ id: r.id, name: r.name, role: r.role, color: colorFor(r.color_key) });

/* ---------------------------------------------------------------------- */
/* ¿QUIÉN SOS? — elegir con qué persona del equipo entrás                 */
/* ---------------------------------------------------------------------- */
function WhoAmI({ members, onPick, onSignOut }) {
  return (
    <div className="w-full min-h-screen flex items-center justify-center px-6" style={{ background: "#EDEDE7", fontFamily: FONT }}>
      <div className="w-full max-w-sm p-8 rounded-[32px] text-center" style={{ background: C.card, boxShadow: "0 20px 50px rgba(0,0,0,0.1)" }}>
        <h1 className="text-xl font-extrabold mb-1" style={{ color: C.ink }}>¿Quién sos?</h1>
        <p className="text-sm mb-6" style={{ color: C.sub }}>Así sabemos qué avatar mostrar en lo que crees.</p>
        <div className="grid grid-cols-2 gap-3">
          {members.map((m) => (
            <button key={m.id} onClick={() => onPick(m.id)} className="flex flex-col items-center gap-2 py-5 rounded-[20px] active:scale-95 transition-transform" style={{ background: C.line }}>
              <Avatar member={m} size={44} />
              <span className="text-sm font-semibold" style={{ color: C.ink }}>{m.name}</span>
            </button>
          ))}
        </div>
        {members.length === 0 && <p className="text-sm" style={{ color: C.sub }}>Todavía no hay personas cargadas en el equipo.</p>}
        <button onClick={onSignOut} className="mt-6 text-xs font-medium" style={{ color: C.sub }}>Cerrar sesión</button>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* SMALL UI PRIMITIVES                                                    */
/* ---------------------------------------------------------------------- */
function Pill({ children, tone = C.grey, active = false, onClick, icon: Icon }) {
  return (
    <button
      onClick={onClick}
      className="shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium transition-all active:scale-95"
      style={{
        background: active ? tone.solid : tone.bg,
        color: active ? "#fff" : tone.fg,
      }}
    >
      {Icon && <Icon size={14} />}
      {children}
    </button>
  );
}

function Avatar({ member, size = 32 }) {
  return (
    <div
      className="rounded-full flex items-center justify-center font-semibold shrink-0"
      style={{
        width: size, height: size, fontSize: size * 0.38,
        background: member.color.solid, color: "#fff",
        border: "2px solid #fff",
      }}
      title={member.name}
    >
      {member.name[0]}
    </div>
  );
}

function AvatarGroup({ members, onClick }) {
  return (
    <button onClick={onClick} className="flex items-center gap-2">
      <div className="flex -space-x-2">
        {members.map((m) => <Avatar key={m.id} member={m} size={28} />)}
      </div>
      <span className="text-sm" style={{ color: C.sub }}>{members.length} personas organizando</span>
    </button>
  );
}

function ProgressBar({ value, tone = C.lilac }) {
  return (
    <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: C.line }}>
      <div className="h-full rounded-full transition-all" style={{ width: `${value}%`, background: tone.solid }} />
    </div>
  );
}

function ScreenHeader({ eyebrow, title, subtitle, right }) {
  return (
    <div className="px-5 pt-6 pb-4 flex items-start justify-between">
      <div>
        {eyebrow && <p className="text-xs font-semibold tracking-wide uppercase mb-1" style={{ color: C.sub }}>{eyebrow}</p>}
        <h1 className="text-2xl font-extrabold leading-tight" style={{ color: C.ink }}>{title}</h1>
        {subtitle && <p className="text-sm mt-1" style={{ color: C.sub }}>{subtitle}</p>}
      </div>
      {right}
    </div>
  );
}

function BottomSheet({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="absolute inset-0 z-40">
      <div className="absolute inset-0" style={{ background: "rgba(23,23,23,0.35)" }} onClick={onClose} />
      <div
        className="absolute left-0 right-0 bottom-0 rounded-t-[28px] px-5 pt-3 pb-6 max-h-[85%] overflow-y-auto"
        style={{ background: C.card, boxShadow: "0 -8px 30px rgba(0,0,0,0.12)" }}
      >
        <div className="w-10 h-1.5 rounded-full mx-auto mb-4" style={{ background: C.line }} />
        {title && (
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold" style={{ color: C.ink }}>{title}</h2>
            <button onClick={onClose} className="p-1.5 rounded-full" style={{ background: C.line }}><X size={16} /></button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

function EmptyState({ title, subtitle, cta, onCta }) {
  return (
    <div className="px-6 py-16 text-center">
      <h3 className="text-xl font-bold mb-2" style={{ color: C.ink }}>{title}</h3>
      <p className="text-sm mb-5" style={{ color: C.sub }}>{subtitle}</p>
      {cta && (
        <button onClick={onCta} className="px-5 py-2.5 rounded-full text-sm font-semibold" style={{ background: C.ink, color: "#fff" }}>
          {cta}
        </button>
      )}
    </div>
  );
}

function FieldLabel({ children }) {
  return <label className="text-xs font-semibold" style={{ color: C.sub }}>{children}</label>;
}

function TextInput(props) {
  return (
    <input
      {...props}
      className="w-full mt-1 p-3 rounded-[16px] text-sm outline-none"
      style={{ background: C.line, color: C.ink }}
    />
  );
}

function PillPicker({ options, value, onChange }) {
  return (
    <div className="flex gap-2 mt-1.5 flex-wrap">
      {options.map((o) => (
        <Pill key={o} tone={C.grey} active={value === o} onClick={() => onChange(o)}>{o}</Pill>
      ))}
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* HOME                                                                    */
/* ---------------------------------------------------------------------- */
function HomeScreen({ project, items, tasks, boxes, activity, members, onSeeTasks, onSeeThings, onOpenTeam, onEditTrip }) {
  const daysLeft = Math.max(0, Math.ceil((new Date(project.movingDate) - new Date()) / 86400000));
  const decided = items.filter((i) => i.decision !== "Sin decidir").length;
  const doneTasks = tasks.filter((t) => t.done).length;
  const readyBoxes = boxes.filter((b) => b.status === "Cerrada" || b.status === "Transportada").length;
  const pct = Math.round(((decided / Math.max(1, items.length)) + (doneTasks / Math.max(1, tasks.length)) + (readyBoxes / Math.max(1, boxes.length))) / 3 * 100);
  const nextTasks = tasks.filter((t) => !t.done).slice(0, 2);
  const suggestPending = items.length - decided;

  return (
    <div className="pb-4">
      <div className="px-5 pt-6">
        <p className="text-xs font-semibold tracking-wide uppercase mb-2" style={{ color: C.sub }}>Mi mudanza</p>
        <h1 className="font-extrabold leading-[0.98]" style={{ color: C.ink, fontSize: 40 }}>
          {daysLeft} días<br />para el gran día.
        </h1>
        <button onClick={onEditTrip} className="flex items-center gap-2 mt-3 text-sm active:scale-95 transition-transform" style={{ color: C.sub }}>
          <span className="font-medium" style={{ color: C.ink }}>{project.origin}</span>
          <ArrowRight size={14} />
          <span className="font-medium" style={{ color: C.ink }}>{project.destination}</span>
          <span>· {project.movingDateLabel}</span>
          <Pencil size={13} style={{ color: C.sub }} />
        </button>
        <button onClick={onSeeThings} className="mt-4 inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-sm font-semibold active:scale-95 transition-transform" style={{ background: C.ink, color: "#fff" }}>
          Seguir organizando <ArrowRight size={15} />
        </button>
      </div>

      {/* hero photos */}
      <div className="mt-6 px-5 flex gap-3 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
        {[
          { key: "sofa", tag: "Decidir", tone: C.grey },
          { key: "desk", tag: "Vender", tone: C.peach },
          { key: "coffee", tag: "Llevar", tone: C.mint },
          { key: "box1", tag: "Empacado", tone: C.sky },
        ].map((p, idx) => (
          <div key={p.key} className="relative shrink-0" style={{ marginTop: idx % 2 ? 14 : 0 }}>
            <img src={photoUrl(p.key, 220, 220)} alt="" className="w-28 h-32 object-cover rounded-[22px]" />
            <span
              className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap"
              style={{ background: p.tone.solid, color: "#fff" }}
            >
              {p.tag}
            </span>
          </div>
        ))}
      </div>

      {/* progress */}
      <div className="mx-5 mt-8 p-5 rounded-[26px]" style={{ background: C.card }}>
        <div className="flex items-baseline justify-between mb-2">
          <p className="text-sm font-semibold" style={{ color: C.ink }}>Tu mudanza</p>
          <p className="text-sm font-bold" style={{ color: C.lilac.fg }}>{pct}% organizada</p>
        </div>
        <ProgressBar value={pct} />
        <div className="flex justify-between mt-4 text-center">
          <div>
            <p className="text-lg font-extrabold" style={{ color: C.ink }}>{decided}</p>
            <p className="text-xs" style={{ color: C.sub }}>cosas decididas</p>
          </div>
          <div>
            <p className="text-lg font-extrabold" style={{ color: C.ink }}>{doneTasks}</p>
            <p className="text-xs" style={{ color: C.sub }}>tareas listas</p>
          </div>
          <div>
            <p className="text-lg font-extrabold" style={{ color: C.ink }}>{readyBoxes}</p>
            <p className="text-xs" style={{ color: C.sub }}>cajas listas</p>
          </div>
        </div>
      </div>

      {/* contextual message */}
      <div className="mx-5 mt-4 p-4 rounded-[22px] flex gap-3 items-start" style={{ background: C.mint.bg }}>
        <Sparkles size={18} style={{ color: C.mint.fg, marginTop: 2 }} />
        <p className="text-sm leading-snug" style={{ color: C.mint.fg }}>
          <span className="font-bold">Vas bien.</span> Esta semana intenta resolver {Math.min(8, Math.max(0, suggestPending))} objetos y completar {Math.max(1, tasks.length - doneTasks > 3 ? 4 : tasks.length - doneTasks)} tareas.
        </p>
      </div>

      {/* next up */}
      <div className="mt-7 px-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold" style={{ color: C.ink }}>Lo próximo</h2>
          <button onClick={onSeeTasks} className="text-sm font-medium flex items-center gap-1" style={{ color: C.sub }}>
            Ver todas <ChevronRight size={14} />
          </button>
        </div>
        {nextTasks.length === 0 ? (
          <p className="text-sm" style={{ color: C.sub }}>No hay tareas pendientes. 🎉</p>
        ) : (
          <div className="space-y-2.5">
            {nextTasks.map((t) => (
              <div key={t.id} className="flex items-center gap-3 p-3.5 rounded-[20px]" style={{ background: C.card }}>
                <Circle size={18} style={{ color: C.sub }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: C.ink }}>{t.title}</p>
                  <p className="text-xs" style={{ color: C.sub }}>vence {t.due}</p>
                </div>
                <Avatar member={findMember(members, t.by)} size={26} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* team */}
      <div className="mt-7 px-5">
        <AvatarGroup members={members} onClick={onOpenTeam} />
      </div>

      {/* activity */}
      <div className="mt-6 px-5">
        <h2 className="text-base font-bold mb-3" style={{ color: C.ink }}>Lo que está pasando</h2>
        <div className="space-y-3">
          {activity.slice(0, 4).map((a) => (
            <div key={a.id} className="flex items-center gap-3">
              <Avatar member={findMember(members, a.who)} size={26} />
              <p className="text-sm flex-1" style={{ color: C.ink }}>
                <span className="font-semibold">{a.who}</span> <span style={{ color: C.sub }}>{a.action}</span>
              </p>
              <span className="text-xs shrink-0" style={{ color: C.sub }}>{a.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* EDITAR VIAJE                                                            */
/* ---------------------------------------------------------------------- */
function EditTripSheet({ open, onClose, project, onSave }) {
  const toInputDate = (d) => {
    const dt = new Date(d);
    const off = dt.getTimezoneOffset();
    const local = new Date(dt.getTime() - off * 60000);
    return local.toISOString().slice(0, 10);
  };
  const [origin, setOrigin] = useState(project.origin);
  const [destination, setDestination] = useState(project.destination);
  const [date, setDate] = useState(toInputDate(project.movingDate));

  if (!open) return null;

  const submit = () => {
    if (!origin.trim() || !destination.trim() || !date) return;
    const d = new Date(date + "T00:00:00");
    const label = d.toLocaleDateString("es-AR", { day: "numeric", month: "long" });
    onSave({ origin, destination, movingDate: d, movingDateLabel: label });
    onClose();
  };

  return (
    <BottomSheet open={open} onClose={onClose} title="Editar viaje">
      <div className="space-y-4">
        <div>
          <FieldLabel>Origen</FieldLabel>
          <TextInput value={origin} onChange={(e) => setOrigin(e.target.value)} placeholder="Ej: Palermo" />
        </div>
        <div>
          <FieldLabel>Destino</FieldLabel>
          <TextInput value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="Ej: La Plata" />
        </div>
        <div>
          <FieldLabel>Fecha de mudanza</FieldLabel>
          <TextInput type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <button
          disabled={!origin.trim() || !destination.trim() || !date}
          onClick={submit}
          className="w-full py-3.5 rounded-full text-sm font-bold"
          style={{ background: origin.trim() && destination.trim() && date ? C.ink : C.line, color: origin.trim() && destination.trim() && date ? "#fff" : C.sub }}
        >
          Guardar cambios
        </button>
      </div>
    </BottomSheet>
  );
}

/* ---------------------------------------------------------------------- */
/* MIS COSAS + CENTRO DE DECISIONES                                       */
/* ---------------------------------------------------------------------- */
const FILTERS = ["Todo", "Sin decidir", "Me llevo", "Vender", "Donar"];

function ItemCard({ item, onOpen }) {
  const tone = decisionMeta[item.decision];
  return (
    <button onClick={onOpen} className="w-full text-left rounded-[22px] overflow-hidden active:scale-[0.98] transition-transform" style={{ background: C.card }}>
      <img src={photoUrl(item.img, 300, 220)} alt="" className="w-full h-32 object-cover" />
      <div className="p-3">
        <p className="text-sm font-semibold truncate" style={{ color: C.ink }}>{item.name}</p>
        <p className="text-xs mb-2" style={{ color: C.sub }}>{item.room}</p>
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: tone.bg, color: tone.fg }}>
            {item.decision}
          </span>
          <span className="text-[11px]" style={{ color: C.sub }}>{item.by}</span>
        </div>
      </div>
    </button>
  );
}

function ItemDetailSheet({ item, onClose, onDecide, onDelete }) {
  const options = [
    { label: "Sin decidir", value: "Sin decidir", icon: HelpCircle, tone: C.grey },
    { label: "Me lo llevo", value: "Me llevo", icon: Heart, tone: C.mint },
    { label: "Vender", value: "Vender", icon: DollarSign, tone: C.peach },
    { label: "Donar", value: "Donar", icon: Gift, tone: C.lilac },
    { label: "Descartar", value: "Descartar", icon: Trash2, tone: C.grey },
  ];
  return (
    <BottomSheet open={!!item} onClose={onClose} title={item?.name}>
      {item && (
        <div>
          <img src={photoUrl(item.img, 500, 300)} alt="" className="w-full h-40 object-cover rounded-[20px] mb-4" />
          <p className="text-sm mb-1" style={{ color: C.sub }}>{item.room} · agregado por {item.by}</p>
          <p className="text-sm font-bold mt-4 mb-2" style={{ color: C.ink }}>¿Qué hacemos con esto?</p>
          <div className="grid grid-cols-2 gap-2.5 mb-4">
            {options.map((o) => {
              const active = item.decision === o.value;
              return (
                <button
                  key={o.value}
                  onClick={() => onDecide(item.id, o.value)}
                  className="flex items-center gap-2 py-3 px-3 rounded-[16px] active:scale-95 transition-transform"
                  style={{ background: active ? o.tone.solid : o.tone.bg }}
                >
                  <o.icon size={16} style={{ color: active ? "#fff" : o.tone.fg }} />
                  <span className="text-sm font-semibold" style={{ color: active ? "#fff" : o.tone.fg }}>{o.label}</span>
                </button>
              );
            })}
          </div>
          <button
            onClick={() => onDelete(item.id)}
            className="w-full py-3 rounded-full text-sm font-semibold flex items-center justify-center gap-2"
            style={{ background: C.peach.bg, color: C.peach.fg }}
          >
            <Trash2 size={15} /> Eliminar objeto
          </button>
        </div>
      )}
    </BottomSheet>
  );
}

function DecisionCenter({ items, onDecide, onClose }) {
  const pending = items.filter((i) => i.decision === "Sin decidir");
  const [idx, setIdx] = useState(0);
  const total = items.length;
  const resolved = total - pending.length;

  if (pending.length === 0) {
    return (
      <div className="absolute inset-0 z-50 flex flex-col" style={{ background: C.bg }}>
        <div className="px-5 pt-6 flex justify-end"><button onClick={onClose}><X size={22} /></button></div>
        <EmptyState title="Nada pendiente." subtitle="Ya decidieron qué hacer con todo. ✨" cta="Volver a Mis cosas" onCta={onClose} />
      </div>
    );
  }

  const current = pending[Math.min(idx, pending.length - 1)];
  const decide = (decision) => {
    onDecide(current.id, decision);
    if (idx >= pending.length - 1) setIdx(0);
  };

  const options = [
    { label: "Me lo llevo", value: "Me llevo", icon: Heart, tone: C.mint },
    { label: "Vender", value: "Vender", icon: DollarSign, tone: C.peach },
    { label: "Donar", value: "Donar", icon: Gift, tone: C.lilac },
    { label: "Descartar", value: "Descartar", icon: Trash2, tone: C.grey },
  ];

  return (
    <div className="absolute inset-0 z-50 flex flex-col" style={{ background: C.bg }}>
      <div className="px-5 pt-6 flex items-center justify-between">
        <p className="text-sm font-semibold" style={{ color: C.sub }}>{resolved} de {total} resueltos</p>
        <button onClick={onClose}><X size={22} /></button>
      </div>
      <div className="px-5 mt-3">
        <ProgressBar value={(resolved / total) * 100} />
      </div>
      <ScreenHeader title="¿Qué hacemos con esto?" />
      <div className="px-5 flex-1 flex flex-col">
        <img src={photoUrl(current.img, 500, 400)} alt="" className="w-full h-56 object-cover rounded-[26px]" />
        <p className="text-xl font-bold mt-4" style={{ color: C.ink }}>{current.name}</p>
        <p className="text-sm" style={{ color: C.sub }}>{current.room}</p>
        <div className="grid grid-cols-2 gap-3 mt-6">
          {options.map((o) => (
            <button
              key={o.value}
              onClick={() => decide(o.value)}
              className="flex flex-col items-center justify-center gap-2 py-6 rounded-[22px] active:scale-95 transition-transform"
              style={{ background: o.tone.bg }}
            >
              <o.icon size={22} style={{ color: o.tone.fg }} />
              <span className="text-sm font-semibold" style={{ color: o.tone.fg }}>{o.label}</span>
            </button>
          ))}
        </div>
        <button onClick={() => setIdx((i) => (i + 1) % pending.length)} className="mt-4 text-sm font-medium self-center" style={{ color: C.sub }}>
          Decidir después →
        </button>
      </div>
    </div>
  );
}

function ThingsScreen({ items, onOpenAdd, onDecisionCenter, onOpenItem }) {
  const [filter, setFilter] = useState("Todo");
  const [query, setQuery] = useState("");
  const filtered = items.filter((i) => (filter === "Todo" || i.decision === filter) && i.name.toLowerCase().includes(query.toLowerCase()));
  const pendingCount = items.filter((i) => i.decision === "Sin decidir").length;

  return (
    <div className="pb-4">
      <ScreenHeader
        eyebrow={null}
        title="Mis cosas"
        subtitle="Decide qué viaja contigo y qué empieza una nueva vida."
      />
      {pendingCount > 0 && (
        <div className="px-5 mb-4">
          <button onClick={onDecisionCenter} className="w-full flex items-center justify-between p-4 rounded-[22px]" style={{ background: C.lilac.bg }}>
            <div className="flex items-center gap-3">
              <HelpCircle size={20} style={{ color: C.lilac.fg }} />
              <div className="text-left">
                <p className="text-sm font-bold" style={{ color: C.lilac.fg }}>Centro de decisiones</p>
                <p className="text-xs" style={{ color: C.lilac.fg }}>{pendingCount} objetos por resolver</p>
              </div>
            </div>
            <ChevronRight size={18} style={{ color: C.lilac.fg }} />
          </button>
        </div>
      )}
      <div className="px-5 mb-3 flex items-center gap-2 p-3 rounded-full" style={{ background: C.card }}>
        <Search size={16} style={{ color: C.sub }} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar en mis cosas"
          className="flex-1 bg-transparent text-sm outline-none"
          style={{ color: C.ink }}
        />
      </div>
      <div className="flex gap-2 px-5 overflow-x-auto pb-3" style={{ scrollbarWidth: "none" }}>
        {FILTERS.map((f) => (
          <Pill key={f} tone={f === "Todo" ? C.grey : decisionMeta[f]} active={filter === f} onClick={() => setFilter(f)}>{f}</Pill>
        ))}
      </div>
      {filtered.length === 0 ? (
        <EmptyState title="Tu casa empieza aquí." subtitle="Agrega las cosas que tienes y decide qué viaja contigo." cta="+ Agregar primera cosa" onCta={onOpenAdd} />
      ) : (
        <div className="grid grid-cols-2 gap-3 px-5">
          {filtered.map((i) => <ItemCard key={i.id} item={i} onOpen={() => onOpenItem(i)} />)}
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* TAREAS                                                                  */
/* ---------------------------------------------------------------------- */
function TasksScreen({ tasks, members, onToggle, meName }) {
  const [tab, setTab] = useState("Todas");
  const tabs = ["Para mí", "Todas", "Próximas", "Completadas"];
  const filtered = tasks.filter((t) => {
    if (tab === "Completadas") return t.done;
    if (tab === "Próximas") return !t.done;
    if (tab === "Para mí") return t.by === meName;
    return true;
  });
  const priorityTone = { Alta: C.peach, Media: C.yellow, Baja: C.grey, Urgente: C.peach };

  return (
    <div className="pb-4">
      <ScreenHeader title="Cosas por hacer" subtitle="Un paso a la vez." />
      <div className="flex gap-2 px-5 overflow-x-auto pb-3" style={{ scrollbarWidth: "none" }}>
        {tabs.map((t) => (
          <Pill key={t} tone={C.grey} active={tab === t} onClick={() => setTab(t)}>{t}</Pill>
        ))}
      </div>
      {filtered.length === 0 ? (
        <EmptyState title="Todo tranquilo por ahora." subtitle="No tienes tareas pendientes." />
      ) : (
        <div className="px-5 space-y-2.5">
          {filtered.map((t) => (
            <div key={t.id} className="flex items-center gap-3 p-4 rounded-[20px]" style={{ background: C.card }}>
              <button onClick={() => onToggle(t.id)}>
                {t.done ? <CheckCircle2 size={22} style={{ color: C.mint.fg }} /> : <Circle size={22} style={{ color: C.sub }} />}
              </button>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate" style={{ color: t.done ? C.sub : C.ink, textDecoration: t.done ? "line-through" : "none" }}>{t.title}</p>
                {t.done ? (
                  <p className="text-xs" style={{ color: C.sub }}>{t.completedNote}</p>
                ) : (
                  <p className="text-xs" style={{ color: C.sub }}>{t.category} · vence {t.due}</p>
                )}
              </div>
              {!t.done && (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0" style={{ background: priorityTone[t.priority].bg, color: priorityTone[t.priority].fg }}>
                  {t.priority}
                </span>
              )}
              <Avatar member={findMember(members, t.by)} size={26} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* CAJAS                                                                   */
/* ---------------------------------------------------------------------- */
const boxStatusTone = { "Vacía": C.grey, "Preparando": C.yellow, "Cerrada": C.sky, "Transportada": C.lilac, "Desempacada": C.mint };

function BoxesScreen({ boxes, members, onOpenBox }) {
  return (
    <div className="pb-4">
      <ScreenHeader title="Todo tiene su lugar." subtitle={`${boxes.length} cajas en total`} />
      {boxes.length === 0 ? (
        <EmptyState title="Todavía no hay cajas." subtitle="Crea tu primera caja para empezar a empacar." />
      ) : (
        <div className="px-5 space-y-3">
          {boxes.map((b) => (
            <button key={b.id} onClick={() => onOpenBox(b)} className="w-full text-left p-4 rounded-[22px] flex items-center gap-3" style={{ background: C.card }}>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0" style={{ background: boxStatusTone[b.status].bg }}>
                <BoxIcon size={22} style={{ color: boxStatusTone[b.status].fg }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold" style={{ color: C.ink }}>{b.label} <span className="font-normal" style={{ color: C.sub }}>· {b.room}</span></p>
                <p className="text-xs mt-0.5" style={{ color: C.sub }}>{b.count} objetos {b.fragile && "· ⚠ Frágil"}</p>
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: boxStatusTone[b.status].bg, color: boxStatusTone[b.status].fg }}>{b.status}</span>
                <Avatar member={findMember(members, b.by)} size={22} />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function BoxDetail({ box, members, onClose }) {
  return (
    <BottomSheet open={!!box} onClose={onClose} title={box?.label}>
      {box && (
        <div>
          <p className="text-sm font-medium mb-1" style={{ color: C.sub }}>{box.room}</p>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: boxStatusTone[box.status].bg, color: boxStatusTone[box.status].fg }}>{box.status}</span>
            {box.fragile && <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: C.peach.bg, color: C.peach.fg }}>⚠ Frágil</span>}
          </div>
          <p className="text-sm font-bold mb-2" style={{ color: C.ink }}>Contenido</p>
          {box.contents.length ? (
            <ul className="space-y-1.5 mb-4">
              {box.contents.map((c) => <li key={c} className="text-sm" style={{ color: C.ink }}>• {c}</li>)}
            </ul>
          ) : <p className="text-sm mb-4" style={{ color: C.sub }}>Todavía no tiene objetos.</p>}
          <div className="flex items-center gap-2 mb-5">
            <Avatar member={findMember(members, box.by)} size={24} />
            <span className="text-sm" style={{ color: C.sub }}>a cargo de {box.by}</span>
          </div>
          <button className="w-full py-3 rounded-full text-sm font-semibold flex items-center justify-center gap-2" style={{ background: C.line, color: C.ink }}>
            <QrCode size={16} /> Ver QR
          </button>
        </div>
      )}
    </BottomSheet>
  );
}

/* ---------------------------------------------------------------------- */
/* VENTAS                                                                   */
/* ---------------------------------------------------------------------- */
const saleStatusTone = { "Pendiente": C.grey, "Sacar fotos": C.yellow, "Publicar": C.yellow, "Publicado": C.sky, "Reservado": C.lilac, "Vendido": C.mint };
const money = (n) => n == null ? "—" : `$${n.toLocaleString("es-AR")}`;

function SalesScreen({ sales, onBack, onOpenAdd }) {
  const conseguido = sales.filter((s) => s.status === "Vendido").reduce((a, s) => a + (s.listed || 0), 0);
  const estimado = sales.reduce((a, s) => a + s.estimated, 0);
  return (
    <div className="pb-4">
      <div className="px-5 pt-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button onClick={onBack}><ChevronLeft size={22} /></button>
          <p className="text-sm font-semibold" style={{ color: C.sub }}>Más</p>
        </div>
        <button onClick={onOpenAdd} className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: C.ink }}>
          <Plus size={18} color="#fff" />
        </button>
      </div>
      <ScreenHeader title="Para vender" subtitle="Cosas que pueden tener una segunda vida." />
      <div className="mx-5 p-5 rounded-[26px] mb-4" style={{ background: C.peach.bg }}>
        <p className="text-2xl font-extrabold" style={{ color: C.peach.fg }}>{money(conseguido)} conseguidos</p>
        <p className="text-sm" style={{ color: C.peach.fg }}>de {money(estimado)} estimados</p>
      </div>
      {sales.length === 0 ? (
        <EmptyState title="Nada para vender todavía." subtitle="Registra una venta para empezar a hacer caja." cta="+ Registrar venta" onCta={onOpenAdd} />
      ) : (
        <div className="px-5 space-y-3">
          {sales.map((s) => (
            <div key={s.id} className="p-4 rounded-[22px] flex items-center gap-3" style={{ background: C.card }}>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold" style={{ color: C.ink }}>{s.item}</p>
                <p className="text-xs" style={{ color: C.sub }}>{s.room} · est. {money(s.estimated)}{s.listed ? ` · pub. ${money(s.listed)}` : ""}</p>
              </div>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0" style={{ background: saleStatusTone[s.status].bg, color: saleStatusTone[s.status].fg }}>{s.status}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* CHECKLISTS (Primera noche / Trámites)                                  */
/* ---------------------------------------------------------------------- */
function ChecklistScreen({ title, subtitle, items, checked, onToggle, onBack, tone }) {
  const done = items.filter((i) => checked[i]).length;
  return (
    <div className="pb-4">
      <div className="px-5 pt-6 flex items-center gap-2">
        <button onClick={onBack}><ChevronLeft size={22} /></button>
        <p className="text-sm font-semibold" style={{ color: C.sub }}>Más</p>
      </div>
      <ScreenHeader title={title} subtitle={subtitle} />
      <div className="px-5 mb-4"><ProgressBar value={(done / items.length) * 100} tone={tone} /></div>
      <div className="px-5 space-y-2">
        {items.map((i) => (
          <button key={i} onClick={() => onToggle(i)} className="w-full flex items-center gap-3 p-3.5 rounded-[18px]" style={{ background: C.card }}>
            {checked[i] ? <CheckCircle2 size={20} style={{ color: tone.fg }} /> : <Circle size={20} style={{ color: C.sub }} />}
            <span className="text-sm font-medium" style={{ color: checked[i] ? C.sub : C.ink, textDecoration: checked[i] ? "line-through" : "none" }}>{i}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* PRESUPUESTO                                                            */
/* ---------------------------------------------------------------------- */
function BudgetScreen({ sales, onBack }) {
  const gastos = 245000;
  const ventas = sales.filter((s) => s.status === "Vendido").reduce((a, s) => a + (s.listed || 0), 0);
  const balance = ventas - gastos;
  const categorias = [
    { name: "Transporte", est: 120000, real: 110000 },
    { name: "Cajas y embalaje", est: 45000, real: 38000 },
    { name: "Limpieza", est: 30000, real: 0 },
    { name: "Alquiler / depósito", est: 500000, real: 0 },
  ];
  return (
    <div className="pb-4">
      <div className="px-5 pt-6 flex items-center gap-2">
        <button onClick={onBack}><ChevronLeft size={22} /></button>
        <p className="text-sm font-semibold" style={{ color: C.sub }}>Más</p>
      </div>
      <ScreenHeader title="Presupuesto" />
      <div className="px-5 grid grid-cols-2 gap-3 mb-5">
        <div className="p-4 rounded-[22px]" style={{ background: C.card }}>
          <p className="text-xs mb-1" style={{ color: C.sub }}>Gastos actuales</p>
          <p className="text-lg font-extrabold" style={{ color: C.ink }}>{money(gastos)}</p>
        </div>
        <div className="p-4 rounded-[22px]" style={{ background: C.card }}>
          <p className="text-xs mb-1" style={{ color: C.sub }}>Ventas</p>
          <p className="text-lg font-extrabold" style={{ color: C.mint.fg }}>{money(ventas)}</p>
        </div>
        <div className="p-4 rounded-[22px] col-span-2" style={{ background: balance >= 0 ? C.mint.bg : C.peach.bg }}>
          <p className="text-xs mb-1" style={{ color: balance >= 0 ? C.mint.fg : C.peach.fg }}>Balance</p>
          <p className="text-lg font-extrabold" style={{ color: balance >= 0 ? C.mint.fg : C.peach.fg }}>{money(balance)}</p>
        </div>
      </div>
      <p className="px-5 text-sm font-bold mb-2" style={{ color: C.ink }}>Categorías</p>
      <div className="px-5 space-y-2">
        {categorias.map((c) => (
          <div key={c.name} className="flex items-center justify-between p-3.5 rounded-[18px]" style={{ background: C.card }}>
            <span className="text-sm font-medium" style={{ color: C.ink }}>{c.name}</span>
            <span className="text-sm" style={{ color: C.sub }}>{money(c.real)} / {money(c.est)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* ACTIVIDAD                                                              */
/* ---------------------------------------------------------------------- */
function ActivityScreen({ activity, members, onBack }) {
  const [f, setF] = useState("Todo");
  const filters = ["Todo", "objetos", "tareas", "cajas", "ventas"];
  const filtered = activity.filter((a) => f === "Todo" || a.type === f);
  return (
    <div className="pb-4">
      <div className="px-5 pt-6 flex items-center gap-2">
        <button onClick={onBack}><ChevronLeft size={22} /></button>
        <p className="text-sm font-semibold" style={{ color: C.sub }}>Más</p>
      </div>
      <ScreenHeader title="Actividad" />
      <div className="flex gap-2 px-5 overflow-x-auto pb-3" style={{ scrollbarWidth: "none" }}>
        {filters.map((x) => <Pill key={x} tone={C.grey} active={f === x} onClick={() => setF(x)}>{x === "Todo" ? "Todo" : x[0].toUpperCase() + x.slice(1)}</Pill>)}
      </div>
      <div className="px-5 space-y-4 mt-2">
        {filtered.map((a) => (
          <div key={a.id} className="flex items-center gap-3">
            <Avatar member={findMember(members, a.who)} size={30} />
            <p className="text-sm flex-1" style={{ color: C.ink }}>
              <span className="font-semibold">{a.who}</span> <span style={{ color: C.sub }}>{a.action}</span>
            </p>
            <span className="text-xs shrink-0" style={{ color: C.sub }}>{a.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* MÁS                                                                    */
/* ---------------------------------------------------------------------- */
function MoreScreen({ onNav, onOpenTeam, onEditTrip, onSignOut }) {
  const menu = [
    { key: "trip", label: "Editar viaje", icon: MapPin, tone: C.lilac },
    { key: "sales", label: "Para vender", icon: DollarSign, tone: C.peach },
    { key: "budget", label: "Presupuesto", icon: Wallet, tone: C.sky },
    { key: "night", label: "Primera noche", icon: Moon, tone: C.lilac },
    { key: "papers", label: "Antes de irte", icon: ClipboardList, tone: C.yellow },
    { key: "activity", label: "Actividad", icon: ActivityIcon, tone: C.mint },
    { key: "team", label: "Equipo", icon: Users, tone: C.grey },
  ];
  return (
    <div className="pb-4">
      <ScreenHeader title="Más" />
      <div className="px-5 space-y-2.5">
        {menu.map((m) => (
          <button
            key={m.key}
            onClick={() => (m.key === "team" ? onOpenTeam() : m.key === "trip" ? onEditTrip() : onNav(m.key))}
            className="w-full flex items-center gap-3 p-4 rounded-[20px]"
            style={{ background: C.card }}
          >
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: m.tone.bg }}>
              <m.icon size={18} style={{ color: m.tone.fg }} />
            </div>
            <span className="flex-1 text-left text-sm font-semibold" style={{ color: C.ink }}>{m.label}</span>
            <ChevronRight size={18} style={{ color: C.sub }} />
          </button>
        ))}
        {onSignOut && (
          <button onClick={onSignOut} className="w-full flex items-center gap-3 p-4 rounded-[20px]" style={{ background: C.card }}>
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: C.grey.bg }}>
              <LogOut size={18} style={{ color: C.grey.fg }} />
            </div>
            <span className="flex-1 text-left text-sm font-semibold" style={{ color: C.ink }}>Cerrar sesión</span>
          </button>
        )}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* TEAM SHEET                                                             */
/* ---------------------------------------------------------------------- */
function TeamSheet({ open, onClose, members, onAddMember }) {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");

  const close = () => { setAdding(false); setName(""); onClose(); };
  const submit = () => {
    if (!name.trim()) return;
    onAddMember(name.trim());
    setName("");
    setAdding(false);
  };

  return (
    <BottomSheet open={open} onClose={close} title="Equipo">
      <div className="space-y-3 mb-4">
        {members.map((m) => (
          <div key={m.id} className="flex items-center gap-3 p-3 rounded-[18px]" style={{ background: C.line }}>
            <Avatar member={m} size={40} />
            <div>
              <p className="text-sm font-bold" style={{ color: C.ink }}>{m.name}</p>
              <p className="text-xs" style={{ color: C.sub }}>{m.role}</p>
            </div>
          </div>
        ))}
      </div>
      {adding ? (
        <div className="space-y-3">
          <div>
            <FieldLabel>Nombre</FieldLabel>
            <TextInput value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Tío Marcos" autoFocus />
          </div>
          <div className="flex gap-2">
            <button onClick={() => { setAdding(false); setName(""); }} className="flex-1 py-3 rounded-full text-sm font-semibold" style={{ background: C.line, color: C.ink }}>
              Cancelar
            </button>
            <button
              disabled={!name.trim()}
              onClick={submit}
              className="flex-1 py-3 rounded-full text-sm font-bold"
              style={{ background: name.trim() ? C.ink : C.line, color: name.trim() ? "#fff" : C.sub }}
            >
              Agregar
            </button>
          </div>
        </div>
      ) : (
        <button onClick={() => setAdding(true)} className="w-full py-3.5 rounded-full text-sm font-bold flex items-center justify-center gap-2" style={{ background: C.lilac.bg, color: C.lilac.fg }}>
          <UserPlus size={16} /> Agregar persona
        </button>
      )}
    </BottomSheet>
  );
}

/* ---------------------------------------------------------------------- */
/* ADD SHEET + FAB                                                        */
/* ---------------------------------------------------------------------- */
function AddSheet({ open, onClose, initialStep = "menu", onCreateItem, onCreateTask, onCreateBox, onCreateSale }) {
  const [step, setStep] = useState(initialStep);
  const [lastOpen, setLastOpen] = useState(open);
  if (open && !lastOpen && step !== initialStep) setStep(initialStep);
  if (open !== lastOpen) setLastOpen(open);
  const [name, setName] = useState("");
  const [room, setRoom] = useState("Living");

  const [taskTitle, setTaskTitle] = useState("");
  const [taskCategory, setTaskCategory] = useState(TASK_CATEGORIES[0]);
  const [taskDue, setTaskDue] = useState("");
  const [taskPriority, setTaskPriority] = useState("Media");

  const [boxLabel, setBoxLabel] = useState("");
  const [boxRoom, setBoxRoom] = useState("Living");
  const [boxFragile, setBoxFragile] = useState(false);

  const [saleItem, setSaleItem] = useState("");
  const [saleRoom, setSaleRoom] = useState("Living");
  const [saleEstimated, setSaleEstimated] = useState("");

  const resetAll = () => {
    setName(""); setRoom("Living");
    setTaskTitle(""); setTaskCategory(TASK_CATEGORIES[0]); setTaskDue(""); setTaskPriority("Media");
    setBoxLabel(""); setBoxRoom("Living"); setBoxFragile(false);
    setSaleItem(""); setSaleRoom("Living"); setSaleEstimated("");
  };

  const close = () => { setStep("menu"); resetAll(); onClose(); };

  const titles = {
    menu: "¿Qué querés agregar?",
    item: "Agregar cosa",
    task: "Crear tarea",
    box: "Crear caja",
    sale: "Registrar venta",
  };

  return (
    <BottomSheet open={open} onClose={close} title={titles[step]}>
      {step === "menu" && (
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Agregar cosa", icon: Package, tone: C.lilac, action: () => setStep("item") },
            { label: "Crear tarea", icon: CheckSquare, tone: C.mint, action: () => setStep("task") },
            { label: "Crear caja", icon: BoxIcon, tone: C.sky, action: () => setStep("box") },
            { label: "Registrar venta", icon: DollarSign, tone: C.peach, action: () => setStep("sale") },
          ].map((o) => (
            <button key={o.label} onClick={o.action} className="flex flex-col items-center gap-2 py-6 rounded-[22px]" style={{ background: o.tone.bg }}>
              <o.icon size={20} style={{ color: o.tone.fg }} />
              <span className="text-sm font-semibold" style={{ color: o.tone.fg }}>{o.label}</span>
            </button>
          ))}
        </div>
      )}

      {step === "item" && (
        <div className="space-y-4">
          <div className="flex gap-3">
            <div className="flex-1 flex flex-col items-center justify-center gap-1.5 py-6 rounded-[20px]" style={{ background: C.line }}>
              <Camera size={20} style={{ color: C.ink }} />
              <span className="text-xs font-semibold" style={{ color: C.ink }}>Tomar foto</span>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center gap-1.5 py-6 rounded-[20px]" style={{ background: C.line }}>
              <ImageIcon size={20} style={{ color: C.ink }} />
              <span className="text-xs font-semibold" style={{ color: C.ink }}>Subir foto</span>
            </div>
          </div>
          <div>
            <FieldLabel>Nombre</FieldLabel>
            <TextInput value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Silla de escritorio" />
          </div>
          <div>
            <FieldLabel>Habitación</FieldLabel>
            <PillPicker options={ROOMS} value={room} onChange={setRoom} />
          </div>
          <button
            disabled={!name.trim()}
            onClick={() => { onCreateItem({ name, room }); close(); }}
            className="w-full py-3.5 rounded-full text-sm font-bold"
            style={{ background: name.trim() ? C.ink : C.line, color: name.trim() ? "#fff" : C.sub }}
          >
            Guardar
          </button>
        </div>
      )}

      {step === "task" && (
        <div className="space-y-4">
          <div>
            <FieldLabel>Título</FieldLabel>
            <TextInput value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} placeholder="Ej: Reservar el flete" />
          </div>
          <div>
            <FieldLabel>Categoría</FieldLabel>
            <PillPicker options={TASK_CATEGORIES} value={taskCategory} onChange={setTaskCategory} />
          </div>
          <div>
            <FieldLabel>Vence</FieldLabel>
            <TextInput value={taskDue} onChange={(e) => setTaskDue(e.target.value)} placeholder="Ej: 20 OCT o mañana" />
          </div>
          <div>
            <FieldLabel>Prioridad</FieldLabel>
            <PillPicker options={PRIORITIES} value={taskPriority} onChange={setTaskPriority} />
          </div>
          <button
            disabled={!taskTitle.trim()}
            onClick={() => { onCreateTask({ title: taskTitle, category: taskCategory, due: taskDue.trim() || "sin fecha", priority: taskPriority }); close(); }}
            className="w-full py-3.5 rounded-full text-sm font-bold"
            style={{ background: taskTitle.trim() ? C.ink : C.line, color: taskTitle.trim() ? "#fff" : C.sub }}
          >
            Crear tarea
          </button>
        </div>
      )}

      {step === "box" && (
        <div className="space-y-4">
          <div>
            <FieldLabel>Nombre de la caja</FieldLabel>
            <TextInput value={boxLabel} onChange={(e) => setBoxLabel(e.target.value)} placeholder="Ej: Caja 13" />
          </div>
          <div>
            <FieldLabel>Habitación</FieldLabel>
            <PillPicker options={ROOMS} value={boxRoom} onChange={setBoxRoom} />
          </div>
          <button
            onClick={() => setBoxFragile((v) => !v)}
            className="w-full flex items-center justify-between p-3.5 rounded-[16px]"
            style={{ background: boxFragile ? C.peach.bg : C.line }}
          >
            <span className="text-sm font-semibold" style={{ color: boxFragile ? C.peach.fg : C.ink }}>⚠ Contiene objetos frágiles</span>
            {boxFragile ? <CheckCircle2 size={20} style={{ color: C.peach.fg }} /> : <Circle size={20} style={{ color: C.sub }} />}
          </button>
          <button
            disabled={!boxLabel.trim()}
            onClick={() => { onCreateBox({ label: boxLabel, room: boxRoom, fragile: boxFragile }); close(); }}
            className="w-full py-3.5 rounded-full text-sm font-bold"
            style={{ background: boxLabel.trim() ? C.ink : C.line, color: boxLabel.trim() ? "#fff" : C.sub }}
          >
            Crear caja
          </button>
        </div>
      )}

      {step === "sale" && (
        <div className="space-y-4">
          <div>
            <FieldLabel>Objeto</FieldLabel>
            <TextInput value={saleItem} onChange={(e) => setSaleItem(e.target.value)} placeholder="Ej: Bicicleta fija" />
          </div>
          <div>
            <FieldLabel>Habitación</FieldLabel>
            <PillPicker options={ROOMS} value={saleRoom} onChange={setSaleRoom} />
          </div>
          <div>
            <FieldLabel>Precio estimado</FieldLabel>
            <TextInput type="number" inputMode="numeric" value={saleEstimated} onChange={(e) => setSaleEstimated(e.target.value)} placeholder="Ej: 50000" />
          </div>
          <button
            disabled={!saleItem.trim() || !saleEstimated}
            onClick={() => { onCreateSale({ item: saleItem, room: saleRoom, estimated: Number(saleEstimated) || 0 }); close(); }}
            className="w-full py-3.5 rounded-full text-sm font-bold"
            style={{ background: saleItem.trim() && saleEstimated ? C.ink : C.line, color: saleItem.trim() && saleEstimated ? "#fff" : C.sub }}
          >
            Registrar venta
          </button>
        </div>
      )}
    </BottomSheet>
  );
}

function FAB({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="absolute z-30 w-14 h-14 rounded-full flex items-center justify-center active:scale-95 transition-transform"
      style={{ right: 18, bottom: 92, background: C.ink, boxShadow: "0 10px 24px rgba(23,23,23,0.28)" }}
    >
      <Plus size={26} color="#fff" />
    </button>
  );
}

function BottomNav({ tab, setTab }) {
  const items = [
    { key: "home", label: "Inicio", icon: HomeIcon },
    { key: "things", label: "Mis cosas", icon: Package },
    { key: "tasks", label: "Tareas", icon: CheckSquare },
    { key: "boxes", label: "Cajas", icon: BoxIcon },
    { key: "more", label: "Más", icon: MoreHorizontal },
  ];
  return (
    <div
      className="absolute left-0 right-0 bottom-0 z-30 flex items-stretch px-2"
      style={{ background: C.card, borderTop: `1px solid ${C.line}`, paddingBottom: "env(safe-area-inset-bottom, 10px)" }}
    >
      {items.map((it) => {
        const active = tab === it.key;
        return (
          <button key={it.key} onClick={() => setTab(it.key)} className="flex-1 flex flex-col items-center gap-1 py-2.5">
            <it.icon size={21} style={{ color: active ? C.ink : C.sub }} strokeWidth={active ? 2.4 : 2} />
            <span className="text-[10px] font-semibold" style={{ color: active ? C.ink : C.sub }}>{it.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* APP ROOT                                                                */
/* ---------------------------------------------------------------------- */
export default function App() {
  const [session, setSession] = useState(undefined); // undefined = cargando, null = sin sesión
  const [profile, setProfile] = useState(undefined); // fila de profiles del usuario logueado
  const [meMemberId, setMeMemberId] = useState(() => localStorage.getItem("mudanza_member_id"));

  const [project, setProject] = useState(null);
  const [items, setItems] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [boxes, setBoxes] = useState([]);
  const [sales, setSales] = useState([]);
  const [activity, setActivity] = useState([]);
  const [members, setMembers] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);

  const [tab, setTab] = useState("home");
  const [decisionCenterOpen, setDecisionCenterOpen] = useState(false);
  const [teamOpen, setTeamOpen] = useState(false);
  const [tripOpen, setTripOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [addStep, setAddStep] = useState("menu");
  const [boxDetail, setBoxDetail] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [moreScreen, setMoreScreen] = useState(null); // sales | budget | night | papers | activity
  const [nightChecked, setNightChecked] = useState({});
  const [papersChecked, setPapersChecked] = useState({});

  const meName = findMember(members, undefined) && members.find((m) => m.id === meMemberId)?.name;
  const householdId = profile?.household_id;

  /* --- auth --- */
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  /* --- perfil (mapea el usuario logueado a un hogar) --- */
  useEffect(() => {
    if (!session) { setProfile(session === null ? null : undefined); return; }
    supabase.from("profiles").select("*").eq("id", session.user.id).maybeSingle()
      .then(({ data }) => setProfile(data ?? null));
  }, [session]);

  /* --- traer todos los datos del hogar + suscripción en vivo --- */
  const fetchAll = useCallback(async (hid) => {
    const [h, mem, it, tk, bx, sl, ac] = await Promise.all([
      supabase.from("households").select("*").eq("id", hid).single(),
      supabase.from("household_members").select("*").eq("household_id", hid).order("created_at"),
      supabase.from("items").select("*").eq("household_id", hid).order("created_at", { ascending: false }),
      supabase.from("tasks").select("*").eq("household_id", hid).order("created_at", { ascending: false }),
      supabase.from("boxes").select("*").eq("household_id", hid).order("created_at", { ascending: false }),
      supabase.from("sales").select("*").eq("household_id", hid).order("created_at", { ascending: false }),
      supabase.from("activity").select("*").eq("household_id", hid).order("created_at", { ascending: false }).limit(50),
    ]);
    if (h.data) setProject({
      origin: h.data.origin, destination: h.data.destination,
      movingDate: h.data.moving_date,
      movingDateLabel: new Date(h.data.moving_date + "T00:00:00").toLocaleDateString("es-AR", { day: "numeric", month: "long" }),
    });
    if (mem.data) setMembers(mem.data.map(mapMember));
    if (it.data) setItems(it.data.map(mapItem));
    if (tk.data) setTasks(tk.data.map(mapTask));
    if (bx.data) setBoxes(bx.data.map(mapBox));
    if (sl.data) setSales(sl.data.map(mapSale));
    if (ac.data) setActivity(ac.data.map(mapActivity));
  }, []);

  useEffect(() => {
    if (!householdId) return;
    setDataLoading(true);
    fetchAll(householdId).finally(() => setDataLoading(false));

    const channel = supabase
      .channel(`household-${householdId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "items", filter: `household_id=eq.${householdId}` }, () => fetchAll(householdId))
      .on("postgres_changes", { event: "*", schema: "public", table: "tasks", filter: `household_id=eq.${householdId}` }, () => fetchAll(householdId))
      .on("postgres_changes", { event: "*", schema: "public", table: "boxes", filter: `household_id=eq.${householdId}` }, () => fetchAll(householdId))
      .on("postgres_changes", { event: "*", schema: "public", table: "sales", filter: `household_id=eq.${householdId}` }, () => fetchAll(householdId))
      .on("postgres_changes", { event: "*", schema: "public", table: "activity", filter: `household_id=eq.${householdId}` }, () => fetchAll(householdId))
      .on("postgres_changes", { event: "*", schema: "public", table: "household_members", filter: `household_id=eq.${householdId}` }, () => fetchAll(householdId))
      .on("postgres_changes", { event: "*", schema: "public", table: "households", filter: `id=eq.${householdId}` }, () => fetchAll(householdId))
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [householdId, fetchAll]);

  const logActivity = async (who, action, type) => {
    await supabase.from("activity").insert({ household_id: householdId, who, action, type });
  };

  const openAdd = (step = "menu") => { setAddStep(step); setAddOpen(true); };
  const closeAdd = () => { setAddOpen(false); setAddStep("menu"); };

  const decide = async (id, decision) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, decision } : i)));
    setSelectedItem((prev) => (prev && prev.id === id ? { ...prev, decision } : prev));
    const it = items.find((i) => i.id === id);
    await supabase.from("items").update({ decision }).eq("id", id);
    if (it) logActivity(meName, `marcó ${it.name} como ${decision}`, "objetos");
  };
  const deleteItem = async (id) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    setSelectedItem(null);
    await supabase.from("items").delete().eq("id", id);
  };

  const toggleTask = async (id) => {
    const t = tasks.find((x) => x.id === id);
    if (!t) return;
    const done = !t.done;
    const completed_note = done ? `Completada por ${meName} · ahora` : null;
    setTasks((prev) => prev.map((x) => (x.id === id ? { ...x, done, completedNote: completed_note } : x)));
    await supabase.from("tasks").update({ done, completed_note }).eq("id", id);
    if (done) logActivity(meName, `completó ${t.title}`, "tareas");
  };

  const addItem = async ({ name, room }) => {
    const imgOptions = ["sofa", "desk", "lamp", "shelf", "table", "mirror", "generic"];
    const img = imgOptions[items.length % imgOptions.length];
    await supabase.from("items").insert({ household_id: householdId, name, room, decision: "Sin decidir", img, by_name: meName });
    logActivity(meName, `agregó ${name}`, "objetos");
  };

  const addTask = async ({ title, category, due, priority }) => {
    await supabase.from("tasks").insert({ household_id: householdId, title, category, due, priority, done: false, by_name: meName });
    logActivity(meName, `creó la tarea ${title}`, "tareas");
  };

  const addBox = async ({ label, room, fragile }) => {
    await supabase.from("boxes").insert({ household_id: householdId, label, room, fragile, status: "Vacía", contents: [], by_name: meName });
    logActivity(meName, `agregó ${label}`, "cajas");
  };

  const addSale = async ({ item, room, estimated }) => {
    await supabase.from("sales").insert({ household_id: householdId, item, room, estimated, listed: null, status: "Pendiente", by_name: meName });
    logActivity(meName, `registró la venta de ${item}`, "ventas");
  };

  const addMember = async (name) => {
    const usedKeys = members.map((m) => keyForColor(m.color));
    const colorKeys = ["lilac", "sky", "mint", "peach", "yellow", "grey"];
    const color_key = colorKeys.find((k) => !usedKeys.includes(k)) || colorKeys[members.length % colorKeys.length];
    await supabase.from("household_members").insert({ household_id: householdId, name, role: "Miembro", color_key });
    logActivity(meName, `agregó a ${name} al equipo`, "equipo");
  };

  const saveTrip = async ({ origin, destination, movingDate }) => {
    const iso = movingDate.toISOString().slice(0, 10);
    await supabase.from("households").update({ origin, destination, moving_date: iso }).eq("id", householdId);
  };

  const pickWho = (id) => {
    localStorage.setItem("mudanza_member_id", id);
    setMeMemberId(id);
  };

  const signOut = async () => {
    localStorage.removeItem("mudanza_member_id");
    setMeMemberId(null);
    await supabase.auth.signOut();
  };

  const goMore = (screen) => setMoreScreen(screen);
  const backFromMore = () => setMoreScreen(null);

  /* --- pantallas de carga / acceso --- */
  if (session === undefined || (session && profile === undefined)) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center" style={{ background: "#EDEDE7", fontFamily: FONT }}>
        <p style={{ color: C.sub }}>Cargando...</p>
      </div>
    );
  }
  if (!session) return <Login />;
  if (!profile) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center px-6 text-center" style={{ background: "#EDEDE7", fontFamily: FONT }}>
        <div>
          <p className="text-lg font-bold mb-2" style={{ color: C.ink }}>Todavía no tenés acceso</p>
          <p className="text-sm" style={{ color: C.sub }}>Pedile al administrador que te vincule a la mudanza desde Supabase.</p>
          <button onClick={signOut} className="mt-4 text-sm font-medium" style={{ color: C.sub }}>Cerrar sesión</button>
        </div>
      </div>
    );
  }
  if (dataLoading || !project) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center" style={{ background: "#EDEDE7", fontFamily: FONT }}>
        <p style={{ color: C.sub }}>Cargando tu mudanza...</p>
      </div>
    );
  }
  if (!meMemberId || !members.find((m) => m.id === meMemberId)) {
    return <WhoAmI members={members} onPick={pickWho} onSignOut={signOut} />;
  }

  return (
    <div className="w-full min-h-screen flex items-center justify-center py-8" style={{ background: "#EDEDE7", fontFamily: FONT }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');`}</style>
      <div
        className="relative w-full overflow-hidden"
        style={{ maxWidth: 412, height: 844, background: C.bg, borderRadius: 44, boxShadow: "0 30px 60px rgba(0,0,0,0.18)" }}
      >
        <div className="absolute inset-0 overflow-y-auto pb-24" style={{ scrollbarWidth: "none" }}>
          {tab === "home" && (
            <HomeScreen
              project={project} items={items} tasks={tasks} boxes={boxes} activity={activity} members={members}
              onSeeTasks={() => setTab("tasks")} onSeeThings={() => setTab("things")} onOpenTeam={() => setTeamOpen(true)}
              onEditTrip={() => setTripOpen(true)}
            />
          )}
          {tab === "things" && (
            <ThingsScreen items={items} onOpenAdd={() => openAdd("item")} onDecisionCenter={() => setDecisionCenterOpen(true)} onOpenItem={setSelectedItem} />
          )}
          {tab === "tasks" && <TasksScreen tasks={tasks} members={members} onToggle={toggleTask} meName={meName} />}
          {tab === "boxes" && <BoxesScreen boxes={boxes} members={members} onOpenBox={setBoxDetail} />}
          {tab === "more" && !moreScreen && <MoreScreen onNav={goMore} onOpenTeam={() => setTeamOpen(true)} onEditTrip={() => setTripOpen(true)} onSignOut={signOut} />}
          {tab === "more" && moreScreen === "sales" && <SalesScreen sales={sales} onBack={backFromMore} onOpenAdd={() => openAdd("sale")} />}
          {tab === "more" && moreScreen === "budget" && <BudgetScreen sales={sales} onBack={backFromMore} />}
          {tab === "more" && moreScreen === "activity" && <ActivityScreen activity={activity} members={members} onBack={backFromMore} />}
          {tab === "more" && moreScreen === "night" && (
            <ChecklistScreen title="Primera noche" subtitle="Lo esencial, a mano, desde el minuto uno." items={primeraNocheItems} checked={nightChecked} onToggle={(k) => setNightChecked((p) => ({ ...p, [k]: !p[k] }))} onBack={backFromMore} tone={C.lilac} />
          )}
          {tab === "more" && moreScreen === "papers" && (
            <ChecklistScreen title="Antes de irte" subtitle="Los trámites que no podés dejar pasar." items={tramitesItems} checked={papersChecked} onToggle={(k) => setPapersChecked((p) => ({ ...p, [k]: !p[k] }))} onBack={backFromMore} tone={C.yellow} />
          )}
        </div>

        {decisionCenterOpen && (
          <DecisionCenter items={items} onDecide={decide} onClose={() => setDecisionCenterOpen(false)} />
        )}

        {!decisionCenterOpen && (tab === "things" || tab === "tasks" || tab === "boxes") && <FAB onClick={() => openAdd("menu")} />}

        <BottomNav tab={tab} setTab={(t) => { setTab(t); setMoreScreen(null); }} />

        <TeamSheet open={teamOpen} onClose={() => setTeamOpen(false)} members={members} onAddMember={addMember} />
        <EditTripSheet open={tripOpen} onClose={() => setTripOpen(false)} project={project} onSave={saveTrip} />
        <AddSheet
          open={addOpen}
          initialStep={addStep}
          onClose={closeAdd}
          onCreateItem={addItem}
          onCreateTask={addTask}
          onCreateBox={addBox}
          onCreateSale={addSale}
        />
        <BoxDetail box={boxDetail} members={members} onClose={() => setBoxDetail(null)} />
        <ItemDetailSheet item={selectedItem} onClose={() => setSelectedItem(null)} onDecide={decide} onDelete={deleteItem} />
      </div>
    </div>
  );
}
