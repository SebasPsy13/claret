import { useState } from 'react'
import { useApp } from './lib/AppContext'
import { DEMO } from './lib/store'
import { SCHOOL, fechaLarga, hoy } from './lib/constants'
import { AnimatePresence, motion } from './components/ui'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import Alumnos, { AlumnoForm } from './components/Alumnos'
import Panel from './components/Panel'
import Calendario from './components/Calendario'
import FichaModal from './components/FichaModal'
import StudentModal from './components/StudentModal'
import SalonModal from './components/SalonModal'
import NuevaModal from './components/NuevaModal'
import AgendarModal from './components/AgendarModal'

const NAV = [
  ['general', 'General', '◔'], ['alumnos', 'Alumnos y familias', '☺'], ['evaluacion', 'Evaluación', '✎'], ['intervencion', 'Intervención', '✚'],
  ['tutores', 'Tutores y docentes', '⚑'], ['solicitudes', 'Solicitudes', '✉'], ['calendario', 'Calendario', '▦'],
]
const TITLES = { general: 'General', alumnos: 'Alumnos y familias', evaluacion: 'Evaluación', intervencion: 'Intervención', tutores: 'Tutores y docentes', solicitudes: 'Solicitudes', calendario: 'Calendario' }
const EV = ['entrevista', 'observacion', 'prueba']

function Modals() {
  const { stack } = useApp()
  const render = ({ kind, props, id }) => {
    switch (kind) {
      case 'ficha': return <FichaModal key={id} {...props} />
      case 'student': return <StudentModal key={id} {...props} />
      case 'salon': return <SalonModal key={id} {...props} />
      case 'nueva': return <NuevaModal key={id} {...props} />
      case 'agendar': return <AgendarModal key={id} {...props} />
      case 'alumnoForm': return <AlumnoForm key={id} {...props} />
      default: return null
    }
  }
  return <AnimatePresence>{stack.map(render)}</AnimatePresence>
}

export default function App() {
  const { user, signOut, push, toast, stack } = useApp()
  const [view, setView] = useState('general')
  if (user === undefined) return <div className="boot">Cargando…</div>
  if (!user) return <Login />

  const body = {
    general: <Dashboard />, alumnos: <Alumnos />, calendario: <Calendario />,
    evaluacion: <Panel tipos={EV} nuevoLabel="Nueva evaluación" nuevo={() => push('nueva', { tipos: EV, title: 'Nueva evaluación' })} />,
    intervencion: <Panel tipos={['intervencion']} nuevoLabel="Nueva intervención" nuevo={() => push('nueva', { tipos: ['intervencion'], title: 'Nueva intervención' })} />,
    tutores: <Panel tipos={['tutor']} nuevoLabel="Nueva actividad" nuevo={() => push('ficha', { init: { tipo: 'tutor' } })} />,
    solicitudes: <Panel tipos={['solicitud']} nuevoLabel="Nueva solicitud" nuevo={() => push('ficha', { init: { tipo: 'solicitud' } })} />,
  }[view]

  return (
    <div className="app">
      <aside className="side">
        <div className="brand"><div className="logo">♥</div><div><b>{SCHOOL}</b><small>Psicología</small></div></div>
        <nav>{NAV.map(([k, l, ic]) => (
          <button key={k} className={view === k ? 'on' : ''} onClick={() => setView(k)}>
            {view === k && <motion.span layoutId="nav-pill" className="nav-pill" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />}
            <span className="ic">{ic}</span><span className="lb">{l}</span>
          </button>))}</nav>
        <div className="me"><div><b>{user.nombre}</b><small>{user.rol === 'principal' ? 'Psicólogo/a principal' : 'Interno/a de psicología'}</small></div><button className="btn ghost sm" onClick={signOut}>Salir</button></div>
      </aside>
      <main className={stack.length ? 'dim' : ''}>
        <header className="top"><div><h1>{TITLES[view]}</h1><p className="muted">{fechaLarga(hoy())}{DEMO && ' · modo demo'}</p></div>
          <button className="btn primary" onClick={() => push('agendar')}>+ Agendar</button></header>
        <AnimatePresence mode="wait"><motion.div key={view} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>{body}</motion.div></AnimatePresence>
      </main>
      <Modals />
      <AnimatePresence>{toast && <motion.div className="toast" initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}>{toast}</motion.div>}</AnimatePresence>
    </div>
  )
}
