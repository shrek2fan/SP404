// Global variable for the AudioContext to be used throughout the application
let audioCtx;

// This function initializes the AudioContext when the "Start Audio" button is clicked
document.addEventListener('DOMContentLoaded', () => {
    const startButton = document.getElementById('startAudio');
    if (startButton) {
        startButton.addEventListener('click', initAudioContext);
        console.log("Event listener added to 'Start Audio' button.");
    } else {
        console.error("Failed to find the startAudio button. Check HTML and timing.");
    }
});

// Function to initialize the AudioContext
function initAudioContext() {
    if (!audioCtx) {
        try {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            console.log("AudioContext created successfully.");
            audioCtx.audioWorklet.addModule('vinyl-processor.js').then(() => {
                console.log("AudioWorklet loaded successfully.");
            }).catch(e => {
                console.error("Failed to load AudioWorklet:", e);
            });
        } catch (e) {
            console.error("Failed to create AudioContext:", e);
        }
    } else {
        console.log("AudioContext already instantiated.");
    }
}

// Function to attach audio event listeners to pad elements
function attachAudioEventListeners() {
    document.querySelectorAll('.pad').forEach(pad => {
        pad.addEventListener('click', function() {
            playOrUploadSound(pad.dataset.pad);
        });
    });
}

// Event listener for loading the vinyl simulation
document.addEventListener('DOMContentLoaded', () => {
    const startButton = document.getElementById('startAudio');
    startButton.addEventListener('click', initAudioContext);
});

// Object to track the sounds loaded onto the pads
var padSounds = {};

// Event handler for drag-over actions on the pads
function dragOverHandler(event) {
    event.preventDefault();
    event.target.classList.add('dragover');
}

function dragEnterHandler(event) {
    event.target.classList.add('dragover');
}

function dragLeaveHandler(event) {
    event.target.classList.remove('dragover');
}

// Event handler for dropping files onto the pads
function dropHandler(event, padNumber) {
    event.preventDefault();
    event.target.classList.remove('dragover');
    var files = event.dataTransfer.files;
    if (files.length > 0) {
        var file = files[0];
        if (file.type.startsWith('audio/')) {
            loadSound(padNumber, file);
        } else {
            alert("Please drop an audio file.");
        }
    }
}

// Function to load sound files into the audio elements
function loadSound(padNumber, file) {
    var reader = new FileReader();
    reader.onload = function(e) {
        var audioElement = document.getElementById('pad' + padNumber + '-audio') || new Audio();
        audioElement.id = 'pad' + padNumber + '-audio';
        audioElement.src = e.target.result;
        padSounds[padNumber] = audioElement;
        document.body.appendChild(audioElement);
    };
    reader.readAsDataURL(file);
}

// Function to play or upload sound associated with a pad
function playOrUploadSound(padNumber) {
    var audioElement = padSounds[padNumber];
    var padElement = document.querySelector('.pad[data-pad="' + padNumber + '"]');
    if (audioElement) {
        padElement.classList.add('playing');
        audioElement.play();
        audioElement.onended = function() {
            padElement.classList.remove('playing');
        };
    }
}

// Function to set the volume for all audio elements
function setVolume(volumeValue) {
    Object.values(padSounds).forEach(audio => {
        if (audio) audio.volume = volumeValue;
    });
}

// Function to apply vinyl simulation effect to an audio element
function applyVinylSimulation(audioElement) {
    if (!audioElement.vinylSimulationNodes) {
        var source = audioCtx.createMediaElementSource(audioElement);
        var biquadFilter = audioCtx.createBiquadFilter();
        biquadFilter.type = 'lowpass';
        biquadFilter.frequency.setValueAtTime(1000, audioCtx.currentTime);

        var noiseGain = audioCtx.createGain();
        noiseGain.gain.value = 0.02;

        var noiseNode = new AudioWorkletNode(audioCtx, 'vinyl-processor', {
            numberOfInputs: 0,
            numberOfOutputs: 1,
            outputChannelCount: [1],
        });

        noiseNode.parameters.get('noiseLevel').setValueAtTime(0.02, audioCtx.currentTime);

        source.connect(biquadFilter);
        biquadFilter.connect(audioCtx.destination);
        noiseNode.connect(noiseGain);
        noiseGain.connect(audioCtx.destination);

        audioElement.vinylSimulationNodes = {
            source: source,
            biquadFilter: biquadFilter,
            noiseGain: noiseGain,
            noiseNode: noiseNode
        };
        audioElement.connectedVinyl = true;
    } else if (!audioElement.connectedVinyl) {
        audioElement.vinylSimulationNodes.biquadFilter.connect(audioCtx.destination);
        audioElement.vinylSimulationNodes.noiseNode.connect(audioElement.vinylSimulationNodes.noiseGain);
        audioElement.vinylSimulationNodes.noiseGain.connect(audioCtx.destination);
        audioElement.connectedVinyl = true;
    }
}

