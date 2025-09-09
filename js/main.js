// DOM이 로드된 후 실행
document.addEventListener('DOMContentLoaded', function() {
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
});
