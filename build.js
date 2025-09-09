const fs = require('fs');
const path = require('path');

// 검증 함수들 import
const { validateProgramData } = require('./js/validator.js');

// 빌드 설정
const config = {
  sourceDir: './',
  distDir: process.env.NODE_ENV === 'production' ? './docs' : './dist',
  isProduction: process.env.NODE_ENV === 'production'
};

// 디렉토리 생성 함수
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// 파일 복사 함수
function copyFile(src, dest) {
  const destDir = path.dirname(dest);
  ensureDir(destDir);
  fs.copyFileSync(src, dest);
}

// 디렉토리 복사 함수
function copyDir(src, dest) {
  ensureDir(dest);
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      copyFile(srcPath, destPath);
    }
  }
}



// 프로그램 데이터 검증 함수
function validateProgramDataFile() {
  const programDataPath = path.join(config.sourceDir, 'data', 'program-schedule.json');
  
  if (!fs.existsSync(programDataPath)) {
    console.error('❌ 프로그램 데이터 파일이 없습니다:', programDataPath);
    process.exit(1);
  }
  
  try {
    const programDataContent = fs.readFileSync(programDataPath, 'utf8');
    const programData = JSON.parse(programDataContent);
    
    console.log('🔍 프로그램 데이터 검증 중...');
    const validation = validateProgramData(programData);
    
    if (!validation.isValid) {
      console.error('❌ 프로그램 데이터 검증 실패:');
      validation.errors.forEach(error => {
        console.error(`  - ${error}`);
      });
      console.error('\n💡 해결 방법:');
      console.error('  1. data/program-schedule.json 파일의 locations와 categories 배열을 확인하세요.');
      console.error('  2. 모든 프로그램의 location과 category가 정의된 값과 일치하는지 확인하세요.');
      console.error('  3. 날짜와 시간 형식이 올바른지 확인하세요. (YYYY-MM-DD, HH:MM-HH:MM)');
      process.exit(1);
    }
    
    console.log('✅ 프로그램 데이터 검증 완료');
    return programData;
  } catch (error) {
    console.error('❌ 프로그램 데이터 파일 읽기 오류:', error.message);
    process.exit(1);
  }
}

// 메인 빌드 함수
async function build() {
  
  try {
    // 프로그램 데이터 검증
    const programData = validateProgramDataFile();
    
    // dist/docs 디렉토리 생성 (기존 폴더가 있으면 덮어쓰기)
    ensureDir(config.distDir);
    
    // 이벤트 데이터 로드
    const eventDataPath = path.join(config.sourceDir, 'data', 'event-info.json');
    let eventData = {};
    
    if (fs.existsSync(eventDataPath)) {
      const eventDataContent = fs.readFileSync(eventDataPath, 'utf8');
      eventData = JSON.parse(eventDataContent);
    }
    
    // HTML 처리
    const htmlPath = path.join(config.sourceDir, 'index.html');
    if (fs.existsSync(htmlPath)) {
      let htmlContent = fs.readFileSync(htmlPath, 'utf8');
      
      // 개발 모드에서는 JSON 파일을 그대로 사용
      if (!config.isProduction) {
        // CSS와 JS를 인라인으로 삽입하지 않고 링크로 유지
        const distHtmlPath = path.join(config.distDir, 'index.html');
        fs.writeFileSync(distHtmlPath, htmlContent);
      } else {
        // 프로덕션 모드에서도 별도 파일로 유지 (템플릿 처리 제거)
        const distHtmlPath = path.join(config.distDir, 'index.html');
        fs.writeFileSync(distHtmlPath, htmlContent);
      }
    }
    
    // 정적 파일들 복사
    if (!config.isProduction) {
      // 개발 모드: 모든 파일 복사
      copyDir(path.join(config.sourceDir, 'css'), path.join(config.distDir, 'css'));
      copyDir(path.join(config.sourceDir, 'js'), path.join(config.distDir, 'js'));
      copyDir(path.join(config.sourceDir, 'assets'), path.join(config.distDir, 'assets'));
      copyDir(path.join(config.sourceDir, 'data'), path.join(config.distDir, 'data'));
    } else {
      // 프로덕션 모드: 필요한 파일만 복사
      copyDir(path.join(config.sourceDir, 'assets'), path.join(config.distDir, 'assets'));
      copyDir(path.join(config.sourceDir, 'data'), path.join(config.distDir, 'data'));
      copyDir(path.join(config.sourceDir, 'css'), path.join(config.distDir, 'css'));
      copyDir(path.join(config.sourceDir, 'js'), path.join(config.distDir, 'js'));
    }
    
    // 빌드 정보 생성
    const buildInfo = {
      buildTime: new Date().toISOString(),
      version: require('./package.json').version,
      environment: config.isProduction ? 'production' : 'development',
      eventData: eventData,
      programData: {
        totalPrograms: programData.programs.length,
        locations: programData.locations,
        categories: programData.categories
      }
    };
    
    const buildInfoPath = path.join(config.distDir, 'build-info.json');
    fs.writeFileSync(buildInfoPath, JSON.stringify(buildInfo, null, 2));
    
    console.log(`✅ 빌드 완료: ${config.distDir} 폴더에 산출물이 저장되었습니다.`);
    console.log(`📁 환경: ${config.isProduction ? 'production' : 'development'}`);
    
  } catch (error) {
    console.error('❌ 빌드 실패:', error.message);
    process.exit(1);
  }
}

// 빌드 실행
build();
