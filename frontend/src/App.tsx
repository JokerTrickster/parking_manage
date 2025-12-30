import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LayoutView from './views/LayoutView';
import ProjectSelectionView from './views/ProjectSelectionView';

// Import existing views
import { RoiWorkView } from './views/RoiWorkView';
import { ParkingTestView } from './views/ParkingTestView';
import RealtimeParkingView from './views/RealtimeParkingView';
import LearningDataView from './views/LearningDataView';
import RoiEditorView from './views/RoiEditorView';

// Import new placeholder pages
import MapEditorActualPage from './pages/MapEditorActualPage';
import ProjectFileRepositoryPage from './pages/ProjectFileRepositoryPage';
import ProjectDashboardPage from './pages/ProjectDashboardPage';
import DeploymentResultsPage from './pages/DeploymentResultsPage';
import DeploymentDetailPage from './pages/DeploymentDetailPage';

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
              <Route path="map-editor" element={<MapEditorActualPage />} />
              <Route path="roi-editor" element={
                <RoiWorkView
                  projectId={window.location.pathname.split('/')[2]}
                  onBack={() => window.history.back()}
                />
              } />
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
  );
}

export default App;