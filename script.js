const video = document.getElementById('video');

Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('/models'), //Simple face detector and fast works for Web
    faceapi.nets.faceLandmark68Net.loadFromUri('/models'), //Set different part of the face mouth,nose,eyes etc...
    faceapi.nets.faceRecognitionNet.loadFromUri('/models'), //Show the face with a box around it
    faceapi.nets.faceExpressionNet.loadFromUri('/models')// Catch expressions on the face happy,sad,angry,etc...
]).then(startVideo);

function startVideo() {
    navigator.getUserMedia(
        { video: {} }, stream => this.video.srcObject = stream, err => console.error(err))
}

video.addEventListener('play', () => {
    const canvas = faceapi.createCanvasFromMedia(video);
    document.body.append(canvas);
    const displaySize = { width: video.width, height: video.height };
    faceapi.matchDimensions(canvas, displaySize);
    var emotion = 'neutral';
    var music = new Audio(`musics/${emotion}.mp3`);
    music.play();
    setInterval(async () => {
        const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions();
        const resizedDetections = faceapi.resizeResults(detections, displaySize);
        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
        faceapi.draw.drawDetections(canvas, resizedDetections);
        faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
        faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
        if (emotion !== findExpression(detections[0].expressions)) {
            emotion = findExpression(detections[0].expressions);
            music.pause();
            music.setAttribute("src", `musics/${emotion}.mp3`);
            music.play();
        };

    }, 100);
})

function findExpression(obj) {
    let expressionArray = [];
    Object.values(obj).forEach((key, index) => {
        expressionArray.push(key);
    })
    let i = expressionArray.indexOf(Math.max(...expressionArray));

    return i == 0 ? 'neutral' :
        i == 1 ? 'happy' :
            i == 2 ? 'sad' :
                i == 3 ? 'angry' :
                    i == 4 ? 'fearful' :
                        i == 5 ? 'disgusted' :
                            i == 6 ? 'surprised' : 'default';
}