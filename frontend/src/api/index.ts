import {
  ApolloProvider,
  ApolloClient,
  createHttpLink,
  InMemoryCache,
  from,
} from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { API } from '../app/constants';

const errorLink = onError(errorResponse => {
  if (errorResponse) {
    console.error(errorResponse);
  }
});

const link = from([
  errorLink,
  createHttpLink({
    uri: API + '/graphql',
  }),
]);

const client = new ApolloClient({
  link,
  cache: new InMemoryCache(),
});

export default client;
