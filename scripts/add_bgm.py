#!/usr/bin/env python3
"""
TsuriSpot BGM Generator + Video Combiner
numpy + scipy でBGM生成、MoviePyでビデオに合成
著作権フリー（プロシージャル生成音源）
"""

import os
import math
import time
import wave
import struct
import numpy as np
from scipy import signal as sig
from moviepy import VideoFileClip, AudioFileClip, CompositeAudioClip

SR = 44100  # Sample rate
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(SCRIPT_DIR)
VIDEO_DIR = os.path.join(PROJECT_DIR, "sns-videos")
TEMP_DIR = os.path.join(VIDEO_DIR, "temp_audio")
os.makedirs(TEMP_DIR, exist_ok=True)


# ============================================================
#  SOUND SYNTHESIS
# ============================================================

def sine(freq, duration, sr=SR):
    t = np.linspace(0, duration, int(sr * duration), endpoint=False)
    return np.sin(2 * np.pi * freq * t)

def square_wave(freq, duration, sr=SR):
    t = np.linspace(0, duration, int(sr * duration), endpoint=False)
    return np.sign(np.sin(2 * np.pi * freq * t)) * 0.5

def saw_wave(freq, duration, sr=SR):
    t = np.linspace(0, duration, int(sr * duration), endpoint=False)
    return 2 * (t * freq - np.floor(0.5 + t * freq)) * 0.5

def noise(duration, sr=SR):
    return np.random.randn(int(sr * duration))

def envelope(samples, attack=0.005, decay=0.1, sustain=0.3, release=0.1):
    """ADSR envelope."""
    n = len(samples)
    env = np.ones(n)
    a = int(attack * SR)
    d = int(decay * SR)
    r = int(release * SR)
    # Attack
    if a > 0:
        env[:a] = np.linspace(0, 1, a)
    # Decay
    if d > 0 and a + d < n:
        env[a:a+d] = np.linspace(1, sustain, d)
    # Sustain
    if a + d < n - r:
        env[a+d:n-r] = sustain
    # Release
    if r > 0:
        env[n-r:] = np.linspace(sustain, 0, r)
    return samples * env

def exp_decay(samples, rate=10.0):
    t = np.linspace(0, len(samples) / SR, len(samples), endpoint=False)
    return samples * np.exp(-rate * t)

def lowpass(samples, cutoff, sr=SR):
    nyq = sr / 2
    b, a = sig.butter(4, min(cutoff / nyq, 0.99), btype='low')
    return sig.lfilter(b, a, samples)

def highpass(samples, cutoff, sr=SR):
    nyq = sr / 2
    b, a = sig.butter(4, min(cutoff / nyq, 0.99), btype='high')
    return sig.lfilter(b, a, samples)

def bandpass(samples, low, high, sr=SR):
    nyq = sr / 2
    b, a = sig.butter(3, [min(low/nyq, 0.99), min(high/nyq, 0.99)], btype='band')
    return sig.lfilter(b, a, samples)

def distort(samples, gain=3.0):
    return np.tanh(samples * gain)


# ============================================================
#  DRUM SOUNDS
# ============================================================

def kick(duration=0.3):
    t = np.linspace(0, duration, int(SR * duration), endpoint=False)
    # Pitch drops from 150Hz to 50Hz
    freq = 150 * np.exp(-t * 20) + 50
    phase = np.cumsum(2 * np.pi * freq / SR)
    s = np.sin(phase) * np.exp(-t * 8)
    # Add click
    click = noise(0.005) * np.exp(-np.linspace(0, 1, int(SR * 0.005)) * 30)
    s[:len(click)] += click * 0.3
    return s * 0.9

def snare(duration=0.2):
    t = np.linspace(0, duration, int(SR * duration), endpoint=False)
    # Body (sine)
    body = np.sin(2 * np.pi * 200 * t) * np.exp(-t * 25)
    # Noise
    n = noise(duration) * np.exp(-t * 15)
    n = highpass(n, 2000)
    return (body * 0.4 + n * 0.6) * 0.7

def hihat(duration=0.06, open_hat=False):
    d = 0.15 if open_hat else duration
    t = np.linspace(0, d, int(SR * d), endpoint=False)
    n = noise(d)
    n = bandpass(n, 6000, 16000)
    decay_rate = 8 if open_hat else 40
    return n * np.exp(-t * decay_rate) * 0.4

