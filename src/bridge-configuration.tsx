import { FC, useEffect, useState } from 'react';
import { discovery, v3 } from 'node-hue-api';

import { Group, Button, Label } from '@arcanejs/react-toolkit';
import { useDataFileUpdater } from '@arcanejs/react-toolkit/data';
import { HueData } from './data';

const APP_NAME = 'Arcane Hue Example';
const DEVICE_NAME = 'example-code';

type Bridge = {
  name: string | null;
  ip: string;
};

type BridgeConfigState =
  | { state: 'searching' }
  | { state: 'search-complete' | 'connecting'; bridges: Bridge[] }
  | { state: 'connecting'; bridge: Bridge }
  | { state: 'error'; error: string };

export const BridgeConfiguration: FC = () => {
  const updateHueData = useDataFileUpdater(HueData);

  const [state, setState] = useState<BridgeConfigState>({
    state: 'searching',
  });

  const discoverBridges = async () => {
    setState({ state: 'searching' });
    try {
      const bridges = await discovery.nupnpSearch();
      setState({
        state: 'search-complete',
        bridges: bridges.map((bridge) => ({
          ip: bridge.ipaddress,
          name: bridge.config?.name ?? null,
        })),
      });
    } catch (error) {
      console.error(error);
      setState({ state: 'error', error: `${error}` });
    }
  };

  const connectToBridge = async (bridge: Bridge) => {
    setState({ state: 'connecting', bridge });
    try {
      const unauthenticatedApi = await v3.api.createLocal(bridge.ip).connect();

      const user = await unauthenticatedApi.users.createUser(
        APP_NAME,
        DEVICE_NAME,
      );

      const authenticatedApi = await v3.api
        .createLocal(bridge.ip)
        .connect(user.username);

      const bridgeConfig =
        await authenticatedApi.configuration.getConfiguration();
      console.log(
        `Connected to Hue Bridge: ${bridgeConfig.name} :: ${bridgeConfig.ipaddress}`,
      );

      updateHueData((current) => {
        return {
          ...current,
          bridge: {
            ip: bridge.ip,
            username: user.username,
            clientKey: user.clientkey,
          },
        };
      });
    } catch (error) {
      console.error(error);
      setState({ state: 'error', error: `${error}` });
    }
  };

  useEffect(() => void discoverBridges(), []);

  if (state.state === 'searching') {
    return <>Searching for Hue Bridges...</>;
  }

  if (state.state === 'error') {
    return (
      <Group>
        Error: {state.error}
        <Button onClick={discoverBridges} text="Retry" />
      </Group>
    );
  }

  if (state.state === 'search-complete') {
    if (state.bridges.length === 0) {
      return (
        <Group>
          No Hue Bridges found
          <Button onClick={discoverBridges} text="Retry" />
        </Group>
      );
    }

    return (
      <Group direction="vertical">
        Press the button on the hue bridge, then click pair below.
        <>
          {state.bridges.map((bridge) => (
            <Group key={bridge.ip}>
              <Label text={`${bridge.name} at ${bridge.ip}`} />
              <Button onClick={() => connectToBridge(bridge)} text="Pair" />
            </Group>
          ))}
        </>
      </Group>
    );
  }

  if (state.state === 'connecting') {
    <>Attempting to pair with hue bridge</>;
  }
};
