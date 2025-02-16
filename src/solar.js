import * as THREE from 'three';

/**
 * @type {Solar}
 * @param {Number} scale
 * @param {Number} speed
 * @param {String} background
 */
function Solar(scale = 1, speed = 1) {
    this._materials = [];
    this._meshes = [];
    this._stars = {};
    this._sphereGeometry = new THREE.SphereGeometry(1, 32, 32);
    this._textureLoader = new THREE.TextureLoader();

    this._lightColor = '#000000';
    this._lightRange = 0;

    this._scale = scale;
    this._speed = speed;
}
/**
 * @param {String} lightColor
 * @param {Number} intensity
 * @returns {String}
 */
Solar.prototype.setAmbientLight = function (lightColor = '#000000', intensity = 0) {
    this._lightColor = lightColor;
    this._lightRange = intensity;
    return this;
};
/**
 * @returns {String}
 */
Solar.prototype.lightColor = function () {
    return this._light;
};
/**
 * @returns {Number}
 */
Solar.prototype.lightIntensity = function () {
    return this._lightRange;
};
/**
 * @param {Number} scale 
 * @returns {Solar} 
 */
Solar.prototype.setScale = function (scale = 1) {
    this._scale = scale;
    return this;
};
/**
 * @param {Number} speed 
 * @returns {Solar} 
 */
Solar.prototype.setSpeed = function (speed = 1) {
    this._speed = speed;
    return this;
};
/**
 * @returns {Number}
 */
Solar.prototype.scale = function () {
    return this._scale;
};
/**
 * @returns {Number}
 */
Solar.prototype.speed = function () {
    return this._speed;
};
/**
 * @param {Number} delta 
 * @param {Number} elapsed 
 * @returns {Solar}
 */
Solar.prototype.update = function (delta = 0, elapsed = 0) {
    this.stars().forEach(star => star.update(delta, elapsed, this.scale(), this.speed()));
    return this;
};
/**
 * @returns {Star[]}
 */
Solar.prototype.stars = function () {
    return Object.values(this._stars);
};
/**
 * @param {String} name 
 * @returns {Star}
 */
Solar.prototype.star = function (name = '') {
    return this.has(name) ? this._stars[name] : null;
};
/**
 * @returns {Solar}
 */
Solar.prototype.initialize = function () {
    this.stars().forEach(star => star.update(0, Math.floor(Math.random() * 360)));
    return this;
};
/**
 * @param {String} color 
 * @param {String} texture 
 * @param {Boolean} fullLight
 * @returns {THREE.MeshBasicMaterial}
 */
Solar.prototype.createMaterial = function (color = 'grey', texture = '', fullLight = false) {

    const textureMap = this.loadTexture(texture);
    const properties = textureMap ? { map: textureMap } : { color: color };

    const material = fullLight ?
        new THREE.MeshBasicMaterial(properties) :
        new THREE.MeshStandardMaterial(properties);
    this._materials.push(material);
    return this._materials[this._materials.length - 1];
};
/**
 * @param {String} texture 
 * @returns {THREE.Texture}
 */
Solar.prototype.loadTexture = function (texture = '') {
    if (texture && texture.length) {
        return this._textureLoader.load(`static/textures/${texture}`);
    }
    return null;
};
/**
 * @param {THREE.MeshBasicMaterial} material 
 * @returns {THREE.Mesh}
 */
Solar.prototype.createMesh = function (material) {
    if (material instanceof THREE.Material) {
        this._meshes.push(new THREE.Mesh(this._sphereGeometry, material));
        return this._meshes[this._meshes.length - 1];
    }
    return null;
};
/**
 * @param {String} name 
 * @returns {Boolean}
 */
Solar.prototype.has = function (name = '') {
    return name.length && this._stars.hasOwnProperty(name);
};
/**
 * @param {String} name 
 * @param {String} color 
 * @param {Number} radius 
 * @param {Number} distance 
 * @param {Number} speed 
 * @param {Solar} parent
 * @param {String} texture 
 * @param {Boolean} fullLight
 * @returns {Star}
 */
