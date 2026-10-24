#!/bin/zsh
# Turn a project folder from "Project Inbox" into web-ready pictures for v2.
#   scripts/prep-images.sh "Project Inbox/Kutumbh Old Age Oasis" kutumbh
# Writes v2/img/<slug>-01.jpg, -02.jpg ... (longest side 1400px, JPEG 82)
# and prints each file's size so the page can set width and height.
set -euo pipefail

src="$1"
slug="$2"
root="${0:A:h:h}"
out="$root/v2/img"

[[ -d "$src" ]] || { echo "No folder: $src" >&2; exit 1; }
[[ "$slug" =~ ^[a-z0-9-]+$ ]] || { echo "Slug must be lowercase letters, numbers, dashes: $slug" >&2; exit 1; }
mkdir -p "$out"

n=0
for f in "$src"/*(.N); do
  case "${f:e:l}" in jpg|jpeg|png|heic|webp|tif|tiff) ;; *) continue ;; esac
  n=$((n + 1))
  dest="$out/$slug-$(printf %02d $n).jpg"
  sips -s format jpeg -s formatOptions 82 -Z 1400 "$f" --out "$dest" >/dev/null
  w=$(sips -g pixelWidth "$dest" | awk '/pixelWidth/{print $2}')
  h=$(sips -g pixelHeight "$dest" | awk '/pixelHeight/{print $2}')
  printf '%s  <- %s  %sx%s  %s\n' "${dest:t}" "${f:t}" "$w" "$h" "$(du -h "$dest" | cut -f1)"
done

(( n > 0 )) || { echo "No pictures found in $src" >&2; exit 1; }
