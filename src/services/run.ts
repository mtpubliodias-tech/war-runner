// Run service placeholder - prepared for future implementation

export interface RunSession {
  id: string;
  startTime: Date;
  endTime?: Date;
  distance?: number; // in meters
  path?: [number, number][];
}

export const startRun = (): RunSession => {
  return {
    id: crypto.randomUUID(),
    startTime: new Date(),
  };
};

export const endRun = (session: RunSession): RunSession => {
  return {
    ...session,
    endTime: new Date(),
  };
};
