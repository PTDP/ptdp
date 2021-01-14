import { Model } from "objection";
import { County as CountyData } from "@ptdp/lib/types";
import { Tables } from "../../db/constants";

interface County extends CountyData {}

// https://dev.to/tylerlwsmith/using-a-typescript-interface-to-define-model-properties-in-objection-js-1231
class County extends Model {
  id!: number;

  static get tableName() {
    return Tables.counties;
  }
}

export default County;