def clap(duration=0.15):
    t = np.linspace(0, duration, int(SR * duration), endpoint=False)
    n = noise(duration)
    n = bandpass(n, 1000, 8000)
    # Multiple attacks for clap feel
    env = np.zeros(len(t))
    for offset in [0, 0.01, 0.02]:
        idx = int(offset * SR)
        remaining = len(t) - idx
        if remaining > 0:
            env[idx:] += np.exp(-np.linspace(0, 1, remaining) * 20)
    return n * env * 0.5


# ============================================================
#  MELODIC SOUNDS
# ============================================================

def synth_pluck(freq, duration=0.3):
    s = saw_wave(freq, duration) + sine(freq * 2, duration) * 0.3
    s = lowpass(s, 3000)
    return exp_decay(s, 6) * 0.35

def synth_pad(freq, duration=1.0):
    s = sine(freq, duration) + sine(freq * 1.005, duration) + sine(freq * 0.995, duration)
    s = s / 3
    return envelope(s, attack=0.1, decay=0.2, sustain=0.6, release=0.2) * 0.2

def synth_bass(freq, duration=0.25):
    s = square_wave(freq, duration) + sine(freq, duration)
    s = lowpass(s, 800)
    return exp_decay(s, 4) * 0.5

def synth_lead(freq, duration=0.2):
    s = saw_wave(freq, duration) * 0.5 + sine(freq, duration) * 0.5
    s = lowpass(s, 5000)
    return envelope(s, 0.01, 0.05, 0.4, 0.05) * 0.3


# ============================================================
#  SFX
# ============================================================

def sfx_whoosh(duration=0.3, direction='up'):
    t = np.linspace(0, duration, int(SR * duration), endpoint=False)
    n = noise(duration) * 0.5
    if direction == 'up':
        cutoff = 500 + 8000 * (t / duration)
    else:
        cutoff = 8500 - 8000 * (t / duration)
    # Apply time-varying filter by chunks
    chunk = int(SR * 0.01)
    filtered = np.zeros_like(n)
    for i in range(0, len(n), chunk):
        end = min(i + chunk, len(n))
        cf = cutoff[min(i, len(cutoff)-1)]
        filtered[i:end] = lowpass(n[i:end], cf)
    return filtered * np.exp(-t * 3) * 0.6

def sfx_impact(duration=0.3):
    k = kick(duration)
    n = noise(0.05) * exp_decay(noise(0.05), 30) * 0.3
    result = np.zeros(int(SR * duration))
    result[:len(k)] += k
    result[:len(n)] += n
    return result * 0.8

def sfx_rise(duration=1.0):
    t = np.linspace(0, duration, int(SR * duration), endpoint=False)
    freq = 200 + 3000 * (t / duration) ** 2
    phase = np.cumsum(2 * np.pi * freq / SR)
    s = np.sin(phase) * (t / duration) * 0.3
    n = noise(duration) * (t / duration) * 0.1
    n = highpass(n, 3000)
    return s + n

def sfx_ding(duration=0.5):
    """Notification/achievement ding."""
    s = sine(880, duration) + sine(1320, duration) * 0.5 + sine(1760, duration) * 0.25
    return exp_decay(s / 3, 5) * 0.4

def sfx_boing(duration=0.3):
    """Cartoon spring sound."""
    t = np.linspace(0, duration, int(SR * duration), endpoint=False)
    freq = 300 + 500 * np.sin(t * 30) * np.exp(-t * 8)
    phase = np.cumsum(2 * np.pi * freq / SR)
    return np.sin(phase) * np.exp(-t * 10) * 0.4

def sfx_record_scratch(duration=0.2):
    t = np.linspace(0, duration, int(SR * duration), endpoint=False)
    freq = 2000 - 1800 * (t / duration)
    phase = np.cumsum(2 * np.pi * freq / SR)
    s = np.sin(phase) + noise(duration) * 0.5
    return s * np.exp(-t * 10) * 0.3


# ============================================================
#  PATTERN SEQUENCER
# ============================================================

def place(buffer, sample, position_sec):
    """Place a sample at a position in the buffer."""
    idx = int(position_sec * SR)
    end = min(idx + len(sample), len(buffer))
    if idx < 0 or idx >= len(buffer):
        return
    buf_len = end - idx
    buffer[idx:end] += sample[:buf_len]

