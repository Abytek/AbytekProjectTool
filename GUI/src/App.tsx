import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Container } from '@mui/material';
import MainPage from './pages/MainPage';
import ProjectPage from './pages/ProjectPage';
import Navigation from './components/Navigation';

function App() {
  return (
    <>
      <Navigation />
      <Container sx={{ mt: 4 }}>
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/project" element={<ProjectPage />} />
        </Routes>
      </Container>
    </>
  );
}

export default App;
