# Development record

The app branch preserves four implementation milestones as separate imported commits:

1. **Frequency mixer:** typed frequency/amplitude rows, harmonic presets, waveform scales, generated audio, and lowest-tone comparisons.
2. **Microphone explorer:** browser microphone permission lifecycle, muted AudioWorklet capture, live waveform, FFT spectrum, and adjustable scales.
3. **Recording and sliders:** microphone WAV capture/preview/download, offline synthesized WAV export, and live amplitude sliders.
4. **Automatic synthesis:** local YIN-style pitch analysis, windowed Fourier harmonic measurements, steady-section selection, matched/shared pitch, automatic slider filling, comparison playback, and tests.

During development, a recording-upload prototype was used to verify private reference recordings. It was removed before the automatic feature was published. The final app supports microphone recordings only. A redundant always-present result comment was also removed before publication; method details remain available in the explanatory panel.

Additional offline experiments explored designed Korean vowel spectra, extracted harmonic strengths from private recordings, and compared 100 Hz and 200 Hz synthesis. This repository retains the algorithms and prototype settings, not the personal inputs or generated voice-derived artifacts.

The imported commits document real implementation phases; they are not the original hosted-source Git repository. That repository and its deployment credentials remain separate. The final documentation and reusable command-line workflow were added when preparing this course repository.
