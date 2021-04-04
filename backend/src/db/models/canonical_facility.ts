import { Model } from "objection";
import { ICanonicalFacility as CanonicalFacilityData } from "../../types";
import { Tables } from "../constants";

interface CanonicalFacility extends CanonicalFacilityData {}

// https://dev.to/tylerlwsmith/using-a-typescript-interface-to-define-model-properties-in-objection-js-1231
class CanonicalFacility extends Model {
  id!: number;

  static get tableName() {
    return Tables.canonicalFacilities;
  }
}

export default CanonicalFacility;
