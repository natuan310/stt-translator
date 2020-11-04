var http = require('http');
var url = require('url');
var fs = require('fs');
const { type } = require('os');
var server;


server = http.createServer(function (req, res) {
    // your normal server code
    var path = url.parse(req.url).pathname;
    switch (path) {
        case '/':
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.write('<h1>Hello! Try the <a href="/socket.html">Test page</a></h1>');
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

/**
 * TODO(developer): Uncomment the following line before running the sample.
 */
const projectId = 'quick-glow-272202';

// Imports the Google Cloud client library
const { Translate } = require('@google-cloud/translate').v2;

// Instantiates a client
const translate = new Translate({ projectId });

async function eng2jap(sourceText = '') {
    // The target language
    const source_lang = 'en';
    const target_lang = 'ja';

    // Translates some text into Japanese
    const [translation] = await translate.translate(sourceText, target_lang);
    const [re_translation] = await translate.translate(translation, source_lang);
    console.log(`Source: ${sourceText}`);
    console.log(`Japanese: ${translation}`);
    console.log(`Re-translate: ${re_translation}`);
    return { translation, re_translation };
}



function main(
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

    const speechCallback = stream => {
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
        let translated = '';
        let re_translate = '';
        if (stream.results[0] && stream.results[0].alternatives[0]) {

            stdoutText =
                correctedTime + ': ' + stream.results[0].alternatives[0].transcript;
            // translated = correctedTime + ': ' + eng2jap(stream.results[0].alternatives[0].transcript);
        }

        if (stream.results[0].isFinal) {
            process.stdout.write(chalk.green(`${stdoutText}\n`));

            eng2jap(stdoutText);

            // let res = eng2jap(stdoutText);
            // console.log(res)
            // translated = res.translation;
            // re_translate = res.re_translation;
            // console.log(translated)
            // console.log(re_translate)
            // process.stdout.write(chalk.yellow(`${translated}\n`));
            // process.stdout.write(chalk.magenta(`${re_translate}\n`));

            io.sockets.on('connection', function (socket) {
                socket.emit('transcript', { 'transcript': stdoutText });
            });

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



// use socket.io
var io = require('socket.io').listen(server);

//turn off debug
io.set('log level', 1);

var message = '';

// define interactions with client
io.sockets.on('connection', function (socket) {
    main(...process.argv.slice(2));

    // transcript = streaming.speechCallback;
    // console.log(transcript);
    // if (transcript) {
    //     console.log(transcript);
    // }
    //send data to client
    setInterval(function () {
        socket.emit('date', { 'date': new Date() });
    }, 1000);

    //recieve client data
    socket.on('client_data', function (data) {
        message += data.letter;
        setInterval(function () {
            process.stdout.write(message);
            message = '';
        }, 5000);
    });


});
