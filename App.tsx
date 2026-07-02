import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { NotificationProvider } from './lib/NotificationContext';
import Home from './pages/Home';
import Game from './pages/Game';

const App = () => (
  <NotificationProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/game" element={<Game />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
    {__VERCEL__ && <Analytics />}
  </NotificationProvider>
);

export default App;
