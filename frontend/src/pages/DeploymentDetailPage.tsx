import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Chip,
  CircularProgress,
  Alert,
  Breadcrumbs,
  Link,
  Button,
  Divider,
  Card,
  CardContent,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import {
  Home as HomeIcon,
  Business as BusinessIcon,
  ArrowBack as BackIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  HourglassEmpty as InProgressIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import DeploymentService from '../services/DeploymentService';
import { DeploymentResult } from '../models/Deployment';

const DeploymentDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { projectId, deploymentId } = useParams<{ projectId: string; deploymentId: string }>();
  const [deployment, setDeployment] = useState<DeploymentResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const selectedProject = localStorage.getItem('selectedProject');
  const projectData = selectedProject ? JSON.parse(selectedProject) : null;

  useEffect(() => {
    const fetchDeployment = async () => {
      if (!projectId || !deploymentId) return;

      try {
        setLoading(true);
        const response = await DeploymentService.getDeploymentById(projectId, parseInt(deploymentId));
        if (response.success) {
          setDeployment(response.data);
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

    fetchDeployment();
  }, [projectId, deploymentId]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <SuccessIcon sx={{ fontSize: 48, color: 'success.main' }} />;
      case 'failed':
        return <ErrorIcon sx={{ fontSize: 48, color: 'error.main' }} />;
      case 'in_progress':
        return <InProgressIcon sx={{ fontSize: 48, color: 'warning.main' }} />;
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
    return <Chip label={statusInfo.label} color={statusInfo.color} />;
  };

  const getEnvironmentChip = (environment: string) => {
    const envMap = {
      production: { label: '운영', color: 'error' as const },
      staging: { label: '스테이징', color: 'warning' as const },
      development: { label: '개발', color: 'info' as const },
    };
    const envInfo = envMap[environment as keyof typeof envMap] || { label: environment, color: 'default' as const };
    return <Chip label={envInfo.label} color={envInfo.color} variant="outlined" />;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
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

  if (error || !deployment) {
    return (
      <Container maxWidth="xl">
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error || '배포 결과를 찾을 수 없습니다.'}
          </Alert>
          <Button
            variant="contained"
            startIcon={<BackIcon />}
            onClick={() => navigate(`/project/${projectId}/deployments`)}
          >
            목록으로 돌아가기
          </Button>
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
          <Link
            color="inherit"
            onClick={() => navigate(`/project/${projectId}/deployments`)}
            sx={{ cursor: 'pointer' }}
          >
            배포 결과
          </Link>
          <Typography color="text.primary">상세정보</Typography>
        </Breadcrumbs>
      </Box>

      {/* Back Button */}
      <Box sx={{ mb: 3 }}>
        <Button
          variant="outlined"
          startIcon={<BackIcon />}
          onClick={() => navigate(`/project/${projectId}/deployments`)}
        >
          목록으로
        </Button>
      </Box>

      {/* Deployment Header */}
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          {getStatusIcon(deployment.status)}
          <Box sx={{ flex: 1 }}>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 1 }}>
              {deployment.version}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              {getStatusChip(deployment.status)}
              {getEnvironmentChip(deployment.environment)}
              <Chip label={deployment.branch} size="small" />
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Deployment Details */}
      <Grid container spacing={3}>
        {/* Left Column */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                기본 정보
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  배포 ID
                </Typography>
                <Typography variant="body1">{deployment.id}</Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  프로젝트 ID
                </Typography>
                <Typography variant="body1">{deployment.project_id}</Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  배포자
                </Typography>
                <Typography variant="body1">{deployment.deployed_by || '-'}</Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  배포일시
                </Typography>
                <Typography variant="body1">{formatDate(deployment.deployed_at)}</Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  생성일시
                </Typography>
                <Typography variant="body1">{formatDate(deployment.created_at)}</Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  수정일시
                </Typography>
                <Typography variant="body1">{formatDate(deployment.updated_at)}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                코드 정보
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  브랜치
                </Typography>
                <Typography variant="body1">{deployment.branch}</Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  커밋 해시
                </Typography>
                <Typography variant="body1" sx={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>
                  {deployment.commit_hash || '-'}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  설명
                </Typography>
                <Typography variant="body1">{deployment.description || '-'}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Logs Section */}
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                배포 로그
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Paper
                sx={{
                  p: 2,
                  bgcolor: 'grey.900',
                  color: 'grey.100',
                  fontFamily: 'monospace',
                  fontSize: '0.875rem',
                  maxHeight: '400px',
                  overflow: 'auto',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all',
                }}
              >
                {deployment.logs || '로그가 없습니다.'}
              </Paper>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default DeploymentDetailPage;
