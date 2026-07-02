import { useEffect, useReducer } from 'react';
import { reducer } from '../lib/reducer';
import { initialState } from '../lib/state/initialState';
import {
  loadGame,
  saveGame,
  clearSave,
} from '../lib/state/persistence';
import { usePageTitle } from '../helpers/usePageTitle';
import AssetTable from '../components/AssetTable';
import Actions from '../components/Actions';
import GameSidebar from '../components/GameSidebar';
import Log from '../components/Log';
import GameMode from '../components/GameMode';
import GameOver from '../components/GameOver';

export default function Game() {
  usePageTitle('Crypto Frenzy – Game');

  // No prerender means the save can load synchronously on first render:
  // a saved run resumes directly, otherwise the difficulty modal shows.
  const [state, dispatch] = useReducer(
    reducer,
    initialState,
    (fresh) => loadGame() ?? fresh,
  );

  // Autosave mid-run; the save is cleared once the run ends.
  useEffect(() => {
    if (state.gameOver) {
      clearSave();
    } else if (!state.modalOpen) {
      saveGame(state);
    }
  }, [state]);

  return (
    <div className=" text-crt-green bg-crt-bg crt-scanlines flex min-h-screen">
      <main className="flex-1 flex">
        <div className="w-1/4 shrink-0 border-r border-white/10 bg-crt-panel/50 px-4 py-6">
          <GameSidebar state={state} dispatch={dispatch} />
        </div>

        <div className="flex flex-1 flex-col justify-between mx-auto px-4 py-6 gap-6">
          <div className="w-1/2 space-y-6">
            <Log log={state.log} />
            <AssetTable state={state} dispatch={dispatch} />
          </div>
          <Actions dispatch={dispatch} state={state} />
        </div>
      </main>

      {state.modalOpen && !state.gameOver && (
        <GameMode state={state} dispatch={dispatch} />
      )}
      {state.gameOver && (
        <GameOver state={state} dispatch={dispatch} />
      )}
    </div>
  );
}
