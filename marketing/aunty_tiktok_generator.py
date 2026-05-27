"""
Aunty Curl Council — Generalized TikTok Video Generator
Produces 1080x1920 9:16 vertical MP4 videos for ANY aunty.

Usage:
    python aunty_tiktok_generator.py \
        --aunty marcia \
        --audio /path/to/marcia.mp3 \
        [--recording /path/to/app_demo.mp4] \
        [--output /path/to/output.mp4]

Supported aunties: ngozi, marcia, denise, fatou, carmen, amara, salma
"""

import argparse
import os
import sys
import textwrap

import numpy as np
from PIL import Image, ImageDraw, ImageFont
from moviepy.editor import (
    AudioFileClip,
    ColorClip,
    CompositeVideoClip,
    ImageClip,
    VideoFileClip,
)
from moviepy.video.fx.fadein import fadein
from moviepy.video.fx.fadeout import fadeout

from content_templates import AUNTY_COLORS, AUNTY_SCRIPTS

# ── Canvas constants ──────────────────────────────────────────────
W, H = 1080, 1920
FPS = 30
BG_COLOR = (0, 0, 0)
TEXT_COLOR = (255, 255, 255)
PADDING = 80

VALID_AUNTIES = list(AUNTY_SCRIPTS.keys())


# ── Font helpers ──────────────────────────────────────────────────

def _load_font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    """Load a system font, falling back gracefully."""
    candidates_bold = [
        "/System/Library/Fonts/HelveticaNeue-Bold.otf",
        "/System/Library/Fonts/Helvetica.ttc",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
    ]
    candidates_regular = [
        "/System/Library/Fonts/HelveticaNeue.otf",
        "/System/Library/Fonts/Helvetica.ttc",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    ]
    paths = candidates_bold if bold else candidates_regular
    for path in paths:
        if os.path.exists(path):
            try:
                return ImageFont.truetype(path, size)
            except Exception:
                continue
    print("  [warn] No TTF found — using PIL default font (text may look small)")
    return ImageFont.load_default()


