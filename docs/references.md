# Research references and implementation relationship

- de Cheveigné, A., and Kawahara, H. (2002). **YIN, a fundamental frequency estimator for speech and music.** https://doi.org/10.1121/1.1458024 — repetition-based pitch estimation; the app implements a simplified YIN-style estimator.
- McAulay, R. J., and Quatieri, T. F. (1986). **Speech analysis/synthesis based on a sinusoidal representation.** https://doi.org/10.1109/TASSP.1986.1164910 — historical sinusoidal speech modeling.
- Smith, J. O. **Spectral Audio Signal Processing: Spectral Modeling Synthesis.** https://dsprelated.com/freebooks/sasp/Spectral_Modeling_Synthesis.html — harmonic/additive synthesis and time-varying sinusoidal models.
- Boersma, P., and Weenink, D. **Praat: Source-filter synthesis.** https://www.fon.hum.uva.nl/praat/manual/Source-filter_synthesis.html — an alternative model that separates excitation and vocal-tract filtering. LPC synthesis was discussed but is not implemented here.
- Südholt, D., and Erkut, C. (2023). **Vocal Timbre Effects with Differentiable Digital Signal Processing.** https://arxiv.org/abs/2306.10886 — modern vocal reconstruction and timbre processing using trained DDSP models; this app is a simpler deterministic experiment, not an implementation of their trained system.
- Yu, C.-Y., and Fazekas, G. (2024). **Differentiable Time-Varying Linear Prediction in the Context of End-to-End Analysis-by-Synthesis.** https://www.isca-archive.org/interspeech_2024/yu24b_interspeech.html — a source-filter research alternative.

These references informed discussion and method selection. The repository contains original implementation code, not copied paper figures or trained models.
