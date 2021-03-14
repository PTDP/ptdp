import React, { useState } from 'react';
import { li } from './style';
import { Facility, Rate, CF } from 'types/Facility';
import { FilterCompanies } from './slice/types';
import { InfoIcon, ArrowCircleLeft, ArrowCircleRight, ArrowsExpand, Minimize, Mail } from '../../../../components/Icons/index';
import ReactTooltip from 'react-tooltip';
import { curveCatmullRom } from 'd3-shape';

import {
  XYPlot,
  XAxis,
  YAxis,
  ChartLabel,
  HorizontalGridLines,
  VerticalGridLines,
  LineSeries,
  LineSeriesCanvas,
  Line
} from 'react-vis';

const CicularButton = ({ children, className, onClick }) => {
  return (
    <button type="button" onClick={onClick} className={`inline-flex items-center p-1 border border-transparent rounded-full shadow-sm text-gray-500 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-50 ${className}`}>
      {children}
    </button>
  )
}

const charts = "bg-white rounded-sm shadow-sm text-xs h-80 p-6 absolute bottom-4 left-4"

const chartsStyleExpanded = {
  width: '55%',
  height: '90%',
  overflow: 'scroll'
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

  const Line = LineSeriesCanvas;


  if (!selectedFacility || !selectedFacility.companyFacilitiesByCanonicalFacilityId) {
    return null;
  }
  // }
  // const data = pickups.map(d => {
  //   let color = '#125C77';
  //   if (d.hour === selectedHour) {
  //     color = '#19CDD7';
  //   }
  //   if (d.hour === highlightedHour) {
  //     color = '#17B8BE';
  //   }
  //   return { ...d, color };
  // });
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

  console.log(products);
  // show all services on the graph at once

  const handleClick = () => {
    setChartExpanded(!chartExpanded);
  }

  const handleMail = () => {
    window.open('mailto:prison.telecom.data.project@gmail.com')
  }

  if (!chartExpanded) return (
    <ChartMinimized handleClick={handleClick} />
  )

  // console.log('selectedFacility.companyFacilitiesByCanonicalFacilityId.nodes', selectedFacility.companyFacilitiesByCanonicalFacilityId.nodes)
  // console.log('selectedFacility', selectedFacility)
  return (
    <div className={charts} style={chartExpanded ? chartsStyleExpanded : chartsStyleNotExpanded} >
      <h2 style={{ textAlign: 'center' }}>{selectedFacility.hifldByHifldid.name}</h2>
      {/* ICS Internal Names*/}
      {/* Securus Internal Names*/}
      <CicularButton className="absolute top-2 right-2 " onClick={handleClick}>
        <Minimize _style={{ height: 20, width: 20 }} />
      </CicularButton>
      <div id="chart-details-wrapper" className="flex mt-4">
        <div className="flex-col w-50 bg-gray-50 rounded-sm p-4 pr-8">
          <div className="flex"> <div className="mr-1 text-md text-gray-900 font-medium" >Vendor Facilities</div>
            <a data-tip data-for='product-info'><InfoIcon /> </a>
            <ReactTooltip multiline={true} id='product-info' className="w-60">
              Vendor Facilities are a vendor's internal name for a facility. <br /><br /> Sometimes there are multiple "vendor facilities" in a single physical facility. <br /><br />
        For example different wings of the same prison may be listed as different vendor facilities, and be associated with different billing rates.
      </ReactTooltip>
          </div>
          <div className="mt-2">
            {Object.entries(products).map(([company, cf]) => {
              return (
                <div>
                  {FilterCompanies[company]}:
                  <ul>
                    {cf.map((c) => {
                      return <li style={li} className="mt-1">- {c.facilityInternal}</li>;
                    })}
                  </ul>
                </div>
              )
            })
            }
          </div>
        </div>
        <div className="flex justify-center" style={{ color: 'black', flex: 1 }}>
          <XYPlot width={300} height={300}>
            <HorizontalGridLines />
            <VerticalGridLines />
            <XAxis />
            <YAxis />
            <ChartLabel
              text="X Axis"
              className="alt-x-label"
              includeMargin={false}
              xPercent={0.025}
              yPercent={1.01}
            />

            <ChartLabel
              text="Y Axis"
              className="alt-y-label"
              includeMargin={false}
              xPercent={0.06}
              yPercent={0.06}
              style={{
                transform: 'rotate(-90)',
                textAnchor: 'end'
              }}
            />
            <Line
              className="first-series"
              data={[{ x: 1, y: 3 }, { x: 2, y: 5 }, { x: 3, y: 15 }, { x: 4, y: 12 }]}
            />
            <Line className="second-series" data={null} />
            <Line
              className="third-series"
              curve={'curveMonotoneX'}
              data={[{ x: 1, y: 10 }, { x: 2, y: 4 }, { x: 3, y: 2 }, { x: 4, y: 15 }]}
              strokeDasharray={[7, 3]}
            />
            <Line
              className="fourth-series"
              curve={curveCatmullRom.alpha(0.5)}
              style={{
                // note that this can not be translated to the canvas version
                strokeDasharray: '2 2'
              }}
              data={[{ x: 1, y: 7 }, { x: 2, y: 11 }, { x: 3, y: 9 }, { x: 4, y: 2 }]}
            />
          </XYPlot>
        </div>
      </div>
      <div className="mt-4">
        <div className="text-md text-gray-900 font-medium">Facility Details</div>
        <div className="flex items-center">
          Think this facility's information should be changed? Get in touch
        <CicularButton className="" onClick={handleMail}>
            <Mail _style={{ height: 16, width: 16 }} />
          </CicularButton>
        </div>
      </div>
      <div className="mt-4">
        <div className="text-md text-gray-900 font-medium">Suggest Edits</div>
        <div className="flex items-center">
          Think this facility's information should be changed? Get in touch
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
          `}
      </style>
    </div>
  );
}
