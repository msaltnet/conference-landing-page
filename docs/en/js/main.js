// 전역 변수
let eventInfo = null;
let countdownInterval = null;
let programData = null;
let currentLanguage = 'ko'; // 기본 언어는 한국어

// DOM이 로드된 후 실행
document.addEventListener('DOMContentLoaded', function() {
    
    // 언어 감지 및 초기화
    initializeLanguage();
    
    // 행사 정보 로드
    loadEventInfo();
    // 프로그램 데이터 로드
    loadProgramData();
    // 빌드 정보 로드
    loadBuildInfo();
    // 모바일 네비게이션 토글
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }
    
    // 부드러운 스크롤링
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 70; // 네비게이션 높이만큼 빼기
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
            
            // 모바일에서 메뉴 닫기
            if (navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                hamburger.classList.remove('active');
            }
        });
    });
    
    // 프로그램 일정 생성 (JSON 데이터 로드 후 실행)
    createProgramSchedule();
    
    // 언어 선택 버튼 이벤트 리스너
    setupLanguageSwitcher();
});

// 언어 초기화 함수
function initializeLanguage() {
    // URL에서 언어 감지
    const path = window.location.pathname;
    if (path.startsWith('/en')) {
        currentLanguage = 'en';
    } else {
        currentLanguage = 'ko';
    }
    
    // HTML lang 속성 업데이트
    document.documentElement.lang = currentLanguage;
    document.documentElement.setAttribute('data-lang', currentLanguage);
    
    // 언어 선택 버튼 상태 업데이트
    updateLanguageButtons();
    
    // 페이지 텍스트 업데이트
    updatePageTexts();
}

// 언어 선택 버튼 설정
function setupLanguageSwitcher() {
    const langButtons = document.querySelectorAll('.lang-btn');
    
    langButtons.forEach(button => {
        button.addEventListener('click', function() {
            const selectedLang = this.getAttribute('data-lang');
            switchLanguage(selectedLang);
        });
    });
}

// 언어 전환 함수
function switchLanguage(lang) {
    if (lang === currentLanguage) return;
    
    currentLanguage = lang;
    
    // URL 업데이트
    const currentPath = window.location.pathname;
    if (lang === 'en') {
        if (!currentPath.startsWith('/en')) {
            window.history.pushState({}, '', '/en');
        }
    } else {
        if (currentPath.startsWith('/en')) {
            window.history.pushState({}, '', '/');
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
    loadEventInfo();
    loadProgramData();
}

// 언어 선택 버튼 상태 업데이트
function updateLanguageButtons() {
    const langButtons = document.querySelectorAll('.lang-btn');
    
    langButtons.forEach(button => {
        const buttonLang = button.getAttribute('data-lang');
        if (buttonLang === currentLanguage) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });
}

// 페이지 텍스트 업데이트
function updatePageTexts() {
    const elements = document.querySelectorAll('[data-ko][data-en]');
    
    elements.forEach(element => {
        const text = element.getAttribute(`data-${currentLanguage}`);
        if (text) {
            element.textContent = text;
        }
    });
}

// 모달 열기 함수 (전역으로 이동)
function openModal(program, categoryInfo = null) {
    const modal = document.getElementById('modal');
    const modalBody = document.querySelector('.modal-body');
    
    if (modal && modalBody) {
        // 분류 색상 정보 가져오기
        if (!categoryInfo && programData && programData.categories) {
            categoryInfo = getCategoryInfo(program.category, programData.categories);
        }
        
        // 기본 색상 설정
        const defaultCategoryInfo = {
            color: '#3498db',
            backgroundColor: 'rgba(52, 152, 219, 0.1)',
            borderColor: 'rgba(52, 152, 219, 0.2)'
        };
        
        const finalCategoryInfo = categoryInfo || defaultCategoryInfo;
        
        const locationLabel = currentLanguage === 'en' ? 'Location' : '장소';
        const speakerLabel = currentLanguage === 'en' ? 'Speaker' : '발표자';
        
        modalBody.innerHTML = `
            <h2>${program.title}</h2>
            <div class="modal-time">${program.time}</div>
            <div class="modal-location">${locationLabel}: ${program.location}</div>
            <div class="modal-speaker">${speakerLabel}: ${program.speaker} (${program.affiliation})</div>
            <div class="modal-category" style="
                --category-color: ${finalCategoryInfo.color};
                --category-color-hover: ${finalCategoryInfo.color.replace('#', '#')};
            ">${program.category}</div>
            <div class="modal-description">${program.content}</div>
        `;
        
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden'; // 스크롤 방지
    }
}

// 모달 닫기 함수 (전역으로 이동)
function closeModal() {
    const modal = document.getElementById('modal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto'; // 스크롤 복원
    }
}
    
// 모달 이벤트 리스너 설정
document.addEventListener('DOMContentLoaded', function() {
    // 모달 닫기 이벤트
    const closeBtn = document.querySelector('.close');
    const modal = document.getElementById('modal');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }
    
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeModal();
            }
        });
    }
    
    // ESC 키로 모달 닫기
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
});

