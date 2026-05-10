import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useSettingsStore } from '../store/settingsStore'
import Navbar from '../components/Layout/Navbar'
import { Globe, MapPin, Calendar, Copy, Heart, Share2, Users, Compass, TrendingUp, Search } from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────────────────

interface CommunityTrip {
  id: string
  title: string
  author: string
  authorAvatar?: string
  coverEmoji: string
  destinations: string[]
  duration: string
  startDate: string
  likes: number
  copies: number
  category: string
  description: string
  budget?: string
  isLiked?: boolean
}

// ─── Mock Data (community feed) ──────────────────────────────────────────────

const MOCK_TRIPS: CommunityTrip[] = [
  {
    id: '1',
    title: 'Golden Triangle India',
    author: 'Rahul M.',
    coverEmoji: '🇮🇳',
    destinations: ['Delhi', 'Agra', 'Jaipur'],
    duration: '7 days',
    startDate: 'May 2025',
    likes: 143,
    copies: 28,
    category: 'Culture',
    description: 'Explore the iconic Golden Triangle — the bustling streets of Delhi, the timeless Taj Mahal in Agra, and the Pink City of Jaipur.',
    budget: '₹35,000',
  },
  {
    id: '2',
    title: 'Bali Wellness Retreat',
    author: 'Priya S.',
    coverEmoji: '🇮🇩',
    destinations: ['Ubud', 'Seminyak', 'Nusa Dua'],
    duration: '10 days',
    startDate: 'Jun 2025',
    likes: 218,
    copies: 51,
    category: 'Wellness',
    description: 'A rejuvenating journey through Bali\'s spiritual heartland — yoga, rice terraces, temples, and pristine beaches.',
    budget: '$1,200',
  },
  {
    id: '3',
    title: 'Swiss Alps Adventure',
    author: 'Arjun K.',
    coverEmoji: '🇨🇭',
    destinations: ['Zurich', 'Interlaken', 'Zermatt'],
    duration: '8 days',
    startDate: 'Jul 2025',
    likes: 97,
    copies: 19,
    category: 'Adventure',
    description: 'Cable cars, glacier hikes, and fondue in the heart of the Alps. A dream trip for outdoor lovers.',
    budget: '€2,500',
  },
  {
    id: '4',
    title: 'Tokyo Food Trail',
    author: 'Sneha R.',
    coverEmoji: '🇯🇵',
    destinations: ['Shinjuku', 'Shibuya', 'Asakusa', 'Tsukiji'],
    duration: '5 days',
    startDate: 'Apr 2025',
    likes: 304,
    copies: 87,
    category: 'Food',
    description: 'Ramen, sushi, takoyaki and everything in between — a foodie\'s paradise through Tokyo\'s legendary culinary scene.',
    budget: '$1,800',
  },
  {
    id: '5',
    title: 'Morocco Desert Journey',
    author: 'Vikram N.',
    coverEmoji: '🇲🇦',
    destinations: ['Marrakech', 'Fes', 'Merzouga', 'Casablanca'],
    duration: '9 days',
    startDate: 'Sep 2025',
    likes: 176,
    copies: 34,
    category: 'Culture',
    description: 'Souks, kasbahs, camel rides through the Sahara, and a night under a million stars in the desert.',
    budget: '$900',
  },
  {
    id: '6',
    title: 'Southeast Asia Backpacking',
    author: 'Ananya P.',
    coverEmoji: '✈️',
    destinations: ['Bangkok', 'Chiang Mai', 'Hanoi', 'Ho Chi Minh'],
    duration: '21 days',
    startDate: 'Jan 2026',
    likes: 512,
    copies: 143,
    category: 'Backpacking',
    description: 'The ultimate backpacker route through Southeast Asia — temples, street food, beaches, and unforgettable night markets.',
    budget: '$1,100',
  },
]

const CATEGORIES = ['All', 'Culture', 'Adventure', 'Food', 'Wellness', 'Backpacking']

const CATEGORY_COLORS: Record<string, string> = {
  Culture: 'rgba(234,88,12,0.12)',
  Adventure: 'rgba(16,185,129,0.12)',
  Food: 'rgba(239,68,68,0.12)',
  Wellness: 'rgba(99,102,241,0.12)',
  Backpacking: 'rgba(14,165,233,0.12)',
}

const CATEGORY_TEXT_COLORS: Record<string, string> = {
  Culture: '#ea580c',
  Adventure: '#10b981',
  Food: '#ef4444',
  Wellness: '#6366f1',
  Backpacking: '#0ea5e9',
}

// ─── Trip Card Component ──────────────────────────────────────────────────────

