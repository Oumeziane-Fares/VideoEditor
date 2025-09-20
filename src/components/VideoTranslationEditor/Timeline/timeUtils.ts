// src/components/VideoTranslationEditor/Timeline/timeUtils.ts

/**
 * Converts SRT time format (HH:MM:SS,ms) to seconds.
 * @param time The SRT time string (e.g., "00:01:23,456")
 * @returns The total time in seconds (e.g., 83.456)
 */
export const parseSrtTime = (time: string): number => {
  const parts = time.split(/[:,]/);
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  const seconds = parseInt(parts[2], 10);
  const milliseconds = parseInt(parts[3], 10);

  return hours * 3600 + minutes * 60 + seconds + milliseconds / 1000;
};