import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { store } from './store'

const Ctx = createContext(null)
export const useApp = () => useContext(Ctx)

export function AppProvider({ children }) {
  const [user, setUser] = useState(undefined) // undefined = cargando, null = sin sesión
  const [data, setData] = useState({ students: [], guardians: [], atenciones: [], profiles: [] })
  const [stack, setStack] = useState([])
  const [toast, setToast] = useState(null)

  const refresh = useCallback(async () => {
    const [students, guardians, atenciones, profiles] = await Promise.all([store.list('students'), store.list('guardians'), store.list('atenciones'), store.profiles()])
    setData({ students, guardians, atenciones, profiles })
  }, [])

  useEffect(() => { store.session().then((u) => setUser(u || null)).catch(() => setUser(null)) }, [])
  useEffect(() => { if (user) refresh() }, [user, refresh])

  const notify = useCallback((msg) => { setToast(msg); setTimeout(() => setToast(null), 2600) }, [])

  const api = useMemo(() => {
    const upsert = (table, key) => async (row) => {
      const saved = row.id ? await store.update(table, row.id, row) : await store.insert(table, row)
      setData((d) => ({ ...d, [key]: row.id ? d[key].map((x) => (x.id === saved.id ? saved : x)) : [...d[key], saved] }))
      return saved
    }
    const del = (table, key) => async (id) => { await store.remove(table, id); setData((d) => ({ ...d, [key]: d[key].filter((x) => x.id !== id) })) }
    return {
      saveStudent: upsert('students', 'students'), saveGuardian: upsert('guardians', 'guardians'), saveAtencion: upsert('atenciones', 'atenciones'),
      delStudent: async (id) => { await store.remove('students', id); await refresh() }, delGuardian: del('guardians', 'guardians'), delAtencion: del('atenciones', 'atenciones'),
      signIn: async (e, p) => setUser(await store.signIn(e, p)),
      signOut: async () => { await store.signOut(); setUser(null); setStack([]) },
      push: (kind, props = {}) => setStack((s) => [...s, { kind, props, id: Math.random() }]),
      replace: (kind, props = {}) => setStack((s) => [...s.slice(0, -1), { kind, props, id: Math.random() }]),
      pop: () => setStack((s) => s.slice(0, -1)),
      closeAll: () => setStack([]),
      refresh,
    }
  }, [refresh])

  const value = { user, ...data, ...api, stack, toast, notify }
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
