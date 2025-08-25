import redis
import json
from flask import Flask
from sqlalchemy.orm import aliased
from sqlalchemy import func
from pypinyin import lazy_pinyin, Style
from config import db, app
from routes.tools import (
    revert_perturbation_with_factor,
    generate_lineposition,
    get_related_entities,
    process_entities_lineposition,
)
from models import (
    Teacher,
    Papers,
    Patents,
    Projects,
    Awards,
    Publications,
    PapersTeachersRelationship,
    PatentsTeachersRelationship,
    ProjectsTeachersRelationship,
    AwardsTeachersRelationship,
    PublicationsTeachersRelationship,
)

# 配置 Redis 连接
try:
    redis_client = redis.Redis(host="localhost", port=6379, db=0)
except redis.ConnectionError as e:
    print(f"Redis connection error: {e}")
    exit(1)


def get_yearly_count(
    relationship_query, entity_model, entity_id_field, year_field, entity_id_attr
):
    entity_alias = aliased(entity_model)
    results = (
        relationship_query.join(
            entity_alias, getattr(entity_alias, entity_id_attr) == entity_id_field
        )
        .with_entities(
            getattr(entity_alias, year_field).label("year"),
            func.count().label("count"),
        )
        .group_by("year")
        .all()
    )
    return {
        int(result.year): result.count for result in results if result.year is not None
    }


def get_pinyin_name(chinese_name):
    pinyin_list = lazy_pinyin(chinese_name, style=Style.NORMAL)
    return " ".join([word.capitalize() for word in pinyin_list])


def generate_teacher_summary(teacher):
    jzgbh = teacher.JZGBH

    papers_yearly_count = get_yearly_count(
        PapersTeachersRelationship.query.filter_by(JZGBH=jzgbh),
        Papers,
        PapersTeachersRelationship.paper_id,
        "YEAR",
        "paper_id",
    )
    patents_yearly_count = get_yearly_count(
        PatentsTeachersRelationship.query.filter_by(JZGBH=jzgbh),
        Patents,
        PatentsTeachersRelationship.patent_id,
        "YEAR",
        "patent_id",
    )
    projects_yearly_count = get_yearly_count(
        ProjectsTeachersRelationship.query.filter_by(JZGBH=jzgbh),
        Projects,
        ProjectsTeachersRelationship.project_id,
        "YEAR",
        "project_id",
    )
    awards_yearly_count = get_yearly_count(
        AwardsTeachersRelationship.query.filter_by(JZGBH=jzgbh),
        Awards,
        AwardsTeachersRelationship.award_id,
        "YEAR",
        "award_id",
    )
    publications_yearly_count = get_yearly_count(
        PublicationsTeachersRelationship.query.filter_by(JZGBH=jzgbh),
        Publications,
        PublicationsTeachersRelationship.publication_id,
        "YEAR",
        "publication_id",
    )

    total_papers = sum(papers_yearly_count.values())
    total_patents = sum(patents_yearly_count.values())
    total_projects = sum(projects_yearly_count.values())
    total_awards = sum(awards_yearly_count.values())
    total_publications = sum(publications_yearly_count.values())

    summary_json = {
        "teacher": {
            "techea_id": teacher.JZGBH,
            "name": teacher.NAME,
            "name_pinyin": get_pinyin_name(teacher.NAME),
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
            "papers": papers_yearly_count,
            "total_papers": total_papers,
            "patents": patents_yearly_count,
            "total_patents": total_patents,
            "projects": projects_yearly_count,
            "total_projects": total_projects,
            "awards": awards_yearly_count,
            "total_awards": total_awards,
            "publications": publications_yearly_count,
            "total_publications": total_publications,
        },
    }

    return summary_json


