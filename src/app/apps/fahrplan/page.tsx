"use client";

import { useState, useCallback } from "react";
import { PageTitle } from "@/components/ui/PageTitle";
import { useStation } from "./useStation";
import { StationSearch } from "./StationSearch";
import { DepartureBoard } from "./DepartureBoard";
import { fetchNearbyStation } from "./api";
import { LocateIcon } from "@/constants/icons";
import styles from "./fahrplan.module.css";

export default function FahrplanPage() {
  const { station, setStation } = useStation();
  const [changing, setChanging] = useState(false);
  const [locating, setLocating] = useState(false);
  const [locateError, setLocateError] = useState<string | null>(null);

  const showSearch = !station || changing;

  const handleLocate = useCallback(() => {
    if (!("geolocation" in navigator)) {
      setLocateError("Geolocation not supported");
      return;
    }
    setLocating(true);
    setLocateError(null);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const name = await fetchNearbyStation(pos.coords.latitude, pos.coords.longitude);
        setLocating(false);
        if (name) {
          setStation(name);
          setChanging(false);
        } else {
          setLocateError("No stations found nearby");
        }
      },
      (err) => {
        setLocating(false);
        setLocateError(
          err.code === err.PERMISSION_DENIED
            ? "Location access denied"
            : "Could not get location"
        );
      }
    );
  }, [setStation]);

  return (
    <div className={styles.root}>
      <PageTitle title="Fahrplan" />
      {showSearch ? (
        <>
          <p className={styles.searchPrompt}>Find your station</p>
          <StationSearch
            onSelect={(name) => {
              setStation(name);
              setChanging(false);
            }}
          />
          <button
            className={styles.locateButton}
            onClick={handleLocate}
            disabled={locating}
          >
            <LocateIcon size={18} />
            {locating ? "Locating…" : "Use my location"}
          </button>
          {locateError && (
            <p className={styles.locateError}>{locateError}</p>
          )}
        </>
      ) : (
        <>
          <div className={styles.stationHeader}>
            <span className={styles.stationName}>{station}</span>
            <button
              className={styles.changeButton}
              onClick={() => setChanging(true)}
            >
              Change
            </button>
          </div>
          <DepartureBoard key={station} station={station} />
        </>
      )}
    </div>
  );
}
