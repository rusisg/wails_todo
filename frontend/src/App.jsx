import React, { useState, useEffect } from 'react';

function App() {
    const [todos, setTodos] = useState([]);
    const [newTodo, setNewTodo] = useState('');
    const [errorMessage, setErrorMessage] = useState(''); // State for error message

    useEffect(() => {
        window.go.main.App.GetTodos().then(setTodos);
    }, []);

    const addTodo = () => {
        if (newTodo.trim() === '') {
            setErrorMessage('Input cannot be empty!'); // Set error message
            return; // Stop execution
        }

        window.go.main.App.AddTodo(newTodo.trim())
            .then(setTodos)
            .catch(error => { // Catch errors from Go backend
                console.error("Error adding todo:", error);
                setErrorMessage(error.message || 'An error occurred.'); // Set error message
            })
            .finally(() => setNewTodo('')); // Clear input field regardless of success/failure
    };

    const toggleTodo = (id) => {
        window.go.main.App.ToggleTodo(id).then(setTodos);
    };

    const deleteTodo = (id) => {
        window.go.main.App.DeleteTodo(id).then(setTodos);
    };

    return (
        <div className="container">
            <h1>Wails TODO</h1>
            {errorMessage && <p className="error-message">{errorMessage}</p> /* Display error message */}
            <div className="input-area">
                <input
                    type="text"
                    placeholder="Add a new todo"
                    value={newTodo}
                    onChange={(e) => {
                        setNewTodo(e.target.value);
                        setErrorMessage(''); // Clear error message on input change
                    }}
                />
                <button onClick={addTodo}>Add</button>
            </div>
            <ul className="todo-list">
                {todos.map((todo) => (
                    <li key={todo.ID} className="todo-item">
                        <input
                            type="checkbox"
                            checked={todo.Completed}
                            onChange={() => toggleTodo(todo.ID)}
                        />
                        <span
                            style={{
                                textDecoration: todo.Completed ? 'line-through' : 'none',
                                color: todo.Completed ? '#888' : 'black',
                            }}
                        >
                            {todo.Text}
                        </span>
                        <button className="delete-button" onClick={() => deleteTodo(todo.ID)}>
                            Delete
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default App;