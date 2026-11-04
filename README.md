# DSC 180 — Quarter 1

Course projects and reproducible technical workflows.

| Project | Branch | Contents |
|---|---|---|
| Harmonic Lab | [app/harmonic-lab](https://github.com/Miny-oung-K/dsc-180-q1/tree/app/harmonic-lab) | Frequency mixer, microphone sound explorer, WAV recording/export, and automatic vowel synthesis |
| Between — Mouth Sounds | [app/between-mouth-sounds](https://github.com/Miny-oung-K/dsc-180-q1/tree/app/between-mouth-sounds) | Two mouth recordings, continuous sound morphing, local persistence, Start over, and synthetic audio tests |
| Air Violin — Sound Sculptor | [app/air-violin](https://github.com/Miny-oung-K/dsc-180-q1/tree/app/air-violin) | Camera-controlled violin, clickable strings and chords, harmonic mixer, and musical note trail |

## Contribution Statement
All three websites were created through prompting on ChatGPT/Codex. My contribution included defining the website's purpose, writing prompts, testing the website, and providing feedback to refine its behavior. ChatGPT generated the website's code, including the interface, audio-processing algorithms, automated tests, and tehcnical documentation.

# Harmonic Lab — DSC 180 Quarter 1 Project

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

Users generate data by entering frequencies and amplitudes. For the vowel experiments, users record their own voice through the application's microphone controls. The website accepts microphone recordings only; it does not have a recording-upload feature.

To collect vowel data:

1. Open the application using the instructions below.
2. Scroll to **Automatic vowel synthesis**.
3. Press **Record a vowel** and allow microphone access.
4. Hold a vowel steadily in a quiet room.
5. Analyze the recording and download the original recording, synthesized WAV, and analysis/settings JSON.

Audio processing takes place locally in the browser. Recordings are temporary until downloaded and may be lost when the page closes or a new recording is made. Downloaded files are saved to the location selected by the browser.

Personal voice recordings are not included in this public repository. To keep local copies within the project, use `data/private/`, which is excluded from Git.

## 3. Software dependencies

### Browser application

- Node.js version 20 or newer, including npm.
- A current browser supporting Web Audio, AudioWorklet, Web Workers, and microphone access.
- A microphone for recording experiments.
- Headphones are recommended when comparing sounds.

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


## 5. Reproducibility and limitations

The automated tests provide repeatable checks using known synthetic inputs. Microphone experiments reproduce the procedure, but new recordings will not produce identical numerical results.

Automatic vowel synthesis uses a steady harmonic approximation. It does not reconstruct all breath noise, changing articulation, or the opening glide in ㅠ. Pitch estimates can fail on noisy or unstable recordings.

The drawn filter only reduces existing frequency components. It cannot create frequencies absent from the starting sound. It affects the main synthesized mix; original microphone recordings and the automatic vowel reference preview remain unfiltered.

Further technical details are available in `docs/workflow.md`, `docs/development.md`, and `docs/references.md` at the repository root on this branch.

## Air Violin — Sound Sculptor

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

Camera mode uses live webcam frames to identify hand and facial gestures. These frames are processed on the user's device and are not recorded, uploaded, or saved. Musical note history is stored temporarily in browser memory and is cleared when the page reloads.

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

A webcam is required only for camera mode. Clickable-string mode works without one.

The project uses HTML, CSS, and JavaScript without a build step. No Python packages or npm packages need to be installed. A conda environment or Docker container is not required.

Check that the required command-line tools are available:

```sh
python3 --version
node --version
npm --version
git --version
```

On Windows, if `python3` is unavailable, use the `py -3` command in its place.

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

This checks JavaScript syntax and runs tests covering:

- Note frequencies and string-position calculations.
- Musical staff pitch mapping.
- Harmonic amplitude mixtures and normalization.
- Polyphonic voice creation, release, and stopping.
- The normal → harmonic → off selection cycle.
- Top-to-soft and bottom-to-bright timbre mapping.
- Smoothing and preservation of the fundamental frequency.

The command should exit successfully and print `PASS` messages.

These tests validate calculations and audio-control logic. They do not replace a live webcam test or a listening check.

### 7. Limitations

Gesture recognition depends on lighting, camera framing, and hand visibility. The sound is synthesized and violin-inspired; it is not a physical simulation of a violin. The harmonic-touch feature approximates an octave harmonic by raising pitch and reducing upper partials.

The musical staff is a temporary pitch sketch, not an exported score or a measurement of note duration.

Third-party libraries, models, and fonts require network access. The MediaPipe library version is pinned, but externally hosted resources may become unavailable.

# Between: Mouth Sound Morphing

Between is a browser-based application that records two mouth-made sounds and synthesizes a continuous sound between them. Moving a slider changes the synthesized sound’s characteristics.

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

For interactive use, users provide their own data by recording two mouth sounds through a microphone or uploading audio recordings. For example:

- Sound A: a sustained “AH”
- Sound B: a sustained “MM”

Record each sound for approximately 1–2 seconds. For this example, use a similar pitch and microphone distance for both recordings.

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

The tests check that:

- Voiced sounds, hisses, and clicks can be analyzed.
- Silent recordings are rejected.
- The synthesizer produces finite, sustained output.
- Slider changes work for voiced and unvoiced sound pairs.
- Adding silence around a synthetic vowel does not materially change its extracted characteristics.
- The synthetic AH-to-MM transition progressively reduces the ratio of upper-harmonic energy to lower-harmonic energy.

A successful run prints a `PASS` message and a JSON summary containing `"result":"PASS"`, then exits successfully.

These tests generate their inputs in memory and print their results to the terminal. They do not create output audio files.

## 6. Method and Limitations

The application selects an audible section of each recording and builds a sustained sound model.

For two voiced sounds, it estimates pitch and harmonic amplitudes, interpolates those characteristics, and synthesizes a single harmonic sound.

For pairs containing an unvoiced sound, it analyzes spectral energy and moves corresponding frequency samples between the two sound models.

The output is a synthesized approximation. It does not simulate the physical mouth, reproduce complete sentences, or preserve the recordings’ original timing. The slider endpoints are sustained reconstructions rather than exact recording replays.

The automated tests verify signal-processing behavior. They do not establish that every intermediate sound is perceptually realistic. Microphone permissions, browser storage, reload behavior, and the reset button require separate browser checks.
