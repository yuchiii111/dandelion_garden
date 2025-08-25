import * as THREE from 'three';



const highlightEdge = (discipline, lineSegmentsByTypes) => {
  lineSegmentsByTypes.children.forEach(line => {
      if (line instanceof THREE.LineSegments && line.userData && line.userData.type) {
          if (line.userData.type === discipline) {
              console.log(line);
              const material = line.material;
              if (material && material.color) {
                console.log(material)
                //   if (material.originalColor) {
                    console.log(1)
                      const geometry = line.geometry;
                      const colors = geometry.attributes.color.array;
                      for (let i = 0; i < colors.length; i += 6) {
                          colors[i] = colors[i] * 10;
                          colors[i + 1] = colors[i + 1] * 10;
                          colors[i + 2] = colors[i + 2] * 10;
                          colors[i + 3] =colors[i + 3] * 10 ;
                          colors[i + 4] = colors[i + 4] * 10;
                          colors[i + 5] = colors[i + 5] * 10;
                      }
                      geometry.attributes.color.needsUpdate = true;
                    //   delete material.originalColor;
                //   }
                  // Restore original opacity
                  // material.opacity = 0.025; // Set back to fully opaque
              }

          }
      }
  });
}



export default highlightEdge;