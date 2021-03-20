import { Rate, Facility } from 'types/Facility';

export const fifteenMinuteRate = (r: Rate) => {
    const tax = r.tax * 15;
   return  r.amountInitial + (r.amountAdditional * 14) + (!Number.isNaN(tax) ? tax : 0)
}

export const maxCanonicalFacilityRate = (f: Facility) => {
    let max = 0;
    try {
        f.companyFacilitiesByCanonicalFacilityId.nodes.forEach(el => {
            el.ratesByCompanyFacilityId.nodes.forEach((r, i) => {
            max = Math.max(max, fifteenMinuteRate(r));
            });
        })
    } catch(err) {};
    
    return max;
}