import { useMemo, useRef, useState } from 'react'
import { useApp } from '../lib/AppContext'
import { GRADOS, SECCIONES, NIVELES, fechaLarga, gradoLabel, nombreCompleto } from '../lib/constants'
import { Avatar, Empty, Field, Modal, Badge, motion } from './ui'

export function AlumnoForm({ id }) {
  const { students, saveStudent, delStudent, pop, notify } = useApp()
  const cur = students.find((s) => s.id === id)
  const [f, setF] = useState(cur || { nombres: '', apellidos: '', dni: '', grado: 'pri1', seccion: 'A', nacimiento: '', notas: '' })
  const set = (k, v) => setF((x) => ({ ...x, [k]: v }))
  const ok = f.nombres.trim() && f.apellidos.trim()
  return (
    <Modal onClose={pop} title={id ? 'Editar alumno' : 'Nuevo alumno'}>
      <div className="form-grid">
        <Field label="Nombres"><input value={f.nombres} onChange={(e) => set('nombres', e.target.value)} /></Field>
        <Field label="Apellidos"><input value={f.apellidos} onChange={(e) => set('apellidos', e.target.value)} /></Field>
        <Field label="DNI"><input value={f.dni || ''} onChange={(e) => set('dni', e.target.value)} /></Field>
        <Field label="Fecha de nacimiento"><input type="date" value={f.nacimiento || ''} onChange={(e) => set('nacimiento', e.target.value)} /></Field>
        <Field label="Grado"><select value={f.grado} onChange={(e) => set('grado', e.target.value)}>{GRADOS.map((g) => <option key={g.key} value={g.key}>{g.label}</option>)}</select></Field>
        <Field label="Sección"><select value={f.seccion} onChange={(e) => set('seccion', e.target.value)}>{SECCIONES.map((s) => <option key={s}>{s}</option>)}</select></Field>
        <Field label="Notas" span={2}><textarea rows={3} value={f.notas || ''} onChange={(e) => set('notas', e.target.value)} /></Field>
      </div>
      <div className="sheet-foot">
        {id && <button className="btn ghost danger" onClick={async () => { if (confirm('¿Eliminar alumno y su familia asociada?')) { await delStudent(id); notify('Alumno eliminado'); pop(); pop() } }}>Eliminar</button>}
        <span className="grow" /><button className="btn ghost" onClick={pop}>Cancelar</button>
        <button className="btn primary" disabled={!ok} onClick={async () => { const { created_at, ...row } = f; await saveStudent(row); notify('Alumno guardado ✓'); pop() }}>Guardar</button>
      </div>
    </Modal>
  )
}

function parseCsv(text) {
  const [head, ...lines] = text.trim().split(/\r?\n/)
  const sep = head.includes(';') ? ';' : ','
  const cols = head.split(sep).map((c) => c.trim().toLowerCase())
  return lines.filter(Boolean).map((l) => { const v = l.split(sep); const o = {}; cols.forEach((c, i) => (o[c] = (v[i] || '').trim())); return o })
}

