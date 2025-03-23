// InfoSection.jsx
import React from "react";
import "./infoSection.css";

export function InfoSection({ landedPlanes }) {
  return (
    <div className="info-section landed">
      <h3>Aviones Aterrizados Recientemente</h3>
      {landedPlanes.length === 0 ? (
        <p>No hay aviones aterrizados recientemente.</p>
      ) : (
        <ul>
          {landedPlanes.map((plane) => (
            <li key={plane.id}>
              {plane.id} - Aterrizó a las {plane.landedTime}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}