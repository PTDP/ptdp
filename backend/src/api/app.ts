import * as express from 'express';
import facilities from './controllers/facilities';

const app = express();

app.use('/facilities', facilities);

export default app;