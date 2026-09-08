import type { RecordType, SchoolType } from "../types";

const RECORD_GUIDE: Record<SchoolType, Record<RecordType, string>> = {
  일반학교: {
    세특:
      "교과 수업 중 관찰된 학생의 지적 호기심, 탐구 과정, 발표·과제·수행평가에서 드러난 역량과 성장을 구체적 사례 중심으로 서술한다.",
    행동특성:
      "학생의 인성, 학습 태도, 교우 관계, 리더십, 책임감 등을 구체적 행동 사례와 함께 종합적으로 서술한다.",
    자율활동:
      "학급 및 학교 자율활동에서 학생이 수행한 역할과 그 과정에서 드러난 태도, 배움, 성장을 서술한다.",
    동아리활동:
      "동아리 활동 중 학생이 보인 관심 분야에 대한 탐구, 협업, 역할 수행과 성장을 서술한다.",
    진로활동:
      "진로 탐색 과정에서 학생이 보인 자기 이해, 진로 탐색 활동, 구체적 계획과 실행을 서술한다.",
  },
  특수학교: {
    세특:
      "교과(또는 교과별 개별화교육계획 목표) 수업 중 관찰된 학생의 과제 수행 수준, 습득한 기능, 필요한 지원 정도와 그 과정에서의 향상을 구체적 사례 중심으로 서술한다.",
    행동특성:
      "학생의 정서·행동 특성, 대인관계, 자기표현, 자립생활 기능, 학습 태도의 변화를 구체적 행동 사례와 함께 종합적으로 서술한다. 장애 특성 자체보다 관찰된 행동과 성장에 초점을 둔다.",
    자율활동:
      "학급 및 학교 자율활동에서 학생이 참여한 정도, 수행한 역할, 필요했던 지원과 그 과정에서 드러난 변화·성장을 서술한다.",
    동아리활동:
      "동아리 활동에서 학생이 보인 관심, 참여도, 또래 및 교사와의 상호작용, 습득한 기능을 서술한다.",
    진로활동:
      "진로 및 직업 탐색 활동에서 학생이 보인 흥미, 수행 기능, 자립·직업 준비 관련 구체적 활동과 성장을 서술한다.",
  },
};

export function buildSystemPrompt(
  schoolType: SchoolType,
  recordType: RecordType,
  charLimit: number
): string {
  return `당신은 대한민국 ${schoolType}에서 나이스(NEIS) 학교생활기록부를 작성하는 교사를 돕는 보조 도구입니다.
다음 작성 규정을 반드시 지키세요.

1. 문장은 명사형 종결어미(~함, ~음, ~됨, ~보임, ~수행함 등)로 개조식으로 끝맺는다. "~습니다", "~해요" 같은 구어체·존칭체를 쓰지 않는다.
2. 학생의 이름이나 "이 학생은" 같은 3인칭 지칭을 문장 앞에 반복해서 쓰지 않는다. 주어는 생략하고 서술어 중심으로 작성한다.
3. 과장되거나 추상적인 미사여구(예: "완벽한", "최고의")를 피하고, 관찰된 구체적 행동과 사례를 근거로 객관적으로 서술한다.
4. 특수문자, 이모지, 느낌표를 사용하지 않는다.
5. ${RECORD_GUIDE[schoolType][recordType]}
6. 전체 분량은 공백 포함 ${charLimit}자를 넘지 않도록 작성한다.
7. 결과는 완성된 기록부 문단 텍스트만 출력하고, 설명이나 안내 문구를 덧붙이지 않는다.`;
}

export function buildDraftPrompt(recordType: RecordType, keywords: string): string {
  return `아래는 교사가 정리한 학생 관찰 메모/키워드입니다. 이를 바탕으로 ${recordType} 기록 초안을 작성해 주세요.

[관찰 메모]
${keywords}`;
}

export function buildPolishPrompt(recordType: RecordType, text: string): string {
  return `아래 ${recordType} 기록 초안의 내용을 유지하면서 나이스 작성 규정에 맞는 문체와 어투로 다듬어 주세요. 새로운 사실을 추가하지 말고 표현만 개선하세요.

[원문]
${text}`;
}

export function buildSummarizePrompt(
  recordType: RecordType,
  text: string,
  charLimit: number
): string {
  return `아래 ${recordType} 기록의 핵심 내용은 유지하되, 공백 포함 ${charLimit}자 이내로 요약/압축해 주세요.

[원문]
${text}`;
}

export function buildDiversifyPrompt(
  recordType: RecordType,
  text: string,
  similarTexts: string[]
): string {
  const others = similarTexts.map((t, i) => `(${i + 1}) ${t}`).join("\n");
  return `아래는 같은 항목(${recordType})에 대해 다른 학생들에게 이미 작성된 문장들입니다. 이 문장들과 표현이 겹치지 않도록, 아래 [대상 학생 원문]의 의미와 사실은 유지하면서 어휘와 문장 구조를 다양화해 다시 작성해 주세요.

[다른 학생 기록 예시]
${others}

[대상 학생 원문]
${text}`;
}
