"use strict";

require('dotenv').config();

const fs = require('fs');
const url = require('url');
const http = require('http');
const { argv } = require('process');


const server = http.createServer(function (req, res) {
    var path = url.parse(req.url).pathname;
    switch (path) {
        case '/':
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.write('<h1>Hello!</h1>');
            res.write('<a href="socket.html">Transcription</a>');
            res.end();
            break;
        case '/socket.html':
            fs.readFile(__dirname + path, function (err, data) {
                if (err) {
                    return send404(res);
                }
                res.writeHead(200, { 'Content-Type': path == 'json.js' ? 'text/javascript' : 'text/html' });
                res.write(data, 'utf8');
                res.end();
            });
            break;
        default: send404(res);
    }
}),
    send404 = function (res) {
        res.writeHead(404);
        res.write('404');
        res.end();
    };
server.listen(8001);

const io = require('socket.io')(server)
// var ss = require('socket.io-stream');


// GCP projectID which has Speech-To-Text and Cloud Translation API
const projectId = 'quick-glow-272202';

// Imports the Google Cloud client library
const { Translate } = require('@google-cloud/translate').v2;

// Instantiates a client
const translate = new Translate({ projectId });

// Function to translate text
async function eng2jap(sourceText = '') {
    // The target language
    const source_lang = 'en';
    const target_lang = 'ja';

    // Translates some text into Japanese
    const [translation] = await translate.translate(sourceText, target_lang);
    const [re_translation] = await translate.translate(translation, source_lang);
    // console.log(`Source: ${sourceText}`);
    // console.log(`Japanese: ${translation}`);
    // console.log(`Re-translate: ${re_translation}`);
    // socket.emit('transcript', {
    //     'translation': translation,
    //     're_translation': re_translation
    // });
    return { translation, re_translation };
}

