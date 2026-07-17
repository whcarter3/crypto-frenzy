import {
  CSSProperties,
  useEffect,
  useReducer,
  useState,
} from 'react';
import { reducer } from '../lib/reducer';
import { initialState } from '../lib/state/initialState';
import {
  loadGame,
  saveGame,
  clearSave,
} from '../lib/state/persistence';
import {
  loadHighScore,
  saveHighScore,
} from '../lib/state/highScores';
import { useNotification } from '../lib/NotificationContext';
import { playSound } from '../lib/sound';
import { AlertMessages } from '../helpers/alerts';
import { usePageTitle } from '../helpers/usePageTitle';
import AssetTable from '../components/AssetTable';
import StatusBar from '../components/StatusBar';
import GameSidebar from '../components/GameSidebar';
import Log from '../components/Log';
import GameMode from '../components/GameMode';
import GameOver from '../components/GameOver';
import Settings from '../components/Settings';
import HowToPlay from '../components/HowToPlay';
import TradeModal, { TradeSide } from '../components/TradeModal';
import Divider from '../components/Divider';
import { useSettings } from '../lib/SettingsContext';

export default function Game() {
  usePageTitle('Crypto Frenzy – Game');

  // No prerender means the save can load synchronously on first render:
  // a saved run resumes directly, otherwise the difficulty modal shows.
  // A reload keeps ?seed= in the URL, so "seed present" can't mean
  // "start fresh" — only a seed that *doesn't match the saved run*
  // signals explicit intent to play a different market. Without this
  // distinction, reusing a seed link in a browser with an unrelated
  // save just silently resumes that save and the seed is never read.
  const [state, dispatch] = useReducer(reducer, initialState, (fresh) => {
    const seedParam = new URLSearchParams(window.location.search).get(
      'seed',
    );
    const saved = loadGame();
    if (seedParam === null) return saved ?? fresh;
    const urlSeed = Number(seedParam) >>> 0;
    return saved && saved.seed === urlSeed ? saved : fresh;
  });

  // Autosave mid-run; the save is cleared once the run ends.
  useEffect(() => {
    if (state.gameOver) {
      clearSave();
    } else if (!state.modalOpen) {
      saveGame(state);
    }
  }, [state]);

  // UI-only chrome, not game state: never saved, never seeded.
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  // Market rows open the Buy tab, holdings rows open Sell — the row
  // you tapped says which side of the trade you're thinking about.
  const [trade, setTrade] = useState<{
    assetKey: string;
    side: TradeSide;
  } | null>(null);

  // The engine is pure — localStorage writes happen out here.
  useEffect(() => {
    if (state.gameOver?.newHighScore) {
      saveHighScore(state.mode, state.gameOver.score);
    }
  }, [state.gameOver, state.mode]);

  // Sound is a side effect too: the run-settled jingle keys off
  // gameOver flipping, the moonshot fanfare off the day's fresh log
  // entries (everything above the newest day separator).
  useEffect(() => {
    if (state.gameOver) playSound('gameOver');
  }, [state.gameOver]);

  useEffect(() => {
    if (state.currentDay <= 1) return;
    const todaysEntries: string[] = [];
    for (const entry of state.log) {
      if (entry.startsWith('=========')) break;
      todaysEntries.push(entry);
    }
    if (todaysEntries.some((entry) => entry.includes('MOONSHOT'))) {
      playSound('moonshot');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.currentDay]);

  // Desktop panel sizes (E4): device preferences, so they live in
  // settings, not in the seeded, replayable game state.
  const { settings, update } = useSettings();

  // Abandon lives in the settings menu now (meta, not gameplay) —
  // the confirm handshake happens there; this is the commit.
  const abandonRun = () => {
    clearSave();
    dispatch({
      type: 'INIT',
      payload: { highScore: loadHighScore(state.mode) },
    });
    setSettingsOpen(false);
  };

  // Warn when one in-game day remains.
  const { showNotification } = useNotification();
  useEffect(() => {
    if (!state.gameOver && state.currentDay === state.days - 1) {
      showNotification(AlertMessages.LAST_DAY, 'warning');
      playSound('warning');
    }
  }, [state.currentDay, state.days, state.gameOver, showNotification]);

  return (
    <div className=" text-crt-green bg-crt-bg crt-scanlines flex min-h-screen">
      {/* min-w-0 on main and both columns: flex items default to
          min-width:auto, which floors them at their content's intrinsic
          width — the wide trade/holdings tables and unwrapped log lines
          were propagating ~600px minimums all the way up and forcing
          horizontal page scroll on phones. min-w-0 lets the overflow-x
          wrappers inside actually do their job. */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Visually hidden: the modals carry their own visible h1 when
            open, but the bare game screen had no heading at all for
            screen-reader users to navigate by. Inside <main> so it's
            contained by a landmark region. */}
        <h1 className="sr-only">Crypto Frenzy – Game</h1>

        {/* Vitals + End Day, sticky above both columns on every viewport */}
        <StatusBar dispatch={dispatch} state={state} />

        <div className="flex-1 flex flex-col lg:flex-row min-w-0">
          {/* B3: on phones the market comes first and the portfolio
              second (order-2) — previously a full screen of stats stood
              between the player and the game. Desktop keeps the
              sidebar on the left, at a width the player can drag. */}
          <div
            className="w-full lg:w-[var(--sidebar-w,25%)] lg:shrink-0 min-w-0 order-2 lg:order-none border-t lg:border-t-0 border-white/10 bg-crt-panel/50 px-4 py-6 flex flex-col"
            style={
              settings.sidebarWidth != null
                ? ({
                    '--sidebar-w': `${settings.sidebarWidth}px`,
                  } as CSSProperties)
                : undefined
            }
          >
            <GameSidebar
              state={state}
              dispatch={dispatch}
              onOpenSettings={() => setSettingsOpen(true)}
              onSelectAsset={(assetKey) =>
                setTrade({ assetKey, side: 'sell' })
              }
            />
          </div>

          <div className="hidden lg:block lg:order-none">
            <Divider
              orientation="vertical"
              label="Resize sidebar"
              dataCy="sidebarDivider"
              value={settings.sidebarWidth ?? 320}
              min={240}
              max={480}
              onChange={(sidebarWidth) => update({ sidebarWidth })}
            />
          </div>

          {/* No mx-auto: auto margins disable flex-item stretch, which at
              mobile widths sized this column to its content's intrinsic
              width (the unwrapped log/table, ~600px) instead of the
              viewport — the root cause of horizontal overflow on phones.
              flex-1 already fills the row on desktop. */}
          <div
            className="flex flex-1 flex-col min-w-0 order-1 lg:order-none px-4 py-6 gap-6"
            style={
              settings.logHeight != null
                ? ({
                    '--log-h': `${settings.logHeight}px`,
                  } as CSSProperties)
                : undefined
            }
          >
            {/* Market first on phones (order-1); desktop reads log
                over market with a draggable boundary between them */}
            <div className="w-full order-1 lg:order-3">
              <AssetTable
                state={state}
                onSelectAsset={(assetKey) =>
                  setTrade({ assetKey, side: 'buy' })
                }
              />
            </div>
            <div className="hidden lg:block lg:order-2">
              <Divider
                orientation="horizontal"
                label="Resize activity log"
                dataCy="logDivider"
                value={settings.logHeight ?? 320}
                min={120}
                max={640}
                onChange={(logHeight) => update({ logHeight })}
              />
            </div>
            <div className="w-full order-2 lg:order-1 space-y-3">
              <Log log={state.log} />
            </div>
          </div>
        </div>
      </main>

      {state.modalOpen && !state.gameOver && (
        <GameMode state={state} dispatch={dispatch} />
      )}
      {state.gameOver && (
        <GameOver state={state} dispatch={dispatch} />
      )}
      {settingsOpen && (
        <Settings
          onClose={() => setSettingsOpen(false)}
          onOpenHelp={() => setHelpOpen(true)}
          onAbandonRun={abandonRun}
        />
      )}
      {helpOpen && <HowToPlay onClose={() => setHelpOpen(false)} />}
      {trade && !state.gameOver && !state.modalOpen && (
        <TradeModal
          assetKey={trade.assetKey}
          initialSide={trade.side}
          state={state}
          dispatch={dispatch}
          onClose={() => setTrade(null)}
        />
      )}
    </div>
  );
}