// 스크롤 시 네비게이션 스타일 변경
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        if (window.scrollY > 50) {
            navbar.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
            navbar.style.backdropFilter = 'blur(10px)';
        } else {
            navbar.style.backgroundColor = '#fff';
            navbar.style.backdropFilter = 'none';
        }
    }
});

// 스크롤 애니메이션
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// 카운트다운 섹션 애니메이션
document.addEventListener('DOMContentLoaded', function() {
    const countdownSection = document.querySelector('.countdown-section');
    if (countdownSection) {
        countdownSection.style.opacity = '0';
        countdownSection.style.transform = 'translateY(30px)';
        countdownSection.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        observer.observe(countdownSection);
    }
});

// 창 크기 변경 시 카드 너비 재조정
window.addEventListener('resize', function() {
    if (eventInfo && eventInfo.countdownTarget) {
        const targetDate = new Date(eventInfo.countdownTarget).getTime();
        const now = new Date().getTime();
        const distance = targetDate - now;
        
        if (distance > 0) {
            const totalHours = Math.floor(distance / (1000 * 60 * 60));
            const hoursElement = document.querySelector('[data-unit="hours"]');
            if (hoursElement) {
                adjustCardWidth(hoursElement, totalHours);
            }
        }
    }
});

// 프로그램 데이터 로드 함수
async function loadProgramData() {
    try {
        let fileName;
        if (currentLanguage === 'en') {
            // 영어 버전일 때는 -en.json 파일 사용
            fileName = 'data/program-schedule-en.json';
        } else {
            // 한국어 버전일 때는 기본 파일 사용
            fileName = 'data/program-schedule.json';
        }
        
        console.log('프로그램 데이터 로드 시도:', fileName, '언어:', currentLanguage);
        const response = await fetch(fileName);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        programData = await response.json();
        console.log('프로그램 데이터 로드 성공:', programData.programs.length, '개 프로그램');
        
        // 프로그램 일정 생성
        createProgramSchedule();
    } catch (error) {
        console.error('프로그램 데이터 로드 실패:', error);
        // 기본값으로 설정
        programData = {
            programs: [],
            locations: [],
            categories: []
        };
    }
}

// 프로그램 일정 생성 함수
function createProgramSchedule() {
    if (!programData || !programData.programs) {
        return;
    }
    
    const programSchedule = document.querySelector('.program-schedule');
    if (!programSchedule) {
        return;
    }
    
    // 기존 내용 초기화
    programSchedule.innerHTML = '';
    
    // 테이블 생성
    const table = createProgramTable(programData.programs, programData.locations, programData.categories);
    programSchedule.appendChild(table);
}

