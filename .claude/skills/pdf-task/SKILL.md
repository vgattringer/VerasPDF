---
name: pdf-task
description: Common pypdf patterns (merge, split, rotate, extract text) for this project. Use when implementing or changing PDF operations.
---

Use `pypdf` (`PdfReader`, `PdfWriter`).

- Merge: `writer = PdfWriter()`, then `writer.append(path)` for each input, then `writer.write(out)`.
- Split: iterate `reader.pages`, add each page to its own `PdfWriter`, write one file per page.
- Rotate: `page.rotate(90)` (multiples of 90) before adding to the writer.
- Extract text: `page.extract_text()`.

Always open output files in `'wb'` mode, and never overwrite the input file in place.
After editing, run `ruff format .` and `ruff check .`.