def make_text_frame(
    text: str,
    font_size: int,
    is_headline: bool,
    accent: tuple,
    width: int = W,
    height: int = H,
    bg: tuple = BG_COLOR,
    fg: tuple = TEXT_COLOR,
) -> np.ndarray:
    """Render centered white text on a black frame with aunty-specific accent."""
    img = Image.new("RGB", (width, height), bg)
    draw = ImageDraw.Draw(img)
    font = _load_font(font_size, bold=is_headline)

    # Wrap each line independently to respect \n
    max_chars = max(1, int((width - PADDING * 2) / (font_size * 0.55)))
    lines = []
    for raw_line in text.split("\n"):
        if raw_line.strip() == "":
            lines.append("")
        else:
            wrapped = textwrap.wrap(raw_line, width=max_chars) or [""]
            lines.extend(wrapped)

    line_height = font_size * 1.35
    total_height = line_height * len(lines)
    y_start = (height - total_height) / 2

    for i, line in enumerate(lines):
        if not line:
            continue
        bbox = draw.textbbox((0, 0), line, font=font)
        text_w = bbox[2] - bbox[0]
        x = (width - text_w) / 2
        y = y_start + i * line_height

        # Subtle accent shadow on headlines
        if is_headline:
            shadow_color = tuple(max(0, c // 3) for c in accent)
            draw.text((x + 2, y + 2), line, font=font, fill=shadow_color)
        draw.text((x, y), line, font=font, fill=fg)

    # Thin accent bottom bar on headlines
    if is_headline:
        bar_y = int(height * 0.88)
        draw.rectangle(
            [(width // 2 - 60, bar_y), (width // 2 + 60, bar_y + 3)],
            fill=accent,
        )

    return np.array(img)


# ── Segment builders ──────────────────────────────────────────────

def build_text_segment(
    start: float,
    end: float,
    text: str,
    font_size: int,
    is_headline: bool,
    accent: tuple,
    fade_dur: float = 0.35,
) -> ImageClip:
    """Build a single text overlay clip with fade transitions."""
    duration = end - start
    frame = make_text_frame(text, font_size, is_headline, accent=accent)
    clip = (
        ImageClip(frame)
        .set_duration(duration)
        .set_start(start)
    )
    clip = fadein(clip, fade_dur)
    if duration > fade_dur * 2:
        clip = fadeout(clip, fade_dur)
    return clip


def build_app_recording_segment(
    path: str,
    start: float,
    end: float,
) -> CompositeVideoClip:
    """Scale app recording to fit inside 9:16 canvas with black bars."""
    duration = end - start
    vid = VideoFileClip(path).subclip(0, min(duration, VideoFileClip(path).duration))

    vid_w, vid_h = vid.size
    scale_w = W / vid_w
    scale_h = H / vid_h
    scale = min(scale_w, scale_h)
    new_w = int(vid_w * scale)
    new_h = int(vid_h * scale)
    vid = vid.resize((new_w, new_h))

    bg = ColorClip(size=(W, H), color=BG_COLOR).set_duration(duration)
    vid = vid.set_position("center").set_start(0)
    composite = CompositeVideoClip([bg, vid]).set_start(start)
    composite = fadein(composite, 0.4)
    composite = fadeout(composite, 0.4)
    return composite


# ── Main builder ──────────────────────────────────────────────────

def create_aunty_tiktok_video(
    aunty_id: str,
    voiceover_path: str,
    app_recording_path: str = None,
    output_path: str = None,
) -> str:
    """
    Generate a TikTok video for the specified aunty.

    Args:
        aunty_id: One of ngozi, marcia, denise, fatou, carmen, amara, salma
        voiceover_path: Path to aunty's voiceover MP3
        app_recording_path: Optional path to app screen recording
        output_path: Output MP4 path (defaults to ./{aunty_id}_tiktok.mp4)

    Returns:
        Path to the generated MP4 file.
    """
    aunty_id = aunty_id.lower().strip()
    if aunty_id not in VALID_AUNTIES:
        raise ValueError(
            f"Unknown aunty: '{aunty_id}'. "
            f"Valid options: {', '.join(VALID_AUNTIES)}"
        )

    if output_path is None:
        output_path = f"./{aunty_id}_tiktok.mp4"

    accent = AUNTY_COLORS[aunty_id]
    segments = AUNTY_SCRIPTS[aunty_id]

    # ── Validate inputs ──
    if not os.path.exists(voiceover_path):
        raise FileNotFoundError(
            f"Voiceover not found: {voiceover_path}\n"
            f"Provide the correct path to {aunty_id}'s MP3 voiceover."
        )

    use_recording = False
    if app_recording_path:
        if os.path.exists(app_recording_path):
            use_recording = True
            print(f"  [ok] App recording found: {app_recording_path}")
        else:
            print(f"  [warn] App recording not found at {app_recording_path} — using text overlays instead.")

    print(f"  [ok] Aunty: {aunty_id.capitalize()}")
    print(f"  [ok] Accent color: RGB{accent}")
    print(f"  [ok] Audio: {voiceover_path}")
    print(f"  [ok] Output: {output_path}")
    os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)

    # ── Load audio ──
    audio = AudioFileClip(voiceover_path)
    audio_duration = audio.duration
    video_duration = audio_duration + 2.0  # 2s hold on final frame
    print(f"  [ok] Audio duration: {audio_duration:.1f}s -> video: {video_duration:.1f}s")

    # ── Scale timing to actual audio length ──
    script_end = segments[-1][1]
    time_scale = audio_duration / script_end if script_end > 0 else 1.0
    scaled = [
        (s * time_scale, e * time_scale, txt, size, headline)
        for s, e, txt, size, headline in segments
    ]

    # ── Build clips ──
    clips = []

    # Black base layer
    base = ColorClip(size=(W, H), color=BG_COLOR).set_duration(video_duration)
    clips.append(base)

    # If app recording is provided, insert during aunty intro (segments 3-4)
    if use_recording:
        rec_start = scaled[3][0]
        rec_end = scaled[4][1]
        try:
            rec_clip = build_app_recording_segment(app_recording_path, rec_start, rec_end)
            clips.append(rec_clip)
            skip_indices = {3, 4}
        except Exception as e:
            print(f"  [warn] Could not include recording: {e} — falling back to text.")
            use_recording = False
            skip_indices = set()
    else:
        skip_indices = set()

    # Text overlay clips
    for i, (start, end, text, font_size, is_headline) in enumerate(scaled):
        if i in skip_indices:
            continue
        end = min(end, video_duration)
        if end <= start:
            continue
        clip = build_text_segment(start, end, text, font_size, is_headline, accent=accent)
        clips.append(clip)

    # ── Compose and export ──
    print("  Compositing video...")
    final = CompositeVideoClip(clips, size=(W, H)).set_duration(video_duration)
    final = final.set_audio(audio)

    print("  Rendering MP4 (this takes ~1-2 min)...")
    final.write_videofile(
        output_path,
        fps=FPS,
        codec="libx264",
        audio_codec="aac",
        bitrate="6000k",
        audio_bitrate="192k",
        preset="fast",
        threads=4,
        verbose=False,
        logger=None,
    )

    audio.close()
    final.close()

    size_mb = os.path.getsize(output_path) / (1024 * 1024)
    print(f"\n  Done! {output_path} ({size_mb:.1f} MB)")
    return output_path


# ── CLI ───────────────────────────────────────────────────────────

if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Generate a TikTok video for any Aunty Curl Council aunty"
    )
    parser.add_argument(
        "--aunty",
        required=True,
        choices=VALID_AUNTIES,
        help="Which aunty to generate for",
    )
    parser.add_argument("--audio", required=True, help="Path to voiceover MP3")
    parser.add_argument("--recording", default=None, help="Optional app screen recording")
    parser.add_argument("--output", default=None, help="Output MP4 path")
    args = parser.parse_args()

    print(f"\nAunty Curl Council — TikTok Video Generator ({args.aunty.capitalize()})")
    print("=" * 56)

    try:
        result = create_aunty_tiktok_video(
            aunty_id=args.aunty,
            voiceover_path=args.audio,
            app_recording_path=args.recording,
            output_path=args.output,
        )
        print(f"\nReady to upload: {result}")
        sys.exit(0)
    except (FileNotFoundError, ValueError) as e:
        print(f"\nERROR: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"\nUnexpected error: {e}")
        raise
