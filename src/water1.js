"use strict";

import * as THREE from '../node_modules/three/build/three.module.js';
import { OrbitControls } from '../node_modules/three/examples/jsm/controls/OrbitControls.js';

import { Water } from '../node_modules/three/examples/jsm/objects/Water2.js';
import { Sky } from '../node_modules/three/examples/jsm/objects/Sky.js';

export class Engine {
    constructor() {
        this.scene = new Scene();

        const textureLoader = new THREE.TextureLoader();
        const normalMap0 = textureLoader.load('/src/assets/Water_1_M_Normal.jpg');
        const normalMap1 = textureLoader.load('/src/assets/Water_2_M_Normal.jpg');

        this.scene.add(new Ocean());

        const water = new Water(new THREE.PlaneGeometry(20, 20, 32), {
            normalMap0,
            normalMap1,
        })

        water.rotation.x = - Math.PI / 2;
        water.position.y = 1;
        this.scene.add(water);
        this.scene.add(new THREE.AxesHelper(5));

        this.animate();
    }

    animate = () => {
        requestAnimationFrame(this.animate);
        this.scene.update();
    };
}

window.onload = () => {
    new Engine();
};

class Ocean extends THREE.Mesh {
    constructor() {
        super(
            new THREE.PlaneGeometry(20, 20, 32),
            new THREE.MeshBasicMaterial({ color: 0x00ff00, side: THREE.DoubleSide })
        )
        this.rotation.x = Math.PI / 2;
    }
}

class Scene extends THREE.Scene {
    constructor() {
        super();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.z = 20;
        this.camera.position.y = 10;
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.update();
    }

    update() {
        this.controls.update();
        this.renderer.render(this, this.camera);
    }
}
