import * as THREE from 'three';
import { mapNodeToScreen } from '../sys/mnts';
import { getColorByType } from '../sys/getcolorbytype'

// export function createNodeGeometry({nodes_3D,nodesUpdate}) {
//     const positions = [];
//     const colors = [];
//     const publist = [];
//     nodes_3D.forEach(node => {
//     if (!Number.isNaN(node.x) && !Number.isNaN(node.y)) {
//         const mpt = mapNodeToScreen(node);
//         positions.push(new THREE.Vector3(mpt.x, mpt.y, 0));
//         const color = getColorByType(node.discipline);
//         colors.push(color);
//         publist.push(node.publication_count)
//     }
//     });

//     const baseRadius = 1; 
//     const scaleFactor = 10 / 1430; 

//     const pointGroup = new THREE.Group();
//     positions.forEach((pt, index) => {
//         const geometry = new THREE.CircleGeometry(1, 32, 32); 
//         const material = new THREE.MeshPhongMaterial({ color: colors[index] });
//         // const material = new THREE.MeshPhongMaterial({ color: colors[index] });
//         const sphere = new THREE.Mesh(geometry, material);
//         sphere.layers.set(0);

//         const scale = publist[index] * scaleFactor + baseRadius;
//         sphere.scale.set(scale, scale, scale);
        
//         sphere.position.set(...pt.toArray());
//         sphere.userData.tooltipText = nodes_3D[index];
//         nodes_3D[index].node = sphere;
//         pointGroup.add(sphere);
//         nodesUpdate.current = nodes_3D;
//     });
//     return pointGroup;
// };

// import * as THREE from 'three';
// import { mapNodeToScreen } from './sys/mnts';
// import { getColorByType } from './sys/getcolorbytype';

// const material = new THREE.ShaderMaterial({
//     vertexShader: `
//         attribute vec3 instancePosition;
//         attribute vec3 instanceColor;
//         attribute float instanceScale;
//         attribute float instanceId;
//         varying vec3 vColor;
//         varying float vId;
//         void main() {
//             vColor = instanceColor;
//             vId = instanceId;
//             vec3 pos = position * instanceScale;
//             gl_Position = projectionMatrix * modelViewMatrix * vec4(pos + instancePosition, 1.0);
//         }
//     `,
//     fragmentShader: `
//         varying vec3 vColor;
//         varying float vId;
//         uniform float highlightIds[256];
//         void main() {
//             vec3 color = vColor;
//             bool isHighlighted = false;
//             for (int i = 0; i < 256; i++) {
//                 if (highlightIds[i] == vId) {
//                     isHighlighted = true;
//                 }
//             }
//             if (isHighlighted) {
//                 color = vec3(1.0, 1.0, 0.0);
//             }
//             gl_FragColor = vec4(color, 1.0);
//         }
//     `,
//     side: THREE.DoubleSide,
//     uniforms: {
//         highlightIds: { value: new Float32Array(256).fill(-1) } // Default value
//     }
// });

function createNodeGeometry({ nodes_3D, nodesUpdate}) {
    const positions = [];
    const colors = [];
    const scales = [];
    const ids = [];
    const highlightIds = []; // 默认情况下，不设置特定的高亮 ID
    // const highlightArray = new Float32Array(nodes_3D.length);
    // highlightArray.fill(1.0); // 默认全高亮
    const count = nodes_3D.length;
    const geometry = new THREE.CircleGeometry(1, 32);
    const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const instancedMesh = new THREE.InstancedMesh(geometry, material, count);
    // nodes_3D.forEach((node, index) => {
    //     if (!Number.isNaN(node.x) && !Number.isNaN(node.y)) {
    //         const mpt = mapNodeToScreen(node);
    //         positions.push(mpt.x, mpt.y, 0);
            
    //         // Convert color from hex to [0, 1] range
    //         const color = getColorByType(node.discipline);
    //         colors.push(
    //             ((color >> 16) & 0xff) / 255,  // Red
    //             ((color >> 8) & 0xff) / 255,   // Green
    //             (color & 0xff) / 255           // Blue
    //         );
            
    //         scales.push(node.publication_count * 10 / 1430 + 1);
    //         ids.push(node.id);
    //     }
    // });
    const matrix = new THREE.Matrix4();
    const color = new THREE.Color(); // 用于设置颜色
    nodes_3D.forEach((node, index) => {
        if (!Number.isNaN(node.x) && !Number.isNaN(node.y)) {
            const mpt = mapNodeToScreen(node);
            // matrix.setPosition(mpt.x, mpt.y, 0);
            const scale = node.achievement_count * 10 / 1430 + 1;
            matrix.compose(
                new THREE.Vector3(mpt.x, mpt.y, 0), 
                new THREE.Quaternion(),             
                new THREE.Vector3(scale, scale, scale) 
            );
            instancedMesh.setMatrixAt(index, matrix);
                
            color.set(getColorByType(node.discipline));
            
            instancedMesh.setColorAt(index, color);
            instancedMesh.userData[index] = {
                originalColor: color.clone(),
            }
        }
    });

    instancedMesh.instanceMatrix.needsUpdate = true;

    instancedMesh.frustumCulled = false; 

    nodesUpdate.current = nodes_3D;
    return instancedMesh;
}
// import * as THREE from 'three';
// import { mapNodeToScreen } from './sys/mnts';
// import { getColorByType } from './sys/getcolorbytype';
// const material = new THREE.ShaderMaterial({
//     vertexShader: `
//         attribute vec3 instancePosition;
//         attribute vec3 instanceColor;
//         attribute float instanceScale;
//         attribute float instanceId;
//         varying vec3 vColor;
//         varying float vId;
//         void main() {
//             vColor = instanceColor;
//             vId = instanceId;
//             vec3 pos = position * instanceScale;
//             gl_Position = projectionMatrix * modelViewMatrix * vec4(pos + instancePosition, 1.0);
//         }
//     `,
//     fragmentShader: `
//         varying vec3 vColor;
//         varying float vId;
//         uniform float highlightIds[256];
//         void main() {
//             vec3 color = vColor;
//             bool isHighlighted = false;
//             for (int i = 0; i < 256; i++) {
//                 if (highlightIds[i] == vId) {
//                     isHighlighted = true;
//                 }
//             }
//             if (isHighlighted) {
//                 color = vec3(1.0, 1.0, 0.0);
//             }
//             gl_FragColor = vec4(color, 1.0);
//         }
//     `,
//     side: THREE.DoubleSide,
//     uniforms: {
//         highlightIds: { value: new Float32Array(256).fill(-1) } // Default value
//     }
// });