// 프로그램 테이블 생성 함수
function createProgramTable(programs, locations, categories) {
    const table = document.createElement('table');
    table.className = 'program-table';
    
    // 테이블 헤더 생성
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    
    // 시간 열
    const timeHeader = document.createElement('th');
    timeHeader.textContent = currentLanguage === 'en' ? 'Time' : '시간';
    timeHeader.className = 'time-column';
    headerRow.appendChild(timeHeader);
    
    // 장소별 열 생성
    locations.forEach(location => {
        const locationHeader = document.createElement('th');
        locationHeader.textContent = location;
        locationHeader.className = 'location-column';
        headerRow.appendChild(locationHeader);
    });
    
    thead.appendChild(headerRow);
    table.appendChild(thead);
    
    // 시간대별로 그룹화
    const timeSlots = groupProgramsByTime(programs);
    
    // 테이블 바디 생성
    const tbody = document.createElement('tbody');
    
    timeSlots.forEach(timeSlot => {
        const row = document.createElement('tr');
        row.className = 'time-row';
        
        // 시간 셀
        const timeCell = document.createElement('td');
        timeCell.textContent = timeSlot.time;
        timeCell.className = 'time-cell';
        row.appendChild(timeCell);
        
        // 각 장소별 셀 생성
        locations.forEach(location => {
            const cell = document.createElement('td');
            cell.className = 'program-cell';
            
            // 해당 시간대와 장소의 프로그램 찾기
            const program = timeSlot.programs.find(p => p.location === location);
            
            if (program) {
                const programDiv = document.createElement('div');
                programDiv.className = 'program-item-table';
                
                // 분류 색상 정보 가져오기
                const categoryInfo = getCategoryInfo(program.category, categories);
                
                programDiv.innerHTML = `
                    <div class="program-title-table">${program.title}</div>
                    <div class="program-speaker-table">${program.speaker}</div>
                    <div class="program-category-table" style="
                        --category-color: ${categoryInfo.color};
                        --category-bg-color: ${categoryInfo.backgroundColor};
                        --category-border-color: ${categoryInfo.borderColor};
                        --category-bg-color-hover: ${categoryInfo.backgroundColor.replace('0.1', '0.2')};
                    ">${program.category}</div>
                `;
                
                // 클릭 이벤트 추가
                programDiv.addEventListener('click', function() {
                    openModal(program, categoryInfo);
                });
                
                cell.appendChild(programDiv);
            }
            
            row.appendChild(cell);
        });
        
        tbody.appendChild(row);
    });
    
    table.appendChild(tbody);
    return table;
}

// 분류 정보를 가져오는 함수
function getCategoryInfo(categoryName, categories) {
    const category = categories.find(cat => 
        typeof cat === 'string' ? cat === categoryName : cat.name === categoryName
    );
    
    if (typeof category === 'object' && category !== null) {
        return {
            color: category.color || '#3498db',
            backgroundColor: category.backgroundColor || 'rgba(52, 152, 219, 0.1)',
            borderColor: category.borderColor || 'rgba(52, 152, 219, 0.2)'
        };
    }
    
    // 기본값 반환
    return {
        color: '#3498db',
        backgroundColor: 'rgba(52, 152, 219, 0.1)',
        borderColor: 'rgba(52, 152, 219, 0.2)'
    };
}

// 프로그램을 시간대별로 그룹화하는 함수
function groupProgramsByTime(programs) {
    const timeGroups = {};
    
    programs.forEach(program => {
        if (!timeGroups[program.time]) {
            timeGroups[program.time] = {
                time: program.time,
                programs: []
            };
        }
        timeGroups[program.time].programs.push(program);
    });
    
    // 시간순으로 정렬
    return Object.values(timeGroups).sort((a, b) => {
        return a.time.localeCompare(b.time);
    });
}

// 행사 정보 로드 함수
async function loadEventInfo() {
    try {
        let fileName;
        if (currentLanguage === 'en') {
            // 영어 버전일 때는 -en.json 파일 사용
            fileName = 'data/event-info-en.json';
        } else {
            // 한국어 버전일 때는 기본 파일 사용
            fileName = 'data/event-info.json';
        }
        
        console.log('행사 정보 로드 시도:', fileName, '언어:', currentLanguage);
        const response = await fetch(fileName);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        eventInfo = await response.json();
        console.log('행사 정보 로드 성공:', eventInfo.eventName);
        
        // 페이지 정보 업데이트
        updatePageInfo();
        
        // 카운트다운 시작
        startCountdown();
    } catch (error) {
        // 기본값으로 설정
        eventInfo = {
            eventName: "Conference 2024",
            eventSubtitle: "미래를 위한 기술과 혁신의 만남",
            eventDate: "2024-12-15",
            eventTime: "09:00",
            eventEndTime: "18:00",
            registrationUrl: "#",
            registrationButtonImage: "assets/images/register-button.svg",
            registrationButtonAlt: "지금 등록하기",
            countdownTarget: "2024-12-15T09:00:00+09:00"
        };
        updatePageInfo();
        startCountdown();
    }
}

