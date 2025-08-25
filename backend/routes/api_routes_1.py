from flask import Flask, jsonify, request
import redis, json, requests, base64
import math, random
from config import app, db
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

# from backend.test_network_generator import build_and_save_network
from flask_cors import CORS, cross_origin

redis_client = redis.Redis(host="localhost", port=6379, db=0, decode_responses=True)


@app.route("/api/Teacher_Summary", methods=["GET"])
@cross_origin()
def get_teacher_summary():
    jzgbh = request.args.get("JZGBH")
    if not jzgbh:
        return jsonify({"error": "Missing JZGBH parameter"}), 400
    cache_key = f"teacher_summary_{jzgbh}"
    cached_data = redis_client.get(cache_key)
    if cached_data:
        return jsonify(json.loads(cached_data))
    teacher = Teacher.query.filter_by(JZGBH=jzgbh).first()
    if not teacher:
        return jsonify({"error": "Teacher not found"}), 404
    papers_count = PapersTeachersRelationship.query.filter_by(JZGBH=jzgbh).count()
    patents_count = PatentsTeachersRelationship.query.filter_by(JZGBH=jzgbh).count()
    projects_count = ProjectsTeachersRelationship.query.filter_by(JZGBH=jzgbh).count()
    awards_count = AwardsTeachersRelationship.query.filter_by(JZGBH=jzgbh).count()
    publications_count = PublicationsTeachersRelationship.query.filter_by(
        JZGBH=jzgbh
    ).count()

    summary_json = {
        "teacher": {
            "techea_id": teacher.JZGBH,
            "name": teacher.NAME,
            "sex": teacher.SEX,
            "graduate_school": teacher.graduate_institution,
            "degree": teacher.degree,
            "teachership": teacher.teachership,
            "work_unit": teacher.work_unit,
            "discipline": teacher.XKLBDM_DISPLAY,
            "discipline1": teacher.YJXKDM_DISPLAY,
            "discipline2": teacher.EJXKDM_DISPLAY,
        },
        "summary": {
            "papers_count": papers_count,
            "patents_count": patents_count,
            "projects_count": projects_count,
            "awards_count": awards_count,
            "publications_count": publications_count,
        },
    }
    redis_client.set(cache_key, json.dumps(summary_json), ex=300)
    return jsonify(summary_json)


@app.route("/api/Teacher_Papers", methods=["GET"])
@cross_origin()
def get_teacher_papers():
    jzgbh = request.args.get("JZGBH")
    if not jzgbh:
        return jsonify({"error": "Missing JZGBH parameter"}), 400

    cache_key = f"teacher_papers_{jzgbh}"
    cached_data = redis_client.get(cache_key)
    if cached_data:
        return jsonify(json.loads(cached_data))

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

    publication_years = []
    for paper in papers:
        if paper.YEAR is not None:
            publication_years.append(paper.YEAR)

    publication_years = sorted(publication_years)
    yearly_assigned_count = {year: 0 for year in publication_years}
    all_linepositions = generate_lineposition(publication_years)

    for paper in papers:
        if paper.YEAR is not None:
            assigned_count = yearly_assigned_count[paper.YEAR]
            year_index = publication_years.index(paper.YEAR)
            lineposition_index = year_index + assigned_count
            lineposition = {
                "x": all_linepositions[lineposition_index][0],
                "y": all_linepositions[lineposition_index][1],
                "z": all_linepositions[lineposition_index][2],
            }
            yearly_assigned_count[paper.YEAR] += 1
        else:
            lineposition = {"x": 0, "y": 0, "z": 0}

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
                "lineposition": lineposition,
            }
        )

    papers_json["teacher"]["papers_count"] = len(papers_json["papers"])
    redis_client.set(cache_key, json.dumps(papers_json), ex=300)
    return jsonify(papers_json)


@app.route("/api/Teacher_Publications", methods=["GET"])
@cross_origin()
def get_teacher_publications():
    jzgbh = request.args.get("JZGBH")
    if not jzgbh:
        return jsonify({"error": "Missing JZGBH parameter"}), 400

    cache_key = f"teacher_publications_{jzgbh}"
    cached_data = redis_client.get(cache_key)
    if cached_data:
        return jsonify(json.loads(cached_data))

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
    redis_client.set(cache_key, json.dumps(publications_json), ex=300)
    return jsonify(publications_json)


@app.route("/api/Teacher_Awards", methods=["GET"])
@cross_origin()
def get_teacher_awards():
    jzgbh = request.args.get("JZGBH")
    if not jzgbh:
        return jsonify({"error": "Missing JZGBH parameter"}), 400

    cache_key = f"teacher_awards_{jzgbh}"
    cached_data = redis_client.get(cache_key)
    if cached_data:
        return jsonify(json.loads(cached_data))

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
    redis_client.set(cache_key, json.dumps(awards_json), ex=300)
    return jsonify(awards_json)


