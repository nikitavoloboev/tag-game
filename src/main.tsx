import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { JazzProvider } from 'jazz-react';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <JazzProvider sync={{ peer: "wss://cloud.jazz.tools/?key=you@example.com" }}>
            <App />
        </JazzProvider>
    </StrictMode>
);