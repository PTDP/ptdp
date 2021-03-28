import { Rate, Facility } from 'types/Facility';
import * as ss from 'simple-statistics'


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


export const stats = (f: Facility[]) => {
    const rates: number[] = [];// get latest 15 minute rate for every company facility;
    f.forEach((fac) => {
        fac.companyFacilitiesByCanonicalFacilityId.nodes.forEach((el) => {
            el.ratesByCompanyFacilityId.nodes.forEach((r, i) => {
                rates.push(fifteenMinuteRate(r));
            })
        });
    })
    const min = ss.min(rates);
    const max = ss.max(rates);
    var fifteenMinuteBins : number[] = [0];
    (new Array(100)).fill(0).forEach((_, i) => fifteenMinuteBins.push((fifteenMinuteBins[i - 1] || 0) + (max - min) / 100));
    return {min, max, fifteenMinuteBins};
}

// const latestRates = (f: Facility) => {
//     const rates = [];

//     try {
//         f.companyFacilitiesByCanonicalFacilityId.nodes.forEach(el => {
//             el.ratesByCompanyFacilityId.nodes.forEach((r, i) => {
//                 max = Math.max(max, fifteenMinuteRate(r));
//             });
//         })
//     } catch(err) {};
    
//     return max;
// }

// const latestInStateRates = (f: Facility) => {
// }

// const latestOutStateRates = (f: Facility) => {
// }