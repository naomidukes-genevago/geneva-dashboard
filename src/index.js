import React from 'react';
import { createRoot } from 'react-dom/client';
// We import the component from the file named App.jsx
import MoveToGenevaApp from './App.jsx'; 
import './style.css'; 

// Find the container where the app will live (usually defined in index.html)
const container = document.getElementById('root');

// Create the root object
const root = createRoot(container); 

// Render your main application component
root.render(
  <React.StrictMode>
    <MoveToGenevaApp />
  </React.StrictMode>
);
