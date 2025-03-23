// PrincipalContent.jsx
import React, { useState, useEffect } from "react";
import "./principalContent.css";
import { DataTable } from "../DataTable";
import { InfoSection } from "../InfoSection";
import { usePlaneManager } from "../DataTable/usePlaneManager";

export function PrincipalContent() {
  const { planes } = usePlaneManager();
  const [landedPlanes, setLandedPlanes] = useState([]);
  const [prevPlanes, setPrevPlanes] = useState({}); // Estado persistente para el estado previo

  useEffect(() => {
    const newlyLanded = [];

    // Detectar aviones que cambiaron a "Aterrizó"
    Object.keys(planes).forEach((planeId) => {
      const currentPlane = planes[planeId];
      const previousPlane = prevPlanes[planeId];

      if (
        currentPlane.status === "Aterrizó" &&
        (!previousPlane || previousPlane.status !== "Aterrizó")
      ) {
        newlyLanded.push({
          id: planeId,
          landedTime: new Date().toLocaleTimeString(),
        });
      }
    });

    // Si hay nuevos aviones aterrizados, actualizar la lista
    if (newlyLanded.length > 0) {
      setLandedPlanes((prev) => [...newlyLanded, ...prev].slice(0, 5)); // Limitar a 5
    }

    // Actualizar el estado previo después de procesar
    setPrevPlanes({ ...planes });
  }, [planes]); // Dependencia en planes

  return (
    <div className="app">
      <InfoSection landedPlanes={landedPlanes} />
      <div className="tables-container">
        <DataTable variant="arriving" />
        <DataTable variant="leaving" />
        <DataTable variant="randoms" />
        <DataTable variant="all" />
      </div>
    </div>
  );
}