import * as express from "express";
import * as loaders from "./loaders";
import * as geocode from './transformers/geocode';

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

router.post("/geocode/:model", async (req: express.Request, res: express.Response) => {
  const { model } = req.params;
  const { force } = req.query;

  try {
    switch(model) {
      case 'facilities':
        await geocode.facilities(!!force);
        break;
        default:
          throw new Error(`No geocode transformer found for ${model}`)
    }
  } catch(err) {
    res.status(400).send({ error: err.toString() });
  }

})

export default router;
