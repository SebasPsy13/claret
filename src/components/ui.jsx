import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ESTADOS, GRADOS, SECCIONES, iniciales, nombreCompleto } from '../lib/constants'
import { useApp } from '../lib/AppContext'

export const spring = { type: 'spring', stiffness: 380, damping: 32 }

export function Modal({ children, onClose, wide, layoutId, title, subtitle, actions }) {
  useEffect(() => {
    const h = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h)
  }, [onClose])
  return (
    <motion.div className="overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <motion.div className={`sheet ${wide ? 'wide' : ''}`} layoutId={layoutId} initial={layoutId ? false : { y: 40, scale: 0.96, opacity: 0 }} animate={{ y: 0, scale: 1, opacity: 1 }} exit={{ y: 30, scale: 0.97, opacity: 0 }} transition={spring}>
        <div className="sheet-head">
          <div><h2>{title}</h2>{subtitle && <p className="muted">{subtitle}</p>}</div>
          <div className="row gap">{actions}<button className="icon-btn" onClick={onClose} aria-label="Cerrar">✕</button></div>
        </div>
        <div className="sheet-body">{children}</div>
      </motion.div>
    </motion.div>
  )
}

export const Badge = ({ estado }) => <span className={`badge ${ESTADOS[estado]?.cls}`}>{ESTADOS[estado]?.label || estado}</span>
export const Avatar = ({ s, size = 40 }) => <span className="avatar" style={{ width: size, height: size, fontSize: size * 0.38 }}>{iniciales(s)}</span>
export const Empty = ({ children }) => <div className="empty">{children}</div>

export function Field({ label, children, span }) {
  return <label className="field" style={span ? { gridColumn: `span ${span}` } : null}><span>{label}</span>{children}</label>
}

export function SalonSelect({ grado, seccion, onChange, allowNone }) {
  return (
    <div className="row gap">
      <select value={grado || ''} onChange={(e) => onChange(e.target.value, seccion || 'A')}>
        {allowNone && <option value="">— Sin salón —</option>}
        {GRADOS.map((g) => <option key={g.key} value={g.key}>{g.label}</option>)}
      </select>
      {grado && <select value={seccion || 'A'} onChange={(e) => onChange(grado, e.target.value)} style={{ maxWidth: 90 }}>{SECCIONES.map((s) => <option key={s}>{s}</option>)}</select>}
    </div>
  )
}

export function StudentSelect({ value, onChange }) {
  const { students } = useApp()
  const [q, setQ] = useState('')
  const sel = students.find((s) => s.id === value)
  const res = q.length > 1 ? students.filter((s) => nombreCompleto(s).toLowerCase().includes(q.toLowerCase())).slice(0, 6) : []
  return (
    <div className="ss">
      {sel ? <div className="chip-sel"><Avatar s={sel} size={26} />{nombreCompleto(sel)}<button className="icon-btn sm" onClick={() => onChange('')}>✕</button></div>
        : <input placeholder="Buscar alumno (opcional)…" value={q} onChange={(e) => setQ(e.target.value)} />}
      {res.length > 0 && <div className="ss-list">{res.map((s) => <button key={s.id} onClick={() => { onChange(s.id); setQ('') }}><Avatar s={s} size={26} />{nombreCompleto(s)}<small>{s.grado} {s.seccion}</small></button>)}</div>}
    </div>
  )
}

export { AnimatePresence, motion }
