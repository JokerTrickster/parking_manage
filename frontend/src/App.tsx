import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LayoutView from './views/LayoutView';
import ProjectSelectionView from './views/ProjectSelectionView';

// Import existing views
import { RoiWorkView } from './views/RoiWorkView';
import { ParkingTestView } from './views/ParkingTestView';
import RealtimeParkingView from './views/RealtimeParkingView';
import LearningDataView from './views/LearningDataView';

// Import new placeholder pages
import MapEditorPage from './pages/MapEditorPage';
import MapPropertiesPage from './pages/MapPropertiesPage';
import ProjectFileRepositoryPage from './pages/ProjectFileRepositoryPage';
import ProjectDashboardPage from './pages/ProjectDashboardPage';

// Enhanced pages that will wrap existing views
import ROIEditorPage from './pages/ROIEditorPage';
import ParkingValidationPage from './pages/ParkingValidationPage';
import LiveParkingStatusPage from './pages/LiveParkingStatusPage';

function App() {
  return (
    <Router>
      <Routes>
        {/* Project Selection - No Layout */}
        <Route path="/" element={<ProjectSelectionView />} />
        <Route path="/projects" element={<ProjectSelectionView />} />

        {/* Project Dashboard - No Layout */}
        <Route path="/project/:projectId" element={<ProjectDashboardPage />} />

        {/* Project-based routes with Layout */}
        <Route path="/project/:projectId/*" element={
          <LayoutView>
            <Routes>
              {/* Project Management Pages */}
              <Route path="map-editor" element={<MapEditorPage />} />
              <Route path="map-properties" element={<MapPropertiesPage />} />
              <Route path="roi-editor" element={<ROIEditorPage />} />
              <Route path="parking-validation" element={<ParkingValidationPage />} />
              <Route path="live-status" element={<LiveParkingStatusPage />} />
              <Route path="file-repository" element={<ProjectFileRepositoryPage />} />

              {/* Legacy routes for backward compatibility */}
              <Route path="roi-work" element={<ROIEditorPage />} />
              <Route path="parking-test" element={<ParkingValidationPage />} />
              <Route path="live-parking" element={<LiveParkingStatusPage />} />
              <Route path="learning-data" element={<ProjectFileRepositoryPage />} />
            </Routes>
          </LayoutView>
        } />
      </Routes>
    </Router>
  );
}

export default App;