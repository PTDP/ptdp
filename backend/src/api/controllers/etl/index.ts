import * as express from "express";
import * as scripts from "../scripts";
import * as loaders from "./loaders";
import * as storage from "./storage";
import * as git from "./git";
import path from "path";
import axios from "axios";

import { ScrapeResult, ICSRate, SecurusRate } from "@ptdp/lib";

const router = express.Router();

router.post(
  "/load-all",
  async (req: express.Request, res: express.Response) => {
    const files = (await storage.listFilesByPrefix("etl/")).filter(
      (f) => path.extname(f.name) === ".json" && !f.name.includes("deprecated")
    );
    const errors = [];

    const x = [files[0]];
    for (const file of x) {
      try {
        const data = await storage.fileToJSON(file);
        const company = file.name.split("/")[1];

        console.log("Processing ", file.name);

        switch (company) {
          case "ics":
            await loaders.ics(data as ScrapeResult<ICSRate>);
            break;
          case "securus":
            await loaders.securus(data as ScrapeResult<SecurusRate>);
            break;
          default:
            throw new Error(`ETL for ${company} not found.`);
        }
      } catch (err) {
        console.error(err);
        errors.push(err.toString());
      }
    }
    res.status(200).send({ errors });
  }
);

router.post(
  "/sync-git",
  async (req: express.Request, res: express.Response) => {
    await git.CompanyFacility.sync();
    await git.CanonicalFacility.sync();
    await git.Rate.sync();
    res.send({});
  }
);

router.post("/", async (req: express.Request, res: express.Response) => {
  const { company, results_url } = req.body;

  try {
    const data = await (await axios.get(results_url)).data;

    switch (company) {
      case "ics":
        await loaders.ics(data);
        break;
      case "securus":
        await loaders.securus(data);
        break;
      default:
        throw new Error(`ETL for ${company} not found.`);
    }

    res.status(200).send({});
  } catch (err) {
    res.status(400).send({ error: err.toString() });
  }
});

router.post("/scripts", async () => {
  await scripts.canonical_rate_updates_20210215094529();
});

router.post(
  "/geocode/:model",
  async (req: express.Request, res: express.Response) => {
    const { model } = req.params;
    // const { force } = req.query;

    try {
      switch (model) {
        case "facilities":
          // await geocode.facilities(!!force);
          break;
        default:
          throw new Error(`No geocode transformer found for ${model}`);
      }
      res.status(200).send({ success: true });
    } catch (err) {
      res.status(400).send({ error: err.toString(), success: false });
    }
  }
);

router.post("/query", async (req: express.Request, res: express.Response) => {
  try {
    await scripts.geocode_company();
    // const r = await db.Facility.query();
    // console.log(r);
    // await db.Contract.insert([]);
    // const cs = await db.Facility.serialize(r);
    // console.log(cs);
    await res.status(200).send({ success: true });
  } catch (err) {
    console.error(err);
    res.status(400).send({ error: err.toString(), success: false });
  }
});

export default router;
