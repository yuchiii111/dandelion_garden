from flask import Flask, jsonify, request, send_file
import json, requests
from routes.tools import (
    revert_perturbation_with_factor,
    generate_lineposition,
    get_related_entities,
    process_entities_lineposition,
)
from config import app, db
from pypinyin import lazy_pinyin, Style
from models import (
    Teacher,
    Papers,
    PapersTeachersRelationship,
    PublicationsTeachersRelationship,
    Publications,
    AwardsTeachersRelationship,
    Awards,
    PatentsTeachersRelationship,
    Patents,
    ProjectsTeachersRelationship,
    Projects,
)
from elasticsearch import Elasticsearch
from sqlalchemy import func
from sqlalchemy.orm import aliased
from config import redis_client

es = Elasticsearch(hosts=["http://localhost:9200"])
# from backend.test_network_generator import build_and_save_network
from flask_cors import CORS, cross_origin


@app.route("/api/Teacher_Summary", methods=["GET"])
@cross_origin()
def get_teacher_summary():
    jzgbh = request.args.get("JZGBH")
    if not jzgbh:
        return jsonify({"error": "Missing JZGBH parameter"}), 400

    # 检查 Redis 缓存
    cache_key = f"teacher_summary:{jzgbh}"
    cached_data = redis_client.get(cache_key)
    if cached_data:
        return jsonify(json.loads(cached_data))

    teacher = Teacher.query.filter_by(JZGBH=jzgbh).first()
    if not teacher:
        return jsonify({"error": "Teacher not found"}), 404
    else:
        return (
            jsonify({"error": "Teacher found but no cache, please contact admin"}),
            404,
        )


@app.route("/api/Detail", methods=["GET"])
@cross_origin()
def get_detail():
    entity_type = request.args.get("type")
    entity_id = request.args.get("id")

    if not entity_type or not entity_id:
        return jsonify({"error": "Missing type or id parameter"}), 400

    entity_map = {
        "papers": Papers,
        "awards": Awards,
        "projects": Projects,
        "patents": Patents,
        "publications": Publications,
    }

    if entity_type not in entity_map:
        return jsonify({"error": "Invalid type parameter"}), 400

    entity_model = entity_map[entity_type]
    entity = entity_model.query.filter_by(
        **{f"{entity_type[:-1]}_id": entity_id}
    ).first()
    if entity_type == "papers":
        detail_json = {
            "paper_id": entity.paper_id,
            "ISSN": entity.ISSN,
            "MEDIA": entity.MEDIA,
            "TITLE": entity.TITLE,
            "PRINTDATE": entity.PRINTDATE,
            "CITEDTIMES": entity.CITEDTIMES,
            "YEAR": entity.YEAR,
            "PAPER_CLASS": entity.PAPER_CLASS,
            "IMPACTFACTOR": entity.IMPACTFACTOR,
            "ESI": entity.ESI,
            "LANGUAGE": entity.LANGUAGE,
            "DISCIPLINE": entity.DISCIPLINE,
            "keywords": entity.keywords,
        }
    elif entity_type == "awards":
        detail_json = {
            "award_id": entity.award_id,
            "award_name": entity.award_name,
            "project_name": entity.project_name,
            "award_date": entity.award_date,
            "awaed_level": entity.awaed_level,
            "HJJBDM": entity.HJJBDM,
            "establishment": entity.establishment,
        }
    elif entity_type == "projects":
        detail_json = {
            "project_id": entity.project_id,
            "project_name": entity.project_name,
            "project_ESTABLISH_date": entity.project_ESTABLISH_date,
            "XMJBDM": entity.XMJBDM,
            "by01": entity.by01,
            "by02": entity.by02,
            "by03": entity.by03,
            "is_vertical_project": entity.is_vertical_project,
        }
    elif entity_type == "patents":
        detail_json = {
            "patent_id": entity.patent_id,
            "Patents_NAME": entity.Patents_NAME,
            "Category": entity.Category,
            "IS_INTERNATIONAL_PATENT": entity.IS_INTERNATIONAL_PATENT,
        }
    elif entity_type == "publications":
        detail_json = {
            "publication_id": entity.publication_id,
            "Book_Name": entity.Book_Name,
            "Category": entity.Category,
            "Publisher_Name": entity.Publisher_Name,
            "Publish_Date": entity.Publish_Date,
            "ZS": entity.ZS,
        }
    return jsonify(detail_json)


