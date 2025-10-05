import React, { useState, useEffect, useMemo, useCallback } from 'react';

const VIEWS = {
  LIST: 'LIST',
  CREATE: 'CREATE',
  EDIT: 'EDIT',
  DELETE: 'DELETE'
};

const useForm = (initialValues, validateFn) => {
  
  const [values, setValues] = useState(initialValues);
  
  const [errors, setErrors] = useState({});

  const handleChange = useCallback((event) => {
    const { name, value } = event.target;
    setValues(prev => ({
      ...prev,
      [name]: value,
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined,
      }));
    }
  }, [errors]);

  const validate = useCallback(() => {
    const newErrors = validateFn(values);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [values, validateFn]);

  return {
    values,
    errors,
    handleChange,
    setValues,
    validate
  };
};

const useTasks = () => {
  const localStorageKey = 'reactTaskApp_tasks';
  const [tasks, setTasks] = useState(() => {
    try {
      const storedTasks = localStorage.getItem(localStorageKey);
      return storedTasks ? JSON.parse(storedTasks) : [];
    } catch (error) {
      console.error("Could not load tasks from localStorage", error);
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(localStorageKey, JSON.stringify(tasks));
    } catch (error) {
      console.error("Could not save tasks to localStorage", error);
    }
  }, [tasks]);

  const addTask = useCallback((newTaskData) => {
    const id = Date.now().toString(36) + Math.random().toString(36).substring(2);
    const newTask = { ...newTaskData, id };
    setTasks(prev => [...prev, newTask]);
  }, []);

  const updateTask = useCallback((updatedTask) => {
    setTasks(prev => prev.map(task =>
      task.id === updatedTask.id ? updatedTask : task
    ));
  }, []);

  const deleteTask = useCallback((taskId) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
  }, []);

  return { tasks, addTask, updateTask, deleteTask };
};

const TrashIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash-2">
    <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M15 6V4c0-1-1-2-2-2h-2c-1 0-2 1-2 2v2"/>
  </svg>
);

const EditIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pencil">
    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
  </svg>
);

const ArrowUpIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-up">
    <path d="m5 12 7-7 7 7"/><path d="M12 19V5"/>
  </svg>
);

const ArrowDownIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-down">
    <path d="m19 12-7 7-7-7"/><path d="M12 19V5"/>
  </svg>
);

const getStatusClasses = (status) => {
  switch (status) {
    case 'Completed':
      return 'bg-green-100 text-green-800 border-green-300';
    case 'In Progress':
      return 'bg-blue-100 text-blue-800 border-blue-300';
    case 'Pending':
    default:
      return 'bg-yellow-100 text-yellow-800 border-yellow-300';
  }
};

const getPriorityClasses = (priority) => {
  switch (priority) {
    case 'High':
      return 'text-red-600 font-bold';
    case 'Medium':
      return 'text-orange-500 font-medium';
    case 'Low':
    default:
      return 'text-gray-500';
  }
};

