import {
  getCities,
  getDistrictsByCityCode,
  getNeighbourhoodsByCityCodeAndDistrict,
} from "turkey-neighbourhoods";

let cityCodeByName: Map<string, string> | null = null;

function getCityCodeByName(name: string): string | null {
  if (!cityCodeByName) {
    cityCodeByName = new Map(getCities().map((c) => [c.name, c.code]));
  }
  return cityCodeByName.get(name) ?? null;
}

export function getDistrictsForCity(cityName: string): string[] {
  const code = getCityCodeByName(cityName);
  if (!code) return [];
  return getDistrictsByCityCode(code);
}

export function getNeighbourhoodsForDistrict(cityName: string, district: string): string[] {
  const code = getCityCodeByName(cityName);
  if (!code) return [];
  return getNeighbourhoodsByCityCodeAndDistrict(code, district);
}