# summary_json = generate_teacher_summary(teacher)

# # 将结果缓存到 Redis
# redis_client.setex(cache_key, 3600, json.dumps(summary_json))  # 缓存1小时

# return jsonify(summary_json)


# @app.route("/api/Teacher_Summary", methods=["GET"])
# @cross_origin()
# def get_teacher_summary():
#     jzgbh = request.args.get("JZGBH")
#     if not jzgbh:
#         return jsonify({"error": "Missing JZGBH parameter"}), 400

#     teacher = Teacher.query.filter_by(JZGBH=jzgbh).first()
#     if not teacher:
#         return jsonify({"error": "Teacher not found"}), 404

#     def get_yearly_count(
#         relationship_query, entity_model, entity_id_field, year_field, entity_id_attr
#     ):
#         entity_alias = aliased(entity_model)
#         results = (
#             relationship_query.join(
#                 entity_alias, getattr(entity_alias, entity_id_attr) == entity_id_field
#             )
#             .with_entities(
#                 getattr(entity_alias, year_field).label("year"),
#                 func.count().label("count"),
#             )
#             .group_by("year")
#             .all()
#         )
#         # 打印调试信息
#         print(f"Results for {entity_model.__name__}: {results}")
#         return {
#             int(result.year): result.count
#             for result in results
#             if result.year is not None
#         }

#     papers_yearly_count = get_yearly_count(
#         PapersTeachersRelationship.query.filter_by(JZGBH=jzgbh),
#         Papers,
#         PapersTeachersRelationship.paper_id,
#         "YEAR",
#         "paper_id",
#     )
#     patents_yearly_count = get_yearly_count(
#         PatentsTeachersRelationship.query.filter_by(JZGBH=jzgbh),
#         Patents,
#         PatentsTeachersRelationship.patent_id,
#         "YEAR",
#         "patent_id",
#     )
#     projects_yearly_count = get_yearly_count(
#         ProjectsTeachersRelationship.query.filter_by(JZGBH=jzgbh),
#         Projects,
#         ProjectsTeachersRelationship.project_id,
#         "YEAR",
#         "project_id",
#     )
#     awards_yearly_count = get_yearly_count(
#         AwardsTeachersRelationship.query.filter_by(JZGBH=jzgbh),
#         Awards,
#         AwardsTeachersRelationship.award_id,
#         "YEAR",
#         "award_id",
#     )
#     publications_yearly_count = get_yearly_count(
#         PublicationsTeachersRelationship.query.filter_by(JZGBH=jzgbh),
#         Publications,
#         PublicationsTeachersRelationship.publication_id,
#         "YEAR",
#         "publication_id",
#     )

#     def get_pinyin_name(chinese_name):
#         pinyin_list = lazy_pinyin(chinese_name, style=Style.NORMAL)
#         return " ".join([word.capitalize() for word in pinyin_list])

#     total_papers = sum(papers_yearly_count.values())
#     total_patents = sum(patents_yearly_count.values())
#     total_projects = sum(projects_yearly_count.values())
#     total_awards = sum(awards_yearly_count.values())
#     total_publications = sum(publications_yearly_count.values())
#     summary_json = {
#         "teacher": {
#             "techea_id": teacher.JZGBH,
#             "name": teacher.NAME,
#             "name_pinyin": get_pinyin_name(teacher.NAME),
#             "sex": teacher.SEX,
#             "graduate_school": teacher.graduate_institution,
#             "degree": teacher.degree,
#             "teachership": teacher.teachership,
#             "work_unit": teacher.work_unit,
#             "discipline": teacher.XKLBDM_DISPLAY,
#             "discipline1": teacher.YJXKDM_DISPLAY,
#             "discipline2": teacher.EJXKDM_DISPLAY,
#         },
#         "summary": {
#             "papers": papers_yearly_count,
#             "total_papers": total_papers,
#             "patents": patents_yearly_count,
#             "total_patents": total_patents,
#             "projects": projects_yearly_count,
#             "total_projects": total_projects,
#             "awards": awards_yearly_count,
#             "total_awards": total_awards,
#             "publications": publications_yearly_count,
#             "total_publications": total_publications,
#         },
#     }
#     return jsonify(summary_json)


