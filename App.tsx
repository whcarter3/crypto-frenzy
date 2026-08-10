import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { NotificationProvider } from './lib/NotificationContext';
import { SettingsProvider } from './lib/SettingsContext';
import Home from './pages/Home';
import Game from './pages/Game';
import Privacy from './pages/Privacy';
import Credits from './pages/Credits';

const App = () => (
  <SettingsProvider>
    <NotificationProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/game" element={<Game />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/credits" element={<Credits />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      {__VERCEL__ && <Analytics />}
    </NotificationProvider>
  </SettingsProvider>
);

export default App;
