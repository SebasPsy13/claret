import { useState } from 'react'
import { useApp } from '../lib/AppContext'
import { GRADOS, SECCIONES, TIPOS, nombreCompleto, salonLabel } from '../lib/constants'
import { Modal, Avatar, motion } from './ui'

/** Selector previo a la ficha: tipo de atención + alumno o salón. */
export default function NuevaModal({ tipos, title = 'Nueva atención', modo }) {
  const { students, replace, pop } = useApp()
  const [tipo, setTipo] = useState(tipos[0])
  const [tab, setTab] = useState(modo || 'alumno')
  const [q, setQ] = useState('')
  const [g, setG] = useState('')
  const [sec, setSec] = useState('')
  const list = students.filter((s) => (!g || s.grado === g) && (!sec || s.seccion === sec) && (!q || nombreCompleto(s).toLowerCase().includes(q.toLowerCase()))).slice(0, 40)
  const go = (init) => replace('ficha', { init: { tipo, ...init } })
  const alumnoOnly = tipo === 'entrevista' || tipo === 'prueba'

  return (
    <Modal onClose={pop} title={title} subtitle="Elige el tipo y a quién va dirigida">
      <div className="seg">{tipos.map((t) => <button key={t} className={tipo === t ? 'on' : ''} onClick={() => { setTipo(t); if (t === 'entrevista' || t === 'prueba') setTab('alumno') }}>{TIPOS[t].label}</button>)}</div>
      {!alumnoOnly && !modo && <div className="seg sm"><button className={tab === 'alumno' ? 'on' : ''} onClick={() => setTab('alumno')}>Individual · alumno</button><button className={tab === 'salon' ? 'on' : ''} onClick={() => setTab('salon')}>Grupal · salón</button></div>}
      {tab === 'alumno' ? (
        <>
          <div className="filters">
            <input placeholder="Buscar alumno…" value={q} onChange={(e) => setQ(e.target.value)} autoFocus />
            <select value={g} onChange={(e) => setG(e.target.value)}><option value="">Todos los grados</option>{GRADOS.map((x) => <option key={x.key} value={x.key}>{x.label}</option>)}</select>
            <select value={sec} onChange={(e) => setSec(e.target.value)}><option value="">Sección</option>{SECCIONES.map((x) => <option key={x}>{x}</option>)}</select>
          </div>
          <div className="pick-list">
            {list.map((s, i) => <motion.button key={s.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.01 }} className="pick" onClick={() => go({ student_id: s.id, grado: s.grado, seccion: s.seccion })}><Avatar s={s} size={34} /><span>{nombreCompleto(s)}</span><small>{GRADOS.find((x) => x.key === s.grado)?.short} {s.seccion}</small></motion.button>)}
            {!list.length && <div className="empty">Sin resultados</div>}
          </div>
        </>
      ) : (
        <div className="salon-pick">
          {GRADOS.map((gr) => (
            <div key={gr.key} className="sp-row"><b>{gr.label}</b>
              {SECCIONES.map((s) => <button key={s} className="pick-chip" onClick={() => go({ grado: gr.key, seccion: s })}>{s}<small>{students.filter((x) => x.grado === gr.key && x.seccion === s).length}</small></button>)}
            </div>
          ))}
        </div>
      )}
    </Modal>
  )
}
