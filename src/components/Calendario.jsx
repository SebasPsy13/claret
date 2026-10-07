import { useMemo, useState } from 'react'
import { useApp } from '../lib/AppContext'
import { TIPOS, pad, hoy, fechaLarga } from '../lib/constants'
import { AtencionRow } from './Dashboard'
import { Empty, motion, AnimatePresence } from './ui'

export const PSI_COLORS = ['#ff7a1a', '#5b8def', '#34a853', '#9b6bff', '#e5487a', '#14b8a6', '#c28a00']
const DIAS = ['L', 'M', 'M', 'J', 'V', 'S', 'D']

export default function Calendario() {
  const { atenciones, profiles, push } = useApp()
  const [cur, setCur] = useState(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1) })
  const [sel, setSel] = useState(hoy())
  const [who, setWho] = useState('all')
  const color = (id) => PSI_COLORS[Math.max(0, profiles.findIndex((p) => p.id === id)) % PSI_COLORS.length]
  const y = cur.getFullYear(); const m = cur.getMonth()
  const first = (new Date(y, m, 1).getDay() + 6) % 7
  const days = new Date(y, m + 1, 0).getDate()
  const cells = Array.from({ length: Math.ceil((first + days) / 7) * 7 }, (_, i) => (i >= first && i < first + days ? i - first + 1 : null))
  const by = useMemo(() => { const o = {}; atenciones.filter((a) => who === 'all' || a.psicologo_id === who).forEach((a) => (o[a.fecha] ||= []).push(a)); return o }, [atenciones, who])
  const key = (d) => `${y}-${pad(m + 1)}-${pad(d)}`
  const dayList = (by[sel] || []).slice().sort((a, b) => (a.data?.hora_programada || a.hora_inicio || '').localeCompare(b.data?.hora_programada || b.hora_inicio || ''))
  const go = (n) => setCur(new Date(y, m + n, 1))

  return (
    <div className="cal-layout">
      <div className="card">
        <div className="card-h">
          <h3 style={{ textTransform: 'capitalize' }}>{cur.toLocaleDateString('es-PE', { month: 'long', year: 'numeric' })}</h3>
          <div className="row gap"><button className="icon-btn" onClick={() => go(-1)}>‹</button><button className="btn soft sm" onClick={() => { setCur(new Date(new Date().getFullYear(), new Date().getMonth(), 1)); setSel(hoy()) }}>Hoy</button><button className="icon-btn" onClick={() => go(1)}>›</button></div>
        </div>
        <div className="chips">
          <button className={`chip ${who === 'all' ? 'on' : ''}`} onClick={() => setWho('all')}>Todos</button>
          {profiles.map((p) => <button key={p.id} className={`chip ${who === p.id ? 'on' : ''}`} onClick={() => setWho(p.id)}><i style={{ background: color(p.id) }} />{p.nombre}</button>)}
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={`${y}-${m}`} className="cal" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.18 }}>
            {DIAS.map((d, i) => <div className="cal-dow" key={i}>{d}</div>)}
            {cells.map((d, i) => {
              if (!d) return <div key={i} className="cal-cell empty" />
              const ev = by[key(d)] || []
              return (
                <button key={i} className={`cal-cell ${key(d) === sel ? 'sel' : ''} ${key(d) === hoy() ? 'today' : ''}`} onClick={() => setSel(key(d))}>
                  <span>{d}</span>
                  <div className="cal-dots">{ev.slice(0, 4).map((a) => <i key={a.id} style={{ background: color(a.psicologo_id), opacity: a.estado === 'programada' ? 0.45 : 1 }} />)}{ev.length > 4 && <small>+{ev.length - 4}</small>}</div>
                </button>
              )
            })}
          </motion.div>
        </AnimatePresence>
        <p className="muted small">Punto sólido = atendida/en curso · punto tenue = programada.</p>
      </div>
      <div className="card">
        <div className="card-h"><h3>{fechaLarga(sel)}</h3><button className="btn primary sm" onClick={() => push('agendar', { fecha: sel })}>+ Agendar</button></div>
        <div className="timeline">{dayList.length ? dayList.map((a) => <div key={a.id} className="with-bar" style={{ '--c': color(a.psicologo_id) }}><AtencionRow a={a} /></div>) : <Empty>Sin atenciones este día</Empty>}</div>
      </div>
    </div>
  )
}
