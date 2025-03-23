// usePlaneManager.js
import { useState, useEffect } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:5000");

export function usePlaneManager() {
  const [planes, setPlanes] = useState({});
  const [landingQueue, setLandingQueue] = useState([]);
  const [takeoffQueue, setTakeoffQueue] = useState([]);
  const [nearbyQueue, setNearbyQueue] = useState([]);
  const [selectedPlane, setSelectedPlane] = useState(null);
  const [isContextMenuOpen, setIsContextMenuOpen] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Socket conectado");
    });

    socket.on("update_planes", (data) => {
      setPlanes((prevPlanes) => {
        const newPlanes = { ...prevPlanes };
        const incomingPlanes = data.planes || {};
        Object.keys(incomingPlanes).forEach((planeId) => {
          if (
            JSON.stringify(newPlanes[planeId]) !==
            JSON.stringify(incomingPlanes[planeId])
          ) {
            newPlanes[planeId] = { ...incomingPlanes[planeId] };
          }
        });
        return newPlanes;
      });

      setLandingQueue((prev) => {
        const newQueue = Array.isArray(data.landing_queue) ? data.landing_queue : [];
        return JSON.stringify(prev) === JSON.stringify(newQueue) ? prev : newQueue;
      });

      setTakeoffQueue((prev) => {
        const newQueue = Array.isArray(data.takeoff_queue) ? data.takeoff_queue : [];
        return JSON.stringify(prev) === JSON.stringify(newQueue) ? prev : newQueue;
      });

      setNearbyQueue((prev) => {
        const newQueue = Array.isArray(data.nearby_queue) ? data.nearby_queue : [];
        return JSON.stringify(prev) === JSON.stringify(newQueue) ? prev : newQueue;
      });
    });

    return () => {
      socket.off("update_planes");
      socket.disconnect();
    };
  }, []);

  const openContextMenu = (event, planeId) => {
    event.preventDefault();
    setContextMenuPosition({ x: event.clientX, y: event.clientY });
    setSelectedPlane(planeId);
    setIsContextMenuOpen(true);
  };

  const closeContextMenu = () => {
    setIsContextMenuOpen(false);
    setSelectedPlane(null);
  };

  const updatePlane = async (planeId, updates) => {
    try {
      const response = await fetch(`http://localhost:5000/edit_plane/${planeId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates), // No necesitamos incluir id aquí, ya está en la URL
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update plane: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log("Avión actualizado:", data);
    } catch (error) {
      console.error("Error al actualizar avión:", error);
    }
  };

  return {
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
  };
}