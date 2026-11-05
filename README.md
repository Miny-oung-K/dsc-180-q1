# DSC 180 — Quarter 1

Course projects and reproducible technical workflows.

| Project | Branch | Contents |
|---|---|---|
| Harmonic Lab | [app/harmonic-lab](https://github.com/Miny-oung-K/dsc-180-q1/tree/app/harmonic-lab) | This is an interactive website for creating, visualizing, recording, and filtering sounds to explore how frequencies and harmonics shape waveforms and vowel sounds. |
| Air Violin | [app/air-violin](https://github.com/Miny-oung-K/dsc-180-q1/tree/app/air-violin) | This website implements a camera-controlled electric violin with a harmonic mixer |
| Sound Interpolation Explorer | [app/between-mouth-sounds](https://github.com/Miny-oung-K/dsc-180-q1/tree/app/between-mouth-sounds) | This website lets users record two different sounds and move a slider to synthesize a continuous sound between them. |


## Contribution Statement
All three websites were created through prompting on ChatGPT/Codex. My contribution included defining the website's purpose, writing prompts, testing the website, and providing feedback to refine its behavior. ChatGPT generated the website's code, including the interface, audio-processing algorithms, automated tests, and tehcnical documentation.

# Harmonic Lab

Harmonic Lab is a browser application for investigating sound through sine-wave synthesis, harmonics, microphone recordings, and frequency filtering. Users can adjust frequencies and amplitudes, visualize waveforms and spectra, reconstruct a recorded vowel using harmonics, and draw a filter to change the synthesized sound.

## 1. Access the project

The application is on the `app/harmonic-lab` branch.

```bash
git clone --branch app/harmonic-lab https://github.com/Miny-oung-K/dsc-180-q1.git
cd dsc-180-q1/apps/harmonic-lab
```

Run the remaining application commands from this directory.

## 2. Data access and storage

No external dataset is required to run the application or its automated tests.

Users record their own voice through the application's microphone controls.

Audio processing takes place locally in the browser. Recordings are temporary until downloaded and may be lost when the page closes or a new recording is made. Downloaded files are saved to the location selected by the browser.

Personal voice recordings are not included in this public repository. To keep local copies within the project, use `data/private/`, which is excluded from Git.

## 3. Software dependencies

### Browser application

- Node.js version 20 or newer, including npm.
- A current browser supporting Web Audio, AudioWorklet, Web Workers, and microphone access.
- A microphone for recording experiments.

The application uses built-in browser and Node.js functionality. No third-party JavaScript packages, `npm install`, or build step are required.

Microphone access requires browser/operating-system permission and a secure context, such as HTTPS or localhost.

### Optional offline research scripts

The Python scripts are separate from the website and are not required to run it.

They require Python 3.10 or newer and the packages listed in `research/requirements.txt`:

- NumPy 1.26.4
- SciPy 1.15.2
- Matplotlib 3.8.4

## 4. Run the application

From `apps/harmonic-lab`, start the local server:

```bash
npm run dev
```

Open the following address in a browser:

http://127.0.0.1:8000

Keep the terminal running while using the application. Press `Ctrl+C` to stop the server.

If port 8000 is unavailable, use another port. For example, on macOS or Linux:

```bash
PORT=8001 npm run dev
```

Then open http://127.0.0.1:8001.

Further technical details are available in `docs/workflow.md`, `docs/development.md`, and `docs/references.md` at the repository root on this branch.

# Air Violin

Air Violin is a browser-based musical instrument with camera gesture controls, clickable violin strings, and an adjustable harmonic mixer. It generates sound through additive synthesis: combining a fundamental frequency with seven upper harmonics.

### 1. Access the source code

Clone the public repository and switch to the Air Violin branch:

```sh
git clone https://github.com/Miny-oung-K/dsc-180-q1.git
cd dsc-180-q1
git switch app/air-violin
cd apps/air-violin
```

### 2. Data access and storage

No external dataset is required. The instrument generates audio in the browser.

Live webcam frames are processed on the user's device and are not recorded, uploaded, or saved. Musical note history is stored temporarily in browser memory and is cleared when the page reloads.

The application automatically downloads the following resources when needed:

- MediaPipe Tasks Vision JavaScript library and WebAssembly runtime, version `0.10.21`, from jsDelivr.
- MediaPipe Hand Landmarker and Face Landmarker models from Google's model hosting service.
- DM Sans and Manrope fonts from Google Fonts.

An internet connection is required to load these resources. No manual data download, data directory, API key, or account is required.

### 3. Software dependencies

Install:

- **Python 3**, used to serve the application locally.
- **Node.js with npm**, used to run the automated checks.
- **Git**, used to obtain the source code.
- A modern browser that supports Web Audio, WebAssembly, Web Workers, and webcam access, such as a recent version of Chrome or Edge.

A webcam is required.

Check that the required command-line tools are available:

```sh
python3 --version
node --version
npm --version
git --version
```

### 4. Run the application

From `apps/air-violin`, run:

```sh
npm start
```

This serves the files in `dist/` at:

http://127.0.0.1:8765

Alternatively, start the same server directly:

```sh
python3 -m http.server 8765 --bind 127.0.0.1 --directory dist
```

On Windows:

```sh
py -3 -m http.server 8765 --bind 127.0.0.1 --directory dist
```

Open the address in your browser. Use the local server rather than opening `index.html` directly, because JavaScript modules and camera access require an appropriate browser origin.

Press `Ctrl+C` in the terminal to stop the server.

### 5. Run the automated checks

From `apps/air-violin`, run:

```sh
npm run check
```

The command should exit successfully and print `PASS` messages.

# Sound Interpolation Explorer

The Sound Interpolation Explorer is a browser-based application that records two mouth-made sounds and synthesizes a continuous sound between them. Moving a slider changes the synthesized sound’s characteristics.

## 1. Access the Code

Clone the public repository and switch to the project branch:

```sh
git clone https://github.com/Miny-oung-K/dsc-180-q1.git
cd dsc-180-q1
git switch app/between-mouth-sounds
```

To reproduce the checkpoint version specifically:

```sh
git checkout 81edf5f54e5d4d1db73d6be33f40a5790652eed7
```

## 2. Data Access and Storage

No external dataset or API key is required.

Recordings and their analysis are stored locally in the browser using IndexedDB. They are not uploaded to a server or included in this repository. If browser storage is unavailable, recordings remain available only while the tab is open.

The **Start over** button clears both recordings and their analysis.

For reproducible testing without a microphone, the repository includes tests that generate synthetic audio directly in memory. These inputs include voiced tones, vowel-like sounds, hisses, clicks, and silence. No audio files need to be downloaded. The noise generator uses a fixed random seed.

## 3. Software Dependencies

### Running the website

- Python 3, used to serve the website locally.
- A current browser supporting:
  - Web Audio API and AudioWorklet
  - MediaRecorder and microphone access
  - IndexedDB
- A microphone for recording your own sounds. Alternatively, use audio uploads or the built-in synthetic AH/MM demo.

### Running the automated tests

- Node.js and npm. The tests were validated using Node.js 25.

The project has no third-party JavaScript package dependencies. No `npm install`, API keys, conda environment, or build step is required.

The website requests Google Fonts for typography. If those fonts are unavailable, the browser uses fallback fonts.

## 4. Run the Website

From the repository root, run:

```sh
python3 -m http.server 8000 --bind 127.0.0.1 --directory dist
```

On Windows, if `python3` is unavailable, use:

```sh
py -3 -m http.server 8000 --bind 127.0.0.1 --directory dist
```

Open the following address in your browser:

http://127.0.0.1:8000

Allow microphone access when prompted.

Use this local server rather than opening `index.html` directly. Microphone recording and AudioWorklet require a supported secure context, such as localhost or an HTTPS website.

To stop the server, press `Ctrl+C` in the terminal.

## 5. Reproduce the Automated Results

From the repository root, run:

```sh
npm test
```

This runs:

```sh
node tests/test-mouth.mjs
node tests/test-voice.mjs
```

A successful run prints a `PASS` message and a JSON summary containing `"result":"PASS"`, then exits successfully.
