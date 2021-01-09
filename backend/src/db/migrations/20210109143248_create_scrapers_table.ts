import * as Knex from "knex";
import { Tables } from '../constants';

export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable(Tables.scrapers, (table) => {
        table.increments();
        table.timestamps(true, true);

        table.string('uuid');
        table.json('input');
    })
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema
    .dropTable(Tables.scrapers);
}

