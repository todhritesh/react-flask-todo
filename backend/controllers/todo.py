from flask import Blueprint, request, jsonify , make_response
from flask_restful import Resource, Api, reqparse
from bson import ObjectId
from db.mongo import mongo
import json
from models.todo import Todo
todo_api = Blueprint("todo_api", __name__)
api = Api(todo_api)

class TodoApi(Resource):
    def __init__(self):
        self.parser = reqparse.RequestParser()
        self.parser.add_argument("title", type=str, required=True, help="Title is required.")
        self.parser.add_argument("completed", type=bool, required=True, help="Completed is required.")
        super(TodoApi, self).__init__()


    def get(self, todo_id=None):

        if todo_id:
            todo = Todo.get_by_id(todo_id=todo_id)
            if todo:
                json_data = json.dumps(dict(todo))
                response = make_response(json_data)
                response.headers['Content-Type'] = 'application/json'
                response.status_code = 200
                return response
            return {"message": "Todo not found"}, 404
        else:
            todos = Todo.get_all()
            serialized_todos = []
            
            for todo in todos:
                todo['_id'] = str(todo['_id'])  # Convert ObjectId to string
                serialized_todos.append(todo)
            
            json_data = json.dumps(list(serialized_todos))
            response = make_response(json_data)
            response.headers['Content-Type'] = 'application/json'
            response.status_code = 200
            return response
            # return jsonify(serialized_todos)
        
    
    def post(self):
        args = self.parser.parse_args()
        title = args["title"]
        completed = args["completed"]
        todo_collection = mongo.db.todos
        new_todo = {"title": title, "completed": completed}
        result = todo_collection.insert_one(new_todo)
        new_todo["_id"] = str(result.inserted_id)
        json_data = json.dumps(dict(new_todo))
        response = make_response(json_data)
        response.headers['Content-Type'] = 'application/json'
        response.status_code = 201
        return response


    def put(self, todo_id):
        args = self.parser.parse_args()
        title = args["title"]
        completed = args["completed"]

        todo_collection = mongo.db.todos
        result = Todo.update({"_id":todo_id,"title":title,"completed":completed})

        if result.matched_count:
            return {"message": "Todo updated"}, 200
        return {"message": "Todo not found"}, 404

    def delete(self, todo_id):
        todo_collection = mongo.db.todos
        result = todo_collection.delete_one({"_id": ObjectId(todo_id)})

        if result.deleted_count:
            return {"message": "deleted successfully"}, 200
        return {"message": "Todo not found"}, 404

api.add_resource(TodoApi, "/todos", "/todos/<string:todo_id>")
