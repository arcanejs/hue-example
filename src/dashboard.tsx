import { discovery, v3 } from 'node-hue-api';

import { FC, useEffect, useState } from 'react';
import { Button, Group, GroupHeader } from '@arcanejs/react-toolkit';
import { useDataFileContext } from '@arcanejs/react-toolkit/data';

import { HueData } from './data';
import { Api, BridgeConfig } from './hue-types';
import { Rooms } from './rooms';

export const Dashboard: FC = () => {
  const { data, updateData } = useDataFileContext(HueData);

  const [error, setError] = useState<string | null>(null);

  const [api, setApi] = useState<Api | null>(null);
  const [bridgeConfig, setBridgeConfig] = useState<BridgeConfig | null>(null);

  const initializeApi = async () => {
    if (!data.bridge) {
      return;
    }
    setApi(null);
    setError(null);
    setBridgeConfig(null);
    v3.api
      .createLocal(data.bridge.ip)
      .connect(data.bridge.username)
      .then(setApi);
  };

  const handleError = (error: unknown) => {
    setError(`${error}`);
  };

  useEffect(
    () => void initializeApi(),
    [data.bridge?.ip, data.bridge?.username],
  );

  useEffect(() => {
    if (!api) {
      return;
    }

    api.configuration
      .getConfiguration()
      .then(setBridgeConfig)
      .catch(handleError);

    api.groups.getAll;
  }, [api]);

  if (!data.bridge) {
    return null;
  }

  return (
    <Group
      border={true}
      title={bridgeConfig ? bridgeConfig.name : 'Loading...'}
      direction="vertical"
    >
      <GroupHeader>
        <Button onClick={initializeApi} text="Refresh" />
      </GroupHeader>
      {error && <Group border={true}>{error}</Group>}
      {api && <Rooms api={api} handleError={handleError} />}
    </Group>
  );

  return <Group>Loading</Group>;
};
