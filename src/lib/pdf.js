import { jsPDF } from 'jspdf'
import { SCHOOL, TIPOS, gradoLabel, fechaLarga, horaDe, nombreCompleto } from './constants'

const ORANGE = [255, 122, 26]
const TITLES = {
  entrevista: 'FICHA DE ENTREVISTA PSICOLÓGICA', observacion: 'FICHA DE OBSERVACIÓN', prueba: 'REGISTRO DE EVALUACIÓN (PRUEBAS)',
  intervencion: 'FICHA DE INTERVENCIÓN PSICOLÓGICA', cita_padres: 'REGISTRO DE ENTREVISTA CON PADRES / APODERADOS',
  tutor: 'REGISTRO DE ACTIVIDAD CON TUTORES Y DOCENTES', solicitud: 'REGISTRO DE SOLICITUD',
}

/** campos: [{label, value}] ya resueltos por la ficha. */
export function fichaPdf({ rec, student, campos }) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const W = 210; const M = 16; let y = 0
  const ensure = (h) => { if (y + h > 280) { doc.addPage(); y = 20 } }

  doc.setFillColor(...ORANGE); doc.rect(0, 0, W, 30, 'F')
  doc.setTextColor(255); doc.setFont('helvetica', 'bold'); doc.setFontSize(16); doc.text(SCHOOL.toUpperCase(), M, 13)
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.text('Departamento de Psicología', M, 20)
  doc.setFontSize(9); doc.text(TIPOS[rec.tipo]?.label || '', W - M, 13, { align: 'right' })
  y = 42
  doc.setTextColor(40); doc.setFont('helvetica', 'bold'); doc.setFontSize(13); doc.text(TITLES[rec.tipo] || 'FICHA', W / 2, y, { align: 'center' })
  y += 8

  const info = [
    ['Fecha', fechaLarga(rec.fecha)],
    ['Psicólogo/a', rec.psicologo_nombre || '—'],
    ['Hora de apertura', horaDe(rec.hora_inicio)],
    ['Hora de cierre', rec.hora_fin ? horaDe(rec.hora_fin) : 'Pendiente'],
  ]
  if (student) info.push(['Alumno/a', nombreCompleto(student)], ['Grado y sección', `${gradoLabel(student.grado)} "${student.seccion}"`], ['DNI', student.dni || '—'])
  else if (rec.grado) info.push(['Salón', `${gradoLabel(rec.grado)} "${rec.seccion}"`])
  info.push(['Estado', rec.estado === 'completada' ? 'Completada' : 'Pendiente'])

  doc.setFillColor(255, 244, 235); doc.roundedRect(M, y, W - 2 * M, Math.ceil(info.length / 2) * 8 + 4, 3, 3, 'F')
  doc.setFontSize(9)
  info.forEach(([k, v], i) => {
    const x = M + 4 + (i % 2) * 90; const yy = y + 8 + Math.floor(i / 2) * 8
    doc.setFont('helvetica', 'bold'); doc.setTextColor(...ORANGE); doc.text(k + ':', x, yy)
    doc.setFont('helvetica', 'normal'); doc.setTextColor(40); doc.text(String(v), x + 32, yy)
  })
  y += Math.ceil(info.length / 2) * 8 + 12

  campos.filter((c) => c.value !== '' && c.value != null && c.value !== false).forEach((c) => {
    const text = c.value === true ? 'Sí' : String(c.value)
    const lines = doc.splitTextToSize(text, W - 2 * M - 4)
    ensure(10 + lines.length * 5)
    doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(...ORANGE); doc.text(c.label.toUpperCase(), M, y)
    doc.setDrawColor(...ORANGE); doc.setLineWidth(0.3); doc.line(M, y + 1.5, W - M, y + 1.5)
    y += 7; doc.setFont('helvetica', 'normal'); doc.setTextColor(40); doc.setFontSize(10)
    doc.text(lines, M + 2, y); y += lines.length * 5 + 5
  })

  ensure(40); y = Math.max(y + 18, 240); if (y > 270) { doc.addPage(); y = 240 }
  doc.setDrawColor(120); doc.line(M + 5, y, M + 70, y); doc.line(W - M - 70, y, W - M - 5, y)
  doc.setFontSize(8); doc.setTextColor(100)
  doc.text(rec.psicologo_nombre || 'Psicólogo/a', M + 37, y + 5, { align: 'center' })
  doc.text(student ? 'Alumno / Apoderado' : 'Conforme', W - M - 37, y + 5, { align: 'center' })
  const pages = doc.getNumberOfPages()
  for (let p = 1; p <= pages; p++) { doc.setPage(p); doc.setFontSize(7); doc.text(`Documento confidencial · ${SCHOOL} · pág. ${p}/${pages}`, W / 2, 290, { align: 'center' }) }

  const name = `${TIPOS[rec.tipo]?.label || 'ficha'}_${student ? student.apellidos.split(' ')[0] : rec.grado || 'general'}_${rec.fecha}.pdf`.replace(/\s+/g, '-')
  doc.save(name)
}
