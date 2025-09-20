// src/components/VideoTranslationEditor/Timeline/Timeline.tsx

import React from 'react';
import { SubtitleTrack } from './SubtitleTrack';

type SubtitleItem = {
  id: string;
  startTime: string;
  endTime: string;
  text: string;
};

interface TimelineProps {
  subtitles1: SubtitleItem[];
  subtitles2: SubtitleItem[];
  duration: number;
}

export const Timeline: React.FC<TimelineProps> = ({ subtitles1, subtitles2, duration }) => {
  return (
    <div className="w-full bg-gray-2 dark:bg-dark-2 p-4 rounded-b-lg space-y-2">
      <SubtitleTrack 
        subtitles={subtitles1} 
        totalDuration={duration} 
        className="bg-dark dark:bg-dark-3"
      />
      <SubtitleTrack 
        subtitles={subtitles2} 
        totalDuration={duration} 
        className="bg-dark dark:bg-dark-3"
      />
    </div>
  );
};