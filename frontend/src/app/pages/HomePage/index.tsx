import * as React from 'react';
import { Helmet } from 'react-helmet-async';
import { NavBar } from 'app/components/NavBar';
import { Footer } from 'app/components/Footer';
import { Masthead } from './Masthead';
import { Features } from './Features';
import { PageWrapper } from 'app/components/PageWrapper';

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
      {/* <NavBar /> */}
      {/* <PageWrapper> */}
      <Masthead />
      {/* <Features /> */}
      {/* </PageWrapper> */}
      <Footer />
    </>
  );
}
