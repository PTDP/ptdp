import * as express from 'express';
import * as admin from 'firebase-admin';
import { Facility } from '@ptdp/types';
import { Collections } from '../../constants';

const router = express.Router()

const facilityConverter = {
    toFirestore(facility: Facility): admin.firestore.DocumentData { return facility },
    fromFirestore(
      snapshot: admin.firestore.QueryDocumentSnapshot<Facility>
    ): Facility {
      return snapshot.data();
    }
  };

router.post('/', (req: express.Request, res: express.Response) => {
    res.status(200).send(`Hello ${req.body.name}!`);  
})

router.get('/:id', async (req: express.Request, res: express.Response) => {
 try {
     const facility = await admin.firestore().collection(Collections.facilities).doc(req.params.id).withConverter(facilityConverter).get();
     console.log(facility)

    res.status(200).send('hello');  
 } catch(err) {
     res.status(400).send({error: err.toString()})
 }
});

export default router;