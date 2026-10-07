# Claret · Registro de atenciones del Departamento de Psicología

Webapp gratuita (React + Vite + Supabase) con diseño estilo Apple en tonos naranjas.

## Paneles
- **General**: atenciones actuales (pendientes), programadas, gráficos y los 42 salones (Inicial 3 años → 5.° Secundaria, A/B/C). Cada salón muestra un ícono por estudiante; al tocarlo se expande con animación y abre la ficha del alumno.
- **Alumnos y familias**: base de datos de alumnos (filtros, importar CSV) y padres de familia con entrevista/acuerdos.
- **Evaluación**: entrevista (motivo, detalle, procedimientos, acuerdos), observación (individual/grupal) y pruebas (psicométricas/proyectivas, solo resultados).
- **Intervención**: individual (conductual, cognitiva, orientación/consejería…) con seguimiento, próxima intervención o derivación externa; y grupal (talleres, charlas…).
- **Tutores y docentes**, **Solicitudes**, **Calendario** por psicólogo.
- **Ficha con horas automáticas**: la hora de apertura se fija al abrir la ficha y la de cierre al guardar por primera vez; editar después **no** cambia la hora de cierre. Si hay temas pendientes, aparece como *Pendiente* en General. También se registra si se agendó cita (queda como *Programada*). Se descarga un PDF de la ficha.

## Probar en local (modo demo)
```bash
npm install && npm run dev
```
Sin configurar nada corre en **modo demo** (datos en el navegador). Usuarios: `principal1@claret.pe`, `interno1@claret.pe`… contraseña `claret123`.

## Producción gratis (7 usuarios con datos compartidos)
1. Crea un proyecto gratis en [supabase.com](https://supabase.com) y ejecuta `supabase/schema.sql` en *SQL Editor*.
2. En *Authentication → Users* crea los 7 usuarios (2 principales + 5 internos; desactiva "Allow new users to sign up") y registra sus perfiles con los `insert into profiles` al final del SQL.
3. Copia `.env.example` a `.env` y completa `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` (y `VITE_SCHOOL_NAME`).
4. Deploy gratis en **Vercel** o **Netlify** (importar repo, build `npm run build`, salida `dist`, mismas variables de entorno) o **GitHub Pages** (workflow incluido; agrega los secrets).

## Recomendaciones
- Los datos son clínicos y sensibles: mantén desactivado el registro público en Supabase, usa contraseñas fuertes y respeta la normativa de protección de datos personales.
- Plantilla PDF: el diseño actual está en `src/lib/pdf.js`; se ajusta a la plantilla institucional en cuanto se comparta.

## Correr localmente con un clic
Requiere [Node.js 18+](https://nodejs.org). Mac/Linux: `./iniciar.sh` · Windows: doble clic a `iniciar.bat`. Abre http://localhost:4173.
