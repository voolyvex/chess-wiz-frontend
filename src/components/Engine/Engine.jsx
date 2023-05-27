import React, { useState, useEffect, useRef } from 'react';
import Stockfish from '../../lib/stockfish.js';



const Engine = ({ position }) => {
  const [evaluation, setEvaluation] = useState(null);
  const stockfishRef = useRef(null);

  useEffect(() => {
    // Create an instance of the Stockfish engine
    const stockfish = new Stockfish();
    stockfishRef.current = stockfish;

    // Add a message listener to receive messages from the engine
    const handleMessage = (message) => {
      console.log(message);

      // Send a position and search command to the engine when it's ready
      if (message === 'ready') {
        stockfish.postMessage(`position fen ${position}`);
        stockfish.postMessage('go depth 15');
      }

      // Parse the evaluation score and update the state
      if (message.startsWith('info depth ')) {
        const match = message.match(/score cp (-?\d+) /);
        const score = match ? parseInt(match[1], 10) / 100.0 : null;
        setEvaluation(score);
      }
    };
    stockfish.addEventListener('message', handleMessage);

    // Start the engine by sending the "uci" command
    stockfish.postMessage('uci');

    // Cleanup function to terminate the engine
    return () => {
      stockfish.removeEventListener('message', handleMessage);
      stockfish.postMessage('quit');
      stockfish.terminate();
    };
  }, [position]);

  return (
    <div>
      Evaluation: {evaluation}
    </div>
  );
};

export default Engine;
