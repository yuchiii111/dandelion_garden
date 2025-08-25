import React, { useState, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { FXAAShader } from 'three/addons/shaders/FXAAShader.js';
import { SSAARenderPass } from 'three/examples/jsm/postprocessing/SSAARenderPass';
import { GammaCorrectionShader } from 'three/examples/jsm/shaders/GammaCorrectionShader.js'


const Abc = () => {    
    const sceneRef_2 = useRef(null);

    useEffect(() => {

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth/ window.innerHeight, 1, 10000);
    camera.position.set(-5, 5, 5);
    camera.layers.enable(1);
    const cameraTarget = new THREE.Vector3(0, 0, 0);
    camera.lookAt(cameraTarget);
    const renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor( 0x000000 );
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.gammaOutput = true;
    renderer.gammaFactor = 2.2;
    renderer.autoClear = false;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.shadowMapSoft = true;
    renderer.shadowMapAutoUpdate = true;
    renderer.sortObjects = false;
    renderer.localClippingEnabled = true;
    renderer.physicallyCorrectLights = true;
    // renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    renderer.toneMappingWhitePoint = 1.0;
    // document.body.appendChild(renderer.domElement);
    sceneRef_2.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.keyPanSpeed = 0;
    controls.touchAngleThreshold = 1;
    controls.enableKeys = false;
    controls.enableDamping = false;
    controls.screenSpacePanning = true;
    controls.minDistance = 100;
    controls.maxDistance = 1000000;
    // controls.current.maxPolarAngle = Math.PI / 2;
    controls.target.copy(cameraTarget);
    controls.update();
    // controls.constraint.smoothZoom = true;
    // controls.constraint.zoomDampingFactor = 0.2;
    // controls.constraint.smoothZoomSpeed = 5.0;

    var light = new THREE.DirectionalLight(0xffffff, 0.75);
    // light.enable.layer(0);
    light.position.setScalar(100);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0xffffff, 0.25));

    var obj = new THREE.Mesh(new THREE.BoxGeometry(5, 5, 4), new THREE.MeshLambertMaterial({color: 0xcccccc, wireframe: false}));
    obj.position.z = 0.25;
    // obj.layers.set(0);

    scene.add(obj);

    var objBack = new THREE.Mesh(new THREE.BoxGeometry(5, 5, 1), new THREE.MeshBasicMaterial({color: "blue", wireframe: false}));
    objBack.position.z = -2.25;
    objBack.layers.set(1);
    scene.add(objBack);

    /** COMPOSER */
    const renderScene = new RenderPass( scene, camera )
        
    // const effectFXAA = new ShaderPass( FXAAShader )
    // effectFXAA.uniforms.resolution.value.set( 1 / window.innerWidth, 1 / window.innerHeight )
        
    // const bloomPass = new UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 1.5, 0.4, 0.85 )
    // bloomPass.threshold = 0.05
    // bloomPass.strength = 1.2
    // bloomPass.radius = 0.55
    // bloomPass.renderToScreen = true
        
    const bloomPass = new UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 1.5, 0.4, 0.85 )
    bloomPass.threshold = 0
    bloomPass.strength = 2
    bloomPass.radius = 0
    bloomPass.renderToScreen = false

    // const sassRenderPass = new SSAARenderPass(scene, camera)

    const composer_bloom = new EffectComposer(renderer);
    composer_bloom.renderToScreen = false

    composer_bloom.addPass(new RenderPass(scene, camera));
    // composer_bloom.addPass(sassRenderPass);
    composer_bloom.addPass(bloomPass);
    const composer = new EffectComposer(renderer);

    let shaderPass = new ShaderPass(new THREE.ShaderMaterial({
        uniforms: {
            baseTexture: { value: null  },
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
                        '\t\t\t\tgl_FragColor = ( texture2D( baseTexture, vUv ) + vec4( 1.0 ) * texture2D( bloomTexture, vUv ) );\n' +
                        '\n' +
                       '\t\t\t}',
        defines: {}
    }), 'baseTexture')

    shaderPass.renderToScreen = true
    shaderPass.needsSwap = true

    composer.addPass(new RenderPass(scene, camera))
    // const pixelRatio = renderer.getPixelRatio();
    // const smaaPass = new SMAAPass(width * pixelRatio, height * pixelRatio);
    const sassRenderPass1 = new SSAARenderPass(scene, camera)

    // composer.addPass(smaaPass);
    composer.addPass(sassRenderPass1)
    // composer.addPass(bloomPass)
    composer.addPass(new ShaderPass((GammaCorrectionShader)))
    composer.addPass(shaderPass)
    // const composer = new EffectComposer( renderer )
    // composer.setSize( window.innerWidth, window.innerHeight )
        
    // composer.addPass( renderScene )
    // composer.addPass( effectFXAA )
    // composer.addPass( bloomPass )
        
    renderer.gammaInput = true
    renderer.gammaOutput = true
    renderer.toneMappingExposure = Math.pow( 0.9, 4.0 ) 

    render();
    function render(){
    requestAnimationFrame(render);
        
    renderer.autoClear = false;
    renderer.clear();
    
    camera.layers.set(1);
    composer_bloom.render();
    
    renderer.clearDepth();
    camera.layers.set(0);
    composer.render();

    // renderer.render(scene, camera);
    }
}, []);
return(
    <div>
    <div
    id="3h"
    ref={sceneRef_2}
    style={{ width: '100%', height: '100%', outline: 'none' }}
    />
    </div>
)
}
export default Abc;