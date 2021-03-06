import express from "express";
import * as functions from "firebase-functions";
import axios from "axios";
import scraper_input from "../../../constants/scraper_input/8d92f5a0-61fa-44be-a535-efc6af2491e7.json";
import { Stusab } from "@ptdp/lib";

const router = express.Router();

export type ScraperInput = {
  uuid: string;
  createdAt: number;
  data: {
    [K in Stusab]?: StateInput;
  };
};

export type StateInput = {
  in_state_phone: string;
  out_state_phone: string;
  state_fips: string;
  stusab: string;
};

const createRequestChunks = (
  scraper_input: ScraperInput,
  num_chunks: number
) => {
  const chunks: ScraperInput[] = [];

  const keys = Object.keys(scraper_input.data);
  const states = Object.values(scraper_input.data);
  const chunk = states.length / num_chunks;
  if (Math.floor(chunk) !== chunk) throw new Error("Need even chunks");
  let activeChunk = {
    uuid: scraper_input.uuid,
    createdAt: scraper_input.createdAt,
    data: {},
  };

  let activeChunkStart = 0;
  for (let i = 0; i < states.length + chunk; i++) {
    if (i < activeChunkStart + chunk) {
      (activeChunk.data as any)[keys[i]] = states[i];
    } else {
      chunks.push({ ...activeChunk });
      activeChunkStart = i;
      activeChunk.data = {};
      (activeChunk.data as any)[keys[i]] = states[i];
    }
  }

  return chunks;
};

router.post("/all", async (req: express.Request, res: express.Response) => {
  const errors: any[] = [];
  const chunks = createRequestChunks(scraper_input, 5);

  let count = 0;
  for (const chunk of chunks) {
    for (const scraper_endpoint of functions.config().scraper_endpoints) {
      try {
        await axios.post(scraper_endpoint, chunk);
        count += 1;
      } catch (err) {
        errors.push(err.toString());
      }
    }
  }

  res
    .status(200)
    .send({ errors, messsage: `Triggered ${count} scraper runs.` });
});

export default router;
