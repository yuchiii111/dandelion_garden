from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import igraph as ig
from models import (
    db,
    PapersTeachersRelationship,
    Teacher,
    Papers,
    Publications,
    PublicationsTeachersRelationship,
    Patents,
    PatentsTeachersRelationship,
    Awards,
    AwardsTeachersRelationship,
    Projects,
    ProjectsTeachersRelationship,
)
import math
import random


class AppConfig:
    def __init__(self):
        self.app = Flask(__name__)
        CORS(self.app)
        self.app.config["SQLALCHEMY_DATABASE_URI"] = (
            "mysql+pymysql://username:password@localhost/summer_project"
        )
        self.app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
        self.db = SQLAlchemy(self.app)


class Database:
    def __init__(self, db):
        self.db = db

    def fetch_data(self):
        queries = [
            self.db.session.query(
                PapersTeachersRelationship.paper_id,
                PapersTeachersRelationship.JZGBH,
                Teacher.XKLBDM_DISPLAY,
                Teacher.NAME,
                Teacher.is_academician,
                Papers.paper_id,
                self.db.literal("paper").label("type"),  # 添加成就类型
            )
            .join(Teacher, PapersTeachersRelationship.JZGBH == Teacher.JZGBH)
            .join(Papers, PapersTeachersRelationship.paper_id == Papers.paper_id),
            self.db.session.query(
                PublicationsTeachersRelationship.publication_id,
                PublicationsTeachersRelationship.JZGBH,
                Teacher.XKLBDM_DISPLAY,
                Teacher.NAME,
                Teacher.is_academician,
                Publications.publication_id,
                self.db.literal("publication").label("type"),  # 添加成就类型
            )
            .join(Teacher, PublicationsTeachersRelationship.JZGBH == Teacher.JZGBH)
            .join(
                Publications,
                PublicationsTeachersRelationship.publication_id
                == Publications.publication_id,
            ),
            self.db.session.query(
                PatentsTeachersRelationship.patent_id,
                PatentsTeachersRelationship.JZGBH,
                Teacher.XKLBDM_DISPLAY,
                Teacher.NAME,
                Teacher.is_academician,
                Patents.patent_id,
                self.db.literal("patent").label("type"),  # 添加成就类型
            )
            .join(Teacher, PatentsTeachersRelationship.JZGBH == Teacher.JZGBH)
            .join(Patents, PatentsTeachersRelationship.patent_id == Patents.patent_id),
            self.db.session.query(
                AwardsTeachersRelationship.award_id,
                AwardsTeachersRelationship.JZGBH,
                Teacher.XKLBDM_DISPLAY,
                Teacher.NAME,
                Teacher.is_academician,
                Awards.award_id,
                self.db.literal("award").label("type"),  # 添加成就类型
            )
            .join(Teacher, AwardsTeachersRelationship.JZGBH == Teacher.JZGBH)
            .join(Awards, AwardsTeachersRelationship.award_id == Awards.award_id),
            self.db.session.query(
                ProjectsTeachersRelationship.project_id,
                ProjectsTeachersRelationship.JZGBH,
                Teacher.XKLBDM_DISPLAY,
                Teacher.NAME,
                Teacher.is_academician,
                Projects.project_id,
                self.db.literal("project").label("type"),  # 添加成就类型
            )
            .join(Teacher, ProjectsTeachersRelationship.JZGBH == Teacher.JZGBH)
            .join(
                Projects, ProjectsTeachersRelationship.project_id == Projects.project_id
            ),
        ]

        results = []
        for query in queries:
            results.extend(query.all())
        return results


