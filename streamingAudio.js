"use strict";
function RecordRTC(e, t) {
    function r(r) {
        r && (t.initCallback = function() {
            r(),
            r = t.initCallback = null
        }
        );
        var n = new GetRecorderType(e,t);
        (c = new n(e,t)).record(),
        s("recording"),
        t.disableLogs || console.log("Initialized recorderType:", c.constructor.name, "for output-type:", t.type)
    }
    function n(e) {
        function r(r) {
            if (c) {
                Object.keys(c).forEach((function(e) {
                    "function" != typeof c[e] && (d[e] = c[e])
                }
                ));
                var n = c.blob;
                if (!n) {
                    if (!r)
                        throw "Recording failed.";
                    c.blob = n = r
                }
                if (n && !t.disableLogs && console.log(n.type, "->", bytesToSize(n.size)),
                e) {
                    var i;
                    try {
                        i = URL.createObjectURL(n)
                    } catch (a) {}
                    "function" == typeof e.call ? e.call(d, i) : e(i)
                }
                t.autoWriteToDisk && o((function(e) {
                    var r = {};
                    r[t.type + "Blob"] = e,
                    DiskStorage.Store(r)
                }
                ))
            } else
                "function" == typeof e.call ? e.call(d, "") : e("")
        }
        return e = e || function() {}
        ,
        c ? "paused" === d.state ? (d.resumeRecording(),
        void setTimeout((function() {
            n(e)
        }
        ), 1)) : ("recording" === d.state || t.disableLogs || console.warn('Recording state should be: "recording", however current state is: ', d.state),
        t.disableLogs || console.log("Stopped recording " + t.type + " stream."),
        "gif" !== t.type ? c.stop(r) : (c.stop(),
        r()),
        void s("stopped")) : void u()
    }
    function i(e) {
        postMessage((new FileReaderSync).readAsDataURL(e))
    }
    function o(e, r) {
        if (!e)
            throw "Pass a callback function over getDataURL.";
        var n = r ? r.blob : (c || {}).blob;
        if (!n)
            return t.disableLogs || console.warn("Blob encoder did not finish its job yet."),
            void setTimeout((function() {
                o(e, r)
            }
            ), 1e3);
        if ("undefined" == typeof Worker || navigator.mozGetUserMedia) {
            var a = new FileReader;
            a.readAsDataURL(n),
            a.onload = function(t) {
                e(t.target.result)
            }
        } else {
            var s = function(e) {
                try {
                    var t = URL.createObjectURL(new Blob([e.toString(), "this.onmessage =  function (eee) {" + e.name + "(eee.data);}"],{
                        type: "application/javascript"
                    }))
                      , r = new Worker(t);
                    return URL.revokeObjectURL(t),
                    r
                } catch (n) {}
            }(i);
            s.onmessage = function(t) {
                e(t.data)
            }
            ,
            s.postMessage(n)
        }
    }
    function a(e) {
        if (e = e || 0,
        "paused" !== d.state) {
            if ("stopped" !== d.state) {
                if (e >= d.recordingDuration)
                    return void n(d.onRecordingStopped);
                e += 1e3,
                setTimeout((function() {
                    a(e)
                }
                ), 1e3)
            }
        } else
            setTimeout((function() {
                a(e)
            }
            ), 1e3)
    }
    function s(e) {
        d && (d.state = e,
        "function" == typeof d.onStateChanged.call ? d.onStateChanged.call(d, e) : d.onStateChanged(e))
    }
    function u() {
        !0 !== t.disableLogs && console.warn(f)
    }
    if (!e)
        throw "First parameter is required.";
    t = new RecordRTCConfiguration(e,t = t || {
        type: "video"
    });
    var c, d = this, f = 'It seems that recorder is destroyed or "startRecording" is not invoked for ' + t.type + " recorder.", l = {
        startRecording: function(n) {
            return t.disableLogs || console.log("RecordRTC version: ", d.version),
            n && (t = new RecordRTCConfiguration(e,n)),
            t.disableLogs || console.log("started recording " + t.type + " stream."),
            c ? (c.clearRecordedData(),
            c.record(),
            s("recording"),
            d.recordingDuration && a(),
            d) : (r((function() {
                d.recordingDuration && a()
            }
            )),
            d)
        },
        stopRecording: n,
        pauseRecording: function() {
            return c ? "recording" !== d.state ? void (t.disableLogs || console.warn("Unable to pause the recording. Recording state: ", d.state)) : (s("paused"),
            c.pause(),
            void (t.disableLogs || console.log("Paused recording."))) : void u()
        },
        resumeRecording: function() {
            return c ? "paused" !== d.state ? void (t.disableLogs || console.warn("Unable to resume the recording. Recording state: ", d.state)) : (s("recording"),
            c.resume(),
            void (t.disableLogs || console.log("Resumed recording."))) : void u()
        },
        initRecorder: r,
        setRecordingDuration: function(e, t) {
            if (void 0 === e)
                throw "recordingDuration is required.";
            if ("number" != typeof e)
                throw "recordingDuration must be a number.";
            return d.recordingDuration = e,
            d.onRecordingStopped = t || function() {}
            ,
            {
                onRecordingStopped: function(e) {
                    d.onRecordingStopped = e
                }
            }
        },
        clearRecordedData: function() {
            return c ? (c.clearRecordedData(),
            void (t.disableLogs || console.log("Cleared old recorded data."))) : void u()
        },
        getBlob: function() {
            return c ? c.blob : void u()
        },
        getDataURL: o,
        toURL: function() {
            return c ? URL.createObjectURL(c.blob) : void u()
        },
        getInternalRecorder: function() {
            return c
        },
        save: function(e) {
            return c ? void invokeSaveAsDialog(c.blob, e) : void u()
        },
        getFromDisk: function(e) {
            return c ? void RecordRTC.getFromDisk(t.type, e) : void u()
        },
        setAdvertisementArray: function(e) {
            t.advertisement = [];
            for (var r = e.length, n = 0; n < r; n++)
                t.advertisement.push({
                    duration: n,
                    image: e[n]
                })
        },
        blob: null,
        bufferSize: 0,
        sampleRate: 0,
        buffer: null,
        reset: function() {
            "recording" !== d.state || t.disableLogs || console.warn("Stop an active recorder."),
            c && "function" == typeof c.clearRecordedData && c.clearRecordedData(),
            c = null,
            s("inactive"),
            d.blob = null
        },
        onStateChanged: function(e) {
            t.disableLogs || console.log("Recorder state changed:", e)
        },
        state: "inactive",
        getState: function() {
            return d.state
        },
        destroy: function() {
            var e = t.disableLogs;
            t = {
                disableLogs: !0
            },
            d.reset(),
            s("destroyed"),
            l = d = null,
            Storage.AudioContextConstructor && (Storage.AudioContextConstructor.close(),
            Storage.AudioContextConstructor = null),
            t.disableLogs = e,
            t.disableLogs || console.log("RecordRTC is destroyed.")
        },
        version: "5.5.9"
    };
    if (!this)
        return d = l,
        l;
    for (var h in l)
        this[h] = l[h];
    return d = this,
    l
}
function RecordRTCConfiguration(e, t) {
    return t.recorderType || t.type || (t.audio && t.video ? t.type = "video" : t.audio && !t.video && (t.type = "audio")),
    t.recorderType && !t.type && (t.recorderType === WhammyRecorder || t.recorderType === CanvasRecorder || void 0 !== WebAssemblyRecorder && t.recorderType === WebAssemblyRecorder ? t.type = "video" : t.recorderType === GifRecorder ? t.type = "gif" : t.recorderType === StereoAudioRecorder ? t.type = "audio" : t.recorderType === MediaStreamRecorder && (getTracks(e, "audio").length && getTracks(e, "video").length ? t.type = "video" : !getTracks(e, "audio").length && getTracks(e, "video").length ? t.type = "video" : getTracks(e, "audio").length && !getTracks(e, "video").length && (t.type = "audio"))),
    void 0 !== MediaStreamRecorder && "undefined" != typeof MediaRecorder && "requestData"in MediaRecorder.prototype && (t.mimeType || (t.mimeType = "video/webm"),
    t.type || (t.type = t.mimeType.split("/")[0])),
    t.type || (t.mimeType && (t.type = t.mimeType.split("/")[0]),
    t.type || (t.type = "audio")),
    t
}
function GetRecorderType(e, t) {
    var r;
    return (isChrome || isEdge || isOpera) && (r = StereoAudioRecorder),
    "undefined" != typeof MediaRecorder && "requestData"in MediaRecorder.prototype && !isChrome && (r = MediaStreamRecorder),
    "video" === t.type && (isChrome || isOpera) && (r = WhammyRecorder,
    void 0 !== WebAssemblyRecorder && "undefined" != typeof ReadableStream && (r = WebAssemblyRecorder)),
    "gif" === t.type && (r = GifRecorder),
    "canvas" === t.type && (r = CanvasRecorder),
    isMediaRecorderCompatible() && r !== CanvasRecorder && r !== GifRecorder && "undefined" != typeof MediaRecorder && "requestData"in MediaRecorder.prototype && (getTracks(e, "video").length || getTracks(e, "audio").length) && ("audio" === t.type ? "function" == typeof MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported("audio/webm") && (r = MediaStreamRecorder) : "function" == typeof MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported("video/webm") && (r = MediaStreamRecorder)),
    e instanceof Array && e.length && (r = MultiStreamRecorder),
    t.recorderType && (r = t.recorderType),
    !t.disableLogs && r && r.name && console.log("Using recorderType:", r.name || r.constructor.name),
    !r && isSafari && (r = MediaStreamRecorder),
    r
}
function MRecordRTC(e) {
    this.addStream = function(t) {
        t && (e = t)
    }
    ,
    this.mediaType = {
        audio: !0,
        video: !0
    },
    this.startRecording = function() {
        var t, r = this.mediaType, n = this.mimeType || {
            audio: null,
            video: null,
            gif: null
        };
        if ("function" != typeof r.audio && isMediaRecorderCompatible() && !getTracks(e, "audio").length && (r.audio = !1),
        "function" != typeof r.video && isMediaRecorderCompatible() && !getTracks(e, "video").length && (r.video = !1),
        "function" != typeof r.gif && isMediaRecorderCompatible() && !getTracks(e, "video").length && (r.gif = !1),
        !r.audio && !r.video && !r.gif)
            throw "MediaStream must have either audio or video tracks.";
        if (r.audio && (t = null,
        "function" == typeof r.audio && (t = r.audio),
        this.audioRecorder = new RecordRTC(e,{
            type: "audio",
            bufferSize: this.bufferSize,
            sampleRate: this.sampleRate,
            numberOfAudioChannels: this.numberOfAudioChannels || 2,
            disableLogs: this.disableLogs,
            recorderType: t,
            mimeType: n.audio,
            timeSlice: this.timeSlice,
            onTimeStamp: this.onTimeStamp
        }),
        r.video || this.audioRecorder.startRecording()),
        r.video) {
            t = null,
            "function" == typeof r.video && (t = r.video);
            var i = e;
            if (isMediaRecorderCompatible() && r.audio && "function" == typeof r.audio) {
                var o = getTracks(e, "video")[0];
                isFirefox ? ((i = new MediaStream).addTrack(o),
                t && t === WhammyRecorder && (t = MediaStreamRecorder)) : (i = new MediaStream).addTrack(o)
            }
            this.videoRecorder = new RecordRTC(i,{
                type: "video",
                video: this.video,
                canvas: this.canvas,
                frameInterval: this.frameInterval || 10,
                disableLogs: this.disableLogs,
                recorderType: t,
                mimeType: n.video,
                timeSlice: this.timeSlice,
                onTimeStamp: this.onTimeStamp,
                workerPath: this.workerPath,
                webAssemblyPath: this.webAssemblyPath,
                frameRate: this.frameRate,
                bitrate: this.bitrate
            }),
            r.audio || this.videoRecorder.startRecording()
        }
        if (r.audio && r.video) {
            var a = this
              , s = !0 === isMediaRecorderCompatible();
            r.audio instanceof StereoAudioRecorder && r.video ? s = !1 : !0 !== r.audio && !0 !== r.video && r.audio !== r.video && (s = !1),
            !0 === s ? (a.audioRecorder = null,
            a.videoRecorder.startRecording()) : a.videoRecorder.initRecorder((function() {
                a.audioRecorder.initRecorder((function() {
                    a.videoRecorder.startRecording(),
                    a.audioRecorder.startRecording()
                }
                ))
            }
            ))
        }
        r.gif && (t = null,
        "function" == typeof r.gif && (t = r.gif),
        this.gifRecorder = new RecordRTC(e,{
            type: "gif",
            frameRate: this.frameRate || 200,
            quality: this.quality || 10,
            disableLogs: this.disableLogs,
            recorderType: t,
            mimeType: n.gif
        }),
        this.gifRecorder.startRecording())
    }
    ,
    this.stopRecording = function(e) {
        e = e || function() {}
        ,
        this.audioRecorder && this.audioRecorder.stopRecording((function(t) {
            e(t, "audio")
        }
        )),
        this.videoRecorder && this.videoRecorder.stopRecording((function(t) {
            e(t, "video")
        }
        )),
        this.gifRecorder && this.gifRecorder.stopRecording((function(t) {
            e(t, "gif")
        }
        ))
    }
    ,
    this.pauseRecording = function() {
        this.audioRecorder && this.audioRecorder.pauseRecording(),
        this.videoRecorder && this.videoRecorder.pauseRecording(),
        this.gifRecorder && this.gifRecorder.pauseRecording()
    }
    ,
    this.resumeRecording = function() {
        this.audioRecorder && this.audioRecorder.resumeRecording(),
        this.videoRecorder && this.videoRecorder.resumeRecording(),
        this.gifRecorder && this.gifRecorder.resumeRecording()
    }
    ,
    this.getBlob = function(e) {
        var t = {};
        return this.audioRecorder && (t.audio = this.audioRecorder.getBlob()),
        this.videoRecorder && (t.video = this.videoRecorder.getBlob()),
        this.gifRecorder && (t.gif = this.gifRecorder.getBlob()),
        e && e(t),
        t
    }
    ,
    this.destroy = function() {
        this.audioRecorder && (this.audioRecorder.destroy(),
        this.audioRecorder = null),
        this.videoRecorder && (this.videoRecorder.destroy(),
        this.videoRecorder = null),
        this.gifRecorder && (this.gifRecorder.destroy(),
        this.gifRecorder = null)
    }
    ,
    this.getDataURL = function(e) {
        function t(e, t) {
            if ("undefined" != typeof Worker) {
                var r = function(e) {
                    var t, r = URL.createObjectURL(new Blob([e.toString(), "this.onmessage =  function (eee) {" + e.name + "(eee.data);}"],{
                        type: "application/javascript"
                    })), n = new Worker(r);
                    if (void 0 !== URL)
                        t = URL;
                    else {
                        if ("undefined" == typeof webkitURL)
                            throw "Neither URL nor webkitURL detected.";
                        t = webkitURL
                    }
                    return t.revokeObjectURL(r),
                    n
                }((function(e) {
                    postMessage((new FileReaderSync).readAsDataURL(e))
                }
                ));
                r.onmessage = function(e) {
                    t(e.data)
                }
                ,
                r.postMessage(e)
            } else {
                var n = new FileReader;
                n.readAsDataURL(e),
                n.onload = function(e) {
                    t(e.target.result)
                }
            }
        }
        this.getBlob((function(r) {
            r.audio && r.video ? t(r.audio, (function(n) {
                t(r.video, (function(t) {
                    e({
                        audio: n,
                        video: t
                    })
                }
                ))
            }
            )) : r.audio ? t(r.audio, (function(t) {
                e({
                    audio: t
                })
            }
            )) : r.video && t(r.video, (function(t) {
                e({
                    video: t
                })
            }
            ))
        }
        ))
    }
    ,
    this.writeToDisk = function() {
        RecordRTC.writeToDisk({
            audio: this.audioRecorder,
            video: this.videoRecorder,
            gif: this.gifRecorder
        })
    }
    ,
    this.save = function(e) {
        (e = e || {
            audio: !0,
            video: !0,
            gif: !0
        }).audio && this.audioRecorder && this.audioRecorder.save("string" == typeof e.audio ? e.audio : ""),
        e.video && this.videoRecorder && this.videoRecorder.save("string" == typeof e.video ? e.video : ""),
        e.gif && this.gifRecorder && this.gifRecorder.save("string" == typeof e.gif ? e.gif : "")
    }
}
function bytesToSize(e) {
    if (0 === e)
        return "0 Bytes";
    var t = parseInt(Math.floor(Math.log(e) / Math.log(1e3)), 10);
    return (e / Math.pow(1e3, t)).toPrecision(3) + " " + ["Bytes", "KB", "MB", "GB", "TB"][t]
}
function invokeSaveAsDialog(e, t) {
    if (!e)
        throw "Blob object is required.";
    if (!e.type)
        try {
            e.type = "video/webm"
        } catch (a) {}
    var r = (e.type || "video/webm").split("/")[1];
    if (t && -1 !== t.indexOf(".")) {
        var n = t.split(".");
        t = n[0],
        r = n[1]
    }
    var i = (t || Math.round(9999999999 * Math.random()) + 888888888) + "." + r;
    if (void 0 !== navigator.msSaveOrOpenBlob)
        return navigator.msSaveOrOpenBlob(e, i);
    if (void 0 !== navigator.msSaveBlob)
        return navigator.msSaveBlob(e, i);
    var o = document.createElement("a");
    o.href = URL.createObjectURL(e),
    o.download = i,
    o.style = "display:none;opacity:0;color:transparent;",
    (document.body || document.documentElement).appendChild(o),
    "function" == typeof o.click ? o.click() : (o.target = "_blank",
    o.dispatchEvent(new MouseEvent("click",{
        view: window,
        bubbles: !0,
        cancelable: !0
    }))),
    URL.revokeObjectURL(o.href)
}
function isElectron() {
    return "undefined" != typeof window && "object" == typeof window.process && "renderer" === window.process.type || !("undefined" == typeof process || "object" != typeof process.versions || !process.versions.electron) || "object" == typeof navigator && "string" == typeof navigator.userAgent && navigator.userAgent.indexOf("Electron") >= 0
}
function getTracks(e, t) {
    return e && e.getTracks ? e.getTracks().filter((function(e) {
        return e.kind === (t || "audio")
    }
    )) : []
}
function setSrcObject(e, t) {
    "srcObject"in t ? t.srcObject = e : "mozSrcObject"in t ? t.mozSrcObject = e : t.srcObject = e
}
function getSeekableBlob(e, t) {
    if ("undefined" == typeof EBML)
        throw new Error("Please link: https://www.webrtc-experiment.com/EBML.js");
    var r = new EBML.Reader
      , n = new EBML.Decoder
      , i = EBML.tools
      , o = new FileReader;
    o.onload = function(e) {
        n.decode(this.result).forEach((function(e) {
            r.read(e)
        }
        )),
        r.stop();
        var o = i.makeMetadataSeekable(r.metadatas, r.duration, r.cues)
          , a = this.result.slice(r.metadataSize)
          , s = new Blob([o, a],{
            type: "video/webm"
        });
        t(s)
    }
    ,
    o.readAsArrayBuffer(e)
}
function isMediaRecorderCompatible() {
    if (isFirefox || isSafari || isEdge)
        return !0;
    var e, t, r = (navigator,
    navigator.userAgent), n = "" + parseFloat(navigator.appVersion), i = parseInt(navigator.appVersion, 10);
    return (isChrome || isOpera) && (e = r.indexOf("Chrome"),
    n = r.substring(e + 7)),
    -1 !== (t = n.indexOf(";")) && (n = n.substring(0, t)),
    -1 !== (t = n.indexOf(" ")) && (n = n.substring(0, t)),
    i = parseInt("" + n, 10),
    isNaN(i) && (n = "" + parseFloat(navigator.appVersion),
    i = parseInt(navigator.appVersion, 10)),
    i >= 49
}
function MediaStreamRecorder(e, t) {
    function r() {
        a.timestamps.push((new Date).getTime()),
        "function" == typeof t.onTimeStamp && t.onTimeStamp(a.timestamps[a.timestamps.length - 1], a.timestamps)
    }
    function n(e) {
        return s && s.mimeType ? s.mimeType : e.mimeType || "video/webm"
    }
    function i() {
        u = [],
        s = null,
        a.timestamps = []
    }
    var o, a = this;
    if (void 0 === e)
        throw 'First argument "MediaStream" is required.';
    if ("undefined" == typeof MediaRecorder)
        throw "Your browser does not support the Media Recorder API. Please try other modules e.g. WhammyRecorder or StereoAudioRecorder.";
    "audio" === (t = t || {
        mimeType: "video/webm"
    }).type && (getTracks(e, "video").length && getTracks(e, "audio").length && (navigator.mozGetUserMedia ? (o = new MediaStream).addTrack(getTracks(e, "audio")[0]) : o = new MediaStream(getTracks(e, "audio")),
    e = o),
    t.mimeType && -1 !== t.mimeType.toString().toLowerCase().indexOf("audio") || (t.mimeType = isChrome ? "audio/webm" : "audio/ogg"),
    t.mimeType && "audio/ogg" !== t.mimeType.toString().toLowerCase() && navigator.mozGetUserMedia && (t.mimeType = "audio/ogg"));
    var s, u = [];
    this.getArrayOfBlobs = function() {
        return u
    }
    ,
    this.record = function() {
        a.blob = null,
        a.clearRecordedData(),
        a.timestamps = [],
        c = [],
        u = [];
        var i = t;
        t.disableLogs || console.log("Passing following config over MediaRecorder API.", i),
        s && (s = null),
        isChrome && !isMediaRecorderCompatible() && (i = "video/vp8"),
        "function" == typeof MediaRecorder.isTypeSupported && i.mimeType && (MediaRecorder.isTypeSupported(i.mimeType) || (t.disableLogs || console.warn("MediaRecorder API seems unable to record mimeType:", i.mimeType),
        i.mimeType = "audio" === t.type ? "audio/webm" : "video/webm"));
        try {
            s = new MediaRecorder(e,i),
            t.mimeType = i.mimeType
        } catch (o) {
            s = new MediaRecorder(e)
        }
        i.mimeType && !MediaRecorder.isTypeSupported && "canRecordMimeType"in s && !1 === s.canRecordMimeType(i.mimeType) && (t.disableLogs || console.warn("MediaRecorder API seems unable to record mimeType:", i.mimeType)),
        s.ondataavailable = function(e) {
            if (e.data && c.push("ondataavailable: " + bytesToSize(e.data.size)),
            "number" != typeof t.timeSlice) {
                if (!e.data || !e.data.size || e.data.size < 100 || a.blob)
                    return void (a.recordingCallback && (a.recordingCallback(new Blob([],{
                        type: n(i)
                    })),
                    a.recordingCallback = null));
                a.blob = t.getNativeBlob ? e.data : new Blob([e.data],{
                    type: n(i)
                }),
                a.recordingCallback && (a.recordingCallback(a.blob),
                a.recordingCallback = null)
            } else if (e.data && e.data.size && e.data.size > 100 && (u.push(e.data),
            r(),
            "function" == typeof t.ondataavailable)) {
                var o = t.getNativeBlob ? e.data : new Blob([e.data],{
                    type: n(i)
                });
                t.ondataavailable(o)
            }
        }
        ,
        s.onstart = function() {
            c.push("started")
        }
        ,
        s.onpause = function() {
            c.push("paused")
        }
        ,
        s.onresume = function() {
            c.push("resumed")
        }
        ,
        s.onstop = function() {
            c.push("stopped")
        }
        ,
        s.onerror = function(e) {
            e && (e.name || (e.name = "UnknownError"),
            c.push("error: " + e),
            t.disableLogs || (-1 !== e.name.toString().toLowerCase().indexOf("invalidstate") ? console.error("The MediaRecorder is not in a state in which the proposed operation is allowed to be executed.", e) : -1 !== e.name.toString().toLowerCase().indexOf("notsupported") ? console.error("MIME type (", i.mimeType, ") is not supported.", e) : -1 !== e.name.toString().toLowerCase().indexOf("security") ? console.error("MediaRecorder security error", e) : "OutOfMemory" === e.name ? console.error("The UA has exhaused the available memory. User agents SHOULD provide as much additional information as possible in the message attribute.", e) : "IllegalStreamModification" === e.name ? console.error("A modification to the stream has occurred that makes it impossible to continue recording. An example would be the addition of a Track while recording is occurring. User agents SHOULD provide as much additional information as possible in the message attribute.", e) : "OtherRecordingError" === e.name ? console.error("Used for an fatal error other than those listed above. User agents SHOULD provide as much additional information as possible in the message attribute.", e) : "GenericError" === e.name ? console.error("The UA cannot provide the codec or recording option that has been requested.", e) : console.error("MediaRecorder Error", e)),
            !a.manuallyStopped && s && "inactive" === s.state ? (delete t.timeslice,
            s.start(6e5)) : setTimeout(void 0, 1e3),
            "inactive" !== s.state && "stopped" !== s.state && s.stop())
        }
        ,
        "number" == typeof t.timeSlice ? (r(),
        s.start(t.timeSlice)) : s.start(36e5),
        t.initCallback && t.initCallback()
    }
    ,
    this.timestamps = [],
    this.stop = function(e) {
        e = e || function() {}
        ,
        a.manuallyStopped = !0,
        s && (this.recordingCallback = e,
        "recording" === s.state && s.stop(),
        "number" == typeof t.timeSlice && setTimeout((function() {
            a.blob = new Blob(u,{
                type: n(t)
            }),
            a.recordingCallback(a.blob)
        }
        ), 100))
    }
    ,
    this.pause = function() {
        s && "recording" === s.state && s.pause()
    }
    ,
    this.resume = function() {
        s && "paused" === s.state && s.resume()
    }
    ,
    this.clearRecordedData = function() {
        s && "recording" === s.state && a.stop(i),
        i()
    }
    ,
    this.getInternalRecorder = function() {
        return s
    }
    ,
    this.blob = null,
    this.getState = function() {
        return s && s.state || "inactive"
    }
    ;
    var c = [];
    this.getAllStates = function() {
        return c
    }
    ,
    void 0 === t.checkForInactiveTracks && (t.checkForInactiveTracks = !1),
    a = this,
    function r() {
        if (s && !1 !== t.checkForInactiveTracks)
            return !1 === function() {
                if ("active"in e) {
                    if (!e.active)
                        return !1
                } else if ("ended"in e && e.ended)
                    return !1;
                return !0
            }() ? (t.disableLogs || console.log("MediaStream seems stopped."),
            void a.stop()) : void setTimeout(r, 1e3)
    }(),
    this.name = "MediaStreamRecorder",
    this.toString = function() {
        return this.name
    }
}
function StereoAudioRecorder(e, t) {
    function r() {
        if (!1 === t.checkForInactiveTracks)
            return !0;
        if ("active"in e) {
            if (!e.active)
                return !1
        } else if ("ended"in e && e.ended)
            return !1;
        return !0
    }
    function n(e, t) {
        function r(e, t) {
            function r(e, t, r) {
                var i = Math.round(e.length * (t / r))
                  , o = []
                  , a = Number((e.length - 1) / (i - 1));
                o[0] = e[0];
                for (var s = 1; s < i - 1; s++) {
                    var u = s * a
                      , c = Number(Math.floor(u)).toFixed()
                      , d = Number(Math.ceil(u)).toFixed();
                    o[s] = n(e[c], e[d], u - c)
                }
                return o[i - 1] = e[e.length - 1],
                o
            }
            function n(e, t, r) {
                return e + (t - e) * r
            }
            function i(e, t) {
                for (var r = new Float64Array(t), n = 0, i = e.length, o = 0; o < i; o++) {
                    var a = e[o];
                    r.set(a, n),
                    n += a.length
                }
                return r
            }
            function o(e, t, r) {
                for (var n = r.length, i = 0; i < n; i++)
                    e.setUint8(t + i, r.charCodeAt(i))
            }
            var a, s = e.numberOfAudioChannels, u = e.leftBuffers.slice(0), c = e.rightBuffers.slice(0), d = e.sampleRate, f = e.internalInterleavedLength, l = e.desiredSampRate;
            2 === s && (u = i(u, f),
            c = i(c, f),
            l && (u = r(u, l, d),
            c = r(c, l, d))),
            1 === s && (u = i(u, f),
            l && (u = r(u, l, d))),
            l && (d = l),
            2 === s && (a = function(e, t) {
                for (var r = e.length + t.length, n = new Float64Array(r), i = 0, o = 0; o < r; )
                    n[o++] = e[i],
                    n[o++] = t[i],
                    i++;
                return n
            }(u, c)),
            1 === s && (a = u);
            var h = a.length
              , p = new ArrayBuffer(44 + 2 * h)
              , g = new DataView(p);
            o(g, 0, "RIFF"),
            g.setUint32(4, 36 + 2 * h, !0),
            o(g, 8, "WAVE"),
            o(g, 12, "fmt "),
            g.setUint32(16, 16, !0),
            g.setUint16(20, 1, !0),
            g.setUint16(22, s, !0),
            g.setUint32(24, d, !0),
            g.setUint32(28, 2 * d, !0),
            g.setUint16(32, 2 * s, !0),
            g.setUint16(34, 16, !0),
            o(g, 36, "data"),
            g.setUint32(40, 2 * h, !0);
            for (var m = h, v = 44, b = 0; b < m; b++)
                g.setInt16(v, 32767 * a[b], !0),
                v += 2;
            return t ? t({
                buffer: p,
                view: g
            }) : void postMessage({
                buffer: p,
                view: g
            })
        }
        if (e.noWorker)
            r(e, (function(e) {
                t(e.buffer, e.view)
            }
            ));
        else {
            var n, i, o, a = (n = r,
            i = URL.createObjectURL(new Blob([n.toString(), ";this.onmessage =  function (eee) {" + n.name + "(eee.data);}"],{
                type: "application/javascript"
            })),
            (o = new Worker(i)).workerURL = i,
            o);
            a.onmessage = function(e) {
                t(e.data.buffer, e.data.view),
                URL.revokeObjectURL(a.workerURL),
                a.terminate()
            }
            ,
            a.postMessage(e)
        }
    }
    function i() {
        d = [],
        l = 0,
        S = !1,
        f = !1,
        R = !1,
        m = null,
        u.leftchannel = c = [],
        u.rightchannel = d,
        u.numberOfAudioChannels = h,
        u.desiredSampRate = p,
        u.sampleRate = w,
        u.recordingLength = l,
        T = {
            left: [],
            right: [],
            recordingLength: 0
        }
    }
    function o() {
        s && (s.onaudioprocess = null,
        s.disconnect(),
        s = null),
        v && (v.disconnect(),
        v = null),
        i()
    }
    function a() {
        f && "function" == typeof t.ondataavailable && void 0 !== t.timeSlice && (T.left.length ? (n({
            desiredSampRate: p,
            sampleRate: w,
            numberOfAudioChannels: h,
            internalInterleavedLength: T.recordingLength,
            leftBuffers: T.left,
            rightBuffers: 1 === h ? [] : T.right
        }, (function(e, r) {
            var n = new Blob([r],{
                type: "audio/wav"
            });
            t.ondataavailable(n),
            setTimeout(a, t.timeSlice)
        }
        )),
        T = {
            left: [],
            right: [],
            recordingLength: 0
        }) : setTimeout(a, t.timeSlice))
    }
    if (!getTracks(e, "audio").length)
        throw "Your stream has no audio tracks.";
    var s, u = this, c = [], d = [], f = !1, l = 0, h = 2, p = (t = t || {}).desiredSampRate;
    if (!0 === t.leftChannel && (h = 1),
    1 === t.numberOfAudioChannels && (h = 1),
    (!h || h < 1) && (h = 2),
    t.disableLogs || console.log("StereoAudioRecorder is set to record number of channels: " + h),
    void 0 === t.checkForInactiveTracks && (t.checkForInactiveTracks = !0),
    this.record = function() {
        if (!1 === r())
            throw "Please make sure MediaStream is active.";
        i(),
        S = R = !1,
        f = !0,
        void 0 !== t.timeSlice && a()
    }
    ,
    this.stop = function(e) {
        e = e || function() {}
        ,
        f = !1,
        n({
            desiredSampRate: p,
            sampleRate: w,
            numberOfAudioChannels: h,
            internalInterleavedLength: l,
            leftBuffers: c,
            rightBuffers: 1 === h ? [] : d,
            noWorker: t.noWorker
        }, (function(t, r) {
            u.blob = new Blob([r],{
                type: "audio/wav"
            }),
            u.buffer = new ArrayBuffer(r.buffer.byteLength),
            u.view = r,
            u.sampleRate = p || w,
            u.bufferSize = y,
            u.length = l,
            S = !1,
            e && e(u.blob)
        }
        ))
    }
    ,
    void 0 === g)
        var g = {
            AudioContextConstructor: null,
            AudioContext: window.AudioContext || window.webkitAudioContext
        };
    g.AudioContextConstructor || (g.AudioContextConstructor = new g.AudioContext);
    var m = g.AudioContextConstructor
      , v = m.createMediaStreamSource(e)
      , b = [0, 256, 512, 1024, 2048, 4096, 8192, 16384]
      , y = void 0 === t.bufferSize ? 4096 : t.bufferSize;
    if (-1 === b.indexOf(y) && (t.disableLogs || console.log("Legal values for buffer-size are " + JSON.stringify(b, null, "\t"))),
    m.createJavaScriptNode)
        s = m.createJavaScriptNode(y, h, h);
    else {
        if (!m.createScriptProcessor)
            throw "WebAudio API has no support on this browser.";
        s = m.createScriptProcessor(y, h, h)
    }
    v.connect(s),
    t.bufferSize || (y = s.bufferSize);
    var w = void 0 !== t.sampleRate ? t.sampleRate : m.sampleRate || 44100;
    (w < 22050 || w > 96e3) && (t.disableLogs || console.log("sample-rate must be under range 22050 and 96000.")),
    t.disableLogs || t.desiredSampRate && console.log("Desired sample-rate: " + t.desiredSampRate);
    var R = !1;
    this.pause = function() {
        R = !0
    }
    ,
    this.resume = function() {
        if (!1 === r())
            throw "Please make sure MediaStream is active.";
        return f ? void (R = !1) : (t.disableLogs || console.log("Seems recording has been restarted."),
        void this.record())
    }
    ,
    this.clearRecordedData = function() {
        t.checkForInactiveTracks = !1,
        f && this.stop(o),
        o()
    }
    ,
    this.name = "StereoAudioRecorder",
    this.toString = function() {
        return this.name
    }
    ;
    var S = !1;
    s.onaudioprocess = function(e) {
        if (!R) {
            if (!1 === r() && (t.disableLogs || console.log("MediaStream seems stopped."),
            s.disconnect(),
            f = !1),
            !f)
                return void (v && (v.disconnect(),
                v = null));
            S || (S = !0,
            t.onAudioProcessStarted && t.onAudioProcessStarted(),
            t.initCallback && t.initCallback());
            var n = e.inputBuffer.getChannelData(0)
              , i = new Float32Array(n);
            if (c.push(i),
            2 === h) {
                var o = e.inputBuffer.getChannelData(1)
                  , a = new Float32Array(o);
                d.push(a)
            }
            u.recordingLength = l += y,
            void 0 !== t.timeSlice && (T.recordingLength += y,
            T.left.push(i),
            2 === h && T.right.push(a))
        }
    }
    ,
    s.connect(m.createMediaStreamDestination ? m.createMediaStreamDestination() : m.destination),
    this.leftchannel = c,
    this.rightchannel = d,
    this.numberOfAudioChannels = h,
    this.desiredSampRate = p,
    this.sampleRate = w,
    u.recordingLength = l;
    var T = {
        left: [],
        right: [],
        recordingLength: 0
    }
}
function CanvasRecorder(e, t) {
    function r() {
        h.frames = [],
        s = !1,
        f = !1
    }
    function n() {
        if (f)
            return l = (new Date).getTime(),
            setTimeout(n, 500);
        if ("canvas" === e.nodeName.toLowerCase()) {
            var r = (new Date).getTime() - l;
            return l = (new Date).getTime(),
            h.frames.push({
                image: (i = document.createElement("canvas"),
                o = i.getContext("2d"),
                i.width = e.width,
                i.height = e.height,
                o.drawImage(e, 0, 0),
                i),
                duration: r
            }),
            void (s && setTimeout(n, t.frameInterval))
        }
        var i, o;
        html2canvas(e, {
            grabMouse: void 0 === t.showMousePointer || t.showMousePointer,
            onrendered: function(e) {
                var r = (new Date).getTime() - l;
                return r ? (l = (new Date).getTime(),
                h.frames.push({
                    image: e.toDataURL("image/webp", 1),
                    duration: r
                }),
                void (s && setTimeout(n, t.frameInterval))) : setTimeout(n, t.frameInterval)
            }
        })
    }
    if ("undefined" == typeof html2canvas)
        throw "Please link: https://www.webrtc-experiment.com/screenshot.js";
    (t = t || {}).frameInterval || (t.frameInterval = 10);
    var i = !1;
    ["captureStream", "mozCaptureStream", "webkitCaptureStream"].forEach((function(e) {
        e in document.createElement("canvas") && (i = !0)
    }
    ));
    var o, a, s, u = !(!window.webkitRTCPeerConnection && !window.webkitGetUserMedia || !window.chrome), c = 50, d = navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./);
    if (u && d && d[2] && (c = parseInt(d[2], 10)),
    u && c < 52 && (i = !1),
    t.useWhammyRecorder && (i = !1),
    i)
        if (t.disableLogs || console.log("Your browser supports both MediRecorder API and canvas.captureStream!"),
        e instanceof HTMLCanvasElement)
            o = e;
        else {
            if (!(e instanceof CanvasRenderingContext2D))
                throw "Please pass either HTMLCanvasElement or CanvasRenderingContext2D.";
            o = e.canvas
        }
    else
        navigator.mozGetUserMedia && (t.disableLogs || console.error("Canvas recording is NOT supported in Firefox."));
    this.record = function() {
        if (s = !0,
        i && !t.useWhammyRecorder) {
            var e;
            "captureStream"in o ? e = o.captureStream(25) : "mozCaptureStream"in o ? e = o.mozCaptureStream(25) : "webkitCaptureStream"in o && (e = o.webkitCaptureStream(25));
            try {
                var r = new MediaStream;
                r.addTrack(getTracks(e, "video")[0]),
                e = r
            } catch (u) {}
            if (!e)
                throw "captureStream API are NOT available.";
            (a = new MediaStreamRecorder(e,{
                mimeType: t.mimeType || "video/webm"
            })).record()
        } else
            h.frames = [],
            l = (new Date).getTime(),
            n();
        t.initCallback && t.initCallback()
    }
    ,
    this.getWebPImages = function(r) {
        if ("canvas" === e.nodeName.toLowerCase()) {
            var n = h.frames.length;
            h.frames.forEach((function(e, r) {
                var i = n - r;
                t.disableLogs || console.log(i + "/" + n + " frames remaining"),
                t.onEncodingCallback && t.onEncodingCallback(i, n);
                var o = e.image.toDataURL("image/webp", 1);
                h.frames[r].image = o
            }
            )),
            t.disableLogs || console.log("Generating WebM"),
            r()
        } else
            r()
    }
    ,
    this.stop = function(e) {
        s = !1;
        var r = this;
        return i && a ? void a.stop(e) : void this.getWebPImages((function() {
            h.compile((function(n) {
                t.disableLogs || console.log("Recording finished!"),
                r.blob = n,
                r.blob.forEach && (r.blob = new Blob([],{
                    type: "video/webm"
                })),
                e && e(r.blob),
                h.frames = []
            }
            ))
        }
        ))
    }
    ;
    var f = !1;
    this.pause = function() {
        f = !0,
        a instanceof MediaStreamRecorder && a.pause()
    }
    ,
    this.resume = function() {
        return f = !1,
        a instanceof MediaStreamRecorder ? void a.resume() : void (s || this.record())
    }
    ,
    this.clearRecordedData = function() {
        s && this.stop(r),
        r()
    }
    ,
    this.name = "CanvasRecorder",
    this.toString = function() {
        return this.name
    }
    ;
    var l = (new Date).getTime()
      , h = new Whammy.Video(100)
}
function WhammyRecorder(e, t) {
    function r(e) {
        e = void 0 !== e ? e : 10;
        var t = (new Date).getTime() - s;
        return t ? o ? (s = (new Date).getTime(),
        setTimeout(r, 100)) : (s = (new Date).getTime(),
        a.paused && a.play(),
        d.drawImage(a, 0, 0, c.width, c.height),
        u.frames.push({
            duration: t,
            image: c.toDataURL("image/webp")
        }),
        void (i || setTimeout(r, e, e))) : setTimeout(r, e, e)
    }
    function n() {
        u.frames = [],
        i = !0,
        o = !1
    }
    (t = t || {}).frameInterval || (t.frameInterval = 10),
    t.disableLogs || console.log("Using frames-interval:", t.frameInterval),
    this.record = function() {
        t.width || (t.width = 320),
        t.height || (t.height = 240),
        t.video || (t.video = {
            width: t.width,
            height: t.height
        }),
        t.canvas || (t.canvas = {
            width: t.width,
            height: t.height
        }),
        c.width = t.canvas.width || 320,
        c.height = t.canvas.height || 240,
        d = c.getContext("2d"),
        t.video && t.video instanceof HTMLVideoElement ? (a = t.video.cloneNode(),
        t.initCallback && t.initCallback()) : (a = document.createElement("video"),
        setSrcObject(e, a),
        a.onloadedmetadata = function() {
            t.initCallback && t.initCallback()
        }
        ,
        a.width = t.video.width,
        a.height = t.video.height),
        a.muted = !0,
        a.play(),
        s = (new Date).getTime(),
        u = new Whammy.Video,
        t.disableLogs || (console.log("canvas resolutions", c.width, "*", c.height),
        console.log("video width/height", a.width || c.width, "*", a.height || c.height)),
        r(t.frameInterval)
    }
    ;
    var i = !1;
    this.stop = function(e) {
        e = e || function() {}
        ,
        i = !0;
        var r = this;
        setTimeout((function() {
            !function(e, t, r, n, i) {
                var o = document.createElement("canvas");
                o.width = c.width,
                o.height = c.height;
                var a, s, u, d = o.getContext("2d"), f = [], l = e.length, h = Math.sqrt(Math.pow(255, 2) + Math.pow(255, 2) + Math.pow(255, 2)), p = !1;
                s = -1,
                u = (a = {
                    length: l,
                    functionToLoop: function(t, r) {
                        var n, i, o, a = function() {
                            !p && o - n <= 0 * o || (p = !0,
                            f.push(e[r])),
                            t()
                        };
                        if (p)
                            a();
                        else {
                            var s = new Image;
                            s.onload = function() {
                                d.drawImage(s, 0, 0, c.width, c.height);
                                var e = d.getImageData(0, 0, c.width, c.height);
                                n = 0,
                                i = e.data.length,
                                o = e.data.length / 4;
                                for (var t = 0; t < i; t += 4) {
                                    var r = {
                                        r: e.data[t],
                                        g: e.data[t + 1],
                                        b: e.data[t + 2]
                                    };
                                    Math.sqrt(Math.pow(r.r - 0, 2) + Math.pow(r.g - 0, 2) + Math.pow(r.b - 0, 2)) <= 0 * h && n++
                                }
                                a()
                            }
                            ,
                            s.src = e[r].image
                        }
                    },
                    callback: function() {
                        (f = f.concat(e.slice(l))).length <= 0 && f.push(e[e.length - 1]),
                        i(f)
                    }
                }).length,
                function e() {
                    return ++s === u ? void a.callback() : void setTimeout((function() {
                        a.functionToLoop(e, s)
                    }
                    ), 1)
                }()
            }(u.frames, 0, 0, 0, (function(n) {
                u.frames = n,
                t.advertisement && t.advertisement.length && (u.frames = t.advertisement.concat(u.frames)),
                u.compile((function(t) {
                    r.blob = t,
                    r.blob.forEach && (r.blob = new Blob([],{
                        type: "video/webm"
                    })),
                    e && e(r.blob)
                }
                ))
            }
            ))
        }
        ), 10)
    }
    ;
    var o = !1;
    this.pause = function() {
        o = !0
    }
    ,
    this.resume = function() {
        o = !1,
        i && this.record()
    }
    ,
    this.clearRecordedData = function() {
        i || this.stop(n),
        n()
    }
    ,
    this.name = "WhammyRecorder",
    this.toString = function() {
        return this.name
    }
    ;
    var a, s, u, c = document.createElement("canvas"), d = c.getContext("2d")
}
function GifRecorder(e, t) {
    if ("undefined" == typeof GIFEncoder) {
        var r = document.createElement("script");
        r.src = "https://www.webrtc-experiment.com/gif-recorder.js",
        (document.body || document.documentElement).appendChild(r)
    }
    t = t || {};
    var n = e instanceof CanvasRenderingContext2D || e instanceof HTMLCanvasElement;
    this.record = function() {
        return "undefined" == typeof GIFEncoder ? void setTimeout(l.record, 1e3) : s ? (n || (t.width || (t.width = u.offsetWidth || 320),
        t.height || (t.height = u.offsetHeight || 240),
        t.video || (t.video = {
            width: t.width,
            height: t.height
        }),
        t.canvas || (t.canvas = {
            width: t.width,
            height: t.height
        }),
        o.width = t.canvas.width || 320,
        o.height = t.canvas.height || 240,
        u.width = t.video.width || 320,
        u.height = t.video.height || 240),
        (d = new GIFEncoder).setRepeat(0),
        d.setDelay(t.frameRate || 200),
        d.setQuality(t.quality || 10),
        d.start(),
        "function" == typeof t.onGifRecordingStarted && t.onGifRecordingStarted(),
        Date.now(),
        f = requestAnimationFrame((function e(r) {
            if (!0 !== l.clearedRecordedData) {
                if (i)
                    return setTimeout((function() {
                        e(r)
                    }
                    ), 100);
                f = requestAnimationFrame(e),
                void 0 === typeof c && (c = r),
                r - c < 90 || (!n && u.paused && u.play(),
                n || a.drawImage(u, 0, 0, o.width, o.height),
                t.onGifPreview && t.onGifPreview(o.toDataURL("image/png")),
                d.addFrame(a),
                c = r)
            }
        }
        )),
        void (t.initCallback && t.initCallback())) : void setTimeout(l.record, 1e3)
    }
    ,
    this.stop = function(e) {
        e = e || function() {}
        ,
        f && cancelAnimationFrame(f),
        Date.now(),
        this.blob = new Blob([new Uint8Array(d.stream().bin)],{
            type: "image/gif"
        }),
        e(this.blob),
        d.stream().bin = []
    }
    ;
    var i = !1;
    this.pause = function() {
        i = !0
    }
    ,
    this.resume = function() {
        i = !1
    }
    ,
    this.clearRecordedData = function() {
        l.clearedRecordedData = !0,
        d && (d.stream().bin = [])
    }
    ,
    this.name = "GifRecorder",
    this.toString = function() {
        return this.name
    }
    ;
    var o = document.createElement("canvas")
      , a = o.getContext("2d");
    n && (e instanceof CanvasRenderingContext2D ? o = (a = e).canvas : e instanceof HTMLCanvasElement && (a = e.getContext("2d"),
    o = e));
    var s = !0;
    if (!n) {
        var u = document.createElement("video");
        u.muted = !0,
        u.autoplay = !0,
        s = !1,
        u.onloadedmetadata = function() {
            s = !0
        }
        ,
        setSrcObject(e, u),
        u.play()
    }
    var c, d, f = null, l = this
}
function MultiStreamsMixer(e, t) {
    function r() {
        if (!u) {
            var e = s.length
              , t = !1
              , i = [];
            if (s.forEach((function(e) {
                e.stream || (e.stream = {}),
                e.stream.fullcanvas ? t = e : i.push(e)
            }
            )),
            t)
                c.width = t.stream.width,
                c.height = t.stream.height;
            else if (i.length) {
                c.width = e > 1 ? 2 * i[0].width : i[0].width;
                var o = 1;
                3 !== e && 4 !== e || (o = 2),
                5 !== e && 6 !== e || (o = 3),
                7 !== e && 8 !== e || (o = 4),
                9 !== e && 10 !== e || (o = 5),
                c.height = i[0].height * o
            } else
                c.width = f.width || 360,
                c.height = f.height || 240;
            t && t instanceof HTMLVideoElement && n(t),
            i.forEach((function(e, t) {
                n(e, t)
            }
            )),
            setTimeout(r, f.frameInterval)
        }
    }
    function n(e, t) {
        if (!u) {
            var r = 0
              , n = 0
              , i = e.width
              , o = e.height;
            1 === t && (r = e.width),
            2 === t && (n = e.height),
            3 === t && (r = e.width,
            n = e.height),
            4 === t && (n = 2 * e.height),
            5 === t && (r = e.width,
            n = 2 * e.height),
            6 === t && (n = 3 * e.height),
            7 === t && (r = e.width,
            n = 3 * e.height),
            void 0 !== e.stream.left && (r = e.stream.left),
            void 0 !== e.stream.top && (n = e.stream.top),
            void 0 !== e.stream.width && (i = e.stream.width),
            void 0 !== e.stream.height && (o = e.stream.height),
            d.drawImage(e, r, n, i, o),
            "function" == typeof e.stream.onRender && e.stream.onRender(d, r, n, i, o, t)
        }
    }
    function i(e) {
        var r = document.createElement("video");
        return function(e, t) {
            "srcObject"in t ? t.srcObject = e : "mozSrcObject"in t ? t.mozSrcObject = e : t.srcObject = e
        }(e, r),
        r.className = t,
        r.muted = !0,
        r.volume = 0,
        r.width = e.width || f.width || 360,
        r.height = e.height || f.height || 240,
        r.play(),
        r
    }
    function o(t) {
        s = [],
        (t = t || e).forEach((function(e) {
            if (e.getTracks().filter((function(e) {
                return "video" === e.kind
            }
            )).length) {
                var t = i(e);
                t.stream = e,
                s.push(t)
            }
        }
        ))
    }
    var a;
    a = "undefined" != typeof global ? global : null,
    void 0 === RecordRTC && a && "undefined" == typeof window && "undefined" != typeof global && (global.navigator = {
        userAgent: "Fake/5.0 (FakeOS) AppleWebKit/123 (KHTML, like Gecko) Fake/12.3.4567.89 Fake/123.45",
        getUserMedia: function() {}
    },
    global.console || (global.console = {}),
    void 0 !== global.console.log && void 0 !== global.console.error || (global.console.error = global.console.log = global.console.log || function() {
        console.log(arguments)
    }
    ),
    "undefined" == typeof document && (a.document = {
        documentElement: {
            appendChild: function() {
                return ""
            }
        }
    },
    document.createElement = document.captureStream = document.mozCaptureStream = function() {
        var e = {
            getContext: function() {
                return e
            },
            play: function() {},
            pause: function() {},
            drawImage: function() {},
            toDataURL: function() {
                return ""
            },
            style: {}
        };
        return e
    }
    ,
    a.HTMLVideoElement = function() {}
    ),
    "undefined" == typeof location && (a.location = {
        protocol: "file:",
        href: "",
        hash: ""
    }),
    "undefined" == typeof screen && (a.screen = {
        width: 0,
        height: 0
    }),
    void 0 === h && (a.URL = {
        createObjectURL: function() {
            return ""
        },
        revokeObjectURL: function() {
            return ""
        }
    }),
    a.window = global),
    t = t || "multi-streams-mixer";
    var s = []
      , u = !1
      , c = document.createElement("canvas")
      , d = c.getContext("2d");
    c.style.opacity = 0,
    c.style.position = "absolute",
    c.style.zIndex = -1,
    c.style.top = "-1000em",
    c.style.left = "-1000em",
    c.className = t,
    (document.body || document.documentElement).appendChild(c),
    this.disableLogs = !1,
    this.frameInterval = 10,
    this.width = 360,
    this.height = 240,
    this.useGainNode = !0;
    var f = this
      , l = window.AudioContext;
    void 0 === l && ("undefined" != typeof webkitAudioContext && (l = webkitAudioContext),
    "undefined" != typeof mozAudioContext && (l = mozAudioContext));
    var h = window.URL;
    void 0 === h && "undefined" != typeof webkitURL && (h = webkitURL),
    "undefined" != typeof navigator && void 0 === navigator.getUserMedia && (void 0 !== navigator.webkitGetUserMedia && (navigator.getUserMedia = navigator.webkitGetUserMedia),
    void 0 !== navigator.mozGetUserMedia && (navigator.getUserMedia = navigator.mozGetUserMedia));
    var p = window.MediaStream;
    void 0 === p && "undefined" != typeof webkitMediaStream && (p = webkitMediaStream),
    void 0 !== p && void 0 === p.prototype.stop && (p.prototype.stop = function() {
        this.getTracks().forEach((function(e) {
            e.stop()
        }
        ))
    }
    );
    var g = {};
    void 0 !== l ? g.AudioContext = l : "undefined" != typeof webkitAudioContext && (g.AudioContext = webkitAudioContext),
    this.startDrawingFrames = function() {
        r()
    }
    ,
    this.appendStreams = function(t) {
        if (!t)
            throw "First parameter is required.";
        t instanceof Array || (t = [t]),
        t.forEach((function(t) {
            var r = new p;
            if (t.getTracks().filter((function(e) {
                return "video" === e.kind
            }
            )).length) {
                var n = i(t);
                n.stream = t,
                s.push(n),
                r.addTrack(t.getTracks().filter((function(e) {
                    return "video" === e.kind
                }
                ))[0])
            }
            if (t.getTracks().filter((function(e) {
                return "audio" === e.kind
            }
            )).length) {
                var o = f.audioContext.createMediaStreamSource(t);
                f.audioDestination = f.audioContext.createMediaStreamDestination(),
                o.connect(f.audioDestination),
                r.addTrack(f.audioDestination.stream.getTracks().filter((function(e) {
                    return "audio" === e.kind
                }
                ))[0])
            }
            e.push(r)
        }
        ))
    }
    ,
    this.releaseStreams = function() {
        s = [],
        u = !0,
        f.gainNode && (f.gainNode.disconnect(),
        f.gainNode = null),
        f.audioSources.length && (f.audioSources.forEach((function(e) {
            e.disconnect()
        }
        )),
        f.audioSources = []),
        f.audioDestination && (f.audioDestination.disconnect(),
        f.audioDestination = null),
        f.audioContext && f.audioContext.close(),
        f.audioContext = null,
        d.clearRect(0, 0, c.width, c.height),
        c.stream && (c.stream.stop(),
        c.stream = null)
    }
    ,
    this.resetVideoStreams = function(e) {
        !e || e instanceof Array || (e = [e]),
        o(e)
    }
    ,
    this.name = "MultiStreamsMixer",
    this.toString = function() {
        return this.name
    }
    ,
    this.getMixedStream = function() {
        u = !1;
        var t = function() {
            var e;
            o(),
            "captureStream"in c ? e = c.captureStream() : "mozCaptureStream"in c ? e = c.mozCaptureStream() : f.disableLogs || console.error("Upgrade to latest Chrome or otherwise enable this flag: chrome://flags/#enable-experimental-web-platform-features");
            var t = new p;
            return e.getTracks().filter((function(e) {
                return "video" === e.kind
            }
            )).forEach((function(e) {
                t.addTrack(e)
            }
            )),
            c.stream = t,
            t
        }()
          , r = function() {
            g.AudioContextConstructor || (g.AudioContextConstructor = new g.AudioContext),
            f.audioContext = g.AudioContextConstructor,
            f.audioSources = [],
            !0 === f.useGainNode && (f.gainNode = f.audioContext.createGain(),
            f.gainNode.connect(f.audioContext.destination),
            f.gainNode.gain.value = 0);
            var t = 0;
            if (e.forEach((function(e) {
                if (e.getTracks().filter((function(e) {
                    return "audio" === e.kind
                }
                )).length) {
                    t++;
                    var r = f.audioContext.createMediaStreamSource(e);
                    !0 === f.useGainNode && r.connect(f.gainNode),
                    f.audioSources.push(r)
                }
            }
            )),
            t)
                return f.audioDestination = f.audioContext.createMediaStreamDestination(),
                f.audioSources.forEach((function(e) {
                    e.connect(f.audioDestination)
                }
                )),
                f.audioDestination.stream
        }();
        return r && r.getTracks().filter((function(e) {
            return "audio" === e.kind
        }
        )).forEach((function(e) {
            t.addTrack(e)
        }
        )),
        e.forEach((function(e) {}
        )),
        t
    }
}
function MultiStreamRecorder(e, t) {
    e = e || [];
    var r, n, i = this;
    (t = t || {
        elementClass: "multi-streams-mixer",
        mimeType: "video/webm",
        video: {
            width: 360,
            height: 240
        }
    }).frameInterval || (t.frameInterval = 10),
    t.video || (t.video = {}),
    t.video.width || (t.video.width = 360),
    t.video.height || (t.video.height = 240),
    this.record = function() {
        var i;
        r = new MultiStreamsMixer(e,t.elementClass || "multi-streams-mixer"),
        (i = [],
        e.forEach((function(e) {
            getTracks(e, "video").forEach((function(e) {
                i.push(e)
            }
            ))
        }
        )),
        i).length && (r.frameInterval = t.frameInterval || 10,
        r.width = t.video.width || 360,
        r.height = t.video.height || 240,
        r.startDrawingFrames()),
        t.previewStream && "function" == typeof t.previewStream && t.previewStream(r.getMixedStream()),
        (n = new MediaStreamRecorder(r.getMixedStream(),t)).record()
    }
    ,
    this.stop = function(e) {
        n && n.stop((function(t) {
            i.blob = t,
            e(t),
            i.clearRecordedData()
        }
        ))
    }
    ,
    this.pause = function() {
        n && n.pause()
    }
    ,
    this.resume = function() {
        n && n.resume()
    }
    ,
    this.clearRecordedData = function() {
        n && (n.clearRecordedData(),
        n = null),
        r && (r.releaseStreams(),
        r = null)
    }
    ,
    this.addStreams = function(i) {
        if (!i)
            throw "First parameter is required.";
        i instanceof Array || (i = [i]),
        e.concat(i),
        n && r && (r.appendStreams(i),
        t.previewStream && "function" == typeof t.previewStream && t.previewStream(r.getMixedStream()))
    }
    ,
    this.resetVideoStreams = function(e) {
        r && (!e || e instanceof Array || (e = [e]),
        r.resetVideoStreams(e))
    }
    ,
    this.getMixer = function() {
        return r
    }
    ,
    this.name = "MultiStreamRecorder",
    this.toString = function() {
        return this.name
    }
}
function RecordRTCPromisesHandler(e, t) {
    if (!this)
        throw 'Use "new RecordRTCPromisesHandler()"';
    if (void 0 === e)
        throw 'First argument "MediaStream" is required.';
    var r = this;
    r.recordRTC = new RecordRTC(e,t),
    this.startRecording = function() {
        return new Promise((function(e, t) {
            try {
                r.recordRTC.startRecording(),
                e()
            } catch (n) {
                t(n)
            }
        }
        ))
    }
    ,
    this.stopRecording = function() {
        return new Promise((function(e, t) {
            try {
                r.recordRTC.stopRecording((function(n) {
                    return r.blob = r.recordRTC.getBlob(),
                    r.blob && r.blob.size ? void e(n) : void t("Empty blob.", r.blob)
                }
                ))
            } catch (n) {
                t(n)
            }
        }
        ))
    }
    ,
    this.pauseRecording = function() {
        return new Promise((function(e, t) {
            try {
                r.recordRTC.pauseRecording(),
                e()
            } catch (n) {
                t(n)
            }
        }
        ))
    }
    ,
    this.resumeRecording = function() {
        return new Promise((function(e, t) {
            try {
                r.recordRTC.resumeRecording(),
                e()
            } catch (n) {
                t(n)
            }
        }
        ))
    }
    ,
    this.getDataURL = function(e) {
        return new Promise((function(e, t) {
            try {
                r.recordRTC.getDataURL((function(t) {
                    e(t)
                }
                ))
            } catch (n) {
                t(n)
            }
        }
        ))
    }
    ,
    this.getBlob = function() {
        return new Promise((function(e, t) {
            try {
                e(r.recordRTC.getBlob())
            } catch (n) {
                t(n)
            }
        }
        ))
    }
    ,
    this.getInternalRecorder = function() {
        return new Promise((function(e, t) {
            try {
                e(r.recordRTC.getInternalRecorder())
            } catch (n) {
                t(n)
            }
        }
        ))
    }
    ,
    this.reset = function() {
        return new Promise((function(e, t) {
            try {
                e(r.recordRTC.reset())
            } catch (n) {
                t(n)
            }
        }
        ))
    }
    ,
    this.destroy = function() {
        return new Promise((function(e, t) {
            try {
                e(r.recordRTC.destroy())
            } catch (n) {
                t(n)
            }
        }
        ))
    }
    ,
    this.getState = function() {
        return new Promise((function(e, t) {
            try {
                e(r.recordRTC.getState())
            } catch (n) {
                t(n)
            }
        }
        ))
    }
    ,
    this.blob = null,
    this.version = "5.5.9"
}
function WebAssemblyRecorder(e, t) {
    function r() {
        return new ReadableStream({
            start: function(r) {
                var n = document.createElement("canvas")
                  , i = document.createElement("video");
                i.srcObject = e,
                i.onplaying = function() {
                    n.width = t.width,
                    n.height = t.height;
                    var e = n.getContext("2d")
                      , o = 1e3 / t.frameRate;
                    setTimeout((function n() {
                        e.drawImage(i, 0, 0),
                        r.enqueue(e.getImageData(0, 0, t.width, t.height)),
                        setTimeout(n, o)
                    }
                    ), o)
                }
                ,
                i.play()
            }
        })
    }
    var n, i;
    "undefined" != typeof ReadableStream && "undefined" != typeof WritableStream || console.error("Following polyfill is strongly recommended: https://unpkg.com/@mattiasbuelens/web-streams-polyfill/dist/polyfill.min.js"),
    (t = t || {}).width = t.width || 640,
    t.height = t.height || 480,
    t.frameRate = t.frameRate || 30,
    t.bitrate = t.bitrate || 1200,
    this.record = function() {
        o = [],
        i = !1,
        this.blob = null,
        function e(a, s) {
            if (t.workerPath || s) {
                if (!t.workerPath && s instanceof ArrayBuffer) {
                    var u = new Blob([s],{
                        type: "text/javascript"
                    });
                    t.workerPath = URL.createObjectURL(u)
                }
                t.workerPath || console.error("workerPath parameter is missing."),
                (n = new Worker(t.workerPath)).postMessage(t.webAssemblyPath || "https://unpkg.com/webm-wasm@latest/dist/webm-wasm.wasm"),
                n.addEventListener("message", (function(e) {
                    "READY" === e.data ? (n.postMessage({
                        width: t.width,
                        height: t.height,
                        bitrate: t.bitrate || 1200,
                        timebaseDen: t.frameRate || 30,
                        realtime: !0
                    }),
                    r().pipeTo(new WritableStream({
                        write: function(e) {
                            n && n.postMessage(e.data.buffer, [e.data.buffer])
                        }
                    }))) : e.data && (i || o.push(e.data))
                }
                ))
            } else
                fetch("https://unpkg.com/webm-wasm@latest/dist/webm-worker.js").then((function(t) {
                    t.arrayBuffer().then((function(t) {
                        e(a, t)
                    }
                    ))
                }
                ))
        }(e),
        "function" == typeof t.initCallback && t.initCallback()
    }
    ,
    this.pause = function() {
        i = !0
    }
    ,
    this.resume = function() {
        i = !1
    }
    ;
    var o = [];
    this.stop = function(e) {
        n && (n.postMessage(null),
        n.terminate(),
        n = null),
        this.blob = new Blob(o,{
            type: "video/webm"
        }),
        e(this.blob)
    }
    ,
    this.name = "WebAssemblyRecorder",
    this.toString = function() {
        return this.name
    }
    ,
    this.clearRecordedData = function() {
        o = [],
        i = !1,
        this.blob = null
    }
    ,
    this.blob = null
}
RecordRTC.version = "5.5.9",
"undefined" != typeof module && (module.exports = RecordRTC),
"function" == typeof define && define.amd && define("RecordRTC", [], (function() {
    return RecordRTC
}
)),
RecordRTC.getFromDisk = function(e, t) {
    if (!t)
        throw "callback is mandatory.";
    console.log("Getting recorded " + ("all" === e ? "blobs" : e + " blob ") + " from disk!"),
    DiskStorage.Fetch((function(r, n) {
        "all" !== e && n === e + "Blob" && t && t(r),
        "all" === e && t && t(r, n.replace("Blob", ""))
    }
    ))
}
,
RecordRTC.writeToDisk = function(e) {
    console.log("Writing recorded blob(s) to disk!"),
    (e = e || {}).audio && e.video && e.gif ? e.audio.getDataURL((function(t) {
        e.video.getDataURL((function(r) {
            e.gif.getDataURL((function(e) {
                DiskStorage.Store({
                    audioBlob: t,
                    videoBlob: r,
                    gifBlob: e
                })
            }
            ))
        }
        ))
    }
    )) : e.audio && e.video ? e.audio.getDataURL((function(t) {
        e.video.getDataURL((function(e) {
            DiskStorage.Store({
                audioBlob: t,
                videoBlob: e
            })
        }
        ))
    }
    )) : e.audio && e.gif ? e.audio.getDataURL((function(t) {
        e.gif.getDataURL((function(e) {
            DiskStorage.Store({
                audioBlob: t,
                gifBlob: e
            })
        }
        ))
    }
    )) : e.video && e.gif ? e.video.getDataURL((function(t) {
        e.gif.getDataURL((function(e) {
            DiskStorage.Store({
                videoBlob: t,
                gifBlob: e
            })
        }
        ))
    }
    )) : e.audio ? e.audio.getDataURL((function(e) {
        DiskStorage.Store({
            audioBlob: e
        })
    }
    )) : e.video ? e.video.getDataURL((function(e) {
        DiskStorage.Store({
            videoBlob: e
        })
    }
    )) : e.gif && e.gif.getDataURL((function(e) {
        DiskStorage.Store({
            gifBlob: e
        })
    }
    ))
}
,
MRecordRTC.getFromDisk = RecordRTC.getFromDisk,
MRecordRTC.writeToDisk = RecordRTC.writeToDisk,
void 0 !== RecordRTC && (RecordRTC.MRecordRTC = MRecordRTC);
var browserFakeUserAgent = "Fake/5.0 (FakeOS) AppleWebKit/123 (KHTML, like Gecko) Fake/12.3.4567.89 Fake/123.45";
!function(e) {
    e && "undefined" == typeof window && "undefined" != typeof global && (global.navigator = {
        userAgent: browserFakeUserAgent,
        getUserMedia: function() {}
    },
    global.console || (global.console = {}),
    void 0 !== global.console.log && void 0 !== global.console.error || (global.console.error = global.console.log = global.console.log || function() {
        console.log(arguments)
    }
    ),
    "undefined" == typeof document && (e.document = {
        documentElement: {
            appendChild: function() {
                return ""
            }
        }
    },
    document.createElement = document.captureStream = document.mozCaptureStream = function() {
        var e = {
            getContext: function() {
                return e
            },
            play: function() {},
            pause: function() {},
            drawImage: function() {},
            toDataURL: function() {
                return ""
            },
            style: {}
        };
        return e
    }
    ,
    e.HTMLVideoElement = function() {}
    ),
    "undefined" == typeof location && (e.location = {
        protocol: "file:",
        href: "",
        hash: ""
    }),
    "undefined" == typeof screen && (e.screen = {
        width: 0,
        height: 0
    }),
    void 0 === URL && (e.URL = {
        createObjectURL: function() {
            return ""
        },
        revokeObjectURL: function() {
            return ""
        }
    }),
    e.window = global)
}("undefined" != typeof global ? global : null);
var requestAnimationFrame = window.requestAnimationFrame;
if (void 0 === requestAnimationFrame)
    if ("undefined" != typeof webkitRequestAnimationFrame)
        requestAnimationFrame = webkitRequestAnimationFrame;
    else if ("undefined" != typeof mozRequestAnimationFrame)
        requestAnimationFrame = mozRequestAnimationFrame;
    else if ("undefined" != typeof msRequestAnimationFrame)
        requestAnimationFrame = msRequestAnimationFrame;
    else if (void 0 === requestAnimationFrame) {
        var lastTime = 0;
        requestAnimationFrame = function(e, t) {
            var r = (new Date).getTime()
              , n = Math.max(0, 16 - (r - lastTime))
              , i = setTimeout((function() {
                e(r + n)
            }
            ), n);
            return lastTime = r + n,
            i
        }
    }
