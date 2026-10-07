import { useApp } from '../lib/AppContext'
import { salonLabel, nombreCompleto } from '../lib/constants'
import { Modal, motion } from './ui'

export default function SalonModal({ grado, seccion }) {
  const { students, atenciones, push, pop } = useApp()
  const list = students.filter((s) => s.grado === grado && s.seccion === seccion).sort((a, b) => a.apellidos.localeCompare(b.apellidos))
  const pend = new Set(atenciones.filter((a) => a.estado === 'pendiente' && a.student_id).map((a) => a.student_id))
  const grp = atenciones.filter((a) => !a.student_id && a.grado === grado && a.seccion === seccion).length
  const init = (tipo) => push('ficha', { init: { tipo, grado, seccion } })
  return (
    <Modal wide layoutId={`salon-${grado}-${seccion}`} onClose={pop} title={salonLabel(grado, seccion)} subtitle={`${list.length} estudiantes · ${grp} atenciones grupales`}
      actions={<><button className="btn soft sm" onClick={() => init('observacion')}>👁️ Observación grupal</button><button className="btn primary sm" onClick={() => init('intervencion')}>🧩 Intervención grupal</button></>}>
      <div className="student-grid">
        {list.map((s, i) => (
          <motion.button key={s.id} className={`stu ${pend.has(s.id) ? 'pend' : ''}`} initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 400, damping: 22, delay: 0.12 + i * 0.02 }} whileHover={{ y: -5, scale: 1.08 }} whileTap={{ scale: 0.94 }} onClick={() => push('student', { id: s.id })} title={nombreCompleto(s)}>
            <svg viewBox="0 0 40 40"><circle cx="20" cy="14" r="7" /><path d="M6 36c0-8 6-13 14-13s14 5 14 13" /></svg>
            <span>{s.nombres.split(' ')[0]}</span><small>{s.apellidos.split(' ')[0]}</small>
          </motion.button>
        ))}
        {!list.length && <div className="empty">No hay alumnos en este salón. Agrégalos en “Alumnos y familias”.</div>}
      </div>
      <p className="muted small">Toca un estudiante para abrir su ficha y registrar evaluación, intervención o cita a padres. El borde naranja indica atenciones pendientes.</p>
    </Modal>
  )
}
