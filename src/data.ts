import { createDataFileDefinition } from '@arcanejs/react-toolkit/data';
import z from 'zod';

export const HueData = createDataFileDefinition({
  schema: z.object({
    bridge: z.object({
      ip: z.string(),
      username: z.string(),
      clientKey: z.string().optional(),
    }).nullable()
  }),
  defaultValue: {
    bridge: null,
  },
});
