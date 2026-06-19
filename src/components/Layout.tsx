import { Link, useLocation } from "react-router-dom";
import { ClipboardList, Users, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { to: "/survey", label: "问答", icon: ClipboardList },
  { to: "/matching", label: "组车", icon: Users },
  { to: "/recommendation", label: "推荐", icon: MessageSquare },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[#0f0f1a] text-white flex flex-col">
      <header className="flex items-center justify-between px-6 py-3 border-b border-white/10 shrink-0 bg-[#0f0f1a]/95 backdrop-blur-sm sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#d4a44c]/20 flex items-center justify-center">
            <span className="text-[#d4a44c] text-sm">🔍</span>
          </div>
          <div className="text-xl font-bold tracking-wide text-[#d4a44c]">
            偏好匹配台
          </div>
        </div>
        <nav className="flex gap-1">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => {
            const isActive = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={cn(
                  "relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-[#d4a44c]/15 text-[#d4a44c]"
                    : "text-[#9ca3af] hover:text-white hover:bg-white/5"
                )}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            );
          })}
        </nav>
      </header>
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