// 페이지 정보 업데이트 함수
function updatePageInfo() {
    if (!eventInfo) return;
    
    // 제목 업데이트
    const heroTitle = document.querySelector('.hero-title');
    const navLogo = document.querySelector('.nav-logo h2');
    if (heroTitle) heroTitle.textContent = eventInfo.eventName;
    if (navLogo) navLogo.textContent = eventInfo.eventName;
    
    // 부제목 업데이트
    const heroSubtitle = document.querySelector('.hero-subtitle');
    if (heroSubtitle) heroSubtitle.textContent = eventInfo.eventSubtitle;
    
    // 날짜 업데이트
    if (eventInfo.eventDate) {
        const eventDate = new Date(eventInfo.eventDate);
        const formattedDate = eventDate.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long'
        });
        
        const dateText = document.querySelector('.date-text');
        if (dateText) {
            dateText.textContent = formattedDate;
        }
    }
    
    // 시간 업데이트
    if (eventInfo.eventTime && eventInfo.eventEndTime) {
        const timeText = document.querySelector('.time-text');
        if (timeText) {
            timeText.textContent = `오전 ${eventInfo.eventTime} - 오후 ${eventInfo.eventEndTime}`;
        }
    }
    
    // 등록 버튼 업데이트
    const registrationButton = document.querySelector('#registration-button');
    const registrationImage = document.querySelector('#registration-image');
    
    if (registrationButton && eventInfo.registrationUrl) {
        registrationButton.href = eventInfo.registrationUrl;
    }
    
    if (registrationImage && eventInfo.registrationButtonImage) {
        registrationImage.src = eventInfo.registrationButtonImage;
    }
    
    if (registrationImage && eventInfo.registrationButtonAlt) {
        registrationImage.alt = eventInfo.registrationButtonAlt;
    }
}

// 카운트다운 시작 함수
function startCountdown() {
    if (!eventInfo || !eventInfo.countdownTarget) {
        return;
    }
    
    // DOM 요소가 준비될 때까지 기다림
    const countdownTimer = document.querySelector('.countdown-timer');
    if (!countdownTimer) {
        setTimeout(startCountdown, 100);
        return;
    }
    const targetDate = new Date(eventInfo.countdownTarget).getTime();
    
    // 유효한 날짜인지 확인
    if (isNaN(targetDate)) {
        return;
    }
    
    // 카운트다운 업데이트 함수
    function updateCountdown() {
        const now = new Date().getTime();
        const distance = targetDate - now;
        
        if (distance < 0) {
            // 카운트다운 완료
            showCountdownComplete();
            clearInterval(countdownInterval);
            return;
        }
        
        // 시간 계산 (일 제외, 총 시간을 시:분:초로 표시)
        const totalHours = Math.floor(distance / (1000 * 60 * 60));
        const hours = totalHours; // 총 시간을 그대로 표시 (24시간 제한 없음)
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
        // 카운트다운 업데이트
        updateCountdownDisplay(hours, minutes, seconds);
        
        // 초기 로드 시 시간 카드 너비 조정
        const hoursElement = document.querySelector('[data-unit="hours"]');
        if (hoursElement) {
            adjustCardWidth(hoursElement, hours);
        }
    }
    
    // 즉시 실행
    updateCountdown();
    
    // 1초마다 업데이트
    countdownInterval = setInterval(updateCountdown, 1000);
}

// 카운트다운 표시 업데이트 함수
function updateCountdownDisplay(hours, minutes, seconds) {
    const countdownTimer = document.querySelector('.countdown-timer');
    if (!countdownTimer) {
        return;
    }
    
    // 각 시간 단위별로 업데이트 (일 제외)
    updateTimeUnit('hours', hours);
    updateTimeUnit('minutes', minutes);
    updateTimeUnit('seconds', seconds);
}

// 개별 시간 단위 업데이트 함수
function updateTimeUnit(unit, value) {
    const unitElement = document.querySelector(`[data-unit="${unit}"]`);
    if (!unitElement) {
        return;
    }
    
    const frontFace = unitElement.querySelector('.flip-card-face.front');
    if (!frontFace) {
        return;
    }
    
    const currentValue = frontFace.textContent;
    const newValue = value.toString().padStart(2, '0');
    
    // 값이 변경된 경우에만 플립 애니메이션 실행
    if (currentValue !== newValue) {
        flipCard(unitElement, newValue);
        
        // 시간 카드의 너비 조정 (시간 단위만)
        if (unit === 'hours') {
            adjustCardWidth(unitElement, value);
        }
    }
}

