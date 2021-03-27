import { HexagonLayer, ColumnLayer } from 'deck.gl';
import { pointToHexbin } from './hexagonAggregator';

// import { CPUAggregator } from '@deck.gl/utils';
const DEFAULT_COLOR = [0, 0, 0, 255];

const nop = () => {};

const defaultProps = {
  // color
  getFillColor: { type: 'accessor', value: DEFAULT_COLOR },

  // elevation
  elevationDomain: null,
  elevationRange: [0, 1000],
  getElevationValue: { type: 'accessor', value: null }, // default value is calcuated from `getElevationWeight` and `elevationAggregation`
  getElevationWeight: { type: 'accessor', value: 1 },
  elevationAggregation: 'SUM',
  elevationLowerPercentile: { type: 'number', value: 0, min: 0, max: 100 },
  elevationUpperPercentile: { type: 'number', value: 100, min: 0, max: 100 },
  elevationScale: { type: 'number', min: 0, value: 1 },
  elevationScaleType: 'linear',
  onSetElevationDomain: nop,

  radius: { type: 'number', value: 1000, min: 1 },
  coverage: { type: 'number', min: 0, max: 1, value: 1 },
  extruded: false,
  hexagonAggregator: pointToHexbin,
  getPosition: { type: 'accessor', value: x => x.position },
  // Optional material for 'lighting' shader module
  material: true,

  // data filter
  _filterData: { type: 'function', value: null, optional: true },
};

class PTDPHexagon extends HexagonLayer {
  constructor(props) {
    super(props);
  }

  renderLayers() {
    const {
      elevationScale,
      extruded,
      coverage,
      material,
      transitions,
    } = this.props;
    const { angle, radius, cpuAggregator, vertices } = this.state;

    const SubLayerClass = this.getSubLayerClass('hexagon-cell', ColumnLayer);
    const updateTriggers = this._getSublayerUpdateTriggers();

    const geometry =
      vertices && vertices.length ? { vertices, radius: 1 } : { radius, angle };
    return new SubLayerClass(
      {
        ...geometry,
        diskResolution: 6,
        elevationScale,
        extruded,
        coverage,
        material,

        getFillColor: d => this.props.getFillColor(d),
        getElevation: this._onGetSublayerElevation.bind(this),
        transitions: transitions && {
          getFillColor: this._onGetSublayerColor.bind(this),
          getElevation: this._onGetSublayerElevation.bind(this),
        },
      },
      this.getSubLayerProps({
        id: 'hexagon-cell',
        updateTriggers,
      }),
      {
        data: cpuAggregator.state.layerData.data,
      },
    );
  }
}

PTDPHexagon.defaultProps = defaultProps;

export default PTDPHexagon;
