const STORAGE_KEY = "internshiphub.tasks.v1";
const THEME_KEY = "internshiphub.theme.v1";

const seedTasks = [
  {id:"seed-1",title:"Create a semantic HTML page structure",description:"Organise the page with meaningful landmarks and accessible labels.",category:"Frontend",priority:"high",status:"done",dueDate:"",createdAt:Date.now()-86400000*5,completedAt:Date.now()-86400000*2},
  {id:"seed-2",title:"Build a responsive layout with CSS Grid",description:"Check the layout on mobile, tablet and desktop breakpoints.",category:"Frontend",priority:"high",status:"progress",dueDate:"",createdAt:Date.now()-86400000*3,completedAt:null},
  {id:"seed-3",title:"Practise DOM events and form validation",description:"Validate user input and provide clear inline feedback.",category:"JavaScript",priority:"medium",status:"todo",dueDate:"",createdAt:Date.now()-86400000*2,completedAt:null},
  {id:"seed-4",title:"Document the project in README.md",description:"Add setup steps, features, screenshots and deployment notes.",category:"Portfolio",priority:"medium",status:"todo",dueDate:"",createdAt:Date.now()-86400000,completedAt:null},
  {id:"seed-5",title:"Explore the Fetch API and async/await",description:"Handle successful responses, invalid data and network errors.",category:"Learning",priority:"low",status:"todo",dueDate:"",createdAt:Date.now(),completedAt:null}
];

let tasks = loadTasks();
let activeView = "overview";
let toastTimeout;
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

function loadTasks() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === null) return seedTasks;
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : seedTasks;
  } catch (error) {
    console.warn("Saved tasks could not be read. Using sample tasks.", error);
    return seedTasks;
  }
}

function persistTasks() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (error) {
    showToast("Could not save to this browser. Check storage settings.");
  }
}

function escapeHTML(value = "") {
  return String(value).replace(/[&<>"']/g, char => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;"
  })[char]);
}

