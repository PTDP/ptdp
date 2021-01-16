const functions = require('firebase-functions');
import { postgraphile } from 'postgraphile';

export default postgraphile(
    functions.config().db.connection,
    'public',
    {
        watchPg: true,
        graphiql: true,
        enhanceGraphiql: true,
    }
)