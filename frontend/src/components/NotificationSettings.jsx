import { Volume2, VolumeX, Play } from "lucide-react";
import { useState, useEffect } from "react";

const NotificationSettings = () => {
  const [soundEnabled, setSoundEnabledState] = useState(true);
  const [selectedSound, setSelectedSoundState] = useState('default');
  const [volume, setVolumeState] = useState(0.5);

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const savedSoundEnabled = localStorage.getItem('chat-sound-enabled');
      const savedSelectedSound = localStorage.getItem('chat-selected-sound');
      const savedVolume = localStorage.getItem('chat-volume');

      if (savedSoundEnabled !== null) {
        setSoundEnabledState(JSON.parse(savedSoundEnabled));
      }
      if (savedSelectedSound) {
        setSelectedSoundState(savedSelectedSound);
      }
      if (savedVolume) {
        setVolumeState(parseFloat(savedVolume));
      }
    } catch (error) {
      console.error('Failed to load notification settings:', error);
    }
  }, []);

  const setSoundEnabled = (enabled) => {
    setSoundEnabledState(enabled);
    localStorage.setItem('chat-sound-enabled', JSON.stringify(enabled));
  };

  const setSelectedSound = (sound) => {
    setSelectedSoundState(sound);
    localStorage.setItem('chat-selected-sound', sound);
  };

  const setVolume = (vol) => {
    setVolumeState(vol);
    localStorage.setItem('chat-volume', vol.toString());
  };

  const testSound = (soundName) => {
    try {
      if (soundName === 'none') return;

      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      const frequencies = {
        default: 800,
        pop: 1000,
        chime: 600,
        ding: 1200
      };
      
      oscillator.frequency.value = frequencies[soundName] || 800;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(volume * 0.1, audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.2);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
    } catch (error) {
      console.warn('Could not play test sound:', error);
    }
  };

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
        <div className="space-y-3" style={{animation: 'fadeIn 0.3s ease-in-out'}}>
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
                    <div className="w-2 h-2 bg-primary rounded-full" style={{animation: 'pulse 2s infinite'}} />
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
        <div className="space-y-3" style={{animation: 'fadeIn 0.3s ease-in-out'}}>
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

      {/* Test Notification Button */}
      <div className="flex justify-center">
        <button
          onClick={() => {
            testSound(selectedSound);
            if (Notification.permission === 'granted') {
              new Notification('Test Notification', {
                body: 'This is how your notifications will look!',
                icon: '/avatar.png'
              });
            }
          }}
          className="btn btn-outline btn-primary"
          disabled={!soundEnabled && Notification.permission !== 'granted'}
        >
          Test Notification
        </button>
      </div>
    </div>
  );
};

export default NotificationSettings;