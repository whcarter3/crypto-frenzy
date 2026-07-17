import { useRef, useState } from 'react';
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

/**
 * The meta menu (owner call, 2026-07-17): everything that isn't the
 * core gameplay loop lives here behind the sidebar's gear icon —
 * preferences, How to play, high-score reset, and abandoning the run.
 */
const Settings = ({
  onClose,
  onOpenHelp,
  onAbandonRun,
}: {
  onClose: () => void;
  onOpenHelp: () => void;
  onAbandonRun: () => void;
}) => {
  const { settings, update } = useSettings();
  const { showNotification } = useNotification();

  // Abandoning wipes the run — require a second tap within 3s
  const [confirmingReset, setConfirmingReset] = useState(false);
  const confirmTimer = useRef<ReturnType<typeof setTimeout>>();

  const handleAbandon = () => {
    if (!confirmingReset) {
      setConfirmingReset(true);
      clearTimeout(confirmTimer.current);
      confirmTimer.current = setTimeout(
        () => setConfirmingReset(false),
        3000,
      );
      return;
    }
    clearTimeout(confirmTimer.current);
    setConfirmingReset(false);
    onAbandonRun();
  };

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
            label="CRT effects"
            checked={settings.crt}
            onChange={(crt) => update({ crt })}
          />
        </div>

        <div className="border-t border-white/10 pt-4 space-y-3">
          {/* Reset is not a headline CTA — quiet red, no glow — and sits
              above How to play (owner call, 2026-07-17) */}
          <button
            type="button"
            id="resetScores"
            onClick={handleResetScores}
            className="btn w-full py-2 text-sm text-crt-red border-crt-red/40"
          >
            Reset high scores
          </button>
          <button
            type="button"
            id="openHowToPlay"
            onClick={() => {
              onClose();
              onOpenHelp();
            }}
            className="btn w-full py-2 text-sm"
          >
            How to play
          </button>
          <button
            type="button"
            id="runInfo"
            onClick={handleAbandon}
            className={cn(
              'btn w-full py-2 text-sm',
              confirmingReset
                ? 'btn-danger font-semibold'
                : 'text-white/60 border-white/20 hover:text-crt-red hover:border-crt-red/60',
            )}
            title="Abandon this run and start over"
          >
            {confirmingReset
              ? '⚠ TAP AGAIN TO ABANDON THIS RUN'
              : 'ABANDON RUN / NEW GAME'}
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
