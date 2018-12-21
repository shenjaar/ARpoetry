/* eslint-disable */

// ==================== GLOBAL VARS ==================== //
var renderer, scene, camera, arToolkitSource, arToolkitContext;

// normanHelper + custom positioning
var markerRoot1Anim = {
	_customposition: [0.50,7.68,-3.04],
	_customscale: 14,
	_customrotation: [-0.66 ,1.17,-0.04]
};
var markerRoot2Anim = {
	_customposition: [1.18,6.02,-1.48],
	_customscale: 16,
	_customrotation: [-0.59,0.06,-0.44]
};
var markerRoot3Anim = {
	_customposition: [-3.58,2.36,-1.42],
	_customscale: 12,
	_customrotation: [-0.56,3.08,0]
};
var markerRoot4Anim = {
	_customposition: [-1.40,0.04,-3.46],
	_customscale: 12,
	_customrotation: [1.32,-5.28,3.86]
};
var markerRoot1, markerRoot2, markerRoot3, markerRoot4;

var params = {
	lineColor: '#000',
	lineWidth: 5,
	fps: 10,
	planeSize: 1.8,
	markerPath: "ARpoetry"
}

var camera, scene, renderer, stats, currentTime, previousTime;
var geometry, testBoxMaterial, cube;
const normanMaterials = {};
var normanSceneHelper = {};


// ==================== INIT ==================== //

