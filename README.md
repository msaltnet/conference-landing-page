# Conference Landing Page

플립클락 스타일의 카운트다운 타이머가 포함된 컨퍼런스 랜딩 페이지입니다.

## ✨ 주요 기능

- 🕐 **플립클락 스타일 카운트다운 타이머** - 시:분:초 형태의 아름다운 애니메이션
- 📱 **완전 반응형 디자인** - 모바일, 태블릿, 데스크톱 모든 화면 지원
- 🎨 **현대적인 UI/UX** - 그라데이션과 3D 효과가 적용된 세련된 디자인
- ⚡ **빌드 시스템** - npm 기반의 개발/프로덕션 빌드 환경
- 📊 **JSON 기반 데이터 관리** - 행사 정보를 쉽게 수정하고 관리
- 🚀 **최적화된 성능** - 프로덕션 빌드 시 자동 최적화

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

### 4. 빌드 결과 미리보기
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