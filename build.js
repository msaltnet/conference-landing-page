const fs = require('fs');
const path = require('path');
const { minify: minifyJS } = require('terser');
const CleanCSS = require('clean-css');
const { minify: minifyHTML } = require('html-minifier-terser');

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

// CSS 최적화 함수
function optimizeCSS(cssContent) {
  if (!config.isProduction) return cssContent;
  
  try {
    const minifier = new CleanCSS();
    const result = minifier.minify(cssContent);
    return result.styles;
  } catch (error) {
    console.warn('CSS 최적화 실패:', error.message);
    return cssContent;
  }
}

// JavaScript 최적화 함수
async function optimizeJS(jsContent) {
  if (!config.isProduction) return jsContent;
  
  try {
    const result = await minifyJS(jsContent, {
      compress: {
        drop_console: true,
        drop_debugger: true
      },
      mangle: {
        toplevel: false
      }
    });
    return result.code;
  } catch (error) {
    console.warn('JavaScript 최적화 실패:', error.message);
    return jsContent;
  }
}

// HTML 최적화 함수
async function optimizeHTML(htmlContent) {
  if (!config.isProduction) return htmlContent;
  
  try {
    return await minifyHTML(htmlContent, {
      removeComments: true,
      collapseWhitespace: true,
      removeRedundantAttributes: true,
      useShortDoctype: true,
      removeEmptyAttributes: true,
      removeOptionalTags: true,
      removeEmptyElements: false,
      lint: false,
      keepClosingSlash: false,
      caseSensitive: false,
      minifyJS: false, // 이미 별도로 최적화됨
      minifyCSS: false  // 이미 별도로 최적화됨
    });
  } catch (error) {
    console.warn('HTML 최적화 실패:', error.message);
    return htmlContent;
  }
}

// HTML 템플릿 처리 함수
function processHTML(htmlContent, eventData) {
  // JSON 데이터를 HTML에 직접 삽입
  const processedHTML = htmlContent
    .replace(/{{EVENT_NAME}}/g, eventData.eventName || 'Conference 2024')
    .replace(/{{EVENT_SUBTITLE}}/g, eventData.eventSubtitle || '미래를 위한 기술과 혁신의 만남')
    .replace(/{{EVENT_DATE}}/g, eventData.eventDate || '2024-12-15')
    .replace(/{{EVENT_TIME}}/g, eventData.eventTime || '09:00')
    .replace(/{{EVENT_END_TIME}}/g, eventData.eventEndTime || '18:00')
    .replace(/{{EVENT_LOCATION}}/g, eventData.eventLocation || '서울 코엑스 컨벤션센터')
    .replace(/{{EVENT_DESCRIPTION}}/g, eventData.eventDescription || 'Conference 2024는 업계 최고의 전문가들과 함께하는 기술 컨퍼런스입니다.')
    .replace(/{{COUNTDOWN_TARGET}}/g, eventData.countdownTarget || '2024-12-15T09:00:00+09:00')
    .replace(/{{REGISTRATION_URL}}/g, eventData.registrationUrl || '#');
  
  return processedHTML;
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
    
    // dist/docs 디렉토리 정리
    if (fs.existsSync(config.distDir)) {
      fs.rmSync(config.distDir, { recursive: true });
    }
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
        // 프로덕션 모드에서는 템플릿 처리
        htmlContent = processHTML(htmlContent, eventData);
        
        // CSS 인라인 삽입
        const cssPath = path.join(config.sourceDir, 'css', 'style.css');
        if (fs.existsSync(cssPath)) {
          let cssContent = fs.readFileSync(cssPath, 'utf8');
          cssContent = optimizeCSS(cssContent);
          htmlContent = htmlContent.replace(
            '<link rel="stylesheet" href="css/style.css">',
            `<style>${cssContent}</style>`
          );
        }
        
        // JavaScript 인라인 삽입
        const jsPath = path.join(config.sourceDir, 'js', 'main.js');
        if (fs.existsSync(jsPath)) {
          let jsContent = fs.readFileSync(jsPath, 'utf8');
          jsContent = await optimizeJS(jsContent);
          htmlContent = htmlContent.replace(
            '<script src="js/main.js"></script>',
            `<script>${jsContent}</script>`
          );
        }
        
        // HTML 최적화
        htmlContent = await optimizeHTML(htmlContent);
        
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