var cancelAnimationFrame = window.cancelAnimationFrame;
void 0 === cancelAnimationFrame && ("undefined" != typeof webkitCancelAnimationFrame ? cancelAnimationFrame = webkitCancelAnimationFrame : "undefined" != typeof mozCancelAnimationFrame ? cancelAnimationFrame = mozCancelAnimationFrame : "undefined" != typeof msCancelAnimationFrame ? cancelAnimationFrame = msCancelAnimationFrame : void 0 === cancelAnimationFrame && (cancelAnimationFrame = function(e) {
    clearTimeout(e)
}
));
var AudioContext = window.AudioContext;
void 0 === AudioContext && ("undefined" != typeof webkitAudioContext && (AudioContext = webkitAudioContext),
"undefined" != typeof mozAudioContext && (AudioContext = mozAudioContext));
var URL = window.URL;
void 0 === URL && "undefined" != typeof webkitURL && (URL = webkitURL),
"undefined" != typeof navigator && void 0 === navigator.getUserMedia && (void 0 !== navigator.webkitGetUserMedia && (navigator.getUserMedia = navigator.webkitGetUserMedia),
void 0 !== navigator.mozGetUserMedia && (navigator.getUserMedia = navigator.mozGetUserMedia));
var isEdge = !(-1 === navigator.userAgent.indexOf("Edge") || !navigator.msSaveBlob && !navigator.msSaveOrOpenBlob)
  , isOpera = !!window.opera || -1 !== navigator.userAgent.indexOf("OPR/")
  , isFirefox = navigator.userAgent.toLowerCase().indexOf("firefox") > -1 && "netscape"in window && / rv:/.test(navigator.userAgent)
  , isChrome = !isOpera && !isEdge && !!navigator.webkitGetUserMedia || isElectron() || -1 !== navigator.userAgent.toLowerCase().indexOf("chrome/")
  , isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
