import React, { useState, useEffect } from 'react';

function App() {
    const [todos, setTodos] = useState([]);
    const [completedTodos, setCompletedTodos] = useState([]);
    const [newTodo, setNewTodo] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [editingTodo, setEditingTodo] = useState(null);
    const [editingText, setEditingText] = useState('');
    const [sortCriteria, setSortCriteria] = useState('created_at');

    const updateTodoLists = (allTodos) => {
        const incomplete = allTodos.filter(todo => !todo.Completed);
        const complete = allTodos.filter(todo => todo.Completed);
        setTodos(sortTodos(incomplete));
        setCompletedTodos(sortTodos(complete));
    };

    const sortTodos = (todos) => {
        return todos.sort((a, b) => {
            if (sortCriteria === 'created_at') {
                return new Date(a.Created_at) - new Date(b.Created_at);
            } else if (sortCriteria === 'text') {
                return a.Text.localeCompare(b.Text);
            }
            return 0;
        });
    };

    useEffect(() => {
        window.go.main.App.GetTodos()
            .then(updateTodoLists)
            .catch(error => {
                console.error("Error fetching todos:", error);
                setErrorMessage('Failed to load todos');
            });
    }, []);

    const addTodo = () => {
        if (newTodo.trim() === '') {
            setErrorMessage('Input cannot be empty!');
            return;
        }

        window.go.main.App.AddTodo(newTodo.trim())
            .then(updateTodoLists)
            .catch(error => {
                console.error("Error adding todo:", error);
                setErrorMessage(error.message || 'An error occurred.');
            })
            .finally(() => setNewTodo(''));
    };

    const toggleTodo = (id) => {
        window.go.main.App.ToggleTodo(id)
            .then(updateTodoLists)
            .catch(error => {
                console.error("Error toggling todo:", error);
                setErrorMessage('Failed to toggle todo');
            });
    };

    const deleteTodo = (id) => {
        if (window.confirm("Are you sure you want to delete this task?")) {
            window.go.main.App.DeleteTodo(id)
                .then(updateTodoLists)
                .catch(error => {
                    console.error("Error deleting todo:", error);
                    setErrorMessage('Failed to delete todo');
                });
        }
    };

    const undoTodo = (id) => {
        window.go.main.App.ToggleTodo(id)
            .then(updateTodoLists)
            .catch(error => {
                console.error("Error undoing todo:", error);
                setErrorMessage('Failed to undo todo');
            });
    };

    const editTodo = (id, newText) => {
        window.go.main.App.EditTodo(id, newText)
            .then(updateTodoLists)
            .catch(error => {
                console.error("Error editing todo:", error);
                setErrorMessage('Failed to edit todo');
            });
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            addTodo();
        }
    };

    const startEditing = (todo) => {
        setEditingTodo(todo.ID);
        setEditingText(todo.Text);
    };

    const saveEditing = (id) => {
        editTodo(id, editingText);
        setEditingTodo(null);
        setEditingText('');
    };

    const handleSortChange = (e) => {
        setSortCriteria(e.target.value);
        setTodos(sortTodos(todos));
        setCompletedTodos(sortTodos(completedTodos));
    };

    return (
        <div className="container">
            <h1>Wails TODO</h1>
            {errorMessage && (
                <p className="error-message" onClick={() => setErrorMessage('')}>
                    {errorMessage}
                </p>
            )}
            <div className="input-area">
                <input
                    type="text"
                    placeholder="Add a new todo"
                    value={newTodo}
                    onChange={(e) => {
                        setNewTodo(e.target.value);
                        setErrorMessage('');
                    }}
                    onKeyPress={handleKeyPress}
                />
                <button onClick={addTodo}>Add</button>
            </div>
            <div className="sort-area">
                <label htmlFor="sort">Sort by: </label>
                <select id="sort" value={sortCriteria} onChange={handleSortChange}>
                    <option value="created_at">Creation Date</option>
                    <option value="text">Text</option>
                </select>
            </div>
            <h2>Active Tasks</h2>
            <ul className="todo-list">
                {todos.map((todo) => (
                    <li key={todo.ID} className="todo-item">
                        <input
                            type="checkbox"
                            checked={todo.Completed}
                            onChange={() => toggleTodo(todo.ID)}
                        />
                        {editingTodo === todo.ID ? (
                            <input
                                type="text"
                                value={editingText}
                                onChange={(e) => setEditingText(e.target.value)}
                                onBlur={() => saveEditing(todo.ID)}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        saveEditing(todo.ID);
                                    }
                                }}
                            />
                        ) : (
                            <span className={todo.Completed ? 'completed' : ''}>
                                {todo.Text}
                            </span>
                        )}
                        <div className="todo-dates">
                            <span className="created-at">Created: {todo.Created_at}</span>
                            {todo.Done_at && (
                                <span className="done-at">Done: {todo.Done_at}</span>
                            )}
                        </div>
                        <button className="edit-button" onClick={() => startEditing(todo)}>
                            Edit
                        </button>
                        <button className="delete-button" onClick={() => deleteTodo(todo.ID)}>
                            Delete
                        </button>
                    </li>
                ))}
            </ul>
            <h2>Completed Tasks</h2>
            <ul className="todo-list">
                {completedTodos.map((todo) => (
                    <li key={todo.ID} className="todo-item">
                        <input
                            type="checkbox"
                            checked={todo.Completed}
                            onChange={() => toggleTodo(todo.ID)}
                        />
                        <span className="completed">
                            {todo.Text}
                        </span>
                        <div className="todo-dates">
                            <span className="created-at">Created: {todo.Created_at}</span>
                            {todo.Done_at && (
                                <span className="done-at">Done: {todo.Done_at}</span>
                            )}
                        </div>
                        <button className="undo-button" onClick={() => undoTodo(todo.ID)}>
                            Undo
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default App;