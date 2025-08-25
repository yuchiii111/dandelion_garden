import networkx as nx
import json
from networkx.readwrite import json_graph
import math


def generate_flower_geometry(yearlist, publicationcount, x, y):
    flowerCenterZ = publicationcount * 45 / 143 + 30
    sphereRadius = flowerCenterZ * 7 / 18
    lineposition = []
    lineIndicee = []
    endPhi = math.pi
    segments = 15
    petalPoint = []
    i = 0.5
    while i < len(yearlist):
        i = int(i - 0.5)
        window_innerwidth = 1872
        window_innerheight = 928
        year = yearlist[i]
        theta = 2 * math.pi * (i + 0.5) / publicationcount
        start_Phi = 0.5 * math.pi + 0.5 * math.pi * (1 - (year - 1980) / (2025 - 1980))
        x1 = round(
            sphereRadius * math.cos(theta) * math.sin(start_Phi)
            + x * window_innerwidth,
            3,
        )
        y1 = round(
            sphereRadius * math.sin(theta) * math.sin(start_Phi)
            + y * window_innerheight,
            3,
        )
        z1 = round(sphereRadius * math.cos(start_Phi) + flowerCenterZ + sphereRadius, 3)
        lineposition.append((x1, y1, z1))
        if i == 0:  # Store the first petal point separately
            petalPoint = [x1, y1, z1]

        for j in range(1, segments + 1):
            phi = start_Phi - (start_Phi - endPhi) * (j / segments)
            x2 = round(
                sphereRadius * math.cos(theta) * math.sin(phi) + x * window_innerwidth,
                3,
            )
            y2 = round(
                sphereRadius * math.sin(theta) * math.sin(phi) + y * window_innerheight,
                3,
            )
            z2 = round(sphereRadius * math.cos(phi) + flowerCenterZ + sphereRadius, 3)
            lineposition.append((x2, y2, z2))
            lineIndicee.append(((i * (segments + 1) + j - 1), (i * (segments + 1) + j)))
        i = i + 1.5
    # 将lineposition和lineIndicee转换为一维列表
    lineposition = [item for sublist in lineposition for item in sublist]
    lineIndicee = [item for sublist in lineIndicee for item in sublist]
    return {
        "lineposition": lineposition,
        "lineIndicee": lineIndicee,
        "flowerCenterZ": flowerCenterZ,
        "sphereRadius": sphereRadius,
        "petalPoint": petalPoint,
    }


# 读取GraphML文件
G = nx.read_graphml("backend/static/co_author_network_paper_drl_2.graphml")

# 将图转换为节点链接数据格式
data = json_graph.node_link_data(G)
# 遍历每个节点，转换"publications"属性
author_id_dict = {}
for node in data["nodes"]:
    # 检查节点是否有"publications"属性
    publication_years = []
    if "publications" in node:
        try:
            # 将"publications"属性的字符串值转换为列表
            node["publications"] = json.loads(node["publications"])
        except json.JSONDecodeError as e:
            # 如果转换失败，打印错误信息
            print(f"Error decoding JSON for node {node['id']}: {e}")
    if "author_id" in node:
        # 建立一个id到author_id的字典
        author_id_dict[node["id"]] = node["author_id"]
        node["id"] = node["author_id"]
        del node["author_id"]
    else:
        print(f"Node {node['id']} does not have an author_id")
        break
    for publication in node["publications"]:
        if publication["YEAR"] is not None:
            publication_years.append(publication["YEAR"])
    node["publication_years"] = publication_years
    node["petal"] = generate_flower_geometry(
        publication_years, node["publication_count"], node["x"], node["y"]
    )
for link in data["links"]:
    link["source"] = author_id_dict[link["source"]]
    link["target"] = author_id_dict[link["target"]]

with open("backend/static/co_author_network_drl.json", "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=4)
