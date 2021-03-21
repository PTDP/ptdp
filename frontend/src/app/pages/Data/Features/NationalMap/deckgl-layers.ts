import { ScatterplotLayer, HexagonLayer, GeoJsonLayer,ColumnLayer } from 'deck.gl';
import { Service } from 'types/Service';
import { Facility } from 'types/Facility';
import { GeospatialAppBarChartXDomain } from './examples';
import { Filters, Geography } from './slice/types';
import { scaleThreshold } from 'd3-scale';
import { maxCanonicalFacilityRate } from './utils';
import {SimpleMeshLayer} from '@deck.gl/mesh-layers';
import {CubeGeometry} from '@luma.gl/core'

const COLOR_RANGE_COUNTY = [
  [127, 205, 187],
  [199, 233, 180],
  [237, 248, 177],
  // zero
  [255, 255, 204],
  [255, 237, 160],
  [254, 217, 118],
  [254, 178, 76],
  [253, 141, 60],
  [252, 78, 42],
  [227, 26, 28],
  [189, 0, 38],
  [168, 0, 38],
]

const COLOR_RANGE = [
  [100, 205, 187],
  [127, 205, 187],
  [227, 233, 180],
  [237, 248, 177],
  // zero
  [255, 255, 204],
  [255, 237, 160],
  [254, 217, 118],
  [254, 178, 76],
  [253, 141, 60],
  [252, 78, 42],
  [227, 26, 28],
  [189, 0, 38],
  [168, 0, 38],
]

export const COLOR_SCALE = scaleThreshold()
  .domain(new Array(14).fill(0).map((_, i) => -1 + (25 / 14) * i + 0))
  .range(COLOR_RANGE_COUNTY);

// TODO Make imports work so this can be removed!
export enum Company {
  'ICS' = 1,
  'SECURUS' = 2,
}

const SECURUS_COLOR = [114, 19, 108];
const ICS_COLOR = [243, 185, 72];

// const HEATMAP_COLORS = [
//   [255, 255, 204],
//   [199, 233, 180],
//   [127, 205, 187],
//   [65, 182, 196],
//   [44, 127, 184],
//   [37, 52, 148],
// ];

export const latestOutStateCanonical = d => {
  return d[0]?.canonicalRatesByFacilityId?.nodes?.find(r => !r.inState);
};

export const latestInStateCanonical = d => {
  return d[0]?.canonicalRatesByFacilityId?.nodes?.find(r => r.inState);
};

export const latestRateFromCanonical = d => {
  return d?.ratesByCanonicalRateId.nodes?.[0];
};

export const fifteenMinute = rate => {
  return 14 * (rate?.additionalAmount || 0) + (rate?.initalAmount || 0);
};

export const latestOutstateRate = d => {
  return latestRateFromCanonical(latestOutStateCanonical(d));
};

export const latestInStateRate = d => {
  return latestRateFromCanonical(latestInStateCanonical(d));
};

const company = d =>
  d[0]?.canonicalRatesByFacilityId.nodes?.[0]?.companyByCompanyId?.['name']
    .trim()
    .charCodeAt(0) + 200;

const HEATMAP_COLORS = [
  [7, 217, 37],
  [0, 116, 200],
];

const LIGHT_SETTINGS = {
  lightsPosition: [-122.45, 37.75, 8000, -122.0, 38.00, 5000],
  ambientRatio:  0.3,
  diffuseRatio: 0.5,
  specularRatio: 0.9,
  lightsStrength: [2.0, 0, 0, 0],
  numberOfLights: 3
};

const elevationRange = [0, 100];

