// src/components/VideoTranslationEditor/Timeline/SubtitleTrack.tsx

import React from 'react';
import { parseSrtTime } from './timeUtils';

type SubtitleItem = {
  id: string;
  startTime: string;
  endTime: string;
  text: string;
};

interface SubtitleTrackProps {
  subtitles: SubtitleItem[];
  totalDuration: number;
  className?: string;
}

export const SubtitleTrack: React.FC<SubtitleTrackProps> = ({ subtitles, totalDuration, className }) => {
  if (totalDuration === 0) return null; // Don't render if we don't know the video length

  return (
    <div className={`relative h-12 w-full rounded-md ${className}`}>
      {subtitles.map((sub) => {
        const startTimeInSeconds = parseSrtTime(sub.startTime);
        const endTimeInSeconds = parseSrtTime(sub.endTime);

        const leftPercentage = (startTimeInSeconds / totalDuration) * 100;
        const widthPercentage = ((endTimeInSeconds - startTimeInSeconds) / totalDuration) * 100;

        return (
          <div
            key={sub.id}
            className="absolute h-full p-2 overflow-hidden whitespace-nowrap text-white text-xs rounded-md bg-primary bg-opacity-70 hover:bg-opacity-100 cursor-pointer"
            style={{
              left: `${leftPercentage}%`,
              width: `${widthPercentage}%`,
              minWidth: '2px' // Ensure even very short subs are visible
            }}
            title={sub.text} // Show full text on hover
          >
            {sub.text}
          </div>
        );
      })}
    </div>
  );
};