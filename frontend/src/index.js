
import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { createRoot } from 'react-dom/client';

// Selecting the root DOM element where the React app will be mounted
const container = document.getElementById('root');

// Creating a root object using React 18's createRoot API
const root = createRoot(container);

// Rendering the App component into the root using React 18's createRoot API
root.render(<App />);

// Attempting to render the App component wrapped in BrowserRouter using ReactDOM.render (React 17 and earlier API)
ReactDOM.render(
    <BrowserRouter>
        <App />
    </BrowserRouter>,
    document.getElementById('root')
);