@app.route("/api/Teacher_Papers", methods=["GET"])
@cross_origin()
def get_teacher_papers():
    jzgbh = request.args.get("JZGBH")
    if not jzgbh:
        return jsonify({"error": "Missing JZGBH parameter"}), 400

    teacher = Teacher.query.filter_by(JZGBH=jzgbh).first()
    if not teacher:
        return jsonify({"error": "Teacher not found"}), 404

    paper_ids = [
        rel.paper_id
        for rel in PapersTeachersRelationship.query.filter_by(JZGBH=jzgbh).all()
    ]
    papers = Papers.query.filter(Papers.paper_id.in_(paper_ids)).all()
    papers_json = {
        "teacher": {
            "JZGBH": teacher.JZGBH,
            "NAME": teacher.NAME,
            "Discipline": teacher.XKLBDM_DISPLAY,
            "SEX": teacher.SEX,
            "papers_count": 0,
        },
        "papers": [],
    }
    # publication_years = []
    # for paper in papers:
    #     if paper.YEAR is not None:
    #         publication_years.append(paper.YEAR)
    # publication_years = sorted(publication_years)
    # yearly_assigned_count = {year: 0 for year in publication_years}
    # all_linepositions = generate_lineposition(publication_years)
    for paper in papers:
        # if paper.YEAR is not None:
        #     assigned_count = yearly_assigned_count[paper.YEAR]
        #     year_index = publication_years.index(paper.YEAR)
        #     lineposition_index = year_index + assigned_count
        #     lineposition = {
        #         "x": all_linepositions[lineposition_index][0],
        #         "y": all_linepositions[lineposition_index][1],
        #         "z": all_linepositions[lineposition_index][2],
        #     }
        #     yearly_assigned_count[paper.YEAR] += 1
        # else:
        #     lineposition = {"x": 0, "y": 0, "z": 0}
        papers_json["papers"].append(
            {
                "paper_id": paper.paper_id,
                "ISSN": paper.ISSN,
                "MEDIA": paper.MEDIA,
                "TITLE": paper.TITLE,
                "PRINTDATE": paper.PRINTDATE,
                "CITEDTIMES": paper.CITEDTIMES,
                "YEAR": paper.YEAR,
                "PAPER_CLASS": paper.PAPER_CLASS,
                "IMPACTFACTOR": paper.IMPACTFACTOR,
                "ESI": paper.ESI,
                "LANGUAGE": paper.LANGUAGE,
                "BJSQK": paper.BJSQK,
                "DISCIPLINE": paper.DISCIPLINE,
                "keywords": paper.keywords,
            }
        )
    papers_json["teacher"]["papers_count"] = len(papers_json["papers"])
    return jsonify(papers_json)


@app.route("/api/Teacher_Publications", methods=["GET"])
@cross_origin()
def get_teacher_publications():
    jzgbh = request.args.get("JZGBH")
    if not jzgbh:
        return jsonify({"error": "Missing JZGBH parameter"}), 400

    teacher = Teacher.query.filter_by(JZGBH=jzgbh).first()
    if not teacher:
        return jsonify({"error": "Teacher not found"}), 404

    publication_ids = [
        rel.publication_id
        for rel in PublicationsTeachersRelationship.query.filter_by(JZGBH=jzgbh).all()
    ]
    publications = Publications.query.filter(
        Publications.publication_id.in_(publication_ids)
    ).all()

    publications_json = {
        "teacher": {
            "JZGBH": teacher.JZGBH,
            "NAME": teacher.NAME,
            "Discipline": teacher.XKLBDM_DISPLAY,
            "SEX": teacher.SEX,
            "publications_count": 0,
        },
        "publications": [
            {
                "publication_id": pub.publication_id,
                "Book_Name": pub.Book_Name,
                "Category": pub.Category,
                "Publisher_Name": pub.Publisher_Name,
                "Publish_Date": pub.Publish_Date,
                "ZS": pub.ZS,
            }
            for pub in publications
        ],
    }
    publications_json["teacher"]["publications_count"] = len(
        publications_json["publications"]
    )
    return jsonify(publications_json)


