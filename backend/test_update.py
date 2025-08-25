import subprocess

# 定义脚本路径
scripts = [
    "backend/network_generator.py",
    "backend/test_layout.R",
    "backend/graphml_to_json.py",
]

# 定义R脚本运行命令
r_script_command = "D:\\Program Files\\R\\R-4.4.1\\bin\\Rscript"

# 运行脚本并报告状态
for i, script in enumerate(scripts, start=1):
    try:
        if script.endswith(".py"):  # Python 脚本
            subprocess.run(["python", script], check=True)
        elif script.endswith(".R"):  # R 脚本
            subprocess.run([r_script_command, script], check=True)
        print(f"步骤 {i} ({script}) 成功")
    except subprocess.CalledProcessError:
        print(f"步骤 {i} ({script}) 失败")
        break  # 如果任何脚本失败，停止执行后续脚本
