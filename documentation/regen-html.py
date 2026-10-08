#!/usr/bin/env python3
"""Render documentation/changelog.html dari CHANGELOG.md + _changelog.template.html.

Hasilnya satu file HTML self-contained (markdown di-inline), bisa dibuka offline.
Jalankan setiap kali CHANGELOG.md berubah (wajib saat rilis):

    python3 documentation/regen-html.py
"""
import pathlib
import re

HERE = pathlib.Path(__file__).resolve().parent
ROOT = HERE.parent

CHANGELOG_TEMPLATE = HERE / "_changelog.template.html"
CHANGELOG_OUT = HERE / "changelog.html"
CHANGELOG = HERE / "CHANGELOG.md"

BUILD_GRADLE = ROOT / "android" / "app" / "build.gradle"


def guard_no_script(md, name):
    if "</script" in md.lower():
        raise SystemExit(f"{name} contains a literal </script — cannot inline safely")
    return md


# Batas panjang teks tombol "Salin" per rilis di changelog.html (termasuk newline & titik).
CHANGELOG_COPY_LIMIT = 1500


def guard_changelog_copy_length(md):
    """Tolak build kalau catatan rilis mana pun, saat disalin lewat tombol "Salin"
    di changelog.html, melebihi CHANGELOG_COPY_LIMIT karakter (termasuk newline &
    titik). Mereplikasi persis parse + copyTextFor() di _changelog.template.html:
    heading rilis + nama kategori + bullet (markdown dibuang, item multi-baris
    digabung 1 spasi), kategori tanpa isi dilewati, 1 baris kosong antar kategori."""

    def plain(s):
        s = re.sub(r"`([^`]+)`", r"\1", s)
        s = re.sub(r"\*\*([^*]+?)\*\*", r"\1", s)
        return re.sub(r"(^|[\s(])_([^_\s][^_]*?)_(?=$|[\s.,;:)])", r"\1\2", s)

    releases, rel, sec, item, seen_h1 = [], None, None, None, False
    for ln in md.replace("\r\n", "\n").replace("\r", "\n").split("\n"):
        t = ln.strip()
        h3 = re.match(r"^###\s+(.*)$", t)
        li = re.match(r"^\s*[-*]\s+(.*)$", ln)
        if re.match(r"^#\s+", t):
            seen_h1 = True
        elif t.startswith("## "):
            if rel:
                releases.append(rel)
            rel = {"title": t[3:].strip(), "date": None, "sections": []}
            sec = item = None
        elif h3 and rel:
            sec = {"name": h3.group(1).strip(), "items": []}
            rel["sections"].append(sec)
            item = None
        elif li and rel and sec:
            item = plain(li.group(1).strip())
            sec["items"].append(item)
        elif item is not None and re.match(r"^\s{2,}\S", ln) and rel and sec:
            sec["items"][-1] += " " + plain(t)
        elif not t:
            item = None
        elif rel and not rel["sections"] and rel["date"] is None and seen_h1:
            dm = re.match(r"^_(.+?)_$", t)
            if dm and re.search(r"\d", dm.group(1)):
                rel["date"] = dm.group(1).strip()
    if rel:
        releases.append(rel)

    over = []
    for r in releases:
        m = re.match(r"^v?([0-9][0-9.]*)", r["title"], re.I)
        head = "TosmFi " + ("v" + m.group(1) if m else r["title"])
        if r["date"]:
            head += " — " + r["date"]
        out = [head, ""]
        for s in r["sections"]:
            if not s["items"]:
                continue
            out.append(s["name"])
            out += ["- " + it for it in s["items"]]
            out.append("")
        n = len("\n".join(out).strip() + "\n")
        label = re.sub(r"\s*\(versionCode.*\)$", "", r["title"])
        print(f"  changelog Salin: {label:<16} {n:>5} / {CHANGELOG_COPY_LIMIT}")
        if n > CHANGELOG_COPY_LIMIT:
            over.append((r["title"], n))
    if over:
        msg = "\n".join(f"  {title}: {n} > {CHANGELOG_COPY_LIMIT}" for title, n in over)
        raise SystemExit("CHANGELOG.md — teks tombol Salin melebihi batas, ringkas dulu:\n" + msg)


def apk_name():
    """Nama file APK release terbaru, dibaca dari android/app/build.gradle."""
    try:
        g = BUILD_GRADLE.read_text(encoding="utf-8")
        vn = re.search(r'versionName\s+"([^"]+)"', g)
        vc = re.search(r"versionCode\s+(\d+)", g)
        if vn and vc:
            return f"TosmFi-v{vn.group(1)}({vc.group(1)})-release.apk"
    except OSError:
        pass
    return ""


changelog_md = guard_no_script(CHANGELOG.read_text(encoding="utf-8"), CHANGELOG.name)
guard_changelog_copy_length(changelog_md)
changelog_html = (
    CHANGELOG_TEMPLATE.read_text(encoding="utf-8")
    .replace("@@APK_NAME@@", apk_name())
    .replace("@@DOC@@", changelog_md)
)
CHANGELOG_OUT.write_text(changelog_html, encoding="utf-8")
print(f"wrote {CHANGELOG_OUT.relative_to(ROOT)} ({len(changelog_html):,} bytes)")
