import React, { useState, useEffect } from 'react';

// Define what a Task looks like
interface Task {
  id: number;
  title: string;
  description: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
}

// Types for filters
type FilterType = 'all' | 'active' | 'completed' | 'low' | 'medium' | 'high';

export default function TaskManager() {
  // All our tasks stored here
  const [tasks, setTasks] = useState<Task[]>([]);
  
  // Form inputs
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  
  // Filter and search
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchText, setSearchText] = useState<string>('');
  
  // For editing tasks
  const [editingId, setEditingId] = useState<number | null>(null);
  
  // For drag and drop
  const [draggedTask, setDraggedTask] = useState<number | null>(null);

  // Load tasks from localStorage when app starts
  useEffect(() => {
    const saved = localStorage.getItem('tasks');
    if (saved) {
      setTasks(JSON.parse(saved));
    }
  }, []);

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  // Add or update a task
  const handleSubmit = (): void => {
    if (!title.trim()) return; // Title is required
    
    if (editingId) {
      // Update existing task
      setTasks(tasks.map(task => 
        task.id === editingId 
          ? { ...task, title, description, dueDate, priority }
          : task
      ));
      setEditingId(null);
    } else {
      // Add new task
      const newTask: Task = {
        id: Date.now(),
        title,
        description,
        dueDate,
        priority,
        completed: false
      };
      setTasks([...tasks, newTask]);
    }
    
    // Clear form
    setTitle('');
    setDescription('');
    setDueDate('');
    setPriority('medium');
  };

  // Edit a task - load it into the form
  const editTask = (task: Task): void => {
    setTitle(task.title);
    setDescription(task.description);
    setDueDate(task.dueDate);
    setPriority(task.priority);
    setEditingId(task.id);
  };

  // Delete a task
  const deleteTask = (id: number): void => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  // Toggle completion
  const toggleComplete = (id: number): void => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  // Filter tasks based on selected filter and search
  const getFilteredTasks = (): Task[] => {
    let filtered = tasks;

    // Apply status filter
    if (filter === 'active') {
      filtered = filtered.filter(task => !task.completed);
    } else if (filter === 'completed') {
      filtered = filtered.filter(task => task.completed);
    } else if (filter === 'low' || filter === 'medium' || filter === 'high') {
      filtered = filtered.filter(task => task.priority === filter);
    }

    // Apply search
    if (searchText) {
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchText.toLowerCase()) ||
        task.description.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    return filtered;
  };

  // Priority colors
  const getPriorityColor = (priority: 'low' | 'medium' | 'high'): string => {
    if (priority === 'high') return 'bg-red-100 border-red-300 text-red-800';
    if (priority === 'medium') return 'bg-yellow-100 border-yellow-300 text-yellow-800';
    return 'bg-green-100 border-green-300 text-green-800';
  };

  // Drag and drop handlers
  const handleDragStart = (id: number): void => {
    setDraggedTask(id);
  };

  const handleDragOver = (e: React.DragEvent): void => {
    e.preventDefault(); // This allows the drop
  };

  const handleDrop = (targetId: number): void => {
    if (draggedTask === null || draggedTask === targetId) return;

    // Find positions of dragged and target tasks
    const draggedIndex = tasks.findIndex(t => t.id === draggedTask);
    const targetIndex = tasks.findIndex(t => t.id === targetId);

    // Create new array with reordered tasks
    const newTasks = [...tasks];
    const [removed] = newTasks.splice(draggedIndex, 1);
    newTasks.splice(targetIndex, 0, removed);

    setTasks(newTasks);
    setDraggedTask(null);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">📝 Task Manager</h1>

      {/* Task Form */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <div className="mb-4">
          <input
            type="text"
            placeholder="Task title *"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>

        <div className="mb-4">
          <textarea
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Due Date</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          {editingId ? 'Update Task' : 'Add Task'}
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="🔍 Search tasks..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded ${filter === 'all' ? 'bg-blue-500 text-white' : 'bg-white'}`}>
          All ({tasks.length})
        </button>
        <button onClick={() => setFilter('active')} className={`px-4 py-2 rounded ${filter === 'active' ? 'bg-blue-500 text-white' : 'bg-white'}`}>
          Active ({tasks.filter(t => !t.completed).length})
        </button>
        <button onClick={() => setFilter('completed')} className={`px-4 py-2 rounded ${filter === 'completed' ? 'bg-blue-500 text-white' : 'bg-white'}`}>
          Completed ({tasks.filter(t => t.completed).length})
        </button>
        <button onClick={() => setFilter('high')} className={`px-4 py-2 rounded ${filter === 'high' ? 'bg-red-500 text-white' : 'bg-white'}`}>
          High Priority
        </button>
        <button onClick={() => setFilter('medium')} className={`px-4 py-2 rounded ${filter === 'medium' ? 'bg-yellow-500 text-white' : 'bg-white'}`}>
          Medium Priority
        </button>
        <button onClick={() => setFilter('low')} className={`px-4 py-2 rounded ${filter === 'low' ? 'bg-green-500 text-white' : 'bg-white'}`}>
          Low Priority
        </button>
      </div>

      {/* Task List */}
      {tasks.length > 0 && (
        <p className="text-sm text-gray-500 mb-2">💡 Drag and drop tasks to reorder them</p>
      )}
      <div className="space-y-3">
        {getFilteredTasks().map(task => (
          <div
            key={task.id}
            draggable
            onDragStart={() => handleDragStart(task.id)}
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(task.id)}
            className={`bg-white p-4 rounded-lg shadow border-l-4 ${getPriorityColor(task.priority)} ${task.completed ? 'opacity-60' : ''} cursor-move hover:shadow-lg transition-shadow`}
          >
            <div className="flex items-start gap-3">
              {/* Checkbox */}
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => toggleComplete(task.id)}
                className="mt-1 w-5 h-5 cursor-pointer"
              />

              {/* Task Content */}
              <div className="flex-1">
                <h3 className={`text-lg font-semibold ${task.completed ? 'line-through' : ''}`}>
                  {task.title}
                </h3>
                {task.description && (
                  <p className="text-gray-600 text-sm mt-1">{task.description}</p>
                )}
                <div className="flex gap-4 mt-2 text-sm text-gray-500">
                  {task.dueDate && <span>📅 {new Date(task.dueDate).toLocaleDateString()}</span>}
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${getPriorityColor(task.priority)}`}>
                    {task.priority.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => editTask(task)}
                  className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}

        {getFilteredTasks().length === 0 && (
          <div className="text-center text-gray-500 py-8">
            No tasks found. Add your first task above! 🎯
          </div>
        )}
      </div>
    </div>
  );
}