def generate_teacher_dandelion(teacher):
    jzgbh = teacher.JZGBH
    entity_types = ["papers", "patents", "projects", "awards", "publications"]
    papers = (
        Papers.query.join(
            PapersTeachersRelationship,
            Papers.paper_id == PapersTeachersRelationship.paper_id,
        )
        .filter(
            PapersTeachersRelationship.JZGBH == jzgbh,
            Papers.YEAR.isnot(None),
            Papers.YEAR != 0,
        )
        .with_entities(
            Papers.paper_id, Papers.CITEDTIMES, Papers.PAPER_CLASS, Papers.YEAR
        )
        .all()
    )

    patents = (
        Patents.query.join(
            PatentsTeachersRelationship,
            Patents.patent_id == PatentsTeachersRelationship.patent_id,
        )
        .filter(
            PatentsTeachersRelationship.JZGBH == jzgbh,
            Patents.YEAR.isnot(None),
            Patents.YEAR != 0,
        )
        .with_entities(
            Patents.patent_id,
            Patents.IS_INTERNATIONAL_PATENT,
            Patents.Category,
            Patents.YEAR,
        )
        .all()
    )

    projects = (
        Projects.query.join(
            ProjectsTeachersRelationship,
            Projects.project_id == ProjectsTeachersRelationship.project_id,
        )
        .filter(
            ProjectsTeachersRelationship.JZGBH == jzgbh,
            Projects.YEAR.isnot(None),
            Projects.YEAR != 0,
        )
        .with_entities(
            Projects.project_id,
            Projects.is_vertical_project,
            Projects.HTJF,
            Projects.YEAR,
        )
        .all()
    )

    awards = (
        Awards.query.join(
            AwardsTeachersRelationship,
            Awards.award_id == AwardsTeachersRelationship.award_id,
        )
        .filter(
            AwardsTeachersRelationship.JZGBH == jzgbh,
            Awards.YEAR.isnot(None),
            Awards.YEAR != 0,
        )
        .with_entities(Awards.award_id, Awards.awaed_level, Awards.HJJB, Awards.YEAR)
        .all()
    )

    publications = (
        Publications.query.join(
            PublicationsTeachersRelationship,
            Publications.publication_id
            == PublicationsTeachersRelationship.publication_id,
        )
        .filter(
            PublicationsTeachersRelationship.JZGBH == jzgbh,
            Publications.YEAR.isnot(None),
            Publications.YEAR != 0,
        )
        .with_entities(
            Publications.publication_id, Publications.Category, Publications.YEAR
        )
        .all()
    )

    entities_list = [papers, patents, projects, awards, publications]
    Teacher_dandelion_json = {
        "teacher": {
            "JZGBH": teacher.JZGBH,
            "NAME": teacher.NAME,
            "Discipline": teacher.XKLBDM_DISPLAY,
            "SEX": teacher.SEX,
            "papers_count": 0,
            "patents_count": 0,
            "projects_count": 0,
            "awards_count": 0,
            "publications_count": 0,
            "total_count": 0,
        },
        "papers": [],
        "patents": [],
        "projects": [],
        "awards": [],
        "publications": [],
    }

    all_years = []
    for entities in entities_list:
        for entity in entities:
            if entity.YEAR:
                all_years.append(entity.YEAR)
            else:
                print(f"Entity {entity} has no year.")
    all_years = sorted(all_years)
    if all_years:
        all_linepositions = generate_lineposition(all_years)
        assigned_flags = [False] * len(all_years)
        combined_list = [
            [year, position, flag]
            for year, position, flag in zip(
                all_years, all_linepositions, assigned_flags
            )
        ]
        for entity_type, entities in zip(entity_types, entities_list):
            process_entities_lineposition(
                entities, entity_type, combined_list, Teacher_dandelion_json
            )
    for entity_type in entity_types:
        count = len(Teacher_dandelion_json[entity_type])
        Teacher_dandelion_json["teacher"][f"{entity_type}_count"] = count
        Teacher_dandelion_json["teacher"]["total_count"] += count

    return Teacher_dandelion_json


def cache_teachers():
    teachers = Teacher.query.all()
    for teacher in teachers:
        jzgbh = teacher.JZGBH
        cache_key_summary = f"teacher_summary:{jzgbh}"
        cache_key_dandelion = f"teacher_dandelion:{jzgbh}"
        summary_json = generate_teacher_summary(teacher)
        dandelion_json = generate_teacher_dandelion(teacher)
        redis_client.setex(cache_key_summary, 3600 * 24 * 365, json.dumps(summary_json))
        redis_client.setex(
            cache_key_dandelion, 3600 * 24 * 365, json.dumps(dandelion_json)
        )


if __name__ == "__main__":
    with app.app_context():
        cache_teachers()
        print("Teacher summary and dandelion cache updated.")
