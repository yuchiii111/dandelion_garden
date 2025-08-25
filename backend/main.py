from flask import request, jsonify, Flask
import redis
import json
import subprocess  # 新增
from config import app, db
from routes import (
    api_routes,
    paper_routes,
)


if __name__ == "__main__":

    # start_elasticsearch()
    with app.app_context():
        db.create_all()

    app.run(debug=True)
