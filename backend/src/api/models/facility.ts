import { Model } from "objection";
import { Facility as FacilityData } from "@ptdp/lib/types";
import { Tables } from "../../db/constants";

interface Facility extends FacilityData {}

// https://dev.to/tylerlwsmith/using-a-typescript-interface-to-define-model-properties-in-objection-js-1231
class Facility extends Model {
  id!: number;

  static get tableName() {
    return Tables.facilities;
  }
}

export default Facility;