// Function to transcript speech
function transcription(
    socket,
    encoding = 'LINEAR16',
    sampleRateHertz = 16000,
    languageCode = 'en-US',
    streamingLimit = 290000
) {
    // [START speech_transcribe_infinite_streaming]

    // const encoding = 'LINEAR16';
    // const sampleRateHertz = 16000;
    // const languageCode = 'en-US';
    // const streamingLimit = 10000; // ms - set to low number for demo purposes

    const chalk = require('chalk');
    const { Writable } = require('stream');
    const recorder = require('node-record-lpcm16');

    // Imports the Google Cloud client library
    // Currently, only v1p1beta1 contains result-end-time
    const speech = require('@google-cloud/speech').v1p1beta1;

    const client = new speech.SpeechClient();

    const config = {
        encoding: encoding,
        sampleRateHertz: sampleRateHertz,
        languageCode: languageCode,
    };

    const request = {
        config,
        interimResults: true,
    };

    let recognizeStream = null;
    let restartCounter = 0;
    let audioInput = [];
    let lastAudioInput = [];
    let resultEndTime = 0;
    let isFinalEndTime = 0;
    let finalRequestEndTime = 0;
    let newStream = true;
    let bridgingOffset = 0;
    let lastTranscriptWasFinal = false;

    function startStream() {
        // Clear current audioInput
        audioInput = [];
        // Initiate (Reinitiate) a recognize stream
        recognizeStream = client
            .streamingRecognize(request)
            .on('error', err => {
                if (err.code === 11) {
                    // restartStream();
                } else {
                    console.error('API request error ' + err);
                }
            })
            .on('data', speechCallback);

        // Restart stream when streamingLimit expires
        setTimeout(restartStream, streamingLimit);
    }

    const speechCallback = async stream => {
        // Convert API result end time from seconds + nanoseconds to milliseconds
        resultEndTime =
            stream.results[0].resultEndTime.seconds * 1000 +
            Math.round(stream.results[0].resultEndTime.nanos / 1000000);

        // Calculate correct time based on offset from audio sent twice
        const correctedTime =
            resultEndTime - bridgingOffset + streamingLimit * restartCounter;

        process.stdout.clearLine();
        process.stdout.cursorTo(0);

        let stdoutText = '';
        // let translated = '';
        // let re_translate = '';
        if (stream.results[0] && stream.results[0].alternatives[0]) {

            stdoutText =
                correctedTime + ': ' + stream.results[0].alternatives[0].transcript;
            // translated = correctedTime + ': ' + eng2jap(stream.results[0].alternatives[0].transcript);
        }

        if (stream.results[0].isFinal) {
            process.stdout.write(chalk.green(`${stdoutText}\n`));

            // return stdoutText;
            // eng2jap(stdoutText);
            let res = await eng2jap(stdoutText);
            // console.log(res)
            translated = res.translation;
            re_translate = res.re_translation;
            process.stdout.write(chalk.yellow(`${translated}\n`));
            process.stdout.write(chalk.magenta(`${re_translate}\n`));
            
            socket.emit('transcript', {
                'translation': translated,
                're_translation': re_translate
            });
            // io.on('connection', socket => {
            //     socket.emit('transcript', {
            //         'translation': translated,
            //         're_translation': re_translate
            //     });
            // }); 

            // socket.io-stream
            // ss(socket).emit('transcript', stream);
            // stream.pipe(res)

            isFinalEndTime = resultEndTime;
            lastTranscriptWasFinal = true;
        } else {
            // Make sure transcript does not exceed console character length
            if (stdoutText.length > process.stdout.columns) {
                stdoutText =
                    stdoutText.substring(0, process.stdout.columns - 4) + '...';
            }
            process.stdout.write(chalk.red(`${stdoutText}`));

            lastTranscriptWasFinal = false;
        }
    };

    const audioInputStreamTransform = new Writable({
        write(chunk, encoding, next) {
            if (newStream && lastAudioInput.length !== 0) {
                // Approximate math to calculate time of chunks
                const chunkTime = streamingLimit / lastAudioInput.length;
                if (chunkTime !== 0) {
                    if (bridgingOffset < 0) {
                        bridgingOffset = 0;
                    }
                    if (bridgingOffset > finalRequestEndTime) {
                        bridgingOffset = finalRequestEndTime;
                    }
                    const chunksFromMS = Math.floor(
                        (finalRequestEndTime - bridgingOffset) / chunkTime
                    );
                    bridgingOffset = Math.floor(
                        (lastAudioInput.length - chunksFromMS) * chunkTime
                    );

                    for (let i = chunksFromMS; i < lastAudioInput.length; i++) {
                        recognizeStream.write(lastAudioInput[i]);
                    }
                }
                newStream = false;
            }

            audioInput.push(chunk);

            if (recognizeStream) {
                recognizeStream.write(chunk);
            }

            next();
        },

        final() {
            if (recognizeStream) {
                recognizeStream.end();
            }
        },
    });

    function restartStream() {
        if (recognizeStream) {
            recognizeStream.end();
            recognizeStream.removeListener('data', speechCallback);
            recognizeStream = null;
        }
        if (resultEndTime > 0) {
            finalRequestEndTime = isFinalEndTime;
        }
        resultEndTime = 0;

        lastAudioInput = [];
        lastAudioInput = audioInput;

        restartCounter++;

        if (!lastTranscriptWasFinal) {
            process.stdout.write('\n');
        }
        process.stdout.write(
            chalk.yellow(`${streamingLimit * restartCounter}: RESTARTING REQUEST\n`)
        );

        newStream = true;

        startStream();
    }
    // Start recording and send the microphone input to the Speech API
    recorder
        .record({
            sampleRateHertz: sampleRateHertz,
            threshold: 0, // Silence threshold
            silence: 1000,
            keepSilence: true,
            recordProgram: 'arecord', // Try also "arecord" or "sox"
        })
        .stream()
        .on('error', err => {
            console.error('Audio recording error ' + err);
        })
        .pipe(audioInputStreamTransform);

    console.log('');
    console.log('Listening, press Ctrl+C to stop.');
    console.log('');
    console.log('End (ms)       Transcript Results/Status');
    console.log('=========================================================');

    startStream();
    // [END speech_transcribe_infinite_streaming]
};

process.on('unhandledRejection', err => {
    console.error(err.message);
    process.exitCode = 1;
});

let translated = '';
let re_translate = '';


io.on('connection', socket => {
    transcription(socket);
})