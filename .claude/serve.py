#!/usr/bin/env python3
"""Local preview server that behaves like GitHub Pages: /about serves about.html,
/ serves index.html. Usage: python3 .claude/serve.py [port]"""
import http.server, os, sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw):
        super().__init__(*a, directory=ROOT, **kw)

    def translate_path(self, path):
        p = super().translate_path(path)
        if not os.path.exists(p) and not os.path.splitext(p)[1] and os.path.exists(p + ".html"):
            return p + ".html"
        return p

if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 4599
    http.server.ThreadingHTTPServer(("", port), Handler).serve_forever()
