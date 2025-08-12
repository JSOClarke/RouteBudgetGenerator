import { useState, useCallback } from "react";

const ORS_API_KEY =
  "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6ImYwOTA4Mjg4MzYwMzQ5YmI5YjkxMTc3ZjY0Y2FhM2I1IiwiaCI6Im11cm11cjY0In0="; // replace with your actual key

export function useGeocode() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // geocode function accepts a string query (postcode/address)
  const geocode = useCallback(async (query) => {
    if (!query) return null;

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        api_key: ORS_API_KEY,
        text: query,
        boundary_country: "GB", // limit to Great Britain if you want
        size: "1", // only return top 1 result
      });

      const response = await fetch(
        `https://api.openrouteservice.org/geocode/search?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.features && data.features.length > 0) {
        // Coordinates are [lon, lat]
        return data.features[0].geometry.coordinates;
      } else {
        return null; // no results found
      }
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { geocode, loading, error };
}
