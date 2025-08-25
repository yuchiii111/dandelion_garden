import * as THREE from 'three';
import { getColorByGenre } from './getcolorbyx';

let createdGeos = [];
const updateFlowersByYear = (year, network, scene) => {
    let count = 0;
    let instanceIndex = 0;
    network.forEach(node => {
      if (node.flower) {
        node.flower.traverse(child => {
          if(child instanceof THREE.InstancedMesh){
            for (let i = 0; i < child.count; i++) {
              const userData = child.userData[i];
              if (userData && userData.resultTooltip && userData.resultTooltip.year === year) {
                count++;
            }}
      }})}
    })
    const sphere1Material = new THREE.MeshPhongMaterial({ 
      color: 0xffffff,
      emissive: 0xffffff,
      emissiveIntensity: 0.3,
      wireframe: false,
      transparent: true,
      side:THREE.BackSide
    });
    const sphere1Geometry = new THREE.SphereGeometry(0.7, 12, 12);
    const instancedMesh = new THREE.InstancedMesh(sphere1Geometry, sphere1Material, count);
    const matrix = new THREE.Matrix4();
    const color11 = new THREE.Color(); 
    network.forEach(node => {
      if (node.flower) {
        node.flower.traverse(child => {
          if (child.userData.resultTooltip) {
            const material = child.material;
            const isDimmed = child.userData.resultTooltip.year !== year;
            
            // Dim logic
            if (isDimmed) {
            if(!material.originalColor){
              if (material.color) {

                  material.originalColor = material.color.clone();
                  material.color.multiplyScalar(0.1);
                  if (child.userData.bloom) {
                    console.log(child.userData.resultTooltip.year)
                    child.layers.set(0);
                    material.emissiveIntensity = 0.05;
                  }
                
              } else if (material.uniforms && material.uniforms.color) {
                  material.originalColor = material.uniforms.color.value.clone();
                  material.uniforms.color.value.multiplyScalar(0.25);
                  child.layers.set(0);
                  material.needsUpdate = true; // 确保更新
                
              
              }}
            }}
            if(child instanceof THREE.InstancedMesh){
              const originalColor = new THREE.Color(); 
              for (let i = 0; i < child.count; i++) {
                const userData = child.userData[i];
                if (userData && userData.resultTooltip) {
                  child.getColorAt(i, originalColor);
                  // userData.originalColor = originalColor.clone();
                  child.setColorAt(i, originalColor.multiplyScalar(0.1)); 
                  child.instanceColor.needsUpdate = true;  
                  if(userData.resultTooltip.year === year){
                    matrix.compose(
                      userData.node.location, 
                      new THREE.Quaternion(),             
                      new THREE.Vector3(userData.node.scale, userData.node.scale, userData.node.scale) 
                    );
                    
                    instancedMesh.setMatrixAt(instanceIndex, matrix);
                    color11.set( getColorByGenre(userData.resultTooltip.type));
                    instancedMesh.setColorAt(instanceIndex, color11);
                    instanceIndex++;
                  }
                }
              }  
              child.material.emissiveIntensity = 0.05;                
              child.layers.set(0); 
              
            } 
            // Highlight logic
            // else {
            //   if (material.originalColor) {
            //     if (material.color) {
            //       // 普通材料恢复
            //       material.color.copy(material.originalColor);
            //       if (child.userData.bloom) {
            //         console.log(1)
            //         material.emissiveIntensity = 0.3;
            //         child.layers.set(1);
            //         child.layers.needsUpdate=true;
            //       }
            //       delete material.originalColor; // 清理状态
            //       material.needsUpdate = true; // 确保更新
            //     } else {
            //       material.uniforms.color.value.copy(material.originalColor);
            //       delete material.originalColor; // 清理状态
            //       material.needsUpdate = true; // 确保更新
            //     }
            //   }
            // }
          
        });
      }
    });
    instancedMesh.layers.set(1);
    instancedMesh.instanceMatrix.needsUpdate = true;
    scene.add(instancedMesh);
    createdGeos.push(instancedMesh);
  };
  
  const clearState = (network, scene) => {
    console.log(createdGeos);
    while (createdGeos.length > 0) {
      const geo = createdGeos.pop();
      if (scene && geo) {
        geo.material.dispose();
        geo.geometry.dispose();
        scene.remove(geo);
      }
    }
    network.forEach(node => {
      if (node.flower) {
        node.flower.traverse(child => {
          const material = child.material;
          if (material&&material.originalColor) {
            if (material.color) {
              material.color.copy(material.originalColor);
              if (child.userData.bloom) {
                child.layers.set(1);
                material.emissiveIntensity = 0.3;
                // child.layers.needsUpdate=true;
              }
            } else {

                if (child.userData.bloom) {
                    console.log(1)
                    child.layers.set(1);
                    material.emissiveIntensity = 0.3;
                    // child.layers.needsUpdate=true;
                  }                material.uniforms.color.value.copy(material.originalColor);
            }
            delete material.originalColor; // 重置状态
          }
          if(child instanceof THREE.InstancedMesh){
            const userData = child.userData[0];
            const material = child.material;
            const color = new THREE.Color();
            if (userData && userData.resultTooltip) {
              color.set(getColorByGenre(userData.resultTooltip.type));
              for (let i = 0; i < child.count; i++) {
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
  };

  const clearGeoState = ( scene ) => {
    while (createdGeos.length > 0) {
      const geo = createdGeos.pop();
      if (scene && geo) {
        geo.material.dispose();
        geo.geometry.dispose();
        scene.remove(geo);
      }
    }
  }

export {updateFlowersByYear, clearState, clearGeoState};
