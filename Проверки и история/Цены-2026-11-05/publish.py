from pathlib import Path
import base64
import hashlib
import json
import shlex
import socket
import subprocess

TASK = Path(__file__).resolve().parent
assert set(socket.gethostbyname_ex("twokaif.ru")[2]) == {"213.165.41.1"}
assert set(socket.gethostbyname_ex("www.twokaif.ru")[2]) == {"213.165.41.1"}

REMOTE = r'''
from pathlib import Path
from datetime import datetime, timezone
import base64, hashlib, json, os, shutil, sys, tempfile

root = Path('/var/www/twokaif')
payload = json.load(sys.stdin)
for name, item in payload.items():
    assert not Path(name).is_absolute() and '..' not in Path(name).parts
    assert hashlib.sha256((root/name).read_bytes()).hexdigest() == item['before'], 'Live file changed: '+name
    assert hashlib.sha256(base64.b64decode(item['body'])).hexdigest() == item['prepared'], name
backup = Path('/var/backups/twokaif')/('pricing-'+datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%SZ'))
backup.mkdir(parents=True, mode=0o700)
metadata = {}
for name in payload:
    source = root/name
    stat = source.stat()
    metadata[name] = {'mode':stat.st_mode&0o777, 'uid':stat.st_uid, 'gid':stat.st_gid}
    saved = backup/name
    saved.parent.mkdir(parents=True, exist_ok=True, mode=0o700)
    shutil.copy2(source, saved)
    saved.chmod(0o600)
(backup/'manifest.json').write_text(json.dumps({name:{k:v for k,v in item.items() if k!='body'} for name,item in payload.items()},indent=2)+'\n')
(backup/'metadata.json').write_text(json.dumps(metadata,indent=2)+'\n')

def install(name, body):
    destination = root/name
    fd, temp = tempfile.mkstemp(dir=destination.parent, prefix='.pricing-')
    with os.fdopen(fd,'wb') as f:
        f.write(body)
        f.flush()
        os.fsync(f.fileno())
    st = metadata[name]
    os.chmod(temp, st['mode'])
    os.chown(temp, st['uid'], st['gid'])
    os.replace(temp, destination)

installed = []
try:
    # The same assets and script URLs remain in place; secondary documents first.
    for name in sorted(payload, key=lambda name: name == 'index.html'):
        assert hashlib.sha256((root/name).read_bytes()).hexdigest() == payload[name]['before'], name
        install(name, base64.b64decode(payload[name]['body']))
        installed.append(name)
    for name,item in payload.items():
        assert hashlib.sha256((root/name).read_bytes()).hexdigest() == item['prepared'], name
except Exception:
    for name in reversed(installed):
        install(name, (backup/name).read_bytes())
    raise
print(json.dumps({'backup':str(backup),'files':{name:hashlib.sha256((root/name).read_bytes()).hexdigest() for name in payload},'nginx_changed':False,'service_restart':False}))
'''

for label, host, folder, manifest_name in [
    ("live", "213.165.41.1", "site-release", "manifest.json"),
    ("mirror", "45.146.131.204", "mirror-release", "mirror-manifest.json"),
]:
    manifest = json.loads((TASK/manifest_name).read_text())
    payload = {}
    for name, item in manifest.items():
        body = (TASK/folder/name).read_bytes()
        assert hashlib.sha256(body).hexdigest() == item['prepared'], name
        payload[name] = {**item, "body": base64.b64encode(body).decode()}
    response = subprocess.run(
        ['ssh','-i',str(Path.home()/'.ssh/twokaif_aeza'),'-o','BatchMode=yes','-o','ConnectTimeout=10','root@'+host,'python3 -c '+shlex.quote(REMOTE)],
        input=json.dumps(payload), capture_output=True, text=True, timeout=55,
    )
    if response.returncode:
        raise SystemExit(response.stderr)
    result = {"host":host, **json.loads(response.stdout)}
    (TASK/(label+'-deployment.json')).write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps({"target":label,"host":host,"backup":result['backup'],"verified_files":len(result['files'])}),flush=True)
