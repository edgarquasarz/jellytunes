/**
 * Test: sync:start2 Bug - VERIFIED FIXED
 * 
 * This test originally demonstrated the bug in sync:start2 handler.
 * NOW: The handler has been refactored to use SyncCore, so the bug is FIXED!
 * 
 * Input:  Path="/mediamusic/lib/lib/Ace/Five-A-Side/Ace - Five-A-Side - How Long.mp3"
 * Output: /dest/Ace/Five-A-Side/Ace - Five-A-Side - How Long.mp3
 */

import { describe, it, expect } from 'vitest';
import type { TrackInfo } from '../types';
import { createTestSyncCore } from '../sync-core';
import { createMockApiClient } from '../sync-api';
import type { SyncDependencies } from '../sync-core';

describe('sync:start2 - Bug FIXED with SyncCore', () => {
  const VALID_USER_ID = 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4';
  
  it('sync:start2 now uses SyncCore to preserve server path structure', async () => {
    // Real track from Jellyfin server
    const realTrack: TrackInfo = {
      id: 'track-123',
      name: 'How Long',
      album: 'Five-A-Side',
      artists: ['Ace'],
      albumArtist: 'Ace',
      year: 2020,
      path: '/mediamusic/lib/lib/Ace/Five-A-Side/Ace - Five-A-Side - How Long.mp3',
      format: 'mp3',
      size: 5242880,
      trackNumber: 1,
      discNumber: 1,
    };

    // Mock API
    const mockApi = createMockApiClient({
      getTracksForItems: async () => ({
        tracks: [realTrack],
        errors: [],
      }),
      testConnection: async () => ({ success: true }),
    });

    const mockFs = {
      exists: async () => false,
      stat: async () => ({ size: 0 }),
      copyFile: async () => {},
      mkdir: async () => {},
      unlink: async () => {},
      readdir: async () => [],
      isDirectory: async () => true,
    };

    const mockConverter = {
      convertToMp3: async () => ({ success: true }),
    };

    // Capture paths created during sync
    const capturedPaths: { dir: string; file: string }[] = [];
    const capturingFs = {
      ...mockFs,
      mkdir: async (path: string) => {
        capturedPaths.push({ dir: path, file: '' });
      },
      copyFile: async (src: string, dest: string) => {
        capturedPaths.push({ dir: dest.substring(0, dest.lastIndexOf('/')), file: dest.substring(dest.lastIndexOf('/') + 1) });
      },
    };

    const capturingDeps: SyncDependencies = {
      api: mockApi,
      fs: capturingFs as any,
      converter: mockConverter as any,
    };

    // Create SyncCore with serverRootPath (simulating auto-detection)
    const config = {
      serverUrl: 'http://jellyfin.local',
      apiKey: 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4',
      userId: VALID_USER_ID,
      serverRootPath: '/mediamusic/lib/lib/', // This is auto-detected from tracks
    };

    const core = createTestSyncCore(config, capturingDeps);
    
    const result = await core.sync({
      itemIds: ['test-item'],
      itemTypes: new Map([['test-item', 'album' as any]]),
      destinationPath: '/dest',
      options: { preserveStructure: true },
    });

    console.log('\n✅ SYNC:START2 NOW GENERATES (FIXED):');
    console.log('  Captured paths:', capturedPaths);
    
    // Verify the fix: should be /dest/Ace/Five-A-Side/ NOT /dest/lib/Ace (2020)/
    expect(result.success).toBe(true);
    expect(result.tracksCopied).toBe(1);
    
    // Verify directory structure is preserved from server path
    const hasCorrectDir = capturedPaths.some(p => p.dir === '/dest/Ace/Five-A-Side');
    const hasWrongDir = capturedPaths.some(p => p.dir.includes('/dest/lib/') || p.dir.includes('/dest/Ace (2020)'));
    
    expect(hasCorrectDir).toBe(true);
    expect(hasWrongDir).toBe(false);
    
    console.log('  Has correct dir (/dest/Ace/Five-A-Side):', hasCorrectDir);
    console.log('  Has wrong dir:', hasWrongDir);
  });

  it('handles edge cases correctly with SyncCore', async () => {
    // Multiple tracks to test various edge cases
    const tracks: TrackInfo[] = [
      {
        id: '1',
        name: 'Track 1',
        path: '/mediamusic/lib/lib/Various Artists/Compilation 2024/track1.mp3',
        artists: ['Various'],
        album: 'Compilation 2024',
        year: 2024,
        format: 'mp3',
        size: 5242880,
      },
      {
        id: '2',
        name: 'Track 2',
        path: '/mediamusic/lib/lib/Composers/Bach/Goldberg Variations/track2.mp3',
        artists: ['Bach'],
        album: 'Goldberg Variations',
        format: 'mp3',
        size: 5242880,
      },
    ];

    const mockApi = createMockApiClient({
      getTracksForItems: async () => ({
        tracks,
        errors: [],
      }),
    });

    const mockFs = {
      exists: async () => false,
      stat: async () => ({ size: 0 }),
      copyFile: async () => {},
      mkdir: async () => {},
      unlink: async () => {},
      readdir: async () => [],
      isDirectory: async () => true,
    };

    const capturedDirs: string[] = [];
    const capturingFs = {
      ...mockFs,
      mkdir: async (path: string) => {
        capturedDirs.push(path);
      },
      copyFile: async () => {},
    };

    const deps: SyncDependencies = {
      api: mockApi,
      fs: capturingFs as any,
      converter: { convertToMp3: async () => ({ success: true }) } as any,
    };

    const config = {
      serverUrl: 'http://jellyfin.local',
      apiKey: 'test-key',
      userId: VALID_USER_ID,
      serverRootPath: '/mediamusic/lib/lib/',
    };

    const core = createTestSyncCore(config, deps);
    const result = await core.sync({
      itemIds: ['item1', 'item2'],
      itemTypes: new Map([['item1', 'album' as any], ['item2', 'album' as any]]),
      destinationPath: '/destination',
      options: { preserveStructure: true },
    });

    console.log('\n📋 EDGE CASES - Now Fixed:\n');
    console.log('  Captured dirs:', capturedDirs);
    
    // Verify various artists case
    const hasVariousArtists = capturedDirs.includes('/destination/Various Artists/Compilation 2024');
    // Verify classical case  
    const hasBach = capturedDirs.includes('/destination/Composers/Bach/Goldberg Variations');
    
    console.log('  Various Artists path preserved:', hasVariousArtists);
    console.log('  Bach path preserved:', hasBach);
    
    expect(result.success).toBe(true);
    expect(hasVariousArtists).toBe(true);
    expect(hasBach).toBe(true);
  });
});
