from flask import Flask, request, jsonify
from flask_socketio import SocketIO, emit
import time
import threading
import heapq

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")

# Cola de prioridad de aviones (menor gasolina -> más prioridad)
landing_queue = []
planes = {}  # Diccionario para manejar estados
takeoff_queue = []
nearby_queue = []


def priority_queue(plane_id):
    plane = planes[plane_id]
    
    land = plane["distance"] / plane["speed"]
    
    priority = (
    0 if plane["status"] == "Emergencia" else 1,
    plane["fuel"],
    land
    )

    heapq.heappush(landing_queue, (priority, plane_id) )

@app.route('/get_planes', methods=['GET'])
def get_planes():
    global planes  #
    
    return jsonify({"planes": planes, "queue": list(landing_queue), "takeoff_queue": takeoff_queue, "nearby_queue": nearby_queue}), 200

# 🔹 Endpoint para registrar un avión
@app.route('/register_plane', methods=['POST'])
def register_plane():
    data = request.json
    plane_id = data["id"]
    queue_type = data.get("queue", "landing")

    planes[plane_id] = {
        "id": plane_id,
        "distance": data["distance"],
        "speed": data["speed"],
        "fuel": data["fuel"],
        "status": data.get("status", "En vuelo")
    }
    
    if planes[plane_id]["fuel"] <= 20:
        queue_type = "landing"
    
    if queue_type == "landing":
        priority_queue(plane_id)
    elif queue_type == "takeoff":
        takeoff_queue.append(plane_id) 
    else:
        nearby_queue.append(plane_id) 

    socketio.emit("update_planes", {"planes": planes, "queue": list(landing_queue)})
    
    return jsonify({"message": "Avión registrado", "plane": planes[plane_id]}), 201

# 🔹 Simulación del movimiento de aviones
def update_planes():
    global landing_queue

    while True:
        time.sleep(1)  # Cada segundo en la realidad = 10 segundos simulados

        planes_to_reorder = []
        
        for _, plane_id in landing_queue[:]:  # Extraer el plane_id correctamente
            if plane_id not in planes:
                continue
            plane = planes[plane_id]  # Acceder correctamente desde el diccionario planes
            plane["distance"] -= plane["speed"] * 10

            if plane["fuel"] > 0:
                plane["fuel"] -= 1 
            
            if plane["distance"] <= 0:
                plane["status"] = "Aterrizó"
                continue  # No agregar de nuevo a la cola

            planes_to_reorder.append(plane_id)

        # Recalcular la cola de aterrizaje con los nuevos valores
        landing_queue = []
        for pid in planes_to_reorder:
            priority_queue(pid)

        # 🔹 Enviar actualización a todos los clientes
        socketio.emit("update_planes", {"planes": planes, "queue": list(landing_queue)})


def manage_takeoffs():
    #Maneja la lista de despegues y mueve aviones según su estado.
    global takeoff_queue  

    while True:
        time.sleep(1)

        new_takeoff_queue = []  
        planes_to_remove = []
        
        for plane_id in takeoff_queue[:]:
            if plane_id not in planes:
                continue  
            
            plane = planes[plane_id]
            plane["distance"] += plane["speed"] * 10
            plane["fuel"] = max(plane["fuel"] - 1, 0)  

            if plane["fuel"] <= 20 or plane["status"] == "Emergencia":
                priority_queue(plane_id)
                planes_to_remove.append(plane_id)
            else:
                new_takeoff_queue.append(plane_id)

            if plane["distance"] >= 9999999:
                planes_to_remove.append(plane_id)

        for plane_id in planes_to_remove:
            if plane_id in takeoff_queue:
                takeoff_queue.remove(plane_id)
            if plane_id in planes:
                del planes[plane_id]

        takeoff_queue = new_takeoff_queue

        socketio.emit("update_planes", {
            "planes": planes,
            "landing_queue": list(landing_queue),
            "takeoff_queue": takeoff_queue,
            "nearby_queue": nearby_queue
        })

def manage_nearby_planes():
    #Maneja la lista de aviones cercanos y los mueve si es necesario.
    global nearby_queue  

    while True:
        time.sleep(1)

        new_nearby_queue = []  
        planes_to_remove = [] 

        for plane_id in nearby_queue:
            if plane_id not in planes:
                continue  

            plane = planes[plane_id]
            plane["distance"] -= plane["speed"] * 10
            plane["fuel"] = max(plane["fuel"] - 1, 0)  

            if plane["fuel"] <= 20 or plane["status"] == "Emergencia":
                priority_queue(plane_id)
                planes_to_remove.append(plane_id)
            else:
                new_nearby_queue.append(plane_id)

            if plane["distance"] <= -9999999:
                planes_to_remove.append(plane_id)

        for plane_id in planes_to_remove:
            if plane_id in nearby_queue:
                nearby_queue.remove(plane_id)
            if plane_id in planes:
                del planes[plane_id]

        nearby_queue = new_nearby_queue  

        socketio.emit("update_planes", {
            "planes": planes,
            "landing_queue": list(landing_queue),
            "takeoff_queue": takeoff_queue,
            "nearby_queue": nearby_queue
        })

# Iniciamos el hilo de simulación
threading.Thread(target=update_planes, daemon=True).start()
threading.Thread(target=manage_takeoffs, daemon=True).start()
threading.Thread(target=manage_nearby_planes, daemon=True).start()

if __name__ == "__main__":
    socketio.run(app, debug=True, host="0.0.0.0", port=5000)
