import * as THREE from 'three';

export const toggleHighlight = (flowerGroup) => {
    // 切换花的材质颜色以高亮显示
    const currentColor = flowerGroup.material.color.getHex();
    const isHighlighted = (currentColor !== 0xff0000); // 假设非高亮颜色不是红色
  
    if (isHighlighted) {
      // 如果当前是高亮状态，则恢复原始颜色
      flowerGroup.material.emissive.setHex(flowerGroup.userData.originalColor);
    } else {
      // 如果当前不是高亮状态，则设置为高亮颜色
      flowerGroup.material.emissive.setHex(0xff0000); // 高亮颜色为红色
      flowerGroup.userData.originalColor = currentColor; // 保存原始颜色
    }
  
    // 更新花的渲染状态
    flowerGroup.renderOrder = isHighlighted ? 1 : 0; // 确保高亮的花在前面渲染
  };