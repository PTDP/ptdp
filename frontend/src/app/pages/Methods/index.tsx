import React from 'react';
import { Layout } from './Layout';
import { NavBar } from 'app/components/NavBar';
import { Helmet } from 'react-helmet-async';
import { Footer } from 'app/components/Footer';

export const Methods = () => {

    return (
        <div style={{ overflow: 'hidden' }}>
            <Helmet>
                <title>Methods</title>
                <meta name="description" content="PTDP Data" />
            </Helmet>
            <NavBar />
            <Layout />
            {/* <Footer /> */}
        </div>
    )
}