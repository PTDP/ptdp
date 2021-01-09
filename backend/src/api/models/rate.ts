import { Model } from 'objection'
import { Rate as RateData } from '@ptdp/lib/types';
import { Tables } from '../../db/constants';

interface Rate extends RateData {};

// https://dev.to/tylerlwsmith/using-a-typescript-interface-to-define-model-properties-in-objection-js-1231
class Rate extends Model {
  id!: number

  static get tableName() {
    return Tables.rates;
  }

  static get relationMappings() {
      return {
        services: {
            relation: Model.HasOneRelation,
            modelClass: Animal,
            join: {
                from: 'persons.fatherId',
                to: 'persons.id'
            }
        }
      }
  }
}

export default Rate;