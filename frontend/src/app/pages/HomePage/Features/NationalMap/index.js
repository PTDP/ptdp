/* global window */
import React, { Component, useEffect, useState, useReducer } from 'react';
import { StaticMap } from 'react-map-gl';
import { LayerControls, MapStylePicker, HEXAGON_CONTROLS } from './controls';
import { tooltipStyle } from './style';
import DeckGL from 'deck.gl';
import taxiData from './taxi.js';
import { renderLayers } from './deckgl-layers';
import Charts from './charts';

/* Data Fetching */
import { useSelector, useDispatch } from 'react-redux';
import { useNationalMapSlice } from './slice';
import { selectPoints, selectLoading, selectError } from './slice/selectors';

const INITIAL_VIEW_STATE = {
  longitude: -98.5795,
  latitude: 39.8283,
  zoom: 4,
  minZoom: 1,
  maxZoom: 16,
  pitch: 0,
  bearing: 0,
};

const Fetcher = () => {
  const dispatch = useDispatch();
  const { actions } = useNationalMapSlice();

  const isLoading = useSelector(selectLoading);
  const points = useSelector(selectPoints);

  useEffect(() => {
    dispatch(actions.loadFacilities());
  }, []);

  return (
    <div>
      {isLoading ? (
        <div> Loading the data!!!</div>
      ) : (
        <div>GOT THE DATA {JSON.stringify(points[0])}</div>
      )}
    </div>
  );
};

export default props => {
  const [state, setState] = useReducer(
    function reducer(state, action) {
      return { ...state, ...action };
    },
    {
      hover: {
        x: 0,
        y: 0,
        hoveredObject: null,
      },
      points: [],
      settings: Object.keys(HEXAGON_CONTROLS).reduce(
        (accu, key) => ({
          ...accu,
          [key]: HEXAGON_CONTROLS[key].value,
        }),
        {},
      ),
      style: 'mapbox://styles/mapbox/light-v9',
    },
  );

  const dispatch = useDispatch();
  const { actions } = useNationalMapSlice();

  const isLoading = useSelector(selectLoading);
  const points = useSelector(selectPoints);

  useEffect(() => {
    dispatch(actions.loadFacilities());
  }, []);

  // useEffect(() => {
  //   _processData();
  // }, []);

  function _processData() {
    const data = taxiData.reduce(
      (accu, curr) => {
        const pickupHour = new Date(curr.pickup_datetime).getUTCHours();
        const dropoffHour = new Date(curr.dropoff_datetime).getUTCHours();

        const pickupLongitude = Number(curr.pickup_longitude);
        const pickupLatitude = Number(curr.pickup_latitude);

        if (!isNaN(pickupLongitude) && !isNaN(pickupLatitude)) {
          accu.points.push({
            position: [pickupLongitude, pickupLatitude],
            hour: pickupHour,
            pickup: true,
          });
        }

        const dropoffLongitude = Number(curr.dropoff_longitude);
        const dropoffLatitude = Number(curr.dropoff_latitude);

        if (!isNaN(dropoffLongitude) && !isNaN(dropoffLatitude)) {
          accu.points.push({
            position: [dropoffLongitude, dropoffLatitude],
            hour: dropoffHour,
            pickup: false,
          });
        }

        const prevPickups = accu.pickupObj[pickupHour] || 0;
        const prevDropoffs = accu.dropoffObj[dropoffHour] || 0;

        accu.pickupObj[pickupHour] = prevPickups + 1;
        accu.dropoffObj[dropoffHour] = prevDropoffs + 1;

        return accu;
      },
      {
        points: [],
        pickupObj: {},
        dropoffObj: {},
      },
    );

    data.pickups = Object.entries(data.pickupObj).map(([hour, count]) => {
      return { hour: Number(hour), x: Number(hour) + 0.5, y: count };
    });
    data.dropoffs = Object.entries(data.dropoffObj).map(([hour, count]) => {
      return { hour: Number(hour), x: Number(hour) + 0.5, y: count };
    });

    setState(data);
  }

  const _onHover = props => {
    console.log(props);
    const { x, y, object } = props;
    const label = object
      ? object.points
        ? `${object.points[0].source.name} `
        : null
      : null;

    setState({ hover: { x, y, hoveredObject: object, label } });
  };

  const _onHighlight = highlightedHour => {
    setState({ highlightedHour });
  };

  const _onSelect = selectedHour => {
    setState({
      selectedHour: selectedHour === state.selectedHour ? null : selectedHour,
    });
  };

  const onStyleChange = style => {
    setState({ style });
  };

  const _onWebGLInitialize = gl => {
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
  };

  const _updateLayerSettings = settings => {
    setState({ settings });
  };

  const { viewState, controller = true } = props;

  const data = points;

  if (!points.length) {
    return null;
  }

  const { hover } = state;

  return (
    <div name="national-map">
      <main
        id="map-container"
        style={{
          height: '100vh',
          width: '100vw',
        }}
      >
        {/* <Fetcher /> */}
        <div class="text-5xl font-extrabold mb-8">National Map</div>
        <div id="national-map" class="relative w-full h-full">
          {hover && hover.hoveredObject && (
            <div
              style={{
                ...tooltipStyle,
                transform: `translate(${hover.x}px, ${hover.y}px)`,
              }}
            >
              <div>{hover.label}</div>
            </div>
          )}
          <MapStylePicker
            onStyleChange={onStyleChange}
            currentStyle={state.style}
          />
          <LayerControls
            settings={state.settings}
            propTypes={HEXAGON_CONTROLS}
            onChange={settings => _updateLayerSettings(settings)}
          />
          <DeckGL
            {...state.settings}
            onWebGLInitialized={_onWebGLInitialize}
            layers={renderLayers({
              data: points,
              onHover: hover => _onHover(hover),
              settings: state.settings,
            })}
            initialViewState={INITIAL_VIEW_STATE}
            viewState={viewState}
            controller={controller}
          >
            <StaticMap
              mapStyle={state.style}
              mapboxApiAccessToken={
                'pk.eyJ1Ijoic2VjdXJ1cy12aXN1YWxpemVyIiwiYSI6ImNrZzJlMGpuMDA3Nncyd213OThpczd6ejYifQ.02um_OvAOYmVzyHUxCUFuQ'
              }
            />
          </DeckGL>
          {/* <Charts
              {...state}
              highlight={hour => _onHighlight(hour)}
              select={hour => _onSelect(hour)}
            /> */}
        </div>
      </main>
    </div>
  );
};

