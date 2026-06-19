import { useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  Copy,
  Check,
  ArrowLeft,
  RotateCcw,
  Users,
  Sparkles,
  ThumbsUp,
  ThumbsDown,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import { useStore } from "@/store/useStore";
import { generateRecommendation } from "@/utils/recommendation";
import { getDirectionalSuggestions } from "@/utils/matching";
import type { ScriptSuggestion } from "@/utils/matching";
import { cn } from "@/lib/utils";
import type { ScriptType } from "@/types";

const TYPE_BADGE_COLORS: Record<ScriptType, string> = {
  本格: "bg-blue-500/25 text-blue-300 border-blue-500/40",
  变格: "bg-purple-500/25 text-purple-300 border-purple-500/40",
  社会派: "bg-emerald-500/25 text-emerald-300 border-emerald-500/40",
  情感: "bg-pink-500/25 text-pink-300 border-pink-500/40",
  机制: "bg-orange-500/25 text-orange-300 border-orange-500/40",
  恐怖: "bg-red-500/25 text-red-300 border-red-500/40",
};

type ViewMode = "player" | "staff";

export default function RecommendationPage() {
  const navigate = useNavigate();
  const { scripts, selectedScriptIds, players, cars, resetAll } = useStore();

  const [viewMode, setViewMode] = useState<ViewMode>("staff");

  const carsWithPlayers = cars.filter((c) => c.playerIds.length > 0);

  const recommendations = useMemo(
    () =>
      carsWithPlayers.map((car) => ({
        car,
        rec: generateRecommendation(car, players, scripts, selectedScriptIds),
        alternatives: getDirectionalSuggestions(car, players, scripts, selectedScriptIds).slice(0, 3),
      })),
    [carsWithPlayers, players, scripts, selectedScriptIds]
  );

  if (carsWithPlayers.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0f0f1a]">
        <div className="text-center">
          <p className="mb-4 text-lg text-gray-400">请先在组车页完成组车</p>
          <Link
            to="/matching"
            className="inline-flex items-center gap-2 rounded-lg bg-[#d4a44c] px-6 py-3 font-medium text-black transition-colors hover:bg-[#c4943c]"
          >
            <ArrowLeft className="h-4 w-4" />
            前往组车
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f1a] px-4 py-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">📋 推荐结果</h1>
          <div className="flex rounded-lg bg-[#1a1f2e] p-1 border border-white/10">
            <button
              onClick={() => setViewMode("player")}
              className={cn(
                "px-4 py-2 rounded-md text-sm font-medium transition-colors",
                viewMode === "player"
                  ? "bg-[#d4a44c] text-black"
                  : "text-[#9ca3af] hover:text-white"
              )}
            >
              玩家版
            </button>
            <button
              onClick={() => setViewMode("staff")}
              className={cn(
                "px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5",
                viewMode === "staff"
                  ? "bg-[#d4a44c] text-black"
                  : "text-[#9ca3af] hover:text-white"
              )}
            >
              <Users className="h-3.5 w-3.5" />
              店员对比版
            </button>
          </div>
        </div>

        {recommendations.map(({ car, rec, alternatives }) => {
          const script = scripts.find((s) => s.id === car.scriptId);
          const carPlayers = players.filter((p) =>
            car.playerIds.includes(p.id)
          );

          if (!script || !rec) return null;

          return viewMode === "player" ? (
            <PlayerRecommendationCard
              key={car.id}
              car={car}
              script={script}
              carPlayers={carPlayers}
              recommendation={rec}
            />
          ) : (
            <StaffComparisonCard
              key={car.id}
              car={car}
              script={script}
              carPlayers={carPlayers}
              recommendation={rec}
              alternatives={alternatives}
            />
          );
        })}

        <div className="flex items-center justify-center gap-4 pt-2 pb-6">
          <Link
            to="/matching"
            className="inline-flex items-center gap-2 rounded-lg border border-[#d4a44c]/40 bg-[#1a1f2e] px-5 py-2.5 text-sm text-[#d4a44c] transition-colors hover:bg-[#d4a44c]/10"
          >
            <ArrowLeft className="h-4 w-4" />
            返回组车
          </Link>
          <Link
            to="/survey"
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-[#1a1f2e] px-5 py-2.5 text-sm text-[#9ca3af] transition-colors hover:bg-white/5"
          >
            <ArrowLeft className="h-4 w-4" />
            返回问答
          </Link>
          <button
            onClick={() => {
              resetAll();
              navigate("/survey");
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-red-600/80 px-5 py-2.5 text-sm text-white transition-colors hover:bg-red-600"
          >
            <RotateCcw className="h-4 w-4" />
            重新开始
          </button>
        </div>
      </div>
    </div>
  );
}

interface PlayerRecProps {
  car: { id: string; scriptId: string; playerIds: string[] };
  script: { id: string; name: string; type: ScriptType };
  carPlayers: { id: string; name: string; tags: string[] }[];
  recommendation: {
    carId: string;
    reasons: string[];
    risks: string[];
    scriptSuggestion: string;
    communicationScript: string;
  };
}

function PlayerRecommendationCard({
  car,
  script,
  carPlayers,
  recommendation: rec,
}: PlayerRecProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(rec.communicationScript).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="rounded-xl bg-[#1a1f2e] p-6 shadow-lg border border-white/5">
      <div className="mb-4 flex items-center gap-3">
        <h2 className="text-xl font-bold text-white">《{script.name}》</h2>
        <span
          className={cn(
            "rounded-full px-3 py-0.5 text-xs font-semibold border",
            TYPE_BADGE_COLORS[script.type]
          )}
        >
          {script.type}
        </span>
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        {carPlayers.map((p) => (
          <div
            key={p.id}
            className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-1.5"
          >
            <span className="text-sm font-medium text-white">{p.name}</span>
            <div className="flex gap-1">
              {p.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="rounded bg-[#d4a44c]/20 px-1.5 py-0.5 text-xs text-[#d4a44c]"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Section
        title="推荐理由"
        icon={<CheckCircle className="h-4 w-4 text-green-400" />}
        borderColor="border-l-green-500"
      >
        <ul className="space-y-2">
          {rec.reasons.map((reason, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
              <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-green-400" />
              {reason}
            </li>
          ))}
        </ul>
      </Section>

      <Section
        title="踩雷警示"
        icon={<AlertTriangle className="h-4 w-4 text-red-400" />}
        borderColor="border-l-red-500"
      >
        {rec.risks.length > 0 ? (
          <ul className="space-y-2">
            {rec.risks.map((risk, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
              {risk}
            </li>
          ))}
          </ul>
        ) : (
          <p className="text-sm text-green-400">暂无明显踩雷点</p>
        )}
      </Section>

      {rec.scriptSuggestion && (
        <Section
          title="换本建议"
          icon={<Lightbulb className="h-4 w-4 text-yellow-400" />}
          borderColor="border-l-yellow-500"
        >
          <p className="text-sm text-gray-300">{rec.scriptSuggestion}</p>
        </Section>
      )}

      <Section
        title="沟通话术"
        icon={<Copy className="h-4 w-4 text-[#d4a44c]" />}
        borderColor="border-l-[#d4a44c]"
      >
        <div className="relative">
          <pre className="whitespace-pre-wrap rounded-lg bg-black/30 p-4 text-sm leading-relaxed text-gray-300">
            {rec.communicationScript}
          </pre>
          <button
            onClick={handleCopy}
            className={cn(
              "absolute right-3 top-3 flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
              copied
                ? "bg-green-600/80 text-white"
                : "bg-[#d4a44c]/20 text-[#d4a44c] hover:bg-[#d4a44c]/30"
            )}
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5" />
                已复制!
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                复制话术
              </>
            )}
          </button>
        </div>
      </Section>
    </div>
  );
}

interface StaffCompProps {
  car: { id: string; scriptId: string; playerIds: string[] };
  script: { id: string; name: string; type: ScriptType; logicLevel: number; emotionLevel: number; horrorLevel: number; mechanicLevel: number; duration: number };
  carPlayers: { id: string; name: string; tags: string[]; experience: string }[];
  recommendation: {
    carId: string;
    reasons: string[];
    risks: string[];
    scriptSuggestion: string;
    communicationScript: string;
  };
  alternatives: ScriptSuggestion[];
}

function StaffComparisonCard({
  car,
  script,
  carPlayers,
  recommendation: rec,
  alternatives,
}: StaffCompProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(rec.communicationScript).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const conflictCount = rec.risks.filter(
    (r) => r.includes("拒绝") || r.includes("差异大")
  ).length;

  const hasSeriousRisk = conflictCount > 0;

  return (
    <div className="rounded-xl bg-[#1a1f2e] border border-white/5 overflow-hidden">
      <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-white">《{script.name}》</h2>
          <span
            className={cn(
              "rounded-full px-2.5 py-0.5 text-xs font-semibold border",
              TYPE_BADGE_COLORS[script.type]
            )}
          >
            {script.type}
          </span>
          <span className="text-xs text-[#9ca3af]/70">
            {carPlayers.length}人 · {script.duration}h
          </span>
        </div>
        <div className="flex items-center gap-2">
          {hasSeriousRisk ? (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/15 text-red-400 text-xs font-medium">
              <AlertTriangle className="h-3 w-3" />
              有{conflictCount}个硬冲突
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/15 text-green-400 text-xs font-medium">
              <CheckCircle className="h-3 w-3" />
              整体可开
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 p-5">
        <div className="space-y-3">
          <div className="flex items-center gap-1.5 text-sm font-medium text-green-400">
            <ThumbsUp className="h-4 w-4" />
            推荐理由
          </div>
          <div className="space-y-2">
            {rec.reasons.slice(0, 4).map((reason, i) => (
              <div
                key={i}
                className="flex items-start gap-1.5 text-xs text-gray-300"
              >
                <CheckCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-green-400" />
                {reason}
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-white/5">
            <div className="text-[10px] text-[#9ca3af]/60 uppercase tracking-wider mb-2">
              玩家构成
            </div>
            <div className="flex flex-wrap gap-1">
              {carPlayers.map((p) => (
                <span
                  key={p.id}
                  className="px-2 py-0.5 rounded text-[10px] bg-white/5 text-[#9ca3af]"
                >
                  {p.name}·{p.experience}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-1.5 text-sm font-medium text-red-400">
            <ThumbsDown className="h-4 w-4" />
            主要踩雷点
          </div>
          {rec.risks.length > 0 ? (
            <div className="space-y-2">
              {rec.risks.slice(0, 5).map((risk, i) => (
                <div
                  key={i}
                  className="flex items-start gap-1.5 text-xs text-gray-300"
                >
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-400" />
                  {risk}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-green-400">暂无明显踩雷点</p>
          )}

          <div className="mt-4 pt-3 border-t border-white/5">
            <div className="text-[10px] text-[#9ca3af]/60 uppercase tracking-wider mb-2">
              剧本属性
            </div>
            <div className="grid grid-cols-2 gap-1.5 text-[11px]">
              <StatBar label="推理" value={script.logicLevel} color="bg-blue-400" />
              <StatBar label="情感" value={script.emotionLevel} color="bg-pink-400" />
              <StatBar label="恐怖" value={script.horrorLevel} color="bg-red-400" />
              <StatBar label="机制" value={script.mechanicLevel} color="bg-orange-400" />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-1.5 text-sm font-medium text-[#d4a44c]">
          <Sparkles className="h-4 w-4" />
          备选剧本
        </div>
          {alternatives.length > 0 ? (
            <div className="space-y-2">
              {alternatives.map((alt) => (
                <div
                  key={alt.script.id}
                  className="rounded-lg border border-white/10 bg-white/[0.02] p-2.5"
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={cn(
                          "text-[10px] px-1.5 py-0.5 rounded font-medium",
                          alt.directionColor
                        )}
                      >
                        {alt.direction}
                      </span>
                      <span className="text-xs font-medium text-white">
                        {alt.script.name}
                      </span>
                    </div>
                    <span className="text-[10px] text-[#9ca3af]/60">
                      {alt.script.duration}h
                    </span>
                  </div>
                  <ul className="space-y-0.5">
                    {alt.reasons.slice(0, 2).map((r, i) => (
                      <li
                        key={i}
                        className="text-[10px] text-[#9ca3af] flex items-start gap-1"
                      >
                        <span className="text-green-400 mt-0.5">·</span>
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[#9ca3af]/50">
              暂无合适备选（先多选几个剧本试试）
            </p>
          )}

          <div className="pt-2 text-center">
            <Link
              to="/matching"
              className="inline-flex items-center gap-1 text-[10px] text-[#d4a44c] hover:underline text-xs"
            >
              去组车页换本
              <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>

      <div className="px-6 py-4 border-t border-white/5 bg-black/20">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="text-xs text-[#9ca3af]/60 mb-1.5 flex items-center gap-1.5">
              <Copy className="h-3 w-3" />
              沟通话术（可直接念给玩家听）
            </div>
            <pre className="text-xs text-gray-300 whitespace-pre-wrap line-clamp-3">
              {rec.communicationScript}
            </pre>
          </div>
          <button
            onClick={handleCopy}
            className={cn(
              "shrink-0 flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-medium transition-colors",
              copied
                ? "bg-green-600/80 text-white"
                : "bg-[#d4a44c]/20 text-[#d4a44c] hover:bg-[#d4a44c]/30"
            )}
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5" />
                已复制
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                复制
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function StatBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[#9ca3af]/70 w-8">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
        <div
          className={cn("h-full rounded-full", color)}
          style={{ width: `${(value / 10) * 100}%` }}
        />
      </div>
      <span className="text-[#9ca3af]/70 w-3 text-right">{value}</span>
    </div>
  );
}

function Section({
  title,
  icon,
  borderColor,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  borderColor: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("mb-4 border-l-4 pl-4", borderColor)}>
      <div className="mb-2 flex items-center gap-2">
        {icon}
        <h3 className="text-sm font-semibold text-white">{title}</h3>
      </div>
      {children}
    </div>
  );
}
