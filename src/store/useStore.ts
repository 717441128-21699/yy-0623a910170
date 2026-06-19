import { create } from "zustand";
import type { Player, Car, Script } from "@/types";
import { MOCK_SCRIPTS } from "@/data/scripts";
import { generatePlayerTags } from "@/utils/playerTags";

interface AppStore {
  scripts: Script[];
  selectedScriptIds: string[];
  players: Player[];
  cars: Car[];

  toggleScript: (scriptId: string) => void;
  addPlayer: (player: Omit<Player, "id" | "tags" | "assignedCarId">) => void;
  updatePlayer: (id: string, data: Partial<Player>) => void;
  removePlayer: (id: string) => void;
  addCar: (scriptId: string) => void;
  removeCar: (carId: string) => void;
  assignPlayerToCar: (playerId: string, carId: string) => void;
  unassignPlayer: (playerId: string) => void;
  swapCarScript: (carId: string, newScriptId: string) => void;
  resetAll: () => void;
}

let playerIdCounter = 0;
let carIdCounter = 0;

export const useStore = create<AppStore>((set, get) => ({
  scripts: MOCK_SCRIPTS,
  selectedScriptIds: [],
  players: [],
  cars: [],

  toggleScript: (scriptId) =>
    set((state) => ({
      selectedScriptIds: state.selectedScriptIds.includes(scriptId)
        ? state.selectedScriptIds.filter((id) => id !== scriptId)
        : [...state.selectedScriptIds, scriptId],
    })),

  addPlayer: (playerData) => {
    const id = `p_${++playerIdCounter}_${Date.now()}`;
    const player: Player = {
      ...playerData,
      id,
      tags: [],
      assignedCarId: null,
    };
    player.tags = generatePlayerTags(player);
    set((state) => ({ players: [...state.players, player] }));
  },

  updatePlayer: (id, data) =>
    set((state) => {
      const updated = state.players.map((p) => {
        if (p.id !== id) return p;
        const merged = { ...p, ...data };
        merged.tags = generatePlayerTags(merged);
        return merged;
      });
      return { players: updated };
    }),

  removePlayer: (id) =>
    set((state) => ({
      players: state.players.filter((p) => p.id !== id),
      cars: state.cars.map((car) => ({
        ...car,
        playerIds: car.playerIds.filter((pid) => pid !== id),
      })),
    })),

  addCar: (scriptId) => {
    const script = get().scripts.find((s) => s.id === scriptId);
    if (!script) return;
    const id = `car_${++carIdCounter}_${Date.now()}`;
    set((state) => ({
      cars: [...state.cars, { id, scriptId, playerIds: [] }],
    }));
  },

  removeCar: (carId) =>
    set((state) => {
      const car = state.cars.find((c) => c.id === carId);
      if (!car) return state;
      return {
        cars: state.cars.filter((c) => c.id !== carId),
        players: state.players.map((p) =>
          p.assignedCarId === carId
            ? { ...p, assignedCarId: null }
            : p
        ),
      };
    }),

  assignPlayerToCar: (playerId, carId) =>
    set((state) => {
      const car = state.cars.find((c) => c.id === carId);
      if (!car) return state;
      const script = state.scripts.find((s) => s.id === car.scriptId);
      if (script && car.playerIds.length >= script.playerRange[1]) return state;
      return {
        players: state.players.map((p) =>
          p.id === playerId ? { ...p, assignedCarId: carId } : p
        ),
        cars: state.cars.map((c) => {
          if (c.id === carId) {
            if (c.playerIds.includes(playerId)) return c;
            return { ...c, playerIds: [...c.playerIds, playerId] };
          }
          return {
            ...c,
            playerIds: c.playerIds.filter((pid) => pid !== playerId),
          };
        }),
      };
    }),

  unassignPlayer: (playerId) =>
    set((state) => ({
      players: state.players.map((p) =>
        p.id === playerId ? { ...p, assignedCarId: null } : p
      ),
      cars: state.cars.map((c) => ({
        ...c,
        playerIds: c.playerIds.filter((pid) => pid !== playerId),
      })),
    })),

  swapCarScript: (carId, newScriptId) =>
    set((state) => {
      const car = state.cars.find((c) => c.id === carId);
      const newScript = state.scripts.find((s) => s.id === newScriptId);
      if (!car || !newScript) return state;
      const playerCount = car.playerIds.length;
      if (playerCount < newScript.playerRange[0] || playerCount > newScript.playerRange[1]) {
        return state;
      }
      return {
        cars: state.cars.map((c) =>
          c.id === carId ? { ...c, scriptId: newScriptId } : c
        ),
      };
    }),

  resetAll: () =>
    set({
      selectedScriptIds: [],
      players: [],
      cars: [],
    }),
}));
