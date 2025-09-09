# Conference Landing Page

플립클락 스타일의 카운트다운 타이머가 포함된 컨퍼런스 랜딩 페이지입니다.

## ✨ 주요 기능

- 🕐 **플립클락 스타일 카운트다운 타이머** - 시:분:초 형태의 아름다운 애니메이션
- 📱 **완전 반응형 디자인** - 모바일, 태블릿, 데스크톱 모든 화면 지원
- 🎨 **현대적인 UI/UX** - 그라데이션과 3D 효과가 적용된 세련된 디자인
- ⚡ **빌드 시스템** - npm 기반의 개발/프로덕션 빌드 환경
- 📊 **JSON 기반 데이터 관리** - 행사 정보를 쉽게 수정하고 관리
- 🔍 **데이터 검증 시스템** - 잘못된 데이터 입력 시 빌드 실패로 오류 방지
- 🚀 **최적화된 성능** - 프로덕션 빌드 시 자동 최적화
- 🖼️ **히어로 배경 이미지** - 커스텀 배경 이미지로 히어로 섹션 꾸미기

## 🛠️ 기술 스택

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Build Tools**: Node.js, npm
- **Optimization**: Terser, CleanCSS, HTML Minifier
- **Development**: Live Server

## 📦 설치 및 실행

### 1. 의존성 설치
```bash
npm install
```

### 2. 개발 서버 실행
```bash
npm run dev
# 또는
npm start
```
개발 서버가 http://localhost:3000 에서 실행됩니다.

### 3. 프로덕션 빌드
```bash
# 개발용 빌드 (JSON 파일 유지)
npm run build

# 프로덕션 빌드 (최적화 적용)
npm run build:prod
```

### 4. 데이터 검증
```bash
# 프로그램 데이터 검증
npm run validate
```

### 5. 빌드 결과 미리보기
```bash
npm run preview
```

## 📁 프로젝트 구조

```
conference-landing-page/
├── data/
│   └── event-info.json          # 행사 정보 설정 파일
├── css/
│   └── style.css               # 스타일시트 (플립클락 포함)
├── js/
│   └── main.js                 # 메인 JavaScript 로직
├── assets/                     # 이미지, 아이콘 등 정적 파일
├── dist/                       # 빌드 출력 디렉토리
├── build.js                    # 빌드 스크립트
├── package.json                # 프로젝트 설정
└── index.html                  # 메인 HTML 파일
```

## ⚙️ 행사 정보 설정

`data/event-info.json` 파일을 수정하여 행사 정보를 변경할 수 있습니다:

```json
{
  "eventName": "Conference 2024",
  "eventSubtitle": "미래를 위한 기술과 혁신의 만남",
  "eventDate": "2024-12-15",
  "eventTime": "09:00",
  "eventEndTime": "18:00",
  "eventLocation": "서울 코엑스 컨벤션센터",
  "eventDescription": "Conference 2024는 업계 최고의 전문가들과 함께하는 기술 컨퍼런스입니다.",
  "registrationUrl": "#",
  "countdownTarget": "2024-12-15T09:00:00+09:00"
}
```

### 설정 항목 설명

- `eventName`: 행사명
- `eventSubtitle`: 행사 부제목
- `eventDate`: 행사 날짜 (YYYY-MM-DD 형식)
- `eventTime`: 행사 시작 시간 (HH:MM 형식)
- `eventEndTime`: 행사 종료 시간 (HH:MM 형식)
- `eventLocation`: 행사 장소
- `eventDescription`: 행사 설명
- `registrationUrl`: 등록 링크
- `countdownTarget`: 카운트다운 목표 시간 (ISO 8601 형식)

### 프로그램 데이터 (`data/program-schedule.json`)
프로그램 일정 정보를 관리합니다:

```json
{
  "programs": [
    {
      "id": 1,
      "date": "2025-12-15",
      "time": "09:00-09:30",
      "location": "201호",
      "title": "프로그램 제목",
      "content": "프로그램 상세 내용",
      "speaker": "발표자명",
      "affiliation": "소속",
      "category": "분류"
    }
  ],
  "locations": ["201호", "202호", "203호", "로비"],
  "categories": [
    {
      "name": "키노트",
      "color": "#e74c3c",
      "backgroundColor": "#fdf2f2",
      "borderColor": "#fecaca"
    },
    {
      "name": "기술세션",
      "color": "#3498db",
      "backgroundColor": "#f0f9ff",
      "borderColor": "#bfdbfe"
    }
  ]
}
```

**중요**: 
- `locations`와 `categories` 배열에 정의된 값만 사용할 수 있습니다. 잘못된 값이 있으면 빌드가 실패합니다.
- `categories`는 문자열 배열 또는 색상 정보가 포함된 객체 배열로 정의할 수 있습니다.
- 색상은 HEX 형식(`#RRGGBB` 또는 `#RGB`)으로 지정해야 합니다.

