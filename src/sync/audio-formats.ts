/** Formats that always need conversion to MP3 (lossless or incompatible containers) */
export const LOSSLESS_FORMATS = new Set(['flac', 'wav', 'aiff', 'aif', 'wv', 'ape', 'alac']);

/** All supported audio file extensions on the destination device */
export const ALL_AUDIO_EXTENSIONS = ['mp3', 'flac', 'wav', 'm4a', 'aac', 'ogg', 'wma', 'opus'] as const;

/**
 * Concurrency for tracks that need FFmpeg conversion.
 * 3 slots overlaps download with encoding without thrashing CPU on slow hardware.
 */
export const CONVERT_CONCURRENCY = 3;

/**
 * Concurrency for copy-only tracks (no FFmpeg).
 * Bottleneck is network; CPU is idle so more parallel downloads help.
 */
export const COPY_CONCURRENCY = 6;
