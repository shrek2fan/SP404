
// Global AudioContext
var audioCtx = new (window.AudioContext || window.webkitAudioContext)();

audioCtx.audioWorklet.addModule('vinyl-processor.js').then(() => {
    console.log('Vinyl processor module loaded successfully.');
}).catch(e => {
    console.error('Error loading vinyl processor module:', e);
});

  
// Object to keep track of the sounds for the pads
var padSounds = {};

// Drag and Drop Handlers
function dragOverHandler(event) {
 
// Object to keep track of the sounds for the pads
var padSounds = {};

function dragOverHandler(event) {
 

  event.target.classList.add('dragover');
}

function dragEnterHandler(event) {
  event.target.classList.add('dragover');
}

function dragLeaveHandler(event) {
  event.target.classList.remove('dragover');
}

function dropHandler(event, padNumber) {
 
  event.target.classList.remove('dragover');



  // Get the dropped file

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

function loadSound(padNumber, file) {
  var reader = new FileReader();

  reader.onload = function(e) {
    var audioElement = document.getElementById('pad' + padNumber + '-audio') || new Audio();
    audioElement.id = 'pad' + padNumber + '-audio';
    audioElement.src = e.target.result;
    padSounds[padNumber] = audioElement;
    document.body.appendChild(audioElement); // Append to body if not already in the document
  };
  reader.readAsDataURL(file);
}

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

// Volume Control
function setVolume(volumeValue) {
  Object.values(padSounds).forEach(audio => {
    if (audio) audio.volume = volumeValue;
  });
}

function applyVinylSimulation(audioElement) {
    if (!audioElement.vinylSimulationNodes) {
        var source = audioCtx.createMediaElementSource(audioElement);
        var biquadFilter = audioCtx.createBiquadFilter();
        biquadFilter.type = 'lowpass';
        biquadFilter.frequency.setValueAtTime(1000, audioCtx.currentTime);

        var noiseGain = audioCtx.createGain();
        noiseGain.gain.value = 0.02; // Adjust this value for less effect intensity

        var bufferSize = 4096;
        var noiseNode = new AudioWorkletNode(audioCtx, 'vinyl-processor', {
            numberOfInputs: 0,
            numberOfOutputs: 1,
            outputChannelCount: [1],
          });
      
          noiseNode.parameters.get('noiseLevel').setValueAtTime(0.02, audioCtx.currentTime);

        // Connect the nodes together
        source.connect(biquadFilter);
        biquadFilter.connect(audioCtx.destination);
        noiseNode.connect(noiseGain);
        noiseGain.connect(audioCtx.destination);

        // Store nodes in the audio element for potential later use
        audioElement.vinylSimulationNodes = {
            source: source,
            biquadFilter: biquadFilter,
            noiseGain: noiseGain,
            noiseNode: noiseNode
        };
        audioElement.connectedVinyl = true;
    } else if (!audioElement.connectedVinyl) {
        // Reconnect the previously disconnected nodes
        audioElement.vinylSimulationNodes.biquadFilter.connect(audioCtx.destination);
        audioElement.vinylSimulationNodes.noiseNode.connect(audioElement.vinylSimulationNodes.noiseGain);
        audioElement.vinylSimulationNodes.noiseGain.connect(audioCtx.destination);
        audioElement.connectedVinyl = true;
    }
}

function toggleVinylSimulation(padNumber) {
    var audioElement = padSounds[padNumber];
    if (audioElement) {
        if (audioElement.vinylSimulationApplied) {
            // Bypass the effect
            if (audioElement.vinylSimulationNodes) {
                audioElement.vinylSimulationNodes.biquadFilter.disconnect();
                audioElement.vinylSimulationNodes.noiseGain.disconnect();
                audioElement.vinylSimulationNodes.noiseNode.disconnect();
                audioElement.connectedVinyl = false;
            }
            audioElement.vinylSimulationApplied = false;
        } else {
            // Apply the effect if not already applied
            applyVinylSimulation(audioElement);
            audioElement.vinylSimulationApplied = true;
        }
    }
}


function toggleVinylSimulationForAllPads() {
    Object.keys(padSounds).forEach(padNumber => {
      toggleVinylSimulation(padNumber);
    });
  }
  


  reader.onload = function(e) {
    // Create or get the audio element for the pad
    var audioElement = document.getElementById('pad' + padNumber + '-audio') || new Audio();
    audioElement.id = 'pad' + padNumber + '-audio';
    audioElement.src = e.target.result;
    
    // Store reference to the loaded sound data
    padSounds['pad' + padNumber] = e.target.result;
  };

  reader.readAsDataURL(file); // Read the file as a Data URL
}

function playOrUploadSound(padNumber) {
    var audioElement = document.getElementById('pad' + padNumber + '-audio');
    var padElement = document.querySelector('.pad[data-pad="' + padNumber + '"]');
    
    if (padSounds['pad' + padNumber]) {
      if (!audioElement) {
        // Create a new Audio element if it doesn't exist
        audioElement = new Audio(padSounds['pad' + padNumber]);
        audioElement.id = 'pad' + padNumber + '-audio';
        document.body.appendChild(audioElement);
      }
      
      padElement.classList.add('playing');
      audioElement.play();
  
      audioElement.onended = function() {
        padElement.classList.remove('playing');
      };
    }
  }
  

