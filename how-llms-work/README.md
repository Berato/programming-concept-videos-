# How Large Language Models Actually Work

This 4:10 educational animation uses Remotion for its 24 fps timeline and Three.js perspective cameras to project the rotating embedding grid and Transformer layer stack into the SVG artwork. The film is rendered directly from code at 1920 × 1080.

## Reproduce the film

Requires Node.js, Python 3, and FFmpeg with the Flite audio filter. Remotion can download its headless browser on first render.

```sh
npm ci
npm run prepare:audio
npm run studio
npm run render
```

The render is written to `out/llm-animation.mp4`. The script regenerates `captions.srt` and the narration WAV from the same cue times. The checked-in MP4 uses ElevenLabs George narration. The default local synthesis command uses Flite. To use another voice, replace `public/narration.wav` with a 250-second file aligned to those cues.

## Storyboard and visual conventions

The complete narration, onset times, and visual direction are in `storyboard.json`. Scene onsets are 0:00, 0:25, 0:55, 1:30, 2:10, 2:45, 3:20, and 3:50.

| Visual | What it represents | Where the simplification ends |
| --- | --- | --- |
| Candidate bars | Context-dependent probabilities | The film shows selected alternatives and invented numbers. A model scores its full vocabulary. |
| Token tiles and IDs | Vocabulary lookup | ID values are examples. Real segmentation and IDs depend on the tokenizer. |
| Rotating point cloud | A vector as coordinates | The points are illustrative, with no measured model embeddings. Real vectors have many more dimensions. |
| Pronoun links | One causal attention pattern | Link strengths are illustrative. Attention can include the current token, and many heads and layers contribute. A large weight does not establish a grammatical relation. |
| Transparent planes | Layers transform token vectors | The lattice points do not stand for identifiable concepts or individual neurons. Block ordering and normalization vary by architecture. |
| Training loop | Gradient-based weight updates | Loss uses the probability of the observed target. Practical training uses batches and typically predicts many next tokens in parallel. |
| Generation loop | Autoregressive decoding | Tokens can contain partial words, and implementations can reuse cached intermediate results. |

The final distribution example is a simplified three-candidate illustration. The training labels describe common stages, whose use and order vary by model.

## Replace narration with ElevenLabs

Set `ELEVENLABS_API_KEY` securely in your environment. The default voice is George and the default model is Eleven Multilingual v2. Set `ELEVENLABS_VOICE_ID` or `ELEVENLABS_MODEL_ID` to choose another voice or model. A full generation sends all 33 narration lines to ElevenLabs and uses credits from the associated account.

```sh
python3 prepare.py --provider elevenlabs
ffmpeg -i how-llms-work.mp4 -i public/narration.wav -i captions.srt \
  -map 0:v -map 1:a -map 2:0 -c:v copy -c:a aac -b:a 192k -c:s mov_text \
  -metadata:s:a:0 language=eng -metadata:s:s:0 language=eng \
  -disposition:s:0 0 -movflags +faststart how-llms-work-elevenlabs.mp4
```

The script regenerates the captions using the new utterance lengths. FFmpeg copies the original video frames while replacing the audio and caption tracks.
