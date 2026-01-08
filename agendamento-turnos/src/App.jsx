// src/App.jsx
import React from 'react';
import Calendar from './components/calendar';

function App() {
  return (
    <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', color: '#2c3e50' }}>Agendamentos Ivanilson</h1>
      <Calendar />
    </div>
  );
}

export default App; // ⚠️ ESTA LINHA É OBRIGATÓRIA