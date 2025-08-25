from flask import Flask, jsonify, request
import redis
import json
from config import app, db
from models import Papers

# from backend.test_network_generator import build_and_save_network
from flask_cors import CORS, cross_origin

redis_client = redis.Redis(host="localhost", port=6379, db=0, decode_responses=True)


# @app.route("/log")
# def initialize_network():
#     build_and_save_network()
#     return jsonify({"message": "Network initialized"}), 200


@app.route("/Papers", methods=["GET"])
def get_Papers():
    Papers = Papers.query.all()
    json_Papers = list(map(lambda x: x.to_json(), Papers))
    return jsonify({"Papers": json_Papers}), 200


@app.route("/Papers/<int:index_id>", methods=["GET"])
def get_paper(index_id):
    # 尝试从Redis缓存中获取论文信息
    paper_info = redis_client.get(f"paper:{index_id}")

    if paper_info:
        paper_info = json.loads(paper_info)
        return jsonify({"message": "Paper found in cache", "data": paper_info}), 200
    else:
        paper = Papers.query.get(index_id)
        if not paper:
            return jsonify({"message": "Paper not found"}), 404

        # 将查询结果序列化为JSON字符串后存入Redis缓存，并设置过期时间为1小时
        paper_json = paper.to_json()
        redis_client.setex(f"paper:{index_id}", 3600, json.dumps(paper_json))

        return jsonify({"message": "Paper found in database", "data": paper_json}), 200


@app.route("/create_Papers", methods=["POST"])
def create_Paper():
    INDEX_ID = request.json.get("indexId")
    WID = request.json.get("wid")
    ISSN = request.json.get("ISSN")
    if not INDEX_ID or not WID or not ISSN:
        return (jsonify({"message": "You need to provide all required fields"}), 400)

    new_Paper = Papers(INDEX_ID=INDEX_ID, WID=WID, ISSN=ISSN)
    try:
        db.session.add(new_Paper)
        db.session.commit()
    except Exception as e:
        return (jsonify({"message": f"Error creating Paper: {str(e)}"}), 400)
    return jsonify({"message": "Paper created successfully"}, 201)


@app.route("/update_Papers/<int:INDEX_ID>", methods=["PATCH"])
def update_Paper(INDEX_ID):
    Paper = Paper.query.get(INDEX_ID)
    if not Paper:
        return jsonify({"message": "Paper not found"}), 404
    data = request.json
    Paper.INDEX_ID = data.get("indexId")
    Paper.WID = data.get("wid")
    Paper.ISSN = data.get("ISSN")
    db.session.commit()
    return jsonify({"message": "Paper updated successfully"}), 200


@app.route("/delete_Papers/<int:INDEX_ID>", methods=["DELETE"])
def delete_Paper(INDEX_ID):
    Paper = Paper.query.get(INDEX_ID)
    if not Paper:
        return jsonify({"message": "Paper not found"}), 404
    db.session.delete(Paper)
    db.session.commit()
    return jsonify({"message": "Paper deleted successfully"}), 200
