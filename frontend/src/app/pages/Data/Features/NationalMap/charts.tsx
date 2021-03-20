import React, { useState, useEffect } from 'react';
import { li } from './style';

import { Facility, Rate, CF } from 'types/Facility';
import { Service } from 'types/Service'

import { FilterCompanies, CallType } from './slice/types';
import { InfoIcon, ArrowCircleLeft, ArrowCircleRight, ArrowsExpand, Minimize, Mail } from '../../../../components/Icons/index';
import ReactTooltip from 'react-tooltip';
import { curveCatmullRom } from 'd3-shape';
import axios from 'axios'

import { fifteenMinuteRate } from './utils';

import {
  XYPlot,
  XAxis,
  YAxis,
  ChartLabel,
  HorizontalGridLines,
  VerticalGridLines,
  LineSeries,
  LineSeriesCanvas,
  Line,
  DiscreteColorLegend,
  LabelSeries,
  LineMarkSeries
} from 'react-vis';
import { cd } from 'shelljs';
import { latestOutstateRate } from './deckgl-layers';

const CicularButton = ({ children, className, onClick }) => {
  return (
    <button type="button" onClick={onClick} className={`inline-flex items-center p-1 border border-transparent rounded-full shadow-sm text-gray-500 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-50 ${className}`}>
      {children}
    </button>
  )
}

const charts = "bg-white rounded-sm shadow-sm text-xs h-80 p-6 absolute bottom-4 left-4"

const chartsStyleExpanded = {
  width: '65%',
  height: '90%',
  overflow: 'scroll',
  minWidth: '530px'
}

const chartsStyleNotExpanded = {
  height: 50,
}

const ChartMinimized = ({ handleClick }) => (
  <div className={" bottom-4 left-4 absolute bg-white rounded-sm shadow-sm text-xs p-4 flex items-center"} style={chartsStyleNotExpanded} >
    <div className="flex items-center justify-center">
      <h2 className="mr-2">Facility Details</h2>
      <CicularButton className="" onClick={handleClick}>
        <ArrowsExpand _style={{ height: 20, width: 20 }} />
      </CicularButton>
    </div>
  </div>
)

const ElectedOfficials = () => (
  <div className="flex mt-4">
    <div className="w-full">
      <div className="text-md text-gray-900 font-medium">Elected Officials</div>
      <div className="flex flex-col mt-4">
        <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
            <div className="overflow-hidden border-bsm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">Edit</span>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Representative
        </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Office
        </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Links
        </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-white">
                    <td className="px-6 py-4 whitespace-nowrap text-right text-xs font-medium">
                      <a href="#" className="text-indigo-600 hover:text-indigo-900">Photo</a>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs font-medium text-gray-900">
                      Scott M. Stringer
        </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                      New York City Comptroller
        </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                      Link
        </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
)

