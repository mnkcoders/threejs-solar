import * as THREE from 'three';

/**
 * 
 */
function Solar(){
    this._materials = [];
    this._meshes = [];
    this._stars = {};
    this._sphereGeometry = new THREE.SphereGeometry(1,32,32);
}
/**
 * @returns {Star[]}
 */
Solar.prototype.stars = function(){
    return Object.values(this._stars);
};
/**
 * @param {String} name 
 * @returns {Star}
 */
Solar.prototype.star = function( name ){
    return this.has(name) ? this._stars[name] : null;
};
/**
 * @returns {Solar}
 */
Solar.prototype.initialize = function(){
    this.stars().forEach( star => star.update(0,Math.floor(Math.random() * 360)));
    return this;
};
/**
 * @param {String} color 
 * @param {String} texture 
 * @returns {THREE.MeshBasicMaterial}
 */
Solar.prototype.createMaterial = function( color = 'grey', texture = ''){
    this._materials.push(new THREE.MeshBasicMaterial( {color : color } ));
    return this._materials[this._materials.length- 1];
};
/**
 * @param {THREE.MeshBasicMaterial} material 
 * @returns {THREE.Mesh}
 */
Solar.prototype.createMesh = function( material ){
    if( material instanceof THREE.MeshBasicMaterial){
        this._meshes.push( new THREE.Mesh(this._sphereGeometry,material));
        return this._meshes[this._meshes.length-1];
    }
    return null;
};
/**
 * @param {String} name 
 * @returns {Boolean}
 */
Solar.prototype.has = function( name = '' ){
    return name.length && this._stars.hasOwnProperty(name);
};
/**
 * @param {String} name 
 * @param {String} color 
 * @param {Number} radius 
 * @param {Number} distance 
 * @param {Number} speed 
 * @returns {Star}
 */
Solar.prototype.createStar = function( name = '', color = 'grey', radius=  1 , distance = 0 , speed = 0.01 , parent = null){
    if( !this.has(name)){
        const mesh = this.createMesh(this.createMaterial(color));
        mesh.scale.setScalar(radius);
        const star = new Star(mesh,name,radius,distance,speed);
        this._stars[star.name()] = star.setParent(parent);
        
        return star;
    }
    return null;
};
/**
 * @returns {Star}
 */
Solar.prototype.sun = function(){
    return this._stars.length ? this._stars[0] : null;
}
/**
 * @returns {Boolean}
 */
Solar.prototype.empty = function(){
    return this.sun() !== null;
};

/**
 * 
 * @param {THREE.Mesh} mesh 
 * @param {String} name 
 * @param {Number} radius 
 * @param {Number} distance 
 * @param {Number} speed 
 */
function Star( mesh , name  = 'planet', radius = 1, distance = 0 , speed = 0.01){
    this._mesh = mesh || null;
    this._radius = radius;
    this._distance = distance;
    this._speed = speed;

    this._name = name;
    this._parent = null;
    //this._children = [];
};
/**
 * @returns {THREE.Mesh};
 */
Star.prototype.mesh = function(){
    return this._mesh;
};
/**
 * @returns {Boolean}
 */
Star.prototype.isValid = function(){
    return this._mesh !== null && this._mesh instanceof THREE.Mesh;
};
/**
 * @param {Star} star 
 * @returns {Star}
 */
Star.prototype.setParent = function( star = null ){
    if( star instanceof Star ){
        this._parent = star;
    }
    return this;
};
/**
 * @returns {Boolean}
 */
Star.prototype.hasParent = function(){
    return this._parent !== null;
};
/**
 * @param {Star} star 
 * @returns {Star}
 */
Star.prototype.addChild = function( star = null) {
    if( star instanceof Star ){
        this._children.push(star);
    }
    return this;
};
/**
 * @returns {String}
 */
Star.prototype.name = function(){
    return this._name;
};
/**
 * @param {Number} delta 
 * @param {Number} elapsed
 * @returns {Star}
 */
Star.prototype.update = function(delta = 0,elapsed = 0){
    if( this.distance()){
        this._mesh.position.x = this.x() + Math.sin( elapsed * this.speed()) * this.distance();
        this._mesh.position.z = this.z() + Math.cos( elapsed * this.speed()) * this.distance();
        this._mesh.position.y = Math.cos( elapsed ) * this.speed() ;    
    }
    this._mesh.rotation.y += this.speed(delta);
    return this;
};
/**
 * @param {Number} delta 
 * @returns {Number}
 */
Star.prototype.speed = function( delta = 1 ){
    return this._speed * delta;
};
/**
 * @returns {Number}
 */
Star.prototype.x = function( ){
    return this.hasParent() ? this._parent.mesh().position.x:  0;
};
/** 
 * @returns {Number}
 */
Star.prototype.z = function( ){
    return this.hasParent() ? this._parent.mesh().position.z:  0;
};
/**
 * @returns {Number}
 */
Star.prototype.distance = function(){
    return this._distance;
}
/**
 * @returns {Number}
 */
Star.prototype.radius = function(){
    return this._radius;
};





export {Solar,Star};

