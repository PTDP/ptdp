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
import { Filters, FilterCompanies, Geography, CallType, FacilityType, SecureLVL } from './slice/types';
import { Facility } from 'types/Facility'
import { createImmutableStateInvariantMiddleware } from '@reduxjs/toolkit';
import counties from 'us-atlas/counties-10m.json';
import * as topojson from 'topojson-client';
import yj from 'yieldable-json';

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
const Loader = () => (
  <div id="hello" className="flex items-center justify-center w-full h-full" style={{ zIndex: 1000, position: 'absolute' }}>
    <div className="ease-linear rounded-full border-4 border-t-4 border-white h-6 w-6 loader-blue" style={{
      borderTopColor: '#2f80ed'
    }} />

  </div >
)

const parseAsync = (json: string): Promise<any> => {
  return new Promise((res, rej) => {
    return yj.parseAsync(json, (err, data) => {
      if (err) return rej(err);
      res(data);
    })
  })
}

const stringifyAsync = (json: any): Promise<any> => {
  return new Promise((res, rej) => {
    return yj.stringifyAsync(json, (err, data) => {
      if (err) return rej(err);
      res(data);
    })
  })
}

const layers = {
  points: [],
  gj: [],
  settings: {}
} as any;

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
  const [forceUpdateNum, forceUpdate] = useReducer(x => x + 1, 0);
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const { actions } = useNationalMapSlice();

  const isLoading = useSelector(selectLoading);
  const facilities = useSelector(selectFacilities);
  const filters = useSelector(selectFilters);

  useEffect(() => {
    dispatch(actions.loadFacilities());
  }, []);

  useEffect(() => {
    if (!filters || !facilities) return;
    onFilterUpdate();
  }, [filters, facilities])

  const sortByCounty = () => {
    const facilitiesByFips = {};

    layers.points.forEach((f) => {
      if (facilitiesByFips[f.hifldByHifldid.countyfips]) {
        facilitiesByFips[f.hifldByHifldid.countyfips].push(f)
      } else {
        facilitiesByFips[f.hifldByHifldid.countyfips] = [f];
      }
    })
    const geojson = topojson.feature(counties, counties.objects.counties);

    geojson.features.forEach((g) => {
      let max = 0;
      if (facilitiesByFips[g.id]) {
        try {
          facilitiesByFips[g.id].forEach((f) => {
            f.companyFacilitiesByCanonicalFacilityId.nodes.forEach(el => {
              el.ratesByCompanyFacilityId.nodes.forEach((r, i) => {
                max = Math.max(max, r.amountInitial + r.amountAdditional * 14);
              });
            });
          })
        } catch (err) { }
      }
      g.properties.fifteenMinute = max;
    })

    layers.gj = geojson;
  }

  async function onFilterUpdate() {
    setLoading(true);
    await setFilters(filters)
    await sortByCounty();
    forceUpdate();
    setLoading(false);
  }

  async function setFilters(filters: Filters) {
    layers.settings = filters;
    const filter = (d: Facility) => {

      if (d.hidden) return false;
      // Canonical Facility Filters
      try {
        if (!filters.facility_type.includes(d.hifldByHifldid.type)) return false;
        if (!filters.secure_level.includes(d.hifldByHifldid.securelvl)) return false;
      } catch (err) {
      }

      // Company Facility Filters
      try {
        d.companyFacilitiesByCanonicalFacilityId.nodes = d.companyFacilitiesByCanonicalFacilityId.nodes.filter((c) => {
          if (!filters.company.includes(c.company)) return false;

          // Rate filters
          c.ratesByCompanyFacilityId.nodes = c.ratesByCompanyFacilityId.nodes.filter((f) => {
            return filters.call_type == CallType.IN_STATE ? f.inState : !f.inState;
          })

          return true;
        })
      } catch (err) {

      }

      return true;
    }
    const str = await stringifyAsync(facilities);
    const j = await parseAsync(str);

    layers.points = j.filter(filter);
    console.log(layers.points)
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

  if (!layers.points.length) {
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
      <div id="national-map" className="relative w-full h-full">
        {hover && hover.hoveredObject && (
          <div
            style={hoverStyle}
          >
            <div dangerouslySetInnerHTML={{ __html: hover.label }}></div>
          </div>
        )}
        <div className={`${loading && 'opacity-50'}`}>
          <DeckGL
            {...state.settings}
            onWebGLInitialized={_onWebGLInitialize}
            layers={renderLayers({
              points: layers.points,
              geojson: layers.gj,
              settings: layers.settings
            }, forceUpdateNum)}
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
        </div>
        {loading && <Loader />}
        {/* <Charts
              {...state}
              highlight={hour => _onHighlight(hour)}
              select={hour => _onSelect(hour)}
            /> */}
      </div>
    </div>
  );
};