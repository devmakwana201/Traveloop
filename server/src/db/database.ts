import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { createTables } from './schema';
import { runMigrations } from './migrations';
import { runSeeds } from './seeds';
import { Place, Tag } from '../types';

// Resolve the directory where the SQLite database file will be stored
const dataDir = path.join(__dirname, '../../data');

// Ensure the data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Full path to the SQLite database file
const dbPath = path.join(dataDir, 'travel.db');

// Internal reference to the database connection instance
let _db: Database.Database | null = null;

/**
 * 
 * Initializes the SQLite database connection.
 * Closes any existing connection before opening a new one.
 * Sets necessary PRAGMAs for performance and foreign key constraints.
 * Also runs schema creation, migrations, and seeds.
 * 
 */
function initDb(): void {
  // If a connection already exists, safely close it first
  if (_db) {
    try { _db.exec('PRAGMA wal_checkpoint(TRUNCATE)'); } catch (e) {}
    try { _db.close(); } catch (e) {}
    _db = null;
  }

  // Open a new database connection
  _db = new Database(dbPath);
  
  // Enable Write-Ahead Logging for better concurrent read/write performance
  _db.exec('PRAGMA journal_mode = WAL');
  // Set busy timeout to 5000ms to avoid 'database is locked' errors during concurrent access
  _db.exec('PRAGMA busy_timeout = 5000');
  // Enable foreign key constraint enforcement
  _db.exec('PRAGMA foreign_keys = ON');

  // Initialize database schema
  createTables(_db);
  // Apply any pending migrations
  runMigrations(_db);

  // Seed initial data if necessary
  runSeeds(_db);
}

// Initialize the database on module load
initDb();

/**
 * A proxy object that wraps the actual database connection.
 * This allows safe access to the database instance, automatically handling
 * cases where the database might be temporarily unavailable (e.g., during a restore).
 */
const db = new Proxy({} as Database.Database, {
  get(_, prop: string | symbol) {
    if (!_db) throw new Error('Database connection is not available (restore in progress?)');
    const val = (_db as unknown as Record<string | symbol, unknown>)[prop];
    return typeof val === 'function' ? val.bind(_db) : val;
  },
  set(_, prop: string | symbol, val: unknown) {
    (_db as unknown as Record<string | symbol, unknown>)[prop] = val;
    return true;
  },
});

// Seed demo data if the application is running in demo mode
if (process.env.DEMO_MODE?.toLowerCase() === 'true') {
  try {
    const { seedDemoData } = require('../demo/demo-seed');
    seedDemoData(_db);
  } catch (err: unknown) {
    console.error('[Demo] Seed error:', err instanceof Error ? err.message : err);
  }
}

/**
 * Safely closes the database connection and checkpoints WAL.
 */
function closeDb(): void {
  if (_db) {
    try { _db.exec('PRAGMA wal_checkpoint(TRUNCATE)'); } catch (e) {}
    try { _db.close(); } catch (e) {}
    _db = null;
    console.log('[DB] Database connection closed');
  }
}

/**
 * Reinitializes the database connection.
 * Useful after operations like database restore from a backup.
 */
function reinitialize(): void {
  console.log('[DB] Reinitializing database connection after restore...');
  if (_db) closeDb();
  initDb();
  console.log('[DB] Database reinitialized successfully');
}

// Type definitions for extended place objects
interface PlaceWithCategory extends Place {
  category_name: string | null;
  category_color: string | null;
  category_icon: string | null;
}

interface PlaceWithTags extends Place {
  category: { id: number; name: string; color: string; icon: string } | null;
  tags: Tag[];
}

/**
 * Retrieves a place by its ID, including its associated category details and tags.
 * @param placeId - The ID of the place to retrieve.
 * @returns The populated place object, or null if not found.
 */
function getPlaceWithTags(placeId: number | string): PlaceWithTags | null {
  const place = db.prepare(`
    SELECT p.*, c.name as category_name, c.color as category_color, c.icon as category_icon
    FROM places p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.id = ?
  `).get(placeId) as PlaceWithCategory | undefined;

  if (!place) return null;

  const tags = db.prepare(`
    SELECT t.* FROM tags t
    JOIN place_tags pt ON t.id = pt.tag_id
    WHERE pt.place_id = ?
  `).all(placeId) as Tag[];

  return {
    ...place,
    category: place.category_id ? {
      id: place.category_id,
      name: place.category_name!,
      color: place.category_color!,
      icon: place.category_icon!,
    } : null,
    tags,
  };
}

interface TripAccess {
  id: number;
  user_id: number;
}

/**
 * Checks if a user has access to a specific trip.
 * A user has access if they are the owner or a member of the trip.
 * @param tripId - The ID of the trip.
 * @param userId - The ID of the user.
 * @returns The trip access record if the user has access, otherwise undefined.
 */
function canAccessTrip(tripId: number | string, userId: number): TripAccess | undefined {
  return db.prepare(`
    SELECT t.id, t.user_id FROM trips t
    LEFT JOIN trip_members m ON m.trip_id = t.id AND m.user_id = ?
    WHERE t.id = ? AND (t.user_id = ? OR m.user_id IS NOT NULL)
  `).get(userId, tripId, userId) as TripAccess | undefined;
}

/**
 * Checks if a user is the owner of a specific trip.
 * @param tripId - The ID of the trip.
 * @param userId - The ID of the user.
 * @returns True if the user is the owner, false otherwise.
 */
function isOwner(tripId: number | string, userId: number): boolean {
  return !!db.prepare('SELECT id FROM trips WHERE id = ? AND user_id = ?').get(tripId, userId);
}

// Attempt to backfill flight endpoints on startup
try {
  const { backfillFlightEndpoints } = require('../services/airportService');
  backfillFlightEndpoints();
} catch (err) {
  console.error('[DB] Flight endpoint backfill failed:', err);
}

export { db, closeDb, reinitialize, getPlaceWithTags, canAccessTrip, isOwner };
// Traveloop – Travel Planning Platform 2026
