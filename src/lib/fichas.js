import { ENFOQUES, GRUPAL_TIPOS, TUTOR_TIPOS, SOLICITUD_TIPOS, PRUEBAS } from './constants'

const f = (k, label, type = 'area', extra = {}) => ({ k, label, type, ...extra })
const cita = [
  f('cita', '¿Se agendó una cita?', 'check'),
  f('cita_fecha', 'Fecha de la cita', 'date', { show: (d) => d.cita }),
  f('cita_hora', 'Hora', 'time', { show: (d) => d.cita }),
]
const pend = [f('pendiente', 'Quedan temas pendientes por completar', 'check'), f('pendiente_nota', 'Tema pendiente', 'text', { show: (d) => d.pendiente, span: 2 })]

/** Campos por tipo. `conHoras` => se registra hora de apertura/cierre automáticamente. */
export const FICHAS = {
  entrevista: { titulo: 'Entrevista', conHoras: true, campos: [
    f('motivo', 'Motivo de consulta'), f('detalle', 'Detalle de la entrevista', 'area', { rows: 6 }), f('procedimientos', 'Procedimientos'), f('acuerdos', 'Acuerdos'), ...cita, ...pend] },
  observacion: { titulo: 'Observación', conHoras: true, campos: [
    f('contexto', 'Contexto / escenario (aula, recreo, taller…)', 'text'), f('detalle', 'Conductas observadas', 'area', { rows: 6 }),
    f('analisis', 'Análisis / interpretación'), f('acuerdos', 'Recomendaciones y acuerdos'), ...cita, ...pend] },
  prueba: { titulo: 'Prueba', conHoras: true, campos: [
    f('categoria', 'Tipo de prueba', 'select', { options: Object.keys(PRUEBAS) }),
    f('prueba', 'Prueba', 'select', { optionsFn: (d) => PRUEBAS[d.categoria || 'Psicométrica'] }),
    f('resultados', 'Resultados', 'area', { rows: 6, span: 2 }), f('acuerdos', 'Observaciones / acuerdos'), ...cita, ...pend] },
  intervencion: { titulo: 'Intervención', conHoras: true, campos: [
    f('enfoque', 'Tipo de intervención', 'select', { options: ENFOQUES, show: (d) => d.modalidad !== 'grupal' }),
    f('grupal_tipo', 'Tipo de actividad grupal', 'select', { options: GRUPAL_TIPOS, show: (d) => d.modalidad === 'grupal' }),
    f('tema', 'Tema', 'text', { show: (d) => d.modalidad === 'grupal' }),
    f('participantes', 'N.º de participantes', 'number', { show: (d) => d.modalidad === 'grupal' }),
    f('motivo', 'Motivo de la intervención'), f('detalle', 'Detalle de la intervención', 'area', { rows: 6 }),
    f('seguimiento', '¿Se realizará seguimiento?', 'check'),
    f('proxima', '¿Programar otra intervención?', 'check'),
    f('cita_fecha', 'Fecha de la próxima intervención', 'date', { show: (d) => d.proxima }),
    f('cita_hora', 'Hora', 'time', { show: (d) => d.proxima }),
    f('derivacion', 'Derivación externa', 'check'),
    f('derivacion_a', 'Derivar a (institución / especialista)', 'text', { show: (d) => d.derivacion, span: 2 }),
    f('acuerdos', 'Acuerdos'), ...pend] },
  cita_padres: { titulo: 'Cita a padres / apoderados', conHoras: true, campos: [
    f('apoderado', 'Apoderado asistente', 'guardian'), f('motivo', 'Motivo de la cita'), f('detalle', 'Detalle de la entrevista', 'area', { rows: 6 }), f('acuerdos', 'Acuerdos'), ...cita, ...pend] },
  tutor: { titulo: 'Tutores y docentes', conHoras: false, campos: [
    f('actividad', 'Actividad', 'select', { options: TUTOR_TIPOS }), f('dirigido', 'Dirigido a (tutor, docentes, nivel…)', 'text'),
    f('tema', 'Tema', 'text'), f('participantes', 'N.º de participantes', 'number'), f('detalle', 'Detalle', 'area', { rows: 5 }), f('acuerdos', 'Acuerdos'),
    f('proxima', '¿Programar una nueva actividad?', 'check'), f('cita_fecha', 'Fecha', 'date', { show: (d) => d.proxima }), f('cita_hora', 'Hora', 'time', { show: (d) => d.proxima })] },
  solicitud: { titulo: 'Solicitud', conHoras: false, campos: [
    f('tipo', 'Tipo de solicitud', 'select', { options: SOLICITUD_TIPOS }), f('solicitante', 'Solicitante', 'text'),
    f('prioridad', 'Prioridad', 'select', { options: ['Baja', 'Media', 'Alta'] }),
    f('alumno', 'Alumno relacionado', 'student'),
    f('descripcion', 'Descripción', 'area', { rows: 5, span: 2 }), f('respuesta', 'Respuesta / acciones realizadas', 'area', { span: 2 }),
    f('atendida', 'Solicitud atendida', 'check')] },
}

export const defaults = (tipo) => ({
  prueba: { categoria: 'Psicométrica' }, solicitud: { tipo: SOLICITUD_TIPOS[0], prioridad: 'Media' }, tutor: { actividad: TUTOR_TIPOS[0] },
  intervencion: { enfoque: ENFOQUES[0], grupal_tipo: GRUPAL_TIPOS[0] },
}[tipo] || {})
