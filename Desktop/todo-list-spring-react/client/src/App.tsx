/* 오늘할일: 인덱스 레일과 작업 목록을 하나의 집중된 작업공간으로 묶는 전역 셸. */
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "./contexts/ThemeContext";
import ErrorBoundary from "./components/ErrorBoundary";
import Home from "./pages/Home";

export default function App() {
  return <ErrorBoundary><ThemeProvider defaultTheme="light"><TooltipProvider><Toaster position="bottom-right" /><Home /></TooltipProvider></ThemeProvider></ErrorBoundary>;
}
