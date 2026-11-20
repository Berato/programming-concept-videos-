"""Generate original accent sounds and a brief parlor-style music cue."""
import random
import math
import struct
import wave

RATE = 24_000
track = [0.0] * (103 * RATE)
noise = random.Random(24)

def add(start, duration, synth, gain):
    offset = round(start * RATE)
    for i in range(round(duration * RATE)):
        t = i / RATE
        track[offset + i] += synth(t) * gain

def note(midi, t):
    phase = 2 * math.pi * 440 * 2 ** ((midi - 69) / 12) * t
    return (math.sin(phase) + .24 * math.sin(phase * 2) + .13 * math.sin(phase * 3)) * (1 - math.exp(-t * 110)) * math.exp(-t * 7)

for i, pitch in enumerate([72, 76, 79, 76, 74, 77, 81, 77, 76, 79, 84, 79]):
    add(4.09 + i * .23, .35, lambda t, n=pitch: note(n, t), .095)
    if i % 3 == 0:
        add(4.09 + i * .23, .42, lambda t, n=pitch: note(n - 24, t), .065)

add(7.03, .29, lambda t: (noise.uniform(-1, 1) * .45 + math.sin(2 * math.pi * (355 * t - 460 * t * t))) * (1 - t / .29) ** 1.75, .19)
for at in [0.12, 7.22, 10.98, 24.86, 28.2, 51.24, 56.31, 56.72, 57.14, 63.08, 73.33, 87.53]:
    add(at, .26, lambda t: (math.sin(2 * math.pi * (108 * t - 82 * t * t)) + .31 * noise.uniform(-1, 1)) * math.exp(-t * 20), .18)
for at in [10.1, 10.26, 10.42, 10.58, 10.74, 45.8, 46.48, 47.16, 47.84, 48.52, 49.2]:
    add(at, .105, lambda t: noise.uniform(-1, 1) * math.exp(-t * 56), .12)
for at in [77.18, 77.83, 78.48, 79.13, 79.78, 80.43]:
    add(at, .18, lambda t: math.sin(2 * math.pi * (275 * t - 467 * t * t)) * math.exp(-t * 21), .07)
add(85.7, .24, lambda t: math.sin(2 * math.pi * (202 * t - 360 * t * t)) * math.exp(-t * 14), .22)

with wave.open('public/effects.wav', 'wb') as output:
    output.setparams((1, 2, RATE, 0, 'NONE', 'not compressed'))
    output.writeframes(b''.join(struct.pack('<h', round(max(-1, min(1, sample)) * 32767)) for sample in track))
