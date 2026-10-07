import { useState } from 'react'
import { useApp } from '../lib/AppContext'
import { TIPOS, gradoLabel, fechaLarga, nombreCompleto, horaDe } from '../lib/constants'
import { Modal, Avatar, Badge, Empty, motion } from './ui'

const ACCIONES = [
  ['entrevista', '💬', 'Entrevista'], ['observacion', '👁️', 'Observación'], ['prueba', '📝', 'Prueba'], ['intervencion', '🧩', 'Intervención'], ['cita_padres', '👪', 'Cita a padres'],
]

export default function StudentModal({ id }) {
  const { students, guardians, atenciones, push, pop, saveGuardian, delGuardian } = useApp()
  const s = students.find((x) => x.id === id)
  const [adding, setAdding] = useState(false)
  const [g, setG] = useState({ nombre: '', parentesco: 'Madre', telefono: '' })
  if (!s) return null
  const gs = guardians.filter((x) => x.student_id === id)
  const hist = atenciones.filter((a) => a.student_id === id).sort((a, b) => (b.fecha + (b.hora_inicio || '')).localeCompare(a.fecha + (a.hora_inicio || '')))
  const iniciar = (tipo) => push('ficha', { init: { tipo, student_id: s.id, grado: s.grado, seccion: s.seccion } })

  return (
    <Modal wide onClose={pop} title={nombreCompleto(s)} subtitle={`${gradoLabel(s.grado)} "${s.seccion}"${s.dni ? ' · DNI ' + s.dni : ''}`}
      actions={<><Avatar s={s} size={40} /><button className="btn ghost sm" onClick={() => push('alumnoForm', { id })}>Editar</button></>}>
      <h4 className="sec">¿Qué deseas registrar?</h4>
      <div className="actions">
        {ACCIONES.map(([t, ic, l], i) => <motion.button key={t} className="action" style={{ '--c': TIPOS[t].color }} whileHover={{ y: -4, scale: 1.03 }} whileTap={{ scale: 0.96 }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} onClick={() => iniciar(t)}><span>{ic}</span>{l}</motion.button>)}
      </div>
      <div className="two">
        <div>
          <h4 className="sec">Familia <button className="link" onClick={() => setAdding(!adding)}>{adding ? 'cancelar' : '+ agregar'}</button></h4>
          {adding && <div className="mini-form"><input placeholder="Nombre" value={g.nombre} onChange={(e) => setG({ ...g, nombre: e.target.value })} /><select value={g.parentesco} onChange={(e) => setG({ ...g, parentesco: e.target.value })}>{['Madre', 'Padre', 'Tutor/a', 'Abuelo/a', 'Otro'].map((x) => <option key={x}>{x}</option>)}</select><input placeholder="Teléfono" value={g.telefono} onChange={(e) => setG({ ...g, telefono: e.target.value })} /><button className="btn primary sm" disabled={!g.nombre} onClick={async () => { await saveGuardian({ ...g, student_id: id }); setG({ nombre: '', parentesco: 'Madre', telefono: '' }); setAdding(false) }}>Guardar</button></div>}
          {gs.length ? gs.map((x) => <div className="line" key={x.id}><div><b>{x.nombre}</b><small>{x.parentesco} · {x.telefono || 'sin teléfono'}</small></div><button className="icon-btn sm" onClick={() => confirm('¿Quitar apoderado?') && delGuardian(x.id)}>✕</button></div>) : <Empty>Sin apoderados registrados</Empty>}
        </div>
        <div>
          <h4 className="sec">Historial ({hist.length})</h4>
          <div className="timeline">
            {hist.length ? hist.map((a) => (
              <button key={a.id} className="tl" onClick={() => push('ficha', { recordId: a.id })}>
                <i style={{ background: TIPOS[a.tipo].color }} />
                <div><b>{TIPOS[a.tipo].label}{a.data?.modalidad === 'grupal' ? ' grupal' : ''}</b><small>{fechaLarga(a.fecha)}{a.hora_inicio ? ` · ${horaDe(a.hora_inicio)}–${a.hora_fin ? horaDe(a.hora_fin) : '…'}` : a.data?.hora_programada ? ` · ${a.data.hora_programada}` : ''}</small></div>
                <Badge estado={a.estado} />
              </button>)) : <Empty>Aún no hay atenciones</Empty>}
          </div>
        </div>
      </div>
    </Modal>
  )
}
