import React, { useState, useEffect } from 'react';
import { X, Download, ExternalLink, Check, ZoomIn, ZoomOut } from 'lucide-react';
import { UserAvatar } from './UserAvatar';

interface MediaViewerModalProps {
  mediaUrl: string;
  mediaType?: 'image' | 'video';
  senderName: string;
  senderAvatar?: string;
  timestamp?: string;
  onClose: () => void;
}

export const MediaViewerModal: React.FC<MediaViewerModalProps> = ({
  mediaUrl,
  mediaType = 'image',
  senderName,
  senderAvatar,
  timestamp,
  onClose
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDownloading) return;
    setIsDownloading(true);

    try {
      const response = await fetch(mediaUrl);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = blobUrl;
      const fileExt = mediaType === 'video' ? 'mp4' : 'jpg';
      a.download = `pinterest-photo-${Date.now()}.${fileExt}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);

      setIsDownloaded(true);
      setTimeout(() => setIsDownloaded(false), 2500);
    } catch (err) {
      console.warn('Direct blob download notice, opening fallback:', err);
      // Fallback: direct window open/download
      const a = document.createElement('a');
      a.href = mediaUrl;
      a.target = '_blank';
      a.download = `pinterest-photo-${Date.now()}`;
      a.click();
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex flex-col justify-between select-none animate-fadeIn"
    >
      {/* Top Header Bar */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex items-center justify-between px-4 py-3 md:px-6 md:py-4 glass-panel border-b border-white/10 z-20"
      >
        {/* Left: Sender info */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/10 rounded-full transition cursor-pointer"
            title="Close"
          >
            <X className="w-6 h-6 stroke-[2]" />
          </button>

          <UserAvatar name={senderName} src={senderAvatar} size="sm" />

          <div className="flex flex-col">
            <span className="text-sm font-semibold text-white tracking-wide">
              {senderName}
            </span>
            {timestamp && (
              <span className="text-[11px] text-zinc-400 font-medium">
                {timestamp}
              </span>
            )}
          </div>
        </div>

        {/* Right: Actions (Download + Zoom + Open in new tab) */}
        <div className="flex items-center space-x-2">
          {mediaType === 'image' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsZoomed(!isZoomed);
              }}
              className="p-2 text-zinc-300 hover:text-white hover:bg-white/10 rounded-full transition cursor-pointer"
              title={isZoomed ? 'Zoom out' : 'Zoom in'}
            >
              {isZoomed ? <ZoomOut className="w-5 h-5" /> : <ZoomIn className="w-5 h-5" />}
            </button>
          )}

          <a
            href={mediaUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="p-2 text-zinc-300 hover:text-white hover:bg-white/10 rounded-full transition cursor-pointer"
            title="Open original"
          >
            <ExternalLink className="w-5 h-5" />
          </a>

          {/* Download Button */}
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all shadow-md active:scale-95 cursor-pointer ${
              isDownloaded
                ? 'bg-emerald-600 text-white'
                : 'bg-[#0095F6] hover:bg-blue-600 text-white'
            }`}
            title="Download Media Photo"
          >
            {isDownloaded ? (
              <>
                <Check className="w-4 h-4 stroke-[2.5]" />
                <span className="hidden sm:inline">Saved</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4 stroke-[2]" />
                <span>{isDownloading ? 'Saving...' : 'Download'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Center Media Presentation Viewport */}
      <div
        className="flex-1 flex items-center justify-center p-2 md:p-6 overflow-auto cursor-pointer"
        onClick={onClose}
      >
        {mediaType === 'video' ? (
          <video
            src={mediaUrl}
            controls
            autoPlay
            playsInline
            onClick={(e) => e.stopPropagation()}
            className="max-h-[82vh] max-w-full rounded-2xl shadow-2xl object-contain animate-scaleUp"
          />
        ) : (
          <img
            src={mediaUrl}
            alt="Full view attachment"
            onClick={(e) => {
              e.stopPropagation();
              setIsZoomed(!isZoomed);
            }}
            className={`max-h-[82vh] max-w-full rounded-2xl shadow-2xl object-contain transition-all duration-300 animate-scaleUp select-none ${
              isZoomed ? 'scale-150 cursor-zoom-out' : 'cursor-zoom-in'
            }`}
          />
        )}
      </div>

      {/* Bottom hint banner */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="py-2.5 px-4 text-center text-xs text-zinc-500 font-medium"
      >
        Tap background to dismiss • Double tap image to zoom
      </div>
    </div>
  );
};
