"use strict";

import * as THREE from '../node_modules/three/build/three.module.js';
import { OrbitControls } from '../node_modules/three/examples/jsm/controls/OrbitControls.js';
import { Water } from '../node_modules/three/examples/jsm/objects/Water.js';
import { Sky } from '../node_modules/three/examples/jsm/objects/Sky.js';

// import  * as dat,  from '../node_modules/dat.gui/build/dat.gui.module.js';
import { GUI } from '../node_modules/dat.gui/build/dat.gui.module.js';

import {
    vertexShader,
    fragmentShader
} from './shaders.js';


import Stats from '../node_modules/three/examples/jsm/libs/stats.module.js';


var container, stats;
var camera, scene, renderer, light;
var controls, water, sphere;

init();
animate();

function init() {

    container = document.getElementById('container');

    //

    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    //

    scene = new THREE.Scene();

    //

    camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 1, 20000);
    camera.position.set(30, 30, 100);

    //

    light = new THREE.DirectionalLight(0xffffff, 0.8);
    scene.add(light);

    // Water

    var waterGeometry = new THREE.PlaneBufferGeometry(10000, 10000);

    water = new Water(
        waterGeometry,
        {
            textureWidth: 512,
            textureHeight: 512,
            waterNormals: new THREE.TextureLoader().load('src/assets//waternormals.jpg', function (texture) {

                texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

            }),
            alpha: 1.0,
            sunDirection: light.position.clone().normalize(),
            sunColor: 0xffffff,
            waterColor: 0x001e0f,
            distortionScale: 3.7,
            fog: scene.fog !== undefined
        }
    );

    water.rotation.x = - Math.PI / 2;

    scene.add(water);

    // Skybox

    var sky = new Sky();

    var uniforms = sky.material.uniforms;

    uniforms['turbidity'].value = 10;
    uniforms['rayleigh'].value = 2;
    uniforms['luminance'].value = 1;
    uniforms['mieCoefficient'].value = 0.005;
    uniforms['mieDirectionalG'].value = 0.8;

    var parameters = {
        distance: 400,
        inclination: 0.0033,
        azimuth: 0.205
    };

    var cubeCamera = new THREE.CubeCamera(0.1, 1, 512);
    cubeCamera.renderTarget.texture.generateMipmaps = true;
    cubeCamera.renderTarget.texture.minFilter = THREE.LinearMipmapLinearFilter;

    scene.background = cubeCamera.renderTarget;

    function updateSun() {

        var theta = Math.PI * (parameters.inclination - 0.5);
        var phi = 2 * Math.PI * (parameters.azimuth - 0.5);

        light.position.x = parameters.distance * Math.cos(phi);
        light.position.y = parameters.distance * Math.sin(phi) * Math.sin(theta);
        light.position.z = parameters.distance * Math.sin(phi) * Math.cos(theta);

        sky.material.uniforms['sunPosition'].value = light.position.copy(light.position);
        water.material.uniforms['sunDirection'].value.copy(light.position).normalize();

        cubeCamera.update(renderer, sky);

    }

    updateSun();

    //

    // var geometry = new THREE.IcosahedronBufferGeometry(20, 1);
    // var count = geometry.attributes.position.count;

    // var colors = [];
    // var color = new THREE.Color();

    // for (var i = 0; i < count; i += 3) {

    //     color.setHex(Math.random() * 0xffffff);

    //     colors.push(color.r, color.g, color.b);
    //     colors.push(color.r, color.g, color.b);
    //     colors.push(color.r, color.g, color.b);

    // }

    // geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    var material = new THREE.MeshStandardMaterial({
        vertexColors: true,
        roughness: 0.0,
        flatShading: true,
        envMap: cubeCamera.renderTarget.texture,
        side: THREE.DoubleSide
    });

    // sphere = new THREE.Mesh(geometry, material);
    // scene.add(sphere);

    //

    var geometryCube = new THREE.BoxGeometry(10, 10, 10);
    var materialCube = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    var cube = new THREE.Mesh(geometryCube, material);
    cube.position.y = 3;
    scene.add(cube);


    window.addEventListener('keypress', (keyPressed) => {
        console.log(cube.quaternion);

        const { key } = keyPressed;

        switch (key) {
            case 'w': {
                cube.position.x += cube.quaternion.w;
                cube.position.z += (1 - cube.quaternion.w);
                break;
            }
            case 'a': {
                cube.rotation.y += .1;
                break;
            }
            case 's': {
                cube.position.x -= 1;
                break;
            }
            case 'd': {
                cube.rotation.y -= .1;
                break;
            }
        }
    });

    //

    controls = new OrbitControls(camera, renderer.domElement);
    controls.maxPolarAngle = Math.PI * 0.495;
    controls.target.set(0, 10, 0);
    controls.minDistance = 40.0;
    controls.maxDistance = 200.0;
    controls.update();

    camera.lookAt(cube.position);

    //

    stats = new Stats();
    container.appendChild(stats.dom);

    // GUI

    var gui = new GUI();

    var folder = gui.addFolder('Sky');
    folder.add(parameters, 'inclination', 0, 0.5, 0.0001).onChange(updateSun);
    folder.add(parameters, 'azimuth', 0, 1, 0.0001).onChange(updateSun);
    folder.open();

    var uniforms = water.material.uniforms;

    var folder = gui.addFolder('Water');
    folder.add(uniforms.distortionScale, 'value', 0, 8, 0.1).name('distortionScale');
    folder.add(uniforms.size, 'value', 0.1, 10, 0.1).name('size');
    folder.add(uniforms.alpha, 'value', 0.9, 1, .001).name('alpha');
    folder.open();

    //

    window.addEventListener('resize', onWindowResize, false);


}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

}

