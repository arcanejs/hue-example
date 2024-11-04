import { FC, useEffect, useMemo, useState } from 'react';
import { Api, LIGHT, ROOM, TypedLight, TypedRoom } from './hue-types';
import { Group } from '@arcanejs/react-toolkit';
import { isEqual } from 'lodash';
import { Room } from './room';

type RoomsProps = {
  api: Api;
  handleError: (error: unknown) => void;
};

export const Rooms: FC<RoomsProps> = ({ api, handleError }) => {
  const [rooms, setRooms] = useState<TypedRoom[] | null>(null);
  const [allLights, setLights] = useState<Record<
    number,
    TypedLight | undefined
  > | null>(null);

  const updateRoomsAndLights = useMemo(
    () => () =>
      Promise.all([
        // Get all rooms
        api.groups.getRooms().then((rooms) =>
          setRooms((current) => {
            const processed = rooms.map((r) => ROOM.parse(r));
            if (isEqual(current, processed)) {
              return current;
            }
            console.log(rooms[0]);
            return processed;
          }),
        ),
        // Get all lights
        api.lights.getAll().then((lights) =>
          setLights((current) => {
            const processed: Record<number, TypedLight> = {};
            for (const l of lights) {
              const pl = LIGHT.parse(l);
              processed[pl.id] = pl;
            }
            if (isEqual(current, processed)) {
              return current;
            }
            console.log(processed);
            return processed;
          }),
        ),
      ]).catch(handleError),
    [api, handleError],
  );

  useEffect(() => {
    const timeout = setInterval(updateRoomsAndLights, 500);
    updateRoomsAndLights();
    return () => clearInterval(timeout);
  }, [api]);

  if (!rooms || !allLights) {
    return <>Loading...</>;
  }

  return (
    <Group direction="vertical">
      {rooms.map((room) => (
        <Room
          key={room.id}
          room={room}
          allLights={allLights}
          api={api}
          updateRoomsAndLights={updateRoomsAndLights}
          handleError={handleError}
        />
      ))}
    </Group>
  );
};
