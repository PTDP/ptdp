import * as Knex from "knex";
import axios from "axios";
import xlsx from "xlsx";
import csv from "csv/lib/sync";
import parse from "csv-parse/lib/sync";
import { Stusab } from "@ptdp/lib";

import "../index";
import State from "../../api/models/state";
import County from "../../api/models/county";
import { Tables } from "../constants";
import Congressional from "../../api/models/congressional";

type StateReturn = {
  [K in Stusab]?: { state_fips: string; stusab: string; state_name: string };
};

const stateMap = async (): Promise<StateReturn> => {
  const t: StateReturn = {};
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
          state_name: STATE_NAME,
        };
      });
  }

  return t;
};

const seedStates = async () => {
  const states = await stateMap();

  for (const state of Object.values(states)) {
    const match = await State.query().findOne(
      "fips",
      "=",
      `${state?.state_fips}`
    );
    if (!match) {
      await State.query().insert({
        fips: state?.state_fips,
        name: state?.state_name,
        stusab: state?.stusab,
      });
    }
  }
};

const seedCounties = async () => {
  const GEOS =
    "https://www2.census.gov/programs-surveys/popest/geographies/2018/all-geocodes-v2018.xlsx";

  const geos = (
    await axios.get(GEOS, {
      responseType: "arraybuffer",
    })
  ).data;

  var workbook = xlsx.read(geos);
  const csv = xlsx.utils
    .sheet_to_csv(workbook.Sheets[workbook.SheetNames[0]])
    .split("\n")
    .slice(4)
    .join("\n");

  const records = parse(csv, {
    columns: true,
    skip_empty_lines: true,
  });

  const summary_levels = {
    state: "040",
    county: "050",
  };

  const counties = records.filter(
    (r: any) => r["Summary Level"] === summary_levels.county
  );

  for (let i = 0; i < counties.length; i++) {
    const county = counties[i];

    const state_fips = county["State Code (FIPS)"];
    const fips = county["County Code (FIPS)"];
    const name =
      county["Area Name (including legal/statistical area description)"];

    const match = (
      await County.query()
        .where("fips", "=", fips)
        .where("state_fips", "=", state_fips)
    ).find(Boolean);
    if (match) {
      console.log(`County with name ${match.name} duplicate.`);
      continue;
    }

    await County.query().insert({
      fips,
      name,
      state_fips,
    });
  }
};

const seedCongressional = async () => {
  const CONGRESSIONAL =
    "https://theunitedstates.io/congress-legislators/legislators-current.csv";

  const r = (await axios.get(CONGRESSIONAL)).data;

  let records = parse(r, {
    columns: true,
    skip_empty_lines: true,
  });

  records = records.filter((c: any) => c.type === "rep");

  for (let i = 0; i < records.length; i++) {
    const congressional = records[i];
    const state = await State.query().findOne(
      "stusab",
      "=",
      congressional.state
    );
    if (!state) {
      console.warn(`No state record found for ${state}, skipping district`);
      continue;
    }
    const match = await Congressional.query()
      .where("fips", "=", congressional.district)
      .where("state_fips", "=", state.fips);
    if (!match) {
      await Congressional.query().insert({
        fips: congressional.district,
        name: `${state.name} District ${congressional.district}`,
        state_fips: state.fips,
      });
    }
  }
};

export async function seed(knex: Knex): Promise<void> {
  await knex(Tables.states).del();
  await knex(Tables.counties).del();
  await knex(Tables.congressional_districts).del();

  try {
    await seedStates();
    await seedCounties();
    await seedCongressional();
  } catch (err) {
    console.error(err);
  }
}
