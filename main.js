import './tailwind.css'
import gsap from 'gsap'
import * as THREE from 'three'
import countries from './countries.json'
import vertexShader from './shaders/vertex.glsl'
import fragmentShader from './shaders/fragment.glsl'
import atmosphereVertexShader from './shaders/atmosphereVertex.glsl'
import atmosphereFragmentShader from './shaders/atmosphereFragment.glsl'

console.log(countries)
const CanvasContainer = document.querySelector('#CanvasContainer')
const scene = new THREE.Scene()
let camera = new THREE.PerspectiveCamera(
    75,
    CanvasContainer.offsetWidth/CanvasContainer.offsetHeight,
    0.1,
    1000
)

const renderer = new THREE.WebGL1Renderer(
  {
    antialias:true,
    canvas: document.querySelector('canvas')
  }
)
renderer.setSize(CanvasContainer.offsetWidth, CanvasContainer.offsetHeight)
renderer.setPixelRatio(window.devicePixelRatio)

const sphere = new THREE.Mesh(new THREE.SphereGeometry(5,50,50), new THREE.ShaderMaterial({
    vertexShader,
   fragmentShader,
    uniforms:{
      globeTexture:{
        value: new THREE.TextureLoader().load('/assets/earth.jpg')
      }
    }
    
})) 
scene.add(sphere)
// create atmosphere 
const atmosphere = new THREE.Mesh(new THREE.SphereGeometry(5,50,50), new THREE.ShaderMaterial({
  vertexShader: atmosphereVertexShader,
  fragmentShader: atmosphereFragmentShader,
  blending: THREE.AdditiveBlending,
  side: THREE.BackSide
}))
atmosphere.scale.set(1.1,1.1,1.1) 
scene.add(atmosphere)
const group = new THREE.Group()
group.add(sphere)
scene.add(group)
const starGeometry = new THREE.BufferGeometry()
const starMaterial = new THREE.PointsMaterial({
  color: 0xffffff
})
const starVertices = []
for (let i = 0; i<10000; i++) {
  const x = (Math.random() - 0.5) * 2000
  const y = (Math.random() - 0.5) * 2000
  const z = -Math.random() * 3000
  starVertices.push(x,y,z)
}
starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices,3))
const stars = new THREE.Points(starGeometry,starMaterial)
scene.add(stars)
camera.position.z = 15

function createBox({lat, lng, country, population}) {
  const box = new THREE.Mesh(new THREE.BoxGeometry(0.2,0.2,0.8), new THREE.MeshBasicMaterial({
    color: '#3bf7ff',
    opacity: 0.5,
    transparent: true,
  }) 
  )
  const latitdute = (lat /180) * Math.PI
  const longitude = (lng /180) * Math.PI
  const radius = 5
  
  const x = radius * Math.cos(latitdute) * Math.sin(longitude)
  const y = radius * Math.sin(latitdute)
  const z = radius * Math.cos(latitdute) * Math.cos(longitude)
  
  box.position.z = z
  box.position.x = x
  box.position.y = y

  box.lookAt(0,0,0)
  box.geometry.applyMatrix4(new THREE.Matrix4().makeTranslation(0,0,-0.3))
  group.add(box)

  gsap.to(box.scale, {
    z:1.4 ,
    duration:2,
    yoyo:true,
    repeat:-1,
    ease:'linear',
    delay: Math.random() 
  })
  box.country= country
  box.population= population
}

function createBoxes(countries) {
  countries.forEach((country)=>{
    if (!country.latlng) {
      console.warn(`Kraj "${country.name}" nie ma danych latlng.`);
      return; // Przerywamy działanie dla tego kraju
    }
  const scale = country.population / 1000000000
  const lat = country.latlng[0]
  const lng = country.latlng[1]
  const Zscale = 0.8 * scale
  const box = new THREE.Mesh(new THREE.BoxGeometry(Math.max(0.1,0.2 * scale),Math.max(0.1,0.2 *scale),Math.max(Zscale, 0.4 * Math.random())), new THREE.MeshBasicMaterial({
    color: '#3bf7ff',
    opacity: 0.5,
    transparent: true,
  }) 
  )
  const latitdute = (lat /180) * Math.PI
  const longitude = (lng /180) * Math.PI
  const radius = 5
  
  const x = radius * Math.cos(latitdute) * Math.sin(longitude)
  const y = radius * Math.sin(latitdute)
  const z = radius * Math.cos(latitdute) * Math.cos(longitude)
  
  box.position.z = z
  box.position.x = x
  box.position.y = y

  box.lookAt(0,0,0)
  box.geometry.applyMatrix4(new THREE.Matrix4().makeTranslation(0,0,-Zscale/2))
  group.add(box)

  gsap.to(box.scale, {
    z:1.4 ,
    duration:2,
    yoyo:true,
    repeat:-1,
    ease:'linear',
    delay: Math.random() 
  })
  box.country= country.name
  box.population= new Intl.NumberFormat().format(country.population)
})
}

createBoxes(countries)
// //51.9194° N, 19.1451° E = poland
// createBox({lat:51.9194, lng:19.1451, country: 'Poland', population:'40,848,650'})

