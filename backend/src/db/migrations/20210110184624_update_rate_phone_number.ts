import * as Knex from "knex";
import { Tables } from '../constants';

export async function up(knex: Knex): Promise<void> {
    return knex.schema.alterTable(Tables.rates, (t) => {
        t.text('phone_number').alter();
    })
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.alterTable(Tables.rates, (t) => {
        t.integer('phone_number').alter();
    })
}

