import json
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
from routes.tools import (
    generate_lineposition,
    get_related_entities,
    process_entities_lineposition,
)
from config import db, app


def generate_teacher_dandelion_json(teacher):
    jzgbh = teacher.JZGBH
    entity_types = ["papers", "patents", "projects", "awards", "publications"]
    papers = get_related_entities(PapersTeachersRelationship, Papers, jzgbh, "paper_id")
    patents = get_related_entities(
        PatentsTeachersRelationship, Patents, jzgbh, "patent_id"
    )
    projects = get_related_entities(
        ProjectsTeachersRelationship, Projects, jzgbh, "project_id"
    )
    awards = get_related_entities(AwardsTeachersRelationship, Awards, jzgbh, "award_id")
    publications = get_related_entities(
        PublicationsTeachersRelationship, Publications, jzgbh, "publication_id"
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
            if entity.YEAR is not None:
                all_years.append(entity.YEAR)
    if all_years:
        if min(all_years) == max(all_years):
            print("all_years", all_years)
            print(teacher.JZGBH)
        else:
            all_years = sorted(all_years)
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
        Teacher_dandelion_json["teacher"][f"{entity_type}_count"] = len(
            Teacher_dandelion_json[entity_type]
        )
    return Teacher_dandelion_json


def main():
    all_teachers = Teacher.query.all()
    all_teachers_json = [
        generate_teacher_dandelion_json(teacher) for teacher in all_teachers
    ]

    with open("all_teachers.json", "w", encoding="utf-8") as f:
        json.dump(all_teachers_json, f, ensure_ascii=False, indent=4)


if __name__ == "__main__":
    with app.app_context():
        main()
