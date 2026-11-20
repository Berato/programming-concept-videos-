"""Synthesize narration and produce cue-aligned audio and subtitles."""
import argparse
import json
import os
import subprocess
import tempfile
import wave
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import quote
from urllib.request import Request, urlopen

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("--provider", choices=("flite", "elevenlabs"), default="flite")
parser.add_argument("--duration", type=int, default=250)
parser.add_argument("--delivery", type=Path, help="JSON array of ElevenLabs prompts, one per cue.")
args = parser.parse_args()
if args.provider == "elevenlabs":
    api_key = os.environ.get("ELEVENLABS_API_KEY")
    if not api_key:
        parser.error("Set ELEVENLABS_API_KEY in your environment.")
    voice_id = os.environ.get("ELEVENLABS_VOICE_ID", "JBFqnCBsd6RMkjVDRZzb")
    model_id = os.environ.get("ELEVENLABS_MODEL_ID", "eleven_multilingual_v2")

scenes = json.loads(Path("storyboard.json").read_text())
cues = [cue for scene in scenes for cue in scene["cues"]]
delivery = json.loads(args.delivery.read_text()) if args.delivery else [line for _, line, _ in cues]
if len(delivery) != len(cues):
    parser.error("The delivery file must have one prompt per cue.")
rate = 48000
audio = bytearray(rate * args.duration * 2)
subtitles = []

def timestamp(seconds):
    milliseconds = round(seconds * 1000)
    minutes, rest = divmod(milliseconds, 60000)
    seconds, milliseconds = divmod(rest, 1000)
    return f"00:{minutes:02}:{seconds:02},{milliseconds:03}"

def elevenlabs_audio(line, index):
    if model_id == "eleven_v4":
        route = "text-to-dialogue"
        payload = {"inputs": [{"text": line, "voice_id": voice_id}], "model_id": model_id}
    else:
        route = f"text-to-speech/{quote(voice_id, safe='')}"
        payload = {"text": line, "model_id": model_id}
        if model_id == "eleven_v3":
            payload["voice_settings"] = {"stability": 0.5}
    request = Request(
        f"https://api.elevenlabs.io/v1/{route}?output_format=mp3_44100_128",
        data=json.dumps(payload).encode(),
        headers={"xi-api-key": api_key, "Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urlopen(request, timeout=60) as response:
            return response.read()
    except HTTPError as error:
        raise SystemExit(f"ElevenLabs failed on cue {index + 1} (HTTP {error.code}).") from None
    except (URLError, TimeoutError):
        raise SystemExit(f"Could not reach ElevenLabs for cue {index + 1}.") from None


with tempfile.TemporaryDirectory() as tmp:
    voice = Path(tmp, "line.txt")
    recording = Path(tmp, "line.mp3")
    for index, (start, line, _) in enumerate(cues):
        cmd = ["ffmpeg", "-loglevel", "error"]
        if args.provider == "elevenlabs":
            recording.write_bytes(elevenlabs_audio(delivery[index], index))
            cmd += ["-i", str(recording)]
        else:
            voice.write_text(line)
            cmd += ["-f", "lavfi", "-i", f"flite=textfile={voice}:voice=slt"]
        raw = subprocess.check_output(cmd + ["-ar", str(rate), "-f", "s16le", "-"])
        next_start = cues[index + 1][0] if index + 1 < len(cues) else args.duration
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
