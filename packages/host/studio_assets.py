"""Public SSC Studio runtime assets for local original-board HTTP services.

Only core/UI JavaScript and CSS are exposed. Vendor SDK binaries, private
profiles, arbitrary files and directory listings are never served here.
"""
from pathlib import Path
from urllib.parse import urlsplit

def resolve_shared(module_root, request_path):
    path = urlsplit(request_path).path
    if not path.startswith('/packages/'):
        return None
    if '%' in path or '\\' in path or any(part in ('', '.', '..') for part in path[1:].split('/')):
        raise ValueError('Invalid shared asset path')
    parts = path[1:].split('/')
    if len(parts) < 3 or parts[1] not in ('core', 'ui'):
        raise ValueError('Shared asset outside public runtime')
    module_root = Path(module_root).resolve()
    base = (module_root.parent.parent / 'packages' / parts[1]).resolve()
    target = base.joinpath(*parts[2:]).resolve()
    if base not in target.parents or target.suffix not in ('.css', '.js', '.mjs') or not target.is_file():
        raise ValueError('Shared asset not found')
    return target

def serve_shared(handler, module_root, request_path):
    if not urlsplit(request_path).path.startswith('/packages/'):
        return False
    try:
        target = resolve_shared(module_root, request_path)
        body = target.read_bytes()
    except (OSError, ValueError):
        handler.send_error(404)
        return True
    handler.send_response(200)
    handler.send_header('Content-Type', 'text/css' if target.suffix == '.css' else 'text/javascript')
    handler.send_header('Content-Length', str(len(body)))
    handler.send_header('Cache-Control', 'no-store')
    handler.send_header('X-Content-Type-Options', 'nosniff')
    handler.end_headers()
    handler.wfile.write(body)
    return True
