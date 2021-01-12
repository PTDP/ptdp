import { Model } from "objection";
import { Rate as RateData } from "@ptdp/lib/types";
import { Tables } from "../../db/constants";
import Scraper from "./scraper";

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
      scrapers: {
        relation: Model.BelongsToOneRelation,
        modelClass: Scraper,
        join: {
          from: `${Tables.rates}.service_id`,
          to: `${Tables.scrapers}.id`,
        },
      },
    };
  }
}

export default Rate;
