import React, { useState, useEffect, useRef } from 'react';

import { Facility, Rate, CF } from 'types/Facility';
import { Service } from 'types/Service'

import { FilterCompanies, CallType } from './slice/types';
import { InfoIcon, ArrowsExpand, Minimize, Mail } from '../../../../components/Icons/index';
import ReactTooltip from 'react-tooltip';
import { curveCatmullRom } from 'd3-shape';

import { fifteenMinuteRate } from './utils';



const CicularButton = ({ children, className, onClick }) => {
    return (
        <button type="button" onClick={onClick} className={`inline-flex items-center p-1 border border-transparent rounded-full shadow-sm text-gray-500 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-50 ${className}`}>
            {children}
        </button>
    )
}

const charts = "bg-white rounded-sm shadow-sm text-xs h-80 p-6 absolute bottom-4 left-4"

const styleExpanded = {
    width: '65%',
    height: '90%',
    overflow: 'scroll',
    minWidth: '530px'
}

const styleNotExpanded = {
    height: 50,
}

const ChartMinimized = ({ handleClick }) => (
    <div className={" bottom-4 left-4 absolute bg-white rounded-sm shadow-sm text-xs p-4 flex items-center"} style={styleNotExpanded} >
        {/* <div className="flex items-center justify-center">
            <h2 className="mr-2">Facility Details</h2>
            <CicularButton className="" onClick={handleClick}>
                <ArrowsExpand _style={{ height: 20, width: 20 }} />
            </CicularButton>
        </div> */}
    </div>
)


export default function StateData({
                                   selectedState,
                                   expanded,
                                   setExpanded

                               }: {
    selectedState: any,
    expanded: boolean,
    setExpanded: any
}) {
    const tab = "py-4 px-1 text-center border-b-2 font-medium text-xs"
    const inActiveTab = "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300";
    const activeTab = "border-green-500 text-green-600";


    // const max15 = () => {
    //     let max = 0;
    //     selectedFacility?.companyFacilitiesByCanonicalFacilityId.nodes.forEach((node) => {
    //         node.ratesByCompanyFacilityId.nodes.forEach((r) => {
    //             max = Math.max(max, fifteenMinuteRate(r));
    //         })
    //     })
    //     return max;
    // }

    // const rates: Rate[] = []

    // selectedFacility?.companyFacilitiesByCanonicalFacilityId.nodes.forEach((node) => {
    //     node.ratesByCompanyFacilityId.nodes.forEach((r) => {
    //         rates.push(r);
    //     })
    // })

    const products: Record<string, CF[]> = {};

    const handleClick = () => {
        setExpanded(!expanded);
    }


    const handleMail = () => {
        window.open('mailto:prison.telecom.data.project@gmail.com')
    }

    if (!expanded) return (
        <ChartMinimized handleClick={handleClick} />
    )

    const JAN_1_2021 = 1609459200 * 1000;



    if (!selectedState) return null;

    return (
    <div className={charts} style={expanded ? styleExpanded : styleNotExpanded} >
        <div>
            <div className="hidden sm:block">
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex" aria-label="Tabs">
                        <h2 className={tab}>{selectedState}</h2>
                    </nav>
                </div>
            </div>
            <CicularButton className="absolute top-2 right-2 " onClick={handleClick}>
                <Minimize _style={{ height: 20, width: 20 }} />
            </CicularButton>
        </div>
    </div >
    );
}
