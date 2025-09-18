
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// Selecting the root DOM element where the React app will be mounted
const container = document.getElementById('root');

// Creating a root object using React 18's createRoot API
const root = createRoot(container);

// Rendering the App component into the root using React 18's createRoot API
root.render(<App />);