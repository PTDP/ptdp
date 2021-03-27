import React from "react";
import { NationalMap } from "./Features/NationalMap/index";
import { useSelector, useDispatch } from 'react-redux';
import { useNationalMapSlice } from './Features/NationalMap/slice';
import { selectFilters } from './Features/NationalMap/slice/selectors';
import { FilterCompanies, Geography, CallType, FacilityType, SecureLVL } from './Features/NationalMap/slice/types';

const Radio = ({ name, options }) => {
    const filters = useSelector(selectFilters);
    const dispatch = useDispatch();
    const { actions } = useNationalMapSlice();

    const handleClick = (e) => {
        let { id, name } = e.target;

        if (!Number.isNaN(parseInt(id))) id = parseInt(id);
        dispatch(actions.updateFilters({ ...filters, [name]: id }));
    }

    return (
        <div id="fieldset" className="p-2">
            <div>
                <legend className="text-base font-medium text-gray-900">{name}</legend>
                {/* <p className="text-sm text-gray-500">These are delivered via SMS to your mobile phone.</p> */}
            </div>
            <div className="mt-4 space-y-4 pl-2">
                {options.map((o) => {
                    return (
                        <div className="flex items-center">
                            <input onClick={handleClick} checked={o.id === filters[o.name]} id={o.id} name={o.name} type="radio" className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300" />
                            <label htmlFor={o.id} className="ml-3 block text-sm font-medium text-gray-700">
                                {o.label}
                            </label>
                        </div>
                    )
                })}
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
                                <input onClick={handleClick} id={o.id} name={o.name} checked={filters && filters[`${o.name}`].includes(o.id)} type="checkbox" className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded" />
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
    return (
        <div className="flex flex-col h-0 flex-1 border-r border-gray-200 bg-white">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
                <nav className="flex-1 px-2 bg-white space-y-1 mb-24">
                    <a href="#" className="bg-gray-100 text-gray-900 group flex items-center px-2 py-2 text-sm font-medium rounded-md hover:text-gray-900 hover:bg-gray-100">
                        <svg className="text-gray-400 group-hover:text-gray-500 mr-3 h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
              Select Data
            </a>
                    <div className="flex-col">
                        <Radio name="Data" options={[
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

                        <Toggle name="Geography" options={[
                            {
                                id: Geography.FACILITY,
                                name: 'geography',
                                label: "Facility"
                            },
                            {
                                id: Geography.COUNTY,
                                name: 'geography',
                                label: "County"
                            }]}
                        />
                        <Toggle name="Company" options={[
                            {
                                id: FilterCompanies.ICS,
                                name: 'company',
                                label: "ICS"
                            },
                            {
                                id: FilterCompanies.SECURUS,
                                name: 'company',
                                label: "Securus"
                            }
                        ]} />
                        <Toggle name="Facility Type" options={[
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
                            {
                                id: FacilityType.FEDERAL,
                                name: 'facility_type',
                                label: "Federal"
                            },
                            {
                                id: FacilityType.MULTI,
                                name: 'facility_type',
                                label: "Multi"
                            },

                        ]} />

                        <Toggle name="Secure Level" options={[
                            {
                                id: SecureLVL.CLOSE,
                                name: 'secure_level',
                                label: "Close"
                            },
                            {
                                id: SecureLVL.JUVENILE,
                                name: 'secure_level',
                                label: "Juvenile"
                            },
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