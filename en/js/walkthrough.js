// 실습 소개 페이지 전용 JavaScript (영어 버전)
let walkthroughData = null;

// DOM이 로드된 후 실행
document.addEventListener('DOMContentLoaded', function() {
    // 실습 데이터 로드
    loadWalkthroughData();
    
    // 빌드 정보 로드
    loadBuildInfo();
    
    // 언어 선택 버튼 이벤트 리스너
    setupLanguageSwitcher();
});

// 실습 데이터 로드 함수
async function loadWalkthroughData() {
    try {
        let fileName;
        const isEnPath = window.location.pathname.includes('/en/');
        
        if (currentLanguage === 'en' || isEnPath) {
            // 영어 버전일 때는 -en.json 파일 사용
            fileName = isEnPath ? '../data/walkthrough-info-en.json' : '../data/walkthrough-info-en.json';
        } else {
            // 한국어 버전일 때는 기본 파일 사용
            fileName = '../data/walkthrough-info.json';
        }
        
        console.log('실습 데이터 로드 시도:', fileName, '언어:', currentLanguage, 'isEnPath:', isEnPath);
        const response = await fetch(fileName);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        walkthroughData = await response.json();
        console.log('실습 데이터 로드 성공:', walkthroughData.walkthroughs.length, '개 실습');
        
        // 실습 카드 생성
        createWalkthroughCards();
    } catch (error) {
        console.error('실습 데이터 로드 실패:', error);
        // 기본값으로 설정
        walkthroughData = {
            title: "Hands-on Labs",
            subtitle: "Experience hands-on learning in various technology fields",
            description: "Experience and learn real technologies through various hands-on programs provided at the conference.",
            walkthroughs: []
        };
    }
}

// 실습 카드 생성 함수
function createWalkthroughCards() {
    if (!walkthroughData || !walkthroughData.walkthroughs) {
        return;
    }
    
    const walkthroughGrid = document.querySelector('.walkthrough-grid');
    if (!walkthroughGrid) {
        return;
    }
    
    // 기존 내용 초기화
    walkthroughGrid.innerHTML = '';
    
    // 각 실습에 대해 카드 생성
    walkthroughData.walkthroughs.forEach(walkthrough => {
        const card = createWalkthroughCard(walkthrough);
        walkthroughGrid.appendChild(card);
    });
}

// 개별 실습 카드 생성 함수
function createWalkthroughCard(walkthrough) {
    const card = document.createElement('div');
    card.className = 'walkthrough-card';
    
    // 썸네일 이미지 생성 (카테고리별로 다른 이미지)
    const thumbnailImage = getThumbnailImage(walkthrough.category);
    
    card.innerHTML = `
        <div class="walkthrough-card-thumbnail">
            ${thumbnailImage}
        </div>
        <div class="walkthrough-card-content">
            <h3 class="walkthrough-card-title">${walkthrough.title}</h3>
            <p class="walkthrough-card-description">${walkthrough.description}</p>
        </div>
        <a href="${walkthrough.link}" class="walkthrough-go-button" target="_blank" rel="noopener noreferrer">
            ${currentLanguage === 'en' ? 'Start' : 'Start'}
        </a>
    `;
    
    return card;
}

// 카테고리별 썸네일 이미지 반환 함수
function getThumbnailImage(category) {
    const imageMap = {
        '웹 개발': '<img src="../assets/images/sections/web-dev-thumb.svg" alt="웹 개발" style="width: 100%; height: 100%; object-fit: cover;">',
        'Web Development': '<img src="../assets/images/sections/web-dev-thumb.svg" alt="Web Development" style="width: 100%; height: 100%; object-fit: cover;">',
        'AI/ML': '<img src="../assets/images/sections/ml-thumb.svg" alt="AI/ML" style="width: 100%; height: 100%; object-fit: cover;">',
        'Machine Learning': '<img src="../assets/images/sections/ml-thumb.svg" alt="Machine Learning" style="width: 100%; height: 100%; object-fit: cover;">',
        '클라우드': '<img src="../assets/images/sections/cloud-thumb.svg" alt="클라우드" style="width: 100%; height: 100%; object-fit: cover;">',
        'Cloud': '<img src="../assets/images/sections/cloud-thumb.svg" alt="Cloud" style="width: 100%; height: 100%; object-fit: cover;">',
        '데이터 분석': '<img src="../assets/images/sections/data-thumb.svg" alt="데이터 분석" style="width: 100%; height: 100%; object-fit: cover;">',
        'Data Analysis': '<img src="../assets/images/sections/data-thumb.svg" alt="Data Analysis" style="width: 100%; height: 100%; object-fit: cover;">'
    };
    
    return imageMap[category] || '<img src="../assets/images/sections/default-thumb.svg" alt="Default" style="width: 100%; height: 100%; object-fit: cover;">';
}

// 언어 전환 함수 (메인 페이지의 함수를 오버라이드)
function switchLanguage(lang) {
    if (lang === currentLanguage) return;
    
    currentLanguage = lang;
    
    // URL 업데이트
    const currentPath = window.location.pathname;
    const baseUrl = window.location.origin;
    
    if (lang === 'en') {
        if (!currentPath.includes('/en/')) {
            let newPath;
            if (currentPath.includes('/walk-through.html')) {
                newPath = '/en/walk-through.html';
            } else {
                newPath = '/en/walk-through.html';
            }
            console.log('영어로 전환:', { currentPath, newPath, baseUrl });
            window.location.href = baseUrl + newPath;
            return;
        }
    } else {
        if (currentPath.includes('/en/')) {
            let newPath;
            if (currentPath.includes('/en/walk-through.html')) {
                newPath = '/walk-through.html';
            } else {
                newPath = '/walk-through.html';
            }
            console.log('한국어로 전환:', { currentPath, newPath, baseUrl });
            window.location.href = baseUrl + newPath;
            return;
        }
    }
    
    // HTML 속성 업데이트
    document.documentElement.lang = currentLanguage;
    document.documentElement.setAttribute('data-lang', currentLanguage);
    
    // 언어 선택 버튼 상태 업데이트
    updateLanguageButtons();
    
    // 페이지 텍스트 업데이트
    updatePageTexts();
    
    // 데이터 다시 로드
    loadWalkthroughData();
}

// 빌드 정보 로드 함수 (메인 페이지와 동일)
async function loadBuildInfo() {
    try {
        const isEnPath = window.location.pathname.includes('/en/');
        let buildInfoPath = isEnPath ? '../build-info.json' : 'build-info.json';
        
        console.log('빌드 정보 로드 시도:', buildInfoPath, 'isEnPath:', isEnPath);
        const response = await fetch(buildInfoPath);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const buildInfo = await response.json();
        console.log('빌드 정보 로드 성공:', buildInfo);
        
        displayBuildInfo(buildInfo);
    } catch (error) {
        console.warn('빌드 정보 로드 실패:', error);
        displayBuildInfo({
            version: '1.0.0',
            buildTime: new Date().toISOString()
        });
    }
}

// 빌드 정보 표시 함수 (메인 페이지와 동일)
function displayBuildInfo(buildInfo) {
    const versionElement = document.getElementById('build-version');
    const timeElement = document.getElementById('build-time');
    
    if (versionElement && buildInfo.version) {
        versionElement.textContent = buildInfo.version;
    }
    
    if (timeElement && buildInfo.buildTime) {
        const buildDate = new Date(buildInfo.buildTime);
        const locale = currentLanguage === 'en' ? 'en-US' : 'ko-KR';
        const formattedDate = buildDate.toLocaleDateString(locale, {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
        timeElement.textContent = formattedDate;
    }
}
