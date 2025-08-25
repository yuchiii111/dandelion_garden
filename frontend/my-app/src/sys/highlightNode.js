import * as THREE from 'three';
import highlightEdge from './highlightEdge';

const highlightNode = ( nodeGeo, network, edgeGeo, originalColors, line, scene) => {
    highlightEdge('project', edgeGeo);
    highlightEdge('award', edgeGeo);
    highlightEdge('publication', edgeGeo);
    highlightEdge('paper', edgeGeo);
    highlightEdge('None', edgeGeo);
    highlightEdge('patent', edgeGeo);
    const indexToId1 = new Map();     // 创建一个 Map 来存储 id 到索引的映射
    network.forEach((node, index) => {
        if (!Number.isNaN(node.x) && !Number.isNaN(node.y)) {
          indexToId1.set(node.id, index);
        }
    });

    network.forEach(node => {
        const index = indexToId1.get(node.id);
        const originalColor = originalColors.get(index);
        if (originalColor) {
            if (index !== undefined) {
                nodeGeo.setColorAt(index, originalColor);
            }
        }
    });
    nodeGeo.instanceColor.needsUpdate = true;
    line.material.dispose();
    line.geometry.dispose();

    scene.remove( line );
  
    
}

export default highlightNode;