export function renderLayers(
  props: {
    geojson: any;
    points: any;
    settings: Filters;
    onHover: any;
  },
  forceUpdateNum,
) {
  const { geojson, points, settings, onHover } = props;
  (window as any).lastForceUpdateNum = forceUpdateNum;

  const fifteenMinute = d => {
    let max = 0;
    try {
      d[0].companyFacilitiesByCanonicalFacilityId.nodes.forEach(el => {
        el.ratesByCompanyFacilityId.nodes.forEach((r, i) => {
          max = Math.max(max, r.amountInitial + r.amountAdditional * 14);
        });
      });
    } catch (err) {
      console.error(err);
    }
    return max;
  };

  if (!settings) return;

  const geo =
    settings.geography.includes(Geography.COUNTY) &&
    new GeoJsonLayer({
      id: 'geojson-layer',
      data: geojson,
      pickable: true,
      stroked: true,
      filled: true,
      extruded: true,

      lineWidthScale: 20,
      lineWidthMinPixels: 2,
      getFillColor: d => COLOR_SCALE(d.properties.fifteenMinute),
      // getElevation: d => d.properties.fifteenMinute,
      getLineColor: [255, 255, 255],
      getRadius: 100,
      // elevationScale: 5000,
      getLineWidth: 200,
      onHover,
    });

  const maxCanFacilitiesArray = (arr: Facility[]) => {
    let max = 0;
    arr.forEach((cf) => {
      max = Math.max(maxCanonicalFacilityRate(cf), max);
    })
    return max;
  }

  // const mesh = new SimpleMeshLayer({
  //   id: 'mesh-layer',
  //   data: points,  
  //   // texture: 'texture.png',
  //   mesh: new CubeGeometry(),
  //   sizeScale:10000,
  //   getPosition: d => {
  //     try {
  //       // console.log(d)
  //       if (d.hifldid === 10005337) console.log(d);
  //       const { latitude, longitude } = d;
  //       return [longitude, latitude];
  //     } catch (err) {
  //       console.error(err);
  //     }
  //   },
  //   getColor: d => {
  //     try {
  //       // return [255, 255, 255];
  //       return COLOR_SCALE(maxCanonicalFacilityRate(d))
  //     } catch(err) {
  //       console.error(err);
  //     }
  //   },
  //   autoHighlight: true,
  //   onHover
  //   // // getOrientation: d => [0, 90, 0]
  // });

  // const column = new ColumnLayer({
  //   id: 'column-layer',
  //   onHover,
  //   data: points,  
  //   diskResolution: 12,
  //   radius: 2500,
  //   extruded: true,
  //   pickable: true,
  //   elevationScale: 5000,
  //   getPosition: d => {
  //     try {
  //       if (d.hifldid === 10005337) console.log(d);
  //       const { latitude, longitude } = d;
  //       return [longitude, latitude];
  //     } catch (err) {
  //       console.error(err);
  //     }
  //   },
  //   getFillColor: d => {
  //     try {
  //       return COLOR_SCALE(maxCanFacilitiesArray([d]));
  //     } catch(err) {
  //       console.error(err);
  //     }
  //   },
  //   getLineColor: [0, 0, 0],
  //   getElevation: d => maxCanFacilitiesArray([d]),
  //   // offset: d => [d.name.charCodeAt(0) * 50, d.name.charCodeAt(0) * 50]
  // });


  const column =
    settings.geography.includes(Geography.FACILITY) &&
    new HexagonLayer({
      onHover,
      data: points,  
      radius: 2500,
      coverage: 1,
      elevationScale: 200,
      elevationDomain: [0, 25],
      extruded: true,
      filled: true,
      lowerPercentile: 0,
      getElevationValue: d => {
        try {
          d.forEach((el) => {
            if (el.hifldid === 10003791) {
              console.log(maxCanFacilitiesArray(d));
              console.log(d)
            }
          })
          return maxCanFacilitiesArray(d) 
        } catch(err) {
          return 0
        }
      },
      getPosition: d => {
      try {
        if (d.hifldid === 10005337) console.log(d);
        const { latitude, longitude } = d;
        return [longitude, latitude];
      } catch (err) {
        console.error(err);
      }
    },
      getColorValue: d => {
        try {
          return maxCanFacilitiesArray(d);
        } catch(err) {
          console.error(err);
        }
      },
      wireframe: false,
  
      autoHighlight: true,
      // highlightColor: [0, 0, 128, 128],
      opacity: 25,
      pickable: true,
      // lightSettings: LIGHT_SETTINGS,
      colorRange: COLOR_RANGE
    });

  return [geo, column];
}
