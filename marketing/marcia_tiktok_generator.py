"""
Aunty Curl Council — Marcia TikTok Video Generator
Produces a 1080x1920 9:16 vertical MP4 ready for TikTok upload.

Usage:
    python marcia_tiktok_generator.py \
        --audio /Users/thomas/Desktop/marcia.mp3 \
        [--recording /Users/thomas/Desktop/app_demo.mp4] \
        [--output /Users/thomas/Desktop/marcia_tiktok.mp4]
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
    concatenate_videoclips,
)
from moviepy.video.fx.fadein import fadein
from moviepy.video.fx.fadeout import fadeout

# ── Canvas constants ──────────────────────────────────────────────
W, H = 1080, 1920
FPS = 30
BG_COLOR = (0, 0, 0)          # pure black
TEXT_COLOR = (255, 255, 255)   # pure white
ACCENT_COLOR = (212, 175, 55)  # warm gold — matches Marcia's brand
PADDING = 80                   # px from edges

# ── Timing map (seconds) ─────────────────────────────────────────
# Adjust these if you want tighter sync with the actual voiceover pacing.
SEGMENTS = [
    # (start, end, text, font_size, is_headline)
    (0.0,  3.0,  "Your hair\nstopped growing.",         72, True),
    (3.0,  7.5,  "Your scalp is itchy.\nYour edges are thinning.",  54, False),
    (7.5,  13.0, "Healthy hair\nstarts at your roots.",            62, True),
    (13.0, 19.5, "I'm Aunty Marcia\nfrom the Caribbean.\n\nThe app sees your hair,\nunderstands your scalp,\nbuilds your growth plan.", 44, False),
    (19.5, 24.0, "JBCO",                                 90, True),
    (24.0, 27.5, "Rice water rinses",                    72, True),
    (27.5, 31.0, "Scalp massage",                        72, True),
    (31.0, 36.0, "Everything personalized\nto your routine.",       54, False),
    (36.0, 45.0, "Download\nAunty Curl Council\non the App Store",  58, True),
]


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
    # PIL built-in fallback (no size control)
    print(f"  [warn] No TTF found — using PIL default font (text may look small)")
    return ImageFont.load_default()


def make_text_frame(
    text: str,
    font_size: int,
    is_headline: bool,
    width: int = W,
    height: int = H,
    bg: tuple = BG_COLOR,
    fg: tuple = TEXT_COLOR,
    accent: tuple = ACCENT_COLOR,
) -> np.ndarray:
    """Render centered white text on a black frame, return as numpy RGB array."""
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

        # Subtle gold shadow on headlines
        if is_headline:
            draw.text((x + 2, y + 2), line, font=font, fill=(80, 60, 10))
        draw.text((x, y), line, font=font, fill=fg)

    # Thin gold bottom bar on headlines
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
    fade_dur: float = 0.35,
) -> ImageClip:
    duration = end - start
    frame = make_text_frame(text, font_size, is_headline)
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

    # Scale to fit width or height, preserve aspect ratio
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

def create_marcia_tiktok_video(
    marcia_voiceover_path: str,
    app_recording_path: str = None,
    output_path: str = "/Users/thomas/Desktop/marcia_tiktok.mp4",
) -> str:
    # ── Validate inputs ──
    if not os.path.exists(marcia_voiceover_path):
        raise FileNotFoundError(
            f"Voiceover not found: {marcia_voiceover_path}\n"
            "Download the Marcia MP3 from ElevenLabs and provide the correct path."
        )

    use_recording = False
    if app_recording_path:
        if os.path.exists(app_recording_path):
            use_recording = True
            print(f"  [ok] App recording found: {app_recording_path}")
        else:
            print(f"  [warn] App recording not found at {app_recording_path} — using text overlays instead.")

    print(f"  [ok] Audio: {marcia_voiceover_path}")
    print(f"  [ok] Output: {output_path}")
    os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)

    # ── Load audio ──
    audio = AudioFileClip(marcia_voiceover_path)
    audio_duration = audio.duration
    video_duration = audio_duration + 2.0  # 2s hold on final frame
    print(f"  [ok] Audio duration: {audio_duration:.1f}s → video: {video_duration:.1f}s")

    # ── Scale timing to actual audio length ──
    # Original timing assumes ~43s script; scale if actual audio differs
    script_end = SEGMENTS[-1][1]
    time_scale = audio_duration / script_end if script_end > 0 else 1.0
    scaled = [
        (s * time_scale, e * time_scale, txt, size, headline)
        for s, e, txt, size, headline in SEGMENTS
    ]

    # ── Build clips ──
    clips = []

    # Black base layer
    base = ColorClip(size=(W, H), color=BG_COLOR).set_duration(video_duration)
    clips.append(base)

    # If app recording is provided, insert it in the "Aunty Marcia intro" window (segments 3–4)
    if use_recording:
        rec_start = scaled[3][0]
        rec_end = scaled[4][1]
        try:
            rec_clip = build_app_recording_segment(app_recording_path, rec_start, rec_end)
            clips.append(rec_clip)
            # Skip segments 3 and 4 (replaced by recording)
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
        # Cap end at video_duration
        end = min(end, video_duration)
        if end <= start:
            continue
        clip = build_text_segment(start, end, text, font_size, is_headline)
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
    parser = argparse.ArgumentParser(description="Generate Marcia TikTok video")
    parser.add_argument("--audio", required=True, help="Path to Marcia MP3 voiceover")
    parser.add_argument("--recording", default=None, help="Optional path to app screen recording")
    parser.add_argument(
        "--output",
        default="/Users/thomas/Desktop/marcia_tiktok.mp4",
        help="Output MP4 path",
    )
    args = parser.parse_args()

    print("\nAunty Curl Council — TikTok Video Generator")
    print("=" * 48)

    try:
        result = create_marcia_tiktok_video(
            marcia_voiceover_path=args.audio,
            app_recording_path=args.recording,
            output_path=args.output,
        )
        print(f"\nReady to upload: {result}")
        sys.exit(0)
    except FileNotFoundError as e:
        print(f"\nERROR: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"\nUnexpected error: {e}")
        raise
