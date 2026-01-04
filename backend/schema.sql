-- Habilitar extensiones necesarias
create extension if not exists "uuid-ossp";

-- 1. Tabla de Perfiles (Opcional, extiende auth.users)
create table public.profiles (
  id uuid references auth.users not null primary key,
  username text,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Tabla de Ejercicios (Base de datos general + personalizados)
create table public.exercises (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  muscle_group text not null, -- 'Pecho', 'Espalda', 'Pierna', etc.
  equipment text, -- 'Mancuerna', 'Barra', 'Máquina', 'Corporal'
  is_custom boolean default false,
  user_id uuid references auth.users, -- Si es custom, pertenece a un usuario
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Tabla de Rutinas
create table public.routines (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  description text,
  muscle_focus text[], -- Array de músculos principales: ['Pecho', 'Tríceps']
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  last_performed_at timestamp with time zone
);

-- 4. Tabla de Ejercicios dentro de Rutinas (Tabla de unión)
create table public.routine_exercises (
  id uuid default uuid_generate_v4() primary key,
  routine_id uuid references public.routines on delete cascade not null,
  exercise_id uuid references public.exercises not null,
  "order" integer not null, -- Para mantener el orden de los ejercicios
  target_sets integer default 4,
  target_reps text, -- "8-12" o "10"
  notes text
);

-- 5. Tabla de Sesiones de Entrenamiento (Workouts)
create table public.workouts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  routine_id uuid references public.routines, -- Puede ser nulo si es entrenamiento libre
  started_at timestamp with time zone default timezone('utc'::text, now()) not null,
  ended_at timestamp with time zone,
  notes text
);

-- 6. Tabla de Sets (Registros de cada serie)
create table public.workout_sets (
  id uuid default uuid_generate_v4() primary key,
  workout_id uuid references public.workouts on delete cascade not null,
  exercise_id uuid references public.exercises not null,
  set_number integer not null,
  reps integer not null,
  weight numeric not null, -- Guardaremos todo normalizado o confiaremos en la unidad
  weight_unit text default 'lbs', -- 'lbs' o 'kg'
  is_pr boolean default false, -- Flag para saber si fue récord personal
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. Vista/Tabla para Récords Personales (1RM Estimado)
-- Un 1RM estimado simple se puede calcular: Peso * (1 + (0.0333 * Reps))
create table public.personal_records (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  exercise_id uuid references public.exercises not null,
  one_rep_max numeric not null,
  achieved_at timestamp with time zone default timezone('utc'::text, now()) not null,
  workout_set_id uuid references public.workout_sets
);

-- POLÍTICAS DE SEGURIDAD (RLS)
alter table public.profiles enable row level security;
alter table public.exercises enable row level security;
alter table public.routines enable row level security;
alter table public.routine_exercises enable row level security;
alter table public.workouts enable row level security;
alter table public.workout_sets enable row level security;
alter table public.personal_records enable row level security;

-- Políticas simples: Los usuarios solo ven y editan su propia data
-- (Excepción: Ejercicios públicos)

-- Ejercicios: Ver los públicos O los propios
create policy "Ejercicios visibles para todos o propios" on public.exercises
  for select using (auth.uid() = user_id or is_custom = false);

create policy "Usuarios pueden crear sus propios ejercicios" on public.exercises
  for insert with check (auth.uid() = user_id);

-- Rutinas
create policy "Rutinas propias" on public.routines
  for all using (auth.uid() = user_id);

-- Y así sucesivamente para las demás tablas...
create policy "Routine Exercises propios" on public.routine_exercises
  for all using (
    exists (select 1 from public.routines where id = routine_exercises.routine_id and user_id = auth.uid())
  );

create policy "Workouts propios" on public.workouts
  for all using (auth.uid() = user_id);

create policy "Sets propios" on public.workout_sets
  for all using (
    exists (select 1 from public.workouts where id = workout_sets.workout_id and user_id = auth.uid())
  );
