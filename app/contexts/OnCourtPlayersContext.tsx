// /contexts/OnCourtPlayersContext.tsx

import React, { createContext, useState } from 'react';
import PlayerStat from '../models/PlayerStat';

interface OnCourtPlayersContextProps {
  onCourtPlayers: PlayerStat[];
  setOnCourtPlayers: React.Dispatch<React.SetStateAction<PlayerStat[]>>;
}

export const OnCourtPlayersContext = createContext<OnCourtPlayersContextProps>({
  onCourtPlayers: [],
  setOnCourtPlayers: () => {},
});

export const OnCourtPlayersProvider: React.FC = ({ children }) => {
  const [onCourtPlayers, setOnCourtPlayers] = useState<PlayerStat[]>([]);

  return (
    <OnCourtPlayersContext.Provider value={{ onCourtPlayers, setOnCourtPlayers }}>
      {children}
    </OnCourtPlayersContext.Provider>
  );
};
