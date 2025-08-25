from config import db
from sqlalchemy import Integer, String, Column, Boolean, Date, Float


from config import db
from sqlalchemy import Integer, String, Column, Boolean, Date, Float


# 定义基类
class Base(db.Model):
    __abstract__ = True  # 声明这是一个抽象类，不会创建对应的表

    def to_json(self):
        result = {}
        for key in self.__dict__:
            if key != "_sa_instance_state":
                result[key] = getattr(self, key)
        return result


# 定义 Paper 模型类
class Papers(Base):
    __tablename__ = "papers"
    paper_id = Column(String(255), primary_key=True)
    ISSN = Column(String(1024))
    MEDIA = Column(String(1024))
    TITLE = Column(String(1024))
    PRINTDATE = Column(String(255))
    CITEDTIMES = Column(Integer)
    YEAR = Column(Integer)
    PAPER_CLASS = Column(String(255))
    IMPACTFACTOR = Column(Integer)
    ESI = Column(String(1024))
    LANGUAGE = Column(String(255))
    BJSQK = Column(String(255))
    DISCIPLINE = Column(String(255))
    keywords = Column(String(255))


class Teacher(Base):
    __tablename__ = "teachers"
    人员类别 = Column(String(255), nullable=True)
    JZGBH = Column(Integer, primary_key=True)
    NAME = Column(String(255), nullable=True)
    当前状态 = Column(String(255), nullable=True)
    SEX = Column(String(255), nullable=True)
    所在单位 = Column(String(255), nullable=True)
    work_unit = Column(String(255), nullable=True)
    teachership = Column(String(255), nullable=True)
    聘任专业技术职务级别 = Column(String(255), nullable=True)
    岗位类别 = Column(String(255), nullable=True)
    岗位等级 = Column(String(255), nullable=True)
    最高学历 = Column(String(255), nullable=True)
    degree = Column(String(255), nullable=True)
    graduate_institution = Column(String(255), nullable=True)
    毕业年月 = Column(String(255), nullable=True)
    所学专业 = Column(String(255), nullable=True)
    授学位年月 = Column(String(255), nullable=True)
    研究方向 = Column(String(255), nullable=True)
    学科类别 = Column(String(255), nullable=True)
    XKLBDM_DISPLAY = Column(String(255), nullable=True)
    一级学科 = Column(String(255), nullable=True)
    YJXKDM_DISPLAY = Column(String(255), nullable=True)
    二级学科 = Column(String(255), nullable=True)
    EJXKDM_DISPLAY = Column(String(255), nullable=True)
    is_academician = Column(Boolean, nullable=True)


class PapersTeachersRelationship(Base):
    __tablename__ = "papers_teachers_relationship"
    paper_id = Column(String(255), primary_key=True)
    JZGBH = Column(String(255), primary_key=True)
    # XKLBDM_DISPLAY = Column(String(255))
    # 定义外键
    __table_args__ = (
        db.ForeignKeyConstraint(["paper_id"], ["papers.paper_id"]),
        db.ForeignKeyConstraint(["JZGBH"], ["teachers.JZGBH"]),
    )


# 定义 Publications 模型类
class Publications(Base):
    __tablename__ = "publications"
    publication_id = Column(String(255), primary_key=True)
    Book_Name = Column(String(255))
    Category = Column(String(255))
    Publisher_Name = Column(String(255))
    Publish_Date = Column(String(255))
    ZS = Column(Float)
    YEAR = Column(Integer)


# 定义 Patents 模型类
class Patents(Base):
    __tablename__ = "patents"
    patent_id = Column(String(255), primary_key=True)
    Patents_NAME = Column(String(255))
    Category = Column(String(255))
    IS_INTERNATIONAL_PATENT = Column(Boolean)
    YEAR = Column(Integer)


# 定义 Awards 模型类
class Awards(Base):
    __tablename__ = "awards"
    award_id = Column(String(255), primary_key=True)
    award_name = Column(String(255))
    project_name = Column(String(255))
    YEAR = Column(Integer)
    awaed_level = Column(String(255))
    HJJBDM = Column(String(255))
    establishment = Column(String(255))
    HJJB = Column(String(255))


# 定义 Projects 模型类
class Projects(Base):
    __tablename__ = "projects"
    project_id = Column(String(255), primary_key=True)
    project_name = Column(String(255))
    project_ESTABLISH_date = Column(String(255))
    XMJBDM = Column(String(255))
    by01 = Column(String(255))
    by02 = Column(String(255))
    by03 = Column(String(255))
    is_vertical_project = Column(Boolean)
    YEAR = Column(Integer)
    HTJF = Column(Float)


# 定义 PublicationAuthorRelationship 模型类
class PublicationsTeachersRelationship(Base):
    __tablename__ = "publications_teachers_Relationship"
    publication_id = Column(String(255), primary_key=True)
    JZGBH = Column(Integer, primary_key=True)

    # 定义外键
    __table_args__ = (
        db.ForeignKeyConstraint(["publication_id"], ["publications.publication_id"]),
        db.ForeignKeyConstraint(["JZGBH"], ["teachers.JZGBH"]),
    )


# 定义 PatentsTeachersRelationship 模型类
class PatentsTeachersRelationship(Base):
    __tablename__ = "Patents_teachers_Relationship"
    patent_id = Column(String(255), primary_key=True)
    JZGBH = Column(Integer, primary_key=True)

    # 定义外键
    __table_args__ = (
        db.ForeignKeyConstraint(["patent_id"], ["patents.patent_id"]),
        db.ForeignKeyConstraint(["JZGBH"], ["teachers.JZGBH"]),
    )


# 定义 AwardsTeachersRelationship 模型类
class AwardsTeachersRelationship(Base):
    __tablename__ = "awards_teachers_Relationship"
    award_id = Column(String(255), primary_key=True)
    JZGBH = Column(Integer, primary_key=True)

    # 定义外键
    __table_args__ = (
        db.ForeignKeyConstraint(["award_id"], ["awards.award_id"]),
        db.ForeignKeyConstraint(["JZGBH"], ["teachers.JZGBH"]),
    )


# 定义 ProjectsTeachersRelationship 模型类
class ProjectsTeachersRelationship(Base):
    __tablename__ = "projects_teachers_Relationship"
    project_id = Column(String(255), primary_key=True)
    JZGBH = Column(Integer, primary_key=True)

    # 定义外键
    __table_args__ = (
        db.ForeignKeyConstraint(["project_id"], ["projects.project_id"]),
        db.ForeignKeyConstraint(["JZGBH"], ["teachers.JZGBH"]),
    )
