package main

import (
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"
	"go.mongodb.org/mongo-driver/bson"
)

//TODO:
//1. интерфейс таск к репозиторий (DONE; MongoDB Compass)
//2. Implementation mongoDB (DONE)
//3. function of editing task (DONE)
//4. sort of tasks (process)

// Todo struct
type Todo struct {
	ID         string `json:"ID" bson:"_id,omitempty"`
	Text       string `json:"Text" bson:"text"`
	Completed  bool   `json:"Completed" bson:"completed"`
	Created_at string `json:"Created_at" bson:"created_at"`
	Done_at    string `json:"Done_at" bson:"done_at"`
}

// App struct
type App struct {
	ctx        context.Context
	repository TaskRepository
}

func NewApp(repository TaskRepository) *App {
	return &App{repository: repository}
}

func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

func (a *App) AddTodo(text string) ([]Todo, error) {
	todo := Todo{
		ID:         uuid.New().String(),
		Text:       text,
		Completed:  false,
		Created_at: time.Now().Format(time.RFC822),
		Done_at:    time.Time{}.Format(time.RFC822),
	}

	err := a.repository.AddTask(a.ctx, todo)
	if err != nil {
		return nil, err
	}

	return a.GetTodos()
}

func (a *App) GetTodos() ([]Todo, error) {
	return a.repository.GetTasks(a.ctx)
}

func (a *App) ToggleTodo(id string) ([]Todo, error) {
	todos, err := a.repository.GetTasks(a.ctx)
	if err != nil {
		return nil, err
	}

	var todo Todo
	for _, t := range todos {
		if t.ID == id {
			todo = t
			break
		}
	}

	update := bson.M{
		"$set": bson.M{
			"completed": !todo.Completed,
			"done_at":   time.Now().Format(time.RFC822),
		},
	}

	err = a.repository.UpdateTask(a.ctx, id, update)
	if err != nil {
		return nil, fmt.Errorf("error updating todo: %w", err)
	}

	return a.GetTodos()
}

func (a *App) DeleteTodo(id string) ([]Todo, error) {
	err := a.repository.DeleteTask(a.ctx, id)
	if err != nil {
		return nil, err
	}

	return a.GetTodos()
}

func (a *App) EditTodo(id string, newText string) ([]Todo, error) {
	update := bson.M{
		"$set": bson.M{
			"text": newText,
		},
	}

	err := a.repository.UpdateTask(a.ctx, id, update)
	if err != nil {
		return nil, fmt.Errorf("error updating todo: %w", err)
	}

	return a.GetTodos()
}