def beat_time(beat, bpm):
    return beat * 60.0 / bpm

def create_drum_loop(duration, bpm, style='energetic'):
    """Create a drum pattern."""
    buf = np.zeros(int(SR * duration))
    beats_per_bar = 4
    beat_dur = 60.0 / bpm

    total_beats = int(duration / beat_dur) + 1

    for b in range(total_beats):
        t = b * beat_dur
        beat_in_bar = b % beats_per_bar

        if style == 'energetic':
            # Kick: 1, 3 (and 2.5 for energy)
            if beat_in_bar in [0, 2]:
                place(buf, kick(), t)
            if beat_in_bar == 1 and b > 4:
                place(buf, kick(0.15), t + beat_dur * 0.5)
            # Snare: 2, 4
            if beat_in_bar in [1, 3]:
                place(buf, snare(), t)
            # Hi-hat: every 8th
            place(buf, hihat(), t)
            place(buf, hihat(), t + beat_dur * 0.5)
            # Open hat on upbeats occasionally
            if beat_in_bar == 3 and (b // 4) % 2 == 1:
                place(buf, hihat(open_hat=True), t + beat_dur * 0.5)

        elif style == 'chill':
            if beat_in_bar in [0, 2]:
                place(buf, kick(0.25), t)
            if beat_in_bar in [1, 3]:
                place(buf, snare(), t)
                place(buf, clap(), t)
            # Hi-hat every 8th, softer
            place(buf, hihat() * 0.6, t)
            place(buf, hihat() * 0.4, t + beat_dur * 0.5)

        elif style == 'dramatic':
            if beat_in_bar == 0:
                place(buf, kick(), t)
            if beat_in_bar == 2:
                place(buf, kick(0.2), t)
            if beat_in_bar in [1, 3]:
                place(buf, clap(), t)
            if b % 2 == 0:
                place(buf, hihat() * 0.5, t)

        elif style == 'hype':
            # Fast and punchy
            place(buf, kick(0.15), t)
            if beat_in_bar in [1, 3]:
                place(buf, snare(), t)
            # Rapid hi-hats (16ths)
            for sub in range(4):
                ht = t + sub * beat_dur * 0.25
                vol = 0.7 if sub == 0 else 0.4
                place(buf, hihat(0.04) * vol, ht)

    return np.clip(buf, -1, 1)

def create_bassline(duration, bpm, notes, style='bounce'):
    """Create a bass line from note list. Each note: (beat, freq, length_beats)."""
    buf = np.zeros(int(SR * duration))
    beat_dur = 60.0 / bpm

    for beat, freq, length in notes:
        t = beat * beat_dur
        d = length * beat_dur
        if style == 'bounce':
            s = synth_bass(freq, d)
        else:
            s = sine(freq, d) * 0.4
            s = lowpass(s, 500)
            s = exp_decay(s, 2)
        place(buf, s, t)
    return buf

def create_melody(duration, bpm, notes):
    """notes: list of (beat, freq, length_beats)."""
    buf = np.zeros(int(SR * duration))
    beat_dur = 60.0 / bpm
    for beat, freq, length in notes:
        t = beat * beat_dur
        d = length * beat_dur
        s = synth_lead(freq, d)
        place(buf, s, t)
    return buf

def create_pad(duration, bpm, chords):
    """chords: list of (beat, [freq1, freq2, freq3], length_beats)."""
    buf = np.zeros(int(SR * duration))
    beat_dur = 60.0 / bpm
    for beat, freqs, length in chords:
        t = beat * beat_dur
        d = length * beat_dur
        for f in freqs:
            s = synth_pad(f, d)
            place(buf, s, t)
    return buf


# ============================================================
#  NOTE FREQUENCIES
# ============================================================

# C major scale
C3, D3, E3, F3, G3, A3, B3 = 130.81, 146.83, 164.81, 174.61, 196.00, 220.00, 246.94
C4, D4, E4, F4, G4, A4, B4 = 261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88
C5, D5, E5 = 523.25, 587.33, 659.25

# Common chord frequencies
CHORD_C = [C3, E3, G3]
CHORD_G = [G3, B3, D4]
CHORD_Am = [A3, C4, E4]
CHORD_F = [F3, A3, C4]
CHORD_Dm = [D3, F3, A3]
CHORD_Em = [E3, G3, B3]


# ============================================================
#  BGM GENERATORS (per video style)
# ============================================================

def bgm_energetic(duration, bpm=130):
    """Upbeat, energetic BGM for hype videos."""
    drums = create_drum_loop(duration, bpm, 'energetic')
    beat = 60.0 / bpm
    bars = int(duration / (beat * 4)) + 1

    # Bass: I-V-vi-IV progression
    bass_notes = []
    melody_notes = []
    chords = []
    for bar in range(bars):
        b = bar * 4
        chord_idx = bar % 4
        bass_freq = [C3, G3, A3, F3][chord_idx]
        chord = [CHORD_C, CHORD_G, CHORD_Am, CHORD_F][chord_idx]

        bass_notes.extend([(b, bass_freq, 1), (b + 2, bass_freq, 1)])
        chords.append((b, chord, 4))

        # Simple catchy melody
        if chord_idx == 0:
            melody_notes.extend([(b, E4, 0.5), (b + 0.5, G4, 0.5), (b + 1, C5, 1)])
        elif chord_idx == 1:
            melody_notes.extend([(b, D4, 0.5), (b + 0.5, G4, 1), (b + 2, B4, 0.5)])
        elif chord_idx == 2:
            melody_notes.extend([(b, C4, 0.5), (b + 0.5, E4, 0.5), (b + 1, A4, 1)])
        elif chord_idx == 3:
            melody_notes.extend([(b, A3, 0.5), (b + 0.5, C4, 0.5), (b + 1.5, F4, 1)])

    bass = create_bassline(duration, bpm, bass_notes)
    mel = create_melody(duration, bpm, melody_notes)
    pad = create_pad(duration, bpm, chords)

    mix = drums * 0.55 + bass * 0.35 + mel * 0.20 + pad * 0.15
    return np.clip(mix, -1, 1)

def bgm_chill(duration, bpm=100):
    """Chill, groovy BGM."""
    drums = create_drum_loop(duration, bpm, 'chill')
    beat = 60.0 / bpm
    bars = int(duration / (beat * 4)) + 1

    bass_notes = []
    chords = []
    for bar in range(bars):
        b = bar * 4
        chord_idx = bar % 4
        bass_freq = [C3, F3, G3, C3][chord_idx]
        chord = [CHORD_C, CHORD_F, CHORD_G, CHORD_C][chord_idx]

        bass_notes.extend([(b, bass_freq, 2), (b + 2.5, bass_freq * 1.5, 1)])
        chords.append((b, chord, 4))

    bass = create_bassline(duration, bpm, bass_notes, 'smooth')
    pad = create_pad(duration, bpm, chords)

    mix = drums * 0.45 + bass * 0.3 + pad * 0.25
    return np.clip(mix, -1, 1)

def bgm_dramatic(duration, bpm=110):
    """Dramatic, building BGM."""
    drums = create_drum_loop(duration, bpm, 'dramatic')
    beat = 60.0 / bpm
    bars = int(duration / (beat * 4)) + 1

    bass_notes = []
    chords = []
    for bar in range(bars):
        b = bar * 4
        chord_idx = bar % 4
        bass_freq = [A3, F3, C3, G3][chord_idx]
        chord = [CHORD_Am, CHORD_F, CHORD_C, CHORD_G][chord_idx]
        bass_notes.append((b, bass_freq, 4))
        chords.append((b, chord, 4))

    bass = create_bassline(duration, bpm, bass_notes, 'smooth')
    pad = create_pad(duration, bpm, chords)

    # Build intensity over time
    t = np.linspace(0, 1, int(SR * duration))
    intensity = 0.4 + 0.6 * t  # Gets louder

    mix = (drums * 0.5 + bass * 0.3 + pad * 0.3) * intensity
    return np.clip(mix, -1, 1)

def bgm_hype(duration, bpm=140):
    """High-energy hype BGM for rankings/reveals."""
    drums = create_drum_loop(duration, bpm, 'hype')
    beat = 60.0 / bpm
    bars = int(duration / (beat * 4)) + 1

    bass_notes = []
    melody_notes = []
    for bar in range(bars):
        b = bar * 4
        ci = bar % 4
        bf = [E3, E3, A3, B3][ci]
        bass_notes.extend([(b, bf, 0.5), (b + 1, bf, 0.5), (b + 2, bf, 0.5), (b + 3, bf, 0.5)])

        # Aggressive melody
        mf = [E4, G4, A4, B4][ci]
        melody_notes.extend([(b, mf, 0.25), (b + 0.5, mf * 1.25, 0.25), (b + 1, mf, 0.5)])

    bass = create_bassline(duration, bpm, bass_notes)
    mel = create_melody(duration, bpm, melody_notes)

    mix = drums * 0.6 + bass * 0.35 + mel * 0.15
    return np.clip(mix, -1, 1)


# ============================================================
#  ADD SFX TO BGM
# ============================================================

def add_sfx(bgm, sfx_events):
    """sfx_events: list of (time_sec, sfx_array)."""
    buf = bgm.copy()
    for t, sfx in sfx_events:
        place(buf, sfx, t)
    return np.clip(buf, -1, 1)


# ============================================================
#  PER-VIDEO BGM + SFX CONFIGURATION
# ============================================================

def bgm_video_01(dur):  # Aruaru - funny energetic
    bgm = bgm_energetic(dur, 128)
    sfx = [
        (0.0, sfx_impact()),
        (1.3, sfx_whoosh()),
        (3.5, sfx_boing()),
        (5.7, sfx_boing()),
        (7.9, sfx_boing()),
        (10.1, sfx_boing()),
        (12.3, sfx_ding()),
    ]
    return add_sfx(bgm, sfx)

def bgm_video_02(dur):  # Quiz - dramatic + dings
    bgm = bgm_dramatic(dur, 115)
    sfx = [
        (0.0, sfx_impact()),
        (2.0, sfx_rise(1.0)),
        (2.7, sfx_ding()),
        (5.0, sfx_rise(1.0)),
        (5.7, sfx_ding()),
        (8.0, sfx_rise(1.0)),
        (8.7, sfx_ding()),
        (11.0, sfx_rise(1.0)),
        (11.7, sfx_ding()),
        (13.2, sfx_impact()),
    ]
    return add_sfx(bgm, sfx)

def bgm_video_03(dur):  # 5000yen - hype
    bgm = bgm_hype(dur, 135)
    sfx = [
        (0.0, sfx_impact()),
        (1.0, sfx_whoosh()),
        (2.8, sfx_impact()),
        (4.6, sfx_impact()),
        (6.4, sfx_impact()),
        (8.2, sfx_impact()),
        (10.0, sfx_ding()),
    ]
    return add_sfx(bgm, sfx)

def bgm_video_04(dur):  # Time map - chill
    bgm = bgm_chill(dur, 100)
    sfx = [
        (0.0, sfx_impact()),
        (1.3, sfx_whoosh()),
        (5.3, sfx_ding()),
    ]
    return add_sfx(bgm, sfx)

def bgm_video_05(dur):  # Winter - dramatic to warm
    bgm = bgm_dramatic(dur, 108)
    sfx = [
        (0.0, sfx_impact()),
        (1.0, sfx_record_scratch()),
        (2.5, sfx_whoosh(direction='up')),
        (9.1, sfx_ding()),
    ]
    return add_sfx(bgm, sfx)

def bgm_video_06(dur):  # Neighbor fishing - energetic mystery
    bgm = bgm_energetic(dur, 125)
    sfx = [
        (0.0, sfx_impact()),
        (1.5, sfx_whoosh()),
        (3.7, sfx_whoosh()),
        (5.9, sfx_whoosh()),
        (8.1, sfx_whoosh()),
        (10.3, sfx_whoosh()),
        (12.5, sfx_ding()),
    ]
    return add_sfx(bgm, sfx)

def bgm_video_07(dur):  # Ranking - hype build
    bgm = bgm_hype(dur, 132)
    sfx = [
        (0.0, sfx_impact()),
        (1.3, sfx_whoosh()),
        (3.5, sfx_whoosh()),
        (5.7, sfx_whoosh()),
        (7.9, sfx_whoosh()),
        (10.1, sfx_rise(1.5)),
        (12.3, sfx_impact()),
        (12.3, sfx_ding()),
    ]
    return add_sfx(bgm, sfx)

def bgm_video_08(dur):  # Calendar speed - energetic fast
    bgm = bgm_energetic(dur, 140)
    sfx = [
        (0.0, sfx_impact()),
        (10.5, sfx_ding()),
    ]
    return add_sfx(bgm, sfx)

def bgm_video_09(dur):  # Girlfriend - chill funny
    bgm = bgm_chill(dur, 105)
    sfx = [
        (0.0, sfx_impact()),
        (1.3, sfx_record_scratch()),
        (2.5, sfx_whoosh()),
        (9.7, sfx_ding()),
    ]
    return add_sfx(bgm, sfx)

def bgm_video_10(dur):  # Features - dramatic reveal
    bgm = bgm_dramatic(dur, 118)
    sfx = [
        (0.0, sfx_impact()),
        (1.3, sfx_whoosh()),
        (3.3, sfx_whoosh()),
        (5.3, sfx_whoosh()),
        (7.3, sfx_whoosh()),
        (9.3, sfx_ding()),
    ]
    return add_sfx(bgm, sfx)


# ============================================================
#  WAV EXPORT + VIDEO COMBINE
# ============================================================

def save_wav(filename, audio_mono, sr=SR):
    """Save mono audio as stereo WAV."""
    audio = np.clip(audio_mono, -1, 1)
    # Stereo: slight delay for width
    left = audio
    delay_samples = int(0.0003 * sr)  # ~0.3ms
    right = np.zeros_like(audio)
    right[delay_samples:] = audio[:-delay_samples] if delay_samples > 0 else audio
    # Interleave
    stereo = np.column_stack([left, right])
    int16 = (stereo * 30000).astype(np.int16)

    with wave.open(filename, 'w') as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(sr)
        w.writeframes(int16.tobytes())

def combine_video_audio(video_path, audio_path, output_path):
    """Combine video + audio using MoviePy."""
    video = VideoFileClip(video_path)
    audio = AudioFileClip(audio_path)
    # Trim audio to video duration
    if audio.duration > video.duration:
        audio = audio.subclipped(0, video.duration)
    result = video.with_audio(audio)
    result.write_videofile(output_path, codec="libx264", audio_codec="aac",
                          preset="medium", bitrate="5000k", logger=None)
    video.close()
    audio.close()
    result.close()


# ============================================================
#  MAIN
# ============================================================

VIDEOS = [
    ("01_aruaru", bgm_video_01),
    ("02_fish_quiz", bgm_video_02),
    ("03_5000yen", bgm_video_03),
    ("04_best_time", bgm_video_04),
    ("05_winter", bgm_video_05),
    ("06_neighbor", bgm_video_06),
    ("07_ranking", bgm_video_07),
    ("08_calendar", bgm_video_08),
    ("09_girlfriend", bgm_video_09),
    ("10_features", bgm_video_10),
]

def main():
    print(f"\n{'='*60}")
    print(f" TsuriSpot BGM Generator")
    print(f" Adding BGM + SFX to {len(VIDEOS)} videos")
    print(f"{'='*60}\n")

    total_start = time.time()

    for i, (name, bgm_fn) in enumerate(VIDEOS):
        video_path = os.path.join(VIDEO_DIR, f"{name}.mp4")
        if not os.path.exists(video_path):
            print(f"[{i+1}/{len(VIDEOS)}] SKIP {name} (not found)")
            continue

        print(f"[{i+1}/{len(VIDEOS)}] {name}...")

        # Get video duration
        v = VideoFileClip(video_path)
        dur = v.duration
        v.close()

        # Generate BGM
        start = time.time()
        audio = bgm_fn(dur)
        wav_path = os.path.join(TEMP_DIR, f"{name}_bgm.wav")
        save_wav(wav_path, audio)
        print(f"  -> BGM generated ({time.time()-start:.1f}s)")

        # Combine
        start2 = time.time()
        output_path = os.path.join(VIDEO_DIR, f"{name}_bgm.mp4")
        combine_video_audio(video_path, wav_path, output_path)
        print(f"  -> Combined ({time.time()-start2:.1f}s)")

    # Cleanup temp
    import shutil
    shutil.rmtree(TEMP_DIR, ignore_errors=True)

    total = time.time() - total_start
    print(f"\nAll done in {total:.0f}s")
    print(f"Output: {VIDEO_DIR}/*_bgm.mp4")


if __name__ == "__main__":
    main()
