package main

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/google/uuid"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
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
	client     *mongo.Client
	collection *mongo.Collection
}

func NewApp() *App {
	return &App{}
}

func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
	a.connectToDB()
}

func (a *App) connectToDB() {
	var err error
	a.client, err = mongo.Connect(a.ctx, options.Client().ApplyURI("mongodb://localhost:27017"))
	if err != nil {
		log.Fatal(err)
	}

	a.collection = a.client.Database("wails_todo").Collection("todos")
}

func (a *App) AddTodo(text string) ([]Todo, error) {
	todo := Todo{
		ID:         uuid.New().String(),
		Text:       text,
		Completed:  false,
		Created_at: time.Now().Format(time.RFC822),
		Done_at:    time.Time{}.Format(time.RFC822),
	}

	_, err := a.collection.InsertOne(a.ctx, todo)
	if err != nil {
		return nil, err
	}

	return a.GetTodos()
}

func (a *App) GetTodos() ([]Todo, error) {
	cursor, err := a.collection.Find(a.ctx, bson.M{})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(a.ctx)

	var todos []Todo
	if err = cursor.All(a.ctx, &todos); err != nil {
		return nil, err
	}

	return todos, nil
}

func (a *App) ToggleTodo(id string) ([]Todo, error) {
	var todo Todo
	err := a.collection.FindOne(a.ctx, bson.M{"_id": id}).Decode(&todo)
	if err != nil {
		return nil, fmt.Errorf("error finding todo: %w", err)
	}

	update := bson.M{
		"$set": bson.M{
			"completed": !todo.Completed,
			"done_at":   time.Now().Format(time.RFC822),
		},
	}

	_, err = a.collection.UpdateOne(a.ctx, bson.M{"_id": id}, update)
	if err != nil {
		return nil, fmt.Errorf("error updating todo: %w", err)
	}

	return a.GetTodos()
}

func (a *App) DeleteTodo(id string) ([]Todo, error) {
	_, err := a.collection.DeleteOne(a.ctx, bson.M{"_id": id})
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

	_, err := a.collection.UpdateOne(a.ctx, bson.M{"_id": id}, update)
	if err != nil {
		return nil, fmt.Errorf("error updating todo: %w", err)
	}

	return a.GetTodos()
}