// export default class App extends Component {
//   state = {
//     hover: {
//       x: 0,
//       y: 0,
//       hoveredObject: null,
//     },
//     points: [],
// settings: Object.keys(HEXAGON_CONTROLS).reduce(
//   (accu, key) => ({
//     ...accu,
//     [key]: HEXAGON_CONTROLS[key].value,
//   }),
//   {},
// ),
//     style: 'mapbox://styles/mapbox/light-v9',
//   };

//   componentDidMount() {
//     _processData();
//   }

//   _processData = () => {
//     console.log(taxiData);

//     const data = taxiData.reduce(
//       (accu, curr) => {
//         const pickupHour = new Date(curr.pickup_datetime).getUTCHours();
//         const dropoffHour = new Date(curr.dropoff_datetime).getUTCHours();

//         const pickupLongitude = Number(curr.pickup_longitude);
//         const pickupLatitude = Number(curr.pickup_latitude);

//         if (!isNaN(pickupLongitude) && !isNaN(pickupLatitude)) {
//           accu.points.push({
//             position: [pickupLongitude, pickupLatitude],
//             hour: pickupHour,
//             pickup: true,
//           });
//         }

//         const dropoffLongitude = Number(curr.dropoff_longitude);
//         const dropoffLatitude = Number(curr.dropoff_latitude);

//         if (!isNaN(dropoffLongitude) && !isNaN(dropoffLatitude)) {
//           accu.points.push({
//             position: [dropoffLongitude, dropoffLatitude],
//             hour: dropoffHour,
//             pickup: false,
//           });
//         }

