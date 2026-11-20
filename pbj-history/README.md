# The Unlikely History of PB&J

A 90-second vintage collage animation at 1920 × 1080 and 24 fps. Remotion animates the paper layouts, cutout ingredients, typography, and timeline. The illustrations are newly generated still artwork. Historical figures and scenes are dramatized illustrations.

The six scenes and complete narration are in `storyboard.json`. The ElevenLabs workflow generates the George voice track and English SRT from the storyboard. `sound.py` generates the parlor cue, record scratch, and transition effects.

## Render from source

1. Run the repository’s **Generate PB&J narration** workflow. Extract its artifact into this directory so `public/narration.wav` and `captions.srt` are available.
2. Generate the effects and render with Remotion.

```sh
npm ci
python3 sound.py
npx remotion render index.jsx PBJ out/pbj-base.mp4 --concurrency=2
ffmpeg -i out/pbj-base.mp4 -i captions.srt -map 0:v -map 0:a -map 1:0 \
  -c:v copy -c:a copy -c:s mov_text -metadata:s:a:0 language=eng \
  -metadata:s:s:0 language=eng -disposition:s:0 0 -movflags +faststart pbj-history.mp4
```

The 1901 sequence refers to Julia Davis Chandler’s published recipe for finger sandwiches with peanut paste and currant or crabapple jelly. The wartime sequence illustrates a popular account of how the ingredients became familiar to service members. The role of returning soldiers in popularizing the sandwich is difficult to document precisely.
