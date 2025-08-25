import * as THREE from 'three';

const highlightFbyYear = (year, network) => {
    network.forEach(node => {
          if (node.flower) {
            node.flower.traverse(child => {
              if (child.userData.resultTooltip) {
                const material = child.material;
                if(child.userData.resultTooltip.year===year)
                {
                    // console.log(child.userData);
                    if (child.material.originalColor) {
                      
                        if(child.material.color) {
                            child.material.color.copy(child.material.originalColor);
                            if (child.userData.bloom)
                            {
                                // console.log(child.userData);
                                child.layers.set(1);
                                child.material.emissiveIntensity=0.3;
                            } else{
                                // console.log(1);
                            };
                        } else {
                            child.material.uniforms.color.value.copy(child.material.originalColor);
                        }
                        // material.needsUpdate = true;
                        delete child.material.originalColor;
                        material.needsUpdate = true;
                        console.log(child.material.originalColor)
                    }
                } 
              }
            });
          }
      });
}

export default highlightFbyYear;