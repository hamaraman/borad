import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return toast.error("아이디와 비밀번호를 입력해주세요.");
    
    setIsLoading(true);
    try {
      // Mocking API request to Spring Boot
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      
      if (!res.ok) {
        // Fallback for demo purposes if backend isn't ready
        if (res.status === 404) {
           toast.success("테스트 모드로 로그인합니다.");
           login("fake-jwt-token", { id: 1, username });
           return;
        }
        const err = await res.json().catch(() => ({ message: "로그인 실패" }));
        throw new Error(err.message || "로그인에 실패했습니다.");
      }
      
      const data = await res.json();
      login(data.token, data.user);
      toast.success("환영합니다!");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f7f5f0] p-4 font-sans">
      <div className="w-full max-w-sm bg-white p-8 rounded-lg shadow-sm border border-[#e5e0d8] flex flex-col gap-6">
        <div className="text-center">
          <img 
            src="/logo.jpg" 
            alt="Logo" 
            className="w-16 h-16 mx-auto mb-4 rounded-md cursor-pointer hover:opacity-80 transition-opacity" 
            onClick={() => setLocation("/")}
          />
          <h1 className="text-2xl font-bold text-[#2d2926]">오늘할일.</h1>
          <p className="text-sm text-[#7a756d] mt-2">다시 오신 것을 환영합니다</p>
        </div>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm font-medium text-[#5c5851]">
            아이디
            <Input 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              placeholder="아이디를 입력하세요" 
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-[#5c5851]">
            비밀번호
            <Input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="비밀번호를 입력하세요" 
            />
          </label>
          
          <Button type="submit" className="w-full mt-2" disabled={isLoading}>
            {isLoading ? "로그인 중..." : "로그인"}
          </Button>
          
          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-[#e5e0d8]"></div>
            <span className="flex-shrink-0 mx-4 text-[#7a756d] text-xs">또는</span>
            <div className="flex-grow border-t border-[#e5e0d8]"></div>
          </div>

          <Button 
            type="button" 
            variant="outline"
            className="w-full"
            onClick={() => {
               toast.success("테스트 계정으로 접속합니다.");
               login("test-token", { id: 999, username: "테스트계정" });
            }}
          >
            테스트 계정으로 체험하기
          </Button>
        </form>
        
        <div className="text-center text-sm text-[#7a756d]">
          계정이 없으신가요?{" "}
          <button 
            type="button" 
            onClick={() => setLocation("/register")} 
            className="text-[#d96c4a] font-medium hover:underline"
          >
            회원가입
          </button>
        </div>
      </div>
    </div>
  );
}
