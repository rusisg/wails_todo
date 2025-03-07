package main

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"time"

	"github.com/google/uuid"
)

// Todo struct
type Todo struct {
	ID         string `json:"ID"`
	Text       string `json:"Text"`
	Completed  bool   `json:"Completed"`
	Created_at string `json:"Created_at"` // maybe looks not good
	Done_at    string `json:"Done_at"`    // this one also but it is work
}

// App struct
type App struct {
	ctx      context.Context
	todos    []Todo
	saveFile string
}

func NewApp() *App {
	return &App{
		todos:    make([]Todo, 0),
		saveFile: "todos.json",
	}
}

func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
	a.loadTodos()
}

func (a *App) loadTodos() {
	data, err := os.ReadFile(a.saveFile)
	if err == nil {
		json.Unmarshal(data, &a.todos)
	}
}

func (a *App) saveTodos() error {
	data, err := json.MarshalIndent(a.todos, "", "  ")
	if err != nil {
		return err
	}
	return os.WriteFile(a.saveFile, data, 0644)
}

func (a *App) AddTodo(text string) ([]Todo, error) {
	todo := Todo{
		ID:         uuid.New().String(),
		Text:       text,
		Completed:  false,
		Created_at: time.Now().Format(time.RFC822),
		Done_at:    time.Time{}.Format(time.RFC822),
	}
	a.todos = append(a.todos, todo)

	if err := a.saveTodos(); err != nil {
		return nil, err
	}

	return a.todos, nil
}

func (a *App) GetTodos() []Todo {
	return a.todos
}

func (a *App) ToggleTodo(id string) ([]Todo, error) {
	for i, todo := range a.todos {
		if todo.ID == id {
			a.todos[i].Completed = !a.todos[i].Completed
			a.todos[i].Done_at = time.Now().Format(time.RFC822)
			if err := a.saveTodos(); err != nil {
				return nil, fmt.Errorf("error saving todos: %w", err)
			}

			return a.todos, nil
		}
	}
	return nil, fmt.Errorf("todo with id '%s' not found", id)
}

func (a *App) DeleteTodo(id string) ([]Todo, error) {
	for i, todo := range a.todos {
		if todo.ID == id {
			a.todos = append(a.todos[:i], a.todos[i+1:]...)
			if err := a.saveTodos(); err != nil {
				return nil, err
			}
			return a.todos, nil
		}
	}
	return nil, fmt.Errorf("todo not found")
}

//TODO:
//1. интерфейс таск к репозиторий
//2. Implementation mongoDB
//3. function of editing task
//4. sort of tasks