const Toggle = ({ name, options, filters, setFilters }) => {

  const handleClick = (e) => {
    setFilters({ ...filters, [e.target.id.split('-')[0]]: e.target.checked });
  }

  return (
    <div id="fieldset">
      <div className="mt-2 space-y-4 flex-col">
        {options.map((o) => {
          return (
            <div className="relative flex items-start">
              <div className="flex items-center h-5">
                <input onClick={handleClick} id={`${o.id}-${o.name}`} name={o.name} checked={filters && filters[`${o.id}`] === true} type="checkbox" className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded" />
              </div>
              <div className="ml-3 text-xs">
                <label htmlFor={`${o.id}-${o.name}`} className="font-medium text-gray-700">{o.label}</label>
              </div>
              {o.description && (
                <div className="ml-1">
                  <a data-tip data-for={`${o.id}-description`}><InfoIcon /> </a>
                  <ReactTooltip multiline={true} id={`${o.id}-description`} className="w-60">
                    {o.description}
                  </ReactTooltip>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function Charts({
  highlight,
  // highlightedHour,
  // selete,
  select,
  // selectedHour,
  selectedFacility,
  setChartExpanded,
  chartExpanded
}: {
  highlight: any,
  select: any,
  selectedFacility: Facility,
  setChartExpanded: any,
  chartExpanded: any
}) {

  const [activeCompanyFacility, setActiveCompanyFacility] = useState();
  const [companyFacilityFilters, setCompanyFacilityFilters] = useState({});
  const [productFilters, setProductFilters] = useState({});
  const [callTypeFilters, setCallTypeFilters] = useState({
    [CallType.IN_STATE]: true,
    [CallType.OUT_STATE]: true
  })
  const [allSeries, setAllSeries]: any = useState(null);

  const get = async () => {
    try {
      const res = await axios.get('https://www.googleapis.com/civicinfo/v2/representatives?key=AIzaSyDN4is9An7DygIQ0QW47ZONCMLQQjis4Zw&address=550+1st+Avenue%2C+New+York%2C+NY%2C+USA')
    } catch (err) {
      console.error(err.toString())
    }
  }


  const getCompanyFacilityFilters = () => {
    const names: Record<string, boolean> = {};
    selectedFacility.companyFacilitiesByCanonicalFacilityId.nodes.forEach((node, i) => {
      if (i === 0) names[node.facilityInternal] = true;
      else {
        names[node.facilityInternal] = false;
      }
    })

    return names;
  }

  const getProductFilters = () => {
    const products: Record<string, boolean> = {};
    selectedFacility.companyFacilitiesByCanonicalFacilityId.nodes.forEach((node, i) => {
      node.ratesByCompanyFacilityId.nodes.forEach((node) => {
        if (i === 0) products[node.service] = true;
        else {
          products[node.service] = false;
        }
      })
    })
    return products;
  }

  const createSeries = () => {
    const validCFs = selectedFacility
      .companyFacilitiesByCanonicalFacilityId
      .nodes
      .filter(f => companyFacilityFilters?.[f.facilityInternal] === true);

    const series = {};

    let flattenedRates: Rate[] = [];

    validCFs.forEach((cf) => {
      cf.ratesByCompanyFacilityId.nodes.forEach((n) => {
        for (const elt of n.updated) {
          const flatted = { ...n };
          flatted.updated = [elt];
          flattenedRates.push(flatted);
        }
      })
    })

    const filterOnCallType = (elt: Rate) => {
      if (callTypeFilters[CallType.IN_STATE] && elt.inState) return true;
      if (callTypeFilters[CallType.OUT_STATE] && !elt.inState) return true;
      return false;
    }


    const filterOnService = (elt) => {
      if (productFilters[elt.service]) return true;
      return false;
    }

    console.log('validCfs', validCFs);
    console.log('flattenedRates', flattenedRates);

    flattenedRates = flattenedRates.filter(filterOnCallType).filter(filterOnService);

    flattenedRates.forEach((r) => {
      const key = `${r.inState ? CallType.IN_STATE : CallType.OUT_STATE}-${r.service}`;
      if (series[key]) series[key].push({
        x: new Date(r.updated[0]),
        y: fifteenMinuteRate(r)
      });
      else {
        series[key] = [{
          x: new Date(r.updated[0]),
          y: fifteenMinuteRate(r)
        }]
      }
    })

    for (const key in series) {
      series[key].sort((a, b) => {
        return a.x.getTime() - b.x.getTime()
      })
    }

    console.log('series', series)

    setAllSeries(series)
  }


  useEffect(() => {
    if (!selectedFacility || !selectedFacility.companyFacilitiesByCanonicalFacilityId) return;
    setCompanyFacilityFilters(getCompanyFacilityFilters());
    setProductFilters(getProductFilters());
  }, [selectedFacility])

  useEffect(() => {
    if (!selectedFacility || !selectedFacility.companyFacilitiesByCanonicalFacilityId) return;

    createSeries();
  }, [productFilters, companyFacilityFilters, selectedFacility, callTypeFilters])


  if (!selectedFacility || !selectedFacility.companyFacilitiesByCanonicalFacilityId) {
    return null;
  }

  const max15 = () => {
    let max = 0;
    selectedFacility.companyFacilitiesByCanonicalFacilityId.nodes.forEach((node) => {
      node.ratesByCompanyFacilityId.nodes.forEach((r) => {
        max = Math.max(max, fifteenMinuteRate(r));
      })
    })
    return max;
  }

  const rates: Rate[] = []
  selectedFacility.companyFacilitiesByCanonicalFacilityId.nodes.forEach((node) => {
    node.ratesByCompanyFacilityId.nodes.forEach((r) => {
      rates.push(r);
    })
  })

  const companies: FilterCompanies[] = [];

  selectedFacility.companyFacilitiesByCanonicalFacilityId.nodes.forEach((c) => {
    if (!companies.includes(c.company)) companies.push(c.company)
  })

  const products: Record<string, CF[]> = {};

  companies.forEach(
    comp => {
      if (!products[comp]) products[comp] = [];

      selectedFacility.companyFacilitiesByCanonicalFacilityId.nodes.filter(cf => cf.company === comp).forEach(
        (cf) => { products[comp].push(cf) })
    })
  // show all services on the graph at once

  const handleClick = () => {
    setChartExpanded(!chartExpanded);
  }

  const handleCompanyFacilityClick = (e) => {
    // setActiveCompanyFacility(e.target.innerText.);
  }

  const handleMail = () => {
    window.open('mailto:prison.telecom.data.project@gmail.com')
  }

  if (!chartExpanded) return (
    <ChartMinimized handleClick={handleClick} />
  )

  const JAN_1_2021 = 1609459200 * 1000;

  const lastScrapedDate: any = (series) => {
    const flattenedDates: Date[] = [];

    Object.values(series).forEach((s: any) => {
      s.forEach(r => flattenedDates.push((r as any).x));
    })
    flattenedDates.sort((a, b) => a.getTime() - b.getTime());
    return flattenedDates.pop();
  }

  const addDaysToDate = (d: Date[], days) => {
    var date = new Date();
    date.setDate(date.getDate() + days);
    return date;
  }

  if (!allSeries) return null;
  return (
    <div className={charts} style={chartExpanded ? chartsStyleExpanded : chartsStyleNotExpanded} >
      <h2 style={{ textAlign: 'center' }}>{selectedFacility.hifldByHifldid.name}</h2>
      {/* ICS Internal Names*/}
      {/* Securus Internal Names*/}
      <CicularButton className="absolute top-2 right-2 " onClick={handleClick}>
        <Minimize _style={{ height: 20, width: 20 }} />
      </CicularButton>
      <div id="chart-details-wrapper" className="flex mt-4">
        <div className="flex-col w-1/2 mr-2">
          <div className="flex-col w-50 bg-gray-50 rounded-sm p-4 pr-8 mt-2">
            <div className="mr-1 text-md text-gray-900 font-medium flex mr-2" ><div>Select Vendor Facility Data{" "}</div>
              <div className="ml-1">
                <a data-tip data-for='product-info'><InfoIcon /> </a>
                <ReactTooltip multiline={true} id='product-info' className="w-60">
                  The facility names below reflect all of a vendor's internal names for a facility. <br /><br /> Sometimes there are multiple "vendor facilities" in a single physical facility. <br /><br />
        For example different wings of the same prison may be listed as different vendor facilities, and be associated with different billing rates.
      </ReactTooltip>
              </div>
            </div>
            <div className="mt-2">
              {Object.entries(products).map(([company, cf]) => {
                return (
                  <div>
                    {FilterCompanies[company]}:
                    <ul>
                      {
                        <Toggle
                          name="CompanyFacilities"
                          filters={companyFacilityFilters}
                          setFilters={setCompanyFacilityFilters}
                          options={cf.map(c => {
                            return {
                              id: c.facilityInternal,
                              name: "company_facility",
                              label: c.facilityInternal
                            }
                          })} />
                      }
                    </ul>
                  </div>
                )
              })}
              <div className="mt-2 font-medium">
                Service
                <Toggle
                  name="Services"
                  filters={productFilters}
                  setFilters={setProductFilters}
                  options={Object.keys(getProductFilters()).map((v) => ({
                    id: v,
                    name: "services",
                    label: Service[v].name,
                    description: Service[v].description
                  }))} />
              </div>
              <div className="mt-2">
                Call Type
                <Toggle
                  name="Call Type"
                  filters={callTypeFilters}
                  setFilters={setCallTypeFilters}
                  options={[
                    {
                      id: CallType.IN_STATE,
                      name: "call_type_detail",
                      label: 'In-State'
                    },
                    {
                      id: CallType.OUT_STATE,
                      name: "call_type_detail",
                      label: "Out-State"
                    }
                  ]} />
              </div>
            </div>
          </div>
          <div className="flex mt-4">
            <div className="w-full">
              <div className="text-md text-gray-900 font-medium ">Facility Details</div>
              <div className="flex-col items-center">
                <div className="flex-col mt-2">
                  <div>
                    {selectedFacility.hifldByHifldid.address}
                  </div>
                  <div>
                    {selectedFacility.hifldByHifldid.city}{", "}
                    {selectedFacility.hifldByHifldid.state} {" "}
                    {selectedFacility.hifldByHifldid.zip}
                  </div>
                </div>
                <div className="flex-col mt-2 justify-between">
                  <div className="flex justify-between"><span>Population:</span> <span>{selectedFacility.hifldByHifldid.population === -999 ? 'UNKNOWN' : selectedFacility.hifldByHifldid.population}</span></div>
                  <div className="flex justify-between"><span>Capacity:</span> <span>{selectedFacility.hifldByHifldid.capacity === -999 ? 'UNKNOWN' : selectedFacility.hifldByHifldid.capacity}</span></div>
                  <div className="flex justify-between"><span>Secure Level:</span> <span>{selectedFacility.hifldByHifldid.securelvl}</span></div>
                  <div className="flex justify-between"><span>Type:</span> <span>{selectedFacility.hifldByHifldid.type}</span></div>
                  <div className="flex justify-between"><span>Details Collected:</span> <span>{selectedFacility.hifldByHifldid.sourcedate && new Date(selectedFacility.hifldByHifldid.sourcedate).toLocaleDateString('en-US')}</span></div>
                  <div className="flex justify-between"><span>Source:</span>  {selectedFacility.hifldByHifldid.source && <a className="underline cursor-pointer" onClick={() => window.open(selectedFacility.hifldByHifldid.source)}>External Link</a>} </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-center" style={{ color: 'black', flex: 1 }}>
          <XYPlot dontCheckIfEmpty width={300} height={300} xType="time" yDomain={[0, Math.ceil(max15()) + 5]} xDomain={[JAN_1_2021, addDaysToDate(lastScrapedDate(allSeries), 7)]}>
            <HorizontalGridLines />
            <VerticalGridLines />
            <XAxis
              tickFormat={(d: Date) => d.toLocaleDateString('en-US')}
            />
            <YAxis />
            <ChartLabel
              text="Data Collected"
              className="alt-x-label"
              includeMargin={false}
              xPercent={0.025}
              yPercent={1.01}
            />

            <ChartLabel
              text="15 Minute Rate (USD)"
              className="alt-y-label"
              includeMargin={false}
              xPercent={0.06}
              yPercent={0.06}
              style={{
                transform: 'rotate(-90)',
                textAnchor: 'end'
              }}
            />
            {Object.entries(allSeries).map(([name, s]) => {
              return (
                <LineMarkSeries
                  curve={curveCatmullRom.alpha(0.5)}
                  className={`${name}`}
                  data={s}
                />
              )
            })}
          </XYPlot>
        </div>
      </div>

      <div className="mt-4">
        <div className="text-md text-gray-900 font-medium">Suggest Edits</div>
        <div className="flex items-center">
          Think this facility's information should be updated? Get in touch
        <CicularButton className="" onClick={handleMail}>
            <Mail _style={{ height: 16, width: 16 }} />
          </CicularButton>
        </div>
      </div>
      <style>
        {`.rv-xy-plot__series rv-xy-plot__series--linemark {
          fill: none;
          }
          
          .rv-xy-canvas {
            position: absolute;
          }

          .rv-xy-plot {
            position: relative;
          }

          .rv-xy-plot__grid-lines__line {
            stroke: gray;
            stroke-width: 1;
            opacity: .25;
          }
          `}
      </style>
    </div >
  );
}
