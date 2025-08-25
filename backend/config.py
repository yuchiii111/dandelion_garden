from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import redis

app = Flask(__name__)
CORS(app)


app.config["SQLALCHEMY_DATABASE_URI"] = (
    "mysql+pymysql://username:password@localhost/summer_project"
)

app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
db = SQLAlchemy(app)
redis_client = redis.StrictRedis(host="localhost", port=6379, db=0)
