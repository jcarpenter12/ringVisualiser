import {
    WebGLRenderer,
    Scene,
    PerspectiveCamera,
    PointLight,
    Mesh,
    Line,
    Color
} from 'three';
import loop from 'raf-loop';
import WAGNER from '@superguigui/wagner';
import BloomPass from '@superguigui/wagner/src/passes/bloom/MultiPassBloomPass';
import FXAAPass from '@superguigui/wagner/src/passes/fxaa/FXAAPass';
import resize from 'brindille-resize';
import Sphere from './objects/Sphere';
import Circle from './objects/Circle';
import OrbitControls from './controls/OrbitControls';
import {
    gui
} from './utils/debug';

//audio analyser and averager 
import audioPlayer from 'web-audio-player';
import createAnalyser from 'web-audio-analyser';
import average from 'analyser-frequency-average';
import createAudioContext from 'ios-safe-audio-context';

//utilities
import player from './utils/audioplayer';
import {
    audioUtil,
    analyser,
    bands,
    waveform
} from './utils/analyser';

/* Custom settings */
const SETTINGS = {
    useComposer: false,
    rotateX: false,
    rotateY: false,
    rotateAntiX: false,
    rotateAntiY: false,
    centre: false,
    colourFrequencies: false,
    freqRotate: false,
    vertMess: false
};

/* Init renderer and canvas */
const container = document.body;
const renderer = new WebGLRenderer({
    antialias: true
});
renderer.setClearColor(0x000000);
container.style.overflow = 'hidden';
container.style.margin = 0;
container.appendChild(renderer.domElement);

/* Composer for special effects */
const composer = new WAGNER.Composer(renderer);
const bloomPass = new BloomPass();
const fxaaPass = new FXAAPass();

/* Main scene and camera */
const scene = new Scene();
const camera = new PerspectiveCamera(50, resize.width / resize.height, 0.1, 2000);

const controls = new OrbitControls(camera, {
    element: renderer.domElement,
    distance: 100,
    phi: Math.PI * 0.5
});
const origCameraPos = camera.position.clone();
const origCameraRot = camera.rotation.clone();
//const origControlCentre = controls.center.clone();

/* Lights */
// const frontLight = new PointLight(0xFFFFFF, 1);
// const backLight = new PointLight(0xFFFFFF, 0.5);
// scene.add(frontLight);
// scene.add(backLight);
// frontLight.position.x = 20;
// backLight.position.x = -20;

/* Actual content of the scene */

//Add circles
var circles = [];
for (var i = 0; i <= 100; i++) {
    var circle = new Circle();
    circle.scale.x += i;
    circle.scale.y += i;
    circle.scale.z += i;
    circle.position.z -= i;
    circle.children[0].material.transparent = true;
    scene.add(circle);
    circles.push(circle);
}

var cScaleX = circle.scale.x;
var cScaleY = circle.scale.y;
var cScaleZ = circle.scale.z;


/* Various event listeners */
resize.addListener(onResize);

/* create and launch main loop */
const engine = loop(render);
engine.start();

/* some stuff with gui */
gui.add(SETTINGS, 'useComposer');
gui.add(SETTINGS, 'rotateX');
gui.add(SETTINGS, 'rotateY');
gui.add(SETTINGS, 'rotateAntiX');
gui.add(SETTINGS, 'rotateAntiY');
gui.add(SETTINGS, 'centre');
gui.add(SETTINGS, 'colourFrequencies');
gui.add(SETTINGS, 'vertMess');
gui.add(SETTINGS, 'freqRotate');



/* -------------------------------------------------------------------------------- */

/**
  Resize canvas
*/
function onResize() {
    camera.aspect = resize.width / resize.height;
    camera.updateProjectionMatrix();
    renderer.setSize(resize.width, resize.height);
    composer.setSize(resize.width, resize.height);
}
/**
  Render loop
*/
//camera.lookAt(scene.position);
// time variable
var time = 0;
var rotation = 0.01;

