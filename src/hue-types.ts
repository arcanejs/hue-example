import type { v3 } from 'node-hue-api';
import z from 'zod';

export type PromiseReturnType<T extends (...args: any) => any> =
  ReturnType<T> extends Promise<infer R> ? R : never;

/**
 * TODO: make this type more accessible in the upstream library
 */
export type Api = PromiseReturnType<
  ReturnType<typeof v3.api.createLocal>['connect']
>;
export type BridgeConfig = PromiseReturnType<
  Api['configuration']['getConfiguration']
>;
export type Room = PromiseReturnType<Api['groups']['getRooms']>[number];

// Extra type-checking

export const ROOM = z.object({
  id: z.number(),
  name: z.string(),
  state: z.object({
    any_on: z.boolean(),
    all_on: z.boolean(),
  }),
  action: z
    .object({
      on: z.boolean(),
      bri: z.number(),
      hue: z.number(),
      sat: z.number(),
    })
    .partial(),
});

export type TypedRoom = z.infer<typeof ROOM>;
