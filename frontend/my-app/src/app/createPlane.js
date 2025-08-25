import * as THREE from 'three';

const creatPlane = () => {
    const geometry = new THREE.PlaneGeometry(window.innerHeight*2, window.innerHeight*2); // 2x2 单位大小的正方形

    const material = new THREE.MeshPhysicalMaterial({
    color: 0x163285, 
    // color:0xFFFFFF,
    metalness: 0.25,
    roughness: 0.05,
    envMapIntensity:1.0,
    transmission:1.0,
    ior:1.5,
    side: THREE.DoubleSide,
    emissive:0xFFFFFF,
    emissiveIntensity: 0.01,
    reflectivity: 0.4, 
    // refractionRatio: 0.7,
    transparent: true,
    opacity: 0.75, 
    // wireframe: true 
    });

    const square = new THREE.Mesh(geometry, material);
    square.position.set(0, 0, -2); 
    return square
}

export default creatPlane;