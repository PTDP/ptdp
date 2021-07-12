import React, { useEffect } from 'react'
import { NavBar } from 'app/components/NavBar';
import { Helmet } from 'react-helmet-async';
import { Layout } from './Layout';
import { Footer } from 'app/components/Footer';

export const Resources = () => {

    return (
        <div style={{ overflow: 'hidden' }}>
            <Helmet>
                <title>Resources</title>
                <meta name="description" content="PTDP Data" />
            </Helmet>
            <NavBar />
            <Layout />
            {/* <Footer /> */}
        </div>
    )
}