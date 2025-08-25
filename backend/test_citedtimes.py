from models import db, PapersTeachersRelationship, Teacher, Papers
import networkx as nx
from networkx.readwrite import json_graph
import json
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import matplotlib.pyplot as plt


app = Flask(__name__)
CORS(app)


app.config["SQLALCHEMY_DATABASE_URI"] = (
    "mysql+pymysql://username:password@localhost/summer_project"
)

app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db = SQLAlchemy(app)


from collections import Counter


def display_citedtimes():
    # 查询所有论文的被引次数
    cited_times = db.session.query(Papers.CITEDTIMES).all()
    # 将查询结果转换为一个简单的列表
    cited_times_list = [ct[0] for ct in cited_times if ct[0] is not None]

    # 绘制被引次数的分布图
    plt.hist(cited_times_list, bins=range(0, 100, 1), color="blue", alpha=0.7)
    # plt.xticks(range(0, 100, 5))
    plt.title("Distribution of Citation Counts")
    plt.xlabel("Citation Counts")
    plt.ylabel("Number of Papers")
    plt.show()

    # 计算每个被引次数对应的论文数量
    cited_times_count = Counter(cited_times_list)
    # 排序
    cited_times_sorted = sorted(cited_times_count.items())
    # 解包
    x, y = zip(*cited_times_sorted)

    # 绘制被引次数的折线图，点突出显示
    plt.plot(x, y, marker="o", linestyle="-", color="r", markersize=3)
    plt.xlabel("Citation Counts")
    plt.ylabel("Number of Papers")
    plt.show()


if __name__ == "__main__":
    with app.app_context():
        db.create_all()
        display_citedtimes()
    print("success")
