import { useMemo, useState } from 'react'
import { useApp } from '../lib/AppContext'
import { TIPOS, ESTADOS, fechaLarga, horaDe, nombreCompleto, salonLabel } from '../lib/constants'
import { Badge, Empty, motion } from './ui'

/** Listado genérico de atenciones por área (evaluación, intervención, tutores, solicitudes). */
export default function Panel({ tipos, nuevo, nuevoLabel, extra }) {
  const { atenciones, students, push } = useApp()
  const [q, setQ] = useState(''); const [est, setEst] = useState(''); const [t, setT] = useState('')
  const rows = useMemo(() => atenciones.filter((a) => tipos.includes(a.tipo) && (!est || a.estado === est) && (!t || a.tipo === t)).map((a) => {
    const s = students.find((x) => x.id === a.student_id || x.id === a.data?.alumno)
    return { a, s, who: s ? nombreCompleto(s) : a.grado ? salonLabel(a.grado, a.seccion) : a.data?.dirigido || a.data?.solicitante || '—' }
  }).filter((r) => !q || (r.who + (r.a.data?.motivo || '') + (r.a.data?.tema || '') + (r.a.psicologo_nombre || '')).toLowerCase().includes(q.toLowerCase()))
    .sort((x, y) => y.a.fecha.localeCompare(x.a.fecha)), [atenciones, students, tipos, q, est, t])
  return (
    <div className="card">
      <div className="card-h"><div className="filters flush">
        <input placeholder="Buscar…" value={q} onChange={(e) => setQ(e.target.value)} />
        {tipos.length > 1 && <select value={t} onChange={(e) => setT(e.target.value)}><option value="">Todos los tipos</option>{tipos.map((x) => <option key={x} value={x}>{TIPOS[x].label}</option>)}</select>}
        <select value={est} onChange={(e) => setEst(e.target.value)}><option value="">Todos los estados</option>{Object.entries(ESTADOS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</select>
      </div><button className="btn primary" onClick={nuevo}>+ {nuevoLabel}</button></div>
      {extra}
      <div className="table-wrap"><table>
        <thead><tr><th>Fecha</th><th>Tipo</th><th>Alumno / salón</th><th>Horario</th><th>Psicólogo/a</th><th>Estado</th></tr></thead>
        <tbody>
          {rows.map(({ a, who }, i) => (
            <motion.tr key={a.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: Math.min(i, 15) * 0.015 }} onClick={() => push('ficha', { recordId: a.id })}>
              <td>{fechaLarga(a.fecha)}</td>
              <td><span className="tag" style={{ '--c': TIPOS[a.tipo].color }}>{a.data?.tipo || TIPOS[a.tipo].label}{a.data?.modalidad === 'grupal' ? ' · grupal' : ''}</span></td>
              <td>{who}</td>
              <td>{a.hora_inicio ? `${horaDe(a.hora_inicio)} – ${a.hora_fin ? horaDe(a.hora_fin) : '…'}` : a.data?.hora_programada || '—'}</td>
              <td>{a.psicologo_nombre}</td><td><Badge estado={a.estado} /></td>
            </motion.tr>
          ))}
        </tbody>
      </table>{!rows.length && <Empty>No hay registros</Empty>}</div>
    </div>
  )
}
