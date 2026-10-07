import { createClient } from '@supabase/supabase-js'
import { seedUsers, seedData } from './seed'

const URL = import.meta.env.VITE_SUPABASE_URL
const KEY = import.meta.env.VITE_SUPABASE_ANON_KEY
export const DEMO = !(URL && KEY)
const uid = () => (crypto.randomUUID ? crypto.randomUUID() : String(Math.random()).slice(2))
const sb = DEMO ? null : createClient(URL, KEY)

/* ---------- MODO DEMO (localStorage) ---------- */
const DB = 'claret_db_v1'; const SES = 'claret_session_v1'
function load() {
  try { const raw = localStorage.getItem(DB); if (raw) return JSON.parse(raw) } catch {}
  const users = seedUsers()
  const db = { users, ...seedData(users) }
  localStorage.setItem(DB, JSON.stringify(db))
  return db
}
const save = (db) => localStorage.setItem(DB, JSON.stringify(db))
const stripPw = ({ password, ...u }) => u

const demo = {
  async signIn(email, password) {
    const u = load().users.find((x) => x.email.toLowerCase() === email.trim().toLowerCase() && x.password === password)
    if (!u) throw new Error('Correo o contraseña incorrectos')
    localStorage.setItem(SES, u.id); return stripPw(u)
  },
  async session() { const id = localStorage.getItem(SES); const u = load().users.find((x) => x.id === id); return u ? stripPw(u) : null },
  async signOut() { localStorage.removeItem(SES) },
  async profiles() { return load().users.map(stripPw) },
  async list(t) { return load()[t] || [] },
  async insert(t, row) { const db = load(); const r = { id: uid(), created_at: new Date().toISOString(), ...row }; db[t] = [...db[t], r]; save(db); return r },
  async update(t, id, patch) { const db = load(); let out; db[t] = db[t].map((x) => (x.id === id ? (out = { ...x, ...patch }) : x)); save(db); return out },
  async remove(t, id) { const db = load(); db[t] = db[t].filter((x) => x.id !== id); save(db) },
  async reset() { localStorage.removeItem(DB) },
}

/* ---------- SUPABASE ---------- */
const chk = ({ data, error }) => { if (error) throw error; return data }
const remote = {
  async signIn(email, password) {
    chk(await sb.auth.signInWithPassword({ email: email.trim(), password }))
    return remote.session()
  },
  async session() {
    const { data } = await sb.auth.getSession()
    const user = data.session?.user
    if (!user) return null
    const p = chk(await sb.from('profiles').select('*').eq('id', user.id).maybeSingle())
    return p ? { ...p, email: user.email } : { id: user.id, email: user.email, nombre: user.email, rol: 'interno' }
  },
  async signOut() { await sb.auth.signOut() },
  async profiles() { return chk(await sb.from('profiles').select('*').order('nombre')) },
  async list(t) {
    const out = []; let from = 0
    for (;;) { const page = chk(await sb.from(t).select('*').range(from, from + 999)); out.push(...page); if (page.length < 1000) break; from += 1000 }
    return out
  },
  async insert(t, row) { return chk(await sb.from(t).insert(row).select().single()) },
  async update(t, id, patch) { return chk(await sb.from(t).update(patch).eq('id', id).select().single()) },
  async remove(t, id) { chk(await sb.from(t).delete().eq('id', id)) },
  async reset() {},
}

export const store = DEMO ? demo : remote
