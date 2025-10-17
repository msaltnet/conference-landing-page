const fs = require('fs');
const path = require('path');
const os = require('os');

// 검증 함수들 import
const { validateProgramData } = require('./js/validator.js');

// 빌드 설정
const config = {
  sourceDir: './',
  distDir: process.env.NODE_ENV === 'production' ? './docs' : './dist',
  baseUrl: process.env.BASE_URL || 'https://msaltnet.github.io/conference-landing-page'
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
      
      // 경로 수정
      // CSS 경로 수정
      htmlContent = htmlContent.replace(
        'href="css/style.css"',
        `href="${config.baseUrl}/css/style.css"`
      );
      
      // JavaScript 경로 수정
      htmlContent = htmlContent.replace(
        'src="js/main.js"',
        `src="${config.baseUrl}/js/main.js"`
      );
      
      // 이미지 경로 수정
      htmlContent = htmlContent.replace(
        'src="assets/images/register-button.svg"',
        `src="${config.baseUrl}/assets/images/register-button.svg"`
      );
      
      
      // 섹션 이미지들 삽입
      if (eventData.sectionImages) {
        // 히어로 섹션 이미지 삽입
        if (eventData.sectionImages.hero && eventData.sectionImages.hero.length > 0) {
          const heroImagesHtml = eventData.sectionImages.hero.map(img => 
            `<img src="${img}" alt="히어로 섹션 이미지" class="section-image">`
          ).join('\n');
          
          htmlContent = htmlContent.replace(
            `    <!-- 히어로 섹션 이미지들 -->${os.EOL}    <div class="section-images-container">${os.EOL}        <!-- 히어로 섹션 이미지들이 여기에 동적으로 추가됩니다 -->${os.EOL}    </div>`,
            `    <!-- 히어로 섹션 이미지들 -->${os.EOL}    <div class="section-images-container">${os.EOL}${heroImagesHtml}${os.EOL}    </div>`
          );
        }
        
        // 행사 소개 섹션 이미지 삽입
        if (eventData.sectionImages.about && eventData.sectionImages.about.length > 0) {
          const aboutImagesHtml = eventData.sectionImages.about.map(img => 
            `<img src="${img}" alt="행사 소개 이미지" class="section-image">`
          ).join('\n');
          
          htmlContent = htmlContent.replace(
            `    </section>${os.EOL}${os.EOL}    <!-- 프로그램 소개 섹션 -->`,
            `    </section>${os.EOL}${os.EOL}    <!-- 행사 소개 이미지들 -->${os.EOL}    <div class="section-images-container">${os.EOL}${aboutImagesHtml}${os.EOL}    </div>${os.EOL}${os.EOL}    <!-- 프로그램 소개 섹션 -->`
          );
        }
        
        // 이벤트 소개 섹션 이미지 삽입
        if (eventData.sectionImages.events && eventData.sectionImages.events.length > 0) {
          const eventsImagesHtml = eventData.sectionImages.events.map(img => 
            `<img src="${img}" alt="이벤트 소개 이미지" class="section-image">`
          ).join('\n');
          htmlContent = htmlContent.replace(
            `    </section>${os.EOL}${os.EOL}    <!-- 안내 섹션 -->`,
            `    </section>${os.EOL}${os.EOL}    <!-- 이벤트 소개 이미지들 -->${os.EOL}    <div class="section-images-container">${os.EOL}${eventsImagesHtml}${os.EOL}    </div>${os.EOL}${os.EOL}    <!-- 안내 섹션 -->`
          );
        }
        
        // 행사 안내 섹션 이미지 삽입
        if (eventData.sectionImages.info && eventData.sectionImages.info.length > 0) {
          const infoImagesHtml = eventData.sectionImages.info.map(img => 
            `<img src="${img}" alt="행사 안내 이미지" class="section-image">`
          ).join('\n');
          htmlContent = htmlContent.replace(
            `    </section>${os.EOL}${os.EOL}    <!-- 장소 안내 섹션 -->`,
            `    </section>${os.EOL}${os.EOL}    <!-- 행사 안내 이미지들 -->${os.EOL}    <div class="section-images-container">${os.EOL}${infoImagesHtml}${os.EOL}    </div>${os.EOL}${os.EOL}    <!-- 장소 안내 섹션 -->`
          );
        }
        
        // 장소 안내 섹션 이미지 삽입
        if (eventData.sectionImages.location && eventData.sectionImages.location.length > 0) {
          const locationImagesHtml = eventData.sectionImages.location.map(img => 
            `<img src="${img}" alt="장소 안내 이미지" class="section-image">`
          ).join('\n');
          htmlContent = htmlContent.replace(
            `    </section>${os.EOL}${os.EOL}    <!-- 모달 -->`,
            `    </section>${os.EOL}${os.EOL}    <!-- 장소 안내 이미지들 -->${os.EOL}    <div class="section-images-container">${os.EOL}${locationImagesHtml}${os.EOL}    </div>${os.EOL}${os.EOL}    <!-- 모달 -->`
          );
        }
      }
      
    // HTML 파일 저장
    const distHtmlPath = path.join(config.distDir, 'index.html');
    fs.writeFileSync(distHtmlPath, htmlContent);
  }
  
  // walk-through 페이지 처리
  const walkthroughPath = path.join(config.sourceDir, 'walk-through.html');
  if (fs.existsSync(walkthroughPath)) {
    let walkthroughContent = fs.readFileSync(walkthroughPath, 'utf8');
    
    // 경로 수정
    walkthroughContent = walkthroughContent.replace(
      'href="../css/style.css"',
      `href="${config.baseUrl}/css/style.css"`
    );
    
    walkthroughContent = walkthroughContent.replace(
      'src="../js/main.js"',
      `src="${config.baseUrl}/js/main.js"`
    );
    
    walkthroughContent = walkthroughContent.replace(
      'src="../js/walkthrough.js"',
      `src="${config.baseUrl}/js/walkthrough.js"`
    );
    
    // walk-through HTML 파일 저장
    const distWalkthroughPath = path.join(config.distDir, 'walk-through.html');
    fs.writeFileSync(distWalkthroughPath, walkthroughContent);
  }
  
  // walk-through 디렉토리 생성 및 리다이렉션 파일 생성
  const walkthroughDir = path.join(config.distDir, 'walk-through');
  ensureDir(walkthroughDir);
  
  const redirectHtml = `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Redirecting...</title>
    <script>
        // URL 경로에 따라 적절한 페이지로 리다이렉트
        const path = window.location.pathname;
        
        if (path === '/walk-through' || path === '/walk-through/') {
            window.location.href = '/walk-through.html';
        } else if (path === '/en/walk-through' || path === '/en/walk-through/') {
            window.location.href = '/en/walk-through.html';
        } else if (path === '/' || path === '') {
            window.location.href = '/index.html';
        } else {
            // 404 페이지로 리다이렉트
            window.location.href = '/index.html';
        }
    </script>
</head>
<body>
    <p>리다이렉트 중...</p>
</body>
</html>`;
  
  fs.writeFileSync(path.join(walkthroughDir, 'index.html'), redirectHtml);
    
    // 정적 파일들 복사
    copyDir(path.join(config.sourceDir, 'css'), path.join(config.distDir, 'css'));
    
    // JavaScript 파일 처리 (main.js의 baseUrl 설정 수정)
    const jsSourceDir = path.join(config.sourceDir, 'js');
    const jsDistDir = path.join(config.distDir, 'js');
    ensureDir(jsDistDir);
    
    // main.js 파일 처리
    const mainJsPath = path.join(jsSourceDir, 'main.js');
    if (fs.existsSync(mainJsPath)) {
      let mainJsContent = fs.readFileSync(mainJsPath, 'utf8');
      
      // baseUrl 설정을 빌드 시점의 값으로 교체
      mainJsContent = mainJsContent.replace(
        'const baseUrl = window.location.origin;',
        `const baseUrl = '${config.baseUrl}';`
      );
      
      fs.writeFileSync(path.join(jsDistDir, 'main.js'), mainJsContent);
    }
    
    // validator.js 파일 복사
    const validatorJsPath = path.join(jsSourceDir, 'validator.js');
    if (fs.existsSync(validatorJsPath)) {
      fs.copyFileSync(validatorJsPath, path.join(jsDistDir, 'validator.js'));
    }
    
    // walkthrough.js 파일 복사
    const walkthroughJsPath = path.join(jsSourceDir, 'walkthrough.js');
    if (fs.existsSync(walkthroughJsPath)) {
      fs.copyFileSync(walkthroughJsPath, path.join(jsDistDir, 'walkthrough.js'));
    }
    
    copyDir(path.join(config.sourceDir, 'assets'), path.join(config.distDir, 'assets'));
    copyDir(path.join(config.sourceDir, 'data'), path.join(config.distDir, 'data'));
    
    // 영어 버전 폴더 복사
    const enSourceDir = path.join(config.sourceDir, 'en');
    const enDistDir = path.join(config.distDir, 'en');
    let enEventData = {}; // 스코프를 밖으로 이동
    
    if (fs.existsSync(enSourceDir)) {
      ensureDir(enDistDir);
      
      // 영어 버전 이벤트 데이터 로드 (data/ 폴더의 -en.json 파일 사용)
      const enEventDataPath = path.join(config.sourceDir, 'data', 'event-info-en.json');
      
      if (fs.existsSync(enEventDataPath)) {
        const enEventDataContent = fs.readFileSync(enEventDataPath, 'utf8');
        enEventData = JSON.parse(enEventDataContent);
      }
      
      // 영어 버전 HTML 처리
      const enHtmlPath = path.join(enSourceDir, 'index.html');
      if (fs.existsSync(enHtmlPath)) {
        let enHtmlContent = fs.readFileSync(enHtmlPath, 'utf8');
        
        // 경로 수정
        // CSS 경로 수정
        enHtmlContent = enHtmlContent.replace(
          'href="../css/style.css"',
          `href="${config.baseUrl}/css/style.css"`
        );
        
        // JavaScript 경로 수정
        enHtmlContent = enHtmlContent.replace(
          'src="../js/main.js"',
          `src="${config.baseUrl}/js/main.js"`
        );
        
        // 이미지 경로 수정
        enHtmlContent = enHtmlContent.replace(
          'src="../assets/images/register-button.svg"',
          `src="${config.baseUrl}/assets/images/register-button.svg"`
        );
        
        
        // 섹션 이미지들 삽입
        if (enEventData.sectionImages) {
          // 히어로 섹션 이미지 삽입
          if (enEventData.sectionImages.hero && enEventData.sectionImages.hero.length > 0) {
            const heroImagesHtml = enEventData.sectionImages.hero.map(img => 
              `<img src="../${img}" alt="Hero section image" class="section-image">`
            ).join('\n');
            
            enHtmlContent = enHtmlContent.replace(
              `    <!-- 히어로 섹션 이미지들 -->${os.EOL}    <div class="section-images-container">${os.EOL}        <!-- 히어로 섹션 이미지들이 여기에 동적으로 추가됩니다 -->${os.EOL}    </div>`,
              `    <!-- 히어로 섹션 이미지들 -->${os.EOL}    <div class="section-images-container">${os.EOL}${heroImagesHtml}${os.EOL}    </div>`
            );
          }
          
          // 행사 소개 섹션 이미지 삽입
          if (enEventData.sectionImages.about && enEventData.sectionImages.about.length > 0) {
            const aboutImagesHtml = enEventData.sectionImages.about.map(img => 
              `<img src="../${img}" alt="About section image" class="section-image">`
            ).join('\n');
            
            enHtmlContent = enHtmlContent.replace(
              `    </section>${os.EOL}${os.EOL}    <!-- 프로그램 소개 섹션 -->`,
              `    </section>${os.EOL}${os.EOL}    <!-- 행사 소개 이미지들 -->${os.EOL}    <div class="section-images-container">${os.EOL}${aboutImagesHtml}${os.EOL}    </div>${os.EOL}${os.EOL}    <!-- 프로그램 소개 섹션 -->`
            );
          }
          
          // 이벤트 소개 섹션 이미지 삽입
          if (enEventData.sectionImages.events && enEventData.sectionImages.events.length > 0) {
            const eventsImagesHtml = enEventData.sectionImages.events.map(img => 
              `<img src="../${img}" alt="Events section image" class="section-image">`
            ).join('\n');
            enHtmlContent = enHtmlContent.replace(
              `    </section>${os.EOL}${os.EOL}    <!-- 안내 섹션 -->`,
              `    </section>${os.EOL}${os.EOL}    <!-- 이벤트 소개 이미지들 -->${os.EOL}    <div class="section-images-container">${os.EOL}${eventsImagesHtml}${os.EOL}    </div>${os.EOL}${os.EOL}    <!-- 안내 섹션 -->`
            );
          }
          
          // 행사 안내 섹션 이미지 삽입
          if (enEventData.sectionImages.info && enEventData.sectionImages.info.length > 0) {
            const infoImagesHtml = enEventData.sectionImages.info.map(img => 
              `<img src="../${img}" alt="Info section image" class="section-image">`
            ).join('\n');
            enHtmlContent = enHtmlContent.replace(
              `    </section>${os.EOL}${os.EOL}    <!-- 장소 안내 섹션 -->`,
              `    </section>${os.EOL}${os.EOL}    <!-- 행사 안내 이미지들 -->${os.EOL}    <div class="section-images-container">${os.EOL}${infoImagesHtml}${os.EOL}    </div>${os.EOL}${os.EOL}    <!-- 장소 안내 섹션 -->`
            );
          }
          
          // 장소 안내 섹션 이미지 삽입
          if (enEventData.sectionImages.location && enEventData.sectionImages.location.length > 0) {
            const locationImagesHtml = enEventData.sectionImages.location.map(img => 
              `<img src="../${img}" alt="Location section image" class="section-image">`
            ).join('\n');
            enHtmlContent = enHtmlContent.replace(
              `    </section>${os.EOL}${os.EOL}    <!-- 모달 -->`,
              `    </section>${os.EOL}${os.EOL}    <!-- 장소 안내 이미지들 -->${os.EOL}    <div class="section-images-container">${os.EOL}${locationImagesHtml}${os.EOL}    </div>${os.EOL}${os.EOL}    <!-- 모달 -->`
            );
          }
        }
        
        // 영어 버전 HTML 저장
        fs.writeFileSync(path.join(enDistDir, 'index.html'), enHtmlContent);
      }
      
      // 영어 버전 데이터 폴더 복사 (data/ 폴더의 모든 파일 복사)
      copyDir(path.join(config.sourceDir, 'data'), path.join(enDistDir, 'data'));
      
      // 영어 버전 assets 폴더 복사
      copyDir(path.join(config.sourceDir, 'assets'), path.join(enDistDir, 'assets'));
      copyDir(path.join(config.sourceDir, 'css'), path.join(enDistDir, 'css'));
      
      // 영어 버전 JavaScript 파일 처리 (main.js의 baseUrl 설정 수정)
      const enJsDistDir = path.join(enDistDir, 'js');
      ensureDir(enJsDistDir);
      
      // main.js 파일 처리
      const enMainJsPath = path.join(jsSourceDir, 'main.js');
      if (fs.existsSync(enMainJsPath)) {
        let enMainJsContent = fs.readFileSync(enMainJsPath, 'utf8');
        
        // baseUrl 설정을 빌드 시점의 값으로 교체
        enMainJsContent = enMainJsContent.replace(
          'const baseUrl = window.location.origin;',
          `const baseUrl = '${config.baseUrl}';`
        );
        
        fs.writeFileSync(path.join(enJsDistDir, 'main.js'), enMainJsContent);
      }
      
      // validator.js 파일 복사
      const enValidatorJsPath = path.join(jsSourceDir, 'validator.js');
      if (fs.existsSync(enValidatorJsPath)) {
        fs.copyFileSync(enValidatorJsPath, path.join(enJsDistDir, 'validator.js'));
      }
      
      // walkthrough.js 파일 복사
      const walkthroughJsPath = path.join(jsSourceDir, 'walkthrough.js');
      if (fs.existsSync(walkthroughJsPath)) {
        fs.copyFileSync(walkthroughJsPath, path.join(enJsDistDir, 'walkthrough.js'));
      }
      
      // 영어 버전 walk-through 페이지 처리
      const enWalkthroughPath = path.join(enSourceDir, 'walk-through.html');
      if (fs.existsSync(enWalkthroughPath)) {
        let enWalkthroughContent = fs.readFileSync(enWalkthroughPath, 'utf8');
        
        // 경로 수정
        enWalkthroughContent = enWalkthroughContent.replace(
          'href="../css/style.css"',
          `href="${config.baseUrl}/css/style.css"`
        );
        
        enWalkthroughContent = enWalkthroughContent.replace(
          'src="../js/main.js"',
          `src="${config.baseUrl}/js/main.js"`
        );
        
        enWalkthroughContent = enWalkthroughContent.replace(
          'src="js/walkthrough.js"',
          `src="${config.baseUrl}/en/js/walkthrough.js"`
        );
        
        // 영어 버전 walk-through HTML 파일 저장
        fs.writeFileSync(path.join(enDistDir, 'walk-through.html'), enWalkthroughContent);
      }
      
      // 영어 버전 walk-through 디렉토리 생성 및 리다이렉션 파일 생성
      const enWalkthroughDir = path.join(enDistDir, 'walk-through');
      ensureDir(enWalkthroughDir);
      
      const enRedirectHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Redirecting...</title>
    <script>
        // URL 경로에 따라 적절한 페이지로 리다이렉트
        const path = window.location.pathname;
        
        if (path === '/en/walk-through' || path === '/en/walk-through/') {
            window.location.href = '/en/walk-through.html';
        } else if (path === '/walk-through' || path === '/walk-through/') {
            window.location.href = '/walk-through.html';
        } else if (path === '/' || path === '') {
            window.location.href = '/index.html';
        } else {
            // 404 페이지로 리다이렉트
            window.location.href = '/index.html';
        }
    </script>
</head>
<body>
    <p>Redirecting...</p>
</body>
</html>`;
      
      fs.writeFileSync(path.join(enWalkthroughDir, 'index.html'), enRedirectHtml);
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
    
    // 영어 버전 빌드 정보 생성
    if (fs.existsSync(enDistDir)) {
      const enProgramDataPath = path.join(config.sourceDir, 'data', 'program-schedule-en.json');
      const enProgramData = fs.existsSync(enProgramDataPath) ? 
        JSON.parse(fs.readFileSync(enProgramDataPath, 'utf8')) : programData;
      
      const enBuildInfo = {
        buildTime: new Date().toISOString(),
        version: require('./package.json').version,
        environment: config.isProduction ? 'production' : 'development',
        eventData: enEventData,
        programData: {
          totalPrograms: enProgramData.programs.length,
          locations: enProgramData.locations,
          categories: enProgramData.categories
        }
      };
      
      const enBuildInfoPath = path.join(enDistDir, 'build-info.json');
      fs.writeFileSync(enBuildInfoPath, JSON.stringify(enBuildInfo, null, 2));
    }
    
    console.log(`✅ 빌드 완료: ${config.distDir} 폴더에 산출물이 저장되었습니다.`);
    console.log(`📁 환경: ${config.isProduction ? 'production' : 'development'}`);
    
  } catch (error) {
    console.error('❌ 빌드 실패:', error.message);
    process.exit(1);
  }
}

// 빌드 실행
build();
