import React, { useState } from 'react';
import LayoutView from './views/LayoutView';
import ProjectSelectionView from './views/ProjectSelectionView';
import DashboardView from './views/DashboardView';
import ParkingTestView from './views/ParkingTestView';
import LearningResultsPage from './views/LearningResultsPage';
import { Project } from './models/Project';
import { CctvInfo } from './models/Learning';

type Page = 'project-selection' | 'dashboard' | 'parking-test' | 'learning-results' | 'roi-work' | 'live-parking' | 'learning-data';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('project-selection');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [learningResultsData, setLearningResultsData] = useState<{
    projectId: string;
    folderPath: string;
    cctvList: CctvInfo[];
    timestamp: string;
  } | null>(null);



  const handleProjectSelect = (project: Project) => {
    setSelectedProject(project);
    setCurrentPage('dashboard');
  };

  const handleBackToProjectSelection = () => {
    setSelectedProject(null);
    setCurrentPage('project-selection');
  };

  const handleNavigate = (page: string) => {
    setCurrentPage(page as Page);
  };

  const handleBackToDashboard = () => {
    setCurrentPage('dashboard');
  };

  const handleShowLearningResults = (projectId: string, folderPath: string, cctvList: CctvInfo[], timestamp: string) => {
    console.log('handleShowLearningResults 호출됨:', { projectId, folderPath, cctvList, timestamp });
    setLearningResultsData({ projectId, folderPath, cctvList, timestamp });
    setCurrentPage('learning-results');
    console.log('페이지를 learning-results로 변경함');
  };

  const handleBackToParkingTest = () => {
    setCurrentPage('parking-test');
  };



  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'project-selection':
        return <ProjectSelectionView onProjectSelect={handleProjectSelect} />;
      
      case 'dashboard':
        return selectedProject ? (
          <DashboardView
            project={selectedProject}
            onBack={handleBackToProjectSelection}
            onNavigate={handleNavigate}
          />
        ) : null;
      
      case 'parking-test':
        return selectedProject ? (
          <ParkingTestView
            project={selectedProject}
            onBack={handleBackToDashboard}
            onShowLearningResults={handleShowLearningResults}
          />
        ) : null;
      
      case 'learning-results':
        return learningResultsData ? (
          <LearningResultsPage
            projectId={learningResultsData.projectId}
            folderPath={learningResultsData.folderPath}
            cctvList={learningResultsData.cctvList}
            timestamp={learningResultsData.timestamp}
            onBack={handleBackToParkingTest}
          />
        ) : null;
      

      
      case 'roi-work':
        return (
          <div>
            <h2>ROI 작업 페이지</h2>
            <p>ROI 작업 기능이 개발 중입니다.</p>
            <button onClick={handleBackToDashboard}>대시보드로 돌아가기</button>
          </div>
        );
      
      case 'live-parking':
        return (
          <div>
            <h2>실시간 주차면 페이지</h2>
            <p>실시간 주차면 기능이 개발 중입니다.</p>
            <button onClick={handleBackToDashboard}>대시보드로 돌아가기</button>
          </div>
        );
      
      case 'learning-data':
        return (
          <div>
            <h2>학습 데이터 등록 페이지</h2>
            <p>학습 데이터 등록 기능이 개발 중입니다1..</p>
            <button onClick={handleBackToDashboard}>대시보드로 돌아가기</button>
          </div>
        );
      
      default:
        return <ProjectSelectionView onProjectSelect={handleProjectSelect} />;
    }
  };

  return (
    <LayoutView>
      {renderCurrentPage()}
    </LayoutView>
  );
}

export default App;
