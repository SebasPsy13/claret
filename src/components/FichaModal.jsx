import { useEffect, useRef, useState } from 'react'
import { useApp } from '../lib/AppContext'
import { FICHAS, defaults } from '../lib/fichas'
import { TIPOS, gradoLabel, hoy, horaDe, nombreCompleto, salonLabel } from '../lib/constants'
import { fichaPdf } from '../lib/pdf'
import { Modal, Field, StudentSelect, Badge } from './ui'

/**
 * Ficha de atención. Para tipos "conHoras" crea el borrador al abrir (hora_inicio = ahora) y
 * fija hora_fin la primera vez que se guarda; ediciones posteriores NO modifican hora_fin.
 */
export default function FichaModal({ recordId, init }) {
  const { atenciones, students, guardians, user, saveAtencion, delAtencion, pop, notify } = useApp()
  const tipo = recordId ? atenciones.find((a) => a.id === recordId)?.tipo : init.tipo
  const cfg = FICHAS[tipo]
  const [rec, setRec] = useState(null)
  const [d, setD] = useState({})
  const [fecha, setFecha] = useState(hoy())
  const [pdf, setPdf] = useState(true)
  const [touched, setTouched] = useState(false)
  const [busy, setBusy] = useState(false)
  const started = useRef(false)

  useEffect(() => {
    if (started.current) return; started.current = true
    ;(async () => {
      if (recordId) {
        let r = atenciones.find((a) => a.id === recordId)
        if (cfg.conHoras && !r.hora_inicio) r = await saveAtencion({ id: r.id, hora_inicio: new Date().toISOString(), estado: 'pendiente' })
        setRec(r); setD(r.data || {}); setFecha(r.fecha)
      } else {
        const base = { tipo, student_id: init.student_id || null, grado: init.grado || null, seccion: init.seccion || null, fecha: hoy(), estado: 'pendiente',
          psicologo_id: user.id, psicologo_nombre: user.nombre, hora_inicio: cfg.conHoras ? new Date().toISOString() : null, hora_fin: null,
          data: { ...defaults(tipo), modalidad: init.student_id ? 'individual' : init.grado ? 'grupal' : undefined } }
        const r = cfg.conHoras ? await saveAtencion(base) : base
        setRec(r); setD(r.data)
      }
    })()
  }, [])

  if (!cfg || !rec) return null
  const student = students.find((s) => s.id === rec.student_id)
  const isNew = !recordId
  const set = (k, v) => { setTouched(true); setD((x) => ({ ...x, [k]: v })) }

  const close = async () => {
    if (cfg.conHoras && isNew && !touched && rec.estado === 'pendiente' && !rec.hora_fin && Object.keys(rec.data || {}).length <= 3) await delAtencion(rec.id)
    pop()
  }

  const buildCampos = (data) => cfg.campos.filter((c) => c.type !== 'check' || data[c.k]).map((c) => ({
    label: c.label, value: c.type === 'check' ? true : c.type === 'student' ? nombreCompleto(students.find((s) => s.id === data[c.k])) : c.type === 'guardian' ? data[c.k] : data[c.k] }))

  const save = async () => {
    setBusy(true)
    try {
      const now = new Date().toISOString()
      const pendiente = cfg.conHoras ? !!d.pendiente : tipo === 'solicitud' ? !d.atendida : false
      let data = { ...d }
      // cita / próxima actividad agendada -> registro programado vinculado
      const quiere = d.cita || d.proxima
      if (quiere && d.cita_fecha) {
        const link = d.cita_id ? atenciones.find((a) => a.id === d.cita_id) : null
        const prog = await saveAtencion({
          ...(link ? { id: link.id } : {}), tipo, student_id: rec.student_id, grado: rec.grado, seccion: rec.seccion, fecha: d.cita_fecha, estado: 'programada',
          psicologo_id: rec.psicologo_id, psicologo_nombre: rec.psicologo_nombre, hora_inicio: null, hora_fin: null,
          data: { ...(link?.data || {}), motivo: 'Seguimiento · ' + (d.motivo || FICHAS[tipo].titulo), hora_programada: d.cita_hora || '', origen: rec.id, modalidad: d.modalidad },
        })
        data.cita_id = prog.id
      }
      const saved = await saveAtencion({
        ...(rec.id ? { id: rec.id } : {}), ...(rec.id ? {} : rec), fecha, data,
        estado: pendiente ? 'pendiente' : 'completada',
        hora_fin: cfg.conHoras ? rec.hora_fin || now : null,
      })
      if (pdf && cfg.conHoras) fichaPdf({ rec: saved, student, campos: buildCampos(data) })
      notify(pendiente ? 'Guardado · queda como pendiente' : 'Ficha guardada ✓'); pop()
    } catch (e) { notify('Error: ' + e.message) } finally { setBusy(false) }
  }

  const remove = async () => { if (confirm('¿Eliminar este registro?')) { if (rec.id) await delAtencion(rec.id); pop() } }
  const target = student ? nombreCompleto(student) + ` · ${gradoLabel(student.grado)} "${student.seccion}"` : rec.grado ? salonLabel(rec.grado, rec.seccion) : 'Sin alumno/salón asociado'
  const gs = guardians.filter((g) => g.student_id === rec.student_id)
  const campos = cfg.campos.filter((c) => !c.show || c.show(d))

  return (
    <Modal wide onClose={close} title={`${cfg.titulo}${d.modalidad === 'grupal' ? ' grupal' : ''}`} subtitle={target}
      actions={<Badge estado={rec.estado} />}>
      {cfg.conHoras && (
        <div className="times">
          <div><small>Apertura (automática)</small><b>{horaDe(rec.hora_inicio)}</b></div>
          <div><small>Cierre (al guardar)</small><b>{rec.hora_fin ? horaDe(rec.hora_fin) : 'se registra al guardar'}</b></div>
          <div><small>Psicólogo/a</small><b>{rec.psicologo_nombre}</b></div>
        </div>
      )}
      <div className="form-grid">
        <Field label="Fecha"><input type="date" value={fecha} onChange={(e) => { setTouched(true); setFecha(e.target.value) }} /></Field>
        {campos.map((c) => (
          c.type === 'check' ? <label key={c.k} className="check" style={c.span ? { gridColumn: `span ${c.span}` } : null}><input type="checkbox" checked={!!d[c.k]} onChange={(e) => set(c.k, e.target.checked)} /><i />{c.label}</label> :
          <Field key={c.k} label={c.label} span={c.span || (c.type === 'area' ? 2 : 0)}>
            {c.type === 'area' ? <textarea rows={c.rows || 3} value={d[c.k] || ''} onChange={(e) => set(c.k, e.target.value)} />
              : c.type === 'select' ? <select value={d[c.k] || ''} onChange={(e) => set(c.k, e.target.value)}>{(c.optionsFn ? c.optionsFn(d) : c.options).map((o) => <option key={o}>{o}</option>)}</select>
              : c.type === 'student' ? <StudentSelect value={d[c.k]} onChange={(v) => set(c.k, v)} />
              : c.type === 'guardian' ? <select value={d[c.k] || ''} onChange={(e) => set(c.k, e.target.value)}><option value="">Seleccionar…</option>{gs.map((g) => <option key={g.id} value={`${g.nombre} (${g.parentesco})`}>{g.nombre} ({g.parentesco})</option>)}<option value="Otro">Otro</option></select>
              : <input type={c.type} value={d[c.k] ?? ''} onChange={(e) => set(c.k, e.target.value)} />}
          </Field>
        ))}
      </div>
      <div className="sheet-foot">
        {cfg.conHoras && <label className="check"><input type="checkbox" checked={pdf} onChange={(e) => setPdf(e.target.checked)} /><i />Descargar PDF al guardar</label>}
        <span className="grow" />
        {recordId && <button className="btn ghost danger" onClick={remove}>Eliminar</button>}
        {recordId && cfg.conHoras && rec.hora_fin && <button className="btn ghost" onClick={() => fichaPdf({ rec, student, campos: buildCampos(d) })}>PDF</button>}
        <button className="btn ghost" onClick={close}>Cerrar</button>
        <button className="btn primary" onClick={save} disabled={busy}>{busy ? 'Guardando…' : 'Guardar'}</button>
      </div>
    </Modal>
  )
}
