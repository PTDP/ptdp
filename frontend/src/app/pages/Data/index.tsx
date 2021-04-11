import React, { useEffect } from 'react'
import { NavBar } from 'app/components/NavBar';
import { Helmet } from 'react-helmet-async';
import { Layout } from './Layout';
import { isMobile } from 'mobile-device-detect';

const MobileFallback = () => {
    return (
        <div className="flex flex-col items-center justify-center p-8" style={{ height: '85vh' }}>
            <div className="text-center font-bold">
                For the best experience, explore PTDP data on a desktop device
        </div>
            <div className="text-center mt-4">
                (Mobile version coming soon!)
        </div>
        </div>
    )
}

export const Data = () => {

    useEffect(() => {
        (document as any).querySelector('body').style.overflow = 'hidden'

        return function cleanUp() {
            (document as any).querySelector('body').style.overflow = 'scroll'
        }
    }, [])

    return (
        <div style={{ overflow: 'hidden' }}>
            <Helmet>
                <title>Data</title>
                <meta name="description" content="PTDP Data" />
            </Helmet>
            <NavBar />
            {isMobile ? <MobileFallback /> : <Layout />}
        </div>
    )
}