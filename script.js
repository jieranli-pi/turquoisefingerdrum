// Define available drum kits
const drumKits = {
    classic: "maple", // Subfolder for Classic drum kit
    jazz: "jazz", // Subfolder for Jazz drum kit
    electronic: "electronic", // Subfolder for Electronic drum kit
};

// Current key-to-sound mapping
const keySoundMap = {
    " ": "bass_drum.wav", // Spacebar -> Bass Drum
    "Q": "chimeup.wav",
    "W": "chimedwn.wav",
    "E": "crash.wav",
    "R": "closed_hihat.wav",
    "T": "open_hihat.wav",
    "Y": "open_hihat.wav",
    "U": "closed_hihat.wav",
    "I": "ride_crash.wav",
    "O": "jinglebell.wav",
    "P": "cowbell.wav",
    "A": "agogo.wav",
    "S": "cymbal_hard.wav",
    "D": "cymbal_soft.wav",
    "F": "snare_rim.wav",
    "G": "snare_drum.wav",
    "H": "snare_drum.wav",
    "J": "snare_rim.wav",
    "K": "cymbal_soft.wav",
    "L": "cymbal_hard.wav",
    "Z": "sticks.wav",
    "X": "sticks.wav",
    "C": "tom1.wav",
    "V": "tom2.wav",
    "B": "tom3.wav",
    "N": "tom2.wav",
    "M": "tom1.wav",
};

// Track active keys to prevent retriggering sounds
const activeKeys = new Set();

// Preload sound files and cache them
const sounds = {};
let currentDrumKit = "maple"; // Default drum kit

let openHiHatAudio = null; // Store reference to the open hi-hat audio

// Preload sounds function
const preloadSounds = () => {
    Object.keys(keySoundMap).forEach((key) => {
        const soundFile = keySoundMap[key];
        const audio = new Audio(`sounds/${currentDrumKit}/${soundFile}`); // Load from the selected drum kit's subfolder
        audio.preload = "auto"; // Ensure sound is preloaded immediately
        audio.volume = 0.6; // Set initial volume to 60%
        sounds[key] = audio;
    });
};

// Store currently playing sound objects to manage up to 64 sounds
const playingSounds = [];

// Define keyboard rows
const keyboardLayout = [
    "QWERTYUIOP", // Top row
    "ASDFGHJKL", // Second row
    "ZXCVBNM", // Third row
    " ", // Spacebar
];

// Generate keyboard layout
const keyboardDiv = document.getElementById("keyboard");
keyboardLayout.forEach((row) => {
    const rowDiv = document.createElement("div");
    rowDiv.className = "keyboard-row";

    row.split("").forEach((key) => {
        const keyDiv = document.createElement("div");
        keyDiv.className = `key ${key === " " ? "spacebar" : ""}`;
        keyDiv.innerText = key === " " ? "" : key; // Omit text for the spacebar
        keyDiv.setAttribute("data-key", key);

        const volumeSlider = document.createElement("input");
        volumeSlider.type = "range";
        volumeSlider.min = 0;
        volumeSlider.max = 100;
        volumeSlider.value = 60; // Set initial value to 60%
        volumeSlider.addEventListener("input", function () {
            sounds[key].volume = volumeSlider.value / 100;
        });

        keyDiv.appendChild(volumeSlider);
        rowDiv.appendChild(keyDiv);
    });

    keyboardDiv.appendChild(rowDiv);
});

// Function to play sound (supports multiple channels)
function playSound(key) {
    const sound = sounds[key];
    if (sound) {
        const audio = sound.cloneNode(); // Create a new audio instance each time
        audio.volume = sound.volume; // Set volume to the same as the original sound
        audio.play();

        // If the key is open hi-hat (T or Y), store the reference to it
        if (key === "T" || key === "Y") {
            openHiHatAudio = audio; // Set the open hi-hat audio to the current sound
        }

        // Add to playing sounds array, with a limit of 64 channels
        if (playingSounds.length >= 64) {
            playingSounds.shift().stop(); // Remove the oldest sound
        }

        playingSounds.push(audio);

        // Control sound duration based on the press duration
        audio.addEventListener("ended", () => {
            // Remove sound from playing list when finished
            const index = playingSounds.indexOf(audio);
            if (index > -1) playingSounds.splice(index, 1);
        });
    }
}

// Function to stop the sound immediately
function stopSound(key) {
    const sound = sounds[key];
    if (sound) {
        sound.pause();
        sound.currentTime = 0; // Reset the sound
    }
}

// Add event listener for keydown to play sounds
document.addEventListener("keydown", (event) => {
    const key = event.key.toUpperCase();

    // Ensure the key is part of the layout and not already pressed
    if (keyboardLayout.join("").includes(key) && !activeKeys.has(key)) {
        activeKeys.add(key);

        // If closed hi-hat (R or U) is pressed, check if open hi-hat is playing
        if ((key === "R" || key === "U") && openHiHatAudio) {
            openHiHatAudio.pause(); // Stop the open hi-hat sound immediately
            openHiHatAudio.currentTime = 0; // Reset its time
            openHiHatAudio = null; // Reset the reference
        }

        playSound(key); // Play the sound when the key is pressed
        highlightKey(key);
    }
});

// Add event listener for keyup to release keys and stop sound
document.addEventListener("keyup", (event) => {
    const key = event.key.toUpperCase();
    if (activeKeys.has(key)) {
        activeKeys.delete(key);
        stopSound(key); // Stop the sound when the key is released
    }
});

// Highlight the pressed key visually
function highlightKey(key) {
    const keyDiv = document.querySelector(`.key[data-key="${key}"]`);
    if (keyDiv) {
        keyDiv.classList.add("active");
        setTimeout(() => keyDiv.classList.remove("active"), 100); // Minimize highlight delay to 1ms
    }
}

// Handle drum kit selection change
document.getElementById("drumKit").addEventListener("change", (event) => {
    currentDrumKit = event.target.value; // Update the current drum kit
    preloadSounds(); // Reload sounds for the new drum kit
    console.log(`Drum kit changed to: ${currentDrumKit}`);
});

// Preload sounds when the page loads
window.addEventListener("load", preloadSounds);

// Volume and Mixing Button and Controls
document.addEventListener('DOMContentLoaded', function () {
    const volumeMixingBtn = document.getElementById('volumeMixingBtn');
    const volumeControls = document.getElementById('volumeControls');
    const keys = Object.keys(keySoundMap);

    volumeMixingBtn.addEventListener('click', function () {
        const keyElements = document.querySelectorAll('.key');
        keyElements.forEach(keyElement => {
            keyElement.classList.toggle('show-volume');
        });

        if (volumeControls.classList.contains('hidden')) {
            volumeControls.classList.remove('hidden');
        } else {
            volumeControls.classList.add('hidden');
        }
    });

    document.getElementById('overallVolume').addEventListener('input', function () {
        const overallVolume = this.value / 100;
        keys.forEach(key => {
            sounds[key].volume = overallVolume;
        });
    });

    // Ensure custom buttons with 'no-keyboard-trigger' class are not focused when space bar is pressed
    document.querySelectorAll('.no-keyboard-trigger').forEach(button => {
        button.addEventListener('keydown', function (event) {
            if (event.key === ' ') {
                event.preventDefault();
            }
        });
    });
});