from db.mongo import mongo

class Todo:
    def __init__(self, title, completed):
        self._id = None  # Initialize _id as None
        self.title = title
        self.completed = completed

    def save(self):
        todo_collection = mongo.db.todos
        todo_collection.insert_one(self.__dict__)

    @staticmethod
    def get_all():
        todo_collection = mongo.db.todos
        todos = todo_collection.find({})
        return todos

    @staticmethod
    def get_by_id(todo_id):
        todo_collection = mongo.db.todos
        todo = todo_collection.find_one({"_id": todo_id})
        if todo:
            return todo
        return None

    def update(self):
        todo_collection = mongo.db.todos
        return todo_collection.update_one(
            {"_id": self._id},
            {"$set": {"title": self.title, "completed": self.completed}}
        )

    def delete(self):
        todo_collection = mongo.db.todos
        todo_collection.delete_one({"_id": self._id})
