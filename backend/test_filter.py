import xml.etree.ElementTree as ET
import json


def graphml_to_json(graphml_path, json_path):
    # 解析 GraphML 文件
    tree = ET.parse(graphml_path)
    root = tree.getroot()

    # 初始化节点和边的列表
    nodes = []
    edges = []
    id_mapping = {}  # 旧ID到新ID的映射

    # 命名空间
    ns = {"graphml": "http://graphml.graphdrawing.org/xmlns"}

    # 遍历节点
    for node in root.findall("graphml:graph/graphml:node", ns):
        node_data = {}
        old_id = node.get("id")  # 旧的节点ID
        for child in node:
            key = child.get("key")
            if key == "v_id":
                new_id = child.text  # 新的节点ID
                node_data["id"] = new_id
                id_mapping[old_id] = new_id  # 更新映射
            elif key == "v_x":
                node_data["x"] = float(child.text)  # 直接转换为浮点数
            elif key == "v_y":
                node_data["y"] = float(child.text)  # 直接转换为浮点数
            elif key == "v_discipline":
                node_data["discipline"] = child.text

        nodes.append(node_data)

    # 映射坐标到 [-1, 1] 范围并保留4位有效数字
    min_x = min(node["x"] for node in nodes)
    max_x = max(node["x"] for node in nodes)
    min_y = min(node["y"] for node in nodes)
    max_y = max(node["y"] for node in nodes)

    for node in nodes:
        node["x"] = round(2 * (node["x"] - min_x) / (max_x - min_x) - 1, 10)
        node["y"] = round(2 * (node["y"] - min_y) / (max_y - min_y) - 1, 10)

    # 遍历边
    for edge in root.findall("graphml:graph/graphml:edge", ns):
        source = edge.get("source")
        target = edge.get("target")
        edge_data = {}
        for child in edge:
            key = child.get("key")
            if key == "e_weight":
                edge_data["weight"] = child.text
            else:
                edge_data[key] = child.text
        # 使用映射更新 source 和 target
        edge_data["source"] = id_mapping.get(source, source)
        edge_data["target"] = id_mapping.get(target, target)
        edges.append(edge_data)

    # 构建 JSON 结构
    graph_json = {"nodes": nodes, "links": edges}

    # 写入 JSON 文件
    with open(json_path, "w") as f:
        json.dump(graph_json, f, ensure_ascii=False, indent=4)


# 调用函数
graphml_path = r"C:\Users\25477\Documents\GitHub\ov_frame\backend\static\co_author_network_paper_drl_2.graphml"
json_path = r"C:\Users\25477\Documents\GitHub\ov_frame\backend\static\co_author_network_drl_2.json"
graphml_to_json(graphml_path, json_path)
