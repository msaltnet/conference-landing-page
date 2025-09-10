const fs = require('fs');
const path = require('path');

// 검증 함수들 import
const { validateProgramData } = require('./js/validator.js');

// 빌드 설정
const config = {
  sourceDir: './',
  distDir: process.env.NODE_ENV === 'production' ? './docs' : './dist',
  isProduction: process.env.NODE_ENV === 'production',
  baseUrl: process.env.BASE_URL || (process.env.NODE_ENV === 'production' ? 'https://msaltnet.github.io/conference-landing-page' : '')
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
      
      // 프로덕션 환경에서 경로 수정
      if (config.isProduction && config.baseUrl) {
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
      }
      
      // 히어로 배경 이미지 처리
      if (eventData.heroBackgroundImage) {
        // 히어로 섹션에 배경 이미지 스타일 추가
        const heroStyle = `
    <style>
      .hero {
        background-image: url('${eventData.heroBackgroundImage}');
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
        position: relative;
      }
      .hero::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(135deg, rgba(102, 126, 234, 0.8) 0%, rgba(118, 75, 162, 0.8) 100%);
        z-index: 1;
      }
      .hero .hero-container {
        position: relative;
        z-index: 2;
      }
    </style>`;
        
        // head 태그 안에 스타일 삽입
        htmlContent = htmlContent.replace('</head>', `${heroStyle}\n</head>`);
      }
      
      // 섹션 이미지들 삽입
      if (eventData.sectionImages) {
        // 행사 소개 섹션 이미지 삽입
        if (eventData.sectionImages.about && eventData.sectionImages.about.length > 0) {
          const aboutImagesHtml = eventData.sectionImages.about.map(img => 
            `<img src="${img}" alt="행사 소개 이미지" class="section-image">`
          ).join('\n');
          
          htmlContent = htmlContent.replace(
            '    </section>\r\n\r\n    <!-- 프로그램 소개 섹션 -->',
            `    </section>\r\n\r\n    <!-- 행사 소개 이미지들 -->\r\n    <div class="section-images-container">\r\n${aboutImagesHtml}\r\n    </div>\r\n\r\n    <!-- 프로그램 소개 섹션 -->`
          );
        }
        
        // 이벤트 소개 섹션 이미지 삽입
        if (eventData.sectionImages.events && eventData.sectionImages.events.length > 0) {
          const eventsImagesHtml = eventData.sectionImages.events.map(img => 
            `<img src="${img}" alt="이벤트 소개 이미지" class="section-image">`
          ).join('\n');
          htmlContent = htmlContent.replace(
            '    </section>\r\n\r\n    <!-- 안내 섹션 -->',
            `    </section>\r\n\r\n    <!-- 이벤트 소개 이미지들 -->\r\n    <div class="section-images-container">\r\n${eventsImagesHtml}\r\n    </div>\r\n\r\n    <!-- 안내 섹션 -->`
          );
        }
        
        // 행사 안내 섹션 이미지 삽입
        if (eventData.sectionImages.info && eventData.sectionImages.info.length > 0) {
          const infoImagesHtml = eventData.sectionImages.info.map(img => 
            `<img src="${img}" alt="행사 안내 이미지" class="section-image">`
          ).join('\n');
          htmlContent = htmlContent.replace(
            '    </section>\r\n\r\n    <!-- 장소 안내 섹션 -->',
            `    </section>\r\n\r\n    <!-- 행사 안내 이미지들 -->\r\n    <div class="section-images-container">\r\n${infoImagesHtml}\r\n    </div>\r\n\r\n    <!-- 장소 안내 섹션 -->`
          );
        }
        
        // 장소 안내 섹션 이미지 삽입
        if (eventData.sectionImages.location && eventData.sectionImages.location.length > 0) {
          const locationImagesHtml = eventData.sectionImages.location.map(img => 
            `<img src="${img}" alt="장소 안내 이미지" class="section-image">`
          ).join('\n');
          htmlContent = htmlContent.replace(
            '    </section>\r\n\r\n    <!-- 모달 -->',
            `    </section>\r\n\r\n    <!-- 장소 안내 이미지들 -->\r\n    <div class="section-images-container">\r\n${locationImagesHtml}\r\n    </div>\r\n\r\n    <!-- 모달 -->`
          );
        }
      }
      
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
    
    // 영어 버전 폴더 복사
    const enSourceDir = path.join(config.sourceDir, 'en');
    const enDistDir = path.join(config.distDir, 'en');
    let enEventData = {}; // 스코프를 밖으로 이동
    
    if (fs.existsSync(enSourceDir)) {
      ensureDir(enDistDir);
      
      // 영어 버전 이벤트 데이터 로드
      const enEventDataPath = path.join(enSourceDir, 'data', 'event-info.json');
      
      if (fs.existsSync(enEventDataPath)) {
        const enEventDataContent = fs.readFileSync(enEventDataPath, 'utf8');
        enEventData = JSON.parse(enEventDataContent);
      }
      
      // 영어 버전 HTML 처리
      const enHtmlPath = path.join(enSourceDir, 'index.html');
      if (fs.existsSync(enHtmlPath)) {
        let enHtmlContent = fs.readFileSync(enHtmlPath, 'utf8');
        
        // 프로덕션 환경에서 경로 수정
        if (config.isProduction && config.baseUrl) {
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
        }
        
        // 히어로 배경 이미지 처리
        if (enEventData.heroBackgroundImage) {
          // 히어로 섹션에 배경 이미지 스타일 추가
          const heroStyle = `
    <style>
      .hero {
        background-image: url('${enEventData.heroBackgroundImage}');
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
        position: relative;
      }
      .hero::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(135deg, rgba(102, 126, 234, 0.8) 0%, rgba(118, 75, 162, 0.8) 100%);
        z-index: 1;
      }
      .hero .hero-container {
        position: relative;
        z-index: 2;
      }
    </style>`;
          
          // head 태그 안에 스타일 삽입
          enHtmlContent = enHtmlContent.replace('</head>', `${heroStyle}\n</head>`);
        }
        
        // 섹션 이미지들 삽입
        if (enEventData.sectionImages) {
          // 행사 소개 섹션 이미지 삽입
          if (enEventData.sectionImages.about && enEventData.sectionImages.about.length > 0) {
            const aboutImagesHtml = enEventData.sectionImages.about.map(img => 
              `<img src="../${img}" alt="About section image" class="section-image">`
            ).join('\n');
            
            enHtmlContent = enHtmlContent.replace(
              '    </section>\r\n\r\n    <!-- 프로그램 소개 섹션 -->',
              `    </section>\r\n\r\n    <!-- 행사 소개 이미지들 -->\r\n    <div class="section-images-container">\r\n${aboutImagesHtml}\r\n    </div>\r\n\r\n    <!-- 프로그램 소개 섹션 -->`
            );
          }
          
          // 이벤트 소개 섹션 이미지 삽입
          if (enEventData.sectionImages.events && enEventData.sectionImages.events.length > 0) {
            const eventsImagesHtml = enEventData.sectionImages.events.map(img => 
              `<img src="../${img}" alt="Events section image" class="section-image">`
            ).join('\n');
            enHtmlContent = enHtmlContent.replace(
              '    </section>\r\n\r\n    <!-- 안내 섹션 -->',
              `    </section>\r\n\r\n    <!-- 이벤트 소개 이미지들 -->\r\n    <div class="section-images-container">\r\n${eventsImagesHtml}\r\n    </div>\r\n\r\n    <!-- 안내 섹션 -->`
            );
          }
          
          // 행사 안내 섹션 이미지 삽입
          if (enEventData.sectionImages.info && enEventData.sectionImages.info.length > 0) {
            const infoImagesHtml = enEventData.sectionImages.info.map(img => 
              `<img src="../${img}" alt="Info section image" class="section-image">`
            ).join('\n');
            enHtmlContent = enHtmlContent.replace(
              '    </section>\r\n\r\n    <!-- 장소 안내 섹션 -->',
              `    </section>\r\n\r\n    <!-- 행사 안내 이미지들 -->\r\n    <div class="section-images-container">\r\n${infoImagesHtml}\r\n    </div>\r\n\r\n    <!-- 장소 안내 섹션 -->`
            );
          }
          
          // 장소 안내 섹션 이미지 삽입
          if (enEventData.sectionImages.location && enEventData.sectionImages.location.length > 0) {
            const locationImagesHtml = enEventData.sectionImages.location.map(img => 
              `<img src="../${img}" alt="Location section image" class="section-image">`
            ).join('\n');
            enHtmlContent = enHtmlContent.replace(
              '    </section>\r\n\r\n    <!-- 모달 -->',
              `    </section>\r\n\r\n    <!-- 장소 안내 이미지들 -->\r\n    <div class="section-images-container">\r\n${locationImagesHtml}\r\n    </div>\r\n\r\n    <!-- 모달 -->`
            );
          }
        }
        
        // 영어 버전 HTML 저장
        fs.writeFileSync(path.join(enDistDir, 'index.html'), enHtmlContent);
      }
      
      // 영어 버전 데이터 폴더 복사
      const enDataDir = path.join(enSourceDir, 'data');
      if (fs.existsSync(enDataDir)) {
        copyDir(enDataDir, path.join(enDistDir, 'data'));
      }
      
      // 영어 버전 assets 폴더 복사
      copyDir(path.join(config.sourceDir, 'assets'), path.join(enDistDir, 'assets'));
      copyDir(path.join(config.sourceDir, 'css'), path.join(enDistDir, 'css'));
      copyDir(path.join(config.sourceDir, 'js'), path.join(enDistDir, 'js'));
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
      const enProgramDataPath = path.join(enDistDir, 'data', 'program-schedule.json');
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