function dateLabel(dateString) {
  if (!dateString) return "";
  const date = new Date(`${dateString}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "";
  const today = new Date();
  today.setHours(0,0,0,0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  if (date.getTime() === today.getTime()) return "Due today";
  if (date.getTime() === tomorrow.getTime()) return "Due tomorrow";
  return `Due ${date.toLocaleDateString(undefined,{month:"short",day:"numeric"})}`;
}

function statusLabel(status) {
  return ({todo:"To do",progress:"In progress",done:"Completed"})[status] || "To do";
}

function renderTask(task) {
  const done = task.status === "done";
  const due = dateLabel(task.dueDate);
  return `<article class="task-row ${done ? "is-done" : ""}" data-task-id="${escapeHTML(task.id)}">
    <input class="task-check" type="checkbox" aria-label="${done ? "Mark incomplete" : "Mark complete"}: ${escapeHTML(task.title)}" ${done ? "checked" : ""} data-action="toggle">
    <div class="task-main">
      <div class="task-title-line"><span class="task-title">${escapeHTML(task.title)}</span></div>
      ${task.description ? `<div class="task-description">${escapeHTML(task.description)}</div>` : ""}
      <div class="task-meta"><span class="category-pill">${escapeHTML(task.category || "Other")}</span><span class="priority-pill ${escapeHTML(task.priority || "medium")}">${escapeHTML((task.priority || "medium").toUpperCase())}</span><span class="status-pill ${escapeHTML(task.status)}">${statusLabel(task.status)}</span>${due ? `<span class="task-due">${escapeHTML(due)}</span>` : ""}</div>
    </div>
    <div class="task-actions"><button class="task-action" data-action="edit" aria-label="Edit ${escapeHTML(task.title)}" title="Edit task">✎</button><button class="task-action" data-action="delete" aria-label="Delete ${escapeHTML(task.title)}" title="Delete task">×</button></div>
  </article>`;
}

function filterTasks(search, status) {
  const query = search.trim().toLowerCase();
  return tasks.filter(task => {
    const matchesQuery = !query || [task.title, task.description, task.category].some(value => String(value || "").toLowerCase().includes(query));
    const matchesStatus = status === "all" || task.status === status;
    return matchesQuery && matchesStatus;
  }).sort((a,b) => {
    const rank = {progress:0,todo:1,done:2};
    return rank[a.status] - rank[b.status] || (a.dueDate || "9999").localeCompare(b.dueDate || "9999") || b.createdAt - a.createdAt;
  });
}

function renderTaskCollection(container, empty, search, status, limit = Infinity) {
  const filtered = filterTasks(search, status);
  container.innerHTML = filtered.slice(0, limit).map(renderTask).join("");
  empty.classList.toggle("hidden", filtered.length > 0);
  return filtered.length;
}

function startOfWeek(date) {
  const day = date.getDay();
  const result = new Date(date);
  result.setHours(0,0,0,0);
  result.setDate(result.getDate() + (day === 0 ? -6 : 1-day));
  return result;
}

function updateStats() {
  const total = tasks.length;
  const completed = tasks.filter(task => task.status === "done").length;
  const active = tasks.filter(task => task.status === "progress").length;
  const rate = total ? Math.round(completed / total * 100) : 0;
  $("#totalTasks").textContent = total;
  $("#activeTasks").textContent = active;
  $("#completedTasks").textContent = completed;
  $("#completionRate").textContent = rate;
  $("#completionBar").style.width = `${rate}%`;
  $("#navTaskCount").textContent = tasks.filter(task => task.status !== "done").length;
  $("#taskHeadingCount").textContent = total;

  const weekStart = startOfWeek(new Date());
  const counts = Array(7).fill(0);
  tasks.forEach(task => {
    if (task.status !== "done" || !task.completedAt) return;
    const date = new Date(task.completedAt);
    date.setHours(0,0,0,0);
    const diff = Math.floor((date - weekStart) / 86400000);
    if (diff >= 0 && diff < 7) counts[diff]++;
  });
  const max = Math.max(1, ...counts);
  $("#weeklyCompleted").textContent = counts.reduce((sum,value)=>sum+value,0);
  const todayIndex = (new Date().getDay()+6)%7;
  $("#weekChart").innerHTML = counts.map((count,index) => `<div class="chart-bar-wrap"><div class="chart-bar ${index===todayIndex?"today":""}" title="${count} completed" style="height:${Math.max(5,count/max*100)}%"></div></div>`).join("");

  const groups = [
    {categories:["Frontend"],progress:"#frontendProgress",bar:"#frontendBar"},
    {categories:["JavaScript","Learning"],progress:"#jsProgress",bar:"#jsBar"},
    {categories:["Portfolio","Other"],progress:"#shipProgress",bar:"#shipBar"}
  ];
  groups.forEach(group => {
    const subset = tasks.filter(task => group.categories.includes(task.category));
    const done = subset.filter(task => task.status === "done").length;
    const percent = subset.length ? Math.round(done/subset.length*100) : 0;
    $(group.progress).textContent = `${percent}% done`;
    $(group.bar).style.width = `${percent}%`;
  });
}

function renderAll() {
  renderTaskCollection($("#taskList"), $("#emptyState"), $("#taskSearch").value, $("#statusFilter").value, 5);
  renderTaskCollection($("#allTaskList"), $("#allEmptyState"), $("#allTaskSearch").value, $("#allStatusFilter").value);
  updateStats();
}

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toast.classList.remove("show"), 2600);
}

function openModal(task = null) {
  $("#taskForm").reset();
  $("#taskId").value = task?.id || "";
  $("#modalTitle").textContent = task ? "Edit task" : "Create a task";
  $("#saveTaskButton").innerHTML = task ? "Save changes <span>→</span>" : "Save task <span>→</span>";
  $("#taskTitle").value = task?.title || "";
  $("#taskDescription").value = task?.description || "";
  $("#taskCategory").value = task?.category || "Frontend";
  $("#taskPriority").value = task?.priority || "medium";
  $("#taskStatus").value = task?.status || "todo";
  $("#taskDue").value = task?.dueDate || "";
  $("#taskModal").classList.remove("hidden");
  document.body.style.overflow = "hidden";
  setTimeout(() => $("#taskTitle").focus(), 40);
}

function closeModal() {
  $("#taskModal").classList.add("hidden");
  document.body.style.overflow = "";
}

function saveTask(event) {
  event.preventDefault();
  const title = $("#taskTitle").value.trim();
  if (!title) {
    $("#taskTitle").focus();
    showToast("Please enter a task title.");
    return;
  }
  const id = $("#taskId").value;
  const previous = tasks.find(task => task.id === id);
  const status = $("#taskStatus").value;
  const task = {
    id: id || (crypto.randomUUID ? crypto.randomUUID() : `task-${Date.now()}`),
    title,
    description: $("#taskDescription").value.trim(),
    category: $("#taskCategory").value,
    priority: $("#taskPriority").value,
    status,
    dueDate: $("#taskDue").value,
    createdAt: previous?.createdAt || Date.now(),
    completedAt: status === "done" ? (previous?.status === "done" ? previous.completedAt : Date.now()) : null
  };
  if (previous) {
    tasks = tasks.map(item => item.id === id ? task : item);
    showToast("Task updated successfully.");
  } else {
    tasks.unshift(task);
    showToast("Task added to your workspace.");
  }
  persistTasks();
  renderAll();
  closeModal();
}

function handleTaskAction(event) {
  const control = event.target.closest("[data-action]");
  if (!control) return;
  const row = control.closest("[data-task-id]");
  if (!row) return;
  const task = tasks.find(item => item.id === row.dataset.taskId);
  if (!task) return;
  const action = control.dataset.action;
  if (action === "toggle") {
    const checked = control.checked;
    task.status = checked ? "done" : "todo";
    task.completedAt = checked ? Date.now() : null;
    persistTasks();
    renderAll();
    showToast(checked ? "Nice work — task completed." : "Task moved back to To do.");
  } else if (action === "edit") {
    openModal(task);
  } else if (action === "delete") {
    if (!window.confirm(`Delete "${task.title}"? This cannot be undone.`)) return;
    tasks = tasks.filter(item => item.id !== task.id);
    persistTasks();
    renderAll();
    showToast("Task deleted.");
  }
}

function navigate(view) {
  activeView = view;
  const viewMap = {overview:"#overviewView",tasks:"#allTasksView",projects:"#projectsView"};
  Object.entries(viewMap).forEach(([key,selector]) => $(selector).classList.toggle("hidden", key !== view));
  $$(".nav-item").forEach(link => link.classList.toggle("active", link.dataset.view === view || (view === "tasks" && link.dataset.view === "tasks")));
  $("#pageName").textContent = view === "overview" ? "Overview" : view === "tasks" ? "My tasks" : "Projects";
  $("#sidebar").classList.remove("open");
  window.scrollTo({top:0,behavior:"smooth"});
  if (view === "tasks") renderTaskCollection($("#allTaskList"), $("#allEmptyState"), $("#allTaskSearch").value, $("#allStatusFilter").value);
}

const fallbackQuotes = [
  {text:"Great things are done by a series of small things brought together.",author:"Vincent van Gogh"},
  {text:"It always seems impossible until it is done.",author:"Nelson Mandela"},
  {text:"The secret of getting ahead is getting started.",author:"Mark Twain"},
  {text:"Well done is better than well said.",author:"Benjamin Franklin"},
  {text:"Success is the sum of small efforts, repeated day in and day out.",author:"Robert Collier"}
];
let quoteIndex = 0;
async function refreshQuote() {
  const button = $("#refreshQuote");
  button.disabled = true;
  button.textContent = "…";
  try {
    const response = await fetch("https://dummyjson.com/quotes/random", {headers:{"Accept":"application/json"}});
    if (!response.ok) throw new Error("Quote service unavailable");
    const data = await response.json();
    if (!data.quote || !data.author) throw new Error("Unexpected quote response");
    $("#quoteText").textContent = data.quote;
    $("#quoteAuthor").textContent = `— ${data.author}`;
  } catch (error) {
    quoteIndex = (quoteIndex + 1) % fallbackQuotes.length;
    $("#quoteText").textContent = fallbackQuotes[quoteIndex].text;
    $("#quoteAuthor").textContent = `— ${fallbackQuotes[quoteIndex].author}`;
  } finally {
    button.disabled = false;
    button.textContent = "↻";
  }
}

function setTheme(theme) {
  document.body.classList.toggle("dark", theme === "dark");
  $("#themeToggle").textContent = theme === "dark" ? "☾" : "☼";
  $("#themeToggle").setAttribute("aria-label", theme === "dark" ? "Switch to light theme" : "Switch to dark theme");
  try { localStorage.setItem(THEME_KEY, theme); } catch (_) {}
}

function init() {
  const today = new Date();
  $("#todayLabel").textContent = today.toLocaleDateString(undefined,{weekday:"short",month:"short",day:"numeric"});
  $("#footerDate").textContent = `© ${today.getFullYear()} InternshipHub`;
  let savedTheme = "light";
  try { savedTheme = localStorage.getItem(THEME_KEY) || "light"; } catch (_) {}
  setTheme(savedTheme);
  renderAll();

  [$("#taskList"),$("#allTaskList")].forEach(container => {
    container.addEventListener("click", handleTaskAction);
    container.addEventListener("change", handleTaskAction);
  });
  $("#taskSearch").addEventListener("input", renderAll);
  $("#statusFilter").addEventListener("change", renderAll);
  $("#allTaskSearch").addEventListener("input", () => renderTaskCollection($("#allTaskList"), $("#allEmptyState"), $("#allTaskSearch").value, $("#allStatusFilter").value));
  $("#allStatusFilter").addEventListener("change", () => renderTaskCollection($("#allTaskList"), $("#allEmptyState"), $("#allTaskSearch").value, $("#allStatusFilter").value));
  $("#taskForm").addEventListener("submit", saveTask);
  ["#topAddButton","#quickAddButton","#emptyAddButton"].forEach(selector => $(selector).addEventListener("click", () => openModal()));
  ["#closeModal","#cancelModal"].forEach(selector => $(selector).addEventListener("click", closeModal));
  $("#taskModal").addEventListener("click", event => { if (event.target === $("#taskModal")) closeModal(); });
  document.addEventListener("keydown", event => { if (event.key === "Escape" && !$("#taskModal").classList.contains("hidden")) closeModal(); });
  $("#viewAllTasks").addEventListener("click", () => navigate("tasks"));
  $("#themeToggle").addEventListener("click", () => setTheme(document.body.classList.contains("dark") ? "light" : "dark"));
  $("#refreshQuote").addEventListener("click", refreshQuote);
  $("#mobileMenu").addEventListener("click", () => $("#sidebar").classList.toggle("open"));
  $$(".nav-item").forEach(link => link.addEventListener("click", event => {
    event.preventDefault();
    navigate(link.dataset.view);
  }));
  $("#profileMenu").addEventListener("click", () => showToast("Your tasks are stored locally in this browser."));
}
document.addEventListener("DOMContentLoaded", init);
