// DataTable.jsx
import React, { useMemo, memo, useCallback, useRef } from "react";
import "./dataTable.css";
import { usePlaneManager } from "./usePlaneManager";
import { ContextMenu } from "./ContextMenu";

// Componente memoizado para cada fila
const PlaneRow = memo(
  ({ plane, onContextMenu }) => {
    return (
      <tr data-plane-id={plane.id} onContextMenu={(e) => onContextMenu(e, plane.id)}>
        <td>{plane.id}</td>
        <td>{plane.distance.toFixed(2)}</td>
        <td>{plane.speed.toFixed(2)}</td>
        <td>{plane.fuel.toFixed(2)}</td>
        <td>{plane.status}</td>
      </tr>
    );
  },
  (prevProps, nextProps) => {
    const prev = prevProps.plane;
    const next = nextProps.plane;
    return (
      prev.id === next.id &&
      prev.distance === next.distance &&
      prev.speed === next.speed &&
      prev.fuel === next.fuel &&
      prev.status === next.status
    );
  }
);

export const DataTable = memo(({ variant }) => {
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

  const tableRef = useRef(null);
  const previousPlanesRef = useRef(new Set());

  const content = useMemo(() => ({
    arriving: "Tabla de llegadas",
    leaving: "Tabla de salidas",
    randoms: "Tabla de aeronaves aleatorias",
    all: "Lista completa de aviones",
  }[variant]), [variant]);

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

  const handleContextMenu = useCallback((e, planeId) => {
    openContextMenu(e, planeId);
  }, [openContextMenu]);

  // Efecto para manejar las actualizaciones de la tabla
  React.useEffect(() => {
    if (!tableRef.current) return;

    const currentPlanes = new Set(getPlanesVariant.map(plane => plane.id));
    const tbody = tableRef.current.querySelector('tbody');
    
    // Eliminar filas que ya no existen
    const rows = tbody.querySelectorAll('tr');
    rows.forEach(row => {
      const planeId = row.dataset.planeId;
      if (!currentPlanes.has(planeId)) {
        row.remove();
      }
    });

    // Actualizar o agregar nuevas filas
    getPlanesVariant.forEach(plane => {
      const existingRow = tbody.querySelector(`tr[data-plane-id="${plane.id}"]`);
      if (!existingRow) {
        const newRow = document.createElement('tr');
        newRow.dataset.planeId = plane.id;
        newRow.innerHTML = `
          <td>${plane.id}</td>
          <td>${plane.distance.toFixed(2)}</td>
          <td>${plane.speed.toFixed(2)}</td>
          <td>${plane.fuel.toFixed(2)}</td>
          <td>${plane.status}</td>
        `;
        newRow.oncontextmenu = (e) => handleContextMenu(e, plane.id);
        tbody.appendChild(newRow);
      } else {
        // Actualizar solo las celdas que han cambiado
        const cells = existingRow.querySelectorAll('td');
        if (cells[1].textContent !== plane.distance.toFixed(2)) cells[1].textContent = plane.distance.toFixed(2);
        if (cells[2].textContent !== plane.speed.toFixed(2)) cells[2].textContent = plane.speed.toFixed(2);
        if (cells[3].textContent !== plane.fuel.toFixed(2)) cells[3].textContent = plane.fuel.toFixed(2);
        if (cells[4].textContent !== plane.status) cells[4].textContent = plane.status;
      }
    });

    previousPlanesRef.current = currentPlanes;
  }, [getPlanesVariant, handleContextMenu]);

  return (
    <div className={`table-aircraft-${variant}`}>
      <h2>{content}</h2>
      <table ref={tableRef}>
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
          {/* Las filas se manejan dinámicamente en el useEffect */}
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
});