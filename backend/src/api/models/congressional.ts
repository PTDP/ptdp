import { Model } from "objection";
import { Congressional as CongressionalData } from "@ptdp/lib/types";
import { Tables } from "../../db/constants";

interface Congressional extends CongressionalData {}

// https://dev.to/tylerlwsmith/using-a-typescript-interface-to-define-model-properties-in-objection-js-1231
class Congressional extends Model {
  id!: number;

  static get tableName() {
    return Tables.congressional_districts;
  }
}

export default Congressional;
