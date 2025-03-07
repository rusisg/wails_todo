package main

import "context"

// TaskRepository include the methods to work with the ToDo tasks clearly
type TaskRepository interface {
	AddTask(ctx context.Context, task Todo) error
	GetTasks(ctx context.Context) ([]Todo, error)
	UpdateTask(ctx context.Context, id string, update interface{}) error
	DeleteTask(ctx context.Context, id string) error
}
