from flask import Flask, jsonify, request
from flask_cors import CORS

from data import events

app = Flask(__name__)
CORS(app)


# ---------- Helpers ----------

def next_id():
    """Return a unique ID one higher than the current max."""
    return max((event["id"] for event in events), default=0) + 1


def find_event(event_id):
    """Look up a single event by ID, or None if it doesn't exist."""
    return next((event for event in events if event["id"] == event_id), None)


def error(message, status):
    """Consistent JSON error shape for every failure."""
    return jsonify({"error": message}), status


# ---------- Routes ----------

@app.route("/")
def home():
    return jsonify({"message": "Welcome to the Event Catalog API!"}), 200


@app.route("/events", methods=["GET"])
def get_events():
    return jsonify(events), 200


@app.route("/events/<int:event_id>", methods=["GET"])
def get_event(event_id):
    event = find_event(event_id)
    if event is None:
        return error(f"Event {event_id} not found", 404)
    return jsonify(event), 200


@app.route("/events", methods=["POST"])
def create_event():
    data = request.get_json(silent=True)

    if not data or not str(data.get("title", "")).strip():
        return error("Field 'title' is required", 400)

    new_event = {"id": next_id(), "title": data["title"].strip()}
    events.append(new_event)
    return jsonify(new_event), 201


# ---------- Error handlers ----------

@app.errorhandler(404)
def not_found(_e):
    return error("Resource not found", 404)


@app.errorhandler(405)
def method_not_allowed(_e):
    return error("Method not allowed", 405)


if __name__ == "__main__":
    app.run(debug=True)
