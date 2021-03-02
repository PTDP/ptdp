import { Model } from "objection";
import { ICompanyFacility as CompanyFacilityData } from "../../types";
import { Tables } from "../constants";
import CanonicalFacility from "./canonical_facility";

interface CompanyFacility extends CompanyFacilityData {}

// https://dev.to/tylerlwsmith/using-a-typescript-interface-to-define-model-properties-in-objection-js-1231
class CompanyFacility extends Model {
  id!: number;

  static get tableName() {
    return Tables.companyFacilities;
  }

  static get relationMappings() {
    return {
      canonicalFacilities: {
        relation: Model.BelongsToOneRelation,
        modelClass: CanonicalFacility,
        join: {
          from: `${Tables.companyFacilities}.canonicalFacilityId`,
          to: `${Tables.canonicalFacilities}.id`,
        },
      },
    };
  }
}

export default CompanyFacility;
