import * as THREE from 'three';
import { mapNodeToScreen } from '../sys/mnts';
import { getColorByType } from '../sys/getcolorbytype'

export function createEdgeGeometry({nodes_3D, edges_3D, edgesUpdate}) {
    // const linesByDiscipline = {};
    // var lineptct = 0;
    // const lineGroup = new THREE.Group();
    // const lines = new THREE.BufferGeometry();
    const linesByType = {
      paper: { indices: [], positions: [], colors: [] },
      patent: { indices: [], positions: [], colors: [] },
      award: { indices: [], positions: [], colors: [] },
      publication: { indices: [], positions: [], colors: [] },
      project: { indices: [], positions: [], colors: [] },
      // None: { indices: [], positions: [], colors: [] }
    };
    // const linesByType = {};
    const lineMaterial = new THREE.LineBasicMaterial({
      // color: 0xFFFFFF,
      // linewidth: 10,
      transparent: true,
      opacity: 0.01,
      vertexColors: true,  
      depthWrite: false,
      depthTest: false
    });
    // const uniqueEdgeTypes = new Set();
    // edges_3D.forEach(edge => {
    //     edge.type.forEach(type => uniqueEdgeTypes.add(type));
    // });

    // // 初始化 linesByType 对象
    // uniqueEdgeTypes.forEach(type => {
    //     linesByType[type] = { indices: [], positions: [], colors: [] };
    // });
    // console.log(uniqueEdgeTypes)
    const colorMap = {};
    for (const node of nodes_3D) {
        colorMap[node.discipline] = new THREE.Color(getColorByType(node.discipline));
    }

    const nodes = nodes_3D.reduce((acc, node) => {
      acc[node.id] = node;
      return acc;
    }, {});
    for (const edge of edges_3D) {
      if(edge.weight>1){
      const sourcePos = nodes[edge.source];
      const targetPos = nodes[edge.target];
      if (sourcePos && targetPos) {
        const stype = sourcePos.discipline;
        const ttype = targetPos.discipline;
        const c = stype !== ttype ? new THREE.Color(0xFFFFFF) : colorMap[stype];
        for (const type of edge.type) {
          const lineData = linesByType[type];
          if (lineData) {
              const sp = mapNodeToScreen(sourcePos);
              const tp = mapNodeToScreen(targetPos);

              const index = lineData.positions.length / 3;
              lineData.positions.push(sp.x, sp.y, sp.z - 0.1, tp.x, tp.y, tp.z - 0.1);
              lineData.colors.push(c.r, c.g, c.b, c.r, c.g, c.b);
              lineData.indices.push(index , index + 1);
          }
      }
      }}
    }
    // const lineSegmentsByDiscipline = {};
    const lineSegmentsByTypes = new THREE.Group();
    for (const [type, data] of Object.entries(linesByType)) {
        const geometry = new THREE.BufferGeometry();
        geometry.setIndex(new THREE.BufferAttribute(new Uint32Array(data.indices), 1));
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(data.positions, 3));
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(data.colors, 3));
        geometry.computeBoundingSphere();
        const line = new THREE.LineSegments(geometry, lineMaterial);
        line.userData.type = type;
        line.layers.set(0);
        lineSegmentsByTypes.add(line);
        // lineSegmentsByDiscipline[discipline] = new THREE.LineSegments(geometry, lineMaterial);
        // lineSegmentsByDiscipline[discipline].layers.set(0);
    }
 
    edgesUpdate.current = edges_3D;
    return lineSegmentsByTypes;
}