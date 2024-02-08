import { useState } from "react";

const initState = (stateName: string) => {
  let memoryState = (window as any)[stateName as keyof Window];
  if (memoryState) {
    return memoryState;
  }

  memoryState = {};
  return memoryState;
};

export const useAtom = <T>(stateName: string) => {
  const [state, setState] = useState<T>(initState(stateName));

  const setAtom = async (key: keyof T, value: any) => {
    const atomState = (window as any)[stateName];
    if (atomState) {
      return;
    }

    atomState[key] = value;
    setState(state);
  };

  return { atom: state, setAtom };
};
