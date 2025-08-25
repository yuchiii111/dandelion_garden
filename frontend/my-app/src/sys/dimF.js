import * as THREE from 'three';



const dimFlower = (discipline, network) => {
  // console.log(discipline)
  // console.log(network)
  const originalColor = new THREE.Color();
    network.forEach(node => {
          if (node.flower) {
            // console.log(node.flower)
            node.flower.traverse(child => {
              if (child.userData.resultTooltip) {
                const material = child.material;
                if(child.userData.resultTooltip.type===discipline)
                {
                if (!material.originalColor) {
                  if(material.color)
                  {
                    // console.log('2')       
                    material.originalColor = material.color.clone();
                    material.color.multiplyScalar(0.1);
                    if (child.userData.bloom)
                    {child.layers.set(0);
                    material.emissiveIntensity=0.05;}
                  } else {
                    // console.log(child)
                    // console.log(material)                     
                    child.layers.set(0);
                    material.originalColor = material.uniforms.color.value.clone();
                    material.uniforms.color.value.multiplyScalar(0.25);
                    // material.uniforms.globalOpacity.value=0.3;
                    material.needsUpdate = true;
                  }
                }}
              }
              if(child instanceof THREE.InstancedMesh){
                const userData = child.userData[0];
                
                // console.log(userData);
                // console.log(child); 
                if (userData && userData.resultTooltip && userData.resultTooltip.type === discipline) {
                  const material = child.material;
                  for (let i = 0; i < child.count; i++) {
                    child.getColorAt(i, originalColor);
                    // console.log(originalColor)
                    child.setColorAt(i, originalColor.multiplyScalar(0.1));   
                   
                  }
                  material.emissiveIntensity = 0.05;
                  child.layers.set(0); 
                  child.instanceColor.needsUpdate = true;
                }
              }
            });
 
          }
      });

}

export default dimFlower;