import React, { useState, useRef, useEffect } from 'react';
import * as THREE from 'three';
import _ from 'lodash'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import createFlower from './flower';
import { createNodeGeometry } from './create_node';
import { mapNodeToScreen } from './sys/mnts';
import { createEdgeGeometry } from './create_edge';
import { createGrid } from './creategrid';
import { showTooltip, hideTooltip, initializeTooltipRoot} from './components/tooltip';
import { showResultTooltip, hideResultTooltip, initializeReTooltipRoot } from './components/show_resulttt';
import { updateInfoDisplay, initializeInfobarRoot } from './components/show_infobar';
import { updatenetworkInfoDisplay, initializenetworkInfobarRoot } from './components/show_networkinfo';
import {Flowerfetch} from './app/loadflower';
import {SMAAPass} from 'three/addons/postprocessing/SMAAPass.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import { GammaCorrectionShader } from 'three/examples/jsm/shaders/GammaCorrectionShader.js'
import { FXAAShader } from 'three/addons/shaders/FXAAShader.js';
import { SSAARenderPass } from 'three/examples/jsm/postprocessing/SSAARenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { CopyShader } from 'three/examples/jsm/shaders/CopyShader';
import * as TWEEN from 'three/examples/jsm/libs/tween.module.js'
import {animateCamera} from './app/animateCamera';
import SearchBox from './components/searchBox';
import Filter_o from './components/filter';
import Filter_d from './components/filter_D';
import { DownOutlined, RightOutlined } from '@ant-design/icons';
import dimNode from './sys/dimNode';
import highlightNode from './sys/highlightNode';
import HorizontalScrollSelector from './components/horizontalWheelSelector';
import { updateHighlightIds } from './create_node';
import AcademySelector from './components/academySelector';
import highlightN from './sys/highlightN';
import FilterByCount from './components/filterByCount';
import { getColorByGenre } from './sys/getcolorbyx';
import { clearState } from './sys/dimFbyYear';
import dimFlower from './sys/dimF';
import dimN from './sys/dimN';
import removeFlowerFromScene from './sys/removeFlower';
import {message} from 'antd';

