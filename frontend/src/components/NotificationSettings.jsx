import { Volume2, VolumeX, Play } from "lucide-react";
import { useNotificationStore } from "../store/useNotificationStore";

const NotificationSettings = () => {
  const {
    soundEnabled,
    selectedSound,
    volume,
    setSoundEnabled,
    setSelectedSound,
    setVolume,
    testSound
  } = useNotificationStore();

  const soundOptions = [
    { value: 'default', label: 'Default' },
    { value: 'pop', label: 'Pop' },
    { value: 'chime', label: 'Chime' },
    { value: 'ding', label: 'Ding' },
    { value: 'none', label: 'Silent' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h3 className="text-lg font-semibold">Notifications</h3>
        <p className="text-sm text-base-content/70">Customize your notification preferences</p>
      </div>

      {/* Sound Enable/Disable */}
      <div className="flex items-center justify-between p-4 bg-base-200 rounded-lg">
        <div className="flex items-center gap-3">
          {soundEnabled ? (
            <Volume2 className="w-5 h-5 text-primary" />
          ) : (
            <VolumeX className="w-5 h-5 text-base-content/50" />
          )}
          <div>
            <p className="font-medium">Sound Notifications</p>
            <p className="text-sm text-base-content/60">
              Play sounds when you receive messages
            </p>
          </div>
        </div>
        <input
          type="checkbox"
          className="toggle toggle-primary"
          checked={soundEnabled}
          onChange={(e) => setSoundEnabled(e.target.checked)}
        />
      </div>

      {/* Sound Selection */}
      {soundEnabled && (
        <div className="space-y-3 animate-fadeIn">
          <label className="text-sm font-medium">Notification Sound</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {soundOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setSelectedSound(option.value)}
                className={`
                  flex items-center justify-between p-3 rounded-lg border transition-all
                  ${selectedSound === option.value
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-base-300 hover:border-base-400 hover:bg-base-200'
                  }
                `}
              >
                <span className="font-medium">{option.label}</span>
                <div className="flex items-center gap-2">
                  {selectedSound === option.value && (
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      testSound(option.value);
                    }}
                    className="p-1 hover:bg-current/10 rounded transition-colors"
                    disabled={option.value === 'none'}
                  >
                    <Play className="w-3 h-3" />
                  </button>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Volume Control */}
      {soundEnabled && selectedSound !== 'none' && (
        <div className="space-y-3 animate-fadeIn">
          <label className="text-sm font-medium">Volume</label>
          <div className="flex items-center gap-3">
            <VolumeX className="w-4 h-4 text-base-content/50" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="range range-primary flex-1"
            />
            <Volume2 className="w-4 h-4 text-base-content/50" />
            <span className="text-sm font-mono min-w-[3ch]">
              {Math.round(volume * 100)}%
            </span>
          </div>
        </div>
      )}

      {/* Browser Notifications */}
      <div className="p-4 bg-base-200 rounded-lg">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="font-medium">Browser Notifications</p>
            <p className="text-sm text-base-content/60">
              Show desktop notifications when the app is not focused
            </p>
          </div>
          <button
            onClick={() => {
              if (Notification.permission === 'default') {
                Notification.requestPermission();
              }
            }}
            className={`btn btn-sm ${
              Notification.permission === 'granted' 
                ? 'btn-success' 
                : Notification.permission === 'denied'
                ? 'btn-error'
                : 'btn-primary'
            }`}
          >
            {Notification.permission === 'granted' 
              ? 'Enabled' 
              : Notification.permission === 'denied'
              ? 'Blocked'
              : 'Enable'
            }
          </button>
        </div>
        {Notification.permission === 'denied' && (
          <div className="text-sm text-error">
            Notifications are blocked. Enable them in your browser settings.
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationSettings;