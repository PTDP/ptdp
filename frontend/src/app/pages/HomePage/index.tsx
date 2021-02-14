import * as React from 'react';
import { Helmet } from 'react-helmet-async';
import { NavBar } from 'app/components/NavBar';
import { Masthead } from './Masthead';
import { Features } from './Features';
import { PageWrapper } from 'app/components/PageWrapper';
import NationalMap from '../NationalMap';

export function HomePage() {
  return (
    <>
      <Helmet>
        <title></title>
        <meta
          name="description"
          content=""
        />
      </Helmet>
      <NavBar />
      {/* <PageWrapper> */}
      <Masthead />
      <NationalMap />
      {/* <Features /> */}
      {/* </PageWrapper> */}
    </>
  );
}
