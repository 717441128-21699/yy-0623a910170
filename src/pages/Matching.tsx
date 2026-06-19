import { useMemo } from "react";
import { DndContext, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { useStore } from "@/store/useStore";
import { detectCarWarnings } from "@/utils/matching";
import DraggablePlayerCard from "@/components/DraggablePlayerCard";
import DroppableCarSlot from "@/components/DroppableCarSlot";

export default function Matching() {
  const navigate = useNavigate();
  const {
    scripts,
    selectedScriptIds,
    players,
    cars,
    addCar,
    removeCar,
    assignPlayerToCar,
    unassignPlayer,
  } = useStore();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const unassignedPlayers = useMemo(
    () => players.filter((p) => !p.assignedCarId),
    [players]
  );

  const selectedScripts = useMemo(
    () => scripts.filter((s) => selectedScriptIds.includes(s.id)),
    [scripts, selectedScriptIds]
  );

  const carWarningsMap = useMemo(() => {
    const map: Record<string, ReturnType<typeof detectCarWarnings>> = {};
    for (const car of cars) {
      const script = scripts.find((s) => s.id === car.scriptId);
      if (!script) continue;
      map[car.id] = detectCarWarnings(car, players, script);
    }
    return map;
  }, [cars, scripts, players]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!active || !over) return;

    const playerId = String(active.id).replace("player-", "");
    const overId = String(over.id);

    if (overId.startsWith("car-")) {
      const carId = overId.replace("car-", "");
      assignPlayerToCar(playerId, carId);
    } else {
      unassignPlayer(playerId);
    }
  };

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="flex flex-col h-full">
        <div className="flex flex-1 overflow-hidden">
          <div className="w-1/3 border-r border-white/10 flex flex-col overflow-hidden">
            <div className="shrink-0 px-4 py-3 border-b border-white/10">
              <h2 className="text-sm font-semibold text-white">散客待选池</h2>
              <span className="text-xs text-[#9ca3af]">{unassignedPlayers.length} 人待分配</span>
            </div>
            <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
              {unassignedPlayers.length === 0 && (
                <div className="text-center text-[#9ca3af] text-sm py-8">
                  暂无待分配玩家
                </div>
              )}
              {unassignedPlayers.map((player) => (
                <DraggablePlayerCard key={player.id} player={player} />
              ))}
            </div>
          </div>

          <div className="w-2/3 flex flex-col overflow-hidden">
            <div className="shrink-0 px-4 py-3 border-b border-white/10 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-white">车位</h2>
                <span className="text-xs text-[#9ca3af]">{cars.length} 个车位</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {cars.length === 0 && (
                <div className="text-center text-[#9ca3af] text-sm py-12">
                  请先在下方选择剧本创建车位
                </div>
              )}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {cars.map((car) => {
                  const script = scripts.find((s) => s.id === car.scriptId);
                  if (!script) return null;
                  const carPlayers = players.filter((p) =>
                    car.playerIds.includes(p.id)
                  );
                  return (
                    <DroppableCarSlot
                      key={car.id}
                      car={car}
                      script={script}
                      players={carPlayers}
                      warnings={carWarningsMap[car.id] ?? []}
                      onRemoveCar={removeCar}
                      onUnassignPlayer={unassignPlayer}
                    />
                  );
                })}
              </div>

              <div className="mt-6">
                <h3 className="text-sm font-semibold text-[#9ca3af] mb-3">创建新车位</h3>
                {selectedScripts.length === 0 && (
                  <div className="text-xs text-[#9ca3af]/60">暂无已选剧本，请先在问答页选择剧本</div>
                )}
                <div className="flex flex-wrap gap-2">
                  {selectedScripts.map((script) => (
                    <button
                      key={script.id}
                      onClick={() => addCar(script.id)}
                      className="min-h-[44px] flex items-center gap-2 rounded-lg border border-white/10 bg-[#1a1f2e] px-3 py-2 text-sm text-white hover:border-[#d4a44c]/50 hover:text-[#d4a44c] transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                      <span>{script.name}</span>
                      <span className="text-[10px] text-[#9ca3af]">{script.type}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <footer className="shrink-0 border-t border-white/10 px-6 py-3 flex items-center justify-between bg-[#0f0f1a]">
          <button
            onClick={() => navigate("/survey")}
            className="min-h-[44px] px-4 text-sm text-[#9ca3af] hover:text-white transition-colors"
          >
            ← 返回问答
          </button>
          <button
            onClick={() => navigate("/recommendation")}
            disabled={cars.every((c) => c.playerIds.length === 0)}
            className="min-h-[44px] px-6 rounded-lg bg-[#d4a44c] text-sm font-semibold text-[#0f0f1a] hover:bg-[#d4a44c]/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            确认组车
          </button>
        </footer>
      </div>
    </DndContext>
  );
}
