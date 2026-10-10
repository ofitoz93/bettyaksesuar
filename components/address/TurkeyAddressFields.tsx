"use client";

import { useEffect, useState } from "react";
import { TURKEY_PROVINCES } from "@/lib/turkeyProvinces";

const inputClass =
  "w-full border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-ink disabled:opacity-50";

interface TurkeyAddressFieldsProps {
  initialCity?: string;
  initialDistrict?: string;
  initialNeighbourhood?: string;
}

// İl → ilçe → mahalle zincirli seçimi. Form alanları "city", "district",
// "neighbourhood" adlarıyla gönderilir. Başlangıç değeri verilirse (kayıtlı
// adres düzenlenirken) ilçe/mahalle listeleri otomatik yüklenir; değerleri
// dışarıdan değiştirmek için bileşen farklı bir `key` ile yeniden oluşturulur.
export default function TurkeyAddressFields({
  initialCity = "",
  initialDistrict = "",
  initialNeighbourhood = "",
}: TurkeyAddressFieldsProps) {
  const [city, setCity] = useState(initialCity);
  const [district, setDistrict] = useState(initialDistrict);
  const [neighbourhood, setNeighbourhood] = useState(initialNeighbourhood);
  const [districts, setDistricts] = useState<string[]>([]);
  const [neighbourhoods, setNeighbourhoods] = useState<string[]>([]);
  const [loadingDistricts, setLoadingDistricts] = useState(Boolean(initialCity));
  const [loadingNeighbourhoods, setLoadingNeighbourhoods] = useState(
    Boolean(initialCity && initialDistrict),
  );

  const loadDistricts = async (cityName: string) => {
    setLoadingDistricts(true);
    try {
      const res = await fetch(`/api/turkey/ilceler?il=${encodeURIComponent(cityName)}`);
      const data = await res.json();
      setDistricts(data.districts ?? []);
    } finally {
      setLoadingDistricts(false);
    }
  };

  const loadNeighbourhoods = async (cityName: string, districtName: string) => {
    setLoadingNeighbourhoods(true);
    try {
      const res = await fetch(
        `/api/turkey/mahalleler?il=${encodeURIComponent(cityName)}&ilce=${encodeURIComponent(districtName)}`,
      );
      const data = await res.json();
      setNeighbourhoods(data.neighbourhoods ?? []);
    } finally {
      setLoadingNeighbourhoods(false);
    }
  };

  // Kayıtlı adres düzenlenirken başlangıç il/ilçesinin listelerini yükle
  useEffect(() => {
    if (!initialCity) return;
    let cancelled = false;

    fetch(`/api/turkey/ilceler?il=${encodeURIComponent(initialCity)}`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setDistricts(data.districts ?? []);
      })
      .finally(() => {
        if (!cancelled) setLoadingDistricts(false);
      });

    if (initialDistrict) {
      fetch(
        `/api/turkey/mahalleler?il=${encodeURIComponent(initialCity)}&ilce=${encodeURIComponent(initialDistrict)}`,
      )
        .then((res) => res.json())
        .then((data) => {
          if (!cancelled) setNeighbourhoods(data.neighbourhoods ?? []);
        })
        .finally(() => {
          if (!cancelled) setLoadingNeighbourhoods(false);
        });
    }

    return () => {
      cancelled = true;
    };
  }, [initialCity, initialDistrict]);

  const handleCityChange = (value: string) => {
    setCity(value);
    setDistrict("");
    setNeighbourhood("");
    setDistricts([]);
    setNeighbourhoods([]);
    if (value) loadDistricts(value);
  };

  const handleDistrictChange = (value: string) => {
    setDistrict(value);
    setNeighbourhood("");
    setNeighbourhoods([]);
    if (value) loadNeighbourhoods(city, value);
  };

  // Kayıtlı değer listede yoksa (eski veri) seçenek olarak yine de gösterilir
  const districtOptions = district && !districts.includes(district) ? [district, ...districts] : districts;
  const showNeighbourhoodSelect = neighbourhoods.length > 0;
  const neighbourhoodOptions =
    neighbourhood && !neighbourhoods.includes(neighbourhood)
      ? [neighbourhood, ...neighbourhoods]
      : neighbourhoods;

  return (
    <>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="İl">
          <select
            name="city"
            required
            value={city}
            onChange={(e) => handleCityChange(e.target.value)}
            className={inputClass}
          >
            <option value="" disabled>
              İl seçin
            </option>
            {TURKEY_PROVINCES.map((province) => (
              <option key={province} value={province}>
                {province}
              </option>
            ))}
          </select>
        </Field>
        <Field label="İlçe">
          <select
            name="district"
            required
            value={district}
            disabled={!city || loadingDistricts}
            onChange={(e) => handleDistrictChange(e.target.value)}
            className={inputClass}
          >
            <option value="" disabled>
              {loadingDistricts ? "Yükleniyor..." : "İlçe seçin"}
            </option>
            {districtOptions.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Mahalle">
        {showNeighbourhoodSelect ? (
          <select
            name="neighbourhood"
            required
            value={neighbourhood}
            disabled={!district || loadingNeighbourhoods}
            onChange={(e) => setNeighbourhood(e.target.value)}
            className={inputClass}
          >
            <option value="" disabled>
              {loadingNeighbourhoods ? "Yükleniyor..." : "Mahalle seçin"}
            </option>
            {neighbourhoodOptions.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        ) : (
          <input
            name="neighbourhood"
            required
            disabled={!district}
            value={neighbourhood}
            onChange={(e) => setNeighbourhood(e.target.value)}
            placeholder={
              loadingNeighbourhoods ? "Yükleniyor..." : district ? "Mahalle adı" : "Önce ilçe seçin"
            }
            className={inputClass}
          />
        )}
      </Field>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs tracking-wide text-ink-soft">{label}</label>
      {children}
    </div>
  );
}