function init() {
	// init renderer
	renderer = new THREE.WebGLRenderer({
		antialias: true,
		alpha: true
	});
	renderer.setClearColor(new THREE.Color('lightgrey'), 0)
	// renderer.setSize(640, 480);
	renderer.setSize(window.innerWidth, window.innerHeight); // hard performance?
	renderer.domElement.style.position = 'absolute'
	renderer.domElement.style.top = '0px'
	renderer.domElement.style.left = '0px'
	document.body.appendChild(renderer.domElement);

	// init scene and camera
	scene = new THREE.Scene();

	// Create a camera
	camera = new THREE.Camera();
	scene.add(camera);

	// handle arToolkitSource
	arToolkitSource = new THREEx.ArToolkitSource({
		// to read from the webcam 
		sourceType: 'webcam',

		// // to read from an image
		// sourceType : 'image',
		// sourceUrl : THREEx.ArToolkitContext.baseURL + '../data/images/img.jpg',		

		// to read from a video
		// sourceType : 'video',
		// sourceUrl : THREEx.ArToolkitContext.baseURL + '../data/videos/headtracking.mp4',		
	})

	arToolkitSource.init(function onReady() {
		onResize()
	})

	// handle resize
	window.addEventListener('resize', function () {
		onResize()
	})

	function onResize() {
		arToolkitSource.onResize()
		arToolkitSource.copySizeTo(renderer.domElement)
		if (arToolkitContext.arController !== null) {
			arToolkitSource.copySizeTo(arToolkitContext.arController.canvas)
		}
	}
	// initialize arToolkitContext
	// create atToolkitContext
	arToolkitContext = new THREEx.ArToolkitContext({
		cameraParametersUrl: THREEx.ArToolkitContext.baseURL + params.markerPath + '/data/camera_para.dat',
		detectionMode: 'mono',
		patternRatio: 0.8,
	})
	// initialize it
	arToolkitContext.init(function onCompleted() {
		// copy projection matrix to camera
		camera.projectionMatrix.copy(arToolkitContext.getProjectionMatrix());
	})

	// Create a ArMarkerControls
	// init controls for camera
	// markerOne = new THREEx.ArMarkerControls(arToolkitContext, camera, {
	// 	type: 'pattern',
	// 	patternUrl: THREEx.ArToolkitContext.baseURL + '../patterns/pattern-marker2.patt',
	// 	// patternUrl : THREEx.ArToolkitContext.baseURL + '../data/data/patt.kanji',
	// 	// as we controls the camera, set changeMatrixMode: 'cameraTransformMatrix'
	// 	// changeMatrixMode: 'cameraTransformMatrix'
	// })
	// // as we do changeMatrixMode: 'cameraTransformMatrix', start with invisible scene
	// scene.visible = false

	// // add an object in the scene
	// addObjects();





	//////////////////////////////////////////////////////////////////////////////
	//		marker1
	//////////////////////////////////////////////////////////////////////////////

	// build markerControls
	markerRoot1 = new THREE.Group
	markerRoot1.name = 'marker1'
	scene.add(markerRoot1)
	var markerControls = new THREEx.ArMarkerControls(arToolkitContext, markerRoot1, {
		type: 'pattern',
		patternUrl: THREEx.ArToolkitContext.baseURL + params.markerPath + '/patterns/pattern-marker1.patt',
		// patternUrl : THREEx.ArToolkitContext.baseURL + '../data/data/patt.kanji',
	})
	addPlane(markerRoot1);

	//////////////////////////////////////////////////////////////////////////////
	//		marker2
	//////////////////////////////////////////////////////////////////////////////

	// build markerControls
	markerRoot2 = new THREE.Group
	markerRoot2.name = 'marker2'
	scene.add(markerRoot2)
	var markerControls = new THREEx.ArMarkerControls(arToolkitContext, markerRoot2, {
		type: 'pattern',
		// patternUrl : THREEx.ArToolkitContext.baseURL + '../data/data/patt.hiro',
		patternUrl: THREEx.ArToolkitContext.baseURL + params.markerPath + '/patterns/pattern-marker2.patt',
	})
	addPlane(markerRoot2);

		//////////////////////////////////////////////////////////////////////////////
	//		marker3
	//////////////////////////////////////////////////////////////////////////////

	// build markerControls
	markerRoot3 = new THREE.Group
	markerRoot3.name = 'marker3'
	scene.add(markerRoot3)
	var markerControls = new THREEx.ArMarkerControls(arToolkitContext, markerRoot3, {
		type: 'pattern',
		// patternUrl : THREEx.ArToolkitContext.baseURL + '../data/data/patt.hiro',
		patternUrl: THREEx.ArToolkitContext.baseURL + params.markerPath + '/patterns/pattern-marker3.patt',
	})
	addPlane(markerRoot3);

	// 	//////////////////////////////////////////////////////////////////////////////
	// //		marker4
	// //////////////////////////////////////////////////////////////////////////////

	// build markerControls
	markerRoot4 = new THREE.Group
	markerRoot4.name = 'marker4'
	scene.add(markerRoot4)
	var markerControls = new THREEx.ArMarkerControls(arToolkitContext, markerRoot4, {
		type: 'pattern',
		// patternUrl : THREEx.ArToolkitContext.baseURL + '../data/data/patt.hiro',
		patternUrl: THREEx.ArToolkitContext.baseURL + params.markerPath + '/patterns/pattern-marker4.patt',
	})
	addPlane(markerRoot4);



	// Norman
	// add for timer
	previousTime = new Date();
	// calculate time between two frames
	params.timeBetweenFrames = 1000 / params.fps;
	initNorman(kaur.compData, markerRoot1, markerRoot1Anim);
	initNorman(bukowski.compData, markerRoot2, markerRoot2Anim);
	initNorman(july.compData, markerRoot3, markerRoot3Anim);
	initNorman(kerouac.compData, markerRoot4, markerRoot4Anim); //ok

}

// Santas Helpers
function addPlane(markerRef) {
	var geometry = new THREE.PlaneGeometry(params.planeSize, params.planeSize, 1);
	var material = new THREE.MeshBasicMaterial({ color: "white", side: THREE.DoubleSide });
	var plane = new THREE.Mesh(geometry, material);
	plane.rotateX(THREE.Math.degToRad(90));
	markerRef.add(plane);
}

function addObjects() {
	var geometry = new THREE.PlaneGeometry(params.planeSize, params.planeSize, 1);
	var material = new THREE.MeshBasicMaterial({ color: "white", side: THREE.DoubleSide });
	var plane = new THREE.Mesh(geometry, material);
	plane.rotateX(THREE.Math.degToRad(90));
	scene.add(plane);

}


function updateARToolkit() {
	if (arToolkitSource.ready === false) return
	arToolkitContext.update(arToolkitSource.domElement)
	// update scene.visible if the marker is seen
	scene.visible = camera.visible
}

