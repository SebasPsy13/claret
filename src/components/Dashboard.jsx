import { useMemo, useState } from 'react'
import { useApp } from '../lib/AppContext'
import { GRADOS, NIVELES, SECCIONES, TIPOS, hoy, pad, fechaLarga, horaDe, nombreCompleto, salonLabel } from '../lib/constants'
import { Badge, Empty, motion } from './ui'
import { Donut, Bars } from './Charts'

const desc = (a, students) => {
  const s = students.find((x) => x.id === a.student_id)
  return s ? nombreCompleto(s) : a.grado ? salonLabel(a.grado, a.seccion) : a.data?.tema || a.data?.tipo || '—'
}

export function AtencionRow({ a }) {
  const { students, push } = useApp()
  return (
    <button className="tl" onClick={() => push('ficha', { recordId: a.id })}>
      <i style={{ background: TIPOS[a.tipo].color }} />
      <div><b>{TIPOS[a.tipo].label} · {desc(a, students)}</b>
        <small>{fechaLarga(a.fecha)} {a.data?.hora_programada ? '· ' + a.data.hora_programada : a.hora_inicio ? '· ' + horaDe(a.hora_inicio) : ''} · {a.psicologo_nombre}</small></div>
      <Badge estado={a.estado} />
    </button>
  )
}

export default function Dashboard() {
  const { atenciones, students, push } = useApp()
  const [nivel, setNivel] = useState('Todos')
  const h = hoy()
  const k = useMemo(() => {
    const mes = h.slice(0, 7)
    const pend = atenciones.filter((a) => a.estado === 'pendiente')
    const prog = atenciones.filter((a) => a.estado === 'programada').sort((a, b) => a.fecha.localeCompare(b.fecha))
    const done = atenciones.filter((a) => a.estado === 'completada' && a.fecha.startsWith(mes))
    const porTipo = Object.entries(TIPOS).map(([t, v]) => ({ label: v.label, color: v.color, value: atenciones.filter((a) => a.tipo === t && a.fecha.startsWith(mes)).length })).filter((x) => x.value)
    const dias = Array.from({ length: 7 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - 6 + i); const key = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; return { label: d.toLocaleDateString('es-PE', { weekday: 'short' }).slice(0, 3), value: atenciones.filter((a) => a.fecha === key && a.estado !== 'programada').length } })
    return { pend, prog, done, porTipo, dias, hoyN: atenciones.filter((a) => a.fecha === h).length }
  }, [atenciones, h])

  const pendPorSalon = useMemo(() => { const m = {}; atenciones.filter((a) => a.estado === 'pendiente').forEach((a) => { const key = a.grado && `${a.grado}-${a.seccion}`; if (key) m[key] = (m[key] || 0) + 1 }); return m }, [atenciones])
  const pendIds = useMemo(() => new Set(atenciones.filter((a) => a.estado === 'pendiente' && a.student_id).map((a) => a.student_id)), [atenciones])
  const grados = GRADOS.filter((g) => nivel === 'Todos' || g.nivel === nivel)

  const kpis = [
    ['Atenciones actuales', k.pend.length, 'pendientes de completar', 'var(--orange)'],
    ['Programadas', k.prog.length, 'próximas citas', '#5b8def'],
    ['Completadas', k.done.length, 'este mes', '#34a853'],
    ['Alumnos', students.length, `${k.hoyN} atenciones hoy`, '#9b6bff'],
  ]
  return (
    <div className="stack">
      <div className="kpis">
        {kpis.map(([l, v, s, c], i) => (
          <motion.div key={l} className="card kpi" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} whileHover={{ y: -3 }}>
            <span className="dot" style={{ background: c }} /><small>{l}</small><b>{v}</b><em>{s}</em>
          </motion.div>
        ))}
      </div>

      <div className="grid3">
        <div className="card"><div className="card-h"><h3>Atenciones actuales</h3><span className="pill warn">{k.pend.length}</span></div>
          <div className="timeline scroll">{k.pend.length ? k.pend.slice(0, 12).map((a) => <AtencionRow key={a.id} a={a} />) : <Empty>Todo al día ✨</Empty>}</div></div>
        <div className="card"><div className="card-h"><h3>Programadas</h3><button className="btn soft sm" onClick={() => push('agendar')}>+ Agendar</button></div>
          <div className="timeline scroll">{k.prog.length ? k.prog.slice(0, 12).map((a) => <AtencionRow key={a.id} a={a} />) : <Empty>Sin atenciones programadas</Empty>}</div></div>
        <div className="card"><div className="card-h"><h3>Este mes</h3></div>{k.porTipo.length ? <Donut items={k.porTipo} /> : <Empty>Aún sin datos</Empty>}
          <div className="card-h" style={{ marginTop: 18 }}><h3>Últimos 7 días</h3></div><Bars data={k.dias} height={120} /></div>
      </div>

      <div className="card">
        <div className="card-h"><h3>Salones</h3>
          <div className="seg sm">{['Todos', ...NIVELES].map((n) => <button key={n} className={nivel === n ? 'on' : ''} onClick={() => setNivel(n)}>{n}</button>)}</div></div>
        <div className="salones">
          {grados.map((g) => (
            <div className="grado" key={g.key}>
              <h5>{g.label}</h5>
              <div className="row3">
                {SECCIONES.map((s) => {
                  const list = students.filter((x) => x.grado === g.key && x.seccion === s)
                  const p = pendPorSalon[`${g.key}-${s}`]
                  return (
                    <motion.button key={s} layoutId={`salon-${g.key}-${s}`} className="salon" whileHover={{ y: -4, scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={() => push('salon', { grado: g.key, seccion: s })}>
                      <div className="salon-h"><b>{s}</b><small>{list.length} alumnos</small>{p ? <span className="pill warn">{p}</span> : null}</div>
                      <div className="mini-icons">{list.map((x) => <svg key={x.id} viewBox="0 0 40 40" className={pendIds.has(x.id) ? 'p' : ''}><circle cx="20" cy="14" r="7" /><path d="M6 36c0-8 6-13 14-13s14 5 14 13" /></svg>)}</div>
                    </motion.button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