// Function to toggle vinyl simulation for a specific pad
function toggleVinylSimulation(padNumber) {
    var audioElement = padSounds[padNumber];
    if (audioElement) {
        if (audioElement.vinylSimulationApplied) {
            audioElement.vinylSimulationNodes.biquadFilter.disconnect();
            audioElement.vinylSimulationNodes.noiseGain.disconnect();
            audioElement.vinylSimulationNodes.noiseNode.disconnect();
            audioElement.vinylSimulationNodes.source.connect(audioCtx.destination);
            audioElement.connectedVinyl = false;
            audioElement.vinylSimulationApplied = false;
            console.log("Vinyl simulation turned off.");
        } else {
            applyVinylSimulation(audioElement);
            audioElement.vinylSimulationApplied = true;
            console.log("Vinyl simulation turned on.");
        }
    }
}

// Function to toggle vinyl simulation for all pads
function toggleVinylSimulationForAllPads() {
    Object.keys(padSounds).forEach(padNumber => {
        toggleVinylSimulation(padNumber);
    });
}

// Function to retrieve the currently playing audio element
function getCurrentAudioElement() {
    const audioElements = Object.values(padSounds);
    for (const audioElement of audioElements) {
        if (audioElement && !audioElement.paused) {
            return audioElement;
        }
    }
    return null;
}

// Event listeners and handlers for pitch control and keyboard interaction
const pitchButton = document.getElementById('pitch-button');
pitchButton.addEventListener('click', togglePitch);

function togglePitch() {
    const pitchKnob = document.getElementById('pitch-knob');
    if (pitchKnob) {
        const pitchValue = parseFloat(pitchKnob.value);
        adjustPitch(pitchValue);
    } else {
        console.error("Pitch knob not found.");
    }
}

function adjustPitch(value) {
    const audioElement = getCurrentAudioElement();
    if (audioElement) {
        const pitchValue = parseFloat(value);
        if (!isNaN(pitchValue) && isFinite(pitchValue)) {
            audioElement.playbackRate = pitchValue;
        } else {
            console.error("Invalid pitch value:", value);
        }
    } else {
        console.error("No audio element found.");
    }
}

// Mapping keyboard keys to pad numbers
function mapKeyToPad(key) {
    const keyMap = {
        'q': 1, 'w': 2, 'e': 3, 'r': 4,
        'a': 5, 's': 6, 'd': 7, 'f': 8,
        'z': 9, 'x': 10, 'c': 11, 'v': 12
    };
    return keyMap[key];
}

// Handling keyboard events for triggering pads
function handleKeyboardEvent(event) {
    if (!keyboardEnabled) return;
    const key = event.key.toLowerCase();
    const padNumber = mapKeyToPad(key);
    if (padNumber) {
        const padElement = document.querySelector(`.pad[data-pad="${padNumber}"]`);
        if (padElement) {
            padElement.click();
        }
    }
}

// Variable to track if keyboard is enabled
let keyboardEnabled = false;

// Function to toggle keyboard enable/disable
function toggleKeyboard() {
    keyboardEnabled = !keyboardEnabled;
    const enableKeyboardButton = document.getElementById('enableKeyboardButton');
    enableKeyboardButton.textContent = keyboardEnabled ? 'Disable Keyboard' : 'Enable Keyboard';
}

// Adding event listeners for keyboard and enable/disable keyboard button
document.addEventListener('keydown', handleKeyboardEvent);
const enableKeyboardButton = document.getElementById('enableKeyboardButton');
enableKeyboardButton.addEventListener('click', toggleKeyboard);

