const API_URL = "http://127.0.0.1:5000/events";

const form = document.querySelector("form");
const titleInput = document.getElementById("title");
const eventList = document.getElementById("event-list");

// Render a single event as a list item
function renderEvent(event) {
  const li = document.createElement("li");
  li.textContent = event.title;
  li.dataset.id = event.id;
  eventList.appendChild(li);
}

// Show a short status/error message under the form
function showMessage(text, isError = false) {
  let msg = document.getElementById("message");
  if (!msg) {
    msg = document.createElement("p");
    msg.id = "message";
    form.after(msg);
  }
  msg.textContent = text;
  msg.className = isError ? "error" : "success";
}

// GET /events — load and display all events
function loadEvents() {
  fetch(API_URL)
    .then((res) => {
      if (!res.ok) throw new Error(`Server responded ${res.status}`);
      return res.json();
    })
    .then((events) => {
      eventList.innerHTML = "";
      events.forEach(renderEvent);
    })
    .catch((err) => {
      console.error(err);
      showMessage("Could not load events. Is the Flask server running?", true);
    });
}

// POST /events — submit a new event
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const title = titleInput.value.trim();
  if (!title) {
    showMessage("Please enter an event title.", true);
    return;
  }

  fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  })
    .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
    .then(({ ok, data }) => {
      if (!ok) throw new Error(data.error || "Failed to add event");
      renderEvent(data);
      form.reset();
      showMessage(`Added "${data.title}"`);
    })
    .catch((err) => {
      console.error(err);
      showMessage(err.message, true);
    });
});

document.addEventListener("DOMContentLoaded", loadEvents);
