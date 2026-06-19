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
} from "lucide-react";
import { useStore } from "@/store/useStore";
import { generateRecommendation } from "@/utils/recommendation";
import { cn } from "@/lib/utils";
import type { ScriptType } from "@/types";

const TYPE_BADGE_COLORS: Record<ScriptType, string> = {
  本格: "bg-blue-600/80 text-blue-100",
  变格: "bg-purple-600/80 text-purple-100",
  社会派: "bg-green-600/80 text-green-100",
  情感: "bg-pink-600/80 text-pink-100",
  机制: "bg-orange-600/80 text-orange-100",
  恐怖: "bg-red-600/80 text-red-100",
};

export default function RecommendationPage() {
  const navigate = useNavigate();
  const { scripts, selectedScriptIds, players, cars, resetAll } = useStore();

  const carsWithPlayers = cars.filter((c) => c.playerIds.length > 0);

  const recommendations = useMemo(
    () =>
      carsWithPlayers.map((car) =>
        generateRecommendation(car, players, scripts, selectedScriptIds)
      ),
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
    <div className="min-h-screen bg-[#0f0f1a] px-4 py-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <h1 className="text-center text-2xl font-bold text-white">
          📋 推荐结果
        </h1>

        {carsWithPlayers.map((car, idx) => {
          const rec = recommendations[idx];
          const script = scripts.find((s) => s.id === car.scriptId);
          const carPlayers = players.filter((p) =>
            car.playerIds.includes(p.id)
          );

          if (!script || !rec) return null;

          return (
            <RecommendationCard
              key={car.id}
              car={car}
              script={script}
              carPlayers={carPlayers}
              recommendation={rec}
            />
          );
        })}

        <div className="flex items-center justify-center gap-4 pt-4 pb-8">
          <Link
            to="/matching"
            className="inline-flex items-center gap-2 rounded-lg border border-[#d4a44c]/40 bg-[#1a1f2e] px-5 py-2.5 text-sm text-[#d4a44c] transition-colors hover:bg-[#d4a44c]/10"
          >
            <ArrowLeft className="h-4 w-4" />
            返回组车
          </Link>
          <Link
            to="/survey"
            className="inline-flex items-center gap-2 rounded-lg border border-gray-600 bg-[#1a1f2e] px-5 py-2.5 text-sm text-gray-300 transition-colors hover:bg-gray-700/30"
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

interface RecommendationCardProps {
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

function RecommendationCard({
  car,
  script,
  carPlayers,
  recommendation: rec,
}: RecommendationCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(rec.communicationScript).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="rounded-xl bg-[#1a1f2e] p-6 shadow-lg">
      <div className="mb-4 flex items-center gap-3">
        <h2 className="text-xl font-bold text-white">《{script.name}》</h2>
        <span
          className={cn(
            "rounded-full px-3 py-0.5 text-xs font-semibold",
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
