import { Model } from "objection";
import { State as StateData } from "@ptdp/lib/types";
import { Tables } from "../../db/constants";

interface State extends StateData {}

// https://dev.to/tylerlwsmith/using-a-typescript-interface-to-define-model-properties-in-objection-js-1231
class State extends Model {
  id!: number;

  static get tableName() {
    return Tables.states;
  }
}

export default State;