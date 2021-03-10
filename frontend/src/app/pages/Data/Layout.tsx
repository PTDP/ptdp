import React from "react";
import { NationalMap } from "./Features/NationalMap/index";
import { useSelector, useDispatch } from 'react-redux';
import { useNationalMapSlice } from './Features/NationalMap/slice';
import { selectFilters } from './Features/NationalMap/slice/selectors';
import { FilterCompanies } from './Features/NationalMap/slice/types';

const Radio = ({ name, options }) => {
    const filters = useSelector(selectFilters);
    const dispatch = useDispatch();
    const { actions } = useNationalMapSlice();

    const handleClick = (e) => {
        let { id, name } = e.target;
        console.log(filters)
        if (typeof parseInt(id) === 'number') id = parseInt(id);
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

const SideBar = () => {
    return (
        <div className="flex flex-col h-0 flex-1 border-r border-gray-200 bg-white">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
                <nav className="flex-1 px-2 bg-white space-y-1">
                    <a href="#" className="bg-gray-100 text-gray-900 group flex items-center px-2 py-2 text-sm font-medium rounded-md hover:text-gray-900 hover:bg-gray-100">
                        <svg className="text-gray-400 group-hover:text-gray-500 mr-3 h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
              Select Data
            </a>
                    <div className="flex-col">
                        <Radio name="Data" options={[
                            {
                                id: 'in_state',
                                name: 'call_type',
                                label: "In-State Calls"
                            },
                            {
                                id: 'out_state',
                                name: 'call_type',
                                label: "Out-State Calls"
                            }
                        ]} />
                        <Radio name="Geography" options={[
                            {
                                id: 'facility',
                                name: 'geography',
                                label: "Facility"
                            },
                            {
                                id: 'county',
                                name: 'geography',
                                label: "County"
                            },
                            {
                                id: 'state',
                                name: 'geography',
                                label: "State"
                            }
                        ]} />
                        <Radio name="Company" options={[
                            {
                                id: FilterCompanies.ICS,
                                name: 'company',
                                label: "ICS"
                            },
                            {
                                id: FilterCompanies.SECURUS,
                                name: 'company',
                                label: "Securus"
                            },
                            {
                                id: FilterCompanies.ALL,
                                name: 'company',
                                label: "All"
                            }
                        ]} />
                        <Radio name="Facility Type" options={[
                            {
                                id: 'local',
                                name: 'facility_type',
                                label: "Local"
                            },
                            {
                                id: 'county',
                                name: 'facility_type',
                                label: "County"
                            },
                            {
                                id: 'state',
                                name: 'facility_type',
                                label: "State"
                            },
                            {
                                id: 'federal',
                                name: 'facility_type',
                                label: "Federal"
                            },
                            {
                                id: 'multi',
                                name: 'facility_type',
                                label: "Multi"
                            },
                            {
                                id: 'all',
                                name: 'facility_type',
                                label: "All"
                            },
                        ]} />
                    </div>
                    <a href="#" className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-2 py-2 text-sm font-medium rounded-md">
                        {/* <!-- Heroicon name: outline/inbox --> */}
                        <svg className="text-gray-400 group-hover:text-gray-500 mr-3 h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
              Resources
            </a>
                </nav>
            </div>
        </div>
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