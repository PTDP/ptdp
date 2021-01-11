
export type SecurusServices = "AdvancedConnect" | "Direct Bill" | "Inmate Debit" | "Traditional Collect" | "Voicemail";
export type AllServices = SecurusServices | "Default";

export type Service = {
    created_at?: string,
    updated_at?: string,
    
    name: AllServices;
    company_id: number;
}
