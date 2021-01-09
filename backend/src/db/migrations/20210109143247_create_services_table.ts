import * as Knex from "knex";
import { Tables } from '../constants';

export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable(Tables.services, (table) => {
        table.increments();
        table.timestamps(true, true)

        table.string('name');

        table.integer('company_id').references('id').inTable(Tables.companies).onDelete('CASCADE');
    })
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema
    .dropTable(Tables.companies);
}

