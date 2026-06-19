import { useState } from "react";
import { useStore } from "@/store/useStore";
import type { Experience, Dealbreaker } from "@/types";
import ScriptCard from "@/components/ScriptCard";
import PlayerForm from "@/components/PlayerForm";
import PlayerCard from "@/components/PlayerCard";
import PlayerCardEditModal from "@/components/PlayerCardEditModal";

export default function Survey() {
  const scripts = useStore((s) => s.scripts);
  const selectedScriptIds = useStore((s) => s.selectedScriptIds);
  const players = useStore((s) => s.players);
  const toggleScript = useStore((s) => s.toggleScript);
  const addPlayer = useStore((s) => s.addPlayer);
  const updatePlayer = useStore((s) => s.updatePlayer);
  const removePlayer = useStore((s) => s.removePlayer);
  const addCar = useStore((s) => s.addCar);

  const [editingPlayer, setEditingPlayer] = useState<typeof players[number] | null>(null);

  const handleAddPlayer = (data: {
    name: string;
    experience: Experience;
    preferences: Record<string, number>;
    dealbreakers: Dealbreaker[];
  }) => {
    addPlayer({
      name: data.name,
      experience: data.experience,
      preferences: {
        logicLevel: data.preferences.logicLevel,
        emotionLevel: data.preferences.emotionLevel,
        horrorTolerance: data.preferences.horrorTolerance,
        mechanicPreference: data.preferences.mechanicPreference,
      },
      dealbreakers: data.dealbreakers,
    });
  };

  const handleCreateCar = (scriptId: string) => {
    addCar(scriptId);
  };

  return (
    <div className="p-6 space-y-8">
      <section>
        <h2 className="text-lg font-semibold mb-3">今日可选剧本</h2>
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-white/10">
          {scripts.map((script) => (
            <ScriptCard
              key={script.id}
              script={script}
              selected={selectedScriptIds.includes(script.id)}
              onToggle={() => toggleScript(script.id)}
            />
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h2 className="text-lg font-semibold mb-3">录入玩家</h2>
          <div className="rounded-xl bg-[#1a1f2e]/50 border border-white/5 p-5">
            <PlayerForm onSubmit={handleAddPlayer} />
          </div>
        </div>

        {selectedScriptIds.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-3">创建车位</h2>
            <div className="space-y-2">
              {selectedScriptIds.map((scriptId) => {
                const script = scripts.find((s) => s.id === scriptId);
                if (!script) return null;
                return (
                  <div
                    key={scriptId}
                    className="flex items-center justify-between rounded-lg bg-[#1a1f2e]/50 border border-white/5 px-4 py-3"
                  >
                    <div>
                      <span className="font-medium">{script.name}</span>
                      <span className="text-xs text-[#9ca3af] ml-2">
                        {script.playerRange[0]}-{script.playerRange[1]}人 · {script.duration}h
                      </span>
                    </div>
                    <button
                      onClick={() => handleCreateCar(scriptId)}
                      className="px-4 py-1.5 rounded-lg bg-[#d4a44c] text-black text-sm font-semibold hover:bg-[#d4a44c]/90 transition-colors"
                    >
                      创建车位
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-3">
          已录入玩家
          {players.length > 0 && (
            <span className="text-sm font-normal text-[#9ca3af] ml-2">
              共 {players.length} 人
            </span>
          )}
        </h2>
        {players.length === 0 ? (
          <div className="text-center py-12 text-[#9ca3af]">
            暂无玩家，请在上方录入
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {players.map((player) => (
              <PlayerCard
                key={player.id}
                player={player}
                onEdit={setEditingPlayer}
                onDelete={removePlayer}
              />
            ))}
          </div>
        )}
      </section>

      {editingPlayer && (
        <PlayerCardEditModal
          player={editingPlayer}
          onSave={(id, data) => {
            updatePlayer(id, data);
            setEditingPlayer(null);
          }}
          onClose={() => setEditingPlayer(null)}
        />
      )}
    </div>
  );
}
