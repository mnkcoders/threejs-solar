import * as THREE from 'three';
import {Solar} from './solar.js';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
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
const solarSystem = Solar.CreateSystem(scene);
/*const solarSystem = new Solar();
scene.add(solarSystem.createStar('Sun','yellow',6).mesh());
scene.add(solarSystem.createStar('Mercury','orange',0.4,9,0.76,solarSystem.star('Sun')).mesh());
scene.add(solarSystem.createStar('Venus','#ddaa55',0.95,16,0.54,solarSystem.star('Sun')).mesh());
scene.add(solarSystem.createStar('Earth','blue',1,24,0.23,solarSystem.star('Sun')).mesh());
scene.add(solarSystem.createStar('Moon','grey',0.4,2,0.6,solarSystem.star('Earth')).mesh());
scene.add(solarSystem.createStar('Mars','red',0.8,32,0.16,solarSystem.star('Sun')).mesh());
scene.add(solarSystem.createStar('Jupiter','maroon',2.4,39,0.1,solarSystem.star('Sun')).mesh());
scene.add(solarSystem.createStar('Saturn','#5588cc',1.8,45,0.08,solarSystem.star('Sun')).mesh());
scene.add(solarSystem.createStar('Uranus','#ddeeff',2.1,52,0.05,solarSystem.star('Sun')).mesh());
scene.add(solarSystem.createStar('Neptune','#aabbff',2,58,0.04,solarSystem.star('Sun')).mesh());
scene.add(solarSystem.createStar('Pluto','#0055dd',0.5,69,0.024,solarSystem.star('Sun')).mesh());
*/

//resize
window.addEventListener('resize',() => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth,window.innerHeight);
});

//initialize randomly the planets
//solarSystem.initialize();

const clock = new THREE.Clock(false);
console.log(solarSystem);

//update and drwa
const draw = () =>{

  solarSystem.stars().forEach( star => star.update(clock.getDelta(),clock.getElapsedTime()));
  //console.log(solarSystem.star('Earth').mesh().position);

  controls.update();
  renderer.render(scene,camera);
  window.requestAnimationFrame(draw);
};
clock.start();
draw();
