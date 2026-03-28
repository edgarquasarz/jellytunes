import { tmpdir } from 'os';
import { join } from 'path';

/**
 * Build cross-platform temp file paths for FLAC→MP3 conversion.
 *
 * Uses os.tmpdir() instead of a hardcoded /tmp/ so paths resolve correctly
 * on Windows (C:\Users\<user>\AppData\Local\Temp) as well as macOS/Linux.
 */
export function buildTempPaths(
  trackName: string,
  timestamp: number
): { sourcePath: string; tempPath: string } {
  const safeName = trackName.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 50);
  return {
    sourcePath: join(tmpdir(), `jellytunes_src_${timestamp}.tmp`),
    tempPath: join(tmpdir(), `jellytunes_${timestamp}_${safeName}.mp3`),
  };
}
