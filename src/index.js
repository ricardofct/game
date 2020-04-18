"use strict";

import * as THREE from '../node_modules/three/build/three.module.js';
import { OrbitControls } from '../node_modules/three/examples/jsm/controls/OrbitControls.js';

import {
    vertexShader,
    fragmentShader
} from './shaders.js';

// export class Engine {
//     scene = new THREE.Scene();
//     camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
//     renderer = new THREE.WebGLRenderer();
//     geometry = new THREE.BoxGeometry();
//     material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
//     cube = new THREE.Mesh(this.geometry, this.material);
//     controls = new OrbitControls(this.camera, this.renderer.domElement);


//     init = () => {
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
//     const engine = new Engine();
//     engine.init();
// };

var container,
    renderer,
    scene,
    camera,
    mesh,
    start = Date.now(),
    fov = 50,
    controls;

var geometry2 = new THREE.BoxGeometry();
var material2 = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
var cube = new THREE.Mesh(geometry2, material2);

var clock = new THREE.Clock();

var timeUniform = {
    iGlobalTime: {
        type: 'f',
        value: 0.1
    },
    iResolution: {
        type: 'v2',
        value: new THREE.Vector2()
    }
};

timeUniform.iResolution.value.x = window.innerWidth;
timeUniform.iResolution.value.y = window.innerHeight;

window.addEventListener('load', function () {
    container = document.getElementById('container');
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(
        fov,
        window.innerWidth / window.innerHeight,
        1,
        10000
    );

    var axis = new THREE.AxisHelper(10);
    scene.add(axis);
    scene.add(cube);


    material = new THREE.ShaderMaterial({
        uniforms: timeUniform,
        vertexShader,
        fragmentShader
    });

    var water = new THREE.Mesh(
        new THREE.PlaneBufferGeometry(window.innerWidth, window.innerHeight, 40), material
    );
    scene.add(water);

    var geometry = new THREE.SphereGeometry(10, 32, 32);
    var material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    var sphere = new THREE.Mesh(geometry, material);
    // scene.add(sphere);

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    controls = new OrbitControls(camera, renderer.domElement);


    camera.position.x = 20;
    controls.update();
    camera.position.y = 10;
    controls.update();
    camera.position.z = 20;
    controls.update();
    camera.lookAt(scene.position);
    controls.update();
    scene.add(camera);


    container.appendChild(renderer.domElement);

    render();
});

window.addEventListener('resize', function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    controls.update();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

function render() {
    timeUniform.iGlobalTime.value += clock.getDelta();
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(render);
}