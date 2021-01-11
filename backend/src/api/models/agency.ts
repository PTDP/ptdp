import { Model } from 'objection'
import { Agency as AgencyData } from '@ptdp/lib/types';
import { Tables } from '../../db/constants';

interface Agency extends AgencyData {};

// https://dev.to/tylerlwsmith/using-a-typescript-interface-to-define-model-properties-in-objection-js-1231
class Agency extends Model {
  id!: number

  static get tableName() {
    return Tables.agencies;
  }
}

export default Agency;