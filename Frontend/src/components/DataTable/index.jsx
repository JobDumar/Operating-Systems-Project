// DataTable.jsx
import React, { useMemo, memo } from "react";
import "./dataTable.css";
import { usePlaneManager } from "./usePlaneManager";
import { ContextMenu } from "./ContextMenu";

// Componente memoizado para cada fila
const PlaneRow = memo(
  ({ plane, onContextMenu }) => {
    return (
      <tr onContextMenu={(e) => onContextMenu(e, plane.id)}>
        <td>{plane.id}</td>
        <td>{plane.distance.toFixed(2)}</td>
        <td>{plane.speed.toFixed(2)}</td>
        <td>{plane.fuel.toFixed(2)}</td>
        <td>{plane.status}</td>
      </tr>
    );
  },
  (prevProps, nextProps) =>
    prevProps.plane.id === nextProps.plane.id &&
    prevProps.plane.distance === nextProps.plane.distance &&
    prevProps.plane.speed === nextProps.plane.speed &&
    prevProps.plane.fuel === nextProps.plane.fuel &&
    prevProps.plane.status === nextProps.plane.status
);

export function DataTable({ variant }) {
  const {
    planes,
    landingQueue,
    takeoffQueue,
    nearbyQueue,
    contextMenu: {
      openContextMenu,
      isContextMenuOpen,
      contextMenuPosition,
      selectedPlane,
      closeContextMenu,
      updatePlane,
    },
  } = usePlaneManager();

  const content = {
    arriving: "Tabla de llegadas",
    leaving: "Tabla de salidas",
    randoms: "Tabla de aeronaves aleatorias",
    all: "Lista completa de aviones",
  }[variant];

  // Memoizar las listas de planeIds para cada cola
  const landingIds = useMemo(
    () => (landingQueue || []).map(([, planeId]) => planeId).filter(Boolean),
    [landingQueue]
  );
  const takeoffIds = useMemo(
    () => (takeoffQueue || []).map((planeId) => planeId).filter(Boolean),
    [takeoffQueue]
  );
  const nearbyIds = useMemo(
    () => (nearbyQueue || []).map((planeId) => planeId).filter(Boolean),
    [nearbyQueue]
  );
  const allIds = useMemo(() => Object.keys(planes), [planes]);

  const getPlanesVariant = useMemo(() => {
    let ids;
    switch (variant) {
      case "arriving":
        ids = landingIds;
        break;
      case "leaving":
        ids = takeoffIds;
        break;
      case "randoms":
        ids = nearbyIds;
        break;
      case "all":
        ids = allIds;
        break;
      default:
        ids = [];
    }
    return ids.map((planeId) => planes[planeId]).filter(Boolean);
  }, [variant, planes, landingIds, takeoffIds, nearbyIds, allIds]);

  const filteredPlanes = getPlanesVariant;

  return (
    <div className={`table-aircraft-${variant}`}>
      <h2>{content}</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Distancia (m)</th>
            <th>Velocidad (m/s)</th>
            <th>Combustible (%)</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {filteredPlanes.map((plane) => (
            <PlaneRow key={plane.id} plane={plane} onContextMenu={openContextMenu} />
          ))}
        </tbody>
      </table>

      {isContextMenuOpen && (
        <ContextMenu
          position={contextMenuPosition}
          onClose={closeContextMenu}
          onUpdate={(updates) => updatePlane(selectedPlane, updates)}
          plane={selectedPlane ? planes[selectedPlane] : null}
        />
      )}
    </div>
  );
}