@app.route("/api/Teacher_Patents", methods=["GET"])
@cross_origin()
def get_teacher_patents():
    jzgbh = request.args.get("JZGBH")
    if not jzgbh:
        return jsonify({"error": "Missing JZGBH parameter"}), 400

    cache_key = f"teacher_patents_{jzgbh}"
    cached_data = redis_client.get(cache_key)
    if cached_data:
        return jsonify(json.loads(cached_data))

    teacher = Teacher.query.filter_by(JZGBH=jzgbh).first()
    if not teacher:
        return jsonify({"error": "Teacher not found"}), 404

    patent_ids = [
        rel.patents_id
        for rel in PatentsTeachersRelationship.query.filter_by(JZGBH=jzgbh).all()
    ]
    patents = Patents.query.filter(Patents.patents_id.in_(patent_ids)).all()

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
                "patents_id": patent.patents_id,
                "Patents_NAME": patent.Patents_NAME,
                "Category": patent.Category,
                "IS_INTERNATIONAL_PATENT": patent.IS_INTERNATIONAL_PATENT,
            }
            for patent in patents
        ],
    }
    patents_json["teacher"]["patents_count"] = len(patents_json["patents"])
    redis_client.set(cache_key, json.dumps(patents_json), ex=300)
    return jsonify(patents_json)


@app.route("/api/Teacher_Projects", methods=["GET"])
@cross_origin()
def get_teacher_projects():
    jzgbh = request.args.get("JZGBH")
    if not jzgbh:
        return jsonify({"error": "Missing JZGBH parameter"}), 400

    cache_key = f"teacher_projects_{jzgbh}"
    cached_data = redis_client.get(cache_key)
    if cached_data:
        return jsonify(json.loads(cached_data))

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
    redis_client.set(cache_key, json.dumps(projects_json), ex=300)
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
    json_file_path = "backend\\static\\network_3.json"
    try:
        with open(json_file_path, "r") as file:
            data = file.read()
        return jsonify(json.loads(data))
    except FileNotFoundError:
        return jsonify({"error": "File not found"}), 404
    except json.JSONDecodeError:
        return jsonify({"error": "Invalid JSON"}), 400


@app.route("/network_json_2d", methods=["GET"])
@cross_origin()
def network_graphml_2d():
    json_file_path = "backend\\static\\network_all.json"
    try:
        with open(json_file_path, "r", encoding="utf8") as file:
            data = file.read()
        return jsonify(json.loads(data))
    except FileNotFoundError:
        return jsonify({"error": "File not found"}), 404
    except json.JSONDecodeError:
        return jsonify({"error": "Invalid JSON"}), 400


def revert_perturbation_with_factor(data, factor):
    def get_factor_point_array(factor, use_points):
        try:
            bytes_ = base64.b64decode(factor.encode("utf-8"))
            if len(bytes_) != 5:
                raise RuntimeError("不正确的计算参数[位数]")
            elif use_points < 0 or use_points > len(bytes_):
                raise RuntimeError(
                    "不正确的参数[usePoints需要在1-{}之间]".format(len(bytes_))
                )

            result = [bytes_[i] & 0xFF for i in range(use_points)]
            if not all(result[i] > result[i - 1] for i in range(1, use_points)):
                raise RuntimeError("不正确的计算参数[顺序]")

            return result
        except (base64.binascii.Error, ValueError):
            raise RuntimeError("不正确的计算参数[base64格式]")

    use_points = 5
    if data and len(data) > 55:
        factor_point_array = get_factor_point_array(factor, use_points)

        data_len = len(data)
        string_builder = []
        last_post = data_len
        last_point = 0
        for i in range(len(factor_point_array)):
            split_point = int(factor_point_array[i] / 254.0 * (data_len - 1))
            len_ = split_point - last_point
            string_builder.append(data[last_post - len_ : last_post])
            last_post -= len_
            last_point = split_point

            if i == len(factor_point_array) - 1 and last_post > 0:
                string_builder.append(data[:last_post])

        string_builder = "".join(string_builder)
        result = []
        offset = 0
        last_check_point = 0
        for i in range(len(factor_point_array)):
            random_len = (
                factor_point_array[0]
                if i >= len(factor_point_array) - 1
                else factor_point_array[i + 1]
            )
            real_len = factor_point_array[i] - last_check_point
            result.append(string_builder[offset : offset + real_len])
            offset += real_len + random_len
            last_check_point = factor_point_array[i]

            if i == len(factor_point_array) - 1 and offset < len(string_builder):
                result.append(string_builder[offset:])

        return "".join(result)
    return data


def generate_lineposition(yearlist, scale_x=1.0, scale_y=1.0, scale_z=1.0):
    publication_count = len(yearlist)
    flower_center_z = publication_count * 45 / 143 + 30
    sphere_radius = flower_center_z * 7 / 18
    random_sequence = random.sample(range(publication_count), publication_count)
    line_positions = []
    # 寻找yearlist中的最大值和最小值
    year_min = min(yearlist)
    year_max = max(yearlist)
    for i in range(publication_count):
        year = yearlist[i]
        theta = 2 * math.pi * random_sequence[i] / publication_count
        if random.random() < 0.1:  # 10%的概率
            start_phi = -0.2 * math.pi * (1 - (year - year_min) / (year_max - year_min))
        else:
            start_phi = 0.5 * math.pi * (1 - (year - year_min) / (year_max - year_min))
        # sphere_radius = flower_center_z * 7 / 18*(1-0.8*start_phi/(0.5 * math.pi))
        x1 = round(
            scale_x * sphere_radius * math.cos(theta) * math.cos(start_phi),
            3,
        )
        y1 = round(
            scale_y * sphere_radius * math.sin(theta) * math.cos(start_phi),
            3,
        )
        z1 = round(scale_z * (sphere_radius * math.sin(start_phi) + flower_center_z), 3)
        line_positions.append((x1, y1, z1))
    return line_positions