## 🔍 데이터 검증 시스템

프로젝트에는 강력한 데이터 검증 시스템이 내장되어 있습니다:

### 검증 항목
- **장소 검증**: 모든 프로그램의 `location`이 `locations` 배열에 정의된 값과 일치해야 함
- **분류 검증**: 모든 프로그램의 `category`가 `categories` 배열에 정의된 값과 일치해야 함
- **색상 검증**: 분류 색상이 HEX 형식(`#RRGGBB` 또는 `#RGB`)이어야 함
- **날짜 형식**: `YYYY-MM-DD` 형식이어야 함
- **시간 형식**: `HH:MM-HH:MM` 형식이어야 함
- **필수 필드**: 모든 필수 필드가 존재해야 함

## 🎨 분류별 색상 시스템

프로그램 분류에 따라 시각적으로 구분할 수 있는 색상 시스템을 제공합니다:

### 색상 설정
각 분류는 다음과 같은 색상 정보를 가질 수 있습니다:
- `color`: 텍스트 색상
- `backgroundColor`: 배경 색상 (투명도 포함)
- `borderColor`: 테두리 색상

### 기본 색상 팔레트
- **키노트**: 빨간색 계열 (`#e74c3c`)
- **기술세션**: 파란색 계열 (`#3498db`)
- **토론**: 보라색 계열 (`#9b59b6`)
- **네트워킹**: 초록색 계열 (`#27ae60`)
- **등록**: 주황색 계열 (`#f39c12`)
- **마무리**: 회색 계열 (`#95a5a6`)

### 색상 적용 위치
- 테이블의 분류 배지
- 모달의 분류 표시
- 호버 효과 및 애니메이션

### 검증 실행
```bash
# 데이터 검증만 실행
npm run validate

# 빌드 시 자동 검증 (기본)
npm run build
```

### 검증 실패 시
검증에 실패하면 빌드가 중단되고 상세한 오류 메시지가 표시됩니다:

```
❌ 프로그램 데이터 검증 실패:
  - 프로그램 1: '999호'은 유효하지 않은 장소입니다. 유효한 장소: 201호, 202호, 203호, 로비
  - 프로그램 1: '잘못된분류'은 유효하지 않은 분류입니다. 유효한 분류: 키노트, 기술세션, 토론, 네트워킹, 등록, 마무리

💡 해결 방법:
  1. data/program-schedule.json 파일의 locations와 categories 배열을 확인하세요.
  2. 모든 프로그램의 location과 category가 정의된 값과 일치하는지 확인하세요.
  3. 날짜와 시간 형식이 올바른지 확인하세요. (YYYY-MM-DD, HH:MM-HH:MM)
```

## 🚀 배포

### 1. 프로덕션 빌드
```bash
npm run build:prod
```

### 2. 배포
`dist/` 폴더의 내용을 웹 서버에 업로드하면 됩니다.

## 🎨 커스터마이징

### 색상 변경
`css/style.css` 파일에서 CSS 변수를 수정하여 색상을 변경할 수 있습니다:

```css
:root {
  --primary-color: #2c3e50;
  --secondary-color: #34495e;
  --accent-color: #3498db;
}
```

### 애니메이션 조정
CSS 애니메이션의 지속 시간과 효과를 `css/style.css`에서 조정할 수 있습니다.

### 히어로 배경 이미지 설정
`data/event-info.json` 파일에서 히어로 섹션의 배경 이미지를 설정할 수 있습니다:

```json
{
  "heroBackgroundImage": "assets/images/hero-bg.svg"
}
```

#### 제공되는 샘플 이미지들:
- `hero-bg.svg` - 기본 그라데이션 배경
- `hero-bg-tech.svg` - 기술/IT 테마 (회로판 스타일)
- `hero-bg-modern.svg` - 모던한 기하학적 패턴
- `hero-bg-minimal.svg` - 미니멀한 디자인

#### 사용법:
1. 원하는 이미지를 `assets/images/` 폴더에 추가
2. `data/event-info.json`에서 `heroBackgroundImage` 필드 수정
3. `npm run build` 실행

배경 이미지가 없으면 기본 그라데이션 배경이 표시됩니다.

## 📱 반응형 지원

- **데스크톱**: 1200px 이상
- **태블릿**: 768px - 1199px
- **모바일**: 767px 이하

## 🔧 개발 명령어

```bash
# 개발 서버 시작
npm run dev

# 개발용 빌드
npm run build

# 프로덕션 빌드
npm run build:prod

# 데이터 검증
npm run validate

# 빌드 결과 미리보기
npm run preview

# 빌드 파일 정리
npm run clean
```

## 📄 라이선스

MIT License

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 문의

프로젝트에 대한 문의사항이 있으시면 이슈를 생성해 주세요.