Solar.prototype.createStar = function (name = '', color = 'grey', radius = 1, distance = 0, speed = 0.01, parent = null, texture = '', fullLight = false) {
    if (!this.has(name)) {
        const mesh = this.createMesh(this.createMaterial(color, texture, fullLight));
        if (fullLight) {
            const light = new THREE.PointLight(color, radius * 50, 0, 1.5);
            //console.log(light);
            //light.position.set( 0 , 0 , 0 );
            mesh.add(light);
        }
        //console.log(mesh);
        const star = new Star(mesh, name, radius, distance, speed);
        this._stars[star.name()] = star.setParent(parent);

        return star;
    }
    return null;
};
/**
 * @returns {Star}
 */
Solar.prototype.sun = function () {
    return this._stars.length ? this._stars[0] : null;
}
/**
 * @returns {Boolean}
 */
Solar.prototype.empty = function () {
    return this.sun() !== null;
};
/**
 * @param {THREE.Scene} scene 
 * @param {String} lightColor
 * @param {Number} lightRange
 * @returns {Solar}
 */
Solar.CreateSystem = function (scene = null) {

    const solar = new Solar();

    const ambient = Loader.ambientLight();
    if (ambient.intensity) {
        solar.setAmbientLight(ambient.color, ambient.intensity);
    }
    //preload using loader
    Loader.templates().forEach(tpl => {
        solar.createStar(
            tpl.name,
            tpl.color,
            tpl.radius,
            tpl.distance,
            tpl.speed,
            solar.star(tpl.parent || ''),
            tpl.texture || '',
            tpl.lightEmitter || solar.stars().length === 0,
        );
    });


    if (scene !== null && scene instanceof THREE.Scene) {
        solar.stars().map(star => star.mesh()).forEach(mesh => scene.add(mesh));
        if (solar.lightIntensity()) {
            const ambientLight = new THREE.AmbientLight(solar.lightColor(), solar.lightIntensity());
            scene.add(ambientLight);
        }
        //use cubemap when scaled and look cool
        //scene.background = Loader.createCubeMap();
        scene.background = Loader.createTexture(Loader.background());
        console.log(scene.background);
    }

    return solar.initialize();
};


/**
 * @type {Star}
 * @param {THREE.Mesh} mesh 
 * @param {String} name 
 * @param {Number} radius 
 * @param {Number} distance 
 * @param {Number} speed 
 */
function Star(mesh, name = 'planet', radius = 1, distance = 0, speed = 0.01) {
    this._name = name;
    this._radius = radius || 1;
    this._distance = distance || 0;
    this._speed = speed || 0.01;

    this._mesh = mesh || null;
    this._parent = null;

    this._offset = Math.floor(Math.random() * 360);

    return this.initialize();
};
/**
 * @returns {Star}
 */
Star.prototype.initialize = function () {
    if (this._mesh) {
        this._mesh.scale.setScalar(this._radius);
    }
    return this;
};
/**
 * @returns {THREE.Mesh};
 */
Star.prototype.mesh = function () {
    return this._mesh;
};
/**
 * @returns {Boolean}
 */
Star.prototype.isValid = function () {
    return this._mesh !== null && this._mesh instanceof THREE.Mesh;
};
/**
 * @param {Star} star 
 * @returns {Star}
 */
Star.prototype.setParent = function (star = null) {
    if (star instanceof Star) {
        this._parent = star;
    }
    return this;
};
/**
 * @returns {Boolean}
 */
Star.prototype.hasParent = function () {
    return this._parent !== null;
};
/**
 * @param {Star} star 
 * @returns {Star}
 */
Star.prototype.addChild = function (star = null) {
    if (star instanceof Star) {
        this._children.push(star);
    }
    return this;
};
/**
 * @returns {String}
 */
Star.prototype.name = function () {
    return this._name;
};
/**
 * @param {Number} delta 
 * @param {Number} elapsed
 * @param {Number} scale
 * @param {Number} speed
 * @returns {Star}
 */
