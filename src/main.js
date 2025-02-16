import * as THREE from 'three';
import {Solar} from './solar.js';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
//import './course.js';

//scene and camera
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(30,window.innerWidth/window.innerHeight,0.01,100000);
//renderer
const canvas = document.querySelector('canvas.threejs');
const renderer = new THREE.WebGLRenderer({canvas:canvas});
renderer.setSize(window.innerWidth,window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));

scene.add(camera);
//controls
const controls = new OrbitControls(camera,canvas);
controls.enableDamping = true;
controls.maxDistance = 100000;
controls.minDistance = 30;

//setup solar system
const solarSystem = Solar.CreateSystem(scene,'#0000ff',0.1);

//resize
window.addEventListener('resize',() => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth,window.innerHeight);
});

//initialize the clock
const clock = new THREE.Clock();
//update and drwa
const draw = () =>{

  solarSystem.update( clock.getDelta(),clock.getElapsedTime());
  //console.log(solarSystem.star('Earth').mesh().position);

  controls.update();
  renderer.render(scene,camera);
  window.requestAnimationFrame(draw);
};
draw();
