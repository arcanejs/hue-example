import { FC, useEffect, useMemo, useState } from 'react';
import { Api, ROOM, TypedRoom } from './hue-types';
import {
  Group,
  GroupHeader,
  SliderButton,
  Switch,
} from '@arcanejs/react-toolkit';
import * as z from 'zod';
import { v3 } from 'node-hue-api';
import { isEqual } from 'lodash';
import { Room } from './room';

type RoomsProps = {
  api: Api;
  handleError: (error: unknown) => void;
};

export const Rooms: FC<RoomsProps> = ({ api, handleError }) => {
  const [rooms, setRooms] = useState<TypedRoom[] | null>(null);

  const updateRooms = useMemo(
    () => () =>
      api.groups
        .getRooms()
        .then((rooms) =>
          setRooms((current) => {
            const processedRooms = rooms.map((r) => ROOM.parse(r));
            if (isEqual(current, processedRooms)) {
              return current;
            }
            return processedRooms;
          }),
        )
        .catch(handleError),
    [api, handleError],
  );

  useEffect(() => {
    const timeout = setInterval(updateRooms, 500);
    updateRooms();
    return () => clearInterval(timeout);
  }, [api]);

  if (!rooms) {
    return <>Loading...</>;
  }

  return (
    <Group direction="vertical">
      {rooms.map((room) => (
        <Room
          key={room.id}
          room={room}
          api={api}
          updateRooms={updateRooms}
          handleError={handleError}
        />
      ))}
    </Group>
  );
};
