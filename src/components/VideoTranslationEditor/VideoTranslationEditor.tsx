import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Settings, Plus, Scissors, Search, ZoomIn, ZoomOut } from 'lucide-react';

// Types
type SubtitleItem = {
  id: string;
  startTime: string;
  endTime: string;
  text: string;
};

// Utility function to parse SRT time
const parseSrtTime = (time: string): number => {
  const parts = time.split(/[:,]/);
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  const seconds = parseInt(parts[2], 10);
  const milliseconds = parseInt(parts[3], 10);
  return hours * 3600 + minutes * 60 + seconds + milliseconds / 1000;
};

// Format time for display
const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 10);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms}`;
};

// Simple SRT parser
const parseSrt = (content: string): SubtitleItem[] => {
  const blocks = content.trim().split('\n\n');
  return blocks.map((block, index) => {
    const lines = block.split('\n');
    if (lines.length >= 3) {
      return {
        id: lines[0] || `${index + 1}`,
        startTime: lines[1]?.split(' --> ')[0] || '00:00:00,000',
        endTime: lines[1]?.split(' --> ')[1] || '00:00:00,000',
        text: lines.slice(2).join(' ')
      };
    }
    return {
      id: `${index + 1}`,
      startTime: '00:00:00,000',
      endTime: '00:00:00,000',
      text: ''
    };
  }).filter(item => item.text);
};

// Subtitle Track Component
const SubtitleTrack: React.FC<{
  subtitles: SubtitleItem[];
  totalDuration: number;
  currentTime: number;
  onSubtitleClick: (time: number) => void;
  trackColor: string;
  trackLabel: string;
}> = ({ subtitles, totalDuration, currentTime, onSubtitleClick, trackColor, trackLabel }) => {
  if (totalDuration === 0) return null;

  return (
    <div className="mb-4">
      <div className="flex items-center mb-2">
        <div className={`w-4 h-4 ${trackColor} rounded mr-2`}></div>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{trackLabel}</span>
      </div>
      <div className="relative h-12 w-full bg-gray-200 dark:bg-gray-700 rounded-md overflow-hidden">
        {subtitles.map((sub) => {
          const startTimeInSeconds = parseSrtTime(sub.startTime);
          const endTimeInSeconds = parseSrtTime(sub.endTime);
          const leftPercentage = (startTimeInSeconds / totalDuration) * 100;
          const widthPercentage = ((endTimeInSeconds - startTimeInSeconds) / totalDuration) * 100;
          const isActive = currentTime >= startTimeInSeconds && currentTime <= endTimeInSeconds;

          return (
            <div
              key={sub.id}
              className={`absolute h-full p-1 overflow-hidden cursor-pointer transition-all duration-200 ${trackColor} ${
                isActive ? 'opacity-100 ring-2 ring-blue-500' : 'opacity-70 hover:opacity-90'
              } rounded-sm`}
              style={{
                left: `${leftPercentage}%`,
                width: `${Math.max(widthPercentage, 0.5)}%`,
                minWidth: '3px'
              }}
              title={sub.text}
              onClick={() => onSubtitleClick(startTimeInSeconds)}
            >
              <div className="text-white text-xs font-medium truncate">
                {sub.text}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Time Ruler Component
const TimeRuler: React.FC<{
  duration: number;
  currentTime: number;
}> = ({ duration, currentTime }) => {
  const markers = [];
  const interval = duration > 300 ? 30 : duration > 60 ? 10 : 5;
  
  for (let i = 0; i <= duration; i += interval) {
    const leftPercentage = (i / duration) * 100;
    markers.push(
      <div key={i} className="absolute" style={{ left: `${leftPercentage}%` }}>
        <div className="w-px h-4 bg-gray-400"></div>
        <div className="text-xs text-gray-500 mt-1 transform -translate-x-1/2">
          {Math.floor(i / 60)}:{(i % 60).toString().padStart(2, '0')}
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-8 w-full mb-4 border-b border-gray-300 dark:border-gray-600">
      {markers}
      {/* Current time indicator */}
      <div 
        className="absolute top-0 w-0.5 h-full bg-red-500 z-10"
        style={{ left: `${(currentTime / duration) * 100}%` }}
      >
        <div className="absolute -top-1 -left-1 w-3 h-3 bg-red-500 rounded-full"></div>
      </div>
    </div>
  );
};

// Main Component
export const VideoTranslationEditor: React.FC = () => { // Add "export" here
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [subtitles1, setSubtitles1] = useState<SubtitleItem[]>([]);
  const [subtitles2, setSubtitles2] = useState<SubtitleItem[]>([]);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [originalLang, setOriginalLang] = useState('العربية');
  const [translatedLang, setTranslatedLang] = useState('English');
  
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
    }
  };

  const handleSubtitleUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<SubtitleItem[]>>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        const parsedSrt = parseSrt(content);
        setter(parsedSrt);
      };
      reader.readAsText(file);
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const seekTo = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const skipBackward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 10);
    }
  };

  const skipForward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.min(duration, videoRef.current.currentTime + 10);
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      const updateTime = () => setCurrentTime(video.currentTime);
      const updateDuration = () => setDuration(video.duration || 0);
      const handlePlay = () => setIsPlaying(true);
      const handlePause = () => setIsPlaying(false);

      video.addEventListener('timeupdate', updateTime);
      video.addEventListener('loadedmetadata', updateDuration);
      video.addEventListener('play', handlePlay);
      video.addEventListener('pause', handlePause);

      return () => {
        video.removeEventListener('timeupdate', updateTime);
        video.removeEventListener('loadedmetadata', updateDuration);
        video.removeEventListener('play', handlePlay);
        video.removeEventListener('pause', handlePause);
      };
    }
  }, [videoUrl]);

  return (
    <div className="bg-white dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">مشغل الفيديو</h1>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
              حفظ الفيديو ✓
            </button>
            <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
              بدء اختبار القص 📐
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col h-full">
        {/* Video Player Section */}
        <div className="bg-black aspect-video relative">
          {videoUrl ? (
            <video
              ref={videoRef}
              src={videoUrl}
              className="w-full h-full object-contain"
              controls={false}
            >
              <track kind="captions" />
            </video>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <label htmlFor="video-upload" className="cursor-pointer bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                Upload Video
              </label>
              <input 
                id="video-upload" 
                type="file" 
                accept="video/*" 
                onChange={handleVideoUpload} 
                className="hidden" 
              />
            </div>
          )}

          {/* Video Controls Overlay */}
          {videoUrl && (
            <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-50 rounded-lg p-4">
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center gap-4">
                  <button onClick={skipBackward} className="hover:bg-white hover:bg-opacity-20 p-2 rounded">
                    <SkipBack size={20} />
                  </button>
                  <button onClick={togglePlay} className="hover:bg-white hover:bg-opacity-20 p-2 rounded">
                    {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                  </button>
                  <button onClick={skipForward} className="hover:bg-white hover:bg-opacity-20 p-2 rounded">
                    <SkipForward size={20} />
                  </button>
                </div>
                <div className="text-sm">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Timeline Section */}
        <div className="flex-1 bg-gray-50 dark:bg-gray-900 p-4">
          <div className="mb-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              معلومة للشاشة
            </div>
          </div>

          {/* Control Bar */}
          <div className="flex items-center justify-between mb-6 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                <Search size={20} />
              </button>
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                <ZoomOut size={20} />
              </button>
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                <ZoomIn size={20} />
              </button>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <SkipBack size={16} />
                <Play size={16} />
                <SkipForward size={16} />
              </div>
              <div className="text-sm bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors flex items-center gap-2">
                <Scissors size={16} />
                قص
              </button>
              <button className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors flex items-center gap-2">
                <Plus size={16} />
                إضافة مقطع ترجمة
              </button>
            </div>
          </div>

          {/* Language Labels */}
          <div className="flex justify-center gap-8 mb-4">
            <div className="px-4 py-2 bg-purple-100 text-purple-800 rounded-lg">
              لغة الترجمة: {originalLang}
            </div>
            <div className="px-4 py-2 bg-green-100 text-green-800 rounded-lg">
              لغة المقطع الأصلي: {translatedLang}
            </div>
          </div>

          {/* Timeline */}
          {duration > 0 && (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
              <TimeRuler duration={duration} currentTime={currentTime} />
              
              {subtitles1.length > 0 && (
                <SubtitleTrack
                  subtitles={subtitles1}
                  totalDuration={duration}
                  currentTime={currentTime}
                  onSubtitleClick={seekTo}
                  trackColor="bg-purple-500"
                  trackLabel={originalLang}
                />
              )}
              
              {subtitles2.length > 0 && (
                <SubtitleTrack
                  subtitles={subtitles2}
                  totalDuration={duration}
                  currentTime={currentTime}
                  onSubtitleClick={seekTo}
                  trackColor="bg-green-500"
                  trackLabel={translatedLang}
                />
              )}

              {/* Upload buttons */}
              {subtitles1.length === 0 && (
                <div className="text-center py-8">
                  <label htmlFor="sub1-upload" className="cursor-pointer bg-purple-500 text-white px-6 py-3 rounded-lg hover:bg-purple-600 transition-colors inline-block">
                    Upload Original Subtitles ({originalLang})
                  </label>
                  <input 
                    id="sub1-upload" 
                    type="file" 
                    accept=".srt" 
                    onChange={(e) => handleSubtitleUpload(e, setSubtitles1)} 
                    className="hidden" 
                  />
                </div>
              )}
              
              {subtitles2.length === 0 && (
                <div className="text-center py-8">
                  <label htmlFor="sub2-upload" className="cursor-pointer bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors inline-block">
                    Upload Translation Subtitles ({translatedLang})
                  </label>
                  <input 
                    id="sub2-upload" 
                    type="file" 
                    accept=".srt" 
                    onChange={(e) => handleSubtitleUpload(e, setSubtitles2)} 
                    className="hidden" 
                  />
                </div>
              )}
            </div>
          )}

          {/* Audio Waveform Placeholder */}
          <div className="mt-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
            <div className="h-16 bg-gradient-to-r from-green-200 to-green-400 rounded relative overflow-hidden">
              {/* Simulated waveform */}
              <div className="flex items-end h-full">
                {Array.from({ length: 200 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-green-500 mx-px"
                    style={{ height: `${Math.random() * 100}%` }}
                  />
                ))}
              </div>
              {/* Current time indicator on waveform */}
              <div 
                className="absolute top-0 w-0.5 h-full bg-red-500 z-10"
                style={{ left: `${(currentTime / duration) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
