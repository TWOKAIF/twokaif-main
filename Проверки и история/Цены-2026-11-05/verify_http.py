from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
import hashlib
import json
import subprocess

TASK = Path(__file__).resolve().parent


def verify(item):
    label, host, name, expected = item
    route = "/" if name == "index.html" else "/" + name
    if route.endswith("/index.html"):
        route = route[:-10]
    elif name != "404.html":
        route = route.removesuffix(".html")
    command = ["curl", "--silent", "--show-error", "--location", "--max-time", "25", "-H", "Cache-Control: no-cache"]
    if host:
        command += ["--resolve", "twokaif.ru:443:" + host]
    command += ["--write-out", "\nPRICE_HTTP_STATUS=%{http_code}", "https://twokaif.ru" + route + "?prices=20261105"]
    response = subprocess.run(command, capture_output=True, timeout=30)
    assert response.returncode == 0, response.stderr.decode()
    body, status = response.stdout.rsplit(b"\nPRICE_HTTP_STATUS=", 1)
    status = int(status)
    assert status == 200 or (name == "404.html" and status == 404), (label, name, status)
    actual = hashlib.sha256(body).hexdigest()
    assert actual == expected, (label, name, actual, expected)
    return {"target": label, "path": name, "http_status": status, "sha256": actual, "matches_prepared": True}


if __name__ == "__main__":
    items = []
    for label, host, filename in [("public", None, "manifest.json"), ("mirror", "45.146.131.204", "mirror-manifest.json")]:
        for name, item in json.loads((TASK / filename).read_text()).items():
            items.append((label, host, name, item["prepared"]))
    with ThreadPoolExecutor(max_workers=4) as pool:
        results = list(pool.map(verify, items))
    (TASK / "http-verification.json").write_text(json.dumps(results, ensure_ascii=False, indent=2) + "\n")
    print(json.dumps({"verified_https_pages": len(results), "all_sha256_match": True}))
