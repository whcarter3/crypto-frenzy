import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';
import {
  Settings,
  loadSettings,
  saveSettings,
} from './state/settings';
import { setSoundEnabled } from './sound';
import { setMusicEnabled } from './music';

interface SettingsContextType {
  settings: Settings;
  update: (patch: Partial<Settings>) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined,
);

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error(
      'useSettings must be used within a SettingsProvider',
    );
  }
  return context;
};

export const SettingsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [settings, setSettings] = useState<Settings>(loadSettings);

  // Settings take effect here so every consumer stays dumb: the sound
  // module reads a flag, the CRT override is pure CSS keyed off a data
  // attribute on <html>.
  useEffect(() => {
    saveSettings(settings);
    setSoundEnabled(settings.sound);
    setMusicEnabled(settings.music);
    document.documentElement.dataset.crt = settings.crt ? 'on' : 'off';
  }, [settings]);

  const update = (patch: Partial<Settings>) =>
    setSettings((prev) => ({ ...prev, ...patch }));

  return (
    <SettingsContext.Provider value={{ settings, update }}>
      {children}
    </SettingsContext.Provider>
  );
};