Star.prototype.update = function (delta = 0, elapsed = 0, scale = 1, speed = 1) {
    if (this.distance()) {
        const translation = this._offset + elapsed * this.speed() * speed;
        this._mesh.position.x = this.x() + Math.sin(translation) * this.distance() * scale;
        this._mesh.position.z = this.z() + Math.cos(translation) * this.distance() * scale;
        this._mesh.position.y = Math.cos(elapsed) * this.speed(delta) * scale;
    }
    this._mesh.rotation.y += this.speed(delta);
    return this;
};
/**
 * @param {Number} delta 
 * @returns {Number}
 */
Star.prototype.speed = function (delta = 1) {
    return this._speed * delta;
};
/**
 * @returns {Number}
 */
Star.prototype.x = function () {
    return this.hasParent() ? this._parent.mesh().position.x : 0;
};
/** 
 * @returns {Number}
 */
Star.prototype.z = function () {
    return this.hasParent() ? this._parent.mesh().position.z : 0;
};
/**
 * @returns {Number}
 */
Star.prototype.distance = function () {
    return this._distance;
}
/**
 * @returns {Number}
 */
Star.prototype.radius = function () {
    return this._radius;
};


/**
 * Solar System template loader
 */
function Loader() {
    throw `${this.constructor} is a static class`;
};
/**
 * @returns {Object[]}
 */
Loader.templates = function () {
    return this.template1();
};
/**
 * @returns {Object}
 */
Loader.ambientLight = function () {
    return {
        'color': '#0000ff',
        'intensity': 0.1,
    };
}
/**
 * @returns {String}
 */
Loader.background = function () {
    return '2k_stars_milky_way.jpg';
};
/**
 * @returns {THREE.TextureLoader}
 */
Loader.textureLoader = function(){
    if( typeof this._textureLoader === 'undefined'){
        this._textureLoader = new THREE.TextureLoader();
    }
    return this._textureLoader;
};
/**
 * @returns {THREE.CubeTextureLoader}
 */
Loader.cubeMapLoader = function(){
    if( typeof this._cubeTextureLoader === 'undefined'){
        this._cubeTextureLoader = new THREE.CubeTextureLoader();
    }
    return this._cubeTextureLoader;
};
/**
 * @param {String} texture 
 * @returns {THREE.Texture}
 */
Loader.createTexture = function( texture = '' ){
    if (texture && texture.length) {
        return this.textureLoader().load(`static/textures/${texture}`);
    }
    return null;
};

/**
 * @param {String} folder 
 * @returns {THREE.CubeTexture}
 */
Loader.createCubeMap = function ( folder = 'background' , scale = 1) {
    return this.cubeMapLoader().setPath(`static/textures/${folder}/`).load([
        'px.png',
        'nx.png',
        'py.png',
        'ny.png',
        'pz.png',
        'nz.png',
    ]);
};
/**
 * Real proportional scale to earth's 1 radius and 0.3 speed
 * @returns {Object[]}
 */
