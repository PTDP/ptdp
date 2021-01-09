import * as Knex from "knex";
import { Tables } from '../constants';


export async function up(knex: Knex): Promise<void> {
    return knex.schema.table(Tables.rates, (t) => {
        t.integer('service_id').references('id').inTable(Tables.services).onDelete('CASCADE');
    })
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.table(Tables.rates, (t) => {
        t.dropColumn('service_id');
    })
}
