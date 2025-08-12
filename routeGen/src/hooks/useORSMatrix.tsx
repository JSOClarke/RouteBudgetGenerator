import { useState, useCallback } from "react";
import type { ORSMatrixHook } from "../types";

const ORS_API_KEY =
  "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6ImYwOTA4Mjg4MzYwMzQ5YmI5YjkxMTc3ZjY0Y2FhM2I1IiwiaCI6Im11cm11cjY0In0="; // replace with your actual ORS API key

export function useORSMatrix(): ORSMatrixHook {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [durationMatrix, setDurationMatrix] = useState<number[][] | null>(null);
  const [distanceMatrix, setDistanceMatrix] = useState<number[][] | null>(null);

  const fetchMatrix = useCallback(
    async (coordinates: [number, number][]): Promise<any> => {
      if (!coordinates || coordinates.length === 0) return null;

      setLoading(true);
      setError(null);
      setDurationMatrix(null);
      setDistanceMatrix(null);

      try {
        const body = {
          locations: coordinates, // array of [lon, lat]
          metrics: ["distance", "duration"],
          units: "m", // meters for distance
        };

        const response = await fetch(
          "https://api.openrouteservice.org/v2/matrix/driving-car",
          {
            method: "POST",
            headers: {
              Authorization: ORS_API_KEY,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
          }
        );

        if (!response.ok) {
          throw new Error(`ORS Matrix API error: ${response.status}`);
        }

        const data = await response.json();

        setDurationMatrix(data.durations || null);
        setDistanceMatrix(data.distances || null);

        return data;
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : "An unknown error occurred";
        setError(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    fetchMatrix,
    loading,
    error,
    durationMatrix,
    distanceMatrix,
  };
}
