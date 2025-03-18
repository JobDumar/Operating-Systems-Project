from flask import Flask, request, jsonify
from flask_socketio import SocketIO, emit
import time
import threading
import heapq

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")

# Cola de prioridad de aviones (menor gasolina -> más prioridad)
planes_queue = []
planes = {}  # Diccionario para manejar estados

# 🔹 Endpoint para registrar un avión
@app.route('/register_plane', methods=['POST'])
def register_plane():
    data = request.json
    plane_id = data["id"]
    planes[plane_id] = {
        "id": plane_id,
        "distance": data["distance"],
        "speed": data["speed"],
        "fuel": data["fuel"],
        "status": "En vuelo"
    }
    
    # Agregamos a la cola de prioridad (ordenamos por gasolina)
    heapq.heappush(planes_queue, (data["fuel"], plane_id))
    
    # 🔹 Emitimos actualización al frontend
    socketio.emit("update_planes", planes)
    
    return jsonify({"message": "Avión registrado", "plane": planes[plane_id]}), 201

# 🔹 Simulación del movimiento de aviones
def update_planes():
    while True:
        time.sleep(1)  # Cada segundo en la realidad = 10 segundos simulados
        for plane_id in list(planes.keys()):
            planes[plane_id]["distance"] -= planes[plane_id]["speed"] * 10
            planes[plane_id]["fuel"] -= 5  # Consumo de combustible

            if planes[plane_id]["distance"] <= 0:
                planes[plane_id]["status"] = "Aterrizó"
                planes.pop(plane_id)
        
        # 🔹 Enviar actualización a todos los clientes
        socketio.emit("update_planes", planes)

# Iniciamos el hilo de simulación
threading.Thread(target=update_planes, daemon=True).start()

@app.route('/get_planes', methods=['GET'])
def get_planes():
    global planes  # 
    
    print("Estado actual antes de enviar:", planes)
    return jsonify(planes), 200

if __name__ == "__main__":
    socketio.run(app, debug=True, host="0.0.0.0", port=5000)
