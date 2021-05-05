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
import { selectFacilities, selectLoading, selectError, selectFilters, selectCounties, selectBoundaries, selectStates } from './slice/selectors';
import { Filters, FilterCompanies, Geography, CallType, FacilityType, SecureLVL } from './slice/types';
import { Facility } from 'types/Facility'
import { createImmutableStateInvariantMiddleware } from '@reduxjs/toolkit';
import counties from 'us-atlas/counties-10m.json';
import * as topojson from 'topojson-client';
import yj from 'yieldable-json';
import { from } from '@apollo/client';
import { fifteenMinuteRate, maxCanonicalFacilityRate, stats } from './utils';
import stateNormalizer from 'us-state-codes';

const INITIAL_VIEW_STATE = {
  longitude: -98.5795,
  latitude: 39.8283,
  zoom: 4,
  minZoom: 1,
  maxZoom: 16,
  pitch: 55,
  bearing: 0,
};

const Loader = () => (
  <div id="hello" className="flex items-center justify-center w-full h-full" style={{ zIndex: 1000, position: 'absolute' }}>
    <div className="ease-linear rounded-full border-4 border-t-4 border-white h-6 w-6 loader-blue" style={{
      borderTopColor: '#2f80ed'
    }} />

  </div >
)

const DataSummary = () => {

  return (
    <div id="hello" className="flex flex-col bg-white rounded-sm shadow-sm w-1/4 h-1/4 top-4 right-4 p-6" style={{ zIndex: 1000, position: 'absolute' }}>
      <div className="text-sm font-medium">Data Summary</div>
      Hello
    </div>
  )
}

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

