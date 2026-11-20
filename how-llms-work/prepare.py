"""Synthesize narration and produce cue-aligned audio and subtitles."""
import json
import subprocess
import tempfile
import wave
from pathlib import Path

scenes = json.loads(Path("storyboard.json").read_text())
cues = [cue for scene in scenes for cue in scene["cues"]]
rate = 48000
audio = bytearray(rate * 250 * 2)
subtitles = []

def timestamp(seconds):
    milliseconds = round(seconds * 1000)
    minutes, rest = divmod(milliseconds, 60000)
    seconds, milliseconds = divmod(rest, 1000)
    return f"00:{minutes:02}:{seconds:02},{milliseconds:03}"

with tempfile.TemporaryDirectory() as tmp:
    voice = Path(tmp, "line.txt")
    for index, (start, line, _) in enumerate(cues):
        voice.write_text(line)
        source = f"flite=textfile={voice}:voice=slt"
        cmd = ["ffmpeg", "-loglevel", "error", "-f", "lavfi", "-i", source]
        raw = subprocess.check_output(cmd + ["-ar", str(rate), "-f", "s16le", "-"])
        next_start = cues[index + 1][0] if index + 1 < len(cues) else 250
        window = next_start - start - .35
        if len(raw) / (rate * 2) > window:
            tempo = len(raw) / (rate * 2) / window * 1.03
            raw = subprocess.check_output(cmd + ["-af", f"atempo={tempo:.5f}", "-ar", str(rate), "-f", "s16le", "-"])
        offset = round(start * rate) * 2
        assert len(raw) <= (next_start - start) * rate * 2, line
        audio[offset:offset + len(raw)] = raw
        subtitles.append(f"{index + 1}\n{timestamp(start)} --> {timestamp(start + len(raw) / (rate * 2))}\n{line}\n")
Path("public").mkdir(exist_ok=True)
with wave.open("public/narration.wav", "wb") as output:
    output.setparams((1, 2, rate, 0, "NONE", "not compressed"))
    output.writeframes(audio)
Path("captions.srt").write_text("\n".join(subtitles))
