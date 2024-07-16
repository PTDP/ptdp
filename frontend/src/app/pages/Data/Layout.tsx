import React from "react";
import { NationalMap } from "./Features/NationalMap/index";
import { useSelector, useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';

import { useNationalMapSlice } from './Features/NationalMap/slice';
import { selectFilters } from './Features/NationalMap/slice/selectors';
import { FilterCompanies, Geography, CallType, FacilityType, SecureLVL } from './Features/NationalMap/slice/types';
import { RangeSlider } from '../../components/RangeSlider';

const Link = ({ link, text }) => {
    return (
        <a
            className="cursor-pointer underline"
            onClick={e => {
                e.preventDefault();
                window.open(link);
            }}
        >
            {text}
        </a>
    );
};

const Radio = ({ name, options }) => {
    const filters = useSelector(selectFilters);
    const dispatch = useDispatch();
    const { actions } = useNationalMapSlice();

    const handleClick = (e) => {
        let { name } = e.target;
        let id = e.target.getAttribute("data-object-id")
        if (!Number.isNaN(parseInt(id))) id = parseInt(id);
        dispatch(actions.updateFilters({ ...filters, [name]: id }));
    }

    return (
        <div id="fieldset" className={`p-2 ${name}`}>
            <div>
                <legend className="text-base font-medium text-gray-900">{name}</legend>
                {/* <p className="text-sm text-gray-500">These are delivered via SMS to your mobile phone.</p> */}
            </div>
            <div className="mt-4 space-y-4 pl-2">
                {options.map((o) => {
                    return (
                        <div className="flex items-center">
                            <input onClick={handleClick} data-object-id={o.id} checked={o.id === filters[o.name]} id={`${o.name}-${o.id}`} name={o.name} type="radio" className="focus:ring-purple-500 h-4 w-4 text-purple-600 border-gray-300" />
                            <label htmlFor={`${o.name}-${o.id}`} className="ml-3 block text-sm font-medium text-gray-700">
                                {o.label}
                            </label>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

const Range = ({ name, property }) => {
    const { actions } = useNationalMapSlice();
    const dispatch = useDispatch();
    const filters = useSelector(selectFilters);

    const setValue = (v: number[]) => {
        console.log(v);
        dispatch(actions.updateFilters({ ...filters, [property]: v }));
    }
    return (
        <div className="ml-3">
            <div className="block text-sm font-medium text-gray-700 pt-2">{name}</div>
            <div className="pt-2 ml-2 mr-8">
                <RangeSlider setValue={setValue} />
            </div>
        </div>
    )
}

const Toggle = ({ name, options }) => {
    const filters = useSelector(selectFilters);
    const dispatch = useDispatch();
    const { actions } = useNationalMapSlice();

    const handleClick = (e) => {
        let { id, name, checked } = e.target;

        if (!Number.isNaN(parseInt(id))) id = parseInt(id);

        let n: number[] = [];
        filters[name].forEach(nme => n.push(nme));

        if (checked) {
            n.push(id);
            n = Array.from(new Set(n));
        } else {
            n = n.filter(e => e !== id);
        }

        if (n.length === 0) return;

        dispatch(actions.updateFilters({ ...filters, [name]: n }));
    }
    return (
        <div id="fieldset" className="p-2">
            <div>
                <legend className="text-base font-medium text-gray-900">{name}</legend>
                {/* <p className="text-sm text-gray-500">These are delivered via SMS to your mobile phone.</p> */}
            </div>
            <div className="mt-4 space-y-4 pl-2 flex-col">
                {options.map((o) => {
                    return (
                        <div className="relative flex items-start">
                            <div className="flex items-center h-5">
                                <input onClick={handleClick} id={o.id} name={o.name} checked={filters && filters[`${o.name}`].includes(o.id)} type="checkbox" className="focus:ring-purple-500 h-4 w-4 text-purple-600 border-gray-300 rounded" />
                            </div>
                            <div className="ml-3 text-sm">
                                <label htmlFor={o.id} className="font-medium text-gray-700">{o.label}</label>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

const SideBar = () => {
    const history = useHistory();

    const handleClick = (e) => {
        e.preventDefault();
        history.push(new URL(e.target.href).pathname)
    }

    return (
        <div className="flex flex-col h-0 flex-1 border-r border-gray-200 bg-white">
            <div className="flex flex-col pb-4 overflow-y-auto">
                <nav className="mt-10 px-2 bg-white space-y-1 mb-24" >
                    <a href="#" className="bg-gray-100 text-gray-900 group flex items-center px-2 py-2 text-sm font-medium rounded-md hover:text-gray-900 hover:bg-gray-100">
                        <svg className="text-gray-400 group-hover:text-gray-500 mr-3 h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
              Instructions
            </a>
                    <div className="text-xs pl-2 pr-2" style={{ marginTop: '1rem' }}>
                        <div>
                            Hover facilities or counties to get basic information about them.
                        </div>
                        <div className="mt-2">
                            Click highlighted facilities to view detailed rate data.
                        </div>
                        
                        <div className="mt-2">
                            For more information about where our data comes from, and why not all facilities are represented read about our <a className="underline" href="/methods" onClick={handleClick}>methods</a>.
                        </div>

                        <div className="mt-2">
                            The #ConnectFamiliesNow Data Project is driven by volunteers. 
                        </div>
                    </div>
                    <div className="flex-col">
                          <Radio name="Facility Type" options={[
                            {
                                id: Geography.LOCAL,
                                name: 'geography',
                                label: "Local"
                            },
                            {
                                id: Geography.COUNTY,
                                name: 'geography',
                                label: "County"
                            },
                            {
                                id: Geography.STATE,
                                name: 'geography',
                                label: "State"
                            }
                        ]}
                        />
                        <Radio name="Call Type" options={[
                            {
                                id: CallType.IN_STATE,
                                name: 'call_type',
                                label: "In-State Calls"
                            },
                            {
                                id: CallType.OUT_STATE,
                                name: 'call_type',
                                label: "Out-State Calls"
                            }
                        ]} />
                        {/* <Range name={"15 Minute Rate Percentile"} property={"fifteen_minute_percentiles"} /> */}
                        <Toggle name="Company" options={[
                            {
                                id: FilterCompanies.ICS,
                                name: 'company',
                                label: "IC Solutions"
                            },
                            {
                                id: FilterCompanies.SECURUS,
                                name: 'company',
                                label: "Securus"
                            },
                            {
                                id: FilterCompanies.GTL,
                                name: 'company',
                                label: "Global Tel Link"
                            }
                        ]} />
                        {/* <Toggle name="Population" options={[
                            {
                                id: Geography.COUNTY,
                                name: 'geography',
                                label: "Include Unknown"
                            }]}
                        /> */}

                        {/* <Range name={"Min / Max"} property={"capacity_bounds"} /> */}

                        {/* <Toggle name="Facility Type" options={[
                            {
                                id: FacilityType.LOCAL,
                                name: 'facility_type',
                                label: "Local"
                            },
                            {
                                id: FacilityType.COUNTY,
                                name: 'facility_type',
                                label: "County"
                            },
                            {
                                id: FacilityType.STATE,
                                name: 'facility_type',
                                label: "State"
                            },
                            // {
                            //     id: FacilityType.FEDERAL,
                            //     name: 'facility_type',
                            //     label: "Federal"
                            // },
                            // {
                            //     id: FacilityType.MULTI,
                            //     name: 'facility_type',
                            //     label: "Multi"
                            // },

                        ]} /> */}
                        <Toggle name="Secure Level" options={[
                            // {
                            //     id: SecureLVL.CLOSE,
                            //     name: 'secure_level',
                            //     label: "Close"
                            // },
                            // {
                            //     id: SecureLVL.JUVENILE,
                            //     name: 'secure_level',
                            //     label: "Juvenile"
                            // },
                            {
                                id: SecureLVL.MINIMUM,
                                name: 'secure_level',
                                label: "Minimum"
                            },
                            {
                                id: SecureLVL.MEDIUM,
                                name: 'secure_level',
                                label: "Medium"
                            },
                            {
                                id: SecureLVL.MAXIMUM,
                                name: 'secure_level',
                                label: "Maximum"
                            },
                            {
                                id: SecureLVL.NOT_AVAILABLE,
                                name: 'secure_level',
                                label: "Not Available"
                            },

                        ]} />
                    </div>
                </nav>
            </div>
        </div >
    )
}


export const Layout = () => {
    return (
        <div className="h-screen flex overflow-hidden bg-gray-100">
            <div className="hidden md:flex md:flex-shrink-0">
                <div className="flex flex-col w-72">
                    <SideBar />
                </div>
            </div>
            <div className="w-full">
                <NationalMap />
            </div>
        </div>
    )
}