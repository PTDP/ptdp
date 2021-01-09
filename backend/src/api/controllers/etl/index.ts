import * as express from "express";
import * as admin from "firebase-admin";
import { Facility } from "@ptdp/lib/types";
import * as loaders from './loaders';

const router = express.Router();

const facilityConverter = {
  toFirestore(facility: Facility): admin.firestore.DocumentData {
    return facility;
  },
  fromFirestore(
    snapshot: admin.firestore.QueryDocumentSnapshot<Facility>
  ): Facility {
    return snapshot.data();
  },
};


router.post("/etl", async (req: express.Request, res: express.Response) => {
  const { company } = req.body;

  try {
    switch(company) {
      case 'ics':
        await loaders.ics(req.body);
      case 'securus':
          await loaders.securus(req.body);
      default: 
        throw new Error(`ETL for ${company} not found.`)
    }
    res.status(200).send({});
  } catch(err) {
    res.status(404).send({error: err.toString()});
  }
});

router.get("/:id", async (req: express.Request, res: express.Response) => {
  try {
    const facility = await admin
      .firestore()
      .collection(Collections.facilities)
      .doc(req.params.id)
      .withConverter(facilityConverter)
      .get();
    console.log(facility);

    res.status(200).send("hello");
  } catch (err) {
    res.status(400).send({ error: err.toString() });
  }
});

export default router;
