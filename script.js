const STORAGE_KEY = "taskmaster_tasks";

let tasks = loadTasks();

const form = document.getElementById("taskForm");
const input = document.getElementById("taskInput");
const timeInput = document.getElementById("taskTime");

const pendingList = document.getElementById("pendingList");
const completedList = document.getElementById("completedList");

const totalCount = document.getElementById("totalCount");
const completedCount = document.getElementById("completedCount");
const pendingCount = document.getElementById("pendingCount");

form.addEventListener("submit", addTask);
pendingList.addEventListener("click", handleClick);
completedList.addEventListener("click", handleClick);

function addTask(event) {
  event.preventDefault();

  const text = input.value.trim();
  const time = timeInput.value;

  if (!text) return;

  const task = {
    id: Date.now(),
    text,
    time,
    completed: false,
  };

  tasks.push(task);
  saveAndRender();

  input.value = "";
  timeInput.value = "";
}

function handleClick(event) {
  const button = event.target;
  const li = button.closest("li");
  if (!li) return;

  const id = Number(li.dataset.id);

  if (button.dataset.action === "toggle") {
    toggleTask(id);
    return;
  }
  if (button.dataset.action === "delete") {
    deleteTask(id);
    return;
  }

  // Inline editing logic
  if (li.parentElement && li.parentElement.id === "pendingList") {
    if (button.classList.contains("task-text")) {
      enableEditing(button, id, "text");
    } else if (button.classList.contains("time")) {
      enableEditing(button, id, "time");
    }
  }
}

function enableEditing(element, id, field) {
  const currentValue = element.innerText;
  const input = document.createElement("input");
  input.type = field === "time" ? "time" : "text";
  input.value =
    field === "time" ? currentValue.replace("⏰ ", "") : currentValue;
  input.className = "edit-input";

  element.replaceWith(input);
  input.focus();

  function save() {
    const newValue = input.value.trim();
    if (newValue) {
      tasks = tasks.map((t) => (t.id === id ? { ...t, [field]: newValue } : t));
      saveAndRender();
    } else {
      // Revert if empty (or handle delete? let's just revert for now to be safe)
      saveAndRender();
    }
  }

  input.addEventListener("blur", save);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      input.blur();
    }
  });
}

function toggleTask(id) {
  tasks = tasks.map((task) =>
    task.id === id ? { ...task, completed: !task.completed } : task
  );
  saveAndRender();
}

function deleteTask(id) {
  tasks = tasks.filter((task) => task.id !== id);
  saveAndRender();
}

function renderTasks() {
  pendingList.innerHTML = "";
  completedList.innerHTML = "";

  tasks.forEach((task) => {
    const li = document.createElement("li");
    li.dataset.id = task.id;
    li.className = task.completed ? "completed" : "";

    li.innerHTML = `
    <div class="task-info">
    <span class="task-text">${task.text}</span>
    ${
      task.time
        ? `<span class="time">⏰ ${task.time}</span>`
        : `<span class="time">Add time</span>`
    }
    </div>
    <div class="actions">
    <button data-action="toggle" class="toggle">✓</button>
    <button data-action="delete" class="delete">✕</button>
    </div>
    `;

    task.completed
      ? completedList.appendChild(li)
      : pendingList.appendChild(li);
  });
}

function updateCounters() {
  totalCount.textContent = tasks.length;
  completedCount.textContent = tasks.filter((t) => t.completed).length;
  pendingCount.textContent = tasks.filter((t) => !t.completed).length;
}

function saveAndRender() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  renderTasks();
  updateCounters();
}

function loadTasks() {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

saveAndRender();
