from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import igraph as ig
from models import db, PapersTeachersRelationship, Teacher, Papers
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
        query = (
            self.db.session.query(
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
        return query.all()


class GraphBuilder:
    def __init__(self, results):
        self.results = results
        self.G = ig.Graph(directed=False)

    def build_graph(self):
        author_index = {}
        index = 0
        papers_to_authors = {}

        for result in self.results:
            p_id = result[0]
            author_jzgbh = result[1]
            discipline = result[4]
            name = result[5]
            sex = result[6]

            if discipline:  # 只有当discipline存在时才处理
                if author_jzgbh not in author_index:
                    self.G.add_vertices(1)
                    self.G.vs[index]["author_id"] = author_jzgbh
                    self.G.vs[index]["discipline"] = discipline
                    self.G.vs[index]["name"] = name
                    self.G.vs[index]["sex"] = sex
                    self.G.vs[index]["publication_count"] = 0
                    self.G.vs[index]["edge_count"] = 0
                    self.G.vs[index]["publications"] = []
                    author_index[author_jzgbh] = index
                    index += 1
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
                self.G.vs[author_index[author_jzgbh]]["publications"].append(
                    publication
                )
                self.G.vs[author_index[author_jzgbh]]["publication_count"] += 1

                if p_id not in papers_to_authors:
                    papers_to_authors[p_id] = []
                papers_to_authors[p_id].append(author_jzgbh)

        for paper_id, authors in papers_to_authors.items():
            for i in range(len(authors)):
                for j in range(i + 1, len(authors)):
                    if (
                        authors[i] in author_index and authors[j] in author_index
                    ):  # 确保两个作者都存在
                        author_i_index = author_index[authors[i]]
                        author_j_index = author_index[authors[j]]
                        edge_id = self.G.get_eid(
                            author_i_index, author_j_index, error=False
                        )
                        if edge_id == -1:
                            self.G.add_edges([(author_i_index, author_j_index)])
                            self.G.es[self.G.get_eid(author_i_index, author_j_index)][
                                "weight"
                            ] = 1
                            self.G.vs[author_i_index]["edge_count"] += 1
                            self.G.vs[author_j_index]["edge_count"] += 1
                        else:
                            self.G.es[edge_id]["weight"] += 1
                            # self.G.vs[author_i_index]["edge_count"] += 1
                            # self.G.vs[author_j_index]["edge_count"] += 1

    def remove_low_degree_vertices(self, x=5):
        degrees = self.G.degree()
        nodes_to_remove = [
            v.index for v in self.G.vs if degrees[v.index] < x or not v["discipline"]
        ]
        self.G.delete_vertices(nodes_to_remove)

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
        layout_G = self.G.layout_graphopt(
            niter=niter,
            node_charge=node_charge,
            node_mass=node_mass,
            spring_length=spring_length,
            spring_constant=spring_constant,
            max_sa_movement=max_sa_movement,
        )
        # layout_G = self.G.layout_fruchterman_reingold(
        #     weights=[w * 150 for w in G.es["weight"]], niter=10000, grid="auto"
        # )

        max_x = max(layout_G, key=lambda item: item[0])[0]
        min_x = min(layout_G, key=lambda item: item[0])[0]
        max_y = max(layout_G, key=lambda item: item[1])[1]
        min_y = min(layout_G, key=lambda item: item[1])[1]

        for v in self.G.vs:
            x, y = layout_G[v.index]
            v["x"] = self.map_value(x, min_x, max_x, -1, 1)
            v["y"] = self.map_value(y, min_y, max_y, -1, 1)
            if "publications" in v.attributes():
                # write_graphml不支持列表直接导出到graphml，将列表转换为字符串
                v["publications"] = str(v["publications"])
        # 导出G
        self.G.write_graphml("backend/static/network_test.graphml")

    def map_value(self, value, min_old, max_old, min_new, max_new):
        value_scaled = (value - min_old) / (max_old - min_old)
        return min_new + (max_new - min_new) * value_scaled

    def generate_lineposition(
        self, yearlist, x, y, scale_x=1.0, scale_y=1.0, scale_z=1.0
    ):
        publication_count = len(yearlist)
        flower_center_z = publication_count * 45 / 143 + 30
        sphere_radius = flower_center_z * 7 / 18
        random_sequence = random.sample(range(publication_count), publication_count)
        line_positions = []
        window_innerwidth = 1203
        # 寻找yearlist中的最大值和最小值
        year_min = min(yearlist)
        year_max = max(yearlist)
        for i in range(publication_count):
            year = yearlist[i]
            theta = 2 * math.pi * random_sequence[i] / publication_count
            if random.random() < 0.1:  # 10%的概率
                start_phi = (
                    -0.2 * math.pi * (1 - (year - year_min) / (year_max - year_min))
                )
            else:
                start_phi = (
                    0.5 * math.pi * (1 - (year - year_min) / (year_max - year_min))
                )
            # sphere_radius = flower_center_z * 7 / 18*(1-0.8*start_phi/(0.5 * math.pi))
            x1 = round(
                scale_x * sphere_radius * math.cos(theta) * math.cos(start_phi)
                + x * window_innerwidth,
                3,
            )
            y1 = round(
                scale_y * sphere_radius * math.sin(theta) * math.cos(start_phi)
                + y * window_innerwidth,
                3,
            )
            z1 = round(
                scale_z * (sphere_radius * math.sin(start_phi) + flower_center_z), 3
            )
            line_positions.append((x1, y1, z1))
        return line_positions

    def convert_to_json(self):
        import networkx as nx
        import json
        import ast
        from networkx.readwrite import json_graph

        G_nx = nx.read_graphml("backend/static/network_test.graphml")
        for v, data in G_nx.nodes(data=True):
            if "publications" in data:
                # 将字符串转换回列表
                data["publications"] = ast.literal_eval(data["publications"])
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
            publication_years = []
            for publication in node["publications"]:
                if publication["YEAR"] is not None:
                    publication_years.append(publication["YEAR"])
            publication_years = sorted(publication_years)
            yearly_assigned_count = {year: 0 for year in publication_years}
            all_linepositions = self.generate_lineposition(
                publication_years,
                node["x"],
                node["y"],
                scale_x=1.0,
                scale_y=1.0,
                scale_z=1.0,
            )
            for publication in node["publications"]:
                if publication["YEAR"] is not None:
                    assigned_count = yearly_assigned_count[publication["YEAR"]]
                    year_index = publication_years.index(publication["YEAR"])
                    lineposition_index = year_index + assigned_count
                    publication["position"] = all_linepositions[lineposition_index]
                    yearly_assigned_count[publication["YEAR"]] += 1
        for link in data["links"]:
            link["source"] = author_id_dict[link["source"]]
            link["target"] = author_id_dict[link["target"]]

        with open("backend/static/network_all.json", "w", encoding="utf8") as f:
            json.dump(data, f, ensure_ascii=False, indent=4)


if __name__ == "__main__":
    config = AppConfig()
    with config.app.app_context():
        config.db.create_all()
        db_ops = Database(config.db)
        results = db_ops.fetch_data()
        graph_builder = GraphBuilder(results)
        graph_builder.build_graph()
        # G = graph_builder.get_graph()
        # G.write_graphml("backend/static/network_test.graphml")
        graph_builder.remove_low_degree_vertices()
        graph_builder.layout_and_export(
            node_charge=1e-3,
            node_mass=60,
            spring_length=0,
            spring_constant=1,
            max_sa_movement=15,
        )
        graph_builder.convert_to_json()
