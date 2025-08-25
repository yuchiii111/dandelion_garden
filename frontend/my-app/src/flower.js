import * as THREE from 'three';
import { getColorByType } from './sys/getcolorbytype';
import Picfetchh from './app/loadpic';
import Modelpicfetch from './app/loadmodelpic';
import { getColorByGenre } from './sys/getcolorbyx'

const createFlower = ({ position, node, floweer_co}) => {

  if (!floweer_co || !floweer_co.teacher) {
    return null;
  }
  const petalCount = floweer_co.teacher.papers_count + floweer_co.teacher.patents_count + floweer_co.teacher.projects_count + floweer_co.teacher.awards_count + floweer_co.teacher.publications_count ;
  // const petalCount = floweer_co.teacher.total_count;
  let flowerCenterZ = petalCount * 45 / 143 + 20;
  const sphereRadius = flowerCenterZ * 7 / 18;
  console.log(sphereRadius)
  const flowerGroup = new THREE.Group();
  const color1 = getColorByType(node.discipline);
  flowerGroup.position.copy(new THREE.Vector3(0, 0, 0));
  function handleModelPicData(picUrl, scale) {
    return new Promise((resolve) => {
      if (picUrl) {
      
          const textureLoader = new THREE.TextureLoader();
          const textureUrl = URL.createObjectURL(picUrl);
          textureLoader.load(textureUrl, (avatarTexture) => {    
        
            const torusRotation = new THREE.Matrix4().makeRotationX(Math.PI / 2);
            const avatarMaterial = new THREE.SpriteMaterial({
              map: avatarTexture,
              transparent: true,
              opacity:1,
            });
            const avatar = new THREE.Sprite(avatarMaterial);
            avatar.scale.set(scale, scale, scale); 
            avatar.position.copy(position);
            avatar.position.z = flowerCenterZ;
            avatar.layers.set(0);
            flowerGroup.add(avatar);
            sphere.material.side = THREE.BackSide;
            sphere.layers.set(0);
            resolve();

        });
    } else {
      resolve();
    }
  });
  };

  function makeCircularTexture(imageSrc, size) {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const image = new Image();
      image.onload = () => {
        canvas.width = size;
        canvas.height = size;   
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2, size / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(image, 0 , 0, size, size);
        const texture = new THREE.CanvasTexture(canvas);
        resolve(texture);
      };
      image.onerror = reject;
      image.src = imageSrc;
    });
  }

  function handlePicData(picUrl) {
    return new Promise((resolve) => {
      if (picUrl) {
        makeCircularTexture(picUrl, 1000).then(avatarTexture => {
          const textureLoader = new THREE.TextureLoader();
        
            const avatarGeometry = new THREE.CircleGeometry(1.6, 32);
            const torusRotation = new THREE.Matrix4().makeRotationX(Math.PI / 2);
            avatarGeometry.applyMatrix4(torusRotation);
            const avatarMaterial = new THREE.SpriteMaterial({
              map: avatarTexture,
              transparent: true,
            });
            const avatar = new THREE.Sprite(avatarMaterial);
            avatar.scale.set(4, 4, 4); 
            avatar.position.copy(position);
            avatar.position.z = flowerCenterZ;
            avatar.userData = { ...sphere.userData };
            avatar.layers.set(0);
            flowerGroup.add(avatar);
            sphere.material.side = THREE.BackSide;
        resolve(); 
      });
        
    } else {
      resolve(); 
    }
  })
  };
  Picfetchh(node.id, handlePicData);


  const C0 = new THREE.Vector3(position.x, position.y, position.z);
  const C1 = new THREE.Vector3(position.x, position.y, position.z + flowerCenterZ - 2.21);
  const k1 = 0.2 * flowerCenterZ
  const Cc = new THREE.Vector3(position.x - k1, position.y, (position.z + flowerCenterZ - 1.5)/2);

  const curve = new THREE.QuadraticBezierCurve3(C0, Cc, C1);
  const segments = 40;
  const radiusSegments = 12;
  const radiusStart = 0.15;
  const radiusEnd = 0.8;
  const transitionStart = 0.85;
  const vertices = [];
  const normals = [];
  const uvs = [];
  let radius;
  for (let i = 0; i <= segments; i++) {
    const u = i / segments;
    const targetRadiusEnd = radiusStart + u * (radiusEnd - radiusStart);

    const point = curve.getPointAt(u);
    if (u < transitionStart) {
      radius = radiusStart;
    } else {
      const factor = (u - transitionStart) / (1 - transitionStart);
      radius = radiusStart + factor * (targetRadiusEnd - radiusStart);
    }

    for (let j = 0; j < radiusSegments; j++) {
      const v = j / radiusSegments;
      const angle = v * Math.PI * 2;

      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;

      vertices.push(point.x + x, point.y + y, point.z);
      uvs.push(u, v);

      const normal = new THREE.Vector3(x, y, 0).normalize();
      normals.push(normal.x, normal.y, normal.z);
    }
  }

  const indices = [];
  for (let i = 0; i < segments; i++) {
    for (let j = 0; j < radiusSegments - 1; j++) {
      const a = i * radiusSegments + j;
      const b = i * radiusSegments + j + 1;
      const c = (i + 1) * radiusSegments + j;
      const d = (i + 1) * radiusSegments + j + 1;

      indices.push(a, b, d);
      indices.push(a, d, c);
    }
  }

  const tubeGeometry = new THREE.BufferGeometry();
  tubeGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  tubeGeometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  tubeGeometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  tubeGeometry.setIndex(indices);
  const material = new THREE.MeshPhongMaterial({ color: color1 });
  const tube1 = new THREE.Mesh(tubeGeometry, material);
  tube1.layers.set(0);
  tube1.userData.isFlower = true;
  tube1.userData.node = node;
  flowerGroup.add(tube1);

  const color = new THREE.Color(0xFFFFFF); 
  const reflectivity = 0.4; 

  const sphereMaterial = new THREE.MeshPhysicalMaterial({
    color:0xFFFFFF,
    metalness: 0.25,
    roughness: 0.05,
    envMapIntensity:1.0,
    transmission:1.0,
    ior:1.5,
    side: THREE.DoubleSide,
    emissive:0xFFFFFF,
    emissiveIntensity: 0.1,
    reflectivity: 0.99, 
    transparent: true,
    opacity: 0.75, 
  })
  const sphereGeometry = new THREE.SphereGeometry(2.5, 16, 16);
  const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
  sphere.layers.set(0);
  sphere.position.copy(position);
  sphere.position.z = flowerCenterZ ;
  sphere.userData = {
    flower_core: true,
    node_id: node.id
  };
  flowerGroup.add(sphere);

  const sphere1Geometry = new THREE.SphereGeometry(0.7, 12, 12);
  const petalGroup = new THREE.Group();
  const tubeGroup = new THREE.Group();

  const P0 = new THREE.Vector3(position.x, position.y, position.z + flowerCenterZ);
  function getDataArray(dataArrayName) {
    return floweer_co[dataArrayName];
  }
  const dataSetNames = ['papers', 'patents', 'projects', 'awards', 'publications'];
  // let instanceCount = 0;
  // dataSetNames.forEach(dataSetName => {
  //   const dataArray = getDataArray(dataSetName);
  //   instanceCount += dataArray.length;
  // });

    const instances = {};
    dataSetNames.forEach(dataSetName => {
      const sphere1Material = new THREE.MeshPhongMaterial({ 
        color: 0xffffff,
        emissive: 0xffffff,
        emissiveIntensity: 0.3,
        wireframe: false,
        transparent: true,
        side:THREE.BackSide
      });
      const dataArray = getDataArray(dataSetName);
      const instancedMesh = new THREE.InstancedMesh(sphere1Geometry, sphere1Material, dataArray.length);
      instances[dataSetName] = instancedMesh;
    });
  
  
  const matrix = new THREE.Matrix4();
  const color11 = new THREE.Color(); 
  let instanceIndex = 0;
  dataSetNames.forEach(dataSetName => {
    const dataArray = getDataArray(dataSetName);
    const count = dataArray.length;
    const color_paper = getColorByGenre(dataSetName);

    const dsName = dataSetName.slice(0, -1) + '_id';
    for (let i = 0; i < count; i++) {
      if (dataArray[i] && dataArray[i].lineposition) {
        const x = dataArray[i].lineposition.x + position.x;
        const y = dataArray[i].lineposition.y + position.y;
        const z = dataArray[i].lineposition.z - 10;
        const acreage = dataArray[i].acreage?dataArray[i].acreage:1;
        const idd = dataArray[i].model?dataArray[i].model:1;
        if(x && y && z) {
          const P1 = new THREE.Vector3(x, y, z);

          const direction = P1.clone().sub(P0);

          const t = 1.8 / direction.length(); 
          const intersectionPoint = P0.clone().add(direction.multiplyScalar(t)); 
          const Pm = P0.clone().add(P1).multiplyScalar(0.5);
          const k = 3 + sphereRadius * 1 / 10;

          const center = new THREE.Vector3(position.x, position.y, flowerCenterZ + sphereRadius)
          const centerToPm = Pm.clone().sub(center);

          const normal = centerToPm.clone().normalize();

          const Pc = Pm.clone().add(normal.clone().multiplyScalar(k));
          const curve = new THREE.QuadraticBezierCurve3(intersectionPoint, Pc, P1);
          
        // 顶点着色器
          const vertexShader = `
          uniform float globalOpacity; // 全局透明度控制
          attribute float vertexOpacity; // 顶点的局部透明度属性
          varying float vOpacity; // 将透明度传递到片元着色器

          void main() {
              vOpacity = globalOpacity * vertexOpacity; // 计算最终的透明度
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
          `;

          // 片元着色器
          const fragmentShader = `
          precision highp float;

          uniform vec3 color; // 材质颜色
          varying float vOpacity; // 从顶点着色器传递过来的透明度

          void main() {
              vec4 finalColor = vec4(color, vOpacity); // 使用颜色和透明度设置片元颜色
              gl_FragColor = finalColor;
          }

          `;

          const globalOpacity = 1.0; 

          const tubeGeometry = new THREE.TubeGeometry(curve, 64, 0.03, 8, false);
          const vertexOpacity = new Float32Array(tubeGeometry.attributes.position.count); // 透明度数组与顶点数量相同
          function sigmoid(index, total, steepness) {
            const midpoint = total / 2;
            const scale = 1 / steepness;
            return 1 / (1 + Math.exp(-scale * (index - midpoint)));
        }
          for (let i = 0; i < tubeGeometry.attributes.position.count; i++) {
            vertexOpacity[i] = sigmoid(i, tubeGeometry.attributes.position.count, 40) - 0.01;
          }

          tubeGeometry.setAttribute('vertexOpacity', new THREE.BufferAttribute(vertexOpacity, 1));

          const material = new THREE.ShaderMaterial({
          vertexShader: vertexShader,
          fragmentShader: fragmentShader,
          uniforms: {
              color: { value: new THREE.Color(color_paper) }, 
              globalOpacity: { value: 1.0 }
          },
          blending: THREE.AdditiveBlending,
          transparent: true,
          });

          const tube = new THREE.Mesh(tubeGeometry, material);
          tube.userData.bloom = false;
          tube.userData.resultTooltip = {id:dataArray[i][dsName],type:dataSetName, node_id: node.id, year:dataArray[i].year};
          tube.layers.set(0);          
          tubeGroup.add(tube);

          const scale = (acreage-1)*0.3+1;
          matrix.compose(
            P1, 
            new THREE.Quaternion(),             
            new THREE.Vector3(scale, scale, scale) 
          );
          
          instances[dataSetName].setMatrixAt(i, matrix);
              
          color11.set(color_paper);
          instances[dataSetName].setColorAt(i, color11);
          instances[dataSetName].userData[i] = {
            bloom: true,
            resultTooltip: {
              id: dataArray[i][dsName],
              type: dataSetName,
              node_id: node.id,
              year: dataArray[i].year
            },
            node:{
              location:P1.clone(),
              scale: scale,
            }
          }
          // const sphere1 = new THREE.Mesh(sphere1Geometry, sphere1Material);
          // sphere1.position.copy(P1);
          // let scale1 = scale*2;
          // sphere1.scale.set(scale, scale, scale); 
          // sphere1.userData.bloom = true;
          // sphere1.userData.resultTooltip = {id:dataArray[i][dsName],type:dataSetName, node_id: node.id, year:dataArray[i].year};
          // sphere1.castShadow = false
          // sphere1.receiveShadow = false
          // sphere1.layers.set(1);
          // petalGroup.add(sphere1);
        }
        instanceIndex++;
      } else {
        continue;
      };
    }
    instances[dataSetName].layers.set(1);
    instances[dataSetName].instanceMatrix.needsUpdate = true;
    flowerGroup.add(instances[dataSetName]);
  });
  flowerGroup.add(tubeGroup);
  return flowerGroup;
};

export default createFlower;