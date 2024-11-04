import React from 'react';
import path from 'path';

import { Group, Toolkit } from '@arcanejs/toolkit';
import { ToolkitRenderer } from '@arcanejs/react-toolkit';
import { useDataFileData } from '@arcanejs/react-toolkit/data';
import { HueData } from './data';
import { BridgeConfiguration } from './bridge-configuration';
import { Dashboard } from './dashboard';

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
  const data = useDataFileData(HueData);

  if (!data.bridge) {
    return <BridgeConfiguration />;
  }

  return <Dashboard />;
};

const App = () => {
  return (
    <HueData.Provider path={DATA_FILE}>
      <ControlPanel />
    </HueData.Provider>
  );
};

ToolkitRenderer.render(<App />, toolkit, { direction: 'vertical' });
