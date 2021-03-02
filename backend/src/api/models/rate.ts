import { Model } from "objection";
import { IRate as RateData } from "../../types";
import { Tables } from "../../db/constants";
import CompanyFacility from "./company_facility";

interface Rate extends RateData {}

// https://dev.to/tylerlwsmith/using-a-typescript-interface-to-define-model-properties-in-objection-js-1231
class Rate extends Model {
  id!: number;

  static get tableName() {
    return Tables.rates;
  }

  $parseDatabaseJson(json: any) {
    json = super.$parseDatabaseJson(json);
    json.seen_at =
      json.seen_at && json.seen_at.map((d: Date) => d.toISOString());
    return json;
  }

  static get relationMappings() {
    return {
      companyFacility: {
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
