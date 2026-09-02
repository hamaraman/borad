import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function Landing() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();

  return (
    <div className="min-h-screen bg-[#f7f5f0] text-[#2d2926] font-sans flex flex-col">
      {/* Header */}
      <header className="p-6 flex justify-between items-center max-w-5xl w-full mx-auto">
        <div className="flex items-center gap-3">
          <img src="/logo.jpg" alt="오늘할일" className="w-8 h-8 rounded" />
          <span className="font-bold text-lg tracking-tight">오늘할일.</span>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setLocation("/login")}
            className="text-sm font-medium hover:text-[#d96c4a] transition-colors"
          >
            로그인
          </button>
          <Button 
            onClick={() => setLocation("/register")}
            className="bg-[#2d2926] hover:bg-[#d96c4a] text-white"
          >
            시작하기
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center p-6 max-w-3xl mx-auto -mt-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#e5e0d8] text-sm text-[#7a756d] mb-8 shadow-sm">
          <Sparkles size={14} className="text-[#d96c4a]" />
          <span>단순하고 선명한 기록의 시작</span>
        </div>
        
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6 leading-tight">
          해야 할 일을 <br className="hidden md:block" />
          <em className="not-italic text-[#d96c4a]">한 줄씩 선명하게</em>
        </h1>
        
        <p className="text-lg md:text-xl text-[#7a756d] mb-10 max-w-xl">
          복잡한 툴에 지치셨나요? 종이 질감의 편안한 공간에서 
          오늘 집중해야 할 단 하나의 일에만 몰입하세요.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <Button 
            size="lg" 
            onClick={() => setLocation("/register")}
            className="bg-[#d96c4a] hover:bg-[#c25c3c] text-white rounded-full px-8 h-14 text-lg shadow-sm flex gap-2 items-center"
          >
            무료로 시작하기 <ArrowRight size={20} />
          </Button>
          
          <Button 
            size="lg" 
            variant="outline"
            onClick={() => login("test-token", { id: 999, username: "테스트계정" })}
            className="rounded-full px-8 h-14 text-lg border-[#e5e0d8] text-[#5c5851] hover:bg-[#faf9f7]"
          >
            테스트 계정으로 체험
          </Button>
        </div>

        {/* Feature Teaser */}
        <div className="mt-20 relative w-full aspect-video max-w-4xl bg-white rounded-xl shadow-sm border border-[#e5e0d8] overflow-hidden flex items-center justify-center p-8">
          <div className="absolute inset-0 bg-gradient-to-t from-[#f7f5f0]/50 to-transparent pointer-events-none" />
          <div className="flex flex-col gap-4 w-full max-w-md opacity-80">
            <div className="h-16 border border-[#e5e0d8] rounded bg-[#faf9f7] flex items-center px-4 gap-3">
               <div className="w-5 h-5 rounded-full border-2 border-[#e5e0d8]" />
               <div className="h-4 bg-[#e5e0d8] rounded w-1/2" />
            </div>
            <div className="h-16 border border-[#e5e0d8] rounded bg-[#faf9f7] flex items-center px-4 gap-3">
               <div className="w-5 h-5 rounded-full border-2 border-[#e5e0d8]" />
               <div className="h-4 bg-[#e5e0d8] rounded w-2/3" />
            </div>
            <div className="h-16 border border-[#e5e0d8] rounded bg-[#faf9f7] flex items-center px-4 gap-3">
               <div className="w-5 h-5 rounded-full bg-[#d96c4a] flex items-center justify-center text-white text-xs">✓</div>
               <div className="h-4 bg-[#e5e0d8] rounded w-1/3 opacity-50 line-through" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
