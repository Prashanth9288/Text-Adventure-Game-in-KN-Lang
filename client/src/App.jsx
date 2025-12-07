import React from 'react';
import Terminal from './components/Terminal';
import InventoryPanel from './components/InventoryPanel';
import { GameManagerProvider } from './contexts/GameManagerContext';
import './index.css';

function App() {
  return (
    <GameManagerProvider>
      <div className="app-container">
        <Terminal />
        <InventoryPanel />
      </div>
    </GameManagerProvider>
  );
}

export default App;
