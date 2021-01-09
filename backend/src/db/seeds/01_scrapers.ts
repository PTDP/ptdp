import * as Knex from "knex";

import { Tables } from '../constants';
import init from './data/01_scrapers.json';

export async function seed(knex: Knex): Promise<void> {

    // Deletes ALL existing entries
    await knex(Tables.scrapers).del();

    const { uuid, createdAt } = init;

    // Inserts seed entries
    await knex(Tables.scrapers).insert([
        { id: 1, uuid, input_created_at: new Date(createdAt).toISOString(), input: JSON.stringify(init) }
    ]);
};
