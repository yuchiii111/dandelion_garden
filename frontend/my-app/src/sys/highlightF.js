import * as THREE from 'three';
import { getColorByGenre } from './getcolorbyx';


const highlightFlower = (discipline, network) => {
  const color = new THREE.Color(); 
    network.forEach(node => {
          if (node.flower) {
            node.flower.traverse(child => {
              if (child.userData.resultTooltip) {
                const material = child.material;
                if(child.userData.resultTooltip.type===discipline)
                {
                    if (child.material.originalColor) {
                        if(child.material.color) {
                        child.material.color.copy(child.material.originalColor);
                        if (child.userData.bloom)
                        {child.layers.set(1);
                        child.material.emissiveIntensity=0.3;}
                        } else {
                        child.material.uniforms.color.value.copy(child.material.originalColor);
                        }
                        delete child.material.originalColor;
                    }
                } 
              }
              if(child instanceof THREE.InstancedMesh){
                const userData = child.userData[0];
                const material = child.material;
                // console.log(userData);
                // console.log(child); 
                if (userData && userData.resultTooltip && userData.resultTooltip.type === discipline) {
                  color.set(getColorByGenre(discipline));
                  for (let i = 0; i < child.count; i++) {
                    // child.getColorAt(i, originalColor);
                    // console.log(originalColor)
                    child.setColorAt(i, color);   
                   
                  }
                  material.emissiveIntensity = 0.3;
                  child.layers.set(1); 
                  child.instanceColor.needsUpdate = true;
                }
              }
            });
          }
      });
}

export default highlightFlower;