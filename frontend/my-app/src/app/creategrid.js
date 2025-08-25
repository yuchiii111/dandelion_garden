import * as THREE from 'three';

export const createGrid = () => {
    const gridSize = 4000; 
    const gridSpacing = 35; 
    
    const vertices = [];
    const colors = [];

    // 创建网格线
    for (let i = 0; i <= gridSize; i += gridSpacing) {
        // 水平线
        vertices.push(-(gridSize / 2), 0, i - (gridSize / 2));
        vertices.push(gridSize / 2, 0, i - (gridSize / 2));
        // 垂直线
        vertices.push(i - (gridSize / 2), 0, -(gridSize / 2));
        vertices.push(i - (gridSize / 2), 0, gridSize / 2);
    }

    // 创建颜色数组，用于设置线条颜色
    const gridMaterial = new THREE.LineBasicMaterial({
      color: 0xcdfbe8, // 单一颜色
      transparent: true,
      opacity: 0.01
  });

  // 创建缓冲几何体
  const gridGeometry = new THREE.BufferGeometry();
  gridGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

  // 使用 LineSegments 代替 Mesh
  const grid = new THREE.LineSegments(gridGeometry, gridMaterial);
  grid.rotation.x = -Math.PI / 2; 
  grid.position.set(0, 0, -3);  
  
    // scene.add(grid);
  
    const gridHelper = new THREE.GridHelper(gridSize, gridSize / gridSpacing, 0xcdfbe8, 0xcdfbe8);
    gridHelper.rotation.x = -Math.PI / 2; 
    gridHelper.position.set(0, 0, -3); 
    return {grid: grid, gridHelper: gridHelper};
    // const gridSize = 10000; 
    // const gridSpacing = 100; 
    // const gridHelper = new THREE.GridHelper(gridSize, gridSpacing);

    // gridHelper.position.set(0, 0, 0);

    // scene.add(gridHelper);
}