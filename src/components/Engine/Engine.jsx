import React, { useState, useEffect } from 'react';
import Stockfish from 'stockfish';

const Engine = ({ position }) => {
  const [evaluation, setEvaluation] = useState(null);
  const engine = new Stockfish();

  useEffect(() => {
    engine.postMessage('uci');
  }, []);

  useEffect(() => {
    engine.postMessage(`position fen ${position}`);
    engine.postMessage('go depth 15');

    engine.onmessage = (event) => {
      const message = event.data;
      if (message.startsWith('info depth ')) {
        const match = message.match(/score cp (-?\d+) /);
        const score = match ? parseInt(match[1], 10) / 100.0 : null;
        setEvaluation(score);
      }
    };
  }, [position]);

  return (
    <div>
      Evaluation: {evaluation}
    </div>
  );
};

export default Engine;
