import { create } from "zustand";

type ChipKeys = {
  primaryPublicKeyHash: string;
  primaryPublicKeyRaw: string;
  secondaryPublicKeyHash: string;
  secondaryPublicKeyRaw: string;
  tertiaryPublicKeyHash: string | null;
  tertiaryPublicKeyRaw: string | null;
};

interface ChipKeysState {
  keys: ChipKeys | undefined;
  setKeys: (keys: ChipKeys | undefined) => void;
}

export const useChipStore = create<ChipKeysState>()((set) => ({
  keys: undefined,
  setKeys: (keys: ChipKeys | undefined) =>
    set({
      keys,
    }),
}));
