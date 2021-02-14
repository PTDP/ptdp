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
    settings.showScatterplot &&
      new ScatterplotLayer({
        id: 'scatterplot',
        getPosition: d => [d.longitude, d.latitude],
        getColor: d => (d.pickup ? PICKUP_COLOR : DROPOFF_COLOR),
        getRadius: d => 5,
        opacity: 0.5,
        pickable: true,
        radiusMinPixels: 0.25,
        radiusMaxPixels: 30,
        data,
        onHover,
        ...settings,
      }),
    settings.showHexagon &&
      new HexagonLayer({
        id: 'heatmap',
        colorRange: HEATMAP_COLORS,
        elevationRange,
        elevationScale: 2000,
        extruded: true,
        getPosition: d => [d.longitude, d.latitude],
        lightSettings: LIGHT_SETTINGS,
        getElevationValue: d => {
          return (
            14 *
              (d[0]?.canonicalRatesByFacilityId.nodes?.[0]
                ?.ratesByCanonicalRateId.nodes?.[0]?.additionalAmount || 0) +
            (d[0]?.canonicalRatesByFacilityId.nodes?.[0]?.ratesByCanonicalRateId
              .nodes?.[0]?.initalAmount || 0)
          );
        },

        getColorValue: d => {
          return (
            d[0]?.canonicalRatesByFacilityId.nodes?.[0]?.companyByCompanyId?.[
              'name'
            ]
              .trim()
              .charCodeAt(0) + 200
          );
        },
        opacity: 0.25,
        pickable: true,
        data,
        onHover,
        ...settings,
      }),
  ];
}
