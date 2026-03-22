/**
 * SQLite database module for JellyTunes
 *
 * Tracks sync history and synced files per device.
 * Used for smart sync (show what's new vs. already synced) and history view.
 */

import { app } from 'electron'
import Database from 'better-sqlite3'
import path from 'path'
import log from 'electron-log'

let db: Database.Database | null = null

export interface SyncHistoryEntry {
  id: number
  deviceMountPoint: string
  startedAt: string
  completedAt: string | null
  tracksSynced: number
  bytesTransferred: number
  status: 'success' | 'error' | 'cancelled'
}

export interface DeviceSyncInfo {
  lastSync: string | null
  totalTracks: number
  totalBytes: number
  syncCount: number
}

export interface SyncedItemInfo {
  id: string
  name: string
  type: 'artist' | 'album' | 'playlist'
}

// ---------------------------------------------------------------------------
// Init
// ---------------------------------------------------------------------------

export function initDatabase(): void {
  if (db) return

  const dbPath = path.join(app.getPath('userData'), 'jellytunes.db')
  log.info(`Database: ${dbPath}`)

  db = new Database(dbPath)
  db.pragma('journal_mode = WAL')
  db.pragma('foreign_keys = ON')

  db.exec(`
    CREATE TABLE IF NOT EXISTS devices (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      mount_point TEXT UNIQUE NOT NULL,
      name        TEXT,
      last_sync_at TEXT
    );

    CREATE TABLE IF NOT EXISTS sync_history (
      id                INTEGER PRIMARY KEY AUTOINCREMENT,
      device_id         INTEGER NOT NULL,
      started_at        TEXT NOT NULL DEFAULT (datetime('now')),
      completed_at      TEXT,
      tracks_synced     INTEGER NOT NULL DEFAULT 0,
      bytes_transferred INTEGER NOT NULL DEFAULT 0,
      status            TEXT NOT NULL DEFAULT 'pending',
      FOREIGN KEY (device_id) REFERENCES devices(id)
    );

    CREATE TABLE IF NOT EXISTS synced_files (
      id               INTEGER PRIMARY KEY AUTOINCREMENT,
      device_id        INTEGER NOT NULL,
      item_id          TEXT NOT NULL,
      destination_path TEXT NOT NULL,
      file_size        INTEGER,
      synced_at        TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(device_id, item_id),
      FOREIGN KEY (device_id) REFERENCES devices(id)
    );
  `)

  // Index for device-based queries on sync_history (avoids full table scan as history grows)
  db.exec('CREATE INDEX IF NOT EXISTS idx_sync_history_device ON sync_history(device_id)')

  // Migrations: add columns if they don't exist (SQLite has no IF NOT EXISTS for ALTER TABLE)
  try { db.exec('ALTER TABLE synced_files ADD COLUMN item_name TEXT') } catch { /* already exists */ }
  try { db.exec('ALTER TABLE synced_files ADD COLUMN item_type TEXT') } catch { /* already exists */ }

  log.info('Database ready')
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function requireDb(): Database.Database {
  if (!db) throw new Error('Database not initialized — call initDatabase() first')
  return db
}

// ---------------------------------------------------------------------------
// Devices
// ---------------------------------------------------------------------------

function upsertDevice(mountPoint: string, name?: string): number {
  const database = requireDb()
  const existing = database
    .prepare('SELECT id FROM devices WHERE mount_point = ?')
    .get(mountPoint) as { id: number } | undefined

  if (existing) {
    database
      .prepare("UPDATE devices SET last_sync_at = datetime('now'), name = COALESCE(?, name) WHERE id = ?")
      .run(name ?? null, existing.id)
    return existing.id
  }

  const result = database
    .prepare('INSERT INTO devices (mount_point, name) VALUES (?, ?)')
    .run(mountPoint, name ?? mountPoint)
  return result.lastInsertRowid as number
}

// ---------------------------------------------------------------------------
// Sync history
// ---------------------------------------------------------------------------

export function recordSyncCompleted(
  mountPoint: string,
  tracksSynced: number,
  bytesTransferred: number,
  status: 'success' | 'error' | 'cancelled',
  items: SyncedItemInfo[]
): void {
  const database = requireDb()
  const deviceId = upsertDevice(mountPoint)

  // Record aggregate history
  database
    .prepare(`
      INSERT INTO sync_history (device_id, completed_at, tracks_synced, bytes_transferred, status)
      VALUES (?, datetime('now'), ?, ?, ?)
    `)
    .run(deviceId, tracksSynced, bytesTransferred, status)

  // Record individual synced files (upsert so we update synced_at and name/type on re-sync)
  if (items.length > 0 && status !== 'error') {
    const stmt = database.prepare(`
      INSERT INTO synced_files (device_id, item_id, destination_path, item_name, item_type, synced_at)
      VALUES (?, ?, ?, ?, ?, datetime('now'))
      ON CONFLICT(device_id, item_id) DO UPDATE SET
        synced_at = excluded.synced_at,
        item_name = excluded.item_name,
        item_type = excluded.item_type
    `)
    const insertMany = database.transaction((infos: SyncedItemInfo[]) => {
      for (const info of infos) stmt.run(deviceId, info.id, mountPoint, info.name, info.type)
    })
    insertMany(items)
  }
}

export function getSyncedItemIds(mountPoint: string): Set<string> {
  const database = requireDb()
  const device = database
    .prepare('SELECT id FROM devices WHERE mount_point = ?')
    .get(mountPoint) as { id: number } | undefined
  if (!device) return new Set()

  const rows = database
    .prepare('SELECT item_id FROM synced_files WHERE device_id = ?')
    .all(device.id) as { item_id: string }[]
  return new Set(rows.map(r => r.item_id))
}

export function getSyncedItems(mountPoint: string): SyncedItemInfo[] {
  const database = requireDb()
  const device = database
    .prepare('SELECT id FROM devices WHERE mount_point = ?')
    .get(mountPoint) as { id: number } | undefined
  if (!device) return []

  const rows = database
    .prepare('SELECT item_id, item_name, item_type FROM synced_files WHERE device_id = ?')
    .all(device.id) as { item_id: string; item_name: string | null; item_type: string | null }[]
  return rows.map(r => ({
    id: r.item_id,
    name: r.item_name ?? r.item_id,
    type: (r.item_type ?? 'artist') as 'artist' | 'album' | 'playlist',
  }))
}

export function getDeviceSyncInfo(mountPoint: string): DeviceSyncInfo {
  const database = requireDb()
  const device = database
    .prepare('SELECT id, last_sync_at FROM devices WHERE mount_point = ?')
    .get(mountPoint) as { id: number; last_sync_at: string } | undefined

  if (!device) return { lastSync: null, totalTracks: 0, totalBytes: 0, syncCount: 0 }

  const stats = database
    .prepare(`
      SELECT
        COUNT(*)          AS sync_count,
        SUM(tracks_synced)     AS total_tracks,
        SUM(bytes_transferred) AS total_bytes
      FROM sync_history
      WHERE device_id = ? AND status = 'success'
    `)
    .get(device.id) as { sync_count: number; total_tracks: number; total_bytes: number }

  return {
    lastSync: device.last_sync_at,
    totalTracks: stats?.total_tracks ?? 0,
    totalBytes: stats?.total_bytes ?? 0,
    syncCount: stats?.sync_count ?? 0,
  }
}

export function getRecentSyncHistory(limit = 10): SyncHistoryEntry[] {
  const database = requireDb()
  return database
    .prepare(`
      SELECT
        sh.id,
        d.mount_point AS deviceMountPoint,
        sh.started_at AS startedAt,
        sh.completed_at AS completedAt,
        sh.tracks_synced AS tracksSynced,
        sh.bytes_transferred AS bytesTransferred,
        sh.status
      FROM sync_history sh
      JOIN devices d ON d.id = sh.device_id
      ORDER BY sh.started_at DESC
      LIMIT ?
    `)
    .all(limit) as SyncHistoryEntry[]
}

export function removeSyncedItems(mountPoint: string, itemIds: string[]): void {
  if (itemIds.length === 0) return
  const database = requireDb()
  const device = database
    .prepare('SELECT id FROM devices WHERE mount_point = ?')
    .get(mountPoint) as { id: number } | undefined
  if (!device) return

  const stmt = database.prepare('DELETE FROM synced_files WHERE device_id = ? AND item_id = ?')
  const deleteMany = database.transaction((ids: string[]) => {
    for (const id of ids) stmt.run(device.id, id)
  })
  deleteMany(itemIds)
}

export function closeDatabase(): void {
  db?.close()
  db = null
}
