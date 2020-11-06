'use strict';

// require('dotenv').config();

// const socket = io('/')

// Put variables in global scope to make them available to the browser console.
const audio = document.querySelector('audio');


const constraints = window.constraints = {
    audio: true,
    video: false
};

function handleSuccess(stream) {
    const audioTracks = stream.getAudioTracks();
    console.log('Got stream with constraints:', constraints);
    console.log('Using audio device: ' + audioTracks[0].label);
    stream.oninactive = function () {
        console.log('Stream ended');
    };
    window.stream = stream; // make variable available to browser console
    audio.srcObject = stream;
    console.log(stream);
}

function handleError(error) {
    const errorMessage = 'navigator.MediaDevices.getUserMedia error: ' + error.message + ' ' + error.name;
    document.getElementById('errorMsg').innerText = errorMessage;
    console.log(errorMessage);
}

// navigator.mediaDevices.getUserMedia(constraints).then(handleSuccess).catch(handleError);

const io = require('socket.io')
var socket = io.connect();

window.onload = function () {
    var startBtn = document.getElementById('startBtn')
    startBtn.addEventListener("click", navigator.mediaDevices.getUserMedia({
        'audio': true
    }).then(stream));
}



function stream(socket) {
    console.log('111');

    socket.on('date', function (data) {
        $('#date').text(data.date);
    });

    $(document).ready(function () {
        $('#text').keypress(function (e) {
            socket.emit('client_data', { 'letter': String.fromCharCode(e.charCode) });
        });
    });

    socket.on('transcript', function (data) {
        $('#translation').text(data.translation);
        $('#re_translation').text(data.re_translation);
    });
};

// var socket = io.connect();

// socket.on('transcript', function (data) {
//     // $('#translation').text(data.translation);
//     // $('#re_translation').text(data.re_translation);
//     console.log(data)
//     document.getElementById('translation').innerHTML = data.translation;
//     document.getElementById('re_translation').innerHTML = data.re_translation;
// });