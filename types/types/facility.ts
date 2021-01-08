import { Company } from './company';
import { Agency } from './agency';
import { DocumentReference } from '@firebase/firestore-types';

export type Facility = {
    createdAt: number,
    updatedAt: number,
    company: Company,
    congressionalFips: number,
    stateFips: number,
    countyFips: number,
    longitude: number,
    latitude: number,
    agency: DocumentReference<Agency> | null
}