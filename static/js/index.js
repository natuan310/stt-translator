// function hasGetUserMedia() {
//     return !!(navigator.mediaDevices &&
//         navigator.mediaDevices.getUserMedia);
// }

// if (hasGetUserMedia()) {
//     // Good to go!
// } else {
//     alert('getUserMedia() is not supported by your browser');
// }

// const hdConstraints = {
//     video: { width: { min: 1280 }, height: { min: 720 } }
// };

// navigator.mediaDevices.getUserMedia(hdConstraints).
//     then((stream) => { video.srcObject = stream });
  
//   ...

// const vgaConstraints = {
//     video: { width: { exact: 640 }, height: { exact: 480 } }
// };

// navigator.mediaDevices.getUserMedia(vgaConstraints).
//     then((stream) => { video.srcObject = stream });

// const videoElement = document.querySelector('video');
// const audioSelect = document.querySelector('select#audioSource');
// const videoSelect = document.querySelector('select#videoSource');

// navigator.mediaDevices.enumerateDevices()
//     .then(gotDevices).then(getStream).catch(handleError);

// audioSelect.onchange = getStream;
// videoSelect.onchange = getStream;

// function gotDevices(deviceInfos) {
//     for (let i = 0; i !== deviceInfos.length; ++i) {
//         const deviceInfo = deviceInfos[i];
//         const option = document.createElement('option');
//         option.value = deviceInfo.deviceId;
//         if (deviceInfo.kind === 'audioinput') {
//             option.text = deviceInfo.label ||
//                 'microphone ' + (audioSelect.length + 1);
//             audioSelect.appendChild(option);
//         } else if (deviceInfo.kind === 'videoinput') {
//             option.text = deviceInfo.label || 'camera ' +
//                 (videoSelect.length + 1);
//             videoSelect.appendChild(option);
//         } else {
//             console.log('Found another kind of device: ', deviceInfo);
//         }
//     }
// }

// function getStream() {
//     if (window.stream) {
//         window.stream.getTracks().forEach(function (track) {
//             track.stop();
//         });
//     }

//     const constraints = {
//         audio: {
//             deviceId: { exact: audioSelect.value }
//         },
//         video: {
//             deviceId: { exact: videoSelect.value }
//         }
//     };

//     navigator.mediaDevices.getUserMedia(constraints).
//         then(gotStream).catch(handleError);
// }

// function gotStream(stream) {
//     window.stream = stream; // make stream available to console
//     videoElement.srcObject = stream;
// }

// function handleError(error) {
//     console.error('Error: ', error);
// }

var api_btn = document.getElementById('api-btn');
var api_inp = document.getElementById('api-inp');

api_btn.addEventListener("click", (e) => {
    e.preventDefault();
    let cc_api = api_inp.value;
    
    let json_data = {'cc_api': cc_api};
    console.log(json_data);

    // fetch('/main', {
    //     method: 'POST',
    //     processData: false,
    //     headers: {
    //         'Accept': 'application/json, text/plain, */*',
    //         'Content-Type': 'application/json; charset=utf-8'
    //     },
    //     body: JSON.stringify(json_data)
    // })
    // .then(res => res.json())
    // .then(function (json_data) {
    //     console.log(json_data)
    // });

    // $.ajax('/main', { 
    //     type: "POST",
    //     contentType: "application/json",
    //     dataType: "json",
    //     data: JSON.stringify(json_data),
    //     success: function(data, status){
    //         console.log(status);} 
    //  });
})