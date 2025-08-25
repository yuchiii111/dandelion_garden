import base64, math, random


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
        if year_max == year_min:
            start_phi = 0.5 * math.pi
        else:
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


def get_related_entities(relationship_model, entity_model, jzgbh, entity_field):
    ids = [
        getattr(rel, entity_field)
        for rel in relationship_model.query.filter_by(JZGBH=jzgbh).all()
    ]
    entities = entity_model.query.filter(
        getattr(entity_model, entity_field).in_(ids)
    ).all()
    return entities


def process_entities_lineposition(
    entities, entity_type, combined_list, Teacher_dandelion_json
):
    for entity in entities:
        if entity.YEAR is not None:
            for item in combined_list:
                if item[0] == entity.YEAR and not item[2]:
                    lineposition = {
                        "x": item[1][0],
                        "y": item[1][1],
                        "z": item[1][2],
                    }
                    item[2] = True
                    break
        else:
            lineposition = {
                "x": 0,
                "y": 0,
                "z": 0,
            }

        entity_data = {
            f"{entity_type[:-1]}_id": getattr(entity, f"{entity_type[:-1]}_id"),
            "lineposition": lineposition,
        }

        if entity_type == "papers":
            if entity.CITEDTIMES is None or entity.CITEDTIMES < 3:
                entity_data["acreage"] = 1
            elif entity.CITEDTIMES < 10:
                entity_data["acreage"] = 2
            elif entity.CITEDTIMES < 50:
                entity_data["acreage"] = 3
            else:
                entity_data["acreage"] = 4
            if entity.PAPER_CLASS == "期刊论文":
                entity_data["model"] = 1
            elif entity.PAPER_CLASS == "会议论文":
                entity_data["model"] = 2
        elif entity_type == "patents":
            if entity.IS_INTERNATIONAL_PATENT == "0":
                entity_data["acreage"] = 1
            else:
                entity_data["acreage"] = 2
            if entity.Category == "发明":
                entity_data["model"] = 1
            elif entity.Category == "实用新型":
                entity_data["model"] = 2
            elif entity.Category == "外观设计":
                entity_data["model"] = 3
        elif entity_type == "projects":
            if entity.HTJF < 10000:
                entity_data["acreage"] = 1
            elif entity.HTJF < 100000:
                entity_data["acreage"] = 2
            elif entity.HTJF < 1000000:
                entity_data["acreage"] = 3
            elif entity.HTJF < 10000000:
                entity_data["acreage"] = 4
            else:
                entity_data["acreage"] = 5
            if entity.is_vertical_project:
                entity_data["model"] = 1
            else:
                entity_data["model"] = 2
        elif entity_type == "awards":
            if entity.awaed_level == "其他":
                entity_data["acreage"] = 1
            elif entity.awaed_level == "三等奖":
                entity_data["acreage"] = 2
            elif entity.awaed_level == "二等奖":
                entity_data["acreage"] = 3
            elif entity.awaed_level == "一等奖":
                entity_data["acreage"] = 4
            elif entity.awaed_level == "特等奖":
                entity_data["acreage"] = 5
            # 省部级协会奖其他国家级人物奖
            if entity.HJJB == "省部级":
                entity_data["model"] = 1
            elif entity.HJJB == "国家级":
                entity_data["model"] = 2
            elif entity.HJJB == "人物奖":
                entity_data["model"] = 3
            elif entity.HJJB == "协会奖":
                entity_data["model"] = 4
            else:
                entity_data["model"] = 5
        elif entity_type == "publications":
            entity_data["Category"] = entity.Category
            # 专著，编著，教材，译著，作品集，习题集，工具书、词典，其他
            if entity.Category == "专著":
                entity_data["model"] = 1
            elif entity.Category == "编著":
                entity_data["model"] = 2
            elif entity.Category == "教材":
                entity_data["model"] = 3
            elif entity.Category == "译著":
                entity_data["model"] = 4
            elif entity.Category == "作品集":
                entity_data["model"] = 5
            elif entity.Category == "习题集":
                entity_data["model"] = 6
            elif entity.Category == "工具书、词典":
                entity_data["model"] = 7
            else:
                entity_data["model"] = 9  # 其他
        Teacher_dandelion_json[entity_type].append(entity_data)