@app.route("/api/Teacher_Awards", methods=["GET"])
@cross_origin()
def get_teacher_awards():
    jzgbh = request.args.get("JZGBH")
    if not jzgbh:
        return jsonify({"error": "Missing JZGBH parameter"}), 400

    teacher = Teacher.query.filter_by(JZGBH=jzgbh).first()
    if not teacher:
        return jsonify({"error": "Teacher not found"}), 404

    award_ids = [
        rel.award_id
        for rel in AwardsTeachersRelationship.query.filter_by(JZGBH=jzgbh).all()
    ]
    awards = Awards.query.filter(Awards.award_id.in_(award_ids)).all()

    awards_json = {
        "teacher": {
            "JZGBH": teacher.JZGBH,
            "NAME": teacher.NAME,
            "Discipline": teacher.XKLBDM_DISPLAY,
            "SEX": teacher.SEX,
            "awards_count": 0,
        },
        "awards": [
            {
                "award_id": award.award_id,
                "award_name": award.award_name,
                "project_name": award.project_name,
                "award_date": award.award_date,
                "awaed_level": award.awaed_level,
                "HJJBDM": award.HJJBDM,
                "establishment": award.establishment,
            }
            for award in awards
        ],
    }
    awards_json["teacher"]["awards_count"] = len(awards_json["awards"])
    return jsonify(awards_json)


@app.route("/api/Teacher_Patents", methods=["GET"])
@cross_origin()
def get_teacher_patents():
    jzgbh = request.args.get("JZGBH")
    if not jzgbh:
        return jsonify({"error": "Missing JZGBH parameter"}), 400

    teacher = Teacher.query.filter_by(JZGBH=jzgbh).first()
    if not teacher:
        return jsonify({"error": "Teacher not found"}), 404

    patent_ids = [
        rel.patent_id
        for rel in PatentsTeachersRelationship.query.filter_by(JZGBH=jzgbh).all()
    ]
    patents = Patents.query.filter(Patents.patent_id.in_(patent_ids)).all()

    patents_json = {
        "teacher": {
            "JZGBH": teacher.JZGBH,
            "NAME": teacher.NAME,
            "Discipline": teacher.XKLBDM_DISPLAY,
            "SEX": teacher.SEX,
            "patents_count": 0,
        },
        "patents": [
            {
                "patent_id": patent.patent_id,
                "Patents_NAME": patent.Patents_NAME,
                "Category": patent.Category,
                "IS_INTERNATIONAL_PATENT": patent.IS_INTERNATIONAL_PATENT,
            }
            for patent in patents
        ],
    }
    patents_json["teacher"]["patents_count"] = len(patents_json["patents"])
    return jsonify(patents_json)


@app.route("/api/Teacher_Projects", methods=["GET"])
@cross_origin()
def get_teacher_projects():
    jzgbh = request.args.get("JZGBH")
    if not jzgbh:
        return jsonify({"error": "Missing JZGBH parameter"}), 400
    teacher = Teacher.query.filter_by(JZGBH=jzgbh).first()
    if not teacher:
        return jsonify({"error": "Teacher not found"}), 404

    project_ids = [
        rel.project_id
        for rel in ProjectsTeachersRelationship.query.filter_by(JZGBH=jzgbh).all()
    ]
    projects = Projects.query.filter(Projects.project_id.in_(project_ids)).all()

    projects_json = {
        "teacher": {
            "JZGBH": teacher.JZGBH,
            "NAME": teacher.NAME,
            "Discipline": teacher.XKLBDM_DISPLAY,
            "SEX": teacher.SEX,
            "projects_count": 0,
        },
        "projects": [
            {
                "project_id": project.project_id,
                "project_name": project.project_name,
                "project_ESTABLISH_date": project.project_ESTABLISH_date,
                "XMJBDM": project.XMJBDM,
                "by01": project.by01,
                "by02": project.by02,
                "by03": project.by03,
                "is_vertical_project": project.is_vertical_project,
            }
            for project in projects
        ],
    }
    projects_json["teacher"]["projects_count"] = len(projects_json["projects"])
    return jsonify(projects_json)


