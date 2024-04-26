// Object to store audio data for each pad
var padSounds = {};

function playOrUploadSound(padNumber) {
    // If sound is already loaded for this pad, play it
    if (padSounds['pad' + padNumber]) {
        let audio = new Audio(padSounds['pad' + padNumber]);
        let pad = document.querySelector('.pad[data-pad="' + padNumber + '"]');

        // Change the pad color to indicate it's playing
        pad.classList.add('playing');

        audio.play();

        //When the audio finishes, remove the 'playing' class to reset the color 
        audio.onended = function(){
            pad.classList.remove('playing');
        };

    } else {
        // If no sound is loaded, trigger the file upload input
        document.getElementById('upload-pad' + padNumber).click();
    }
}

function loadSound(padNumber, files) {
    // Check if files are selected
    if (files.length > 0) {
        let file = files[0];
        let reader = new FileReader();
        
        reader.onload = function(e) {
            // Store the loaded sound data in padSounds object
            padSounds['pad' + padNumber] = e.target.result;
        };
        
        reader.readAsDataURL(file); // Read the file as a Data URL
    }
}
