# Virtual SP-404 Sampler

A small experiment using the Web Audio API to emulate some features of the Roland SP‑404 sampler.

## Features

- **Pad sampler** – upload audio files via drag and drop and trigger them with on‑screen pads or the keyboard.
- **Volume and pitch controls** – adjust playback speed and output level for all loaded sounds.
- **Vinyl simulation** – add lo‑fi filtering and noise using an AudioWorklet processor.
- **Delay effect** – toggle a simple delay on the currently playing sample.
- **Keyboard mode** – map your computer keyboard to the pads for faster triggering.

## Getting started

No build step is required. Serve the files with any static HTTP server or open `index.html` directly in a modern browser. Click **Start Audio** to enable audio and then drag audio files onto the pads.

## Project goals

This project is a learning exercise exploring browser‑based audio processing. It is not a full replacement for the real hardware but demonstrates how the Web Audio API can be used to create interactive music tools.

