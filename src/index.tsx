import { useEffect, useState } from 'react';
import { v3 } from 'node-hue-api';
import path from 'path';

import { Toolkit } from '@arcanejs/toolkit';
import { ToolkitRenderer, Group, Button, Label } from '@arcanejs/react-toolkit';
import { useDataFileContext } from '@arcanejs/react-toolkit/data';
import { HueData } from './data';
import { BridgeConfiguration } from './bridge-configuration';

const { discovery, api: hueApi} = v3;

const DATA_FILE = path.join(path.dirname(__dirname), 'data', 'hue.json');

const toolkit = new Toolkit();

toolkit.start({
  mode: 'automatic',
  port: 3000,
  onReady: (url) => {
    console.log(`Hue App started: ${url}`);
  },
});

const ControlPanel = () => {
  const { data, updateData } = useDataFileContext(HueData);

  if (!data.bridge) {
    return <BridgeConfiguration />;
  }

  return (
    <Group direction='vertical'>

    </Group>
  );
};

const App = () => {
  return (
    <HueData.Provider path={DATA_FILE}>
      <ControlPanel />
    </HueData.Provider>
  )
}

// Start rendering the control panel with @arcanejs/react-toolkit
ToolkitRenderer.render(<App />, toolkit);