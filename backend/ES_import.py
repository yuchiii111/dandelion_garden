import mysql.connector
from elasticsearch.helpers import bulk
from elasticsearch_dsl import connections, Index, Document, Text, Integer, Double


class ElasticsearchMySQLSync:
    def __init__(self, es_host, es_timeout, mysql_config):
        # 创建 Elasticsearch 连接
        connections.create_connection(
            alias="my_connection", hosts=[es_host], timeout=es_timeout
        )

        # 定义 Paper 文档模型
        class Paper(Document):
            paper_id = Text()
            ISSN = Text()
            MEDIA = Text()
            TITLE = Text()
            YEAR = Integer()
            PAPER_CLASS = Text()
            ESI = Text()
            LANGUAGE = Text()
            BJSQK = Text()
            DISCIPLINE = Text()
            keywords = Text()

            class Index:
                name = "papers"
                using = "my_connection"

        # 定义 Teacher 文档模型
        class Teacher(Document):
            人员类别 = Text()
            JZGBH = Integer()
            NAME = Text()
            当前状态 = Text()
            SEX = Text()
            所在单位 = Text()
            work_unit = Text()
            teachership = Text()
            聘任专业技术职务级别 = Text()
            岗位类别 = Text()
            岗位等级 = Text()
            最高学历 = Text()
            degree = Text()
            graduate_institution = Text()
            毕业年月 = Text()
            所学专业 = Text()
            授学位年月 = Text()
            研究方向 = Text()
            学科类别 = Text()
            XKLBDM_DISPLAY = Text()
            一级学科 = Text()
            YJXKDM_DISPLAY = Text()
            二级学科 = Text()
            EJXKDM_DISPLAY = Text()

            class Index:
                name = "teachers"
                using = "my_connection"

        # 定义 Award 文档模型
        class Award(Document):
            award_id = Text()
            award_name = Text()
            project_name = Text()
            YEAR = Integer()
            awaed_level = Text()
            HJJBDM = Text()
            establishment = Text()

            class Index:
                name = "awards"
                using = "my_connection"

        # 定义 Patent 文档模型
        class Patent(Document):
            patent_id = Text()
            Patents_NAME = Text()
            Category = Text()
            IS_INTERNATIONAL_PATENT = Integer()
            BY03 = Text()
            YEAR = Integer()

            class Index:
                name = "patents"
                using = "my_connection"

        # 定义 Project 文档模型
        class Project(Document):
            project_id = Text()
            project_name = Text()
            project_ESTABLISH_date = Text()
            XMJBDM = Text()
            by01 = Text()
            by02 = Text()
            by03 = Text()
            is_vertical_project = Integer()
            YEAR = Integer()

            class Index:
                name = "projects"
                using = "my_connection"

        # 定义 Publication 文档模型
        class Publication(Document):
            Publication_id = Text()
            Book_Name = Text()
            Category = Text()
            Publisher_Name = Text()
            Publish_Date = Text()
            ZS = Double()
            YEAR = Integer()

            class Index:
                name = "publications"
                using = "my_connection"

        self.Paper = Paper
        self.Teacher = Teacher
        self.Award = Award
        self.Patent = Patent
        self.Project = Project
        self.Publication = Publication
        self.mysql_config = mysql_config

    def setup_index(self, index_name):
        # 创建索引并映射文档模型
        index = Index(index_name, using="my_connection")

        # 删除索引（如果已存在）
        if index.exists():
            index.delete()

        # 创建索引
        index.create()

        # 将文档模型映射到索引中
        if index_name == "papers":
            self.Paper.init()
        elif index_name == "teachers":
            self.Teacher.init()
        elif index_name == "awards":
            self.Award.init()
        elif index_name == "patents":
            self.Patent.init()
        elif index_name == "projects":
            self.Project.init()
        elif index_name == "publications":
            self.Publication.init()

    def fetch_mysql_data(self, table_name):
        # 连接到 MySQL 数据库
        cnx = mysql.connector.connect(**self.mysql_config)
        cursor = cnx.cursor(dictionary=True)

        # 查询表数据
        cursor.execute(f"SELECT * FROM {table_name}")
        data = cursor.fetchall()

        # 关闭 MySQL 连接
        cursor.close()
        cnx.close()

        return data

    def sync_data_to_es(self, data, index_name):
        # 将数据转换为 Elasticsearch 文档格式
        if index_name == "papers":
            actions = [
                {
                    "_index": "papers",
                    "_id": item["paper_id"],  # 使用 paper_id 作为文档的 _id
                    "_source": {
                        "paper_id": item["paper_id"],
                        "ISSN": item["ISSN"],
                        "MEDIA": item["MEDIA"],
                        "TITLE": item["TITLE"],
                        "YEAR": item["YEAR"],
                        "PAPER_CLASS": item["PAPER_CLASS"],
                        "ESI": item["ESI"],
                        "LANGUAGE": item["LANGUAGE"],
                        "BJSQK": item["BJSQK"],
                        "DISCIPLINE": item["DISCIPLINE"],
                        "keywords": item["keywords"],
                    },
                }
                for item in data
            ]
        elif index_name == "teachers":
            actions = [
                {
                    "_index": "teachers",
                    "_id": item["JZGBH"],  # 使用 JZGBH 作为文档的 _id
                    "_source": {
                        "人员类别": item["人员类别"],
                        "JZGBH": item["JZGBH"],
                        "NAME": item["NAME"],
                        "当前状态": item["当前状态"],
                        "SEX": item["SEX"],
                        "所在单位": item["所在单位"],
                        "work_unit": item["work_unit"],
                        "teachership": item["teachership"],
                        "聘任专业技术职务级别": item["聘任专业技术职务级别"],
                        "岗位类别": item["岗位类别"],
                        "岗位等级": item["岗位等级"],
                        "最高学历": item["最高学历"],
                        "degree": item["degree"],
                        "graduate_institution": item["graduate_institution"],
                        "毕业年月": item["毕业年月"],
                        "所学专业": item["所学专业"],
                        "授学位年月": item["授学位年月"],
                        "研究方向": item["研究方向"],
                        "学科类别": item["学科类别"],
                        "XKLBDM_DISPLAY": item["XKLBDM_DISPLAY"],
                        "一级学科": item["一级学科"],
                        "YJXKDM_DISPLAY": item["YJXKDM_DISPLAY"],
                        "二级学科": item["二级学科"],
                        "EJXKDM_DISPLAY": item["EJXKDM_DISPLAY"],
                    },
                }
                for item in data
            ]
        elif index_name == "awards":
            actions = [
                {
                    "_index": "awards",
                    "_id": item["award_id"],  # 使用 award_id 作为文档的 _id
                    "_source": {
                        "award_id": item["award_id"],
                        "award_name": item["award_name"],
                        "project_name": item["project_name"],
                        "YEAR": item["YEAR"],
                        "awaed_level": item["awaed_level"],
                        "HJJBDM": item["HJJBDM"],
                        "establishment": item["establishment"],
                    },
                }
                for item in data
            ]
        elif index_name == "patents":
            actions = [
                {
                    "_index": "patents",
                    "_id": item["patent_id"],  # 使用 patent_id 作为文档的 _id
                    "_source": {
                        "patent_id": item["patent_id"],
                        "Patents_NAME": item["Patents_NAME"],
                        "Category": item["Category"],
                        "IS_INTERNATIONAL_PATENT": item["IS_INTERNATIONAL_PATENT"],
                        "BY03": item["BY03"],
                        "YEAR": item["YEAR"],
                    },
                }
                for item in data
            ]
        elif index_name == "projects":
            actions = [
                {
                    "_index": "projects",
                    "_id": item["project_id"],  # 使用 project_id 作为文档的 _id
                    "_source": {
                        "project_id": item["project_id"],
                        "project_name": item["project_name"],
                        "project_ESTABLISH_date": item["project_ESTABLISH_date"],
                        "XMJBDM": item["XMJBDM"],
                        "by01": item["by01"],
                        "by02": item["by02"],
                        "by03": item["by03"],
                        "is_vertical_project": item["is_vertical_project"],
                        "YEAR": item["YEAR"],
                    },
                }
                for item in data
            ]
        elif index_name == "publications":
            actions = [
                {
                    "_index": "publications",
                    "_id": item["publication_id"],  # 使用 Publication_id 作为文档的 _id
                    "_source": {
                        "publication_id": item["publication_id"],
                        "Book_Name": item["Book_Name"],
                        "Category": item["Category"],
                        "Publisher_Name": item["Publisher_Name"],
                        "Publish_Date": item["Publish_Date"],
                        "ZS": item["ZS"],
                        "YEAR": item["YEAR"],
                    },
                }
                for item in data
            ]

        # 批量导入数据到 Elasticsearch
        bulk(connections.get_connection(alias="my_connection"), actions)

    def run(self):
        # 同步 papers 数据
        self.setup_index("papers")
        papers_data = self.fetch_mysql_data("papers")
        self.sync_data_to_es(papers_data, "papers")

        # 同步 teachers 数据
        self.setup_index("teachers")
        teachers_data = self.fetch_mysql_data("teachers")
        self.sync_data_to_es(teachers_data, "teachers")

        # 同步 publications 数据
        self.setup_index("publications")
        publications_data = self.fetch_mysql_data("publications")
        self.sync_data_to_es(publications_data, "publications")

        # 同步 patents 数据
        self.setup_index("patents")
        patents_data = self.fetch_mysql_data("patents")
        self.sync_data_to_es(patents_data, "patents")

        # 同步 awards 数据
        self.setup_index("awards")
        awards_data = self.fetch_mysql_data("awards")
        self.sync_data_to_es(awards_data, "awards")

        # 同步 projects 数据
        self.setup_index("projects")
        projects_data = self.fetch_mysql_data("projects")
        self.sync_data_to_es(projects_data, "projects")


# 配置
es_host = "http://localhost:9200"
es_timeout = 20
mysql_config = {
    "user": "root",
    "password": "20020511tanglisa%40",
    "host": "127.0.0.1",
    "database": "summer_project",
}

# 运行同步
sync = ElasticsearchMySQLSync(es_host, es_timeout, mysql_config)
sync.run()
