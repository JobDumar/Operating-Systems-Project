// ContextMenu.jsx
import React, { useState } from "react";
import "./dataTable.css";

export function ContextMenu({ position, onClose, onUpdate, plane }) {
  const [updates, setUpdates] = useState({
    distance: plane?.distance || 0,
    speed: plane?.speed || 0,
    fuel: plane?.fuel || 0,
    status: plane?.status || "En vuelo", // Valor inicial basado en el avión
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUpdates((prev) => ({
      ...prev,
      [name]: name === "status" ? value : parseFloat(value) || 0,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(updates);
    onClose();
  };

  return (
    <div
      className="context-menu"
      style={{ top: position.y, left: position.x, position: "absolute" }}
    >
      <h4>Modificar Avión</h4>
      <form onSubmit={handleSubmit}>
        <label>
          Distancia (m):
          <input
            type="number"
            name="distance"
            value={updates.distance}
            onChange={handleChange}
          />
        </label>
        <label>
          Velocidad (m/s):
          <input
            type="number"
            name="speed"
            value={updates.speed}
            onChange={handleChange}
          />
        </label>
        <label>
          Combustible (%):
          <input
            type="number"
            name="fuel"
            value={updates.fuel}
            onChange={handleChange}
          />
        </label>
        <label>
          Estado:
          <select name="status" value={updates.status} onChange={handleChange}>
            <option value="En vuelo">En vuelo</option>
            <option value="Emergencia">Emergencia</option>
            <option value="Aterrizó">Aterrizó</option>
          </select>
        </label>
        <button type="submit">Guardar</button>
        <button type="button" onClick={onClose}>Cancelar</button>
      </form>
    </div>
  );
}