class GraphBuilder:
    def __init__(self, results):
        self.results = results
        self.G = ig.Graph(directed=False)

    def build_graph(self):
        author_index = {}
        index = 0
        achievements_to_authors = {}

        for result in self.results:
            p_id = result[0]
            author_jzgbh = result[1]
            discipline = result[2]
            name = result[3]
            is_academician = result[4]
            achievement_type = result[6]  # 获取成就类型

            if not discipline:
                discipline = "未知"

            if author_jzgbh not in author_index:
                self.G.add_vertices(1)
                self.G.vs[index]["author_id"] = author_jzgbh
                self.G.vs[index]["discipline"] = discipline
                self.G.vs[index]["name"] = name
                self.G.vs[index]["publication_count"] = 0
                self.G.vs[index]["is_academician"] = is_academician
                self.G.vs[index]["edge_count"] = 0
                author_index[author_jzgbh] = index
                index += 1

            self.G.vs[author_index[author_jzgbh]]["publication_count"] += 1

            if p_id not in achievements_to_authors:
                achievements_to_authors[p_id] = []
            achievements_to_authors[p_id].append((author_jzgbh, achievement_type))

        for achievement_id, authors in achievements_to_authors.items():
            for i in range(len(authors)):
                for j in range(i + 1, len(authors)):
                    author_i_jzgbh, type_i = authors[i]
                    author_j_jzgbh, type_j = authors[j]
                    if (
                        author_i_jzgbh in author_index
                        and author_j_jzgbh in author_index
                    ):
                        author_i_index = author_index[author_i_jzgbh]
                        author_j_index = author_index[author_j_jzgbh]
                        edge_id = self.G.get_eid(
                            author_i_index, author_j_index, error=False
                        )
                        if edge_id == -1:
                            self.G.add_edges([(author_i_index, author_j_index)])
                            edge_id = self.G.get_eid(author_i_index, author_j_index)
                            self.G.es[edge_id]["weight"] = 1
                            self.G.es[edge_id]["type"] = type_i
                        else:
                            self.G.es[edge_id]["weight"] += 1
                            # 如果已经存在边，确保边的类型是多种类型的组合
                            if type_i not in self.G.es[edge_id]["type"]:
                                self.G.es[edge_id]["type"] += f",{type_i}"
        self.G.vs[author_i_index]["edge_count"] = self.G.degree(author_i_index)

    def add_virtual_edge_low(self, x=5):
        # 打印原有边的个数
        print("原有", len(self.G.es))
        degrees = self.G.degree()
        nodes_to_add = [v.index for v in self.G.vs if degrees[v.index] < x]
        print("需要增加的点", len(nodes_to_add))
        for node_index in nodes_to_add:
            discipline = self.G.vs[node_index]["discipline"]
            same_discipline_nodes = []
            max_node_num = 0  # 初始化计数器
            max_edge_num = 0
            for v in self.G.vs:
                if v["discipline"] == discipline and v.index != node_index:
                    same_discipline_nodes.append(v.index)
                    max_node_num += 1
                    if max_node_num == 10:
                        break
            for target_index in same_discipline_nodes:
                if not self.G.are_adjacent(node_index, target_index):
                    self.G.add_edges([(node_index, target_index)])
                    max_edge_num += 1
                    edge_id = self.G.get_eid(node_index, target_index)
                    self.G.es[edge_id]["weight"] = 0
                    if max_edge_num == 1:
                        break
            if max_edge_num < 1:
                print(
                    "author_id为",
                    self.G.vs[node_index]["author_id"],
                    "的节点增加了",
                    max_edge_num,
                    "条虚拟边",
                )
                # 在所有点中随机选一个点，与他之间增加一条虚拟边
                target_index = random.choice(
                    [v.index for v in self.G.vs if v.index != node_index]
                )
                self.G.add_edges([(node_index, target_index)])
                edge_id = self.G.get_eid(node_index, target_index)
                self.G.es[edge_id]["weight"] = 0
        print("增加后", len(self.G.es))

    def get_graph(self):
        return self.G

    def layout_and_export(
        self,
        niter=10000,
        node_charge=0.001,
        node_mass=30,
        spring_length=0,
        spring_constant=1,
        max_sa_movement=5,
    ):
        # 使用最简单的布局
        # layout_G = self.G.layout("kk")
        # 此处正确
        layout_G = self.G.layout_graphopt(
            niter=niter,
            node_charge=node_charge,
            node_mass=node_mass,
            spring_length=spring_length,
            spring_constant=spring_constant,
            max_sa_movement=max_sa_movement,
        )
        # layout_G = self.G.layout_fruchterman_reingold(
        #     weights=[0.0001 * (math.log(w + 10) + 500) for w in G.es["weight"]],
        #     niter=100000,
        #     grid="auto",
        # )
        # layout_G = self.G.layout_fruchterman_reingold(
        #     weights=[2 for w in self.G.es["weight"]],
        #     niter=100000,
        #     grid="auto",
        # )
        max_x = max(layout_G, key=lambda item: item[0])[0]
        min_x = min(layout_G, key=lambda item: item[0])[0]
        max_y = max(layout_G, key=lambda item: item[1])[1]
        min_y = min(layout_G, key=lambda item: item[1])[1]

        for v in self.G.vs:
            x, y = layout_G[v.index]
            v["x"] = self.map_value(x, min_x, max_x, -1, 1)
            v["y"] = self.map_value(y, min_y, max_y, -1, 1)

        self.G.write_graphml("backend/static/network.graphml")

    def remove_virtual_edges(self):
        virtual_edges = [e.index for e in self.G.es if e["weight"] == 0]
        self.G.delete_edges(virtual_edges)
        print("恢复到", len(self.G.es))

    def remove_low_degree_vertices(self, x=1):
        degrees = self.G.degree()
        nodes_to_remove = [v.index for v in self.G.vs if degrees[v.index] < x]
        if len(nodes_to_remove) > 0:
            for i in nodes_to_remove:
                print(self.G.vs[i]["name"])
        else:
            print("No nodes removed")
        self.G.delete_vertices(nodes_to_remove)
        print(f"Removed {len(nodes_to_remove)} nodes")
        # 打印被移除的点的author_id
        return len(nodes_to_remove)

    def map_value(self, value, min_old, max_old, min_new, max_new):
        value_scaled = (value - min_old) / (max_old - min_old)
        return min_new + (max_new - min_new) * value_scaled

    def convert_to_json(self):
        import networkx as nx
        import json
        from networkx.readwrite import json_graph

        G_nx = nx.read_graphml("backend/static/network.graphml")
        data = json_graph.node_link_data(G_nx)
        author_id_dict = {}

        for node in data["nodes"]:
            if "author_id" in node:
                author_id_dict[node["id"]] = node["author_id"]
                node["id"] = node["author_id"]
                del node["author_id"]
            else:
                print(f"Node {node['id']} does not have an author_id")
                break

        for link in data["links"]:
            link["source"] = author_id_dict[link["source"]]
            link["target"] = author_id_dict[link["target"]]

            # 确保 type 字段是一个列表
            if "type" in link and isinstance(link["type"], str):
                link["type"] = link["type"].split(",")

        with open("backend/static/network.json", "w") as f:
            json.dump(data, f, ensure_ascii=False, indent=4)


if __name__ == "__main__":
    config = AppConfig()
    with config.app.app_context():
        config.db.create_all()
        db_ops = Database(config.db)
        results = db_ops.fetch_data()
        graph_builder = GraphBuilder(results)
        graph_builder.build_graph()
        graph_builder.add_virtual_edge_low()
        # G = graph_builder.get_graph()
        graph_builder.remove_low_degree_vertices()
        graph_builder.layout_and_export(
            node_charge=1e-3,
            node_mass=30,
            spring_length=0,
            spring_constant=1,
            max_sa_movement=15,
        )
        graph_builder.remove_virtual_edges()
        graph_builder.convert_to_json()
