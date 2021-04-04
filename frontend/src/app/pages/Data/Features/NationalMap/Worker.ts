import { FacilityType, CallType } from './slice/types';
import { Facility } from 'types/Facility';
import f_data from './slice/facilities_data.json';

const ctx: Worker = self as any; // eslint-disable-line no-restricted-globals

const filter = filters => {
  // Canonical Facility Filters
  return (d: Facility) => {
    try {
      if (
        filters.facility_type !== FacilityType.ALL &&
        d.hifldByHifldid.type !== filters.facility_type
      )
        return false;
    } catch (err) {}

    // Company Facility Filters
    try {
      d.companyFacilitiesByCanonicalFacilityId.nodes = d.companyFacilitiesByCanonicalFacilityId.nodes.filter(
        c => {
          if (c.company !== filters.company) return false;

          // Rate filters
          c.ratesByCompanyFacilityId.nodes = c.ratesByCompanyFacilityId.nodes.filter(
            f => {
              return filters.call_type == CallType.IN_STATE
                ? f.inState
                : !f.inState;
            },
          );

          return true;
        },
      );
    } catch (err) {}

    return true;
  };
};

ctx.addEventListener('message', (e: any) => {
  if (!e) return;
  const { data } = e;
  ctx.postMessage(
    JSON.stringify(
      (f_data as any).data.allCanonicalFacilities.nodes.filter(
        filter(JSON.parse(data)),
      ),
    ),
  );
});

export {};
