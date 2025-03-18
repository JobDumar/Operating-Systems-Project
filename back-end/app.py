from flask import Flask, request, jsonify
from flask_socketio import SocketIO
import heapq

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")

planes = {}  # 🔹 Almacena los aviones registrados
planes_queue = []  # 🔹 Cola de prioridad basada en combustible

@app.route('/register_plane', methods=['POST'])
def register_plane():
    global planes  # 🔹 Usamos global para no perder los datos
    
    data = request.json
    plane_id = data["id"]
    planes[plane_id] = {
        "id": plane_id,
        "distance": data["distance"],
        "speed": data["speed"],
        "fuel": data["fuel"],
        "status": "En vuelo"
    }
    
    # Agregamos a la cola de prioridad
    heapq.heappush(planes_queue, (data["fuel"], plane_id))
    
    # 🔹 Emitimos actualización al frontend
    socketio.emit("update_planes", planes)
    
    # 🔹 Imprimimos el estado actual de los aviones
    print("Estado actual de planes:", planes)
    
    return jsonify({"message": "Avión registrado", "plane": planes[plane_id]}), 201

@app.route('/get_planes', methods=['GET'])
def get_planes():
    global planes  # 🔹 Usamos global para conservar los aviones
    
    print("Estado actual antes de enviar:", planes)
    return jsonify(planes), 200

if __name__ == '__main__':
    socketio.run(app, debug=True)
