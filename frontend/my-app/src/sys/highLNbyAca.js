import * as THREE from 'three';
// import highlightEdge from './highlightEdge';

const highlightNbyAca= ( nodeGeo, network, originalColors, line, scene) => {

    const indexToId1 = new Map();    
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

export default highlightNbyAca;