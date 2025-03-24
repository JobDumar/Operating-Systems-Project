// Header.jsx
import React, { useState } from "react";
import "./header.css";

export function Header() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    id: "",
    distance: "",
    speed: "",
    fuel: "",
    queue: "landing",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const planeData = {
      id: formData.id,
      distance: parseFloat(formData.distance),
      speed: parseFloat(formData.speed),
      fuel: parseFloat(formData.fuel),
      queue: formData.queue,
    };

    try {
      const response = await fetch("http://localhost:5000/register_plane", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(planeData),
      });

      if (!response.ok) {
        throw new Error("Error al registrar el avión");
      }

      const data = await response.json();
      console.log("Avión registrado:", data);
      setIsFormOpen(false);
      setFormData({ id: "", distance: "", speed: "", fuel: "", queue: "landing" });
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="header">
      <button onClick={() => setIsFormOpen(true)}>Registrar avión</button>
      {isFormOpen && (
        <div className="form-overlay">
          <form onSubmit={handleSubmit} className="plane-form">
            <h3>Registrar nuevo avión</h3>
            <label>
              ID:
              <input
                type="text"
                name="id"
                value={formData.id}
                onChange={handleInputChange}
                required
              />
            </label>
            <label>
              Distancia (m):
              <input
                type="number"
                name="distance"
                value={formData.distance}
                onChange={handleInputChange}
                min="0"
                required
              />
            </label>
            <label>
              Velocidad (m/s):
              <input
                type="number"
                name="speed"
                value={formData.speed}
                onChange={handleInputChange}
                min="0"
                required
              />
            </label>
            <label>
              Combustible (%):
              <input
                type="number"
                name="fuel"
                value={formData.fuel}
                onChange={handleInputChange}
                required
              />
            </label>
            <label>
              Tipo de cola:
              <select name="queue" value={formData.queue} onChange={handleInputChange}>
                <option value="landing">Aterrizaje</option>
                <option value="takeoff">Despegue</option>
                <option value="nearby">Cercano</option>
              </select>
            </label>
            <div>
              <button type="submit">Registrar</button>
              <button type="button" onClick={() => setIsFormOpen(false)}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}