const ThreeScene_3D = () => {
  const [nodes_3D, setNodes_3D] = useState([]);
  const [edges_3D, setEdges_3D] = useState([]);
  const sceneRef_1 = useRef(null);
  const sceneRef_2 = useRef(null);
  // let scene;
  const controls = useRef(null);
  const cameras = useRef([]);
  const thumbnailCamera = useRef([]);
  const initialized = useRef(false);
  const showNodesInDetail = useRef(false);
  const [showFlowersInDetail, setShowFlowersInDetail] = useState(false);
  const touchStart = useRef({ x: 0, y: 0 });
  const touchDelta = useRef({ x: 0, y: 0 });
  const infoRef = useRef(null);
  const latestMouseProjection = useRef(null);
  // const [latestMouseProjection, setLatestMouseProjection] = useState(new THREE.Vector3());
  const [tooltipDisplayTimeout, setTooltipDisplayTimeout] = useState(null);
  const [viewState, setViewState] = useState('overview');
  const [acaState, setAcaState] = useState(false);
  const nodesUpdate = useRef([]);
  const edgesUpdate = useRef([]);
  const edgesGeo = useRef([]);
  const lodUpdate = useRef([]);
  const originalColorsMap = useRef(null);
  const lines = useRef(null);
  const isAca =  useRef(true);
  const isType = useRef(true);
  const [isAcaExpanded, setIsAcaExpanded] = useState(true);
  const [isTypeExpanded, setIsTypeExpanded] = useState(true);
  const [isAnimate, setIsAnimate] = useState(false);
  const [edgeloading, setEdgeLoading] = useState(false);
  const triggerEffect = useRef(null);
  const cameraPosition = useRef(new THREE.Vector3());
  // const isPanning = useRef(false);
  // const lastMousePosition = useRef({ x: 0, y: 0 });
  const isAnimating = useRef(false);
  const [isTalentProcessing, setIsTalentProcessing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const isExpand = useRef(false);
  const isExp = useRef(false);
  // window.resizeTo(1920, 1080);
  useEffect(() => {
    if (viewState === 'overview'&&isExpanded) {
      initializenetworkInfobarRoot('networkInfoDisplay');
    }
  }, [viewState,isExpanded]);
  useEffect(() => {
    initializeReTooltipRoot('re-tooltip-container');
    initializeTooltipRoot('tooltip-container');
    initializeInfobarRoot('infoDisplay');
    // initializenetworkInfobarRoot ('networkInfoDisplay');
    const parseJSON = (data) => {
      return data.nodes.map(node => ({
        ...node,
        x: parseFloat(node.x.toFixed(4)),
        y: parseFloat(node.y.toFixed(4)),
        z: 0
      }));
    }
    fetch('${process.env.REACT_APP_NETWORK_API}')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(graphData => {
        setNodes_3D(graphData.nodes);
        setEdges_3D(graphData.links);
      })
      .catch(error => console.error('Error fetching graph data:', error));
  }, []);

  useEffect(() => {
    if (!initialized.current && Array.isArray(nodes_3D) && nodes_3D.length > 0) {
      init();
      initialized.current = true;
    }
    console.log(nodes_3D);
    console.log(edges_3D)
  }, [nodes_3D]);


  const init = () => {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x08173b);
    scene.background = null;
    scene.layers.enable(1);
    sceneRef_2.current = scene;
    const width = window.innerWidth;
    const height = window.innerHeight;
    console.log(width)
    console.log(height)
    const fov = 28;
    cameras.current = new THREE.PerspectiveCamera(fov,  width / height, 0.1, 10000);
    // camera.position.copy(new THREE.Vector3(cameraPosition.x, cameraPosition.y, cameraPosition.z));
    // const scale = Math.max(screenWidth, screenHeight) / averageSize; 
    // const positionLength = Math.sqrt(sceneSize.width ** 2 + sceneSize.height ** 2) / 2;
    // cameras.current.position.set(0.5*width, 0.5*height, positionLength * scale); 
    const verticalFovInRadians = fov * (Math.PI / 180);
    const cameraZ = window.innerHeight / Math.tan(verticalFovInRadians / 2);
    cameras.current.position.set(0, 0, cameraZ);    
    cameras.current.layers.enable(1);
    const cameraTarget = new THREE.Vector3(0, 0, 0);
    cameras.current.lookAt(cameraTarget);
    cameras.current.up = new THREE.Vector3(0, 0, 1);
    
    const renderer = new THREE.WebGLRenderer({antialias: false, alpha: true, powerPreference: 'high-performance'});
    renderer.setSize(width, height);
    renderer.setClearColor( 0x050f26, 0 );
    // renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(window.devicePixelRatio);

    renderer.gammaOutput = true;
    renderer.gammaFactor = 2.2;
    renderer.autoClear = false;
    renderer.shadowMap.enabled = false;
    // renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    // renderer.shadowMapSoft = true;
    // renderer.shadowMapAutoUpdate = true;
    renderer.sortObjects = false;
    renderer.localClippingEnabled = true;
    renderer.physicallyCorrectLights = false;
    // renderer.toneMapping = THREE.ACESFilmicToneMapping;
    // renderer.toneMappingExposure = 1.25;
    renderer.toneMappingWhitePoint = 1.0;
    renderer.gammaInput = true
    renderer.toneMappingExposure = Math.pow( 0.9, 4.0 ) 
    
    // renderer.autoClearColor = true;
    sceneRef_1.current.appendChild(renderer.domElement);
    const thumbnailRenderer = new THREE.WebGLRenderer({ canvas: document.getElementById('thumbnail'), antialias: true, alpha:true });
    const widtht = 150*width/height;
    thumbnailRenderer.setSize(widtht, 150); 
    // const thumbnailCamera = new THREE.OrthographicCamera(
    //   window.innerWidth / -2, window.innerWidth / 2,
    //   window.innerHeight / 2, window.innerHeight / -2,
    //   -10000, 10000
    // );
    thumbnailCamera.current = new THREE.PerspectiveCamera(fov, width / height, 1, 1000000);
    // const cameraZ = Math.max(THREE.SceneUtils.createMeshBoundingBox(scene).max.z, 1000);
    // thumbnailCamera.position.z = cameraZ * 1.1; 
    thumbnailCamera.current.position.set(0,0,cameraZ);
    thumbnailCamera.current.lookAt(0,0,0);
    const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.8);
    ambientLight.layers.set(0);
    ambientLight.layers.enable(1);
    
    scene.add(ambientLight);

    // const topLight = new THREE.HemisphereLight(0xffffff, 0x000000, 1);
    // topLight.position.set(0, 0, 1000); 
    // scene.add(topLight);

    const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 1);
    directionalLight.position.set(0, 0, 1000);
    directionalLight.target.position.set(0, 0, 0);
    scene.add(directionalLight);
    scene.add(directionalLight.target);


    // const axesHelper = new THREE.AxesHelper(100);
    // scene.add(axesHelper);

    

    controls.current = new OrbitControls(cameras.current, renderer.domElement);
    controls.current.keyPanSpeed = 100;
    controls.current.touchAngleThreshold = 1;
    controls.current.enableKeys = false;
    controls.current.enableRotate = true;
    // controls.current.enablePan = false;
    controls.current.enableDamping = false;
    controls.current.screenSpacePanning = true;
    controls.current.minDistance = 100;
    controls.current.maxDistance = 1000000;
    // controls.current.maxPolarAngle = Math.PI / 2;
    controls.current.target.copy(cameraTarget);
    controls.current.mouseButtons = {
      LEFT: THREE.MOUSE.ROTATE,
      MIDDLE: THREE.MOUSE.PAN,
    };
    controls.current.update();
    // controls.constraint.smoothZoom = true;
    // controls.constraint.zoomDampingFactor = 0.2;
    // controls.constraint.smoothZoomSpeed = 5.0;
    	
    const bloomPass = new UnrealBloomPass( new THREE.Vector2( width, window.innerHeight ), 1.5, 0.4, 0.85 )
    bloomPass.threshold = 0
    bloomPass.strength = 0.3
    bloomPass.radius = 0
    bloomPass.renderToScreen = true

    const sassRenderPass = new SSAARenderPass(scene, cameras.current)

    const composer_bloom = new EffectComposer(renderer);
    composer_bloom.renderToScreen = false
    composer_bloom.addPass(new RenderPass(scene, cameras.current));
    // composer_bloom.addPass(sassRenderPass);
    composer_bloom.addPass(bloomPass);
    const composer = new EffectComposer(renderer);
    const composer_thumbnail = new EffectComposer(thumbnailRenderer);

    let shaderPass = new ShaderPass(new THREE.ShaderMaterial({
      uniforms: {
          baseTexture: { value: composer.renderTarget1.texture  },
          bloomTexture: { value: composer_bloom.renderTarget2.texture },
          tDiffuse: {
              value: null
          }
      },
      vertexShader:'\t\t\tvarying vec2 vUv;\n' +
                   '\n' +
                   '\t\t\tvoid main() {\n' +
                   '\n' +
                   '\t\t\t\tvUv = uv;\n' +
                    '\n' +
                    '\t\t\t\tgl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n' +
                   '\n' +
                   '\t\t\t}',
      fragmentShader:'\t\t\tuniform sampler2D baseTexture;\n' +
                      '\t\t\tuniform sampler2D bloomTexture;\n' +
                      '\n' +
                      '\t\t\tvarying vec2 vUv;\n' +
                       '\n' +
                      '\t\t\tvoid main() {\n' +
                      '\n' +
                      '\t\t\t\tvec4 baseColor = texture2D(baseTexture, vUv);\n' +
                      '\n' +
                      '\t\t\t\tvec4 bloomColor = texture2D(bloomTexture, vUv);\n' +
                      // '\n' +
                      // '\t\t\t\tif (baseColor.a < 0.01) {\n'+
                      // '\n' +
                      // '\t\t\t\tbaseColor.a = 0.0;}\n' +
                      '\n' +
                      '\t\t\t\tfloat finalAlpha = (min(baseColor.a, bloomColor.a) + max(baseColor.a, bloomColor.a))*0.25;\n'+
                      // '\t\t\t\tfloat finalAlpha = min(baseColor.a, bloomColor.a);\n'+
                      // '\n' +
                      // '\t\t\t\tbloomColor.a = 0.0;}\n' +
                      '\n' +
                      '\t\t\t\tgl_FragColor = vec4(baseColor.rgb + bloomColor.rgb, finalAlpha); \n' +
                      // '\n' +
                      // '\t\t\t\tgl_FragColor = (baseColor + bloomColor);\n' +
                      '\n' +
                     '\t\t\t}',
      defines: {}
  }), 'baseTexture')
  shaderPass.needsSwap = true
  shaderPass.renderToScreen = true
    composer.addPass(new RenderPass(scene, cameras.current))
    composer_thumbnail.addPass(new RenderPass(scene, thumbnailCamera.current))
    // const pixelRatio = renderer.getPixelRatio();
    // const smaaPass = new SMAAPass(width * pixelRatio, height * pixelRatio);
    // composer.addPass(smaaPass);
    composer.addPass(sassRenderPass)
    composer_thumbnail.addPass(sassRenderPass)
    // composer.addPass(bloomPass)
    composer.addPass(new ShaderPass((GammaCorrectionShader)))
    composer_thumbnail.addPass(new ShaderPass((GammaCorrectionShader)))
    // composer.addPass(new ShaderPass((CopyShader)))

    composer.addPass(shaderPass)
    composer_thumbnail.addPass(shaderPass)
    // renderer.setClearColor(0x000000, 0);

    const newsystem = () => {
      const pointGroup = createNodeGeometry({ nodes_3D: nodes_3D, nodesUpdate: nodesUpdate });
      // lodUpdate.current = lod;
      lodUpdate.current = pointGroup;
      scene.add(pointGroup);
      const lineSegments = createEdgeGeometry({ nodes_3D: nodes_3D, edges_3D: edges_3D, edgesUpdate:edgesUpdate });
      edgesGeo.current = lineSegments;
      scene.add(lineSegments);
      setEdgeLoading(true);

      const gridd = createGrid();
      scene.add(gridd.grid);
      // scene.add(gridd.gridHelper);
      // const plane = creatPlane();
      // scene.add(plane);
      // updatenetworkInfoDisplay({node:{userData:{tooltipText:{id:1}}}}, 1);
    };
    newsystem();
    const indexToId = new Map();     // 创建一个 Map 来存储 id 到索引的映射

    nodes_3D.forEach((node, index) => {
        if (!Number.isNaN(node.x) && !Number.isNaN(node.y)) {
          indexToId.set(index, node.id);
        }
    });
    const handleRaycaster = (event, callback) => {
      const mouse = new THREE.Vector2();
      mouse.x = (event.clientX / width) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
      const screen = new THREE.Vector2();
      screen.x = event.clientX;
      screen.y = event.clientY;
      const raycaster = new THREE.Raycaster();
      raycaster.layers.enableAll();
      raycaster.setFromCamera(mouse, cameras.current);
      // const intersectObjects = Array.from(sceneRef_1.current.children).filter(obj => obj.type === 'Mesh');      
      // const intersects = raycaster.intersectObjects(intersectObjects, true);
      // const intersects = raycaster.intersectObjects(scene.children, true);
      // const intersects = raycaster.intersectObject(lodUpdate.current)
      // const intersects = raycaster.intersectObjects([lodUpdate.current], true);
      const filteredIntersects = raycaster.intersectObjects(scene.children, true);
      const intersects = filteredIntersects.filter(intersect => 
        !(intersect.object instanceof THREE.LineSegments)
      );
      // console.log(intersects);
      if (intersects.length > 0) {
        const intersectedObject = intersects[0].object;
        const intersectPoint = screen;
        let instanceId = null;
        let instanceType = null;
        // console.log(intersects[0])
        if (intersects[0].instanceId) {
          if (intersectedObject.userData && intersectedObject.userData[0].resultTooltip) {
            
            instanceId = intersectedObject.userData[intersects[0].instanceId].resultTooltip.id;
            instanceType = intersectedObject.userData[intersects[0].instanceId].resultTooltip.type;
          } else {
            instanceId = indexToId.get(intersects[0].instanceId);
            console.log(instanceId)
        }}
        callback(intersectedObject, intersectPoint, instanceId, instanceType);
      } else {
        callback(null);
      };
    };

    const onMouseMove = (event) => {
      event.preventDefault();
      // console.log("move")

      handleRaycaster(event, (intersectedObject, intersectPoint, instanceId, instanceType) => {
        // console.log(intersectPoint)
        hideTooltip();
        hideResultTooltip();
        if (intersectedObject && intersectPoint) {
          latestMouseProjection.current = intersectPoint

          if (tooltipDisplayTimeout) {
              clearTimeout(tooltipDisplayTimeout);
          }

          const timeout = setTimeout(() => {
            if (instanceId) {
              if(intersectedObject.userData && intersectedObject.userData[0].resultTooltip && instanceType){
                showResultTooltip({ hoveredObj: intersectedObject, latestMouseProjection: latestMouseProjection, instanceId: instanceId, instanceType: instanceType});
              } else {
                if (showNodesInDetail.current === false){
                  showTooltip({ hoveredObj: intersectedObject, latestMouseProjection: latestMouseProjection, instanceId: instanceId });
                  setIsAcaExpanded(false);
                  setIsTypeExpanded(false);
                  if(isExpand.current){
                    updatenetworkInfoDisplay({node: intersectedObject, instanceId: instanceId})
                  }
                }
            
              }
            } else {
              setIsAcaExpanded(isAca.current);
              setIsTypeExpanded(isType.current);
              if(intersectedObject.userData && intersectedObject.userData.flower_core) {
                showTooltip({ hoveredObj: intersectedObject, latestMouseProjection: latestMouseProjection, instanceId: intersectedObject.userData.node_id });
              }
            }
          }, 1);
          setTooltipDisplayTimeout(timeout);
        } else {
          if(isExpand.current){
            updatenetworkInfoDisplay({hide: true});
          }
          setIsAcaExpanded(isAca.current);
          setIsTypeExpanded(isType.current);
          hideTooltip();
          hideResultTooltip();
          latestMouseProjection.current = null;
          // setHoveredObj(null);
          if (tooltipDisplayTimeout) {
            clearTimeout(tooltipDisplayTimeout);
          }
        }
      });
    };

    const onClick = event => {
      event.preventDefault();
      console.log("click")
      if(lines.current){
        highlightNode(lodUpdate.current, nodesUpdate.current, edgesGeo.current, originalColorsMap.current, lines.current, sceneRef_2.current);
        lines.current = null;
      }

      handleRaycaster(event, (intersectedObject, intersectPoint, instanceId, instanceType) => {
        clearState(nodesUpdate.current, sceneRef_2.current);
        if (intersectedObject) {
          console.log("intersect")
          const clickedObject = intersectedObject;
          console.log(clickedObject.type)
          if (intersectedObject && intersectPoint && instanceId) {
            if(intersectedObject.userData && intersectedObject.userData[0].resultTooltip && instanceType){}else{
              setIsExpanded(true);
              isExpand.current = true;
              dimN(nodes_3D, lodUpdate.current, edges_3D, edgesGeo.current, instanceId, (line, originalColor) => {
                sceneRef_2.current.add(line);
                lines.current = line;
                originalColorsMap.current = originalColor; 
              });
            }
          }
          if (clickedObject.type === 'Mesh' && clickedObject.userData && clickedObject.userData.resultTooltip) {
            const clickedNode = clickedObject.userData.resultTooltip.node_id;
            const clickedFlower = clickedObject.userData.resultTooltip.id;
            nodesUpdate.current.forEach(node => {
                if (node.id !== clickedNode) {
                  if (node.flower) {
                    node.flower.traverse(child => {
                      if (child instanceof THREE.Mesh) {
                        const material = child.material;
                        if (material instanceof THREE.SpriteMaterial) {
                          material.opacity = 0.5;  
                        }
                        if (!material.originalColor) {
                          if(material.color)
                          {
                            material.originalColor = material.color.clone();
                            material.color.multiplyScalar(0.1);
                            if (child.userData.bloom){
                              child.layers.set(0);
                              material.emissiveIntensity=0.05;
                            }
                          } else {
                            material.originalColor = material.uniforms.color.value.clone();
                            material.uniforms.color.value.multiplyScalar(0.25);
                          }
                        
                        
                        }
                      }
                    });
                  }

                  // updateHighlightIds([clickedNode]);
                  // node.node.traverse(child => {
                  //   if (child instanceof THREE.Mesh) {
                  //     const material = child.material;
                  //     if (!material.originalColor) {
                  //       material.originalColor = material.color.clone();
                  //       material.color.multiplyScalar(0.1);
                  //     }
                  //   }
                  // });

                } else {
                  if (node.id === clickedNode) {
                    node.flower.traverse(child => {
                      if (child instanceof THREE.Mesh && child.material.originalColor) {
                        if(child.material.color) {
                          child.material.color.copy(child.material.originalColor);
                          if (child.userData.bloom){
                            child.layers.set(1);
                            child.material.emissiveIntensity=0.3;
                          }
                        } else {
                          child.material.uniforms.color.value.copy(child.material.originalColor);
                        }
                        delete child.material.originalColor;
                      }
                      if (child instanceof THREE.Mesh && child.userData.resultTooltip) {
                        if (child.userData.resultTooltip.id === clickedFlower){
                          console.log('ddd')
                          if(child.material.originalColor){
                            if(child.material.color) {
                              child.material.color.copy(child.material.originalColor);
                              
                            } else {
                              child.material.uniforms.color.value.copy(child.material.originalColor);
                            }
                            if (child.userData.bloom){
                                child.layers.set(1);
                                child.material.emissiveIntensity=0.3;
                            }
                            child.material.needsUpdate = true;
                            delete child.material.originalColor;
                          }

                        } else {
                          const material = child.material;
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
                              child.layers.set(0);
                              material.originalColor = material.uniforms.color.value.clone();
                              material.uniforms.color.value.multiplyScalar(0.25);
                              // material.uniforms.globalOpacity.value=0.3;
                              material.needsUpdate = true;
                            }
                          }
                        }

                      }
                    });
                    // node.node.traverse(child => {
                    //   if (child instanceof THREE.Mesh && child.material.originalColor) {
                    //     child.material.color.copy(child.material.originalColor);
                    //     delete child.material.originalColor;
                    //   }
                    // });

                  }
                }
              });
            

          }
          
          if (clickedObject.type === 'Mesh' && clickedObject.userData && clickedObject.userData.isFlower) {
            const clickedNode = clickedObject.userData.node;
            // updateInfoDisplay(clickedNode);
      
            if (clickedNode.flower) {
              nodesUpdate.current.forEach(node => {
                if (node !== clickedNode) {
                  if (node.flower) {
                    node.flower.traverse(child => {
                      if (child instanceof THREE.Mesh) {
                        const material = child.material;
                        if (material instanceof THREE.SpriteMaterial) {
                          material.opacity = 0.5;  
                        }
                        if (!material.originalColor) {
                          if(material.color)
                          {
                            material.originalColor = material.color.clone();
                            material.color.multiplyScalar(0.1);
                            if (child.userData.bloom === true){
                              child.layers.set(0);
                              material.emissiveIntensity=0.05;
                            }
                          } else {
                            material.originalColor = material.uniforms.color.value.clone();
                            material.uniforms.color.value.multiplyScalar(0.25);
                          }
                        }
                        if(child instanceof THREE.InstancedMesh){
                          const originalColor = new THREE.Color();
                          const userData = child.userData[0];
                          if (userData&&!userData.hasOwnProperty('originalColor')) {
                            const material = child.material;
                            for (let i = 0; i < child.count; i++) {
                              child.getColorAt(i, originalColor);
                              child.setColorAt(i, originalColor.multiplyScalar(0.1));   
                             
                            }
                            material.emissiveIntensity = 0.05;
                            child.layers.set(0); 
                            child.instanceColor.needsUpdate = true;
                            userData.originalColor = originalColor;
                          }
                        }
                      }
                    });
                  }
                  // node.node.traverse(child => {
                  //   if (child instanceof THREE.Mesh) {
                  //     const material = child.material;
                  //     if (!material.originalColor) {
                  //       material.originalColor = material.color.clone();
                  //       material.color.multiplyScalar(0.1);
                  //     }
                  //   }
                  // });

                } else {
                  if (node == clickedNode) {
                    node.flower.traverse(child => {
                      if (child instanceof THREE.Mesh && child.material.originalColor) {
                        if(child.material.color) {
                          child.material.color.copy(child.material.originalColor);
                          if (child.userData.bloom === true){
                            child.layers.set(1);
                            child.material.emissiveIntensity=0.3;
                          }
                        } else {
                          child.material.uniforms.color.value.copy(child.material.originalColor);
                        }
                        delete child.material.originalColor;
                      }
                      if(child instanceof THREE.InstancedMesh){
                        const userData = child.userData[0];
                        const material = child.material;
                        if (userData&&userData.hasOwnProperty('originalColor')) {
                          const color = new THREE.Color();
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
                    // node.node.traverse(child => {
                    //   if (child instanceof THREE.Mesh && child.material.originalColor) {
                    //     child.material.color.copy(child.material.originalColor);
                    //     delete child.material.originalColor;
                    //   }
                    // });

                  }
                }
              });
              
            }

          }
        } else {
          setIsExpanded(isExp.current);
          isExpand.current = isExp.current;
          // updateInfoDisplay(null);
          nodesUpdate.current.forEach(node => {
            if (node.flower) {
              // Restore original colors
              node.flower.traverse(child => {
                if (child instanceof THREE.Mesh && child.material.originalColor) {
                  if(child.material.color) {
                    child.material.color.copy(child.material.originalColor);
                    if (child.userData.bloom === true) {
                      child.layers.set(1);
                      child.material.emissiveIntensity=0.3;
                    }
                  } else {
                    child.material.uniforms.color.value.copy(child.material.originalColor);
                  }
                  delete child.material.originalColor;
                }
                if(child instanceof THREE.InstancedMesh){
                  const userData = child.userData[0];
                  const material = child.material;
                  if (userData) {
                    const color = new THREE.Color();
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
            // node.node.traverse(child => {
            //   if (child instanceof THREE.Mesh && child.material.originalColor) {
            //     child.material.color.copy(child.material.originalColor);
            //     delete child.material.originalColor;
            //   }})
          });
          for (let i = 0; i<lodUpdate.current.count; i++){
            lodUpdate.current.setColorAt(i, lodUpdate.current.userData[i].originalColor);
           
          }
          lodUpdate.current.instanceColor.needsUpdate = true;
        }
      });
    };
    const onRightClick = event => {
      event.preventDefault();
      console.log("rightClick")
      if(lines.current){
        highlightNode(lodUpdate.current, nodesUpdate.current, edgesGeo.current, originalColorsMap.current, lines.current, sceneRef_2.current);
        lines.current = null;
      }

      handleRaycaster(event, (intersectedObject, intersectPoint, instanceId, instanceType) => {
        clearState(nodesUpdate.current, sceneRef_2.current);
        if (intersectedObject) {
          console.log("intersect")
          const clickedObject = intersectedObject;
          console.log(clickedObject.type)
          if (intersectedObject && intersectPoint && instanceId) {
            if(intersectedObject.userData && intersectedObject.userData[0].resultTooltip && instanceType){}else{
              setIsExpanded(true);
              isExpand.current = true;
              const targetTeacher = nodesUpdate.current.find(teacher => teacher.id === instanceId)
              Flowerfetch(instanceId,(floweer_co) => {
                if(floweer_co){
                nodesUpdate.current.forEach(node => {
                  if (node.flower) {
                    sceneRef_2.current.remove(node.flower);
                    removeFlowerFromScene(node.flower);
                    node.flower = null; 
                  }
                });
                const petalCount = floweer_co.teacher.papers_count + floweer_co.teacher.patents_count + floweer_co.teacher.projects_count + floweer_co.teacher.awards_count + floweer_co.teacher.publications_count ;
                const targetz = petalCount * 45 / 143 + 20;
                const endTarget = mapNodeToScreen(targetTeacher);
                console.log(targetz)
                const targety = 250;
                endTarget.z = targetz*0.9 ;
                const endPosition = {
                  ...endTarget, 
                  y: endTarget.y - targetz*4 - 10, 
                  z: endTarget.z + targetz*0.6 
                };
                
                
                isAnimating.current = true;
                setIsAnimate(true);
                animateCamera(cameras.current, controls.current, {x:0,y:0,z:window.innerHeight / Math.tan(28 * (Math.PI / 180) / 2)}, {x:0,y:0,z:0}, 3000,()=>{
                  if(!targetTeacher.flower){
                    turnToDetail();
                    nodesUpdate.current.isFetchingFlower = false;
                    if (!floweer_co) {
                      return;
                    }
                    const mpt = mapNodeToScreen(targetTeacher);
                    const nodePosition = new THREE.Vector3(mpt.x, mpt.y, mpt.z);
                    const flower = createFlower({ position: nodePosition, node: targetTeacher, floweer_co: floweer_co });
                    console.log(flower)
                    targetTeacher.flower = flower;
                    sceneRef_2.current.add(flower);
    
                  } else {
                    targetTeacher.flower.visible = true;
                  }
                }, endPosition, endTarget, isAnimating); 
              } else {
                message.info({content:'暂时没有该教师的数据'});
              }
              })
              
            }
          }
        }
      })
    }
    sceneRef_1.current.addEventListener('mousemove', onMouseMove, false);
    sceneRef_1.current.addEventListener('click', onClick, false);
    sceneRef_1.current.addEventListener('contextmenu', onRightClick, false);
    const onThumbnailClick = (event) => {
      const thumbnailCanvas = event.target;
      const rect = thumbnailCanvas.getBoundingClientRect();
      const x = event.clientX - rect.left - thumbnailCanvas.width / 2;
      const y = thumbnailCanvas.height / 2 - event.clientY + rect.top ;
  
      const targetX = (x / thumbnailCanvas.height) * 2
      //  * (width * 2) - width; 
      const targetY = (y / thumbnailCanvas.height) * 2
      // * (height * 2) - height; 
      
  
      const endTarget = mapNodeToScreen({
        x:targetX,
        y:targetY,
        z:0
      })
      let targety = 0;
      let targetz = 0;
      if (showNodesInDetail.current) {
        targety = 150;
        targetz = 50;
      }
      const endPosition = {
        ...endTarget, 
        y: endTarget.y + targety, 
        z: endTarget.z + 50 
      };
      endTarget.z = targetz;
      animateCamera(cameras.current, controls.current, endPosition, endTarget, 2000); 
  }
    document.getElementById('thumbnail').addEventListener('click', onThumbnailClick, false);


    window.hideInfo = () => {
      infoRef.current.innerHTML = null;
    };

    const getVisibleNodeCount = () => {
      const visibleNodes = nodes_3D.filter(node => {
        const mpt1 = mapNodeToScreen(node);
        const position = new THREE.Vector3(mpt1.x, mpt1.y, mpt1.z);
        position.project(cameras.current);
        const x = (position.x * 0.5 + 0.5) * width;
        const y = (position.y * -0.5 + 0.5) * window.innerHeight;

        return x >= 0 && x <= width && y >= 0 && y <= window.innerHeight;
      });

      return visibleNodes.length;
    };

    // const nodePosition = new THREE.Vector3(0,0,0);
    // const count = 100
    // const flower = createFlower({position: nodePosition, petalCount: 40});
    // scene.add(flower);
    function isPointInsideExpandedFrustum(point, frustum, margin) {
      const expandedFrustum = frustum.clone();
      expandedFrustum.planes.forEach(plane => {
          // 扩展每个平面，增加边缘安全边际
          plane.constant -= margin;
      });
      return expandedFrustum.containsPoint(point);
  }
  const updateCameraPosition = (newPosition) => {
    if (!cameraPosition.current.equals(newPosition)) {
      cameraPosition.current.copy(newPosition);
      // 触发子组件中的 useEffect
      if (triggerEffect.current) {
        triggerEffect.current();
      }
    }
  };
    const createFlowerGeo = () => {
      // console.log(cameras.current.target)
      // console.log(cameras.current.position)
      // let margin1 = margin ? margin:0;
      const visibleNodeCount = getVisibleNodeCount();
      if (isAnimating.current) {
        console.log('pass')
        return;
      }
      if (showNodesInDetail.current) {
        const cameraPosition = new THREE.Vector3();
        cameras.current.getWorldPosition(cameraPosition);
        const frustum = new THREE.Frustum();
        const cameraViewProjectionMatrix = new THREE.Matrix4();
        cameras.current.updateMatrixWorld();
        cameraViewProjectionMatrix.multiplyMatrices(cameras.current.projectionMatrix, cameras.current.matrixWorldInverse);
        frustum.setFromProjectionMatrix(cameraViewProjectionMatrix);
    
        const proximityThreshold = 500; // 可以根据需要调整
        const proximityThresholdSquared = proximityThreshold * proximityThreshold;
    
        const nodesWithDistance = new Map();
    
        // 筛选出相机附近的节点
        for (const node of nodesUpdate.current) {
            const position = mapNodeToScreen(node);
            const nodePosition = new THREE.Vector3(position.x, position.y, position.z);
            
            const distanceSquared = nodePosition.distanceToSquared(cameraPosition);
            if (distanceSquared < proximityThresholdSquared) {
                // 如果节点在相机附近，检查是否在视锥体内
                if (frustum.containsPoint(nodePosition)) {
                    nodesWithDistance.set(node, distanceSquared);
                }
            }
        }
    
        // 将Map转换为数组以便排序，按距离平方排序
        const sortedNodes = Array.from(nodesWithDistance.entries()).sort((a, b) => a[1] - b[1]);
    
        // 只保留最近的50个节点
        const closestNodes = new Set(sortedNodes.slice(0, 30).map(entry => entry[0]));
    
        // 更新场景中的节点可见性，并处理花的加载
        const flowerPromises = [];

        for (const node of nodesUpdate.current) {
            const isClosest = closestNodes.has(node);
            if (node.flower) {
              if (isClosest) {
                node.flower.visible = true;
              } else {
                scene.remove(node.flower);
                removeFlowerFromScene(node.flower);
                node.flower = null; 
              }
            } else if (isClosest && !node.isFetchingFlower) {
                node.isFetchingFlower = true;
    
                const flowerPromise = new Promise((resolve) => {
                    Flowerfetch(node.id, (floweer_co) => {
                        node.isFetchingFlower = false;
                        if (!floweer_co) {
                            console.error('Received invalid data:', floweer_co);
                            resolve(); // 继续执行
                            return;
                        }
                        const mpt = mapNodeToScreen(node);
                        const nodePosition = new THREE.Vector3(mpt.x, mpt.y, mpt.z);
                        const flower = createFlower({ position: nodePosition, node: node, floweer_co: floweer_co });
                        node.flower = flower;
                        scene.add(flower);
                        resolve(); // 完成处理
                    });
                });
    
                flowerPromises.push(flowerPromise);
            }
        }
    
        // 等待所有的花加载完成
        Promise.all(flowerPromises).then(() => {
          setShowFlowersInDetail(true);
          console.log('All flowers loaded');
          updateCameraPosition(cameras.current.position);
        });
      } else {
        nodesUpdate.current.forEach(node => {
          if (node.flower) {
            node.flower.visible = false;
          }
        });
      }
      // nodesUpdate.current = nodes_3D;
    }
    // cameras.current.addEventListener('change', createFlowerGeo);
    nodes_3D.forEach(node => {
      node.flower = null;
    });
    nodesUpdate.current = nodes_3D;
    createFlowerGeo();
    let debounceTimeout;
    const debounceCreateFlowerGeo = () => {
      clearTimeout(debounceTimeout);
      debounceTimeout = setTimeout(createFlowerGeo, 200); // 根据需要调整延迟时间
    };
    controls.current.addEventListener('change', debounceCreateFlowerGeo);
  
    const animate = () => {
      // lodUpdate.current.update(cameras.current)
      requestAnimationFrame(animate);
      TWEEN.update(); 
      renderer.autoClear = false;

      controls.current.update();
      cameras.current.layers.set(1);
      composer_bloom.render()
      // composer_bloom.render()
      // renderer.clear();
      // renderer.clearDepth();
      renderer.autoClear = false;

      
      cameras.current.layers.set(0);
      composer.render();
      // renderer.render(scene, cameras.current);
      // renderer.autoClear = false;
      // composer_thumbnail.render();
      thumbnailRenderer.render(scene, thumbnailCamera.current);
      // createFlowerGeo();

    };
    animate();
    // TWEEN.update(); 

  }

  // const handleKeyDown = (event) => {
  //   switch (event.key) {
  //     case 'w':
  //       event.preventDefault();
  //       controls.current.target.y += 100;
  //       cameras.current.position.y += 100;
  //       controls.current.update();
  //       break;
  //     case 's':
  //       event.preventDefault();
  //       controls.current.target.y -= 100;
  //       cameras.current.position.y -= 100;
  //       controls.current.update();
  //       break;
  //     case 'a':
  //       event.preventDefault();
  //       controls.current.target.x -= 100;
  //       cameras.current.position.x -= 100;
  //       controls.current.update();
  //       break;
  //     case 'd':
  //       event.preventDefault();
  //       controls.current.target.x += 100;
  //       cameras.current.position.x += 100;
  //       controls.current.update();

  //       break;
  //     default:
  //       break;
  //   }
  // };

  const handleTouchStart = (event) => {
    if (event.touches.length > 0) {
      touchStart.current = { x: event.touches[0].clientX, y: event.touches[0].clientY };
    }
    if (event.touches.length === 2) {
      const dx = event.touches[1].clientX - event.touches[0].clientX;
      const dy = event.touches[1].clientY - event.touches[0].clientY;
      touchDelta.current = { x: dx, y: dy };
    }
  };

  const handleTouchMove = (event) => {
    event.preventDefault();

    if (event.touches.length === 1) {
      // 单指触摸移动，实现平移
      const touch = event.touches[0];
      const deltaX = touch.clientX - touchStart.current.x;
      const deltaY = touch.clientY - touchStart.current.y;
      // 根据触摸移动的距离来平移相机
      controls.current.pan(new THREE.Vector2(-deltaX, deltaY));
      touchStart.current = { x: touch.clientX, y: touch.clientY };
    } else if (event.touches.length === 2) {
      // 双指触摸移动，实现缩放
      const touch1 = event.touches[0];
      const touch2 = event.touches[1];
      const currentDistance = Math.sqrt(
        (touch2.clientX - touch1.clientX) ** 2 + (touch2.clientY - touch1.clientY) ** 2
      );
      const zoomFactor = currentDistance / touchDelta.current.x;
      controls.current.dollyIn(zoomFactor);
    }
  };

  const handleTouchEnd = () => {
    touchStart.current = { x: 0, y: 0 };
    touchDelta.current = { x: 0, y: 0 };
  };



  const handleContextMenu = (event) => {
    event.preventDefault();

    const deltaX = event.clientX - window.innerWidth / 2;
    const deltaY = event.clientY - window.innerHeight / 2;

    controls.current.target.x -= deltaX * 0.01;
    controls.current.target.y += deltaY * 0.01;
  };

  const switchToOverview = () => {
    // sceneRef_1.current.addEventListener('mousemove', onMouseMove, false);
    // cameras.current.position.set(0, 0, 4000);
    // // cameras.current.lookAt(0,0,0);
    // controls.current.target.set(0, 0, 0);
    clearState(nodesUpdate.current, sceneRef_2.current);
    for (let i = 0; i<lodUpdate.current.count; i++){
      lodUpdate.current.setColorAt(i, lodUpdate.current.userData[i].originalColor);
     
    }
    lodUpdate.current.instanceColor.needsUpdate = true;
    showNodesInDetail.current = false;
    // controls.current.update();
    controls.enabled = false;
    let tween2 = new TWEEN.Tween({
      x:cameras.current.position.x,
      y:cameras.current.position.y,
      z:cameras.current.position.z,
      tx: controls.current.target.x,
      ty: controls.current.target.y,
      tz: controls.current.target.z,
    })
    tween2.to({
      x:0,
      y:-3000,
      z:600,
      tx: 0,
      ty: 1300,
      tz: 0,
    }, 2000)
    tween2.easing(TWEEN.Easing.Quartic.InOut);
    tween2.onUpdate(function (obj) {
      cameras.current.position.set(obj.x, obj.y, obj.z);
      controls.current.target.set(obj.tx, obj.ty, obj.tz);
      controls.current.update();
    })
    let tween1 = new TWEEN.Tween({
      x:0,
      y:-3000,
      z:600,
      tx: 0,
      ty: 1300,
      tz: 0,
    })
    tween1.to({
      x:0,
      y:0,
      z:4000,
      tx: 0,
      ty: 0,
      tz: 0,
    }, 2000)
    tween1.easing(TWEEN.Easing.Quadratic.InOut);
    tween1.onUpdate(function (obj) {
      cameras.current.position.set(obj.x, obj.y, obj.z);
      controls.current.target.set(obj.tx, obj.ty, obj.tz);
      controls.current.update();
    })
    tween2.chain(tween1);
    tween2.start();
    tween2.onComplete(function () {
      controls.enabled = true;
      setShowFlowersInDetail(false);
    });
    const interface1ImageContainer = document.getElementById('interface1-imagecontainer');
    interface1ImageContainer.classList.remove('interface1-image-invisible');
  };


  const switchToDetail = () => {
    // showNodesInDetail.current = true;

    // THREE.Object3D.DefaultUp.set(0, 0, 1); 
    const interface1ImageContainer = document.getElementById('interface1-imagecontainer');
    interface1ImageContainer.classList.add('interface1-image-invisible');

    controls.enabled = false;
    let tween2 = new TWEEN.Tween({
      x:cameras.current.position.x,
      y:cameras.current.position.y,
      z:cameras.current.position.z,
      tx: controls.current.target.x,
      ty: controls.current.target.y,
      tz: controls.current.target.z,
    })
    tween2.to({
      x:0,
      y:-3500,
      z:2500,
      tx: 0,
      ty: 0,
      tz: 0,
    }, 8000)
    // tween2.to({
    //   x:0,
    //   y:0,
    //   z:150,
    //   tx: 0,
    //   ty: 0,
    //   tz: 0,
    // }, 2000)
    tween2.easing(TWEEN.Easing.Quadratic.InOut);
    tween2.onUpdate(function (obj) {
      cameras.current.position.set(obj.x, obj.y, obj.z);
      controls.current.target.set(obj.tx, obj.ty, obj.tz);
      // controls.current.update();
    })
    // let tween1 = new TWEEN.Tween({
    //   x:0,
    //   y:-3000,
    //   z:600,
    //   tx: 0,
    //   ty: 1300,
    //   tz: 0,
    // })
    // let tween1 = new TWEEN.Tween({
    //   x:0,
    //   y:-3500,
    //   z:2500,
    //   tx: 0,
    //   ty: 0,
    //   tz: 0,
    // })
    // tween1.to({
    //   x:130,
    //   y:560,
    //   z:120,
    //   tx: 130,
    //   ty: 600,
    //   tz: 0,
    // }, 5000)
    // tween1.easing(TWEEN.Easing.Cubic.InOut);
    // tween1.onUpdate(function (obj) {
    //   cameras.current.position.set(obj.x, obj.y, obj.z);
    //   controls.current.target.set(obj.tx, obj.ty, obj.tz);
    //   // controls.current.update();
    // })
    let tween3 = new TWEEN.Tween({
      x:0,
      y:-3500,
      z:2500,
      tx: 0,
      ty: 0,
      tz: 0,
  })
  .to({
    x:80,
    y:100,
    z:120,
    tx: 80,
    ty: 1000,
    tz: 0,
  }, 8000)
  .easing(TWEEN.Easing.Quadratic.InOut)
  .onUpdate(function (obj) {
      cameras.current.position.set(obj.x, obj.y, obj.z);
      controls.current.target.set(obj.tx, obj.ty, obj.tz);
      // controls.current.update();
  });
  tween3.onComplete(function () {
    controls.enabled = true; 
    showNodesInDetail.current = true;
  });
  tween2.chain(tween3);
  // tween1.chain(tween3);
  tween2.start();
  // tween2.onComplete(function () {
  //   controls.enabled = true; 
  //   showNodesInDetail.current = true;
  // });
   
    // cameras.current.position.set(0, 650, 50);
    // controls.current.target.set(0, 1500, 0);
    // TWEEN.update(); 
    // controls.current.update();
  };
  
  const detailAnimate = () => {
    controls.enabled = false;
    let tween2 = new TWEEN.Tween({
      x:-280,
      y:140,
      z:120,
      tx: -450,
      ty: 850,
      tz: 0,
    })
    // tween2.to({
    //   x:-230,
    //   y:50,
    //   z:180,
    //   tx: -230,
    //   ty: 1050,
    //   tz: 0,
    // }, 7500)
    tween2.to({
      x:-280,
      y:140,
      z:120,
      tx: 0,
      ty: 850,
      tz: 0,
    }, 20000)
    tween2.easing(TWEEN.Easing.Quadratic.InOut);
    tween2.onUpdate(function (obj) {
      cameras.current.position.set(obj.x, obj.y, obj.z);
      controls.current.target.set(obj.tx, obj.ty, obj.tz);
      controls.current.update();
    })
    // let tween1 = new TWEEN.Tween({
    //   x:0,
    //   y:-3000,
    //   z:600,
    //   tx: 0,
    //   ty: 1300,
    //   tz: 0,
    // })
    // let tween1 = new TWEEN.Tween({
    //   x:-230,
    //   y:50,
    //   z:180,
    //   tx: -230,
    //   ty: 1050,
    //   tz: 0,
    // })
    let tween1 = new TWEEN.Tween({
      x:-280,
      y:140,
      z:120,
      tx: -280,
      ty: 1000,
      tz: 0,
    })
    // tween1.to({
    //   x:-180,
    //   y:150,
    //   z:180,
    //   tx: -330,
    //   ty: 950,
    //   tz: 0,
    // }, 7500)
    tween1.to({
      x:-280,
      y:140,
      z:120,
      tx: 0,
      ty: 850,
      tz: 0,
    }, 7500)
    // tween1.easing(TWEEN.Easing.Cubic.InOut);
    tween1.onUpdate(function (obj) {
      cameras.current.position.set(obj.x, obj.y, obj.z);
      controls.current.target.set(obj.tx, obj.ty, obj.tz);
      controls.current.update();
    })
    let tween3 = new TWEEN.Tween({
      x:140,
      y:570,
      z:120,
      tx: 130,
      ty: 1050,
      tz: 0,
    })
    tween3.to({
      x:201,
      y:592.7,
      z:120,
      tx: 90,
      ty: 1000,
      tz: 0,
    }, 2500)
    // tween3.easing(TWEEN.Easing.Cubic.InOut);
    tween3.onUpdate(function (obj) {
      cameras.current.position.set(obj.x, obj.y, obj.z);
      controls.current.target.set(obj.tx, obj.ty, obj.tz);
      controls.current.update();
    })
  
      // tween2.chain(tween1);
      // tween1.chain(tween3);
      tween2.start();
      tween2.onComplete(function () {
        controls.enabled = true; 
        showNodesInDetail.current = true;
      });
  }
  const toggleAnimate = () => {
    if (isAnimating.current) {
      setIsAnimate(false);
      isAnimating.current = false;
    } else {
      setIsAnimate(true);
      isAnimating.current = true;
    }

  }
  const toggleView = () => {
    if (viewState === 'overview') {
      switchToDetail();
      setViewState('detail');
    } else {
      switchToOverview();
      setViewState('overview');
      setIsAnimate(false);
      isAnimating.current = false;
    }
  };
  const turnToDetail = () => {
    showNodesInDetail.current = true;
    setViewState('detail');
  }

  const handleAcade = () => {
    if (isTalentProcessing) {
      return; 
    }
    setIsTalentProcessing(true);
    if (acaState) {
      // highlightN(edgesGeo.current);
      setAcaState(false);
      highlightNode(lodUpdate.current, nodesUpdate.current, edgesGeo.current, originalColorsMap.current, lines.current, sceneRef_2.current);

      lines.current = null;
    } else {
      setAcaState(true);
      dimNode(nodes_3D, lodUpdate.current, edges_3D, edgesGeo.current, (line, originalColor) => {
        sceneRef_2.current.add(line);
        lines.current = line;
        originalColorsMap.current = originalColor; 
      });
    }
    setTimeout(() => {
      setIsTalentProcessing(false);
    }, 500);
  }
  const toggleAcaExpand = () => {
    setIsAcaExpanded(!isAcaExpanded);
    isAca.current = !isAca.current;
  };

  const toggleTypeExpand = () => {
    setIsTypeExpanded(!isTypeExpanded);
    isType.current = !isType.current;
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
    isExpand.current = !isExpand.current;
    isExp.current = !isExp.current;
  };

  // useEffect(() => {

  //   window.addEventListener('keydown', handleKeyDown);
    // sceneRef_1.current.addEventListener('touchstart', handleTouchStart);
    // sceneRef_1.current.addEventListener('touchmove', handleTouchMove);
    // sceneRef_1.current.addEventListener('touchend', handleTouchEnd);
    // tippy('.has-tooltip', {
    //   content(reference) {
    //     return `<div><p>${reference.getAttribute('data-name')}</p></div>`;
    //   },});

    // return () => {
    //   window.removeEventListener('keydown', handleKeyDown);
      // sceneRef_1.current.removeEventListener('touchstart', handleTouchStart);
      // sceneRef_1.current.removeEventListener('touchmove', handleTouchMove);
      // sceneRef_1.current.removeEventListener('touchend', handleTouchEnd);
  //   };
  // }, []);
  return (
    <div class="threed-container">
      {/* <div 
        id="tooltip" 
        className="tooltip"
        style={{ position: 'absolute' }}
      /> */}
      <div id="interface1 -titlecontainer" class="interface1-titlecontainer">
        <p class="interface1-title1">蒲公英田</p>
        <p class="interface1-title2">同济大学的学术沃野</p>
        <p class="interface1-title3">Dandelion Field</p>
        <p class="interface1-title3">Academic Fertility at Tongji University</p>
      </div>
      <div id="interface1-logocontainer" class="interface1-logocontainer">
        <img src="https://example.com/images/tongji_logo.png"/>
        <img src="https://example.com/images/di_logo.png"/>
        <img src="https://example.com/images/idvx_logo.png"/>
        <span class="circle-container" onClick={toggleExpand} style={{ cursor: 'pointer' }}>{isExpanded?<DownOutlined/>:<RightOutlined/>}</span>
      </div>
      <div id="interface1-imagecontainer" class="interface1-imagecontainer">
        <img src="https://example.com/images/image_color.png"/>
      </div>
 
      {(viewState === 'detail')&&<div id="interface1-imagecontainer2" class="interface1-imagecontainer2">
        <HorizontalScrollSelector network={nodesUpdate.current} scene={sceneRef_2.current}/>
      </div>}
      <div id="search-container"  class="search-container">
        {edgeloading&&<SearchBox camera={cameras.current} control={controls.current} node={nodesUpdate.current} detail={turnToDetail} scene={sceneRef_2.current} isAnimating={isAnimating} nodeGeo={lodUpdate.current} setIsAnimate={setIsAnimate}/>}
      </div>
      {(viewState === 'overview')&&isExpanded&&<div id="filterO-container"  class="filterO-container">
        <div id="filterO-header"  class="filterO-header" onClick={toggleTypeExpand} style={{ cursor: 'pointer' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="3.45vh" height="3.45vh" fill="white" class="bi bi-geo-alt-fill" viewBox="0 0 16 16">
            <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/>
          </svg>
          <div class="filterO-text-container">
            <div>筛选类别</div>
            <div style={{ textDecoration: 'underline' }}>Filter Category</div>
          </div>
          {isTypeExpanded ? <DownOutlined /> : <RightOutlined />}
        </div>
        { isTypeExpanded && edgeloading &&<Filter_o edge={edgesGeo} /> }
      </div>}
      {(viewState === 'detail')&&isExpanded&&<div id="filterD-container"  class="filterD-container">
        <div id="filterD-header"  class="filterD-header">
        <svg xmlns="http://www.w3.org/2000/svg" width="3.45vh" height="3.45vh" fill="white" class="bi bi-geo-alt-fill" viewBox="0 0 16 16">
          <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/>
        </svg>
        <div class="filterO-text-container">
          <div>筛选类别</div>
          <div style={{ textDecoration: 'underline' }}>Filter Category</div>
        </div>
        <DownOutlined/>
        </div>
        {nodesUpdate.current&&<Filter_d network={nodesUpdate.current} scene={sceneRef_2.current} cameras={cameras} viewState={showFlowersInDetail} triggerEffect={triggerEffect}/>}
      </div>}
      {(viewState === 'overview')&&isExpanded&&<div id="filterO-acedemy-container"  class="filterO-acedemy-container" style={{ top: isTypeExpanded ? '41%' : '33%' }}>
        <div id="filterO-acedemy-header"  class="filterO-acedemy-header" onClick={toggleAcaExpand} style={{ cursor: 'pointer' }}>
        <svg xmlns="http://www.w3.org/2000/svg" width="3.45vh" height="3.45vh" fill="white" class="bi bi-house-check-fill" viewBox="0 0 16 16">
          <path d="M8.707 1.5a1 1 0 0 0-1.414 0L.646 8.146a.5.5 0 0 0 .708.708L8 2.207l6.646 6.647a.5.5 0 0 0 .708-.708L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293L8.707 1.5Z"/>
          <path d="m8 3.293 4.712 4.712A4.5 4.5 0 0 0 8.758 15H3.5A1.5 1.5 0 0 1 2 13.5V9.293l6-6Z"/>
          <path fill-rule="evenodd" d="M12.5 16a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm1.679-4.493a.5.5 0 0 0-.858-.514l-1.17 1.95-.547-.546a.5.5 0 0 0-.708.707l.774.773a.75.75 0 0 0 1.174-.144l1.335-2.226Z"/>
        </svg>
        <div class="filterO-text-container">
          <div>筛选学院</div>
          <div style={{ textDecoration: 'underline' }}>Filter Faculty</div>
        </div>
          {isAcaExpanded ? <DownOutlined /> : <RightOutlined />}
        </div>
        {isAcaExpanded && edgeloading &&(
        <AcademySelector network={nodes_3D} nodeGeo={lodUpdate.current} edges={edges_3D} edgeGeo={edgesGeo.current} scene={sceneRef_2.current}/>)}
      </div>}
      {(viewState === 'overview')&&isExpanded&&<div id="filterO-figure-container"  class="filterO-figure-container" style={{ top: isTypeExpanded ? (isAcaExpanded ? '61%' : '47.5%') : (isAcaExpanded ? '53%' : '39.5%') }}>
        <div id="filterO-figure-header"  class="filterO-figure-header">
        <svg xmlns="http://www.w3.org/2000/svg" width="3.45vh" height="3.45vh" fill="white" class="bi bi-bar-chart-fill" viewBox="0 0 16 16">
          <path d="M1 11a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1v-3zm5-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7zm5-5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1V2z"/>
        </svg>
        <div class="filterO-text-container">
          <div>占比统计</div>
          <div style={{ textDecoration: 'underline' }}>Proportion Statistics</div>
        </div>
        <DownOutlined/>
        </div>
        <div
          id="networkInfoDisplay"
          className="networkInfoDisplay"
          // ref={infoRef}
        />
        {/* {(viewState === 'detail')&&nodesUpdate.current&&<Filter_d network={nodesUpdate.current}/>} */}
        {/* <Filter_d network={nodesUpdate.current}/> */}
      </div>}
      <div id="thumbnail-container">
        <canvas id="thumbnail"></canvas>
        <div class="bottom-left"></div>
        <div class="bottom-right"></div>
        {/* <div id="thumbnail-left-top"/> */}
        {/* <div style="position: absolute; top: 0; left: 0; width: 200px; height: 150px; border: 2px solid #fff; pointer-events: none;"></div> */}
      </div>
      <div id="tooltip-container" class="tooltip-container"></div>
      <div id="re-tooltip-container" class="re-tooltip-container"></div>
      <div
        id="infoDisplay"
        className="infoDisplay"
        // ref={infoRef}
        style={{ position: 'absolute' }}
      />
      {/* <div id="3dcontainer" class="graph-container"> */}
        <div
          id="3d-graph"
          class="graph"
          ref={sceneRef_1}
          onContextMenu={handleContextMenu}
          tabIndex={0}
          style={{ width: '100%', height: '100%', outline: 'none' }}
        />
      {/* </div> */}
      {/* <button className="control-button-1" onClick={toggleView}> */}
      <button className={viewState === 'overview' ? 'control-button-1' : 'control-button-2'} onClick={toggleView}>
        {(viewState === 'overview')&&<img src="https://example.com/images/switch_2.png"/>}
        {(viewState === 'detail')&&<img src="https://example.com/images/switch_1.png"/>}
      </button>
      <button className={viewState === 'overview' ? 'control-button-2' : 'control-button-3'} onClick={handleAcade}>
        <img src="https://example.com/images/talents.png"/>
      </button>
      <button className="control-button-4" onCLick={()=>{ window.opener = null;window.open("about:blank", "_self").close();window.close();}}>
        <img src="https://example.com/images/return.png"/>
      </button>
      {(viewState === 'detail') && 
      <button className="control-button-5" onClick={toggleAnimate}>
        {isAnimate?<img src="https://example.com/images/lock_locked.png"/>:<img src="https://example.com/images/lock_opened.png"/>}
      </button>
      }
      {/* <div className="control-button-3" onClick={detailAnimate}>
        <img src="https://example.com/images/filter.png"/>
      </div> */}
      {(viewState === 'overview') && edgeloading &&
      <div className="control-button-3">
        <FilterByCount network={nodes_3D} nodeGeo={lodUpdate.current} edges={edges_3D} edgeGeo={edgesGeo.current} scene={sceneRef_2.current}/>
      </div>}
    </div>
  );
}

export default ThreeScene_3D;