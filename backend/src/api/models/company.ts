import { Model } from 'objection'
import { Company as CompanyData } from '@ptdp/lib/types';
import { Tables } from '../../db/constants';

interface Company extends CompanyData {};

// https://dev.to/tylerlwsmith/using-a-typescript-interface-to-define-model-properties-in-objection-js-1231
class Company extends Model {
  id!: number

  static get tableName() {
    return Tables.companies;
  }
}

export default Company;