// function createNodeGeometry({ nodes_3D, nodesUpdate }) {
//     const positions = [];
//     const colors = [];
//     const scales = [];
//     const ids = [];

//     const colorGroups = {};

//     nodes_3D.forEach((node, index) => {
//         if (!Number.isNaN(node.x) && !Number.isNaN(node.y)) {
//             const mpt = mapNodeToScreen(node);
//             const color = getColorByType(node.discipline);
//             const colorKey = `#${color.toString(16).padStart(6, '0')}`;

//             if (!colorGroups[colorKey]) {
//                 colorGroups[colorKey] = {
//                     positions: [],
//                     colors: [],
//                     scales: [],
//                     ids: []
//                 };
//             }

//             colorGroups[colorKey].positions.push(mpt.x, mpt.y, 0);
//             colorGroups[colorKey].colors.push(
//                 ((color >> 16) & 0xff) / 255,
//                 ((color >> 8) & 0xff) / 255,
//                 (color & 0xff) / 255
//             );
//             colorGroups[colorKey].scales.push(node.publication_count * 10 / 1430 + 1);
//             colorGroups[colorKey].ids.push(node.id);
//         }
//     });

//     const highDetailGeometry = new THREE.CircleGeometry(1, 32);
//     const lowDetailGeometry = new THREE.CircleGeometry(1, 8);

//     const pointGroup = new THREE.Group();

//     Object.keys(colorGroups).forEach((colorKey) => {
//         const { positions, colors, scales, ids } = colorGroups[colorKey];

//         const highDetailInstanceGeometry = new THREE.InstancedBufferGeometry();
//         highDetailInstanceGeometry.copy(highDetailGeometry);
//         highDetailInstanceGeometry.setAttribute('instancePosition', new THREE.InstancedBufferAttribute(new Float32Array(positions), 3));
//         highDetailInstanceGeometry.setAttribute('instanceColor', new THREE.InstancedBufferAttribute(new Float32Array(colors), 3));
//         highDetailInstanceGeometry.setAttribute('instanceScale', new THREE.InstancedBufferAttribute(new Float32Array(scales), 1));
//         highDetailInstanceGeometry.setAttribute('instanceId', new THREE.InstancedBufferAttribute(new Float32Array(ids), 1));

//         const lowDetailInstanceGeometry = new THREE.InstancedBufferGeometry();
//         lowDetailInstanceGeometry.copy(lowDetailGeometry);
//         lowDetailInstanceGeometry.setAttribute('instancePosition', new THREE.InstancedBufferAttribute(new Float32Array(positions), 3));
//         lowDetailInstanceGeometry.setAttribute('instanceColor', new THREE.InstancedBufferAttribute(new Float32Array(colors), 3));
//         lowDetailInstanceGeometry.setAttribute('instanceScale', new THREE.InstancedBufferAttribute(new Float32Array(scales), 1));
//         lowDetailInstanceGeometry.setAttribute('instanceId', new THREE.InstancedBufferAttribute(new Float32Array(ids), 1));

//         // const material = new THREE.MeshBasicMaterial({ color: new THREE.Color(colorKey) });
//         // material.depthTest = false;
//         // material.depthWrite = false;
        
//         const highDetailMesh = new THREE.InstancedMesh(highDetailInstanceGeometry, material, positions.length / 3);
//         const lowDetailMesh = new THREE.InstancedMesh(lowDetailInstanceGeometry, material, positions.length / 3);
//         highDetailMesh.frustumCulled = false; 
//         pointGroup.add(highDetailMesh);
//         // pointGroup.add(lowDetailMesh);
//     });

//     nodesUpdate.current = nodes_3D;
//     return pointGroup;
// }



// function updateHighlightIds(newHighlightIds) {
//     const highlightArray = new Float32Array(256).fill(-1);
//     newHighlightIds.forEach((id, index) => {
//         if (index < 256) {
//             highlightArray[index] = id;
//         }
//     });
//     material.uniforms.highlightIds.value = highlightArray;
//     material.uniforms.highlightIds.needsUpdate = true;
// }

export {createNodeGeometry};