import { ScatterplotLayer, HexagonLayer } from 'deck.gl';
import { Service } from 'types/Service';
import { Facility } from 'types/Facility';
import { GeospatialAppBarChartXDomain } from './examples';

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

/*
      getPosition: d => {
        const {
          latitude,
          longitude,
        } = d.canonicalFacilityByCanonicalFacilityId;
        console.log(d);
        return [longitude, latitude];
      },
      getColor: d => (d.company === Company.ICS ? ICS_COLOR : SECURUS_COLOR),
*/

export function renderLayers(props: {
  data: Facility[];
  // onHover: hover => _onHover(hover),
  settings: any;
}) {
  // console.log('RERENDERING LAYERS');
  console.log('props.data.length', props.data.length);
  let i = 0;
  // const { data, onHover, settings } = props;
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

    new HexagonLayer({
      data: props.data,
      pickable: true,
      extruded: true,
      radius: 5000,
      elevationScale: 200,
      getElevationValue: (d: Facility) => {
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
      },
      getPosition: d => {
        try {
          const { latitude, longitude } = d;
          return [longitude, latitude];
        } catch (err) {}
      },
    }),
    // new ScatterplotLayer({
    //   id: 'scatterplot-layer',
    //   data: props.data,
    //   pickable: true,
    //   opacity: 0.8,
    //   stroked: true,
    //   filled: true,
    //   radiusScale: 6,
    //   radiusMinPixels: 1,
    //   radiusMaxPixels: 100,
    //   lineWidthMinPixels: 1,
    //   getPosition: d => {
    //     try {
    //       const {
    //         latitude,
    //         longitude,
    //       } = d.canonicalFacilityByCanonicalFacilityId;
    //       console.log(d);
    //       return [longitude, latitude];
    //     } catch (err) {}
    //   },
    //   getRadius: d => 2000,
    //   getFillColor: d =>
    //     d.company === Company.ICS ? ICS_COLOR : SECURUS_COLOR,
    //   getLineColor: d => [0, 0, 0],
    // }),
  ];
}
