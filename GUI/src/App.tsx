import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Container, CssBaseline } from '@mui/material';
import MainPage from './pages/MainPage';
import ProjectPage from './pages/ProjectPage';
import Navigation from './components/Navigation';
import { ThemeProviderWrapper } from './theme/ThemeContext';

function App() {
  return (
    <ThemeProviderWrapper>
      <CssBaseline />
      <Navigation />
      <Container sx={{ mt: 4 }}>
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/project" element={<ProjectPage />} />
          <Route path="/project/:encodedPath" element={<ProjectPage />} />
        </Routes>
      </Container>
    </ThemeProviderWrapper>
  );
}

export default App;
