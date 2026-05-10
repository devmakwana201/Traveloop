import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Navbar from '../components/Layout/Navbar'
import { tripsApi } from '../api/client'
import { useSettingsStore } from '../store/settingsStore'
import { ArrowLeft, Download, FileText, CheckCircle, Search, Filter, ArrowUpDown, Printer, PieChart, Plus, Trash2, Edit2 } from 'lucide-react'

interface Trip { id: number; title: string; start_date?: string; end_date?: string; place_count?: number }
interface LineItem { id: number; category: string; description: string; qty: string; unitCost: number; amount: number }

const CATEGORIES = ['Hotel', 'Transport', 'Food', 'Activity', 'Shopping', 'Other']

function DonutChart({ spent, budget }: { spent: number; budget: number }) {
  const pct = budget > 0 ? Math.min(spent / budget, 1) : 0
  const r = 52; const circ = 2 * Math.PI * r
  const stroke = circ * (1 - pct)
  const overBudget = spent > budget
  return (
    <svg width="130" height="130" viewBox="0 0 130 130">
      <circle cx="65" cy="65" r={r} fill="none" stroke="#e5e7eb" strokeWidth="16" />
      <circle
        cx="65" cy="65" r={r} fill="none"
        stroke={overBudget ? '#ef4444' : '#0ea5e9'} strokeWidth="16"
        strokeDasharray={circ} strokeDashoffset={stroke}
        strokeLinecap="round" transform="rotate(-90 65 65)"
        style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.23,1,0.32,1)' }}
      />
      <text x="65" y="60" textAnchor="middle" fontSize="13" fontWeight="800" fill={overBudget ? '#ef4444' : '#0ea5e9'} fontFamily="Inter, sans-serif">
        {Math.round(pct * 100)}%
      </text>
      <text x="65" y="78" textAnchor="middle" fontSize="10" fill="#9ca3af" fontFamily="Inter, sans-serif">used</text>
    </svg>
  )
}

