const fs = require('fs');
const path = require('path');
const { minify: minifyJS } = require('terser');
const { minify: minifyCSS } = require('clean-css');
const { minify: minifyHTML } = require('html-minifier-terser');

// 빌드 설정
const config = {
  sourceDir: './',
  distDir: './dist',
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
async function optimizeCSS(cssContent) {
  if (!config.isProduction) return cssContent;
  
  try {
    const result = await minifyCSS(cssContent);
    return result.styles;
  } catch (error) {
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
    return jsContent;
  }
}

// HTML 최적화 함수
function optimizeHTML(htmlContent) {
  if (!config.isProduction) return htmlContent;
  
  try {
    return minifyHTML(htmlContent, {
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

// 메인 빌드 함수
async function build() {
  
  try {
    // dist 디렉토리 정리
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
          cssContent = await optimizeCSS(cssContent);
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
        htmlContent = optimizeHTML(htmlContent);
        
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
      eventData: eventData
    };
    
    const buildInfoPath = path.join(config.distDir, 'build-info.json');
    fs.writeFileSync(buildInfoPath, JSON.stringify(buildInfo, null, 2));
    
  } catch (error) {
    process.exit(1);
  }
}

// 빌드 실행
build();
