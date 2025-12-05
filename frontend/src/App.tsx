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
import MapEditorActualPage from './pages/MapEditorActualPage';
import ProjectFileRepositoryPage from './pages/ProjectFileRepositoryPage';
import ProjectFileRepositoryTutorialPage from './pages/ProjectFileRepositoryTutorialPage';
import ProjectDashboardPage from './pages/ProjectDashboardPage';
import DeploymentResultsPage from './pages/DeploymentResultsPage';
import DeploymentDetailPage from './pages/DeploymentDetailPage';

// Enhanced pages that will wrap existing views
import ROIEditorPage from './pages/ROIEditorPage';
import ParkingValidationPage from './pages/ParkingValidationPage';
import LiveParkingStatusPage from './pages/LiveParkingStatusPage';
import LearningDataManagementPage from './pages/LearningDataManagementPage';

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
              <Route path="map-editor-actual" element={<MapEditorActualPage />} />
              <Route path="roi-editor" element={<ROIEditorPage />} />
              <Route path="learning-data-management" element={<LearningDataManagementPage />} />
              <Route path="parking-validation" element={<ParkingValidationPage />} />
              <Route path="live-status" element={<LiveParkingStatusPage />} />
              <Route path="file-repository" element={<ProjectFileRepositoryTutorialPage />} />
              <Route path="file-repository-actual" element={<ProjectFileRepositoryPage />} />
              <Route path="deployments" element={<DeploymentResultsPage />} />
              <Route path="deployments/:deploymentId" element={<DeploymentDetailPage />} />

              {/* Actual functionality routes */}
              <Route path="roi-editor-actual" element={
                <RoiWorkView
                  projectId={window.location.pathname.split('/')[2]}
                  onBack={() => window.history.back()}
                />
              } />
              <Route path="parking-validation-actual" element={
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
              <Route path="live-status-actual" element={
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
              <Route path="file-repository-actual" element={
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