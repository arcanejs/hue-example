import { FC, useMemo } from 'react';
import { Api, TypedLight, TypedRoom } from './hue-types';
import { Group, SliderButton, Switch } from '@arcanejs/react-toolkit';
import * as z from 'zod';
import { v3 } from 'node-hue-api';
import { throttle } from 'lodash';
import { Light } from './light';

type RoomProps = {
  room: TypedRoom;
  allLights: Record<number, TypedLight | undefined>;
  api: Api;
  handleError: (error: unknown) => void;
  updateRoomsAndLights: () => void;
};

export const Room: FC<RoomProps> = ({
  room,
  allLights,
  api,
  updateRoomsAndLights,
  handleError,
}) => {
  const updateBrightnessThrottled = useMemo(
    () =>
      throttle(
        (brightness: number) => {
          const state = new v3.model.lightStates.GroupLightState().brightness(
            brightness,
          );
          api.groups
            .setGroupState(room.id, state)
            .then(updateRoomsAndLights)
            .catch(handleError);
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
    <Group title={room.name} direction="vertical">
      <Group>
        <Switch
          value={room.state.any_on ? 'on' : 'off'}
          onChange={(value) => {
            const state = new v3.model.lightStates.GroupLightState()[value]();
            api.groups
              .setGroupState(room.id, state)
              .then(updateRoomsAndLights)
              .catch(handleError);
          }}
        />
        {room.action.bri !== undefined && (
          <SliderButton
            value={(room.action.bri / 255) * 100}
            min={0}
            max={100}
            onChange={updateBrightnessThrottled}
          />
        )}
      </Group>
      <Group
        direction="vertical"
        defaultCollapsibleState="closed"
        title={`${room.lights.length} Lights`}
      >
        {room.lights.map((lightId) => {
          const data = allLights[parseInt(lightId)];
          if (!data) {
            return null;
          }
          return (
            <Light
              key={lightId}
              light={data}
              api={api}
              handleError={handleError}
              updateRoomsAndLights={updateRoomsAndLights}
            />
          );
        })}
      </Group>
    </Group>
  );
};
