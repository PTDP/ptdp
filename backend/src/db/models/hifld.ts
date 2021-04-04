import { Model } from "objection";
import { HIFLD as HIFLDData } from "../../types";
import { Tables } from "../constants";

interface HIFLD extends HIFLDData {}

// https://dev.to/tylerlwsmith/using-a-typescript-interface-to-define-model-properties-in-objection-js-1231
class HIFLD extends Model {
  id!: number;

  static get tableName() {
    return Tables.hifld;
  }
}

export default HIFLD;
