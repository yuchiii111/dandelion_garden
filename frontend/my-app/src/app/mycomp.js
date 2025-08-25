import React, { useState, useRef, useEffect } from 'react';
import * as THREE from 'three';
import _ from 'lodash'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
// import { DeviceOrientationControls } from 'three/examples/jsm/controls/DeviceOrientationControls';
// import { TextureLoader } from 'three/examples/jsm/loaders/TextureLoader';

const ThreeScene = () => {
  const [nodes, setNodes] = useState({});
  const [edgelist, setEdgelist] = useState([]);
  // const [linksLoaded, setLinksLoaded] = useState(false);
  // const [nodesLoaded, setNodesLoaded] = useState(false);
  // const [scene, setScene] = useState(null);
  // const [camera, setCamera] = useState(null);
  // const [renderer, setRenderer] = useState(null);
  // const [controls, setControls] = useState(null);
  // const [gyroPresent, setGyroPresent] = useState(false);

  const sceneRef = useRef(null);
  
  var types = [ "Arts", "Literature", "Medicine", "History", "Engineering and technology", "Science", "Law", "Business", "Management", "Psychology", "Education"];

  var groups ={
    "Arts":0xcccccc,
    "Literature":0xffcf0a,
    "Medicine":0x00a7f0,
    "History":0xe54400,
    "Science":0xb20061,
    "Law":0xc3ff33,
    "Engineering and technology":0x4b3ce0,//0x9ad1ff,//0x0002cc,
    "Business":0x85b44d,
    "Management":0xd19657,
    "Psychology":0x938ee0,//0x8782d2,
    "Education":0x00bd7e,
    // "Business and management":0xb7eac3,
    // "Psychology":0x00d3d9,
    // "Social sciences":0xca65ca
  };
  
  useEffect(() => {
    const dataloader = new DataLoader();
    dataloader( setNodes, setEdgelist );
    init()

    // return () => {
    //   cancelAnimationFrame(animate);
    //   renderer.dispose();
    // };
  }, []);

  const onWindowResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  };
 
  const init = () => {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050507);

    const width = window.innerWidth;
    const height = window.innerHeight;
    const fov = 28;
    const camera = new THREE.PerspectiveCamera(fov, width/height, 1, 1000000);
    camera.position.set(2700, 2500, -8000)
    // const cameraTarget = new THREE.Vector3(0,0,0);
    // camera.lookAt(cameraTarget);
    
    const dummy = new THREE.Object3D();
    const parent = new THREE.Object3D();

    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambientLight);

    const axesHelper = new THREE.AxesHelper(100);
    scene.add(axesHelper);

    const point_group = new THREE.Group();

    // const points = [
    //     new THREE.Vector3(-1, 0, 0),
    //     new THREE.Vector3(1, 0, 0),
    //   ];
    //   const geometry = new THREE.SphereGeometry(0.8, 32, 32);
    //   const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    //   points.forEach((point) => {
    //     const sphere = new THREE.Mesh(geometry, material);
    //     sphere.position.set(...point.toArray());
    //     point_group.add(sphere);
    //   });
      // scene.add(point_group);

    const renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize(width, height);
		renderer.autoClearColor = true;
    sceneRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    // controls.enableDamping = true; 
    // controls.dampingFactor = 0.5;
    controls.enableDamping = false;
    controls.screenSpacePanning = false;
    controls.minDistance = 100;
    controls.maxDistance = 1000000;
    controls.maxPolarAngle = Math.PI/2;
    controls.constraint.smoothZoom = true;
    controls.constraint.zoomDampingFactor = 0.2;
    controls.constraint.smoothZoomSpeed = 5.0;

    // const nodeColors = types.map((type, index) => {
    //   const color = new THREE.Color(groups[type]).getHexString();
    //   return { name: type, color: color };
    // });

    const spriteMaterial = new THREE.SpriteMaterial({
      color: 0xFFFFFF,
      // map: new THREE.TextureLoader().load("textures/particle3.png"),
      blending: THREE.AdditiveBlending,
      depthTest: false,
      transparent: true,
    });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(50, 50, 1);
    parent.add(sprite);

    const editorialMaterial = new THREE.SpriteMaterial({
      transparent: true,
      color: 0xffffff,
      // map: new THREE.TextureLoader().load("textures/particle4.png"),
    });
    
    spriteGroup = new THREE.Group();
    parent.add(spriteGroup);

    // const editSprite = new THREE.Sprite(editorialMaterial);
    // editSprite.scale.set(60, 60, 1);
    // editSprite.visible = false;
    // scene.add(editSprite);

    const newsystem = () => {
      const ptct = 0;
      const lineptct = 0;
      const count = 0;
      const sizes = [];
      const positions = [];
      const colors = [];
      const indices = [];
      const positionsLines = [];
      const colorsLines = [];

      for (const key in nodes) {
        const piece = nodes[key];
        count++;

        const pX = piece.x, pY = piece.y, pZ = piece.size * 20;
        const particle = new THREE.Vector3(pX, pY, pZ);

        if (Number.isNaN(pX) || Number.isNaN(pY) || Number.isNaN(pZ)) {
          console.log(key); 
          continue; 
        }

        positions.push(pX, pY, pZ);
        const color = new THREE.Color(groups[piece.type]);
        colors.push(color.r, color.g, color.b);
        // nodePositions.push(particle);
      }

      const percent = useRand ? 1 : randFloat;
      for (let j = 0; j < percent * edgelist.length; j++) {
        const edge = edgelist[j];
        if (nodes[edge.source] && nodes[edge.target]) {
          const points = edge.points;
          const stype = nodes[edge.source].type;
          const ttype = nodes[edge.target].type;
          const c = stype !== ttype ? new THREE.Color(0xFFFFFF) : new THREE.Color(groups[stype]);

          for (let q = 0; q < points.length; q++) {
            const point = new THREE.Vector3(points[q].x, points[q].y, points[q].z);
            points.push(point);
            positionsLines.push(point.x, point.y, point.z);
            colorsLines.push(c.r, c.g, c.b);

            if (q < points.length - 2) {
              lineIndices.push(lineptct, lineptct + 1);
            }
            lineptct++;
          }
        }
      }

      const particlesGeometry = new THREE.BufferGeometry();
      particlesGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      particlesGeometry.setAttribute('customColor', new THREE.Float32BufferAttribute(colors, 3));
      particlesGeometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));

      const uniforms = {
        color: { value: new THREE.Color(0xffffff) },
        // texture: { value: new THREE.TextureLoader().load("textures/particle2.png") }
      };

      // var pmaterial = new THREE.ShaderMaterial( {
      //   uniforms: uniforms,
      //   vertexShader: document.getElementById( 'vertexshader' ).textContent,
      //   fragmentShader: document.getElementById( 'fragmentshader' ).textContent,
      //   //blending: THREE.AdditiveBlending,
      //   //depthTest: false,
      //   //transparent: true
      // } );

      const particleSystem = new THREE.Points(particlesGeometry, particleMaterial);
      particleSystem.rotation.x = Math.PI / -2
      particleSystem.name = "points";
      parent.add(particleSystem);

      const lines = new THREE.BufferGeometry();
      lines.setIndex(new THREE.BufferAttribute(new Uint32Array(indices), 1));
      lines.addAttribute('position', new THREE.Float32BufferAttribute(positionsLines, 3));
      lines.addAttribute('color', new THREE.Float32BufferAttribute(colorsLines, 3));
      lines.computeBoundingSphere();
      const lineMaterial = new THREE.LineBasicMaterial({
        // vertexColors: THREE.VertexColors,
        transparent: true,
        opacity: 0.2
      });
      const lineSegments = new THREE.LineSegments(lines, lineMaterial);
      lineSegments.rotation.x = Math.PI / -2;
      parent.add(lineSegments);

      scene.add(parent);
    }

    newsystem();

    const animate = () => {
      requestAnimationFrame(animate);
      controls.update(); 
      renderer.render(scene, camera);
    };
    animate();
  }



  return <div ref={sceneRef} />;
};

export default ThreeScene;