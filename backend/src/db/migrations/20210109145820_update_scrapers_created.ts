import * as Knex from "knex";
import { Tables } from "../constants";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.table(Tables.scrapers, (t) => {
        t.date('input_created_at');
    })
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.table(Tables.scrapers, (t) => {
        t.dropColumn('input_created_at');
    })
}