const StatusTag = ({ status }) => (
  <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full border ${getStatusClasses(status)}`}>
    {status}
  </span>
);

const validateTaskForm = (values) => {
  const errors = {};
  if (!values.title || values.title.trim() === '') {
    errors.title = 'Title is required.';
  } else if (values.title.length < 3) {
    errors.title = 'Title must be at least 3 characters.';
  }

  if (!values.description || values.description.trim() === '') {
    errors.description = 'Description is required.';
  }

  if (!values.dueDate) {
    errors.dueDate = 'Due Date is required.';
  }

  return errors;
};

const TaskForm = ({ taskToEdit, onSave, onCancel }) => {
  const isEditing = !!taskToEdit;
  const initialValues = useMemo(() => taskToEdit || {
    id: '',
    title: '',
    description: '',
    status: 'Pending',
    priority: 'Medium',
    dueDate: new Date().toISOString().split('T')[0],
  }, [taskToEdit]);

  const { values, errors, handleChange, validate } = useForm(initialValues, validateTaskForm);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSave(values);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-xl rounded-xl">
      <h2 className="text-3xl font-extrabold text-gray-800 mb-6">
        {isEditing ? 'Edit Task' : 'Create New Task'}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Task Title
          </label>
          <input
            type="text"
            name="title"
            id="title"
            value={values.title}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border p-3 shadow-sm focus:ring-blue-500 focus:border-blue-500 ${errors.title ? 'border-red-500' : 'border-gray-300'}`}
          />
          {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            name="description"
            id="description"
            rows="3"
            value={values.description}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border p-3 shadow-sm focus:ring-blue-500 focus:border-blue-500 ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
          />
          {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">
              Due Date
            </label>
            <input
              type="date"
              name="dueDate"
              id="dueDate"
              value={values.dueDate}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border p-3 shadow-sm focus:ring-blue-500 focus:border-blue-500 ${errors.dueDate ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.dueDate && <p className="mt-1 text-sm text-red-600">{errors.dueDate}</p>}
          </div>

          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
              Priority
            </label>
            <select
              name="priority"
              id="priority"
              value={values.priority}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 p-3 shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          {isEditing && (
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                name="status"
                id="status"
                value={values.status}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 p-3 shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-4 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-semibold shadow-sm hover:bg-gray-50 transition duration-150"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-150 transform hover:scale-[1.01]"
          >
            {isEditing ? 'Save Changes' : 'Create Task'}
          </button>
        </div>
      </form>
    </div>
  );
};

const TaskList = ({ tasks, onEdit, onDelete, onCreate }) => {
  
  const [sortConfig, setSortConfig] = useState({ key: 'dueDate', direction: 'asc' });
  
  const [searchTerm, setSearchTerm] = useState('');
  
  const [currentPage, setCurrentPage] = useState(1);
  const tasksPerPage = 5;

  const sortedTasks = useMemo(() => {
    const sortableTasks = [...tasks];
    if (sortConfig.key) {
      sortableTasks.sort((a, b) => {
        const aValue = a[sortConfig.key] || '';
        const bValue = b[sortConfig.key] || '';
        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableTasks;
  }, [tasks, sortConfig]); 

  const filteredTasks = useMemo(() => {
    if (!searchTerm) return sortedTasks;

    const lowerCaseSearch = searchTerm.toLowerCase();

    return sortedTasks.filter(task =>
      task.title.toLowerCase().includes(lowerCaseSearch) ||
      task.description.toLowerCase().includes(lowerCaseSearch) ||
      task.status.toLowerCase().includes(lowerCaseSearch) ||
      task.priority.toLowerCase().includes(lowerCaseSearch)
    );
  }, [sortedTasks, searchTerm]); 

  const totalPages = Math.ceil(filteredTasks.length / tasksPerPage);
  const currentTasks = useMemo(() => {
    const startIndex = (currentPage - 1) * tasksPerPage;
    return filteredTasks.slice(startIndex, startIndex + tasksPerPage);
  }, [filteredTasks, currentPage, tasksPerPage]);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
        setCurrentPage(totalPages);
    } else if (totalPages === 0) {
        setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return null;
    if (sortConfig.direction === 'asc') {
      return <ArrowUpIcon className="w-4 h-4 ml-1" />;
    }
    return <ArrowDownIcon className="w-4 h-4 ml-1" />;
  };

  const headers = [
    { key: 'title', label: 'Title' },
    { key: 'status', label: 'Status' },
    { key: 'priority', label: 'Priority' },
    { key: 'dueDate', label: 'Due Date' },
    { key: 'actions', label: 'Actions', sortable: false },
  ];

  return (
    <div className="p-6 bg-white shadow-xl rounded-xl">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 space-y-4 sm:space-y-0">
        <h2 className="text-3xl font-extrabold text-gray-800">Dashboard</h2>
        <input
          type="text"
          placeholder="Search tasks..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full sm:w-64 rounded-lg border border-gray-300 p-3 shadow-sm focus:ring-blue-500 focus:border-blue-500"
        />
        <button
          onClick={onCreate}
          className="w-full sm:w-auto px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition duration-150"
        >
          + Add New Task
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {headers.map(header => (
                <th
                  key={header.key}
                  onClick={() => header.sortable !== false && requestSort(header.key)}
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${header.sortable !== false ? 'cursor-pointer hover:bg-gray-100 transition duration-150' : ''}`}
                >
                  <div className="flex items-center">
                    {header.label}
                    {header.sortable !== false && getSortIcon(header.key)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {currentTasks.length > 0 ? (
              currentTasks.map((task) => (
                <tr key={task.id} className="hover:bg-blue-50 transition duration-150">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 truncate max-w-xs">
                    {task.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <StatusTag status={task.status} />
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${getPriorityClasses(task.priority)}`}>
                    {task.priority}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {task.dueDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button
                      onClick={() => onEdit(task.id)}
                      className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-100 transition duration-150"
                      aria-label={`Edit ${task.title}`}
                    >
                      <EditIcon className="w-5 h-5"/>
                    </button>
                    <button
                      onClick={() => onDelete(task.id)}
                      className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-100 transition duration-150"
                      aria-label={`Delete ${task.title}`}
                    >
                      <TrashIcon className="w-5 h-5"/>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center py-8 text-gray-500">
                  {tasks.length === 0 ? "No tasks added yet. Click 'Add New Task' to begin!" : "No tasks match your current search/filter."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-6">
          <p className="text-sm text-gray-700">
            Showing {Math.min(filteredTasks.length, (currentPage - 1) * tasksPerPage + 1)} to {Math.min(filteredTasks.length, currentPage * tasksPerPage)} of {filteredTasks.length} results
          </p>
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Previous
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    aria-current={currentPage === page ? 'page' : undefined}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        currentPage === page
                            ? 'z-10 bg-blue-600 border-blue-600 text-white'
                            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                >
                    {page}
                </button>
            ))}

            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Next
            </button>
          </nav>
        </div>
      )}
    </div>
  );
};

const App = () => {

  const { tasks, addTask, updateTask, deleteTask } = useTasks();

  
  const [currentView, setCurrentView] = useState(VIEWS.LIST);
  
  const [selectedTaskId, setSelectedTaskId] = useState(null);

  
  const taskToEdit = useMemo(() =>
    selectedTaskId ? tasks.find(t => t.id === selectedTaskId) : null
  , [selectedTaskId, tasks]);

  const navigateToList = useCallback(() => {
    setCurrentView(VIEWS.LIST);
    setSelectedTaskId(null);
  }, []);

  const navigateToCreate = useCallback(() => {
    setCurrentView(VIEWS.CREATE);
    setSelectedTaskId(null);
  }, []);

  const navigateToEdit = useCallback((id) => {
    setSelectedTaskId(id);
    setCurrentView(VIEWS.EDIT);
  }, []);

  const handleCreateTask = (newTaskData) => {
    addTask(newTaskData);
    navigateToList();
  };

  const handleUpdateTask = (updatedTask) => {
    updateTask(updatedTask);
    navigateToList();
  };

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleDeleteInitiate = (id) => {
    setSelectedTaskId(id);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedTaskId) {
      deleteTask(selectedTaskId);
      setShowDeleteModal(false);
      setSelectedTaskId(null);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setSelectedTaskId(null);
  };

  const renderView = () => {
    switch (currentView) {
      case VIEWS.CREATE:
        return (
          <TaskForm
            taskToEdit={null}
            onSave={handleCreateTask}
            onCancel={navigateToList}
          />
        );
      case VIEWS.EDIT:
        
        if (!taskToEdit) {
          
          navigateToList();
          return null;
        }
        return (
          <TaskForm
            taskToEdit={taskToEdit}
            onSave={handleUpdateTask}
            onCancel={navigateToList}
          />
        );
      case VIEWS.LIST:
      default:
        return (
          <TaskList
            tasks={tasks}
            onEdit={navigateToEdit}
            onDelete={handleDeleteInitiate}
            onCreate={navigateToCreate}
          />
        );
    }
  };

  const DeleteModal = () => {
    const taskToDelete = tasks.find(t => t.id === selectedTaskId);

    if (!showDeleteModal || !taskToDelete) return null;

    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-75 z-50 flex justify-center items-center p-4 transition-opacity duration-300">
        <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md transform transition-all duration-300 scale-100">
          <h3 className="text-xl font-bold text-red-600 mb-4">Confirm Deletion</h3>
          <p className="text-gray-700 mb-6">
            Are you sure you want to delete the task: <strong className="font-semibold">"{taskToDelete.title}"</strong>?
            This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={handleDeleteCancel}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteConfirm}
              className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg shadow-md hover:bg-red-700 transition"
            >
              Delete Permanently
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-8 font-['Inter']">
      <style>{`
        /* Load Inter font (simulated/assumed availability) */
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap');
      `}</style>
      <header className="mb-8 text-center">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 drop-shadow-sm">
          Task Management App
        </h1>
      </header>

      <main className="max-w-7xl mx-auto">
        {renderView()}
      </main>

      <DeleteModal />
    </div>
  );
};

export default App;