@app.route("/api/get_photo", methods=["POST"])
def get_photo():
    try:
        # 获取请求体中的 JSON 数据
        identity_params = request.json

        # 第一步：获取Token和Factor
        token_response = requests.post(
            "https://faceid.tongji.edu.cn/face/external/v2/getToken",
            json={
                "agentId": identity_params["agentId"],
                "agentSecret": identity_params["agentSecret"],
            },
        )
        token_data = token_response.json()
        token = token_data["data"]["token"]
        factor = token_data["data"]["factor"]

        # 第二步：获取混淆的Base64数据
        token = token_data["data"]["token"]
        factor = token_data["data"]["factor"]

        # 第二步：获取混淆的Base64数据
        teacher_id = identity_params["teacher_id"]
        headers = {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "token": token,
        }
        json_data = {"userId": teacher_id, "collectStatus": "0"}

        # 打印请求信息以进行调试
        print("Request Headers:", headers)
        print("Request JSON Data:", json_data)

        photo_response = requests.post(
            "https://faceid.tongji.edu.cn/face/external/v2/collectByUser",
            headers=headers,
            json=json_data,
        )

        photo_response = requests.post(
            "https://faceid.tongji.edu.cn/face/external/v2/collectByUser",
            headers=headers,
            json=json_data,
        )

        # 打印响应内容以进行调试
        print("Response Status Code:", photo_response.status_code)
        print("Response Text:", photo_response.text)

        photo_data = photo_response.json()

        # 检查photo_data的结构
        if "data" in photo_data and "data" in photo_data["data"]:
            obfuscated_base64 = photo_data["data"]["data"]  # 读取data字段中的base64数据
        else:
            return (
                jsonify(
                    {
                        "error": "Unexpected response structure",
                        "response": photo_data,
                        "token": token,
                    }
                ),
                500,
            )

        # 第三步：解混淆（假设有一个解混淆函数）
        deobfuscated_base64 = revert_perturbation_with_factor(obfuscated_base64, factor)

        # 返回解混淆后的Base64数据
        return jsonify({"base64": deobfuscated_base64})

    except Exception as e:
        return str(e), 500


@app.route("/api/network_json_2d", methods=["GET"])
@cross_origin()
def network_graphml():
    json_file_path = "static\\network.json"
    try:
        with open(json_file_path, "r") as file:
            data = file.read()
        return jsonify(json.loads(data))
    except FileNotFoundError:
        return jsonify({"error": "File not found"}), 404
    except json.JSONDecodeError:
        return jsonify({"error": "Invalid JSON"}), 400

        
@app.route("/api/component", methods=["GET"])
@cross_origin()
def get_image():
    genre = request.args.get("TYPE")
    file_path = "static\\"+ genre +".png"
    try:
        # with open(json_file_path, "r") as file:
        #     data = file.read()
        return send_file(file_path, mimetype='image/png')

    except FileNotFoundError:
        return jsonify({"error": "File not found"}), 404
    # except json.JSONDecodeError:
    #     return jsonify({"error": "Invalid JSON"}), 400

@app.route("/api/model", methods=["GET"])
@cross_origin()
def get_modelimage():
    # genre = request.args.get("TYPE")
    # id = request.args.get("INDEX")
    file_path = "static\\default_figure1.png"
    try:
        # with open(json_file_path, "r") as file:
        #     data = file.read()
        return send_file(file_path, mimetype='image/png')

    except FileNotFoundError:
        return jsonify({"error": "File not found"}), 404
    # except json.JSONDecodeError:
    #     return jsonify({"error": "Invalid JSON"}), 400

@app.route("/network_json_2d", methods=["GET"])
@cross_origin()
def network_graphml_2d():
    json_file_path = "static\\network.json"
    try:
        with open(json_file_path, "r", encoding="utf8") as file:
            data = file.read()
        return jsonify(json.loads(data))
    except FileNotFoundError:
        return jsonify({"error": "File not found"}), 404
    except json.JSONDecodeError:
        return jsonify({"error": "Invalid JSON"}), 400


