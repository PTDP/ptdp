
export type SecurusServices = "AdvancedConnect" | "Direct Bill" | "Inmate Debit" | "Traditional Collect" | "Voicemail";
export type AllServices = SecurusServices | "Default";

export type Service = {
    created_at: Date,
    updated_at: Date,
    name: AllServices;
    company_id: number;
}
