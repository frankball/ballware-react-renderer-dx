import React, {
  useImperativeHandle,
  useRef,
  useState,
  forwardRef,
  useMemo,
  useEffect,
} from 'react';

import { Map } from 'devextreme-react/map';

declare var google: any;

export interface LocationMapRef {
  getValue: () => { lat: number; lng: number };
  setValue: (value: { lat: number; lng: number }) => void;
}

export interface LocationMapProps {
  googlekey: string;
  readonly: boolean;
  defaultValue: { lat: number; lng: number };
  setValue: (value: { lat: number; lng: number }) => void;
  height: string;
}

export const LocationMap = forwardRef<LocationMapRef, LocationMapProps>(
  ({ googlekey, height, defaultValue, setValue, readonly }, ref) => {
    const [currentValue, setCurrentValue] = useState(defaultValue);

    useImperativeHandle(ref, () => ({
      getValue: () => {
        return currentValue;
      },
      setValue: (newValue) => {
        setCurrentValue(newValue);
        setValue(newValue);
      },
    }));

    const mapRef = useRef<Map>(null);

    useEffect(() => {
      const cleanupMarker = async () => {
        const existingMarkers = mapRef.current?.instance.option(
          'markers'
        ) as Array<object>;

        for (const marker of existingMarkers) {
          await mapRef.current?.instance.removeMarker(marker);
        }
      };

      const addMarkers = async (
        markers: Array<{ lat: number; lng: number }>
      ) => {
        if (mapRef.current) {
          for (const marker of markers) {
            await mapRef.current.instance
              .addMarker({
                location: marker,
              })
              .then((marker) => {
                if (!readonly) {
                  marker.setDraggable(true);
                  google.maps.event.addListener(
                    marker,
                    'dragend',
                    (e: {
                      latLng: { lng: () => number; lat: () => number };
                    }) => {
                      console.log(e);
                      setCurrentValue({
                        lat: e.latLng.lat(),
                        lng: e.latLng.lng(),
                      });
                      setValue({ lat: e.latLng.lat(), lng: e.latLng.lng() });
                    }
                  );
                }
              });
          }
        }
      };

      if (mapRef.current?.instance && currentValue) {
        cleanupMarker().then(() => addMarkers([currentValue]));
      } else if (mapRef.current?.instance) {
        cleanupMarker();
      }
    }, [mapRef, currentValue, readonly, setValue]);

    const WrappedMap = useMemo(() => {
      return (
        <div style={{ height: height ?? '400px' }}>
          {googlekey && (
            <Map
              ref={mapRef}
              height={height ?? '100%'}
              width={'100%'}
              autoAdjust
              provider={'google'}
              type={'hybrid'}
              defaultZoom={30}
              controls
              apiKey={{ google: googlekey }}
            ></Map>
          )}
        </div>
      );
    }, [height, googlekey]);

    return <React.Fragment>{WrappedMap}</React.Fragment>;
  }
);
