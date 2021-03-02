import * as express from "express";
// import * as db from "../../csv_db";
// import * as db from "../../csv_db";
// import * as geocode from "./transformers/geocode";
import * as scripts from "../scripts";
import * as loaders from "./loaders";

import axios from "axios";

const router = express.Router();

router.post("/", async (req: express.Request, res: express.Response) => {
  const { company, results_url } = req.body;

  try {
    const data = await (await axios.get(results_url)).data;

    switch (company) {
      case "ics":
        await loaders.ics(data);
        break;
      case "securus":
        // await loaders.securus(data);
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
