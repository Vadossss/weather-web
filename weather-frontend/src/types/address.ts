export interface GeoObject {
  metaDataProperty: MetaDataProperty;
  Point: Point;
  description: string;
  name: string;
}

export interface MetaDataProperty {
  GeocoderMetaData: GeocoderMetaData;
}

export interface Point {
  pos: string;
}

export interface GeocoderMetaData {
  precision: string;
  text: string;
  kind: string;
  Address: Address;
  AddressDetails: AddressDetails;
}

export interface Address {
  country_code: string;
  formatted: string;
  Components: ComponentsItem[];
}

export interface AddressDetails {
  Country: Country;
}

export interface ComponentsItem {
  kind: string;
  name: string;
}

export interface Country {
  AddressLine: string;
  CountryNameCode: string;
  CountryName: string;
  AdministrativeArea: AdministrativeArea;
}

export interface AdministrativeArea {
  AdministrativeAreaName: string;
  SubAdministrativeArea: SubAdministrativeArea;
}

export interface SubAdministrativeArea {
  SubAdministrativeAreaName: string;
  Locality: Locality;
}

export interface Locality {
  LocalityName: string;
}

export interface FeatureMember {
  GeoObject: GeoObject;
}

export interface AddressResponse {
  featureMember: FeatureMember[];
}