function animate() {
	requestAnimationFrame(animate);

	if (markerRoot1.visible){tickAnimation(markerRoot1Anim)}
	if (markerRoot2.visible){tickAnimation(markerRoot2Anim)}
	if (markerRoot3.visible){tickAnimation(markerRoot3Anim)}
	if (markerRoot4.visible){tickAnimation(markerRoot4Anim)}
	
	updateARToolkit();
	renderer.render(scene, camera);
}

// ==================== FUNCTIONS NORMAN ==================== //

function initNorman(data, marker, animHelperObject) {
	// var data = testData.compData
	// console.log(data);

	// addvariables for tick
	animHelperObject.previousTime = new Date();

	animHelperObject.frameIndex = 0
	animHelperObject.container = new THREE.Group()
	animHelperObject.innerContainer = new THREE.Group()
	animHelperObject.container.add(animHelperObject.innerContainer)

	const material = getMaterial(params.lineColor)

	animHelperObject.clips = data.map(clip =>
		clip.map((frame, frameN) => {
			const geometry = new THREE.BufferGeometry()
			const positions = []
			const indices = []
			let nextIndex = 0

			frame.forEach(vertices => {
				if (!vertices.length) {
					return
				}

				const v = vertices[0]
				positions.push(v.x, v.y, v.z)
				nextIndex++

				vertices.forEach(v => {
					positions.push(v.x, v.y, v.z)
					indices.push(nextIndex - 1, nextIndex)
					nextIndex++
				})
			})

			geometry.setIndex(
				new THREE.BufferAttribute(new Uint16Array(indices), 1)
			)
			geometry.addAttribute(
				'position',
				new THREE.BufferAttribute(new Float32Array(positions), 3)
			)
			geometry.attributes.position.needsUpdate = true

			const mesh = new THREE.LineSegments(geometry, material)

			// @ vinni hier kann man mesh settings einstellen
			// console.log(mesh.material);
			// mesh.material.linewidth = 5
			// mesh.material.transparent = true
			// mesh.material.opacity = 0.4

			mesh.visible = frameN === 0
			animHelperObject.innerContainer.add(mesh)
			return mesh
		})
	)

	animHelperObject.frameIndices = new Array(animHelperObject.clips.length).fill(0)
	animHelperObject.frameLimits = animHelperObject.clips.map(clip => clip.length - 1)

	animHelperObject.container.position.x = animHelperObject._customposition[0];
	animHelperObject.container.position.y = animHelperObject._customposition[1];
	animHelperObject.container.position.z =  animHelperObject._customposition[2];

	animHelperObject.container.rotation.x = animHelperObject._customrotation[0];
	animHelperObject.container.rotation.y = animHelperObject._customrotation[1];
	animHelperObject.container.rotation.z = animHelperObject._customrotation[2];

	var s = animHelperObject._customscale;
	animHelperObject.container.scale.set(s, s, s);
	// var markerRoot1Anim = {
	// 	_customposition = [0,0,0],
	// 	_customscale = 1,
	// 	_customrotation = [0,0,0],
	// };



	animHelperObject.container.name = "Animation"
	marker.add(animHelperObject.container);

}

function getMaterial(color) {
	const key = color instanceof THREE.Color ? '#' + color.getHexString() : color

	if (normanMaterials[key]) {
		return normanMaterials[key]
	}
	normanMaterials[key] = new THREE.LineBasicMaterial({
		color,
		linewidth: 0,
	})
	return normanMaterials[key]
}

function tickAnimation(markerNormanHelper) {
	n = 1;
	//Only run animation at fps
	markerNormanHelper.currentTime = new Date();

	let timeDifference = markerNormanHelper.currentTime - markerNormanHelper.previousTime;
	if (timeDifference >= params.timeBetweenFrames) {
		markerNormanHelper.previousTime = new Date();
		markerNormanHelper.clips.forEach((clip, i) => {
			const index = markerNormanHelper.frameIndices[i]
			const limit = markerNormanHelper.frameLimits[i]
			let next = index + n
			next = next > limit ? 0 : next < 0 ? limit : next

			clip[index].visible = false
			clip[next].visible = true
			markerNormanHelper.frameIndices[i] = next
		})
	}
}

// ==================== HELPER ==================== //

// ==================== RUN ==================== //
init();
animate();
