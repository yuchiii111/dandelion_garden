import * as THREE from 'three';



const dimEdge = (discipline, lineSegmentsByTypes) => {
  lineSegmentsByTypes.children.forEach(line => {
      if (line instanceof THREE.LineSegments && line.userData.type) {
        // console.log(line);
          // Check if the current line's type includes the discipline and if it's a unique type
          if (line.userData.type === discipline) {
            console.log(line);
            const material = line.material;
            if (material && material.color) {
              // Ensure original color is only saved once
              const geometry = line.geometry;
              const colors = geometry.attributes.color.array;
              if (!material.originalColor) {
                material.originalColor = new Float32Array(colors); 
              }
              
              for (let i = 0; i < colors.length; i += 6) {
                  colors[i] = colors[i] * 0.1;
                  colors[i + 1] = colors[i + 1] * 0.1;
                  colors[i + 2] = colors[i + 2] * 0.1;
                  colors[i + 3] = colors[i + 3] * 0.1;
                  colors[i + 4] = colors[i + 4] * 0.1;
                  colors[i + 5] = colors[i + 5] * 0.1;
              }
              geometry.attributes.color.needsUpdate = true;
              // material.opacity = 0.025;
          }
          }
      }
  });
}

export default dimEdge;