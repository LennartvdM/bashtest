// src/App.jsx – robust SPA with scroll-spy route
import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import SidebarPage from './pages/Sidebar';

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/sidebar" element={<SidebarPage />} />
      </Routes>
    </BrowserRouter>
  );
}