export default function InvoicePage(): React.ReactElement {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { settings } = useSettingsStore()
  const dm = settings.dark_mode
  const dark = dm === true || dm === 'dark' || (dm === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)

  const [trips, setTrips] = useState<Trip[]>([])
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null)
  const [search, setSearch] = useState('')
  const [items, setItems] = useState<LineItem[]>([
    { id: 1, category: 'Hotel', description: 'Hotel booking Paris', qty: '3 nights', unitCost: 3000, amount: 9000 },
    { id: 2, category: 'Transport', description: 'Flight bookings (DEL → PAR)', qty: '1', unitCost: 12000, amount: 12000 },
  ])
  const [budget, setBudget] = useState(20000)
  const [taxRate, setTaxRate] = useState(5)
  const [discount, setDiscount] = useState(50)
  const [paid, setPaid] = useState(false)
  const [editingItem, setEditingItem] = useState<LineItem | null>(null)
  const [showAddRow, setShowAddRow] = useState(false)
  const [newCat, setNewCat] = useState('Hotel')
  const [newDesc, setNewDesc] = useState('')
  const [newQty, setNewQty] = useState('1')
  const [newUnit, setNewUnit] = useState(0)

  useEffect(() => {
    tripsApi.list().then(data => {
      const ts = data.trips || []
      setTrips(ts)
      if (ts.length > 0) setSelectedTrip(ts[0])
    }).catch(() => {})
  }, [])

  const subtotal = items.reduce((s, i) => s + i.amount, 0)
  const tax = Math.round(subtotal * taxRate / 100)
  const grandTotal = subtotal + tax - discount

  const addItem = () => {
    if (!newDesc) return
    const amt = newUnit * (parseFloat(newQty) || 1)
    setItems(prev => [...prev, { id: Date.now(), category: newCat, description: newDesc, qty: newQty, unitCost: newUnit, amount: amt }])
    setNewDesc(''); setNewQty('1'); setNewUnit(0); setShowAddRow(false)
  }

  const deleteItem = (id: number) => setItems(prev => prev.filter(i => i.id !== id))

  const invoiceId = `INV-tl-${Math.floor(Math.random() * 90000 + 10000)}`
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  const bg = dark ? '#0f0f14' : '#f0f9ff'
  const card = dark ? '#1a1a24' : '#ffffff'
  const border = dark ? 'rgba(255,255,255,0.08)' : '#e5e7eb'
  const text = dark ? '#f1f5f9' : '#111827'
  const muted = dark ? 'rgba(255,255,255,0.5)' : '#6b7280'
  const tableBg = dark ? 'rgba(255,255,255,0.03)' : '#f9fafb'
  const tableHead = dark ? 'rgba(255,255,255,0.07)' : '#f3f4f6'

  const handlePrint = () => window.print()
  const handleExport = () => {
    alert('PDF export ready! In production, this would generate a PDF using react-pdf or similar.')
  }

  return (
    <div style={{ minHeight: '100vh', background: bg, fontFamily: 'Inter, system-ui, sans-serif' }}>
      <Navbar />

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '80px 20px 60px' }}>

        {/* Search + Filter Bar */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 24, alignItems: 'center' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: muted }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search invoices..."
              style={{ width: '100%', padding: '9px 12px 9px 34px', border: `1px solid ${border}`, borderRadius: 10, background: card, color: text, fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
          <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', border: `1px solid ${border}`, borderRadius: 10, background: card, color: muted, fontSize: 13, cursor: 'pointer' }}>
            <Filter size={14} /> Filter
          </button>
          <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', border: `1px solid ${border}`, borderRadius: 10, background: card, color: muted, fontSize: 13, cursor: 'pointer' }}>
            <ArrowUpDown size={14} /> Sort ↕
          </button>
        </div>

        {/* Back link */}
        <button
          onClick={() => navigate('/dashboard')}
          style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#0ea5e9', cursor: 'pointer', fontSize: 13, fontWeight: 600, marginBottom: 20, padding: 0 }}
        >
          <ArrowLeft size={15} /> ← back to My Trips
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20, alignItems: 'start' }}>

          {/* Left: Invoice */}
          <div>
            {/* Invoice Card */}
            <div style={{ background: card, borderRadius: 18, border: `1px solid ${border}`, marginBottom: 16, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>

              {/* Trip Header */}
              <div style={{ padding: '20px 24px', borderBottom: `1px solid ${border}`, display: 'flex', gap: 20 }}>
                <div style={{
                  width: 80, height: 80, borderRadius: 12, flexShrink: 0,
                  background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <FileText size={32} color="rgba(255,255,255,0.8)" />
                </div>
                <div style={{ flex: 1 }}>
                  <h2 style={{ margin: '0 0 4px', fontSize: 17, fontWeight: 800, color: text }}>
                    {selectedTrip?.title || 'Trip to Europe Adventure'}
                  </h2>
                  <p style={{ margin: '0 0 10px', fontSize: 12, color: muted }}>
                    {selectedTrip?.start_date ? `${selectedTrip.start_date} – ${selectedTrip.end_date}` : 'May 25 – Jun 28, 2025'} · {selectedTrip?.place_count || 4} cities
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                    <div>
                      <p style={{ margin: 0, fontSize: 10, color: muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Invoice ID</p>
                      <p style={{ margin: '2px 0 0', fontSize: 12, fontWeight: 700, color: text }}>{invoiceId}</p>
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: 10, color: muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Generated Date</p>
                      <p style={{ margin: '2px 0 0', fontSize: 12, fontWeight: 700, color: text }}>{today}</p>
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: 10, color: muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Payment Status</p>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 99, marginTop: 2,
                        background: paid ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.12)',
                        color: paid ? '#10b981' : '#f59e0b',
                      }}>
                        {paid ? '✓ Paid' : '⏳ Pending'}
                      </span>
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ margin: '0 0 4px', fontSize: 10, color: muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Traveler Details</p>
                  {['James', 'Arjun', 'Jerry', 'Cristina'].map(n => (
                    <p key={n} style={{ margin: '2px 0', fontSize: 12, color: text }}>{n}</p>
                  ))}
                </div>
              </div>

              {/* Line Items Table */}
              <div style={{ padding: '0' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: tableHead }}>
                      {['#', 'Category', 'Description', 'Qty / Details', 'Unit Cost', 'Amount'].map((h, i) => (
                        <th key={h} style={{ padding: '10px 16px', textAlign: i === 0 ? 'center' : 'left', fontSize: 11, fontWeight: 700, color: muted, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
                          {h}
                        </th>
                      ))}
                      <th style={{ padding: '10px 8px', width: 64 }} />
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, idx) => (
                      <tr key={item.id} style={{ borderTop: `1px solid ${border}`, background: idx % 2 === 0 ? 'transparent' : tableBg }}>
                        <td style={{ padding: '12px 16px', textAlign: 'center', color: muted, fontSize: 12 }}>{idx + 1}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{
                            fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 99,
                            background: 'rgba(14,165,233,0.1)', color: '#0ea5e9',
                          }}>{item.category}</span>
                        </td>
                        <td style={{ padding: '12px 16px', color: text, fontWeight: 500 }}>{item.description}</td>
                        <td style={{ padding: '12px 16px', color: muted }}>{item.qty}</td>
                        <td style={{ padding: '12px 16px', color: text, fontWeight: 600 }}>$ {item.unitCost.toLocaleString()}</td>
                        <td style={{ padding: '12px 16px', color: text, fontWeight: 700 }}>$ {item.amount.toLocaleString()}</td>
                        <td style={{ padding: '12px 8px' }}>
                          <button onClick={() => deleteItem(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', opacity: 0.6, padding: 4 }}>
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    ))}

                    {/* Add Row */}
                    {showAddRow ? (
                      <tr style={{ borderTop: `1px solid ${border}`, background: 'rgba(14,165,233,0.04)' }}>
                        <td style={{ padding: '10px 16px', textAlign: 'center', color: muted }}>{items.length + 1}</td>
                        <td style={{ padding: '6px 10px' }}>
                          <select value={newCat} onChange={e => setNewCat(e.target.value)} style={{ padding: '6px 8px', border: `1px solid ${border}`, borderRadius: 8, background: card, color: text, fontSize: 12, outline: 'none' }}>
                            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                          </select>
                        </td>
                        <td style={{ padding: '6px 10px' }}>
                          <input value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Description" style={{ width: '100%', padding: '6px 8px', border: `1px solid ${border}`, borderRadius: 8, background: card, color: text, fontSize: 12, outline: 'none', boxSizing: 'border-box' }} />
                        </td>
                        <td style={{ padding: '6px 10px' }}>
                          <input value={newQty} onChange={e => setNewQty(e.target.value)} placeholder="Qty" style={{ width: 64, padding: '6px 8px', border: `1px solid ${border}`, borderRadius: 8, background: card, color: text, fontSize: 12, outline: 'none' }} />
                        </td>
                        <td style={{ padding: '6px 10px' }}>
                          <input type="number" value={newUnit || ''} onChange={e => setNewUnit(Number(e.target.value))} placeholder="0" style={{ width: 80, padding: '6px 8px', border: `1px solid ${border}`, borderRadius: 8, background: card, color: text, fontSize: 12, outline: 'none' }} />
                        </td>
                        <td style={{ padding: '6px 10px', color: text, fontWeight: 700 }}>$ {(newUnit * (parseFloat(newQty) || 1)).toLocaleString()}</td>
                        <td style={{ padding: '6px 8px', display: 'flex', gap: 4 }}>
                          <button onClick={addItem} style={{ padding: '5px 10px', background: '#0ea5e9', border: 'none', borderRadius: 7, color: 'white', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Add</button>
                        </td>
                      </tr>
                    ) : (
                      <tr style={{ borderTop: `1px solid ${border}` }}>
                        <td colSpan={7} style={{ padding: '10px 16px' }}>
                          <button onClick={() => setShowAddRow(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#0ea5e9', cursor: 'pointer', fontSize: 12, fontWeight: 700, padding: 0 }}>
                            <Plus size={14} /> Add line item
                          </button>
                        </td>
                      </tr>
                    )}

                    {/* Empty rows for visual spacing */}
                    {Array.from({ length: Math.max(0, 3 - items.length) }).map((_, i) => (
                      <tr key={`empty-${i}`} style={{ borderTop: `1px solid ${border}` }}>
                        <td colSpan={7} style={{ padding: '16px' }} />
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Totals */}
                <div style={{ padding: '16px 24px 20px', borderTop: `1px solid ${border}` }}>
                  <div style={{ maxWidth: 280, marginLeft: 'auto' }}>
                    {[
                      { label: 'Subtotal', val: subtotal, bold: false },
                      { label: `Tax (${taxRate}%)`, val: tax, bold: false },
                      { label: 'Discount', val: -discount, bold: false },
                    ].map(row => (
                      <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
                        <span style={{ color: muted }}>{row.label}</span>
                        <span style={{ color: row.val < 0 ? '#10b981' : text, fontWeight: 600 }}>
                          {row.val < 0 ? '–' : ''} $ {Math.abs(row.val).toLocaleString()}
                        </span>
                      </div>
                    ))}
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0 0', borderTop: `2px solid ${border}`, fontSize: 16, fontWeight: 800, color: text }}>
                      <span>Grand Total</span>
                      <span style={{ color: '#0ea5e9' }}>$ {grandTotal.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={handlePrint}
                style={{
                  display: 'flex', alignItems: 'center', gap: 7,
                  padding: '12px 20px',
                  border: `1px solid ${border}`, borderRadius: 12,
                  background: card, color: text, fontSize: 13,
                  fontWeight: 700, cursor: 'pointer',
                }}
              >
                <Download size={15} /> Download Invoice
              </button>
              <button
                onClick={handleExport}
                style={{
                  display: 'flex', alignItems: 'center', gap: 7,
                  padding: '12px 20px',
                  border: `1px solid ${border}`, borderRadius: 12,
                  background: card, color: text, fontSize: 13,
                  fontWeight: 700, cursor: 'pointer',
                }}
              >
                <FileText size={15} /> Export as PDF
              </button>
              <button
                onClick={() => setPaid(!paid)}
                style={{
                  marginLeft: 'auto',
                  display: 'flex', alignItems: 'center', gap: 7,
                  padding: '12px 24px',
                  background: paid ? 'rgba(16,185,129,0.12)' : 'linear-gradient(135deg, #10b981, #059669)',
                  border: paid ? '1px solid #10b981' : 'none',
                  borderRadius: 12, color: paid ? '#10b981' : 'white',
                  fontSize: 13, fontWeight: 700, cursor: 'pointer',
                  boxShadow: paid ? 'none' : '0 4px 12px rgba(16,185,129,0.3)',
                }}
              >
                <CheckCircle size={15} />
                {paid ? 'Marked as Paid ✓' : 'Mark as Paid'}
              </button>
            </div>
          </div>

          {/* Right: Budget Insights */}
          <div>
            <div style={{ background: card, borderRadius: 18, border: `1px solid ${border}`, padding: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
              <h3 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 800, color: text }}>Budget Insights</h3>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                <DonutChart spent={grandTotal} budget={budget} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { label: 'Total Budget', val: budget, color: '#6b7280' },
                  { label: 'Total Spent', val: grandTotal, color: '#0ea5e9' },
                  { label: 'Remaining', val: budget - grandTotal, color: budget - grandTotal >= 0 ? '#10b981' : '#ef4444' },
                ].map(row => (
                  <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <span style={{ color: muted }}>{row.label}</span>
                    <span style={{ fontWeight: 700, color: row.color }}>$ {Math.abs(row.val).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${border}` }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: muted, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 6 }}>Set Budget</label>
                <input
                  type="number"
                  value={budget}
                  onChange={e => setBudget(Number(e.target.value))}
                  style={{ width: '100%', padding: '8px 10px', border: `1px solid ${border}`, borderRadius: 8, background: dark ? 'rgba(255,255,255,0.05)' : '#f9fafb', color: text, fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
                  onFocus={e => e.target.style.borderColor = '#0ea5e9'}
                  onBlur={e => e.target.style.borderColor = border}
                />
              </div>
              <button
                onClick={() => navigate('/dashboard')}
                style={{
                  width: '100%', marginTop: 12, padding: '10px',
                  background: 'rgba(14,165,233,0.1)', border: '1px solid rgba(14,165,233,0.2)',
                  borderRadius: 10, color: '#0ea5e9', fontSize: 12,
                  fontWeight: 700, cursor: 'pointer',
                }}
              >
                View Full Budget →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
// Traveloop – Travel Planning Platform 2026
