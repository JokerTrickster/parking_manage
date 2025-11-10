import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
  Breadcrumbs,
  Link,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Home as HomeIcon,
  Business as BusinessIcon,
  Visibility as ViewIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  HourglassEmpty as InProgressIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import DeploymentService from '../services/DeploymentService';
import { DeploymentResult } from '../models/Deployment';

const DeploymentResultsPage: React.FC = () => {
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>();
  const [deployments, setDeployments] = useState<DeploymentResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const selectedProject = localStorage.getItem('selectedProject');
  const projectData = selectedProject ? JSON.parse(selectedProject) : null;

  useEffect(() => {
    const fetchDeployments = async () => {
      if (!projectId) return;

      try {
        setLoading(true);
        const response = await DeploymentService.getDeployments(projectId);
        if (response.success) {
          setDeployments(response.data);
        } else {
          setError(response.message);
        }
      } catch (err) {
        setError('배포 결과를 불러오는 중 오류가 발생했습니다.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDeployments();
  }, [projectId]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <SuccessIcon sx={{ color: 'success.main' }} />;
      case 'failed':
        return <ErrorIcon sx={{ color: 'error.main' }} />;
      case 'in_progress':
        return <InProgressIcon sx={{ color: 'warning.main' }} />;
      default:
        return null;
    }
  };

  const getStatusChip = (status: string) => {
    const statusMap = {
      success: { label: '성공', color: 'success' as const },
      failed: { label: '실패', color: 'error' as const },
      in_progress: { label: '진행중', color: 'warning' as const },
    };
    const statusInfo = statusMap[status as keyof typeof statusMap] || { label: status, color: 'default' as const };
    return <Chip label={statusInfo.label} color={statusInfo.color} size="small" />;
  };

  const getEnvironmentChip = (environment: string) => {
    const envMap = {
      production: { label: '운영', color: 'error' as const },
      staging: { label: '스테이징', color: 'warning' as const },
      development: { label: '개발', color: 'info' as const },
    };
    const envInfo = envMap[environment as keyof typeof envMap] || { label: environment, color: 'default' as const };
    return <Chip label={envInfo.label} color={envInfo.color} size="small" variant="outlined" />;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleViewDetail = (deploymentId: number) => {
    navigate(`/project/${projectId}/deployments/${deploymentId}`);
  };

  if (loading) {
    return (
      <Container maxWidth="xl">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <CircularProgress />
          <Typography variant="h6" sx={{ ml: 2 }}>
            배포 결과를 불러오는 중...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl">
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      {/* Breadcrumb Navigation */}
      <Box sx={{ mb: 3 }}>
        <Breadcrumbs aria-label="breadcrumb">
          <Link
            color="inherit"
            onClick={() => navigate('/')}
            sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
          >
            <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
            프로젝트 선택
          </Link>
          <Link
            color="inherit"
            onClick={() => navigate(`/project/${projectId}`)}
            sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
          >
            <BusinessIcon sx={{ mr: 0.5 }} fontSize="inherit" />
            {projectData?.name || `프로젝트 ${projectId}`}
          </Link>
          <Typography color="text.primary">배포 결과</Typography>
        </Breadcrumbs>
      </Box>

      {/* Page Header */}
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 1 }}>
          🚀 배포 결과
        </Typography>
        <Typography variant="body1" color="text.secondary">
          프로젝트의 배포 이력을 확인하고 관리합니다
        </Typography>
      </Paper>

      {/* Deployments Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'grey.100' }}>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>상태</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>버전</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>환경</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>배포자</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>브랜치</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>배포일시</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>작업</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {deployments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    배포 결과가 없습니다.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              deployments.map((deployment) => (
                <TableRow
                  key={deployment.id}
                  hover
                  sx={{
                    '&:hover': {
                      bgcolor: 'action.hover',
                      cursor: 'pointer',
                    },
                  }}
                  onClick={() => handleViewDetail(deployment.id)}
                >
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                      {getStatusIcon(deployment.status)}
                      {getStatusChip(deployment.status)}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                      {deployment.version}
                    </Typography>
                  </TableCell>
                  <TableCell>{getEnvironmentChip(deployment.environment)}</TableCell>
                  <TableCell>{deployment.deployed_by || '-'}</TableCell>
                  <TableCell>
                    <Chip label={deployment.branch} size="small" />
                  </TableCell>
                  <TableCell>{formatDate(deployment.deployed_at)}</TableCell>
                  <TableCell align="center">
                    <Tooltip title="상세보기">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDetail(deployment.id);
                        }}
                      >
                        <ViewIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default DeploymentResultsPage;
