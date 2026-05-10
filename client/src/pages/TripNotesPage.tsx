import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Layout/Navbar'
import { tripsApi } from '../api/client'
import { useAuthStore } from '../store/authStore'
import { useSettingsStore } from '../store/settingsStore'
import { Globe, Search, SlidersHorizontal, ArrowUpDown, Plus, Trash2, Pencil, ChevronDown, X, Check, Tag, Calendar, MapPin } from 'lucide-react'

interface Trip { id: number; title: string }
interface Note {
  id: number
  tripId: number
  title: string
  content: string
  date: string
  stopName?: string
  dayNumber?: number
  tag?: string
}

function generateId() { return Date.now() + Math.random() }

const NOTE_TAGS = ['General', 'Hotel', 'Transport', 'Food', 'Activity', 'Reminder']
const TAG_COLORS: Record<string, string> = {
  General: '#6b7280', Hotel: '#0ea5e9', Transport: '#8b5cf6',
  Food: '#f59e0b', Activity: '#10b981', Reminder: '#ef4444',
}

export default function TripNotesPage(): React.ReactElement {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { settings } = useSettingsStore()
  const dm = settings.dark_mode
  const dark = dm === true || dm === 'dark' || (dm === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)

  const [trips, setTrips] = useState<Trip[]>([])
  const [selectedTripId, setSelectedTripId] = useState<number | null>(null)
  const [notes, setNotes] = useState<Note[]>([])
  const [filter, setFilter] = useState<'all' | 'day' | 'stop'>('all')
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [showTripDrop, setShowTripDrop] = useState(false)

  // Form state
  const [formTitle, setFormTitle] = useState('')
  const [formContent, setFormContent] = useState('')
  const [formDay, setFormDay] = useState('')
  const [formStop, setFormStop] = useState('')
  const [formTag, setFormTag] = useState('General')

  useEffect(() => {
    tripsApi.list().then(data => {
      const ts = (data.trips || []).map((t: any) => ({ id: t.id, title: t.title }))
      setTrips(ts)
      if (ts.length > 0) setSelectedTripId(ts[0].id)
    }).catch(() => {})
  }, [])

  // Load notes from localStorage per trip (demo persistence)
  useEffect(() => {
    if (!selectedTripId) return
    const stored = localStorage.getItem(`traveloop_notes_${selectedTripId}`)
    if (stored) {
      try { setNotes(JSON.parse(stored)) } catch { setNotes([]) }
    } else {
      // Seed sample notes
      const sample: Note[] = [
        { id: 1, tripId: selectedTripId, title: 'Hotel check-in details - Rome stop', content: 'Check in after 2pm, room 302, breakfast included (7-10am)', date: 'Day 3: June 14 2025', stopName: 'Rome', dayNumber: 3, tag: 'Hotel' },
        { id: 2, tripId: selectedTripId, title: 'Colosseum tour booking', content: 'Pre-booked skip-the-line entry at 10am. Reference: COL-2025-882', date: 'Day 4: June 15 2025', stopName: 'Rome', dayNumber: 4, tag: 'Activity' },
        { id: 3, tripId: selectedTripId, title: 'Paris Airbnb checkout', content: 'Checkout by 11am. Leave key in lockbox. Code: 4521', date: 'Day 1: June 12 2025', stopName: 'Paris', dayNumber: 1, tag: 'Hotel' },
      ]
      setNotes(sample)
      localStorage.setItem(`traveloop_notes_${selectedTripId}`, JSON.stringify(sample))
    }
  }, [selectedTripId])

  const saveNotes = (updated: Note[]) => {
    setNotes(updated)
    if (selectedTripId) localStorage.setItem(`traveloop_notes_${selectedTripId}`, JSON.stringify(updated))
  }

  const filteredNotes = notes.filter(n => {
    const matchSearch = search === '' || n.title.toLowerCase().includes(search.toLowerCase()) || n.content.toLowerCase().includes(search.toLowerCase())
    if (!matchSearch) return false
    if (filter === 'day') return !!n.dayNumber
    if (filter === 'stop') return !!n.stopName
    return true
  }).sort((a, b) => (a.dayNumber || 99) - (b.dayNumber || 99))

  const selectedTrip = trips.find(t => t.id === selectedTripId)

  const openAdd = () => {
    setEditingNote(null)
    setFormTitle(''); setFormContent(''); setFormDay(''); setFormStop(''); setFormTag('General')
    setShowForm(true)
  }

  const openEdit = (note: Note) => {
    setEditingNote(note)
    setFormTitle(note.title); setFormContent(note.content)
    setFormDay(note.dayNumber ? String(note.dayNumber) : '')
    setFormStop(note.stopName || ''); setFormTag(note.tag || 'General')
    setShowForm(true)
  }

  const handleSave = () => {
    if (!formTitle.trim()) return
    const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    const dateLabel = formDay ? `Day ${formDay}: ${today}` : today
    if (editingNote) {
      saveNotes(notes.map(n => n.id === editingNote.id
        ? { ...n, title: formTitle, content: formContent, date: dateLabel, dayNumber: formDay ? Number(formDay) : undefined, stopName: formStop || undefined, tag: formTag }
        : n
      ))
    } else {
      const newNote: Note = {
        id: generateId(), tripId: selectedTripId!, title: formTitle, content: formContent,
        date: dateLabel, dayNumber: formDay ? Number(formDay) : undefined,
        stopName: formStop || undefined, tag: formTag,
      }
      saveNotes([...notes, newNote])
    }
    setShowForm(false)
  }

  const handleDelete = (id: number) => saveNotes(notes.filter(n => n.id !== id))

  const bg = dark ? '#0f0f14' : '#f8fafc'
  const card = dark ? '#1a1a24' : '#ffffff'
  const border = dark ? 'rgba(255,255,255,0.08)' : '#e5e7eb'
  const text = dark ? '#f1f5f9' : '#111827'
  const muted = dark ? 'rgba(255,255,255,0.5)' : '#6b7280'
  const inputBg = dark ? 'rgba(255,255,255,0.05)' : '#f9fafb'

  return (
    <div style={{ minHeight: '100vh', background: bg, fontFamily: 'Inter, system-ui, sans-serif' }}>
      <Navbar />

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '80px 20px 40px' }}>

        {/* Search + Controls bar */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20, alignItems: 'center' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: muted }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search notes..."
              style={{
                width: '100%', padding: '9px 12px 9px 36px',
                border: `1px solid ${border}`, borderRadius: 10,
                background: card, color: text, fontSize: 13,
                outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>
          <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 14px', border: `1px solid ${border}`, borderRadius: 10, background: card, color: muted, fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap' }}>
            <SlidersHorizontal size={14} /> Group by
          </button>
          <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 14px', border: `1px solid ${border}`, borderRadius: 10, background: card, color: muted, fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap' }}>
            <SlidersHorizontal size={14} /> Filter
          </button>
          <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 14px', border: `1px solid ${border}`, borderRadius: 10, background: card, color: muted, fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap' }}>
            <ArrowUpDown size={14} /> Sort by...
          </button>
        </div>

        {/* Page Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: text, letterSpacing: '-0.5px' }}>Trip Notes</h1>
          <button
            onClick={openAdd}
            style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '10px 18px',
              background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
              color: 'white', border: 'none', borderRadius: 10,
              fontSize: 13, fontWeight: 700, cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(14,165,233,0.3)',
            }}
          >
            <Plus size={16} /> Add Note
          </button>
        </div>

        {/* Trip Selector */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowTripDrop(!showTripDrop)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '8px 14px', border: `1.5px solid ${border}`,
                borderRadius: 10, background: card, color: text,
                fontSize: 13, fontWeight: 600, cursor: 'pointer',
                minWidth: 220,
              }}
            >
              <Globe size={14} color="#0ea5e9" />
              {selectedTrip?.title || 'Select a Trip'}
              <ChevronDown size={14} style={{ marginLeft: 'auto', color: muted }} />
            </button>
            {showTripDrop && (
              <div style={{
                position: 'absolute', top: '110%', left: 0, zIndex: 50,
                background: card, border: `1px solid ${border}`,
                borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                minWidth: 220, overflow: 'hidden',
              }}>
                {trips.map(t => (
                  <div
                    key={t.id}
                    onClick={() => { setSelectedTripId(t.id); setShowTripDrop(false) }}
                    style={{
                      padding: '10px 14px', cursor: 'pointer', fontSize: 13,
                      color: t.id === selectedTripId ? '#0ea5e9' : text,
                      fontWeight: t.id === selectedTripId ? 700 : 400,
                      background: t.id === selectedTripId ? 'rgba(14,165,233,0.08)' : 'transparent',
                    }}
                  >
                    {t.title}
                  </div>
                ))}
                {trips.length === 0 && (
                  <div style={{ padding: '12px 14px', color: muted, fontSize: 13 }}>No trips yet</div>
                )}
              </div>
            )}
          </div>

          {/* Filter Tabs */}
          <div style={{ display: 'flex', gap: 6 }}>
            {(['all', 'day', 'stop'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: '6px 14px', borderRadius: 8, border: 'none',
                  background: filter === f ? '#0ea5e9' : (dark ? 'rgba(255,255,255,0.07)' : '#f3f4f6'),
                  color: filter === f ? 'white' : muted,
                  fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  textTransform: 'capitalize',
                }}
              >
                {f === 'all' ? 'All' : f === 'day' ? 'by Day' : 'by Stop'}
              </button>
            ))}
          </div>
        </div>

        {/* Notes Count */}
        <p style={{ margin: '0 0 16px', fontSize: 12, color: muted }}>
          {filteredNotes.length} note{filteredNotes.length !== 1 ? 's' : ''}
          {selectedTrip ? ` for "${selectedTrip.title}"` : ''}
        </p>

        {/* Notes List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filteredNotes.length === 0 ? (
            <div style={{
              padding: 48, textAlign: 'center',
              background: card, borderRadius: 16,
              border: `1px dashed ${border}`,
            }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>📝</div>
              <p style={{ color: muted, fontSize: 14, margin: 0 }}>
                {search ? 'No notes match your search.' : 'No notes yet. Click "+ Add Note" to create one.'}
              </p>
            </div>
          ) : filteredNotes.map(note => (
            <div
              key={note.id}
              style={{
                background: card,
                border: `1px solid ${border}`,
                borderRadius: 14,
                padding: '16px 18px',
                position: 'relative',
                transition: 'box-shadow 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.boxShadow = dark ? '0 4px 20px rgba(0,0,0,0.4)' : '0 4px 20px rgba(0,0,0,0.08)')}
              onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
            >
              {/* Tag */}
              {note.tag && (
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  fontSize: 10, fontWeight: 700, padding: '2px 8px',
                  borderRadius: 99, marginBottom: 8,
                  background: `${TAG_COLORS[note.tag] || '#6b7280'}18`,
                  color: TAG_COLORS[note.tag] || '#6b7280',
                  textTransform: 'uppercase', letterSpacing: '0.05em',
                }}>
                  <Tag size={9} />
                  {note.tag}
                </span>
              )}

              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ margin: '0 0 6px', fontSize: 15, fontWeight: 700, color: text }}>{note.title}</h3>
                  <p style={{ margin: '0 0 8px', fontSize: 13, color: muted, lineHeight: 1.5 }}>{note.content}</p>
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    {note.date && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: muted }}>
                        <Calendar size={11} /> {note.date}
                      </span>
                    )}
                    {note.stopName && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: muted }}>
                        <MapPin size={11} /> {note.stopName}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <button
                    onClick={() => openEdit(note)}
                    style={{
                      width: 32, height: 32, borderRadius: 8,
                      border: `1px solid ${border}`, background: 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', color: muted,
                    }}
                    title="Edit"
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    onClick={() => handleDelete(note.id)}
                    style={{
                      width: 32, height: 32, borderRadius: 8,
                      border: '1px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.05)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', color: '#ef4444',
                    }}
                    title="Delete"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add/Edit Note Modal */}
      {showForm && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(4px)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            zIndex: 9999, padding: 20,
          }}
          onClick={() => setShowForm(false)}
        >
          <div
            style={{
              background: card, borderRadius: 20, padding: '28px 28px 24px',
              width: '100%', maxWidth: 520,
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
              border: `1px solid ${border}`,
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: text }}>
                {editingNote ? 'Edit Note' : '+ Add Note'}
              </h2>
              <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: muted, padding: 4 }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: muted, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 6 }}>Title *</label>
                <input
                  autoFocus
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  placeholder="Note title..."
                  style={{ width: '100%', padding: '10px 12px', border: `1.5px solid ${border}`, borderRadius: 10, background: inputBg, color: text, fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                  onFocus={e => e.target.style.borderColor = '#0ea5e9'}
                  onBlur={e => e.target.style.borderColor = border}
                />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: muted, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 6 }}>Content</label>
                <textarea
                  value={formContent}
                  onChange={e => setFormContent(e.target.value)}
                  placeholder="Write your note..."
                  rows={4}
                  style={{ width: '100%', padding: '10px 12px', border: `1.5px solid ${border}`, borderRadius: 10, background: inputBg, color: text, fontSize: 13, outline: 'none', resize: 'vertical', boxSizing: 'border-box', lineHeight: 1.5 }}
                  onFocus={e => e.target.style.borderColor = '#0ea5e9'}
                  onBlur={e => e.target.style.borderColor = border}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: muted, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 6 }}>Day #</label>
                  <input
                    type="number"
                    value={formDay}
                    onChange={e => setFormDay(e.target.value)}
                    placeholder="e.g. 3"
                    min={1}
                    style={{ width: '100%', padding: '10px 12px', border: `1.5px solid ${border}`, borderRadius: 10, background: inputBg, color: text, fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
                    onFocus={e => e.target.style.borderColor = '#0ea5e9'}
                    onBlur={e => e.target.style.borderColor = border}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: muted, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 6 }}>Stop / City</label>
                  <input
                    value={formStop}
                    onChange={e => setFormStop(e.target.value)}
                    placeholder="e.g. Rome"
                    style={{ width: '100%', padding: '10px 12px', border: `1.5px solid ${border}`, borderRadius: 10, background: inputBg, color: text, fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
                    onFocus={e => e.target.style.borderColor = '#0ea5e9'}
                    onBlur={e => e.target.style.borderColor = border}
                  />
                </div>
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: muted, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 8 }}>Tag</label>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {NOTE_TAGS.map(tag => (
                    <button
                      key={tag}
                      onClick={() => setFormTag(tag)}
                      style={{
                        padding: '5px 12px', borderRadius: 99, border: 'none',
                        background: formTag === tag ? `${TAG_COLORS[tag]}22` : (dark ? 'rgba(255,255,255,0.07)' : '#f3f4f6'),
                        color: formTag === tag ? TAG_COLORS[tag] : muted,
                        fontSize: 11, fontWeight: 700, cursor: 'pointer',
                        outline: formTag === tag ? `1.5px solid ${TAG_COLORS[tag]}` : 'none',
                      }}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
              <button
                onClick={() => setShowForm(false)}
                style={{ flex: 1, padding: '11px', border: `1px solid ${border}`, borderRadius: 10, background: 'transparent', color: muted, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                style={{
                  flex: 2, padding: '11px',
                  background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
                  border: 'none', borderRadius: 10, color: 'white',
                  fontSize: 13, fontWeight: 700, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}
              >
                <Check size={15} /> {editingNote ? 'Save Changes' : 'Add Note'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
// Traveloop – Travel Planning Platform 2026
