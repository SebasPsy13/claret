import { useState } from 'react'
import { useApp } from '../lib/AppContext'
import { GRADOS, TIPOS, hoy } from '../lib/constants'
import { Modal, Field, StudentSelect, SalonSelect } from './ui'

export default function AgendarModal({ fecha }) {
  const { profiles, user, students, saveAtencion, pop, notify } = useApp()
  const [f, setF] = useState({ tipo: 'entrevista', fecha: fecha || hoy(), hora: '09:00', psicologo_id: user.id, student_id: '', grado: '', seccion: 'A', motivo: '' })
  const set = (k, v) => setF((x) => ({ ...x, [k]: v }))
  const save = async () => {
    const st = students.find((s) => s.id === f.student_id)
    const ps = profiles.find((p) => p.id === f.psicologo_id)
    await saveAtencion({ tipo: f.tipo, student_id: st?.id || null, grado: st?.grado || f.grado || null, seccion: st?.seccion || (f.grado ? f.seccion : null), fecha: f.fecha, estado: 'programada',
      psicologo_id: ps.id, psicologo_nombre: ps.nombre, hora_inicio: null, hora_fin: null, data: { motivo: f.motivo, hora_programada: f.hora, modalidad: st ? 'individual' : f.grado ? 'grupal' : undefined } })
    notify('Atención agendada ✓'); pop()
  }
  return (
    <Modal onClose={pop} title="Agendar atención" subtitle="Aparecerá como programada en General y en el calendario">
      <div className="form-grid">
        <Field label="Tipo"><select value={f.tipo} onChange={(e) => set('tipo', e.target.value)}>{['entrevista', 'observacion', 'prueba', 'intervencion', 'cita_padres', 'tutor'].map((t) => <option key={t} value={t}>{TIPOS[t].label}</option>)}</select></Field>
        <Field label="Psicólogo/a"><select value={f.psicologo_id} onChange={(e) => set('psicologo_id', e.target.value)}>{profiles.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}</select></Field>
        <Field label="Fecha"><input type="date" value={f.fecha} onChange={(e) => set('fecha', e.target.value)} /></Field>
        <Field label="Hora"><input type="time" value={f.hora} onChange={(e) => set('hora', e.target.value)} /></Field>
        <Field label="Alumno" span={2}><StudentSelect value={f.student_id} onChange={(v) => set('student_id', v)} /></Field>
        {!f.student_id && <Field label="…o salón (atención grupal)" span={2}><SalonSelect allowNone grado={f.grado} seccion={f.seccion} onChange={(g, s) => setF((x) => ({ ...x, grado: g, seccion: s }))} /></Field>}
        <Field label="Motivo / tema" span={2}><input value={f.motivo} onChange={(e) => set('motivo', e.target.value)} /></Field>
      </div>
      <div className="sheet-foot"><span className="grow" /><button className="btn ghost" onClick={pop}>Cancelar</button><button className="btn primary" onClick={save}>Agendar</button></div>
    </Modal>
  )
}
