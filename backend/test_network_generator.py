from models import db, PapersTeachersRelationship, Teacher, Papers
import networkx as nx
from networkx.readwrite import json_graph
import json
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS


app = Flask(__name__)
CORS(app)


app.config["SQLALCHEMY_DATABASE_URI"] = (
    "mysql+pymysql://username:password@localhost/summer_project"
)

app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db = SQLAlchemy(app)


def build_and_save_network():
    query = (
        db.session.query(
            PapersTeachersRelationship.paper_id,
            PapersTeachersRelationship.JZGBH,
            PapersTeachersRelationship.ISREPRINTAUTHOR,
            PapersTeachersRelationship.AUTHOR_RANK,
            Teacher.XKLBDM_DISPLAY,
            Teacher.NAME,
            Teacher.SEX,
            Papers.paper_id,
            Papers.ISSN,
            Papers.MEDIA,
            Papers.TITLE,
            Papers.PRINTDATE,
            Papers.CITEDTIMES,
            Papers.YEAR,
            Papers.PAPER_CLASS,
            Papers.IMPACTFACTOR,
            Papers.ESI,
            Papers.LANGUAGE,
            Papers.BJSQK,
            Papers.DISCIPLINE,
        )
        .join(Teacher, PapersTeachersRelationship.JZGBH == Teacher.JZGBH)
        .join(Papers, PapersTeachersRelationship.paper_id == Papers.paper_id)
    )
    results = query.all()
    G = nx.Graph()

    # 初始化作者论文总数字典
    author_publication_counts = {}
    papers_to_authors = {}

    for result in results:
        p_id = result[0]
        author_jzgbh = result[1]
        discipline = result[4]
        name = result[5]
        sex = result[6]

        # 更新作者论文总数
        if author_jzgbh in author_publication_counts:
            author_publication_counts[author_jzgbh] += 1
        else:
            author_publication_counts[author_jzgbh] = 1

        # 如果作者节点不存在，则添加，包括个人信息和论文信息
        if not G.has_node(author_jzgbh):
            G.add_node(
                author_jzgbh,
                author_id=author_jzgbh,
                discipline=discipline,
                name=name,
                sex=sex,
                publications=[],
                publication_count=author_publication_counts[
                    author_jzgbh
                ],  # 添加论文总数属性
            )
        # 添加论文信息到节点
        publication = {
            key: value
            for key, value in zip(
                [
                    "P_ID",
                    "ISSN",
                    "MEDIA",
                    "TITLE",
                    "PRINTDATE",
                    "CITEDTIMES",
                    "YEAR",
                    "PAPER_CLASS",
                    "IMPACTFACTOR",
                    "ESI",
                    "LANGUAGE",
                    "BJSQK",
                    "DISCIPLINE",
                ],
                result[7:],
            )
        }
        G.nodes[author_jzgbh]["publications"].append(publication)
        G.nodes[author_jzgbh]["publication_count"] += 1

        # 更新papers_to_authors字典，用于后续构建边
        if p_id not in papers_to_authors:
            papers_to_authors[p_id] = []
        papers_to_authors[p_id].append(author_jzgbh)

    # 构建边
    for paper_id, authors in papers_to_authors.items():
        for author in authors:
            for co_author in authors:
                if author != co_author:
                    if G.has_edge(author, co_author):
                        G[author][co_author]["weight"] += 1
                    else:
                        G.add_edge(author, co_author, weight=1)

    x = 5
    nodes_to_remove = [node for node, degree in G.degree() if degree < x]
    # 从图中删除这些节点
    G.remove_nodes_from(nodes_to_remove)
    for node, attrs in G.nodes(data=True):
        for key, value in attrs.items():
            if isinstance(value, list):
                attrs[key] = json.dumps(value)

    for u, v, attrs in G.edges(data=True):
        for key, value in attrs.items():
            if isinstance(value, list):
                attrs[key] = json.dumps(value)

    nx.write_graphml(G, "backend/static/co_author_network_paper_2.graphml")


if __name__ == "__main__":
    with app.app_context():
        db.create_all()
        build_and_save_network()
    print("图形已重新布局并导出到GraphML和JSON格式。")
