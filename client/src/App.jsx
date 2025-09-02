import React, { useState } from 'react';
import Whiteboard from './Whiteboard';
import './App.css';

function App() {
  const [room, setRoom] = useState('');
  const [hasJoined, setHasJoined] = useState(false);

  const handleJoin = () => {
    if (room.trim() !== '') {
      setHasJoined(true);
    }
  };

  return (
    <div className="App">
      <main className="app-content">
        {!hasJoined ? (
          <div className="join-form">
            <h1>SyncBoard</h1>
            <input
              type="text"
              placeholder="Enter Room Name"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
            />
            <button onClick={handleJoin}>Join</button>
          </div>
        ) : (
          <Whiteboard room={room} />
        )}
      </main>

      <footer className="app-footer">
        <p>Made with ❤️ by Priyesh</p>
        <p>
          Have feedback or suggestions? <a href="mailto:priyampriyesh37@gmail.com">Send an Email</a>
        </p>
      </footer>
    </div>
  );
}

export default App;