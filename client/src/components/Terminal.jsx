import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '../contexts/GameManagerContext';

export default function Terminal() {
  const { terminalOutput, sendCommand } = useGame();
  const [input, setInput] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [terminalOutput]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendCommand(input);
    setInput('');
  };

  return (
    <div className="terminal-container">
      <div className="output-area">
        {terminalOutput.map((line, idx) => (
          <div key={idx} className={`line ${line.type}`}>
            {line.content}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={handleSubmit} className="input-area">
        <span className="prompt">{'>'}</span>
        <input 
          type="text" 
          value={input} 
          onChange={e => setInput(e.target.value)}
          autoFocus
          className="cmd-input"
          placeholder="Type command..."
        />
      </form>
    </div>
  );
}
