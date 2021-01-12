import { Model } from "objection";
import { CanonicalRate as CanonicalRateData } from "@ptdp/lib/types";
import { Tables } from "../../db/constants";
import Service from "./service";
import Company from "./company";
import Facility from "./facility";

interface CanonicalRate extends CanonicalRateData {}

// https://dev.to/tylerlwsmith/using-a-typescript-interface-to-define-model-properties-in-objection-js-1231
class CanonicalRate extends Model {
  id!: number;

  static get tableName() {
    return Tables.canonical_rates;
  }

  static get relationMappings() {
    return {
      services: {
        relation: Model.BelongsToOneRelation,
        modelClass: Service,
        join: {
          from: `${Tables.rates}.service_id`,
          to: `${Tables.services}.id`,
        },
      },
      companies: {
        relation: Model.BelongsToOneRelation,
        modelClass: Company,
        join: {
          from: `${Tables.rates}.company_id`,
          to: `${Tables.companies}.id`,
        },
      },
      facilities: {
        relation: Model.BelongsToOneRelation,
        modelClass: Facility,
        join: {
          from: `${Tables.rates}.facility_id`,
          to: `${Tables.facilities}.id`,
        },
      },
    };
  }
}

export default CanonicalRate;
