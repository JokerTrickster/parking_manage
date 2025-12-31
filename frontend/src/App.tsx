import React, { useState, useMemo, createContext } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { getTheme } from './styles/theme';
import LayoutView from './views/LayoutView';
import ProjectSelectionView from './views/ProjectSelectionView';
import { RoiWorkView } from './views/RoiWorkView';
import { ParkingTestView } from './views/ParkingTestView';
import RealtimeParkingView from './views/RealtimeParkingView';
import LearningDataView from './views/LearningDataView';
import MapEditorActualPage from './pages/MapEditorActualPage';
import ProjectFileRepositoryPage from './pages/ProjectFileRepositoryPage';
import ProjectDashboardPage from './pages/ProjectDashboardPage';
import DeploymentResultsPage from './pages/DeploymentResultsPage';
import DeploymentDetailPage from './pages/DeploymentDetailPage';

export const ThemeContext = createContext({
  mode: 'dark' as 'dark' | 'light',
  toggleTheme: () => {},
});

function App() {
  const [mode, setMode] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('themeMode');
    return (saved === 'light' || saved === 'dark') ? saved : 'dark';
  });

  const theme = useMemo(() => getTheme(mode), [mode]);

  const toggleTheme = () => {
    setMode((prevMode) => {
      const newMode = prevMode === 'dark' ? 'light' : 'dark';
      localStorage.setItem('themeMode', newMode);
      return newMode;
    });
  };

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
        <Routes>
          {/* Project Selection - No Layout */}
          <Route path="/" element={<ProjectSelectionView />} />
          <Route path="/projects" element={<ProjectSelectionView />} />

          {/* Project Dashboard - No Layout */}
          <Route path="/project/:projectId" element={<ProjectDashboardPage />} />

          {/* ROI Editor - No Layout */}
          <Route path="/project/:projectId/roi-editor" element={
            <RoiWorkView
              projectId={window.location.pathname.split('/')[2]}
              onBack={() => window.history.back()}
            />
          } />

          {/* Project-based routes with Layout */}
          <Route path="/project/:projectId/*" element={
            <LayoutView>
              <Routes>
                {/* Project Management Pages */}
                <Route path="map-editor" element={<MapEditorActualPage />} />
                <Route path="learning-data-management" element={
                  <LearningDataView
                    project={{
                      id: window.location.pathname.split('/')[2],
                      name: 'Current Project',
                      description: 'Current working project',
                      location: 'Seoul'
                    }}
                    onBack={() => window.history.back()}
                  />
                } />
                <Route path="parking-validation" element={
                  <ParkingTestView
                    project={{
                      id: window.location.pathname.split('/')[2],
                      name: 'Current Project',
                      description: 'Current working project',
                      location: 'Seoul'
                    }}
                    onBack={() => window.history.back()}
                  />
                } />
                <Route path="live-status" element={
                  <RealtimeParkingView
                    project={{
                      id: window.location.pathname.split('/')[2],
                      name: 'Current Project',
                      description: 'Current working project',
                      location: 'Seoul'
                    }}
                    onBack={() => window.history.back()}
                  />
                } />
                <Route path="file-repository" element={<ProjectFileRepositoryPage />} />
                <Route path="deployments" element={<DeploymentResultsPage />} />
                <Route path="deployments/:deploymentId" element={<DeploymentDetailPage />} />
              </Routes>
            </LayoutView>
          } />
        </Routes>
      </Router>
    </ThemeProvider>
    </ThemeContext.Provider>
  );
}

export default App;