import { Model } from 'objection'
import { Service as ServiceData } from '@ptdp/lib/types';

import Company from './company';
import { Tables } from '../../db/constants';

interface Service extends ServiceData {};

// https://dev.to/tylerlwsmith/using-a-typescript-interface-to-define-model-properties-in-objection-js-1231
class Service extends Model {
  id!: number

  static get tableName() {
    return Tables.services;
  }

  static get relationMappings() {
      return {
        services: {
            relation: Model.BelongsToOneRelation,
            modelClass: Company,
            join: {
                from: `${Tables.services}.company_id`,
                to: `${Tables.companies}.id`
            }
        }
      }
  }
}

export default Service;