function TripCard({ trip }: { trip: CommunityTrip }) {
  const [liked, setLiked] = useState(trip.isLiked || false)
  const [likeCount, setLikeCount] = useState(trip.likes)
  const [copied, setCopied] = useState(false)

  const handleLike = () => {
    setLiked(!liked)
    setLikeCount(c => liked ? c - 1 : c + 1)
  }

  const handleCopy = () => {
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      className="tl-page-enter"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-primary)',
        borderRadius: 16,
        overflow: 'hidden',
        transition: 'box-shadow 200ms, transform 200ms',
        cursor: 'pointer',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.1)'
        e.currentTarget.style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = 'none'
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      {/* Cover */}
      <div style={{
        height: 100,
        background: 'linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-tertiary) 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 48,
        position: 'relative',
      }}>
        {trip.coverEmoji}
        {/* Category badge */}
        <span style={{
          position: 'absolute',
          top: 10,
          right: 10,
          fontSize: 11,
          fontWeight: 600,
          padding: '3px 10px',
          borderRadius: 99,
          background: CATEGORY_COLORS[trip.category] || 'var(--bg-hover)',
          color: CATEGORY_TEXT_COLORS[trip.category] || 'var(--text-muted)',
        }}>
          {trip.category}
        </span>
      </div>

      {/* Body */}
      <div style={{ padding: '14px 16px' }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px' }}>
          {trip.title}
        </h3>

        {/* Author */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
          <div style={{
            width: 22, height: 22, borderRadius: '50%',
            background: '#0ea5e9', color: '#fff',
            fontSize: 10, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {trip.author.charAt(0)}
          </div>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{trip.author}</span>
        </div>

        {/* Description */}
        <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5, margin: '0 0 12px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {trip.description}
        </p>

        {/* Destinations */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 12 }}>
          {trip.destinations.slice(0, 3).map(dest => (
            <span key={dest} style={{
              display: 'flex', alignItems: 'center', gap: 3,
              fontSize: 11, color: 'var(--text-secondary)',
              background: 'var(--bg-secondary)',
              borderRadius: 6, padding: '2px 7px',
            }}>
              <MapPin size={9} />
              {dest}
            </span>
          ))}
          {trip.destinations.length > 3 && (
            <span style={{ fontSize: 11, color: 'var(--text-faint)', padding: '2px 4px' }}>
              +{trip.destinations.length - 3}
            </span>
          )}
        </div>

        {/* Meta row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text-faint)' }}>
            <Calendar size={11} /> {trip.duration}
          </span>
          {trip.budget && (
            <span style={{ fontSize: 11, color: 'var(--text-faint)' }}>
              ~{trip.budget}
            </span>
          )}
        </div>

        {/* Action row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-secondary)', paddingTop: 12 }}>
          <button
            onClick={handleLike}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              fontSize: 12, fontWeight: 500,
              color: liked ? '#ef4444' : 'var(--text-muted)',
              background: liked ? 'rgba(239,68,68,0.08)' : 'transparent',
              border: 'none', borderRadius: 8, padding: '5px 10px', cursor: 'pointer',
              transition: 'all 150ms',
            }}
          >
            <Heart size={13} fill={liked ? '#ef4444' : 'none'} />
            {likeCount}
          </button>

          <div style={{ display: 'flex', gap: 6 }}>
            <button
              onClick={handleCopy}
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                fontSize: 12, fontWeight: 500,
                color: copied ? '#10b981' : 'var(--text-secondary)',
                background: copied ? 'rgba(16,185,129,0.08)' : 'var(--bg-secondary)',
                border: 'none', borderRadius: 8, padding: '5px 10px', cursor: 'pointer',
                transition: 'all 150ms',
              }}
            >
              <Copy size={12} />
              {copied ? 'Copied!' : `Copy (${trip.copies})`}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CommunityPage() {
  const darkMode = useSettingsStore(s => s.settings.dark_mode)
  const dark = darkMode === true || darkMode === 'dark' || (darkMode === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)

  const [activeCategory, setActiveCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')

  const filtered = MOCK_TRIPS.filter(trip => {
    const matchCat = activeCategory === 'All' || trip.category === activeCategory
    const matchSearch = searchQuery === '' ||
      trip.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trip.destinations.some(d => d.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchCat && matchSearch
  })

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Navbar />

      <div style={{
        maxWidth: 1100,
        margin: '0 auto',
        padding: 'calc(var(--nav-h) + 32px) 20px 48px',
      }}>
        {/* Header */}
        <div className="tl-page-enter" style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <div style={{
              width: 42, height: 42, borderRadius: 12,
              background: 'rgba(14,165,233,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Globe size={22} color="#0ea5e9" />
            </div>
            <div>
              <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.5px' }}>
                Community Feed
              </h1>
              <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: 0 }}>
                Discover and copy itineraries shared by fellow travelers
              </p>
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 12,
          marginBottom: 28,
        }}>
          {[
            { icon: Users, label: 'Active Travelers', value: '2,847', color: '#0ea5e9' },
            { icon: Compass, label: 'Shared Itineraries', value: '1,204', color: '#10b981' },
            { icon: TrendingUp, label: 'Trips Copied This Week', value: '389', color: '#f59e0b' },
          ].map(stat => (
            <div key={stat.label} style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-primary)',
              borderRadius: 14,
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: `${stat.color}18`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <stat.icon size={18} color={stat.color} />
              </div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 3 }}>
                  {stat.label}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Search + Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)' }} />
            <input
              className="form-input"
              placeholder="Search destinations, trip names..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ paddingLeft: 34, borderRadius: 10, fontSize: 13 }}
            />
          </div>

          {/* Category filter pills */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  fontSize: 12, fontWeight: 600,
                  padding: '6px 14px', borderRadius: 99,
                  border: activeCategory === cat ? 'none' : '1px solid var(--border-primary)',
                  background: activeCategory === cat ? '#0ea5e9' : 'var(--bg-card)',
                  color: activeCategory === cat ? '#fff' : 'var(--text-secondary)',
                  cursor: 'pointer', transition: 'all 150ms',
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Trip grid */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 24px', color: 'var(--text-faint)' }}>
            <Globe size={40} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
            <p style={{ fontSize: 14 }}>No trips found for your search.</p>
          </div>
        ) : (
          <div className="tl-stagger" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: 20,
          }}>
            {filtered.map(trip => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
// Traveloop – Travel Planning Platform 2026