# @app.route("/api/Teacher_dandelion", methods=["GET"])
# @cross_origin()
# def get_teacher_dandelion():
#     jzgbh = request.args.get("JZGBH")
#     threshold = int(request.args.get("threshold", 10))  # 获取阈值参数，默认值为10

#     if not jzgbh:
#         return jsonify({"error": "Missing JZGBH parameter"}), 400

#     teacher = Teacher.query.filter_by(JZGBH=jzgbh).first()
#     if not teacher:
#         return jsonify({"error": "Teacher not found"}), 404

#     entity_types = ["papers", "patents", "projects", "awards", "publications"]
#     # 查询论文
#     papers = (
#         Papers.query.join(
#             PapersTeachersRelationship,
#             Papers.paper_id == PapersTeachersRelationship.paper_id,
#         )
#         .filter(PapersTeachersRelationship.JZGBH == jzgbh)
#         .with_entities(
#             Papers.paper_id, Papers.CITEDTIMES, Papers.PAPER_CLASS, Papers.YEAR
#         )
#         .all()
#     )
#     # 查询专利
#     patents = (
#         Patents.query.join(
#             PatentsTeachersRelationship,
#             Patents.patent_id == PatentsTeachersRelationship.patent_id,
#         )
#         .filter(PatentsTeachersRelationship.JZGBH == jzgbh)
#         .with_entities(
#             Patents.patent_id,
#             Patents.IS_INTERNATIONAL_PATENT,
#             Patents.Category,
#             Patents.YEAR,
#         )
#         .all()
#     )

#     # 查询项目
#     projects = (
#         Projects.query.join(
#             ProjectsTeachersRelationship,
#             Projects.project_id == ProjectsTeachersRelationship.project_id,
#         )
#         .filter(ProjectsTeachersRelationship.JZGBH == jzgbh)
#         .with_entities(
#             Projects.project_id,
#             Projects.is_vertical_project,
#             Projects.HTJF,
#             Projects.YEAR,
#         )
#         .all()
#     )

#     # 查询奖项
#     awards = (
#         Awards.query.join(
#             AwardsTeachersRelationship,
#             Awards.award_id == AwardsTeachersRelationship.award_id,
#         )
#         .filter(AwardsTeachersRelationship.JZGBH == jzgbh)
#         .with_entities(Awards.award_id, Awards.awaed_level, Awards.HJJB, Awards.YEAR)
#         .all()
#     )

#     # 查询出版物
#     publications = (
#         Publications.query.join(
#             PublicationsTeachersRelationship,
#             Publications.publication_id
#             == PublicationsTeachersRelationship.publication_id,
#         )
#         .filter(PublicationsTeachersRelationship.JZGBH == jzgbh)
#         .with_entities(
#             Publications.publication_id, Publications.Category, Publications.YEAR
#         )
#         .all()
#     )
#     # 将所有实体合并到一个列表中
#     entities_list = [papers, patents, projects, awards, publications]
#     Teacher_dandelion_json = {
#         "teacher": {
#             "JZGBH": teacher.JZGBH,
#             "NAME": teacher.NAME,
#             "Discipline": teacher.XKLBDM_DISPLAY,
#             "SEX": teacher.SEX,
#             "papers_count": 0,
#             "patents_count": 0,
#             "projects_count": 0,
#             "awards_count": 0,
#             "publications_count": 0,
#         },
#         "papers": [],
#         "patents": [],
#         "projects": [],
#         "awards": [],
#         "publications": [],
#     }
#     all_years = []
#     for entities in entities_list:
#         for entity in entities:
#             if entity.YEAR is not None:
#                 all_years.append(entity.YEAR)
#     all_years = sorted(all_years)
#     if all_years:
#         all_linepositions = generate_lineposition(all_years)
#     assigned_flags = [False] * len(all_years)
#     combined_list = [
#         [year, position, flag]
#         for year, position, flag in zip(all_years, all_linepositions, assigned_flags)
#     ]
#     for entity_type, entities in zip(entity_types, entities_list):
#         process_entities_lineposition(
#             entities, entity_type, combined_list, Teacher_dandelion_json
#         )
#     total_count = 0
#     for entity_type in entity_types:
#         count = len(Teacher_dandelion_json[entity_type])
#         Teacher_dandelion_json["teacher"][f"{entity_type}_count"] = count
#         total_count += count

