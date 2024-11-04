import { FC, useEffect, useMemo, useState } from 'react';
import { Api, TypedLight, TypedRoom } from './hue-types';
import {
  Group,
  GroupHeader,
  SliderButton,
  Switch,
} from '@arcanejs/react-toolkit';
import * as z from 'zod';
import { v3 } from 'node-hue-api';
import { throttle } from 'lodash';

type LightProps = {
  light: TypedLight;
  api: Api;
  handleError: (error: unknown) => void;
  updateRoomsAndLights: () => void;
};

export const Light: FC<LightProps> = ({
  light,
  api,
  updateRoomsAndLights,
  handleError,
}) => {
  const updateBrightnessThrottled = useMemo(
    () =>
      throttle(
        (brightness: number) => {
          const state = new v3.model.lightStates.LightState().brightness(
            brightness,
          );
          api.lights
            .setLightState(light.id, state)
            .then(updateRoomsAndLights)
            .catch(handleError);
        },
        300,
        {
          leading: false,
          trailing: true,
        },
      ),
    [api, light.id],
  );

  const updatePower = useMemo(
    () => (value: 'on' | 'off') => {
      const state = new v3.model.lightStates.LightState()[value]();
      api.lights
        .setLightState(light.id, state)
        .then(updateRoomsAndLights)
        .catch(handleError);
    },
    [api, light.id],
  );

  return (
    <Group title={light.name}>
      <Switch state={light.state.on ? 'on' : 'off'} onChange={updatePower} />
      {light.state.bri !== undefined && (
        <SliderButton
          value={(light.state.bri / 255) * 100}
          min={0}
          max={100}
          onChange={updateBrightnessThrottled}
          mode="writeThrough"
        />
      )}
    </Group>
  );
};