Loader.template2 = function () {
    return [
        { 'name': 'Sun', 'color': '#FFD700', 'radius': 10, 'speed': 0.07, 'texture': '2k_sun.jpg' },
        { 'name': 'Mercury', 'color': '#B1B1B1', 'radius': 0.38, 'distance': 40, 'speed': 0.48, 'parent': 'Sun', 'texture': '2k_mercury.jpg' },
        { 'name': 'Venus', 'color': '#D4AF37', 'radius': 0.95, 'distance': 100, 'speed': 0.54, 'parent': 'Sun', 'texture': '2k_venus_surface.jpg' },
        { 'name': 'Earth', 'color': '#3F51B5', 'radius': 1, 'distance': 150, 'speed': 0.3, 'parent': 'Sun', 'texture': '2k_earth_daymap.jpg' },
        { 'name': 'Moon', 'color': '#C0C0C0', 'radius': 0.27, 'distance': 6, 'speed': 0.01, 'parent': 'Earth', 'texture': '2k_moon.jpg' },
        { 'name': 'Mars', 'color': '#FF4500', 'radius': 0.53, 'distance': 200, 'speed': 0.24, 'parent': 'Sun', 'texture': '2k_mars.jpg' },
        { 'name': 'Jupiter', 'color': '#D2691E', 'radius': 5, 'distance': 300, 'speed': 0.13, 'parent': 'Sun', 'texture': 'jupiter.jpg' },
        { 'name': 'Saturn', 'color': '#F4A460', 'radius': 3, 'distance': 350, 'speed': 0.1, 'parent': 'Sun', 'texture': 'saturn_2k.jpg' },
        { 'name': 'Uranus', 'color': '#00CED1', 'radius': 2, 'distance': 450, 'speed': 0.07, 'parent': 'Sun', 'texture': 'uranus_2k.jpg' },
        { 'name': 'Neptune', 'color': '#1E90FF', 'radius': 2, 'distance': 500, 'speed': 0.06, 'parent': 'Sun', 'texture': 'neptune_2k.jpg' },
        { 'name': 'Pluto', 'color': '#DEB887', 'radius': 0.1, 'distance': 600, 'speed': 0.05, 'parent': 'Sun', 'texture': 'plutomap1k.jpg' },
    ];
};
/**
 * @returns {Object[]}
 */
Loader.template1 = function () {
    return [
        { 'name': 'Sun', 'color': '#FFD7D7', 'radius': 6, 'speed': 0.1, 'texture': '2k_sun.jpg' },
        { 'name': 'Mercury', 'color': '#B1B1B1', 'radius': 0.3, 'distance': 9, 'speed': 0.76, 'parent': 'Sun', 'texture': '2k_mercury.jpg' },
        { 'name': 'Venus', 'color': '#D4AF37', 'radius': 0.95, 'distance': 16, 'speed': 0.54, 'parent': 'Sun', 'texture': '2k_venus_surface.jpg' },
        { 'name': 'Earth', 'color': '#3F51B5', 'radius': 1, 'distance': 24, 'speed': 0.23, 'parent': 'Sun', 'texture': '2k_earth_daymap.jpg' },
        { 'name': 'Moon', 'color': '#C0C0C0', 'radius': 0.3, 'distance': 2, 'speed': 0.6, 'parent': 'Earth', 'texture': '2k_moon.jpg' },
        { 'name': 'Mars', 'color': '#FF4500', 'radius': 0.8, 'distance': 32, 'speed': 0.16, 'parent': 'Sun', 'texture': '2k_mars.jpg' },
        { 'name': 'Phobos', 'color': '#9A9ACA', 'radius': 0.1, 'distance': 2, 'speed': 0.1, 'parent': 'Mars' },
        { 'name': 'Deimos', 'color': '#DACACA', 'radius': 0.2, 'distance': 3, 'speed': 0.08, 'parent': 'Mars' },
        { 'name': 'Jupiter', 'color': '#D2691E', 'radius': 2.4, 'distance': 39, 'speed': 0.1, 'parent': 'Sun', 'texture': 'jupiter.jpg' },
        { 'name': 'Saturn', 'color': '#F4A460', 'radius': 1.8, 'distance': 45, 'speed': 0.08, 'parent': 'Sun', 'texture': 'saturn_2k.jpg' },
        { 'name': 'Uranus', 'color': '#00CED1', 'radius': 2.1, 'distance': 52, 'speed': 0.05, 'parent': 'Sun', 'texture': 'uranus_2k.jpg' },
        { 'name': 'Neptune', 'color': '#1E90FF', 'radius': 2.2, 'distance': 58, 'speed': 0.04, 'parent': 'Sun', 'texture': 'neptune_2k.jpg' },
        { 'name': 'Pluto', 'color': '#DEB887', 'radius': 0.5, 'distance': 70, 'speed': 0.024, 'parent': 'Sun', 'texture': 'plutomap1k.jpg' },
    ];
};

export { Solar, Star };

