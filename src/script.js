import * as dat from 'lil-gui'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import firefliesVertexShader from './shaders/fireflies/vertex.glsl'
import firefliesFragmentShader from './shaders/fireflies/fragment.glsl'
import portalVertexShader from './shaders/portal/vertex.glsl'
import portalFragmentShader from './shaders/portal/fragrment.glsl'





/**
 * Base
 */
// Debug
const debugObject = {}
const gui = new dat.GUI({
    width: 400
})


// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Axis helper
const axisHelper = new THREE.AxesHelper(5)
// scene.add(axisHelper)

/**
 * Loaders
 */
// Texture loader
const textureLoader = new THREE.TextureLoader()

// Draco loader
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('draco/')

// GLTF loader
const gltfLoader = new GLTFLoader()
gltfLoader.setDRACOLoader(dracoLoader)

/**
 * Textures
 */
const bakedTexture = textureLoader.load('baked.jpg')
bakedTexture.flipY = false // flip the texture


/**
 * Materials
 */
const bakedMaterial = new THREE.MeshBasicMaterial({map: bakedTexture})
bakedMaterial.side = THREE.DoubleSide
bakedTexture.colorSpace = THREE.SRGBColorSpace // fix the color

// Pole light material
const poleLightMaterial = new THREE.MeshBasicMaterial({color: 0xffffe5})
// Portal light material
debugObject.portalColorStart = '#ffa200'
debugObject.portalColorEnd = '#4c4b48'
gui.addColor(
    debugObject, 'portalColorStart')
    .onChange(()=>{
    portalLightMaterial.uniforms.uColorStart.value.set(debugObject.portalColorStart)
    })
gui.addColor(
    debugObject, 'portalColorEnd')
    .onChange(()=>{
    portalLightMaterial.uniforms.uColorEnd.value.set(debugObject.portalColorEnd)
    })

const portalLightMaterial = new THREE.ShaderMaterial({
    uniforms: {
        uTime: {value: 0},
        uColorStart: {value: new THREE.Color(
                debugObject.portalColorStart)},
        uColorEnd: {value: new THREE.Color(
                debugObject.portalColorEnd)},
    },
    vertexShader: portalVertexShader,
    fragmentShader: portalFragmentShader
})


/**
 * Model
 */
gltfLoader.load(
    'portal.glb',
    (gltf)=>{
        const bakedMesh = gltf.scene.children.find(child=> child.name === 'baked')
        const poleLightAMesh = gltf.scene.children.find(child=> child.name === 'poleLightA')
        const poleLightBMesh = gltf.scene.children.find(child=> child.name === 'poleLightB')
        const portalLightMesh = gltf.scene.children.find(child=> child.name === 'portalLight')


        bakedMesh.material = bakedMaterial
        poleLightAMesh.material = poleLightMaterial
        poleLightBMesh.material = poleLightMaterial
        portalLightMesh.material = portalLightMaterial


        scene.add(gltf.scene)
    })

/**
 * Fireflies
 */
// Geometry
const firefliesGeometry = new THREE.BufferGeometry()
const firefliesCount = 40
const positionArray = new Float32Array(firefliesCount * 3) // x,y,z
const scaleArray = new Float32Array(firefliesCount)

for (let i = 0; i < firefliesCount; i++){
    /**
     * This will fill the float32Array with position values in the scene
     * Note: Math.random() - .5 will yield numbers between -0.5 and 0.5
     * @type {number}
     */
    positionArray[i * 3] = (Math.random() - .5) * 4// x
    positionArray[i * 3 + 1] = (Math.random() * 1.5)  // y
    positionArray[i * 3 + 2] = -(Math.random() - .5)  * 4 // z

    scaleArray[i] = Math.random()
}



// In this case the name has to be 'position' so THREE can read it in the vertex
firefliesGeometry.setAttribute('position', new THREE.BufferAttribute(positionArray, 3))
firefliesGeometry.setAttribute('aScale', new THREE.BufferAttribute(scaleArray,1))
// Material
const firefliesMaterial = new THREE.ShaderMaterial({
    uniforms: {
        uPixelRatio: {value: Math.min(window.devicePixelRatio, 2)},
        uSize: {value: 100},
        uTime: {value: 0}

    },
    vertexShader: firefliesVertexShader,
    fragmentShader: firefliesFragmentShader,
    transparent: true, // Don't forget this!!
    depthWrite: false, // so particles do not block each other
    blending: THREE.AdditiveBlending // this is not good for performance
})
gui.add(firefliesMaterial.uniforms.uSize, 'value')
    .min(0)
    .max(500)
    .step(1)
    .name('firefliesSize')

// Points
const fireflies = new THREE.Points(firefliesGeometry, firefliesMaterial)
scene.add(fireflies)





/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}



window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight


    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))


    // Update fireflies
    firefliesMaterial.uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio, 2)

})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 4
camera.position.y = 2
camera.position.z = 4
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

debugObject.clearColor = '#191d20'
renderer.setClearColor(debugObject.clearColor)

gui
    .addColor(debugObject, 'clearColor')
    .onChange((newColor)=>{
        renderer.setClearColor(debugObject.clearColor)
        //This will work, you can also do:
        // renderer.setClearColor(newColor)
})



/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Animate fireflies
    firefliesMaterial.uniforms.uTime.value = elapsedTime
    portalLightMaterial.uniforms.uTime.value = elapsedTime


    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()


