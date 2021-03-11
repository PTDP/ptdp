import { ScatterplotLayer, HexagonLayer, GeoJsonLayer } from 'deck.gl';
import { Service } from 'types/Service';
import { Facility } from 'types/Facility';
import { GeospatialAppBarChartXDomain } from './examples';
import { Filters, Geography } from './slice/types';
import { scaleThreshold } from 'd3-scale';

export const COLOR_SCALE = scaleThreshold()
  .domain(new Array(13).fill(0).map((_, i) => (25 / 13) * i + 0))
  .range([
    [0, 0, 0, 0],
    [127, 205, 187, 0],
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
    [128, 0, 38],
  ]);

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
  lightsPosition: [-73.8, 40.5, 8000, -74.2, 40.9, 8000],
  ambientRatio: 0.4,
  diffuseRatio: 0.6,
  specularRatio: 0.2,
  lightsStrength: [0.8, 0.0, 0.8, 0.0],
  numberOfLights: 2,
};

const elevationRange = [0, 100];

export function renderLayers(
  props: {
    geojson: any;
    points: any;
    settings: Filters;
  },
  forceUpdateNum,
) {
  const { geojson, points, settings } = props;

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
  console.log('TRYING TO RENDER', props);

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
    });

  const hexagon =
    settings.geography.includes(Geography.FACILITY) &&
    new HexagonLayer({
      data: points,
      pickable: true,
      extruded: true,
      radius: 5000,
      elevationScale: 200,
      getElevationValue: fifteenMinute,
      getFillColor: d => COLOR_SCALE(fifteenMinute(d)),
      getPosition: d => {
        try {
          const { latitude, longitude } = d;
          return [longitude, latitude];
        } catch (err) {}
      },
    });

  return [geo, hexagon];
}