function animate() {

    requestAnimationFrame(animate);
    render();
    stats.update();

}

function render() {

    var time = performance.now() * 0.001;

    // sphere.position.y = Math.sin(time) * 20 + 5;
    // sphere.rotation.x = time * 0.5;
    // sphere.rotation.z = time * 0.51;

    water.material.uniforms['time'].value += 1.0 / 60.0;

    renderer.render(scene, camera);

}


/////////////////////////////////////////////////////////////////////////

// export class Engine {
//     scene = new THREE.Scene();
//     camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
//     renderer = new THREE.WebGLRenderer();
//     geometry = new THREE.BoxGeometry();
//     // material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
//     material = new THREE.ShaderMaterial({
//         vertexShader,
//         fragmentShader
//     });
//     cube = new THREE.Mesh(this.geometry, this.material);
//     controls = new OrbitControls(this.camera, this.renderer.domElement);

//     constructor() {
//         this.renderer.setSize(window.innerWidth, window.innerHeight);
//         document.body.appendChild(this.renderer.domElement);
//         this.scene.add(this.cube);
//         this.camera.position.z = 5;
//         this.controls.update();
//         this.animate();
//     }

//     animate = () => {
//         requestAnimationFrame(this.animate);
//         this.cube.rotation.x += 0.01;
//         this.cube.rotation.y += 0.01;
//         this.controls.update();
//         this.renderer.render(this.scene, this.camera);
//     };
// }

// window.onload = () => {
//     new Engine();
// };

////////////////////////////////////////////////////////////////////////////////

// class App {

//     /**
//      * @constructor
//      */
//     constructor() {

//         this.width = window.innerWidth;
//         this.height = window.innerHeight;

//         this.DELTA_TIME = 0;
//         this.LAST_TIME = Date.now();

//         this.scene = new Scene(this.width, this.height);
//         this.plane = new Plane();

//         this.scene.add(this.plane.mesh);

//         this.hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.6);
//         this.hemiLight.color.setHSL(0.6, 1, 0.6);
//         this.hemiLight.groundColor.setHSL(0.095, 1, 0.75);
//         this.hemiLight.position.set(0, 50, 0);
//         this.scene.add(this.hemiLight);

//         this.geometry = new THREE.BoxGeometry();
//         this.material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
//         this.cube = new THREE.Mesh(this.geometry, this.material);
//         this.scene.add(this.cube);

