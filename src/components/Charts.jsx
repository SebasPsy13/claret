import { useState } from 'react'
import { motion } from 'framer-motion'

export function Donut({ items, size = 170 }) {
  const total = items.reduce((a, b) => a + b.value, 0) || 1
  const r = 62; const c = 2 * Math.PI * r; let off = 0
  const [hover, setHover] = useState(null)
  return (
    <div className="donut">
      <svg width={size} height={size} viewBox="0 0 170 170">
        <circle cx="85" cy="85" r={r} fill="none" stroke="var(--track)" strokeWidth="22" />
        {items.map((it, i) => {
          const len = (it.value / total) * c; const el = (
            <motion.circle key={it.label} cx="85" cy="85" r={r} fill="none" stroke={it.color} strokeWidth={hover === i ? 26 : 22} strokeLinecap="round"
              strokeDasharray={`${Math.max(len - 4, 0)} ${c}`} strokeDashoffset={-off} transform="rotate(-90 85 85)"
              initial={{ strokeDasharray: `0 ${c}` }} animate={{ strokeDasharray: `${Math.max(len - 4, 0)} ${c}` }} transition={{ duration: 0.9, delay: i * 0.08 }}
              onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} />)
          off += len; return el
        })}
        <text x="85" y="82" textAnchor="middle" className="donut-n">{hover != null ? items[hover].value : items.reduce((a, b) => a + b.value, 0)}</text>
        <text x="85" y="102" textAnchor="middle" className="donut-l">{hover != null ? items[hover].label : 'atenciones'}</text>
      </svg>
      <ul className="legend">{items.map((it) => <li key={it.label}><i style={{ background: it.color }} />{it.label}<b>{it.value}</b></li>)}</ul>
    </div>
  )
}

export function Bars({ data, height = 170 }) {
  const max = Math.max(1, ...data.map((d) => d.value))
  const [hover, setHover] = useState(null)
  return (
    <div className="bars" style={{ height }}>
      {data.map((d, i) => (
        <div className="bar-col" key={d.label} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
          <span className="bar-v">{hover === i || d.value > 0 ? d.value : ''}</span>
          <div className="bar-track"><motion.div className="bar" initial={{ height: 0 }} animate={{ height: `${(d.value / max) * 100}%` }} transition={{ type: 'spring', stiffness: 120, damping: 18, delay: i * 0.04 }} style={{ opacity: hover == null || hover === i ? 1 : 0.55 }} /></div>
          <span className="bar-l">{d.label}</span>
        </div>
      ))}
    </div>
  )
}
