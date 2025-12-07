import React from 'react';
import { useGame } from '../contexts/GameManagerContext';

export default function InventoryPanel() {
  const { playerState } = useGame();
  
  // Debug mode check
  const params = new URLSearchParams(window.location.search);
  const isDebug = params.get('debug') === 'true';

  return (
    <div className="inventory-panel">
      <h2>STATUS</h2>
      <div className="stat-row">
        <strong>Name:</strong> {playerState.name}
      </div>
      <div className="stat-row">
        <strong>Room:</strong> {playerState.currentRoom}
      </div>
       <div className="stat-row">
        <strong>Puzzles:</strong> {playerState.puzzlesSolved}
      </div>

      <h3>INVENTORY</h3>
      <ul>
        {playerState.inventory.length === 0 ? (
          <li>Empty</li>
        ) : (
          playerState.inventory.map((item, i) => <li key={i}>{item}</li>)
        )}
      </ul>

      {isDebug && (
        <div className="debug-info">
            <h4>DEBUG</h4>
            <p>Alive: {playerState.isAlive ? 'Yes' : 'No'}</p>
        </div>
      )}
    </div>
  );
}
