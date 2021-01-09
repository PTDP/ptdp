import * as Knex from "knex";
import { Tables } from '../constants';


export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable(Tables.rates, (table) => {
        table.increments();
        table.timestamps(true, true)

        table.float('initial_amount');
        table.float('additional_amount');
        table.float('initial_duration');
        table.float('over_duration');
        table.float('tax');
        table.integer('phone_number');

        table.integer('scraper');
        table.date('scraped_at');
        
        table.json('raw');

        table.integer('scraper_id').references('id').inTable(Tables.scrapers).onDelete('CASCADE');
        table.integer('company_id').references('id').inTable(Tables.companies).onDelete('CASCADE');
        table.integer('facility_id').references('id').inTable(Tables.facilities).onDelete('CASCADE');
    })
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema
    .dropTable(Tables.rates);
}

