import { useSettings } from '../lib/SettingsContext';
import { clearHighScores } from '../lib/state/highScores';
import { useNotification } from '../lib/NotificationContext';
import { cn } from '../lib/cn';

const Toggle = ({
  id,
  label,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}) => (
  <div className="flex items-center justify-between gap-4">
    <span className="text-slate-300">{label}</span>
    <button
      type="button"
      id={id}
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        'btn w-28',
        checked && 'btn-primary',
        !checked && 'bg-black text-slate-400 border-slate-600',
      )}
    >
      {checked ? 'On' : 'Off'}
    </button>
  </div>
);

const Settings = ({ onClose }: { onClose: () => void }) => {
  const { settings, update } = useSettings();
  const { showNotification } = useNotification();

  const handleResetScores = () => {
    clearHighScores();
    showNotification(
      'High scores cleared — takes effect from your next run',
      'info',
    );
  };

  return (
    <div
      className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-10 flex items-center justify-center p-4 md:p-8"
      data-cy="settingsScreen"
      onKeyDown={(e) => {
        if (e.key === 'Escape') onClose();
      }}
    >
      <div
        className="bg-black w-full max-w-md rounded-sm border border-crt-yellow box-shadow-crt p-6 md:p-8 space-y-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settingsTitle"
        tabIndex={0}
      >
        <h1
          id="settingsTitle"
          className="text-2xl font-bold text-slate-300 text-glow-crt"
        >
          Settings
        </h1>

        <div className="space-y-4">
          <Toggle
            id="soundToggle"
            label="Sound effects"
            checked={settings.sound}
            onChange={(sound) => update({ sound })}
          />
          <Toggle
            id="musicToggle"
            label="Background music"
            checked={settings.music}
            onChange={(music) => update({ music })}
          />
          <Toggle
            id="crtToggle"
            label="CRT effects (scanlines, glow)"
            checked={settings.crt}
            onChange={(crt) => update({ crt })}
          />
        </div>

        <div className="border-t border-white/10 pt-4">
          <button
            type="button"
            id="resetScores"
            onClick={handleResetScores}
            className="btn btn-danger w-full py-2 text-sm"
          >
            Reset high scores
          </button>
        </div>

        <button
          className="btn btn-primary w-full py-3"
          onClick={onClose}
          id="settingsClose"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default Settings;
