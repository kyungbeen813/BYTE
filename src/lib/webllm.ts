import type { MLCEngine } from "@mlc-ai/web-llm";

// @mlc-ai/web-llm is a multi-megabyte runtime; it is only needed once a user
// actually opens the AI settings or runs a generation, never for the
// marketing/login pages. Loading it lazily keeps those pages light.
function loadWebLLM() {
  return import("@mlc-ai/web-llm");
}

export interface OnDeviceModelInfo {
  id: string;
  label: string;
  sizeLabel: string;
  desc: string;
}

export const ON_DEVICE_MODELS: OnDeviceModelInfo[] = [
  {
    id: "Qwen2.5-1.5B-Instruct-q4f16_1-MLC",
    label: "권장 (한국어 품질 우수)",
    sizeLabel: "약 1.6GB",
    desc: "한국어 문장 생성 품질이 좋고 대부분의 PC(웹GPU 지원 브라우저)에서 무난하게 동작합니다.",
  },
  {
    id: "Qwen2.5-3B-Instruct-q4f16_1-MLC",
    label: "고품질",
    sizeLabel: "약 2.5GB",
    desc: "문장 품질이 더 좋지만 더 많은 그래픽 메모리(4GB 이상 권장)가 필요합니다.",
  },
  {
    id: "Qwen2.5-0.5B-Instruct-q4f16_1-MLC",
    label: "저사양 PC용",
    sizeLabel: "약 950MB",
    desc: "속도가 빠르고 가벼워 저사양 PC에서도 동작하지만 문장 품질은 다소 낮습니다.",
  },
];

export const DEFAULT_MODEL_ID = ON_DEVICE_MODELS[0].id;

export async function isWebGPUSupported(): Promise<boolean> {
  const gpu = (navigator as Navigator & { gpu?: { requestAdapter(): Promise<unknown> } }).gpu;
  if (!gpu) return false;
  try {
    const adapter = await gpu.requestAdapter();
    return adapter != null;
  } catch {
    return false;
  }
}

export async function isModelCached(modelId: string): Promise<boolean> {
  if (!modelId) return false;
  try {
    const { hasModelInCache } = await loadWebLLM();
    return await hasModelInCache(modelId);
  } catch {
    return false;
  }
}

export async function deleteCachedModel(modelId: string): Promise<void> {
  const { deleteModelAllInfoInCache } = await loadWebLLM();
  await deleteModelAllInfoInCache(modelId);
}

export interface LoadProgress {
  text: string;
  progress: number;
}

let engine: MLCEngine | null = null;
let engineModelId: string | null = null;
let loadingPromise: Promise<MLCEngine> | null = null;

async function getEngine(
  modelId: string,
  onProgress?: (p: LoadProgress) => void
): Promise<MLCEngine> {
  if (engine && engineModelId === modelId) return engine;
  if (loadingPromise && engineModelId === modelId) return loadingPromise;

  if (engine && engineModelId !== modelId) {
    const stale = engine;
    engine = null;
    await stale.unload();
  }

  engineModelId = modelId;
  loadingPromise = loadWebLLM()
    .then(({ CreateMLCEngine }) =>
      CreateMLCEngine(modelId, {
        initProgressCallback: (report) => {
          onProgress?.({ text: report.text, progress: report.progress });
        },
      })
    )
    .then((e) => {
      engine = e;
      loadingPromise = null;
      return e;
    })
    .catch((err) => {
      engineModelId = null;
      loadingPromise = null;
      throw err;
    });

  return loadingPromise;
}

export async function preloadModel(
  modelId: string,
  onProgress?: (p: LoadProgress) => void
): Promise<void> {
  await getEngine(modelId, onProgress);
}

export interface GenerateOptions {
  modelId: string;
  system?: string;
  prompt: string;
  onToken?: (chunk: string) => void;
  onProgress?: (p: LoadProgress) => void;
  signal?: AbortSignal;
}

export async function generateOnDevice({
  modelId,
  system,
  prompt,
  onToken,
  onProgress,
  signal,
}: GenerateOptions): Promise<string> {
  if (!modelId) throw new Error("설정에서 사용할 모델을 먼저 선택해 주세요.");

  let eng: MLCEngine;
  try {
    eng = await getEngine(modelId, onProgress);
  } catch {
    throw new Error(
      "온디바이스 모델을 불러오지 못했습니다. 브라우저의 WebGPU 지원 여부와 네트워크 연결(최초 1회 다운로드)을 확인해 주세요."
    );
  }

  const onAbort = () => eng.interruptGenerate();
  signal?.addEventListener("abort", onAbort);

  try {
    const stream = await eng.chat.completions.create({
      messages: system
        ? [
            { role: "system", content: system },
            { role: "user", content: prompt },
          ]
        : [{ role: "user", content: prompt }],
      stream: true,
    });

    let full = "";
    for await (const chunk of stream) {
      if (signal?.aborted) break;
      const delta = chunk.choices[0]?.delta?.content ?? "";
      if (delta) {
        full += delta;
        onToken?.(delta);
      }
    }
    return full;
  } finally {
    signal?.removeEventListener("abort", onAbort);
  }
}
