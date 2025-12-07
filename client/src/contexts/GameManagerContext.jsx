import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { GameManager } from '../squads/GameManager';
import fallbackRooms from '../data/roomsSeed.json';

const GameManagerContext = createContext();

export const useGame = () => useContext(GameManagerContext);

export const GameManagerProvider = ({ children }) => {
  const [terminalOutput, setTerminalOutput] = useState([]);
  const [playerState, setPlayerState] = useState({
    name: '',
    inventory: [],
    currentRoom: '',
    puzzlesSolved: 0
  });
  
  // Ref to hold the mutable logic instance
  const gameManagerRef = useRef(null);

  useEffect(() => {
    // Initialize Logic
    if (!gameManagerRef.current) {
        gameManagerRef.current = new GameManager(setTerminalOutput, setPlayerState);
        
        // Fetch rooms
        const initGame = async () => {
             let rooms = fallbackRooms;
             try {
                const res = await fetch('http://localhost:3000/api/rooms');
                if (res.ok) {
                    rooms = await res.json();
                }
             } catch (e) {
                 console.warn("Using offline fallback rooms");
             }
             
             // Prompt user for name or auto-start?
             // Simple version: Defaults to "Ghost"
             // Or we can simulate a login flow in terminal. 
             // For now, auto-start.
             gameManagerRef.current.startGame("Traveler", rooms);
        };
        initGame();
    }
  }, []);

  const sendCommand = (cmd) => {
      if (gameManagerRef.current) {
          gameManagerRef.current.handleCommand(cmd);
      }
  };

  return (
    <GameManagerContext.Provider value={{ terminalOutput, playerState, sendCommand }}>
      {children}
    </GameManagerContext.Provider>
  );
};