type DataSummary = {
  max15Minute: number | null,
  mean15Minute: number | null,
  median15Minute: number | null
  numFacilities: number | null
}

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
        hoveredlayer: ''
      },
      settings: Object.keys(HEXAGON_CONTROLS).reduce(
        (accu, key) => ({
          ...accu,
          [key]: HEXAGON_CONTROLS[key].value,
        }),
        {},
      ),
      selectedFacilities: [],
      style: 'mapbox://styles/mapbox/light-v9',
      hexagonRadius: 2000
    },

  );

  const [, updateState] = React.useState();
  const u: any = {};
  const [forceUpdateNum, forceUpdate] = useReducer(x => x + 1, 0);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<DataSummary>({
    max15Minute: null,
    mean15Minute: null,
    median15Minute: null,
    numFacilities: null
  })

  const dispatch = useDispatch();
  const { actions } = useNationalMapSlice();

  const isLoading = useSelector(selectLoading);
  const facilities = useSelector(selectFacilities);
  const filters = useSelector(selectFilters);
  const counties = useSelector(selectCounties);
  const states = useSelector(selectStates);

  const [chartExpanded, setChartExpanded] = useState(false);

  useEffect(() => {
    dispatch(actions.loadFacilities());
  }, []);

  useEffect(() => {
    if (!filters || !facilities || !counties?.features?.length) return;
    onFilterUpdate();
  }, [filters, facilities])

  const sortByState = () => {
    const stateFacilitiesByState = {};
    layers.points.forEach((f) => {
      if (f.hifldByHifldid.type == "STATE") {
        const state = stateNormalizer.getStateNameByStateCode(f.hifldByHifldid.state).toUpperCase()
        if (stateFacilitiesByState[state]) {
          stateFacilitiesByState[state].push(f)
        } else {
          stateFacilitiesByState[state] = [f]
        }
      }
    });
    console.log(stateFacilitiesByState)
    let filteredStateGeoJSON = { ...states };

    filteredStateGeoJSON = (filteredStateGeoJSON.features as any).map((g) => {
      let max = 0;
      console.log(g.properties)
      // console.log(`${g.id}-${g.properties.name}`);
      if (stateFacilitiesByState[g.properties.name.toUpperCase()]) {
        try {
          // console.log('here')
          stateFacilitiesByState[g.properties.name.toUpperCase()].forEach((f) => {
            max = Math.max(max, maxCanonicalFacilityRate(f));
          });
        } catch (err) { }
      }

      if (max === 0) return null;
      else {
        return {
          ...g,
          properties: {
            ...g.properties,
            fifteenMinute: max
          }
        }
      }
    }).filter((el) => !!el);

    layers.states = filteredStateGeoJSON;
  }
  const sortByCounty = () => {
    const facilitiesByFips = {};
    layers.points.forEach((f) => {
      const paddedFips = ("00000" + f.hifldByHifldid.countyfips).slice(-5)

      if (facilitiesByFips[`${paddedFips}-${f.hifldByHifldid.county}`]) {
        facilitiesByFips[`${paddedFips}-${f.hifldByHifldid.county}`].push(f)
      } else {
        facilitiesByFips[`${paddedFips}-${f.hifldByHifldid.county}`] = [f];
      }
    });

    let filteredGeoJSON = { ...counties };
    filteredGeoJSON = (filteredGeoJSON.features as any).map((g) => {
      let max = 0;
      // console.log(`${g.id}-${g.properties.name}`);
      if (facilitiesByFips[`${g.id}-${g.properties.name.toUpperCase()}`]) {
        try {
          // console.log('here')
          facilitiesByFips[`${g.id}-${g.properties.name.toUpperCase()}`].forEach((f) => {
            max = Math.max(max, maxCanonicalFacilityRate(f));
          });
        } catch (err) { }
      }

      if (max === 0) return null;
      else {
        return {
          ...g,
          properties: {
            ...g.properties,
            fifteenMinute: max
          }
        }
      }
    }).filter((el) => !!el);

    layers.gj = filteredGeoJSON;
  }

  async function onFilterUpdate() {
    setLoading(true);
    await setFilters(filters)
    await sortByCounty();
    await sortByState();
    forceUpdate();
    setLoading(false);
  }

  async function setFilters(filters: Filters) {
    layers.settings = filters;
    const filter = (d: Facility) => {
      // Canonical Facility Filters
      try {
        if (!filters.facility_type.includes(d.hifldByHifldid.type)) return false;
        if (!filters.secure_level.includes(d.hifldByHifldid.securelvl)) return false;
      } catch (err) {
        console.error(err);
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
        console.error(err);
      }

      return true;
    }

    let j = [];

    try {
      const str = await JSON.stringify(facilities);
      j = await parseAsync(str);

      // setSummary({
      //   // mean15Minute
      //   // max15Minute
      //   // number
      // })
    } catch (err) {
      console.error(err);
    }



    const result: Facility[] = j.filter(filter);
    const { min, max, fifteenMinuteBins } = stats(result);
    const { fifteen_minute_percentiles } = filters;

    layers.points = result;
  }

  const hoveredFacility = () => {
    return state.hover.hoveredObject && state.hover.hoveredLayer !== 'geojson-layer';
  }

  const _onHover = props => {
    const { x, y, object, hoveredObject, layer, picked } = props;
    if (!picked) {
      return setState(
        {
          hover: {
            x: 0,
            y: 0,
            hoveredObject: null,
            label: '',
            hoveredLayer: null
          }
        })
    }
    if (layer.id === 'geojson-layer' && (!object || object?.properties?.fifteenMinute === 0)) {
      if (state.hover.hoveredObject !== null) {
        setState({
          hover: {
            x: 0,
            y: 0,
            hoveredObject: null,
            label: ''
          }
        });
      }
      return
    };
    const label = layer.id === 'geojson-layer' ? `${object.properties.name} County` : `${object?.points?.map(p => p?.source?.hifldByHifldid?.name).filter((elt, i, arr) => arr.indexOf(elt) === i).join('</br>')}`;
    setState({ hover: { x, y, hoveredObject: object?.points ? object?.points : object, label, hoveredLayer: layer.id } });
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

  const _onClick = (e) => {
    const { hoveredObject, hoveredLayer } = state?.hover;
    if (hoveredLayer !== 'geojson-layer') {
      const source = hoveredObject;
      if (!source) {
        console.error('No source for hoveredObject found');
        return;
      }
      const hiflds = Array.from(new Set(source.map(f => f.source.hifldid)));

      console.log('hiflds', hiflds)
      const selectedFacilities = facilities.filter((f) => hiflds.includes(f.hifldid));
      console.log('selectedFacilities', selectedFacilities)
      setState({ ...state, selectedFacilities })
      if (selectedFacilities.length) {
        setChartExpanded(true);
      }
    }
  }

  const _updateLayerSettings = settings => {
    setState({ settings });
  };

  const { viewState, controller = true } = props;

  if (!layers.points.length) {
    return null;
  }


  const { hover, hexagonRadius } = state;
  const hoverStyle = {
    ...tooltipStyle,
    transform: `translate(${hover.x + 8}px, ${hover.y + 8}px)`,
  } as React.CSSProperties;

  return (
    <>
      {/* <div style={{ height: 64 }}></div> */}
      <div
        id="map-container"
        style={{
          // position: 'fixed',/
          //marginTop: '64px',
          height: 'calc(100vh - 64px)'
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
          {/* <DataSummary /> */}
          <div className={`${loading && 'opacity-50'}`}>
            <DeckGL
              {...state.settings}
              onClick={_onClick}
              getCursor={() => hoveredFacility() ? "pointer" : "move"}
              onWebGLInitialized={_onWebGLInitialize}
              layers={renderLayers({
                fifteen_minute_percentiles: filters.fifteen_minute_percentiles,
                points: layers.points,
                geojson: layers.gj,
                states: layers.states,
                settings: layers.settings,
                onHover: hover => _onHover(hover),
                hexagonRadius
              }, forceUpdateNum)}
              initialViewState={INITIAL_VIEW_STATE}
              viewState={viewState}
              controller={controller}

            // onViewStateChange={(e) => {
            //   const { oldViewState, viewState } = e;
            //   console.log('viewstate', viewState)
            //   if (viewState.zoom > 5 && oldViewState.zoom < 5) {
            //     setState({
            //       ...state,
            //       hexagonRadius: 500
            //     })
            //   } else if (viewState.zoom < 5 && oldViewState.zoom > 5) {
            //     setState({
            //       ...state,
            //       hexagonRadius: 2000
            //     })
            //   }
            // }}
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
          <Charts
            // {...state}
            highlight={() => { }}
            select={() => { }}
            selectedFacilities={state.selectedFacilities}
            chartExpanded={chartExpanded}
            setChartExpanded={setChartExpanded}
          // highlight={hour => _onHighlight(hour)}
          // select={hour => _onSelect(hour)}
          />
        </div>
      </div >
    </>
  );
};
