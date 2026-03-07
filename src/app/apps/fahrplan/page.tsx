"use client";

import { useState } from "react";
import { PageTitle } from "@/components/ui/PageTitle";
import { useStation } from "./useStation";
import { StationSearch } from "./StationSearch";
import { DepartureBoard } from "./DepartureBoard";
import styles from "./fahrplan.module.css";

export default function FahrplanPage() {
  const { station, setStation } = useStation();
  const [changing, setChanging] = useState(false);

  const showSearch = !station || changing;

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
