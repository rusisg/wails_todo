package main

import (
	"context"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

// наш TaskRepository только использующаяся MongoDB
type MongoTaskRepository struct {
	collection *mongo.Collection
}

// конструктор
func NewMongoTaskRepository(collection *mongo.Collection) *MongoTaskRepository {
	return &MongoTaskRepository{collection: collection}
}

func (r *MongoTaskRepository) AddTask(ctx context.Context, task Todo) error {
	_, err := r.collection.InsertOne(ctx, task)
	return err
}

func (r *MongoTaskRepository) GetTasks(ctx context.Context) ([]Todo, error) {
	cursor, err := r.collection.Find(ctx, bson.M{})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var tasks []Todo
	if err = cursor.All(ctx, &tasks); err != nil {
		return nil, err
	}
	return tasks, nil
}

func (r *MongoTaskRepository) UpdateTask(ctx context.Context, id string, update interface{}) error {
	_, err := r.collection.UpdateOne(ctx, bson.M{"_id": id}, update)
	return err
}

func (r *MongoTaskRepository) DeleteTask(ctx context.Context, id string) error {
	_, err := r.collection.DeleteOne(ctx, bson.M{"_id": id})
	return err
}
