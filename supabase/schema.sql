-- Ejecutar en Supabase > SQL Editor (una sola vez).
create extension if not exists "pgcrypto";

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nombre text not null,
  rol text not null default 'interno' check (rol in ('principal','interno'))
);

create table if not exists students (
  id uuid primary key default gen_random_uuid(),
  nombres text not null, apellidos text not null, dni text,
  grado text not null, seccion text not null,
  nacimiento date, notas text default '',
  created_at timestamptz default now()
);

create table if not exists guardians (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references students(id) on delete cascade,
  nombre text not null, parentesco text, telefono text, email text,
  created_at timestamptz default now()
);

create table if not exists atenciones (
  id uuid primary key default gen_random_uuid(),
  tipo text not null,                      -- entrevista|observacion|prueba|intervencion|tutor|solicitud|cita_padres
  student_id uuid references students(id) on delete set null,
  grado text, seccion text,
  fecha date not null,
  estado text not null default 'pendiente', -- pendiente|programada|completada
  hora_inicio timestamptz,                  -- se fija al abrir la ficha
  hora_fin timestamptz,                     -- se fija al guardar por primera vez; no se modifica al editar
  psicologo_id uuid references profiles(id),
  psicologo_nombre text,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz default now()
);
create index if not exists atenciones_fecha_idx on atenciones(fecha);
create index if not exists students_salon_idx on students(grado, seccion);

alter table profiles enable row level security;
alter table students enable row level security;
alter table guardians enable row level security;
alter table atenciones enable row level security;

-- Solo los 7 usuarios autenticados (creados por ti) acceden a los datos.
create policy "auth all" on profiles for all to authenticated using (true) with check (true);
create policy "auth all" on students for all to authenticated using (true) with check (true);
create policy "auth all" on guardians for all to authenticated using (true) with check (true);
create policy "auth all" on atenciones for all to authenticated using (true) with check (true);

-- Después de crear los usuarios en Authentication > Users, registra su perfil, por ejemplo:
-- insert into profiles (id, nombre, rol) select id, 'Psic. Ana Pérez', 'principal' from auth.users where email = 'ana@colegio.pe';
-- insert into profiles (id, nombre, rol) select id, 'Interno Luis', 'interno'  from auth.users where email = 'luis@colegio.pe';
