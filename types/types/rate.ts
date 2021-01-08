import { Company } from './company';
import { Agency } from './agency';
import { DocumentReference } from '@firebase/firestore-types';

type ICS = {
    tariffBand: string
    initialDuration: string,
    initialCost: number,
    overDuration: number,
    overCost: number,
    tax: number,
    finalCost: number,
    number: string,
    createdAt: number,
    scraper: string,
    agency: string,
    seconds: number
}

type SecurusServices = "AdvancedConnect" | "Direct Bill" | "Inmate Debit" | "Traditional Collect" | "Voicemail";
type Service = SecurusServices | "Default";

type Securus = {
    additionalAmount: string,
    feeName: string | null,
    initalAmount: string,
    quoteRule: boolean,
    ratePerMinute: number,
    surCharge: number,
    totalAmount: string,
    number: string,
    service: SecurusServices,
    createdAt: number,
    scraper: string,
    facility: string,
    seconds: number
}

interface Rate {
    initialAmount: number,
    additionalAmount: number,
    initialDuration: number,
    overDuration: number,
    tax: number,
    phoneNumber: number,
    service: Service,
    canonicalFacility: DocumentReference<Agency>,
    company: Company,
    raw: Securus | ICS,
    createdAt: number,
    scraper: string
}