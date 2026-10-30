# Offline research workflow

These scripts preserve the earlier vowel-analysis experiment. They are optional command-line research tools; the website accepts microphone recordings only.

Use Python 3.10 or later:

```sh
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python estimate_pitch.py /path/to/private/recordings/*.wav --output results/pitch.json
python extract_harmonics.py results/pitch.json --recordings /path/to/private/recordings --output results --start 1.5 --end 2.8
```

Inputs must be 16-bit PCM WAV files. Stereo is averaged to mono. Use unique input filenames. Choose a sustained vowel interval away from its beginning and ending. Pitch analysis resamples to 16 kHz and uses an 80 ms difference-function window with a 20 ms hop. Extraction takes median harmonic-band magnitudes and samples the resulting envelope at 24 harmonics of 100 and 200 Hz. The outputs include pitch frames, amplitude recipes, spectrum plots, and reconstructed WAVs. It does not copy the original recordings.

The offline scripts preserve the early experiment: their pitch range is about 50–500 Hz and their extraction window and normalization differ from the final browser implementation. The browser DSP and its tests are the reference for the deployed feature. A harmonic approximation omits noise and changing articulation; interpolating an envelope onto another pitch is approximate.

`prototypes/korean-vowel-settings.json` contains the initial manually chosen slider settings, not measurements of a particular speaker. The source code and technical methods are included in Git; personal recordings and generated results are excluded. Keep results under this `results/` directory and recordings outside the repository or under `data/private/`.
