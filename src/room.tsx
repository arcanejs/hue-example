import { FC, useEffect, useMemo, useState } from 'react';
import { Api, TypedRoom } from './hue-types';
import {
  Group,
  GroupHeader,
  SliderButton,
  Switch,
} from '@arcanejs/react-toolkit';
import * as z from 'zod';
import { v3 } from 'node-hue-api';
import { throttle } from 'lodash';

type RoomProps = {
  room: TypedRoom;
  api: Api;
  handleError: (error: unknown) => void;
  updateRooms: () => void;
};

export const Room: FC<RoomProps> = ({
  room,
  api,
  updateRooms,
  handleError,
}) => {
  const updateBrightnessThrottled = useMemo(
    () =>
      throttle(
        (brightness: number) => {
          const state = new v3.model.lightStates.GroupLightState().brightness(
            brightness,
          );
          api.groups.setGroupState(room.id, state).then(updateRooms);
        },
        300,
        {
          leading: false,
          trailing: true,
        },
      ),
    [api, room.id],
  );

  return (
    <Group key={room.id} title={room.name}>
      <Switch
        state={room.action.on ? 'on' : 'off'}
        onChange={(value) => {
          const state = new v3.model.lightStates.GroupLightState()[value]();
          api.groups.setGroupState(room.id, state).then(updateRooms);
        }}
      />
      {room.action.bri !== undefined && (
        <SliderButton
          value={(room.action.bri / 255) * 100}
          min={0}
          max={100}
          onChange={updateBrightnessThrottled}
          mode="writeThrough"
        />
      )}
    </Group>
  );
};
