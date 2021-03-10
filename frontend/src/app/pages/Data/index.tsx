import React from 'react'
import { NavBar } from 'app/components/NavBar';
import { Helmet } from 'react-helmet-async';
import { Layout } from './Layout';

export const Data = () => {
    return (
        <>
            <Helmet>
                <title>Data</title>
                <meta name="description" content="PTDP Data" />
            </Helmet>
            <NavBar />
            <Layout />
        </>
    )
}