import React, { useEffect } from 'react'
import { NavBar } from 'app/components/NavBar';
import { Helmet } from 'react-helmet-async';
import { Layout } from './Layout';

export const Data = () => {

    useEffect(() => {
        (document as any).querySelector('body').style.overflow = 'hidden'

        return function cleanUp() {
            (document as any).querySelector('body').style.overflow = ''
        }
    }, [])

    return (
        <div style={{ overflow: 'hidden' }}>
            <Helmet>
                <title>Data</title>
                <meta name="description" content="PTDP Data" />
            </Helmet>
            <NavBar />
            <Layout />
        </div>
    )
}