export const SCHOOL = import.meta.env.VITE_SCHOOL_NAME || 'Colegio Claret'

export const GRADOS = [
  { key: 'ini3', label: 'Inicial 3 años', short: '3 años', nivel: 'Inicial' },
  { key: 'ini4', label: 'Inicial 4 años', short: '4 años', nivel: 'Inicial' },
  { key: 'ini5', label: 'Inicial 5 años', short: '5 años', nivel: 'Inicial' },
  ...[1, 2, 3, 4, 5, 6].map((n) => ({ key: `pri${n}`, label: `${n}° Primaria`, short: `${n}° Prim.`, nivel: 'Primaria' })),
  ...[1, 2, 3, 4, 5].map((n) => ({ key: `sec${n}`, label: `${n}° Secundaria`, short: `${n}° Sec.`, nivel: 'Secundaria' })),
]
export const SECCIONES = ['A', 'B', 'C']
export const NIVELES = ['Inicial', 'Primaria', 'Secundaria']
export const gradoLabel = (k) => GRADOS.find((g) => g.key === k)?.label || k
export const salonLabel = (g, s) => `${gradoLabel(g)} "${s}"`

export const TIPOS = {
  entrevista: { label: 'Entrevista', area: 'evaluacion', color: '#ff7a1a' },
  observacion: { label: 'Observación', area: 'evaluacion', color: '#ffb02e' },
  prueba: { label: 'Prueba', area: 'evaluacion', color: '#e8590c' },
  intervencion: { label: 'Intervención', area: 'intervencion', color: '#34a853' },
  tutor: { label: 'Tutores y docentes', area: 'tutores', color: '#5b8def' },
  solicitud: { label: 'Solicitud', area: 'solicitudes', color: '#9b6bff' },
  cita_padres: { label: 'Cita a padres', area: 'padres', color: '#e5487a' },
}

export const ENFOQUES = ['Conductual', 'Cognitiva', 'Orientación y consejería', 'Contención emocional', 'Préstamo / apoyo puntual', 'Psicoeducativa']
export const GRUPAL_TIPOS = ['Taller psicoeducativo', 'Taller grupal', 'Charla', 'Dinámica de aula', 'Otro']
export const TUTOR_TIPOS = ['Taller', 'Entrevista', 'Charla', 'Capacitación docente']
export const SOLICITUD_TIPOS = ['Derivación externa', 'Plática con tutor', 'Plática con directivos', 'Plática con familia', 'Otro']
export const PRUEBAS = {
  Psicométrica: ['WISC-V', 'WPPSI-IV', 'Raven', 'BASC', 'Conners', 'IDATE / STAI', 'CDI (depresión infantil)', 'Inventario de hábitos de estudio', 'Test de aptitudes (DAT / BAT)', 'Otra psicométrica'],
  Proyectiva: ['HTP (Casa-Árbol-Persona)', 'Figura humana (Machover / Koppitz)', 'Dibujo de la familia', 'CAT / TAT', 'Frases incompletas (Sacks)', 'Rorschach', 'Test del árbol (Koch)', 'Otra proyectiva'],
}

export const ESTADOS = {
  pendiente: { label: 'Pendiente', cls: 'warn' },
  programada: { label: 'Programada', cls: 'info' },
  completada: { label: 'Completada', cls: 'ok' },
}

export const pad = (n) => String(n).padStart(2, '0')
export const hoy = () => { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` }
export const horaDe = (iso) => (iso ? new Date(iso).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', hour12: false }) : '—')
export const fechaLarga = (f) => (f ? new Date(f + 'T12:00:00').toLocaleDateString('es-PE', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : '—')
export const nombreCompleto = (s) => (s ? `${s.nombres} ${s.apellidos}` : '—')
export const iniciales = (s) => `${(s.nombres || '?')[0]}${(s.apellidos || '')[0] || ''}`.toUpperCase()
