import * as THREE from 'three';
import dimEdge from './dimEdge';
import Acadefetch from '../app/loadAca';
import { mapNodeToScreen } from './mnts';
import { getColorByType } from './getcolorbytype'
const dimN = (network, nodeGeo, edges, edgeGeo, node_id, callback) => {

    const indexToId1 = new Map();

    network.forEach((node, index) => {
        if (!Number.isNaN(node.x) && !Number.isNaN(node.y)) {
          indexToId1.set(node.id, index);
        }
    });
    const colorMap = {};
    for (const node of network) {
        colorMap[node.discipline] = new THREE.Color(getColorByType(node.discipline));
    }
    const nodes = network.reduce((acc, node) => {
      acc[node.id] = node;
      return acc;
    }, {});
    
    const fetchPromises = network.filter(node => node.id===node_id).map(node =>
      new Promise(resolve => {
          Acadefetch(node.id, tooltipdata => {
              resolve({ id: node.id, collaborators: tooltipdata.collaborators });
          });
      })
  );

  Promise.all(fetchPromises).then(queue_2 => {
    dimEdge('project', edgeGeo);
    dimEdge('award', edgeGeo);
    dimEdge('publication', edgeGeo);
    dimEdge('paper', edgeGeo);
    dimEdge('None', edgeGeo);
    dimEdge('patent', edgeGeo);
    const originalColors = new Map();
    network.forEach(node => {
      const index = indexToId1.get(node.id);
      const originalColor = new THREE.Color();

      nodeGeo.getColorAt(index, originalColor);
      originalColors.set(index, originalColor.clone());
      const isInCollaborators1 = queue_2.some(q2Node => q2Node.id === node.id);
        if (isInCollaborators1) {
        } else {
            const color = originalColors.get(index).clone();
            const isInCollaborators = queue_2.some(q2Node => q2Node.collaborators.includes(node.id));
            if (isInCollaborators) {
                nodeGeo.setColorAt(index, color.multiplyScalar(0.7));
            } else {

                nodeGeo.setColorAt(index, color.multiplyScalar(0.1));
            }
        }
    })
    nodeGeo.instanceColor.needsUpdate = true;
    const lineData = { indices: [], positions: [], colors: [] };
    queue_2.forEach(q2Node => {
      q2Node.collaborators.forEach(collaboratorId => {
        const sourcePos = nodes[q2Node.id];
        const targetPos = nodes[collaboratorId];
        if (sourcePos && targetPos) {
          const stype = sourcePos.discipline;
          const ttype = targetPos.discipline;
          const c = stype !== ttype ? new THREE.Color(0xFFFFFF) : colorMap[stype];
          const sp = mapNodeToScreen(sourcePos);
          const tp = mapNodeToScreen(targetPos);

          const index = lineData.positions.length / 3;
          lineData.positions.push(sp.x, sp.y, sp.z - 0.1, tp.x, tp.y, tp.z - 0.1);
          lineData.colors.push(c.r, c.g, c.b, c.r, c.g, c.b);
          lineData.indices.push(index , index + 1);
          
        
        }
      });
  });
  const lineMaterial = new THREE.LineBasicMaterial({
    color: 0xFFFFFF,
    linewidth: 10,
    transparent: true,
    opacity: 0.4,
    vertexColors: true  
  });
  const geometry = new THREE.BufferGeometry();
  geometry.setIndex(new THREE.BufferAttribute(new Uint32Array(lineData.indices), 1));
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(lineData.positions, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(lineData.colors, 3));
  const line = new THREE.LineSegments(geometry, lineMaterial);
  line.layers.set(0);
  callback(line, originalColors);
});
}

export default dimN;