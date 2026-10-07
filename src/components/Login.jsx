import { useState } from 'react'
import { useApp } from '../lib/AppContext'
import { DEMO } from '../lib/store'
import { DEMO_PASSWORD } from '../lib/seed'
import { SCHOOL } from '../lib/constants'
import { motion } from './ui'

export default function Login() {
  const { signIn } = useApp()
  const [email, setEmail] = useState(''); const [pw, setPw] = useState(''); const [err, setErr] = useState(''); const [busy, setBusy] = useState(false)
  const go = async (e) => { e.preventDefault(); setBusy(true); setErr(''); try { await signIn(email, pw) } catch (x) { setErr(x.message || 'No se pudo ingresar') } finally { setBusy(false) } }
  return (
    <div className="login">
      <div className="blob b1" /><div className="blob b2" />
      <motion.form className="login-card" onSubmit={go} initial={{ opacity: 0, y: 30, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 22 }}>
        <div className="logo big">♥</div>
        <h1>{SCHOOL}</h1><p className="muted">Departamento de Psicología</p>
        <input type="email" placeholder="Correo" value={email} onChange={(e) => setEmail(e.target.value)} autoFocus required />
        <input type="password" placeholder="Contraseña" value={pw} onChange={(e) => setPw(e.target.value)} required />
        {err && <div className="err">{err}</div>}
        <button className="btn primary block" disabled={busy}>{busy ? 'Ingresando…' : 'Ingresar'}</button>
        {DEMO && <div className="demo-hint"><b>Modo demo</b> (datos locales, sin servidor)<br />principal1@claret.pe · interno1@claret.pe<br />contraseña: <code>{DEMO_PASSWORD}</code></div>}
      </motion.form>
    </div>
  )
}
