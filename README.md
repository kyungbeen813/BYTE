# BYTE

React + TypeScript + Vite 기반 학교생활기록부(NEIS) 작성 보조 도구. 학생 기록은 브라우저(IndexedDB)에만 저장되고, AI 기능은 브라우저 안에서 직접 실행되는 온디바이스 모델(WebGPU, `@mlc-ai/web-llm`)로 동작해 외부 서버로 데이터가 전송되지 않습니다.

## 개발 시작하기

```bash
npm install
npm run dev
```

## 빌드

```bash
npm run build
```

## 환경 변수

`.env.example`을 참고해 `.env` 파일에 Supabase 프로젝트 정보를 설정하세요 (로그인/구독 정보 저장용, 학생 기록과는 무관).
