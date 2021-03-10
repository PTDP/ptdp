/* global window */
import React, { Component, useEffect, useState, useReducer, CSSProperties } from 'react';
import { StaticMap } from 'react-map-gl';
import {
  LayerControls,
  MapStylePicker,
  HEXAGON_CONTROLS,
  DataFilterControls,
} from './controls';
import { tooltipStyle } from './style';
import DeckGL from 'deck.gl';
// import taxiData from './taxi.js';
import {
  renderLayers,
  fifteenMinute,
  latestInStateCanonical,
  latestOutStateCanonical,
  latestRateFromCanonical,
} from './deckgl-layers';
import Charts from './charts';

/* Data Fetching */
import { useSelector, useDispatch } from 'react-redux';
import { useNationalMapSlice } from './slice';
import { selectFacilities, selectLoading, selectError, selectFilters } from './slice/selectors';
import { Filters, FilterCompanies } from './slice/types';

const INITIAL_VIEW_STATE = {
  longitude: -98.5795,
  latitude: 39.8283,
  zoom: 4,
  minZoom: 1,
  maxZoom: 16,
  pitch: 50,
  bearing: 0,
};

// const Fetcher = () => {
//   const dispatch = useDispatch();
//   const { actions } = useNationalMapSlice();

//   const isLoading = useSelector(selectLoading);
//   const points = useSelector(selectPoints);

//   useEffect(() => {
//     dispatch(actions.loadFacilities());
//   }, []);

//   return (
//     <div>
//       {isLoading ? (
//         <div> Loading the data!!!</div>
//       ) : (
//         <div>GOT THE DATA {JSON.stringify(points[0])}</div>
//       )}
//     </div>
//   );
// };
let filtered: any[] = [];
export const NationalMap = props => {
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
      filtered: [],
      settings: Object.keys(HEXAGON_CONTROLS).reduce(
        (accu, key) => ({
          ...accu,
          [key]: HEXAGON_CONTROLS[key].value,
        }),
        {},
      ),
      filterSettings: {},
      style: 'mapbox://styles/mapbox/light-v9',
    },
  );

  const [, updateState] = React.useState();
  const u: any = {};
  const [ignored, forceUpdate] = useReducer(x => x + 1, 0);

  const dispatch = useDispatch();
  const { actions } = useNationalMapSlice();

  const isLoading = useSelector(selectLoading);
  const facilities = useSelector(selectFacilities);
  const filters = useSelector(selectFilters);

  useEffect(() => {
    dispatch(actions.loadFacilities());
  }, []);

  useEffect(() => {
    setFilters(filters)
  }, [filters])

  useEffect(() => {
    filtered = facilities
    forceUpdate();
  }, [facilities])

  function setFilters(filters: Filters) {
    filtered = facilities.filter(d => {
      if (filters.company !== FilterCompanies.ALL) {
        return d.companyFacilitiesByCanonicalFacilityId.nodes.find(n => n.company === filters.company)
      }
      return true
    });
    forceUpdate();
  }


  // const _onHover = props => {
  //   const { x, y, object } = props;
  //   const d = object?.points?.[0]?.source;

  //   const canonical =
  //     props.layer.id === 'in-state'
  //       ? latestInStateCanonical([d])
  //       : latestOutStateCanonical([d]);
  //   const rate = latestRateFromCanonical(canonical);
  //   const seen = rate?.seenAt;

  //   let str = '';
  //   if (seen) {
  //     const latest = seen?.[seen.length - 1];
  //     str = new Date(latest).toLocaleString('en-US', { timeZone: 'UTC' });
  //   }

  //   const label = object
  //     ? object.points
  //       ? `
  //         <div>
  //         Facility: ${d?.name}
  //         </div>
  //         <div>
  //          Agency: ${d?.agencyByAgencyId?.name || 'Unknown'}
  //          </div>
  //          <div>
  //          15 Minute Rate: $${(fifteenMinute(rate) / 100).toFixed(2)}
  //          </div>
  //          <div>
  //          Company: ${canonical?.companyByCompanyId?.['name']}
  //          </div>
  //          <div>
  //          Number used: ${canonical?.phoneNumber}
  //          </div>
  //          <div>
  //          Rate Collected At: ${str}
  //          </div>
  //          `
  //       : null
  //     : null;

  //   setState({ hover: { x, y, hoveredObject: object, label } });
  // };

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

  if (!filtered.length) {
    return null;
  }
  const { hover } = state;

  const hoverStyle = {
    ...tooltipStyle,
    transform: `translate(${hover.x}px, ${hover.y}px)`,
  } as React.CSSProperties;

  return (
    <div
      id="map-container"
      style={{
        height: '100vh',
      }}
    >
      {/* <Fetcher /> */}
      {/* <div className="text-5xl font-extrabold mb-8">National Map</div> */}
      <div id="national-map" className="relative w-full h-full">
        {hover && hover.hoveredObject && (
          <div
            style={hoverStyle}
          >
            <div dangerouslySetInnerHTML={{ __html: hover.label }}></div>
          </div>
        )}
        {/* <MapStylePicker
          onStyleChange={onStyleChange}
          currentStyle={state.style}
        /> */}
        <DataFilterControls
          title={'Filter Data'}
          settings={{
            showInState: {
              displayName: 'Show In State',
              type: 'boolean',
              value: true,
            },
          }}
          propTypes={{
            showInState: {
              displayName: 'Show In State',
              type: 'boolean',
              value: true,
            },
          }}
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
            data: filtered,
            // onHover: hover => _onHover(hover),
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
    </div>
  );
};
