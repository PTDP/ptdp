import * as Knex from "knex";
import { Tables } from '../constants';

export async function seed(knex: Knex): Promise<void> {
    // Deletes ALL existing entries
    await knex(Tables.companies).del();

    // Inserts seed entries
    await knex(Tables.companies).insert([
        { id: 1, name: "Securus" },
        { id: 2, name: "ICS" }
    ]);
};
