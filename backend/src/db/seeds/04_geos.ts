import * as Knex from "knex";
import axios from "axios";
import xlsx from "xlsx";
import csv from "csv/lib/sync";
import parse from "csv-parse/lib/sync";
import State from '../../api/models/state';
import County from '../../api/models/county';
import { Stusab } from'@ptdp/lib'
import { Tables } from '../constants'

type StateReturn = { [K in Stusab]?: { state_fips: string, stusab: string, state_name: string}};

const stateMap = async () : Promise<StateReturn>  => {
    const t : StateReturn = {};
    const result = await axios.get(
      `https://www2.census.gov/geo/docs/reference/state.txt`
    );
  
    if (result) {
    (csv as any)
        .parse(result.data, {
          delimiter: "|",
        })
        .forEach((e: any, i: any) => {
          if (i === 0) return;
  
          const [STATE, STUSAB, STATE_NAME] = e;
          (t as any)[STUSAB] = {
              state_fips: STATE,
              stusab: STUSAB,
              state_name: STATE_NAME
          };
        });
    }
  
    return t;
}

const CONGRESSIONAL = 'https://raw.githubusercontent.com/CivilServiceUSA/us-house/master/us-house/data/us-house.csv';

const GEOS = 'https://www2.census.gov/programs-surveys/popest/geographies/2018/all-geocodes-v2018.xlsx';

export async function seed(knex: Knex): Promise<void> {
    await knex(Tables.states).del();
    await knex(Tables.counties).del();

    try {

        const geos = (await axios.get(GEOS, {
            responseType: 'arraybuffer'
        })).data;

        var workbook = xlsx.read(geos);
        const csv = xlsx.utils.sheet_to_csv(workbook.Sheets[workbook.SheetNames[0]]).split('\n').slice(4).join('\n');

        const records = parse(csv, {
            columns: true,
            skip_empty_lines: true
          })

        const summary_levels = {
            state: '040',
            county: '050'
        }

        const counties = records.filter((r : any) => r['Summary Level'] === summary_levels.county);
        const states = await stateMap();

        for (const state of Object.values(states)) {
            const match = await State.query().findOne('fips', '==', `${state?.state_fips}`);
            console.log('match', match)
            if (!match) {
                console.log({
                    fips: state?.state_fips,
                    name: state?.state_name,
                    stusab: state?.stusab
                })
                await State.query().insert({
                    fips: state?.state_fips,
                    name: state?.state_name,
                    stusab: state?.stusab
                })
            }
        }

        for (let i = 0; i < counties.length; i++) {
            const county = counties[i];
            const match = await County.query().findOne('fips', '==', county['Place Code (FIPS)']);
            if (!match) {
                console.log({
                    fips: county['Place Code (FIPS)'],
                    name: county['Area Name (including legal/statistical area description)'],
                })
                await County.query().insert({
                    fips: county['Place Code (FIPS)'],
                    name: county['Area Name (including legal/statistical area description)']
                });
            }
        }

        

    } catch(err) {
        console.error(err);
    }
};

seed('' as any);
