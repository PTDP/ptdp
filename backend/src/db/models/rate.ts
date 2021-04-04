import { Model } from "objection";
import { IRate as RateData } from "../../types";
import { Tables } from "../constants";
import CompanyFacility from "./company_facility";

interface Rate extends RateData {}

// https://dev.to/tylerlwsmith/using-a-typescript-interface-to-define-model-properties-in-objection-js-1231
class Rate extends Model {
  id!: number;

  static get tableName() {
    return Tables.rates;
  }

  static get relationMappings() {
    return {
      companyFacilities: {
        relation: Model.BelongsToOneRelation,
        modelClass: CompanyFacility,
        join: {
          from: `${Tables.rates}.companyFacilityId`,
          to: `${Tables.companyFacilities}.id`,
        },
      },
    };
  }
}

export default Rate;
