from flask import Flask
from controllers.todo import todo_api
from db.mongo import mongo
from flask_cors import CORS
from dotenv import load_dotenv
load_dotenv('.env')
import os


app = Flask(__name__)
CORS(app)

def create_app():
    app.config["MONGO_URI"] = os.environ.get('MONGO_URL')
    mongo.init_app(app)
    app.register_blueprint(todo_api)
    return app

if __name__ == "__main__":
    create_app().run()