#!/bin/bash

# 프론트엔드 실행 스크립트
echo "🚀 프론트엔드 서버를 시작합니다..."

# 현재 디렉토리가 frontend인지 확인
if [ ! -f "package.json" ]; then
    echo "❌ package.json 파일을 찾을 수 없습니다."
    echo "frontend 디렉토리에서 실행해주세요."
    exit 1
fi

# node_modules가 없으면 설치
if [ ! -d "node_modules" ]; then
    echo "📦 의존성을 설치합니다..."
    npm install
fi

# 개발 서버 시작
echo "🌐 개발 서버를 시작합니다..."
echo "📍 접속 주소: http://localhost:3000"
echo "⏹️  중지하려면 Ctrl+C를 누르세요"
echo ""

npm start 