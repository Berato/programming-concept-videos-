# The Unlikely History of PB&J

A 103-second vintage collage animation at 1080 × 1920 and 24 fps, framed for phones. Remotion animates the paper layouts, cutout ingredients, typography, and timeline. The original collage artwork includes independent cutouts for the sandwich, tray, magazine, and jelly spoon. The historical scenes are dramatized illustrations.

The six story scenes, creator sign-off, and complete narration are in `storyboard.json`. The published cut uses Jessica with Eleven v4. The ElevenLabs workflow generates the English SRT from the storyboard. Use the model selector to generate with Eleven v4 through Text to Dialogue or Eleven v3 through Text to Speech. Each cue gets a performance prompt from `delivery.json`. The captions use the original script. `sound.py` generates the parlor cue, record scratch, and transition effects.

## Render from source

1. Run the repository’s **Generate PB&J narration** workflow. Extract its artifact into this directory so `public/narration.wav` and `captions.srt` are available.
2. Generate the effects and render with Remotion.

```sh
npm ci
python3 sound.py
npx remotion render index.jsx PBJ out/pbj-base.mp4 --concurrency=2 --crf=25
ffmpeg -i out/pbj-base.mp4 -i captions.srt -map 0:v -map 0:a -map 1:0 \
  -c:v copy -c:a aac -b:a 192k -ar 48000 -c:s mov_text \
  -af loudnorm=I=-16:TP=-1.5:LRA=8,apad -t 103 -metadata:s:a:0 language=eng \
  -metadata:s:s:0 language=eng -disposition:s:0 0 -movflags +faststart pbj-history.mp4
```

The 1901 sequence refers to Julia Davis Chandler’s published recipe for finger sandwiches with peanut paste and currant or crabapple jelly. The wartime sequence illustrates a popular account of how the ingredients became familiar to service members. The role of returning soldiers in popularizing the sandwich is difficult to document precisely.
