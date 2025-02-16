import React, { useState, useEffect } from 'react';

function App() {
    const [todos, setTodos] = useState([]);
    const [completedTodos, setCompletedTodos] = useState([]); // Added missing state
    const [newTodo, setNewTodo] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    // Function to update todo lists
    const updateTodoLists = (allTodos) => {
        const incomplete = allTodos.filter(todo => !todo.Completed);
        const complete = allTodos.filter(todo => todo.Completed);
        setTodos(incomplete);
        setCompletedTodos(complete);
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

    // Added missing undoTodo function
    const undoTodo = (id) => {
        window.go.main.App.ToggleTodo(id)
            .then(updateTodoLists)
            .catch(error => {
                console.error("Error undoing todo:", error);
                setErrorMessage('Failed to undo todo');
            });
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            addTodo();
        }
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
            <h2>Active Tasks</h2>
            <ul className="todo-list">
                {todos.map((todo) => (
                    <li key={todo.ID} className="todo-item">
                        <input
                            type="checkbox"
                            checked={todo.Completed}
                            onChange={() => toggleTodo(todo.ID)}
                        />
                        <span className={todo.Completed ? 'completed' : ''}>
                            {todo.Text}
                        </span>
                        <div className="todo-dates">
                            <span className="created-at">Created: {todo.Created_at}</span>
                            {todo.Done_at && (
                                <span className="done-at">Done: {todo.Done_at}</span>
                            )}
                        </div>
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