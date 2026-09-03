/* 오늘할일: PWA 설치/오프라인 상태를 앱 안에서 바로 알 수 있게 하는 훅. */
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

const OFFLINE_READY_EVENT = "pwa:offline-ready";

export function usePWA() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(display-mode: standalone)");
    const updateStandalone = () => {
      setIsStandalone(mq.matches || (navigator as Navigator & { standalone?: boolean }).standalone === true);
    };
    updateStandalone();
    mq.addEventListener("change", updateStandalone);

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };

    const onInstalled = () => {
      setInstallPrompt(null);
      setIsStandalone(true);
      toast.success("앱이 설치되었습니다. 홈 화면에서 실행하세요.");
    };

    const onOnline = () => setIsOffline(false);
    const onOffline = () => setIsOffline(true);

    const onOfflineReady = () => {
      toast.success("오프라인에서도 쓸 수 있게 준비되었습니다.");
    };

    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    window.addEventListener(OFFLINE_READY_EVENT, onOfflineReady);

    return () => {
      mq.removeEventListener("change", updateStandalone);
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
      window.removeEventListener(OFFLINE_READY_EVENT, onOfflineReady);
    };
  }, []);

  const install = useCallback(async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice.outcome === "accepted") setInstallPrompt(null);
  }, [installPrompt]);

  return {
    canInstall: Boolean(installPrompt) && !isStandalone,
    isStandalone,
    isOffline,
    install,
  };
}