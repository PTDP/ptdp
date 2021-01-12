import * as Knex from "knex";
import { Tables } from "../constants";

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex(Tables.services).del();

  // Inserts seed entries
  await knex(Tables.services).insert([
    { id: 1, name: "Default" },
    { id: 2, name: "AdvancedConnect", company_id: 1 },
    { id: 3, name: "Direct Bill", company_id: 1 },
    { id: 4, name: "Inmate Debit", company_id: 1 },
    { id: 5, name: "Traditional Collect", company_id: 1 },
    { id: 6, name: "Voicemail", company_id: 1 },
  ]);
}
