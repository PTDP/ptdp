import { Rate } from 'types/Facility';

export const fifteenMinuteRate = (r: Rate) => {
    const tax = r.tax * 15;
   return  r.amountInitial + (r.amountAdditional * 14) + (!Number.isNaN(tax) ? tax : 0)
}