isSafari && !isChrome && -1 !== navigator.userAgent.indexOf("CriOS") && (isSafari = !1,
isChrome = !0);
var MediaStream = window.MediaStream;
void 0 === MediaStream && "undefined" != typeof webkitMediaStream && (MediaStream = webkitMediaStream),
void 0 !== MediaStream && void 0 === MediaStream.prototype.stop && (MediaStream.prototype.stop = function() {
    this.getTracks().forEach((function(e) {
        e.stop()
    }
    ))
}
),
void 0 !== RecordRTC && (RecordRTC.invokeSaveAsDialog = invokeSaveAsDialog,
RecordRTC.getTracks = getTracks,
RecordRTC.getSeekableBlob = getSeekableBlob,
RecordRTC.bytesToSize = bytesToSize,
RecordRTC.isElectron = isElectron);
var Storage = {};
void 0 !== AudioContext ? Storage.AudioContext = AudioContext : "undefined" != typeof webkitAudioContext && (Storage.AudioContext = webkitAudioContext),
void 0 !== RecordRTC && (RecordRTC.Storage = Storage),
void 0 !== RecordRTC && (RecordRTC.MediaStreamRecorder = MediaStreamRecorder),
void 0 !== RecordRTC && (RecordRTC.StereoAudioRecorder = StereoAudioRecorder),
void 0 !== RecordRTC && (RecordRTC.CanvasRecorder = CanvasRecorder),
void 0 !== RecordRTC && (RecordRTC.WhammyRecorder = WhammyRecorder);
var Whammy = function() {
    function e(e) {
        this.frames = [],
        this.duration = e || 1,
        this.quality = .8
    }
    function t(e) {
        function t(e, t, r) {
            return [{
                data: e,
                id: 231
            }].concat(r.map((function(e) {
                var r = function(e) {
                    var t = 0;
                    if (e.keyframe && (t |= 128),
                    e.invisible && (t |= 8),
                    e.lacing && (t |= e.lacing << 1),
                    e.discardable && (t |= 1),
                    e.trackNum > 127)
                        throw "TrackNumber > 127 not supported";
                    return [128 | e.trackNum, e.timecode >> 8, 255 & e.timecode, t].map((function(e) {
                        return String.fromCharCode(e)
                    }
                    )).join("") + e.frame
                }({
                    discardable: 0,
                    frame: e.data.slice(4),
                    invisible: 0,
                    keyframe: 1,
                    lacing: 0,
                    trackNum: 1,
                    timecode: Math.round(t)
                });
                return t += e.duration,
                {
                    data: r,
                    id: 163
                }
            }
            )))
        }
        function r(e) {
            for (var t = []; e > 0; )
                t.push(255 & e),
                e >>= 8;
            return new Uint8Array(t.reverse())
        }
        function n(e) {
            var t = [];
            e = (e.length % 8 ? new Array(9 - e.length % 8).join("0") : "") + e;
            for (var r = 0; r < e.length; r += 8)
                t.push(parseInt(e.substr(r, 8), 2));
            return new Uint8Array(t)
        }
        function i(e, t) {
            return parseInt(e.substr(t + 4, 4).split("").map((function(e) {
                var t = e.charCodeAt(0).toString(2);
                return new Array(8 - t.length + 1).join("0") + t
            }
            )).join(""), 2)
        }
        var o = new function(e) {
            var i, o = function(e) {
                if (e[0]) {
                    for (var t = e[0].width, r = e[0].height, n = e[0].duration, i = 1; i < e.length; i++)
                        n += e[i].duration;
                    return {
                        duration: n,
                        width: t,
                        height: r
                    }
                }
                postMessage({
                    error: "Something went wrong. Maybe WebP format is not supported in the current browser."
                })
            }(e);
            if (!o)
                return [];
            for (var a = [{
                id: 440786851,
                data: [{
                    data: 1,
                    id: 17030
                }, {
                    data: 1,
                    id: 17143
                }, {
                    data: 4,
                    id: 17138
                }, {
                    data: 8,
                    id: 17139
                }, {
                    data: "webm",
                    id: 17026
                }, {
                    data: 2,
                    id: 17031
                }, {
                    data: 2,
                    id: 17029
                }]
            }, {
                id: 408125543,
                data: [{
                    id: 357149030,
                    data: [{
                        data: 1e6,
                        id: 2807729
                    }, {
                        data: "whammy",
                        id: 19840
                    }, {
                        data: "whammy",
                        id: 22337
                    }, {
                        data: (i = o.duration,
                        [].slice.call(new Uint8Array(new Float64Array([i]).buffer), 0).map((function(e) {
                            return String.fromCharCode(e)
                        }
                        )).reverse().join("")),
                        id: 17545
                    }]
                }, {
                    id: 374648427,
                    data: [{
                        id: 174,
                        data: [{
                            data: 1,
                            id: 215
                        }, {
                            data: 1,
                            id: 29637
                        }, {
                            data: 0,
                            id: 156
                        }, {
                            data: "und",
                            id: 2274716
                        }, {
                            data: "V_VP8",
                            id: 134
                        }, {
                            data: "VP8",
                            id: 2459272
                        }, {
                            data: 1,
                            id: 131
                        }, {
                            id: 224,
                            data: [{
                                data: o.width,
                                id: 176
                            }, {
                                data: o.height,
                                id: 186
                            }]
                        }]
                    }]
                }]
            }], s = 0, u = 0; s < e.length; ) {
                var c = []
                  , d = 0;
                do {
                    c.push(e[s]),
                    d += e[s].duration,
                    s++
                } while (s < e.length && d < 3e4);var f = {
                    id: 524531317,
                    data: t(u, 0, c)
                };
                a[1].data.push(f),
                u += d
            }
            return function e(t) {
                for (var i = [], o = 0; o < t.length; o++) {
                    var a = t[o].data;
                    "object" == typeof a && (a = e(a)),
                    "number" == typeof a && (a = n(a.toString(2))),
                    "string" == typeof a && (a = new Uint8Array(a.split("").map((function(e) {
                        return e.charCodeAt(0)
                    }
                    ))));
                    var s = a.size || a.byteLength || a.length
                      , u = Math.ceil(Math.ceil(Math.log(s) / Math.log(2)) / 8)
                      , c = s.toString(2)
                      , d = new Array(7 * u + 7 + 1 - c.length).join("0") + c
                      , f = new Array(u).join("0") + "1" + d;
                    i.push(r(t[o].id)),
                    i.push(n(f)),
                    i.push(a)
                }
                return new Blob(i,{
                    type: "video/webm"
                })
            }(a)
        }
        (e.map((function(e) {
            var t = function(e) {
                for (var t = e.RIFF[0].WEBP[0], r = t.indexOf("*"), n = 0, i = []; n < 4; n++)
                    i[n] = t.charCodeAt(r + 3 + n);
                return {
                    width: 16383 & (i[1] << 8 | i[0]),
                    height: 16383 & (i[3] << 8 | i[2]),
                    data: t,
                    riff: e
                }
            }(function e(t) {
                for (var r = 0, n = {}; r < t.length; ) {
                    var o = t.substr(r, 4)
                      , a = i(t, r)
                      , s = t.substr(r + 4 + 4, a);
                    r += 8 + a,
                    n[o] = n[o] || [],
                    n[o].push("RIFF" === o || "LIST" === o ? e(s) : s)
                }
                return n
            }(atob(e.image.slice(23))));
            return t.duration = e.duration,
            t
        }
        )));
        postMessage(o)
    }
    return e.prototype.add = function(e, t) {
        if ("canvas"in e && (e = e.canvas),
        "toDataURL"in e && (e = e.toDataURL("image/webp", this.quality)),
        !/^data:image\/webp;base64,/gi.test(e))
            throw "Input must be formatted properly as a base64 encoded DataURI of type image/webp";
        this.frames.push({
            image: e,
            duration: t || this.duration
        })
    }
    ,
    e.prototype.compile = function(e) {
        var r, n, i, o = (r = t,
        n = URL.createObjectURL(new Blob([r.toString(), "this.onmessage =  function (eee) {" + r.name + "(eee.data);}"],{
            type: "application/javascript"
        })),
        i = new Worker(n),
        URL.revokeObjectURL(n),
        i);
        o.onmessage = function(t) {
            return t.data.error ? void console.error(t.data.error) : void e(t.data)
        }
        ,
        o.postMessage(this.frames)
    }
    ,
    {
        Video: e
    }
}();
void 0 !== RecordRTC && (RecordRTC.Whammy = Whammy);
var DiskStorage = {
    init: function() {
        function e(e) {
            e.createObjectStore(r.dataStoreName)
        }
        function t() {
            function e(e) {
                t.objectStore(r.dataStoreName).get(e).onsuccess = function(t) {
                    r.callback && r.callback(t.target.result, e)
                }
            }
            var t = n.transaction([r.dataStoreName], "readwrite");
            r.videoBlob && t.objectStore(r.dataStoreName).put(r.videoBlob, "videoBlob"),
            r.gifBlob && t.objectStore(r.dataStoreName).put(r.gifBlob, "gifBlob"),
            r.audioBlob && t.objectStore(r.dataStoreName).put(r.audioBlob, "audioBlob"),
            e("audioBlob"),
            e("videoBlob"),
            e("gifBlob")
        }
        var r = this;
        if ("undefined" != typeof indexedDB && void 0 !== indexedDB.open) {
            var n, i = this.dbName || location.href.replace(/\/|:|#|%|\.|\[|\]/g, ""), o = indexedDB.open(i, 1);
            o.onerror = r.onError,
            o.onsuccess = function() {
                (n = o.result).onerror = r.onError,
                n.setVersion && 1 !== n.version ? n.setVersion(1).onsuccess = function() {
                    e(n),
                    t()
                }
                : t()
            }
            ,
            o.onupgradeneeded = function(t) {
                e(t.target.result)
            }
        } else
            console.error("IndexedDB API are not available in this browser.")
    },
    Fetch: function(e) {
        return this.callback = e,
        this.init(),
        this
    },
    Store: function(e) {
        return this.audioBlob = e.audioBlob,
        this.videoBlob = e.videoBlob,
        this.gifBlob = e.gifBlob,
        this.init(),
        this
    },
    onError: function(e) {
        console.error(JSON.stringify(e, null, "\t"))
    },
    dataStoreName: "recordRTC",
    dbName: null
};
void 0 !== RecordRTC && (RecordRTC.DiskStorage = DiskStorage),
void 0 !== RecordRTC && (RecordRTC.GifRecorder = GifRecorder),
void 0 === RecordRTC && ("undefined" != typeof module && (module.exports = MultiStreamsMixer),
"function" == typeof define && define.amd && define("MultiStreamsMixer", [], (function() {
    return MultiStreamsMixer
}
))),
void 0 !== RecordRTC && (RecordRTC.MultiStreamRecorder = MultiStreamRecorder),
void 0 !== RecordRTC && (RecordRTC.RecordRTCPromisesHandler = RecordRTCPromisesHandler),
void 0 !== RecordRTC && (RecordRTC.WebAssemblyRecorder = WebAssemblyRecorder),
function(e) {
    "object" == typeof exports && "undefined" != typeof module ? module.exports = e() : "function" == typeof define && define.amd ? define([], e) : ("undefined" != typeof window ? window : "undefined" != typeof global ? global : "undefined" != typeof self ? self : this).ss = e()
}((function() {
    return function e(t, r, n) {
        function i(a, s) {
            if (!r[a]) {
                if (!t[a]) {
                    var u = "function" == typeof require && require;
                    if (!s && u)
                        return u(a, !0);
                    if (o)
                        return o(a, !0);
                    var c = new Error("Cannot find module '" + a + "'");
                    throw c.code = "MODULE_NOT_FOUND",
                    c
                }
                var d = r[a] = {
                    exports: {}
                };
                t[a][0].call(d.exports, (function(e) {
                    return i(t[a][1][e] || e)
                }
                ), d, d.exports, e, t, r, n)
            }
            return r[a].exports
        }
        for (var o = "function" == typeof require && require, a = 0; a < n.length; a++)
            i(n[a]);
        return i
    }({
        1: [function(e, t, r) {
            t.exports = e("./lib")
        }
        , {
            "./lib": 3
        }],
        2: [function(e, t, r) {
            (function(r) {
                var n = e("util")
                  , i = e("stream").Readable
                  , o = e("component-bind");
                function a(e, t) {
                    if (!(this instanceof a))
                        return new a(e,t);
                    var r;
                    i.call(this, t),
                    t = t || {},
                    this.blob = e,
                    this.slice = e.slice || e.webkitSlice || e.mozSlice,
                    this.start = 0,
                    this.sync = t.synchronous || !1,
                    (r = this.fileReader = t.synchronous ? new FileReaderSync : new FileReader).onload = o(this, "_onload"),
                    r.onerror = o(this, "_onerror")
                }
                t.exports = a,
                n.inherits(a, i),
                a.prototype._read = function(e) {
                    var t = this.start
                      , n = this.start = this.start + e
                      , i = this.slice.call(this.blob, t, n);
                    if (i.size)
                        if (this.sync) {
                            var o = new r(new Uint8Array(this.fileReader.readAsArrayBuffer(i)));
                            this.push(o)
                        } else
                            this.fileReader.readAsArrayBuffer(i);
                    else
                        this.push(null)
                }
                ,
                a.prototype._onload = function(e) {
                    var t = new r(new Uint8Array(e.target.result));
                    this.push(t)
                }
                ,
                a.prototype._onerror = function(e) {
                    this.emit("error", e.target.error)
                }
            }
            ).call(this, e("buffer").Buffer)
        }
        , {
            buffer: 11,
            "component-bind": 12,
            stream: 35,
            util: 40
        }],
        3: [function(e, t, r) {
            (function(n) {
                var i = e("./socket")
                  , o = e("./iostream")
                  , a = e("./blob-read-stream");
                (r = t.exports = function(e, t) {
                    return null == (t = t || {}).forceBase64 && (t.forceBase64 = r.forceBase64),
                    e._streamSocket || (e._streamSocket = new i(e,t)),
                    e._streamSocket
                }
                ).Buffer = n,
                r.Socket = i,
                r.IOStream = o,
                r.forceBase64 = !1,
                r.createStream = function(e) {
                    return new o(e)
                }
                ,
                r.createBlobReadStream = function(e, t) {
                    return new a(e,t)
                }
            }
            ).call(this, e("buffer").Buffer)
        }
        , {
            "./blob-read-stream": 2,
            "./iostream": 4,
            "./socket": 6,
            buffer: 11
        }],
        4: [function(e, t, r) {
            var n = e("util")
              , i = e("stream").Duplex
              , o = e("component-bind")
              , a = e("./uuid")
              , s = e("debug")("socket.io-stream:iostream");
            function u(e) {
                if (!(this instanceof u))
                    return new u(e);
                u.super_.call(this, e),
                this.options = e,
                this.id = a(),
                this.socket = null,
                this.pushBuffer = [],
                this.writeBuffer = [],
                this._readable = !1,
                this._writable = !1,
                this.destroyed = !1,
                this.allowHalfOpen = e && e.allowHalfOpen || !1,
                this.on("finish", this._onfinish),
                this.on("end", this._onend),
                this.on("error", this._onerror)
            }
            t.exports = u,
            n.inherits(u, i),
            u.prototype.destroy = function() {
                s("destroy"),
                this.destroyed ? s("already destroyed") : (this.readable = this.writable = !1,
                this.socket && (s("clean up"),
                this.socket.cleanup(this.id),
                this.socket = null),
                this.destroyed = !0)
            }
            ,
            u.prototype._read = function(e) {
                var t;
                if (!this.destroyed)
                    if (this.pushBuffer.length)
                        for (; (t = this.pushBuffer.shift()) && t(); )
                            ;
                    else
                        this._readable = !0,
                        this.socket._read(this.id, e)
            }
            ,
            u.prototype._onread = function(e) {
                var t = this.writeBuffer.shift();
                if (t)
                    return t();
                this._writable = !0
            }
            ,
            u.prototype._write = function(e, t, r) {
                var n = this;
                function i() {
                    n.destroyed || (n._writable = !1,
                    n.socket._write(n.id, e, t, r))
                }
                this._writable ? i() : this.writeBuffer.push(i)
            }
            ,
            u.prototype._onwrite = function(e, t, r) {
                var n = this;
                function i() {
                    n._readable = !1;
                    var i = n.push(e || "", t);
                    return r(),
                    i
                }
                this._readable ? i() : this.pushBuffer.push(i)
            }
            ,
            u.prototype._end = function() {
                this.pushBuffer.length ? this.pushBuffer.push(o(this, "_done")) : this._done()
            }
            ,
            u.prototype._done = function() {
                return this._readable = !1,
                this.push(null)
            }
            ,
            u.prototype._onfinish = function() {
                if (s("_onfinish"),
                this.socket && this.socket._end(this.id),
                this.writable = !1,
                this._writableState.ended = !0,
                !this.readable || this._readableState.ended)
                    return s("_onfinish: ended, destroy %s", this._readableState),
                    this.destroy();
                s("_onfinish: not ended"),
                this.allowHalfOpen || (this.push(null),
                this.readable && !this._readableState.endEmitted && this.read(0))
            }
            ,
            u.prototype._onend = function() {
                if (s("_onend"),
                this.readable = !1,
                this._readableState.ended = !0,
                !this.writable || this._writableState.finished)
                    return s("_onend: %s", this._writableState),
                    this.destroy();
                s("_onend: not finished"),
                this.allowHalfOpen || this.end()
            }
            ,
            u.prototype._onerror = function(e) {
                !e.remote && this.socket && this.socket._error(this.id, e),
                this.destroy()
            }
        }
        , {
            "./uuid": 7,
            "component-bind": 12,
            debug: 14,
            stream: 35,
            util: 40
        }],
        5: [function(e, t, r) {
            var n = e("util")
              , i = e("events").EventEmitter
              , o = e("./iostream");
            function a() {
                i.call(this)
            }
            function s() {
                i.call(this)
            }
            r.Encoder = a,
            r.Decoder = s,
            n.inherits(a, i),
            a.prototype.encode = function(e) {
                return e instanceof o ? this.encodeStream(e) : n.isArray(e) ? this.encodeArray(e) : e && "object" == typeof e ? this.encodeObject(e) : e
            }
            ,
            a.prototype.encodeStream = function(e) {
                this.emit("stream", e);
                var t = {
                    $stream: e.id
                };
                return e.options && (t.options = e.options),
                t
            }
            ,
            a.prototype.encodeArray = function(e) {
                for (var t = [], r = 0, n = e.length; r < n; r++)
                    t.push(this.encode(e[r]));
                return t
            }
            ,
            a.prototype.encodeObject = function(e) {
                var t = {};
                for (var r in e)
                    e.hasOwnProperty(r) && (t[r] = this.encode(e[r]));
                return t
            }
            ,
            n.inherits(s, i),
            s.prototype.decode = function(e) {
                return e && e.$stream ? this.decodeStream(e) : n.isArray(e) ? this.decodeArray(e) : e && "object" == typeof e ? this.decodeObject(e) : e
            }
            ,
            s.prototype.decodeStream = function(e) {
                var t = new o(e.options);
                return t.id = e.$stream,
                this.emit("stream", t),
                t
            }
            ,
            s.prototype.decodeArray = function(e) {
                for (var t = [], r = 0, n = e.length; r < n; r++)
                    t.push(this.decode(e[r]));
                return t
            }
            ,
            s.prototype.decodeObject = function(e) {
                var t = {};
                for (var r in e)
                    e.hasOwnProperty(r) && (t[r] = this.decode(e[r]));
                return t
            }
        }
        , {
            "./iostream": 4,
            events: 16,
            util: 40
        }],
        6: [function(e, t, r) {
            (function(n, i) {
                var o = e("util")
                  , a = e("events").EventEmitter
                  , s = e("component-bind")
                  , u = (e("./iostream"),
                e("./parser"))
                  , c = e("debug")("socket.io-stream:socket")
                  , d = a.prototype.emit
                  , f = a.prototype.on
                  , l = Array.prototype.slice;
                function h(e, t) {
                    if (!(this instanceof h))
                        return new h(e,t);
                    a.call(this),
                    t = t || {},
                    this.sio = e,
                    this.forceBase64 = !!t.forceBase64,
                    this.streams = {},
                    this.encoder = new u.Encoder,
                    this.decoder = new u.Decoder;
                    var n = r.event;
                    e.on(n, s(this, d)),
                    e.on(n + "-read", s(this, "_onread")),
                    e.on(n + "-write", s(this, "_onwrite")),
                    e.on(n + "-end", s(this, "_onend")),
                    e.on(n + "-error", s(this, "_onerror")),
                    e.on("error", s(this, d, "error")),
                    e.on("disconnect", s(this, "_ondisconnect")),
                    this.encoder.on("stream", s(this, "_onencode")),
                    this.decoder.on("stream", s(this, "_ondecode"))
                }
                (r = t.exports = h).event = "$stream",
                r.events = ["error", "newListener", "removeListener"],
                o.inherits(h, a),
                h.prototype.$emit = d,
                h.prototype.emit = function(e) {
                    return ~r.events.indexOf(e) ? d.apply(this, arguments) : (this._stream.apply(this, arguments),
                    this)
                }
                ,
                h.prototype.on = function(e, t) {
                    return ~r.events.indexOf(e) ? f.apply(this, arguments) : (this._onstream(e, t),
                    this)
                }
                ,
                h.prototype._stream = function(e) {
                    c("sending new streams");
                    var t = this
                      , n = l.call(arguments, 1)
                      , i = n[n.length - 1];
                    "function" == typeof i && (n[n.length - 1] = function() {
                        var e = l.call(arguments);
                        e = t.decoder.decode(e),
                        i.apply(this, e)
                    }
                    ),
                    n = this.encoder.encode(n);
                    var o = this.sio;
                    o.emit.apply(o, [r.event, e].concat(n))
                }
                ,
                h.prototype._read = function(e, t) {
                    this.sio.emit(r.event + "-read", e, t)
                }
                ,
                h.prototype._write = function(e, t, o, a) {
                    i.isBuffer(t) && (this.forceBase64 ? t = t.toString(o = "base64") : n.Buffer || (t = t.toArrayBuffer ? t.toArrayBuffer() : t.buffer)),
                    this.sio.emit(r.event + "-write", e, t, o, a)
                }
                ,
                h.prototype._end = function(e) {
                    this.sio.emit(r.event + "-end", e)
                }
                ,
                h.prototype._error = function(e, t) {
                    this.sio.emit(r.event + "-error", e, t.message || t)
                }
                ,
                h.prototype._onstream = function(e, t) {
                    if ("function" != typeof t)
                        throw TypeError("listener must be a function");
                    function r() {
                        c("new streams");
                        var e = this
                          , r = l.call(arguments)
                          , n = r[r.length - 1];
                        "function" == typeof n && (r[r.length - 1] = function() {
                            var t = l.call(arguments);
                            t = e.encoder.encode(t),
                            n.apply(this, t)
                        }
                        ),
                        r = this.decoder.decode(r),
                        t.apply(this, r)
                    }
                    r.listener = t,
                    f.call(this, e, r)
                }
                ,
                h.prototype._onread = function(e, t) {
                    c('read: "%s"', e);
                    var r = this.streams[e];
                    r ? r._onread(t) : c("ignore invalid stream id")
                }
                ,
                h.prototype._onwrite = function(e, t, r, o) {
                    c('write: "%s"', e);
                    var a = this.streams[e];
                    a ? (n.ArrayBuffer && t instanceof ArrayBuffer && (t = new i(new Uint8Array(t))),
                    a._onwrite(t, r, o)) : o("invalid stream id: " + e)
                }
                ,
                h.prototype._onend = function(e) {
                    c('end: "%s"', e);
                    var t = this.streams[e];
                    t ? t._end() : c('ignore non-existent stream id: "%s"', e)
                }
                ,
                h.prototype._onerror = function(e, t) {
                    c('error: "%s", "%s"', e, t);
                    var r = this.streams[e];
                    if (r) {
                        var n = new Error(t);
                        n.remote = !0,
                        r.emit("error", n)
                    } else
                        c('invalid stream id: "%s"', e)
                }
                ,
                h.prototype._ondisconnect = function() {
                    var e;
                    for (var t in this.streams)
                        (e = this.streams[t]).destroy(),
                        e.emit("close"),
                        e.emit("error", new Error("Connection aborted"))
                }
                ,
                h.prototype._onencode = function(e) {
                    if (e.socket || e.destroyed)
                        throw new Error("stream has already been sent.");
                    var t = e.id;
                    if (this.streams[t])
                        throw new Error("Encoded stream already exists: " + t);
                    this.streams[t] = e,
                    e.socket = this
                }
                ,
                h.prototype._ondecode = function(e) {
                    var t = e.id;
                    this.streams[t] ? this._error(t, new Error("Decoded stream already exists: " + t)) : (this.streams[t] = e,
                    e.socket = this)
                }
                ,
                h.prototype.cleanup = function(e) {
                    delete this.streams[e]
                }
            }
            ).call(this, "undefined" != typeof global ? global : "undefined" != typeof self ? self : "undefined" != typeof window ? window : {}, e("buffer").Buffer)
        }
        , {
            "./iostream": 4,
            "./parser": 5,
            buffer: 11,
            "component-bind": 12,
            debug: 14,
            events: 16,
            util: 40
        }],
        7: [function(e, t, r) {
            t.exports = function e(t) {
                return t ? (t ^ 16 * Math.random() >> t / 4).toString(16) : ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, e)
            }
        }
        , {}],
        8: [function(e, t, r) {
            r.byteLength = function(e) {
                return 3 * e.length / 4 - c(e)
            }
            ,
            r.toByteArray = function(e) {
                var t, r, n, a, s, u, d = e.length;
                s = c(e),
                u = new o(3 * d / 4 - s),
                n = s > 0 ? d - 4 : d;
                var f = 0;
                for (t = 0,
                r = 0; t < n; t += 4,
                r += 3)
                    a = i[e.charCodeAt(t)] << 18 | i[e.charCodeAt(t + 1)] << 12 | i[e.charCodeAt(t + 2)] << 6 | i[e.charCodeAt(t + 3)],
                    u[f++] = a >> 16 & 255,
                    u[f++] = a >> 8 & 255,
                    u[f++] = 255 & a;
                return 2 === s ? (a = i[e.charCodeAt(t)] << 2 | i[e.charCodeAt(t + 1)] >> 4,
                u[f++] = 255 & a) : 1 === s && (a = i[e.charCodeAt(t)] << 10 | i[e.charCodeAt(t + 1)] << 4 | i[e.charCodeAt(t + 2)] >> 2,
                u[f++] = a >> 8 & 255,
                u[f++] = 255 & a),
                u
            }
            ,
            r.fromByteArray = function(e) {
                for (var t, r = e.length, i = r % 3, o = "", a = [], s = 0, u = r - i; s < u; s += 16383)
                    a.push(d(e, s, s + 16383 > u ? u : s + 16383));
                return 1 === i ? (o += n[(t = e[r - 1]) >> 2],
                o += n[t << 4 & 63],
                o += "==") : 2 === i && (o += n[(t = (e[r - 2] << 8) + e[r - 1]) >> 10],
                o += n[t >> 4 & 63],
                o += n[t << 2 & 63],
                o += "="),
                a.push(o),
                a.join("")
            }
            ;
            for (var n = [], i = [], o = "undefined" != typeof Uint8Array ? Uint8Array : Array, a = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", s = 0, u = a.length; s < u; ++s)
                n[s] = a[s],
                i[a.charCodeAt(s)] = s;
            function c(e) {
                var t = e.length;
                if (t % 4 > 0)
                    throw new Error("Invalid string. Length must be a multiple of 4");
                return "=" === e[t - 2] ? 2 : "=" === e[t - 1] ? 1 : 0
            }
            function d(e, t, r) {
                for (var i, o = [], a = t; a < r; a += 3)
                    o.push(n[(i = (e[a] << 16) + (e[a + 1] << 8) + e[a + 2]) >> 18 & 63] + n[i >> 12 & 63] + n[i >> 6 & 63] + n[63 & i]);
                return o.join("")
            }
            i["-".charCodeAt(0)] = 62,
            i["_".charCodeAt(0)] = 63
        }
        , {}],
        9: [function(e, t, r) {}
        , {}],
        10: [function(e, t, r) {
            (function(t) {
                var n = e("buffer")
                  , i = n.Buffer
                  , o = n.SlowBuffer
                  , a = n.kMaxLength || 2147483647;
                r.alloc = function(e, t, r) {
                    if ("function" == typeof i.alloc)
                        return i.alloc(e, t, r);
                    if ("number" == typeof r)
                        throw new TypeError("encoding must not be number");
                    if ("number" != typeof e)
                        throw new TypeError("size must be a number");
                    if (e > a)
                        throw new RangeError("size is too large");
                    var n = r
                      , o = t;
                    void 0 === o && (n = void 0,
                    o = 0);
                    var s = new i(e);
                    if ("string" == typeof o)
                        for (var u = new i(o,n), c = u.length, d = -1; ++d < e; )
                            s[d] = u[d % c];
                    else
                        s.fill(o);
                    return s
                }
                ,
                r.allocUnsafe = function(e) {
                    if ("function" == typeof i.allocUnsafe)
                        return i.allocUnsafe(e);
                    if ("number" != typeof e)
                        throw new TypeError("size must be a number");
                    if (e > a)
                        throw new RangeError("size is too large");
                    return new i(e)
                }
                ,
                r.from = function(e, r, n) {
                    if ("function" == typeof i.from && (!t.Uint8Array || Uint8Array.from !== i.from))
                        return i.from(e, r, n);
                    if ("number" == typeof e)
                        throw new TypeError('"value" argument must not be a number');
                    if ("string" == typeof e)
                        return new i(e,r);
                    if ("undefined" != typeof ArrayBuffer && e instanceof ArrayBuffer) {
                        var o = r;
                        if (1 === arguments.length)
                            return new i(e);
                        void 0 === o && (o = 0);
                        var a = n;
                        if (void 0 === a && (a = e.byteLength - o),
                        o >= e.byteLength)
                            throw new RangeError("'offset' is out of bounds");
                        if (a > e.byteLength - o)
                            throw new RangeError("'length' is out of bounds");
                        return new i(e.slice(o, o + a))
                    }
                    if (i.isBuffer(e)) {
                        var s = new i(e.length);
                        return e.copy(s, 0, 0, e.length),
                        s
                    }
                    if (e) {
                        if (Array.isArray(e) || "undefined" != typeof ArrayBuffer && e.buffer instanceof ArrayBuffer || "length"in e)
                            return new i(e);
                        if ("Buffer" === e.type && Array.isArray(e.data))
                            return new i(e.data)
                    }
                    throw new TypeError("First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.")
                }
                ,
                r.allocUnsafeSlow = function(e) {
                    if ("function" == typeof i.allocUnsafeSlow)
                        return i.allocUnsafeSlow(e);
                    if ("number" != typeof e)
                        throw new TypeError("size must be a number");
                    if (e >= a)
                        throw new RangeError("size is too large");
                    return new o(e)
                }
            }
            ).call(this, "undefined" != typeof global ? global : "undefined" != typeof self ? self : "undefined" != typeof window ? window : {})
        }
        , {
            buffer: 11
        }],
        11: [function(e, t, r) {
            (function(t) {
                var n = e("base64-js")
                  , i = e("ieee754")
                  , o = e("isarray");
                function a() {
                    return u.TYPED_ARRAY_SUPPORT ? 2147483647 : 1073741823
                }
                function s(e, t) {
                    if (a() < t)
                        throw new RangeError("Invalid typed array length");
                    return u.TYPED_ARRAY_SUPPORT ? (e = new Uint8Array(t)).__proto__ = u.prototype : (null === e && (e = new u(t)),
                    e.length = t),
                    e
                }
                function u(e, t, r) {
                    if (!(u.TYPED_ARRAY_SUPPORT || this instanceof u))
                        return new u(e,t,r);
                    if ("number" == typeof e) {
                        if ("string" == typeof t)
                            throw new Error("If encoding is specified then the first argument must be a string");
                        return f(this, e)
                    }
                    return c(this, e, t, r)
                }
                function c(e, t, r, n) {
                    if ("number" == typeof t)
                        throw new TypeError('"value" argument must not be a number');
                    return "undefined" != typeof ArrayBuffer && t instanceof ArrayBuffer ? function(e, t, r, n) {
                        if (r < 0 || t.byteLength < r)
                            throw new RangeError("'offset' is out of bounds");
                        if (t.byteLength < r + (n || 0))
                            throw new RangeError("'length' is out of bounds");
                        return t = void 0 === r && void 0 === n ? new Uint8Array(t) : void 0 === n ? new Uint8Array(t,r) : new Uint8Array(t,r,n),
                        u.TYPED_ARRAY_SUPPORT ? (e = t).__proto__ = u.prototype : e = l(e, t),
                        e
                    }(e, t, r, n) : "string" == typeof t ? function(e, t, r) {
                        if ("string" == typeof r && "" !== r || (r = "utf8"),
                        !u.isEncoding(r))
                            throw new TypeError('"encoding" must be a valid string encoding');
                        var n = 0 | p(t, r)
                          , i = (e = s(e, n)).write(t, r);
                        return i !== n && (e = e.slice(0, i)),
                        e
                    }(e, t, r) : function(e, t) {
                        if (u.isBuffer(t)) {
                            var r = 0 | h(t.length);
                            return 0 === (e = s(e, r)).length ? e : (t.copy(e, 0, 0, r),
                            e)
                        }
                        if (t) {
                            if ("undefined" != typeof ArrayBuffer && t.buffer instanceof ArrayBuffer || "length"in t)
                                return "number" != typeof t.length || (n = t.length) != n ? s(e, 0) : l(e, t);
                            if ("Buffer" === t.type && o(t.data))
                                return l(e, t.data)
                        }
                        var n;
                        throw new TypeError("First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.")
                    }(e, t)
                }
                function d(e) {
                    if ("number" != typeof e)
                        throw new TypeError('"size" argument must be a number');
                    if (e < 0)
                        throw new RangeError('"size" argument must not be negative')
                }
                function f(e, t) {
                    if (d(t),
                    e = s(e, t < 0 ? 0 : 0 | h(t)),
                    !u.TYPED_ARRAY_SUPPORT)
                        for (var r = 0; r < t; ++r)
                            e[r] = 0;
                    return e
                }
                function l(e, t) {
                    var r = t.length < 0 ? 0 : 0 | h(t.length);
                    e = s(e, r);
                    for (var n = 0; n < r; n += 1)
                        e[n] = 255 & t[n];
                    return e
                }
                function h(e) {
                    if (e >= a())
                        throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x" + a().toString(16) + " bytes");
                    return 0 | e
                }
                function p(e, t) {
                    if (u.isBuffer(e))
                        return e.length;
                    if ("undefined" != typeof ArrayBuffer && "function" == typeof ArrayBuffer.isView && (ArrayBuffer.isView(e) || e instanceof ArrayBuffer))
                        return e.byteLength;
                    "string" != typeof e && (e = "" + e);
                    var r = e.length;
                    if (0 === r)
                        return 0;
                    for (var n = !1; ; )
                        switch (t) {
                        case "ascii":
                        case "latin1":
                        case "binary":
                            return r;
                        case "utf8":
                        case "utf-8":
                        case void 0:
                            return z(e).length;
                        case "ucs2":
                        case "ucs-2":
                        case "utf16le":
                        case "utf-16le":
                            return 2 * r;
                        case "hex":
                            return r >>> 1;
                        case "base64":
                            return N(e).length;
                        default:
                            if (n)
                                return z(e).length;
                            t = ("" + t).toLowerCase(),
                            n = !0
                        }
                }
                function g(e, t, r) {
                    var n = !1;
                    if ((void 0 === t || t < 0) && (t = 0),
                    t > this.length)
                        return "";
                    if ((void 0 === r || r > this.length) && (r = this.length),
                    r <= 0)
                        return "";
                    if ((r >>>= 0) <= (t >>>= 0))
                        return "";
                    for (e || (e = "utf8"); ; )
                        switch (e) {
                        case "hex":
                            return L(this, t, r);
                        case "utf8":
                        case "utf-8":
                            return C(this, t, r);
                        case "ascii":
                            return E(this, t, r);
                        case "latin1":
                        case "binary":
                            return M(this, t, r);
                        case "base64":
                            return k(this, t, r);
                        case "ucs2":
                        case "ucs-2":
                        case "utf16le":
                        case "utf-16le":
                            return x(this, t, r);
                        default:
                            if (n)
                                throw new TypeError("Unknown encoding: " + e);
                            e = (e + "").toLowerCase(),
                            n = !0
                        }
                }
                function m(e, t, r) {
                    var n = e[t];
                    e[t] = e[r],
                    e[r] = n
                }
                function v(e, t, r, n, i) {
                    if (0 === e.length)
                        return -1;
                    if ("string" == typeof r ? (n = r,
                    r = 0) : r > 2147483647 ? r = 2147483647 : r < -2147483648 && (r = -2147483648),
                    r = +r,
                    isNaN(r) && (r = i ? 0 : e.length - 1),
                    r < 0 && (r = e.length + r),
                    r >= e.length) {
                        if (i)
                            return -1;
                        r = e.length - 1
                    } else if (r < 0) {
                        if (!i)
                            return -1;
                        r = 0
                    }
                    if ("string" == typeof t && (t = u.from(t, n)),
                    u.isBuffer(t))
                        return 0 === t.length ? -1 : b(e, t, r, n, i);
                    if ("number" == typeof t)
                        return t &= 255,
                        u.TYPED_ARRAY_SUPPORT && "function" == typeof Uint8Array.prototype.indexOf ? i ? Uint8Array.prototype.indexOf.call(e, t, r) : Uint8Array.prototype.lastIndexOf.call(e, t, r) : b(e, [t], r, n, i);
                    throw new TypeError("val must be string, number or Buffer")
                }
                function b(e, t, r, n, i) {
                    var o, a = 1, s = e.length, u = t.length;
                    if (void 0 !== n && ("ucs2" === (n = String(n).toLowerCase()) || "ucs-2" === n || "utf16le" === n || "utf-16le" === n)) {
                        if (e.length < 2 || t.length < 2)
                            return -1;
                        a = 2,
                        s /= 2,
                        u /= 2,
                        r /= 2
                    }
                    function c(e, t) {
                        return 1 === a ? e[t] : e.readUInt16BE(t * a)
                    }
                    if (i) {
                        var d = -1;
                        for (o = r; o < s; o++)
                            if (c(e, o) === c(t, -1 === d ? 0 : o - d)) {
                                if (-1 === d && (d = o),
                                o - d + 1 === u)
                                    return d * a
                            } else
                                -1 !== d && (o -= o - d),
                                d = -1
                    } else
                        for (r + u > s && (r = s - u),
                        o = r; o >= 0; o--) {
                            for (var f = !0, l = 0; l < u; l++)
                                if (c(e, o + l) !== c(t, l)) {
                                    f = !1;
                                    break
                                }
                            if (f)
                                return o
                        }
                    return -1
                }
                function y(e, t, r, n) {
                    r = Number(r) || 0;
                    var i = e.length - r;
                    n ? (n = Number(n)) > i && (n = i) : n = i;
                    var o = t.length;
                    if (o % 2 != 0)
                        throw new TypeError("Invalid hex string");
                    n > o / 2 && (n = o / 2);
                    for (var a = 0; a < n; ++a) {
                        var s = parseInt(t.substr(2 * a, 2), 16);
                        if (isNaN(s))
                            return a;
                        e[r + a] = s
                    }
                    return a
                }
                function w(e, t, r, n) {
                    return W(z(t, e.length - r), e, r, n)
                }
                function R(e, t, r, n) {
                    return W(function(e) {
                        for (var t = [], r = 0; r < e.length; ++r)
                            t.push(255 & e.charCodeAt(r));
                        return t
                    }(t), e, r, n)
                }
                function S(e, t, r, n) {
                    return R(e, t, r, n)
                }
                function T(e, t, r, n) {
                    return W(N(t), e, r, n)
                }
                function _(e, t, r, n) {
                    return W(function(e, t) {
                        for (var r, n, i = [], o = 0; o < e.length && !((t -= 2) < 0); ++o)
                            n = (r = e.charCodeAt(o)) >> 8,
                            i.push(r % 256),
                            i.push(n);
                        return i
                    }(t, e.length - r), e, r, n)
                }
                function k(e, t, r) {
                    return n.fromByteArray(0 === t && r === e.length ? e : e.slice(t, r))
                }
                function C(e, t, r) {
                    r = Math.min(e.length, r);
                    for (var n = [], i = t; i < r; ) {
                        var o, a, s, u, c = e[i], d = null, f = c > 239 ? 4 : c > 223 ? 3 : c > 191 ? 2 : 1;
                        if (i + f <= r)
                            switch (f) {
                            case 1:
                                c < 128 && (d = c);
                                break;
                            case 2:
                                128 == (192 & (o = e[i + 1])) && (u = (31 & c) << 6 | 63 & o) > 127 && (d = u);
                                break;
                            case 3:
                                a = e[i + 2],
                                128 == (192 & (o = e[i + 1])) && 128 == (192 & a) && (u = (15 & c) << 12 | (63 & o) << 6 | 63 & a) > 2047 && (u < 55296 || u > 57343) && (d = u);
                                break;
                            case 4:
                                a = e[i + 2],
                                s = e[i + 3],
                                128 == (192 & (o = e[i + 1])) && 128 == (192 & a) && 128 == (192 & s) && (u = (15 & c) << 18 | (63 & o) << 12 | (63 & a) << 6 | 63 & s) > 65535 && u < 1114112 && (d = u)
                            }
                        null === d ? (d = 65533,
                        f = 1) : d > 65535 && (n.push((d -= 65536) >>> 10 & 1023 | 55296),
                        d = 56320 | 1023 & d),
                        n.push(d),
                        i += f
                    }
                    return function(e) {
                        var t = e.length;
                        if (t <= A)
                            return String.fromCharCode.apply(String, e);
                        for (var r = "", n = 0; n < t; )
                            r += String.fromCharCode.apply(String, e.slice(n, n += A));
                        return r
                    }(n)
                }
                r.Buffer = u,
                r.SlowBuffer = function(e) {
                    return +e != e && (e = 0),
                    u.alloc(+e)
                }
                ,
                r.INSPECT_MAX_BYTES = 50,
                u.TYPED_ARRAY_SUPPORT = void 0 !== t.TYPED_ARRAY_SUPPORT ? t.TYPED_ARRAY_SUPPORT : function() {
                    try {
                        var e = new Uint8Array(1);
                        return e.__proto__ = {
                            __proto__: Uint8Array.prototype,
                            foo: function() {
                                return 42
                            }
                        },
                        42 === e.foo() && "function" == typeof e.subarray && 0 === e.subarray(1, 1).byteLength
                    } catch (t) {
                        return !1
                    }
                }(),
                r.kMaxLength = a(),
                u.poolSize = 8192,
                u._augment = function(e) {
                    return e.__proto__ = u.prototype,
                    e
                }
                ,
                u.from = function(e, t, r) {
                    return c(null, e, t, r)
                }
                ,
                u.TYPED_ARRAY_SUPPORT && (u.prototype.__proto__ = Uint8Array.prototype,
                u.__proto__ = Uint8Array,
                "undefined" != typeof Symbol && Symbol.species && u[Symbol.species] === u && Object.defineProperty(u, Symbol.species, {
                    value: null,
                    configurable: !0
                })),
                u.alloc = function(e, t, r) {
                    return function(e, t, r, n) {
                        return d(t),
                        t <= 0 ? s(null, t) : void 0 !== r ? "string" == typeof n ? s(null, t).fill(r, n) : s(null, t).fill(r) : s(null, t)
                    }(0, e, t, r)
                }
                ,
                u.allocUnsafe = function(e) {
                    return f(null, e)
                }
                ,
                u.allocUnsafeSlow = function(e) {
                    return f(null, e)
                }
                ,
                u.isBuffer = function(e) {
                    return !(null == e || !e._isBuffer)
                }
                ,
                u.compare = function(e, t) {
                    if (!u.isBuffer(e) || !u.isBuffer(t))
                        throw new TypeError("Arguments must be Buffers");
                    if (e === t)
                        return 0;
                    for (var r = e.length, n = t.length, i = 0, o = Math.min(r, n); i < o; ++i)
                        if (e[i] !== t[i]) {
                            r = e[i],
                            n = t[i];
                            break
                        }
                    return r < n ? -1 : n < r ? 1 : 0
                }
                ,
                u.isEncoding = function(e) {
                    switch (String(e).toLowerCase()) {
                    case "hex":
                    case "utf8":
                    case "utf-8":
                    case "ascii":
                    case "latin1":
                    case "binary":
                    case "base64":
                    case "ucs2":
                    case "ucs-2":
                    case "utf16le":
                    case "utf-16le":
                        return !0;
                    default:
                        return !1
                    }
                }
                ,
                u.concat = function(e, t) {
                    if (!o(e))
                        throw new TypeError('"list" argument must be an Array of Buffers');
                    if (0 === e.length)
                        return u.alloc(0);
                    var r;
                    if (void 0 === t)
                        for (t = 0,
                        r = 0; r < e.length; ++r)
                            t += e[r].length;
                    var n = u.allocUnsafe(t)
                      , i = 0;
                    for (r = 0; r < e.length; ++r) {
                        var a = e[r];
                        if (!u.isBuffer(a))
                            throw new TypeError('"list" argument must be an Array of Buffers');
                        a.copy(n, i),
                        i += a.length
                    }
                    return n
                }
                ,
                u.byteLength = p,
                u.prototype._isBuffer = !0,
                u.prototype.swap16 = function() {
                    var e = this.length;
                    if (e % 2 != 0)
                        throw new RangeError("Buffer size must be a multiple of 16-bits");
                    for (var t = 0; t < e; t += 2)
                        m(this, t, t + 1);
                    return this
                }
                ,
                u.prototype.swap32 = function() {
                    var e = this.length;
                    if (e % 4 != 0)
                        throw new RangeError("Buffer size must be a multiple of 32-bits");
                    for (var t = 0; t < e; t += 4)
                        m(this, t, t + 3),
                        m(this, t + 1, t + 2);
                    return this
                }
                ,
                u.prototype.swap64 = function() {
                    var e = this.length;
                    if (e % 8 != 0)
                        throw new RangeError("Buffer size must be a multiple of 64-bits");
                    for (var t = 0; t < e; t += 8)
                        m(this, t, t + 7),
                        m(this, t + 1, t + 6),
                        m(this, t + 2, t + 5),
                        m(this, t + 3, t + 4);
                    return this
                }
                ,
                u.prototype.toString = function() {
                    var e = 0 | this.length;
                    return 0 === e ? "" : 0 === arguments.length ? C(this, 0, e) : g.apply(this, arguments)
                }
                ,
                u.prototype.equals = function(e) {
                    if (!u.isBuffer(e))
                        throw new TypeError("Argument must be a Buffer");
                    return this === e || 0 === u.compare(this, e)
                }
                ,
                u.prototype.inspect = function() {
                    var e = ""
                      , t = r.INSPECT_MAX_BYTES;
                    return this.length > 0 && (e = this.toString("hex", 0, t).match(/.{2}/g).join(" "),
                    this.length > t && (e += " ... ")),
                    "<Buffer " + e + ">"
                }
                ,
                u.prototype.compare = function(e, t, r, n, i) {
                    if (!u.isBuffer(e))
                        throw new TypeError("Argument must be a Buffer");
                    if (void 0 === t && (t = 0),
                    void 0 === r && (r = e ? e.length : 0),
                    void 0 === n && (n = 0),
                    void 0 === i && (i = this.length),
                    t < 0 || r > e.length || n < 0 || i > this.length)
                        throw new RangeError("out of range index");
                    if (n >= i && t >= r)
                        return 0;
                    if (n >= i)
                        return -1;
                    if (t >= r)
                        return 1;
                    if (this === e)
                        return 0;
                    for (var o = (i >>>= 0) - (n >>>= 0), a = (r >>>= 0) - (t >>>= 0), s = Math.min(o, a), c = this.slice(n, i), d = e.slice(t, r), f = 0; f < s; ++f)
                        if (c[f] !== d[f]) {
                            o = c[f],
                            a = d[f];
                            break
                        }
                    return o < a ? -1 : a < o ? 1 : 0
                }
                ,
                u.prototype.includes = function(e, t, r) {
                    return -1 !== this.indexOf(e, t, r)
                }
                ,
                u.prototype.indexOf = function(e, t, r) {
                    return v(this, e, t, r, !0)
                }
                ,
                u.prototype.lastIndexOf = function(e, t, r) {
                    return v(this, e, t, r, !1)
                }
                ,
                u.prototype.write = function(e, t, r, n) {
                    if (void 0 === t)
                        n = "utf8",
                        r = this.length,
                        t = 0;
                    else if (void 0 === r && "string" == typeof t)
                        n = t,
                        r = this.length,
                        t = 0;
                    else {
                        if (!isFinite(t))
                            throw new Error("Buffer.write(string, encoding, offset[, length]) is no longer supported");
                        t |= 0,
                        isFinite(r) ? (r |= 0,
                        void 0 === n && (n = "utf8")) : (n = r,
                        r = void 0)
                    }
                    var i = this.length - t;
                    if ((void 0 === r || r > i) && (r = i),
                    e.length > 0 && (r < 0 || t < 0) || t > this.length)
                        throw new RangeError("Attempt to write outside buffer bounds");
                    n || (n = "utf8");
                    for (var o = !1; ; )
                        switch (n) {
                        case "hex":
                            return y(this, e, t, r);
                        case "utf8":
                        case "utf-8":
                            return w(this, e, t, r);
                        case "ascii":
                            return R(this, e, t, r);
                        case "latin1":
                        case "binary":
                            return S(this, e, t, r);
                        case "base64":
                            return T(this, e, t, r);
                        case "ucs2":
                        case "ucs-2":
                        case "utf16le":
                        case "utf-16le":
                            return _(this, e, t, r);
                        default:
                            if (o)
                                throw new TypeError("Unknown encoding: " + n);
                            n = ("" + n).toLowerCase(),
                            o = !0
                        }
                }
                ,
                u.prototype.toJSON = function() {
                    return {
                        type: "Buffer",
                        data: Array.prototype.slice.call(this._arr || this, 0)
                    }
                }
                ;
                var A = 4096;
                function E(e, t, r) {
                    var n = "";
                    r = Math.min(e.length, r);
                    for (var i = t; i < r; ++i)
                        n += String.fromCharCode(127 & e[i]);
                    return n
                }
                function M(e, t, r) {
                    var n = "";
                    r = Math.min(e.length, r);
                    for (var i = t; i < r; ++i)
                        n += String.fromCharCode(e[i]);
                    return n
                }
                function L(e, t, r) {
                    var n, i = e.length;
                    (!t || t < 0) && (t = 0),
                    (!r || r < 0 || r > i) && (r = i);
                    for (var o = "", a = t; a < r; ++a)
                        o += (n = e[a]) < 16 ? "0" + n.toString(16) : n.toString(16);
                    return o
                }
                function x(e, t, r) {
                    for (var n = e.slice(t, r), i = "", o = 0; o < n.length; o += 2)
                        i += String.fromCharCode(n[o] + 256 * n[o + 1]);
                    return i
                }
                function B(e, t, r) {
                    if (e % 1 != 0 || e < 0)
                        throw new RangeError("offset is not uint");
                    if (e + t > r)
                        throw new RangeError("Trying to access beyond buffer length")
                }
                function U(e, t, r, n, i, o) {
                    if (!u.isBuffer(e))
                        throw new TypeError('"buffer" argument must be a Buffer instance');
                    if (t > i || t < o)
                        throw new RangeError('"value" argument is out of bounds');
                    if (r + n > e.length)
                        throw new RangeError("Index out of range")
                }
                function D(e, t, r, n) {
                    t < 0 && (t = 65535 + t + 1);
                    for (var i = 0, o = Math.min(e.length - r, 2); i < o; ++i)
                        e[r + i] = (t & 255 << 8 * (n ? i : 1 - i)) >>> 8 * (n ? i : 1 - i)
                }
                function O(e, t, r, n) {
                    t < 0 && (t = 4294967295 + t + 1);
                    for (var i = 0, o = Math.min(e.length - r, 4); i < o; ++i)
                        e[r + i] = t >>> 8 * (n ? i : 3 - i) & 255
                }
                function j(e, t, r, n, i, o) {
                    if (r + n > e.length)
                        throw new RangeError("Index out of range");
                    if (r < 0)
                        throw new RangeError("Index out of range")
                }
                function P(e, t, r, n, o) {
                    return o || j(e, 0, r, 4),
                    i.write(e, t, r, n, 23, 4),
                    r + 4
                }
                function I(e, t, r, n, o) {
                    return o || j(e, 0, r, 8),
                    i.write(e, t, r, n, 52, 8),
                    r + 8
                }
                u.prototype.slice = function(e, t) {
                    var r, n = this.length;
                    if ((e = ~~e) < 0 ? (e += n) < 0 && (e = 0) : e > n && (e = n),
                    (t = void 0 === t ? n : ~~t) < 0 ? (t += n) < 0 && (t = 0) : t > n && (t = n),
                    t < e && (t = e),
                    u.TYPED_ARRAY_SUPPORT)
                        (r = this.subarray(e, t)).__proto__ = u.prototype;
                    else {
                        var i = t - e;
                        r = new u(i,void 0);
                        for (var o = 0; o < i; ++o)
                            r[o] = this[o + e]
                    }
                    return r
                }
                ,
                u.prototype.readUIntLE = function(e, t, r) {
                    e |= 0,
                    t |= 0,
                    r || B(e, t, this.length);
                    for (var n = this[e], i = 1, o = 0; ++o < t && (i *= 256); )
                        n += this[e + o] * i;
                    return n
                }
                ,
                u.prototype.readUIntBE = function(e, t, r) {
                    e |= 0,
                    t |= 0,
                    r || B(e, t, this.length);
                    for (var n = this[e + --t], i = 1; t > 0 && (i *= 256); )
                        n += this[e + --t] * i;
                    return n
                }
                ,
                u.prototype.readUInt8 = function(e, t) {
                    return t || B(e, 1, this.length),
                    this[e]
                }
                ,
                u.prototype.readUInt16LE = function(e, t) {
                    return t || B(e, 2, this.length),
                    this[e] | this[e + 1] << 8
                }
                ,
                u.prototype.readUInt16BE = function(e, t) {
                    return t || B(e, 2, this.length),
                    this[e] << 8 | this[e + 1]
                }
                ,
                u.prototype.readUInt32LE = function(e, t) {
                    return t || B(e, 4, this.length),
                    (this[e] | this[e + 1] << 8 | this[e + 2] << 16) + 16777216 * this[e + 3]
                }
                ,
                u.prototype.readUInt32BE = function(e, t) {
                    return t || B(e, 4, this.length),
                    16777216 * this[e] + (this[e + 1] << 16 | this[e + 2] << 8 | this[e + 3])
                }
                ,
                u.prototype.readIntLE = function(e, t, r) {
                    e |= 0,
                    t |= 0,
                    r || B(e, t, this.length);
                    for (var n = this[e], i = 1, o = 0; ++o < t && (i *= 256); )
                        n += this[e + o] * i;
                    return n >= (i *= 128) && (n -= Math.pow(2, 8 * t)),
                    n
                }
                ,
                u.prototype.readIntBE = function(e, t, r) {
                    e |= 0,
                    t |= 0,
                    r || B(e, t, this.length);
                    for (var n = t, i = 1, o = this[e + --n]; n > 0 && (i *= 256); )
                        o += this[e + --n] * i;
                    return o >= (i *= 128) && (o -= Math.pow(2, 8 * t)),
                    o
                }
                ,
                u.prototype.readInt8 = function(e, t) {
                    return t || B(e, 1, this.length),
                    128 & this[e] ? -1 * (255 - this[e] + 1) : this[e]
                }
                ,
                u.prototype.readInt16LE = function(e, t) {
                    t || B(e, 2, this.length);
                    var r = this[e] | this[e + 1] << 8;
                    return 32768 & r ? 4294901760 | r : r
                }
                ,
                u.prototype.readInt16BE = function(e, t) {
                    t || B(e, 2, this.length);
                    var r = this[e + 1] | this[e] << 8;
                    return 32768 & r ? 4294901760 | r : r
                }
                ,
                u.prototype.readInt32LE = function(e, t) {
                    return t || B(e, 4, this.length),
                    this[e] | this[e + 1] << 8 | this[e + 2] << 16 | this[e + 3] << 24
                }
                ,
                u.prototype.readInt32BE = function(e, t) {
                    return t || B(e, 4, this.length),
                    this[e] << 24 | this[e + 1] << 16 | this[e + 2] << 8 | this[e + 3]
                }
                ,
                u.prototype.readFloatLE = function(e, t) {
                    return t || B(e, 4, this.length),
                    i.read(this, e, !0, 23, 4)
                }
                ,
                u.prototype.readFloatBE = function(e, t) {
                    return t || B(e, 4, this.length),
                    i.read(this, e, !1, 23, 4)
                }
                ,
                u.prototype.readDoubleLE = function(e, t) {
                    return t || B(e, 8, this.length),
                    i.read(this, e, !0, 52, 8)
                }
                ,
                u.prototype.readDoubleBE = function(e, t) {
                    return t || B(e, 8, this.length),
                    i.read(this, e, !1, 52, 8)
                }
                ,
                u.prototype.writeUIntLE = function(e, t, r, n) {
                    e = +e,
                    t |= 0,
                    r |= 0,
                    n || U(this, e, t, r, Math.pow(2, 8 * r) - 1, 0);
                    var i = 1
                      , o = 0;
                    for (this[t] = 255 & e; ++o < r && (i *= 256); )
                        this[t + o] = e / i & 255;
                    return t + r
                }
                ,
                u.prototype.writeUIntBE = function(e, t, r, n) {
                    e = +e,
                    t |= 0,
                    r |= 0,
                    n || U(this, e, t, r, Math.pow(2, 8 * r) - 1, 0);
                    var i = r - 1
                      , o = 1;
                    for (this[t + i] = 255 & e; --i >= 0 && (o *= 256); )
                        this[t + i] = e / o & 255;
                    return t + r
                }
                ,
                u.prototype.writeUInt8 = function(e, t, r) {
                    return e = +e,
                    t |= 0,
                    r || U(this, e, t, 1, 255, 0),
                    u.TYPED_ARRAY_SUPPORT || (e = Math.floor(e)),
                    this[t] = 255 & e,
                    t + 1
                }
                ,
                u.prototype.writeUInt16LE = function(e, t, r) {
                    return e = +e,
                    t |= 0,
                    r || U(this, e, t, 2, 65535, 0),
                    u.TYPED_ARRAY_SUPPORT ? (this[t] = 255 & e,
                    this[t + 1] = e >>> 8) : D(this, e, t, !0),
                    t + 2
                }
                ,
                u.prototype.writeUInt16BE = function(e, t, r) {
                    return e = +e,
                    t |= 0,
                    r || U(this, e, t, 2, 65535, 0),
                    u.TYPED_ARRAY_SUPPORT ? (this[t] = e >>> 8,
                    this[t + 1] = 255 & e) : D(this, e, t, !1),
                    t + 2
                }
                ,
                u.prototype.writeUInt32LE = function(e, t, r) {
                    return e = +e,
                    t |= 0,
                    r || U(this, e, t, 4, 4294967295, 0),
                    u.TYPED_ARRAY_SUPPORT ? (this[t + 3] = e >>> 24,
                    this[t + 2] = e >>> 16,
                    this[t + 1] = e >>> 8,
                    this[t] = 255 & e) : O(this, e, t, !0),
                    t + 4
                }
                ,
                u.prototype.writeUInt32BE = function(e, t, r) {
                    return e = +e,
                    t |= 0,
                    r || U(this, e, t, 4, 4294967295, 0),
                    u.TYPED_ARRAY_SUPPORT ? (this[t] = e >>> 24,
                    this[t + 1] = e >>> 16,
                    this[t + 2] = e >>> 8,
                    this[t + 3] = 255 & e) : O(this, e, t, !1),
                    t + 4
                }
                ,
                u.prototype.writeIntLE = function(e, t, r, n) {
                    if (e = +e,
                    t |= 0,
                    !n) {
                        var i = Math.pow(2, 8 * r - 1);
                        U(this, e, t, r, i - 1, -i)
                    }
                    var o = 0
                      , a = 1
                      , s = 0;
                    for (this[t] = 255 & e; ++o < r && (a *= 256); )
                        e < 0 && 0 === s && 0 !== this[t + o - 1] && (s = 1),
                        this[t + o] = (e / a >> 0) - s & 255;
                    return t + r
                }
                ,
                u.prototype.writeIntBE = function(e, t, r, n) {
                    if (e = +e,
                    t |= 0,
                    !n) {
                        var i = Math.pow(2, 8 * r - 1);
                        U(this, e, t, r, i - 1, -i)
                    }
                    var o = r - 1
                      , a = 1
                      , s = 0;
                    for (this[t + o] = 255 & e; --o >= 0 && (a *= 256); )
                        e < 0 && 0 === s && 0 !== this[t + o + 1] && (s = 1),
                        this[t + o] = (e / a >> 0) - s & 255;
                    return t + r
                }
                ,
                u.prototype.writeInt8 = function(e, t, r) {
                    return e = +e,
                    t |= 0,
                    r || U(this, e, t, 1, 127, -128),
                    u.TYPED_ARRAY_SUPPORT || (e = Math.floor(e)),
                    e < 0 && (e = 255 + e + 1),
                    this[t] = 255 & e,
                    t + 1
                }
                ,
                u.prototype.writeInt16LE = function(e, t, r) {
                    return e = +e,
                    t |= 0,
                    r || U(this, e, t, 2, 32767, -32768),
                    u.TYPED_ARRAY_SUPPORT ? (this[t] = 255 & e,
                    this[t + 1] = e >>> 8) : D(this, e, t, !0),
                    t + 2
                }
                ,
                u.prototype.writeInt16BE = function(e, t, r) {
                    return e = +e,
                    t |= 0,
                    r || U(this, e, t, 2, 32767, -32768),
                    u.TYPED_ARRAY_SUPPORT ? (this[t] = e >>> 8,
                    this[t + 1] = 255 & e) : D(this, e, t, !1),
                    t + 2
                }
                ,
                u.prototype.writeInt32LE = function(e, t, r) {
                    return e = +e,
                    t |= 0,
                    r || U(this, e, t, 4, 2147483647, -2147483648),
                    u.TYPED_ARRAY_SUPPORT ? (this[t] = 255 & e,
                    this[t + 1] = e >>> 8,
                    this[t + 2] = e >>> 16,
                    this[t + 3] = e >>> 24) : O(this, e, t, !0),
                    t + 4
                }
                ,
                u.prototype.writeInt32BE = function(e, t, r) {
                    return e = +e,
                    t |= 0,
                    r || U(this, e, t, 4, 2147483647, -2147483648),
                    e < 0 && (e = 4294967295 + e + 1),
                    u.TYPED_ARRAY_SUPPORT ? (this[t] = e >>> 24,
                    this[t + 1] = e >>> 16,
                    this[t + 2] = e >>> 8,
                    this[t + 3] = 255 & e) : O(this, e, t, !1),
                    t + 4
                }
                ,
                u.prototype.writeFloatLE = function(e, t, r) {
                    return P(this, e, t, !0, r)
                }
                ,
                u.prototype.writeFloatBE = function(e, t, r) {
                    return P(this, e, t, !1, r)
                }
                ,
                u.prototype.writeDoubleLE = function(e, t, r) {
                    return I(this, e, t, !0, r)
                }
                ,
                u.prototype.writeDoubleBE = function(e, t, r) {
                    return I(this, e, t, !1, r)
                }
                ,
                u.prototype.copy = function(e, t, r, n) {
                    if (r || (r = 0),
                    n || 0 === n || (n = this.length),
                    t >= e.length && (t = e.length),
                    t || (t = 0),
                    n > 0 && n < r && (n = r),
                    n === r)
                        return 0;
                    if (0 === e.length || 0 === this.length)
                        return 0;
                    if (t < 0)
                        throw new RangeError("targetStart out of bounds");
                    if (r < 0 || r >= this.length)
                        throw new RangeError("sourceStart out of bounds");
                    if (n < 0)
                        throw new RangeError("sourceEnd out of bounds");
                    n > this.length && (n = this.length),
                    e.length - t < n - r && (n = e.length - t + r);
                    var i, o = n - r;
                    if (this === e && r < t && t < n)
                        for (i = o - 1; i >= 0; --i)
                            e[i + t] = this[i + r];
                    else if (o < 1e3 || !u.TYPED_ARRAY_SUPPORT)
                        for (i = 0; i < o; ++i)
                            e[i + t] = this[i + r];
                    else
                        Uint8Array.prototype.set.call(e, this.subarray(r, r + o), t);
                    return o
                }
                ,
                u.prototype.fill = function(e, t, r, n) {
                    if ("string" == typeof e) {
                        if ("string" == typeof t ? (n = t,
                        t = 0,
                        r = this.length) : "string" == typeof r && (n = r,
                        r = this.length),
                        1 === e.length) {
                            var i = e.charCodeAt(0);
                            i < 256 && (e = i)
                        }
                        if (void 0 !== n && "string" != typeof n)
                            throw new TypeError("encoding must be a string");
                        if ("string" == typeof n && !u.isEncoding(n))
                            throw new TypeError("Unknown encoding: " + n)
                    } else
                        "number" == typeof e && (e &= 255);
                    if (t < 0 || this.length < t || this.length < r)
                        throw new RangeError("Out of range index");
                    if (r <= t)
                        return this;
                    var o;
                    if (t >>>= 0,
                    r = void 0 === r ? this.length : r >>> 0,
                    e || (e = 0),
                    "number" == typeof e)
                        for (o = t; o < r; ++o)
                            this[o] = e;
                    else {
                        var a = u.isBuffer(e) ? e : z(new u(e,n).toString())
                          , s = a.length;
                        for (o = 0; o < r - t; ++o)
                            this[o + t] = a[o % s]
                    }
                    return this
                }
                ;
                var F = /[^+\/0-9A-Za-z-_]/g;
                function z(e, t) {
                    var r;
                    t = t || 1 / 0;
                    for (var n = e.length, i = null, o = [], a = 0; a < n; ++a) {
                        if ((r = e.charCodeAt(a)) > 55295 && r < 57344) {
                            if (!i) {
                                if (r > 56319) {
                                    (t -= 3) > -1 && o.push(239, 191, 189);
                                    continue
                                }
                                if (a + 1 === n) {
                                    (t -= 3) > -1 && o.push(239, 191, 189);
                                    continue
                                }
                                i = r;
                                continue
                            }
                            if (r < 56320) {
                                (t -= 3) > -1 && o.push(239, 191, 189),
                                i = r;
                                continue
                            }
                            r = 65536 + (i - 55296 << 10 | r - 56320)
                        } else
                            i && (t -= 3) > -1 && o.push(239, 191, 189);
                        if (i = null,
                        r < 128) {
                            if ((t -= 1) < 0)
                                break;
                            o.push(r)
                        } else if (r < 2048) {
                            if ((t -= 2) < 0)
                                break;
                            o.push(r >> 6 | 192, 63 & r | 128)
                        } else if (r < 65536) {
                            if ((t -= 3) < 0)
                                break;
                            o.push(r >> 12 | 224, r >> 6 & 63 | 128, 63 & r | 128)
                        } else {
                            if (!(r < 1114112))
                                throw new Error("Invalid code point");
                            if ((t -= 4) < 0)
                                break;
                            o.push(r >> 18 | 240, r >> 12 & 63 | 128, r >> 6 & 63 | 128, 63 & r | 128)
                        }
                    }
                    return o
                }
                function N(e) {
                    return n.toByteArray(function(e) {
                        if ((e = function(e) {
                            return e.trim ? e.trim() : e.replace(/^\s+|\s+$/g, "")
                        }(e).replace(F, "")).length < 2)
                            return "";
                        for (; e.length % 4 != 0; )
                            e += "=";
                        return e
                    }(e))
                }
                function W(e, t, r, n) {
                    for (var i = 0; i < n && !(i + r >= t.length || i >= e.length); ++i)
                        t[i + r] = e[i];
                    return i
                }
            }
            ).call(this, "undefined" != typeof global ? global : "undefined" != typeof self ? self : "undefined" != typeof window ? window : {})
        }
        , {
            "base64-js": 8,
            ieee754: 17,
            isarray: 20
        }],
        12: [function(e, t, r) {
            var n = [].slice;
            t.exports = function(e, t) {
                if ("string" == typeof t && (t = e[t]),
                "function" != typeof t)
                    throw new Error("bind() requires a function");
                var r = n.call(arguments, 2);
                return function() {
                    return t.apply(e, r.concat(n.call(arguments)))
                }
            }
        }
        , {}],
        13: [function(e, t, r) {
            (function(e) {
                function t(e) {
                    return Object.prototype.toString.call(e)
                }
                r.isArray = function(e) {
                    return Array.isArray ? Array.isArray(e) : "[object Array]" === t(e)
                }
                ,
                r.isBoolean = function(e) {
                    return "boolean" == typeof e
                }
                ,
                r.isNull = function(e) {
                    return null === e
                }
                ,
                r.isNullOrUndefined = function(e) {
                    return null == e
                }
                ,
                r.isNumber = function(e) {
                    return "number" == typeof e
                }
                ,
                r.isString = function(e) {
                    return "string" == typeof e
                }
                ,
                r.isSymbol = function(e) {
                    return "symbol" == typeof e
                }
                ,
                r.isUndefined = function(e) {
                    return void 0 === e
                }
                ,
                r.isRegExp = function(e) {
                    return "[object RegExp]" === t(e)
                }
                ,
                r.isObject = function(e) {
                    return "object" == typeof e && null !== e
                }
                ,
                r.isDate = function(e) {
                    return "[object Date]" === t(e)
                }
                ,
                r.isError = function(e) {
                    return "[object Error]" === t(e) || e instanceof Error
                }
                ,
                r.isFunction = function(e) {
                    return "function" == typeof e
                }
                ,
                r.isPrimitive = function(e) {
                    return null === e || "boolean" == typeof e || "number" == typeof e || "string" == typeof e || "symbol" == typeof e || void 0 === e
                }
                ,
                r.isBuffer = e.isBuffer
            }
            ).call(this, {
                isBuffer: e("../../is-buffer/index.js")
            })
        }
        , {
            "../../is-buffer/index.js": 19
        }],
        14: [function(e, t, r) {
            function n() {
                var e;
                try {
                    e = r.storage.debug
                } catch (t) {}
                return e
            }
            (r = t.exports = e("./debug")).log = function() {
                return "object" == typeof console && console.log && Function.prototype.apply.call(console.log, console, arguments)
            }
            ,
            r.formatArgs = function() {
                var e = arguments
                  , t = this.useColors;
                if (e[0] = (t ? "%c" : "") + this.namespace + (t ? " %c" : " ") + e[0] + (t ? "%c " : " ") + "+" + r.humanize(this.diff),
                !t)
                    return e;
                var n = "color: " + this.color;
                e = [e[0], n, "color: inherit"].concat(Array.prototype.slice.call(e, 1));
                var i = 0
                  , o = 0;
                return e[0].replace(/%[a-z%]/g, (function(e) {
                    "%%" !== e && (i++,
                    "%c" === e && (o = i))
                }
                )),
                e.splice(o, 0, n),
                e
            }
            ,
            r.save = function(e) {
                try {
                    null == e ? r.storage.removeItem("debug") : r.storage.debug = e
                } catch (t) {}
            }
            ,
            r.load = n,
            r.useColors = function() {
                return "WebkitAppearance"in document.documentElement.style || window.console && (console.firebug || console.exception && console.table) || navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31
            }
            ,
            r.storage = "undefined" != typeof chrome && void 0 !== chrome.storage ? chrome.storage.local : function() {
                try {
                    return window.localStorage
                } catch (e) {}
            }(),
            r.colors = ["lightseagreen", "forestgreen", "goldenrod", "dodgerblue", "darkorchid", "crimson"],
            r.formatters.j = function(e) {
                return JSON.stringify(e)
            }
            ,
            r.enable(n())
        }
        , {
            "./debug": 15
        }],
        15: [function(e, t, r) {
            (r = t.exports = function(e) {
                function t() {}
                function o() {
                    var e = o
                      , t = +new Date;
                    e.diff = t - (n || t),
                    e.prev = n,
                    e.curr = t,
                    n = t,
                    null == e.useColors && (e.useColors = r.useColors()),
                    null == e.color && e.useColors && (e.color = r.colors[i++ % r.colors.length]);
                    var a = Array.prototype.slice.call(arguments);
                    a[0] = r.coerce(a[0]),
                    "string" != typeof a[0] && (a = ["%o"].concat(a));
                    var s = 0;
                    a[0] = a[0].replace(/%([a-z%])/g, (function(t, n) {
                        if ("%%" === t)
                            return t;
                        s++;
                        var i = r.formatters[n];
                        return "function" == typeof i && (t = i.call(e, a[s]),
                        a.splice(s, 1),
                        s--),
                        t
                    }
                    )),
                    "function" == typeof r.formatArgs && (a = r.formatArgs.apply(e, a)),
                    (o.log || r.log || console.log.bind(console)).apply(e, a)
                }
                t.enabled = !1,
                o.enabled = !0;
                var a = r.enabled(e) ? o : t;
                return a.namespace = e,
                a
            }
            ).coerce = function(e) {
                return e instanceof Error ? e.stack || e.message : e
            }
            ,
            r.disable = function() {
                r.enable("")
            }
            ,
            r.enable = function(e) {
                r.save(e);
                for (var t = (e || "").split(/[\s,]+/), n = t.length, i = 0; i < n; i++)
                    t[i] && ("-" === (e = t[i].replace(/\*/g, ".*?"))[0] ? r.skips.push(new RegExp("^" + e.substr(1) + "$")) : r.names.push(new RegExp("^" + e + "$")))
            }
            ,
            r.enabled = function(e) {
                var t, n;
                for (t = 0,
                n = r.skips.length; t < n; t++)
                    if (r.skips[t].test(e))
                        return !1;
                for (t = 0,
                n = r.names.length; t < n; t++)
                    if (r.names[t].test(e))
                        return !0;
                return !1
            }
            ,
            r.humanize = e("ms"),
            r.names = [],
            r.skips = [],
            r.formatters = {};
            var n, i = 0
        }
        , {
            ms: 21
        }],
        16: [function(e, t, r) {
            function n() {
                this._events = this._events || {},
                this._maxListeners = this._maxListeners || void 0
            }
            function i(e) {
                return "function" == typeof e
            }
            function o(e) {
                return "object" == typeof e && null !== e
            }
            function a(e) {
                return void 0 === e
            }
            t.exports = n,
            n.EventEmitter = n,
            n.prototype._events = void 0,
            n.prototype._maxListeners = void 0,
            n.defaultMaxListeners = 10,
            n.prototype.setMaxListeners = function(e) {
                if ("number" != typeof e || e < 0 || isNaN(e))
                    throw TypeError("n must be a positive number");
                return this._maxListeners = e,
                this
            }
            ,
            n.prototype.emit = function(e) {
                var t, r, n, s, u, c;
                if (this._events || (this._events = {}),
                "error" === e && (!this._events.error || o(this._events.error) && !this._events.error.length)) {
                    if ((t = arguments[1])instanceof Error)
                        throw t;
                    var d = new Error('Uncaught, unspecified "error" event. (' + t + ")");
                    throw d.context = t,
                    d
                }
                if (a(r = this._events[e]))
                    return !1;
                if (i(r))
                    switch (arguments.length) {
                    case 1:
                        r.call(this);
                        break;
                    case 2:
                        r.call(this, arguments[1]);
                        break;
                    case 3:
                        r.call(this, arguments[1], arguments[2]);
                        break;
                    default:
                        s = Array.prototype.slice.call(arguments, 1),
                        r.apply(this, s)
                    }
                else if (o(r))
                    for (s = Array.prototype.slice.call(arguments, 1),
                    n = (c = r.slice()).length,
                    u = 0; u < n; u++)
                        c[u].apply(this, s);
                return !0
            }
            ,
            n.prototype.on = n.prototype.addListener = function(e, t) {
                var r;
                if (!i(t))
                    throw TypeError("listener must be a function");
                return this._events || (this._events = {}),
                this._events.newListener && this.emit("newListener", e, i(t.listener) ? t.listener : t),
                this._events[e] ? o(this._events[e]) ? this._events[e].push(t) : this._events[e] = [this._events[e], t] : this._events[e] = t,
                o(this._events[e]) && !this._events[e].warned && (r = a(this._maxListeners) ? n.defaultMaxListeners : this._maxListeners) && r > 0 && this._events[e].length > r && (this._events[e].warned = !0,
                console.error("(node) warning: possible EventEmitter memory leak detected. %d listeners added. Use emitter.setMaxListeners() to increase limit.", this._events[e].length),
                "function" == typeof console.trace && console.trace()),
                this
            }
            ,
            n.prototype.once = function(e, t) {
                if (!i(t))
                    throw TypeError("listener must be a function");
                var r = !1;
                function n() {
                    this.removeListener(e, n),
                    r || (r = !0,
                    t.apply(this, arguments))
                }
                return n.listener = t,
                this.on(e, n),
                this
            }
            ,
            n.prototype.removeListener = function(e, t) {
                var r, n, a, s;
                if (!i(t))
                    throw TypeError("listener must be a function");
                if (!this._events || !this._events[e])
                    return this;
                if (a = (r = this._events[e]).length,
                n = -1,
                r === t || i(r.listener) && r.listener === t)
                    delete this._events[e],
                    this._events.removeListener && this.emit("removeListener", e, t);
                else if (o(r)) {
                    for (s = a; s-- > 0; )
                        if (r[s] === t || r[s].listener && r[s].listener === t) {
                            n = s;
                            break
                        }
                    if (n < 0)
                        return this;
                    1 === r.length ? (r.length = 0,
                    delete this._events[e]) : r.splice(n, 1),
                    this._events.removeListener && this.emit("removeListener", e, t)
                }
                return this
            }
            ,
            n.prototype.removeAllListeners = function(e) {
                var t, r;
                if (!this._events)
                    return this;
                if (!this._events.removeListener)
                    return 0 === arguments.length ? this._events = {} : this._events[e] && delete this._events[e],
                    this;
                if (0 === arguments.length) {
                    for (t in this._events)
                        "removeListener" !== t && this.removeAllListeners(t);
                    return this.removeAllListeners("removeListener"),
                    this._events = {},
                    this
                }
                if (i(r = this._events[e]))
                    this.removeListener(e, r);
                else if (r)
                    for (; r.length; )
                        this.removeListener(e, r[r.length - 1]);
                return delete this._events[e],
                this
            }
            ,
            n.prototype.listeners = function(e) {
                return this._events && this._events[e] ? i(this._events[e]) ? [this._events[e]] : this._events[e].slice() : []
            }
            ,
            n.prototype.listenerCount = function(e) {
                if (this._events) {
                    var t = this._events[e];
                    if (i(t))
                        return 1;
                    if (t)
                        return t.length
                }
                return 0
            }
            ,
            n.listenerCount = function(e, t) {
                return e.listenerCount(t)
            }
        }
        , {}],
        17: [function(e, t, r) {
            r.read = function(e, t, r, n, i) {
                var o, a, s = 8 * i - n - 1, u = (1 << s) - 1, c = u >> 1, d = -7, f = r ? i - 1 : 0, l = r ? -1 : 1, h = e[t + f];
                for (f += l,
                o = h & (1 << -d) - 1,
                h >>= -d,
                d += s; d > 0; o = 256 * o + e[t + f],
                f += l,
                d -= 8)
                    ;
                for (a = o & (1 << -d) - 1,
                o >>= -d,
                d += n; d > 0; a = 256 * a + e[t + f],
                f += l,
                d -= 8)
                    ;
                if (0 === o)
                    o = 1 - c;
                else {
                    if (o === u)
                        return a ? NaN : 1 / 0 * (h ? -1 : 1);
                    a += Math.pow(2, n),
                    o -= c
                }
                return (h ? -1 : 1) * a * Math.pow(2, o - n)
            }
            ,
            r.write = function(e, t, r, n, i, o) {
                var a, s, u, c = 8 * o - i - 1, d = (1 << c) - 1, f = d >> 1, l = 23 === i ? Math.pow(2, -24) - Math.pow(2, -77) : 0, h = n ? 0 : o - 1, p = n ? 1 : -1, g = t < 0 || 0 === t && 1 / t < 0 ? 1 : 0;
                for (t = Math.abs(t),
                isNaN(t) || t === 1 / 0 ? (s = isNaN(t) ? 1 : 0,
                a = d) : (a = Math.floor(Math.log(t) / Math.LN2),
                t * (u = Math.pow(2, -a)) < 1 && (a--,
                u *= 2),
                (t += a + f >= 1 ? l / u : l * Math.pow(2, 1 - f)) * u >= 2 && (a++,
                u /= 2),
                a + f >= d ? (s = 0,
                a = d) : a + f >= 1 ? (s = (t * u - 1) * Math.pow(2, i),
                a += f) : (s = t * Math.pow(2, f - 1) * Math.pow(2, i),
                a = 0)); i >= 8; e[r + h] = 255 & s,
                h += p,
                s /= 256,
                i -= 8)
                    ;
                for (a = a << i | s,
                c += i; c > 0; e[r + h] = 255 & a,
                h += p,
                a /= 256,
                c -= 8)
                    ;
                e[r + h - p] |= 128 * g
            }
        }
        , {}],
        18: [function(e, t, r) {
            t.exports = "function" == typeof Object.create ? function(e, t) {
                e.super_ = t,
                e.prototype = Object.create(t.prototype, {
                    constructor: {
                        value: e,
                        enumerable: !1,
                        writable: !0,
                        configurable: !0
                    }
                })
            }
            : function(e, t) {
                e.super_ = t;
                var r = function() {};
                r.prototype = t.prototype,
                e.prototype = new r,
                e.prototype.constructor = e
            }
        }
        , {}],
        19: [function(e, t, r) {
            function n(e) {
                return !!e.constructor && "function" == typeof e.constructor.isBuffer && e.constructor.isBuffer(e)
            }
            t.exports = function(e) {
                return null != e && (n(e) || function(e) {
                    return "function" == typeof e.readFloatLE && "function" == typeof e.slice && n(e.slice(0, 0))
                }(e) || !!e._isBuffer)
            }
        }
        , {}],
        20: [function(e, t, r) {
            var n = {}.toString;
            t.exports = Array.isArray || function(e) {
                return "[object Array]" == n.call(e)
            }
        }
        , {}],
        21: [function(e, t, r) {
            var n = 1e3
              , i = 6e4
              , o = 36e5
              , a = 24 * o;
            function s(e, t, r) {
                if (!(e < t))
                    return e < 1.5 * t ? Math.floor(e / t) + " " + r : Math.ceil(e / t) + " " + r + "s"
            }
            t.exports = function(e, t) {
                return t = t || {},
                "string" == typeof e ? function(e) {
                    if (!((e = "" + e).length > 1e4)) {
                        var t = /^((?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|years?|yrs?|y)?$/i.exec(e);
                        if (t) {
                            var r = parseFloat(t[1]);
                            switch ((t[2] || "ms").toLowerCase()) {
                            case "years":
                            case "year":
                            case "yrs":
                            case "yr":
                            case "y":
                                return 315576e5 * r;
                            case "days":
                            case "day":
                            case "d":
                                return r * a;
                            case "hours":
                            case "hour":
                            case "hrs":
                            case "hr":
                            case "h":
                                return r * o;
                            case "minutes":
                            case "minute":
                            case "mins":
                            case "min":
                            case "m":
                                return r * i;
                            case "seconds":
                            case "second":
                            case "secs":
                            case "sec":
                            case "s":
                                return r * n;
                            case "milliseconds":
                            case "millisecond":
                            case "msecs":
                            case "msec":
                            case "ms":
                                return r
                            }
                        }
                    }
                }(e) : t.long ? s(r = e, a, "day") || s(r, o, "hour") || s(r, i, "minute") || s(r, n, "second") || r + " ms" : function(e) {
                    return e >= a ? Math.round(e / a) + "d" : e >= o ? Math.round(e / o) + "h" : e >= i ? Math.round(e / i) + "m" : e >= n ? Math.round(e / n) + "s" : e + "ms"
                }(e);
                var r
            }
        }
        , {}],
        22: [function(e, t, r) {
            (function(e) {
                t.exports = !e.version || 0 === e.version.indexOf("v0.") || 0 === e.version.indexOf("v1.") && 0 !== e.version.indexOf("v1.8.") ? function(t, r, n, i) {
                    if ("function" != typeof t)
                        throw new TypeError('"callback" argument must be a function');
                    var o, a, s = arguments.length;
                    switch (s) {
                    case 0:
                    case 1:
                        return e.nextTick(t);
                    case 2:
                        return e.nextTick((function() {
                            t.call(null, r)
                        }
                        ));
                    case 3:
                        return e.nextTick((function() {
                            t.call(null, r, n)
                        }
                        ));
                    case 4:
                        return e.nextTick((function() {
                            t.call(null, r, n, i)
                        }
                        ));
                    default:
                        for (o = new Array(s - 1),
                        a = 0; a < o.length; )
                            o[a++] = arguments[a];
                        return e.nextTick((function() {
                            t.apply(null, o)
                        }
                        ))
                    }
                }
                : e.nextTick
            }
            ).call(this, e("_process"))
        }
        , {
            _process: 23
        }],
        23: [function(e, t, r) {
            var n, i, o = t.exports = {};
            function a() {
                throw new Error("setTimeout has not been defined")
            }
            function s() {
                throw new Error("clearTimeout has not been defined")
            }
            function u(e) {
                if (n === setTimeout)
                    return setTimeout(e, 0);
                if ((n === a || !n) && setTimeout)
                    return n = setTimeout,
                    setTimeout(e, 0);
                try {
                    return n(e, 0)
                } catch (t) {
                    try {
                        return n.call(null, e, 0)
                    } catch (t) {
                        return n.call(this, e, 0)
                    }
                }
            }
            !function() {
                try {
                    n = "function" == typeof setTimeout ? setTimeout : a
                } catch (e) {
                    n = a
                }
                try {
                    i = "function" == typeof clearTimeout ? clearTimeout : s
                } catch (e) {
                    i = s
                }
            }();
            var c, d = [], f = !1, l = -1;
            function h() {
                f && c && (f = !1,
                c.length ? d = c.concat(d) : l = -1,
                d.length && p())
            }
            function p() {
                if (!f) {
                    var e = u(h);
                    f = !0;
                    for (var t = d.length; t; ) {
                        for (c = d,
                        d = []; ++l < t; )
                            c && c[l].run();
                        l = -1,
                        t = d.length
                    }
                    c = null,
                    f = !1,
                    function(e) {
                        if (i === clearTimeout)
                            return clearTimeout(e);
                        if ((i === s || !i) && clearTimeout)
                            return i = clearTimeout,
                            clearTimeout(e);
                        try {
                            i(e)
                        } catch (t) {
                            try {
                                return i.call(null, e)
                            } catch (t) {
                                return i.call(this, e)
                            }
                        }
                    }(e)
                }
            }
            function g(e, t) {
                this.fun = e,
                this.array = t
            }
            function m() {}
            o.nextTick = function(e) {
                var t = new Array(arguments.length - 1);
                if (arguments.length > 1)
                    for (var r = 1; r < arguments.length; r++)
                        t[r - 1] = arguments[r];
                d.push(new g(e,t)),
                1 !== d.length || f || u(p)
            }
            ,
            g.prototype.run = function() {
                this.fun.apply(null, this.array)
            }
            ,
            o.title = "browser",
            o.browser = !0,
            o.env = {},
            o.argv = [],
            o.version = "",
            o.versions = {},
            o.on = m,
            o.addListener = m,
            o.once = m,
            o.off = m,
            o.removeListener = m,
            o.removeAllListeners = m,
            o.emit = m,
            o.binding = function(e) {
                throw new Error("process.binding is not supported")
            }
            ,
            o.cwd = function() {
                return "/"
            }
            ,
            o.chdir = function(e) {
                throw new Error("process.chdir is not supported")
            }
            ,
            o.umask = function() {
                return 0
            }
        }
        , {}],
        24: [function(e, t, r) {
            t.exports = e("./lib/_stream_duplex.js")
        }
        , {
            "./lib/_stream_duplex.js": 25
        }],
        25: [function(e, t, r) {
            var n = Object.keys || function(e) {
                var t = [];
                for (var r in e)
                    t.push(r);
                return t
            }
            ;
            t.exports = f;
            var i = e("process-nextick-args")
              , o = e("core-util-is");
            o.inherits = e("inherits");
            var a = e("./_stream_readable")
              , s = e("./_stream_writable");
            o.inherits(f, a);
            for (var u = n(s.prototype), c = 0; c < u.length; c++) {
                var d = u[c];
                f.prototype[d] || (f.prototype[d] = s.prototype[d])
            }
            function f(e) {
                if (!(this instanceof f))
                    return new f(e);
                a.call(this, e),
                s.call(this, e),
                e && !1 === e.readable && (this.readable = !1),
                e && !1 === e.writable && (this.writable = !1),
                this.allowHalfOpen = !0,
                e && !1 === e.allowHalfOpen && (this.allowHalfOpen = !1),
                this.once("end", l)
            }
            function l() {
                this.allowHalfOpen || this._writableState.ended || i(h, this)
            }
            function h(e) {
                e.end()
            }
        }
        , {
            "./_stream_readable": 27,
            "./_stream_writable": 29,
            "core-util-is": 13,
            inherits: 18,
            "process-nextick-args": 22
        }],
        26: [function(e, t, r) {
            t.exports = o;
            var n = e("./_stream_transform")
              , i = e("core-util-is");
            function o(e) {
                if (!(this instanceof o))
                    return new o(e);
                n.call(this, e)
            }
            i.inherits = e("inherits"),
            i.inherits(o, n),
            o.prototype._transform = function(e, t, r) {
                r(null, e)
            }
        }
        , {
            "./_stream_transform": 28,
            "core-util-is": 13,
            inherits: 18
        }],
        27: [function(e, t, r) {
            (function(r) {
                t.exports = m;
                var n = e("process-nextick-args")
                  , i = e("isarray");
                m.ReadableState = g,
                e("events");
                var o, a = function(e, t) {
                    return e.listeners(t).length
                };
                !function() {
                    try {
                        o = e("stream")
                    } catch (t) {} finally {
                        o || (o = e("events").EventEmitter)
                    }
                }();
                var s = e("buffer").Buffer
                  , u = e("buffer-shims")
                  , c = e("core-util-is");
                c.inherits = e("inherits");
                var d = e("util")
                  , f = void 0;
                f = d && d.debuglog ? d.debuglog("stream") : function() {}
                ;
                var l, h, p = e("./internal/streams/BufferList");
                function g(t, r) {
                    h = h || e("./_stream_duplex"),
                    this.objectMode = !!(t = t || {}).objectMode,
                    r instanceof h && (this.objectMode = this.objectMode || !!t.readableObjectMode);
                    var n = t.highWaterMark;
                    this.highWaterMark = n || 0 === n ? n : this.objectMode ? 16 : 16384,
                    this.highWaterMark = ~~this.highWaterMark,
                    this.buffer = new p,
                    this.length = 0,
                    this.pipes = null,
                    this.pipesCount = 0,
                    this.flowing = null,
                    this.ended = !1,
                    this.endEmitted = !1,
                    this.reading = !1,
                    this.sync = !0,
                    this.needReadable = !1,
                    this.emittedReadable = !1,
                    this.readableListening = !1,
                    this.resumeScheduled = !1,
                    this.defaultEncoding = t.defaultEncoding || "utf8",
                    this.ranOut = !1,
                    this.awaitDrain = 0,
                    this.readingMore = !1,
                    this.decoder = null,
                    this.encoding = null,
                    t.encoding && (l || (l = e("string_decoder/").StringDecoder),
                    this.decoder = new l(t.encoding),
                    this.encoding = t.encoding)
                }
                function m(t) {
                    if (h = h || e("./_stream_duplex"),
                    !(this instanceof m))
                        return new m(t);
                    this._readableState = new g(t,this),
                    this.readable = !0,
                    t && "function" == typeof t.read && (this._read = t.read),
                    o.call(this)
                }
                function v(e, t, r, i, o) {
                    var a = function(e, t) {
                        var r = null;
                        return s.isBuffer(t) || "string" == typeof t || null == t || e.objectMode || (r = new TypeError("Invalid non-string/buffer chunk")),
                        r
                    }(t, r);
                    if (a)
                        e.emit("error", a);
                    else if (null === r)
                        t.reading = !1,
                        function(e, t) {
                            if (!t.ended) {
                                if (t.decoder) {
                                    var r = t.decoder.end();
                                    r && r.length && (t.buffer.push(r),
                                    t.length += t.objectMode ? 1 : r.length)
                                }
                                t.ended = !0,
                                w(e)
                            }
                        }(e, t);
                    else if (t.objectMode || r && r.length > 0)
                        if (t.ended && !o) {
                            var u = new Error("stream.push() after EOF");
                            e.emit("error", u)
                        } else if (t.endEmitted && o) {
                            var c = new Error("stream.unshift() after end event");
                            e.emit("error", c)
                        } else {
                            var d;
                            !t.decoder || o || i || (r = t.decoder.write(r),
                            d = !t.objectMode && 0 === r.length),
                            o || (t.reading = !1),
                            d || (t.flowing && 0 === t.length && !t.sync ? (e.emit("data", r),
                            e.read(0)) : (t.length += t.objectMode ? 1 : r.length,
                            o ? t.buffer.unshift(r) : t.buffer.push(r),
                            t.needReadable && w(e))),
                            function(e, t) {
                                t.readingMore || (t.readingMore = !0,
                                n(S, e, t))
                            }(e, t)
                        }
                    else
                        o || (t.reading = !1);
                    return function(e) {
                        return !e.ended && (e.needReadable || e.length < e.highWaterMark || 0 === e.length)
                    }(t)
                }
                c.inherits(m, o),
                m.prototype.push = function(e, t) {
                    var r = this._readableState;
                    return r.objectMode || "string" != typeof e || (t = t || r.defaultEncoding) !== r.encoding && (e = u.from(e, t),
                    t = ""),
                    v(this, r, e, t, !1)
                }
                ,
                m.prototype.unshift = function(e) {
                    return v(this, this._readableState, e, "", !0)
                }
                ,
                m.prototype.isPaused = function() {
                    return !1 === this._readableState.flowing
                }
                ,
                m.prototype.setEncoding = function(t) {
                    return l || (l = e("string_decoder/").StringDecoder),
                    this._readableState.decoder = new l(t),
                    this._readableState.encoding = t,
                    this
                }
                ;
                var b = 8388608;
                function y(e, t) {
                    return e <= 0 || 0 === t.length && t.ended ? 0 : t.objectMode ? 1 : e != e ? t.flowing && t.length ? t.buffer.head.data.length : t.length : (e > t.highWaterMark && (t.highWaterMark = function(e) {
                        return e >= b ? e = b : (e--,
                        e |= e >>> 1,
                        e |= e >>> 2,
                        e |= e >>> 4,
                        e |= e >>> 8,
                        e |= e >>> 16,
                        e++),
                        e
                    }(e)),
                    e <= t.length ? e : t.ended ? t.length : (t.needReadable = !0,
                    0))
                }
                function w(e) {
                    var t = e._readableState;
                    t.needReadable = !1,
                    t.emittedReadable || (f("emitReadable", t.flowing),
                    t.emittedReadable = !0,
                    t.sync ? n(R, e) : R(e))
                }
                function R(e) {
                    f("emit readable"),
                    e.emit("readable"),
                    k(e)
                }
                function S(e, t) {
                    for (var r = t.length; !t.reading && !t.flowing && !t.ended && t.length < t.highWaterMark && (f("maybeReadMore read 0"),
                    e.read(0),
                    r !== t.length); )
                        r = t.length;
                    t.readingMore = !1
                }
                function T(e) {
                    f("readable nexttick read 0"),
                    e.read(0)
                }
                function _(e, t) {
                    t.reading || (f("resume read 0"),
                    e.read(0)),
                    t.resumeScheduled = !1,
                    t.awaitDrain = 0,
                    e.emit("resume"),
                    k(e),
                    t.flowing && !t.reading && e.read(0)
                }
                function k(e) {
                    var t = e._readableState;
                    for (f("flow", t.flowing); t.flowing && null !== e.read(); )
                        ;
                }
                function C(e, t) {
                    return 0 === t.length ? null : (t.objectMode ? r = t.buffer.shift() : !e || e >= t.length ? (r = t.decoder ? t.buffer.join("") : 1 === t.buffer.length ? t.buffer.head.data : t.buffer.concat(t.length),
                    t.buffer.clear()) : r = function(e, t, r) {
                        var n;
                        return e < t.head.data.length ? (n = t.head.data.slice(0, e),
                        t.head.data = t.head.data.slice(e)) : n = e === t.head.data.length ? t.shift() : r ? function(e, t) {
                            var r = t.head
                              , n = 1
                              , i = r.data;
                            for (e -= i.length; r = r.next; ) {
                                var o = r.data
                                  , a = e > o.length ? o.length : e;
                                if (i += a === o.length ? o : o.slice(0, e),
                                0 == (e -= a)) {
                                    a === o.length ? (++n,
                                    t.head = r.next ? r.next : t.tail = null) : (t.head = r,
                                    r.data = o.slice(a));
                                    break
                                }
                                ++n
                            }
                            return t.length -= n,
                            i
                        }(e, t) : function(e, t) {
                            var r = u.allocUnsafe(e)
                              , n = t.head
                              , i = 1;
                            for (n.data.copy(r),
                            e -= n.data.length; n = n.next; ) {
                                var o = n.data
                                  , a = e > o.length ? o.length : e;
                                if (o.copy(r, r.length - e, 0, a),
                                0 == (e -= a)) {
                                    a === o.length ? (++i,
                                    t.head = n.next ? n.next : t.tail = null) : (t.head = n,
                                    n.data = o.slice(a));
                                    break
                                }
                                ++i
                            }
                            return t.length -= i,
                            r
                        }(e, t),
                        n
                    }(e, t.buffer, t.decoder),
                    r);
                    var r
                }
                function A(e) {
                    var t = e._readableState;
                    if (t.length > 0)
                        throw new Error('"endReadable()" called on non-empty stream');
                    t.endEmitted || (t.ended = !0,
                    n(E, t, e))
                }
                function E(e, t) {
                    e.endEmitted || 0 !== e.length || (e.endEmitted = !0,
                    t.readable = !1,
                    t.emit("end"))
                }
                function M(e, t) {
                    for (var r = 0, n = e.length; r < n; r++)
                        if (e[r] === t)
                            return r;
                    return -1
                }
                m.prototype.read = function(e) {
                    f("read", e),
                    e = parseInt(e, 10);
                    var t = this._readableState
                      , r = e;
                    if (0 !== e && (t.emittedReadable = !1),
                    0 === e && t.needReadable && (t.length >= t.highWaterMark || t.ended))
                        return f("read: emitReadable", t.length, t.ended),
                        0 === t.length && t.ended ? A(this) : w(this),
                        null;
                    if (0 === (e = y(e, t)) && t.ended)
                        return 0 === t.length && A(this),
                        null;
                    var n, i = t.needReadable;
                    return f("need readable", i),
                    (0 === t.length || t.length - e < t.highWaterMark) && f("length less than watermark", i = !0),
                    t.ended || t.reading ? f("reading or ended", i = !1) : i && (f("do read"),
                    t.reading = !0,
                    t.sync = !0,
                    0 === t.length && (t.needReadable = !0),
                    this._read(t.highWaterMark),
                    t.sync = !1,
                    t.reading || (e = y(r, t))),
                    null === (n = e > 0 ? C(e, t) : null) ? (t.needReadable = !0,
                    e = 0) : t.length -= e,
                    0 === t.length && (t.ended || (t.needReadable = !0),
                    r !== e && t.ended && A(this)),
                    null !== n && this.emit("data", n),
                    n
                }
                ,
                m.prototype._read = function(e) {
                    this.emit("error", new Error("not implemented"))
                }
                ,
                m.prototype.pipe = function(e, t) {
                    var o = this
                      , s = this._readableState;
                    switch (s.pipesCount) {
                    case 0:
                        s.pipes = e;
                        break;
                    case 1:
                        s.pipes = [s.pipes, e];
                        break;
                    default:
                        s.pipes.push(e)
                    }
                    s.pipesCount += 1,
                    f("pipe count=%d opts=%j", s.pipesCount, t);
                    var u = t && !1 === t.end || e === r.stdout || e === r.stderr ? p : d;
                    function c(e) {
                        f("onunpipe"),
                        e === o && p()
                    }
                    function d() {
                        f("onend"),
                        e.end()
                    }
                    s.endEmitted ? n(u) : o.once("end", u),
                    e.on("unpipe", c);
                    var l = function(e) {
                        return function() {
                            var t = e._readableState;
                            f("pipeOnDrain", t.awaitDrain),
                            t.awaitDrain && t.awaitDrain--,
                            0 === t.awaitDrain && a(e, "data") && (t.flowing = !0,
                            k(e))
                        }
                    }(o);
                    e.on("drain", l);
                    var h = !1;
                    function p() {
                        f("cleanup"),
                        e.removeListener("close", b),
                        e.removeListener("finish", y),
                        e.removeListener("drain", l),
                        e.removeListener("error", v),
                        e.removeListener("unpipe", c),
                        o.removeListener("end", d),
                        o.removeListener("end", p),
                        o.removeListener("data", m),
                        h = !0,
                        !s.awaitDrain || e._writableState && !e._writableState.needDrain || l()
                    }
                    var g = !1;
                    function m(t) {
                        f("ondata"),
                        g = !1,
                        !1 !== e.write(t) || g || ((1 === s.pipesCount && s.pipes === e || s.pipesCount > 1 && -1 !== M(s.pipes, e)) && !h && (f("false write response, pause", o._readableState.awaitDrain),
                        o._readableState.awaitDrain++,
                        g = !0),
                        o.pause())
                    }
                    function v(t) {
                        f("onerror", t),
                        w(),
                        e.removeListener("error", v),
                        0 === a(e, "error") && e.emit("error", t)
                    }
                    function b() {
                        e.removeListener("finish", y),
                        w()
                    }
                    function y() {
                        f("onfinish"),
                        e.removeListener("close", b),
                        w()
                    }
                    function w() {
                        f("unpipe"),
                        o.unpipe(e)
                    }
                    return o.on("data", m),
                    function(e, t, r) {
                        if ("function" == typeof e.prependListener)
                            return e.prependListener("error", r);
                        e._events && e._events.error ? i(e._events.error) ? e._events.error.unshift(r) : e._events.error = [r, e._events.error] : e.on("error", r)
                    }(e, 0, v),
                    e.once("close", b),
                    e.once("finish", y),
                    e.emit("pipe", o),
                    s.flowing || (f("pipe resume"),
                    o.resume()),
                    e
                }
                ,
                m.prototype.unpipe = function(e) {
                    var t = this._readableState;
                    if (0 === t.pipesCount)
                        return this;
                    if (1 === t.pipesCount)
                        return e && e !== t.pipes ? this : (e || (e = t.pipes),
                        t.pipes = null,
                        t.pipesCount = 0,
                        t.flowing = !1,
                        e && e.emit("unpipe", this),
                        this);
                    if (!e) {
                        var r = t.pipes
                          , n = t.pipesCount;
                        t.pipes = null,
                        t.pipesCount = 0,
                        t.flowing = !1;
                        for (var i = 0; i < n; i++)
                            r[i].emit("unpipe", this);
                        return this
                    }
                    var o = M(t.pipes, e);
                    return -1 === o ? this : (t.pipes.splice(o, 1),
                    t.pipesCount -= 1,
                    1 === t.pipesCount && (t.pipes = t.pipes[0]),
                    e.emit("unpipe", this),
                    this)
                }
                ,
                m.prototype.addListener = m.prototype.on = function(e, t) {
                    var r = o.prototype.on.call(this, e, t);
                    if ("data" === e)
                        !1 !== this._readableState.flowing && this.resume();
                    else if ("readable" === e) {
                        var i = this._readableState;
                        i.endEmitted || i.readableListening || (i.readableListening = i.needReadable = !0,
                        i.emittedReadable = !1,
                        i.reading ? i.length && w(this) : n(T, this))
                    }
                    return r
                }
                ,
                m.prototype.resume = function() {
                    var e = this._readableState;
                    return e.flowing || (f("resume"),
                    e.flowing = !0,
                    function(e, t) {
                        t.resumeScheduled || (t.resumeScheduled = !0,
                        n(_, e, t))
                    }(this, e)),
                    this
                }
                ,
                m.prototype.pause = function() {
                    return f("call pause flowing=%j", this._readableState.flowing),
                    !1 !== this._readableState.flowing && (f("pause"),
                    this._readableState.flowing = !1,
                    this.emit("pause")),
                    this
                }
                ,
                m.prototype.wrap = function(e) {
                    var t = this._readableState
                      , r = !1
                      , n = this;
                    for (var i in e.on("end", (function() {
                        if (f("wrapped end"),
                        t.decoder && !t.ended) {
                            var e = t.decoder.end();
                            e && e.length && n.push(e)
                        }
                        n.push(null)
                    }
                    )),
                    e.on("data", (function(i) {
                        f("wrapped data"),
                        t.decoder && (i = t.decoder.write(i)),
                        t.objectMode && null == i || (t.objectMode || i && i.length) && (n.push(i) || (r = !0,
                        e.pause()))
                    }
                    )),
                    e)
                        void 0 === this[i] && "function" == typeof e[i] && (this[i] = function(t) {
                            return function() {
                                return e[t].apply(e, arguments)
                            }
                        }(i));
                    return function(t, r) {
                        for (var i = 0, o = t.length; i < o; i++)
                            e.on(a = t[i], n.emit.bind(n, a));
                        var a
                    }(["error", "close", "destroy", "pause", "resume"]),
                    n._read = function(t) {
                        f("wrapped _read", t),
                        r && (r = !1,
                        e.resume())
                    }
                    ,
                    n
                }
                ,
                m._fromList = C
            }
            ).call(this, e("_process"))
        }
        , {
            "./_stream_duplex": 25,
            "./internal/streams/BufferList": 30,
            _process: 23,
            buffer: 11,
            "buffer-shims": 10,
            "core-util-is": 13,
            events: 16,
            inherits: 18,
            isarray: 20,
            "process-nextick-args": 22,
            "string_decoder/": 36,
            util: 9
        }],
        28: [function(e, t, r) {
            t.exports = a;
            var n = e("./_stream_duplex")
              , i = e("core-util-is");
            function o(e) {
                this.afterTransform = function(t, r) {
                    return function(e, t, r) {
                        var n = e._transformState;
                        n.transforming = !1;
                        var i = n.writecb;
                        if (!i)
                            return e.emit("error", new Error("no writecb in Transform class"));
                        n.writechunk = null,
                        n.writecb = null,
                        null != r && e.push(r),
                        i(t);
                        var o = e._readableState;
                        o.reading = !1,
                        (o.needReadable || o.length < o.highWaterMark) && e._read(o.highWaterMark)
                    }(e, t, r)
                }
                ,
                this.needTransform = !1,
                this.transforming = !1,
                this.writecb = null,
                this.writechunk = null,
                this.writeencoding = null
            }
            function a(e) {
                if (!(this instanceof a))
                    return new a(e);
                n.call(this, e),
                this._transformState = new o(this);
                var t = this;
                this._readableState.needReadable = !0,
                this._readableState.sync = !1,
                e && ("function" == typeof e.transform && (this._transform = e.transform),
                "function" == typeof e.flush && (this._flush = e.flush)),
                this.once("prefinish", (function() {
                    "function" == typeof this._flush ? this._flush((function(e) {
                        s(t, e)
                    }
                    )) : s(t)
                }
                ))
            }
            function s(e, t) {
                if (t)
                    return e.emit("error", t);
                var r = e._transformState;
                if (e._writableState.length)
                    throw new Error("Calling transform done when ws.length != 0");
                if (r.transforming)
                    throw new Error("Calling transform done when still transforming");
                return e.push(null)
            }
            i.inherits = e("inherits"),
            i.inherits(a, n),
            a.prototype.push = function(e, t) {
                return this._transformState.needTransform = !1,
                n.prototype.push.call(this, e, t)
            }
            ,
            a.prototype._transform = function(e, t, r) {
                throw new Error("Not implemented")
            }
            ,
            a.prototype._write = function(e, t, r) {
                var n = this._transformState;
                if (n.writecb = r,
                n.writechunk = e,
                n.writeencoding = t,
                !n.transforming) {
                    var i = this._readableState;
                    (n.needTransform || i.needReadable || i.length < i.highWaterMark) && this._read(i.highWaterMark)
                }
            }
            ,
            a.prototype._read = function(e) {
                var t = this._transformState;
                null !== t.writechunk && t.writecb && !t.transforming ? (t.transforming = !0,
                this._transform(t.writechunk, t.writeencoding, t.afterTransform)) : t.needTransform = !0
            }
        }
        , {
            "./_stream_duplex": 25,
            "core-util-is": 13,
            inherits: 18
        }],
        29: [function(e, t, r) {
            (function(r) {
                t.exports = p;
                var n = e("process-nextick-args")
                  , i = !r.browser && ["v0.10", "v0.9."].indexOf(r.version.slice(0, 5)) > -1 ? setImmediate : n;
                p.WritableState = h;
                var o = e("core-util-is");
                o.inherits = e("inherits");
                var a, s = {
                    deprecate: e("util-deprecate")
                };
                !function() {
                    try {
                        a = e("stream")
                    } catch (t) {} finally {
                        a || (a = e("events").EventEmitter)
                    }
                }();
                var u, c = e("buffer").Buffer, d = e("buffer-shims");
                function f() {}
                function l(e, t, r) {
                    this.chunk = e,
                    this.encoding = t,
                    this.callback = r,
                    this.next = null
                }
                function h(t, r) {
                    u = u || e("./_stream_duplex"),
                    this.objectMode = !!(t = t || {}).objectMode,
                    r instanceof u && (this.objectMode = this.objectMode || !!t.writableObjectMode);
                    var o = t.highWaterMark;
                    this.highWaterMark = o || 0 === o ? o : this.objectMode ? 16 : 16384,
                    this.highWaterMark = ~~this.highWaterMark,
                    this.needDrain = !1,
                    this.ending = !1,
                    this.ended = !1,
                    this.finished = !1,
                    this.decodeStrings = !(!1 === t.decodeStrings),
                    this.defaultEncoding = t.defaultEncoding || "utf8",
                    this.length = 0,
                    this.writing = !1,
                    this.corked = 0,
                    this.sync = !0,
                    this.bufferProcessing = !1,
                    this.onwrite = function(e) {
                        !function(e, t) {
                            var r = e._writableState
                              , o = r.sync
                              , a = r.writecb;
                            if (function(e) {
                                e.writing = !1,
                                e.writecb = null,
                                e.length -= e.writelen,
                                e.writelen = 0
                            }(r),
                            t)
                                !function(e, t, r, i, o) {
                                    --t.pendingcb,
                                    r ? n(o, i) : o(i),
                                    e._writableState.errorEmitted = !0,
                                    e.emit("error", i)
                                }(e, r, o, t, a);
                            else {
                                var s = b(r);
                                s || r.corked || r.bufferProcessing || !r.bufferedRequest || v(e, r),
                                o ? i(m, e, r, s, a) : m(e, r, s, a)
                            }
                        }(r, e)
                    }
                    ,
                    this.writecb = null,
                    this.writelen = 0,
                    this.bufferedRequest = null,
                    this.lastBufferedRequest = null,
                    this.pendingcb = 0,
                    this.prefinished = !1,
                    this.errorEmitted = !1,
                    this.bufferedRequestCount = 0,
                    this.corkedRequestsFree = new R(this)
                }
                function p(t) {
                    if (u = u || e("./_stream_duplex"),
                    !(this instanceof p || this instanceof u))
                        return new p(t);
                    this._writableState = new h(t,this),
                    this.writable = !0,
                    t && ("function" == typeof t.write && (this._write = t.write),
                    "function" == typeof t.writev && (this._writev = t.writev)),
                    a.call(this)
                }
                function g(e, t, r, n, i, o, a) {
                    t.writelen = n,
                    t.writecb = a,
                    t.writing = !0,
                    t.sync = !0,
                    r ? e._writev(i, t.onwrite) : e._write(i, o, t.onwrite),
                    t.sync = !1
                }
                function m(e, t, r, n) {
                    r || function(e, t) {
                        0 === t.length && t.needDrain && (t.needDrain = !1,
                        e.emit("drain"))
                    }(e, t),
                    t.pendingcb--,
                    n(),
                    w(e, t)
                }
                function v(e, t) {
                    t.bufferProcessing = !0;
                    var r = t.bufferedRequest;
                    if (e._writev && r && r.next) {
                        var n = new Array(t.bufferedRequestCount)
                          , i = t.corkedRequestsFree;
                        i.entry = r;
                        for (var o = 0; r; )
                            n[o] = r,
                            r = r.next,
                            o += 1;
                        g(e, t, !0, t.length, n, "", i.finish),
                        t.pendingcb++,
                        t.lastBufferedRequest = null,
                        i.next ? (t.corkedRequestsFree = i.next,
                        i.next = null) : t.corkedRequestsFree = new R(t)
                    } else {
                        for (; r; ) {
                            var a = r.chunk;
                            if (g(e, t, !1, t.objectMode ? 1 : a.length, a, r.encoding, r.callback),
                            r = r.next,
                            t.writing)
                                break
                        }
                        null === r && (t.lastBufferedRequest = null)
                    }
                    t.bufferedRequestCount = 0,
                    t.bufferedRequest = r,
                    t.bufferProcessing = !1
                }
                function b(e) {
                    return e.ending && 0 === e.length && null === e.bufferedRequest && !e.finished && !e.writing
                }
                function y(e, t) {
                    t.prefinished || (t.prefinished = !0,
                    e.emit("prefinish"))
                }
                function w(e, t) {
                    var r = b(t);
                    return r && (0 === t.pendingcb ? (y(e, t),
                    t.finished = !0,
                    e.emit("finish")) : y(e, t)),
                    r
                }
                function R(e) {
                    var t = this;
                    this.next = null,
                    this.entry = null,
                    this.finish = function(r) {
                        var n = t.entry;
                        for (t.entry = null; n; ) {
                            var i = n.callback;
                            e.pendingcb--,
                            i(r),
                            n = n.next
                        }
                        e.corkedRequestsFree ? e.corkedRequestsFree.next = t : e.corkedRequestsFree = t
                    }
                }
                o.inherits(p, a),
                h.prototype.getBuffer = function() {
                    for (var e = this.bufferedRequest, t = []; e; )
                        t.push(e),
                        e = e.next;
                    return t
                }
                ,
                function() {
                    try {
                        Object.defineProperty(h.prototype, "buffer", {
                            get: s.deprecate((function() {
                                return this.getBuffer()
                            }
                            ), "_writableState.buffer is deprecated. Use _writableState.getBuffer instead.")
                        })
                    } catch (e) {}
                }(),
                p.prototype.pipe = function() {
                    this.emit("error", new Error("Cannot pipe, not readable"))
                }
                ,
                p.prototype.write = function(e, t, r) {
                    var i = this._writableState
                      , o = !1;
                    return "function" == typeof t && (r = t,
                    t = null),
                    c.isBuffer(e) ? t = "buffer" : t || (t = i.defaultEncoding),
                    "function" != typeof r && (r = f),
                    i.ended ? function(e, t) {
                        var r = new Error("write after end");
                        e.emit("error", r),
                        n(t, r)
                    }(this, r) : function(e, t, r, i) {
                        var o = !0
                          , a = !1;
                        return null === r ? a = new TypeError("May not write null values to stream") : c.isBuffer(r) || "string" == typeof r || void 0 === r || t.objectMode || (a = new TypeError("Invalid non-string/buffer chunk")),
                        a && (e.emit("error", a),
                        n(i, a),
                        o = !1),
                        o
                    }(this, i, e, r) && (i.pendingcb++,
                    o = function(e, t, r, n, i) {
                        r = function(e, t, r) {
                            return e.objectMode || !1 === e.decodeStrings || "string" != typeof t || (t = d.from(t, r)),
                            t
                        }(t, r, n),
                        c.isBuffer(r) && (n = "buffer");
                        var o = t.objectMode ? 1 : r.length;
                        t.length += o;
                        var a = t.length < t.highWaterMark;
                        if (a || (t.needDrain = !0),
                        t.writing || t.corked) {
                            var s = t.lastBufferedRequest;
                            t.lastBufferedRequest = new l(r,n,i),
                            s ? s.next = t.lastBufferedRequest : t.bufferedRequest = t.lastBufferedRequest,
                            t.bufferedRequestCount += 1
                        } else
                            g(e, t, !1, o, r, n, i);
                        return a
                    }(this, i, e, t, r)),
                    o
                }
                ,
                p.prototype.cork = function() {
                    this._writableState.corked++
                }
                ,
                p.prototype.uncork = function() {
                    var e = this._writableState;
                    e.corked && (e.corked--,
                    e.writing || e.corked || e.finished || e.bufferProcessing || !e.bufferedRequest || v(this, e))
                }
                ,
                p.prototype.setDefaultEncoding = function(e) {
                    if ("string" == typeof e && (e = e.toLowerCase()),
                    !(["hex", "utf8", "utf-8", "ascii", "binary", "base64", "ucs2", "ucs-2", "utf16le", "utf-16le", "raw"].indexOf((e + "").toLowerCase()) > -1))
                        throw new TypeError("Unknown encoding: " + e);
                    return this._writableState.defaultEncoding = e,
                    this
                }
                ,
                p.prototype._write = function(e, t, r) {
                    r(new Error("not implemented"))
                }
                ,
                p.prototype._writev = null,
                p.prototype.end = function(e, t, r) {
                    var i = this._writableState;
                    "function" == typeof e ? (r = e,
                    e = null,
                    t = null) : "function" == typeof t && (r = t,
                    t = null),
                    null != e && this.write(e, t),
                    i.corked && (i.corked = 1,
                    this.uncork()),
                    i.ending || i.finished || function(e, t, r) {
                        t.ending = !0,
                        w(e, t),
                        r && (t.finished ? n(r) : e.once("finish", r)),
                        t.ended = !0,
                        e.writable = !1
                    }(this, i, r)
                }
            }
            ).call(this, e("_process"))
        }
        , {
            "./_stream_duplex": 25,
            _process: 23,
            buffer: 11,
            "buffer-shims": 10,
            "core-util-is": 13,
            events: 16,
            inherits: 18,
            "process-nextick-args": 22,
            "util-deprecate": 37
        }],
        30: [function(e, t, r) {
            e("buffer");
            var n = e("buffer-shims");
            function i() {
                this.head = null,
                this.tail = null,
                this.length = 0
            }
            t.exports = i,
            i.prototype.push = function(e) {
                var t = {
                    data: e,
                    next: null
                };
                this.length > 0 ? this.tail.next = t : this.head = t,
                this.tail = t,
                ++this.length
            }
            ,
            i.prototype.unshift = function(e) {
                var t = {
                    data: e,
                    next: this.head
                };
                0 === this.length && (this.tail = t),
                this.head = t,
                ++this.length
            }
            ,
            i.prototype.shift = function() {
                if (0 !== this.length) {
                    var e = this.head.data;
                    return this.head = 1 === this.length ? this.tail = null : this.head.next,
                    --this.length,
                    e
                }
            }
            ,
            i.prototype.clear = function() {
                this.head = this.tail = null,
                this.length = 0
            }
            ,
            i.prototype.join = function(e) {
                if (0 === this.length)
                    return "";
                for (var t = this.head, r = "" + t.data; t = t.next; )
                    r += e + t.data;
                return r
            }
            ,
            i.prototype.concat = function(e) {
                if (0 === this.length)
                    return n.alloc(0);
                if (1 === this.length)
                    return this.head.data;
                for (var t = n.allocUnsafe(e >>> 0), r = this.head, i = 0; r; )
                    r.data.copy(t, i),
                    i += r.data.length,
                    r = r.next;
                return t
            }
        }
        , {
            buffer: 11,
            "buffer-shims": 10
        }],
        31: [function(e, t, r) {
            t.exports = e("./lib/_stream_passthrough.js")
        }
        , {
            "./lib/_stream_passthrough.js": 26
        }],
        32: [function(e, t, r) {
            (function(n) {
                var i = function() {
                    try {
                        return e("stream")
                    } catch (t) {}
                }();
                (r = t.exports = e("./lib/_stream_readable.js")).Stream = i || r,
                r.Readable = r,
                r.Writable = e("./lib/_stream_writable.js"),
                r.Duplex = e("./lib/_stream_duplex.js"),
                r.Transform = e("./lib/_stream_transform.js"),
                r.PassThrough = e("./lib/_stream_passthrough.js"),
                !n.browser && "disable" === n.env.READABLE_STREAM && i && (t.exports = i)
            }
            ).call(this, e("_process"))
        }
        , {
            "./lib/_stream_duplex.js": 25,
            "./lib/_stream_passthrough.js": 26,
            "./lib/_stream_readable.js": 27,
            "./lib/_stream_transform.js": 28,
            "./lib/_stream_writable.js": 29,
            _process: 23
        }],
        33: [function(e, t, r) {
            t.exports = e("./lib/_stream_transform.js")
        }
        , {
            "./lib/_stream_transform.js": 28
        }],
        34: [function(e, t, r) {
            t.exports = e("./lib/_stream_writable.js")
        }
        , {
            "./lib/_stream_writable.js": 29
        }],
        35: [function(e, t, r) {
            t.exports = i;
            var n = e("events").EventEmitter;
            function i() {
                n.call(this)
            }
            e("inherits")(i, n),
            i.Readable = e("readable-stream/readable.js"),
            i.Writable = e("readable-stream/writable.js"),
            i.Duplex = e("readable-stream/duplex.js"),
            i.Transform = e("readable-stream/transform.js"),
            i.PassThrough = e("readable-stream/passthrough.js"),
            i.Stream = i,
            i.prototype.pipe = function(e, t) {
                var r = this;
                function i(t) {
                    e.writable && !1 === e.write(t) && r.pause && r.pause()
                }
                function o() {
                    r.readable && r.resume && r.resume()
                }
                r.on("data", i),
                e.on("drain", o),
                e._isStdio || t && !1 === t.end || (r.on("end", s),
                r.on("close", u));
                var a = !1;
                function s() {
                    a || (a = !0,
                    e.end())
                }
                function u() {
                    a || (a = !0,
                    "function" == typeof e.destroy && e.destroy())
                }
                function c(e) {
                    if (d(),
                    0 === n.listenerCount(this, "error"))
                        throw e
                }
                function d() {
                    r.removeListener("data", i),
                    e.removeListener("drain", o),
                    r.removeListener("end", s),
                    r.removeListener("close", u),
                    r.removeListener("error", c),
                    e.removeListener("error", c),
                    r.removeListener("end", d),
                    r.removeListener("close", d),
                    e.removeListener("close", d)
                }
                return r.on("error", c),
                e.on("error", c),
                r.on("end", d),
                r.on("close", d),
                e.on("close", d),
                e.emit("pipe", r),
                e
            }
        }
        , {
            events: 16,
            inherits: 18,
            "readable-stream/duplex.js": 24,
            "readable-stream/passthrough.js": 31,
            "readable-stream/readable.js": 32,
            "readable-stream/transform.js": 33,
            "readable-stream/writable.js": 34
        }],
        36: [function(e, t, r) {
            var n = e("buffer").Buffer
              , i = n.isEncoding || function(e) {
                switch (e && e.toLowerCase()) {
                case "hex":
                case "utf8":
                case "utf-8":
                case "ascii":
                case "binary":
                case "base64":
                case "ucs2":
                case "ucs-2":
                case "utf16le":
                case "utf-16le":
                case "raw":
                    return !0;
                default:
                    return !1
                }
            }
              , o = r.StringDecoder = function(e) {
                switch (this.encoding = (e || "utf8").toLowerCase().replace(/[-_]/, ""),
                function(e) {
                    if (e && !i(e))
                        throw new Error("Unknown encoding: " + e)
                }(e),
                this.encoding) {
                case "utf8":
                    this.surrogateSize = 3;
                    break;
                case "ucs2":
                case "utf16le":
                    this.surrogateSize = 2,
                    this.detectIncompleteChar = s;
                    break;
                case "base64":
                    this.surrogateSize = 3,
                    this.detectIncompleteChar = u;
                    break;
                default:
                    return void (this.write = a)
                }
                this.charBuffer = new n(6),
                this.charReceived = 0,
                this.charLength = 0
            }
            ;
            function a(e) {
                return e.toString(this.encoding)
            }
            function s(e) {
                this.charReceived = e.length % 2,
                this.charLength = this.charReceived ? 2 : 0
            }
            function u(e) {
                this.charReceived = e.length % 3,
                this.charLength = this.charReceived ? 3 : 0
            }
            o.prototype.write = function(e) {
                for (var t = ""; this.charLength; ) {
                    var r = e.length >= this.charLength - this.charReceived ? this.charLength - this.charReceived : e.length;
                    if (e.copy(this.charBuffer, this.charReceived, 0, r),
                    this.charReceived += r,
                    this.charReceived < this.charLength)
                        return "";
                    if (e = e.slice(r, e.length),
                    !((n = (t = this.charBuffer.slice(0, this.charLength).toString(this.encoding)).charCodeAt(t.length - 1)) >= 55296 && n <= 56319)) {
                        if (this.charReceived = this.charLength = 0,
                        0 === e.length)
                            return t;
                        break
                    }
                    this.charLength += this.surrogateSize,
                    t = ""
                }
                this.detectIncompleteChar(e);
                var n, i = e.length;
                if (this.charLength && (e.copy(this.charBuffer, 0, e.length - this.charReceived, i),
                i -= this.charReceived),
                (n = (t += e.toString(this.encoding, 0, i)).charCodeAt(i = t.length - 1)) >= 55296 && n <= 56319) {
                    var o = this.surrogateSize;
                    return this.charLength += o,
                    this.charReceived += o,
                    this.charBuffer.copy(this.charBuffer, o, 0, o),
                    e.copy(this.charBuffer, 0, 0, o),
                    t.substring(0, i)
                }
                return t
            }
            ,
            o.prototype.detectIncompleteChar = function(e) {
                for (var t = e.length >= 3 ? 3 : e.length; t > 0; t--) {
                    var r = e[e.length - t];
                    if (1 == t && r >> 5 == 6) {
                        this.charLength = 2;
                        break
                    }
                    if (t <= 2 && r >> 4 == 14) {
                        this.charLength = 3;
                        break
                    }
                    if (t <= 3 && r >> 3 == 30) {
                        this.charLength = 4;
                        break
                    }
                }
                this.charReceived = t
            }
            ,
            o.prototype.end = function(e) {
                var t = "";
                if (e && e.length && (t = this.write(e)),
                this.charReceived) {
                    var r = this.encoding;
                    t += this.charBuffer.slice(0, this.charReceived).toString(r)
                }
                return t
            }
        }
        , {
            buffer: 11
        }],
        37: [function(e, t, r) {
            (function(e) {
                function r(t) {
                    try {
                        if (!e.localStorage)
                            return !1
                    } catch (n) {
                        return !1
                    }
                    var r = e.localStorage[t];
                    return null != r && "true" === String(r).toLowerCase()
                }
                t.exports = function(e, t) {
                    if (r("noDeprecation"))
                        return e;
                    var n = !1;
                    return function() {
                        if (!n) {
                            if (r("throwDeprecation"))
                                throw new Error(t);
                            r("traceDeprecation") ? console.trace(t) : console.warn(t),
                            n = !0
                        }
                        return e.apply(this, arguments)
                    }
                }
            }
            ).call(this, "undefined" != typeof global ? global : "undefined" != typeof self ? self : "undefined" != typeof window ? window : {})
        }
        , {}],
        38: [function(e, t, r) {
            arguments[4][18][0].apply(r, arguments)
        }
        , {
            dup: 18
        }],
        39: [function(e, t, r) {
            t.exports = function(e) {
                return e && "object" == typeof e && "function" == typeof e.copy && "function" == typeof e.fill && "function" == typeof e.readUInt8
            }
        }
        , {}],
        40: [function(e, t, r) {
            (function(t, n) {
                var i = /%[sdj%]/g;
                r.format = function(e) {
                    if (!v(e)) {
                        for (var t = [], r = 0; r < arguments.length; r++)
                            t.push(s(arguments[r]));
                        return t.join(" ")
                    }
                    r = 1;
                    for (var n = arguments, o = n.length, a = String(e).replace(i, (function(e) {
                        if ("%%" === e)
                            return "%";
                        if (r >= o)
                            return e;
                        switch (e) {
                        case "%s":
                            return String(n[r++]);
                        case "%d":
                            return Number(n[r++]);
                        case "%j":
                            try {
                                return JSON.stringify(n[r++])
                            } catch (t) {
                                return "[Circular]"
                            }
                        default:
                            return e
                        }
                    }
                    )), u = n[r]; r < o; u = n[++r])
                        g(u) || !w(u) ? a += " " + u : a += " " + s(u);
                    return a
                }
                ,
                r.deprecate = function(e, i) {
                    if (b(n.process))
                        return function() {
                            return r.deprecate(e, i).apply(this, arguments)
                        }
                        ;
                    if (!0 === t.noDeprecation)
                        return e;
                    var o = !1;
                    return function() {
                        if (!o) {
                            if (t.throwDeprecation)
                                throw new Error(i);
                            t.traceDeprecation ? console.trace(i) : console.error(i),
                            o = !0
                        }
                        return e.apply(this, arguments)
                    }
                }
                ;
                var o, a = {};
                function s(e, t) {
                    var n = {
                        seen: [],
                        stylize: c
                    };
                    return arguments.length >= 3 && (n.depth = arguments[2]),
                    arguments.length >= 4 && (n.colors = arguments[3]),
                    p(t) ? n.showHidden = t : t && r._extend(n, t),
                    b(n.showHidden) && (n.showHidden = !1),
                    b(n.depth) && (n.depth = 2),
                    b(n.colors) && (n.colors = !1),
                    b(n.customInspect) && (n.customInspect = !0),
                    n.colors && (n.stylize = u),
                    d(n, e, n.depth)
                }
                function u(e, t) {
                    var r = s.styles[t];
                    return r ? "[" + s.colors[r][0] + "m" + e + "[" + s.colors[r][1] + "m" : e
                }
                function c(e, t) {
                    return e
                }
                function d(e, t, n) {
                    if (e.customInspect && t && T(t.inspect) && t.inspect !== r.inspect && (!t.constructor || t.constructor.prototype !== t)) {
                        var i = t.inspect(n, e);
                        return v(i) || (i = d(e, i, n)),
                        i
                    }
                    var o = function(e, t) {
                        if (b(t))
                            return e.stylize("undefined", "undefined");
                        if (v(t)) {
                            var r = "'" + JSON.stringify(t).replace(/^"|"$/g, "").replace(/'/g, "\\'").replace(/\\"/g, '"') + "'";
                            return e.stylize(r, "string")
                        }
                        return m(t) ? e.stylize("" + t, "number") : p(t) ? e.stylize("" + t, "boolean") : g(t) ? e.stylize("null", "null") : void 0
                    }(e, t);
                    if (o)
                        return o;
                    var a = Object.keys(t)
                      , s = function(e) {
                        var t = {};
                        return e.forEach((function(e, r) {
                            t[e] = !0
                        }
                        )),
                        t
                    }(a);
                    if (e.showHidden && (a = Object.getOwnPropertyNames(t)),
                    S(t) && (a.indexOf("message") >= 0 || a.indexOf("description") >= 0))
                        return f(t);
                    if (0 === a.length) {
                        if (T(t))
                            return e.stylize("[Function" + (t.name ? ": " + t.name : "") + "]", "special");
                        if (y(t))
                            return e.stylize(RegExp.prototype.toString.call(t), "regexp");
                        if (R(t))
                            return e.stylize(Date.prototype.toString.call(t), "date");
                        if (S(t))
                            return f(t)
                    }
                    var u, c = "", w = !1, _ = ["{", "}"];
                    return h(t) && (w = !0,
                    _ = ["[", "]"]),
                    T(t) && (c = " [Function" + (t.name ? ": " + t.name : "") + "]"),
                    y(t) && (c = " " + RegExp.prototype.toString.call(t)),
                    R(t) && (c = " " + Date.prototype.toUTCString.call(t)),
                    S(t) && (c = " " + f(t)),
                    0 !== a.length || w && 0 != t.length ? n < 0 ? y(t) ? e.stylize(RegExp.prototype.toString.call(t), "regexp") : e.stylize("[Object]", "special") : (e.seen.push(t),
                    u = w ? function(e, t, r, n, i) {
                        for (var o = [], a = 0, s = t.length; a < s; ++a)
                            E(t, String(a)) ? o.push(l(e, t, r, n, String(a), !0)) : o.push("");
                        return i.forEach((function(i) {
                            i.match(/^\d+$/) || o.push(l(e, t, r, n, i, !0))
                        }
                        )),
                        o
                    }(e, t, n, s, a) : a.map((function(r) {
                        return l(e, t, n, s, r, w)
                    }
                    )),
                    e.seen.pop(),
                    function(e, t, r) {
                        return e.reduce((function(e, t) {
                            return t.indexOf("\n"),
                            e + t.replace(/\u001b\[\d\d?m/g, "").length + 1
                        }
                        ), 0) > 60 ? r[0] + ("" === t ? "" : t + "\n ") + " " + e.join(",\n  ") + " " + r[1] : r[0] + t + " " + e.join(", ") + " " + r[1]
                    }(u, c, _)) : _[0] + c + _[1]
                }
                function f(e) {
                    return "[" + Error.prototype.toString.call(e) + "]"
                }
                function l(e, t, r, n, i, o) {
                    var a, s, u;
                    if ((u = Object.getOwnPropertyDescriptor(t, i) || {
                        value: t[i]
                    }).get ? s = e.stylize(u.set ? "[Getter/Setter]" : "[Getter]", "special") : u.set && (s = e.stylize("[Setter]", "special")),
                    E(n, i) || (a = "[" + i + "]"),
                    s || (e.seen.indexOf(u.value) < 0 ? (s = g(r) ? d(e, u.value, null) : d(e, u.value, r - 1)).indexOf("\n") > -1 && (s = o ? s.split("\n").map((function(e) {
                        return "  " + e
                    }
                    )).join("\n").substr(2) : "\n" + s.split("\n").map((function(e) {
                        return "   " + e
                    }
                    )).join("\n")) : s = e.stylize("[Circular]", "special")),
                    b(a)) {
                        if (o && i.match(/^\d+$/))
                            return s;
                        (a = JSON.stringify("" + i)).match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/) ? (a = a.substr(1, a.length - 2),
                        a = e.stylize(a, "name")) : (a = a.replace(/'/g, "\\'").replace(/\\"/g, '"').replace(/(^"|"$)/g, "'"),
                        a = e.stylize(a, "string"))
                    }
                    return a + ": " + s
                }
                function h(e) {
                    return Array.isArray(e)
                }
                function p(e) {
                    return "boolean" == typeof e
                }
                function g(e) {
                    return null === e
                }
                function m(e) {
                    return "number" == typeof e
                }
                function v(e) {
                    return "string" == typeof e
                }
                function b(e) {
                    return void 0 === e
                }
                function y(e) {
                    return w(e) && "[object RegExp]" === _(e)
                }
                function w(e) {
                    return "object" == typeof e && null !== e
                }
                function R(e) {
                    return w(e) && "[object Date]" === _(e)
                }
                function S(e) {
                    return w(e) && ("[object Error]" === _(e) || e instanceof Error)
                }
                function T(e) {
                    return "function" == typeof e
                }
                function _(e) {
                    return Object.prototype.toString.call(e)
                }
                function k(e) {
                    return e < 10 ? "0" + e.toString(10) : e.toString(10)
                }
                r.debuglog = function(e) {
                    if (b(o) && (o = t.env.NODE_DEBUG || ""),
                    e = e.toUpperCase(),
                    !a[e])
                        if (new RegExp("\\b" + e + "\\b","i").test(o)) {
                            var n = t.pid;
                            a[e] = function() {
                                var t = r.format.apply(r, arguments);
                                console.error("%s %d: %s", e, n, t)
                            }
                        } else
                            a[e] = function() {}
                            ;
                    return a[e]
                }
                ,
                r.inspect = s,
                s.colors = {
                    bold: [1, 22],
                    italic: [3, 23],
                    underline: [4, 24],
                    inverse: [7, 27],
                    white: [37, 39],
                    grey: [90, 39],
                    black: [30, 39],
                    blue: [34, 39],
                    cyan: [36, 39],
                    green: [32, 39],
                    magenta: [35, 39],
                    red: [31, 39],
                    yellow: [33, 39]
                },
                s.styles = {
                    special: "cyan",
                    number: "yellow",
                    boolean: "yellow",
                    undefined: "grey",
                    null: "bold",
                    string: "green",
                    date: "magenta",
                    regexp: "red"
                },
                r.isArray = h,
                r.isBoolean = p,
                r.isNull = g,
                r.isNullOrUndefined = function(e) {
                    return null == e
                }
                ,
                r.isNumber = m,
                r.isString = v,
                r.isSymbol = function(e) {
                    return "symbol" == typeof e
                }
                ,
                r.isUndefined = b,
                r.isRegExp = y,
                r.isObject = w,
                r.isDate = R,
                r.isError = S,
                r.isFunction = T,
                r.isPrimitive = function(e) {
                    return null === e || "boolean" == typeof e || "number" == typeof e || "string" == typeof e || "symbol" == typeof e || void 0 === e
                }
                ,
                r.isBuffer = e("./support/isBuffer");
                var C = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                function A() {
                    var e = new Date
                      , t = [k(e.getHours()), k(e.getMinutes()), k(e.getSeconds())].join(":");
                    return [e.getDate(), C[e.getMonth()], t].join(" ")
                }
                function E(e, t) {
                    return Object.prototype.hasOwnProperty.call(e, t)
                }
                r.log = function() {
                    console.log("%s - %s", A(), r.format.apply(r, arguments))
                }
                ,
                r.inherits = e("inherits"),
                r._extend = function(e, t) {
                    if (!t || !w(t))
                        return e;
                    for (var r = Object.keys(t), n = r.length; n--; )
                        e[r[n]] = t[r[n]];
                    return e
                }
            }
            ).call(this, e("_process"), "undefined" != typeof global ? global : "undefined" != typeof self ? self : "undefined" != typeof window ? window : {})
        }
        , {
            "./support/isBuffer": 39,
            _process: 23,
            inherits: 38
        }]
    }, {}, [1])(1)
}
));
