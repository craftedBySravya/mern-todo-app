import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./Login";
import Signup from "./Signup";
import "./styles.css";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [tasks, setTasks] = useState([]);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");

  const API_BASE = "https://todobackend-bi77.onrender.com"; // ✅ change this if needed

  const fetchTasks = async () => {
    const response = await fetch(`${API_BASE}/tasks`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    setTasks(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    if (token) fetchTasks();
  }, [token]);

  const logout = () => {
    setToken("");
    localStorage.removeItem("token");
    setTasks([]);
  };

  const addTask = async (text) => {
    const response = await fetch(`${API_BASE}/tasks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ text, status: "pending", priority: "medium" }),
    });
    const newTask = await response.json();
    setTasks([...tasks, newTask]);
  };

  const deleteTask = async (id) => {
    await fetch(`${API_BASE}/tasks/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    setTasks(tasks.filter((task) => task._id !== id));
  };

  const updateTaskStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === "pending" ? "completed" : "pending";
    const response = await fetch(`${API_BASE}/tasks/${id}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status: newStatus }),
    });
    const updatedTask = await response.json();
    setTasks(tasks.map((task) => (task._id === id ? updatedTask : task)));
  };

  const updateTaskPriority = async (id, newPriority) => {
    const response = await fetch(`${API_BASE}/tasks/${id}/priority`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ priority: newPriority }),
    });
    const updatedTask = await response.json();
    setTasks(tasks.map((task) => (task._id === id ? updatedTask : task)));
  };

  const filteredTasks = tasks.filter(
    (task) =>
      (filterStatus === "all" || task.status === filterStatus) &&
      (filterPriority === "all" || task.priority === filterPriority)
  );

  const MainApp = () => (
    <div className="container todo-page">
      <div className="todo-card">
      <nav className="todo-header">
        <h2>MERN To-Do App</h2>
        <button onClick={logout} className="logout-btn">
          Logout
        </button>
      </nav>
  
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const text = e.target.task.value.trim();
          if (text) addTask(text);
          e.target.reset();
        }}
        className="todo-form"
      >
        <input
          name="task"
          type="text"
          placeholder="Add a task"
          className="todo-input"
        />
        <button type="submit" className="todo-add-btn">
          Add
        </button>
      </form>
  
      <div className="filters">
        <select
          onChange={(e) => setFilterStatus(e.target.value)}
          value={filterStatus}
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
        </select>
  
        <select
          onChange={(e) => setFilterPriority(e.target.value)}
          value={filterPriority}
        >
          <option value="all">All Priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>
  
      <ul className="todo-list">
        {filteredTasks.map((task) => (
          <li key={task._id} className="todo-item">
            <div>
              <span className="task-text">{task.text}</span>{" "}
              <span className="task-meta">
                ({task.status}, {task.priority})
              </span>
            </div>
            <div className="task-controls">
              <button
                onClick={() => updateTaskStatus(task._id, task.status)}
                className="complete-btn"
              >
                {task.status === "pending" ? "Complete" : "Pending"}
              </button>
  
              <select
                value={task.priority}
                onChange={(e) =>
                  updateTaskPriority(task._id, e.target.value)
                }
                className={`priority-select priority-${task.priority}`}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
  
              <button
                onClick={() => deleteTask(task._id)}
                className="delete-btn"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
      
      </div>
      <footer className="todo-footer">© 2025 Sravya’s To-Do App. All rights reserved.</footer>
    </div>
  );

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login setToken={setToken} />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/"
          element={token ? <MainApp /> : <Navigate to="/login" replace />}
        />
      </Routes>
    </Router>
  );
}

export default App;