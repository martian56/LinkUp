import { Mic, MicOff, Video, VideoOff, Monitor, PhoneOff, MessageSquare, Users } from 'lucide-react';

interface MeetingControlsProps {
  audioEnabled: boolean;
  videoEnabled: boolean;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
  onScreenShare?: () => void;
  isScreenSharing?: boolean;
  onLeave: () => void;
  onToggleChat: () => void;
  chatOpen: boolean;
  hasUnreadMessages?: boolean;
  onToggleParticipants?: () => void;
  participantsOpen?: boolean;
}

export default function MeetingControls({
  audioEnabled,
  videoEnabled,
  onToggleAudio,
  onToggleVideo,
  onScreenShare,
  isScreenSharing = false,
  onLeave,
  onToggleChat,
  chatOpen,
  hasUnreadMessages = false,
  onToggleParticipants,
  participantsOpen = false,
}: MeetingControlsProps) {
  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3 md:gap-4 p-2 sm:p-3 md:p-4 bg-gray-900/80 backdrop-blur-sm border-t border-gray-700 overflow-x-auto scrollbar-hide">
      {/* Audio Toggle */}
      <button
        onClick={onToggleAudio}
        className={`p-2 sm:p-2.5 md:p-3 rounded-full transition-all flex-shrink-0 ${
          audioEnabled
            ? 'bg-gray-700 hover:bg-gray-600'
            : 'bg-red-600 hover:bg-red-700'
        }`}
        title={audioEnabled ? 'Mute' : 'Unmute'}
      >
        {audioEnabled ? (
          <Mic className="w-5 h-5 sm:w-5 md:w-6 sm:h-5 md:h-6 text-white" />
        ) : (
          <MicOff className="w-5 h-5 sm:w-5 md:w-6 sm:h-5 md:h-6 text-white" />
        )}
      </button>

      {/* Video Toggle */}
      <button
        onClick={onToggleVideo}
        className={`p-2 sm:p-2.5 md:p-3 rounded-full transition-all flex-shrink-0 ${
          videoEnabled
            ? 'bg-gray-700 hover:bg-gray-600'
            : 'bg-red-600 hover:bg-red-700'
        }`}
        title={videoEnabled ? 'Turn off camera' : 'Turn on camera'}
      >
        {videoEnabled ? (
          <Video className="w-5 h-5 sm:w-5 md:w-6 sm:h-5 md:h-6 text-white" />
        ) : (
          <VideoOff className="w-5 h-5 sm:w-5 md:w-6 sm:h-5 md:h-6 text-white" />
        )}
      </button>

      {/* Screen Share */}
      {onScreenShare && (
        <button
          onClick={onScreenShare}
          className={`p-2 sm:p-2.5 md:p-3 rounded-full transition-all flex-shrink-0 ${
            isScreenSharing
              ? 'bg-primary-600 hover:bg-primary-700'
              : 'bg-gray-700 hover:bg-gray-600'
          }`}
          title={isScreenSharing ? 'Stop sharing screen' : 'Share screen'}
        >
          <Monitor className="w-5 h-5 sm:w-5 md:w-6 sm:h-5 md:h-6 text-white" />
        </button>
      )}

      {/* Participants Toggle */}
      {onToggleParticipants && (
        <button
          onClick={onToggleParticipants}
          className={`p-2 sm:p-2.5 md:p-3 rounded-full transition-all flex-shrink-0 ${
            participantsOpen ? 'bg-primary-600 hover:bg-primary-700' : 'bg-gray-700 hover:bg-gray-600'
          }`}
          title="Participants"
        >
          <Users className="w-5 h-5 sm:w-5 md:w-6 sm:h-5 md:h-6 text-white" />
        </button>
      )}

      {/* Chat Toggle */}
      <button
        onClick={onToggleChat}
        className={`relative p-2 sm:p-2.5 md:p-3 rounded-full transition-all flex-shrink-0 ${
          chatOpen ? 'bg-primary-600 hover:bg-primary-700' : 'bg-gray-700 hover:bg-gray-600'
        }`}
        title="Toggle chat"
      >
        <MessageSquare className="w-5 h-5 sm:w-5 md:w-6 sm:h-5 md:h-6 text-white" />
        {hasUnreadMessages && !chatOpen && (
          <span className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-red-500 rounded-full border-2 border-gray-900"></span>
        )}
      </button>

      {/* Leave Meeting */}
      <button
        onClick={onLeave}
        className="p-2 sm:p-2.5 md:p-3 rounded-full bg-red-600 hover:bg-red-700 transition-all flex-shrink-0"
        title="Leave meeting"
      >
        <PhoneOff className="w-5 h-5 sm:w-5 md:w-6 sm:h-5 md:h-6 text-white" />
      </button>
    </div>
  );
}

