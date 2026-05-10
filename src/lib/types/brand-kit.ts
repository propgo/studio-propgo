export interface BrandKitData {
  agentName: string;
  agentPhone: string;
  agentEmail: string;
  agencyName: string;
  websiteUrl: string;
  primaryColor: string;
  logoUrl: string | null;
  logoStoragePath: string | null;
}

export const DEFAULT_BRAND_KIT: BrandKitData = {
  agentName: "",
  agentPhone: "",
  agentEmail: "",
  agencyName: "",
  websiteUrl: "",
  primaryColor: "#4A6CF7",
  logoUrl: null,
  logoStoragePath: null,
};
