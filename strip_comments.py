#!/usr/bin/env python3
"""
strip_comments.py — remove all comments from .py / .ts / .tsx / .js / .java files.

Usage:
  python strip_comments.py [path ...]   # file or directory (default: current dir)
  python strip_comments.py --dry-run    # print diffs, do not write
"""

import sys
import os
import re
import tokenize
import io
import argparse
from pathlib import Path


def _strip_python(source: str) -> str:
    out = []
    prev_type = tokenize.ENCODING
    last_row = 0
    last_col = 0

    try:
        for tok in tokenize.generate_tokens(io.StringIO(source).readline):
            t_type, t_str, (s_row, s_col), (e_row, e_col), _ = tok

            if t_type == tokenize.COMMENT:
                continue

            if t_type == tokenize.STRING and prev_type in (
                tokenize.NEWLINE, tokenize.NL, tokenize.ENCODING,
                tokenize.INDENT, tokenize.DEDENT, None,
            ):
                continue

            if s_row > last_row:
                out.append("\n" * (s_row - last_row))
                last_col = 0
                last_row = s_row
            if s_col > last_col:
                out.append(" " * (s_col - last_col))

            out.append(t_str)
            last_row, last_col = e_row, e_col

            if t_type not in (
                tokenize.NEWLINE, tokenize.NL,
                tokenize.INDENT, tokenize.DEDENT,
                tokenize.ENCODING, tokenize.ENDMARKER,
            ):
                prev_type = t_type
            else:
                prev_type = t_type

    except tokenize.TokenError:
        return source

    joined = "\n".join(line.rstrip() for line in "".join(out).split("\n"))
    return _collapse_blank_lines(joined)


def _strip_c_style(source: str) -> str:
    """Remove // line comments and /* */ block comments outside strings/template literals."""
    result = []
    i = 0
    n = len(source)
    in_str = None  # '"', "'", or '`'

    while i < n:
        c = source[i]

        if in_str:
            if c == "\\" and i + 1 < n:
                result.append(c)
                result.append(source[i + 1])
                i += 2
                continue
            if c == in_str:
                in_str = None
            result.append(c)
            i += 1
            continue

        if c in ('"', "'", "`"):
            in_str = c
            result.append(c)
            i += 1
            continue

        if c == "/" and i + 1 < n:
            nxt = source[i + 1]
            if nxt == "/":
                while i < n and source[i] != "\n":
                    i += 1
                continue
            if nxt == "*":
                i += 2
                while i < n - 1:
                    if source[i] == "*" and source[i + 1] == "/":
                        i += 2
                        break
                    i += 1
                continue

        result.append(c)
        i += 1

    return _collapse_blank_lines("".join(result))


def _collapse_blank_lines(text: str, max_blank: int = 1) -> str:
    """Replace runs of >max_blank blank lines with max_blank blank lines."""
    return re.sub(r"\n{%d,}" % (max_blank + 2), "\n" * (max_blank + 1), text)


_PROCESSORS = {
    ".py":   _strip_python,
    ".ts":   _strip_c_style,
    ".tsx":  _strip_c_style,
    ".js":   _strip_c_style,
    ".java": _strip_c_style,
}

_SKIP_DIRS = {
    "node_modules", ".git", "__pycache__", ".mypy_cache",
    "dist", "build", ".next", "venv", ".venv",
}


def process_file(path: Path, dry_run: bool) -> bool:
    suffix = path.suffix.lower()
    processor = _PROCESSORS.get(suffix)
    if processor is None:
        return False

    original = path.read_text(encoding="utf-8", errors="replace")
    stripped = processor(original)

    if stripped == original:
        return False

    if dry_run:
        print(f"[dry-run] would strip comments from {path}")
        return True

    path.write_text(stripped, encoding="utf-8")
    print(f"  stripped {path}")
    return True


def process_target(target: str, dry_run: bool) -> int:
    p = Path(target)
    count = 0
    if p.is_file():
        if process_file(p, dry_run):
            count += 1
    elif p.is_dir():
        for root, dirs, files in os.walk(p):
            dirs[:] = [d for d in dirs if d not in _SKIP_DIRS]
            for fname in files:
                fp = Path(root) / fname
                if process_file(fp, dry_run):
                    count += 1
    else:
        print(f"Warning: {target} not found", file=sys.stderr)
    return count


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("paths", nargs="*", default=["."], help="Files or directories to process")
    parser.add_argument("--dry-run", action="store_true", help="Show what would change without writing")
    args = parser.parse_args()

    total = 0
    for t in args.paths:
        total += process_target(t, args.dry_run)

    action = "would strip" if args.dry_run else "stripped"
    print(f"\nDone — {action} comments from {total} file(s).")


if __name__ == "__main__":
    main()
