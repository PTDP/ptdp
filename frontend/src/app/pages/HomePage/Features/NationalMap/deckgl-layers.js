import { ScatterplotLayer, HexagonLayer } from 'deck.gl';

const PICKUP_COLOR = [114, 19, 108];
const DROPOFF_COLOR = [243, 185, 72];

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

export function renderLayers(props) {
  const { data, onHover, settings } = props;
  return [
    // settings.showScatterplot &&
    //   new ScatterplotLayer({
    //     id: 'scatterplot',
    //     getPosition: d => [d.longitude, d.latitude],
    //     getColor: d => (d.pickup ? PICKUP_COLOR : DROPOFF_COLOR),
    //     getRadius: d => 5,
    //     opacity: 0.5,
    //     pickable: true,
    //     radiusMinPixels: 0.25,
    //     radiusMaxPixels: 30,
    //     data,
    //     onHover,
    //     ...settings,
    //   }),
    settings.showOutState &&
      new HexagonLayer({
        id: 'out-state',
        colorRange: HEATMAP_COLORS,
        elevationRange,
        elevationScale: 2000,
        extruded: true,
        getPosition: d => [d.longitude, d.latitude],
        lightSettings: LIGHT_SETTINGS,
        getElevationValue: d => fifteenMinute(latestOutstateRate(d)),
        getColorValue: company,
        radius: 10000,
        opacity: 0.25,
        pickable: true,
        data,
        onHover,
        ...settings,
      }),
    settings.showInState &&
      new HexagonLayer({
        id: 'in-state',
        colorRange: HEATMAP_COLORS,
        elevationRange,
        elevationScale: 2000,
        extruded: true,
        getPosition: d => [d.longitude, d.latitude],
        lightSettings: LIGHT_SETTINGS,
        getElevationValue: d => fifteenMinute(latestInStateRate(d)),
        getColorValue: company,
        radius: 10000,
        opacity: 0.25,
        pickable: true,
        data,
        onHover,
        ...settings,
      }),
  ];
}