#     # 如果总数小于阈值，则进行提示
#     if total_count < threshold:
#         return jsonify(
#             {
#                 "message": f"Because the total count is less than the threshold: {threshold}, we will not return the dandelion data"
#             }
#         )


#     return jsonify(Teacher_dandelion_json)
@app.route("/api/Teacher_dandelion", methods=["GET"])
@cross_origin()
def get_teacher_dandelion():
    jzgbh = request.args.get("JZGBH")
    threshold = int(request.args.get("threshold", 10))
    if not jzgbh:
        return jsonify({"error": "Missing JZGBH parameter"}), 400

    # 检查 Redis 缓存
    cache_key = f"teacher_dandelion:{jzgbh}"
    cached_data = redis_client.get(cache_key)
    if cached_data:
        # 检查缓存中数据的total_count属性是否小于阈值
        cached_json = json.loads(cached_data)
        if cached_json["teacher"]["total_count"] < threshold:
            return jsonify(
                {
                    "message": f"Because the total count is less than the threshold: {threshold}, we will not return the dandelion data"
                }
            )
        else:
            return jsonify(cached_json)

    teacher = Teacher.query.filter_by(JZGBH=jzgbh).first()
    if not teacher:
        return jsonify({"error": "Teacher not found"}), 404
    else:
        return (
            jsonify({"error": "Teacher found but no cache, please contact admin"}),
            404,
        )


# @app.route("/api/search_teacher", methods=["GET"])
# @cross_origin()
# def search_teacher():
#     # 从请求参数中获取查询字段、查询内容、页码和每页大小
#     query_field = request.args.get("field")
#     query_value = request.args.get("value")
#     page = int(request.args.get("page", 1))  # 默认页码为1
#     size = int(request.args.get("size", 10))  # 默认每页大小为10

#     if not query_field or not query_value:
#         return jsonify({"error": "Missing query field or value"}), 400

#     # 计算起始位置
#     from_ = (page - 1) * size

#     # 构建 Elasticsearch 查询
#     body = {
#         "query": {"match": {query_field: {"query": query_value, "fuzziness": "AUTO"}}},
#         "from": from_,
#         "size": size,
#     }

#     try:
#         # 执行查询
#         response = es.search(index="teachers", body=body)
#         hits = response["hits"]["hits"]
#         results = [hit["_source"] for hit in hits]
#         total_hits = response["hits"]["total"]["value"]
#         return jsonify(
#             {"total_hits": total_hits, "page": page, "size": size, "results": results}
#         )
#     except Exception as e:
#         return jsonify({"error": str(e)}), 500


@app.route("/api/search", methods=["GET"])
@cross_origin()
def search():
    index = request.args.get("index")
    query_field = request.args.get("field")
    query_value = request.args.get("value")
    page = int(request.args.get("page", 1))  # 默认页码为1
    size = int(request.args.get("size", 10))  # 默认每页大小为10

    if not index or not query_value:
        return jsonify({"error": "Missing index or query value"}), 400

    # 计算起始位置
    from_ = (page - 1) * size

    # 构建 Elasticsearch 查询
    if query_field:
        body = {
            "query": {
                "match": {query_field: {"query": query_value, "fuzziness": "AUTO"}}
            },
            "from": from_,
            "size": size,
            "track_total_hits": True,
        }
    else:
        body = {
            "query": {"multi_match": {"query": query_value, "fuzziness": "AUTO"}},
            "from": from_,
            "size": size,
            "track_total_hits": True,
        }

    try:
        # 执行查询
        response = es.search(index=index, body=body)
        hits = response["hits"]["hits"]
        results = [hit["_source"] for hit in hits]
        total_hits = response["hits"]["total"]["value"]
        return jsonify(
            {"total_hits": total_hits, "page": page, "size": size, "results": results}
        )
    except Exception as e:
        return jsonify({"error": str(e)}), 500