export default function Alumnos() {
  const { students, guardians, atenciones, push, saveStudent, notify } = useApp()
  const [tab, setTab] = useState('alumnos')
  const [q, setQ] = useState(''); const [nivel, setNivel] = useState(''); const [g, setG] = useState(''); const [sec, setSec] = useState('')
  const file = useRef()
  const pend = useMemo(() => new Set(atenciones.filter((a) => a.estado === 'pendiente' && a.student_id).map((a) => a.student_id)), [atenciones])
  const rows = students.filter((s) => (!nivel || GRADOS.find((x) => x.key === s.grado)?.nivel === nivel) && (!g || s.grado === g) && (!sec || s.seccion === sec) && (!q || nombreCompleto(s).toLowerCase().includes(q.toLowerCase()) || (s.dni || '').includes(q)))
    .sort((a, b) => GRADOS.findIndex((x) => x.key === a.grado) - GRADOS.findIndex((x) => x.key === b.grado) || a.seccion.localeCompare(b.seccion) || a.apellidos.localeCompare(b.apellidos))
  const fam = guardians.map((x) => ({ x, s: students.find((s) => s.id === x.student_id) })).filter((r) => r.s && (!q || (r.x.nombre + nombreCompleto(r.s)).toLowerCase().includes(q.toLowerCase())))

  const importar = async (e) => {
    const f = e.target.files[0]; if (!f) return
    const items = parseCsv(await f.text()); let n = 0
    for (const r of items) {
      const gr = GRADOS.find((x) => x.key === r.grado || x.label.toLowerCase() === (r.grado || '').toLowerCase())
      if (!r.nombres || !gr) continue
      await saveStudent({ nombres: r.nombres, apellidos: r.apellidos || '', dni: r.dni || '', grado: gr.key, seccion: (r.seccion || 'A').toUpperCase(), nacimiento: r.nacimiento || null, notas: '' }); n++
    }
    notify(`${n} alumnos importados`); e.target.value = ''
  }

  return (
    <div className="card">
      <div className="card-h">
        <div className="seg sm"><button className={tab === 'alumnos' ? 'on' : ''} onClick={() => setTab('alumnos')}>Alumnos ({students.length})</button><button className={tab === 'familias' ? 'on' : ''} onClick={() => setTab('familias')}>Padres de familia ({guardians.length})</button></div>
        <div className="row gap">
          <input type="file" accept=".csv" hidden ref={file} onChange={importar} />
          <button className="btn soft sm" title="Columnas: nombres,apellidos,dni,grado,seccion,nacimiento" onClick={() => file.current.click()}>Importar CSV</button>
          <button className="btn primary" onClick={() => push('alumnoForm')}>+ Alumno</button>
        </div>
      </div>
      <div className="filters">
        <input placeholder="Buscar por nombre o DNI…" value={q} onChange={(e) => setQ(e.target.value)} />
        {tab === 'alumnos' && <>
          <select value={nivel} onChange={(e) => { setNivel(e.target.value); setG('') }}><option value="">Nivel</option>{NIVELES.map((n) => <option key={n}>{n}</option>)}</select>
          <select value={g} onChange={(e) => setG(e.target.value)}><option value="">Grado</option>{GRADOS.filter((x) => !nivel || x.nivel === nivel).map((x) => <option key={x.key} value={x.key}>{x.label}</option>)}</select>
          <select value={sec} onChange={(e) => setSec(e.target.value)}><option value="">Sección</option>{SECCIONES.map((s) => <option key={s}>{s}</option>)}</select></>}
      </div>
      {tab === 'alumnos' ? (
        <div className="table-wrap"><table>
          <thead><tr><th>Alumno</th><th>Grado y sección</th><th>DNI</th><th>Apoderados</th><th>Atenciones</th><th /></tr></thead>
          <tbody>{rows.slice(0, 200).map((s, i) => (
            <motion.tr key={s.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: Math.min(i, 12) * 0.012 }} onClick={() => push('student', { id: s.id })}>
              <td><div className="row gap"><Avatar s={s} size={32} />{nombreCompleto(s)}</div></td><td>{gradoLabel(s.grado)} "{s.seccion}"</td><td>{s.dni || '—'}</td>
              <td>{guardians.filter((x) => x.student_id === s.id).length}</td>
              <td>{atenciones.filter((a) => a.student_id === s.id).length}{pend.has(s.id) && <span className="badge warn" style={{ marginLeft: 8 }}>pendiente</span>}</td>
              <td><button className="btn ghost sm" onClick={(e) => { e.stopPropagation(); push('alumnoForm', { id: s.id }) }}>Editar</button></td>
            </motion.tr>))}</tbody>
        </table>{!rows.length && <Empty>Sin alumnos. Agrega uno o importa un CSV.</Empty>}{rows.length > 200 && <p className="muted small">Mostrando 200 de {rows.length}. Usa los filtros.</p>}</div>
      ) : (
        <div className="table-wrap"><table>
          <thead><tr><th>Apoderado</th><th>Parentesco</th><th>Teléfono</th><th>Alumno</th><th /></tr></thead>
          <tbody>{fam.slice(0, 200).map(({ x, s }) => (
            <tr key={x.id} onClick={() => push('student', { id: s.id })}>
              <td>{x.nombre}</td><td>{x.parentesco}</td><td>{x.telefono || '—'}</td><td>{nombreCompleto(s)} · {gradoLabel(s.grado)} {s.seccion}</td>
              <td><button className="btn soft sm" onClick={(e) => { e.stopPropagation(); push('ficha', { init: { tipo: 'cita_padres', student_id: s.id, grado: s.grado, seccion: s.seccion } }) }}>Entrevista / acuerdos</button></td>
            </tr>))}</tbody>
        </table>{!fam.length && <Empty>Sin apoderados registrados</Empty>}</div>
      )}
    </div>
  )
}