function render(dt) {
    controls.update();

    //camera rotation

    var x = camera.position.x,
        y = camera.position.y,
        z = camera.position.z;

    camera.lookAt(scene.position);

    //Frequency and amplitude data
    var freqs = audioUtil.frequencies();
    var waveform = audioUtil.waveform();

    function map_range(value, low1, high1, low2, high2) {
        return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
    }
    //update average of bands
    var subAvg = average(analyser, freqs, bands.sub.from, bands.sub.to);
    var lowAvg = average(analyser, freqs, bands.low.from, bands.low.to);
    var midAvg = average(analyser, freqs, bands.mid.from, bands.mid.to);
    var highAvg = average(analyser, freqs, bands.high.from, bands.high.to);

    //amplitude
    var amp = average(analyser, waveform, 225, 256);

    var subCol = map_range(subAvg, 0.5, 1, 0, 80);
    var lowCol = map_range(lowAvg, 0.5, 1, 0, 80);
    var midCol = map_range(midAvg, 0.5, 1, 0, 80);
    var highCol = map_range(highAvg, 0.5, 1, 0, 80);
    var offset = (amp/1000);

    for (var i = 0; i < circles.length; i++) {
        if (circles[i].scale.x > circles.length) {
            circles[i].scale.x = 1 + i;
            circles[i].scale.y = 1 + i;
            circles[i].scale.z = 1 + i;
            circles[i].children[0].material.opacity = 0.3;
            circles[i].children[0].geometry.vertices = circles[i].origVert;
            circles[i].children[0].geometry.verticesNeedUpdate = true;
        }
        if(SETTINGS.vertMess){
            for(var j = 0; j < circles[i].children[0].geometry.vertices.length; j++){
                var vert = circles[i].children[0].geometry.vertices[j];
                if (Math.floor(Math.random() * 2) === 0) {
                    vert.x += offset;
                    vert.y += offset;
                    vert.z += offset;
                }
                else{
                    vert.x -= offset;
                    vert.y -= offset;
                    vert.z -= offset;
                }
                circles[i].children[0].geometry.verticesNeedUpdate = true;
                circles[i].children[0].geometry.vertices = circles[i].origVert;
            }
        }
              
        circles[i].scale.x += 0.1 + amp / 10;
        circles[i].scale.y += 0.1 + amp / 10;
        circles[i].scale.z += 0.1 + amp / 10;

        circles[i].children[0].material.opacity -= 0.05;
        if (amp > 0.6) {
            circles[i].children[0].material.opacity = amp;
            circles[i].scale.x += amp;
            circles[i].scale.y += amp;
            circles[i].scale.z += amp;
        } 
    }

    if (SETTINGS.useComposer) {
        composer.reset();
        composer.render(scene, camera);
        composer.pass(bloomPass);
        composer.pass(fxaaPass);
        composer.toScreen();
    } else {
        renderer.render(scene, camera);
    }
    if (SETTINGS.rotateX) {
        camera.position.x = x * Math.cos(rotation) + z * Math.sin(rotation);
        camera.position.z = z * Math.cos(rotation) - x * Math.sin(rotation);
    }
    if (SETTINGS.rotateY) {
        camera.position.y = y * Math.cos(rotation) + z * Math.sin(rotation);
        camera.position.z = z * Math.cos(rotation) - x * Math.sin(rotation);
        camera.zoom = 1;
    }
    if (SETTINGS.rotateAntiX) {
        camera.position.x = x * Math.cos(rotation) - z * Math.sin(rotation);
        camera.position.z = z * Math.cos(rotation) + x * Math.sin(rotation);
    }
    if (SETTINGS.rotateAntiY) {
        camera.position.y = y * Math.cos(rotation) - z * Math.sin(rotation);
        camera.position.z = z * Math.cos(rotation) + x * Math.sin(rotation);
        camera.zoom = 1;
    }
    if (SETTINGS.centre) {
        camera.position.set(origCameraPos.x, origCameraPos.y, origCameraPos.z);
        camera.rotation.set(origCameraRot.x, origCameraRot.y, origCameraRot.z);
        SETTINGS.centre = false;
    }
    if (SETTINGS.colourFrequencies) {
        scene.traverse(function(e) {
            //update circle colour
            if (e instanceof Line) {
                e.material.color.setRGB(subCol, lowCol, midCol);
            }
        });
    }
    if (SETTINGS.freqRotate){
        if (amp > 0.6){
            camera.position.x = camera.position.x += amp/10;
            //camera.position.z = camera.position.y += amp/10;     
        }
    }
    // if (time % 600 === 0){
    //     camera.position.set(origCameraPos.x, origCameraPos.y, origCameraPos.z);
    //     camera.rotation.set(origCameraRot.x, origCameraRot.y, origCameraRot.z);
    // }
    //update time variable
    time++;
}