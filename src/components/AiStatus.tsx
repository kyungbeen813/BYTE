import { useEffect, useState } from "react";
import { isModelCached, isWebGPUSupported, ON_DEVICE_MODELS } from "../lib/webllm";
import type { AppSettings } from "../types";

export default function AiStatus({ settings }: { settings: AppSettings }) {
  const [supported, setSupported] = useState<boolean | null>(null);
  const [cached, setCached] = useState<boolean | null>(null);

  useEffect(() => {
    let active = true;
    isWebGPUSupported().then((ok) => {
      if (active) setSupported(ok);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    setCached(null);
    isModelCached(settings.onDeviceModel).then((ok) => {
      if (active) setCached(ok);
    });
    return () => {
      active = false;
    };
  }, [settings.onDeviceModel]);

  const modelLabel = ON_DEVICE_MODELS.find((m) => m.id === settings.onDeviceModel)?.label;

  let text: string;
  let on: boolean;
  if (supported === null) {
    text = "브라우저 지원 확인 중...";
    on = false;
  } else if (!supported) {
    text = "WebGPU 미지원 브라우저 (Chrome/Edge 최신 버전 필요)";
    on = false;
  } else if (!settings.onDeviceModel) {
    text = "AI 모델 미선택";
    on = false;
  } else {
    text = cached
      ? `온디바이스 AI 준비됨${modelLabel ? ` (${modelLabel})` : ""}`
      : `온디바이스 AI 사용 가능 (최초 사용 시 모델 다운로드)`;
    on = true;
  }

  return (
    <div className="ondevice-status">
      <span className={`dot ${on ? "on" : "off"}`} />
      {text}
    </div>
  );
}
