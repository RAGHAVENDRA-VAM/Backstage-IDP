import React from 'react';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>${{ values.name }}</h1>
        <p>
          ${{ values.description }}
        </p>
      </header>
    </div>
  );
}

export default App;