//         this.hemiLightHelper = new THREE.HemisphereLightHelper(this.hemiLight, 10);
//         this.scene.add(this.hemiLightHelper);

//         const root = document.body.querySelector('.app');
//         root.appendChild(this.scene.renderer.domElement);

//         this.update = this.update.bind(this)

//         this.addListeners();

//         requestAnimationFrame(this.update);

//     }

//     /**
//      * @method
//      * @name onResize
//      * @description Triggered when window is resized
//      */
//     onResize() {

//         this.width = window.innerWidth;
//         this.height = window.innerHeight;

//         this.scene.resize(this.width, this.height);

//     }

//     /**
//      * @method
//      * @name addListeners
//      */
//     addListeners() {

//         window.addEventListener('resize', this.onResize.bind(this));

//     }

//     /**
//      * @method
//      * @name update
//      * @description Triggered on every TweenMax tick
//      */
//     update() {

//         this.DELTA_TIME = Date.now() - this.LAST_TIME;
//         this.LAST_TIME = Date.now();

//         this.plane.update(this.DELTA_TIME);
//         this.scene.render();

//         requestAnimationFrame(this.update);

//     }

// }

// class Plane {

//     /**
//      * @constructor
//      */
//     constructor() {

//         this.size = 1000;
//         this.segments = 200;

//         this.options = new Options();
//         this.options.initGUI();

//         this.uniforms = {
//             u_amplitude: { value: this.options.amplitude },
//             u_frequency: { value: this.options.frequency },
//             u_time: { value: 0.0 }
//         }

//         this.geometry = new THREE.PlaneBufferGeometry(this.size, this.size, this.segments, this.segments);
//         this.material = new THREE.ShaderMaterial({
//             uniforms: this.uniforms,
//             vertexShader,
//             fragmentShader,
//             // side: THREE.DoubleSide,
//             // wireframe: true
//         });

//         this.mesh = new THREE.Mesh(this.geometry, this.material);
//         this.mesh.rotation.x = 360;

//     }

//     /**
//      * @method
//      * @name update
//      * @description Triggered on every TweenMax tick
//      * @param {number} dt - DELTA_TIME
//      */
//     update(dt) {

//         this.uniforms.u_amplitude.value = this.options.amplitude;
//         this.uniforms.u_frequency.value = this.options.frequency;
//         this.uniforms.u_time.value += dt / 1000;

//     }

// }

// class Scene extends THREE.Scene {

//     /**
//      * @constructor
//      */
//     constructor(width, height) {

//         super();

//         this.renderer = new THREE.WebGLRenderer({ antialias: true });
//         this.renderer.setSize(width, height);
//         this.renderer.setClearColor(0x000000);

//         this.camera = new THREE.PerspectiveCamera(50, width / height, 1, 2000);
//         this.camera.position.z = 100;

//         this.controls = new OrbitControls(this.camera, this.renderer.domElement);

//     }

//     /**
//      * @method
//      * @name render
//      * @description Renders/Draw the scene
//      */
//     render() {

//         this.renderer.autoClearColor = true;
//         this.renderer.render(this, this.camera);

//     }

//     /**
//      * @method
//      * @name resize
//      * @description Resize the scene according to screen size
//      * @param {number} newWidth
//      * @param {number} newHeight
//      */
//     resize(newWidth, newHeight) {

//         this.camera.aspect = newWidth / newHeight;
//         this.camera.updateProjectionMatrix();

//         this.renderer.setSize(newWidth, newHeight);

//     }

// }

// class Options {

//     /**
// 	 * @constructor
// 	 */
//     constructor() {

//         this.amplitude = 10.0;
//         this.frequency = 0.05;

//         this.gui = new dat.GUI();

//     }

//     /**
// 	 * @method
// 	 * @name initGUI
//    * @description Initialize the dat-gui
// 	 */
//     initGUI() {

//         this.gui.close();

//         this.gui.add(this, 'amplitude', 1.0, 15.0);
//         this.gui.add(this, 'frequency', 0.01, 0.1);

//     }

// }

// new App();