// 카드 너비 조정 함수
function adjustCardWidth(cardElement, value) {
    const flipClock = cardElement.closest('.flip-clock');
    if (!flipClock) return;
    
    // 화면 크기에 따른 기본 너비 설정
    const isMobile = window.innerWidth <= 480;
    const isTablet = window.innerWidth <= 768;
    
    let baseWidth, digitWidth, minWidth;
    
    if (isMobile) {
        baseWidth = 60;
        digitWidth = 20;
        minWidth = 60;
    } else if (isTablet) {
        baseWidth = 100;
        digitWidth = 30;
        minWidth = 100;
    } else {
        baseWidth = 120;
        digitWidth = 40;
        minWidth = 120;
    }
    
    // 자릿수에 따라 너비 계산
    const digitCount = value.toString().length;
    const newWidth = baseWidth + (digitCount - 2) * digitWidth;
    
    // 최소 너비 보장
    const finalWidth = Math.max(newWidth, minWidth);
    
    flipClock.style.width = `${finalWidth}px`;
}

// 카드 플립 애니메이션 함수
function flipCard(cardElement, newValue) {
    const frontFace = cardElement.querySelector('.flip-card-face.front');
    const backFace = cardElement.querySelector('.flip-card-face.back');
    const flipCardElement = cardElement; // cardElement 자체가 .flip-card입니다
    
    if (!frontFace || !backFace || !flipCardElement) {
        return;
    }
    
    // 새 값을 뒷면에 설정
    backFace.textContent = newValue;
    
    // 플립 애니메이션 시작
    flipCardElement.classList.add('flip-animation');
    
    // 애니메이션 완료 후 값 교체
    setTimeout(() => {
        frontFace.textContent = newValue;
        flipCardElement.classList.remove('flip-animation');
    }, 300);
}

// 카운트다운 완료 표시 함수
function showCountdownComplete() {
    const countdownTimer = document.querySelector('.countdown-timer');
    if (!countdownTimer) return;
    
    const titleText = currentLanguage === 'en' ? '🎉 The event has started! 🎉' : '🎉 행사가 시작되었습니다! 🎉';
    const subtitleText = currentLanguage === 'en' ? 'Join now!' : '지금 바로 참여해보세요!';
    
    countdownTimer.innerHTML = `
        <div class="countdown-complete">
            <h3>${titleText}</h3>
            <p>${subtitleText}</p>
        </div>
    `;
}

// 빌드 정보 로드 함수
async function loadBuildInfo() {
    try {
        // 현재 경로에 따라 build-info.json 경로 결정
        const isEnPath = window.location.pathname.startsWith('/en');
        const buildInfoPath = isEnPath ? 'build-info.json' : 'build-info.json';
        
        console.log('빌드 정보 로드 시도:', buildInfoPath);
        const response = await fetch(buildInfoPath);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const buildInfo = await response.json();
        console.log('빌드 정보 로드 성공:', buildInfo);
        
        // 빌드 정보 표시
        displayBuildInfo(buildInfo);
    } catch (error) {
        console.warn('빌드 정보 로드 실패:', error);
        // 기본값으로 설정
        displayBuildInfo({
            version: '1.0.0',
            buildTime: new Date().toISOString()
        });
    }
}

// 빌드 정보 표시 함수
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

// 카운트다운 HTML 생성 함수
function createCountdownHTML() {
    return `
        <div class="countdown-timer">
            <div class="countdown-item">
                <div class="countdown-label">일</div>
                <div class="flip-clock">
                    <div class="flip-card" data-unit="days">
                        <div class="flip-card-face front">00</div>
                        <div class="flip-card-face back">00</div>
                    </div>
                </div>
            </div>
            <div class="countdown-item">
                <div class="countdown-label">시간</div>
                <div class="flip-clock">
                    <div class="flip-card" data-unit="hours">
                        <div class="flip-card-face front">00</div>
                        <div class="flip-card-face back">00</div>
                    </div>
                </div>
            </div>
            <div class="countdown-item">
                <div class="countdown-label">분</div>
                <div class="flip-clock">
                    <div class="flip-card" data-unit="minutes">
                        <div class="flip-card-face front">00</div>
                        <div class="flip-card-face back">00</div>
                    </div>
                </div>
            </div>
            <div class="countdown-item">
                <div class="countdown-label">초</div>
                <div class="flip-clock">
                    <div class="flip-card" data-unit="seconds">
                        <div class="flip-card-face front">00</div>
                        <div class="flip-card-face back">00</div>
                    </div>
                </div>
            </div>
        </div>
    `;
}