//         const prevPickups = accu.pickupObj[pickupHour] || 0;
//         const prevDropoffs = accu.dropoffObj[dropoffHour] || 0;

//         accu.pickupObj[pickupHour] = prevPickups + 1;
//         accu.dropoffObj[dropoffHour] = prevDropoffs + 1;

//         return accu;
//       },
//       {
//         points: [],
//         pickupObj: {},
//         dropoffObj: {},
//       },
//     );

//     data.pickups = Object.entries(data.pickupObj).map(([hour, count]) => {
//       return { hour: Number(hour), x: Number(hour) + 0.5, y: count };
//     });
//     data.dropoffs = Object.entries(data.dropoffObj).map(([hour, count]) => {
//       return { hour: Number(hour), x: Number(hour) + 0.5, y: count };
//     });
//     console.log('<><><><><><>', data);
//     setState(data);
//   };

//   _onHover(props) {
//     // console.log(props);
//     const { x, y, object } = props;
//     console.log(object);
//     const label = object
//       ? object.points
//         ? `${object.points.length} pickups or dropoffs here`
//         : object.pickup
//         ? 'Pickup'
//         : 'Dropoff'
//       : null;

//     setState({ hover: { x, y, hoveredObject: object, label } });
//   }

//   _onHighlight(highlightedHour) {
//     setState({ highlightedHour });
//   }

//   _onSelect(selectedHour) {
//     setState({
//       selectedHour:
//         selectedHour === state.selectedHour ? null : selectedHour,
//     });
//   }

//   onStyleChange = style => {
//     setState({ style });
//   };
//   _onWebGLInitialize = gl => {
//     gl.enable(gl.DEPTH_TEST);
//     gl.depthFunc(gl.LEQUAL);
//   };
//   _updateLayerSettings(settings) {
//     setState({ settings });
//   }

//   render() {
//     const { viewState, controller = true } = props;
//     const data = state.points;
//     if (!data.length) {
//       return null;
//     }
//     const { hover, settings } = state;
//     return (
//       <div name="national-map">
//         <main
//           id="map-container"
//           style={{
//             height: '100vh',
//             width: '100vw',
//           }}
//         >
//           <Fetcher />
//           <div class="text-5xl font-extrabold mb-8">National Map</div>
//           <div id="national-map" class="relative w-full h-full">
//             {hover.hoveredObject && (
//               <div
//                 style={{
//                   ...tooltipStyle,
//                   transform: `translate(${hover.x}px, ${hover.y}px)`,
//                 }}
//               >
//                 <div>{hover.label}</div>
//               </div>
//             )}
//             <MapStylePicker
//               onStyleChange={onStyleChange}
//               currentStyle={state.style}
//             />
//             <LayerControls
//               settings={state.settings}
//               propTypes={HEXAGON_CONTROLS}
//               onChange={settings => _updateLayerSettings(settings)}
//             />
//             <DeckGL
//               {...state.settings}
//               onWebGLInitialized={_onWebGLInitialize}
//               layers={renderLayers({
//                 data: state.points,
//                 onHover: hover => _onHover(hover),
//                 settings: state.settings,
//               })}
//               initialViewState={INITIAL_VIEW_STATE}
//               viewState={viewState}
//               controller={controller}
//             >
//               <StaticMap
//                 mapStyle={state.style}
//                 mapboxApiAccessToken={
//                   'pk.eyJ1Ijoic2VjdXJ1cy12aXN1YWxpemVyIiwiYSI6ImNrZzJlMGpuMDA3Nncyd213OThpczd6ejYifQ.02um_OvAOYmVzyHUxCUFuQ'
//                 }
//               />
//             </DeckGL>
//             {/* <Charts
//               {...state}
//               highlight={hour => _onHighlight(hour)}
//               select={hour => _onSelect(hour)}
//             /> */}
//           </div>
//         </main>
//       </div>
//     );
//   }
// }
