# Aunty Curl Council — Marketing Video Generator

Generate TikTok-ready 9:16 vertical videos for all 7 Aunty Curl Council characters.

## Setup

```bash
pip install -r requirements.txt
brew install ffmpeg  # macOS — or apt install ffmpeg on Linux
```

## Generate a Single Aunty Video

```bash
python aunty_tiktok_generator.py \
    --aunty marcia \
    --audio /path/to/marcia.mp3 \
    --output /path/to/marcia_tiktok.mp4
```

Optional: include an app screen recording overlay:

```bash
python aunty_tiktok_generator.py \
    --aunty ngozi \
    --audio /path/to/ngozi.mp3 \
    --recording /path/to/app_demo.mp4 \
    --output /path/to/ngozi_tiktok.mp4
```

Available aunties: `ngozi`, `marcia`, `denise`, `fatou`, `carmen`, `amara`, `salma`

## Batch Generate All 7

```bash
python batch_generator.py \
    --audio-dir /path/to/voiceovers/ \
    --output-dir /path/to/output/
```

Expected audio file names in `--audio-dir`:
- `ngozi.mp3`
- `marcia.mp3`
- `denise.mp3`
- `fatou.mp3`
- `carmen.mp3`
- `amara.mp3`
- `salma.mp3`

Aunties whose audio files are missing will be skipped with a warning.

Optional: provide app recordings per aunty:

```bash
python batch_generator.py \
    --audio-dir /path/to/voiceovers/ \
    --output-dir /path/to/output/ \
    --recording-dir /path/to/recordings/
```

## Audio Requirements

- Format: MP3 (AAC also works)
- Recommended length: 40-50 seconds
- Content: voiceover script matching the aunty's segment timing
- The generator auto-scales segment timing to match actual audio duration

## Output Specs

- Resolution: 1080x1920 (9:16 vertical)
- Codec: H.264 (libx264)
- Bitrate: ~6 Mbps video, 192 kbps audio
- Format: MP4
- Frame rate: 30 fps
- Typical file size: 15-30 MB per video

## File Structure

| File | Purpose |
|------|---------|
| `aunty_tiktok_generator.py` | Main generator — works for any aunty |
| `batch_generator.py` | Generate all 7 aunties in one run |
| `content_templates.py` | Colors, scripts, hooks, CTAs for all aunties |
| `marcia_tiktok_generator.py` | Original Marcia-only generator (legacy) |
| `requirements.txt` | Python dependencies |
