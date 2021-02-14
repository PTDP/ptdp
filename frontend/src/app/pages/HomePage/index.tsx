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
        <title>Home Page</title>
        <meta
          name="description"
          content="A React Boilerplate application homepage"
        />
      </Helmet>
      <NavBar />
      {/* <PageWrapper> */}
      <Masthead />
      <div style={{ height: '100vh', width: '100vw', display: 'block', position: 'relative' }}>
        <NationalMap />
      </div>
      {/* <Features /> */}
      {/* </PageWrapper> */}
    </>
  );
}
