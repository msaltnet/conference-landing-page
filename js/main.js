// 전역 변수
let eventInfo = null;
let countdownInterval = null;

// DOM이 로드된 후 실행
document.addEventListener('DOMContentLoaded', function() {
    
    // 행사 정보 로드
    loadEventInfo();
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
    
    // 프로그램 데이터
    const programData = [
        {
            time: '09:00 - 09:30',
            title: '등록 및 네트워킹',
            speaker: '전체',
            description: '참가자 등록 및 네트워킹 시간입니다.'
        },
        {
            time: '09:30 - 10:30',
            title: '키노트: 미래 기술의 방향',
            speaker: '김기술',
            description: 'AI, 블록체인, IoT 등 미래 기술의 발전 방향과 우리의 준비에 대해 이야기합니다.'
        },
        {
            time: '10:45 - 11:45',
            title: '세션 1: AI와 머신러닝',
            speaker: '이인공지능',
            description: '최신 AI 기술과 머신러닝의 실제 적용 사례를 살펴봅니다.'
        },
        {
            time: '11:45 - 12:45',
            title: '세션 2: 클라우드 컴퓨팅',
            speaker: '박클라우드',
            description: '클라우드 기술의 현재와 미래, 그리고 기업의 클라우드 전환 전략을 다룹니다.'
        },
        {
            time: '12:45 - 14:00',
            title: '점심 및 네트워킹',
            speaker: '전체',
            description: '점심 식사와 함께 네트워킹 시간을 가집니다.'
        },
        {
            time: '14:00 - 15:00',
            title: '세션 3: 웹 개발 트렌드',
            speaker: '최웹개발',
            description: '최신 웹 개발 기술과 프레임워크에 대해 알아봅니다.'
        },
        {
            time: '15:15 - 16:15',
            title: '세션 4: 데이터 사이언스',
            speaker: '정데이터',
            description: '빅데이터 분석과 데이터 사이언스의 실무 적용 사례를 공유합니다.'
        },
        {
            time: '16:30 - 17:30',
            title: '패널 토론: 기술의 미래',
            speaker: '패널',
            description: '전문가들과 함께 기술의 미래에 대해 토론합니다.'
        },
        {
            time: '17:30 - 18:00',
            title: '마무리 및 네트워킹',
            speaker: '전체',
            description: '컨퍼런스를 마무리하고 마지막 네트워킹 시간을 가집니다.'
        }
    ];
    
    // 프로그램 일정 생성
    const programSchedule = document.querySelector('.program-schedule');
    if (programSchedule) {
        programData.forEach((program, index) => {
            const programItem = document.createElement('div');
            programItem.className = 'program-item';
            programItem.innerHTML = `
                <div class="program-time">${program.time}</div>
                <div class="program-info">
                    <h3 class="program-title">${program.title}</h3>
                    <p class="program-speaker">발표자: ${program.speaker}</p>
                </div>
            `;
            
            // 클릭 이벤트 추가
            programItem.addEventListener('click', function() {
                openModal(program);
            });
            
            programSchedule.appendChild(programItem);
        });
    }
    
    // 모달 열기 함수
    function openModal(program) {
        const modal = document.getElementById('modal');
        const modalBody = document.querySelector('.modal-body');
        
        if (modal && modalBody) {
            modalBody.innerHTML = `
                <h2>${program.title}</h2>
                <div class="modal-time">${program.time}</div>
                <div class="modal-speaker">발표자: ${program.speaker}</div>
                <div class="modal-description">${program.description}</div>
            `;
            
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden'; // 스크롤 방지
        }
    }
    
    // 모달 닫기 함수
    function closeModal() {
        const modal = document.getElementById('modal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto'; // 스크롤 복원
        }
    }
    
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
    const countdownSection = document.querySelector('.countdown-section');
    if (countdownSection) {
        countdownSection.style.opacity = '0';
        countdownSection.style.transform = 'translateY(30px)';
        countdownSection.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        observer.observe(countdownSection);
    }
    
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
});

// 행사 정보 로드 함수
async function loadEventInfo() {
    try {
        const response = await fetch('data/event-info.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        eventInfo = await response.json();
        
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
    
    countdownTimer.innerHTML = `
        <div class="countdown-complete">
            <h3>🎉 행사가 시작되었습니다! 🎉</h3>
            <p>지금 바로 참여해보세요!</p>
        </div>
    `;
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