// //35.8617° N, 104.1954° E = china
// createBox({lat:35.8617,lng:104.1954, country:'China', population:'1,425,671,352'})

// //-14.2350° S, -51.9253° W = brasil
// createBox({lat:-14.2350,lng:-51.9253, country:'Brasil', population:'4,873,048'})

// //52.3555° N, 1.1743° W = england
// createBox({lat:52.3555,lng: -1.1743, country:'England', population:'67,785,908'})

// //60.4720° N, 8.4689° E = norway
// createBox({lat:60.4720, lng:8.4689, country:'Norway', population:'5,480,286'})

// //26.8206° N, 30.8025° E = egypt
// createBox({lat:26.8206, lng:30.8025, country:'Egypt', population:'112,973,610'})

// //-30.5595° S, 22.9375° E = south africa
// createBox({lat:-30.5595, lng:22.9375, country:'South Africa', population:'60,495,373'})

// //37.0902° N, 95.7129° W = USA
// createBox({lat:37.0902,lng:-95.7129, country:'USA', population:'339,996,563'})

// //23.6345° N, 102.5528° W = mexico
// createBox({lat:23.6345,lng:-102.5528, country:'Mexico', population:'128,455,567'})
sphere.rotation.y = -Math.PI / 2
group.rotation.offset = {
  x:0,
  y:0
}
const mouse = {
  x:undefined,
  y:undefined,
  down:false,
  xPrev:undefined,
  yPrev:undefined
}
const pointer = new THREE.Vector2()
const raycaster = new THREE.Raycaster()
const popout = document.querySelector('#popout')
const populationEl = document.querySelector('#populationEl')
const numberEl = document.querySelector('#numberEl')
function animate() {
    requestAnimationFrame(animate)
    renderer.render(scene,camera)

    //group.rotation.y += 0.002
    //group.rotation.x -= 0.00001
    //if(pointer.x){ 
    //gsap.to(group.rotation, {
     // x:-pointer.y * 1.8,
     // y: pointer.x * 1.8,
     // duration: 2
   // })
 // }
 // update the picking ray with the camera and pointer position
 raycaster.setFromCamera(pointer,camera)

 // calculate objects intersecting the picking ray
 const intersects = raycaster.intersectObjects( group.children.filter((mesh) =>{
  return mesh.geometry.type === 'BoxGeometry'
 }) )

 group.children.forEach((mesh) =>{
  mesh.material.opacity = 0.4
 })
 gsap.set(popout,{
  display:'none'
 })
 
 for ( let i = 0; i < intersects.length; i ++ ) {
  const box = intersects[i].object
   box.material.opacity = 1
   gsap.set(popout,{
    display:'block'
   })
   populationEl.innerHTML= box.country
   numberEl.innerHTML=box.population
 }
 

 renderer.render(scene,camera )

}
animate()

CanvasContainer.addEventListener('mousedown', ({clientX,clientY})=>{
  mouse.down= true
  mouse.xPrev=clientX
  mouse.yPrev=clientY
})
addEventListener('mouseup', (event)=>{
  mouse.down = false 
})
addEventListener('mousemove', (event)=>{
  mouse.x = ((event.clientX - innerWidth /2) / (innerWidth / 2)) * 2-1
	mouse.y = - ( event.clientY / innerHeight  ) * 2 + 1

  gsap.set(popout,{
    x:event.clientX ,
    y:event.clientY 
  })
  if(mouse.down){ 
    event.preventDefault()
  console.log('turne')
  const deltaX = event.clientX - mouse.xPrev
  const deltaY = event.clientY - mouse.yPrev
  
  group.rotation.offset.x += deltaY * 0.005
  group.rotation.offset.y += deltaX * 0.005
  gsap.to(group.rotation, {
    y:group.rotation.offset.y,
    x:group.rotation.offset.x,
    duration:2
  })
  //group.rotation.y += 
  //group.rotation.x += 
  mouse.xPrev = event.clientX
  mouse.yPrev = event.clientY
  }
})
function onPointerMove( event ) {

	// calculate pointer position in normalized device coordinates
	// (-1 to +1) for both components
  if(innerWidth > 1280) { 
	pointer.x = (((event.clientX + 1) - innerWidth /2) / (innerWidth / 2)) * 2-1
	pointer.y = - ( event.clientY / innerHeight  ) * 2 + 1
  } else {
    const offset = CanvasContainer.getBoundingClientRect().top
    pointer.x = ((event.clientX + 5)/ innerWidth) * 2-1
	  pointer.y = - ((event.clientY - offset) / innerHeight  ) * 2 + 1
  }
  gsap.set(popout,{
    x:event.clientX ,
    y:event.clientY 
  })

}
window.addEventListener( 'pointermove', onPointerMove )
 
addEventListener('resize', ()=>{
  renderer.setSize(CanvasContainer.offsetWidth, CanvasContainer.offsetHeight)
  camera = new THREE.PerspectiveCamera(
    75,
    CanvasContainer.offsetWidth/CanvasContainer.offsetHeight,
    0.1,
    1000
)
    camera.position.z = 15
})



