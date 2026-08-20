(function () {
  'use strict';

  var FIELDS = ['v', 'issuer', 'issuedAt', 'subject', 'claim'];
  var VERIFY_URL = 'https://hardik-pandey.com/certify/verify.html';
  var publicKey = null;
  var verifyUrl = null;

  var statusEl = document.getElementById('certStatus');
  var inputEl = document.getElementById('certInput');
  var verifyBtn = document.getElementById('certVerifyBtn');
  var hintEl = document.getElementById('certHint');
  var cardEl = document.getElementById('certCard');
  var subjectEl = document.getElementById('certSubject');
  var claimEl = document.getElementById('certClaim');
  var issuedAtEl = document.getElementById('certIssuedAt');
  var issuerEl = document.getElementById('certIssuer');
  var idEl = document.getElementById('certId');
  var sigCheckEl = document.getElementById('certSigCheck');
  var fingerprintEl = document.getElementById('certFingerprint');
  var qrCanvas = document.getElementById('certQr');
  var verifyUrlEl = document.getElementById('certVerifyUrl');
  var printBtn = document.getElementById('certPrintBtn');

  function setStatus(type, html) {
    statusEl.className = 'cert-status show ' + type;
    statusEl.textContent = '';
    var strong = document.createElement('strong');
    strong.textContent = html;
    statusEl.appendChild(strong);
  }

  function clearStatus() {
    statusEl.className = 'cert-status';
    statusEl.textContent = '';
  }

  function b64urlToBytes(s) {
    s = s.replace(/-/g, '+').replace(/_/g, '/');
    while (s.length % 4) s += '=';
    var bin = atob(s);
    var u = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
    return u;
  }

  function bytesToHex(u) {
    var out = '';
    for (var i = 0; i < u.length; i++) out += u[i].toString(16).padStart(2, '0');
    return out;
  }

  function sha256hex(str) {
    return crypto.subtle.digest('SHA-256', new TextEncoder().encode(str)).then(function (buf) {
      return bytesToHex(new Uint8Array(buf));
    });
  }

  function getPublicKey() {
    if (publicKey) return Promise.resolve(publicKey);
    return fetch('public-key.json').then(function (r) {
      if (!r.ok) throw new Error('Could not load the site public key.');
      return r.json();
    }).then(function (o) {
      publicKey = o;
      return o;
    });
  }

  function canonicalPayload(c) {
    var o = {};
    for (var i = 0; i < FIELDS.length; i++) o[FIELDS[i]] = c[FIELDS[i]];
    return JSON.stringify(o);
  }

  function parseUrlInput() {
    var params = new URLSearchParams(window.location.search);
    if (params.has('id')) {
      var id = params.get('id');
      if (!/^[0-9a-f]{16}$/.test(id)) throw new Error('Invalid certificate ID in URL.');
      return { mode: 'id', id: id };
    }
    if (params.has('c')) return { mode: 'c', data: params.get('c') };
    return null;
  }

  function loadCert(input) {
    if (input.mode === 'id') {
      return fetch('issued/' + input.id + '.json').then(function (r) {
        if (!r.ok) throw new Error('No certificate with ID ' + input.id + ' is hosted on this site.');
        return r.json();
      });
    }
    var dec = new TextDecoder();
    return Promise.resolve(JSON.parse(dec.decode(b64urlToBytes(input.data))));
  }

  function verifyCert(certObj) {
    var missing = [];
    for (var i = 0; i < FIELDS.length; i++) {
      if (!(FIELDS[i] in certObj)) missing.push(FIELDS[i]);
    }
    if (!('id' in certObj)) missing.push('id');
    if (!('sig' in certObj)) missing.push('sig');
    if (missing.length) throw new Error('Certificate is missing fields: ' + missing.join(', '));

    var payload = canonicalPayload(certObj);
    return sha256hex(payload).then(function (hash) {
      var idOk = hash.slice(0, 16) === certObj.id;
      return getPublicKey().then(function (pub) {
        var sigOk = false;
        try {
          sigOk = PQ.ml_dsa87.verify(
            b64urlToBytes(certObj.sig),
            new TextEncoder().encode(payload),
            b64urlToBytes(pub.key)
          );
        } catch (e) {
          sigOk = false;
        }
        return { certObj: certObj, idOk: idOk, sigOk: sigOk };
      });
    });
  }

  function renderValid(result) {
    var c = result.certObj;
    var reason = [];
    if (result.idOk) reason.push('ID hash matches');
    else reason.push('ID hash does NOT match');
    if (result.sigOk) reason.push('ML-DSA-87 signature valid');
    else reason.push('ML-DSA-87 signature INVALID');
    setStatus(result.idOk && result.sigOk ? 'valid' : 'invalid', reason.join(' \u00b7 '));

    if (!(result.idOk && result.sigOk)) {
      cardEl.classList.remove('show');
      return;
    }

    subjectEl.textContent = c.subject;
    claimEl.textContent = c.claim;
    issuedAtEl.textContent = c.issuedAt;
    issuerEl.textContent = c.issuer;
    idEl.textContent = c.id;
    sigCheckEl.textContent = 'ML-DSA-87 \u2713 valid';
    fingerprintEl.textContent = hashOf(c.id);

    verifyUrl = VERIFY_URL + '?id=' + c.id;
    verifyUrlEl.textContent = verifyUrl;

    renderQr(verifyUrl);
    cardEl.classList.add('show');
  }

  function hashOf(id) {
    return id + ' (SHA-256 prefix of the signed claims)';
  }

  function renderQr(text) {
    var qr = QRCode(0, 'M');
    qr.addData(text);
    qr.make();
    var n = qr.getModuleCount();
    var size = 140;
    var cell = size / n;
    var ctx = qrCanvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = '#000000';
    for (var row = 0; row < n; row++) {
      for (var col = 0; col < n; col++) {
        if (qr.isDark(row, col)) ctx.fillRect(col * cell, row * cell, cell, cell);
      }
    }
  }

  function run(certObj) {
    clearStatus();
    setStatus('loading', 'Verifying signature\u2026');
    verifyCert(certObj).then(function (result) {
      renderValid(result);
    }).catch(function (err) {
      setStatus('invalid', err.message);
      cardEl.classList.remove('show');
    });
  }

  verifyBtn.addEventListener('click', function () {
    var raw = inputEl.value.trim();
    if (!raw) {
      setStatus('invalid', 'Paste a certificate JSON to verify it.');
      return;
    }
    try {
      run(JSON.parse(raw));
    } catch (e) {
      setStatus('invalid', 'The pasted text is not valid JSON.');
    }
  });

  printBtn.addEventListener('click', function () {
    window.print();
  });

  var auto = null;
  try {
    auto = parseUrlInput();
  } catch (e) {
    setStatus('invalid', e.message);
  }
  if (auto) {
    hintEl.textContent = auto.mode === 'id'
      ? 'Verifying hosted certificate ' + auto.id + '\u2026'
      : 'Verifying certificate embedded in this link\u2026';
    loadCert(auto).then(run).catch(function (err) {
      setStatus('invalid', err.message);
    });
  }
})();