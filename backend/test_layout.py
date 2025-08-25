import igraph as ig
import matplotlib.pyplot as plt

# 读取GraphML文件
g = ig.read("backend/static/co_author_network_paper_2.graphml", format="graphml")
# 使用igraph的布局算法计算节点位置
# layout_with_graphopt 在 Python 的 igraph 中对应为 layout_graphopt
layout = g.layout_graphopt()

# 将修改后的图对象保存回GraphML格式的文件
g.write_graphml("backend/static/co_author_network_paper_graphpot.graphml")
# 绘制图形
ig.plot(g, layout=layout, bbox=(0, 0, 800, 800), margin=50)

plt.axis("off")  # 不显示坐标轴
plt.show()
