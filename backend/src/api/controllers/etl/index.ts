import * as express from "express";
import * as loaders from './loaders';
import axios from 'axios';

const router = express.Router();

router.post("/", async (req: express.Request, res: express.Response) => {
  const { company, results_url } = req.body;

  try {
    const data = await (await axios.get(results_url)).data;

    switch(company) {
      case 'ics':
        await loaders.ics(data);
        break;
      case 'securus':
        await loaders.securus(data);
        break;
      default: 
        throw new Error(`ETL for ${company} not found.`)
    }

    res.status(200).send({});
  } catch(err) {
    res.status(404).send({error: err.toString()});
  }
});

export default router;
