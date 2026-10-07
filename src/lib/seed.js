import { GRADOS, SECCIONES, hoy, pad } from './constants'

const N = ['Sofía', 'Mateo', 'Valentina', 'Santiago', 'Camila', 'Sebastián', 'Isabella', 'Diego', 'Lucía', 'Gabriel', 'Mía', 'Nicolás', 'Renata', 'Adrián', 'Emilia', 'Joaquín', 'Antonella', 'Thiago', 'Fernanda', 'Bruno', 'Alessia', 'Leonardo', 'Daniela', 'Matías']
const A = ['Quispe', 'Flores', 'Rojas', 'Huamán', 'García', 'Mendoza', 'Torres', 'Castillo', 'Vargas', 'Ramos', 'Chávez', 'Salazar', 'Paredes', 'Cruz', 'Gutiérrez', 'Silva', 'Soto', 'Medina']

function rng(seed) { let s = seed; return () => ((s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296) }
const uid = () => (crypto.randomUUID ? crypto.randomUUID() : String(Math.random()).slice(2))

export const DEMO_PASSWORD = 'claret123'
export function seedUsers() {
  const mk = (email, nombre, rol) => ({ id: uid(), email, nombre, rol, password: DEMO_PASSWORD })
  return [
    mk('principal1@claret.pe', 'Psic. Principal 1', 'principal'),
    mk('principal2@claret.pe', 'Psic. Principal 2', 'principal'),
    ...[1, 2, 3, 4, 5].map((i) => mk(`interno${i}@claret.pe`, `Interno/a ${i}`, 'interno')),
  ]
}

export function seedData(users) {
  const r = rng(7)
  const students = []; const guardians = []
  GRADOS.forEach((g, gi) => SECCIONES.forEach((s) => {
    const n = 6 + Math.floor(r() * 7)
    for (let i = 0; i < n; i++) {
      const id = uid()
      const year = 2026 - (gi < 3 ? 3 + gi : 6 + (gi - 3)) - 0
      students.push({
        id, nombres: N[Math.floor(r() * N.length)], apellidos: `${A[Math.floor(r() * A.length)]} ${A[Math.floor(r() * A.length)]}`,
        dni: String(70000000 + Math.floor(r() * 9999999)), grado: g.key, seccion: s,
        nacimiento: `${year}-${pad(1 + Math.floor(r() * 12))}-${pad(1 + Math.floor(r() * 27))}`, notas: '',
      })
      guardians.push({ id: uid(), student_id: id, nombre: `${N[Math.floor(r() * N.length)]} ${A[Math.floor(r() * A.length)]}`, parentesco: r() > 0.5 ? 'Madre' : 'Padre', telefono: `9${Math.floor(10000000 + r() * 89999999)}`, email: '' })
    }
  }))
  const atenciones = []
  const t0 = new Date()
  const day = (off) => { const d = new Date(t0); d.setDate(d.getDate() + off); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` }
  const kinds = ['entrevista', 'observacion', 'prueba', 'intervencion']
  for (let i = 0; i < 26; i++) {
    const st = students[Math.floor(r() * students.length)]
    const u = users[Math.floor(r() * users.length)]
    const off = Math.floor(r() * 24) - 18
    const tipo = kinds[Math.floor(r() * kinds.length)]
    const estado = off > 0 ? 'programada' : r() > 0.8 ? 'pendiente' : 'completada'
    const f = day(off)
    const ini = new Date(`${f}T${pad(8 + Math.floor(r() * 7))}:00:00`).toISOString()
    atenciones.push({
      id: uid(), tipo, student_id: st.id, grado: st.grado, seccion: st.seccion, fecha: f, estado,
      hora_inicio: estado === 'programada' ? null : ini, hora_fin: estado === 'completada' ? new Date(+new Date(ini) + 2700000).toISOString() : null,
      psicologo_id: u.id, psicologo_nombre: u.nombre, created_at: new Date().toISOString(),
      data: { motivo: 'Dificultades de atención en clase', detalle: 'Registro de ejemplo (demo).', procedimientos: 'Entrevista semiestructurada', acuerdos: 'Seguimiento en 2 semanas', modalidad: 'individual', hora_programada: estado === 'programada' ? `${pad(9 + (i % 6))}:00` : undefined },
    })
  }
  atenciones.push({ id: uid(), tipo: 'solicitud', fecha: hoy(), estado: 'pendiente', psicologo_id: users[0].id, psicologo_nombre: users[0].nombre, created_at: new Date().toISOString(), data: { tipo: 'Plática con tutor', solicitante: 'Tutor de 3° Sec. B', descripcion: 'Conversar sobre clima de aula.', prioridad: 'Media' } })
  return { students, guardians, atenciones }
}
