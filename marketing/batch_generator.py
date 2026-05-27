"""
Aunty Curl Council — Batch TikTok Video Generator
Generates TikTok videos for ALL 7 aunties in one run.

Usage:
    python batch_generator.py \
        --audio-dir /path/to/voiceovers/ \
        --output-dir /path/to/output/

Audio files should be named: ngozi.mp3, marcia.mp3, denise.mp3, etc.
"""

import argparse
import os
import sys
import time

from tqdm import tqdm

from aunty_tiktok_generator import VALID_AUNTIES, create_aunty_tiktok_video


def batch_generate(
    audio_dir: str,
    output_dir: str,
    recording_dir: str = None,
) -> dict:
    """
    Generate TikTok videos for all aunties whose audio files exist.

    Args:
        audio_dir: Directory containing aunty voiceover MP3 files
        output_dir: Directory for generated MP4 videos
        recording_dir: Optional directory with app recordings (aunty_id.mp4)

    Returns:
        Dict with 'generated', 'skipped', and 'failed' lists.
    """
    os.makedirs(output_dir, exist_ok=True)

    results = {"generated": [], "skipped": [], "failed": []}

    # Check which aunties have audio files
    available = []
    for aunty_id in VALID_AUNTIES:
        audio_path = os.path.join(audio_dir, f"{aunty_id}.mp3")
        if os.path.exists(audio_path):
            available.append((aunty_id, audio_path))
        else:
            print(f"  [skip] No audio found for {aunty_id} (expected: {audio_path})")
            results["skipped"].append(aunty_id)

    if not available:
        print("\n  ERROR: No audio files found. Nothing to generate.")
        print(f"  Expected files like: ngozi.mp3, marcia.mp3, etc. in {audio_dir}")
        return results

    print(f"\n  Found {len(available)}/{len(VALID_AUNTIES)} aunty audio files.")
    print(f"  Generating {len(available)} videos...\n")

    # Generate videos with progress bar
    start_time = time.time()

    for aunty_id, audio_path in tqdm(available, desc="  Generating", unit="video"):
        output_path = os.path.join(output_dir, f"{aunty_id}_tiktok.mp4")

        # Check for optional recording
        recording_path = None
        if recording_dir:
            candidate = os.path.join(recording_dir, f"{aunty_id}.mp4")
            if os.path.exists(candidate):
                recording_path = candidate

        try:
            create_aunty_tiktok_video(
                aunty_id=aunty_id,
                voiceover_path=audio_path,
                app_recording_path=recording_path,
                output_path=output_path,
            )
            results["generated"].append(aunty_id)
        except Exception as e:
            print(f"\n  [FAIL] {aunty_id}: {e}")
            results["failed"].append((aunty_id, str(e)))

    elapsed = time.time() - start_time

    # Summary
    print("\n" + "=" * 56)
    print("  BATCH GENERATION COMPLETE")
    print("=" * 56)
    print(f"  Generated: {len(results['generated'])}")
    print(f"  Skipped:   {len(results['skipped'])}")
    print(f"  Failed:    {len(results['failed'])}")
    print(f"  Time:      {elapsed:.0f}s ({elapsed/60:.1f} min)")
    print(f"  Output:    {output_dir}")

    if results["generated"]:
        print("\n  Videos ready:")
        for aunty_id in results["generated"]:
            path = os.path.join(output_dir, f"{aunty_id}_tiktok.mp4")
            size_mb = os.path.getsize(path) / (1024 * 1024)
            print(f"    - {path} ({size_mb:.1f} MB)")

    if results["failed"]:
        print("\n  Failures:")
        for aunty_id, error in results["failed"]:
            print(f"    - {aunty_id}: {error}")

    return results


# ── CLI ───────────────────────────────────────────────────────────

if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Batch generate TikTok videos for all Aunty Curl Council aunties"
    )
    parser.add_argument(
        "--audio-dir",
        required=True,
        help="Directory containing voiceover MP3 files (ngozi.mp3, marcia.mp3, etc.)",
    )
    parser.add_argument(
        "--output-dir",
        required=True,
        help="Directory for output MP4 files",
    )
    parser.add_argument(
        "--recording-dir",
        default=None,
        help="Optional directory with app screen recordings (aunty_id.mp4)",
    )
    args = parser.parse_args()

    print("\nAunty Curl Council — Batch TikTok Generator")
    print("=" * 56)

    results = batch_generate(
        audio_dir=args.audio_dir,
        output_dir=args.output_dir,
        recording_dir=args.recording_dir,
    )

    if results["failed"]:
        sys.exit(1)
    sys.exit(0)
