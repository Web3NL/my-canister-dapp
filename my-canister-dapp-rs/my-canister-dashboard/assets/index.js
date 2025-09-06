var __typeError = (msg) => {
  throw TypeError(msg);
};
var __accessCheck = (obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg);
var __privateGet = (obj, member, getter) => (__accessCheck(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
var __privateAdd = (obj, member, value) => member.has(obj) ? __typeError("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
var __privateSet = (obj, member, value, setter) => (__accessCheck(obj, member, "write to private field"), setter ? setter.call(obj, value) : member.set(obj, value), value);
var __privateWrapper = (obj, member, setter, getter) => ({
  set _(value) {
    __privateSet(obj, member, value, setter);
  },
  get _() {
    return __privateGet(obj, member, getter);
  }
});
var _inner, _expirationTime, _rawKey, _derKey, _a2, _currentInterval, _randomizationFactor, _multiplier, _maxInterval, _startTime, _maxElapsedTime, _maxIterations, _date, _count, _rawKey2, _derKey2;
(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) return;
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) processPreload(link);
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") continue;
      for (const node of mutation.addedNodes) if (node.tagName === "LINK" && node.rel === "modulepreload") processPreload(node);
    }
  }).observe(document, {
    childList: true,
    subtree: true
  });
  function getFetchOpts(link) {
    const fetchOpts = {};
    if (link.integrity) fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials") fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
    else fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep) return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
})();
var ReplicaRejectCode;
(function(ReplicaRejectCode2) {
  ReplicaRejectCode2[ReplicaRejectCode2["SysFatal"] = 1] = "SysFatal";
  ReplicaRejectCode2[ReplicaRejectCode2["SysTransient"] = 2] = "SysTransient";
  ReplicaRejectCode2[ReplicaRejectCode2["DestinationInvalid"] = 3] = "DestinationInvalid";
  ReplicaRejectCode2[ReplicaRejectCode2["CanisterReject"] = 4] = "CanisterReject";
  ReplicaRejectCode2[ReplicaRejectCode2["CanisterError"] = 5] = "CanisterError";
})(ReplicaRejectCode || (ReplicaRejectCode = {}));
var QueryResponseStatus;
(function(QueryResponseStatus2) {
  QueryResponseStatus2["Replied"] = "replied";
  QueryResponseStatus2["Rejected"] = "rejected";
})(QueryResponseStatus || (QueryResponseStatus = {}));
function isV2ResponseBody(body) {
  return body !== null && body !== void 0 && "reject_code" in body;
}
function isV3ResponseBody(body) {
  return body !== null && body !== void 0 && "certificate" in body;
}
const alphabet = "abcdefghijklmnopqrstuvwxyz234567";
const lookupTable = /* @__PURE__ */ Object.create(null);
for (let i3 = 0; i3 < alphabet.length; i3++) {
  lookupTable[alphabet[i3]] = i3;
}
lookupTable["0"] = lookupTable.o;
lookupTable["1"] = lookupTable.i;
function encode$2(input) {
  let skip = 0;
  let bits = 0;
  let output = "";
  function encodeByte(byte) {
    if (skip < 0) {
      bits |= byte >> -skip;
    } else {
      bits = byte << skip & 248;
    }
    if (skip > 3) {
      skip -= 8;
      return 1;
    }
    if (skip < 4) {
      output += alphabet[bits >> 3];
      skip += 5;
    }
    return 0;
  }
  for (let i3 = 0; i3 < input.length; ) {
    i3 += encodeByte(input[i3]);
  }
  return output + (skip < 0 ? alphabet[bits >> 3] : "");
}
function decode$2(input) {
  let skip = 0;
  let byte = 0;
  const output = new Uint8Array(input.length * 4 / 3 | 0);
  let o3 = 0;
  function decodeChar(char) {
    let val = lookupTable[char.toLowerCase()];
    if (val === void 0) {
      throw new Error(`Invalid character: ${JSON.stringify(char)}`);
    }
    val <<= 3;
    byte |= val >>> skip;
    skip += 5;
    if (skip >= 8) {
      output[o3++] = byte;
      skip -= 8;
      if (skip > 0) {
        byte = val << 5 - skip & 255;
      } else {
        byte = 0;
      }
    }
  }
  for (const c2 of input) {
    decodeChar(c2);
  }
  return output.slice(0, o3);
}
const lookUpTable = new Uint32Array([
  0,
  1996959894,
  3993919788,
  2567524794,
  124634137,
  1886057615,
  3915621685,
  2657392035,
  249268274,
  2044508324,
  3772115230,
  2547177864,
  162941995,
  2125561021,
  3887607047,
  2428444049,
  498536548,
  1789927666,
  4089016648,
  2227061214,
  450548861,
  1843258603,
  4107580753,
  2211677639,
  325883990,
  1684777152,
  4251122042,
  2321926636,
  335633487,
  1661365465,
  4195302755,
  2366115317,
  997073096,
  1281953886,
  3579855332,
  2724688242,
  1006888145,
  1258607687,
  3524101629,
  2768942443,
  901097722,
  1119000684,
  3686517206,
  2898065728,
  853044451,
  1172266101,
  3705015759,
  2882616665,
  651767980,
  1373503546,
  3369554304,
  3218104598,
  565507253,
  1454621731,
  3485111705,
  3099436303,
  671266974,
  1594198024,
  3322730930,
  2970347812,
  795835527,
  1483230225,
  3244367275,
  3060149565,
  1994146192,
  31158534,
  2563907772,
  4023717930,
  1907459465,
  112637215,
  2680153253,
  3904427059,
  2013776290,
  251722036,
  2517215374,
  3775830040,
  2137656763,
  141376813,
  2439277719,
  3865271297,
  1802195444,
  476864866,
  2238001368,
  4066508878,
  1812370925,
  453092731,
  2181625025,
  4111451223,
  1706088902,
  314042704,
  2344532202,
  4240017532,
  1658658271,
  366619977,
  2362670323,
  4224994405,
  1303535960,
  984961486,
  2747007092,
  3569037538,
  1256170817,
  1037604311,
  2765210733,
  3554079995,
  1131014506,
  879679996,
  2909243462,
  3663771856,
  1141124467,
  855842277,
  2852801631,
  3708648649,
  1342533948,
  654459306,
  3188396048,
  3373015174,
  1466479909,
  544179635,
  3110523913,
  3462522015,
  1591671054,
  702138776,
  2966460450,
  3352799412,
  1504918807,
  783551873,
  3082640443,
  3233442989,
  3988292384,
  2596254646,
  62317068,
  1957810842,
  3939845945,
  2647816111,
  81470997,
  1943803523,
  3814918930,
  2489596804,
  225274430,
  2053790376,
  3826175755,
  2466906013,
  167816743,
  2097651377,
  4027552580,
  2265490386,
  503444072,
  1762050814,
  4150417245,
  2154129355,
  426522225,
  1852507879,
  4275313526,
  2312317920,
  282753626,
  1742555852,
  4189708143,
  2394877945,
  397917763,
  1622183637,
  3604390888,
  2714866558,
  953729732,
  1340076626,
  3518719985,
  2797360999,
  1068828381,
  1219638859,
  3624741850,
  2936675148,
  906185462,
  1090812512,
  3747672003,
  2825379669,
  829329135,
  1181335161,
  3412177804,
  3160834842,
  628085408,
  1382605366,
  3423369109,
  3138078467,
  570562233,
  1426400815,
  3317316542,
  2998733608,
  733239954,
  1555261956,
  3268935591,
  3050360625,
  752459403,
  1541320221,
  2607071920,
  3965973030,
  1969922972,
  40735498,
  2617837225,
  3943577151,
  1913087877,
  83908371,
  2512341634,
  3803740692,
  2075208622,
  213261112,
  2463272603,
  3855990285,
  2094854071,
  198958881,
  2262029012,
  4057260610,
  1759359992,
  534414190,
  2176718541,
  4139329115,
  1873836001,
  414664567,
  2282248934,
  4279200368,
  1711684554,
  285281116,
  2405801727,
  4167216745,
  1634467795,
  376229701,
  2685067896,
  3608007406,
  1308918612,
  956543938,
  2808555105,
  3495958263,
  1231636301,
  1047427035,
  2932959818,
  3654703836,
  1088359270,
  936918e3,
  2847714899,
  3736837829,
  1202900863,
  817233897,
  3183342108,
  3401237130,
  1404277552,
  615818150,
  3134207493,
  3453421203,
  1423857449,
  601450431,
  3009837614,
  3294710456,
  1567103746,
  711928724,
  3020668471,
  3272380065,
  1510334235,
  755167117
]);
function getCrc32(buf) {
  let crc = -1;
  for (let i3 = 0; i3 < buf.length; i3++) {
    const byte = buf[i3];
    const t3 = (byte ^ crc) & 255;
    crc = lookUpTable[t3] ^ crc >>> 8;
  }
  return (crc ^ -1) >>> 0;
}
const crypto$1 = typeof globalThis === "object" && "crypto" in globalThis ? globalThis.crypto : void 0;
/*! noble-hashes - MIT License (c) 2022 Paul Miller (paulmillr.com) */
function isBytes(a2) {
  return a2 instanceof Uint8Array || ArrayBuffer.isView(a2) && a2.constructor.name === "Uint8Array";
}
function anumber(n2) {
  if (!Number.isSafeInteger(n2) || n2 < 0)
    throw new Error("positive integer expected, got " + n2);
}
function abytes(b2, ...lengths) {
  if (!isBytes(b2))
    throw new Error("Uint8Array expected");
  if (lengths.length > 0 && !lengths.includes(b2.length))
    throw new Error("Uint8Array expected of length " + lengths + ", got length=" + b2.length);
}
function aexists(instance, checkFinished = true) {
  if (instance.destroyed)
    throw new Error("Hash instance has been destroyed");
  if (checkFinished && instance.finished)
    throw new Error("Hash#digest() has already been called");
}
function aoutput(out, instance) {
  abytes(out);
  const min = instance.outputLen;
  if (out.length < min) {
    throw new Error("digestInto() expects output buffer of length at least " + min);
  }
}
function clean(...arrays) {
  for (let i3 = 0; i3 < arrays.length; i3++) {
    arrays[i3].fill(0);
  }
}
function createView(arr) {
  return new DataView(arr.buffer, arr.byteOffset, arr.byteLength);
}
function rotr(word, shift) {
  return word << 32 - shift | word >>> shift;
}
const hasHexBuiltin = /* @__PURE__ */ (() => (
  // @ts-ignore
  typeof Uint8Array.from([]).toHex === "function" && typeof Uint8Array.fromHex === "function"
))();
const hexes = /* @__PURE__ */ Array.from({ length: 256 }, (_2, i3) => i3.toString(16).padStart(2, "0"));
function bytesToHex(bytes) {
  abytes(bytes);
  if (hasHexBuiltin)
    return bytes.toHex();
  let hex = "";
  for (let i3 = 0; i3 < bytes.length; i3++) {
    hex += hexes[bytes[i3]];
  }
  return hex;
}
const asciis = { _0: 48, _9: 57, A: 65, F: 70, a: 97, f: 102 };
function asciiToBase16(ch) {
  if (ch >= asciis._0 && ch <= asciis._9)
    return ch - asciis._0;
  if (ch >= asciis.A && ch <= asciis.F)
    return ch - (asciis.A - 10);
  if (ch >= asciis.a && ch <= asciis.f)
    return ch - (asciis.a - 10);
  return;
}
function hexToBytes(hex) {
  if (typeof hex !== "string")
    throw new Error("hex string expected, got " + typeof hex);
  if (hasHexBuiltin)
    return Uint8Array.fromHex(hex);
  const hl = hex.length;
  const al = hl / 2;
  if (hl % 2)
    throw new Error("hex string expected, got unpadded hex of length " + hl);
  const array = new Uint8Array(al);
  for (let ai = 0, hi = 0; ai < al; ai++, hi += 2) {
    const n1 = asciiToBase16(hex.charCodeAt(hi));
    const n2 = asciiToBase16(hex.charCodeAt(hi + 1));
    if (n1 === void 0 || n2 === void 0) {
      const char = hex[hi] + hex[hi + 1];
      throw new Error('hex string expected, got non-hex character "' + char + '" at index ' + hi);
    }
    array[ai] = n1 * 16 + n2;
  }
  return array;
}
function utf8ToBytes(str) {
  if (typeof str !== "string")
    throw new Error("string expected");
  return new Uint8Array(new TextEncoder().encode(str));
}
function toBytes(data) {
  if (typeof data === "string")
    data = utf8ToBytes(data);
  abytes(data);
  return data;
}
function concatBytes(...arrays) {
  let sum = 0;
  for (let i3 = 0; i3 < arrays.length; i3++) {
    const a2 = arrays[i3];
    abytes(a2);
    sum += a2.length;
  }
  const res = new Uint8Array(sum);
  for (let i3 = 0, pad = 0; i3 < arrays.length; i3++) {
    const a2 = arrays[i3];
    res.set(a2, pad);
    pad += a2.length;
  }
  return res;
}
class Hash {
}
function createHasher$1(hashCons) {
  const hashC = (msg) => hashCons().update(toBytes(msg)).digest();
  const tmp = hashCons();
  hashC.outputLen = tmp.outputLen;
  hashC.blockLen = tmp.blockLen;
  hashC.create = () => hashCons();
  return hashC;
}
function randomBytes(bytesLength = 32) {
  if (crypto$1 && typeof crypto$1.getRandomValues === "function") {
    return crypto$1.getRandomValues(new Uint8Array(bytesLength));
  }
  if (crypto$1 && typeof crypto$1.randomBytes === "function") {
    return Uint8Array.from(crypto$1.randomBytes(bytesLength));
  }
  throw new Error("crypto.getRandomValues must be defined");
}
function setBigUint64(view, byteOffset, value, isLE) {
  if (typeof view.setBigUint64 === "function")
    return view.setBigUint64(byteOffset, value, isLE);
  const _32n2 = BigInt(32);
  const _u32_max = BigInt(4294967295);
  const wh = Number(value >> _32n2 & _u32_max);
  const wl = Number(value & _u32_max);
  const h2 = isLE ? 4 : 0;
  const l3 = isLE ? 0 : 4;
  view.setUint32(byteOffset + h2, wh, isLE);
  view.setUint32(byteOffset + l3, wl, isLE);
}
function Chi(a2, b2, c2) {
  return a2 & b2 ^ ~a2 & c2;
}
function Maj(a2, b2, c2) {
  return a2 & b2 ^ a2 & c2 ^ b2 & c2;
}
class HashMD extends Hash {
  constructor(blockLen, outputLen, padOffset, isLE) {
    super();
    this.finished = false;
    this.length = 0;
    this.pos = 0;
    this.destroyed = false;
    this.blockLen = blockLen;
    this.outputLen = outputLen;
    this.padOffset = padOffset;
    this.isLE = isLE;
    this.buffer = new Uint8Array(blockLen);
    this.view = createView(this.buffer);
  }
  update(data) {
    aexists(this);
    data = toBytes(data);
    abytes(data);
    const { view, buffer, blockLen } = this;
    const len = data.length;
    for (let pos = 0; pos < len; ) {
      const take = Math.min(blockLen - this.pos, len - pos);
      if (take === blockLen) {
        const dataView = createView(data);
        for (; blockLen <= len - pos; pos += blockLen)
          this.process(dataView, pos);
        continue;
      }
      buffer.set(data.subarray(pos, pos + take), this.pos);
      this.pos += take;
      pos += take;
      if (this.pos === blockLen) {
        this.process(view, 0);
        this.pos = 0;
      }
    }
    this.length += data.length;
    this.roundClean();
    return this;
  }
  digestInto(out) {
    aexists(this);
    aoutput(out, this);
    this.finished = true;
    const { buffer, view, blockLen, isLE } = this;
    let { pos } = this;
    buffer[pos++] = 128;
    clean(this.buffer.subarray(pos));
    if (this.padOffset > blockLen - pos) {
      this.process(view, 0);
      pos = 0;
    }
    for (let i3 = pos; i3 < blockLen; i3++)
      buffer[i3] = 0;
    setBigUint64(view, blockLen - 8, BigInt(this.length * 8), isLE);
    this.process(view, 0);
    const oview = createView(out);
    const len = this.outputLen;
    if (len % 4)
      throw new Error("_sha2: outputLen should be aligned to 32bit");
    const outLen = len / 4;
    const state = this.get();
    if (outLen > state.length)
      throw new Error("_sha2: outputLen bigger than state");
    for (let i3 = 0; i3 < outLen; i3++)
      oview.setUint32(4 * i3, state[i3], isLE);
  }
  digest() {
    const { buffer, outputLen } = this;
    this.digestInto(buffer);
    const res = buffer.slice(0, outputLen);
    this.destroy();
    return res;
  }
  _cloneInto(to) {
    to || (to = new this.constructor());
    to.set(...this.get());
    const { blockLen, buffer, length, finished, destroyed, pos } = this;
    to.destroyed = destroyed;
    to.finished = finished;
    to.length = length;
    to.pos = pos;
    if (length % blockLen)
      to.buffer.set(buffer);
    return to;
  }
  clone() {
    return this._cloneInto();
  }
}
const SHA256_IV = /* @__PURE__ */ Uint32Array.from([
  1779033703,
  3144134277,
  1013904242,
  2773480762,
  1359893119,
  2600822924,
  528734635,
  1541459225
]);
const SHA224_IV = /* @__PURE__ */ Uint32Array.from([
  3238371032,
  914150663,
  812702999,
  4144912697,
  4290775857,
  1750603025,
  1694076839,
  3204075428
]);
const SHA512_IV = /* @__PURE__ */ Uint32Array.from([
  1779033703,
  4089235720,
  3144134277,
  2227873595,
  1013904242,
  4271175723,
  2773480762,
  1595750129,
  1359893119,
  2917565137,
  2600822924,
  725511199,
  528734635,
  4215389547,
  1541459225,
  327033209
]);
const U32_MASK64 = /* @__PURE__ */ BigInt(2 ** 32 - 1);
const _32n = /* @__PURE__ */ BigInt(32);
function fromBig(n2, le = false) {
  if (le)
    return { h: Number(n2 & U32_MASK64), l: Number(n2 >> _32n & U32_MASK64) };
  return { h: Number(n2 >> _32n & U32_MASK64) | 0, l: Number(n2 & U32_MASK64) | 0 };
}
function split(lst, le = false) {
  const len = lst.length;
  let Ah = new Uint32Array(len);
  let Al = new Uint32Array(len);
  for (let i3 = 0; i3 < len; i3++) {
    const { h: h2, l: l3 } = fromBig(lst[i3], le);
    [Ah[i3], Al[i3]] = [h2, l3];
  }
  return [Ah, Al];
}
const shrSH = (h2, _l, s2) => h2 >>> s2;
const shrSL = (h2, l3, s2) => h2 << 32 - s2 | l3 >>> s2;
const rotrSH = (h2, l3, s2) => h2 >>> s2 | l3 << 32 - s2;
const rotrSL = (h2, l3, s2) => h2 << 32 - s2 | l3 >>> s2;
const rotrBH = (h2, l3, s2) => h2 << 64 - s2 | l3 >>> s2 - 32;
const rotrBL = (h2, l3, s2) => h2 >>> s2 - 32 | l3 << 64 - s2;
function add(Ah, Al, Bh, Bl) {
  const l3 = (Al >>> 0) + (Bl >>> 0);
  return { h: Ah + Bh + (l3 / 2 ** 32 | 0) | 0, l: l3 | 0 };
}
const add3L = (Al, Bl, Cl) => (Al >>> 0) + (Bl >>> 0) + (Cl >>> 0);
const add3H = (low, Ah, Bh, Ch) => Ah + Bh + Ch + (low / 2 ** 32 | 0) | 0;
const add4L = (Al, Bl, Cl, Dl) => (Al >>> 0) + (Bl >>> 0) + (Cl >>> 0) + (Dl >>> 0);
const add4H = (low, Ah, Bh, Ch, Dh) => Ah + Bh + Ch + Dh + (low / 2 ** 32 | 0) | 0;
const add5L = (Al, Bl, Cl, Dl, El) => (Al >>> 0) + (Bl >>> 0) + (Cl >>> 0) + (Dl >>> 0) + (El >>> 0);
const add5H = (low, Ah, Bh, Ch, Dh, Eh) => Ah + Bh + Ch + Dh + Eh + (low / 2 ** 32 | 0) | 0;
const SHA256_K = /* @__PURE__ */ Uint32Array.from([
  1116352408,
  1899447441,
  3049323471,
  3921009573,
  961987163,
  1508970993,
  2453635748,
  2870763221,
  3624381080,
  310598401,
  607225278,
  1426881987,
  1925078388,
  2162078206,
  2614888103,
  3248222580,
  3835390401,
  4022224774,
  264347078,
  604807628,
  770255983,
  1249150122,
  1555081692,
  1996064986,
  2554220882,
  2821834349,
  2952996808,
  3210313671,
  3336571891,
  3584528711,
  113926993,
  338241895,
  666307205,
  773529912,
  1294757372,
  1396182291,
  1695183700,
  1986661051,
  2177026350,
  2456956037,
  2730485921,
  2820302411,
  3259730800,
  3345764771,
  3516065817,
  3600352804,
  4094571909,
  275423344,
  430227734,
  506948616,
  659060556,
  883997877,
  958139571,
  1322822218,
  1537002063,
  1747873779,
  1955562222,
  2024104815,
  2227730452,
  2361852424,
  2428436474,
  2756734187,
  3204031479,
  3329325298
]);
const SHA256_W = /* @__PURE__ */ new Uint32Array(64);
class SHA256 extends HashMD {
  constructor(outputLen = 32) {
    super(64, outputLen, 8, false);
    this.A = SHA256_IV[0] | 0;
    this.B = SHA256_IV[1] | 0;
    this.C = SHA256_IV[2] | 0;
    this.D = SHA256_IV[3] | 0;
    this.E = SHA256_IV[4] | 0;
    this.F = SHA256_IV[5] | 0;
    this.G = SHA256_IV[6] | 0;
    this.H = SHA256_IV[7] | 0;
  }
  get() {
    const { A: A4, B: B3, C: C2, D: D2, E: E2, F: F2, G: G2, H: H2 } = this;
    return [A4, B3, C2, D2, E2, F2, G2, H2];
  }
  // prettier-ignore
  set(A4, B3, C2, D2, E2, F2, G2, H2) {
    this.A = A4 | 0;
    this.B = B3 | 0;
    this.C = C2 | 0;
    this.D = D2 | 0;
    this.E = E2 | 0;
    this.F = F2 | 0;
    this.G = G2 | 0;
    this.H = H2 | 0;
  }
  process(view, offset) {
    for (let i3 = 0; i3 < 16; i3++, offset += 4)
      SHA256_W[i3] = view.getUint32(offset, false);
    for (let i3 = 16; i3 < 64; i3++) {
      const W15 = SHA256_W[i3 - 15];
      const W2 = SHA256_W[i3 - 2];
      const s0 = rotr(W15, 7) ^ rotr(W15, 18) ^ W15 >>> 3;
      const s1 = rotr(W2, 17) ^ rotr(W2, 19) ^ W2 >>> 10;
      SHA256_W[i3] = s1 + SHA256_W[i3 - 7] + s0 + SHA256_W[i3 - 16] | 0;
    }
    let { A: A4, B: B3, C: C2, D: D2, E: E2, F: F2, G: G2, H: H2 } = this;
    for (let i3 = 0; i3 < 64; i3++) {
      const sigma1 = rotr(E2, 6) ^ rotr(E2, 11) ^ rotr(E2, 25);
      const T1 = H2 + sigma1 + Chi(E2, F2, G2) + SHA256_K[i3] + SHA256_W[i3] | 0;
      const sigma0 = rotr(A4, 2) ^ rotr(A4, 13) ^ rotr(A4, 22);
      const T2 = sigma0 + Maj(A4, B3, C2) | 0;
      H2 = G2;
      G2 = F2;
      F2 = E2;
      E2 = D2 + T1 | 0;
      D2 = C2;
      C2 = B3;
      B3 = A4;
      A4 = T1 + T2 | 0;
    }
    A4 = A4 + this.A | 0;
    B3 = B3 + this.B | 0;
    C2 = C2 + this.C | 0;
    D2 = D2 + this.D | 0;
    E2 = E2 + this.E | 0;
    F2 = F2 + this.F | 0;
    G2 = G2 + this.G | 0;
    H2 = H2 + this.H | 0;
    this.set(A4, B3, C2, D2, E2, F2, G2, H2);
  }
  roundClean() {
    clean(SHA256_W);
  }
  destroy() {
    this.set(0, 0, 0, 0, 0, 0, 0, 0);
    clean(this.buffer);
  }
}
class SHA224 extends SHA256 {
  constructor() {
    super(28);
    this.A = SHA224_IV[0] | 0;
    this.B = SHA224_IV[1] | 0;
    this.C = SHA224_IV[2] | 0;
    this.D = SHA224_IV[3] | 0;
    this.E = SHA224_IV[4] | 0;
    this.F = SHA224_IV[5] | 0;
    this.G = SHA224_IV[6] | 0;
    this.H = SHA224_IV[7] | 0;
  }
}
const K512 = /* @__PURE__ */ (() => split([
  "0x428a2f98d728ae22",
  "0x7137449123ef65cd",
  "0xb5c0fbcfec4d3b2f",
  "0xe9b5dba58189dbbc",
  "0x3956c25bf348b538",
  "0x59f111f1b605d019",
  "0x923f82a4af194f9b",
  "0xab1c5ed5da6d8118",
  "0xd807aa98a3030242",
  "0x12835b0145706fbe",
  "0x243185be4ee4b28c",
  "0x550c7dc3d5ffb4e2",
  "0x72be5d74f27b896f",
  "0x80deb1fe3b1696b1",
  "0x9bdc06a725c71235",
  "0xc19bf174cf692694",
  "0xe49b69c19ef14ad2",
  "0xefbe4786384f25e3",
  "0x0fc19dc68b8cd5b5",
  "0x240ca1cc77ac9c65",
  "0x2de92c6f592b0275",
  "0x4a7484aa6ea6e483",
  "0x5cb0a9dcbd41fbd4",
  "0x76f988da831153b5",
  "0x983e5152ee66dfab",
  "0xa831c66d2db43210",
  "0xb00327c898fb213f",
  "0xbf597fc7beef0ee4",
  "0xc6e00bf33da88fc2",
  "0xd5a79147930aa725",
  "0x06ca6351e003826f",
  "0x142929670a0e6e70",
  "0x27b70a8546d22ffc",
  "0x2e1b21385c26c926",
  "0x4d2c6dfc5ac42aed",
  "0x53380d139d95b3df",
  "0x650a73548baf63de",
  "0x766a0abb3c77b2a8",
  "0x81c2c92e47edaee6",
  "0x92722c851482353b",
  "0xa2bfe8a14cf10364",
  "0xa81a664bbc423001",
  "0xc24b8b70d0f89791",
  "0xc76c51a30654be30",
  "0xd192e819d6ef5218",
  "0xd69906245565a910",
  "0xf40e35855771202a",
  "0x106aa07032bbd1b8",
  "0x19a4c116b8d2d0c8",
  "0x1e376c085141ab53",
  "0x2748774cdf8eeb99",
  "0x34b0bcb5e19b48a8",
  "0x391c0cb3c5c95a63",
  "0x4ed8aa4ae3418acb",
  "0x5b9cca4f7763e373",
  "0x682e6ff3d6b2b8a3",
  "0x748f82ee5defb2fc",
  "0x78a5636f43172f60",
  "0x84c87814a1f0ab72",
  "0x8cc702081a6439ec",
  "0x90befffa23631e28",
  "0xa4506cebde82bde9",
  "0xbef9a3f7b2c67915",
  "0xc67178f2e372532b",
  "0xca273eceea26619c",
  "0xd186b8c721c0c207",
  "0xeada7dd6cde0eb1e",
  "0xf57d4f7fee6ed178",
  "0x06f067aa72176fba",
  "0x0a637dc5a2c898a6",
  "0x113f9804bef90dae",
  "0x1b710b35131c471b",
  "0x28db77f523047d84",
  "0x32caab7b40c72493",
  "0x3c9ebe0a15c9bebc",
  "0x431d67c49c100d4c",
  "0x4cc5d4becb3e42b6",
  "0x597f299cfc657e2a",
  "0x5fcb6fab3ad6faec",
  "0x6c44198c4a475817"
].map((n2) => BigInt(n2))))();
const SHA512_Kh = /* @__PURE__ */ (() => K512[0])();
const SHA512_Kl = /* @__PURE__ */ (() => K512[1])();
const SHA512_W_H = /* @__PURE__ */ new Uint32Array(80);
const SHA512_W_L = /* @__PURE__ */ new Uint32Array(80);
class SHA512 extends HashMD {
  constructor(outputLen = 64) {
    super(128, outputLen, 16, false);
    this.Ah = SHA512_IV[0] | 0;
    this.Al = SHA512_IV[1] | 0;
    this.Bh = SHA512_IV[2] | 0;
    this.Bl = SHA512_IV[3] | 0;
    this.Ch = SHA512_IV[4] | 0;
    this.Cl = SHA512_IV[5] | 0;
    this.Dh = SHA512_IV[6] | 0;
    this.Dl = SHA512_IV[7] | 0;
    this.Eh = SHA512_IV[8] | 0;
    this.El = SHA512_IV[9] | 0;
    this.Fh = SHA512_IV[10] | 0;
    this.Fl = SHA512_IV[11] | 0;
    this.Gh = SHA512_IV[12] | 0;
    this.Gl = SHA512_IV[13] | 0;
    this.Hh = SHA512_IV[14] | 0;
    this.Hl = SHA512_IV[15] | 0;
  }
  // prettier-ignore
  get() {
    const { Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl } = this;
    return [Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl];
  }
  // prettier-ignore
  set(Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl) {
    this.Ah = Ah | 0;
    this.Al = Al | 0;
    this.Bh = Bh | 0;
    this.Bl = Bl | 0;
    this.Ch = Ch | 0;
    this.Cl = Cl | 0;
    this.Dh = Dh | 0;
    this.Dl = Dl | 0;
    this.Eh = Eh | 0;
    this.El = El | 0;
    this.Fh = Fh | 0;
    this.Fl = Fl | 0;
    this.Gh = Gh | 0;
    this.Gl = Gl | 0;
    this.Hh = Hh | 0;
    this.Hl = Hl | 0;
  }
  process(view, offset) {
    for (let i3 = 0; i3 < 16; i3++, offset += 4) {
      SHA512_W_H[i3] = view.getUint32(offset);
      SHA512_W_L[i3] = view.getUint32(offset += 4);
    }
    for (let i3 = 16; i3 < 80; i3++) {
      const W15h = SHA512_W_H[i3 - 15] | 0;
      const W15l = SHA512_W_L[i3 - 15] | 0;
      const s0h = rotrSH(W15h, W15l, 1) ^ rotrSH(W15h, W15l, 8) ^ shrSH(W15h, W15l, 7);
      const s0l = rotrSL(W15h, W15l, 1) ^ rotrSL(W15h, W15l, 8) ^ shrSL(W15h, W15l, 7);
      const W2h = SHA512_W_H[i3 - 2] | 0;
      const W2l = SHA512_W_L[i3 - 2] | 0;
      const s1h = rotrSH(W2h, W2l, 19) ^ rotrBH(W2h, W2l, 61) ^ shrSH(W2h, W2l, 6);
      const s1l = rotrSL(W2h, W2l, 19) ^ rotrBL(W2h, W2l, 61) ^ shrSL(W2h, W2l, 6);
      const SUMl = add4L(s0l, s1l, SHA512_W_L[i3 - 7], SHA512_W_L[i3 - 16]);
      const SUMh = add4H(SUMl, s0h, s1h, SHA512_W_H[i3 - 7], SHA512_W_H[i3 - 16]);
      SHA512_W_H[i3] = SUMh | 0;
      SHA512_W_L[i3] = SUMl | 0;
    }
    let { Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl } = this;
    for (let i3 = 0; i3 < 80; i3++) {
      const sigma1h = rotrSH(Eh, El, 14) ^ rotrSH(Eh, El, 18) ^ rotrBH(Eh, El, 41);
      const sigma1l = rotrSL(Eh, El, 14) ^ rotrSL(Eh, El, 18) ^ rotrBL(Eh, El, 41);
      const CHIh = Eh & Fh ^ ~Eh & Gh;
      const CHIl = El & Fl ^ ~El & Gl;
      const T1ll = add5L(Hl, sigma1l, CHIl, SHA512_Kl[i3], SHA512_W_L[i3]);
      const T1h = add5H(T1ll, Hh, sigma1h, CHIh, SHA512_Kh[i3], SHA512_W_H[i3]);
      const T1l = T1ll | 0;
      const sigma0h = rotrSH(Ah, Al, 28) ^ rotrBH(Ah, Al, 34) ^ rotrBH(Ah, Al, 39);
      const sigma0l = rotrSL(Ah, Al, 28) ^ rotrBL(Ah, Al, 34) ^ rotrBL(Ah, Al, 39);
      const MAJh = Ah & Bh ^ Ah & Ch ^ Bh & Ch;
      const MAJl = Al & Bl ^ Al & Cl ^ Bl & Cl;
      Hh = Gh | 0;
      Hl = Gl | 0;
      Gh = Fh | 0;
      Gl = Fl | 0;
      Fh = Eh | 0;
      Fl = El | 0;
      ({ h: Eh, l: El } = add(Dh | 0, Dl | 0, T1h | 0, T1l | 0));
      Dh = Ch | 0;
      Dl = Cl | 0;
      Ch = Bh | 0;
      Cl = Bl | 0;
      Bh = Ah | 0;
      Bl = Al | 0;
      const All = add3L(T1l, sigma0l, MAJl);
      Ah = add3H(All, T1h, sigma0h, MAJh);
      Al = All | 0;
    }
    ({ h: Ah, l: Al } = add(this.Ah | 0, this.Al | 0, Ah | 0, Al | 0));
    ({ h: Bh, l: Bl } = add(this.Bh | 0, this.Bl | 0, Bh | 0, Bl | 0));
    ({ h: Ch, l: Cl } = add(this.Ch | 0, this.Cl | 0, Ch | 0, Cl | 0));
    ({ h: Dh, l: Dl } = add(this.Dh | 0, this.Dl | 0, Dh | 0, Dl | 0));
    ({ h: Eh, l: El } = add(this.Eh | 0, this.El | 0, Eh | 0, El | 0));
    ({ h: Fh, l: Fl } = add(this.Fh | 0, this.Fl | 0, Fh | 0, Fl | 0));
    ({ h: Gh, l: Gl } = add(this.Gh | 0, this.Gl | 0, Gh | 0, Gl | 0));
    ({ h: Hh, l: Hl } = add(this.Hh | 0, this.Hl | 0, Hh | 0, Hl | 0));
    this.set(Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl);
  }
  roundClean() {
    clean(SHA512_W_H, SHA512_W_L);
  }
  destroy() {
    clean(this.buffer);
    this.set(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
  }
}
const sha256 = /* @__PURE__ */ createHasher$1(() => new SHA256());
const sha224 = /* @__PURE__ */ createHasher$1(() => new SHA224());
const sha512 = /* @__PURE__ */ createHasher$1(() => new SHA512());
const JSON_KEY_PRINCIPAL = "__principal__";
const SELF_AUTHENTICATING_SUFFIX = 2;
const ANONYMOUS_SUFFIX = 4;
const MANAGEMENT_CANISTER_PRINCIPAL_TEXT_STR = "aaaaa-aa";
let Principal$1 = class Principal {
  static anonymous() {
    return new this(new Uint8Array([ANONYMOUS_SUFFIX]));
  }
  /**
   * Utility method, returning the principal representing the management canister, decoded from the hex string `'aaaaa-aa'`
   * @returns {Principal} principal of the management canister
   */
  static managementCanister() {
    return this.fromText(MANAGEMENT_CANISTER_PRINCIPAL_TEXT_STR);
  }
  static selfAuthenticating(publicKey) {
    const sha = sha224(publicKey);
    return new this(new Uint8Array([...sha, SELF_AUTHENTICATING_SUFFIX]));
  }
  static from(other) {
    if (typeof other === "string") {
      return Principal.fromText(other);
    } else if (Object.getPrototypeOf(other) === Uint8Array.prototype) {
      return new Principal(other);
    } else if (Principal.isPrincipal(other)) {
      return new Principal(other._arr);
    }
    throw new Error(`Impossible to convert ${JSON.stringify(other)} to Principal.`);
  }
  static fromHex(hex) {
    return new this(hexToBytes(hex));
  }
  static fromText(text) {
    let maybePrincipal = text;
    if (text.includes(JSON_KEY_PRINCIPAL)) {
      const obj = JSON.parse(text);
      if (JSON_KEY_PRINCIPAL in obj) {
        maybePrincipal = obj[JSON_KEY_PRINCIPAL];
      }
    }
    const canisterIdNoDash = maybePrincipal.toLowerCase().replace(/-/g, "");
    let arr = decode$2(canisterIdNoDash);
    arr = arr.slice(4, arr.length);
    const principal = new this(arr);
    if (principal.toText() !== maybePrincipal) {
      throw new Error(`Principal "${principal.toText()}" does not have a valid checksum (original value "${maybePrincipal}" may not be a valid Principal ID).`);
    }
    return principal;
  }
  static fromUint8Array(arr) {
    return new this(arr);
  }
  static isPrincipal(other) {
    return other instanceof Principal || typeof other === "object" && other !== null && "_isPrincipal" in other && other["_isPrincipal"] === true && "_arr" in other && other["_arr"] instanceof Uint8Array;
  }
  constructor(_arr) {
    this._arr = _arr;
    this._isPrincipal = true;
  }
  isAnonymous() {
    return this._arr.byteLength === 1 && this._arr[0] === ANONYMOUS_SUFFIX;
  }
  toUint8Array() {
    return this._arr;
  }
  toHex() {
    return bytesToHex(this._arr).toUpperCase();
  }
  toText() {
    const checksumArrayBuf = new ArrayBuffer(4);
    const view = new DataView(checksumArrayBuf);
    view.setUint32(0, getCrc32(this._arr));
    const checksum = new Uint8Array(checksumArrayBuf);
    const array = new Uint8Array([...checksum, ...this._arr]);
    const result = encode$2(array);
    const matches = result.match(/.{1,5}/g);
    if (!matches) {
      throw new Error();
    }
    return matches.join("-");
  }
  toString() {
    return this.toText();
  }
  /**
   * Serializes to JSON
   * @returns {JsonnablePrincipal} a JSON object with a single key, {@link JSON_KEY_PRINCIPAL}, whose value is the principal as a string
   */
  toJSON() {
    return { [JSON_KEY_PRINCIPAL]: this.toText() };
  }
  /**
   * Utility method taking a Principal to compare against. Used for determining canister ranges in certificate verification
   * @param {Principal} other - a {@link Principal} to compare
   * @returns {'lt' | 'eq' | 'gt'} `'lt' | 'eq' | 'gt'` a string, representing less than, equal to, or greater than
   */
  compareTo(other) {
    for (let i3 = 0; i3 < Math.min(this._arr.length, other._arr.length); i3++) {
      if (this._arr[i3] < other._arr[i3])
        return "lt";
      else if (this._arr[i3] > other._arr[i3])
        return "gt";
    }
    if (this._arr.length < other._arr.length)
      return "lt";
    if (this._arr.length > other._arr.length)
      return "gt";
    return "eq";
  }
  /**
   * Utility method checking whether a provided Principal is less than or equal to the current one using the {@link Principal.compareTo} method
   * @param other a {@link Principal} to compare
   * @returns {boolean} boolean
   */
  ltEq(other) {
    const cmp = this.compareTo(other);
    return cmp == "lt" || cmp == "eq";
  }
  /**
   * Utility method checking whether a provided Principal is greater than or equal to the current one using the {@link Principal.compareTo} method
   * @param other a {@link Principal} to compare
   * @returns {boolean} boolean
   */
  gtEq(other) {
    const cmp = this.compareTo(other);
    return cmp == "gt" || cmp == "eq";
  }
};
var ErrorKindEnum;
(function(ErrorKindEnum2) {
  ErrorKindEnum2["Trust"] = "Trust";
  ErrorKindEnum2["Protocol"] = "Protocol";
  ErrorKindEnum2["Reject"] = "Reject";
  ErrorKindEnum2["Transport"] = "Transport";
  ErrorKindEnum2["External"] = "External";
  ErrorKindEnum2["Limit"] = "Limit";
  ErrorKindEnum2["Input"] = "Input";
  ErrorKindEnum2["Unknown"] = "Unknown";
})(ErrorKindEnum || (ErrorKindEnum = {}));
class ErrorCode {
  constructor(isCertified = false) {
    this.isCertified = isCertified;
  }
  toString() {
    let errorMessage = this.toErrorMessage();
    if (this.requestContext) {
      errorMessage += `
Request context:
  Request ID (hex): ${this.requestContext.requestId ? bytesToHex(this.requestContext.requestId) : "undefined"}
  Sender pubkey (hex): ${bytesToHex(this.requestContext.senderPubKey)}
  Sender signature (hex): ${bytesToHex(this.requestContext.senderSignature)}
  Ingress expiry: ${this.requestContext.ingressExpiry.toString()}`;
    }
    if (this.callContext) {
      errorMessage += `
Call context:
  Canister ID: ${this.callContext.canisterId.toText()}
  Method name: ${this.callContext.methodName}
  HTTP details: ${JSON.stringify(this.callContext.httpDetails, null, 2)}`;
    }
    return errorMessage;
  }
}
class AgentError extends Error {
  get code() {
    return this.cause.code;
  }
  set code(code) {
    this.cause.code = code;
  }
  get kind() {
    return this.cause.kind;
  }
  set kind(kind) {
    this.cause.kind = kind;
  }
  /**
   * Reads the `isCertified` property of the underlying error code.
   * @returns `true` if the error is certified, `false` otherwise.
   */
  get isCertified() {
    return this.code.isCertified;
  }
  constructor(code, kind) {
    super(code.toString());
    this.name = "AgentError";
    this.cause = { code, kind };
    Object.setPrototypeOf(this, AgentError.prototype);
  }
  hasCode(code) {
    return this.code instanceof code;
  }
  toString() {
    return `${this.name} (${this.kind}): ${this.message}`;
  }
}
class ErrorKind extends AgentError {
  static fromCode(code) {
    return new this(code);
  }
}
class TrustError extends ErrorKind {
  constructor(code) {
    super(code, ErrorKindEnum.Trust);
    this.name = "TrustError";
    Object.setPrototypeOf(this, TrustError.prototype);
  }
}
class ProtocolError extends ErrorKind {
  constructor(code) {
    super(code, ErrorKindEnum.Protocol);
    this.name = "ProtocolError";
    Object.setPrototypeOf(this, ProtocolError.prototype);
  }
}
class RejectError extends ErrorKind {
  constructor(code) {
    super(code, ErrorKindEnum.Reject);
    this.name = "RejectError";
    Object.setPrototypeOf(this, RejectError.prototype);
  }
}
class TransportError extends ErrorKind {
  constructor(code) {
    super(code, ErrorKindEnum.Transport);
    this.name = "TransportError";
    Object.setPrototypeOf(this, TransportError.prototype);
  }
}
class ExternalError extends ErrorKind {
  constructor(code) {
    super(code, ErrorKindEnum.External);
    this.name = "ExternalError";
    Object.setPrototypeOf(this, ExternalError.prototype);
  }
}
class InputError extends ErrorKind {
  constructor(code) {
    super(code, ErrorKindEnum.Input);
    this.name = "InputError";
    Object.setPrototypeOf(this, InputError.prototype);
  }
}
class UnknownError extends ErrorKind {
  constructor(code) {
    super(code, ErrorKindEnum.Unknown);
    this.name = "UnknownError";
    Object.setPrototypeOf(this, UnknownError.prototype);
  }
}
class CertificateVerificationErrorCode extends ErrorCode {
  constructor(reason, error) {
    super();
    this.reason = reason;
    this.error = error;
    this.name = "CertificateVerificationErrorCode";
    Object.setPrototypeOf(this, CertificateVerificationErrorCode.prototype);
  }
  toErrorMessage() {
    let errorMessage = this.reason;
    if (this.error) {
      errorMessage += `: ${formatUnknownError(this.error)}`;
    }
    return `Certificate verification error: "${errorMessage}"`;
  }
}
class CertificateTimeErrorCode extends ErrorCode {
  constructor(maxAgeInMinutes, certificateTime, currentTime, timeDiffMsecs, ageType) {
    super();
    this.maxAgeInMinutes = maxAgeInMinutes;
    this.certificateTime = certificateTime;
    this.currentTime = currentTime;
    this.timeDiffMsecs = timeDiffMsecs;
    this.ageType = ageType;
    this.name = "CertificateTimeErrorCode";
    Object.setPrototypeOf(this, CertificateTimeErrorCode.prototype);
  }
  toErrorMessage() {
    return `Certificate is signed more than ${this.maxAgeInMinutes} minutes in the ${this.ageType}. Certificate time: ${this.certificateTime.toISOString()} Current time: ${this.currentTime.toISOString()} Clock drift: ${this.timeDiffMsecs}ms`;
  }
}
class CertificateHasTooManyDelegationsErrorCode extends ErrorCode {
  constructor() {
    super();
    this.name = "CertificateHasTooManyDelegationsErrorCode";
    Object.setPrototypeOf(this, CertificateHasTooManyDelegationsErrorCode.prototype);
  }
  toErrorMessage() {
    return "Certificate has too many delegations";
  }
}
class CertificateNotAuthorizedErrorCode extends ErrorCode {
  constructor(canisterId2, subnetId) {
    super();
    this.canisterId = canisterId2;
    this.subnetId = subnetId;
    this.name = "CertificateNotAuthorizedErrorCode";
    Object.setPrototypeOf(this, CertificateNotAuthorizedErrorCode.prototype);
  }
  toErrorMessage() {
    return `The certificate contains a delegation that does not include the canister ${this.canisterId.toText()} in the canister_ranges field. Subnet ID: ${this.subnetId.toText()}`;
  }
}
class LookupErrorCode extends ErrorCode {
  constructor(message, lookupStatus) {
    super();
    this.message = message;
    this.lookupStatus = lookupStatus;
    this.name = "LookupErrorCode";
    Object.setPrototypeOf(this, LookupErrorCode.prototype);
  }
  toErrorMessage() {
    return `${this.message}. Lookup status: ${this.lookupStatus}`;
  }
}
class MalformedLookupFoundValueErrorCode extends ErrorCode {
  constructor(message) {
    super();
    this.message = message;
    this.name = "MalformedLookupFoundValueErrorCode";
    Object.setPrototypeOf(this, MalformedLookupFoundValueErrorCode.prototype);
  }
  toErrorMessage() {
    return this.message;
  }
}
class MissingLookupValueErrorCode extends ErrorCode {
  constructor(message) {
    super();
    this.message = message;
    this.name = "MissingLookupValueErrorCode";
    Object.setPrototypeOf(this, MissingLookupValueErrorCode.prototype);
  }
  toErrorMessage() {
    return this.message;
  }
}
class DerKeyLengthMismatchErrorCode extends ErrorCode {
  constructor(expectedLength, actualLength) {
    super();
    this.expectedLength = expectedLength;
    this.actualLength = actualLength;
    this.name = "DerKeyLengthMismatchErrorCode";
    Object.setPrototypeOf(this, DerKeyLengthMismatchErrorCode.prototype);
  }
  toErrorMessage() {
    return `BLS DER-encoded public key must be ${this.expectedLength} bytes long, but is ${this.actualLength} bytes long`;
  }
}
class DerPrefixMismatchErrorCode extends ErrorCode {
  constructor(expectedPrefix, actualPrefix) {
    super();
    this.expectedPrefix = expectedPrefix;
    this.actualPrefix = actualPrefix;
    this.name = "DerPrefixMismatchErrorCode";
    Object.setPrototypeOf(this, DerPrefixMismatchErrorCode.prototype);
  }
  toErrorMessage() {
    return `BLS DER-encoded public key is invalid. Expected the following prefix: ${bytesToHex(this.expectedPrefix)}, but got ${bytesToHex(this.actualPrefix)}`;
  }
}
class DerDecodeLengthMismatchErrorCode extends ErrorCode {
  constructor(expectedLength, actualLength) {
    super();
    this.expectedLength = expectedLength;
    this.actualLength = actualLength;
    this.name = "DerDecodeLengthMismatchErrorCode";
    Object.setPrototypeOf(this, DerDecodeLengthMismatchErrorCode.prototype);
  }
  toErrorMessage() {
    return `DER payload mismatch: Expected length ${this.expectedLength}, actual length: ${this.actualLength}`;
  }
}
class DerDecodeErrorCode extends ErrorCode {
  constructor(error) {
    super();
    this.error = error;
    this.name = "DerDecodeErrorCode";
    Object.setPrototypeOf(this, DerDecodeErrorCode.prototype);
  }
  toErrorMessage() {
    return `Failed to decode DER: ${this.error}`;
  }
}
class DerEncodeErrorCode extends ErrorCode {
  constructor(error) {
    super();
    this.error = error;
    this.name = "DerEncodeErrorCode";
    Object.setPrototypeOf(this, DerEncodeErrorCode.prototype);
  }
  toErrorMessage() {
    return `Failed to encode DER: ${this.error}`;
  }
}
class CborDecodeErrorCode extends ErrorCode {
  constructor(error, input) {
    super();
    this.error = error;
    this.input = input;
    this.name = "CborDecodeErrorCode";
    Object.setPrototypeOf(this, CborDecodeErrorCode.prototype);
  }
  toErrorMessage() {
    return `Failed to decode CBOR: ${formatUnknownError(this.error)}, input: ${bytesToHex(this.input)}`;
  }
}
class CborEncodeErrorCode extends ErrorCode {
  constructor(error, value) {
    super();
    this.error = error;
    this.value = value;
    this.name = "CborEncodeErrorCode";
    Object.setPrototypeOf(this, CborEncodeErrorCode.prototype);
  }
  toErrorMessage() {
    return `Failed to encode CBOR: ${formatUnknownError(this.error)}, input: ${this.value}`;
  }
}
class TimeoutWaitingForResponseErrorCode extends ErrorCode {
  constructor(message, requestId, status) {
    super();
    this.message = message;
    this.requestId = requestId;
    this.status = status;
    this.name = "TimeoutWaitingForResponseErrorCode";
    Object.setPrototypeOf(this, TimeoutWaitingForResponseErrorCode.prototype);
  }
  toErrorMessage() {
    let errorMessage = `${this.message}
`;
    if (this.requestId) {
      errorMessage += `  Request ID: ${bytesToHex(this.requestId)}
`;
    }
    if (this.status) {
      errorMessage += `  Request status: ${this.status}
`;
    }
    return errorMessage;
  }
}
class CertificateOutdatedErrorCode extends ErrorCode {
  constructor(maxIngressExpiryInMinutes, requestId, retryTimes) {
    super();
    this.maxIngressExpiryInMinutes = maxIngressExpiryInMinutes;
    this.requestId = requestId;
    this.retryTimes = retryTimes;
    this.name = "CertificateOutdatedErrorCode";
    Object.setPrototypeOf(this, CertificateOutdatedErrorCode.prototype);
  }
  toErrorMessage() {
    let errorMessage = `Certificate is stale (over ${this.maxIngressExpiryInMinutes} minutes). Is the computer's clock synchronized?
  Request ID: ${bytesToHex(this.requestId)}
`;
    if (this.retryTimes !== void 0) {
      errorMessage += `  Retried ${this.retryTimes} times.`;
    }
    return errorMessage;
  }
}
class CertifiedRejectErrorCode extends ErrorCode {
  constructor(requestId, rejectCode, rejectMessage, rejectErrorCode) {
    super(true);
    this.requestId = requestId;
    this.rejectCode = rejectCode;
    this.rejectMessage = rejectMessage;
    this.rejectErrorCode = rejectErrorCode;
    this.name = "CertifiedRejectErrorCode";
    Object.setPrototypeOf(this, CertifiedRejectErrorCode.prototype);
  }
  toErrorMessage() {
    return `The replica returned a rejection error:
  Request ID: ${bytesToHex(this.requestId)}
  Reject code: ${this.rejectCode}
  Reject text: ${this.rejectMessage}
  Error code: ${this.rejectErrorCode}
`;
  }
}
class UncertifiedRejectErrorCode extends ErrorCode {
  constructor(requestId, rejectCode, rejectMessage, rejectErrorCode, signatures) {
    super();
    this.requestId = requestId;
    this.rejectCode = rejectCode;
    this.rejectMessage = rejectMessage;
    this.rejectErrorCode = rejectErrorCode;
    this.signatures = signatures;
    this.name = "UncertifiedRejectErrorCode";
    Object.setPrototypeOf(this, UncertifiedRejectErrorCode.prototype);
  }
  toErrorMessage() {
    return `The replica returned a rejection error:
  Request ID: ${bytesToHex(this.requestId)}
  Reject code: ${this.rejectCode}
  Reject text: ${this.rejectMessage}
  Error code: ${this.rejectErrorCode}
`;
  }
}
class UncertifiedRejectUpdateErrorCode extends ErrorCode {
  constructor(requestId, rejectCode, rejectMessage, rejectErrorCode) {
    super();
    this.requestId = requestId;
    this.rejectCode = rejectCode;
    this.rejectMessage = rejectMessage;
    this.rejectErrorCode = rejectErrorCode;
    this.name = "UncertifiedRejectUpdateErrorCode";
    Object.setPrototypeOf(this, UncertifiedRejectUpdateErrorCode.prototype);
  }
  toErrorMessage() {
    return `The replica returned a rejection error:
  Request ID: ${bytesToHex(this.requestId)}
  Reject code: ${this.rejectCode}
  Reject text: ${this.rejectMessage}
  Error code: ${this.rejectErrorCode}
`;
  }
}
class RequestStatusDoneNoReplyErrorCode extends ErrorCode {
  constructor(requestId) {
    super();
    this.requestId = requestId;
    this.name = "RequestStatusDoneNoReplyErrorCode";
    Object.setPrototypeOf(this, RequestStatusDoneNoReplyErrorCode.prototype);
  }
  toErrorMessage() {
    return `Call was marked as done but we never saw the reply:
  Request ID: ${bytesToHex(this.requestId)}
`;
  }
}
class MissingRootKeyErrorCode extends ErrorCode {
  constructor(shouldFetchRootKey) {
    super();
    this.shouldFetchRootKey = shouldFetchRootKey;
    this.name = "MissingRootKeyErrorCode";
    Object.setPrototypeOf(this, MissingRootKeyErrorCode.prototype);
  }
  toErrorMessage() {
    if (this.shouldFetchRootKey === void 0) {
      return "Agent is missing root key";
    }
    return `Agent is missing root key and the shouldFetchRootKey value is set to ${this.shouldFetchRootKey}. The root key should only be unknown if you are in local development. Otherwise you should avoid fetching and use the default IC Root Key or the known root key of your environment.`;
  }
}
class HashValueErrorCode extends ErrorCode {
  constructor(value) {
    super();
    this.value = value;
    this.name = "HashValueErrorCode";
    Object.setPrototypeOf(this, HashValueErrorCode.prototype);
  }
  toErrorMessage() {
    return `Attempt to hash a value of unsupported type: ${this.value}`;
  }
}
class HttpDefaultFetchErrorCode extends ErrorCode {
  constructor(error) {
    super();
    this.error = error;
    this.name = "HttpDefaultFetchErrorCode";
    Object.setPrototypeOf(this, HttpDefaultFetchErrorCode.prototype);
  }
  toErrorMessage() {
    return this.error;
  }
}
class IdentityInvalidErrorCode extends ErrorCode {
  constructor() {
    super();
    this.name = "IdentityInvalidErrorCode";
    Object.setPrototypeOf(this, IdentityInvalidErrorCode.prototype);
  }
  toErrorMessage() {
    return "This identity has expired due this application's security policy. Please refresh your authentication.";
  }
}
class IngressExpiryInvalidErrorCode extends ErrorCode {
  constructor(message, providedIngressExpiryInMinutes) {
    super();
    this.message = message;
    this.providedIngressExpiryInMinutes = providedIngressExpiryInMinutes;
    this.name = "IngressExpiryInvalidErrorCode";
    Object.setPrototypeOf(this, IngressExpiryInvalidErrorCode.prototype);
  }
  toErrorMessage() {
    return `${this.message}. Provided ingress expiry time is ${this.providedIngressExpiryInMinutes} minutes.`;
  }
}
class CreateHttpAgentErrorCode extends ErrorCode {
  constructor() {
    super();
    this.name = "CreateHttpAgentErrorCode";
    Object.setPrototypeOf(this, CreateHttpAgentErrorCode.prototype);
  }
  toErrorMessage() {
    return "Failed to create agent from provided agent";
  }
}
class MalformedSignatureErrorCode extends ErrorCode {
  constructor(error) {
    super();
    this.error = error;
    this.name = "MalformedSignatureErrorCode";
    Object.setPrototypeOf(this, MalformedSignatureErrorCode.prototype);
  }
  toErrorMessage() {
    return `Query response contained a malformed signature: ${this.error}`;
  }
}
class MissingSignatureErrorCode extends ErrorCode {
  constructor() {
    super();
    this.name = "MissingSignatureErrorCode";
    Object.setPrototypeOf(this, MissingSignatureErrorCode.prototype);
  }
  toErrorMessage() {
    return "Query response did not contain any node signatures";
  }
}
class MalformedPublicKeyErrorCode extends ErrorCode {
  constructor() {
    super();
    this.name = "MalformedPublicKeyErrorCode";
    Object.setPrototypeOf(this, MalformedPublicKeyErrorCode.prototype);
  }
  toErrorMessage() {
    return "Read state response contained a malformed public key";
  }
}
class QuerySignatureVerificationFailedErrorCode extends ErrorCode {
  constructor(nodeId) {
    super();
    this.nodeId = nodeId;
    this.name = "QuerySignatureVerificationFailedErrorCode";
    Object.setPrototypeOf(this, QuerySignatureVerificationFailedErrorCode.prototype);
  }
  toErrorMessage() {
    return `Query signature verification failed. Node ID: ${this.nodeId}`;
  }
}
class UnexpectedErrorCode extends ErrorCode {
  constructor(error) {
    super();
    this.error = error;
    this.name = "UnexpectedErrorCode";
    Object.setPrototypeOf(this, UnexpectedErrorCode.prototype);
  }
  toErrorMessage() {
    return `Unexpected error: ${formatUnknownError(this.error)}`;
  }
}
class HashTreeDecodeErrorCode extends ErrorCode {
  constructor(error) {
    super();
    this.error = error;
    this.name = "HashTreeDecodeErrorCode";
    Object.setPrototypeOf(this, HashTreeDecodeErrorCode.prototype);
  }
  toErrorMessage() {
    return `Failed to decode certificate: ${this.error}`;
  }
}
class HttpErrorCode extends ErrorCode {
  constructor(status, statusText, headers, bodyText) {
    super();
    this.status = status;
    this.statusText = statusText;
    this.headers = headers;
    this.bodyText = bodyText;
    this.name = "HttpErrorCode";
    Object.setPrototypeOf(this, HttpErrorCode.prototype);
  }
  toErrorMessage() {
    let errorMessage = `HTTP request failed:
  Status: ${this.status} (${this.statusText})
  Headers: ${JSON.stringify(this.headers)}
`;
    if (this.bodyText) {
      errorMessage += `  Body: ${this.bodyText}
`;
    }
    return errorMessage;
  }
}
class HttpV3ApiNotSupportedErrorCode extends ErrorCode {
  constructor() {
    super();
    this.name = "HttpV3ApiNotSupportedErrorCode";
    Object.setPrototypeOf(this, HttpV3ApiNotSupportedErrorCode.prototype);
  }
  toErrorMessage() {
    return "HTTP request failed: v3 API is not supported";
  }
}
class HttpFetchErrorCode extends ErrorCode {
  constructor(error) {
    super();
    this.error = error;
    this.name = "HttpFetchErrorCode";
    Object.setPrototypeOf(this, HttpFetchErrorCode.prototype);
  }
  toErrorMessage() {
    return `Failed to fetch HTTP request: ${formatUnknownError(this.error)}`;
  }
}
class MissingCanisterIdErrorCode extends ErrorCode {
  constructor(receivedCanisterId) {
    super();
    this.receivedCanisterId = receivedCanisterId;
    this.name = "MissingCanisterIdErrorCode";
    Object.setPrototypeOf(this, MissingCanisterIdErrorCode.prototype);
  }
  toErrorMessage() {
    return `Canister ID is required, but received ${typeof this.receivedCanisterId} instead. If you are using automatically generated declarations, this may be because your application is not setting the canister ID in process.env correctly.`;
  }
}
class InvalidReadStateRequestErrorCode extends ErrorCode {
  constructor(request2) {
    super();
    this.request = request2;
    this.name = "InvalidReadStateRequestErrorCode";
    Object.setPrototypeOf(this, InvalidReadStateRequestErrorCode.prototype);
  }
  toErrorMessage() {
    return `Invalid read state request: ${this.request}`;
  }
}
class ExpiryJsonDeserializeErrorCode extends ErrorCode {
  constructor(error) {
    super();
    this.error = error;
    this.name = "ExpiryJsonDeserializeErrorCode";
    Object.setPrototypeOf(this, ExpiryJsonDeserializeErrorCode.prototype);
  }
  toErrorMessage() {
    return `Failed to deserialize expiry: ${this.error}`;
  }
}
function formatUnknownError(error) {
  if (error instanceof Error) {
    return error.stack ?? error.message;
  }
  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
}
const UNREACHABLE_ERROR = new Error("unreachable");
function concat(...uint8Arrays) {
  const result = new Uint8Array(uint8Arrays.reduce((acc, curr) => acc + curr.byteLength, 0));
  let index = 0;
  for (const b2 of uint8Arrays) {
    result.set(b2, index);
    index += b2.byteLength;
  }
  return result;
}
class PipeArrayBuffer {
  /**
   * Save a checkpoint of the reading view (for backtracking)
   */
  save() {
    return this._view;
  }
  /**
   * Restore a checkpoint of the reading view (for backtracking)
   * @param checkPoint a previously saved checkpoint
   */
  restore(checkPoint) {
    if (!(checkPoint instanceof Uint8Array)) {
      throw new Error("Checkpoint must be a Uint8Array");
    }
    this._view = checkPoint;
  }
  /**
   * Creates a new instance of a pipe
   * @param buffer an optional buffer to start with
   * @param length an optional amount of bytes to use for the length.
   */
  constructor(buffer, length = buffer?.byteLength || 0) {
    if (buffer && !(buffer instanceof Uint8Array)) {
      try {
        buffer = uint8FromBufLike$1(buffer);
      } catch {
        throw new Error("Buffer must be a Uint8Array");
      }
    }
    if (length < 0 || !Number.isInteger(length)) {
      throw new Error("Length must be a non-negative integer");
    }
    if (buffer && length > buffer.byteLength) {
      throw new Error("Length cannot exceed buffer length");
    }
    this._buffer = buffer || new Uint8Array(0);
    this._view = new Uint8Array(this._buffer.buffer, 0, length);
  }
  get buffer() {
    return this._view.slice();
  }
  get byteLength() {
    return this._view.byteLength;
  }
  /**
   * Read `num` number of bytes from the front of the pipe.
   * @param num The number of bytes to read.
   */
  read(num) {
    const result = this._view.subarray(0, num);
    this._view = this._view.subarray(num);
    return result.slice();
  }
  readUint8() {
    if (this._view.byteLength === 0) {
      return void 0;
    }
    const result = this._view[0];
    this._view = this._view.subarray(1);
    return result;
  }
  /**
   * Write a buffer to the end of the pipe.
   * @param buf The bytes to write.
   */
  write(buf) {
    if (!(buf instanceof Uint8Array)) {
      throw new Error("Buffer must be a Uint8Array");
    }
    const offset = this._view.byteLength;
    if (this._view.byteOffset + this._view.byteLength + buf.byteLength >= this._buffer.byteLength) {
      this.alloc(buf.byteLength);
    } else {
      this._view = new Uint8Array(this._buffer.buffer, this._view.byteOffset, this._view.byteLength + buf.byteLength);
    }
    this._view.set(buf, offset);
  }
  /**
   * Whether or not there is more data to read from the buffer
   */
  get end() {
    return this._view.byteLength === 0;
  }
  /**
   * Allocate a fixed amount of memory in the buffer. This does not affect the view.
   * @param amount A number of bytes to add to the buffer.
   */
  alloc(amount) {
    if (amount <= 0 || !Number.isInteger(amount)) {
      throw new Error("Amount must be a positive integer");
    }
    const b2 = new Uint8Array((this._buffer.byteLength + amount) * 1.2 | 0);
    const v3 = new Uint8Array(b2.buffer, 0, this._view.byteLength + amount);
    v3.set(this._view);
    this._buffer = b2;
    this._view = v3;
  }
}
function uint8FromBufLike$1(bufLike) {
  if (!bufLike) {
    throw new Error("Input cannot be null or undefined");
  }
  if (bufLike instanceof Uint8Array) {
    return bufLike;
  }
  if (bufLike instanceof ArrayBuffer) {
    return new Uint8Array(bufLike);
  }
  if (Array.isArray(bufLike)) {
    return new Uint8Array(bufLike);
  }
  if ("buffer" in bufLike) {
    return uint8FromBufLike$1(bufLike.buffer);
  }
  return new Uint8Array(bufLike);
}
function compare(u1, u2) {
  if (u1.byteLength !== u2.byteLength) {
    return u1.byteLength - u2.byteLength;
  }
  for (let i3 = 0; i3 < u1.length; i3++) {
    if (u1[i3] !== u2[i3]) {
      return u1[i3] - u2[i3];
    }
  }
  return 0;
}
function uint8Equals$1(u1, u2) {
  return compare(u1, u2) === 0;
}
function uint8ToDataView(uint8) {
  if (!(uint8 instanceof Uint8Array)) {
    throw new Error("Input must be a Uint8Array");
  }
  return new DataView(uint8.buffer, uint8.byteOffset, uint8.byteLength);
}
function idlHash(s2) {
  const utf8encoder = new TextEncoder();
  const array = utf8encoder.encode(s2);
  let h2 = 0;
  for (const c2 of array) {
    h2 = (h2 * 223 + c2) % 2 ** 32;
  }
  return h2;
}
function idlLabelToId(label) {
  if (/^_\d+_$/.test(label) || /^_0x[0-9a-fA-F]+_$/.test(label)) {
    const num = +label.slice(1, -1);
    if (Number.isSafeInteger(num) && num >= 0 && num < 2 ** 32) {
      return num;
    }
  }
  return idlHash(label);
}
function ilog2(n2) {
  const nBig = BigInt(n2);
  if (n2 <= 0) {
    throw new RangeError("Input must be positive");
  }
  return nBig.toString(2).length - 1;
}
function iexp2(n2) {
  const nBig = BigInt(n2);
  if (n2 < 0) {
    throw new RangeError("Input must be non-negative");
  }
  return BigInt(1) << nBig;
}
function eob() {
  throw new Error("unexpected end of buffer");
}
function safeRead(pipe, num) {
  if (pipe.byteLength < num) {
    eob();
  }
  return pipe.read(num);
}
function safeReadUint8(pipe) {
  const byte = pipe.readUint8();
  if (byte === void 0) {
    eob();
  }
  return byte;
}
function lebEncode(value) {
  if (typeof value === "number") {
    value = BigInt(value);
  }
  if (value < BigInt(0)) {
    throw new Error("Cannot leb encode negative values.");
  }
  const byteLength = (value === BigInt(0) ? 0 : ilog2(value)) + 1;
  const pipe = new PipeArrayBuffer(new Uint8Array(byteLength), 0);
  while (true) {
    const i3 = Number(value & BigInt(127));
    value /= BigInt(128);
    if (value === BigInt(0)) {
      pipe.write(new Uint8Array([i3]));
      break;
    } else {
      pipe.write(new Uint8Array([i3 | 128]));
    }
  }
  return pipe.buffer;
}
function lebDecode(pipe) {
  let weight = BigInt(1);
  let value = BigInt(0);
  let byte;
  do {
    byte = safeReadUint8(pipe);
    value += BigInt(byte & 127).valueOf() * weight;
    weight *= BigInt(128);
  } while (byte >= 128);
  return value;
}
function slebEncode(value) {
  if (typeof value === "number") {
    value = BigInt(value);
  }
  const isNeg = value < BigInt(0);
  if (isNeg) {
    value = -value - BigInt(1);
  }
  const byteLength = (value === BigInt(0) ? 0 : ilog2(value)) + 1;
  const pipe = new PipeArrayBuffer(new Uint8Array(byteLength), 0);
  while (true) {
    const i3 = getLowerBytes(value);
    value /= BigInt(128);
    if (isNeg && value === BigInt(0) && (i3 & 64) !== 0 || !isNeg && value === BigInt(0) && (i3 & 64) === 0) {
      pipe.write(new Uint8Array([i3]));
      break;
    } else {
      pipe.write(new Uint8Array([i3 | 128]));
    }
  }
  function getLowerBytes(num) {
    const bytes = num % BigInt(128);
    if (isNeg) {
      return Number(BigInt(128) - bytes - BigInt(1));
    } else {
      return Number(bytes);
    }
  }
  return pipe.buffer;
}
function slebDecode(pipe) {
  const pipeView = new Uint8Array(pipe.buffer);
  let len = 0;
  for (; len < pipeView.byteLength; len++) {
    if (pipeView[len] < 128) {
      if ((pipeView[len] & 64) === 0) {
        return lebDecode(pipe);
      }
      break;
    }
  }
  const bytes = new Uint8Array(safeRead(pipe, len + 1));
  let value = BigInt(0);
  for (let i3 = bytes.byteLength - 1; i3 >= 0; i3--) {
    value = value * BigInt(128) + BigInt(128 - (bytes[i3] & 127) - 1);
  }
  return -value - BigInt(1);
}
function writeUIntLE(value, byteLength) {
  if (BigInt(value) < BigInt(0)) {
    throw new Error("Cannot write negative values.");
  }
  return writeIntLE(value, byteLength);
}
function writeIntLE(value, byteLength) {
  value = BigInt(value);
  const pipe = new PipeArrayBuffer(new Uint8Array(Math.min(1, byteLength)), 0);
  let i3 = 0;
  let mul = BigInt(256);
  let sub = BigInt(0);
  let byte = Number(value % mul);
  pipe.write(new Uint8Array([byte]));
  while (++i3 < byteLength) {
    if (value < 0 && sub === BigInt(0) && byte !== 0) {
      sub = BigInt(1);
    }
    byte = Number((value / mul - sub) % BigInt(256));
    pipe.write(new Uint8Array([byte]));
    mul *= BigInt(256);
  }
  return pipe.buffer;
}
function readUIntLE(pipe, byteLength) {
  if (byteLength <= 0 || !Number.isInteger(byteLength)) {
    throw new Error("Byte length must be a positive integer");
  }
  let val = BigInt(safeReadUint8(pipe));
  let mul = BigInt(1);
  let i3 = 0;
  while (++i3 < byteLength) {
    mul *= BigInt(256);
    const byte = BigInt(safeReadUint8(pipe));
    val = val + mul * byte;
  }
  return val;
}
function readIntLE(pipe, byteLength) {
  if (byteLength <= 0 || !Number.isInteger(byteLength)) {
    throw new Error("Byte length must be a positive integer");
  }
  let val = readUIntLE(pipe, byteLength);
  const mul = BigInt(2) ** (BigInt(8) * BigInt(byteLength - 1) + BigInt(7));
  if (val >= mul) {
    val -= mul * BigInt(2);
  }
  return val;
}
var IDLTypeIds;
(function(IDLTypeIds2) {
  IDLTypeIds2[IDLTypeIds2["Null"] = -1] = "Null";
  IDLTypeIds2[IDLTypeIds2["Bool"] = -2] = "Bool";
  IDLTypeIds2[IDLTypeIds2["Nat"] = -3] = "Nat";
  IDLTypeIds2[IDLTypeIds2["Int"] = -4] = "Int";
  IDLTypeIds2[IDLTypeIds2["Float32"] = -13] = "Float32";
  IDLTypeIds2[IDLTypeIds2["Float64"] = -14] = "Float64";
  IDLTypeIds2[IDLTypeIds2["Text"] = -15] = "Text";
  IDLTypeIds2[IDLTypeIds2["Reserved"] = -16] = "Reserved";
  IDLTypeIds2[IDLTypeIds2["Empty"] = -17] = "Empty";
  IDLTypeIds2[IDLTypeIds2["Opt"] = -18] = "Opt";
  IDLTypeIds2[IDLTypeIds2["Vector"] = -19] = "Vector";
  IDLTypeIds2[IDLTypeIds2["Record"] = -20] = "Record";
  IDLTypeIds2[IDLTypeIds2["Variant"] = -21] = "Variant";
  IDLTypeIds2[IDLTypeIds2["Func"] = -22] = "Func";
  IDLTypeIds2[IDLTypeIds2["Service"] = -23] = "Service";
  IDLTypeIds2[IDLTypeIds2["Principal"] = -24] = "Principal";
})(IDLTypeIds || (IDLTypeIds = {}));
const magicNumber = "DIDL";
const toReadableString_max = 400;
function zipWith(xs, ys, f2) {
  return xs.map((x3, i3) => f2(x3, ys[i3]));
}
class TypeTable {
  constructor() {
    this._typs = [];
    this._idx = /* @__PURE__ */ new Map();
    this._idxRefCount = /* @__PURE__ */ new Map();
  }
  has(obj) {
    return this._idx.has(obj.name);
  }
  add(type, buf) {
    const idx = this._typs.length;
    this._idx.set(type.name, idx);
    this._idxRefCount.set(idx, 1);
    this._typs.push(buf);
  }
  merge(obj, knot) {
    const idx = this._idx.get(obj.name);
    const knotIdx = this._idx.get(knot);
    if (idx === void 0) {
      throw new Error("Missing type index for " + obj);
    }
    if (knotIdx === void 0) {
      throw new Error("Missing type index for " + knot);
    }
    this._typs[idx] = this._typs[knotIdx];
    const knotRefCount = this._getIdxRefCount(knotIdx);
    this._idxRefCount.set(knotIdx, knotRefCount - 1);
    this._idx.delete(knot);
    this._compactFromEnd();
  }
  _getIdxRefCount(idx) {
    return this._idxRefCount.get(idx) || 0;
  }
  _compactFromEnd() {
    while (this._typs.length > 0) {
      const lastIndex = this._typs.length - 1;
      if (this._getIdxRefCount(lastIndex) > 0) {
        break;
      }
      this._typs.pop();
      this._idxRefCount.delete(lastIndex);
    }
  }
  encode() {
    const len = lebEncode(this._typs.length);
    const buf = concat(...this._typs);
    return concat(len, buf);
  }
  indexOf(typeName) {
    if (!this._idx.has(typeName)) {
      throw new Error("Missing type index for " + typeName);
    }
    return slebEncode(this._idx.get(typeName) || 0);
  }
}
class Visitor {
  visitType(_t2, _data) {
    throw new Error("Not implemented");
  }
  visitPrimitive(t3, data) {
    return this.visitType(t3, data);
  }
  visitEmpty(t3, data) {
    return this.visitPrimitive(t3, data);
  }
  visitBool(t3, data) {
    return this.visitPrimitive(t3, data);
  }
  visitNull(t3, data) {
    return this.visitPrimitive(t3, data);
  }
  visitReserved(t3, data) {
    return this.visitPrimitive(t3, data);
  }
  visitText(t3, data) {
    return this.visitPrimitive(t3, data);
  }
  visitNumber(t3, data) {
    return this.visitPrimitive(t3, data);
  }
  visitInt(t3, data) {
    return this.visitNumber(t3, data);
  }
  visitNat(t3, data) {
    return this.visitNumber(t3, data);
  }
  visitFloat(t3, data) {
    return this.visitPrimitive(t3, data);
  }
  visitFixedInt(t3, data) {
    return this.visitNumber(t3, data);
  }
  visitFixedNat(t3, data) {
    return this.visitNumber(t3, data);
  }
  visitPrincipal(t3, data) {
    return this.visitPrimitive(t3, data);
  }
  visitConstruct(t3, data) {
    return this.visitType(t3, data);
  }
  visitVec(t3, _ty, data) {
    return this.visitConstruct(t3, data);
  }
  visitOpt(t3, _ty, data) {
    return this.visitConstruct(t3, data);
  }
  visitRecord(t3, _fields, data) {
    return this.visitConstruct(t3, data);
  }
  visitTuple(t3, components, data) {
    const fields = components.map((ty, i3) => [`_${i3}_`, ty]);
    return this.visitRecord(t3, fields, data);
  }
  visitVariant(t3, _fields, data) {
    return this.visitConstruct(t3, data);
  }
  visitRec(_t2, ty, data) {
    return this.visitConstruct(ty, data);
  }
  visitFunc(t3, data) {
    return this.visitConstruct(t3, data);
  }
  visitService(t3, data) {
    return this.visitConstruct(t3, data);
  }
}
var IdlTypeName;
(function(IdlTypeName2) {
  IdlTypeName2["EmptyClass"] = "__IDL_EmptyClass__";
  IdlTypeName2["UnknownClass"] = "__IDL_UnknownClass__";
  IdlTypeName2["BoolClass"] = "__IDL_BoolClass__";
  IdlTypeName2["NullClass"] = "__IDL_NullClass__";
  IdlTypeName2["ReservedClass"] = "__IDL_ReservedClass__";
  IdlTypeName2["TextClass"] = "__IDL_TextClass__";
  IdlTypeName2["IntClass"] = "__IDL_IntClass__";
  IdlTypeName2["NatClass"] = "__IDL_NatClass__";
  IdlTypeName2["FloatClass"] = "__IDL_FloatClass__";
  IdlTypeName2["FixedIntClass"] = "__IDL_FixedIntClass__";
  IdlTypeName2["FixedNatClass"] = "__IDL_FixedNatClass__";
  IdlTypeName2["VecClass"] = "__IDL_VecClass__";
  IdlTypeName2["OptClass"] = "__IDL_OptClass__";
  IdlTypeName2["RecordClass"] = "__IDL_RecordClass__";
  IdlTypeName2["TupleClass"] = "__IDL_TupleClass__";
  IdlTypeName2["VariantClass"] = "__IDL_VariantClass__";
  IdlTypeName2["RecClass"] = "__IDL_RecClass__";
  IdlTypeName2["PrincipalClass"] = "__IDL_PrincipalClass__";
  IdlTypeName2["FuncClass"] = "__IDL_FuncClass__";
  IdlTypeName2["ServiceClass"] = "__IDL_ServiceClass__";
})(IdlTypeName || (IdlTypeName = {}));
class Type {
  /* Display type name */
  display() {
    return this.name;
  }
  valueToString(x3) {
    return toReadableString(x3);
  }
  /* Implement `T` in the IDL spec, only needed for non-primitive types */
  buildTypeTable(typeTable) {
    if (!typeTable.has(this)) {
      this._buildTypeTableImpl(typeTable);
    }
  }
}
class PrimitiveType extends Type {
  checkType(t3) {
    if (this.name !== t3.name) {
      throw new Error(`type mismatch: type on the wire ${t3.name}, expect type ${this.name}`);
    }
    return t3;
  }
  _buildTypeTableImpl(_typeTable) {
    return;
  }
}
class ConstructType extends Type {
  checkType(t3) {
    if (t3 instanceof RecClass) {
      const ty = t3.getType();
      if (typeof ty === "undefined") {
        throw new Error("type mismatch with uninitialized type");
      }
      return ty;
    }
    throw new Error(`type mismatch: type on the wire ${t3.name}, expect type ${this.name}`);
  }
  encodeType(typeTable) {
    return typeTable.indexOf(this.name);
  }
}
class EmptyClass extends PrimitiveType {
  get typeName() {
    return IdlTypeName.EmptyClass;
  }
  static [Symbol.hasInstance](instance) {
    return instance.typeName === IdlTypeName.EmptyClass;
  }
  accept(v3, d2) {
    return v3.visitEmpty(this, d2);
  }
  covariant(x3) {
    throw new Error(`Invalid ${this.display()} argument: ${toReadableString(x3)}`);
  }
  encodeValue() {
    throw new Error("Empty cannot appear as a function argument");
  }
  valueToString() {
    throw new Error("Empty cannot appear as a value");
  }
  encodeType() {
    return slebEncode(IDLTypeIds.Empty);
  }
  decodeValue() {
    throw new Error("Empty cannot appear as an output");
  }
  get name() {
    return "empty";
  }
}
class UnknownClass extends Type {
  get typeName() {
    return IdlTypeName.UnknownClass;
  }
  static [Symbol.hasInstance](instance) {
    return instance.typeName === IdlTypeName.UnknownClass;
  }
  checkType(_t2) {
    throw new Error("Method not implemented for unknown.");
  }
  accept(v3, d2) {
    throw v3.visitType(this, d2);
  }
  covariant(x3) {
    throw new Error(`Invalid ${this.display()} argument: ${toReadableString(x3)}`);
  }
  encodeValue() {
    throw new Error("Unknown cannot appear as a function argument");
  }
  valueToString() {
    throw new Error("Unknown cannot appear as a value");
  }
  encodeType() {
    throw new Error("Unknown cannot be serialized");
  }
  decodeValue(b2, t3) {
    let decodedValue = t3.decodeValue(b2, t3);
    if (Object(decodedValue) !== decodedValue) {
      decodedValue = Object(decodedValue);
    }
    let typeFunc;
    if (t3 instanceof RecClass) {
      typeFunc = () => t3.getType();
    } else {
      typeFunc = () => t3;
    }
    Object.defineProperty(decodedValue, "type", {
      value: typeFunc,
      writable: true,
      enumerable: false,
      configurable: true
    });
    return decodedValue;
  }
  _buildTypeTableImpl() {
    throw new Error("Unknown cannot be serialized");
  }
  get name() {
    return "Unknown";
  }
}
class BoolClass extends PrimitiveType {
  get typeName() {
    return IdlTypeName.BoolClass;
  }
  static [Symbol.hasInstance](instance) {
    return instance.typeName === IdlTypeName.BoolClass;
  }
  accept(v3, d2) {
    return v3.visitBool(this, d2);
  }
  covariant(x3) {
    if (typeof x3 === "boolean")
      return true;
    throw new Error(`Invalid ${this.display()} argument: ${toReadableString(x3)}`);
  }
  encodeValue(x3) {
    return new Uint8Array([x3 ? 1 : 0]);
  }
  encodeType() {
    return slebEncode(IDLTypeIds.Bool);
  }
  decodeValue(b2, t3) {
    this.checkType(t3);
    switch (safeReadUint8(b2)) {
      case 0:
        return false;
      case 1:
        return true;
      default:
        throw new Error("Boolean value out of range");
    }
  }
  get name() {
    return "bool";
  }
}
class NullClass extends PrimitiveType {
  get typeName() {
    return IdlTypeName.NullClass;
  }
  static [Symbol.hasInstance](instance) {
    return instance.typeName === IdlTypeName.NullClass;
  }
  accept(v3, d2) {
    return v3.visitNull(this, d2);
  }
  covariant(x3) {
    if (x3 === null)
      return true;
    throw new Error(`Invalid ${this.display()} argument: ${toReadableString(x3)}`);
  }
  encodeValue() {
    return new Uint8Array(0);
  }
  encodeType() {
    return slebEncode(IDLTypeIds.Null);
  }
  decodeValue(_b2, t3) {
    this.checkType(t3);
    return null;
  }
  get name() {
    return "null";
  }
}
class ReservedClass extends PrimitiveType {
  get typeName() {
    return IdlTypeName.ReservedClass;
  }
  static [Symbol.hasInstance](instance) {
    return instance.typeName === IdlTypeName.ReservedClass;
  }
  accept(v3, d2) {
    return v3.visitReserved(this, d2);
  }
  covariant(_x) {
    return true;
  }
  encodeValue() {
    return new Uint8Array(0);
  }
  encodeType() {
    return slebEncode(IDLTypeIds.Reserved);
  }
  decodeValue(b2, t3) {
    if (t3.name !== this.name) {
      t3.decodeValue(b2, t3);
    }
    return null;
  }
  get name() {
    return "reserved";
  }
}
class TextClass extends PrimitiveType {
  get typeName() {
    return IdlTypeName.TextClass;
  }
  static [Symbol.hasInstance](instance) {
    return instance.typeName === IdlTypeName.TextClass;
  }
  accept(v3, d2) {
    return v3.visitText(this, d2);
  }
  covariant(x3) {
    if (typeof x3 === "string")
      return true;
    throw new Error(`Invalid ${this.display()} argument: ${toReadableString(x3)}`);
  }
  encodeValue(x3) {
    const buf = new TextEncoder().encode(x3);
    const len = lebEncode(buf.byteLength);
    return concat(len, buf);
  }
  encodeType() {
    return slebEncode(IDLTypeIds.Text);
  }
  decodeValue(b2, t3) {
    this.checkType(t3);
    const len = lebDecode(b2);
    const buf = safeRead(b2, Number(len));
    const decoder = new TextDecoder("utf8", { fatal: true });
    return decoder.decode(buf);
  }
  get name() {
    return "text";
  }
  valueToString(x3) {
    return '"' + x3 + '"';
  }
}
class IntClass extends PrimitiveType {
  get typeName() {
    return IdlTypeName.IntClass;
  }
  static [Symbol.hasInstance](instance) {
    return instance.typeName === IdlTypeName.IntClass;
  }
  accept(v3, d2) {
    return v3.visitInt(this, d2);
  }
  covariant(x3) {
    if (typeof x3 === "bigint" || Number.isInteger(x3))
      return true;
    throw new Error(`Invalid ${this.display()} argument: ${toReadableString(x3)}`);
  }
  encodeValue(x3) {
    return slebEncode(x3);
  }
  encodeType() {
    return slebEncode(IDLTypeIds.Int);
  }
  decodeValue(b2, t3) {
    this.checkType(t3);
    return slebDecode(b2);
  }
  get name() {
    return "int";
  }
  valueToString(x3) {
    return x3.toString();
  }
}
class NatClass extends PrimitiveType {
  get typeName() {
    return IdlTypeName.NatClass;
  }
  static [Symbol.hasInstance](instance) {
    return instance.typeName === IdlTypeName.NatClass;
  }
  accept(v3, d2) {
    return v3.visitNat(this, d2);
  }
  covariant(x3) {
    if (typeof x3 === "bigint" && x3 >= BigInt(0) || Number.isInteger(x3) && x3 >= 0)
      return true;
    throw new Error(`Invalid ${this.display()} argument: ${toReadableString(x3)}`);
  }
  encodeValue(x3) {
    return lebEncode(x3);
  }
  encodeType() {
    return slebEncode(IDLTypeIds.Nat);
  }
  decodeValue(b2, t3) {
    this.checkType(t3);
    return lebDecode(b2);
  }
  get name() {
    return "nat";
  }
  valueToString(x3) {
    return x3.toString();
  }
}
class FloatClass extends PrimitiveType {
  get typeName() {
    return IdlTypeName.FloatClass;
  }
  static [Symbol.hasInstance](instance) {
    return instance.typeName === IdlTypeName.FloatClass;
  }
  constructor(_bits) {
    super();
    this._bits = _bits;
    if (_bits !== 32 && _bits !== 64) {
      throw new Error("not a valid float type");
    }
  }
  accept(v3, d2) {
    return v3.visitFloat(this, d2);
  }
  covariant(x3) {
    if (typeof x3 === "number" || x3 instanceof Number)
      return true;
    throw new Error(`Invalid ${this.display()} argument: ${toReadableString(x3)}`);
  }
  encodeValue(x3) {
    const buf = new ArrayBuffer(this._bits / 8);
    const view = new DataView(buf);
    if (this._bits === 32) {
      view.setFloat32(0, x3, true);
    } else {
      view.setFloat64(0, x3, true);
    }
    return new Uint8Array(buf);
  }
  encodeType() {
    const opcode = this._bits === 32 ? IDLTypeIds.Float32 : IDLTypeIds.Float64;
    return slebEncode(opcode);
  }
  decodeValue(b2, t3) {
    this.checkType(t3);
    const bytes = safeRead(b2, this._bits / 8);
    const view = uint8ToDataView(bytes);
    if (this._bits === 32) {
      return view.getFloat32(0, true);
    } else {
      return view.getFloat64(0, true);
    }
  }
  get name() {
    return "float" + this._bits;
  }
  valueToString(x3) {
    return x3.toString();
  }
}
class FixedIntClass extends PrimitiveType {
  get typeName() {
    return IdlTypeName.FixedIntClass;
  }
  static [Symbol.hasInstance](instance) {
    return instance.typeName === IdlTypeName.FixedIntClass;
  }
  constructor(_bits) {
    super();
    this._bits = _bits;
  }
  accept(v3, d2) {
    return v3.visitFixedInt(this, d2);
  }
  covariant(x3) {
    const min = iexp2(this._bits - 1) * BigInt(-1);
    const max = iexp2(this._bits - 1) - BigInt(1);
    let ok = false;
    if (typeof x3 === "bigint") {
      ok = x3 >= min && x3 <= max;
    } else if (Number.isInteger(x3)) {
      const v3 = BigInt(x3);
      ok = v3 >= min && v3 <= max;
    } else {
      ok = false;
    }
    if (ok)
      return true;
    throw new Error(`Invalid ${this.display()} argument: ${toReadableString(x3)}`);
  }
  encodeValue(x3) {
    return writeIntLE(x3, this._bits / 8);
  }
  encodeType() {
    const offset = Math.log2(this._bits) - 3;
    return slebEncode(-9 - offset);
  }
  decodeValue(b2, t3) {
    this.checkType(t3);
    const num = readIntLE(b2, this._bits / 8);
    if (this._bits <= 32) {
      return Number(num);
    } else {
      return num;
    }
  }
  get name() {
    return `int${this._bits}`;
  }
  valueToString(x3) {
    return x3.toString();
  }
}
class FixedNatClass extends PrimitiveType {
  get typeName() {
    return IdlTypeName.FixedNatClass;
  }
  static [Symbol.hasInstance](instance) {
    return instance.typeName === IdlTypeName.FixedNatClass;
  }
  constructor(_bits) {
    super();
    this._bits = _bits;
  }
  accept(v3, d2) {
    return v3.visitFixedNat(this, d2);
  }
  covariant(x3) {
    const max = iexp2(this._bits);
    let ok = false;
    if (typeof x3 === "bigint" && x3 >= BigInt(0)) {
      ok = x3 < max;
    } else if (Number.isInteger(x3) && x3 >= 0) {
      const v3 = BigInt(x3);
      ok = v3 < max;
    } else {
      ok = false;
    }
    if (ok)
      return true;
    throw new Error(`Invalid ${this.display()} argument: ${toReadableString(x3)}`);
  }
  encodeValue(x3) {
    return writeUIntLE(x3, this._bits / 8);
  }
  encodeType() {
    const offset = Math.log2(this._bits) - 3;
    return slebEncode(-5 - offset);
  }
  decodeValue(b2, t3) {
    this.checkType(t3);
    const num = readUIntLE(b2, this._bits / 8);
    if (this._bits <= 32) {
      return Number(num);
    } else {
      return num;
    }
  }
  get name() {
    return `nat${this._bits}`;
  }
  valueToString(x3) {
    return x3.toString();
  }
}
class VecClass extends ConstructType {
  get typeName() {
    return IdlTypeName.VecClass;
  }
  static [Symbol.hasInstance](instance) {
    return instance.typeName === IdlTypeName.VecClass;
  }
  constructor(_type) {
    super();
    this._type = _type;
    this._blobOptimization = false;
    if (_type instanceof FixedNatClass && _type._bits === 8) {
      this._blobOptimization = true;
    }
  }
  accept(v3, d2) {
    return v3.visitVec(this, this._type, d2);
  }
  covariant(x3) {
    const bits = this._type instanceof FixedNatClass ? this._type._bits : this._type instanceof FixedIntClass ? this._type._bits : 0;
    if (ArrayBuffer.isView(x3) && bits == x3.BYTES_PER_ELEMENT * 8 || Array.isArray(x3) && x3.every((v3, idx) => {
      try {
        return this._type.covariant(v3);
      } catch (e5) {
        throw new Error(`Invalid ${this.display()} argument: 

index ${idx} -> ${e5.message}`);
      }
    }))
      return true;
    throw new Error(`Invalid ${this.display()} argument: ${toReadableString(x3)}`);
  }
  encodeValue(x3) {
    const len = lebEncode(x3.length);
    if (this._blobOptimization) {
      return concat(len, new Uint8Array(x3));
    }
    if (ArrayBuffer.isView(x3)) {
      if (x3 instanceof Int16Array || x3 instanceof Uint16Array) {
        const buffer = new DataView(new ArrayBuffer(x3.length * 2));
        for (let i3 = 0; i3 < x3.length; i3++) {
          if (x3 instanceof Int16Array) {
            buffer.setInt16(i3 * 2, x3[i3], true);
          } else {
            buffer.setUint16(i3 * 2, x3[i3], true);
          }
        }
        return concat(len, new Uint8Array(buffer.buffer));
      } else if (x3 instanceof Int32Array || x3 instanceof Uint32Array) {
        const buffer = new DataView(new ArrayBuffer(x3.length * 4));
        for (let i3 = 0; i3 < x3.length; i3++) {
          if (x3 instanceof Int32Array) {
            buffer.setInt32(i3 * 4, x3[i3], true);
          } else {
            buffer.setUint32(i3 * 4, x3[i3], true);
          }
        }
        return concat(len, new Uint8Array(buffer.buffer));
      } else if (x3 instanceof BigInt64Array || x3 instanceof BigUint64Array) {
        const buffer = new DataView(new ArrayBuffer(x3.length * 8));
        for (let i3 = 0; i3 < x3.length; i3++) {
          if (x3 instanceof BigInt64Array) {
            buffer.setBigInt64(i3 * 8, x3[i3], true);
          } else {
            buffer.setBigUint64(i3 * 8, x3[i3], true);
          }
        }
        return concat(len, new Uint8Array(buffer.buffer));
      } else {
        return concat(len, new Uint8Array(x3.buffer, x3.byteOffset, x3.byteLength));
      }
    }
    const buf = new PipeArrayBuffer(new Uint8Array(len.byteLength + x3.length), 0);
    buf.write(len);
    for (const d2 of x3) {
      const encoded = this._type.encodeValue(d2);
      buf.write(new Uint8Array(encoded));
    }
    return buf.buffer;
  }
  _buildTypeTableImpl(typeTable) {
    this._type.buildTypeTable(typeTable);
    const opCode = slebEncode(IDLTypeIds.Vector);
    const buffer = this._type.encodeType(typeTable);
    typeTable.add(this, concat(opCode, buffer));
  }
  decodeValue(b2, t3) {
    const vec = this.checkType(t3);
    if (!(vec instanceof VecClass)) {
      throw new Error("Not a vector type");
    }
    const len = Number(lebDecode(b2));
    if (this._type instanceof FixedNatClass) {
      if (this._type._bits == 8) {
        return new Uint8Array(b2.read(len));
      }
      if (this._type._bits == 16) {
        const bytes = b2.read(len * 2);
        const u16 = new Uint16Array(bytes.buffer, bytes.byteOffset, len);
        return u16;
      }
      if (this._type._bits == 32) {
        const bytes = b2.read(len * 4);
        const u32 = new Uint32Array(bytes.buffer, bytes.byteOffset, len);
        return u32;
      }
      if (this._type._bits == 64) {
        return new BigUint64Array(b2.read(len * 8).buffer);
      }
    }
    if (this._type instanceof FixedIntClass) {
      if (this._type._bits == 8) {
        return new Int8Array(b2.read(len));
      }
      if (this._type._bits == 16) {
        const bytes = b2.read(len * 2);
        const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
        const result = new Int16Array(len);
        for (let i3 = 0; i3 < len; i3++) {
          result[i3] = view.getInt16(i3 * 2, true);
        }
        return result;
      }
      if (this._type._bits == 32) {
        const bytes = b2.read(len * 4);
        const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
        const result = new Int32Array(len);
        for (let i3 = 0; i3 < len; i3++) {
          result[i3] = view.getInt32(i3 * 4, true);
        }
        return result;
      }
      if (this._type._bits == 64) {
        const bytes = b2.read(len * 8);
        const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
        const result = new BigInt64Array(len);
        for (let i3 = 0; i3 < len; i3++) {
          result[i3] = view.getBigInt64(i3 * 8, true);
        }
        return result;
      }
    }
    const rets = [];
    for (let i3 = 0; i3 < len; i3++) {
      rets.push(this._type.decodeValue(b2, vec._type));
    }
    return rets;
  }
  get name() {
    return `vec ${this._type.name}`;
  }
  display() {
    return `vec ${this._type.display()}`;
  }
  valueToString(x3) {
    const elements = x3.map((e5) => this._type.valueToString(e5));
    return "vec {" + elements.join("; ") + "}";
  }
}
class OptClass extends ConstructType {
  get typeName() {
    return IdlTypeName.OptClass;
  }
  static [Symbol.hasInstance](instance) {
    return instance.typeName === IdlTypeName.OptClass;
  }
  constructor(_type) {
    super();
    this._type = _type;
  }
  accept(v3, d2) {
    return v3.visitOpt(this, this._type, d2);
  }
  covariant(x3) {
    try {
      if (Array.isArray(x3) && (x3.length === 0 || x3.length === 1 && this._type.covariant(x3[0])))
        return true;
    } catch (e5) {
      throw new Error(`Invalid ${this.display()} argument: ${toReadableString(x3)} 

-> ${e5.message}`);
    }
    throw new Error(`Invalid ${this.display()} argument: ${toReadableString(x3)}`);
  }
  encodeValue(x3) {
    if (x3.length === 0) {
      return new Uint8Array([0]);
    } else {
      return concat(new Uint8Array([1]), this._type.encodeValue(x3[0]));
    }
  }
  _buildTypeTableImpl(typeTable) {
    this._type.buildTypeTable(typeTable);
    const opCode = slebEncode(IDLTypeIds.Opt);
    const buffer = this._type.encodeType(typeTable);
    typeTable.add(this, concat(opCode, buffer));
  }
  decodeValue(b2, t3) {
    if (t3 instanceof NullClass) {
      return [];
    }
    if (t3 instanceof ReservedClass) {
      return [];
    }
    let wireType = t3;
    if (t3 instanceof RecClass) {
      const ty = t3.getType();
      if (typeof ty === "undefined") {
        throw new Error("type mismatch with uninitialized type");
      } else
        wireType = ty;
    }
    if (wireType instanceof OptClass) {
      switch (safeReadUint8(b2)) {
        case 0:
          return [];
        case 1: {
          const checkpoint = b2.save();
          try {
            const v3 = this._type.decodeValue(b2, wireType._type);
            return [v3];
          } catch (e5) {
            b2.restore(checkpoint);
            wireType._type.decodeValue(b2, wireType._type);
            return [];
          }
        }
        default:
          throw new Error("Not an option value");
      }
    } else if (
      // this check corresponds to `not (null <: <t>)` in the spec
      this._type instanceof NullClass || this._type instanceof OptClass || this._type instanceof ReservedClass
    ) {
      wireType.decodeValue(b2, wireType);
      return [];
    } else {
      const checkpoint = b2.save();
      try {
        const v3 = this._type.decodeValue(b2, t3);
        return [v3];
      } catch (e5) {
        b2.restore(checkpoint);
        wireType.decodeValue(b2, t3);
        return [];
      }
    }
  }
  get name() {
    return `opt ${this._type.name}`;
  }
  display() {
    return `opt ${this._type.display()}`;
  }
  valueToString(x3) {
    if (x3.length === 0) {
      return "null";
    } else {
      return `opt ${this._type.valueToString(x3[0])}`;
    }
  }
}
class RecordClass extends ConstructType {
  get typeName() {
    return IdlTypeName.RecordClass;
  }
  static [Symbol.hasInstance](instance) {
    return instance.typeName === IdlTypeName.RecordClass || instance.typeName === IdlTypeName.TupleClass;
  }
  constructor(fields = {}) {
    super();
    this._fields = Object.entries(fields).sort((a2, b2) => idlLabelToId(a2[0]) - idlLabelToId(b2[0]));
  }
  accept(v3, d2) {
    return v3.visitRecord(this, this._fields, d2);
  }
  tryAsTuple() {
    const res = [];
    for (let i3 = 0; i3 < this._fields.length; i3++) {
      const [key, type] = this._fields[i3];
      if (key !== `_${i3}_`) {
        return null;
      }
      res.push(type);
    }
    return res;
  }
  covariant(x3) {
    if (typeof x3 === "object" && this._fields.every(([k2, t3]) => {
      if (!x3.hasOwnProperty(k2)) {
        throw new Error(`Record is missing key "${k2}".`);
      }
      try {
        return t3.covariant(x3[k2]);
      } catch (e5) {
        throw new Error(`Invalid ${this.display()} argument: 

field ${k2} -> ${e5.message}`);
      }
    }))
      return true;
    throw new Error(`Invalid ${this.display()} argument: ${toReadableString(x3)}`);
  }
  encodeValue(x3) {
    const values = this._fields.map(([key]) => x3[key]);
    const bufs = zipWith(this._fields, values, ([, c2], d2) => c2.encodeValue(d2));
    return concat(...bufs);
  }
  _buildTypeTableImpl(T2) {
    this._fields.forEach(([_2, value]) => value.buildTypeTable(T2));
    const opCode = slebEncode(IDLTypeIds.Record);
    const len = lebEncode(this._fields.length);
    const fields = this._fields.map(([key, value]) => concat(lebEncode(idlLabelToId(key)), value.encodeType(T2)));
    T2.add(this, concat(opCode, len, concat(...fields)));
  }
  decodeValue(b2, t3) {
    const record = this.checkType(t3);
    if (!(record instanceof RecordClass)) {
      throw new Error("Not a record type");
    }
    const x3 = {};
    let expectedRecordIdx = 0;
    let actualRecordIdx = 0;
    while (actualRecordIdx < record._fields.length) {
      const [hash, type] = record._fields[actualRecordIdx];
      if (expectedRecordIdx >= this._fields.length) {
        type.decodeValue(b2, type);
        actualRecordIdx++;
        continue;
      }
      const [expectKey, expectType] = this._fields[expectedRecordIdx];
      const expectedId = idlLabelToId(this._fields[expectedRecordIdx][0]);
      const actualId = idlLabelToId(hash);
      if (expectedId === actualId) {
        x3[expectKey] = expectType.decodeValue(b2, type);
        expectedRecordIdx++;
        actualRecordIdx++;
      } else if (actualId > expectedId) {
        if (expectType instanceof OptClass || expectType instanceof ReservedClass) {
          x3[expectKey] = [];
          expectedRecordIdx++;
        } else {
          throw new Error("Cannot find required field " + expectKey);
        }
      } else {
        type.decodeValue(b2, type);
        actualRecordIdx++;
      }
    }
    for (const [expectKey, expectType] of this._fields.slice(expectedRecordIdx)) {
      if (expectType instanceof OptClass || expectType instanceof ReservedClass) {
        x3[expectKey] = [];
      } else {
        throw new Error("Cannot find required field " + expectKey);
      }
    }
    return x3;
  }
  get fieldsAsObject() {
    const fields = {};
    for (const [name, ty] of this._fields) {
      fields[idlLabelToId(name)] = ty;
    }
    return fields;
  }
  get name() {
    const fields = this._fields.map(([key, value]) => key + ":" + value.name);
    return `record {${fields.join("; ")}}`;
  }
  display() {
    const fields = this._fields.map(([key, value]) => key + ":" + value.display());
    return `record {${fields.join("; ")}}`;
  }
  valueToString(x3) {
    const values = this._fields.map(([key]) => x3[key]);
    const fields = zipWith(this._fields, values, ([k2, c2], d2) => k2 + "=" + c2.valueToString(d2));
    return `record {${fields.join("; ")}}`;
  }
}
class TupleClass extends RecordClass {
  get typeName() {
    return IdlTypeName.TupleClass;
  }
  static [Symbol.hasInstance](instance) {
    return instance.typeName === IdlTypeName.TupleClass;
  }
  constructor(_components) {
    const x3 = {};
    _components.forEach((e5, i3) => x3["_" + i3 + "_"] = e5);
    super(x3);
    this._components = _components;
  }
  accept(v3, d2) {
    return v3.visitTuple(this, this._components, d2);
  }
  covariant(x3) {
    if (Array.isArray(x3) && x3.length >= this._fields.length && this._components.every((t3, i3) => {
      try {
        return t3.covariant(x3[i3]);
      } catch (e5) {
        throw new Error(`Invalid ${this.display()} argument: 

index ${i3} -> ${e5.message}`);
      }
    }))
      return true;
    throw new Error(`Invalid ${this.display()} argument: ${toReadableString(x3)}`);
  }
  encodeValue(x3) {
    const bufs = zipWith(this._components, x3, (c2, d2) => c2.encodeValue(d2));
    return concat(...bufs);
  }
  decodeValue(b2, t3) {
    const tuple = this.checkType(t3);
    if (!(tuple instanceof TupleClass)) {
      throw new Error("not a tuple type");
    }
    if (tuple._components.length < this._components.length) {
      throw new Error("tuple mismatch");
    }
    const res = [];
    for (const [i3, wireType] of tuple._components.entries()) {
      if (i3 >= this._components.length) {
        wireType.decodeValue(b2, wireType);
      } else {
        res.push(this._components[i3].decodeValue(b2, wireType));
      }
    }
    return res;
  }
  display() {
    const fields = this._components.map((value) => value.display());
    return `record {${fields.join("; ")}}`;
  }
  valueToString(values) {
    const fields = zipWith(this._components, values, (c2, d2) => c2.valueToString(d2));
    return `record {${fields.join("; ")}}`;
  }
}
class VariantClass extends ConstructType {
  get typeName() {
    return IdlTypeName.VariantClass;
  }
  static [Symbol.hasInstance](instance) {
    return instance.typeName === IdlTypeName.VariantClass;
  }
  constructor(fields = {}) {
    super();
    this._fields = Object.entries(fields).sort((a2, b2) => idlLabelToId(a2[0]) - idlLabelToId(b2[0]));
  }
  accept(v3, d2) {
    return v3.visitVariant(this, this._fields, d2);
  }
  covariant(x3) {
    if (typeof x3 === "object" && Object.entries(x3).length === 1 && this._fields.every(([k2, v3]) => {
      try {
        return !x3.hasOwnProperty(k2) || v3.covariant(x3[k2]);
      } catch (e5) {
        throw new Error(`Invalid ${this.display()} argument: 

variant ${k2} -> ${e5.message}`);
      }
    }))
      return true;
    throw new Error(`Invalid ${this.display()} argument: ${toReadableString(x3)}`);
  }
  encodeValue(x3) {
    for (let i3 = 0; i3 < this._fields.length; i3++) {
      const [name, type] = this._fields[i3];
      if (x3.hasOwnProperty(name)) {
        const idx = lebEncode(i3);
        const buf = type.encodeValue(x3[name]);
        return concat(idx, buf);
      }
    }
    throw Error("Variant has no data: " + x3);
  }
  _buildTypeTableImpl(typeTable) {
    this._fields.forEach(([, type]) => {
      type.buildTypeTable(typeTable);
    });
    const opCode = slebEncode(IDLTypeIds.Variant);
    const len = lebEncode(this._fields.length);
    const fields = this._fields.map(([key, value]) => concat(lebEncode(idlLabelToId(key)), value.encodeType(typeTable)));
    typeTable.add(this, concat(opCode, len, ...fields));
  }
  decodeValue(b2, t3) {
    const variant = this.checkType(t3);
    if (!(variant instanceof VariantClass)) {
      throw new Error("Not a variant type");
    }
    const idx = Number(lebDecode(b2));
    if (idx >= variant._fields.length) {
      throw Error("Invalid variant index: " + idx);
    }
    const [wireHash, wireType] = variant._fields[idx];
    for (const [key, expectType] of this._fields) {
      if (idlLabelToId(wireHash) === idlLabelToId(key)) {
        const value = expectType.decodeValue(b2, wireType);
        return { [key]: value };
      }
    }
    throw new Error("Cannot find field hash " + wireHash);
  }
  get name() {
    const fields = this._fields.map(([key, type]) => key + ":" + type.name);
    return `variant {${fields.join("; ")}}`;
  }
  display() {
    const fields = this._fields.map(([key, type]) => key + (type.name === "null" ? "" : `:${type.display()}`));
    return `variant {${fields.join("; ")}}`;
  }
  valueToString(x3) {
    for (const [name, type] of this._fields) {
      if (x3.hasOwnProperty(name)) {
        const value = type.valueToString(x3[name]);
        if (value === "null") {
          return `variant {${name}}`;
        } else {
          return `variant {${name}=${value}}`;
        }
      }
    }
    throw new Error("Variant has no data: " + x3);
  }
  get alternativesAsObject() {
    const alternatives = {};
    for (const [name, ty] of this._fields) {
      alternatives[idlLabelToId(name)] = ty;
    }
    return alternatives;
  }
}
const _RecClass = class _RecClass extends ConstructType {
  constructor() {
    super(...arguments);
    this._id = _RecClass._counter++;
  }
  get typeName() {
    return IdlTypeName.RecClass;
  }
  static [Symbol.hasInstance](instance) {
    return instance.typeName === IdlTypeName.RecClass;
  }
  accept(v3, d2) {
    if (!this._type) {
      throw Error("Recursive type uninitialized.");
    }
    return v3.visitRec(this, this._type, d2);
  }
  fill(t3) {
    this._type = t3;
  }
  getType() {
    return this._type;
  }
  covariant(x3) {
    if (this._type ? this._type.covariant(x3) : false)
      return true;
    throw new Error(`Invalid ${this.display()} argument: ${toReadableString(x3)}`);
  }
  encodeValue(x3) {
    if (!this._type) {
      throw Error("Recursive type uninitialized.");
    }
    return this._type.encodeValue(x3);
  }
  _buildTypeTableImpl(typeTable) {
    if (!this._type) {
      throw Error("Recursive type uninitialized.");
    }
    typeTable.add(this, new Uint8Array([]));
    this._type.buildTypeTable(typeTable);
    typeTable.merge(this, this._type.name);
  }
  decodeValue(b2, t3) {
    if (!this._type) {
      throw Error("Recursive type uninitialized.");
    }
    return this._type.decodeValue(b2, t3);
  }
  get name() {
    return `rec_${this._id}`;
  }
  display() {
    if (!this._type) {
      throw Error("Recursive type uninitialized.");
    }
    return `μ${this.name}.${this._type.name}`;
  }
  valueToString(x3) {
    if (!this._type) {
      throw Error("Recursive type uninitialized.");
    }
    return this._type.valueToString(x3);
  }
};
_RecClass._counter = 0;
let RecClass = _RecClass;
function decodePrincipalId(b2) {
  const x3 = safeReadUint8(b2);
  if (x3 !== 1) {
    throw new Error("Cannot decode principal");
  }
  const len = Number(lebDecode(b2));
  return Principal$1.fromUint8Array(new Uint8Array(safeRead(b2, len)));
}
class PrincipalClass extends PrimitiveType {
  get typeName() {
    return IdlTypeName.PrincipalClass;
  }
  static [Symbol.hasInstance](instance) {
    return instance.typeName === IdlTypeName.PrincipalClass;
  }
  accept(v3, d2) {
    return v3.visitPrincipal(this, d2);
  }
  covariant(x3) {
    if (x3 && x3._isPrincipal)
      return true;
    throw new Error(`Invalid ${this.display()} argument: ${toReadableString(x3)}`);
  }
  encodeValue(x3) {
    const buf = x3.toUint8Array();
    const len = lebEncode(buf.byteLength);
    return concat(new Uint8Array([1]), len, buf);
  }
  encodeType() {
    return slebEncode(IDLTypeIds.Principal);
  }
  decodeValue(b2, t3) {
    this.checkType(t3);
    return decodePrincipalId(b2);
  }
  get name() {
    return "principal";
  }
  valueToString(x3) {
    return `${this.name} "${x3.toText()}"`;
  }
}
class FuncClass extends ConstructType {
  get typeName() {
    return IdlTypeName.FuncClass;
  }
  static [Symbol.hasInstance](instance) {
    return instance.typeName === IdlTypeName.FuncClass;
  }
  static argsToString(types, v3) {
    if (types.length !== v3.length) {
      throw new Error("arity mismatch");
    }
    return "(" + types.map((t3, i3) => t3.valueToString(v3[i3])).join(", ") + ")";
  }
  constructor(argTypes, retTypes, annotations = []) {
    super();
    this.argTypes = argTypes;
    this.retTypes = retTypes;
    this.annotations = annotations;
  }
  accept(v3, d2) {
    return v3.visitFunc(this, d2);
  }
  covariant(x3) {
    if (Array.isArray(x3) && x3.length === 2 && x3[0] && x3[0]._isPrincipal && typeof x3[1] === "string")
      return true;
    throw new Error(`Invalid ${this.display()} argument: ${toReadableString(x3)}`);
  }
  encodeValue([principal, methodName]) {
    const buf = principal.toUint8Array();
    const len = lebEncode(buf.byteLength);
    const canister = concat(new Uint8Array([1]), len, buf);
    const method = new TextEncoder().encode(methodName);
    const methodLen = lebEncode(method.byteLength);
    return concat(new Uint8Array([1]), canister, methodLen, method);
  }
  _buildTypeTableImpl(T2) {
    this.argTypes.forEach((arg) => arg.buildTypeTable(T2));
    this.retTypes.forEach((arg) => arg.buildTypeTable(T2));
    const opCode = slebEncode(IDLTypeIds.Func);
    const argLen = lebEncode(this.argTypes.length);
    const args = concat(...this.argTypes.map((arg) => arg.encodeType(T2)));
    const retLen = lebEncode(this.retTypes.length);
    const rets = concat(...this.retTypes.map((arg) => arg.encodeType(T2)));
    const annLen = lebEncode(this.annotations.length);
    const anns = concat(...this.annotations.map((a2) => this.encodeAnnotation(a2)));
    T2.add(this, concat(opCode, argLen, args, retLen, rets, annLen, anns));
  }
  decodeValue(b2, t3) {
    const tt2 = t3 instanceof RecClass ? t3.getType() ?? t3 : t3;
    if (!subtype(tt2, this)) {
      throw new Error(`Cannot decode function reference at type ${this.display()} from wire type ${tt2.display()}`);
    }
    const x3 = safeReadUint8(b2);
    if (x3 !== 1) {
      throw new Error("Cannot decode function reference");
    }
    const canister = decodePrincipalId(b2);
    const mLen = Number(lebDecode(b2));
    const buf = safeRead(b2, mLen);
    const decoder = new TextDecoder("utf8", { fatal: true });
    const method = decoder.decode(buf);
    return [canister, method];
  }
  get name() {
    const args = this.argTypes.map((arg) => arg.name).join(", ");
    const rets = this.retTypes.map((arg) => arg.name).join(", ");
    const annon = " " + this.annotations.join(" ");
    return `(${args}) -> (${rets})${annon}`;
  }
  valueToString([principal, str]) {
    return `func "${principal.toText()}".${str}`;
  }
  display() {
    const args = this.argTypes.map((arg) => arg.display()).join(", ");
    const rets = this.retTypes.map((arg) => arg.display()).join(", ");
    const annon = " " + this.annotations.join(" ");
    return `(${args}) → (${rets})${annon}`;
  }
  encodeAnnotation(ann) {
    if (ann === "query") {
      return new Uint8Array([1]);
    } else if (ann === "oneway") {
      return new Uint8Array([2]);
    } else if (ann === "composite_query") {
      return new Uint8Array([3]);
    } else {
      throw new Error("Illegal function annotation");
    }
  }
}
class ServiceClass extends ConstructType {
  get typeName() {
    return IdlTypeName.ServiceClass;
  }
  static [Symbol.hasInstance](instance) {
    return instance.typeName === IdlTypeName.ServiceClass;
  }
  constructor(fields) {
    super();
    this._fields = Object.entries(fields).sort((a2, b2) => {
      if (a2[0] < b2[0]) {
        return -1;
      }
      if (a2[0] > b2[0]) {
        return 1;
      }
      return 0;
    });
  }
  accept(v3, d2) {
    return v3.visitService(this, d2);
  }
  covariant(x3) {
    if (x3 && x3._isPrincipal)
      return true;
    throw new Error(`Invalid ${this.display()} argument: ${toReadableString(x3)}`);
  }
  encodeValue(x3) {
    const buf = x3.toUint8Array();
    const len = lebEncode(buf.length);
    return concat(new Uint8Array([1]), len, buf);
  }
  _buildTypeTableImpl(T2) {
    this._fields.forEach(([_2, func]) => func.buildTypeTable(T2));
    const opCode = slebEncode(IDLTypeIds.Service);
    const len = lebEncode(this._fields.length);
    const meths = this._fields.map(([label, func]) => {
      const labelBuf = new TextEncoder().encode(label);
      const labelLen = lebEncode(labelBuf.length);
      return concat(labelLen, labelBuf, func.encodeType(T2));
    });
    T2.add(this, concat(opCode, len, ...meths));
  }
  decodeValue(b2, t3) {
    const tt2 = t3 instanceof RecClass ? t3.getType() ?? t3 : t3;
    if (!subtype(tt2, this)) {
      throw new Error(`Cannot decode service reference at type ${this.display()} from wire type ${tt2.display()}`);
    }
    return decodePrincipalId(b2);
  }
  get name() {
    const fields = this._fields.map(([key, value]) => key + ":" + value.name);
    return `service {${fields.join("; ")}}`;
  }
  valueToString(x3) {
    return `service "${x3.toText()}"`;
  }
  fieldsAsObject() {
    const fields = {};
    for (const [name, ty] of this._fields) {
      fields[name] = ty;
    }
    return fields;
  }
}
function toReadableString(x3) {
  const str = JSON.stringify(x3, (_key, value) => typeof value === "bigint" ? `BigInt(${value})` : value);
  return str && str.length > toReadableString_max ? str.substring(0, toReadableString_max - 3) + "..." : str;
}
function encode$1(argTypes, args) {
  if (args.length < argTypes.length) {
    throw Error("Wrong number of message arguments");
  }
  const typeTable = new TypeTable();
  argTypes.forEach((t3) => t3.buildTypeTable(typeTable));
  const magic = new TextEncoder().encode(magicNumber);
  const table = typeTable.encode();
  const len = lebEncode(args.length);
  const typs = concat(...argTypes.map((t3) => t3.encodeType(typeTable)));
  const vals = concat(...zipWith(argTypes, args, (t3, x3) => {
    try {
      t3.covariant(x3);
    } catch (e5) {
      const err = new Error(e5.message + "\n\n");
      throw err;
    }
    return t3.encodeValue(x3);
  }));
  return concat(magic, table, len, typs, vals);
}
function decode$1(retTypes, bytes) {
  const b2 = new PipeArrayBuffer(bytes);
  if (bytes.byteLength < magicNumber.length) {
    throw new Error("Message length smaller than magic number");
  }
  const magicBuffer = safeRead(b2, magicNumber.length);
  const magic = new TextDecoder().decode(magicBuffer);
  if (magic !== magicNumber) {
    throw new Error("Wrong magic number: " + JSON.stringify(magic));
  }
  function readTypeTable(pipe) {
    const typeTable = [];
    const len = Number(lebDecode(pipe));
    for (let i3 = 0; i3 < len; i3++) {
      const ty = Number(slebDecode(pipe));
      switch (ty) {
        case IDLTypeIds.Opt:
        case IDLTypeIds.Vector: {
          const t3 = Number(slebDecode(pipe));
          typeTable.push([ty, t3]);
          break;
        }
        case IDLTypeIds.Record:
        case IDLTypeIds.Variant: {
          const fields = [];
          let objectLength = Number(lebDecode(pipe));
          let prevHash;
          while (objectLength--) {
            const hash = Number(lebDecode(pipe));
            if (hash >= Math.pow(2, 32)) {
              throw new Error("field id out of 32-bit range");
            }
            if (typeof prevHash === "number" && prevHash >= hash) {
              throw new Error("field id collision or not sorted");
            }
            prevHash = hash;
            const t3 = Number(slebDecode(pipe));
            fields.push([hash, t3]);
          }
          typeTable.push([ty, fields]);
          break;
        }
        case IDLTypeIds.Func: {
          const args = [];
          let argLength = Number(lebDecode(pipe));
          while (argLength--) {
            args.push(Number(slebDecode(pipe)));
          }
          const returnValues = [];
          let returnValuesLength = Number(lebDecode(pipe));
          while (returnValuesLength--) {
            returnValues.push(Number(slebDecode(pipe)));
          }
          const annotations = [];
          let annotationLength = Number(lebDecode(pipe));
          while (annotationLength--) {
            const annotation = Number(lebDecode(pipe));
            switch (annotation) {
              case 1: {
                annotations.push("query");
                break;
              }
              case 2: {
                annotations.push("oneway");
                break;
              }
              case 3: {
                annotations.push("composite_query");
                break;
              }
              default:
                throw new Error("unknown annotation");
            }
          }
          typeTable.push([ty, [args, returnValues, annotations]]);
          break;
        }
        case IDLTypeIds.Service: {
          let servLength = Number(lebDecode(pipe));
          const methods = [];
          while (servLength--) {
            const nameLength = Number(lebDecode(pipe));
            const funcName = new TextDecoder().decode(safeRead(pipe, nameLength));
            const funcType = slebDecode(pipe);
            methods.push([funcName, funcType]);
          }
          typeTable.push([ty, methods]);
          break;
        }
        default:
          throw new Error("Illegal op_code: " + ty);
      }
    }
    const rawList = [];
    const length = Number(lebDecode(pipe));
    for (let i3 = 0; i3 < length; i3++) {
      rawList.push(Number(slebDecode(pipe)));
    }
    return [typeTable, rawList];
  }
  const [rawTable, rawTypes] = readTypeTable(b2);
  if (rawTypes.length < retTypes.length) {
    throw new Error("Wrong number of return values");
  }
  const table = rawTable.map((_2) => Rec());
  function getType(t3) {
    if (t3 < -24) {
      throw new Error("future value not supported");
    }
    if (t3 < 0) {
      switch (t3) {
        case -1:
          return Null;
        case -2:
          return Bool;
        case -3:
          return Nat;
        case -4:
          return Int;
        case -5:
          return Nat8;
        case -6:
          return Nat16;
        case -7:
          return Nat32;
        case -8:
          return Nat64;
        case -9:
          return Int8;
        case -10:
          return Int16;
        case -11:
          return Int32;
        case -12:
          return Int64;
        case -13:
          return Float32;
        case -14:
          return Float64;
        case -15:
          return Text;
        case -16:
          return Reserved;
        case -17:
          return Empty;
        case -24:
          return Principal2;
        default:
          throw new Error("Illegal op_code: " + t3);
      }
    }
    if (t3 >= rawTable.length) {
      throw new Error("type index out of range");
    }
    return table[t3];
  }
  function buildType(entry) {
    switch (entry[0]) {
      case IDLTypeIds.Vector: {
        const ty = getType(entry[1]);
        return Vec(ty);
      }
      case IDLTypeIds.Opt: {
        const ty = getType(entry[1]);
        return Opt(ty);
      }
      case IDLTypeIds.Record: {
        const fields = {};
        for (const [hash, ty] of entry[1]) {
          const name = `_${hash}_`;
          fields[name] = getType(ty);
        }
        const record = Record(fields);
        const tuple = record.tryAsTuple();
        if (Array.isArray(tuple)) {
          return Tuple(...tuple);
        } else {
          return record;
        }
      }
      case IDLTypeIds.Variant: {
        const fields = {};
        for (const [hash, ty] of entry[1]) {
          const name = `_${hash}_`;
          fields[name] = getType(ty);
        }
        return Variant(fields);
      }
      case IDLTypeIds.Func: {
        const [args, returnValues, annotations] = entry[1];
        return Func(args.map((t3) => getType(t3)), returnValues.map((t3) => getType(t3)), annotations);
      }
      case IDLTypeIds.Service: {
        const rec = {};
        const methods = entry[1];
        for (const [name, typeRef] of methods) {
          let type = getType(typeRef);
          if (type instanceof RecClass) {
            type = type.getType();
          }
          if (!(type instanceof FuncClass)) {
            throw new Error("Illegal service definition: services can only contain functions");
          }
          rec[name] = type;
        }
        return Service(rec);
      }
      default:
        throw new Error("Illegal op_code: " + entry[0]);
    }
  }
  rawTable.forEach((entry, i3) => {
    if (entry[0] === IDLTypeIds.Func) {
      const t3 = buildType(entry);
      table[i3].fill(t3);
    }
  });
  rawTable.forEach((entry, i3) => {
    if (entry[0] !== IDLTypeIds.Func) {
      const t3 = buildType(entry);
      table[i3].fill(t3);
    }
  });
  resetSubtypeCache();
  const types = rawTypes.map((t3) => getType(t3));
  try {
    const output = retTypes.map((t3, i3) => {
      return t3.decodeValue(b2, types[i3]);
    });
    for (let ind = retTypes.length; ind < types.length; ind++) {
      types[ind].decodeValue(b2, types[ind]);
    }
    if (b2.byteLength > 0) {
      throw new Error("decode: Left-over bytes");
    }
    return output;
  } finally {
    resetSubtypeCache();
  }
}
const Empty = new EmptyClass();
const Reserved = new ReservedClass();
const Unknown = new UnknownClass();
const Bool = new BoolClass();
const Null = new NullClass();
const Text = new TextClass();
const Int = new IntClass();
const Nat = new NatClass();
const Float32 = new FloatClass(32);
const Float64 = new FloatClass(64);
const Int8 = new FixedIntClass(8);
const Int16 = new FixedIntClass(16);
const Int32 = new FixedIntClass(32);
const Int64 = new FixedIntClass(64);
const Nat8 = new FixedNatClass(8);
const Nat16 = new FixedNatClass(16);
const Nat32 = new FixedNatClass(32);
const Nat64 = new FixedNatClass(64);
const Principal2 = new PrincipalClass();
function Tuple(...types) {
  return new TupleClass(types);
}
function Vec(t3) {
  return new VecClass(t3);
}
function Opt(t3) {
  return new OptClass(t3);
}
function Record(t3) {
  return new RecordClass(t3);
}
function Variant(fields) {
  return new VariantClass(fields);
}
function Rec() {
  return new RecClass();
}
function Func(args, ret, annotations = []) {
  return new FuncClass(args, ret, annotations);
}
function Service(t3) {
  return new ServiceClass(t3);
}
class Relations {
  constructor(relations = /* @__PURE__ */ new Map()) {
    this.rels = relations;
  }
  copy() {
    const copy = /* @__PURE__ */ new Map();
    for (const [key, value] of this.rels.entries()) {
      const valCopy = new Map(value);
      copy.set(key, valCopy);
    }
    return new Relations(copy);
  }
  /// Returns whether we know for sure that a relation holds or doesn't (`true` or `false`), or
  /// if we don't know yet (`undefined`)
  known(t1, t22) {
    return this.rels.get(t1.name)?.get(t22.name);
  }
  addNegative(t1, t22) {
    this.addNames(t1.name, t22.name, false);
  }
  add(t1, t22) {
    this.addNames(t1.name, t22.name, true);
  }
  display() {
    let result = "";
    for (const [t1, v3] of this.rels) {
      for (const [t22, known] of v3) {
        const subty = known ? ":<" : "!<:";
        result += `${t1} ${subty} ${t22}
`;
      }
    }
    return result;
  }
  addNames(t1, t22, isSubtype) {
    const t1Map = this.rels.get(t1);
    if (t1Map == void 0) {
      const newMap = /* @__PURE__ */ new Map();
      newMap.set(t22, isSubtype);
      this.rels.set(t1, newMap);
    } else {
      t1Map.set(t22, isSubtype);
    }
  }
}
let subtypeCache = new Relations();
function resetSubtypeCache() {
  subtypeCache = new Relations();
}
function eqFunctionAnnotations(t1, t22) {
  const t1Annotations = new Set(t1.annotations);
  const t2Annotations = new Set(t22.annotations);
  if (t1Annotations.size !== t2Annotations.size) {
    return false;
  }
  for (const a2 of t1Annotations) {
    if (!t2Annotations.has(a2))
      return false;
  }
  return true;
}
function canBeOmmitted(t3) {
  return t3 instanceof OptClass || t3 instanceof NullClass || t3 instanceof ReservedClass;
}
function subtype(t1, t22) {
  const relations = subtypeCache.copy();
  const isSubtype = subtype_(relations, t1, t22);
  if (isSubtype) {
    subtypeCache.add(t1, t22);
  } else {
    subtypeCache.addNegative(t1, t22);
  }
  return isSubtype;
}
function subtype_(relations, t1, t22) {
  if (t1.name === t22.name)
    return true;
  const known = relations.known(t1, t22);
  if (known !== void 0)
    return known;
  relations.add(t1, t22);
  if (t22 instanceof ReservedClass)
    return true;
  if (t1 instanceof EmptyClass)
    return true;
  if (t1 instanceof NatClass && t22 instanceof IntClass)
    return true;
  if (t1 instanceof VecClass && t22 instanceof VecClass)
    return subtype_(relations, t1._type, t22._type);
  if (t22 instanceof OptClass)
    return true;
  if (t1 instanceof RecordClass && t22 instanceof RecordClass) {
    const t1Object = t1.fieldsAsObject;
    for (const [label, ty2] of t22._fields) {
      const ty1 = t1Object[idlLabelToId(label)];
      if (!ty1) {
        if (!canBeOmmitted(ty2))
          return false;
      } else {
        if (!subtype_(relations, ty1, ty2))
          return false;
      }
    }
    return true;
  }
  if (t1 instanceof FuncClass && t22 instanceof FuncClass) {
    if (!eqFunctionAnnotations(t1, t22))
      return false;
    for (let i3 = 0; i3 < t1.argTypes.length; i3++) {
      const argTy1 = t1.argTypes[i3];
      if (i3 < t22.argTypes.length) {
        if (!subtype_(relations, t22.argTypes[i3], argTy1))
          return false;
      } else {
        if (!canBeOmmitted(argTy1))
          return false;
      }
    }
    for (let i3 = 0; i3 < t22.retTypes.length; i3++) {
      const retTy2 = t22.retTypes[i3];
      if (i3 < t1.retTypes.length) {
        if (!subtype_(relations, t1.retTypes[i3], retTy2))
          return false;
      } else {
        if (!canBeOmmitted(retTy2))
          return false;
      }
    }
    return true;
  }
  if (t1 instanceof VariantClass && t22 instanceof VariantClass) {
    const t2Object = t22.alternativesAsObject;
    for (const [label, ty1] of t1._fields) {
      const ty2 = t2Object[idlLabelToId(label)];
      if (!ty2)
        return false;
      if (!subtype_(relations, ty1, ty2))
        return false;
    }
    return true;
  }
  if (t1 instanceof ServiceClass && t22 instanceof ServiceClass) {
    const t1Object = t1.fieldsAsObject();
    for (const [name, ty2] of t22._fields) {
      const ty1 = t1Object[name];
      if (!ty1)
        return false;
      if (!subtype_(relations, ty1, ty2))
        return false;
    }
    return true;
  }
  if (t1 instanceof RecClass) {
    return subtype_(relations, t1.getType(), t22);
  }
  if (t22 instanceof RecClass) {
    return subtype_(relations, t1, t22.getType());
  }
  return false;
}
const IDL = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  Bool,
  BoolClass,
  ConstructType,
  Empty,
  EmptyClass,
  FixedIntClass,
  FixedNatClass,
  Float32,
  Float64,
  FloatClass,
  Func,
  FuncClass,
  Int,
  Int16,
  Int32,
  Int64,
  Int8,
  IntClass,
  Nat,
  Nat16,
  Nat32,
  Nat64,
  Nat8,
  NatClass,
  Null,
  NullClass,
  Opt,
  OptClass,
  PrimitiveType,
  Principal: Principal2,
  PrincipalClass,
  Rec,
  RecClass,
  Record,
  RecordClass,
  Reserved,
  ReservedClass,
  Service,
  ServiceClass,
  Text,
  TextClass,
  Tuple,
  TupleClass,
  Type,
  Unknown,
  UnknownClass,
  Variant,
  VariantClass,
  Vec,
  VecClass,
  Visitor,
  decode: decode$1,
  encode: encode$1,
  resetSubtypeCache,
  subtype
}, Symbol.toStringTag, { value: "Module" }));
function uint8FromBufLike(bufLike) {
  if (!bufLike) {
    throw new Error("Input cannot be null or undefined");
  }
  if (bufLike instanceof Uint8Array) {
    return bufLike;
  }
  if (bufLike instanceof ArrayBuffer) {
    return new Uint8Array(bufLike);
  }
  if (Array.isArray(bufLike)) {
    return new Uint8Array(bufLike);
  }
  if ("buffer" in bufLike) {
    return uint8FromBufLike(bufLike.buffer);
  }
  return new Uint8Array(bufLike);
}
function uint8Equals(a2, b2) {
  if (a2.length !== b2.length)
    return false;
  for (let i3 = 0; i3 < a2.length; i3++) {
    if (a2[i3] !== b2[i3])
      return false;
  }
  return true;
}
function hashValue(value) {
  if (typeof value === "string") {
    return hashString(value);
  } else if (typeof value === "number") {
    return sha256(lebEncode(value));
  } else if (value instanceof Uint8Array || ArrayBuffer.isView(value)) {
    return sha256(uint8FromBufLike(value));
  } else if (Array.isArray(value)) {
    const vals = value.map(hashValue);
    return sha256(concatBytes(...vals));
  } else if (value && typeof value === "object" && value._isPrincipal) {
    return sha256(value.toUint8Array());
  } else if (typeof value === "object" && value !== null && typeof value.toHash === "function") {
    return hashValue(value.toHash());
  } else if (typeof value === "object") {
    return hashOfMap(value);
  } else if (typeof value === "bigint") {
    return sha256(lebEncode(value));
  }
  throw InputError.fromCode(new HashValueErrorCode(value));
}
const hashString = (value) => {
  const encoded = new TextEncoder().encode(value);
  return sha256(encoded);
};
function requestIdOf(request2) {
  return hashOfMap(request2);
}
function hashOfMap(map) {
  const hashed = Object.entries(map).filter(([, value]) => value !== void 0).map(([key, value]) => {
    const hashedKey = hashString(key);
    const hashedValue = hashValue(value);
    return [hashedKey, hashedValue];
  });
  const traversed = hashed;
  const sorted = traversed.sort(([k1], [k2]) => {
    return compare(k1, k2);
  });
  const concatenated = concatBytes(...sorted.map((x3) => concatBytes(...x3)));
  const result = sha256(concatenated);
  return result;
}
const IC_REQUEST_DOMAIN_SEPARATOR = new TextEncoder().encode("\nic-request");
const IC_RESPONSE_DOMAIN_SEPARATOR = new TextEncoder().encode("\vic-response");
const IC_REQUEST_AUTH_DELEGATION_DOMAIN_SEPARATOR = new TextEncoder().encode("ic-request-auth-delegation");
class SignIdentity {
  /**
   * Get the principal represented by this identity. Normally should be a
   * `Principal.selfAuthenticating()`.
   */
  getPrincipal() {
    if (!this._principal) {
      this._principal = Principal$1.selfAuthenticating(new Uint8Array(this.getPublicKey().toDer()));
    }
    return this._principal;
  }
  /**
   * Transform a request into a signed version of the request. This is done last
   * after the transforms on the body of a request. The returned object can be
   * anything, but must be serializable to CBOR.
   * @param request - internet computer request to transform
   */
  async transformRequest(request2) {
    const { body, ...fields } = request2;
    const requestId = requestIdOf(body);
    return {
      ...fields,
      body: {
        content: body,
        sender_pubkey: this.getPublicKey().toDer(),
        sender_sig: await this.sign(concatBytes(IC_REQUEST_DOMAIN_SEPARATOR, requestId))
      }
    };
  }
}
class AnonymousIdentity {
  getPrincipal() {
    return Principal$1.anonymous();
  }
  async transformRequest(request2) {
    return {
      ...request2,
      body: { content: request2.body }
    };
  }
}
let w$4 = class w extends Error {
  constructor(n2) {
    super(n2), this.name = "DecodingError";
  }
};
const m$2 = 55799, L$1 = Symbol("CBOR_STOP_CODE");
var g$2 = /* @__PURE__ */ ((t3) => (t3[t3.False = 20] = "False", t3[t3.True = 21] = "True", t3[t3.Null = 22] = "Null", t3[t3.Undefined = 23] = "Undefined", t3[t3.Break = 31] = "Break", t3))(g$2 || {}), c = /* @__PURE__ */ ((t3) => (t3[t3.UnsignedInteger = 0] = "UnsignedInteger", t3[t3.NegativeInteger = 1] = "NegativeInteger", t3[t3.ByteString = 2] = "ByteString", t3[t3.TextString = 3] = "TextString", t3[t3.Array = 4] = "Array", t3[t3.Map = 5] = "Map", t3[t3.Tag = 6] = "Tag", t3[t3.Simple = 7] = "Simple", t3))(c || {});
const z = 23, Y = 255, G$1 = 65535, P$1 = 4294967295, H = BigInt("0xffffffffffffffff");
var d = /* @__PURE__ */ ((t3) => (t3[t3.Value = 23] = "Value", t3[t3.OneByte = 24] = "OneByte", t3[t3.TwoBytes = 25] = "TwoBytes", t3[t3.FourBytes = 26] = "FourBytes", t3[t3.EightBytes = 27] = "EightBytes", t3[t3.Indefinite = 31] = "Indefinite", t3))(d || {});
const h$2 = false;
function W$1(t3) {
  return t3 == null;
}
function R$1(t3, n2) {
  const e5 = new Uint8Array(n2);
  return e5.set(t3), e5;
}
const K$1 = new TextDecoder();
function Z(t3) {
  return (t3 & 224) >> 5;
}
function q$1(t3) {
  return t3 & 31;
}
let A$3 = new Uint8Array(), y$1, a = 0;
function ut(t3, n2) {
  A$3 = t3, a = 0;
  const e5 = B$2();
  return (n2 == null ? void 0 : n2(e5)) ?? e5;
}
function B$2(t3) {
  const [n2, e5] = N$2();
  switch (n2) {
    case c.UnsignedInteger:
      return E$1(e5);
    case c.NegativeInteger:
      return j$1(e5);
    case c.ByteString:
      return $$1(e5);
    case c.TextString:
      return F$2(e5);
    case c.Array:
      return J$1(e5);
    case c.Map:
      return b$3(e5);
    case c.Tag:
      return M$2(e5);
    case c.Simple:
      return Q(e5);
  }
  throw new w$4(`Unsupported major type: ${n2}`);
}
function N$2() {
  const t3 = A$3.at(a);
  if (W$1(t3))
    throw new w$4("Provided CBOR data is empty");
  const n2 = Z(t3), e5 = q$1(t3);
  return a++, [n2, e5];
}
function J$1(t3, n2) {
  const e5 = E$1(t3);
  if (e5 === 1 / 0) {
    const u2 = [];
    let f2 = B$2();
    for (; f2 !== L$1; )
      u2.push(f2), f2 = B$2();
    return u2;
  }
  const i3 = new Array(e5);
  for (let u2 = 0; u2 < e5; u2++) {
    const f2 = B$2();
    i3[u2] = f2;
  }
  return i3;
}
function Q(t3) {
  switch (t3) {
    case g$2.False:
      return false;
    case g$2.True:
      return true;
    case g$2.Null:
      return null;
    case g$2.Undefined:
      return;
    case g$2.Break:
      return L$1;
  }
  throw new w$4(`Unrecognized simple type: ${t3.toString(2)}`);
}
function b$3(t3, n2) {
  const e5 = E$1(t3), i3 = {};
  if (e5 === 1 / 0) {
    let [u2, f2] = N$2();
    for (; u2 !== c.Simple && f2 !== g$2.Break; ) {
      const l3 = F$2(f2), U2 = B$2();
      i3[l3] = U2, [u2, f2] = N$2();
    }
    return i3;
  }
  for (let u2 = 0; u2 < e5; u2++) {
    const [f2, l3] = N$2();
    if (f2 !== c.TextString)
      throw new w$4("Map keys must be text strings");
    const U2 = F$2(l3), D2 = B$2();
    i3[U2] = D2;
  }
  return i3;
}
function E$1(t3) {
  if (t3 <= d.Value)
    return t3;
  switch (y$1 = new DataView(A$3.buffer, A$3.byteOffset + a), t3) {
    case d.OneByte:
      return a++, y$1.getUint8(0);
    case d.TwoBytes:
      return a += 2, y$1.getUint16(0, h$2);
    case d.FourBytes:
      return a += 4, y$1.getUint32(0, h$2);
    case d.EightBytes:
      return a += 8, y$1.getBigUint64(0, h$2);
    case d.Indefinite:
      return 1 / 0;
    default:
      throw new w$4(`Unsupported integer info: ${t3.toString(2)}`);
  }
}
function j$1(t3) {
  const n2 = E$1(t3);
  return typeof n2 == "number" ? -1 - n2 : -1n - n2;
}
function $$1(t3) {
  const n2 = E$1(t3);
  if (n2 > Number.MAX_SAFE_INTEGER)
    throw new w$4("Byte length is too large");
  const e5 = Number(n2);
  return a += e5, A$3.slice(a - e5, a);
}
function F$2(t3) {
  const n2 = $$1(t3);
  return K$1.decode(n2);
}
function M$2(t3, n2) {
  const e5 = E$1(t3);
  if (e5 === m$2)
    return B$2();
  throw new w$4(`Unsupported tag: ${e5}.`);
}
let x$1 = class x extends Error {
  constructor(n2) {
    super(n2), this.name = "SerializationError";
  }
};
const p = 2 * 1024, C$1 = 100, v$2 = new TextEncoder();
function S$1(t3) {
  return t3 << 5;
}
let o$2 = new Uint8Array(p), r$2 = new DataView(o$2.buffer), s$2 = 0, O$3 = [];
function dt(t3, n2) {
  s$2 = 0;
  const e5 = (n2 == null ? void 0 : n2(t3)) ?? t3;
  return it(m$2, e5, n2), o$2.slice(0, s$2);
}
function _(t3, n2) {
  if (s$2 > o$2.length - C$1 && (o$2 = R$1(o$2, o$2.length * 2), r$2 = new DataView(o$2.buffer)), t3 === false || t3 === true || t3 === null || t3 === void 0) {
    et(t3);
    return;
  }
  if (typeof t3 == "number" || typeof t3 == "bigint") {
    ft(t3);
    return;
  }
  if (typeof t3 == "string") {
    X(t3);
    return;
  }
  if (t3 instanceof Uint8Array) {
    V$1(t3);
    return;
  }
  if (t3 instanceof ArrayBuffer) {
    V$1(new Uint8Array(t3));
    return;
  }
  if (Array.isArray(t3)) {
    tt(t3, n2);
    return;
  }
  if (typeof t3 == "object") {
    nt(t3, n2);
    return;
  }
  throw new x$1(`Unsupported type: ${typeof t3}`);
}
function tt(t3, n2) {
  I$1(c.Array, t3.length), t3.forEach((e5, i3) => {
    _((n2 == null ? void 0 : n2(e5, i3.toString())) ?? e5, n2);
  });
}
function nt(t3, n2) {
  O$3 = Object.entries(t3), I$1(c.Map, O$3.length), O$3.forEach(([e5, i3]) => {
    X(e5), _((n2 == null ? void 0 : n2(i3, e5)) ?? i3, n2);
  });
}
function I$1(t3, n2) {
  if (n2 <= z) {
    r$2.setUint8(
      s$2++,
      S$1(t3) | Number(n2)
    );
    return;
  }
  if (n2 <= Y) {
    r$2.setUint8(
      s$2++,
      S$1(t3) | d.OneByte
    ), r$2.setUint8(s$2, Number(n2)), s$2 += 1;
    return;
  }
  if (n2 <= G$1) {
    r$2.setUint8(
      s$2++,
      S$1(t3) | d.TwoBytes
    ), r$2.setUint16(s$2, Number(n2), h$2), s$2 += 2;
    return;
  }
  if (n2 <= P$1) {
    r$2.setUint8(
      s$2++,
      S$1(t3) | d.FourBytes
    ), r$2.setUint32(s$2, Number(n2), h$2), s$2 += 4;
    return;
  }
  if (n2 <= H) {
    r$2.setUint8(
      s$2++,
      S$1(t3) | d.EightBytes
    ), r$2.setBigUint64(s$2, BigInt(n2), h$2), s$2 += 8;
    return;
  }
  throw new x$1(`Value too large to encode: ${n2}`);
}
function et(t3) {
  I$1(c.Simple, st(t3));
}
function st(t3) {
  if (t3 === false)
    return g$2.False;
  if (t3 === true)
    return g$2.True;
  if (t3 === null)
    return g$2.Null;
  if (t3 === void 0)
    return g$2.Undefined;
  throw new x$1(`Unrecognized simple value: ${t3.toString()}`);
}
function k$2(t3, n2) {
  I$1(t3, n2.length), s$2 > o$2.length - n2.length && (o$2 = R$1(o$2, o$2.length + n2.length), r$2 = new DataView(o$2.buffer)), o$2.set(n2, s$2), s$2 += n2.length;
}
function T$2(t3, n2) {
  I$1(t3, n2);
}
function ct(t3) {
  T$2(c.UnsignedInteger, t3);
}
function ot(t3) {
  T$2(
    c.NegativeInteger,
    typeof t3 == "bigint" ? -1n - t3 : -1 - t3
  );
}
function ft(t3) {
  t3 >= 0 ? ct(t3) : ot(t3);
}
function X(t3) {
  k$2(c.TextString, v$2.encode(t3));
}
function V$1(t3) {
  k$2(c.ByteString, t3);
}
function it(t3, n2, e5) {
  I$1(c.Tag, t3), _(n2, e5);
}
function hasCborValueMethod(value) {
  return typeof value === "object" && value !== null && "toCborValue" in value;
}
function encode(value) {
  try {
    return dt(value, (value2) => {
      if (Principal$1.isPrincipal(value2)) {
        return value2.toUint8Array();
      }
      if (Expiry.isExpiry(value2)) {
        return value2.toBigInt();
      }
      if (hasCborValueMethod(value2)) {
        return value2.toCborValue();
      }
      return value2;
    });
  } catch (error) {
    throw InputError.fromCode(new CborEncodeErrorCode(error, value));
  }
}
function decode(input) {
  try {
    return ut(input);
  } catch (error) {
    throw InputError.fromCode(new CborDecodeErrorCode(error, input));
  }
}
const randomNumber = () => {
  if (typeof window !== "undefined" && !!window.crypto && !!window.crypto.getRandomValues) {
    const array = new Uint32Array(1);
    window.crypto.getRandomValues(array);
    return array[0];
  }
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    return array[0];
  }
  if (typeof crypto !== "undefined" && crypto.randomInt) {
    return crypto.randomInt(0, 4294967295);
  }
  return Math.floor(Math.random() * 4294967295);
};
var Endpoint;
(function(Endpoint2) {
  Endpoint2["Query"] = "read";
  Endpoint2["ReadState"] = "read_state";
  Endpoint2["Call"] = "call";
})(Endpoint || (Endpoint = {}));
var SubmitRequestType;
(function(SubmitRequestType2) {
  SubmitRequestType2["Call"] = "call";
})(SubmitRequestType || (SubmitRequestType = {}));
var ReadRequestType;
(function(ReadRequestType2) {
  ReadRequestType2["Query"] = "query";
  ReadRequestType2["ReadState"] = "read_state";
})(ReadRequestType || (ReadRequestType = {}));
function makeNonce() {
  const buffer = new ArrayBuffer(16);
  const view = new DataView(buffer);
  const rand1 = randomNumber();
  const rand2 = randomNumber();
  const rand3 = randomNumber();
  const rand4 = randomNumber();
  view.setUint32(0, rand1);
  view.setUint32(4, rand2);
  view.setUint32(8, rand3);
  view.setUint32(12, rand4);
  return Object.assign(new Uint8Array(buffer), { __nonce__: void 0 });
}
const JSON_KEY_EXPIRY = "__expiry__";
const SECONDS_TO_MILLISECONDS = BigInt(1e3);
const MILLISECONDS_TO_NANOSECONDS = BigInt(1e6);
const MINUTES_TO_SECONDS = BigInt(60);
const EXPIRY_DELTA_THRESHOLD_MILLISECONDS = BigInt(90) * SECONDS_TO_MILLISECONDS;
function roundMillisToSeconds(millis) {
  return millis / SECONDS_TO_MILLISECONDS;
}
function roundMillisToMinutes(millis) {
  return roundMillisToSeconds(millis) / MINUTES_TO_SECONDS;
}
class Expiry {
  constructor(__expiry__) {
    this.__expiry__ = __expiry__;
    this._isExpiry = true;
  }
  /**
   * Creates an Expiry object from a delta in milliseconds.
   * If the delta is less than 90 seconds, the expiry is rounded down to the nearest second.
   * Otherwise, the expiry is rounded down to the nearest minute.
   * @param deltaInMs The milliseconds to add to the current time.
   * @param clockDriftMs The milliseconds to add to the current time, typically the clock drift between IC network clock and the client's clock. Defaults to `0` if not provided.
   * @returns {Expiry} The constructed Expiry object.
   */
  static fromDeltaInMilliseconds(deltaInMs, clockDriftMs = 0) {
    const deltaMs = BigInt(deltaInMs);
    const expiryMs = BigInt(Date.now()) + deltaMs + BigInt(clockDriftMs);
    let roundedExpirySeconds;
    if (deltaMs < EXPIRY_DELTA_THRESHOLD_MILLISECONDS) {
      roundedExpirySeconds = roundMillisToSeconds(expiryMs);
    } else {
      const roundedExpiryMinutes = roundMillisToMinutes(expiryMs);
      roundedExpirySeconds = roundedExpiryMinutes * MINUTES_TO_SECONDS;
    }
    return new Expiry(roundedExpirySeconds * SECONDS_TO_MILLISECONDS * MILLISECONDS_TO_NANOSECONDS);
  }
  toBigInt() {
    return this.__expiry__;
  }
  toHash() {
    return lebEncode(this.__expiry__);
  }
  toString() {
    return this.__expiry__.toString();
  }
  /**
   * Serializes to JSON
   * @returns {JsonnableExpiry} a JSON object with a single key, {@link JSON_KEY_EXPIRY}, whose value is the expiry as a string
   */
  toJSON() {
    return { [JSON_KEY_EXPIRY]: this.toString() };
  }
  /**
   * Deserializes a {@link JsonnableExpiry} object from a JSON string.
   * @param input The JSON string to deserialize.
   * @returns {Expiry} The deserialized Expiry object.
   */
  static fromJSON(input) {
    const obj = JSON.parse(input);
    if (obj[JSON_KEY_EXPIRY]) {
      try {
        const expiry = BigInt(obj[JSON_KEY_EXPIRY]);
        return new Expiry(expiry);
      } catch (error) {
        throw new InputError(new ExpiryJsonDeserializeErrorCode(`Not a valid BigInt: ${error}`));
      }
    }
    throw new InputError(new ExpiryJsonDeserializeErrorCode(`The input does not contain the key ${JSON_KEY_EXPIRY}`));
  }
  static isExpiry(other) {
    return other instanceof Expiry || typeof other === "object" && other !== null && "_isExpiry" in other && other["_isExpiry"] === true && "__expiry__" in other && typeof other["__expiry__"] === "bigint";
  }
}
function makeNonceTransform(nonceFn = makeNonce) {
  return async (request2) => {
    const headers = request2.request.headers;
    request2.request.headers = headers;
    if (request2.endpoint === Endpoint.Call) {
      request2.body.nonce = nonceFn();
    }
  };
}
function httpHeadersTransform(headers) {
  const headerFields = [];
  headers.forEach((value, key) => {
    headerFields.push([key, value]);
  });
  return headerFields;
}
/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
const _0n$7 = /* @__PURE__ */ BigInt(0);
const _1n$8 = /* @__PURE__ */ BigInt(1);
function _abool2(value, title = "") {
  if (typeof value !== "boolean") {
    const prefix = title && `"${title}"`;
    throw new Error(prefix + "expected boolean, got type=" + typeof value);
  }
  return value;
}
function _abytes2(value, length, title = "") {
  const bytes = isBytes(value);
  const len = value?.length;
  const needsLen = length !== void 0;
  if (!bytes || needsLen && len !== length) {
    const prefix = title && `"${title}" `;
    const ofLen = needsLen ? ` of length ${length}` : "";
    const got = bytes ? `length=${len}` : `type=${typeof value}`;
    throw new Error(prefix + "expected Uint8Array" + ofLen + ", got " + got);
  }
  return value;
}
function hexToNumber(hex) {
  if (typeof hex !== "string")
    throw new Error("hex string expected, got " + typeof hex);
  return hex === "" ? _0n$7 : BigInt("0x" + hex);
}
function bytesToNumberBE(bytes) {
  return hexToNumber(bytesToHex(bytes));
}
function bytesToNumberLE(bytes) {
  abytes(bytes);
  return hexToNumber(bytesToHex(Uint8Array.from(bytes).reverse()));
}
function numberToBytesBE(n2, len) {
  return hexToBytes(n2.toString(16).padStart(len * 2, "0"));
}
function numberToBytesLE(n2, len) {
  return numberToBytesBE(n2, len).reverse();
}
function ensureBytes(title, hex, expectedLength) {
  let res;
  if (typeof hex === "string") {
    try {
      res = hexToBytes(hex);
    } catch (e5) {
      throw new Error(title + " must be hex string or Uint8Array, cause: " + e5);
    }
  } else if (isBytes(hex)) {
    res = Uint8Array.from(hex);
  } else {
    throw new Error(title + " must be hex string or Uint8Array");
  }
  const len = res.length;
  if (typeof expectedLength === "number" && len !== expectedLength)
    throw new Error(title + " of length " + expectedLength + " expected, got " + len);
  return res;
}
function copyBytes(bytes) {
  return Uint8Array.from(bytes);
}
const isPosBig = (n2) => typeof n2 === "bigint" && _0n$7 <= n2;
function inRange(n2, min, max) {
  return isPosBig(n2) && isPosBig(min) && isPosBig(max) && min <= n2 && n2 < max;
}
function aInRange(title, n2, min, max) {
  if (!inRange(n2, min, max))
    throw new Error("expected valid " + title + ": " + min + " <= n < " + max + ", got " + n2);
}
function bitLen(n2) {
  let len;
  for (len = 0; n2 > _0n$7; n2 >>= _1n$8, len += 1)
    ;
  return len;
}
function bitGet(n2, pos) {
  return n2 >> BigInt(pos) & _1n$8;
}
const bitMask = (n2) => (_1n$8 << BigInt(n2)) - _1n$8;
function isHash(val) {
  return typeof val === "function" && Number.isSafeInteger(val.outputLen);
}
function _validateObject(object, fields, optFields = {}) {
  if (!object || typeof object !== "object")
    throw new Error("expected valid options object");
  function checkField(fieldName, expectedType, isOpt) {
    const val = object[fieldName];
    if (isOpt && val === void 0)
      return;
    const current = typeof val;
    if (current !== expectedType || val === null)
      throw new Error(`param "${fieldName}" is invalid: expected ${expectedType}, got ${current}`);
  }
  Object.entries(fields).forEach(([k2, v3]) => checkField(k2, v3, false));
  Object.entries(optFields).forEach(([k2, v3]) => checkField(k2, v3, true));
}
const notImplemented = () => {
  throw new Error("not implemented");
};
function memoized(fn) {
  const map = /* @__PURE__ */ new WeakMap();
  return (arg, ...args) => {
    const val = map.get(arg);
    if (val !== void 0)
      return val;
    const computed = fn(arg, ...args);
    map.set(arg, computed);
    return computed;
  };
}
/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
const _0n$6 = BigInt(0), _1n$7 = BigInt(1), _2n$6 = /* @__PURE__ */ BigInt(2), _3n$4 = /* @__PURE__ */ BigInt(3);
const _4n$2 = /* @__PURE__ */ BigInt(4), _5n$1 = /* @__PURE__ */ BigInt(5), _7n = /* @__PURE__ */ BigInt(7);
const _8n$2 = /* @__PURE__ */ BigInt(8), _9n = /* @__PURE__ */ BigInt(9), _16n = /* @__PURE__ */ BigInt(16);
function mod(a2, b2) {
  const result = a2 % b2;
  return result >= _0n$6 ? result : b2 + result;
}
function pow2(x3, power, modulo) {
  let res = x3;
  while (power-- > _0n$6) {
    res *= res;
    res %= modulo;
  }
  return res;
}
function invert(number, modulo) {
  if (number === _0n$6)
    throw new Error("invert: expected non-zero number");
  if (modulo <= _0n$6)
    throw new Error("invert: expected positive modulus, got " + modulo);
  let a2 = mod(number, modulo);
  let b2 = modulo;
  let x3 = _0n$6, u2 = _1n$7;
  while (a2 !== _0n$6) {
    const q2 = b2 / a2;
    const r2 = b2 % a2;
    const m2 = x3 - u2 * q2;
    b2 = a2, a2 = r2, x3 = u2, u2 = m2;
  }
  const gcd = b2;
  if (gcd !== _1n$7)
    throw new Error("invert: does not exist");
  return mod(x3, modulo);
}
function assertIsSquare(Fp3, root, n2) {
  if (!Fp3.eql(Fp3.sqr(root), n2))
    throw new Error("Cannot find square root");
}
function sqrt3mod4(Fp3, n2) {
  const p1div4 = (Fp3.ORDER + _1n$7) / _4n$2;
  const root = Fp3.pow(n2, p1div4);
  assertIsSquare(Fp3, root, n2);
  return root;
}
function sqrt5mod8(Fp3, n2) {
  const p5div8 = (Fp3.ORDER - _5n$1) / _8n$2;
  const n22 = Fp3.mul(n2, _2n$6);
  const v3 = Fp3.pow(n22, p5div8);
  const nv = Fp3.mul(n2, v3);
  const i3 = Fp3.mul(Fp3.mul(nv, _2n$6), v3);
  const root = Fp3.mul(nv, Fp3.sub(i3, Fp3.ONE));
  assertIsSquare(Fp3, root, n2);
  return root;
}
function sqrt9mod16(P2) {
  const Fp_ = Field(P2);
  const tn = tonelliShanks(P2);
  const c1 = tn(Fp_, Fp_.neg(Fp_.ONE));
  const c2 = tn(Fp_, c1);
  const c3 = tn(Fp_, Fp_.neg(c1));
  const c4 = (P2 + _7n) / _16n;
  return (Fp3, n2) => {
    let tv1 = Fp3.pow(n2, c4);
    let tv2 = Fp3.mul(tv1, c1);
    const tv3 = Fp3.mul(tv1, c2);
    const tv4 = Fp3.mul(tv1, c3);
    const e1 = Fp3.eql(Fp3.sqr(tv2), n2);
    const e22 = Fp3.eql(Fp3.sqr(tv3), n2);
    tv1 = Fp3.cmov(tv1, tv2, e1);
    tv2 = Fp3.cmov(tv4, tv3, e22);
    const e32 = Fp3.eql(Fp3.sqr(tv2), n2);
    const root = Fp3.cmov(tv1, tv2, e32);
    assertIsSquare(Fp3, root, n2);
    return root;
  };
}
function tonelliShanks(P2) {
  if (P2 < _3n$4)
    throw new Error("sqrt is not defined for small field");
  let Q2 = P2 - _1n$7;
  let S2 = 0;
  while (Q2 % _2n$6 === _0n$6) {
    Q2 /= _2n$6;
    S2++;
  }
  let Z2 = _2n$6;
  const _Fp = Field(P2);
  while (FpLegendre(_Fp, Z2) === 1) {
    if (Z2++ > 1e3)
      throw new Error("Cannot find square root: probably non-prime P");
  }
  if (S2 === 1)
    return sqrt3mod4;
  let cc = _Fp.pow(Z2, Q2);
  const Q1div2 = (Q2 + _1n$7) / _2n$6;
  return function tonelliSlow(Fp3, n2) {
    if (Fp3.is0(n2))
      return n2;
    if (FpLegendre(Fp3, n2) !== 1)
      throw new Error("Cannot find square root");
    let M2 = S2;
    let c2 = Fp3.mul(Fp3.ONE, cc);
    let t3 = Fp3.pow(n2, Q2);
    let R2 = Fp3.pow(n2, Q1div2);
    while (!Fp3.eql(t3, Fp3.ONE)) {
      if (Fp3.is0(t3))
        return Fp3.ZERO;
      let i3 = 1;
      let t_tmp = Fp3.sqr(t3);
      while (!Fp3.eql(t_tmp, Fp3.ONE)) {
        i3++;
        t_tmp = Fp3.sqr(t_tmp);
        if (i3 === M2)
          throw new Error("Cannot find square root");
      }
      const exponent = _1n$7 << BigInt(M2 - i3 - 1);
      const b2 = Fp3.pow(c2, exponent);
      M2 = i3;
      c2 = Fp3.sqr(b2);
      t3 = Fp3.mul(t3, c2);
      R2 = Fp3.mul(R2, b2);
    }
    return R2;
  };
}
function FpSqrt(P2) {
  if (P2 % _4n$2 === _3n$4)
    return sqrt3mod4;
  if (P2 % _8n$2 === _5n$1)
    return sqrt5mod8;
  if (P2 % _16n === _9n)
    return sqrt9mod16(P2);
  return tonelliShanks(P2);
}
const isNegativeLE = (num, modulo) => (mod(num, modulo) & _1n$7) === _1n$7;
const FIELD_FIELDS = [
  "create",
  "isValid",
  "is0",
  "neg",
  "inv",
  "sqrt",
  "sqr",
  "eql",
  "add",
  "sub",
  "mul",
  "pow",
  "div",
  "addN",
  "subN",
  "mulN",
  "sqrN"
];
function validateField(field) {
  const initial = {
    ORDER: "bigint",
    MASK: "bigint",
    BYTES: "number",
    BITS: "number"
  };
  const opts = FIELD_FIELDS.reduce((map, val) => {
    map[val] = "function";
    return map;
  }, initial);
  _validateObject(field, opts);
  return field;
}
function FpPow(Fp3, num, power) {
  if (power < _0n$6)
    throw new Error("invalid exponent, negatives unsupported");
  if (power === _0n$6)
    return Fp3.ONE;
  if (power === _1n$7)
    return num;
  let p2 = Fp3.ONE;
  let d2 = num;
  while (power > _0n$6) {
    if (power & _1n$7)
      p2 = Fp3.mul(p2, d2);
    d2 = Fp3.sqr(d2);
    power >>= _1n$7;
  }
  return p2;
}
function FpInvertBatch(Fp3, nums, passZero = false) {
  const inverted = new Array(nums.length).fill(passZero ? Fp3.ZERO : void 0);
  const multipliedAcc = nums.reduce((acc, num, i3) => {
    if (Fp3.is0(num))
      return acc;
    inverted[i3] = acc;
    return Fp3.mul(acc, num);
  }, Fp3.ONE);
  const invertedAcc = Fp3.inv(multipliedAcc);
  nums.reduceRight((acc, num, i3) => {
    if (Fp3.is0(num))
      return acc;
    inverted[i3] = Fp3.mul(acc, inverted[i3]);
    return Fp3.mul(acc, num);
  }, invertedAcc);
  return inverted;
}
function FpLegendre(Fp3, n2) {
  const p1mod2 = (Fp3.ORDER - _1n$7) / _2n$6;
  const powered = Fp3.pow(n2, p1mod2);
  const yes = Fp3.eql(powered, Fp3.ONE);
  const zero = Fp3.eql(powered, Fp3.ZERO);
  const no = Fp3.eql(powered, Fp3.neg(Fp3.ONE));
  if (!yes && !zero && !no)
    throw new Error("invalid Legendre symbol result");
  return yes ? 1 : zero ? 0 : -1;
}
function nLength(n2, nBitLength) {
  if (nBitLength !== void 0)
    anumber(nBitLength);
  const _nBitLength = nBitLength !== void 0 ? nBitLength : n2.toString(2).length;
  const nByteLength = Math.ceil(_nBitLength / 8);
  return { nBitLength: _nBitLength, nByteLength };
}
function Field(ORDER, bitLenOrOpts, isLE = false, opts = {}) {
  if (ORDER <= _0n$6)
    throw new Error("invalid field: expected ORDER > 0, got " + ORDER);
  let _nbitLength = void 0;
  let _sqrt = void 0;
  let modFromBytes = false;
  let allowedLengths = void 0;
  if (typeof bitLenOrOpts === "object" && bitLenOrOpts != null) {
    if (opts.sqrt || isLE)
      throw new Error("cannot specify opts in two arguments");
    const _opts = bitLenOrOpts;
    if (_opts.BITS)
      _nbitLength = _opts.BITS;
    if (_opts.sqrt)
      _sqrt = _opts.sqrt;
    if (typeof _opts.isLE === "boolean")
      isLE = _opts.isLE;
    if (typeof _opts.modFromBytes === "boolean")
      modFromBytes = _opts.modFromBytes;
    allowedLengths = _opts.allowedLengths;
  } else {
    if (typeof bitLenOrOpts === "number")
      _nbitLength = bitLenOrOpts;
    if (opts.sqrt)
      _sqrt = opts.sqrt;
  }
  const { nBitLength: BITS, nByteLength: BYTES } = nLength(ORDER, _nbitLength);
  if (BYTES > 2048)
    throw new Error("invalid field: expected ORDER of <= 2048 bytes");
  let sqrtP;
  const f2 = Object.freeze({
    ORDER,
    isLE,
    BITS,
    BYTES,
    MASK: bitMask(BITS),
    ZERO: _0n$6,
    ONE: _1n$7,
    allowedLengths,
    create: (num) => mod(num, ORDER),
    isValid: (num) => {
      if (typeof num !== "bigint")
        throw new Error("invalid field element: expected bigint, got " + typeof num);
      return _0n$6 <= num && num < ORDER;
    },
    is0: (num) => num === _0n$6,
    // is valid and invertible
    isValidNot0: (num) => !f2.is0(num) && f2.isValid(num),
    isOdd: (num) => (num & _1n$7) === _1n$7,
    neg: (num) => mod(-num, ORDER),
    eql: (lhs, rhs) => lhs === rhs,
    sqr: (num) => mod(num * num, ORDER),
    add: (lhs, rhs) => mod(lhs + rhs, ORDER),
    sub: (lhs, rhs) => mod(lhs - rhs, ORDER),
    mul: (lhs, rhs) => mod(lhs * rhs, ORDER),
    pow: (num, power) => FpPow(f2, num, power),
    div: (lhs, rhs) => mod(lhs * invert(rhs, ORDER), ORDER),
    // Same as above, but doesn't normalize
    sqrN: (num) => num * num,
    addN: (lhs, rhs) => lhs + rhs,
    subN: (lhs, rhs) => lhs - rhs,
    mulN: (lhs, rhs) => lhs * rhs,
    inv: (num) => invert(num, ORDER),
    sqrt: _sqrt || ((n2) => {
      if (!sqrtP)
        sqrtP = FpSqrt(ORDER);
      return sqrtP(f2, n2);
    }),
    toBytes: (num) => isLE ? numberToBytesLE(num, BYTES) : numberToBytesBE(num, BYTES),
    fromBytes: (bytes, skipValidation = true) => {
      if (allowedLengths) {
        if (!allowedLengths.includes(bytes.length) || bytes.length > BYTES) {
          throw new Error("Field.fromBytes: expected " + allowedLengths + " bytes, got " + bytes.length);
        }
        const padded = new Uint8Array(BYTES);
        padded.set(bytes, isLE ? 0 : padded.length - bytes.length);
        bytes = padded;
      }
      if (bytes.length !== BYTES)
        throw new Error("Field.fromBytes: expected " + BYTES + " bytes, got " + bytes.length);
      let scalar = isLE ? bytesToNumberLE(bytes) : bytesToNumberBE(bytes);
      if (modFromBytes)
        scalar = mod(scalar, ORDER);
      if (!skipValidation) {
        if (!f2.isValid(scalar))
          throw new Error("invalid field element: outside of range 0..ORDER");
      }
      return scalar;
    },
    // TODO: we don't need it here, move out to separate fn
    invertBatch: (lst) => FpInvertBatch(f2, lst),
    // We can't move this out because Fp6, Fp12 implement it
    // and it's unclear what to return in there.
    cmov: (a2, b2, c2) => c2 ? b2 : a2
  });
  return Object.freeze(f2);
}
function getFieldBytesLength(fieldOrder) {
  if (typeof fieldOrder !== "bigint")
    throw new Error("field order must be bigint");
  const bitLength = fieldOrder.toString(2).length;
  return Math.ceil(bitLength / 8);
}
function getMinHashLength(fieldOrder) {
  const length = getFieldBytesLength(fieldOrder);
  return length + Math.ceil(length / 2);
}
function mapHashToField(key, fieldOrder, isLE = false) {
  const len = key.length;
  const fieldLen = getFieldBytesLength(fieldOrder);
  const minLen = getMinHashLength(fieldOrder);
  if (len < 16 || len < minLen || len > 1024)
    throw new Error("expected " + minLen + "-1024 bytes of input, got " + len);
  const num = isLE ? bytesToNumberLE(key) : bytesToNumberBE(key);
  const reduced = mod(num, fieldOrder - _1n$7) + _1n$7;
  return isLE ? numberToBytesLE(reduced, fieldLen) : numberToBytesBE(reduced, fieldLen);
}
/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
const _0n$5 = BigInt(0);
const _1n$6 = BigInt(1);
function negateCt(condition, item) {
  const neg = item.negate();
  return condition ? neg : item;
}
function normalizeZ(c2, points) {
  const invertedZs = FpInvertBatch(c2.Fp, points.map((p2) => p2.Z));
  return points.map((p2, i3) => c2.fromAffine(p2.toAffine(invertedZs[i3])));
}
function validateW(W2, bits) {
  if (!Number.isSafeInteger(W2) || W2 <= 0 || W2 > bits)
    throw new Error("invalid window size, expected [1.." + bits + "], got W=" + W2);
}
function calcWOpts(W2, scalarBits) {
  validateW(W2, scalarBits);
  const windows = Math.ceil(scalarBits / W2) + 1;
  const windowSize = 2 ** (W2 - 1);
  const maxNumber = 2 ** W2;
  const mask = bitMask(W2);
  const shiftBy = BigInt(W2);
  return { windows, windowSize, mask, maxNumber, shiftBy };
}
function calcOffsets(n2, window2, wOpts) {
  const { windowSize, mask, maxNumber, shiftBy } = wOpts;
  let wbits = Number(n2 & mask);
  let nextN = n2 >> shiftBy;
  if (wbits > windowSize) {
    wbits -= maxNumber;
    nextN += _1n$6;
  }
  const offsetStart = window2 * windowSize;
  const offset = offsetStart + Math.abs(wbits) - 1;
  const isZero = wbits === 0;
  const isNeg = wbits < 0;
  const isNegF = window2 % 2 !== 0;
  const offsetF = offsetStart;
  return { nextN, offset, isZero, isNeg, isNegF, offsetF };
}
function validateMSMPoints(points, c2) {
  if (!Array.isArray(points))
    throw new Error("array expected");
  points.forEach((p2, i3) => {
    if (!(p2 instanceof c2))
      throw new Error("invalid point at index " + i3);
  });
}
function validateMSMScalars(scalars, field) {
  if (!Array.isArray(scalars))
    throw new Error("array of scalars expected");
  scalars.forEach((s2, i3) => {
    if (!field.isValid(s2))
      throw new Error("invalid scalar at index " + i3);
  });
}
const pointPrecomputes = /* @__PURE__ */ new WeakMap();
const pointWindowSizes = /* @__PURE__ */ new WeakMap();
function getW(P2) {
  return pointWindowSizes.get(P2) || 1;
}
function assert0(n2) {
  if (n2 !== _0n$5)
    throw new Error("invalid wNAF");
}
class wNAF {
  // Parametrized with a given Point class (not individual point)
  constructor(Point, bits) {
    this.BASE = Point.BASE;
    this.ZERO = Point.ZERO;
    this.Fn = Point.Fn;
    this.bits = bits;
  }
  // non-const time multiplication ladder
  _unsafeLadder(elm, n2, p2 = this.ZERO) {
    let d2 = elm;
    while (n2 > _0n$5) {
      if (n2 & _1n$6)
        p2 = p2.add(d2);
      d2 = d2.double();
      n2 >>= _1n$6;
    }
    return p2;
  }
  /**
   * Creates a wNAF precomputation window. Used for caching.
   * Default window size is set by `utils.precompute()` and is equal to 8.
   * Number of precomputed points depends on the curve size:
   * 2^(𝑊−1) * (Math.ceil(𝑛 / 𝑊) + 1), where:
   * - 𝑊 is the window size
   * - 𝑛 is the bitlength of the curve order.
   * For a 256-bit curve and window size 8, the number of precomputed points is 128 * 33 = 4224.
   * @param point Point instance
   * @param W window size
   * @returns precomputed point tables flattened to a single array
   */
  precomputeWindow(point, W2) {
    const { windows, windowSize } = calcWOpts(W2, this.bits);
    const points = [];
    let p2 = point;
    let base = p2;
    for (let window2 = 0; window2 < windows; window2++) {
      base = p2;
      points.push(base);
      for (let i3 = 1; i3 < windowSize; i3++) {
        base = base.add(p2);
        points.push(base);
      }
      p2 = base.double();
    }
    return points;
  }
  /**
   * Implements ec multiplication using precomputed tables and w-ary non-adjacent form.
   * More compact implementation:
   * https://github.com/paulmillr/noble-secp256k1/blob/47cb1669b6e506ad66b35fe7d76132ae97465da2/index.ts#L502-L541
   * @returns real and fake (for const-time) points
   */
  wNAF(W2, precomputes, n2) {
    if (!this.Fn.isValid(n2))
      throw new Error("invalid scalar");
    let p2 = this.ZERO;
    let f2 = this.BASE;
    const wo = calcWOpts(W2, this.bits);
    for (let window2 = 0; window2 < wo.windows; window2++) {
      const { nextN, offset, isZero, isNeg, isNegF, offsetF } = calcOffsets(n2, window2, wo);
      n2 = nextN;
      if (isZero) {
        f2 = f2.add(negateCt(isNegF, precomputes[offsetF]));
      } else {
        p2 = p2.add(negateCt(isNeg, precomputes[offset]));
      }
    }
    assert0(n2);
    return { p: p2, f: f2 };
  }
  /**
   * Implements ec unsafe (non const-time) multiplication using precomputed tables and w-ary non-adjacent form.
   * @param acc accumulator point to add result of multiplication
   * @returns point
   */
  wNAFUnsafe(W2, precomputes, n2, acc = this.ZERO) {
    const wo = calcWOpts(W2, this.bits);
    for (let window2 = 0; window2 < wo.windows; window2++) {
      if (n2 === _0n$5)
        break;
      const { nextN, offset, isZero, isNeg } = calcOffsets(n2, window2, wo);
      n2 = nextN;
      if (isZero) {
        continue;
      } else {
        const item = precomputes[offset];
        acc = acc.add(isNeg ? item.negate() : item);
      }
    }
    assert0(n2);
    return acc;
  }
  getPrecomputes(W2, point, transform) {
    let comp = pointPrecomputes.get(point);
    if (!comp) {
      comp = this.precomputeWindow(point, W2);
      if (W2 !== 1) {
        if (typeof transform === "function")
          comp = transform(comp);
        pointPrecomputes.set(point, comp);
      }
    }
    return comp;
  }
  cached(point, scalar, transform) {
    const W2 = getW(point);
    return this.wNAF(W2, this.getPrecomputes(W2, point, transform), scalar);
  }
  unsafe(point, scalar, transform, prev) {
    const W2 = getW(point);
    if (W2 === 1)
      return this._unsafeLadder(point, scalar, prev);
    return this.wNAFUnsafe(W2, this.getPrecomputes(W2, point, transform), scalar, prev);
  }
  // We calculate precomputes for elliptic curve point multiplication
  // using windowed method. This specifies window size and
  // stores precomputed values. Usually only base point would be precomputed.
  createCache(P2, W2) {
    validateW(W2, this.bits);
    pointWindowSizes.set(P2, W2);
    pointPrecomputes.delete(P2);
  }
  hasCache(elm) {
    return getW(elm) !== 1;
  }
}
function mulEndoUnsafe(Point, point, k1, k2) {
  let acc = point;
  let p1 = Point.ZERO;
  let p2 = Point.ZERO;
  while (k1 > _0n$5 || k2 > _0n$5) {
    if (k1 & _1n$6)
      p1 = p1.add(acc);
    if (k2 & _1n$6)
      p2 = p2.add(acc);
    acc = acc.double();
    k1 >>= _1n$6;
    k2 >>= _1n$6;
  }
  return { p1, p2 };
}
function pippenger(c2, fieldN, points, scalars) {
  validateMSMPoints(points, c2);
  validateMSMScalars(scalars, fieldN);
  const plength = points.length;
  const slength = scalars.length;
  if (plength !== slength)
    throw new Error("arrays of points and scalars must have equal length");
  const zero = c2.ZERO;
  const wbits = bitLen(BigInt(plength));
  let windowSize = 1;
  if (wbits > 12)
    windowSize = wbits - 3;
  else if (wbits > 4)
    windowSize = wbits - 2;
  else if (wbits > 0)
    windowSize = 2;
  const MASK = bitMask(windowSize);
  const buckets = new Array(Number(MASK) + 1).fill(zero);
  const lastBits = Math.floor((fieldN.BITS - 1) / windowSize) * windowSize;
  let sum = zero;
  for (let i3 = lastBits; i3 >= 0; i3 -= windowSize) {
    buckets.fill(zero);
    for (let j2 = 0; j2 < slength; j2++) {
      const scalar = scalars[j2];
      const wbits2 = Number(scalar >> BigInt(i3) & MASK);
      buckets[wbits2] = buckets[wbits2].add(points[j2]);
    }
    let resI = zero;
    for (let j2 = buckets.length - 1, sumI = zero; j2 > 0; j2--) {
      sumI = sumI.add(buckets[j2]);
      resI = resI.add(sumI);
    }
    sum = sum.add(resI);
    if (i3 !== 0)
      for (let j2 = 0; j2 < windowSize; j2++)
        sum = sum.double();
  }
  return sum;
}
function createField(order, field, isLE) {
  if (field) {
    if (field.ORDER !== order)
      throw new Error("Field.ORDER must match order: Fp == p, Fn == n");
    validateField(field);
    return field;
  } else {
    return Field(order, { isLE });
  }
}
function _createCurveFields(type, CURVE, curveOpts = {}, FpFnLE) {
  if (FpFnLE === void 0)
    FpFnLE = type === "edwards";
  if (!CURVE || typeof CURVE !== "object")
    throw new Error(`expected valid ${type} CURVE object`);
  for (const p2 of ["p", "n", "h"]) {
    const val = CURVE[p2];
    if (!(typeof val === "bigint" && val > _0n$5))
      throw new Error(`CURVE.${p2} must be positive bigint`);
  }
  const Fp3 = createField(CURVE.p, curveOpts.Fp, FpFnLE);
  const Fn = createField(CURVE.n, curveOpts.Fn, FpFnLE);
  const _b2 = type === "weierstrass" ? "b" : "d";
  const params = ["Gx", "Gy", "a", _b2];
  for (const p2 of params) {
    if (!Fp3.isValid(CURVE[p2]))
      throw new Error(`CURVE.${p2} must be valid field element of CURVE.Fp`);
  }
  CURVE = Object.freeze(Object.assign({}, CURVE));
  return { CURVE, Fp: Fp3, Fn };
}
const os2ip = bytesToNumberBE;
function i2osp(value, length) {
  anum(value);
  anum(length);
  if (value < 0 || value >= 1 << 8 * length)
    throw new Error("invalid I2OSP input: " + value);
  const res = Array.from({ length }).fill(0);
  for (let i3 = length - 1; i3 >= 0; i3--) {
    res[i3] = value & 255;
    value >>>= 8;
  }
  return new Uint8Array(res);
}
function strxor(a2, b2) {
  const arr = new Uint8Array(a2.length);
  for (let i3 = 0; i3 < a2.length; i3++) {
    arr[i3] = a2[i3] ^ b2[i3];
  }
  return arr;
}
function anum(item) {
  if (!Number.isSafeInteger(item))
    throw new Error("number expected");
}
function normDST(DST) {
  if (!isBytes(DST) && typeof DST !== "string")
    throw new Error("DST must be Uint8Array or string");
  return typeof DST === "string" ? utf8ToBytes(DST) : DST;
}
function expand_message_xmd(msg, DST, lenInBytes, H2) {
  abytes(msg);
  anum(lenInBytes);
  DST = normDST(DST);
  if (DST.length > 255)
    DST = H2(concatBytes(utf8ToBytes("H2C-OVERSIZE-DST-"), DST));
  const { outputLen: b_in_bytes, blockLen: r_in_bytes } = H2;
  const ell = Math.ceil(lenInBytes / b_in_bytes);
  if (lenInBytes > 65535 || ell > 255)
    throw new Error("expand_message_xmd: invalid lenInBytes");
  const DST_prime = concatBytes(DST, i2osp(DST.length, 1));
  const Z_pad = i2osp(0, r_in_bytes);
  const l_i_b_str = i2osp(lenInBytes, 2);
  const b2 = new Array(ell);
  const b_0 = H2(concatBytes(Z_pad, msg, l_i_b_str, i2osp(0, 1), DST_prime));
  b2[0] = H2(concatBytes(b_0, i2osp(1, 1), DST_prime));
  for (let i3 = 1; i3 <= ell; i3++) {
    const args = [strxor(b_0, b2[i3 - 1]), i2osp(i3 + 1, 1), DST_prime];
    b2[i3] = H2(concatBytes(...args));
  }
  const pseudo_random_bytes = concatBytes(...b2);
  return pseudo_random_bytes.slice(0, lenInBytes);
}
function expand_message_xof(msg, DST, lenInBytes, k2, H2) {
  abytes(msg);
  anum(lenInBytes);
  DST = normDST(DST);
  if (DST.length > 255) {
    const dkLen = Math.ceil(2 * k2 / 8);
    DST = H2.create({ dkLen }).update(utf8ToBytes("H2C-OVERSIZE-DST-")).update(DST).digest();
  }
  if (lenInBytes > 65535 || DST.length > 255)
    throw new Error("expand_message_xof: invalid lenInBytes");
  return H2.create({ dkLen: lenInBytes }).update(msg).update(i2osp(lenInBytes, 2)).update(DST).update(i2osp(DST.length, 1)).digest();
}
function hash_to_field(msg, count, options) {
  _validateObject(options, {
    p: "bigint",
    m: "number",
    k: "number",
    hash: "function"
  });
  const { p: p2, k: k2, m: m2, hash, expand, DST } = options;
  if (!isHash(options.hash))
    throw new Error("expected valid hash");
  abytes(msg);
  anum(count);
  const log2p = p2.toString(2).length;
  const L2 = Math.ceil((log2p + k2) / 8);
  const len_in_bytes = count * m2 * L2;
  let prb;
  if (expand === "xmd") {
    prb = expand_message_xmd(msg, DST, len_in_bytes, hash);
  } else if (expand === "xof") {
    prb = expand_message_xof(msg, DST, len_in_bytes, k2, hash);
  } else if (expand === "_internal_pass") {
    prb = msg;
  } else {
    throw new Error('expand must be "xmd" or "xof"');
  }
  const u2 = new Array(count);
  for (let i3 = 0; i3 < count; i3++) {
    const e5 = new Array(m2);
    for (let j2 = 0; j2 < m2; j2++) {
      const elm_offset = L2 * (j2 + i3 * m2);
      const tv = prb.subarray(elm_offset, elm_offset + L2);
      e5[j2] = mod(os2ip(tv), p2);
    }
    u2[i3] = e5;
  }
  return u2;
}
function isogenyMap(field, map) {
  const coeff = map.map((i3) => Array.from(i3).reverse());
  return (x3, y2) => {
    const [xn, xd, yn, yd] = coeff.map((val) => val.reduce((acc, i3) => field.add(field.mul(acc, x3), i3)));
    const [xd_inv, yd_inv] = FpInvertBatch(field, [xd, yd], true);
    x3 = field.mul(xn, xd_inv);
    y2 = field.mul(y2, field.mul(yn, yd_inv));
    return { x: x3, y: y2 };
  };
}
const _DST_scalar = utf8ToBytes("HashToScalar-");
function createHasher(Point, mapToCurve, defaults) {
  if (typeof mapToCurve !== "function")
    throw new Error("mapToCurve() must be defined");
  function map(num) {
    return Point.fromAffine(mapToCurve(num));
  }
  function clear(initial) {
    const P2 = initial.clearCofactor();
    if (P2.equals(Point.ZERO))
      return Point.ZERO;
    P2.assertValidity();
    return P2;
  }
  return {
    defaults,
    hashToCurve(msg, options) {
      const opts = Object.assign({}, defaults, options);
      const u2 = hash_to_field(msg, 2, opts);
      const u0 = map(u2[0]);
      const u1 = map(u2[1]);
      return clear(u0.add(u1));
    },
    encodeToCurve(msg, options) {
      const optsDst = defaults.encodeDST ? { DST: defaults.encodeDST } : {};
      const opts = Object.assign({}, defaults, optsDst, options);
      const u2 = hash_to_field(msg, 1, opts);
      const u0 = map(u2[0]);
      return clear(u0);
    },
    /** See {@link H2CHasher} */
    mapToCurve(scalars) {
      if (!Array.isArray(scalars))
        throw new Error("expected array of bigints");
      for (const i3 of scalars)
        if (typeof i3 !== "bigint")
          throw new Error("expected array of bigints");
      return clear(map(scalars));
    },
    // hash_to_scalar can produce 0: https://www.rfc-editor.org/errata/eid8393
    // RFC 9380, draft-irtf-cfrg-bbs-signatures-08
    hashToScalar(msg, options) {
      const N2 = Point.Fn.ORDER;
      const opts = Object.assign({}, defaults, { p: N2, m: 1, DST: _DST_scalar }, options);
      return hash_to_field(msg, 1, opts)[0][0];
    }
  };
}
/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
const divNearest = (num, den) => (num + (num >= 0 ? den : -den) / _2n$5) / den;
function _splitEndoScalar(k2, basis, n2) {
  const [[a1, b1], [a2, b2]] = basis;
  const c1 = divNearest(b2 * k2, n2);
  const c2 = divNearest(-b1 * k2, n2);
  let k1 = k2 - c1 * a1 - c2 * a2;
  let k22 = -c1 * b1 - c2 * b2;
  const k1neg = k1 < _0n$4;
  const k2neg = k22 < _0n$4;
  if (k1neg)
    k1 = -k1;
  if (k2neg)
    k22 = -k22;
  const MAX_NUM = bitMask(Math.ceil(bitLen(n2) / 2)) + _1n$5;
  if (k1 < _0n$4 || k1 >= MAX_NUM || k22 < _0n$4 || k22 >= MAX_NUM) {
    throw new Error("splitScalar (endomorphism): failed, k=" + k2);
  }
  return { k1neg, k1, k2neg, k2: k22 };
}
const _0n$4 = BigInt(0), _1n$5 = BigInt(1), _2n$5 = BigInt(2), _3n$3 = BigInt(3), _4n$1 = BigInt(4);
function _normFnElement(Fn, key) {
  const { BYTES: expected } = Fn;
  let num;
  if (typeof key === "bigint") {
    num = key;
  } else {
    let bytes = ensureBytes("private key", key);
    try {
      num = Fn.fromBytes(bytes);
    } catch (error) {
      throw new Error(`invalid private key: expected ui8a of size ${expected}, got ${typeof key}`);
    }
  }
  if (!Fn.isValidNot0(num))
    throw new Error("invalid private key: out of range [1..N-1]");
  return num;
}
function weierstrassN(params, extraOpts = {}) {
  const validated = _createCurveFields("weierstrass", params, extraOpts);
  const { Fp: Fp3, Fn } = validated;
  let CURVE = validated.CURVE;
  const { h: cofactor, n: CURVE_ORDER } = CURVE;
  _validateObject(extraOpts, {}, {
    allowInfinityPoint: "boolean",
    clearCofactor: "function",
    isTorsionFree: "function",
    fromBytes: "function",
    toBytes: "function",
    endo: "object",
    wrapPrivateKey: "boolean"
  });
  const { endo } = extraOpts;
  if (endo) {
    if (!Fp3.is0(CURVE.a) || typeof endo.beta !== "bigint" || !Array.isArray(endo.basises)) {
      throw new Error('invalid endo: expected "beta": bigint and "basises": array');
    }
  }
  const lengths = getWLengths(Fp3, Fn);
  function assertCompressionIsSupported() {
    if (!Fp3.isOdd)
      throw new Error("compression is not supported: Field does not have .isOdd()");
  }
  function pointToBytes(_c, point, isCompressed) {
    const { x: x3, y: y2 } = point.toAffine();
    const bx = Fp3.toBytes(x3);
    _abool2(isCompressed, "isCompressed");
    if (isCompressed) {
      assertCompressionIsSupported();
      const hasEvenY = !Fp3.isOdd(y2);
      return concatBytes(pprefix(hasEvenY), bx);
    } else {
      return concatBytes(Uint8Array.of(4), bx, Fp3.toBytes(y2));
    }
  }
  function pointFromBytes(bytes) {
    _abytes2(bytes, void 0, "Point");
    const { publicKey: comp, publicKeyUncompressed: uncomp } = lengths;
    const length = bytes.length;
    const head = bytes[0];
    const tail = bytes.subarray(1);
    if (length === comp && (head === 2 || head === 3)) {
      const x3 = Fp3.fromBytes(tail);
      if (!Fp3.isValid(x3))
        throw new Error("bad point: is not on curve, wrong x");
      const y2 = weierstrassEquation(x3);
      let y3;
      try {
        y3 = Fp3.sqrt(y2);
      } catch (sqrtError) {
        const err = sqrtError instanceof Error ? ": " + sqrtError.message : "";
        throw new Error("bad point: is not on curve, sqrt error" + err);
      }
      assertCompressionIsSupported();
      const isYOdd = Fp3.isOdd(y3);
      const isHeadOdd = (head & 1) === 1;
      if (isHeadOdd !== isYOdd)
        y3 = Fp3.neg(y3);
      return { x: x3, y: y3 };
    } else if (length === uncomp && head === 4) {
      const L2 = Fp3.BYTES;
      const x3 = Fp3.fromBytes(tail.subarray(0, L2));
      const y2 = Fp3.fromBytes(tail.subarray(L2, L2 * 2));
      if (!isValidXY(x3, y2))
        throw new Error("bad point: is not on curve");
      return { x: x3, y: y2 };
    } else {
      throw new Error(`bad point: got length ${length}, expected compressed=${comp} or uncompressed=${uncomp}`);
    }
  }
  const encodePoint = extraOpts.toBytes || pointToBytes;
  const decodePoint = extraOpts.fromBytes || pointFromBytes;
  function weierstrassEquation(x3) {
    const x22 = Fp3.sqr(x3);
    const x32 = Fp3.mul(x22, x3);
    return Fp3.add(Fp3.add(x32, Fp3.mul(x3, CURVE.a)), CURVE.b);
  }
  function isValidXY(x3, y2) {
    const left = Fp3.sqr(y2);
    const right = weierstrassEquation(x3);
    return Fp3.eql(left, right);
  }
  if (!isValidXY(CURVE.Gx, CURVE.Gy))
    throw new Error("bad curve params: generator point");
  const _4a3 = Fp3.mul(Fp3.pow(CURVE.a, _3n$3), _4n$1);
  const _27b2 = Fp3.mul(Fp3.sqr(CURVE.b), BigInt(27));
  if (Fp3.is0(Fp3.add(_4a3, _27b2)))
    throw new Error("bad curve params: a or b");
  function acoord(title, n2, banZero = false) {
    if (!Fp3.isValid(n2) || banZero && Fp3.is0(n2))
      throw new Error(`bad point coordinate ${title}`);
    return n2;
  }
  function aprjpoint(other) {
    if (!(other instanceof Point))
      throw new Error("ProjectivePoint expected");
  }
  function splitEndoScalarN(k2) {
    if (!endo || !endo.basises)
      throw new Error("no endo");
    return _splitEndoScalar(k2, endo.basises, Fn.ORDER);
  }
  const toAffineMemo = memoized((p2, iz) => {
    const { X: X2, Y: Y2, Z: Z2 } = p2;
    if (Fp3.eql(Z2, Fp3.ONE))
      return { x: X2, y: Y2 };
    const is0 = p2.is0();
    if (iz == null)
      iz = is0 ? Fp3.ONE : Fp3.inv(Z2);
    const x3 = Fp3.mul(X2, iz);
    const y2 = Fp3.mul(Y2, iz);
    const zz = Fp3.mul(Z2, iz);
    if (is0)
      return { x: Fp3.ZERO, y: Fp3.ZERO };
    if (!Fp3.eql(zz, Fp3.ONE))
      throw new Error("invZ was invalid");
    return { x: x3, y: y2 };
  });
  const assertValidMemo = memoized((p2) => {
    if (p2.is0()) {
      if (extraOpts.allowInfinityPoint && !Fp3.is0(p2.Y))
        return;
      throw new Error("bad point: ZERO");
    }
    const { x: x3, y: y2 } = p2.toAffine();
    if (!Fp3.isValid(x3) || !Fp3.isValid(y2))
      throw new Error("bad point: x or y not field elements");
    if (!isValidXY(x3, y2))
      throw new Error("bad point: equation left != right");
    if (!p2.isTorsionFree())
      throw new Error("bad point: not in prime-order subgroup");
    return true;
  });
  function finishEndo(endoBeta, k1p, k2p, k1neg, k2neg) {
    k2p = new Point(Fp3.mul(k2p.X, endoBeta), k2p.Y, k2p.Z);
    k1p = negateCt(k1neg, k1p);
    k2p = negateCt(k2neg, k2p);
    return k1p.add(k2p);
  }
  class Point {
    /** Does NOT validate if the point is valid. Use `.assertValidity()`. */
    constructor(X2, Y2, Z2) {
      this.X = acoord("x", X2);
      this.Y = acoord("y", Y2, true);
      this.Z = acoord("z", Z2);
      Object.freeze(this);
    }
    static CURVE() {
      return CURVE;
    }
    /** Does NOT validate if the point is valid. Use `.assertValidity()`. */
    static fromAffine(p2) {
      const { x: x3, y: y2 } = p2 || {};
      if (!p2 || !Fp3.isValid(x3) || !Fp3.isValid(y2))
        throw new Error("invalid affine point");
      if (p2 instanceof Point)
        throw new Error("projective point not allowed");
      if (Fp3.is0(x3) && Fp3.is0(y2))
        return Point.ZERO;
      return new Point(x3, y2, Fp3.ONE);
    }
    static fromBytes(bytes) {
      const P2 = Point.fromAffine(decodePoint(_abytes2(bytes, void 0, "point")));
      P2.assertValidity();
      return P2;
    }
    static fromHex(hex) {
      return Point.fromBytes(ensureBytes("pointHex", hex));
    }
    get x() {
      return this.toAffine().x;
    }
    get y() {
      return this.toAffine().y;
    }
    /**
     *
     * @param windowSize
     * @param isLazy true will defer table computation until the first multiplication
     * @returns
     */
    precompute(windowSize = 8, isLazy = true) {
      wnaf.createCache(this, windowSize);
      if (!isLazy)
        this.multiply(_3n$3);
      return this;
    }
    // TODO: return `this`
    /** A point on curve is valid if it conforms to equation. */
    assertValidity() {
      assertValidMemo(this);
    }
    hasEvenY() {
      const { y: y2 } = this.toAffine();
      if (!Fp3.isOdd)
        throw new Error("Field doesn't support isOdd");
      return !Fp3.isOdd(y2);
    }
    /** Compare one point to another. */
    equals(other) {
      aprjpoint(other);
      const { X: X1, Y: Y1, Z: Z1 } = this;
      const { X: X2, Y: Y2, Z: Z2 } = other;
      const U1 = Fp3.eql(Fp3.mul(X1, Z2), Fp3.mul(X2, Z1));
      const U2 = Fp3.eql(Fp3.mul(Y1, Z2), Fp3.mul(Y2, Z1));
      return U1 && U2;
    }
    /** Flips point to one corresponding to (x, -y) in Affine coordinates. */
    negate() {
      return new Point(this.X, Fp3.neg(this.Y), this.Z);
    }
    // Renes-Costello-Batina exception-free doubling formula.
    // There is 30% faster Jacobian formula, but it is not complete.
    // https://eprint.iacr.org/2015/1060, algorithm 3
    // Cost: 8M + 3S + 3*a + 2*b3 + 15add.
    double() {
      const { a: a2, b: b2 } = CURVE;
      const b3 = Fp3.mul(b2, _3n$3);
      const { X: X1, Y: Y1, Z: Z1 } = this;
      let X3 = Fp3.ZERO, Y3 = Fp3.ZERO, Z3 = Fp3.ZERO;
      let t0 = Fp3.mul(X1, X1);
      let t1 = Fp3.mul(Y1, Y1);
      let t22 = Fp3.mul(Z1, Z1);
      let t3 = Fp3.mul(X1, Y1);
      t3 = Fp3.add(t3, t3);
      Z3 = Fp3.mul(X1, Z1);
      Z3 = Fp3.add(Z3, Z3);
      X3 = Fp3.mul(a2, Z3);
      Y3 = Fp3.mul(b3, t22);
      Y3 = Fp3.add(X3, Y3);
      X3 = Fp3.sub(t1, Y3);
      Y3 = Fp3.add(t1, Y3);
      Y3 = Fp3.mul(X3, Y3);
      X3 = Fp3.mul(t3, X3);
      Z3 = Fp3.mul(b3, Z3);
      t22 = Fp3.mul(a2, t22);
      t3 = Fp3.sub(t0, t22);
      t3 = Fp3.mul(a2, t3);
      t3 = Fp3.add(t3, Z3);
      Z3 = Fp3.add(t0, t0);
      t0 = Fp3.add(Z3, t0);
      t0 = Fp3.add(t0, t22);
      t0 = Fp3.mul(t0, t3);
      Y3 = Fp3.add(Y3, t0);
      t22 = Fp3.mul(Y1, Z1);
      t22 = Fp3.add(t22, t22);
      t0 = Fp3.mul(t22, t3);
      X3 = Fp3.sub(X3, t0);
      Z3 = Fp3.mul(t22, t1);
      Z3 = Fp3.add(Z3, Z3);
      Z3 = Fp3.add(Z3, Z3);
      return new Point(X3, Y3, Z3);
    }
    // Renes-Costello-Batina exception-free addition formula.
    // There is 30% faster Jacobian formula, but it is not complete.
    // https://eprint.iacr.org/2015/1060, algorithm 1
    // Cost: 12M + 0S + 3*a + 3*b3 + 23add.
    add(other) {
      aprjpoint(other);
      const { X: X1, Y: Y1, Z: Z1 } = this;
      const { X: X2, Y: Y2, Z: Z2 } = other;
      let X3 = Fp3.ZERO, Y3 = Fp3.ZERO, Z3 = Fp3.ZERO;
      const a2 = CURVE.a;
      const b3 = Fp3.mul(CURVE.b, _3n$3);
      let t0 = Fp3.mul(X1, X2);
      let t1 = Fp3.mul(Y1, Y2);
      let t22 = Fp3.mul(Z1, Z2);
      let t3 = Fp3.add(X1, Y1);
      let t4 = Fp3.add(X2, Y2);
      t3 = Fp3.mul(t3, t4);
      t4 = Fp3.add(t0, t1);
      t3 = Fp3.sub(t3, t4);
      t4 = Fp3.add(X1, Z1);
      let t5 = Fp3.add(X2, Z2);
      t4 = Fp3.mul(t4, t5);
      t5 = Fp3.add(t0, t22);
      t4 = Fp3.sub(t4, t5);
      t5 = Fp3.add(Y1, Z1);
      X3 = Fp3.add(Y2, Z2);
      t5 = Fp3.mul(t5, X3);
      X3 = Fp3.add(t1, t22);
      t5 = Fp3.sub(t5, X3);
      Z3 = Fp3.mul(a2, t4);
      X3 = Fp3.mul(b3, t22);
      Z3 = Fp3.add(X3, Z3);
      X3 = Fp3.sub(t1, Z3);
      Z3 = Fp3.add(t1, Z3);
      Y3 = Fp3.mul(X3, Z3);
      t1 = Fp3.add(t0, t0);
      t1 = Fp3.add(t1, t0);
      t22 = Fp3.mul(a2, t22);
      t4 = Fp3.mul(b3, t4);
      t1 = Fp3.add(t1, t22);
      t22 = Fp3.sub(t0, t22);
      t22 = Fp3.mul(a2, t22);
      t4 = Fp3.add(t4, t22);
      t0 = Fp3.mul(t1, t4);
      Y3 = Fp3.add(Y3, t0);
      t0 = Fp3.mul(t5, t4);
      X3 = Fp3.mul(t3, X3);
      X3 = Fp3.sub(X3, t0);
      t0 = Fp3.mul(t3, t1);
      Z3 = Fp3.mul(t5, Z3);
      Z3 = Fp3.add(Z3, t0);
      return new Point(X3, Y3, Z3);
    }
    subtract(other) {
      return this.add(other.negate());
    }
    is0() {
      return this.equals(Point.ZERO);
    }
    /**
     * Constant time multiplication.
     * Uses wNAF method. Windowed method may be 10% faster,
     * but takes 2x longer to generate and consumes 2x memory.
     * Uses precomputes when available.
     * Uses endomorphism for Koblitz curves.
     * @param scalar by which the point would be multiplied
     * @returns New point
     */
    multiply(scalar) {
      const { endo: endo2 } = extraOpts;
      if (!Fn.isValidNot0(scalar))
        throw new Error("invalid scalar: out of range");
      let point, fake;
      const mul = (n2) => wnaf.cached(this, n2, (p2) => normalizeZ(Point, p2));
      if (endo2) {
        const { k1neg, k1, k2neg, k2 } = splitEndoScalarN(scalar);
        const { p: k1p, f: k1f } = mul(k1);
        const { p: k2p, f: k2f } = mul(k2);
        fake = k1f.add(k2f);
        point = finishEndo(endo2.beta, k1p, k2p, k1neg, k2neg);
      } else {
        const { p: p2, f: f2 } = mul(scalar);
        point = p2;
        fake = f2;
      }
      return normalizeZ(Point, [point, fake])[0];
    }
    /**
     * Non-constant-time multiplication. Uses double-and-add algorithm.
     * It's faster, but should only be used when you don't care about
     * an exposed secret key e.g. sig verification, which works over *public* keys.
     */
    multiplyUnsafe(sc) {
      const { endo: endo2 } = extraOpts;
      const p2 = this;
      if (!Fn.isValid(sc))
        throw new Error("invalid scalar: out of range");
      if (sc === _0n$4 || p2.is0())
        return Point.ZERO;
      if (sc === _1n$5)
        return p2;
      if (wnaf.hasCache(this))
        return this.multiply(sc);
      if (endo2) {
        const { k1neg, k1, k2neg, k2 } = splitEndoScalarN(sc);
        const { p1, p2: p22 } = mulEndoUnsafe(Point, p2, k1, k2);
        return finishEndo(endo2.beta, p1, p22, k1neg, k2neg);
      } else {
        return wnaf.unsafe(p2, sc);
      }
    }
    multiplyAndAddUnsafe(Q2, a2, b2) {
      const sum = this.multiplyUnsafe(a2).add(Q2.multiplyUnsafe(b2));
      return sum.is0() ? void 0 : sum;
    }
    /**
     * Converts Projective point to affine (x, y) coordinates.
     * @param invertedZ Z^-1 (inverted zero) - optional, precomputation is useful for invertBatch
     */
    toAffine(invertedZ) {
      return toAffineMemo(this, invertedZ);
    }
    /**
     * Checks whether Point is free of torsion elements (is in prime subgroup).
     * Always torsion-free for cofactor=1 curves.
     */
    isTorsionFree() {
      const { isTorsionFree } = extraOpts;
      if (cofactor === _1n$5)
        return true;
      if (isTorsionFree)
        return isTorsionFree(Point, this);
      return wnaf.unsafe(this, CURVE_ORDER).is0();
    }
    clearCofactor() {
      const { clearCofactor } = extraOpts;
      if (cofactor === _1n$5)
        return this;
      if (clearCofactor)
        return clearCofactor(Point, this);
      return this.multiplyUnsafe(cofactor);
    }
    isSmallOrder() {
      return this.multiplyUnsafe(cofactor).is0();
    }
    toBytes(isCompressed = true) {
      _abool2(isCompressed, "isCompressed");
      this.assertValidity();
      return encodePoint(Point, this, isCompressed);
    }
    toHex(isCompressed = true) {
      return bytesToHex(this.toBytes(isCompressed));
    }
    toString() {
      return `<Point ${this.is0() ? "ZERO" : this.toHex()}>`;
    }
    // TODO: remove
    get px() {
      return this.X;
    }
    get py() {
      return this.X;
    }
    get pz() {
      return this.Z;
    }
    toRawBytes(isCompressed = true) {
      return this.toBytes(isCompressed);
    }
    _setWindowSize(windowSize) {
      this.precompute(windowSize);
    }
    static normalizeZ(points) {
      return normalizeZ(Point, points);
    }
    static msm(points, scalars) {
      return pippenger(Point, Fn, points, scalars);
    }
    static fromPrivateKey(privateKey) {
      return Point.BASE.multiply(_normFnElement(Fn, privateKey));
    }
  }
  Point.BASE = new Point(CURVE.Gx, CURVE.Gy, Fp3.ONE);
  Point.ZERO = new Point(Fp3.ZERO, Fp3.ONE, Fp3.ZERO);
  Point.Fp = Fp3;
  Point.Fn = Fn;
  const bits = Fn.BITS;
  const wnaf = new wNAF(Point, extraOpts.endo ? Math.ceil(bits / 2) : bits);
  Point.BASE.precompute(8);
  return Point;
}
function pprefix(hasEvenY) {
  return Uint8Array.of(hasEvenY ? 2 : 3);
}
function SWUFpSqrtRatio(Fp3, Z2) {
  const q2 = Fp3.ORDER;
  let l3 = _0n$4;
  for (let o3 = q2 - _1n$5; o3 % _2n$5 === _0n$4; o3 /= _2n$5)
    l3 += _1n$5;
  const c1 = l3;
  const _2n_pow_c1_1 = _2n$5 << c1 - _1n$5 - _1n$5;
  const _2n_pow_c1 = _2n_pow_c1_1 * _2n$5;
  const c2 = (q2 - _1n$5) / _2n_pow_c1;
  const c3 = (c2 - _1n$5) / _2n$5;
  const c4 = _2n_pow_c1 - _1n$5;
  const c5 = _2n_pow_c1_1;
  const c6 = Fp3.pow(Z2, c2);
  const c7 = Fp3.pow(Z2, (c2 + _1n$5) / _2n$5);
  let sqrtRatio = (u2, v3) => {
    let tv1 = c6;
    let tv2 = Fp3.pow(v3, c4);
    let tv3 = Fp3.sqr(tv2);
    tv3 = Fp3.mul(tv3, v3);
    let tv5 = Fp3.mul(u2, tv3);
    tv5 = Fp3.pow(tv5, c3);
    tv5 = Fp3.mul(tv5, tv2);
    tv2 = Fp3.mul(tv5, v3);
    tv3 = Fp3.mul(tv5, u2);
    let tv4 = Fp3.mul(tv3, tv2);
    tv5 = Fp3.pow(tv4, c5);
    let isQR = Fp3.eql(tv5, Fp3.ONE);
    tv2 = Fp3.mul(tv3, c7);
    tv5 = Fp3.mul(tv4, tv1);
    tv3 = Fp3.cmov(tv2, tv3, isQR);
    tv4 = Fp3.cmov(tv5, tv4, isQR);
    for (let i3 = c1; i3 > _1n$5; i3--) {
      let tv52 = i3 - _2n$5;
      tv52 = _2n$5 << tv52 - _1n$5;
      let tvv5 = Fp3.pow(tv4, tv52);
      const e1 = Fp3.eql(tvv5, Fp3.ONE);
      tv2 = Fp3.mul(tv3, tv1);
      tv1 = Fp3.mul(tv1, tv1);
      tvv5 = Fp3.mul(tv4, tv1);
      tv3 = Fp3.cmov(tv2, tv3, e1);
      tv4 = Fp3.cmov(tvv5, tv4, e1);
    }
    return { isValid: isQR, value: tv3 };
  };
  if (Fp3.ORDER % _4n$1 === _3n$3) {
    const c12 = (Fp3.ORDER - _3n$3) / _4n$1;
    const c22 = Fp3.sqrt(Fp3.neg(Z2));
    sqrtRatio = (u2, v3) => {
      let tv1 = Fp3.sqr(v3);
      const tv2 = Fp3.mul(u2, v3);
      tv1 = Fp3.mul(tv1, tv2);
      let y1 = Fp3.pow(tv1, c12);
      y1 = Fp3.mul(y1, tv2);
      const y2 = Fp3.mul(y1, c22);
      const tv3 = Fp3.mul(Fp3.sqr(y1), v3);
      const isQR = Fp3.eql(tv3, u2);
      let y3 = Fp3.cmov(y2, y1, isQR);
      return { isValid: isQR, value: y3 };
    };
  }
  return sqrtRatio;
}
function mapToCurveSimpleSWU(Fp3, opts) {
  validateField(Fp3);
  const { A: A4, B: B3, Z: Z2 } = opts;
  if (!Fp3.isValid(A4) || !Fp3.isValid(B3) || !Fp3.isValid(Z2))
    throw new Error("mapToCurveSimpleSWU: invalid opts");
  const sqrtRatio = SWUFpSqrtRatio(Fp3, Z2);
  if (!Fp3.isOdd)
    throw new Error("Field does not have .isOdd()");
  return (u2) => {
    let tv1, tv2, tv3, tv4, tv5, tv6, x3, y2;
    tv1 = Fp3.sqr(u2);
    tv1 = Fp3.mul(tv1, Z2);
    tv2 = Fp3.sqr(tv1);
    tv2 = Fp3.add(tv2, tv1);
    tv3 = Fp3.add(tv2, Fp3.ONE);
    tv3 = Fp3.mul(tv3, B3);
    tv4 = Fp3.cmov(Z2, Fp3.neg(tv2), !Fp3.eql(tv2, Fp3.ZERO));
    tv4 = Fp3.mul(tv4, A4);
    tv2 = Fp3.sqr(tv3);
    tv6 = Fp3.sqr(tv4);
    tv5 = Fp3.mul(tv6, A4);
    tv2 = Fp3.add(tv2, tv5);
    tv2 = Fp3.mul(tv2, tv3);
    tv6 = Fp3.mul(tv6, tv4);
    tv5 = Fp3.mul(tv6, B3);
    tv2 = Fp3.add(tv2, tv5);
    x3 = Fp3.mul(tv1, tv3);
    const { isValid, value } = sqrtRatio(tv2, tv6);
    y2 = Fp3.mul(tv1, u2);
    y2 = Fp3.mul(y2, value);
    x3 = Fp3.cmov(x3, tv3, isValid);
    y2 = Fp3.cmov(y2, value, isValid);
    const e1 = Fp3.isOdd(u2) === Fp3.isOdd(y2);
    y2 = Fp3.cmov(Fp3.neg(y2), y2, e1);
    const tv4_inv = FpInvertBatch(Fp3, [tv4], true)[0];
    x3 = Fp3.mul(x3, tv4_inv);
    return { x: x3, y: y2 };
  };
}
function getWLengths(Fp3, Fn) {
  return {
    secretKey: Fn.BYTES,
    publicKey: 1 + Fp3.BYTES,
    publicKeyUncompressed: 1 + 2 * Fp3.BYTES,
    publicKeyHasPrefix: true,
    signature: 2 * Fn.BYTES
  };
}
function weierstrassPoints(c2) {
  const { CURVE, curveOpts } = _weierstrass_legacy_opts_to_new(c2);
  const Point = weierstrassN(CURVE, curveOpts);
  return _weierstrass_new_output_to_legacy(c2, Point);
}
function _weierstrass_legacy_opts_to_new(c2) {
  const CURVE = {
    a: c2.a,
    b: c2.b,
    p: c2.Fp.ORDER,
    n: c2.n,
    h: c2.h,
    Gx: c2.Gx,
    Gy: c2.Gy
  };
  const Fp3 = c2.Fp;
  let allowedLengths = c2.allowedPrivateKeyLengths ? Array.from(new Set(c2.allowedPrivateKeyLengths.map((l3) => Math.ceil(l3 / 2)))) : void 0;
  const Fn = Field(CURVE.n, {
    BITS: c2.nBitLength,
    allowedLengths,
    modFromBytes: c2.wrapPrivateKey
  });
  const curveOpts = {
    Fp: Fp3,
    Fn,
    allowInfinityPoint: c2.allowInfinityPoint,
    endo: c2.endo,
    isTorsionFree: c2.isTorsionFree,
    clearCofactor: c2.clearCofactor,
    fromBytes: c2.fromBytes,
    toBytes: c2.toBytes
  };
  return { CURVE, curveOpts };
}
function _legacyHelperEquat(Fp3, a2, b2) {
  function weierstrassEquation(x3) {
    const x22 = Fp3.sqr(x3);
    const x32 = Fp3.mul(x22, x3);
    return Fp3.add(Fp3.add(x32, Fp3.mul(x3, a2)), b2);
  }
  return weierstrassEquation;
}
function _weierstrass_new_output_to_legacy(c2, Point) {
  const { Fp: Fp3, Fn } = Point;
  function isWithinCurveOrder(num) {
    return inRange(num, _1n$5, Fn.ORDER);
  }
  const weierstrassEquation = _legacyHelperEquat(Fp3, c2.a, c2.b);
  return Object.assign({}, {
    CURVE: c2,
    Point,
    ProjectivePoint: Point,
    normPrivateKeyToScalar: (key) => _normFnElement(Fn, key),
    weierstrassEquation,
    isWithinCurveOrder
  });
}
/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
const _0n$3 = BigInt(0), _1n$4 = BigInt(1), _2n$4 = BigInt(2), _3n$2 = BigInt(3);
function NAfDecomposition(a2) {
  const res = [];
  for (; a2 > _1n$4; a2 >>= _1n$4) {
    if ((a2 & _1n$4) === _0n$3)
      res.unshift(0);
    else if ((a2 & _3n$2) === _3n$2) {
      res.unshift(-1);
      a2 += _1n$4;
    } else
      res.unshift(1);
  }
  return res;
}
function aNonEmpty(arr) {
  if (!Array.isArray(arr) || arr.length === 0)
    throw new Error("expected non-empty array");
}
function createBlsPairing(fields, G1, G2, params) {
  const { Fp2: Fp22, Fp12: Fp122 } = fields;
  const { twistType, ateLoopSize, xNegative, postPrecompute } = params;
  let lineFunction;
  if (twistType === "multiplicative") {
    lineFunction = (c0, c1, c2, f2, Px, Py) => Fp122.mul014(f2, c0, Fp22.mul(c1, Px), Fp22.mul(c2, Py));
  } else if (twistType === "divisive") {
    lineFunction = (c0, c1, c2, f2, Px, Py) => Fp122.mul034(f2, Fp22.mul(c2, Py), Fp22.mul(c1, Px), c0);
  } else
    throw new Error("bls: unknown twist type");
  const Fp2div2 = Fp22.div(Fp22.ONE, Fp22.mul(Fp22.ONE, _2n$4));
  function pointDouble(ell, Rx, Ry, Rz) {
    const t0 = Fp22.sqr(Ry);
    const t1 = Fp22.sqr(Rz);
    const t22 = Fp22.mulByB(Fp22.mul(t1, _3n$2));
    const t3 = Fp22.mul(t22, _3n$2);
    const t4 = Fp22.sub(Fp22.sub(Fp22.sqr(Fp22.add(Ry, Rz)), t1), t0);
    const c0 = Fp22.sub(t22, t0);
    const c1 = Fp22.mul(Fp22.sqr(Rx), _3n$2);
    const c2 = Fp22.neg(t4);
    ell.push([c0, c1, c2]);
    Rx = Fp22.mul(Fp22.mul(Fp22.mul(Fp22.sub(t0, t3), Rx), Ry), Fp2div2);
    Ry = Fp22.sub(Fp22.sqr(Fp22.mul(Fp22.add(t0, t3), Fp2div2)), Fp22.mul(Fp22.sqr(t22), _3n$2));
    Rz = Fp22.mul(t0, t4);
    return { Rx, Ry, Rz };
  }
  function pointAdd(ell, Rx, Ry, Rz, Qx, Qy) {
    const t0 = Fp22.sub(Ry, Fp22.mul(Qy, Rz));
    const t1 = Fp22.sub(Rx, Fp22.mul(Qx, Rz));
    const c0 = Fp22.sub(Fp22.mul(t0, Qx), Fp22.mul(t1, Qy));
    const c1 = Fp22.neg(t0);
    const c2 = t1;
    ell.push([c0, c1, c2]);
    const t22 = Fp22.sqr(t1);
    const t3 = Fp22.mul(t22, t1);
    const t4 = Fp22.mul(t22, Rx);
    const t5 = Fp22.add(Fp22.sub(t3, Fp22.mul(t4, _2n$4)), Fp22.mul(Fp22.sqr(t0), Rz));
    Rx = Fp22.mul(t1, t5);
    Ry = Fp22.sub(Fp22.mul(Fp22.sub(t4, t5), t0), Fp22.mul(t3, Ry));
    Rz = Fp22.mul(Rz, t3);
    return { Rx, Ry, Rz };
  }
  const ATE_NAF = NAfDecomposition(ateLoopSize);
  const calcPairingPrecomputes = memoized((point) => {
    const p2 = point;
    const { x: x3, y: y2 } = p2.toAffine();
    const Qx = x3, Qy = y2, negQy = Fp22.neg(y2);
    let Rx = Qx, Ry = Qy, Rz = Fp22.ONE;
    const ell = [];
    for (const bit of ATE_NAF) {
      const cur = [];
      ({ Rx, Ry, Rz } = pointDouble(cur, Rx, Ry, Rz));
      if (bit)
        ({ Rx, Ry, Rz } = pointAdd(cur, Rx, Ry, Rz, Qx, bit === -1 ? negQy : Qy));
      ell.push(cur);
    }
    if (postPrecompute) {
      const last = ell[ell.length - 1];
      postPrecompute(Rx, Ry, Rz, Qx, Qy, pointAdd.bind(null, last));
    }
    return ell;
  });
  function millerLoopBatch(pairs, withFinalExponent = false) {
    let f12 = Fp122.ONE;
    if (pairs.length) {
      const ellLen = pairs[0][0].length;
      for (let i3 = 0; i3 < ellLen; i3++) {
        f12 = Fp122.sqr(f12);
        for (const [ell, Px, Py] of pairs) {
          for (const [c0, c1, c2] of ell[i3])
            f12 = lineFunction(c0, c1, c2, f12, Px, Py);
        }
      }
    }
    if (xNegative)
      f12 = Fp122.conjugate(f12);
    return withFinalExponent ? Fp122.finalExponentiate(f12) : f12;
  }
  function pairingBatch(pairs, withFinalExponent = true) {
    const res = [];
    normalizeZ(G1, pairs.map(({ g1 }) => g1));
    normalizeZ(G2, pairs.map(({ g2 }) => g2));
    for (const { g1, g2 } of pairs) {
      if (g1.is0() || g2.is0())
        throw new Error("pairing is not available for ZERO point");
      g1.assertValidity();
      g2.assertValidity();
      const Qa = g1.toAffine();
      res.push([calcPairingPrecomputes(g2), Qa.x, Qa.y]);
    }
    return millerLoopBatch(res, withFinalExponent);
  }
  function pairing(Q2, P2, withFinalExponent = true) {
    return pairingBatch([{ g1: Q2, g2: P2 }], withFinalExponent);
  }
  return {
    Fp12: Fp122,
    // NOTE: we re-export Fp12 here because pairing results are Fp12!
    millerLoopBatch,
    pairing,
    pairingBatch,
    calcPairingPrecomputes
  };
}
function createBlsSig(blsPairing, PubCurve, SigCurve, SignatureCoder, isSigG1) {
  const { Fp12: Fp122, pairingBatch } = blsPairing;
  function normPub(point) {
    return point instanceof PubCurve.Point ? point : PubCurve.Point.fromHex(point);
  }
  function normSig(point) {
    return point instanceof SigCurve.Point ? point : SigCurve.Point.fromHex(point);
  }
  function amsg(m2) {
    if (!(m2 instanceof SigCurve.Point))
      throw new Error(`expected valid message hashed to ${!isSigG1 ? "G2" : "G1"} curve`);
    return m2;
  }
  const pair = !isSigG1 ? (a2, b2) => ({ g1: a2, g2: b2 }) : (a2, b2) => ({ g1: b2, g2: a2 });
  return {
    // P = pk x G
    getPublicKey(secretKey) {
      const sec = _normFnElement(PubCurve.Point.Fn, secretKey);
      return PubCurve.Point.BASE.multiply(sec);
    },
    // S = pk x H(m)
    sign(message, secretKey, unusedArg) {
      if (unusedArg != null)
        throw new Error("sign() expects 2 arguments");
      const sec = _normFnElement(PubCurve.Point.Fn, secretKey);
      amsg(message).assertValidity();
      return message.multiply(sec);
    },
    // Checks if pairing of public key & hash is equal to pairing of generator & signature.
    // e(P, H(m)) == e(G, S)
    // e(S, G) == e(H(m), P)
    verify(signature, message, publicKey, unusedArg) {
      if (unusedArg != null)
        throw new Error("verify() expects 3 arguments");
      signature = normSig(signature);
      publicKey = normPub(publicKey);
      const P2 = publicKey.negate();
      const G2 = PubCurve.Point.BASE;
      const Hm = amsg(message);
      const S2 = signature;
      const exp = pairingBatch([pair(P2, Hm), pair(G2, S2)]);
      return Fp122.eql(exp, Fp122.ONE);
    },
    // https://ethresear.ch/t/fast-verification-of-multiple-bls-signatures/5407
    // e(G, S) = e(G, SUM(n)(Si)) = MUL(n)(e(G, Si))
    // TODO: maybe `{message: G2Hex, publicKey: G1Hex}[]` instead?
    verifyBatch(signature, messages, publicKeys) {
      aNonEmpty(messages);
      if (publicKeys.length !== messages.length)
        throw new Error("amount of public keys and messages should be equal");
      const sig = normSig(signature);
      const nMessages = messages;
      const nPublicKeys = publicKeys.map(normPub);
      const messagePubKeyMap = /* @__PURE__ */ new Map();
      for (let i3 = 0; i3 < nPublicKeys.length; i3++) {
        const pub = nPublicKeys[i3];
        const msg = nMessages[i3];
        let keys = messagePubKeyMap.get(msg);
        if (keys === void 0) {
          keys = [];
          messagePubKeyMap.set(msg, keys);
        }
        keys.push(pub);
      }
      const paired = [];
      const G2 = PubCurve.Point.BASE;
      try {
        for (const [msg, keys] of messagePubKeyMap) {
          const groupPublicKey = keys.reduce((acc, msg2) => acc.add(msg2));
          paired.push(pair(groupPublicKey, msg));
        }
        paired.push(pair(G2.negate(), sig));
        return Fp122.eql(pairingBatch(paired), Fp122.ONE);
      } catch {
        return false;
      }
    },
    // Adds a bunch of public key points together.
    // pk1 + pk2 + pk3 = pkA
    aggregatePublicKeys(publicKeys) {
      aNonEmpty(publicKeys);
      publicKeys = publicKeys.map((pub) => normPub(pub));
      const agg = publicKeys.reduce((sum, p2) => sum.add(p2), PubCurve.Point.ZERO);
      agg.assertValidity();
      return agg;
    },
    // Adds a bunch of signature points together.
    // pk1 + pk2 + pk3 = pkA
    aggregateSignatures(signatures) {
      aNonEmpty(signatures);
      signatures = signatures.map((sig) => normSig(sig));
      const agg = signatures.reduce((sum, s2) => sum.add(s2), SigCurve.Point.ZERO);
      agg.assertValidity();
      return agg;
    },
    hash(messageBytes, DST) {
      abytes(messageBytes);
      const opts = DST ? { DST } : void 0;
      return SigCurve.hashToCurve(messageBytes, opts);
    },
    Signature: SignatureCoder
  };
}
function bls(CURVE) {
  const { Fp: Fp3, Fr, Fp2: Fp22, Fp6: Fp62, Fp12: Fp122 } = CURVE.fields;
  const G1_ = weierstrassPoints(CURVE.G1);
  const G1 = Object.assign(G1_, createHasher(G1_.Point, CURVE.G1.mapToCurve, {
    ...CURVE.htfDefaults,
    ...CURVE.G1.htfDefaults
  }));
  const G2_ = weierstrassPoints(CURVE.G2);
  const G2 = Object.assign(G2_, createHasher(G2_.Point, CURVE.G2.mapToCurve, {
    ...CURVE.htfDefaults,
    ...CURVE.G2.htfDefaults
  }));
  const pairingRes = createBlsPairing(CURVE.fields, G1.Point, G2.Point, {
    ...CURVE.params,
    postPrecompute: CURVE.postPrecompute
  });
  const { millerLoopBatch, pairing, pairingBatch, calcPairingPrecomputes } = pairingRes;
  const longSignatures = createBlsSig(pairingRes, G1, G2, CURVE.G2.Signature, false);
  const shortSignatures = createBlsSig(pairingRes, G2, G1, CURVE.G1.ShortSignature, true);
  const rand = CURVE.randomBytes || randomBytes;
  const randomSecretKey = () => {
    const length = getMinHashLength(Fr.ORDER);
    return mapHashToField(rand(length), Fr.ORDER);
  };
  const utils = {
    randomSecretKey,
    randomPrivateKey: randomSecretKey,
    calcPairingPrecomputes
  };
  const { ShortSignature } = CURVE.G1;
  const { Signature } = CURVE.G2;
  function normP1Hash(point, htfOpts) {
    return point instanceof G1.Point ? point : shortSignatures.hash(ensureBytes("point", point), htfOpts?.DST);
  }
  function normP2Hash(point, htfOpts) {
    return point instanceof G2.Point ? point : longSignatures.hash(ensureBytes("point", point), htfOpts?.DST);
  }
  function getPublicKey(privateKey) {
    return longSignatures.getPublicKey(privateKey).toBytes(true);
  }
  function getPublicKeyForShortSignatures(privateKey) {
    return shortSignatures.getPublicKey(privateKey).toBytes(true);
  }
  function sign(message, privateKey, htfOpts) {
    const Hm = normP2Hash(message, htfOpts);
    const S2 = longSignatures.sign(Hm, privateKey);
    return message instanceof G2.Point ? S2 : Signature.toBytes(S2);
  }
  function signShortSignature(message, privateKey, htfOpts) {
    const Hm = normP1Hash(message, htfOpts);
    const S2 = shortSignatures.sign(Hm, privateKey);
    return message instanceof G1.Point ? S2 : ShortSignature.toBytes(S2);
  }
  function verify(signature, message, publicKey, htfOpts) {
    const Hm = normP2Hash(message, htfOpts);
    return longSignatures.verify(signature, Hm, publicKey);
  }
  function verifyShortSignature(signature, message, publicKey, htfOpts) {
    const Hm = normP1Hash(message, htfOpts);
    return shortSignatures.verify(signature, Hm, publicKey);
  }
  function aggregatePublicKeys(publicKeys) {
    const agg = longSignatures.aggregatePublicKeys(publicKeys);
    return publicKeys[0] instanceof G1.Point ? agg : agg.toBytes(true);
  }
  function aggregateSignatures(signatures) {
    const agg = longSignatures.aggregateSignatures(signatures);
    return signatures[0] instanceof G2.Point ? agg : Signature.toBytes(agg);
  }
  function aggregateShortSignatures(signatures) {
    const agg = shortSignatures.aggregateSignatures(signatures);
    return signatures[0] instanceof G1.Point ? agg : ShortSignature.toBytes(agg);
  }
  function verifyBatch(signature, messages, publicKeys, htfOpts) {
    const Hm = messages.map((m2) => normP2Hash(m2, htfOpts));
    return longSignatures.verifyBatch(signature, Hm, publicKeys);
  }
  G1.Point.BASE.precompute(4);
  return {
    longSignatures,
    shortSignatures,
    millerLoopBatch,
    pairing,
    pairingBatch,
    verifyBatch,
    fields: {
      Fr,
      Fp: Fp3,
      Fp2: Fp22,
      Fp6: Fp62,
      Fp12: Fp122
    },
    params: {
      ateLoopSize: CURVE.params.ateLoopSize,
      twistType: CURVE.params.twistType,
      // deprecated
      r: CURVE.params.r,
      G1b: CURVE.G1.b,
      G2b: CURVE.G2.b
    },
    utils,
    // deprecated
    getPublicKey,
    getPublicKeyForShortSignatures,
    sign,
    signShortSignature,
    verify,
    verifyShortSignature,
    aggregatePublicKeys,
    aggregateSignatures,
    aggregateShortSignatures,
    G1,
    G2,
    Signature,
    ShortSignature
  };
}
/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
const _0n$2 = BigInt(0), _1n$3 = BigInt(1), _2n$3 = BigInt(2), _3n$1 = BigInt(3);
function calcFrobeniusCoefficients(Fp3, nonResidue, modulus, degree, num = 1, divisor) {
  const _divisor = BigInt(divisor === void 0 ? degree : divisor);
  const towerModulus = modulus ** BigInt(degree);
  const res = [];
  for (let i3 = 0; i3 < num; i3++) {
    const a2 = BigInt(i3 + 1);
    const powers = [];
    for (let j2 = 0, qPower = _1n$3; j2 < degree; j2++) {
      const power = (a2 * qPower - a2) / _divisor % towerModulus;
      powers.push(Fp3.pow(nonResidue, power));
      qPower *= modulus;
    }
    res.push(powers);
  }
  return res;
}
function psiFrobenius(Fp3, Fp22, base) {
  const PSI_X = Fp22.pow(base, (Fp3.ORDER - _1n$3) / _3n$1);
  const PSI_Y = Fp22.pow(base, (Fp3.ORDER - _1n$3) / _2n$3);
  function psi(x3, y2) {
    const x22 = Fp22.mul(Fp22.frobeniusMap(x3, 1), PSI_X);
    const y22 = Fp22.mul(Fp22.frobeniusMap(y2, 1), PSI_Y);
    return [x22, y22];
  }
  const PSI2_X = Fp22.pow(base, (Fp3.ORDER ** _2n$3 - _1n$3) / _3n$1);
  const PSI2_Y = Fp22.pow(base, (Fp3.ORDER ** _2n$3 - _1n$3) / _2n$3);
  if (!Fp22.eql(PSI2_Y, Fp22.neg(Fp22.ONE)))
    throw new Error("psiFrobenius: PSI2_Y!==-1");
  function psi2(x3, y2) {
    return [Fp22.mul(x3, PSI2_X), Fp22.neg(y2)];
  }
  const mapAffine = (fn) => (c2, P2) => {
    const affine = P2.toAffine();
    const p2 = fn(affine.x, affine.y);
    return c2.fromAffine({ x: p2[0], y: p2[1] });
  };
  const G2psi3 = mapAffine(psi);
  const G2psi22 = mapAffine(psi2);
  return { psi, psi2, G2psi: G2psi3, G2psi2: G2psi22, PSI_X, PSI_Y, PSI2_X, PSI2_Y };
}
const Fp2fromBigTuple = (Fp3, tuple) => {
  if (tuple.length !== 2)
    throw new Error("invalid tuple");
  const fps = tuple.map((n2) => Fp3.create(n2));
  return { c0: fps[0], c1: fps[1] };
};
class _Field2 {
  constructor(Fp3, opts = {}) {
    this.MASK = _1n$3;
    const ORDER = Fp3.ORDER;
    const FP2_ORDER = ORDER * ORDER;
    this.Fp = Fp3;
    this.ORDER = FP2_ORDER;
    this.BITS = bitLen(FP2_ORDER);
    this.BYTES = Math.ceil(bitLen(FP2_ORDER) / 8);
    this.isLE = Fp3.isLE;
    this.ZERO = { c0: Fp3.ZERO, c1: Fp3.ZERO };
    this.ONE = { c0: Fp3.ONE, c1: Fp3.ZERO };
    this.Fp_NONRESIDUE = Fp3.create(opts.NONRESIDUE || BigInt(-1));
    this.Fp_div2 = Fp3.div(Fp3.ONE, _2n$3);
    this.NONRESIDUE = Fp2fromBigTuple(Fp3, opts.FP2_NONRESIDUE);
    this.FROBENIUS_COEFFICIENTS = calcFrobeniusCoefficients(Fp3, this.Fp_NONRESIDUE, Fp3.ORDER, 2)[0];
    this.mulByB = opts.Fp2mulByB;
    Object.seal(this);
  }
  fromBigTuple(tuple) {
    return Fp2fromBigTuple(this.Fp, tuple);
  }
  create(num) {
    return num;
  }
  isValid({ c0, c1 }) {
    function isValidC(num, ORDER) {
      return typeof num === "bigint" && _0n$2 <= num && num < ORDER;
    }
    return isValidC(c0, this.ORDER) && isValidC(c1, this.ORDER);
  }
  is0({ c0, c1 }) {
    return this.Fp.is0(c0) && this.Fp.is0(c1);
  }
  isValidNot0(num) {
    return !this.is0(num) && this.isValid(num);
  }
  eql({ c0, c1 }, { c0: r0, c1: r1 }) {
    return this.Fp.eql(c0, r0) && this.Fp.eql(c1, r1);
  }
  neg({ c0, c1 }) {
    return { c0: this.Fp.neg(c0), c1: this.Fp.neg(c1) };
  }
  pow(num, power) {
    return FpPow(this, num, power);
  }
  invertBatch(nums) {
    return FpInvertBatch(this, nums);
  }
  // Normalized
  add(f1, f2) {
    const { c0, c1 } = f1;
    const { c0: r0, c1: r1 } = f2;
    return {
      c0: this.Fp.add(c0, r0),
      c1: this.Fp.add(c1, r1)
    };
  }
  sub({ c0, c1 }, { c0: r0, c1: r1 }) {
    return {
      c0: this.Fp.sub(c0, r0),
      c1: this.Fp.sub(c1, r1)
    };
  }
  mul({ c0, c1 }, rhs) {
    const { Fp: Fp3 } = this;
    if (typeof rhs === "bigint")
      return { c0: Fp3.mul(c0, rhs), c1: Fp3.mul(c1, rhs) };
    const { c0: r0, c1: r1 } = rhs;
    let t1 = Fp3.mul(c0, r0);
    let t22 = Fp3.mul(c1, r1);
    const o0 = Fp3.sub(t1, t22);
    const o1 = Fp3.sub(Fp3.mul(Fp3.add(c0, c1), Fp3.add(r0, r1)), Fp3.add(t1, t22));
    return { c0: o0, c1: o1 };
  }
  sqr({ c0, c1 }) {
    const { Fp: Fp3 } = this;
    const a2 = Fp3.add(c0, c1);
    const b2 = Fp3.sub(c0, c1);
    const c2 = Fp3.add(c0, c0);
    return { c0: Fp3.mul(a2, b2), c1: Fp3.mul(c2, c1) };
  }
  // NonNormalized stuff
  addN(a2, b2) {
    return this.add(a2, b2);
  }
  subN(a2, b2) {
    return this.sub(a2, b2);
  }
  mulN(a2, b2) {
    return this.mul(a2, b2);
  }
  sqrN(a2) {
    return this.sqr(a2);
  }
  // Why inversion for bigint inside Fp instead of Fp2? it is even used in that context?
  div(lhs, rhs) {
    const { Fp: Fp3 } = this;
    return this.mul(lhs, typeof rhs === "bigint" ? Fp3.inv(Fp3.create(rhs)) : this.inv(rhs));
  }
  inv({ c0: a2, c1: b2 }) {
    const { Fp: Fp3 } = this;
    const factor = Fp3.inv(Fp3.create(a2 * a2 + b2 * b2));
    return { c0: Fp3.mul(factor, Fp3.create(a2)), c1: Fp3.mul(factor, Fp3.create(-b2)) };
  }
  sqrt(num) {
    const { Fp: Fp3 } = this;
    const Fp22 = this;
    const { c0, c1 } = num;
    if (Fp3.is0(c1)) {
      if (FpLegendre(Fp3, c0) === 1)
        return Fp22.create({ c0: Fp3.sqrt(c0), c1: Fp3.ZERO });
      else
        return Fp22.create({ c0: Fp3.ZERO, c1: Fp3.sqrt(Fp3.div(c0, this.Fp_NONRESIDUE)) });
    }
    const a2 = Fp3.sqrt(Fp3.sub(Fp3.sqr(c0), Fp3.mul(Fp3.sqr(c1), this.Fp_NONRESIDUE)));
    let d2 = Fp3.mul(Fp3.add(a2, c0), this.Fp_div2);
    const legendre = FpLegendre(Fp3, d2);
    if (legendre === -1)
      d2 = Fp3.sub(d2, a2);
    const a0 = Fp3.sqrt(d2);
    const candidateSqrt = Fp22.create({ c0: a0, c1: Fp3.div(Fp3.mul(c1, this.Fp_div2), a0) });
    if (!Fp22.eql(Fp22.sqr(candidateSqrt), num))
      throw new Error("Cannot find square root");
    const x1 = candidateSqrt;
    const x22 = Fp22.neg(x1);
    const { re: re1, im: im1 } = Fp22.reim(x1);
    const { re: re2, im: im2 } = Fp22.reim(x22);
    if (im1 > im2 || im1 === im2 && re1 > re2)
      return x1;
    return x22;
  }
  // Same as sgn0_m_eq_2 in RFC 9380
  isOdd(x3) {
    const { re: x0, im: x1 } = this.reim(x3);
    const sign_0 = x0 % _2n$3;
    const zero_0 = x0 === _0n$2;
    const sign_1 = x1 % _2n$3;
    return BigInt(sign_0 || zero_0 && sign_1) == _1n$3;
  }
  // Bytes util
  fromBytes(b2) {
    const { Fp: Fp3 } = this;
    if (b2.length !== this.BYTES)
      throw new Error("fromBytes invalid length=" + b2.length);
    return { c0: Fp3.fromBytes(b2.subarray(0, Fp3.BYTES)), c1: Fp3.fromBytes(b2.subarray(Fp3.BYTES)) };
  }
  toBytes({ c0, c1 }) {
    return concatBytes(this.Fp.toBytes(c0), this.Fp.toBytes(c1));
  }
  cmov({ c0, c1 }, { c0: r0, c1: r1 }, c2) {
    return {
      c0: this.Fp.cmov(c0, r0, c2),
      c1: this.Fp.cmov(c1, r1, c2)
    };
  }
  reim({ c0, c1 }) {
    return { re: c0, im: c1 };
  }
  Fp4Square(a2, b2) {
    const Fp22 = this;
    const a22 = Fp22.sqr(a2);
    const b22 = Fp22.sqr(b2);
    return {
      first: Fp22.add(Fp22.mulByNonresidue(b22), a22),
      // b² * Nonresidue + a²
      second: Fp22.sub(Fp22.sub(Fp22.sqr(Fp22.add(a2, b2)), a22), b22)
      // (a + b)² - a² - b²
    };
  }
  // multiply by u + 1
  mulByNonresidue({ c0, c1 }) {
    return this.mul({ c0, c1 }, this.NONRESIDUE);
  }
  frobeniusMap({ c0, c1 }, power) {
    return {
      c0,
      c1: this.Fp.mul(c1, this.FROBENIUS_COEFFICIENTS[power % 2])
    };
  }
}
class _Field6 {
  constructor(Fp22) {
    this.MASK = _1n$3;
    this.Fp2 = Fp22;
    this.ORDER = Fp22.ORDER;
    this.BITS = 3 * Fp22.BITS;
    this.BYTES = 3 * Fp22.BYTES;
    this.isLE = Fp22.isLE;
    this.ZERO = { c0: Fp22.ZERO, c1: Fp22.ZERO, c2: Fp22.ZERO };
    this.ONE = { c0: Fp22.ONE, c1: Fp22.ZERO, c2: Fp22.ZERO };
    const { Fp: Fp3 } = Fp22;
    const frob = calcFrobeniusCoefficients(Fp22, Fp22.NONRESIDUE, Fp3.ORDER, 6, 2, 3);
    this.FROBENIUS_COEFFICIENTS_1 = frob[0];
    this.FROBENIUS_COEFFICIENTS_2 = frob[1];
    Object.seal(this);
  }
  add({ c0, c1, c2 }, { c0: r0, c1: r1, c2: r2 }) {
    const { Fp2: Fp22 } = this;
    return {
      c0: Fp22.add(c0, r0),
      c1: Fp22.add(c1, r1),
      c2: Fp22.add(c2, r2)
    };
  }
  sub({ c0, c1, c2 }, { c0: r0, c1: r1, c2: r2 }) {
    const { Fp2: Fp22 } = this;
    return {
      c0: Fp22.sub(c0, r0),
      c1: Fp22.sub(c1, r1),
      c2: Fp22.sub(c2, r2)
    };
  }
  mul({ c0, c1, c2 }, rhs) {
    const { Fp2: Fp22 } = this;
    if (typeof rhs === "bigint") {
      return {
        c0: Fp22.mul(c0, rhs),
        c1: Fp22.mul(c1, rhs),
        c2: Fp22.mul(c2, rhs)
      };
    }
    const { c0: r0, c1: r1, c2: r2 } = rhs;
    const t0 = Fp22.mul(c0, r0);
    const t1 = Fp22.mul(c1, r1);
    const t22 = Fp22.mul(c2, r2);
    return {
      // t0 + (c1 + c2) * (r1 * r2) - (T1 + T2) * (u + 1)
      c0: Fp22.add(t0, Fp22.mulByNonresidue(Fp22.sub(Fp22.mul(Fp22.add(c1, c2), Fp22.add(r1, r2)), Fp22.add(t1, t22)))),
      // (c0 + c1) * (r0 + r1) - (T0 + T1) + T2 * (u + 1)
      c1: Fp22.add(Fp22.sub(Fp22.mul(Fp22.add(c0, c1), Fp22.add(r0, r1)), Fp22.add(t0, t1)), Fp22.mulByNonresidue(t22)),
      // T1 + (c0 + c2) * (r0 + r2) - T0 + T2
      c2: Fp22.sub(Fp22.add(t1, Fp22.mul(Fp22.add(c0, c2), Fp22.add(r0, r2))), Fp22.add(t0, t22))
    };
  }
  sqr({ c0, c1, c2 }) {
    const { Fp2: Fp22 } = this;
    let t0 = Fp22.sqr(c0);
    let t1 = Fp22.mul(Fp22.mul(c0, c1), _2n$3);
    let t3 = Fp22.mul(Fp22.mul(c1, c2), _2n$3);
    let t4 = Fp22.sqr(c2);
    return {
      c0: Fp22.add(Fp22.mulByNonresidue(t3), t0),
      // T3 * (u + 1) + T0
      c1: Fp22.add(Fp22.mulByNonresidue(t4), t1),
      // T4 * (u + 1) + T1
      // T1 + (c0 - c1 + c2)² + T3 - T0 - T4
      c2: Fp22.sub(Fp22.sub(Fp22.add(Fp22.add(t1, Fp22.sqr(Fp22.add(Fp22.sub(c0, c1), c2))), t3), t0), t4)
    };
  }
  addN(a2, b2) {
    return this.add(a2, b2);
  }
  subN(a2, b2) {
    return this.sub(a2, b2);
  }
  mulN(a2, b2) {
    return this.mul(a2, b2);
  }
  sqrN(a2) {
    return this.sqr(a2);
  }
  create(num) {
    return num;
  }
  isValid({ c0, c1, c2 }) {
    const { Fp2: Fp22 } = this;
    return Fp22.isValid(c0) && Fp22.isValid(c1) && Fp22.isValid(c2);
  }
  is0({ c0, c1, c2 }) {
    const { Fp2: Fp22 } = this;
    return Fp22.is0(c0) && Fp22.is0(c1) && Fp22.is0(c2);
  }
  isValidNot0(num) {
    return !this.is0(num) && this.isValid(num);
  }
  neg({ c0, c1, c2 }) {
    const { Fp2: Fp22 } = this;
    return { c0: Fp22.neg(c0), c1: Fp22.neg(c1), c2: Fp22.neg(c2) };
  }
  eql({ c0, c1, c2 }, { c0: r0, c1: r1, c2: r2 }) {
    const { Fp2: Fp22 } = this;
    return Fp22.eql(c0, r0) && Fp22.eql(c1, r1) && Fp22.eql(c2, r2);
  }
  sqrt(_2) {
    return notImplemented();
  }
  // Do we need division by bigint at all? Should be done via order:
  div(lhs, rhs) {
    const { Fp2: Fp22 } = this;
    const { Fp: Fp3 } = Fp22;
    return this.mul(lhs, typeof rhs === "bigint" ? Fp3.inv(Fp3.create(rhs)) : this.inv(rhs));
  }
  pow(num, power) {
    return FpPow(this, num, power);
  }
  invertBatch(nums) {
    return FpInvertBatch(this, nums);
  }
  inv({ c0, c1, c2 }) {
    const { Fp2: Fp22 } = this;
    let t0 = Fp22.sub(Fp22.sqr(c0), Fp22.mulByNonresidue(Fp22.mul(c2, c1)));
    let t1 = Fp22.sub(Fp22.mulByNonresidue(Fp22.sqr(c2)), Fp22.mul(c0, c1));
    let t22 = Fp22.sub(Fp22.sqr(c1), Fp22.mul(c0, c2));
    let t4 = Fp22.inv(Fp22.add(Fp22.mulByNonresidue(Fp22.add(Fp22.mul(c2, t1), Fp22.mul(c1, t22))), Fp22.mul(c0, t0)));
    return { c0: Fp22.mul(t4, t0), c1: Fp22.mul(t4, t1), c2: Fp22.mul(t4, t22) };
  }
  // Bytes utils
  fromBytes(b2) {
    const { Fp2: Fp22 } = this;
    if (b2.length !== this.BYTES)
      throw new Error("fromBytes invalid length=" + b2.length);
    const B22 = Fp22.BYTES;
    return {
      c0: Fp22.fromBytes(b2.subarray(0, B22)),
      c1: Fp22.fromBytes(b2.subarray(B22, B22 * 2)),
      c2: Fp22.fromBytes(b2.subarray(2 * B22))
    };
  }
  toBytes({ c0, c1, c2 }) {
    const { Fp2: Fp22 } = this;
    return concatBytes(Fp22.toBytes(c0), Fp22.toBytes(c1), Fp22.toBytes(c2));
  }
  cmov({ c0, c1, c2 }, { c0: r0, c1: r1, c2: r2 }, c3) {
    const { Fp2: Fp22 } = this;
    return {
      c0: Fp22.cmov(c0, r0, c3),
      c1: Fp22.cmov(c1, r1, c3),
      c2: Fp22.cmov(c2, r2, c3)
    };
  }
  fromBigSix(t3) {
    const { Fp2: Fp22 } = this;
    if (!Array.isArray(t3) || t3.length !== 6)
      throw new Error("invalid Fp6 usage");
    return {
      c0: Fp22.fromBigTuple(t3.slice(0, 2)),
      c1: Fp22.fromBigTuple(t3.slice(2, 4)),
      c2: Fp22.fromBigTuple(t3.slice(4, 6))
    };
  }
  frobeniusMap({ c0, c1, c2 }, power) {
    const { Fp2: Fp22 } = this;
    return {
      c0: Fp22.frobeniusMap(c0, power),
      c1: Fp22.mul(Fp22.frobeniusMap(c1, power), this.FROBENIUS_COEFFICIENTS_1[power % 6]),
      c2: Fp22.mul(Fp22.frobeniusMap(c2, power), this.FROBENIUS_COEFFICIENTS_2[power % 6])
    };
  }
  mulByFp2({ c0, c1, c2 }, rhs) {
    const { Fp2: Fp22 } = this;
    return {
      c0: Fp22.mul(c0, rhs),
      c1: Fp22.mul(c1, rhs),
      c2: Fp22.mul(c2, rhs)
    };
  }
  mulByNonresidue({ c0, c1, c2 }) {
    const { Fp2: Fp22 } = this;
    return { c0: Fp22.mulByNonresidue(c2), c1: c0, c2: c1 };
  }
  // Sparse multiplication
  mul1({ c0, c1, c2 }, b1) {
    const { Fp2: Fp22 } = this;
    return {
      c0: Fp22.mulByNonresidue(Fp22.mul(c2, b1)),
      c1: Fp22.mul(c0, b1),
      c2: Fp22.mul(c1, b1)
    };
  }
  // Sparse multiplication
  mul01({ c0, c1, c2 }, b0, b1) {
    const { Fp2: Fp22 } = this;
    let t0 = Fp22.mul(c0, b0);
    let t1 = Fp22.mul(c1, b1);
    return {
      // ((c1 + c2) * b1 - T1) * (u + 1) + T0
      c0: Fp22.add(Fp22.mulByNonresidue(Fp22.sub(Fp22.mul(Fp22.add(c1, c2), b1), t1)), t0),
      // (b0 + b1) * (c0 + c1) - T0 - T1
      c1: Fp22.sub(Fp22.sub(Fp22.mul(Fp22.add(b0, b1), Fp22.add(c0, c1)), t0), t1),
      // (c0 + c2) * b0 - T0 + T1
      c2: Fp22.add(Fp22.sub(Fp22.mul(Fp22.add(c0, c2), b0), t0), t1)
    };
  }
}
class _Field12 {
  constructor(Fp62, opts) {
    this.MASK = _1n$3;
    const { Fp2: Fp22 } = Fp62;
    const { Fp: Fp3 } = Fp22;
    this.Fp6 = Fp62;
    this.ORDER = Fp22.ORDER;
    this.BITS = 2 * Fp62.BITS;
    this.BYTES = 2 * Fp62.BYTES;
    this.isLE = Fp62.isLE;
    this.ZERO = { c0: Fp62.ZERO, c1: Fp62.ZERO };
    this.ONE = { c0: Fp62.ONE, c1: Fp62.ZERO };
    this.FROBENIUS_COEFFICIENTS = calcFrobeniusCoefficients(Fp22, Fp22.NONRESIDUE, Fp3.ORDER, 12, 1, 6)[0];
    this.X_LEN = opts.X_LEN;
    this.finalExponentiate = opts.Fp12finalExponentiate;
  }
  create(num) {
    return num;
  }
  isValid({ c0, c1 }) {
    const { Fp6: Fp62 } = this;
    return Fp62.isValid(c0) && Fp62.isValid(c1);
  }
  is0({ c0, c1 }) {
    const { Fp6: Fp62 } = this;
    return Fp62.is0(c0) && Fp62.is0(c1);
  }
  isValidNot0(num) {
    return !this.is0(num) && this.isValid(num);
  }
  neg({ c0, c1 }) {
    const { Fp6: Fp62 } = this;
    return { c0: Fp62.neg(c0), c1: Fp62.neg(c1) };
  }
  eql({ c0, c1 }, { c0: r0, c1: r1 }) {
    const { Fp6: Fp62 } = this;
    return Fp62.eql(c0, r0) && Fp62.eql(c1, r1);
  }
  sqrt(_2) {
    notImplemented();
  }
  inv({ c0, c1 }) {
    const { Fp6: Fp62 } = this;
    let t3 = Fp62.inv(Fp62.sub(Fp62.sqr(c0), Fp62.mulByNonresidue(Fp62.sqr(c1))));
    return { c0: Fp62.mul(c0, t3), c1: Fp62.neg(Fp62.mul(c1, t3)) };
  }
  div(lhs, rhs) {
    const { Fp6: Fp62 } = this;
    const { Fp2: Fp22 } = Fp62;
    const { Fp: Fp3 } = Fp22;
    return this.mul(lhs, typeof rhs === "bigint" ? Fp3.inv(Fp3.create(rhs)) : this.inv(rhs));
  }
  pow(num, power) {
    return FpPow(this, num, power);
  }
  invertBatch(nums) {
    return FpInvertBatch(this, nums);
  }
  // Normalized
  add({ c0, c1 }, { c0: r0, c1: r1 }) {
    const { Fp6: Fp62 } = this;
    return {
      c0: Fp62.add(c0, r0),
      c1: Fp62.add(c1, r1)
    };
  }
  sub({ c0, c1 }, { c0: r0, c1: r1 }) {
    const { Fp6: Fp62 } = this;
    return {
      c0: Fp62.sub(c0, r0),
      c1: Fp62.sub(c1, r1)
    };
  }
  mul({ c0, c1 }, rhs) {
    const { Fp6: Fp62 } = this;
    if (typeof rhs === "bigint")
      return { c0: Fp62.mul(c0, rhs), c1: Fp62.mul(c1, rhs) };
    let { c0: r0, c1: r1 } = rhs;
    let t1 = Fp62.mul(c0, r0);
    let t22 = Fp62.mul(c1, r1);
    return {
      c0: Fp62.add(t1, Fp62.mulByNonresidue(t22)),
      // T1 + T2 * v
      // (c0 + c1) * (r0 + r1) - (T1 + T2)
      c1: Fp62.sub(Fp62.mul(Fp62.add(c0, c1), Fp62.add(r0, r1)), Fp62.add(t1, t22))
    };
  }
  sqr({ c0, c1 }) {
    const { Fp6: Fp62 } = this;
    let ab = Fp62.mul(c0, c1);
    return {
      // (c1 * v + c0) * (c0 + c1) - AB - AB * v
      c0: Fp62.sub(Fp62.sub(Fp62.mul(Fp62.add(Fp62.mulByNonresidue(c1), c0), Fp62.add(c0, c1)), ab), Fp62.mulByNonresidue(ab)),
      c1: Fp62.add(ab, ab)
    };
  }
  // NonNormalized stuff
  addN(a2, b2) {
    return this.add(a2, b2);
  }
  subN(a2, b2) {
    return this.sub(a2, b2);
  }
  mulN(a2, b2) {
    return this.mul(a2, b2);
  }
  sqrN(a2) {
    return this.sqr(a2);
  }
  // Bytes utils
  fromBytes(b2) {
    const { Fp6: Fp62 } = this;
    if (b2.length !== this.BYTES)
      throw new Error("fromBytes invalid length=" + b2.length);
    return {
      c0: Fp62.fromBytes(b2.subarray(0, Fp62.BYTES)),
      c1: Fp62.fromBytes(b2.subarray(Fp62.BYTES))
    };
  }
  toBytes({ c0, c1 }) {
    const { Fp6: Fp62 } = this;
    return concatBytes(Fp62.toBytes(c0), Fp62.toBytes(c1));
  }
  cmov({ c0, c1 }, { c0: r0, c1: r1 }, c2) {
    const { Fp6: Fp62 } = this;
    return {
      c0: Fp62.cmov(c0, r0, c2),
      c1: Fp62.cmov(c1, r1, c2)
    };
  }
  // Utils
  // toString() {
  //   return '' + 'Fp12(' + this.c0 + this.c1 + '* w');
  // },
  // fromTuple(c: [Fp6, Fp6]) {
  //   return new Fp12(...c);
  // }
  fromBigTwelve(t3) {
    const { Fp6: Fp62 } = this;
    return {
      c0: Fp62.fromBigSix(t3.slice(0, 6)),
      c1: Fp62.fromBigSix(t3.slice(6, 12))
    };
  }
  // Raises to q**i -th power
  frobeniusMap(lhs, power) {
    const { Fp6: Fp62 } = this;
    const { Fp2: Fp22 } = Fp62;
    const { c0, c1, c2 } = Fp62.frobeniusMap(lhs.c1, power);
    const coeff = this.FROBENIUS_COEFFICIENTS[power % 12];
    return {
      c0: Fp62.frobeniusMap(lhs.c0, power),
      c1: Fp62.create({
        c0: Fp22.mul(c0, coeff),
        c1: Fp22.mul(c1, coeff),
        c2: Fp22.mul(c2, coeff)
      })
    };
  }
  mulByFp2({ c0, c1 }, rhs) {
    const { Fp6: Fp62 } = this;
    return {
      c0: Fp62.mulByFp2(c0, rhs),
      c1: Fp62.mulByFp2(c1, rhs)
    };
  }
  conjugate({ c0, c1 }) {
    return { c0, c1: this.Fp6.neg(c1) };
  }
  // Sparse multiplication
  mul014({ c0, c1 }, o0, o1, o4) {
    const { Fp6: Fp62 } = this;
    const { Fp2: Fp22 } = Fp62;
    let t0 = Fp62.mul01(c0, o0, o1);
    let t1 = Fp62.mul1(c1, o4);
    return {
      c0: Fp62.add(Fp62.mulByNonresidue(t1), t0),
      // T1 * v + T0
      // (c1 + c0) * [o0, o1+o4] - T0 - T1
      c1: Fp62.sub(Fp62.sub(Fp62.mul01(Fp62.add(c1, c0), o0, Fp22.add(o1, o4)), t0), t1)
    };
  }
  mul034({ c0, c1 }, o0, o3, o4) {
    const { Fp6: Fp62 } = this;
    const { Fp2: Fp22 } = Fp62;
    const a2 = Fp62.create({
      c0: Fp22.mul(c0.c0, o0),
      c1: Fp22.mul(c0.c1, o0),
      c2: Fp22.mul(c0.c2, o0)
    });
    const b2 = Fp62.mul01(c1, o3, o4);
    const e5 = Fp62.mul01(Fp62.add(c0, c1), Fp22.add(o0, o3), o4);
    return {
      c0: Fp62.add(Fp62.mulByNonresidue(b2), a2),
      c1: Fp62.sub(e5, Fp62.add(a2, b2))
    };
  }
  // A cyclotomic group is a subgroup of Fp^n defined by
  //   GΦₙ(p) = {α ∈ Fpⁿ : α^Φₙ(p) = 1}
  // The result of any pairing is in a cyclotomic subgroup
  // https://eprint.iacr.org/2009/565.pdf
  // https://eprint.iacr.org/2010/354.pdf
  _cyclotomicSquare({ c0, c1 }) {
    const { Fp6: Fp62 } = this;
    const { Fp2: Fp22 } = Fp62;
    const { c0: c0c0, c1: c0c1, c2: c0c2 } = c0;
    const { c0: c1c0, c1: c1c1, c2: c1c2 } = c1;
    const { first: t3, second: t4 } = Fp22.Fp4Square(c0c0, c1c1);
    const { first: t5, second: t6 } = Fp22.Fp4Square(c1c0, c0c2);
    const { first: t7, second: t8 } = Fp22.Fp4Square(c0c1, c1c2);
    const t9 = Fp22.mulByNonresidue(t8);
    return {
      c0: Fp62.create({
        c0: Fp22.add(Fp22.mul(Fp22.sub(t3, c0c0), _2n$3), t3),
        // 2 * (T3 - c0c0)  + T3
        c1: Fp22.add(Fp22.mul(Fp22.sub(t5, c0c1), _2n$3), t5),
        // 2 * (T5 - c0c1)  + T5
        c2: Fp22.add(Fp22.mul(Fp22.sub(t7, c0c2), _2n$3), t7)
      }),
      // 2 * (T7 - c0c2)  + T7
      c1: Fp62.create({
        c0: Fp22.add(Fp22.mul(Fp22.add(t9, c1c0), _2n$3), t9),
        // 2 * (T9 + c1c0) + T9
        c1: Fp22.add(Fp22.mul(Fp22.add(t4, c1c1), _2n$3), t4),
        // 2 * (T4 + c1c1) + T4
        c2: Fp22.add(Fp22.mul(Fp22.add(t6, c1c2), _2n$3), t6)
      })
    };
  }
  // https://eprint.iacr.org/2009/565.pdf
  _cyclotomicExp(num, n2) {
    let z2 = this.ONE;
    for (let i3 = this.X_LEN - 1; i3 >= 0; i3--) {
      z2 = this._cyclotomicSquare(z2);
      if (bitGet(n2, i3))
        z2 = this.mul(z2, num);
    }
    return z2;
  }
}
function tower12(opts) {
  const Fp3 = Field(opts.ORDER);
  const Fp22 = new _Field2(Fp3, opts);
  const Fp62 = new _Field6(Fp22);
  const Fp122 = new _Field12(Fp62, opts);
  return { Fp: Fp3, Fp2: Fp22, Fp6: Fp62, Fp12: Fp122 };
}
/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
const _0n$1 = BigInt(0), _1n$2 = BigInt(1), _2n$2 = BigInt(2), _3n = BigInt(3), _4n = BigInt(4);
const BLS_X = BigInt("0xd201000000010000");
const BLS_X_LEN = bitLen(BLS_X);
const bls12_381_CURVE_G1 = {
  p: BigInt("0x1a0111ea397fe69a4b1ba7b6434bacd764774b84f38512bf6730d2a0f6b0f6241eabfffeb153ffffb9feffffffffaaab"),
  n: BigInt("0x73eda753299d7d483339d80809a1d80553bda402fffe5bfeffffffff00000001"),
  h: BigInt("0x396c8c005555e1568c00aaab0000aaab"),
  a: _0n$1,
  b: _4n,
  Gx: BigInt("0x17f1d3a73197d7942695638c4fa9ac0fc3688c4f9774b905a14e3a3f171bac586c55e83ff97a1aeffb3af00adb22c6bb"),
  Gy: BigInt("0x08b3f481e3aaa0f1a09e30ed741d8ae4fcf5e095d5d00af600db18cb2c04b3edd03cc744a2888ae40caa232946c5e7e1")
};
const bls12_381_Fr = Field(bls12_381_CURVE_G1.n, {
  modFromBytes: true,
  isLE: true
});
const { Fp: Fp$1, Fp2, Fp6, Fp12 } = tower12({
  ORDER: bls12_381_CURVE_G1.p,
  X_LEN: BLS_X_LEN,
  // Finite extension field over irreducible polynominal.
  // Fp(u) / (u² - β) where β = -1
  FP2_NONRESIDUE: [_1n$2, _1n$2],
  Fp2mulByB: ({ c0, c1 }) => {
    const t0 = Fp$1.mul(c0, _4n);
    const t1 = Fp$1.mul(c1, _4n);
    return { c0: Fp$1.sub(t0, t1), c1: Fp$1.add(t0, t1) };
  },
  Fp12finalExponentiate: (num) => {
    const x3 = BLS_X;
    const t0 = Fp12.div(Fp12.frobeniusMap(num, 6), num);
    const t1 = Fp12.mul(Fp12.frobeniusMap(t0, 2), t0);
    const t22 = Fp12.conjugate(Fp12._cyclotomicExp(t1, x3));
    const t3 = Fp12.mul(Fp12.conjugate(Fp12._cyclotomicSquare(t1)), t22);
    const t4 = Fp12.conjugate(Fp12._cyclotomicExp(t3, x3));
    const t5 = Fp12.conjugate(Fp12._cyclotomicExp(t4, x3));
    const t6 = Fp12.mul(Fp12.conjugate(Fp12._cyclotomicExp(t5, x3)), Fp12._cyclotomicSquare(t22));
    const t7 = Fp12.conjugate(Fp12._cyclotomicExp(t6, x3));
    const t2_t5_pow_q2 = Fp12.frobeniusMap(Fp12.mul(t22, t5), 2);
    const t4_t1_pow_q3 = Fp12.frobeniusMap(Fp12.mul(t4, t1), 3);
    const t6_t1c_pow_q1 = Fp12.frobeniusMap(Fp12.mul(t6, Fp12.conjugate(t1)), 1);
    const t7_t3c_t1 = Fp12.mul(Fp12.mul(t7, Fp12.conjugate(t3)), t1);
    return Fp12.mul(Fp12.mul(Fp12.mul(t2_t5_pow_q2, t4_t1_pow_q3), t6_t1c_pow_q1), t7_t3c_t1);
  }
});
const { G2psi, G2psi2 } = psiFrobenius(Fp$1, Fp2, Fp2.div(Fp2.ONE, Fp2.NONRESIDUE));
const htfDefaults = Object.freeze({
  DST: "BLS_SIG_BLS12381G2_XMD:SHA-256_SSWU_RO_NUL_",
  encodeDST: "BLS_SIG_BLS12381G2_XMD:SHA-256_SSWU_RO_NUL_",
  p: Fp$1.ORDER,
  m: 2,
  k: 128,
  expand: "xmd",
  hash: sha256
});
const bls12_381_CURVE_G2 = {
  p: Fp2.ORDER,
  n: bls12_381_CURVE_G1.n,
  h: BigInt("0x5d543a95414e7f1091d50792876a202cd91de4547085abaa68a205b2e5a7ddfa628f1cb4d9e82ef21537e293a6691ae1616ec6e786f0c70cf1c38e31c7238e5"),
  a: Fp2.ZERO,
  b: Fp2.fromBigTuple([_4n, _4n]),
  Gx: Fp2.fromBigTuple([
    BigInt("0x024aa2b2f08f0a91260805272dc51051c6e47ad4fa403b02b4510b647ae3d1770bac0326a805bbefd48056c8c121bdb8"),
    BigInt("0x13e02b6052719f607dacd3a088274f65596bd0d09920b61ab5da61bbdc7f5049334cf11213945d57e5ac7d055d042b7e")
  ]),
  Gy: Fp2.fromBigTuple([
    BigInt("0x0ce5d527727d6e118cc9cdc6da2e351aadfd9baa8cbdd3a76d429a695160d12c923ac9cc3baca289e193548608b82801"),
    BigInt("0x0606c4a02ea734cc32acd2b02bc28b99cb3e287e85a763af267492ab572e99ab3f370d275cec1da1aaa9075ff05f79be")
  ])
};
const COMPZERO = setMask(Fp$1.toBytes(_0n$1), { infinity: true, compressed: true });
function parseMask(bytes) {
  bytes = bytes.slice();
  const mask = bytes[0] & 224;
  const compressed = !!(mask >> 7 & 1);
  const infinity = !!(mask >> 6 & 1);
  const sort = !!(mask >> 5 & 1);
  bytes[0] &= 31;
  return { compressed, infinity, sort, value: bytes };
}
function setMask(bytes, mask) {
  if (bytes[0] & 224)
    throw new Error("setMask: non-empty mask");
  if (mask.compressed)
    bytes[0] |= 128;
  if (mask.infinity)
    bytes[0] |= 64;
  if (mask.sort)
    bytes[0] |= 32;
  return bytes;
}
function pointG1ToBytes(_c, point, isComp) {
  const { BYTES: L2, ORDER: P2 } = Fp$1;
  const is0 = point.is0();
  const { x: x3, y: y2 } = point.toAffine();
  if (isComp) {
    if (is0)
      return COMPZERO.slice();
    const sort = Boolean(y2 * _2n$2 / P2);
    return setMask(numberToBytesBE(x3, L2), { compressed: true, sort });
  } else {
    if (is0) {
      return concatBytes(Uint8Array.of(64), new Uint8Array(2 * L2 - 1));
    } else {
      return concatBytes(numberToBytesBE(x3, L2), numberToBytesBE(y2, L2));
    }
  }
}
function signatureG1ToBytes(point) {
  point.assertValidity();
  const { BYTES: L2, ORDER: P2 } = Fp$1;
  const { x: x3, y: y2 } = point.toAffine();
  if (point.is0())
    return COMPZERO.slice();
  const sort = Boolean(y2 * _2n$2 / P2);
  return setMask(numberToBytesBE(x3, L2), { compressed: true, sort });
}
function pointG1FromBytes(bytes) {
  const { compressed, infinity, sort, value } = parseMask(bytes);
  const { BYTES: L2, ORDER: P2 } = Fp$1;
  if (value.length === 48 && compressed) {
    const compressedValue = bytesToNumberBE(value);
    const x3 = Fp$1.create(compressedValue & bitMask(Fp$1.BITS));
    if (infinity) {
      if (x3 !== _0n$1)
        throw new Error("invalid G1 point: non-empty, at infinity, with compression");
      return { x: _0n$1, y: _0n$1 };
    }
    const right = Fp$1.add(Fp$1.pow(x3, _3n), Fp$1.create(bls12_381_CURVE_G1.b));
    let y2 = Fp$1.sqrt(right);
    if (!y2)
      throw new Error("invalid G1 point: compressed point");
    if (y2 * _2n$2 / P2 !== BigInt(sort))
      y2 = Fp$1.neg(y2);
    return { x: Fp$1.create(x3), y: Fp$1.create(y2) };
  } else if (value.length === 96 && !compressed) {
    const x3 = bytesToNumberBE(value.subarray(0, L2));
    const y2 = bytesToNumberBE(value.subarray(L2));
    if (infinity) {
      if (x3 !== _0n$1 || y2 !== _0n$1)
        throw new Error("G1: non-empty point at infinity");
      return bls12_381.G1.Point.ZERO.toAffine();
    }
    return { x: Fp$1.create(x3), y: Fp$1.create(y2) };
  } else {
    throw new Error("invalid G1 point: expected 48/96 bytes");
  }
}
function signatureG1FromBytes(hex) {
  const { infinity, sort, value } = parseMask(ensureBytes("signatureHex", hex, 48));
  const P2 = Fp$1.ORDER;
  const Point = bls12_381.G1.Point;
  const compressedValue = bytesToNumberBE(value);
  if (infinity)
    return Point.ZERO;
  const x3 = Fp$1.create(compressedValue & bitMask(Fp$1.BITS));
  const right = Fp$1.add(Fp$1.pow(x3, _3n), Fp$1.create(bls12_381_CURVE_G1.b));
  let y2 = Fp$1.sqrt(right);
  if (!y2)
    throw new Error("invalid G1 point: compressed");
  const aflag = BigInt(sort);
  if (y2 * _2n$2 / P2 !== aflag)
    y2 = Fp$1.neg(y2);
  const point = Point.fromAffine({ x: x3, y: y2 });
  point.assertValidity();
  return point;
}
function pointG2ToBytes(_c, point, isComp) {
  const { BYTES: L2, ORDER: P2 } = Fp$1;
  const is0 = point.is0();
  const { x: x3, y: y2 } = point.toAffine();
  if (isComp) {
    if (is0)
      return concatBytes(COMPZERO, numberToBytesBE(_0n$1, L2));
    const flag = Boolean(y2.c1 === _0n$1 ? y2.c0 * _2n$2 / P2 : y2.c1 * _2n$2 / P2);
    return concatBytes(setMask(numberToBytesBE(x3.c1, L2), { compressed: true, sort: flag }), numberToBytesBE(x3.c0, L2));
  } else {
    if (is0)
      return concatBytes(Uint8Array.of(64), new Uint8Array(4 * L2 - 1));
    const { re: x0, im: x1 } = Fp2.reim(x3);
    const { re: y0, im: y1 } = Fp2.reim(y2);
    return concatBytes(numberToBytesBE(x1, L2), numberToBytesBE(x0, L2), numberToBytesBE(y1, L2), numberToBytesBE(y0, L2));
  }
}
function signatureG2ToBytes(point) {
  point.assertValidity();
  const { BYTES: L2 } = Fp$1;
  if (point.is0())
    return concatBytes(COMPZERO, numberToBytesBE(_0n$1, L2));
  const { x: x3, y: y2 } = point.toAffine();
  const { re: x0, im: x1 } = Fp2.reim(x3);
  const { re: y0, im: y1 } = Fp2.reim(y2);
  const tmp = y1 > _0n$1 ? y1 * _2n$2 : y0 * _2n$2;
  const sort = Boolean(tmp / Fp$1.ORDER & _1n$2);
  const z2 = x0;
  return concatBytes(setMask(numberToBytesBE(x1, L2), { sort, compressed: true }), numberToBytesBE(z2, L2));
}
function pointG2FromBytes(bytes) {
  const { BYTES: L2, ORDER: P2 } = Fp$1;
  const { compressed, infinity, sort, value } = parseMask(bytes);
  if (!compressed && !infinity && sort || // 00100000
  !compressed && infinity && sort || // 01100000
  sort && infinity && compressed) {
    throw new Error("invalid encoding flag: " + (bytes[0] & 224));
  }
  const slc = (b2, from, to) => bytesToNumberBE(b2.slice(from, to));
  if (value.length === 96 && compressed) {
    if (infinity) {
      if (value.reduce((p2, c2) => p2 !== 0 ? c2 + 1 : c2, 0) > 0) {
        throw new Error("invalid G2 point: compressed");
      }
      return { x: Fp2.ZERO, y: Fp2.ZERO };
    }
    const x_1 = slc(value, 0, L2);
    const x_0 = slc(value, L2, 2 * L2);
    const x3 = Fp2.create({ c0: Fp$1.create(x_0), c1: Fp$1.create(x_1) });
    const right = Fp2.add(Fp2.pow(x3, _3n), bls12_381_CURVE_G2.b);
    let y2 = Fp2.sqrt(right);
    const Y_bit = y2.c1 === _0n$1 ? y2.c0 * _2n$2 / P2 : y2.c1 * _2n$2 / P2 ? _1n$2 : _0n$1;
    y2 = sort && Y_bit > 0 ? y2 : Fp2.neg(y2);
    return { x: x3, y: y2 };
  } else if (value.length === 192 && !compressed) {
    if (infinity) {
      if (value.reduce((p2, c2) => p2 !== 0 ? c2 + 1 : c2, 0) > 0) {
        throw new Error("invalid G2 point: uncompressed");
      }
      return { x: Fp2.ZERO, y: Fp2.ZERO };
    }
    const x1 = slc(value, 0 * L2, 1 * L2);
    const x0 = slc(value, 1 * L2, 2 * L2);
    const y1 = slc(value, 2 * L2, 3 * L2);
    const y0 = slc(value, 3 * L2, 4 * L2);
    return { x: Fp2.fromBigTuple([x0, x1]), y: Fp2.fromBigTuple([y0, y1]) };
  } else {
    throw new Error("invalid G2 point: expected 96/192 bytes");
  }
}
function signatureG2FromBytes(hex) {
  const { ORDER: P2 } = Fp$1;
  const { infinity, sort, value } = parseMask(ensureBytes("signatureHex", hex));
  const Point = bls12_381.G2.Point;
  const half = value.length / 2;
  if (half !== 48 && half !== 96)
    throw new Error("invalid compressed signature length, expected 96/192 bytes");
  const z1 = bytesToNumberBE(value.slice(0, half));
  const z2 = bytesToNumberBE(value.slice(half));
  if (infinity)
    return Point.ZERO;
  const x1 = Fp$1.create(z1 & bitMask(Fp$1.BITS));
  const x22 = Fp$1.create(z2);
  const x3 = Fp2.create({ c0: x22, c1: x1 });
  const y2 = Fp2.add(Fp2.pow(x3, _3n), bls12_381_CURVE_G2.b);
  let y3 = Fp2.sqrt(y2);
  if (!y3)
    throw new Error("Failed to find a square root");
  const { re: y0, im: y1 } = Fp2.reim(y3);
  const aflag1 = BigInt(sort);
  const isGreater = y1 > _0n$1 && y1 * _2n$2 / P2 !== aflag1;
  const is0 = y1 === _0n$1 && y0 * _2n$2 / P2 !== aflag1;
  if (isGreater || is0)
    y3 = Fp2.neg(y3);
  const point = Point.fromAffine({ x: x3, y: y3 });
  point.assertValidity();
  return point;
}
const bls12_381 = bls({
  // Fields
  fields: {
    Fp: Fp$1,
    Fp2,
    Fp6,
    Fp12,
    Fr: bls12_381_Fr
  },
  // G1: y² = x³ + 4
  G1: {
    ...bls12_381_CURVE_G1,
    Fp: Fp$1,
    htfDefaults: { ...htfDefaults, m: 1, DST: "BLS_SIG_BLS12381G1_XMD:SHA-256_SSWU_RO_NUL_" },
    wrapPrivateKey: true,
    allowInfinityPoint: true,
    // Checks is the point resides in prime-order subgroup.
    // point.isTorsionFree() should return true for valid points
    // It returns false for shitty points.
    // https://eprint.iacr.org/2021/1130.pdf
    isTorsionFree: (c2, point) => {
      const beta = BigInt("0x5f19672fdf76ce51ba69c6076a0f77eaddb3a93be6f89688de17d813620a00022e01fffffffefffe");
      const phi = new c2(Fp$1.mul(point.X, beta), point.Y, point.Z);
      const xP = point.multiplyUnsafe(BLS_X).negate();
      const u2P = xP.multiplyUnsafe(BLS_X);
      return u2P.equals(phi);
    },
    // Clear cofactor of G1
    // https://eprint.iacr.org/2019/403
    clearCofactor: (_c, point) => {
      return point.multiplyUnsafe(BLS_X).add(point);
    },
    mapToCurve: mapToG1,
    fromBytes: pointG1FromBytes,
    toBytes: pointG1ToBytes,
    ShortSignature: {
      fromBytes(bytes) {
        abytes(bytes);
        return signatureG1FromBytes(bytes);
      },
      fromHex(hex) {
        return signatureG1FromBytes(hex);
      },
      toBytes(point) {
        return signatureG1ToBytes(point);
      },
      toRawBytes(point) {
        return signatureG1ToBytes(point);
      },
      toHex(point) {
        return bytesToHex(signatureG1ToBytes(point));
      }
    }
  },
  G2: {
    ...bls12_381_CURVE_G2,
    Fp: Fp2,
    // https://datatracker.ietf.org/doc/html/rfc9380#name-clearing-the-cofactor
    // https://datatracker.ietf.org/doc/html/rfc9380#name-cofactor-clearing-for-bls12
    hEff: BigInt("0xbc69f08f2ee75b3584c6a0ea91b352888e2a8e9145ad7689986ff031508ffe1329c2f178731db956d82bf015d1212b02ec0ec69d7477c1ae954cbc06689f6a359894c0adebbf6b4e8020005aaa95551"),
    htfDefaults: { ...htfDefaults },
    wrapPrivateKey: true,
    allowInfinityPoint: true,
    mapToCurve: mapToG2,
    // Checks is the point resides in prime-order subgroup.
    // point.isTorsionFree() should return true for valid points
    // It returns false for shitty points.
    // https://eprint.iacr.org/2021/1130.pdf
    // Older version: https://eprint.iacr.org/2019/814.pdf
    isTorsionFree: (c2, P2) => {
      return P2.multiplyUnsafe(BLS_X).negate().equals(G2psi(c2, P2));
    },
    // Maps the point into the prime-order subgroup G2.
    // clear_cofactor_bls12381_g2 from RFC 9380.
    // https://eprint.iacr.org/2017/419.pdf
    // prettier-ignore
    clearCofactor: (c2, P2) => {
      const x3 = BLS_X;
      let t1 = P2.multiplyUnsafe(x3).negate();
      let t22 = G2psi(c2, P2);
      let t3 = P2.double();
      t3 = G2psi2(c2, t3);
      t3 = t3.subtract(t22);
      t22 = t1.add(t22);
      t22 = t22.multiplyUnsafe(x3).negate();
      t3 = t3.add(t22);
      t3 = t3.subtract(t1);
      const Q2 = t3.subtract(P2);
      return Q2;
    },
    fromBytes: pointG2FromBytes,
    toBytes: pointG2ToBytes,
    Signature: {
      fromBytes(bytes) {
        abytes(bytes);
        return signatureG2FromBytes(bytes);
      },
      fromHex(hex) {
        return signatureG2FromBytes(hex);
      },
      toBytes(point) {
        return signatureG2ToBytes(point);
      },
      toRawBytes(point) {
        return signatureG2ToBytes(point);
      },
      toHex(point) {
        return bytesToHex(signatureG2ToBytes(point));
      }
    }
  },
  params: {
    ateLoopSize: BLS_X,
    // The BLS parameter x for BLS12-381
    r: bls12_381_CURVE_G1.n,
    // order; z⁴ − z² + 1; CURVE.n from other curves
    xNegative: true,
    twistType: "multiplicative"
  },
  htfDefaults
});
const isogenyMapG2 = isogenyMap(Fp2, [
  // xNum
  [
    [
      "0x5c759507e8e333ebb5b7a9a47d7ed8532c52d39fd3a042a88b58423c50ae15d5c2638e343d9c71c6238aaaaaaaa97d6",
      "0x5c759507e8e333ebb5b7a9a47d7ed8532c52d39fd3a042a88b58423c50ae15d5c2638e343d9c71c6238aaaaaaaa97d6"
    ],
    [
      "0x0",
      "0x11560bf17baa99bc32126fced787c88f984f87adf7ae0c7f9a208c6b4f20a4181472aaa9cb8d555526a9ffffffffc71a"
    ],
    [
      "0x11560bf17baa99bc32126fced787c88f984f87adf7ae0c7f9a208c6b4f20a4181472aaa9cb8d555526a9ffffffffc71e",
      "0x8ab05f8bdd54cde190937e76bc3e447cc27c3d6fbd7063fcd104635a790520c0a395554e5c6aaaa9354ffffffffe38d"
    ],
    [
      "0x171d6541fa38ccfaed6dea691f5fb614cb14b4e7f4e810aa22d6108f142b85757098e38d0f671c7188e2aaaaaaaa5ed1",
      "0x0"
    ]
  ],
  // xDen
  [
    [
      "0x0",
      "0x1a0111ea397fe69a4b1ba7b6434bacd764774b84f38512bf6730d2a0f6b0f6241eabfffeb153ffffb9feffffffffaa63"
    ],
    [
      "0xc",
      "0x1a0111ea397fe69a4b1ba7b6434bacd764774b84f38512bf6730d2a0f6b0f6241eabfffeb153ffffb9feffffffffaa9f"
    ],
    ["0x1", "0x0"]
    // LAST 1
  ],
  // yNum
  [
    [
      "0x1530477c7ab4113b59a4c18b076d11930f7da5d4a07f649bf54439d87d27e500fc8c25ebf8c92f6812cfc71c71c6d706",
      "0x1530477c7ab4113b59a4c18b076d11930f7da5d4a07f649bf54439d87d27e500fc8c25ebf8c92f6812cfc71c71c6d706"
    ],
    [
      "0x0",
      "0x5c759507e8e333ebb5b7a9a47d7ed8532c52d39fd3a042a88b58423c50ae15d5c2638e343d9c71c6238aaaaaaaa97be"
    ],
    [
      "0x11560bf17baa99bc32126fced787c88f984f87adf7ae0c7f9a208c6b4f20a4181472aaa9cb8d555526a9ffffffffc71c",
      "0x8ab05f8bdd54cde190937e76bc3e447cc27c3d6fbd7063fcd104635a790520c0a395554e5c6aaaa9354ffffffffe38f"
    ],
    [
      "0x124c9ad43b6cf79bfbf7043de3811ad0761b0f37a1e26286b0e977c69aa274524e79097a56dc4bd9e1b371c71c718b10",
      "0x0"
    ]
  ],
  // yDen
  [
    [
      "0x1a0111ea397fe69a4b1ba7b6434bacd764774b84f38512bf6730d2a0f6b0f6241eabfffeb153ffffb9feffffffffa8fb",
      "0x1a0111ea397fe69a4b1ba7b6434bacd764774b84f38512bf6730d2a0f6b0f6241eabfffeb153ffffb9feffffffffa8fb"
    ],
    [
      "0x0",
      "0x1a0111ea397fe69a4b1ba7b6434bacd764774b84f38512bf6730d2a0f6b0f6241eabfffeb153ffffb9feffffffffa9d3"
    ],
    [
      "0x12",
      "0x1a0111ea397fe69a4b1ba7b6434bacd764774b84f38512bf6730d2a0f6b0f6241eabfffeb153ffffb9feffffffffaa99"
    ],
    ["0x1", "0x0"]
    // LAST 1
  ]
].map((i3) => i3.map((pair) => Fp2.fromBigTuple(pair.map(BigInt)))));
const isogenyMapG1 = isogenyMap(Fp$1, [
  // xNum
  [
    "0x11a05f2b1e833340b809101dd99815856b303e88a2d7005ff2627b56cdb4e2c85610c2d5f2e62d6eaeac1662734649b7",
    "0x17294ed3e943ab2f0588bab22147a81c7c17e75b2f6a8417f565e33c70d1e86b4838f2a6f318c356e834eef1b3cb83bb",
    "0xd54005db97678ec1d1048c5d10a9a1bce032473295983e56878e501ec68e25c958c3e3d2a09729fe0179f9dac9edcb0",
    "0x1778e7166fcc6db74e0609d307e55412d7f5e4656a8dbf25f1b33289f1b330835336e25ce3107193c5b388641d9b6861",
    "0xe99726a3199f4436642b4b3e4118e5499db995a1257fb3f086eeb65982fac18985a286f301e77c451154ce9ac8895d9",
    "0x1630c3250d7313ff01d1201bf7a74ab5db3cb17dd952799b9ed3ab9097e68f90a0870d2dcae73d19cd13c1c66f652983",
    "0xd6ed6553fe44d296a3726c38ae652bfb11586264f0f8ce19008e218f9c86b2a8da25128c1052ecaddd7f225a139ed84",
    "0x17b81e7701abdbe2e8743884d1117e53356de5ab275b4db1a682c62ef0f2753339b7c8f8c8f475af9ccb5618e3f0c88e",
    "0x80d3cf1f9a78fc47b90b33563be990dc43b756ce79f5574a2c596c928c5d1de4fa295f296b74e956d71986a8497e317",
    "0x169b1f8e1bcfa7c42e0c37515d138f22dd2ecb803a0c5c99676314baf4bb1b7fa3190b2edc0327797f241067be390c9e",
    "0x10321da079ce07e272d8ec09d2565b0dfa7dccdde6787f96d50af36003b14866f69b771f8c285decca67df3f1605fb7b",
    "0x6e08c248e260e70bd1e962381edee3d31d79d7e22c837bc23c0bf1bc24c6b68c24b1b80b64d391fa9c8ba2e8ba2d229"
  ],
  // xDen
  [
    "0x8ca8d548cff19ae18b2e62f4bd3fa6f01d5ef4ba35b48ba9c9588617fc8ac62b558d681be343df8993cf9fa40d21b1c",
    "0x12561a5deb559c4348b4711298e536367041e8ca0cf0800c0126c2588c48bf5713daa8846cb026e9e5c8276ec82b3bff",
    "0xb2962fe57a3225e8137e629bff2991f6f89416f5a718cd1fca64e00b11aceacd6a3d0967c94fedcfcc239ba5cb83e19",
    "0x3425581a58ae2fec83aafef7c40eb545b08243f16b1655154cca8abc28d6fd04976d5243eecf5c4130de8938dc62cd8",
    "0x13a8e162022914a80a6f1d5f43e7a07dffdfc759a12062bb8d6b44e833b306da9bd29ba81f35781d539d395b3532a21e",
    "0xe7355f8e4e667b955390f7f0506c6e9395735e9ce9cad4d0a43bcef24b8982f7400d24bc4228f11c02df9a29f6304a5",
    "0x772caacf16936190f3e0c63e0596721570f5799af53a1894e2e073062aede9cea73b3538f0de06cec2574496ee84a3a",
    "0x14a7ac2a9d64a8b230b3f5b074cf01996e7f63c21bca68a81996e1cdf9822c580fa5b9489d11e2d311f7d99bbdcc5a5e",
    "0xa10ecf6ada54f825e920b3dafc7a3cce07f8d1d7161366b74100da67f39883503826692abba43704776ec3a79a1d641",
    "0x95fc13ab9e92ad4476d6e3eb3a56680f682b4ee96f7d03776df533978f31c1593174e4b4b7865002d6384d168ecdd0a",
    "0x000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001"
    // LAST 1
  ],
  // yNum
  [
    "0x90d97c81ba24ee0259d1f094980dcfa11ad138e48a869522b52af6c956543d3cd0c7aee9b3ba3c2be9845719707bb33",
    "0x134996a104ee5811d51036d776fb46831223e96c254f383d0f906343eb67ad34d6c56711962fa8bfe097e75a2e41c696",
    "0xcc786baa966e66f4a384c86a3b49942552e2d658a31ce2c344be4b91400da7d26d521628b00523b8dfe240c72de1f6",
    "0x1f86376e8981c217898751ad8746757d42aa7b90eeb791c09e4a3ec03251cf9de405aba9ec61deca6355c77b0e5f4cb",
    "0x8cc03fdefe0ff135caf4fe2a21529c4195536fbe3ce50b879833fd221351adc2ee7f8dc099040a841b6daecf2e8fedb",
    "0x16603fca40634b6a2211e11db8f0a6a074a7d0d4afadb7bd76505c3d3ad5544e203f6326c95a807299b23ab13633a5f0",
    "0x4ab0b9bcfac1bbcb2c977d027796b3ce75bb8ca2be184cb5231413c4d634f3747a87ac2460f415ec961f8855fe9d6f2",
    "0x987c8d5333ab86fde9926bd2ca6c674170a05bfe3bdd81ffd038da6c26c842642f64550fedfe935a15e4ca31870fb29",
    "0x9fc4018bd96684be88c9e221e4da1bb8f3abd16679dc26c1e8b6e6a1f20cabe69d65201c78607a360370e577bdba587",
    "0xe1bba7a1186bdb5223abde7ada14a23c42a0ca7915af6fe06985e7ed1e4d43b9b3f7055dd4eba6f2bafaaebca731c30",
    "0x19713e47937cd1be0dfd0b8f1d43fb93cd2fcbcb6caf493fd1183e416389e61031bf3a5cce3fbafce813711ad011c132",
    "0x18b46a908f36f6deb918c143fed2edcc523559b8aaf0c2462e6bfe7f911f643249d9cdf41b44d606ce07c8a4d0074d8e",
    "0xb182cac101b9399d155096004f53f447aa7b12a3426b08ec02710e807b4633f06c851c1919211f20d4c04f00b971ef8",
    "0x245a394ad1eca9b72fc00ae7be315dc757b3b080d4c158013e6632d3c40659cc6cf90ad1c232a6442d9d3f5db980133",
    "0x5c129645e44cf1102a159f748c4a3fc5e673d81d7e86568d9ab0f5d396a7ce46ba1049b6579afb7866b1e715475224b",
    "0x15e6be4e990f03ce4ea50b3b42df2eb5cb181d8f84965a3957add4fa95af01b2b665027efec01c7704b456be69c8b604"
  ],
  // yDen
  [
    "0x16112c4c3a9c98b252181140fad0eae9601a6de578980be6eec3232b5be72e7a07f3688ef60c206d01479253b03663c1",
    "0x1962d75c2381201e1a0cbd6c43c348b885c84ff731c4d59ca4a10356f453e01f78a4260763529e3532f6102c2e49a03d",
    "0x58df3306640da276faaae7d6e8eb15778c4855551ae7f310c35a5dd279cd2eca6757cd636f96f891e2538b53dbf67f2",
    "0x16b7d288798e5395f20d23bf89edb4d1d115c5dbddbcd30e123da489e726af41727364f2c28297ada8d26d98445f5416",
    "0xbe0e079545f43e4b00cc912f8228ddcc6d19c9f0f69bbb0542eda0fc9dec916a20b15dc0fd2ededda39142311a5001d",
    "0x8d9e5297186db2d9fb266eaac783182b70152c65550d881c5ecd87b6f0f5a6449f38db9dfa9cce202c6477faaf9b7ac",
    "0x166007c08a99db2fc3ba8734ace9824b5eecfdfa8d0cf8ef5dd365bc400a0051d5fa9c01a58b1fb93d1a1399126a775c",
    "0x16a3ef08be3ea7ea03bcddfabba6ff6ee5a4375efa1f4fd7feb34fd206357132b920f5b00801dee460ee415a15812ed9",
    "0x1866c8ed336c61231a1be54fd1d74cc4f9fb0ce4c6af5920abc5750c4bf39b4852cfe2f7bb9248836b233d9d55535d4a",
    "0x167a55cda70a6e1cea820597d94a84903216f763e13d87bb5308592e7ea7d4fbc7385ea3d529b35e346ef48bb8913f55",
    "0x4d2f259eea405bd48f010a01ad2911d9c6dd039bb61a6290e591b36e636a5c871a5c29f4f83060400f8b49cba8f6aa8",
    "0xaccbb67481d033ff5852c1e48c50c477f94ff8aefce42d28c0f9a88cea7913516f968986f7ebbea9684b529e2561092",
    "0xad6b9514c767fe3c3613144b45f1496543346d98adf02267d5ceef9a00d9b8693000763e3b90ac11e99b138573345cc",
    "0x2660400eb2e4f3b628bdd0d53cd76f2bf565b94e72927c1cb748df27942480e420517bd8714cc80d1fadc1326ed06f7",
    "0xe0fa1d816ddc03e6b24255e0d7819c171c40f65e273b853324efcd6356caa205ca2f570f13497804415473a1d634b8f",
    "0x000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001"
    // LAST 1
  ]
].map((i3) => i3.map((j2) => BigInt(j2))));
const G1_SWU = mapToCurveSimpleSWU(Fp$1, {
  A: Fp$1.create(BigInt("0x144698a3b8e9433d693a02c96d4982b0ea985383ee66a8d8e8981aefd881ac98936f8da0e0f97f5cf428082d584c1d")),
  B: Fp$1.create(BigInt("0x12e2908d11688030018b12e8753eee3b2016c1f0f24f4070a0b9c14fcef35ef55a23215a316ceaa5d1cc48e98e172be0")),
  Z: Fp$1.create(BigInt(11))
});
const G2_SWU = mapToCurveSimpleSWU(Fp2, {
  A: Fp2.create({ c0: Fp$1.create(_0n$1), c1: Fp$1.create(BigInt(240)) }),
  // A' = 240 * I
  B: Fp2.create({ c0: Fp$1.create(BigInt(1012)), c1: Fp$1.create(BigInt(1012)) }),
  // B' = 1012 * (1 + I)
  Z: Fp2.create({ c0: Fp$1.create(BigInt(-2)), c1: Fp$1.create(BigInt(-1)) })
  // Z: -(2 + I)
});
function mapToG1(scalars) {
  const { x: x3, y: y2 } = G1_SWU(Fp$1.create(scalars[0]));
  return isogenyMapG1(x3, y2);
}
function mapToG2(scalars) {
  const { x: x3, y: y2 } = G2_SWU(Fp2.fromBigTuple(scalars));
  return isogenyMapG2(x3, y2);
}
function blsVerify(pk, sig, msg) {
  const primaryKey = typeof pk === "string" ? pk : bytesToHex(pk);
  const signature = typeof sig === "string" ? sig : bytesToHex(sig);
  const message = typeof msg === "string" ? msg : bytesToHex(msg);
  return bls12_381.verifyShortSignature(signature, message, primaryKey);
}
const MILLISECOND_TO_NANOSECONDS = BigInt(1e6);
const decodeLeb128 = (buf) => {
  return lebDecode(new PipeArrayBuffer(buf));
};
const decodeTime = (buf) => {
  const timestampNs = decodeLeb128(buf);
  const timestampMs = timestampNs / MILLISECOND_TO_NANOSECONDS;
  return new Date(Number(timestampMs));
};
const MINUTES_TO_MSEC = 60 * 1e3;
const HOURS_TO_MINUTES = 60;
const DAYS_TO_HOURS = 24;
const DAYS_TO_MINUTES = DAYS_TO_HOURS * HOURS_TO_MINUTES;
const DEFAULT_CERTIFICATE_MAX_AGE_IN_MINUTES = 5;
const DEFAULT_CERTIFICATE_MAX_MINUTES_IN_FUTURE = 5;
const DEFAULT_CERTIFICATE_DELEGATION_MAX_AGE_IN_MINUTES = 30 * DAYS_TO_MINUTES;
var NodeType;
(function(NodeType2) {
  NodeType2[NodeType2["Empty"] = 0] = "Empty";
  NodeType2[NodeType2["Fork"] = 1] = "Fork";
  NodeType2[NodeType2["Labeled"] = 2] = "Labeled";
  NodeType2[NodeType2["Leaf"] = 3] = "Leaf";
  NodeType2[NodeType2["Pruned"] = 4] = "Pruned";
})(NodeType || (NodeType = {}));
function isBufferGreaterThan(a2, b2) {
  for (let i3 = 0; i3 < a2.length; i3++) {
    if (a2[i3] > b2[i3]) {
      return true;
    }
  }
  return false;
}
class Certificate {
  #disableTimeVerification = false;
  #agent = void 0;
  /**
   * Create a new instance of a certificate, automatically verifying it.
   * @param {CreateCertificateOptions} options {@link CreateCertificateOptions}
   * @throws if the verification of the certificate fails
   */
  static async create(options) {
    const cert = Certificate.createUnverified(options);
    await cert.verify();
    return cert;
  }
  static createUnverified(options) {
    return new Certificate(options.certificate, options.rootKey, options.canisterId, options.blsVerify ?? blsVerify, options.maxAgeInMinutes, options.disableTimeVerification, options.agent);
  }
  constructor(certificate, _rootKey, _canisterId, _blsVerify, _maxAgeInMinutes = DEFAULT_CERTIFICATE_MAX_AGE_IN_MINUTES, disableTimeVerification = false, agent) {
    this._rootKey = _rootKey;
    this._canisterId = _canisterId;
    this._blsVerify = _blsVerify;
    this._maxAgeInMinutes = _maxAgeInMinutes;
    this.#disableTimeVerification = disableTimeVerification;
    this.cert = decode(certificate);
    if (agent && "getTimeDiffMsecs" in agent && "hasSyncedTime" in agent && "syncTime" in agent) {
      this.#agent = agent;
    }
  }
  /**
   * Lookup a path in the certificate tree, using {@link lookup_path}.
   * @param path The path to lookup.
   * @returns The result of the lookup.
   */
  lookup_path(path) {
    return lookup_path(path, this.cert.tree);
  }
  /**
   * Lookup a subtree in the certificate tree, using {@link lookup_subtree}.
   * @param path The path to lookup.
   * @returns The result of the lookup.
   */
  lookup_subtree(path) {
    return lookup_subtree(path, this.cert.tree);
  }
  async verify() {
    const rootHash = await reconstruct(this.cert.tree);
    const derKey = await this._checkDelegationAndGetKey(this.cert.delegation);
    const sig = this.cert.signature;
    const key = extractDER(derKey);
    const msg = concatBytes(domain_sep("ic-state-root"), rootHash);
    const lookupTime = lookupResultToBuffer(this.lookup_path(["time"]));
    if (!lookupTime) {
      throw ProtocolError.fromCode(new CertificateVerificationErrorCode("Certificate does not contain a time"));
    }
    if (!this.#disableTimeVerification) {
      const timeDiffMsecs = this.#agent?.getTimeDiffMsecs() ?? 0;
      const maxAgeInMsec = this._maxAgeInMinutes * MINUTES_TO_MSEC;
      const now = /* @__PURE__ */ new Date();
      const adjustedNow = now.getTime() + timeDiffMsecs;
      const earliestCertificateTime = adjustedNow - maxAgeInMsec;
      const latestCertificateTime = adjustedNow + DEFAULT_CERTIFICATE_MAX_MINUTES_IN_FUTURE * MINUTES_TO_MSEC;
      const certTime = decodeTime(lookupTime);
      const isCertificateTimePast = certTime.getTime() < earliestCertificateTime;
      const isCertificateTimeFuture = certTime.getTime() > latestCertificateTime;
      if ((isCertificateTimePast || isCertificateTimeFuture) && this.#agent && !this.#agent.hasSyncedTime()) {
        await this.#agent.syncTime(this._canisterId);
        return await this.verify();
      }
      if (isCertificateTimePast) {
        throw TrustError.fromCode(new CertificateTimeErrorCode(this._maxAgeInMinutes, certTime, now, timeDiffMsecs, "past"));
      } else if (isCertificateTimeFuture) {
        if (this.#agent?.hasSyncedTime()) {
          throw UnknownError.fromCode(new UnexpectedErrorCode("System time has been synced with the IC network, but certificate is still too far in the future."));
        }
        throw TrustError.fromCode(new CertificateTimeErrorCode(5, certTime, now, timeDiffMsecs, "future"));
      }
    }
    try {
      const sigVer = await this._blsVerify(key, sig, msg);
      if (!sigVer) {
        throw TrustError.fromCode(new CertificateVerificationErrorCode("Invalid signature"));
      }
    } catch (err) {
      throw TrustError.fromCode(new CertificateVerificationErrorCode("Signature verification failed", err));
    }
  }
  async _checkDelegationAndGetKey(d2) {
    if (!d2) {
      return this._rootKey;
    }
    const cert = Certificate.createUnverified({
      certificate: d2.certificate,
      rootKey: this._rootKey,
      canisterId: this._canisterId,
      blsVerify: this._blsVerify,
      disableTimeVerification: this.#disableTimeVerification,
      maxAgeInMinutes: DEFAULT_CERTIFICATE_DELEGATION_MAX_AGE_IN_MINUTES,
      agent: this.#agent
    });
    if (cert.cert.delegation) {
      throw ProtocolError.fromCode(new CertificateHasTooManyDelegationsErrorCode());
    }
    await cert.verify();
    const subnetIdBytes = d2.subnet_id;
    const subnetId = Principal$1.fromUint8Array(subnetIdBytes);
    const canisterInRange = check_canister_ranges({
      canisterId: this._canisterId,
      subnetId,
      tree: cert.cert.tree
    });
    if (!canisterInRange) {
      throw TrustError.fromCode(new CertificateNotAuthorizedErrorCode(this._canisterId, subnetId));
    }
    const publicKeyLookup = lookupResultToBuffer(cert.lookup_path(["subnet", subnetIdBytes, "public_key"]));
    if (!publicKeyLookup) {
      throw TrustError.fromCode(new MissingLookupValueErrorCode(`Could not find subnet key for subnet ID ${subnetId.toText()}`));
    }
    return publicKeyLookup;
  }
}
const DER_PREFIX = hexToBytes("308182301d060d2b0601040182dc7c0503010201060c2b0601040182dc7c05030201036100");
const KEY_LENGTH = 96;
function extractDER(buf) {
  const expectedLength = DER_PREFIX.byteLength + KEY_LENGTH;
  if (buf.byteLength !== expectedLength) {
    throw ProtocolError.fromCode(new DerKeyLengthMismatchErrorCode(expectedLength, buf.byteLength));
  }
  const prefix = buf.slice(0, DER_PREFIX.byteLength);
  if (!uint8Equals(prefix, DER_PREFIX)) {
    throw ProtocolError.fromCode(new DerPrefixMismatchErrorCode(DER_PREFIX, prefix));
  }
  return buf.slice(DER_PREFIX.byteLength);
}
function lookupResultToBuffer(result) {
  if (result.status !== LookupPathStatus.Found) {
    return void 0;
  }
  if (result.value instanceof Uint8Array) {
    return result.value;
  }
  return void 0;
}
async function reconstruct(t3) {
  switch (t3[0]) {
    case NodeType.Empty:
      return sha256(domain_sep("ic-hashtree-empty"));
    case NodeType.Pruned:
      return t3[1];
    case NodeType.Leaf:
      return sha256(concatBytes(domain_sep("ic-hashtree-leaf"), t3[1]));
    case NodeType.Labeled:
      return sha256(concatBytes(domain_sep("ic-hashtree-labeled"), t3[1], await reconstruct(t3[2])));
    case NodeType.Fork:
      return sha256(concatBytes(domain_sep("ic-hashtree-fork"), await reconstruct(t3[1]), await reconstruct(t3[2])));
    default:
      throw UNREACHABLE_ERROR;
  }
}
function domain_sep(s2) {
  const len = new Uint8Array([s2.length]);
  const str = new TextEncoder().encode(s2);
  return concatBytes(len, str);
}
function pathToLabel(path) {
  return typeof path[0] === "string" ? utf8ToBytes(path[0]) : path[0];
}
var LookupPathStatus;
(function(LookupPathStatus2) {
  LookupPathStatus2["Unknown"] = "Unknown";
  LookupPathStatus2["Absent"] = "Absent";
  LookupPathStatus2["Found"] = "Found";
  LookupPathStatus2["Error"] = "Error";
})(LookupPathStatus || (LookupPathStatus = {}));
var LookupSubtreeStatus;
(function(LookupSubtreeStatus2) {
  LookupSubtreeStatus2["Absent"] = "Absent";
  LookupSubtreeStatus2["Unknown"] = "Unknown";
  LookupSubtreeStatus2["Found"] = "Found";
})(LookupSubtreeStatus || (LookupSubtreeStatus = {}));
var LookupLabelStatus;
(function(LookupLabelStatus2) {
  LookupLabelStatus2["Absent"] = "Absent";
  LookupLabelStatus2["Unknown"] = "Unknown";
  LookupLabelStatus2["Found"] = "Found";
  LookupLabelStatus2["Less"] = "Less";
  LookupLabelStatus2["Greater"] = "Greater";
})(LookupLabelStatus || (LookupLabelStatus = {}));
function lookup_path(path, tree) {
  if (path.length === 0) {
    switch (tree[0]) {
      case NodeType.Empty: {
        return {
          status: LookupPathStatus.Absent
        };
      }
      case NodeType.Leaf: {
        if (!tree[1]) {
          throw UnknownError.fromCode(new HashTreeDecodeErrorCode("Invalid tree structure for leaf"));
        }
        if (tree[1] instanceof Uint8Array) {
          return {
            status: LookupPathStatus.Found,
            value: tree[1].slice(tree[1].byteOffset, tree[1].byteLength + tree[1].byteOffset)
          };
        }
        throw UNREACHABLE_ERROR;
      }
      case NodeType.Pruned: {
        return {
          status: LookupPathStatus.Unknown
        };
      }
      case NodeType.Labeled:
      case NodeType.Fork: {
        return {
          status: LookupPathStatus.Error
        };
      }
      default: {
        throw UNREACHABLE_ERROR;
      }
    }
  }
  const label = pathToLabel(path);
  const lookupResult = find_label(label, tree);
  switch (lookupResult.status) {
    case LookupLabelStatus.Found: {
      return lookup_path(path.slice(1), lookupResult.value);
    }
    case LookupLabelStatus.Absent:
    case LookupLabelStatus.Greater:
    case LookupLabelStatus.Less: {
      return {
        status: LookupPathStatus.Absent
      };
    }
    case LookupLabelStatus.Unknown: {
      return {
        status: LookupPathStatus.Unknown
      };
    }
    default: {
      throw UNREACHABLE_ERROR;
    }
  }
}
function lookup_subtree(path, tree) {
  if (path.length === 0) {
    return {
      status: LookupSubtreeStatus.Found,
      value: tree
    };
  }
  const label = pathToLabel(path);
  const lookupResult = find_label(label, tree);
  switch (lookupResult.status) {
    case LookupLabelStatus.Found: {
      return lookup_subtree(path.slice(1), lookupResult.value);
    }
    case LookupLabelStatus.Unknown: {
      return {
        status: LookupSubtreeStatus.Unknown
      };
    }
    case LookupLabelStatus.Absent:
    case LookupLabelStatus.Greater:
    case LookupLabelStatus.Less: {
      return {
        status: LookupSubtreeStatus.Absent
      };
    }
    default: {
      throw UNREACHABLE_ERROR;
    }
  }
}
function flatten_forks(t3) {
  switch (t3[0]) {
    case NodeType.Empty:
      return [];
    case NodeType.Fork:
      return flatten_forks(t3[1]).concat(flatten_forks(t3[2]));
    default:
      return [t3];
  }
}
function find_label(label, tree) {
  switch (tree[0]) {
    // if we have a labelled node, compare the node's label to the one we are
    // looking for
    case NodeType.Labeled:
      if (isBufferGreaterThan(label, tree[1])) {
        return {
          status: LookupLabelStatus.Greater
        };
      }
      if (uint8Equals(label, tree[1])) {
        return {
          status: LookupLabelStatus.Found,
          value: tree[2]
        };
      }
      return {
        status: LookupLabelStatus.Less
      };
    // if we have a fork node, we need to search both sides, starting with the left
    case NodeType.Fork: {
      const leftLookupResult = find_label(label, tree[1]);
      switch (leftLookupResult.status) {
        // if the label we're searching for is greater than the left node lookup,
        // we need to search the right node
        case LookupLabelStatus.Greater: {
          const rightLookupResult = find_label(label, tree[2]);
          if (rightLookupResult.status === LookupLabelStatus.Less) {
            return {
              status: LookupLabelStatus.Absent
            };
          }
          return rightLookupResult;
        }
        // if the left node returns an uncertain result, we need to search the
        // right node
        case LookupLabelStatus.Unknown: {
          const rightLookupResult = find_label(label, tree[2]);
          if (rightLookupResult.status === LookupLabelStatus.Less) {
            return {
              status: LookupLabelStatus.Unknown
            };
          }
          return rightLookupResult;
        }
        // if the label we're searching for is not greater than the left node
        // lookup, or the result is not uncertain, we stop searching and return
        // whatever the result of the left node lookup was, which can be either
        // Found or Absent
        default: {
          return leftLookupResult;
        }
      }
    }
    // if we encounter a Pruned node, we can't know for certain if the label
    // we're searching for is present or not
    case NodeType.Pruned:
      return {
        status: LookupLabelStatus.Unknown
      };
    // if the current node is Empty, or a Leaf, we can stop searching because
    // we know for sure that the label we're searching for is not present
    default:
      return {
        status: LookupLabelStatus.Absent
      };
  }
}
function check_canister_ranges(params) {
  const { canisterId: canisterId2, subnetId, tree } = params;
  const rangeLookup = lookup_path(["subnet", subnetId.toUint8Array(), "canister_ranges"], tree);
  if (rangeLookup.status !== LookupPathStatus.Found) {
    throw ProtocolError.fromCode(new LookupErrorCode(`Could not find canister ranges for subnet ${subnetId.toText()}`, rangeLookup.status));
  }
  if (!(rangeLookup.value instanceof Uint8Array)) {
    throw ProtocolError.fromCode(new MalformedLookupFoundValueErrorCode(`Could not find canister ranges for subnet ${subnetId.toText()}`));
  }
  const ranges_arr = decode(rangeLookup.value);
  const ranges = ranges_arr.map((v3) => [
    Principal$1.fromUint8Array(v3[0]),
    Principal$1.fromUint8Array(v3[1])
  ]);
  const canisterInRange = ranges.some((r2) => r2[0].ltEq(canisterId2) && r2[1].gtEq(canisterId2));
  return canisterInRange;
}
const request = async (options) => {
  const { agent, paths, disableCertificateTimeVerification = false } = options;
  const canisterId2 = Principal$1.from(options.canisterId);
  const uniquePaths = [...new Set(paths)];
  const status = /* @__PURE__ */ new Map();
  const promises = uniquePaths.map((path, index) => {
    const encodedPath = encodePath(path, canisterId2);
    return (async () => {
      try {
        if (agent.rootKey === null) {
          throw ExternalError.fromCode(new MissingRootKeyErrorCode());
        }
        const rootKey = agent.rootKey;
        const response = await agent.readState(canisterId2, {
          paths: [encodedPath]
        });
        const certificate = await Certificate.create({
          certificate: response.certificate,
          rootKey,
          canisterId: canisterId2,
          disableTimeVerification: disableCertificateTimeVerification,
          agent
        });
        const lookup = (cert, path3) => {
          if (path3 === "subnet") {
            const data2 = fetchNodeKeys(response.certificate, canisterId2, rootKey);
            return {
              path: path3,
              data: data2
            };
          } else {
            return {
              path: path3,
              data: lookupResultToBuffer(cert.lookup_path(encodedPath))
            };
          }
        };
        const { path: path2, data } = lookup(certificate, uniquePaths[index]);
        if (!data) {
          console.warn(`Expected to find result for path ${path2}, but instead found nothing.`);
          if (typeof path2 === "string") {
            status.set(path2, null);
          } else {
            status.set(path2.key, null);
          }
        } else {
          switch (path2) {
            case "time": {
              status.set(path2, decodeTime(data));
              break;
            }
            case "controllers": {
              status.set(path2, decodeControllers(data));
              break;
            }
            case "module_hash": {
              status.set(path2, bytesToHex(data));
              break;
            }
            case "subnet": {
              status.set(path2, data);
              break;
            }
            case "candid": {
              status.set(path2, new TextDecoder().decode(data));
              break;
            }
            default: {
              if (typeof path2 !== "string" && "key" in path2 && "path" in path2) {
                switch (path2.decodeStrategy) {
                  case "raw":
                    status.set(path2.key, data);
                    break;
                  case "leb128": {
                    status.set(path2.key, decodeLeb128(data));
                    break;
                  }
                  case "cbor": {
                    status.set(path2.key, decode(data));
                    break;
                  }
                  case "hex": {
                    status.set(path2.key, bytesToHex(data));
                    break;
                  }
                  case "utf-8": {
                    status.set(path2.key, new TextDecoder().decode(data));
                  }
                }
              }
            }
          }
        }
      } catch (error) {
        if (error instanceof AgentError && (error.hasCode(CertificateVerificationErrorCode) || error.hasCode(CertificateTimeErrorCode))) {
          throw error;
        }
        if (typeof path !== "string" && "key" in path && "path" in path) {
          status.set(path.key, null);
        } else {
          status.set(path, null);
        }
        console.group();
        console.warn(`Expected to find result for path ${path}, but instead found nothing.`);
        console.warn(error);
        console.groupEnd();
      }
    })();
  });
  await Promise.all(promises);
  return status;
};
const fetchNodeKeys = (certificate, canisterId2, root_key) => {
  if (!canisterId2._isPrincipal) {
    throw InputError.fromCode(new UnexpectedErrorCode("Invalid canisterId"));
  }
  const cert = decode(certificate);
  const tree = cert.tree;
  let delegation = cert.delegation;
  let subnetId;
  if (delegation && delegation.subnet_id) {
    subnetId = Principal$1.fromUint8Array(new Uint8Array(delegation.subnet_id));
  } else if (!delegation && typeof root_key !== "undefined") {
    subnetId = Principal$1.selfAuthenticating(new Uint8Array(root_key));
    delegation = {
      subnet_id: subnetId.toUint8Array(),
      certificate: new Uint8Array(0)
    };
  } else {
    subnetId = Principal$1.selfAuthenticating(Principal$1.fromText("tdb26-jop6k-aogll-7ltgs-eruif-6kk7m-qpktf-gdiqx-mxtrf-vb5e6-eqe").toUint8Array());
    delegation = {
      subnet_id: subnetId.toUint8Array(),
      certificate: new Uint8Array(0)
    };
  }
  const canisterInRange = check_canister_ranges({ canisterId: canisterId2, subnetId, tree });
  if (!canisterInRange) {
    throw TrustError.fromCode(new CertificateNotAuthorizedErrorCode(canisterId2, subnetId));
  }
  const subnetLookupResult = lookup_subtree(["subnet", delegation.subnet_id, "node"], tree);
  if (subnetLookupResult.status !== LookupSubtreeStatus.Found) {
    throw ProtocolError.fromCode(new LookupErrorCode("Node not found", subnetLookupResult.status));
  }
  if (subnetLookupResult.value instanceof Uint8Array) {
    throw UnknownError.fromCode(new HashTreeDecodeErrorCode("Invalid node tree"));
  }
  const nodeForks = flatten_forks(subnetLookupResult.value);
  const nodeKeys = /* @__PURE__ */ new Map();
  nodeForks.forEach((fork) => {
    const node_id = Principal$1.from(fork[1]).toText();
    const publicKeyLookupResult = lookup_path(["public_key"], fork[2]);
    if (publicKeyLookupResult.status !== LookupPathStatus.Found) {
      throw ProtocolError.fromCode(new LookupErrorCode("Public key not found", publicKeyLookupResult.status));
    }
    const derEncodedPublicKey = publicKeyLookupResult.value;
    if (derEncodedPublicKey.byteLength !== 44) {
      throw ProtocolError.fromCode(new DerKeyLengthMismatchErrorCode(44, derEncodedPublicKey.byteLength));
    } else {
      nodeKeys.set(node_id, derEncodedPublicKey);
    }
  });
  return {
    subnetId: Principal$1.fromUint8Array(new Uint8Array(delegation.subnet_id)).toText(),
    nodeKeys
  };
};
const encodePath = (path, canisterId2) => {
  const canisterUint8Array = canisterId2.toUint8Array();
  switch (path) {
    case "time":
      return [utf8ToBytes("time")];
    case "controllers":
      return [utf8ToBytes("canister"), canisterUint8Array, utf8ToBytes("controllers")];
    case "module_hash":
      return [utf8ToBytes("canister"), canisterUint8Array, utf8ToBytes("module_hash")];
    case "subnet":
      return [utf8ToBytes("subnet")];
    case "candid":
      return [
        utf8ToBytes("canister"),
        canisterUint8Array,
        utf8ToBytes("metadata"),
        utf8ToBytes("candid:service")
      ];
    default: {
      if ("key" in path && "path" in path) {
        if (typeof path["path"] === "string" || path["path"] instanceof Uint8Array) {
          const metaPath = path.path;
          const encoded = typeof metaPath === "string" ? utf8ToBytes(metaPath) : metaPath;
          return [utf8ToBytes("canister"), canisterUint8Array, utf8ToBytes("metadata"), encoded];
        } else {
          return path["path"];
        }
      }
    }
  }
  throw UnknownError.fromCode(new UnexpectedErrorCode(`Error while encoding your path for canister status. Please ensure that your path ${path} was formatted correctly.`));
};
const decodeControllers = (buf) => {
  const controllersRaw = decode(buf);
  return controllersRaw.map((buf2) => {
    return Principal$1.fromUint8Array(buf2);
  });
};
/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
const _0n = BigInt(0), _1n$1 = BigInt(1), _2n$1 = BigInt(2), _8n$1 = BigInt(8);
function isEdValidXY(Fp3, CURVE, x3, y2) {
  const x22 = Fp3.sqr(x3);
  const y22 = Fp3.sqr(y2);
  const left = Fp3.add(Fp3.mul(CURVE.a, x22), y22);
  const right = Fp3.add(Fp3.ONE, Fp3.mul(CURVE.d, Fp3.mul(x22, y22)));
  return Fp3.eql(left, right);
}
function edwards(params, extraOpts = {}) {
  const validated = _createCurveFields("edwards", params, extraOpts, extraOpts.FpFnLE);
  const { Fp: Fp3, Fn } = validated;
  let CURVE = validated.CURVE;
  const { h: cofactor } = CURVE;
  _validateObject(extraOpts, {}, { uvRatio: "function" });
  const MASK = _2n$1 << BigInt(Fn.BYTES * 8) - _1n$1;
  const modP = (n2) => Fp3.create(n2);
  const uvRatio2 = extraOpts.uvRatio || ((u2, v3) => {
    try {
      return { isValid: true, value: Fp3.sqrt(Fp3.div(u2, v3)) };
    } catch (e5) {
      return { isValid: false, value: _0n };
    }
  });
  if (!isEdValidXY(Fp3, CURVE, CURVE.Gx, CURVE.Gy))
    throw new Error("bad curve params: generator point");
  function acoord(title, n2, banZero = false) {
    const min = banZero ? _1n$1 : _0n;
    aInRange("coordinate " + title, n2, min, MASK);
    return n2;
  }
  function aextpoint(other) {
    if (!(other instanceof Point))
      throw new Error("ExtendedPoint expected");
  }
  const toAffineMemo = memoized((p2, iz) => {
    const { X: X2, Y: Y2, Z: Z2 } = p2;
    const is0 = p2.is0();
    if (iz == null)
      iz = is0 ? _8n$1 : Fp3.inv(Z2);
    const x3 = modP(X2 * iz);
    const y2 = modP(Y2 * iz);
    const zz = Fp3.mul(Z2, iz);
    if (is0)
      return { x: _0n, y: _1n$1 };
    if (zz !== _1n$1)
      throw new Error("invZ was invalid");
    return { x: x3, y: y2 };
  });
  const assertValidMemo = memoized((p2) => {
    const { a: a2, d: d2 } = CURVE;
    if (p2.is0())
      throw new Error("bad point: ZERO");
    const { X: X2, Y: Y2, Z: Z2, T: T2 } = p2;
    const X22 = modP(X2 * X2);
    const Y22 = modP(Y2 * Y2);
    const Z22 = modP(Z2 * Z2);
    const Z4 = modP(Z22 * Z22);
    const aX2 = modP(X22 * a2);
    const left = modP(Z22 * modP(aX2 + Y22));
    const right = modP(Z4 + modP(d2 * modP(X22 * Y22)));
    if (left !== right)
      throw new Error("bad point: equation left != right (1)");
    const XY = modP(X2 * Y2);
    const ZT = modP(Z2 * T2);
    if (XY !== ZT)
      throw new Error("bad point: equation left != right (2)");
    return true;
  });
  class Point {
    constructor(X2, Y2, Z2, T2) {
      this.X = acoord("x", X2);
      this.Y = acoord("y", Y2);
      this.Z = acoord("z", Z2, true);
      this.T = acoord("t", T2);
      Object.freeze(this);
    }
    static CURVE() {
      return CURVE;
    }
    static fromAffine(p2) {
      if (p2 instanceof Point)
        throw new Error("extended point not allowed");
      const { x: x3, y: y2 } = p2 || {};
      acoord("x", x3);
      acoord("y", y2);
      return new Point(x3, y2, _1n$1, modP(x3 * y2));
    }
    // Uses algo from RFC8032 5.1.3.
    static fromBytes(bytes, zip215 = false) {
      const len = Fp3.BYTES;
      const { a: a2, d: d2 } = CURVE;
      bytes = copyBytes(_abytes2(bytes, len, "point"));
      _abool2(zip215, "zip215");
      const normed = copyBytes(bytes);
      const lastByte = bytes[len - 1];
      normed[len - 1] = lastByte & -129;
      const y2 = bytesToNumberLE(normed);
      const max = zip215 ? MASK : Fp3.ORDER;
      aInRange("point.y", y2, _0n, max);
      const y22 = modP(y2 * y2);
      const u2 = modP(y22 - _1n$1);
      const v3 = modP(d2 * y22 - a2);
      let { isValid, value: x3 } = uvRatio2(u2, v3);
      if (!isValid)
        throw new Error("bad point: invalid y coordinate");
      const isXOdd = (x3 & _1n$1) === _1n$1;
      const isLastByteOdd = (lastByte & 128) !== 0;
      if (!zip215 && x3 === _0n && isLastByteOdd)
        throw new Error("bad point: x=0 and x_0=1");
      if (isLastByteOdd !== isXOdd)
        x3 = modP(-x3);
      return Point.fromAffine({ x: x3, y: y2 });
    }
    static fromHex(bytes, zip215 = false) {
      return Point.fromBytes(ensureBytes("point", bytes), zip215);
    }
    get x() {
      return this.toAffine().x;
    }
    get y() {
      return this.toAffine().y;
    }
    precompute(windowSize = 8, isLazy = true) {
      wnaf.createCache(this, windowSize);
      if (!isLazy)
        this.multiply(_2n$1);
      return this;
    }
    // Useful in fromAffine() - not for fromBytes(), which always created valid points.
    assertValidity() {
      assertValidMemo(this);
    }
    // Compare one point to another.
    equals(other) {
      aextpoint(other);
      const { X: X1, Y: Y1, Z: Z1 } = this;
      const { X: X2, Y: Y2, Z: Z2 } = other;
      const X1Z2 = modP(X1 * Z2);
      const X2Z1 = modP(X2 * Z1);
      const Y1Z2 = modP(Y1 * Z2);
      const Y2Z1 = modP(Y2 * Z1);
      return X1Z2 === X2Z1 && Y1Z2 === Y2Z1;
    }
    is0() {
      return this.equals(Point.ZERO);
    }
    negate() {
      return new Point(modP(-this.X), this.Y, this.Z, modP(-this.T));
    }
    // Fast algo for doubling Extended Point.
    // https://hyperelliptic.org/EFD/g1p/auto-twisted-extended.html#doubling-dbl-2008-hwcd
    // Cost: 4M + 4S + 1*a + 6add + 1*2.
    double() {
      const { a: a2 } = CURVE;
      const { X: X1, Y: Y1, Z: Z1 } = this;
      const A4 = modP(X1 * X1);
      const B3 = modP(Y1 * Y1);
      const C2 = modP(_2n$1 * modP(Z1 * Z1));
      const D2 = modP(a2 * A4);
      const x1y1 = X1 + Y1;
      const E2 = modP(modP(x1y1 * x1y1) - A4 - B3);
      const G2 = D2 + B3;
      const F2 = G2 - C2;
      const H2 = D2 - B3;
      const X3 = modP(E2 * F2);
      const Y3 = modP(G2 * H2);
      const T3 = modP(E2 * H2);
      const Z3 = modP(F2 * G2);
      return new Point(X3, Y3, Z3, T3);
    }
    // Fast algo for adding 2 Extended Points.
    // https://hyperelliptic.org/EFD/g1p/auto-twisted-extended.html#addition-add-2008-hwcd
    // Cost: 9M + 1*a + 1*d + 7add.
    add(other) {
      aextpoint(other);
      const { a: a2, d: d2 } = CURVE;
      const { X: X1, Y: Y1, Z: Z1, T: T1 } = this;
      const { X: X2, Y: Y2, Z: Z2, T: T2 } = other;
      const A4 = modP(X1 * X2);
      const B3 = modP(Y1 * Y2);
      const C2 = modP(T1 * d2 * T2);
      const D2 = modP(Z1 * Z2);
      const E2 = modP((X1 + Y1) * (X2 + Y2) - A4 - B3);
      const F2 = D2 - C2;
      const G2 = D2 + C2;
      const H2 = modP(B3 - a2 * A4);
      const X3 = modP(E2 * F2);
      const Y3 = modP(G2 * H2);
      const T3 = modP(E2 * H2);
      const Z3 = modP(F2 * G2);
      return new Point(X3, Y3, Z3, T3);
    }
    subtract(other) {
      return this.add(other.negate());
    }
    // Constant-time multiplication.
    multiply(scalar) {
      if (!Fn.isValidNot0(scalar))
        throw new Error("invalid scalar: expected 1 <= sc < curve.n");
      const { p: p2, f: f2 } = wnaf.cached(this, scalar, (p3) => normalizeZ(Point, p3));
      return normalizeZ(Point, [p2, f2])[0];
    }
    // Non-constant-time multiplication. Uses double-and-add algorithm.
    // It's faster, but should only be used when you don't care about
    // an exposed private key e.g. sig verification.
    // Does NOT allow scalars higher than CURVE.n.
    // Accepts optional accumulator to merge with multiply (important for sparse scalars)
    multiplyUnsafe(scalar, acc = Point.ZERO) {
      if (!Fn.isValid(scalar))
        throw new Error("invalid scalar: expected 0 <= sc < curve.n");
      if (scalar === _0n)
        return Point.ZERO;
      if (this.is0() || scalar === _1n$1)
        return this;
      return wnaf.unsafe(this, scalar, (p2) => normalizeZ(Point, p2), acc);
    }
    // Checks if point is of small order.
    // If you add something to small order point, you will have "dirty"
    // point with torsion component.
    // Multiplies point by cofactor and checks if the result is 0.
    isSmallOrder() {
      return this.multiplyUnsafe(cofactor).is0();
    }
    // Multiplies point by curve order and checks if the result is 0.
    // Returns `false` is the point is dirty.
    isTorsionFree() {
      return wnaf.unsafe(this, CURVE.n).is0();
    }
    // Converts Extended point to default (x, y) coordinates.
    // Can accept precomputed Z^-1 - for example, from invertBatch.
    toAffine(invertedZ) {
      return toAffineMemo(this, invertedZ);
    }
    clearCofactor() {
      if (cofactor === _1n$1)
        return this;
      return this.multiplyUnsafe(cofactor);
    }
    toBytes() {
      const { x: x3, y: y2 } = this.toAffine();
      const bytes = Fp3.toBytes(y2);
      bytes[bytes.length - 1] |= x3 & _1n$1 ? 128 : 0;
      return bytes;
    }
    toHex() {
      return bytesToHex(this.toBytes());
    }
    toString() {
      return `<Point ${this.is0() ? "ZERO" : this.toHex()}>`;
    }
    // TODO: remove
    get ex() {
      return this.X;
    }
    get ey() {
      return this.Y;
    }
    get ez() {
      return this.Z;
    }
    get et() {
      return this.T;
    }
    static normalizeZ(points) {
      return normalizeZ(Point, points);
    }
    static msm(points, scalars) {
      return pippenger(Point, Fn, points, scalars);
    }
    _setWindowSize(windowSize) {
      this.precompute(windowSize);
    }
    toRawBytes() {
      return this.toBytes();
    }
  }
  Point.BASE = new Point(CURVE.Gx, CURVE.Gy, _1n$1, modP(CURVE.Gx * CURVE.Gy));
  Point.ZERO = new Point(_0n, _1n$1, _1n$1, _0n);
  Point.Fp = Fp3;
  Point.Fn = Fn;
  const wnaf = new wNAF(Point, Fn.BITS);
  Point.BASE.precompute(8);
  return Point;
}
function eddsa(Point, cHash, eddsaOpts = {}) {
  if (typeof cHash !== "function")
    throw new Error('"hash" function param is required');
  _validateObject(eddsaOpts, {}, {
    adjustScalarBytes: "function",
    randomBytes: "function",
    domain: "function",
    prehash: "function",
    mapToCurve: "function"
  });
  const { prehash } = eddsaOpts;
  const { BASE, Fp: Fp3, Fn } = Point;
  const randomBytes$1 = eddsaOpts.randomBytes || randomBytes;
  const adjustScalarBytes2 = eddsaOpts.adjustScalarBytes || ((bytes) => bytes);
  const domain = eddsaOpts.domain || ((data, ctx, phflag) => {
    _abool2(phflag, "phflag");
    if (ctx.length || phflag)
      throw new Error("Contexts/pre-hash are not supported");
    return data;
  });
  function modN_LE(hash) {
    return Fn.create(bytesToNumberLE(hash));
  }
  function getPrivateScalar(key) {
    const len = lengths.secretKey;
    key = ensureBytes("private key", key, len);
    const hashed = ensureBytes("hashed private key", cHash(key), 2 * len);
    const head = adjustScalarBytes2(hashed.slice(0, len));
    const prefix = hashed.slice(len, 2 * len);
    const scalar = modN_LE(head);
    return { head, prefix, scalar };
  }
  function getExtendedPublicKey(secretKey) {
    const { head, prefix, scalar } = getPrivateScalar(secretKey);
    const point = BASE.multiply(scalar);
    const pointBytes = point.toBytes();
    return { head, prefix, scalar, point, pointBytes };
  }
  function getPublicKey(secretKey) {
    return getExtendedPublicKey(secretKey).pointBytes;
  }
  function hashDomainToScalar(context = Uint8Array.of(), ...msgs) {
    const msg = concatBytes(...msgs);
    return modN_LE(cHash(domain(msg, ensureBytes("context", context), !!prehash)));
  }
  function sign(msg, secretKey, options = {}) {
    msg = ensureBytes("message", msg);
    if (prehash)
      msg = prehash(msg);
    const { prefix, scalar, pointBytes } = getExtendedPublicKey(secretKey);
    const r2 = hashDomainToScalar(options.context, prefix, msg);
    const R2 = BASE.multiply(r2).toBytes();
    const k2 = hashDomainToScalar(options.context, R2, pointBytes, msg);
    const s2 = Fn.create(r2 + k2 * scalar);
    if (!Fn.isValid(s2))
      throw new Error("sign failed: invalid s");
    const rs = concatBytes(R2, Fn.toBytes(s2));
    return _abytes2(rs, lengths.signature, "result");
  }
  const verifyOpts = { zip215: true };
  function verify(sig, msg, publicKey, options = verifyOpts) {
    const { context, zip215 } = options;
    const len = lengths.signature;
    sig = ensureBytes("signature", sig, len);
    msg = ensureBytes("message", msg);
    publicKey = ensureBytes("publicKey", publicKey, lengths.publicKey);
    if (zip215 !== void 0)
      _abool2(zip215, "zip215");
    if (prehash)
      msg = prehash(msg);
    const mid = len / 2;
    const r2 = sig.subarray(0, mid);
    const s2 = bytesToNumberLE(sig.subarray(mid, len));
    let A4, R2, SB;
    try {
      A4 = Point.fromBytes(publicKey, zip215);
      R2 = Point.fromBytes(r2, zip215);
      SB = BASE.multiplyUnsafe(s2);
    } catch (error) {
      return false;
    }
    if (!zip215 && A4.isSmallOrder())
      return false;
    const k2 = hashDomainToScalar(context, R2.toBytes(), A4.toBytes(), msg);
    const RkA = R2.add(A4.multiplyUnsafe(k2));
    return RkA.subtract(SB).clearCofactor().is0();
  }
  const _size = Fp3.BYTES;
  const lengths = {
    secretKey: _size,
    publicKey: _size,
    signature: 2 * _size,
    seed: _size
  };
  function randomSecretKey(seed = randomBytes$1(lengths.seed)) {
    return _abytes2(seed, lengths.seed, "seed");
  }
  function keygen(seed) {
    const secretKey = utils.randomSecretKey(seed);
    return { secretKey, publicKey: getPublicKey(secretKey) };
  }
  function isValidSecretKey(key) {
    return isBytes(key) && key.length === Fn.BYTES;
  }
  function isValidPublicKey(key, zip215) {
    try {
      return !!Point.fromBytes(key, zip215);
    } catch (error) {
      return false;
    }
  }
  const utils = {
    getExtendedPublicKey,
    randomSecretKey,
    isValidSecretKey,
    isValidPublicKey,
    /**
     * Converts ed public key to x public key. Uses formula:
     * - ed25519:
     *   - `(u, v) = ((1+y)/(1-y), sqrt(-486664)*u/x)`
     *   - `(x, y) = (sqrt(-486664)*u/v, (u-1)/(u+1))`
     * - ed448:
     *   - `(u, v) = ((y-1)/(y+1), sqrt(156324)*u/x)`
     *   - `(x, y) = (sqrt(156324)*u/v, (1+u)/(1-u))`
     */
    toMontgomery(publicKey) {
      const { y: y2 } = Point.fromBytes(publicKey);
      const size = lengths.publicKey;
      const is25519 = size === 32;
      if (!is25519 && size !== 57)
        throw new Error("only defined for 25519 and 448");
      const u2 = is25519 ? Fp3.div(_1n$1 + y2, _1n$1 - y2) : Fp3.div(y2 - _1n$1, y2 + _1n$1);
      return Fp3.toBytes(u2);
    },
    toMontgomerySecret(secretKey) {
      const size = lengths.secretKey;
      _abytes2(secretKey, size);
      const hashed = cHash(secretKey.subarray(0, size));
      return adjustScalarBytes2(hashed).subarray(0, size);
    },
    /** @deprecated */
    randomPrivateKey: randomSecretKey,
    /** @deprecated */
    precompute(windowSize = 8, point = Point.BASE) {
      return point.precompute(windowSize, false);
    }
  };
  return Object.freeze({
    keygen,
    getPublicKey,
    sign,
    verify,
    utils,
    Point,
    lengths
  });
}
function _eddsa_legacy_opts_to_new(c2) {
  const CURVE = {
    a: c2.a,
    d: c2.d,
    p: c2.Fp.ORDER,
    n: c2.n,
    h: c2.h,
    Gx: c2.Gx,
    Gy: c2.Gy
  };
  const Fp3 = c2.Fp;
  const Fn = Field(CURVE.n, c2.nBitLength, true);
  const curveOpts = { Fp: Fp3, Fn, uvRatio: c2.uvRatio };
  const eddsaOpts = {
    randomBytes: c2.randomBytes,
    adjustScalarBytes: c2.adjustScalarBytes,
    domain: c2.domain,
    prehash: c2.prehash,
    mapToCurve: c2.mapToCurve
  };
  return { CURVE, curveOpts, hash: c2.hash, eddsaOpts };
}
function _eddsa_new_output_to_legacy(c2, eddsa2) {
  const Point = eddsa2.Point;
  const legacy = Object.assign({}, eddsa2, {
    ExtendedPoint: Point,
    CURVE: c2,
    nBitLength: Point.Fn.BITS,
    nByteLength: Point.Fn.BYTES
  });
  return legacy;
}
function twistedEdwards(c2) {
  const { CURVE, curveOpts, hash, eddsaOpts } = _eddsa_legacy_opts_to_new(c2);
  const Point = edwards(CURVE, curveOpts);
  const EDDSA = eddsa(Point, hash, eddsaOpts);
  return _eddsa_new_output_to_legacy(c2, EDDSA);
}
/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
const _1n = BigInt(1), _2n = BigInt(2);
BigInt(3);
const _5n = BigInt(5), _8n = BigInt(8);
const ed25519_CURVE_p = BigInt("0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffed");
const ed25519_CURVE = /* @__PURE__ */ (() => ({
  p: ed25519_CURVE_p,
  n: BigInt("0x1000000000000000000000000000000014def9dea2f79cd65812631a5cf5d3ed"),
  h: _8n,
  a: BigInt("0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffec"),
  d: BigInt("0x52036cee2b6ffe738cc740797779e89800700a4d4141d8ab75eb4dca135978a3"),
  Gx: BigInt("0x216936d3cd6e53fec0a4e231fdd6dc5c692cc7609525a7b2c9562d608f25d51a"),
  Gy: BigInt("0x6666666666666666666666666666666666666666666666666666666666666658")
}))();
function ed25519_pow_2_252_3(x3) {
  const _10n = BigInt(10), _20n = BigInt(20), _40n = BigInt(40), _80n = BigInt(80);
  const P2 = ed25519_CURVE_p;
  const x22 = x3 * x3 % P2;
  const b2 = x22 * x3 % P2;
  const b4 = pow2(b2, _2n, P2) * b2 % P2;
  const b5 = pow2(b4, _1n, P2) * x3 % P2;
  const b10 = pow2(b5, _5n, P2) * b5 % P2;
  const b20 = pow2(b10, _10n, P2) * b10 % P2;
  const b40 = pow2(b20, _20n, P2) * b20 % P2;
  const b80 = pow2(b40, _40n, P2) * b40 % P2;
  const b160 = pow2(b80, _80n, P2) * b80 % P2;
  const b240 = pow2(b160, _80n, P2) * b80 % P2;
  const b250 = pow2(b240, _10n, P2) * b10 % P2;
  const pow_p_5_8 = pow2(b250, _2n, P2) * x3 % P2;
  return { pow_p_5_8, b2 };
}
function adjustScalarBytes(bytes) {
  bytes[0] &= 248;
  bytes[31] &= 127;
  bytes[31] |= 64;
  return bytes;
}
const ED25519_SQRT_M1 = /* @__PURE__ */ BigInt("19681161376707505956807079304988542015446066515923890162744021073123829784752");
function uvRatio(u2, v3) {
  const P2 = ed25519_CURVE_p;
  const v32 = mod(v3 * v3 * v3, P2);
  const v7 = mod(v32 * v32 * v3, P2);
  const pow = ed25519_pow_2_252_3(u2 * v7).pow_p_5_8;
  let x3 = mod(u2 * v32 * pow, P2);
  const vx2 = mod(v3 * x3 * x3, P2);
  const root1 = x3;
  const root2 = mod(x3 * ED25519_SQRT_M1, P2);
  const useRoot1 = vx2 === u2;
  const useRoot2 = vx2 === mod(-u2, P2);
  const noRoot = vx2 === mod(-u2 * ED25519_SQRT_M1, P2);
  if (useRoot1)
    x3 = root1;
  if (useRoot2 || noRoot)
    x3 = root2;
  if (isNegativeLE(x3, P2))
    x3 = mod(-x3, P2);
  return { isValid: useRoot1 || useRoot2, value: x3 };
}
const Fp = /* @__PURE__ */ (() => Field(ed25519_CURVE.p, { isLE: true }))();
const ed25519Defaults = /* @__PURE__ */ (() => ({
  ...ed25519_CURVE,
  Fp,
  hash: sha512,
  adjustScalarBytes,
  // dom2
  // Ratio of u to v. Allows us to combine inversion and square root. Uses algo from RFC8032 5.1.3.
  // Constant-time, u/√v
  uvRatio
}))();
const ed25519 = /* @__PURE__ */ (() => twistedEdwards(ed25519Defaults))();
var _a, _b;
class ExpirableMap {
  /**
   * Create a new ExpirableMap.
   * @param {ExpirableMapOptions<any, any>} options - options for the map.
   * @param {Iterable<[any, any]>} options.source - an optional source of entries to initialize the map with.
   * @param {number} options.expirationTime - the time in milliseconds after which entries will expire.
   */
  constructor(options = {}) {
    // Internals
    __privateAdd(this, _inner);
    __privateAdd(this, _expirationTime);
    this[_a] = this.entries.bind(this);
    this[_b] = "ExpirableMap";
    const { source = [], expirationTime = 10 * 60 * 1e3 } = options;
    const currentTime = Date.now();
    __privateSet(this, _inner, new Map([...source].map(([key, value]) => [key, { value, timestamp: currentTime }])));
    __privateSet(this, _expirationTime, expirationTime);
  }
  /**
   * Prune removes all expired entries.
   */
  prune() {
    const currentTime = Date.now();
    for (const [key, entry] of __privateGet(this, _inner).entries()) {
      if (currentTime - entry.timestamp > __privateGet(this, _expirationTime)) {
        __privateGet(this, _inner).delete(key);
      }
    }
    return this;
  }
  // Implementing the Map interface
  /**
   * Set the value for the given key. Prunes expired entries.
   * @param key for the entry
   * @param value of the entry
   * @returns this
   */
  set(key, value) {
    this.prune();
    const entry = {
      value,
      timestamp: Date.now()
    };
    __privateGet(this, _inner).set(key, entry);
    return this;
  }
  /**
   * Get the value associated with the key, if it exists and has not expired.
   * @param key K
   * @returns the value associated with the key, or undefined if the key is not present or has expired.
   */
  get(key) {
    const entry = __privateGet(this, _inner).get(key);
    if (entry === void 0) {
      return void 0;
    }
    if (Date.now() - entry.timestamp > __privateGet(this, _expirationTime)) {
      __privateGet(this, _inner).delete(key);
      return void 0;
    }
    return entry.value;
  }
  /**
   * Clear all entries.
   */
  clear() {
    __privateGet(this, _inner).clear();
  }
  /**
   * Entries returns the entries of the map, without the expiration time.
   * @returns an iterator over the entries of the map.
   */
  entries() {
    const iterator = __privateGet(this, _inner).entries();
    const generator = function* () {
      for (const [key, value] of iterator) {
        yield [key, value.value];
      }
      return void 0;
    };
    return generator();
  }
  /**
   * Values returns the values of the map, without the expiration time.
   * @returns an iterator over the values of the map.
   */
  values() {
    const iterator = __privateGet(this, _inner).values();
    const generator = function* () {
      for (const value of iterator) {
        yield value.value;
      }
      return void 0;
    };
    return generator();
  }
  /**
   * Keys returns the keys of the map
   * @returns an iterator over the keys of the map.
   */
  keys() {
    return __privateGet(this, _inner).keys();
  }
  /**
   * forEach calls the callbackfn on each entry of the map.
   * @param callbackfn to call on each entry
   * @param thisArg to use as this when calling the callbackfn
   */
  forEach(callbackfn, thisArg) {
    for (const [key, value] of __privateGet(this, _inner).entries()) {
      callbackfn.call(thisArg, value.value, key, this);
    }
  }
  /**
   * has returns true if the key exists and has not expired.
   * @param key K
   * @returns true if the key exists and has not expired.
   */
  has(key) {
    return __privateGet(this, _inner).has(key);
  }
  /**
   * delete the entry for the given key.
   * @param key K
   * @returns true if the key existed and has been deleted.
   */
  delete(key) {
    return __privateGet(this, _inner).delete(key);
  }
  /**
   * get size of the map.
   * @returns the size of the map.
   */
  get size() {
    return __privateGet(this, _inner).size;
  }
}
_inner = new WeakMap();
_expirationTime = new WeakMap();
_a = Symbol.iterator, _b = Symbol.toStringTag;
const encodeLenBytes = (len) => {
  if (len <= 127) {
    return 1;
  } else if (len <= 255) {
    return 2;
  } else if (len <= 65535) {
    return 3;
  } else if (len <= 16777215) {
    return 4;
  } else {
    throw InputError.fromCode(new DerEncodeErrorCode("Length too long (> 4 bytes)"));
  }
};
const encodeLen = (buf, offset, len) => {
  if (len <= 127) {
    buf[offset] = len;
    return 1;
  } else if (len <= 255) {
    buf[offset] = 129;
    buf[offset + 1] = len;
    return 2;
  } else if (len <= 65535) {
    buf[offset] = 130;
    buf[offset + 1] = len >> 8;
    buf[offset + 2] = len;
    return 3;
  } else if (len <= 16777215) {
    buf[offset] = 131;
    buf[offset + 1] = len >> 16;
    buf[offset + 2] = len >> 8;
    buf[offset + 3] = len;
    return 4;
  } else {
    throw InputError.fromCode(new DerEncodeErrorCode("Length too long (> 4 bytes)"));
  }
};
const decodeLenBytes = (buf, offset) => {
  if (buf[offset] < 128)
    return 1;
  if (buf[offset] === 128)
    throw InputError.fromCode(new DerDecodeErrorCode("Invalid length 0"));
  if (buf[offset] === 129)
    return 2;
  if (buf[offset] === 130)
    return 3;
  if (buf[offset] === 131)
    return 4;
  throw InputError.fromCode(new DerDecodeErrorCode("Length too long (> 4 bytes)"));
};
const decodeLen = (buf, offset) => {
  const lenBytes = decodeLenBytes(buf, offset);
  if (lenBytes === 1)
    return buf[offset];
  else if (lenBytes === 2)
    return buf[offset + 1];
  else if (lenBytes === 3)
    return (buf[offset + 1] << 8) + buf[offset + 2];
  else if (lenBytes === 4)
    return (buf[offset + 1] << 16) + (buf[offset + 2] << 8) + buf[offset + 3];
  throw InputError.fromCode(new DerDecodeErrorCode("Length too long (> 4 bytes)"));
};
Uint8Array.from([
  ...[48, 12],
  // SEQUENCE
  ...[6, 10],
  // OID with 10 bytes
  ...[43, 6, 1, 4, 1, 131, 184, 67, 1, 1]
  // DER encoded COSE
]);
const ED25519_OID = Uint8Array.from([
  ...[48, 5],
  // SEQUENCE
  ...[6, 3],
  // OID with 3 bytes
  ...[43, 101, 112]
  // id-Ed25519 OID
]);
Uint8Array.from([
  ...[48, 16],
  // SEQUENCE
  ...[6, 7],
  // OID with 7 bytes
  ...[42, 134, 72, 206, 61, 2, 1],
  // OID ECDSA
  ...[6, 5],
  // OID with 5 bytes
  ...[43, 129, 4, 0, 10]
  // OID secp256k1
]);
Uint8Array.from([
  ...[48, 29],
  // SEQUENCE, length 29 bytes
  // Algorithm OID
  ...[6, 13],
  ...[43, 6, 1, 4, 1, 130, 220, 124, 5, 3, 1, 2, 1],
  // Curve OID
  ...[6, 12],
  ...[43, 6, 1, 4, 1, 130, 220, 124, 5, 3, 2, 1]
]);
function wrapDER(payload, oid) {
  const bitStringHeaderLength = 2 + encodeLenBytes(payload.byteLength + 1);
  const len = oid.byteLength + bitStringHeaderLength + payload.byteLength;
  let offset = 0;
  const buf = new Uint8Array(1 + encodeLenBytes(len) + len);
  buf[offset++] = 48;
  offset += encodeLen(buf, offset, len);
  buf.set(oid, offset);
  offset += oid.byteLength;
  buf[offset++] = 3;
  offset += encodeLen(buf, offset, payload.byteLength + 1);
  buf[offset++] = 0;
  buf.set(new Uint8Array(payload), offset);
  return buf;
}
const unwrapDER = (derEncoded, oid) => {
  let offset = 0;
  const expect = (n2, msg) => {
    if (buf[offset++] !== n2) {
      throw InputError.fromCode(new DerDecodeErrorCode(`Expected ${msg} at offset ${offset}`));
    }
  };
  const buf = new Uint8Array(derEncoded);
  expect(48, "sequence");
  offset += decodeLenBytes(buf, offset);
  if (!uint8Equals(buf.slice(offset, offset + oid.byteLength), oid)) {
    throw InputError.fromCode(new DerDecodeErrorCode("Not the expected OID."));
  }
  offset += oid.byteLength;
  expect(3, "bit string");
  const payloadLen = decodeLen(buf, offset) - 1;
  offset += decodeLenBytes(buf, offset);
  expect(0, "0 padding");
  const result = buf.slice(offset);
  if (payloadLen !== result.length) {
    throw InputError.fromCode(new DerDecodeLengthMismatchErrorCode(payloadLen, result.length));
  }
  return result;
};
let Ed25519PublicKey$1 = (_a2 = class {
  // `fromRaw` and `fromDer` should be used for instantiation, not this constructor.
  constructor(key) {
    __privateAdd(this, _rawKey);
    __privateAdd(this, _derKey);
    if (key.byteLength !== _a2.RAW_KEY_LENGTH) {
      throw InputError.fromCode(new DerDecodeErrorCode("An Ed25519 public key must be exactly 32 bytes long"));
    }
    __privateSet(this, _rawKey, key);
    __privateSet(this, _derKey, _a2.derEncode(key));
  }
  static from(key) {
    return this.fromDer(key.toDer());
  }
  static fromRaw(rawKey) {
    return new _a2(rawKey);
  }
  static fromDer(derKey) {
    return new _a2(this.derDecode(derKey));
  }
  static derEncode(publicKey) {
    return wrapDER(publicKey, ED25519_OID);
  }
  static derDecode(key) {
    const unwrapped = unwrapDER(key, ED25519_OID);
    if (unwrapped.length !== this.RAW_KEY_LENGTH) {
      throw InputError.fromCode(new DerDecodeErrorCode("An Ed25519 public key must be exactly 32 bytes long"));
    }
    return unwrapped;
  }
  get rawKey() {
    return __privateGet(this, _rawKey);
  }
  get derKey() {
    return __privateGet(this, _derKey);
  }
  toDer() {
    return this.derKey;
  }
  toRaw() {
    return this.rawKey;
  }
}, _rawKey = new WeakMap(), _derKey = new WeakMap(), _a2.RAW_KEY_LENGTH = 32, _a2);
class Observable {
  constructor() {
    this.observers = [];
  }
  subscribe(func) {
    this.observers.push(func);
  }
  unsubscribe(func) {
    this.observers = this.observers.filter((observer) => observer !== func);
  }
  notify(data, ...rest) {
    this.observers.forEach((observer) => observer(data, ...rest));
  }
}
class ObservableLog extends Observable {
  constructor() {
    super();
  }
  print(message, ...rest) {
    this.notify({ message, level: "info" }, ...rest);
  }
  warn(message, ...rest) {
    this.notify({ message, level: "warn" }, ...rest);
  }
  error(message, error, ...rest) {
    this.notify({ message, level: "error", error }, ...rest);
  }
}
const RANDOMIZATION_FACTOR = 0.5;
const MULTIPLIER = 1.5;
const INITIAL_INTERVAL_MSEC = 500;
const MAX_INTERVAL_MSEC = 6e4;
const MAX_ELAPSED_TIME_MSEC = 9e5;
const MAX_ITERATIONS = 10;
const _ExponentialBackoff = class _ExponentialBackoff {
  constructor(options = _ExponentialBackoff.default) {
    __privateAdd(this, _currentInterval);
    __privateAdd(this, _randomizationFactor);
    __privateAdd(this, _multiplier);
    __privateAdd(this, _maxInterval);
    __privateAdd(this, _startTime);
    __privateAdd(this, _maxElapsedTime);
    __privateAdd(this, _maxIterations);
    __privateAdd(this, _date);
    __privateAdd(this, _count, 0);
    const { initialInterval = INITIAL_INTERVAL_MSEC, randomizationFactor = RANDOMIZATION_FACTOR, multiplier = MULTIPLIER, maxInterval = MAX_INTERVAL_MSEC, maxElapsedTime = MAX_ELAPSED_TIME_MSEC, maxIterations = MAX_ITERATIONS, date = Date } = options;
    __privateSet(this, _currentInterval, initialInterval);
    __privateSet(this, _randomizationFactor, randomizationFactor);
    __privateSet(this, _multiplier, multiplier);
    __privateSet(this, _maxInterval, maxInterval);
    __privateSet(this, _date, date);
    __privateSet(this, _startTime, date.now());
    __privateSet(this, _maxElapsedTime, maxElapsedTime);
    __privateSet(this, _maxIterations, maxIterations);
  }
  get ellapsedTimeInMsec() {
    return __privateGet(this, _date).now() - __privateGet(this, _startTime);
  }
  get currentInterval() {
    return __privateGet(this, _currentInterval);
  }
  get count() {
    return __privateGet(this, _count);
  }
  get randomValueFromInterval() {
    const delta = __privateGet(this, _randomizationFactor) * __privateGet(this, _currentInterval);
    const min = __privateGet(this, _currentInterval) - delta;
    const max = __privateGet(this, _currentInterval) + delta;
    return Math.random() * (max - min) + min;
  }
  incrementCurrentInterval() {
    __privateSet(this, _currentInterval, Math.min(__privateGet(this, _currentInterval) * __privateGet(this, _multiplier), __privateGet(this, _maxInterval)));
    __privateWrapper(this, _count)._++;
    return __privateGet(this, _currentInterval);
  }
  next() {
    if (this.ellapsedTimeInMsec >= __privateGet(this, _maxElapsedTime) || __privateGet(this, _count) >= __privateGet(this, _maxIterations)) {
      return null;
    } else {
      this.incrementCurrentInterval();
      return this.randomValueFromInterval;
    }
  }
};
_currentInterval = new WeakMap();
_randomizationFactor = new WeakMap();
_multiplier = new WeakMap();
_maxInterval = new WeakMap();
_startTime = new WeakMap();
_maxElapsedTime = new WeakMap();
_maxIterations = new WeakMap();
_date = new WeakMap();
_count = new WeakMap();
_ExponentialBackoff.default = {
  initialInterval: INITIAL_INTERVAL_MSEC,
  randomizationFactor: RANDOMIZATION_FACTOR,
  multiplier: MULTIPLIER,
  maxInterval: MAX_INTERVAL_MSEC,
  // 1 minute
  maxElapsedTime: MAX_ELAPSED_TIME_MSEC,
  maxIterations: MAX_ITERATIONS,
  date: Date
};
let ExponentialBackoff = _ExponentialBackoff;
var RequestStatusResponseStatus;
(function(RequestStatusResponseStatus2) {
  RequestStatusResponseStatus2["Received"] = "received";
  RequestStatusResponseStatus2["Processing"] = "processing";
  RequestStatusResponseStatus2["Replied"] = "replied";
  RequestStatusResponseStatus2["Rejected"] = "rejected";
  RequestStatusResponseStatus2["Unknown"] = "unknown";
  RequestStatusResponseStatus2["Done"] = "done";
})(RequestStatusResponseStatus || (RequestStatusResponseStatus = {}));
const MINUTE_TO_MSECS = 60 * 1e3;
const MSECS_TO_NANOSECONDS = 1e6;
const DEFAULT_TIME_DIFF_MSECS = 0;
const IC_ROOT_KEY = "308182301d060d2b0601040182dc7c0503010201060c2b0601040182dc7c05030201036100814c0e6ec71fab583b08bd81373c255c3c371b2e84863c98a4f1e08b74235d14fb5d9c0cd546d9685f913a0c0b2cc5341583bf4b4392e467db96d65b9bb4cb717112f8472e0d5a4d14505ffd7484b01291091c5f87b98883463f98091a0baaae";
const IC0_DOMAIN = "ic0.app";
const IC0_SUB_DOMAIN = ".ic0.app";
const ICP0_DOMAIN = "icp0.io";
const ICP0_SUB_DOMAIN = ".icp0.io";
const ICP_API_DOMAIN = "icp-api.io";
const ICP_API_SUB_DOMAIN = ".icp-api.io";
const HTTP_STATUS_OK = 200;
const HTTP_STATUS_ACCEPTED = 202;
const HTTP_STATUS_NOT_FOUND = 404;
function getDefaultFetch() {
  let defaultFetch;
  if (typeof window !== "undefined") {
    if (window.fetch) {
      defaultFetch = window.fetch.bind(window);
    } else {
      throw ExternalError.fromCode(new HttpDefaultFetchErrorCode("Fetch implementation was not available. You appear to be in a browser context, but window.fetch was not present."));
    }
  } else if (typeof globalThis !== "undefined") {
    if (globalThis.fetch) {
      defaultFetch = globalThis.fetch.bind(globalThis);
    } else {
      throw ExternalError.fromCode(new HttpDefaultFetchErrorCode("Fetch implementation was not available. You appear to be in a Node.js context, but global.fetch was not available."));
    }
  } else if (typeof self !== "undefined") {
    if (self.fetch) {
      defaultFetch = self.fetch.bind(self);
    }
  }
  if (defaultFetch) {
    return defaultFetch;
  }
  throw ExternalError.fromCode(new HttpDefaultFetchErrorCode("Fetch implementation was not available. Please provide fetch to the HttpAgent constructor, or ensure it is available in the window or global context."));
}
function determineHost(configuredHost) {
  let host;
  if (configuredHost !== void 0) {
    if (!configuredHost.match(/^[a-z]+:/) && typeof window !== "undefined") {
      host = new URL(window.location.protocol + "//" + configuredHost);
    } else {
      host = new URL(configuredHost);
    }
  } else {
    const knownHosts = ["ic0.app", "icp0.io", "127.0.0.1", "localhost"];
    const remoteHosts = [".github.dev", ".gitpod.io"];
    const location2 = typeof window !== "undefined" ? window.location : void 0;
    const hostname = location2?.hostname;
    let knownHost;
    if (hostname && typeof hostname === "string") {
      if (remoteHosts.some((host2) => hostname.endsWith(host2))) {
        knownHost = hostname;
      } else {
        knownHost = knownHosts.find((host2) => hostname.endsWith(host2));
      }
    }
    if (location2 && knownHost) {
      host = new URL(`${location2.protocol}//${knownHost}${location2.port ? ":" + location2.port : ""}`);
    } else {
      host = new URL("https://icp-api.io");
    }
  }
  return host.toString();
}
class HttpAgent {
  #rootKeyPromise;
  #shouldFetchRootKey;
  #timeDiffMsecs;
  #hasSyncedTime;
  #syncTimePromise;
  #shouldSyncTime;
  #identity;
  #fetch;
  #fetchOptions;
  #callOptions;
  #credentials;
  #retryTimes;
  // Retry requests N times before erroring by default
  #backoffStrategy;
  #maxIngressExpiryInMinutes;
  get #maxIngressExpiryInMs() {
    return this.#maxIngressExpiryInMinutes * MINUTE_TO_MSECS;
  }
  #queryPipeline;
  #updatePipeline;
  #subnetKeys;
  #verifyQuerySignatures;
  /**
   * @param options - Options for the HttpAgent
   * @deprecated Use `HttpAgent.create` or `HttpAgent.createSync` instead
   */
  constructor(options = {}) {
    this.#rootKeyPromise = null;
    this.#shouldFetchRootKey = false;
    this.#timeDiffMsecs = DEFAULT_TIME_DIFF_MSECS;
    this.#hasSyncedTime = false;
    this.#syncTimePromise = null;
    this.#shouldSyncTime = false;
    this._isAgent = true;
    this.config = {};
    this.log = new ObservableLog();
    this.#queryPipeline = [];
    this.#updatePipeline = [];
    this.#subnetKeys = new ExpirableMap({
      expirationTime: 5 * MINUTE_TO_MSECS
    });
    this.#verifyQuerySignatures = true;
    this.#verifyQueryResponse = (queryResponse, subnetStatus) => {
      if (this.#verifyQuerySignatures === false) {
        return queryResponse;
      }
      const { status, signatures = [], requestId } = queryResponse;
      for (const sig of signatures) {
        const { timestamp, identity } = sig;
        const nodeId = Principal$1.fromUint8Array(identity).toText();
        let hash;
        if (status === QueryResponseStatus.Replied) {
          const { reply } = queryResponse;
          hash = hashOfMap({
            status,
            reply,
            timestamp: BigInt(timestamp),
            request_id: requestId
          });
        } else if (status === QueryResponseStatus.Rejected) {
          const { reject_code, reject_message, error_code } = queryResponse;
          hash = hashOfMap({
            status,
            reject_code,
            reject_message,
            error_code,
            timestamp: BigInt(timestamp),
            request_id: requestId
          });
        } else {
          throw UnknownError.fromCode(new UnexpectedErrorCode(`Unknown status: ${status}`));
        }
        const separatorWithHash = concatBytes(IC_RESPONSE_DOMAIN_SEPARATOR, hash);
        const pubKey = subnetStatus.nodeKeys.get(nodeId);
        if (!pubKey) {
          throw ProtocolError.fromCode(new MalformedPublicKeyErrorCode());
        }
        const rawKey = Ed25519PublicKey$1.fromDer(pubKey).rawKey;
        const valid = ed25519.verify(sig.signature, separatorWithHash, rawKey);
        if (valid)
          return queryResponse;
        throw TrustError.fromCode(new QuerySignatureVerificationFailedErrorCode(nodeId));
      }
      return queryResponse;
    };
    this.config = options;
    this.#fetch = options.fetch || getDefaultFetch() || fetch.bind(globalThis);
    this.#fetchOptions = options.fetchOptions;
    this.#callOptions = options.callOptions;
    this.#shouldFetchRootKey = options.shouldFetchRootKey ?? false;
    this.#shouldSyncTime = options.shouldSyncTime ?? false;
    if (options.rootKey) {
      this.rootKey = options.rootKey;
    } else if (this.#shouldFetchRootKey) {
      this.rootKey = null;
    } else {
      this.rootKey = hexToBytes(IC_ROOT_KEY);
    }
    const host = determineHost(options.host);
    this.host = new URL(host);
    if (options.verifyQuerySignatures !== void 0) {
      this.#verifyQuerySignatures = options.verifyQuerySignatures;
    }
    this.#retryTimes = options.retryTimes ?? 3;
    const defaultBackoffFactory = () => new ExponentialBackoff({
      maxIterations: this.#retryTimes
    });
    this.#backoffStrategy = options.backoffStrategy || defaultBackoffFactory;
    if (this.host.hostname.endsWith(IC0_SUB_DOMAIN)) {
      this.host.hostname = IC0_DOMAIN;
    } else if (this.host.hostname.endsWith(ICP0_SUB_DOMAIN)) {
      this.host.hostname = ICP0_DOMAIN;
    } else if (this.host.hostname.endsWith(ICP_API_SUB_DOMAIN)) {
      this.host.hostname = ICP_API_DOMAIN;
    }
    if (options.credentials) {
      const { name, password } = options.credentials;
      this.#credentials = `${name}${password ? ":" + password : ""}`;
    }
    this.#identity = Promise.resolve(options.identity || new AnonymousIdentity());
    if (options.ingressExpiryInMinutes && options.ingressExpiryInMinutes > 5) {
      throw InputError.fromCode(new IngressExpiryInvalidErrorCode("The maximum ingress expiry time is 5 minutes.", options.ingressExpiryInMinutes));
    }
    if (options.ingressExpiryInMinutes && options.ingressExpiryInMinutes <= 0) {
      throw InputError.fromCode(new IngressExpiryInvalidErrorCode("Ingress expiry time must be greater than 0.", options.ingressExpiryInMinutes));
    }
    this.#maxIngressExpiryInMinutes = options.ingressExpiryInMinutes || 5;
    this.addTransform("update", makeNonceTransform(makeNonce));
    if (options.useQueryNonces) {
      this.addTransform("query", makeNonceTransform(makeNonce));
    }
    if (options.logToConsole) {
      this.log.subscribe((log) => {
        if (log.level === "error") {
          console.error(log.message);
        } else if (log.level === "warn") {
          console.warn(log.message);
        } else {
          console.log(log.message);
        }
      });
    }
  }
  static createSync(options = {}) {
    return new this({ ...options });
  }
  static async create(options = {}) {
    const agent = HttpAgent.createSync(options);
    await agent.#asyncGuard();
    return agent;
  }
  static async from(agent) {
    try {
      if ("config" in agent) {
        return await HttpAgent.create(agent.config);
      }
      return await HttpAgent.create({
        fetch: agent._fetch,
        fetchOptions: agent._fetchOptions,
        callOptions: agent._callOptions,
        host: agent._host.toString(),
        identity: agent._identity ?? void 0
      });
    } catch {
      throw InputError.fromCode(new CreateHttpAgentErrorCode());
    }
  }
  isLocal() {
    const hostname = this.host.hostname;
    return hostname === "127.0.0.1" || hostname.endsWith("127.0.0.1");
  }
  addTransform(type, fn, priority = fn.priority || 0) {
    if (type === "update") {
      const i3 = this.#updatePipeline.findIndex((x3) => (x3.priority || 0) < priority);
      this.#updatePipeline.splice(i3 >= 0 ? i3 : this.#updatePipeline.length, 0, Object.assign(fn, { priority }));
    } else if (type === "query") {
      const i3 = this.#queryPipeline.findIndex((x3) => (x3.priority || 0) < priority);
      this.#queryPipeline.splice(i3 >= 0 ? i3 : this.#queryPipeline.length, 0, Object.assign(fn, { priority }));
    }
  }
  async getPrincipal() {
    if (!this.#identity) {
      throw ExternalError.fromCode(new IdentityInvalidErrorCode());
    }
    return (await this.#identity).getPrincipal();
  }
  /**
   * Makes a call to a canister method.
   * @param canisterId - The ID of the canister to call. Can be a Principal or a string.
   * @param options - Options for the call.
   * @param options.methodName - The name of the method to call.
   * @param options.arg - The argument to pass to the method, as a Uint8Array.
   * @param options.effectiveCanisterId - (Optional) The effective canister ID, if different from the target canister ID.
   * @param options.callSync - (Optional) Whether to use synchronous call mode. Defaults to true.
   * @param options.nonce - (Optional) A unique nonce for the request. If provided, it will override any nonce set by transforms.
   * @param identity - (Optional) The identity to use for the call. If not provided, the agent's current identity will be used.
   * @returns A promise that resolves to the response of the call, including the request ID and response details.
   */
  async call(canisterId2, options, identity) {
    const callSync = options.callSync ?? true;
    const id = await (identity ?? this.#identity);
    if (!id) {
      throw ExternalError.fromCode(new IdentityInvalidErrorCode());
    }
    const canister = Principal$1.from(canisterId2);
    const ecid = options.effectiveCanisterId ? Principal$1.from(options.effectiveCanisterId) : canister;
    await this.#asyncGuard(ecid);
    const sender = id.getPrincipal();
    const ingress_expiry = calculateIngressExpiry(this.#maxIngressExpiryInMinutes, this.#timeDiffMsecs);
    const submit = {
      request_type: SubmitRequestType.Call,
      canister_id: canister,
      method_name: options.methodName,
      arg: options.arg,
      sender,
      ingress_expiry
    };
    let transformedRequest = await this._transform({
      request: {
        body: null,
        method: "POST",
        headers: {
          "Content-Type": "application/cbor",
          ...this.#credentials ? { Authorization: "Basic " + btoa(this.#credentials) } : {}
        }
      },
      endpoint: Endpoint.Call,
      body: submit
    });
    let nonce;
    if (options?.nonce) {
      nonce = toNonce(options.nonce);
    } else if (transformedRequest.body.nonce) {
      nonce = toNonce(transformedRequest.body.nonce);
    } else {
      nonce = void 0;
    }
    submit.nonce = nonce;
    function toNonce(buf) {
      return Object.assign(buf, { __nonce__: void 0 });
    }
    transformedRequest = await id.transformRequest(transformedRequest);
    const body = encode(transformedRequest.body);
    const backoff2 = this.#backoffStrategy();
    const requestId = requestIdOf(submit);
    try {
      const requestSync = () => {
        this.log.print(`fetching "/api/v3/canister/${ecid.toText()}/call" with request:`, transformedRequest);
        return this.#fetch("" + new URL(`/api/v3/canister/${ecid.toText()}/call`, this.host), {
          ...this.#callOptions,
          ...transformedRequest.request,
          body
        });
      };
      const requestAsync = () => {
        this.log.print(`fetching "/api/v2/canister/${ecid.toText()}/call" with request:`, transformedRequest);
        return this.#fetch("" + new URL(`/api/v2/canister/${ecid.toText()}/call`, this.host), {
          ...this.#callOptions,
          ...transformedRequest.request,
          body
        });
      };
      const requestFn = callSync ? requestSync : requestAsync;
      const { responseBodyBytes, ...response } = await this.#requestAndRetry({
        requestFn,
        backoff: backoff2,
        tries: 0
      });
      const responseBody = responseBodyBytes.byteLength > 0 ? decode(responseBodyBytes) : null;
      return {
        requestId,
        response: {
          ...response,
          body: responseBody
        },
        requestDetails: submit
      };
    } catch (error) {
      let callError;
      if (error instanceof AgentError) {
        if (error.hasCode(HttpV3ApiNotSupportedErrorCode)) {
          this.log.warn("v3 api not supported. Fall back to v2");
          return this.call(canisterId2, {
            ...options,
            // disable v3 api
            callSync: false
          }, identity);
        } else if (error.hasCode(IngressExpiryInvalidErrorCode) && !this.#hasSyncedTime) {
          await this.syncTime(canister);
          return this.call(canister, options, identity);
        } else {
          error.code.requestContext = {
            requestId,
            senderPubKey: transformedRequest.body.sender_pubkey,
            senderSignature: transformedRequest.body.sender_sig,
            ingressExpiry: transformedRequest.body.content.ingress_expiry
          };
          callError = error;
        }
      } else {
        callError = UnknownError.fromCode(new UnexpectedErrorCode(error));
      }
      this.log.error(`Error while making call: ${callError.message}`, callError);
      throw callError;
    }
  }
  async #requestAndRetryQuery(args) {
    const { ecid, transformedRequest, body, requestId, backoff: backoff2, tries } = args;
    const delay = tries === 0 ? 0 : backoff2.next();
    this.log.print(`fetching "/api/v2/canister/${ecid.toString()}/query" with tries:`, {
      tries,
      backoff: backoff2,
      delay
    });
    if (delay === null) {
      throw UnknownError.fromCode(new TimeoutWaitingForResponseErrorCode(`Backoff strategy exhausted after ${tries} attempts.`, requestId));
    }
    if (delay > 0) {
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
    let response;
    try {
      this.log.print(`fetching "/api/v2/canister/${ecid.toString()}/query" with request:`, transformedRequest);
      const fetchResponse = await this.#fetch("" + new URL(`/api/v2/canister/${ecid.toString()}/query`, this.host), {
        ...this.#fetchOptions,
        ...transformedRequest.request,
        body
      });
      if (fetchResponse.status === HTTP_STATUS_OK) {
        const queryResponse = decode(uint8FromBufLike(await fetchResponse.arrayBuffer()));
        response = {
          ...queryResponse,
          httpDetails: {
            ok: fetchResponse.ok,
            status: fetchResponse.status,
            statusText: fetchResponse.statusText,
            headers: httpHeadersTransform(fetchResponse.headers)
          },
          requestId
        };
      } else {
        throw ProtocolError.fromCode(new HttpErrorCode(fetchResponse.status, fetchResponse.statusText, httpHeadersTransform(fetchResponse.headers), await fetchResponse.text()));
      }
    } catch (error) {
      if (tries < this.#retryTimes) {
        this.log.warn(`Caught exception while attempting to make query:
  ${error}
  Retrying query.`);
        return await this.#requestAndRetryQuery({ ...args, tries: tries + 1 });
      }
      if (error instanceof AgentError) {
        throw error;
      }
      throw TransportError.fromCode(new HttpFetchErrorCode(error));
    }
    if (!this.#verifyQuerySignatures) {
      return response;
    }
    const signatureTimestampNs = response.signatures?.[0]?.timestamp;
    if (!signatureTimestampNs) {
      throw ProtocolError.fromCode(new MalformedSignatureErrorCode("Timestamp not found in query response. This suggests a malformed or malicious response."));
    }
    const signatureTimestampMs = Number(BigInt(signatureTimestampNs) / BigInt(MSECS_TO_NANOSECONDS));
    const currentTimestampInMs = Date.now() + this.#timeDiffMsecs;
    if (currentTimestampInMs - signatureTimestampMs > this.#maxIngressExpiryInMs) {
      if (tries < this.#retryTimes) {
        this.log.warn("Timestamp is older than the max ingress expiry. Retrying query.", {
          requestId,
          signatureTimestampMs
        });
        return await this.#requestAndRetryQuery({ ...args, tries: tries + 1 });
      }
      throw TrustError.fromCode(new CertificateOutdatedErrorCode(this.#maxIngressExpiryInMinutes, requestId, tries));
    }
    return response;
  }
  /**
   * Makes a request and retries if it fails.
   * @param args - The arguments for the request.
   * @param args.requestFn - A function that returns a Promise resolving to a Response.
   * @param args.backoff - The backoff strategy to use for retries.
   * @param args.tries - The number of retry attempts made so far.
   * @returns The response from the request, if the status is 200 or 202.
   * See the https://internetcomputer.org/docs/references/ic-interface-spec#http-interface for details on the response statuses.
   * @throws {ProtocolError} if the response status is not 200 or 202, and the retry limit has been reached.
   * @throws {TransportError} if the request fails, and the retry limit has been reached.
   */
  async #requestAndRetry(args) {
    const { requestFn, backoff: backoff2, tries } = args;
    const delay = tries === 0 ? 0 : backoff2.next();
    if (delay === null) {
      throw ProtocolError.fromCode(new TimeoutWaitingForResponseErrorCode(`Retry strategy exhausted after ${tries} attempts.`));
    }
    if (delay > 0) {
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
    let response;
    let responseBodyBytes = new Uint8Array();
    try {
      response = await requestFn();
      if (response.status === HTTP_STATUS_OK) {
        responseBodyBytes = uint8FromBufLike(await response.clone().arrayBuffer());
      }
    } catch (error) {
      if (tries < this.#retryTimes) {
        this.log.warn(`Caught exception while attempting to make request:
  ${error}
  Retrying request.`);
        return await this.#requestAndRetry({ requestFn, backoff: backoff2, tries: tries + 1 });
      }
      throw TransportError.fromCode(new HttpFetchErrorCode(error));
    }
    const headers = httpHeadersTransform(response.headers);
    if (response.status === HTTP_STATUS_OK || response.status === HTTP_STATUS_ACCEPTED) {
      return {
        ok: response.ok,
        // should always be true
        status: response.status,
        statusText: response.statusText,
        responseBodyBytes,
        headers
      };
    }
    const responseText = await response.text();
    if (response.status === HTTP_STATUS_NOT_FOUND && response.url.includes("api/v3")) {
      throw ProtocolError.fromCode(new HttpV3ApiNotSupportedErrorCode());
    }
    if (responseText.startsWith("Invalid request expiry: ")) {
      throw InputError.fromCode(new IngressExpiryInvalidErrorCode(responseText, this.#maxIngressExpiryInMinutes));
    }
    if (tries < this.#retryTimes) {
      return await this.#requestAndRetry({ requestFn, backoff: backoff2, tries: tries + 1 });
    }
    throw ProtocolError.fromCode(new HttpErrorCode(response.status, response.statusText, headers, responseText));
  }
  async query(canisterId2, fields, identity) {
    const backoff2 = this.#backoffStrategy();
    const ecid = fields.effectiveCanisterId ? Principal$1.from(fields.effectiveCanisterId) : Principal$1.from(canisterId2);
    await this.#asyncGuard(ecid);
    this.log.print(`ecid ${ecid.toString()}`);
    this.log.print(`canisterId ${canisterId2.toString()}`);
    let transformedRequest;
    const id = await (identity ?? this.#identity);
    if (!id) {
      throw ExternalError.fromCode(new IdentityInvalidErrorCode());
    }
    const canister = Principal$1.from(canisterId2);
    const sender = id.getPrincipal();
    const ingressExpiry = calculateIngressExpiry(this.#maxIngressExpiryInMinutes, this.#timeDiffMsecs);
    const request2 = {
      request_type: ReadRequestType.Query,
      canister_id: canister,
      method_name: fields.methodName,
      arg: fields.arg,
      sender,
      ingress_expiry: ingressExpiry
    };
    const requestId = requestIdOf(request2);
    transformedRequest = await this._transform({
      request: {
        method: "POST",
        headers: {
          "Content-Type": "application/cbor",
          ...this.#credentials ? { Authorization: "Basic " + btoa(this.#credentials) } : {}
        }
      },
      endpoint: Endpoint.Query,
      body: request2
    });
    transformedRequest = await id.transformRequest(transformedRequest);
    const body = encode(transformedRequest.body);
    const args = {
      canister: canister.toText(),
      ecid,
      transformedRequest,
      body,
      requestId,
      backoff: backoff2,
      tries: 0
    };
    const makeQuery = async () => {
      const query = await this.#requestAndRetryQuery(args);
      return {
        requestDetails: request2,
        ...query
      };
    };
    const getSubnetStatus = async () => {
      const cachedSubnetStatus = this.#subnetKeys.get(ecid.toString());
      if (cachedSubnetStatus) {
        return cachedSubnetStatus;
      }
      await this.fetchSubnetKeys(ecid.toString());
      const subnetStatus = this.#subnetKeys.get(ecid.toString());
      if (!subnetStatus) {
        throw TrustError.fromCode(new MissingSignatureErrorCode());
      }
      return subnetStatus;
    };
    try {
      if (!this.#verifyQuerySignatures) {
        return await makeQuery();
      }
      const [queryWithDetails, subnetStatus] = await Promise.all([makeQuery(), getSubnetStatus()]);
      try {
        return this.#verifyQueryResponse(queryWithDetails, subnetStatus);
      } catch {
        this.log.warn("Query response verification failed. Retrying with fresh subnet keys.");
        this.#subnetKeys.delete(ecid.toString());
        const updatedSubnetStatus = await getSubnetStatus();
        return this.#verifyQueryResponse(queryWithDetails, updatedSubnetStatus);
      }
    } catch (error) {
      let queryError;
      if (error instanceof AgentError) {
        error.code.requestContext = {
          requestId,
          senderPubKey: transformedRequest.body.sender_pubkey,
          senderSignature: transformedRequest.body.sender_sig,
          ingressExpiry: transformedRequest.body.content.ingress_expiry
        };
        queryError = error;
      } else {
        queryError = UnknownError.fromCode(new UnexpectedErrorCode(error));
      }
      this.log.error(`Error while making query: ${queryError.message}`, queryError);
      throw queryError;
    }
  }
  /**
   * See https://internetcomputer.org/docs/current/references/ic-interface-spec/#http-query for details on validation
   * @param queryResponse - The response from the query
   * @param subnetStatus - The subnet status, including all node keys
   * @returns ApiQueryResponse
   */
  #verifyQueryResponse;
  async createReadStateRequest(fields, identity) {
    await this.#asyncGuard();
    const id = await (identity ?? this.#identity);
    if (!id) {
      throw ExternalError.fromCode(new IdentityInvalidErrorCode());
    }
    const sender = id.getPrincipal();
    const transformedRequest = await this._transform({
      request: {
        method: "POST",
        headers: {
          "Content-Type": "application/cbor",
          ...this.#credentials ? { Authorization: "Basic " + btoa(this.#credentials) } : {}
        }
      },
      endpoint: Endpoint.ReadState,
      body: {
        request_type: ReadRequestType.ReadState,
        paths: fields.paths,
        sender,
        ingress_expiry: calculateIngressExpiry(this.#maxIngressExpiryInMinutes, this.#timeDiffMsecs)
      }
    });
    return id.transformRequest(transformedRequest);
  }
  async readState(canisterId2, fields, _identity, request2) {
    await this.#rootKeyGuard();
    const canister = Principal$1.from(canisterId2);
    function getRequestId(options) {
      for (const path of options.paths) {
        const [pathName, value] = path;
        const request_status = new TextEncoder().encode("request_status");
        if (uint8Equals(pathName, request_status)) {
          return value;
        }
      }
    }
    let transformedRequest;
    let requestId;
    if (request2) {
      transformedRequest = request2;
      requestId = requestIdOf(transformedRequest);
    } else {
      requestId = getRequestId(fields);
      const identity = await this.#identity;
      if (!identity) {
        throw ExternalError.fromCode(new IdentityInvalidErrorCode());
      }
      transformedRequest = await this.createReadStateRequest(fields, identity);
    }
    this.log.print(`fetching "/api/v2/canister/${canister}/read_state" with request:`, transformedRequest);
    const backoff2 = this.#backoffStrategy();
    try {
      const { responseBodyBytes } = await this.#requestAndRetry({
        requestFn: () => this.#fetch("" + new URL(`/api/v2/canister/${canister.toString()}/read_state`, this.host), {
          ...this.#fetchOptions,
          ...transformedRequest.request,
          body: encode(transformedRequest.body)
        }),
        backoff: backoff2,
        tries: 0
      });
      const decodedResponse = decode(responseBodyBytes);
      this.log.print("Read state response:", decodedResponse);
      return decodedResponse;
    } catch (error) {
      let readStateError;
      if (error instanceof AgentError) {
        error.code.requestContext = {
          requestId,
          senderPubKey: transformedRequest.body.sender_pubkey,
          senderSignature: transformedRequest.body.sender_sig,
          ingressExpiry: transformedRequest.body.content.ingress_expiry
        };
        readStateError = error;
      } else {
        readStateError = UnknownError.fromCode(new UnexpectedErrorCode(error));
      }
      this.log.error(`Error while making read state: ${readStateError.message}`, readStateError);
      throw readStateError;
    }
  }
  parseTimeFromResponse(response) {
    let tree;
    if (response.certificate) {
      const decoded = decode(response.certificate);
      if (decoded && "tree" in decoded) {
        tree = decoded.tree;
      } else {
        throw ProtocolError.fromCode(new HashTreeDecodeErrorCode("Could not decode time from response"));
      }
      const timeLookup = lookup_path(["time"], tree);
      if (timeLookup.status !== LookupPathStatus.Found) {
        throw ProtocolError.fromCode(new LookupErrorCode("Time was not found in the response or was not in its expected format.", timeLookup.status));
      }
      if (!(timeLookup.value instanceof Uint8Array) && !ArrayBuffer.isView(timeLookup)) {
        throw ProtocolError.fromCode(new MalformedLookupFoundValueErrorCode("Time was not in its expected format."));
      }
      const date = decodeTime(timeLookup.value);
      this.log.print("Time from response:", date);
      this.log.print("Time from response in milliseconds:", date.getTime());
      return date.getTime();
    } else {
      this.log.warn("No certificate found in response");
    }
    return 0;
  }
  /**
   * Allows agent to sync its time with the network. Can be called during intialization or mid-lifecycle if the device's clock has drifted away from the network time. This is necessary to set the Expiry for a request
   * @param {Principal} canisterIdOverride - Pass a canister ID if you need to sync the time with a particular subnet. Uses the ICP ledger canister by default.
   */
  async syncTime(canisterIdOverride) {
    this.#syncTimePromise = this.#syncTimePromise ?? (async () => {
      await this.#rootKeyGuard();
      const callTime = Date.now();
      try {
        if (!canisterIdOverride) {
          this.log.print("Syncing time with the IC. No canisterId provided, so falling back to ryjl3-tyaaa-aaaaa-aaaba-cai");
        }
        const canisterId2 = canisterIdOverride ?? Principal$1.from("ryjl3-tyaaa-aaaaa-aaaba-cai");
        const anonymousAgent = HttpAgent.createSync({
          identity: new AnonymousIdentity(),
          host: this.host.toString(),
          fetch: this.#fetch,
          retryTimes: 0,
          rootKey: this.rootKey ?? void 0,
          shouldSyncTime: false
        });
        const replicaTimes = await Promise.all(Array(3).fill(null).map(async () => {
          const status = await request({
            canisterId: canisterId2,
            agent: anonymousAgent,
            paths: ["time"],
            disableCertificateTimeVerification: true
            // avoid recursive calls to syncTime
          });
          const date = status.get("time");
          if (date instanceof Date) {
            return date.getTime();
          }
        }, []));
        const maxReplicaTime = replicaTimes.reduce((max, current) => {
          return typeof current === "number" && current > max ? current : max;
        }, 0);
        if (maxReplicaTime > 0) {
          this.#timeDiffMsecs = maxReplicaTime - callTime;
          this.#hasSyncedTime = true;
          this.log.notify({
            message: `Syncing time: offset of ${this.#timeDiffMsecs}`,
            level: "info"
          });
        }
      } catch (error) {
        const syncTimeError = error instanceof AgentError ? error : UnknownError.fromCode(new UnexpectedErrorCode(error));
        this.log.error("Caught exception while attempting to sync time", syncTimeError);
        throw syncTimeError;
      }
    })();
    await this.#syncTimePromise.finally(() => {
      this.#syncTimePromise = null;
    });
  }
  async status() {
    const headers = this.#credentials ? {
      Authorization: "Basic " + btoa(this.#credentials)
    } : {};
    this.log.print(`fetching "/api/v2/status"`);
    const backoff2 = this.#backoffStrategy();
    const { responseBodyBytes } = await this.#requestAndRetry({
      backoff: backoff2,
      requestFn: () => this.#fetch("" + new URL(`/api/v2/status`, this.host), { headers, ...this.#fetchOptions }),
      tries: 0
    });
    return decode(responseBodyBytes);
  }
  async fetchRootKey() {
    this.#rootKeyPromise = this.#rootKeyPromise ?? (async () => {
      const value = await this.status();
      this.rootKey = value.root_key;
      return this.rootKey;
    })();
    return await this.#rootKeyPromise.finally(() => {
      this.#rootKeyPromise = null;
    });
  }
  async #asyncGuard(canisterIdOverride) {
    await Promise.all([this.#rootKeyGuard(), this.#syncTimeGuard(canisterIdOverride)]);
  }
  async #rootKeyGuard() {
    if (this.rootKey) {
      return;
    } else if (this.rootKey === null && this.host.toString() !== "https://icp-api.io" && this.#shouldFetchRootKey) {
      await this.fetchRootKey();
    } else {
      throw ExternalError.fromCode(new MissingRootKeyErrorCode(this.#shouldFetchRootKey));
    }
  }
  async #syncTimeGuard(canisterIdOverride) {
    if (this.#shouldSyncTime && !this.hasSyncedTime()) {
      await this.syncTime(canisterIdOverride);
    }
  }
  invalidateIdentity() {
    this.#identity = null;
  }
  replaceIdentity(identity) {
    this.#identity = Promise.resolve(identity);
  }
  async fetchSubnetKeys(canisterId2) {
    const effectiveCanisterId = Principal$1.from(canisterId2);
    await this.#asyncGuard(effectiveCanisterId);
    const response = await request({
      canisterId: effectiveCanisterId,
      paths: ["subnet"],
      agent: this
    });
    const subnetResponse = response.get("subnet");
    if (subnetResponse && typeof subnetResponse === "object" && "nodeKeys" in subnetResponse) {
      this.#subnetKeys.set(effectiveCanisterId.toText(), subnetResponse);
      return subnetResponse;
    }
    return void 0;
  }
  _transform(request2) {
    let p2 = Promise.resolve(request2);
    if (request2.endpoint === Endpoint.Call) {
      for (const fn of this.#updatePipeline) {
        p2 = p2.then((r2) => fn(r2).then((r22) => r22 || r2));
      }
    } else {
      for (const fn of this.#queryPipeline) {
        p2 = p2.then((r2) => fn(r2).then((r22) => r22 || r2));
      }
    }
    return p2;
  }
  /**
   * Returns the time difference in milliseconds between the IC network clock and the client's clock,
   * after the clock has been synced.
   *
   * If the time has not been synced, returns `0`.
   */
  getTimeDiffMsecs() {
    return this.#timeDiffMsecs;
  }
  /**
   * Returns `true` if the time has been synced at least once with the IC network, `false` otherwise.
   */
  hasSyncedTime() {
    return this.#hasSyncedTime;
  }
}
function calculateIngressExpiry(maxIngressExpiryInMinutes, timeDiffMsecs) {
  const ingressExpiryMs = maxIngressExpiryInMinutes * MINUTE_TO_MSECS;
  return Expiry.fromDeltaInMilliseconds(ingressExpiryMs, timeDiffMsecs);
}
const FIVE_MINUTES_IN_MSEC = 5 * 60 * 1e3;
function defaultStrategy() {
  return chain(conditionalDelay(once(), 1e3), backoff(1e3, 1.2), timeout(FIVE_MINUTES_IN_MSEC));
}
function once() {
  let first = true;
  return async () => {
    if (first) {
      first = false;
      return true;
    }
    return false;
  };
}
function conditionalDelay(condition, timeInMsec) {
  return async (canisterId2, requestId, status) => {
    if (await condition(canisterId2, requestId, status)) {
      return new Promise((resolve) => setTimeout(resolve, timeInMsec));
    }
  };
}
function timeout(timeInMsec) {
  const end = Date.now() + timeInMsec;
  return async (_canisterId, requestId, status) => {
    if (Date.now() > end) {
      throw ProtocolError.fromCode(new TimeoutWaitingForResponseErrorCode(`Request timed out after ${timeInMsec} msec`, requestId, status));
    }
  };
}
function backoff(startingThrottleInMsec, backoffFactor) {
  let currentThrottling = startingThrottleInMsec;
  return () => new Promise((resolve) => setTimeout(() => {
    currentThrottling *= backoffFactor;
    resolve();
  }, currentThrottling));
}
function chain(...strategies) {
  return async (canisterId2, requestId, status) => {
    for (const a2 of strategies) {
      await a2(canisterId2, requestId, status);
    }
  };
}
const DEFAULT_POLLING_OPTIONS = {
  strategy: defaultStrategy(),
  preSignReadStateRequest: false
};
function hasProperty(value, property) {
  return Object.prototype.hasOwnProperty.call(value, property);
}
function isObjectWithProperty(value, property) {
  return value !== null && typeof value === "object" && hasProperty(value, property);
}
function hasFunction(value, property) {
  return hasProperty(value, property) && typeof value[property] === "function";
}
function isSignedReadStateRequestWithExpiry(value) {
  return isObjectWithProperty(value, "body") && isObjectWithProperty(value.body, "content") && value.body.content.request_type === ReadRequestType.ReadState && isObjectWithProperty(value.body.content, "ingress_expiry") && typeof value.body.content.ingress_expiry === "object" && value.body.content.ingress_expiry !== null && hasFunction(value.body.content.ingress_expiry, "toHash");
}
async function pollForResponse(agent, canisterId2, requestId, options = {}) {
  const path = [utf8ToBytes("request_status"), requestId];
  let state;
  let currentRequest;
  const preSignReadStateRequest = options.preSignReadStateRequest ?? false;
  if (preSignReadStateRequest) {
    currentRequest = await constructRequest({
      paths: [path],
      agent,
      pollingOptions: options
    });
    state = await agent.readState(canisterId2, { paths: [path] }, void 0, currentRequest);
  } else {
    state = await agent.readState(canisterId2, { paths: [path] });
  }
  if (agent.rootKey == null) {
    throw ExternalError.fromCode(new MissingRootKeyErrorCode());
  }
  const cert = await Certificate.create({
    certificate: state.certificate,
    rootKey: agent.rootKey,
    canisterId: canisterId2,
    blsVerify: options.blsVerify,
    agent
  });
  const maybeBuf = lookupResultToBuffer(cert.lookup_path([...path, utf8ToBytes("status")]));
  let status;
  if (typeof maybeBuf === "undefined") {
    status = RequestStatusResponseStatus.Unknown;
  } else {
    status = new TextDecoder().decode(maybeBuf);
  }
  switch (status) {
    case RequestStatusResponseStatus.Replied: {
      return {
        reply: lookupResultToBuffer(cert.lookup_path([...path, "reply"])),
        certificate: cert
      };
    }
    case RequestStatusResponseStatus.Received:
    case RequestStatusResponseStatus.Unknown:
    case RequestStatusResponseStatus.Processing: {
      const strategy = options.strategy ?? defaultStrategy();
      await strategy(canisterId2, requestId, status);
      return pollForResponse(agent, canisterId2, requestId, {
        ...options,
        request: currentRequest
      });
    }
    case RequestStatusResponseStatus.Rejected: {
      const rejectCode = new Uint8Array(lookupResultToBuffer(cert.lookup_path([...path, "reject_code"])))[0];
      const rejectMessage = new TextDecoder().decode(lookupResultToBuffer(cert.lookup_path([...path, "reject_message"])));
      const errorCodeBuf = lookupResultToBuffer(cert.lookup_path([...path, "error_code"]));
      const errorCode = errorCodeBuf ? new TextDecoder().decode(errorCodeBuf) : void 0;
      throw RejectError.fromCode(new CertifiedRejectErrorCode(requestId, rejectCode, rejectMessage, errorCode));
    }
    case RequestStatusResponseStatus.Done:
      throw UnknownError.fromCode(new RequestStatusDoneNoReplyErrorCode(requestId));
  }
  throw UNREACHABLE_ERROR;
}
async function constructRequest(options) {
  const { paths, agent, pollingOptions } = options;
  if (pollingOptions.request && isSignedReadStateRequestWithExpiry(pollingOptions.request)) {
    return pollingOptions.request;
  }
  const request2 = await agent.createReadStateRequest?.({
    paths
  }, void 0);
  if (!isSignedReadStateRequestWithExpiry(request2)) {
    throw InputError.fromCode(new InvalidReadStateRequestErrorCode(request2));
  }
  return request2;
}
const metadataSymbol = Symbol.for("ic-agent-metadata");
class Actor {
  /**
   * Get the Agent class this Actor would call, or undefined if the Actor would use
   * the default agent (global.ic.agent).
   * @param actor The actor to get the agent of.
   */
  static agentOf(actor) {
    return actor[metadataSymbol].config.agent;
  }
  /**
   * Get the interface of an actor, in the form of an instance of a Service.
   * @param actor The actor to get the interface of.
   */
  static interfaceOf(actor) {
    return actor[metadataSymbol].service;
  }
  static canisterIdOf(actor) {
    return Principal$1.from(actor[metadataSymbol].config.canisterId);
  }
  static createActorClass(interfaceFactory, options) {
    const service = interfaceFactory({ IDL });
    class CanisterActor extends Actor {
      constructor(config) {
        if (!config.canisterId) {
          throw InputError.fromCode(new MissingCanisterIdErrorCode(config.canisterId));
        }
        const canisterId2 = typeof config.canisterId === "string" ? Principal$1.fromText(config.canisterId) : config.canisterId;
        super({
          config: {
            ...DEFAULT_ACTOR_CONFIG,
            ...config,
            canisterId: canisterId2
          },
          service
        });
        for (const [methodName, func] of service._fields) {
          if (options?.httpDetails) {
            func.annotations.push(ACTOR_METHOD_WITH_HTTP_DETAILS);
          }
          if (options?.certificate) {
            func.annotations.push(ACTOR_METHOD_WITH_CERTIFICATE);
          }
          this[methodName] = _createActorMethod(this, methodName, func, config.blsVerify);
        }
      }
    }
    return CanisterActor;
  }
  static createActor(interfaceFactory, configuration) {
    if (!configuration.canisterId) {
      throw InputError.fromCode(new MissingCanisterIdErrorCode(configuration.canisterId));
    }
    return new (this.createActorClass(interfaceFactory))(configuration);
  }
  /**
   * Returns an actor with methods that return the http response details along with the result
   * @param interfaceFactory - the interface factory for the actor
   * @param configuration - the configuration for the actor
   * @deprecated - use createActor with actorClassOptions instead
   */
  static createActorWithHttpDetails(interfaceFactory, configuration) {
    return new (this.createActorClass(interfaceFactory, { httpDetails: true }))(configuration);
  }
  /**
   * Returns an actor with methods that return the http response details along with the result
   * @param interfaceFactory - the interface factory for the actor
   * @param configuration - the configuration for the actor
   * @param actorClassOptions - options for the actor class extended details to return with the result
   */
  static createActorWithExtendedDetails(interfaceFactory, configuration, actorClassOptions = {
    httpDetails: true,
    certificate: true
  }) {
    return new (this.createActorClass(interfaceFactory, actorClassOptions))(configuration);
  }
  constructor(metadata) {
    this[metadataSymbol] = Object.freeze(metadata);
  }
}
function decodeReturnValue(types, msg) {
  const returnValues = decode$1(types, msg);
  switch (returnValues.length) {
    case 0:
      return void 0;
    case 1:
      return returnValues[0];
    default:
      return returnValues;
  }
}
const DEFAULT_ACTOR_CONFIG = {
  pollingOptions: DEFAULT_POLLING_OPTIONS
};
const ACTOR_METHOD_WITH_HTTP_DETAILS = "http-details";
const ACTOR_METHOD_WITH_CERTIFICATE = "certificate";
function _createActorMethod(actor, methodName, func, blsVerify2) {
  let caller;
  if (func.annotations.includes("query") || func.annotations.includes("composite_query")) {
    caller = async (options, ...args) => {
      options = {
        ...options,
        ...actor[metadataSymbol].config.queryTransform?.(methodName, args, {
          ...actor[metadataSymbol].config,
          ...options
        })
      };
      const agent = options.agent || actor[metadataSymbol].config.agent || new HttpAgent();
      const cid = Principal$1.from(options.canisterId || actor[metadataSymbol].config.canisterId);
      const arg = encode$1(func.argTypes, args);
      const result = await agent.query(cid, {
        methodName,
        arg,
        effectiveCanisterId: options.effectiveCanisterId
      });
      const httpDetails = {
        ...result.httpDetails,
        requestDetails: result.requestDetails
      };
      switch (result.status) {
        case QueryResponseStatus.Rejected: {
          const uncertifiedRejectErrorCode = new UncertifiedRejectErrorCode(result.requestId, result.reject_code, result.reject_message, result.error_code, result.signatures);
          uncertifiedRejectErrorCode.callContext = {
            canisterId: cid,
            methodName,
            httpDetails
          };
          throw RejectError.fromCode(uncertifiedRejectErrorCode);
        }
        case QueryResponseStatus.Replied:
          return func.annotations.includes(ACTOR_METHOD_WITH_HTTP_DETAILS) ? {
            httpDetails,
            result: decodeReturnValue(func.retTypes, result.reply.arg)
          } : decodeReturnValue(func.retTypes, result.reply.arg);
      }
    };
  } else {
    caller = async (options, ...args) => {
      options = {
        ...options,
        ...actor[metadataSymbol].config.callTransform?.(methodName, args, {
          ...actor[metadataSymbol].config,
          ...options
        })
      };
      const agent = options.agent || actor[metadataSymbol].config.agent || HttpAgent.createSync();
      const { canisterId: canisterId2, effectiveCanisterId, pollingOptions } = {
        ...DEFAULT_ACTOR_CONFIG,
        ...actor[metadataSymbol].config,
        ...options
      };
      const cid = Principal$1.from(canisterId2);
      const ecid = effectiveCanisterId !== void 0 ? Principal$1.from(effectiveCanisterId) : cid;
      const arg = encode$1(func.argTypes, args);
      const { requestId, response, requestDetails } = await agent.call(cid, {
        methodName,
        arg,
        effectiveCanisterId: ecid,
        nonce: options.nonce
      });
      let reply;
      let certificate;
      if (isV3ResponseBody(response.body)) {
        if (agent.rootKey == null) {
          throw ExternalError.fromCode(new MissingRootKeyErrorCode());
        }
        const cert = response.body.certificate;
        certificate = await Certificate.create({
          certificate: cert,
          rootKey: agent.rootKey,
          canisterId: ecid,
          blsVerify: blsVerify2,
          agent
        });
        const path = [utf8ToBytes("request_status"), requestId];
        const status = new TextDecoder().decode(lookupResultToBuffer(certificate.lookup_path([...path, "status"])));
        switch (status) {
          case "replied":
            reply = lookupResultToBuffer(certificate.lookup_path([...path, "reply"]));
            break;
          case "rejected": {
            const rejectCode = new Uint8Array(lookupResultToBuffer(certificate.lookup_path([...path, "reject_code"])))[0];
            const rejectMessage = new TextDecoder().decode(lookupResultToBuffer(certificate.lookup_path([...path, "reject_message"])));
            const error_code_buf = lookupResultToBuffer(certificate.lookup_path([...path, "error_code"]));
            const error_code = error_code_buf ? new TextDecoder().decode(error_code_buf) : void 0;
            const certifiedRejectErrorCode = new CertifiedRejectErrorCode(requestId, rejectCode, rejectMessage, error_code);
            certifiedRejectErrorCode.callContext = {
              canisterId: cid,
              methodName,
              httpDetails: response
            };
            throw RejectError.fromCode(certifiedRejectErrorCode);
          }
        }
      } else if (isV2ResponseBody(response.body)) {
        const { reject_code, reject_message, error_code } = response.body;
        const errorCode = new UncertifiedRejectUpdateErrorCode(requestId, reject_code, reject_message, error_code);
        errorCode.callContext = {
          canisterId: cid,
          methodName,
          httpDetails: response
        };
        throw RejectError.fromCode(errorCode);
      }
      if (response.status === 202) {
        const pollOptions = {
          ...pollingOptions,
          blsVerify: blsVerify2
        };
        const response2 = await pollForResponse(agent, ecid, requestId, pollOptions);
        certificate = response2.certificate;
        reply = response2.reply;
      }
      const shouldIncludeHttpDetails = func.annotations.includes(ACTOR_METHOD_WITH_HTTP_DETAILS);
      const shouldIncludeCertificate = func.annotations.includes(ACTOR_METHOD_WITH_CERTIFICATE);
      const httpDetails = { ...response, requestDetails };
      if (reply !== void 0) {
        if (shouldIncludeHttpDetails && shouldIncludeCertificate) {
          return {
            httpDetails,
            certificate,
            result: decodeReturnValue(func.retTypes, reply)
          };
        } else if (shouldIncludeCertificate) {
          return {
            certificate,
            result: decodeReturnValue(func.retTypes, reply)
          };
        } else if (shouldIncludeHttpDetails) {
          return {
            httpDetails,
            result: decodeReturnValue(func.retTypes, reply)
          };
        }
        return decodeReturnValue(func.retTypes, reply);
      } else {
        const errorCode = new UnexpectedErrorCode(`Call was returned undefined. We cannot determine if the call was successful or not. Return types: [${func.retTypes.map((t3) => t3.display()).join(",")}].`);
        errorCode.callContext = {
          canisterId: cid,
          methodName,
          httpDetails
        };
        throw UnknownError.fromCode(errorCode);
      }
    };
  }
  const handler = (...args) => caller({}, ...args);
  handler.withOptions = (options) => (...args) => caller(options, ...args);
  return handler;
}
function isObject(value) {
  return value !== null && typeof value === "object";
}
const _Ed25519PublicKey = class _Ed25519PublicKey {
  // `fromRaw` and `fromDer` should be used for instantiation, not this constructor.
  constructor(key) {
    __privateAdd(this, _rawKey2);
    __privateAdd(this, _derKey2);
    if (key.byteLength !== _Ed25519PublicKey.RAW_KEY_LENGTH) {
      throw new Error("An Ed25519 public key must be exactly 32bytes long");
    }
    __privateSet(this, _rawKey2, key);
    __privateSet(this, _derKey2, _Ed25519PublicKey.derEncode(key));
  }
  /**
   * Construct Ed25519PublicKey from an existing PublicKey
   * @param {unknown} maybeKey - existing PublicKey, ArrayBuffer, DerEncodedPublicKey, or hex string
   * @returns {Ed25519PublicKey} Instance of Ed25519PublicKey
   */
  static from(maybeKey) {
    if (typeof maybeKey === "string") {
      const key = hexToBytes(maybeKey);
      return this.fromRaw(key);
    } else if (isObject(maybeKey)) {
      const key = maybeKey;
      if (isObject(key) && Object.hasOwnProperty.call(key, "__derEncodedPublicKey__")) {
        return this.fromDer(key);
      } else if (ArrayBuffer.isView(key)) {
        const view = key;
        return this.fromRaw(uint8FromBufLike$1(view.buffer));
      } else if (key instanceof ArrayBuffer) {
        return this.fromRaw(uint8FromBufLike$1(key));
      } else if ("rawKey" in key && key.rawKey instanceof Uint8Array) {
        return this.fromRaw(key.rawKey);
      } else if ("derKey" in key) {
        return this.fromDer(key.derKey);
      } else if ("toDer" in key) {
        return this.fromDer(key.toDer());
      }
    }
    throw new Error("Cannot construct Ed25519PublicKey from the provided key.");
  }
  static fromRaw(rawKey) {
    return new _Ed25519PublicKey(rawKey);
  }
  static fromDer(derKey) {
    return new _Ed25519PublicKey(this.derDecode(derKey));
  }
  static derEncode(publicKey) {
    const key = wrapDER(publicKey, ED25519_OID);
    key.__derEncodedPublicKey__ = void 0;
    return key;
  }
  static derDecode(key) {
    const unwrapped = unwrapDER(key, ED25519_OID);
    if (unwrapped.length !== this.RAW_KEY_LENGTH) {
      throw new Error("An Ed25519 public key must be exactly 32bytes long");
    }
    return unwrapped;
  }
  get rawKey() {
    return __privateGet(this, _rawKey2);
  }
  get derKey() {
    return __privateGet(this, _derKey2);
  }
  toDer() {
    return this.derKey;
  }
  toRaw() {
    return this.rawKey;
  }
};
_rawKey2 = new WeakMap();
_derKey2 = new WeakMap();
_Ed25519PublicKey.RAW_KEY_LENGTH = 32;
let Ed25519PublicKey = _Ed25519PublicKey;
class Ed25519KeyIdentity extends SignIdentity {
  /**
   * Generate a new Ed25519KeyIdentity.
   * @param seed a 32-byte seed for the private key. If not provided, a random seed will be generated.
   * @returns Ed25519KeyIdentity
   */
  static generate(seed) {
    if (seed && seed.length !== 32) {
      throw new Error("Ed25519 Seed needs to be 32 bytes long.");
    }
    if (!seed)
      seed = ed25519.utils.randomPrivateKey();
    if (uint8Equals$1(seed, new Uint8Array(new Array(32).fill(0)))) {
      console.warn("Seed is all zeros. This is not a secure seed. Please provide a seed with sufficient entropy if this is a production environment.");
    }
    const sk = new Uint8Array(32);
    for (let i3 = 0; i3 < 32; i3++) {
      sk[i3] = seed[i3];
    }
    const pk = ed25519.getPublicKey(sk);
    return Ed25519KeyIdentity.fromKeyPair(pk, sk);
  }
  static fromParsedJson(obj) {
    const [publicKeyDer, privateKeyRaw] = obj;
    return new Ed25519KeyIdentity(Ed25519PublicKey.fromDer(hexToBytes(publicKeyDer)), hexToBytes(privateKeyRaw));
  }
  static fromJSON(json) {
    const parsed = JSON.parse(json);
    if (Array.isArray(parsed)) {
      if (typeof parsed[0] === "string" && typeof parsed[1] === "string") {
        return this.fromParsedJson([parsed[0], parsed[1]]);
      } else {
        throw new Error("Deserialization error: JSON must have at least 2 items.");
      }
    }
    throw new Error(`Deserialization error: Invalid JSON type for string: ${JSON.stringify(json)}`);
  }
  static fromKeyPair(publicKey, privateKey) {
    return new Ed25519KeyIdentity(Ed25519PublicKey.fromRaw(publicKey), privateKey);
  }
  static fromSecretKey(secretKey) {
    const publicKey = ed25519.getPublicKey(secretKey);
    return Ed25519KeyIdentity.fromKeyPair(publicKey, secretKey);
  }
  #publicKey;
  #privateKey;
  // `fromRaw` and `fromDer` should be used for instantiation, not this constructor.
  constructor(publicKey, privateKey) {
    super();
    this.#publicKey = Ed25519PublicKey.from(publicKey);
    this.#privateKey = privateKey;
  }
  /**
   * Serialize this key to JSON.
   */
  toJSON() {
    return [bytesToHex(this.#publicKey.toDer()), bytesToHex(this.#privateKey)];
  }
  /**
   * Return a copy of the key pair.
   */
  getKeyPair() {
    return {
      secretKey: this.#privateKey,
      publicKey: this.#publicKey
    };
  }
  /**
   * Return the public key.
   */
  getPublicKey() {
    return this.#publicKey;
  }
  /**
   * Signs a blob of data, with this identity's private key.
   * @param challenge - challenge to sign with this identity's secretKey, producing a signature
   */
  async sign(challenge) {
    const signature = ed25519.sign(challenge, this.#privateKey.slice(0, 32));
    Object.defineProperty(signature, "__signature__", {
      enumerable: false,
      value: void 0
    });
    return signature;
  }
  /**
   * Verify
   * @param sig - signature to verify
   * @param msg - message to verify
   * @param pk - public key
   * @returns - true if the signature is valid, false otherwise
   */
  static verify(sig, msg, pk) {
    const [signature, message, publicKey] = [sig, msg, pk].map((x3) => {
      if (typeof x3 === "string") {
        x3 = hexToBytes(x3);
      }
      return uint8FromBufLike$1(x3);
    });
    return ed25519.verify(signature, message, publicKey);
  }
}
class CryptoError extends Error {
  constructor(message) {
    super(message);
    this.message = message;
    Object.setPrototypeOf(this, CryptoError.prototype);
  }
}
function _getEffectiveCrypto(subtleCrypto) {
  if (typeof globalThis !== "undefined" && globalThis["crypto"] && globalThis["crypto"]["subtle"]) {
    return globalThis["crypto"]["subtle"];
  }
  if (subtleCrypto) {
    return subtleCrypto;
  } else if (typeof crypto !== "undefined" && crypto["subtle"]) {
    return crypto.subtle;
  } else {
    throw new CryptoError("Global crypto was not available and none was provided. Please inlcude a SubtleCrypto implementation. See https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto");
  }
}
class ECDSAKeyIdentity extends SignIdentity {
  /**
   * Generates a randomly generated identity for use in calls to the Internet Computer.
   * @param {CryptoKeyOptions} options optional settings
   * @param {CryptoKeyOptions['extractable']} options.extractable - whether the key should allow itself to be used. Set to false for maximum security.
   * @param {CryptoKeyOptions['keyUsages']} options.keyUsages - a list of key usages that the key can be used for
   * @param {CryptoKeyOptions['subtleCrypto']} options.subtleCrypto interface
   * @returns a {@link ECDSAKeyIdentity}
   */
  static async generate(options) {
    const { extractable = false, keyUsages = ["sign", "verify"], subtleCrypto } = options ?? {};
    const effectiveCrypto = _getEffectiveCrypto(subtleCrypto);
    const keyPair = await effectiveCrypto.generateKey({
      name: "ECDSA",
      namedCurve: "P-256"
    }, extractable, keyUsages);
    const derKey = uint8FromBufLike$1(await effectiveCrypto.exportKey("spki", keyPair.publicKey));
    Object.assign(derKey, {
      __derEncodedPublicKey__: void 0
    });
    return new this(keyPair, derKey, effectiveCrypto);
  }
  /**
   * generates an identity from a public and private key. Please ensure that you are generating these keys securely and protect the user's private key
   * @param keyPair a CryptoKeyPair
   * @param subtleCrypto - a SubtleCrypto interface in case one is not available globally
   * @returns an {@link ECDSAKeyIdentity}
   */
  static async fromKeyPair(keyPair, subtleCrypto) {
    const effectiveCrypto = _getEffectiveCrypto(subtleCrypto);
    const derKey = uint8FromBufLike$1(await effectiveCrypto.exportKey("spki", keyPair.publicKey));
    Object.assign(derKey, {
      __derEncodedPublicKey__: void 0
    });
    return new ECDSAKeyIdentity(keyPair, derKey, effectiveCrypto);
  }
  // `fromKeyPair` and `generate` should be used for instantiation, not this constructor.
  constructor(keyPair, derKey, subtleCrypto) {
    super();
    this._keyPair = keyPair;
    this._derKey = derKey;
    this._subtleCrypto = subtleCrypto;
  }
  /**
   * Return the internally-used key pair.
   * @returns a CryptoKeyPair
   */
  getKeyPair() {
    return this._keyPair;
  }
  /**
   * Return the public key.
   * @returns an {@link PublicKey & DerCryptoKey}
   */
  getPublicKey() {
    const derKey = this._derKey;
    const key = Object.create(this._keyPair.publicKey);
    key.toDer = function() {
      return derKey;
    };
    return key;
  }
  /**
   * Signs a blob of data, with this identity's private key.
   * @param {Uint8Array} challenge - challenge to sign with this identity's secretKey, producing a signature
   * @returns {Promise<Signature>} signature
   */
  async sign(challenge) {
    const params = {
      name: "ECDSA",
      hash: { name: "SHA-256" }
    };
    const signature = uint8FromBufLike$1(await this._subtleCrypto.sign(params, this._keyPair.privateKey, challenge));
    Object.assign(signature, {
      __signature__: void 0
    });
    return signature;
  }
}
class PartialIdentity {
  #inner;
  /**
   * The raw public key of this identity.
   */
  get rawKey() {
    return this.#inner.rawKey;
  }
  /**
   * The DER-encoded public key of this identity.
   */
  get derKey() {
    return this.#inner.derKey;
  }
  /**
   * The DER-encoded public key of this identity.
   */
  toDer() {
    return this.#inner.toDer();
  }
  /**
   * The inner {@link PublicKey} used by this identity.
   */
  getPublicKey() {
    return this.#inner;
  }
  /**
   * The {@link Principal} of this identity.
   */
  getPrincipal() {
    if (!this.#inner.rawKey) {
      throw new Error("Cannot get principal from a public key without a raw key.");
    }
    return Principal$1.fromUint8Array(new Uint8Array(this.#inner.rawKey));
  }
  /**
   * Required for the Identity interface, but cannot implemented for just a public key.
   */
  transformRequest() {
    return Promise.reject("Not implemented. You are attempting to use a partial identity to sign calls, but this identity only has access to the public key.To sign calls, use a DelegationIdentity instead.");
  }
  constructor(inner) {
    this.#inner = inner;
  }
}
function _parseBlob(value) {
  if (typeof value !== "string" || value.length < 64) {
    throw new Error("Invalid public key.");
  }
  return hexToBytes(value);
}
class Delegation {
  constructor(pubkey, expiration, targets) {
    this.pubkey = pubkey;
    this.expiration = expiration;
    this.targets = targets;
  }
  toCborValue() {
    return {
      pubkey: this.pubkey,
      expiration: this.expiration,
      ...this.targets && {
        targets: this.targets
      }
    };
  }
  toJSON() {
    return {
      expiration: this.expiration.toString(16),
      pubkey: bytesToHex(this.pubkey),
      ...this.targets && { targets: this.targets.map((p2) => p2.toHex()) }
    };
  }
}
async function _createSingleDelegation(from, to, expiration, targets) {
  const delegation = new Delegation(
    to.toDer(),
    BigInt(+expiration) * BigInt(1e6),
    // In nanoseconds.
    targets
  );
  const challenge = new Uint8Array([
    ...IC_REQUEST_AUTH_DELEGATION_DOMAIN_SEPARATOR,
    ...new Uint8Array(requestIdOf({ ...delegation }))
  ]);
  const signature = await from.sign(challenge);
  return {
    delegation,
    signature
  };
}
class DelegationChain {
  /**
   * Create a delegation chain between two (or more) keys. By default, the expiration time
   * will be very short (15 minutes).
   *
   * To build a chain of more than 2 identities, this function needs to be called multiple times,
   * passing the previous delegation chain into the options argument. For example:
   * @example
   * const rootKey = createKey();
   * const middleKey = createKey();
   * const bottomeKey = createKey();
   *
   * const rootToMiddle = await DelegationChain.create(
   *   root, middle.getPublicKey(), Date.parse('2100-01-01'),
   * );
   * const middleToBottom = await DelegationChain.create(
   *   middle, bottom.getPublicKey(), Date.parse('2100-01-01'), { previous: rootToMiddle },
   * );
   *
   * // We can now use a delegation identity that uses the delegation above:
   * const identity = DelegationIdentity.fromDelegation(bottomKey, middleToBottom);
   * @param from The identity that will delegate.
   * @param to The identity that gets delegated. It can now sign messages as if it was the
   *           identity above.
   * @param expiration The length the delegation is valid. By default, 15 minutes from calling
   *                   this function.
   * @param options A set of options for this delegation. expiration and previous
   * @param options.previous - Another DelegationChain that this chain should start with.
   * @param options.targets - targets that scope the delegation (e.g. Canister Principals)
   */
  static async create(from, to, expiration = new Date(Date.now() + 15 * 60 * 1e3), options = {}) {
    const delegation = await _createSingleDelegation(from, to, expiration, options.targets);
    return new DelegationChain([...options.previous?.delegations || [], delegation], options.previous?.publicKey || from.getPublicKey().toDer());
  }
  /**
   * Creates a DelegationChain object from a JSON string.
   * @param json The JSON string to parse.
   */
  static fromJSON(json) {
    const { publicKey, delegations } = typeof json === "string" ? JSON.parse(json) : json;
    if (!Array.isArray(delegations)) {
      throw new Error("Invalid delegations.");
    }
    const parsedDelegations = delegations.map((signedDelegation) => {
      const { delegation, signature } = signedDelegation;
      const { pubkey, expiration, targets } = delegation;
      if (targets !== void 0 && !Array.isArray(targets)) {
        throw new Error("Invalid targets.");
      }
      return {
        delegation: new Delegation(
          _parseBlob(pubkey),
          BigInt("0x" + expiration),
          // expiration in JSON is an hexa string (See toJSON() below).
          targets && targets.map((t3) => {
            if (typeof t3 !== "string") {
              throw new Error("Invalid target.");
            }
            return Principal$1.fromHex(t3);
          })
        ),
        signature: _parseBlob(signature)
      };
    });
    return new this(parsedDelegations, _parseBlob(publicKey));
  }
  /**
   * Creates a DelegationChain object from a list of delegations and a DER-encoded public key.
   * @param delegations The list of delegations.
   * @param publicKey The DER-encoded public key of the key-pair signing the first delegation.
   */
  static fromDelegations(delegations, publicKey) {
    return new this(delegations, publicKey);
  }
  constructor(delegations, publicKey) {
    this.delegations = delegations;
    this.publicKey = publicKey;
  }
  toJSON() {
    return {
      delegations: this.delegations.map((signedDelegation) => {
        const { delegation, signature } = signedDelegation;
        const { targets } = delegation;
        return {
          delegation: {
            expiration: delegation.expiration.toString(16),
            pubkey: bytesToHex(delegation.pubkey),
            ...targets && {
              targets: targets.map((t3) => t3.toHex())
            }
          },
          signature: bytesToHex(signature)
        };
      }),
      publicKey: bytesToHex(this.publicKey)
    };
  }
}
class DelegationIdentity extends SignIdentity {
  /**
   * Create a delegation without having access to delegateKey.
   * @param key The key used to sign the requests.
   * @param delegation A delegation object created using `createDelegation`.
   */
  static fromDelegation(key, delegation) {
    return new this(key, delegation);
  }
  constructor(_inner2, _delegation) {
    super();
    this._inner = _inner2;
    this._delegation = _delegation;
  }
  getDelegation() {
    return this._delegation;
  }
  getPublicKey() {
    return {
      derKey: this._delegation.publicKey,
      toDer: () => this._delegation.publicKey
    };
  }
  sign(blob) {
    return this._inner.sign(blob);
  }
  async transformRequest(request2) {
    const { body, ...fields } = request2;
    const requestId = await requestIdOf(body);
    return {
      ...fields,
      body: {
        content: body,
        sender_sig: await this.sign(new Uint8Array([...IC_REQUEST_DOMAIN_SEPARATOR, ...new Uint8Array(requestId)])),
        sender_delegation: this._delegation.delegations,
        sender_pubkey: this._delegation.publicKey
      }
    };
  }
}
class PartialDelegationIdentity extends PartialIdentity {
  #delegation;
  /**
   * The Delegation Chain of this identity.
   */
  get delegation() {
    return this.#delegation;
  }
  constructor(inner, delegation) {
    super(inner);
    this.#delegation = delegation;
  }
  /**
   * Create a {@link PartialDelegationIdentity} from a {@link PublicKey} and a {@link DelegationChain}.
   * @param key The {@link PublicKey} to delegate to.
   * @param delegation a {@link DelegationChain} targeting the inner key.
   */
  static fromDelegation(key, delegation) {
    return new PartialDelegationIdentity(key, delegation);
  }
}
function isDelegationValid(chain2, checks) {
  for (const { delegation } of chain2.delegations) {
    if (+new Date(Number(delegation.expiration / BigInt(1e6))) <= +Date.now()) {
      return false;
    }
  }
  const scopes = [];
  for (const s2 of scopes) {
    const scope = s2.toText();
    for (const { delegation } of chain2.delegations) {
      if (delegation.targets === void 0) {
        continue;
      }
      let none = true;
      for (const target of delegation.targets) {
        if (target.toText() === scope) {
          none = false;
          break;
        }
      }
      if (none) {
        return false;
      }
    }
  }
  return true;
}
const events = ["mousedown", "mousemove", "keydown", "touchstart", "wheel"];
class IdleManager {
  callbacks = [];
  idleTimeout = 10 * 60 * 1e3;
  timeoutID = void 0;
  /**
   * Creates an {@link IdleManager}
   * @param {IdleManagerOptions} options Optional configuration
   * @see {@link IdleManagerOptions}
   * @param options.onIdle Callback once user has been idle. Use to prompt for fresh login, and use `Actor.agentOf(your_actor).invalidateIdentity()` to protect the user
   * @param options.idleTimeout timeout in ms
   * @param options.captureScroll capture scroll events
   * @param options.scrollDebounce scroll debounce time in ms
   */
  static create(options = {}) {
    return new this(options);
  }
  /**
   * @protected
   * @param options {@link IdleManagerOptions}
   */
  constructor(options = {}) {
    const { onIdle, idleTimeout = 10 * 60 * 1e3 } = options || {};
    this.callbacks = onIdle ? [onIdle] : [];
    this.idleTimeout = idleTimeout;
    const _resetTimer = this._resetTimer.bind(this);
    window.addEventListener("load", _resetTimer, true);
    events.forEach(function(name) {
      document.addEventListener(name, _resetTimer, true);
    });
    const debounce = (func, wait) => {
      let timeout2;
      return (...args) => {
        const context = this;
        const later = function() {
          timeout2 = void 0;
          func.apply(context, args);
        };
        clearTimeout(timeout2);
        timeout2 = window.setTimeout(later, wait);
      };
    };
    if (options?.captureScroll) {
      const scroll = debounce(_resetTimer, options?.scrollDebounce ?? 100);
      window.addEventListener("scroll", scroll, true);
    }
    _resetTimer();
  }
  /**
   * @param {IdleCB} callback function to be called when user goes idle
   */
  registerCallback(callback) {
    this.callbacks.push(callback);
  }
  /**
   * Cleans up the idle manager and its listeners
   */
  exit() {
    clearTimeout(this.timeoutID);
    window.removeEventListener("load", this._resetTimer, true);
    const _resetTimer = this._resetTimer.bind(this);
    events.forEach(function(name) {
      document.removeEventListener(name, _resetTimer, true);
    });
    this.callbacks.forEach((cb) => cb());
  }
  /**
   * Resets the timeouts during cleanup
   */
  _resetTimer() {
    const exit = this.exit.bind(this);
    window.clearTimeout(this.timeoutID);
    this.timeoutID = window.setTimeout(exit, this.idleTimeout);
  }
}
const instanceOfAny = (object, constructors) => constructors.some((c2) => object instanceof c2);
let idbProxyableTypes;
let cursorAdvanceMethods;
function getIdbProxyableTypes() {
  return idbProxyableTypes || (idbProxyableTypes = [
    IDBDatabase,
    IDBObjectStore,
    IDBIndex,
    IDBCursor,
    IDBTransaction
  ]);
}
function getCursorAdvanceMethods() {
  return cursorAdvanceMethods || (cursorAdvanceMethods = [
    IDBCursor.prototype.advance,
    IDBCursor.prototype.continue,
    IDBCursor.prototype.continuePrimaryKey
  ]);
}
const cursorRequestMap = /* @__PURE__ */ new WeakMap();
const transactionDoneMap = /* @__PURE__ */ new WeakMap();
const transactionStoreNamesMap = /* @__PURE__ */ new WeakMap();
const transformCache = /* @__PURE__ */ new WeakMap();
const reverseTransformCache = /* @__PURE__ */ new WeakMap();
function promisifyRequest(request2) {
  const promise = new Promise((resolve, reject) => {
    const unlisten = () => {
      request2.removeEventListener("success", success);
      request2.removeEventListener("error", error);
    };
    const success = () => {
      resolve(wrap(request2.result));
      unlisten();
    };
    const error = () => {
      reject(request2.error);
      unlisten();
    };
    request2.addEventListener("success", success);
    request2.addEventListener("error", error);
  });
  promise.then((value) => {
    if (value instanceof IDBCursor) {
      cursorRequestMap.set(value, request2);
    }
  }).catch(() => {
  });
  reverseTransformCache.set(promise, request2);
  return promise;
}
function cacheDonePromiseForTransaction(tx) {
  if (transactionDoneMap.has(tx))
    return;
  const done = new Promise((resolve, reject) => {
    const unlisten = () => {
      tx.removeEventListener("complete", complete);
      tx.removeEventListener("error", error);
      tx.removeEventListener("abort", error);
    };
    const complete = () => {
      resolve();
      unlisten();
    };
    const error = () => {
      reject(tx.error || new DOMException("AbortError", "AbortError"));
      unlisten();
    };
    tx.addEventListener("complete", complete);
    tx.addEventListener("error", error);
    tx.addEventListener("abort", error);
  });
  transactionDoneMap.set(tx, done);
}
let idbProxyTraps = {
  get(target, prop, receiver) {
    if (target instanceof IDBTransaction) {
      if (prop === "done")
        return transactionDoneMap.get(target);
      if (prop === "objectStoreNames") {
        return target.objectStoreNames || transactionStoreNamesMap.get(target);
      }
      if (prop === "store") {
        return receiver.objectStoreNames[1] ? void 0 : receiver.objectStore(receiver.objectStoreNames[0]);
      }
    }
    return wrap(target[prop]);
  },
  set(target, prop, value) {
    target[prop] = value;
    return true;
  },
  has(target, prop) {
    if (target instanceof IDBTransaction && (prop === "done" || prop === "store")) {
      return true;
    }
    return prop in target;
  }
};
function replaceTraps(callback) {
  idbProxyTraps = callback(idbProxyTraps);
}
function wrapFunction(func) {
  if (func === IDBDatabase.prototype.transaction && !("objectStoreNames" in IDBTransaction.prototype)) {
    return function(storeNames, ...args) {
      const tx = func.call(unwrap(this), storeNames, ...args);
      transactionStoreNamesMap.set(tx, storeNames.sort ? storeNames.sort() : [storeNames]);
      return wrap(tx);
    };
  }
  if (getCursorAdvanceMethods().includes(func)) {
    return function(...args) {
      func.apply(unwrap(this), args);
      return wrap(cursorRequestMap.get(this));
    };
  }
  return function(...args) {
    return wrap(func.apply(unwrap(this), args));
  };
}
function transformCachableValue(value) {
  if (typeof value === "function")
    return wrapFunction(value);
  if (value instanceof IDBTransaction)
    cacheDonePromiseForTransaction(value);
  if (instanceOfAny(value, getIdbProxyableTypes()))
    return new Proxy(value, idbProxyTraps);
  return value;
}
function wrap(value) {
  if (value instanceof IDBRequest)
    return promisifyRequest(value);
  if (transformCache.has(value))
    return transformCache.get(value);
  const newValue = transformCachableValue(value);
  if (newValue !== value) {
    transformCache.set(value, newValue);
    reverseTransformCache.set(newValue, value);
  }
  return newValue;
}
const unwrap = (value) => reverseTransformCache.get(value);
function openDB(name, version, { blocked, upgrade, blocking, terminated } = {}) {
  const request2 = indexedDB.open(name, version);
  const openPromise = wrap(request2);
  if (upgrade) {
    request2.addEventListener("upgradeneeded", (event) => {
      upgrade(wrap(request2.result), event.oldVersion, event.newVersion, wrap(request2.transaction), event);
    });
  }
  if (blocked) {
    request2.addEventListener("blocked", (event) => blocked(
      // Casting due to https://github.com/microsoft/TypeScript-DOM-lib-generator/pull/1405
      event.oldVersion,
      event.newVersion,
      event
    ));
  }
  openPromise.then((db) => {
    if (terminated)
      db.addEventListener("close", () => terminated());
    if (blocking) {
      db.addEventListener("versionchange", (event) => blocking(event.oldVersion, event.newVersion, event));
    }
  }).catch(() => {
  });
  return openPromise;
}
const readMethods = ["get", "getKey", "getAll", "getAllKeys", "count"];
const writeMethods = ["put", "add", "delete", "clear"];
const cachedMethods = /* @__PURE__ */ new Map();
function getMethod(target, prop) {
  if (!(target instanceof IDBDatabase && !(prop in target) && typeof prop === "string")) {
    return;
  }
  if (cachedMethods.get(prop))
    return cachedMethods.get(prop);
  const targetFuncName = prop.replace(/FromIndex$/, "");
  const useIndex = prop !== targetFuncName;
  const isWrite = writeMethods.includes(targetFuncName);
  if (
    // Bail if the target doesn't exist on the target. Eg, getAll isn't in Edge.
    !(targetFuncName in (useIndex ? IDBIndex : IDBObjectStore).prototype) || !(isWrite || readMethods.includes(targetFuncName))
  ) {
    return;
  }
  const method = async function(storeName, ...args) {
    const tx = this.transaction(storeName, isWrite ? "readwrite" : "readonly");
    let target2 = tx.store;
    if (useIndex)
      target2 = target2.index(args.shift());
    return (await Promise.all([
      target2[targetFuncName](...args),
      isWrite && tx.done
    ]))[0];
  };
  cachedMethods.set(prop, method);
  return method;
}
replaceTraps((oldTraps) => ({
  ...oldTraps,
  get: (target, prop, receiver) => getMethod(target, prop) || oldTraps.get(target, prop, receiver),
  has: (target, prop) => !!getMethod(target, prop) || oldTraps.has(target, prop)
}));
const AUTH_DB_NAME = "auth-client-db";
const OBJECT_STORE_NAME = "ic-keyval";
const _openDbStore = async (dbName = AUTH_DB_NAME, storeName = OBJECT_STORE_NAME, version) => {
  if (isBrowser && localStorage?.getItem(KEY_STORAGE_DELEGATION)) {
    localStorage.removeItem(KEY_STORAGE_DELEGATION);
    localStorage.removeItem(KEY_STORAGE_KEY);
  }
  return await openDB(dbName, version, {
    upgrade: (database) => {
      if (database.objectStoreNames.contains(storeName)) {
        database.clear(storeName);
      }
      database.createObjectStore(storeName);
    }
  });
};
async function _getValue(db, storeName, key) {
  return await db.get(storeName, key);
}
async function _setValue(db, storeName, key, value) {
  return await db.put(storeName, value, key);
}
async function _removeValue(db, storeName, key) {
  return await db.delete(storeName, key);
}
class IdbKeyVal {
  _db;
  _storeName;
  /**
   * @param {DBCreateOptions} options - DBCreateOptions
   * @param {DBCreateOptions['dbName']} options.dbName name for the indexeddb database
   * @default
   * @param {DBCreateOptions['storeName']} options.storeName name for the indexeddb Data Store
   * @default
   * @param {DBCreateOptions['version']} options.version version of the database. Increment to safely upgrade
   */
  static async create(options) {
    const { dbName = AUTH_DB_NAME, storeName = OBJECT_STORE_NAME, version = DB_VERSION } = options ?? {};
    const db = await _openDbStore(dbName, storeName, version);
    return new IdbKeyVal(db, storeName);
  }
  // Do not use - instead prefer create
  constructor(_db, _storeName) {
    this._db = _db;
    this._storeName = _storeName;
  }
  /**
   * Basic setter
   * @param {IDBValidKey} key string | number | Date | BufferSource | IDBValidKey[]
   * @param value value to set
   * @returns void
   */
  async set(key, value) {
    return await _setValue(this._db, this._storeName, key, value);
  }
  /**
   * Basic getter
   * Pass in a type T for type safety if you know the type the value will have if it is found
   * @param {IDBValidKey} key string | number | Date | BufferSource | IDBValidKey[]
   * @returns `Promise<T | null>`
   * @example
   * await get<string>('exampleKey') -> 'exampleValue'
   */
  async get(key) {
    return await _getValue(this._db, this._storeName, key) ?? null;
  }
  /**
   * Remove a key
   * @param key {@link IDBValidKey}
   * @returns void
   */
  async remove(key) {
    return await _removeValue(this._db, this._storeName, key);
  }
}
const KEY_STORAGE_KEY = "identity";
const KEY_STORAGE_DELEGATION = "delegation";
const KEY_VECTOR = "iv";
const DB_VERSION = 1;
const isBrowser = typeof window !== "undefined";
class LocalStorage {
  prefix;
  _localStorage;
  constructor(prefix = "ic-", _localStorage) {
    this.prefix = prefix;
    this._localStorage = _localStorage;
  }
  get(key) {
    return Promise.resolve(this._getLocalStorage().getItem(this.prefix + key));
  }
  set(key, value) {
    this._getLocalStorage().setItem(this.prefix + key, value);
    return Promise.resolve();
  }
  remove(key) {
    this._getLocalStorage().removeItem(this.prefix + key);
    return Promise.resolve();
  }
  _getLocalStorage() {
    if (this._localStorage) {
      return this._localStorage;
    }
    const ls = typeof window === "undefined" ? typeof globalThis === "undefined" ? typeof self === "undefined" ? void 0 : self.localStorage : globalThis.localStorage : window.localStorage;
    if (!ls) {
      throw new Error("Could not find local storage.");
    }
    return ls;
  }
}
class IdbStorage {
  #options;
  /**
   * @param options - DBCreateOptions
   * @param options.dbName - name for the indexeddb database
   * @param options.storeName - name for the indexeddb Data Store
   * @param options.version - version of the database. Increment to safely upgrade
   * @example
   * ```ts
   * const storage = new IdbStorage({ dbName: 'my-db', storeName: 'my-store', version: 2 });
   * ```
   */
  constructor(options) {
    this.#options = options ?? {};
  }
  // Initializes a KeyVal on first request
  initializedDb;
  get _db() {
    return new Promise((resolve) => {
      if (this.initializedDb) {
        resolve(this.initializedDb);
        return;
      }
      IdbKeyVal.create(this.#options).then((db) => {
        this.initializedDb = db;
        resolve(db);
      });
    });
  }
  async get(key) {
    const db = await this._db;
    return await db.get(key);
  }
  async set(key, value) {
    const db = await this._db;
    await db.set(key, value);
  }
  async remove(key) {
    const db = await this._db;
    await db.remove(key);
  }
}
const NANOSECONDS_PER_SECOND = BigInt(1e9);
const SECONDS_PER_HOUR = BigInt(3600);
const NANOSECONDS_PER_HOUR = NANOSECONDS_PER_SECOND * SECONDS_PER_HOUR;
const IDENTITY_PROVIDER_DEFAULT = "https://identity.internetcomputer.org";
const IDENTITY_PROVIDER_ENDPOINT = "#authorize";
const DEFAULT_MAX_TIME_TO_LIVE = BigInt(8) * NANOSECONDS_PER_HOUR;
const ECDSA_KEY_LABEL = "ECDSA";
const ED25519_KEY_LABEL = "Ed25519";
const INTERRUPT_CHECK_INTERVAL = 500;
const ERROR_USER_INTERRUPT = "UserInterrupt";
class AuthClient {
  _identity;
  _key;
  _chain;
  _storage;
  idleManager;
  _createOptions;
  _idpWindow;
  _eventHandler;
  /**
   * Create an AuthClient to manage authentication and identity
   * @param {AuthClientCreateOptions} options - Options for creating an {@link AuthClient}
   * @see {@link AuthClientCreateOptions}
   * @param options.identity Optional Identity to use as the base
   * @see {@link SignIdentity}
   * @param options.storage Storage mechanism for delegation credentials
   * @see {@link AuthClientStorage}
   * @param options.keyType Type of key to use for the base key
   * @param {IdleOptions} options.idleOptions Configures an {@link IdleManager}
   * @see {@link IdleOptions}
   * Default behavior is to clear stored identity and reload the page when a user goes idle, unless you set the disableDefaultIdleCallback flag or pass in a custom idle callback.
   * @example
   * const authClient = await AuthClient.create({
   *   idleOptions: {
   *     disableIdle: true
   *   }
   * })
   */
  static async create(options = {}) {
    const storage = options.storage ?? new IdbStorage();
    const keyType = options.keyType ?? ECDSA_KEY_LABEL;
    let key = null;
    if (options.identity) {
      key = options.identity;
    } else {
      let maybeIdentityStorage = await storage.get(KEY_STORAGE_KEY);
      if (!maybeIdentityStorage && isBrowser) {
        try {
          const fallbackLocalStorage = new LocalStorage();
          const localChain = await fallbackLocalStorage.get(KEY_STORAGE_DELEGATION);
          const localKey = await fallbackLocalStorage.get(KEY_STORAGE_KEY);
          if (localChain && localKey && keyType === ECDSA_KEY_LABEL) {
            console.log("Discovered an identity stored in localstorage. Migrating to IndexedDB");
            await storage.set(KEY_STORAGE_DELEGATION, localChain);
            await storage.set(KEY_STORAGE_KEY, localKey);
            maybeIdentityStorage = localChain;
            await fallbackLocalStorage.remove(KEY_STORAGE_DELEGATION);
            await fallbackLocalStorage.remove(KEY_STORAGE_KEY);
          }
        } catch (error) {
          console.error("error while attempting to recover localstorage: " + error);
        }
      }
      if (maybeIdentityStorage) {
        try {
          if (typeof maybeIdentityStorage === "object") {
            if (keyType === ED25519_KEY_LABEL && typeof maybeIdentityStorage === "string") {
              key = Ed25519KeyIdentity.fromJSON(maybeIdentityStorage);
            } else {
              key = await ECDSAKeyIdentity.fromKeyPair(maybeIdentityStorage);
            }
          } else if (typeof maybeIdentityStorage === "string") {
            key = Ed25519KeyIdentity.fromJSON(maybeIdentityStorage);
          }
        } catch {
        }
      }
    }
    let identity = new AnonymousIdentity();
    let chain2 = null;
    if (key) {
      try {
        const chainStorage = await storage.get(KEY_STORAGE_DELEGATION);
        if (typeof chainStorage === "object" && chainStorage !== null) {
          throw new Error("Delegation chain is incorrectly stored. A delegation chain should be stored as a string.");
        }
        if (options.identity) {
          identity = options.identity;
        } else if (chainStorage) {
          chain2 = DelegationChain.fromJSON(chainStorage);
          if (!isDelegationValid(chain2)) {
            await _deleteStorage(storage);
            key = null;
          } else {
            if ("toDer" in key) {
              identity = PartialDelegationIdentity.fromDelegation(key, chain2);
            } else {
              identity = DelegationIdentity.fromDelegation(key, chain2);
            }
          }
        }
      } catch (e5) {
        console.error(e5);
        await _deleteStorage(storage);
        key = null;
      }
    }
    let idleManager;
    if (options.idleOptions?.disableIdle) {
      idleManager = void 0;
    } else if (chain2 || options.identity) {
      idleManager = IdleManager.create(options.idleOptions);
    }
    if (!key) {
      if (keyType === ED25519_KEY_LABEL) {
        key = Ed25519KeyIdentity.generate();
        await storage.set(KEY_STORAGE_KEY, JSON.stringify(key.toJSON()));
      } else {
        if (options.storage && keyType === ECDSA_KEY_LABEL) {
          console.warn(`You are using a custom storage provider that may not support CryptoKey storage. If you are using a custom storage provider that does not support CryptoKey storage, you should use '${ED25519_KEY_LABEL}' as the key type, as it can serialize to a string`);
        }
        key = await ECDSAKeyIdentity.generate();
        await storage.set(KEY_STORAGE_KEY, key.getKeyPair());
      }
    }
    return new this(identity, key, chain2, storage, idleManager, options);
  }
  constructor(_identity, _key, _chain, _storage, idleManager, _createOptions, _idpWindow, _eventHandler) {
    this._identity = _identity;
    this._key = _key;
    this._chain = _chain;
    this._storage = _storage;
    this.idleManager = idleManager;
    this._createOptions = _createOptions;
    this._idpWindow = _idpWindow;
    this._eventHandler = _eventHandler;
    this._registerDefaultIdleCallback();
  }
  _registerDefaultIdleCallback() {
    const idleOptions = this._createOptions?.idleOptions;
    if (!idleOptions?.onIdle && !idleOptions?.disableDefaultIdleCallback) {
      this.idleManager?.registerCallback(() => {
        this.logout();
        location.reload();
      });
    }
  }
  async _handleSuccess(message, onSuccess) {
    const delegations = message.delegations.map((signedDelegation) => {
      return {
        delegation: new Delegation(signedDelegation.delegation.pubkey, signedDelegation.delegation.expiration, signedDelegation.delegation.targets),
        signature: signedDelegation.signature
      };
    });
    const delegationChain = DelegationChain.fromDelegations(delegations, message.userPublicKey);
    const key = this._key;
    if (!key) {
      return;
    }
    this._chain = delegationChain;
    if ("toDer" in key) {
      this._identity = PartialDelegationIdentity.fromDelegation(key, this._chain);
    } else {
      this._identity = DelegationIdentity.fromDelegation(key, this._chain);
    }
    this._idpWindow?.close();
    const idleOptions = this._createOptions?.idleOptions;
    if (!this.idleManager && !idleOptions?.disableIdle) {
      this.idleManager = IdleManager.create(idleOptions);
      this._registerDefaultIdleCallback();
    }
    this._removeEventListener();
    delete this._idpWindow;
    if (this._chain) {
      await this._storage.set(KEY_STORAGE_DELEGATION, JSON.stringify(this._chain.toJSON()));
    }
    onSuccess?.(message);
  }
  getIdentity() {
    return this._identity;
  }
  async isAuthenticated() {
    return !this.getIdentity().getPrincipal().isAnonymous() && this._chain !== null && isDelegationValid(this._chain);
  }
  /**
   * AuthClient Login - Opens up a new window to authenticate with Internet Identity
   * @param {AuthClientLoginOptions} options - Options for logging in, merged with the options set during creation if any. Note: we only perform a shallow merge for the `customValues` property.
   * @param options.identityProvider Identity provider
   * @param options.maxTimeToLive Expiration of the authentication in nanoseconds
   * @param options.allowPinAuthentication If present, indicates whether or not the Identity Provider should allow the user to authenticate and/or register using a temporary key/PIN identity. Authenticating dapps may want to prevent users from using Temporary keys/PIN identities because Temporary keys/PIN identities are less secure than Passkeys (webauthn credentials) and because Temporary keys/PIN identities generally only live in a browser database (which may get cleared by the browser/OS).
   * @param options.derivationOrigin Origin for Identity Provider to use while generating the delegated identity
   * @param options.windowOpenerFeatures Configures the opened authentication window
   * @param options.onSuccess Callback once login has completed
   * @param options.onError Callback in case authentication fails
   * @param options.customValues Extra values to be passed in the login request during the authorize-ready phase. Note: we only perform a shallow merge for the `customValues` property.
   * @example
   * const authClient = await AuthClient.create();
   * authClient.login({
   *  identityProvider: 'http://<canisterID>.127.0.0.1:8000',
   *  maxTimeToLive: BigInt (7) * BigInt(24) * BigInt(3_600_000_000_000), // 1 week
   *  windowOpenerFeatures: "toolbar=0,location=0,menubar=0,width=500,height=500,left=100,top=100",
   *  onSuccess: () => {
   *    console.log('Login Successful!');
   *  },
   *  onError: (error) => {
   *    console.error('Login Failed: ', error);
   *  }
   * });
   */
  async login(options) {
    const loginOptions = mergeLoginOptions(this._createOptions?.loginOptions, options);
    const maxTimeToLive = loginOptions?.maxTimeToLive ?? DEFAULT_MAX_TIME_TO_LIVE;
    const identityProviderUrl = new URL(loginOptions?.identityProvider?.toString() || IDENTITY_PROVIDER_DEFAULT);
    identityProviderUrl.hash = IDENTITY_PROVIDER_ENDPOINT;
    this._idpWindow?.close();
    this._removeEventListener();
    this._eventHandler = this._getEventHandler(identityProviderUrl, {
      maxTimeToLive,
      ...loginOptions
    });
    window.addEventListener("message", this._eventHandler);
    this._idpWindow = window.open(identityProviderUrl.toString(), "idpWindow", loginOptions?.windowOpenerFeatures) ?? void 0;
    const checkInterruption = () => {
      if (this._idpWindow) {
        if (this._idpWindow.closed) {
          this._handleFailure(ERROR_USER_INTERRUPT, loginOptions?.onError);
        } else {
          setTimeout(checkInterruption, INTERRUPT_CHECK_INTERVAL);
        }
      }
    };
    checkInterruption();
  }
  _getEventHandler(identityProviderUrl, options) {
    return async (event) => {
      if (event.origin !== identityProviderUrl.origin) {
        return;
      }
      const message = event.data;
      switch (message.kind) {
        case "authorize-ready": {
          const request2 = {
            kind: "authorize-client",
            sessionPublicKey: new Uint8Array(this._key?.getPublicKey().toDer()),
            maxTimeToLive: options?.maxTimeToLive,
            allowPinAuthentication: options?.allowPinAuthentication,
            derivationOrigin: options?.derivationOrigin?.toString(),
            // Pass any custom values to the IDP.
            ...options?.customValues
          };
          this._idpWindow?.postMessage(request2, identityProviderUrl.origin);
          break;
        }
        case "authorize-client-success":
          try {
            await this._handleSuccess(message, options?.onSuccess);
          } catch (err) {
            this._handleFailure(err.message, options?.onError);
          }
          break;
        case "authorize-client-failure":
          this._handleFailure(message.text, options?.onError);
          break;
      }
    };
  }
  _handleFailure(errorMessage, onError) {
    this._idpWindow?.close();
    onError?.(errorMessage);
    this._removeEventListener();
    delete this._idpWindow;
  }
  _removeEventListener() {
    if (this._eventHandler) {
      window.removeEventListener("message", this._eventHandler);
    }
    this._eventHandler = void 0;
  }
  async logout(options = {}) {
    await _deleteStorage(this._storage);
    this._identity = new AnonymousIdentity();
    this._chain = null;
    if (options.returnTo) {
      try {
        window.history.pushState({}, "", options.returnTo);
      } catch {
        window.location.href = options.returnTo;
      }
    }
  }
}
async function _deleteStorage(storage) {
  await storage.remove(KEY_STORAGE_KEY);
  await storage.remove(KEY_STORAGE_DELEGATION);
  await storage.remove(KEY_VECTOR);
}
function mergeLoginOptions(loginOptions, otherLoginOptions) {
  if (!loginOptions && !otherLoginOptions) {
    return void 0;
  }
  const customValues = loginOptions?.customValues || otherLoginOptions?.customValues ? {
    ...loginOptions?.customValues,
    ...otherLoginOptions?.customValues
  } : void 0;
  return {
    ...loginOptions,
    ...otherLoginOptions,
    customValues
  };
}
var I = ((n2) => (n2[n2.FractionalMoreThan8Decimals = 0] = "FractionalMoreThan8Decimals", n2[n2.InvalidFormat = 1] = "InvalidFormat", n2[n2.FractionalTooManyDecimals = 2] = "FractionalTooManyDecimals", n2))(I || {});
BigInt(1e8);
var w$3 = class w2 {
  constructor(t3, r2, n2) {
    this.id = t3;
    this.service = r2;
    this.certifiedService = n2;
  }
  get canisterId() {
    return this.id;
  }
  caller = ({ certified: t3 = true }) => t3 ? this.certifiedService : this.service;
};
var u$2 = (e5) => e5 == null, s$1 = (e5) => !u$2(e5);
var O$2 = () => HttpAgent.createSync({ host: "https://icp-api.io", identity: new AnonymousIdentity() });
var lt = ({ options: { canisterId: e5, serviceOverride: t3, certifiedServiceOverride: r2, agent: n2, callTransform: o3, queryTransform: i3 }, idlFactory: c2, certifiedIdlFactory: a2 }) => {
  let x3 = n2 ?? O$2(), m2 = t3 ?? Actor.createActor(c2, { agent: x3, canisterId: e5, callTransform: o3, queryTransform: i3 }), d2 = r2 ?? Actor.createActor(a2, { agent: x3, canisterId: e5, callTransform: o3, queryTransform: i3 });
  return { service: m2, certifiedService: d2, agent: x3, canisterId: e5 };
};
var A$2 = class A extends Error {
}, f$1 = (e5, t3) => {
  if (e5 == null) throw new A$2(t3);
};
var _t = (e5) => new Uint8Array(e5), St = (e5) => Array.from(e5).map((t3) => t3.charCodeAt(0)), wt = (e5) => {
  let t3 = e5.match(/.{1,2}/g);
  return f$1(t3, "Invalid hex string."), Uint8Array.from(t3.map((r2) => parseInt(r2, 16)));
}, k$1 = (e5) => (e5 instanceof Uint8Array || (e5 = Uint8Array.from(e5)), e5.reduce((t3, r2) => t3 + r2.toString(16).padStart(2, "0"), ""));
var g$1 = "abcdefghijklmnopqrstuvwxyz234567", b$2 = /* @__PURE__ */ Object.create(null);
for (let e5 = 0; e5 < g$1.length; e5++) b$2[g$1[e5]] = e5;
b$2[0] = b$2.o;
b$2[1] = b$2.i;
var $ = new Uint32Array([0, 1996959894, 3993919788, 2567524794, 124634137, 1886057615, 3915621685, 2657392035, 249268274, 2044508324, 3772115230, 2547177864, 162941995, 2125561021, 3887607047, 2428444049, 498536548, 1789927666, 4089016648, 2227061214, 450548861, 1843258603, 4107580753, 2211677639, 325883990, 1684777152, 4251122042, 2321926636, 335633487, 1661365465, 4195302755, 2366115317, 997073096, 1281953886, 3579855332, 2724688242, 1006888145, 1258607687, 3524101629, 2768942443, 901097722, 1119000684, 3686517206, 2898065728, 853044451, 1172266101, 3705015759, 2882616665, 651767980, 1373503546, 3369554304, 3218104598, 565507253, 1454621731, 3485111705, 3099436303, 671266974, 1594198024, 3322730930, 2970347812, 795835527, 1483230225, 3244367275, 3060149565, 1994146192, 31158534, 2563907772, 4023717930, 1907459465, 112637215, 2680153253, 3904427059, 2013776290, 251722036, 2517215374, 3775830040, 2137656763, 141376813, 2439277719, 3865271297, 1802195444, 476864866, 2238001368, 4066508878, 1812370925, 453092731, 2181625025, 4111451223, 1706088902, 314042704, 2344532202, 4240017532, 1658658271, 366619977, 2362670323, 4224994405, 1303535960, 984961486, 2747007092, 3569037538, 1256170817, 1037604311, 2765210733, 3554079995, 1131014506, 879679996, 2909243462, 3663771856, 1141124467, 855842277, 2852801631, 3708648649, 1342533948, 654459306, 3188396048, 3373015174, 1466479909, 544179635, 3110523913, 3462522015, 1591671054, 702138776, 2966460450, 3352799412, 1504918807, 783551873, 3082640443, 3233442989, 3988292384, 2596254646, 62317068, 1957810842, 3939845945, 2647816111, 81470997, 1943803523, 3814918930, 2489596804, 225274430, 2053790376, 3826175755, 2466906013, 167816743, 2097651377, 4027552580, 2265490386, 503444072, 1762050814, 4150417245, 2154129355, 426522225, 1852507879, 4275313526, 2312317920, 282753626, 1742555852, 4189708143, 2394877945, 397917763, 1622183637, 3604390888, 2714866558, 953729732, 1340076626, 3518719985, 2797360999, 1068828381, 1219638859, 3624741850, 2936675148, 906185462, 1090812512, 3747672003, 2825379669, 829329135, 1181335161, 3412177804, 3160834842, 628085408, 1382605366, 3423369109, 3138078467, 570562233, 1426400815, 3317316542, 2998733608, 733239954, 1555261956, 3268935591, 3050360625, 752459403, 1541320221, 2607071920, 3965973030, 1969922972, 40735498, 2617837225, 3943577151, 1913087877, 83908371, 2512341634, 3803740692, 2075208622, 213261112, 2463272603, 3855990285, 2094854071, 198958881, 2262029012, 4057260610, 1759359992, 534414190, 2176718541, 4139329115, 1873836001, 414664567, 2282248934, 4279200368, 1711684554, 285281116, 2405801727, 4167216745, 1634467795, 376229701, 2685067896, 3608007406, 1308918612, 956543938, 2808555105, 3495958263, 1231636301, 1047427035, 2932959818, 3654703836, 1088359270, 936918e3, 2847714899, 3736837829, 1202900863, 817233897, 3183342108, 3401237130, 1404277552, 615818150, 3134207493, 3453421203, 1423857449, 601450431, 3009837614, 3294710456, 1567103746, 711928724, 3020668471, 3272380065, 1510334235, 755167117]), J = (e5) => {
  let t3 = -1;
  for (let r2 = 0; r2 < e5.length; r2++) {
    let o3 = (e5[r2] ^ t3) & 255;
    t3 = $[o3] ^ t3 >>> 8;
  }
  return (t3 ^ -1) >>> 0;
}, Lt = (e5) => {
  let t3 = new ArrayBuffer(4);
  return new DataView(t3).setUint32(0, J(e5), false), new Uint8Array(t3);
};
var re = (e5) => s$1(e5) ? [e5] : [], K = (e5) => e5?.[0];
var u$1 = ((t3) => (t3[t3.Controllers = 0] = "Controllers", t3[t3.Public = 1] = "Public", t3))(u$1 || {}), i$1 = class i extends Error {
}, P = ({ controllers: r2, freezingThreshold: a2, memoryAllocation: t3, computeAllocation: s2, reservedCyclesLimit: o3, logVisibility: n2, wasmMemoryLimit: l3, wasmMemoryThreshold: c2 } = {}) => {
  let m2 = () => {
    switch (n2) {
      case 0:
        return { controllers: null };
      case 1:
        return { public: null };
      default:
        throw new i$1();
    }
  };
  return { controllers: re(r2?.map((d2) => Principal$1.fromText(d2))), freezing_threshold: re(a2), memory_allocation: re(t3), compute_allocation: re(s2), reserved_cycles_limit: re(o3), log_visibility: u$2(n2) ? [] : [m2()], wasm_memory_limit: re(l3), wasm_memory_threshold: re(c2) };
};
var Et = ({ IDL: t22 }) => {
  let e5 = t22.Variant({ mainnet: t22.Null, testnet: t22.Null }), n2 = t22.Text, c2 = t22.Record({ network: e5, address: n2, min_confirmations: t22.Opt(t22.Nat32) }), r2 = t22.Nat64, i3 = r2, o3 = t22.Nat32, u2 = t22.Record({ start_height: o3, end_height: t22.Opt(o3), network: e5 }), F2 = t22.Vec(t22.Nat8), O2 = t22.Record({ tip_height: o3, block_headers: t22.Vec(F2) }), P2 = t22.Record({ network: e5 }), x3 = t22.Nat64, w4 = t22.Vec(x3), C2 = t22.Record({ network: e5, filter: t22.Opt(t22.Variant({ page: t22.Vec(t22.Nat8), min_confirmations: t22.Nat32 })), address: n2 }), T2 = t22.Vec(t22.Nat8), S2 = t22.Record({ txid: t22.Vec(t22.Nat8), vout: t22.Nat32 }), z2 = t22.Record({ height: t22.Nat32, value: r2, outpoint: S2 }), q2 = t22.Record({ next_page: t22.Opt(t22.Vec(t22.Nat8)), tip_height: o3, tip_block_hash: T2, utxos: t22.Vec(z2) }), U2 = t22.Record({ transaction: t22.Vec(t22.Nat8), network: e5 }), s2 = t22.Principal, A4 = t22.Record({ canister_id: s2, num_requested_changes: t22.Opt(t22.Nat64) }), W2 = t22.Variant({ from_user: t22.Record({ user_id: t22.Principal }), from_canister: t22.Record({ canister_version: t22.Opt(t22.Nat64), canister_id: t22.Principal }) }), _2 = t22.Vec(t22.Nat8), B3 = t22.Variant({ creation: t22.Record({ controllers: t22.Vec(t22.Principal) }), code_deployment: t22.Record({ mode: t22.Variant({ reinstall: t22.Null, upgrade: t22.Null, install: t22.Null }), module_hash: t22.Vec(t22.Nat8) }), load_snapshot: t22.Record({ canister_version: t22.Nat64, taken_at_timestamp: t22.Nat64, snapshot_id: _2 }), controllers_change: t22.Record({ controllers: t22.Vec(t22.Principal) }), code_uninstall: t22.Null }), E2 = t22.Record({ timestamp_nanos: t22.Nat64, canister_version: t22.Nat64, origin: W2, details: B3 }), M2 = t22.Record({ controllers: t22.Vec(t22.Principal), module_hash: t22.Opt(t22.Vec(t22.Nat8)), recent_changes: t22.Vec(E2), total_num_changes: t22.Nat64 }), Q2 = t22.Record({ canister_id: s2 }), h2 = t22.Variant({ controllers: t22.Null, public: t22.Null, allowed_viewers: t22.Vec(t22.Principal) }), j2 = t22.Record({ freezing_threshold: t22.Nat, wasm_memory_threshold: t22.Nat, controllers: t22.Vec(t22.Principal), reserved_cycles_limit: t22.Nat, log_visibility: h2, wasm_memory_limit: t22.Nat, memory_allocation: t22.Nat, compute_allocation: t22.Nat }), H2 = t22.Record({ memory_metrics: t22.Record({ wasm_binary_size: t22.Nat, wasm_chunk_store_size: t22.Nat, canister_history_size: t22.Nat, stable_memory_size: t22.Nat, snapshots_size: t22.Nat, wasm_memory_size: t22.Nat, global_memory_size: t22.Nat, custom_sections_size: t22.Nat }), status: t22.Variant({ stopped: t22.Null, stopping: t22.Null, running: t22.Null }), memory_size: t22.Nat, cycles: t22.Nat, settings: j2, query_stats: t22.Record({ response_payload_bytes_total: t22.Nat, num_instructions_total: t22.Nat, num_calls_total: t22.Nat, request_payload_bytes_total: t22.Nat }), idle_cycles_burned_per_day: t22.Nat, module_hash: t22.Opt(t22.Vec(t22.Nat8)), reserved_cycles: t22.Nat }), G2 = t22.Record({ canister_id: s2 }), d2 = t22.Record({ freezing_threshold: t22.Opt(t22.Nat), wasm_memory_threshold: t22.Opt(t22.Nat), controllers: t22.Opt(t22.Vec(t22.Principal)), reserved_cycles_limit: t22.Opt(t22.Nat), log_visibility: t22.Opt(h2), wasm_memory_limit: t22.Opt(t22.Nat), memory_allocation: t22.Opt(t22.Nat), compute_allocation: t22.Opt(t22.Nat) }), J2 = t22.Record({ settings: t22.Opt(d2), sender_canister_version: t22.Opt(t22.Nat64) }), K2 = t22.Record({ canister_id: s2 }), X2 = t22.Record({ canister_id: s2 }), Y2 = t22.Record({ canister_id: s2, snapshot_id: _2 }), Z2 = t22.Record({ canister_id: s2 }), m2 = t22.Variant({ secp256k1: t22.Null }), $2 = t22.Record({ key_id: t22.Record({ name: t22.Text, curve: m2 }), canister_id: t22.Opt(s2), derivation_path: t22.Vec(t22.Vec(t22.Nat8)) }), I2 = t22.Record({ public_key: t22.Vec(t22.Nat8), chain_code: t22.Vec(t22.Nat8) }), L2 = t22.Record({ canister_id: s2 }), D2 = t22.Record({ idx: t22.Nat64, timestamp_nanos: t22.Nat64, content: t22.Vec(t22.Nat8) }), tt2 = t22.Record({ canister_log_records: t22.Vec(D2) }), g2 = t22.Record({ value: t22.Text, name: t22.Text }), l3 = t22.Record({ status: t22.Nat, body: t22.Vec(t22.Nat8), headers: t22.Vec(g2) }), et2 = t22.Record({ url: t22.Text, method: t22.Variant({ get: t22.Null, head: t22.Null, post: t22.Null }), max_response_bytes: t22.Opt(t22.Nat64), body: t22.Opt(t22.Vec(t22.Nat8)), transform: t22.Opt(t22.Record({ function: t22.Func([t22.Record({ context: t22.Vec(t22.Nat8), response: l3 })], [l3], []), context: t22.Vec(t22.Nat8) })), headers: t22.Vec(g2) }), N2 = t22.Variant({ reinstall: t22.Null, upgrade: t22.Opt(t22.Record({ wasm_memory_persistence: t22.Opt(t22.Variant({ keep: t22.Null, replace: t22.Null })), skip_pre_upgrade: t22.Opt(t22.Bool) })), install: t22.Null }), p2 = t22.Record({ hash: t22.Vec(t22.Nat8) }), st2 = t22.Record({ arg: t22.Vec(t22.Nat8), wasm_module_hash: t22.Vec(t22.Nat8), mode: N2, chunk_hashes_list: t22.Vec(p2), target_canister: s2, store_canister: t22.Opt(s2), sender_canister_version: t22.Opt(t22.Nat64) }), nt2 = t22.Vec(t22.Nat8), ct2 = t22.Record({ arg: t22.Vec(t22.Nat8), wasm_module: nt2, mode: N2, canister_id: s2, sender_canister_version: t22.Opt(t22.Nat64) }), rt = t22.Record({ canister_id: s2 }), y2 = t22.Record({ id: _2, total_size: t22.Nat64, taken_at_timestamp: t22.Nat64 }), at = t22.Vec(y2), it2 = t22.Record({ canister_id: s2, sender_canister_version: t22.Opt(t22.Nat64), snapshot_id: _2 }), ot2 = t22.Record({ start_at_timestamp_nanos: t22.Nat64, subnet_id: t22.Principal }), _t2 = t22.Record({ num_block_failures_total: t22.Nat64, node_id: t22.Principal, num_blocks_proposed_total: t22.Nat64 }), dt2 = t22.Vec(t22.Record({ timestamp_nanos: t22.Nat64, node_metrics: t22.Vec(_t2) })), lt2 = t22.Record({ settings: t22.Opt(d2), specified_id: t22.Opt(s2), amount: t22.Opt(t22.Nat), sender_canister_version: t22.Opt(t22.Nat64) }), pt = t22.Record({ canister_id: s2 }), ut2 = t22.Record({ canister_id: s2, amount: t22.Nat }), ht = t22.Vec(t22.Nat8), k2 = t22.Variant({ ed25519: t22.Null, bip340secp256k1: t22.Null }), mt = t22.Record({ key_id: t22.Record({ algorithm: k2, name: t22.Text }), canister_id: t22.Opt(s2), derivation_path: t22.Vec(t22.Vec(t22.Nat8)) }), gt = t22.Record({ public_key: t22.Vec(t22.Nat8), chain_code: t22.Vec(t22.Nat8) }), Nt = t22.Record({ key_id: t22.Record({ name: t22.Text, curve: m2 }), derivation_path: t22.Vec(t22.Vec(t22.Nat8)), message_hash: t22.Vec(t22.Nat8) }), yt = t22.Record({ signature: t22.Vec(t22.Nat8) }), kt = t22.Variant({ bip341: t22.Record({ merkle_root_hash: t22.Vec(t22.Nat8) }) }), Rt = t22.Record({ aux: t22.Opt(kt), key_id: t22.Record({ algorithm: k2, name: t22.Text }), derivation_path: t22.Vec(t22.Vec(t22.Nat8)), message: t22.Vec(t22.Nat8) }), Vt = t22.Record({ signature: t22.Vec(t22.Nat8) }), vt = t22.Record({ canister_id: s2 }), bt = t22.Record({ canister_id: s2 }), ft2 = t22.Record({ canister_id: s2 }), Ft = t22.Vec(p2), Ot = t22.Record({ subnet_id: t22.Principal }), Pt = t22.Record({ replica_version: t22.Text, registry_version: t22.Nat64 }), xt = t22.Record({ replace_snapshot: t22.Opt(_2), canister_id: s2 }), wt2 = y2, Ct = t22.Record({ canister_id: s2, sender_canister_version: t22.Opt(t22.Nat64) }), Tt = t22.Record({ canister_id: t22.Principal, settings: d2, sender_canister_version: t22.Opt(t22.Nat64) }), St2 = t22.Record({ chunk: t22.Vec(t22.Nat8), canister_id: t22.Principal }), zt = p2, R2 = t22.Variant({ bls12_381_g2: t22.Null }), qt = t22.Record({ context: t22.Vec(t22.Nat8), key_id: t22.Record({ name: t22.Text, curve: R2 }), input: t22.Vec(t22.Nat8), transport_public_key: t22.Vec(t22.Nat8) }), Ut = t22.Record({ encrypted_key: t22.Vec(t22.Nat8) }), At = t22.Record({ context: t22.Vec(t22.Nat8), key_id: t22.Record({ name: t22.Text, curve: R2 }), canister_id: t22.Opt(s2) }), Wt = t22.Record({ public_key: t22.Vec(t22.Nat8) });
  return t22.Service({ bitcoin_get_balance: t22.Func([c2], [i3], []), bitcoin_get_block_headers: t22.Func([u2], [O2], []), bitcoin_get_current_fee_percentiles: t22.Func([P2], [w4], []), bitcoin_get_utxos: t22.Func([C2], [q2], []), bitcoin_send_transaction: t22.Func([U2], [], []), canister_info: t22.Func([A4], [M2], []), canister_status: t22.Func([Q2], [H2], []), clear_chunk_store: t22.Func([G2], [], []), create_canister: t22.Func([J2], [K2], []), delete_canister: t22.Func([X2], [], []), delete_canister_snapshot: t22.Func([Y2], [], []), deposit_cycles: t22.Func([Z2], [], []), ecdsa_public_key: t22.Func([$2], [I2], []), fetch_canister_logs: t22.Func([L2], [tt2], []), http_request: t22.Func([et2], [l3], []), install_chunked_code: t22.Func([st2], [], []), install_code: t22.Func([ct2], [], []), list_canister_snapshots: t22.Func([rt], [at], []), load_canister_snapshot: t22.Func([it2], [], []), node_metrics_history: t22.Func([ot2], [dt2], []), provisional_create_canister_with_cycles: t22.Func([lt2], [pt], []), provisional_top_up_canister: t22.Func([ut2], [], []), raw_rand: t22.Func([], [ht], []), schnorr_public_key: t22.Func([mt], [gt], []), sign_with_ecdsa: t22.Func([Nt], [yt], []), sign_with_schnorr: t22.Func([Rt], [Vt], []), start_canister: t22.Func([vt], [], []), stop_canister: t22.Func([bt], [], []), stored_chunks: t22.Func([ft2], [Ft], []), subnet_info: t22.Func([Ot], [Pt], []), take_canister_snapshot: t22.Func([xt], [wt2], []), uninstall_code: t22.Func([Ct], [], []), update_settings: t22.Func([Tt], [], []), upload_chunk: t22.Func([St2], [zt], []), vetkd_derive_key: t22.Func([qt], [Ut], []), vetkd_public_key: t22.Func([At], [Wt], []) });
};
var Mt = ({ IDL: t22 }) => {
  let e5 = t22.Variant({ mainnet: t22.Null, testnet: t22.Null }), n2 = t22.Text, c2 = t22.Record({ network: e5, address: n2, min_confirmations: t22.Opt(t22.Nat32) }), r2 = t22.Nat64, i3 = r2, o3 = t22.Nat32, u2 = t22.Record({ start_height: o3, end_height: t22.Opt(o3), network: e5 }), F2 = t22.Vec(t22.Nat8), O2 = t22.Record({ tip_height: o3, block_headers: t22.Vec(F2) }), P2 = t22.Record({ network: e5 }), x3 = t22.Nat64, w4 = t22.Vec(x3), C2 = t22.Record({ network: e5, filter: t22.Opt(t22.Variant({ page: t22.Vec(t22.Nat8), min_confirmations: t22.Nat32 })), address: n2 }), T2 = t22.Vec(t22.Nat8), S2 = t22.Record({ txid: t22.Vec(t22.Nat8), vout: t22.Nat32 }), z2 = t22.Record({ height: t22.Nat32, value: r2, outpoint: S2 }), q2 = t22.Record({ next_page: t22.Opt(t22.Vec(t22.Nat8)), tip_height: o3, tip_block_hash: T2, utxos: t22.Vec(z2) }), U2 = t22.Record({ transaction: t22.Vec(t22.Nat8), network: e5 }), s2 = t22.Principal, A4 = t22.Record({ canister_id: s2, num_requested_changes: t22.Opt(t22.Nat64) }), W2 = t22.Variant({ from_user: t22.Record({ user_id: t22.Principal }), from_canister: t22.Record({ canister_version: t22.Opt(t22.Nat64), canister_id: t22.Principal }) }), _2 = t22.Vec(t22.Nat8), B3 = t22.Variant({ creation: t22.Record({ controllers: t22.Vec(t22.Principal) }), code_deployment: t22.Record({ mode: t22.Variant({ reinstall: t22.Null, upgrade: t22.Null, install: t22.Null }), module_hash: t22.Vec(t22.Nat8) }), load_snapshot: t22.Record({ canister_version: t22.Nat64, taken_at_timestamp: t22.Nat64, snapshot_id: _2 }), controllers_change: t22.Record({ controllers: t22.Vec(t22.Principal) }), code_uninstall: t22.Null }), E2 = t22.Record({ timestamp_nanos: t22.Nat64, canister_version: t22.Nat64, origin: W2, details: B3 }), M2 = t22.Record({ controllers: t22.Vec(t22.Principal), module_hash: t22.Opt(t22.Vec(t22.Nat8)), recent_changes: t22.Vec(E2), total_num_changes: t22.Nat64 }), Q2 = t22.Record({ canister_id: s2 }), h2 = t22.Variant({ controllers: t22.Null, public: t22.Null, allowed_viewers: t22.Vec(t22.Principal) }), j2 = t22.Record({ freezing_threshold: t22.Nat, wasm_memory_threshold: t22.Nat, controllers: t22.Vec(t22.Principal), reserved_cycles_limit: t22.Nat, log_visibility: h2, wasm_memory_limit: t22.Nat, memory_allocation: t22.Nat, compute_allocation: t22.Nat }), H2 = t22.Record({ memory_metrics: t22.Record({ wasm_binary_size: t22.Nat, wasm_chunk_store_size: t22.Nat, canister_history_size: t22.Nat, stable_memory_size: t22.Nat, snapshots_size: t22.Nat, wasm_memory_size: t22.Nat, global_memory_size: t22.Nat, custom_sections_size: t22.Nat }), status: t22.Variant({ stopped: t22.Null, stopping: t22.Null, running: t22.Null }), memory_size: t22.Nat, cycles: t22.Nat, settings: j2, query_stats: t22.Record({ response_payload_bytes_total: t22.Nat, num_instructions_total: t22.Nat, num_calls_total: t22.Nat, request_payload_bytes_total: t22.Nat }), idle_cycles_burned_per_day: t22.Nat, module_hash: t22.Opt(t22.Vec(t22.Nat8)), reserved_cycles: t22.Nat }), G2 = t22.Record({ canister_id: s2 }), d2 = t22.Record({ freezing_threshold: t22.Opt(t22.Nat), wasm_memory_threshold: t22.Opt(t22.Nat), controllers: t22.Opt(t22.Vec(t22.Principal)), reserved_cycles_limit: t22.Opt(t22.Nat), log_visibility: t22.Opt(h2), wasm_memory_limit: t22.Opt(t22.Nat), memory_allocation: t22.Opt(t22.Nat), compute_allocation: t22.Opt(t22.Nat) }), J2 = t22.Record({ settings: t22.Opt(d2), sender_canister_version: t22.Opt(t22.Nat64) }), K2 = t22.Record({ canister_id: s2 }), X2 = t22.Record({ canister_id: s2 }), Y2 = t22.Record({ canister_id: s2, snapshot_id: _2 }), Z2 = t22.Record({ canister_id: s2 }), m2 = t22.Variant({ secp256k1: t22.Null }), $2 = t22.Record({ key_id: t22.Record({ name: t22.Text, curve: m2 }), canister_id: t22.Opt(s2), derivation_path: t22.Vec(t22.Vec(t22.Nat8)) }), I2 = t22.Record({ public_key: t22.Vec(t22.Nat8), chain_code: t22.Vec(t22.Nat8) }), L2 = t22.Record({ canister_id: s2 }), D2 = t22.Record({ idx: t22.Nat64, timestamp_nanos: t22.Nat64, content: t22.Vec(t22.Nat8) }), tt2 = t22.Record({ canister_log_records: t22.Vec(D2) }), g2 = t22.Record({ value: t22.Text, name: t22.Text }), l3 = t22.Record({ status: t22.Nat, body: t22.Vec(t22.Nat8), headers: t22.Vec(g2) }), et2 = t22.Record({ url: t22.Text, method: t22.Variant({ get: t22.Null, head: t22.Null, post: t22.Null }), max_response_bytes: t22.Opt(t22.Nat64), body: t22.Opt(t22.Vec(t22.Nat8)), transform: t22.Opt(t22.Record({ function: t22.Func([t22.Record({ context: t22.Vec(t22.Nat8), response: l3 })], [l3], ["query"]), context: t22.Vec(t22.Nat8) })), headers: t22.Vec(g2) }), N2 = t22.Variant({ reinstall: t22.Null, upgrade: t22.Opt(t22.Record({ wasm_memory_persistence: t22.Opt(t22.Variant({ keep: t22.Null, replace: t22.Null })), skip_pre_upgrade: t22.Opt(t22.Bool) })), install: t22.Null }), p2 = t22.Record({ hash: t22.Vec(t22.Nat8) }), st2 = t22.Record({ arg: t22.Vec(t22.Nat8), wasm_module_hash: t22.Vec(t22.Nat8), mode: N2, chunk_hashes_list: t22.Vec(p2), target_canister: s2, store_canister: t22.Opt(s2), sender_canister_version: t22.Opt(t22.Nat64) }), nt2 = t22.Vec(t22.Nat8), ct2 = t22.Record({ arg: t22.Vec(t22.Nat8), wasm_module: nt2, mode: N2, canister_id: s2, sender_canister_version: t22.Opt(t22.Nat64) }), rt = t22.Record({ canister_id: s2 }), y2 = t22.Record({ id: _2, total_size: t22.Nat64, taken_at_timestamp: t22.Nat64 }), at = t22.Vec(y2), it2 = t22.Record({ canister_id: s2, sender_canister_version: t22.Opt(t22.Nat64), snapshot_id: _2 }), ot2 = t22.Record({ start_at_timestamp_nanos: t22.Nat64, subnet_id: t22.Principal }), _t2 = t22.Record({ num_block_failures_total: t22.Nat64, node_id: t22.Principal, num_blocks_proposed_total: t22.Nat64 }), dt2 = t22.Vec(t22.Record({ timestamp_nanos: t22.Nat64, node_metrics: t22.Vec(_t2) })), lt2 = t22.Record({ settings: t22.Opt(d2), specified_id: t22.Opt(s2), amount: t22.Opt(t22.Nat), sender_canister_version: t22.Opt(t22.Nat64) }), pt = t22.Record({ canister_id: s2 }), ut2 = t22.Record({ canister_id: s2, amount: t22.Nat }), ht = t22.Vec(t22.Nat8), k2 = t22.Variant({ ed25519: t22.Null, bip340secp256k1: t22.Null }), mt = t22.Record({ key_id: t22.Record({ algorithm: k2, name: t22.Text }), canister_id: t22.Opt(s2), derivation_path: t22.Vec(t22.Vec(t22.Nat8)) }), gt = t22.Record({ public_key: t22.Vec(t22.Nat8), chain_code: t22.Vec(t22.Nat8) }), Nt = t22.Record({ key_id: t22.Record({ name: t22.Text, curve: m2 }), derivation_path: t22.Vec(t22.Vec(t22.Nat8)), message_hash: t22.Vec(t22.Nat8) }), yt = t22.Record({ signature: t22.Vec(t22.Nat8) }), kt = t22.Variant({ bip341: t22.Record({ merkle_root_hash: t22.Vec(t22.Nat8) }) }), Rt = t22.Record({ aux: t22.Opt(kt), key_id: t22.Record({ algorithm: k2, name: t22.Text }), derivation_path: t22.Vec(t22.Vec(t22.Nat8)), message: t22.Vec(t22.Nat8) }), Vt = t22.Record({ signature: t22.Vec(t22.Nat8) }), vt = t22.Record({ canister_id: s2 }), bt = t22.Record({ canister_id: s2 }), ft2 = t22.Record({ canister_id: s2 }), Ft = t22.Vec(p2), Ot = t22.Record({ subnet_id: t22.Principal }), Pt = t22.Record({ replica_version: t22.Text, registry_version: t22.Nat64 }), xt = t22.Record({ replace_snapshot: t22.Opt(_2), canister_id: s2 }), wt2 = y2, Ct = t22.Record({ canister_id: s2, sender_canister_version: t22.Opt(t22.Nat64) }), Tt = t22.Record({ canister_id: t22.Principal, settings: d2, sender_canister_version: t22.Opt(t22.Nat64) }), St2 = t22.Record({ chunk: t22.Vec(t22.Nat8), canister_id: t22.Principal }), zt = p2, R2 = t22.Variant({ bls12_381_g2: t22.Null }), qt = t22.Record({ context: t22.Vec(t22.Nat8), key_id: t22.Record({ name: t22.Text, curve: R2 }), input: t22.Vec(t22.Nat8), transport_public_key: t22.Vec(t22.Nat8) }), Ut = t22.Record({ encrypted_key: t22.Vec(t22.Nat8) }), At = t22.Record({ context: t22.Vec(t22.Nat8), key_id: t22.Record({ name: t22.Text, curve: R2 }), canister_id: t22.Opt(s2) }), Wt = t22.Record({ public_key: t22.Vec(t22.Nat8) });
  return t22.Service({ bitcoin_get_balance: t22.Func([c2], [i3], []), bitcoin_get_block_headers: t22.Func([u2], [O2], []), bitcoin_get_current_fee_percentiles: t22.Func([P2], [w4], []), bitcoin_get_utxos: t22.Func([C2], [q2], []), bitcoin_send_transaction: t22.Func([U2], [], []), canister_info: t22.Func([A4], [M2], []), canister_status: t22.Func([Q2], [H2], []), clear_chunk_store: t22.Func([G2], [], []), create_canister: t22.Func([J2], [K2], []), delete_canister: t22.Func([X2], [], []), delete_canister_snapshot: t22.Func([Y2], [], []), deposit_cycles: t22.Func([Z2], [], []), ecdsa_public_key: t22.Func([$2], [I2], []), fetch_canister_logs: t22.Func([L2], [tt2], ["query"]), http_request: t22.Func([et2], [l3], []), install_chunked_code: t22.Func([st2], [], []), install_code: t22.Func([ct2], [], []), list_canister_snapshots: t22.Func([rt], [at], []), load_canister_snapshot: t22.Func([it2], [], []), node_metrics_history: t22.Func([ot2], [dt2], []), provisional_create_canister_with_cycles: t22.Func([lt2], [pt], []), provisional_top_up_canister: t22.Func([ut2], [], []), raw_rand: t22.Func([], [ht], []), schnorr_public_key: t22.Func([mt], [gt], []), sign_with_ecdsa: t22.Func([Nt], [yt], []), sign_with_schnorr: t22.Func([Rt], [Vt], []), start_canister: t22.Func([vt], [], []), stop_canister: t22.Func([bt], [], []), stored_chunks: t22.Func([ft2], [Ft], []), subnet_info: t22.Func([Ot], [Pt], []), take_canister_snapshot: t22.Func([xt], [wt2], []), uninstall_code: t22.Func([Ct], [], []), update_settings: t22.Func([Tt], [], []), upload_chunk: t22.Func([St2], [zt], []), vetkd_derive_key: t22.Func([qt], [Ut], []), vetkd_public_key: t22.Func([At], [Wt], []) });
};
var Gt = (t22) => wt(t22), b$1 = (t22) => typeof t22 == "string" ? Gt(t22) : t22;
var Bt = (t22, e5, n2) => {
  let [c2] = e5;
  if (s$1(c2) && typeof c2 == "object") {
    if (t22 === "install_chunked_code" && s$1(c2.target_canister)) return { effectiveCanisterId: Principal$1.from(c2.target_canister) };
    if (t22 === "provisional_create_canister_with_cycles" && s$1(c2.specified_id)) {
      let r2 = K(c2.specified_id);
      if (s$1(r2)) return { effectiveCanisterId: Principal$1.from(r2) };
    }
    if (s$1(c2.canister_id)) return { effectiveCanisterId: Principal$1.from(c2.canister_id) };
  }
  return { effectiveCanisterId: Principal$1.fromHex("") };
};
var Qt = class t {
  constructor(e5) {
    this.service = e5;
    this.service = e5;
  }
  static create(e5) {
    let { service: n2 } = lt({ options: { ...e5, canisterId: Principal$1.fromHex(""), callTransform: Bt, queryTransform: Bt }, idlFactory: Mt, certifiedIdlFactory: Et });
    return new t(n2);
  }
  createCanister = async ({ settings: e5, senderCanisterVersion: n2 } = {}) => {
    let { create_canister: c2 } = this.service, { canister_id: r2 } = await c2({ settings: re(P(e5)), sender_canister_version: re(n2) });
    return r2;
  };
  updateSettings = ({ canisterId: e5, senderCanisterVersion: n2, settings: c2 }) => {
    let { update_settings: r2 } = this.service;
    return r2({ canister_id: e5, sender_canister_version: re(n2), settings: P(c2) });
  };
  installCode = ({ canisterId: e5, wasmModule: n2, senderCanisterVersion: c2, ...r2 }) => {
    let { install_code: i3 } = this.service;
    return i3({ ...r2, canister_id: e5, wasm_module: n2, sender_canister_version: re(c2) });
  };
  uploadChunk = ({ canisterId: e5, ...n2 }) => {
    let { upload_chunk: c2 } = this.service;
    return c2({ canister_id: e5, ...n2 });
  };
  clearChunkStore = async ({ canisterId: e5 }) => {
    let { clear_chunk_store: n2 } = this.service;
    await n2({ canister_id: e5 });
  };
  storedChunks = ({ canisterId: e5 }) => {
    let { stored_chunks: n2 } = this.service;
    return n2({ canister_id: e5 });
  };
  installChunkedCode = async ({ senderCanisterVersion: e5, chunkHashesList: n2, targetCanisterId: c2, storeCanisterId: r2, wasmModuleHash: i3, ...o3 }) => {
    let { install_chunked_code: u2 } = this.service;
    await u2({ ...o3, target_canister: c2, store_canister: re(r2), sender_canister_version: re(e5), chunk_hashes_list: n2, wasm_module_hash: typeof i3 == "string" ? wt(i3) : i3 });
  };
  uninstallCode = ({ canisterId: e5, senderCanisterVersion: n2 }) => {
    let { uninstall_code: c2 } = this.service;
    return c2({ canister_id: e5, sender_canister_version: re(n2) });
  };
  startCanister = (e5) => {
    let { start_canister: n2 } = this.service;
    return n2({ canister_id: e5 });
  };
  stopCanister = (e5) => {
    let { stop_canister: n2 } = this.service;
    return n2({ canister_id: e5 });
  };
  canisterStatus = (e5) => {
    let { canister_status: n2 } = this.service;
    return n2({ canister_id: e5 });
  };
  deleteCanister = (e5) => {
    let { delete_canister: n2 } = this.service;
    return n2({ canister_id: e5 });
  };
  provisionalCreateCanisterWithCycles = async ({ settings: e5, amount: n2, canisterId: c2 } = {}) => {
    let { provisional_create_canister_with_cycles: r2 } = this.service, { canister_id: i3 } = await r2({ settings: re(P(e5)), amount: re(n2), specified_id: re(c2), sender_canister_version: [] });
    return i3;
  };
  fetchCanisterLogs = (e5) => {
    let { fetch_canister_logs: n2 } = this.service;
    return n2({ canister_id: e5 });
  };
  takeCanisterSnapshot = ({ canisterId: e5, snapshotId: n2 }) => {
    let { take_canister_snapshot: c2 } = this.service;
    return c2({ canister_id: e5, replace_snapshot: re(s$1(n2) ? b$1(n2) : void 0) });
  };
  listCanisterSnapshots = ({ canisterId: e5 }) => {
    let { list_canister_snapshots: n2 } = this.service;
    return n2({ canister_id: e5 });
  };
  loadCanisterSnapshot = async ({ canisterId: e5, snapshotId: n2, senderCanisterVersion: c2 }) => {
    let { load_canister_snapshot: r2 } = this.service;
    await r2({ canister_id: e5, snapshot_id: b$1(n2), sender_canister_version: re(c2) });
  };
  deleteCanisterSnapshot = async ({ canisterId: e5, snapshotId: n2 }) => {
    let { delete_canister_snapshot: c2 } = this.service;
    await c2({ canister_id: e5, snapshot_id: b$1(n2) });
  };
};
const y = 1000000000000n, w$2 = ({ IDL: t3 }) => {
  const e5 = t3.Record({
    url: t3.Text,
    method: t3.Text,
    body: t3.Vec(t3.Nat8),
    headers: t3.Vec(t3.Tuple(t3.Text, t3.Text))
  }), a2 = t3.Record({
    body: t3.Vec(t3.Nat8),
    headers: t3.Vec(t3.Tuple(t3.Text, t3.Text)),
    status_code: t3.Nat16
  }), r2 = t3.Variant({
    Add: t3.Text,
    Remove: t3.Text
  }), n2 = t3.Variant({
    Ok: t3.Null,
    Err: t3.Text
  }), u2 = t3.Variant({
    Get: t3.Null,
    Set: t3.Principal
  }), h2 = t3.Variant({
    Ok: t3.Principal,
    Err: t3.Text
  }), p2 = t3.Variant({
    Hourly: t3.Null,
    Weekly: t3.Null,
    Daily: t3.Null,
    Monthly: t3.Null
  }), c2 = t3.Variant({
    _1T: t3.Null,
    _2T: t3.Null,
    _5T: t3.Null,
    _10T: t3.Null,
    _50T: t3.Null,
    _0_5T: t3.Null,
    _100T: t3.Null,
    _0_25T: t3.Null
  }), s2 = t3.Record({
    interval: p2,
    cycles_amount: c2,
    cycles_threshold: c2
  }), d2 = t3.Variant({
    Add: s2,
    Get: t3.Null,
    Clear: t3.Null
  }), m2 = t3.Variant({
    Ok: t3.Opt(s2),
    Err: t3.Text
  }), g2 = t3.Record({
    memo: t3.Opt(t3.Text),
    name: t3.Text,
    version: t3.Nat16
  });
  return t3.Service({
    http_request: t3.Func([e5], [a2], ["query"]),
    manage_alternative_origins: t3.Func(
      [r2],
      [n2],
      []
    ),
    manage_ii_principal: t3.Func(
      [u2],
      [h2],
      []
    ),
    manage_top_up_rule: t3.Func(
      [d2],
      [m2],
      []
    ),
    wasm_status: t3.Func([], [g2], ["query"])
  });
};
function N$1(t3) {
  if (t3.canisterId === "")
    throw new Error("canisterId is required");
  return Actor.createActor(w$2, {
    agent: t3.agent,
    canisterId: t3.canisterId
  });
}
let o$1 = class o {
  actor;
  constructor(e5) {
    this.actor = e5;
  }
  /**
   * Create a new MyDashboardBackend instance
   */
  static create(e5) {
    const a2 = N$1(e5);
    return new o(a2);
  }
  /**
   * Handle HTTP requests to the Canister Dapp
   */
  async httpRequest(e5) {
    return await this.actor.http_request(e5);
  }
  /**
   * Update alternative origins for the Canister Dapp
   */
  async manageAlternativeOrigins(e5) {
    return await this.actor.manage_alternative_origins(e5);
  }
  /**
   * Update or get the Internet Identity principal of the Canister Dapp
   */
  async manageIIPrincipal(e5) {
    return await this.actor.manage_ii_principal(e5);
  }
  /**
   * Get the WASM status of the Canister Dapp
   */
  async wasmStatus() {
    return await this.actor.wasm_status();
  }
  /**
   * Manage the Top-Up Rule for the Canister Dapp
   */
  async manageTopUpRule(e5) {
    return await this.actor.manage_top_up_rule(e5);
  }
};
let l$1 = class l {
  constructor(e5, a2) {
    this.agent = e5, this.canisterId = a2, this.icManagement = Qt.create({ agent: this.agent });
  }
  icManagement;
  /**
   * Create a new MyCanisterDashboard instance
   */
  static create(e5, a2) {
    return new l(e5, a2);
  }
  /**
   * Check cycles balance for the canister running My Canister Dashboard.
   */
  async checkCyclesBalance(e5) {
    try {
      const a2 = e5?.threshold ?? y, n2 = (await this.icManagement.canisterStatus(this.canisterId)).cycles;
      return n2 < a2 ? {
        error: `Low cycles warning: ${n2.toString()} cycles remaining (threshold: ${a2.toString()})`
      } : { ok: n2 };
    } catch (a2) {
      return { error: String(a2) };
    }
  }
  /**
   * Check whether the current caller is the Dapp owner with known Internet Identity principal
   * Returns true if authenticated as the known II principal, false otherwise.
   */
  async isAuthenticated() {
    try {
      return "Ok" in await o$1.create({
        agent: this.agent,
        canisterId: this.canisterId
      }).manageIIPrincipal({ Get: null });
    } catch {
      return false;
    }
  }
};
function M$1() {
  const t3 = window.location.hostname, e5 = window.location.protocol, a2 = /^([a-z0-9-]+)\.localhost$/.exec(t3);
  if (a2?.[1] != null) {
    if (e5 !== "http:")
      throw new Error(
        `Invalid protocol for localhost: ${e5}. Only http: is allowed for localhost.`
      );
    return Principal$1.fromText(a2[1]);
  }
  const r2 = /^([a-z0-9-]+)\.icp0\.io$/.exec(t3);
  if (r2?.[1] != null) {
    if (e5 !== "https:")
      throw new Error(
        `Invalid protocol for production: ${e5}. Only https: is allowed for icp0.io.`
      );
    return Principal$1.fromText(r2[1]);
  }
  throw new Error(`Could not infer canister ID from hostname: ${t3}`);
}
const PRODUCTION_CONFIG = {
  canisterId: void 0,
  identityProvider: "https://identity.internetcomputer.org",
  dfxHost: "https://icp-api.io"
};
let configCache = null;
let devModeCache = null;
async function getConfig() {
  if (configCache !== null) {
    return configCache;
  }
  try {
    const response = await fetch("/canister-dashboard-dev-config.json");
    if (response.ok) {
      const devConfig = await response.json();
      configCache = devConfig;
      devModeCache = true;
      return devConfig;
    }
  } catch {
  }
  configCache = PRODUCTION_CONFIG;
  devModeCache = false;
  return configCache;
}
function isDevMode() {
  if (devModeCache !== null) {
    return devModeCache;
  }
  return false;
}
const MAX_TIME_TO_LIVE = BigInt(15) * BigInt(60) * BigInt(1e9);
const CMC_CANISTER_ID = "rkp4c-7iaaa-aaaaa-aaaca-cai";
const ICP_TX_FEE = BigInt(1e4);
const E8S = 1e8;
const TPUP_MEMO = new Uint8Array([
  84,
  80,
  85,
  80,
  0,
  0,
  0,
  0
]);
function getElement(id) {
  const element = document.getElementById(id);
  if (!element) {
    console.error(`Element with id '${id}' not found`);
    return document.createElement("div");
  }
  return element;
}
function setText(id, text) {
  const element = getElement(id);
  element.textContent = text;
}
function toggleVisibility(id, show) {
  const element = getElement(id);
  if (show) {
    element.classList.remove("hidden");
  } else {
    element.classList.add("hidden");
  }
}
const listenersRegistry = /* @__PURE__ */ new WeakMap();
function addEventListener(id, event, handler) {
  const element = getElement(id);
  const existingMap = listenersRegistry.get(element);
  const existingListener = existingMap?.get(event);
  if (existingListener) {
    element.removeEventListener(event, existingListener);
  }
  const wrapped = async () => {
    try {
      await handler();
    } catch (err) {
      console.error(`Unhandled error in '${event}' handler for #${id}:`, err);
      showError(GENERIC_ERROR_MESSAGE);
    }
  };
  element.addEventListener(event, wrapped);
  const map = listenersRegistry.get(element) ?? /* @__PURE__ */ new Map();
  map.set(event, wrapped);
  if (!listenersRegistry.has(element)) {
    listenersRegistry.set(element, map);
  }
}
function setLoggedInState(principalText, onLogout) {
  const authBtn = getElement("auth-btn");
  authBtn.textContent = "Logout";
  authBtn.onclick = async () => {
    try {
      await onLogout();
    } catch {
      showError(LOGOUT_FAILED_MESSAGE);
    }
  };
  toggleVisibility("ii-principal", true);
  toggleVisibility("ii-principal-label", true);
  setText("ii-principal", principalText);
  toggleVisibility("authenticated-content", true);
}
function setLoggedOutState(onLogin) {
  const authBtn = getElement("auth-btn");
  authBtn.textContent = "Login";
  authBtn.onclick = async () => await onLogin();
  toggleVisibility("ii-principal", false);
  toggleVisibility("ii-principal-label", false);
  setText("ii-principal", "");
  toggleVisibility("authenticated-content", false);
  toggleVisibility("loading-overlay", false);
}
function updateStatusDisplay(statusText, memorySizeFormatted, cyclesFormatted, moduleHashHex) {
  setText("status-value", statusText);
  setText("memory-size-value", memorySizeFormatted);
  setText("cycles-value", cyclesFormatted);
  setText("module-hash-value", moduleHashHex);
}
function updateBalanceDisplay(formattedBalance) {
  setText("balance-value", formattedBalance);
}
function updateIcrc1AccountDisplay(principalText) {
  setText("icrc1-account", principalText);
}
function showLoading() {
  toggleVisibility("loading-overlay", true);
}
function hideLoading() {
  toggleVisibility("loading-overlay", false);
}
function showError(message) {
  const errorSection = getElement("error-section");
  const errorMessage = document.createElement("div");
  errorMessage.className = "error-message";
  errorMessage.textContent = message;
  errorSection.appendChild(errorMessage);
  toggleVisibility("error-section", true);
}
function clearErrors() {
  const errorSection = getElement("error-section");
  errorSection.innerHTML = "";
  toggleVisibility("error-section", false);
}
function getInputValue(id) {
  const input = getElement(id);
  return input.value.trim();
}
function clearInput(id) {
  const input = getElement(id);
  input.value = "";
}
function updateCanisterInfo(canisterId2, icpBalance) {
  const idEl = getElement("canister-id");
  idEl.textContent = canisterId2;
  const balEl = getElement("canister-icp-balance");
  balEl.textContent = icpBalance;
}
function updateTopUpRuleDisplay(formattedRule) {
  const container = getElement("top-up-rule-display");
  container.textContent = "";
  if (!formattedRule) {
    container.textContent = "No rule set";
    return;
  }
  const pre = document.createElement("pre");
  pre.textContent = formattedRule;
  container.appendChild(pre);
}
function getSelectValue(id) {
  const select = getElement(id);
  return select.value;
}
const NETWORK_ERROR_MESSAGE = "Network error occurred. Please try again.";
const GENERIC_ERROR_MESSAGE = "Something went wrong. Please try again.";
const DASHBOARD_INIT_ERROR_MESSAGE = "Failed to initialize dashboard.";
const INVALID_PRINCIPAL_MESSAGE = "Invalid principal format.";
const INVALID_ORIGIN_MESSAGE = "URL must start with 'http://localhost:', 'http://*.localhost:', or 'https://'";
const SELECT_THRESHOLD_AMOUNT_MESSAGE = "Please select threshold and amount.";
const CANISTER_ID_ERROR_MESSAGE = "Unable to determine canister ID.";
const HTTP_AGENT_ERROR_MESSAGE = "Failed to create HTTP agent.";
const NOT_AUTHORIZED_MESSAGE = "You are not authorized to access this application.";
const LOGOUT_FAILED_MESSAGE = "Logout failed. Please try again.";
const AUTH_MANAGER_NOT_INITIALIZED_MESSAGE = "Auth manager not initialized";
const USER_NOT_AUTHENTICATED_MESSAGE = "User is not authenticated";
const FAILED_ADD_ALT_ORIGIN_MESSAGE_PREFIX = "Failed to add alternative origin";
const UNKNOWN_ADD_ALT_ORIGIN_MESSAGE = "Unknown error adding alternative origin";
const FAILED_REMOVE_ALT_ORIGIN_MESSAGE_PREFIX = "Failed to remove alternative origin";
const UNKNOWN_REMOVE_ALT_ORIGIN_MESSAGE = "Unknown error removing alternative origin";
const INSUFFICIENT_BALANCE_MESSAGE = "Insufficient balance for this operation.";
const TOP_UP_RULE_ERROR_PREFIX = "TopUpRule Error:";
const TOP_UP_ERROR_PREFIX = "TopUpError:";
const DUPLICATE_CONTROLLER_MESSAGE = "Controller already exists.";
const CONTROLLER_NOT_FOUND_MESSAGE = "Controller not found.";
const REQUIRED_CONTROLLERS_MESSAGE = "Cannot remove required controllers.";
function reportError(message, error) {
  if (error) console.error(message, error);
  else console.error(message);
  try {
    showError(message);
  } catch {
  }
}
async function canisterId() {
  try {
    return M$1();
  } catch {
    const config = await getConfig();
    if (config.canisterId !== void 0) {
      return Principal$1.fromText(config.canisterId);
    }
    reportError(CANISTER_ID_ERROR_MESSAGE);
    return Principal$1.anonymous();
  }
}
async function createHttpAgent() {
  try {
    const authClient = await AuthClient.create();
    const config = await getConfig();
    const identity = authClient.getIdentity();
    const agent = await HttpAgent.create({
      identity,
      host: config.dfxHost
    });
    if (isDevMode()) {
      await agent.fetchRootKey();
    }
    return agent;
  } catch (error) {
    reportError(HTTP_AGENT_ERROR_MESSAGE, error);
    throw error;
  }
}
function isValidPrincipal(text) {
  try {
    Principal$1.fromText(text);
    return true;
  } catch {
    return false;
  }
}
function isValidOrigin(text) {
  try {
    const url = new URL(text);
    const isHttps = url.protocol === "https:";
    const isHttpLocalhost = url.protocol === "http:" && (url.hostname === "localhost" || url.hostname.endsWith(".localhost")) && /:\d+$/.test(url.host);
    return isHttps || isHttpLocalhost;
  } catch {
    return false;
  }
}
class AuthManager {
  authClient = null;
  constructor() {
  }
  static async create() {
    const instance = new AuthManager();
    instance.authClient = await AuthClient.create();
    return instance;
  }
  async ensureAuthClient() {
    if (!this.authClient) {
      this.authClient = await AuthClient.create();
    }
    return this.authClient;
  }
  async isIIPrincipal() {
    try {
      if (!this.authClient || !await this.authClient.isAuthenticated()) {
        return false;
      }
      const agent = await createHttpAgent();
      const canister = await canisterId();
      const dashboard = l$1.create(agent, canister);
      return await dashboard.isAuthenticated();
    } catch (error) {
      console.warn("Failed to check II principal authorization:", error);
      return false;
    }
  }
  async login() {
    const client = await this.ensureAuthClient();
    const isAuthed = await client.isAuthenticated();
    if (isAuthed) {
      const authorized = await this.isIIPrincipal();
      if (authorized) {
        return;
      }
      await client.logout();
      this.authClient = null;
    }
    const config = await getConfig();
    const freshClient = await this.ensureAuthClient();
    await new Promise((resolve, reject) => {
      freshClient.login({
        identityProvider: config.identityProvider,
        maxTimeToLive: MAX_TIME_TO_LIVE,
        onSuccess: () => {
          resolve();
        },
        onError: (error) => {
          reject(error);
        }
      });
    });
    const isAuthorized = await this.isIIPrincipal();
    if (!isAuthorized) {
      showError(NOT_AUTHORIZED_MESSAGE);
      await (await this.ensureAuthClient()).logout();
      this.authClient = null;
      return;
    }
  }
  async logout() {
    const client = await this.ensureAuthClient();
    await client.logout();
    this.authClient = null;
  }
  async isAuthenticated() {
    const client = await this.ensureAuthClient();
    const isAuthed = await client.isAuthenticated();
    if (!isAuthed) {
      return false;
    }
    return await this.isIIPrincipal();
  }
  async getPrincipal() {
    const client = await this.ensureAuthClient();
    const isAuthed = await client.isAuthenticated();
    if (!isAuthed) {
      reportError(USER_NOT_AUTHENTICATED_MESSAGE);
      return client.getIdentity().getPrincipal();
    }
    return client.getIdentity().getPrincipal();
  }
}
class ManagementApi {
  async managmentApi() {
    const agent = await createHttpAgent();
    return Qt.create({
      agent
    });
  }
  async getCanisterStatus() {
    try {
      const icManagement = await this.managmentApi();
      const canisterIdPrincipal = await canisterId();
      return await icManagement.canisterStatus(canisterIdPrincipal);
    } catch (error) {
      reportError(NETWORK_ERROR_MESSAGE, error);
      throw error;
    }
  }
  async updateControllers(controllers) {
    try {
      const icManagement = await this.managmentApi();
      const canisterIdPrincipal = await canisterId();
      await icManagement.updateSettings({
        canisterId: canisterIdPrincipal,
        settings: {
          controllers: controllers.map((controller) => controller.toString())
        }
      });
    } catch (error) {
      reportError(NETWORK_ERROR_MESSAGE, error);
      throw error;
    }
  }
  async getCanisterLogs() {
    try {
      const icManagement = await this.managmentApi();
      const canisterIdPrincipal = await canisterId();
      return await icManagement.fetchCanisterLogs(canisterIdPrincipal);
    } catch (error) {
      reportError(NETWORK_ERROR_MESSAGE, error);
      throw error;
    }
  }
}
function principalToSubaccount(principal) {
  const principalBytes = principal.toUint8Array();
  const subaccount = new Uint8Array(32);
  subaccount[0] = principalBytes.length;
  subaccount.set(principalBytes, 1);
  return subaccount;
}
function formatMemorySize(bytes) {
  if (bytes < 0) {
    return "0.00 MB";
  }
  const mb = Number(bytes) / (1024 * 1024);
  return `${mb.toFixed(2)} MB`;
}
function formatCycles(cycles) {
  if (cycles < 0) {
    return "0.00 T";
  }
  const trillion = Number(cycles) / 1e12;
  return `${trillion.toFixed(2)} T`;
}
function formatIcpBalance(balance) {
  if (balance < 0) {
    return "0.00000000";
  }
  return (Number(balance) / E8S).toFixed(8);
}
class StatusManager {
  constructor() {
  }
  static async create() {
    const instance = new StatusManager();
    try {
      const managementApi = new ManagementApi();
      const status = await managementApi.getCanisterStatus();
      const {
        statusText,
        memorySizeFormatted,
        cyclesFormatted,
        moduleHashHex
      } = instance.formatStatusData(status);
      updateStatusDisplay(
        statusText,
        memorySizeFormatted,
        cyclesFormatted,
        moduleHashHex
      );
    } catch (e5) {
      reportError(NETWORK_ERROR_MESSAGE, e5);
    }
    return instance;
  }
  formatStatusData(status) {
    const statusText = "running" in status.status ? "Running" : "stopped" in status.status ? "Stopped" : "stopping" in status.status ? "Stopping" : "Unknown";
    const memorySizeFormatted = formatMemorySize(status.memory_size);
    const cyclesFormatted = formatCycles(status.cycles);
    const moduleHashHex = status.module_hash.length > 0 ? k$1(status.module_hash[0]) : "N/A";
    return { statusText, memorySizeFormatted, cyclesFormatted, moduleHashHex };
  }
}
function W(e5) {
  return e5 instanceof Uint8Array || ArrayBuffer.isView(e5) && e5.constructor.name === "Uint8Array";
}
function w$1(e5, ...t3) {
  if (!W(e5)) throw new Error("Uint8Array expected");
  if (t3.length > 0 && !t3.includes(e5.length)) throw new Error("Uint8Array expected of length " + t3 + ", got length=" + e5.length);
}
function U(e5, t3 = true) {
  if (e5.destroyed) throw new Error("Hash instance has been destroyed");
  if (t3 && e5.finished) throw new Error("Hash#digest() has already been called");
}
function D(e5, t3) {
  w$1(e5);
  let r2 = t3.outputLen;
  if (e5.length < r2) throw new Error("digestInto() expects output buffer of length at least " + r2);
}
function g(...e5) {
  for (let t3 = 0; t3 < e5.length; t3++) e5[t3].fill(0);
}
function m$1(e5) {
  return new DataView(e5.buffer, e5.byteOffset, e5.byteLength);
}
function x2(e5, t3) {
  return e5 << 32 - t3 | e5 >>> t3;
}
function N(e5) {
  if (typeof e5 != "string") throw new Error("string expected");
  return new Uint8Array(new TextEncoder().encode(e5));
}
function E(e5) {
  return typeof e5 == "string" && (e5 = N(e5)), w$1(e5), e5;
}
var A$1 = class A2 {
};
function F$1(e5) {
  let t3 = (n2) => e5().update(E(n2)).digest(), r2 = e5();
  return t3.outputLen = r2.outputLen, t3.blockLen = r2.blockLen, t3.create = () => e5(), t3;
}
function M(e5, t3, r2, n2) {
  if (typeof e5.setBigUint64 == "function") return e5.setBigUint64(t3, r2, n2);
  let s2 = BigInt(32), o3 = BigInt(4294967295), i3 = Number(r2 >> s2 & o3), c2 = Number(r2 & o3), h2 = n2 ? 4 : 0, a2 = n2 ? 0 : 4;
  e5.setUint32(t3 + h2, i3, n2), e5.setUint32(t3 + a2, c2, n2);
}
function G(e5, t3, r2) {
  return e5 & t3 ^ ~e5 & r2;
}
function T$1(e5, t3, r2) {
  return e5 & t3 ^ e5 & r2 ^ t3 & r2;
}
var B$1 = class B extends A$1 {
  constructor(t3, r2, n2, s2) {
    super(), this.finished = false, this.length = 0, this.pos = 0, this.destroyed = false, this.blockLen = t3, this.outputLen = r2, this.padOffset = n2, this.isLE = s2, this.buffer = new Uint8Array(t3), this.view = m$1(this.buffer);
  }
  update(t3) {
    U(this), t3 = E(t3), w$1(t3);
    let { view: r2, buffer: n2, blockLen: s2 } = this, o3 = t3.length;
    for (let i3 = 0; i3 < o3; ) {
      let c2 = Math.min(s2 - this.pos, o3 - i3);
      if (c2 === s2) {
        let h2 = m$1(t3);
        for (; s2 <= o3 - i3; i3 += s2) this.process(h2, i3);
        continue;
      }
      n2.set(t3.subarray(i3, i3 + c2), this.pos), this.pos += c2, i3 += c2, this.pos === s2 && (this.process(r2, 0), this.pos = 0);
    }
    return this.length += t3.length, this.roundClean(), this;
  }
  digestInto(t3) {
    U(this), D(t3, this), this.finished = true;
    let { buffer: r2, view: n2, blockLen: s2, isLE: o3 } = this, { pos: i3 } = this;
    r2[i3++] = 128, g(this.buffer.subarray(i3)), this.padOffset > s2 - i3 && (this.process(n2, 0), i3 = 0);
    for (let f2 = i3; f2 < s2; f2++) r2[f2] = 0;
    M(n2, s2 - 8, BigInt(this.length * 8), o3), this.process(n2, 0);
    let c2 = m$1(t3), h2 = this.outputLen;
    if (h2 % 4) throw new Error("_sha2: outputLen should be aligned to 32bit");
    let a2 = h2 / 4, d2 = this.get();
    if (a2 > d2.length) throw new Error("_sha2: outputLen bigger than state");
    for (let f2 = 0; f2 < a2; f2++) c2.setUint32(4 * f2, d2[f2], o3);
  }
  digest() {
    let { buffer: t3, outputLen: r2 } = this;
    this.digestInto(t3);
    let n2 = t3.slice(0, r2);
    return this.destroy(), n2;
  }
  _cloneInto(t3) {
    t3 || (t3 = new this.constructor()), t3.set(...this.get());
    let { blockLen: r2, buffer: n2, length: s2, finished: o3, destroyed: i3, pos: c2 } = this;
    return t3.destroyed = i3, t3.finished = o3, t3.length = s2, t3.pos = c2, s2 % r2 && t3.buffer.set(n2), t3;
  }
  clone() {
    return this._cloneInto();
  }
}, u = Uint32Array.from([1779033703, 3144134277, 1013904242, 2773480762, 1359893119, 2600822924, 528734635, 1541459225]), b = Uint32Array.from([3238371032, 914150663, 812702999, 4144912697, 4290775857, 1750603025, 1694076839, 3204075428]);
var j = Uint32Array.from([1116352408, 1899447441, 3049323471, 3921009573, 961987163, 1508970993, 2453635748, 2870763221, 3624381080, 310598401, 607225278, 1426881987, 1925078388, 2162078206, 2614888103, 3248222580, 3835390401, 4022224774, 264347078, 604807628, 770255983, 1249150122, 1555081692, 1996064986, 2554220882, 2821834349, 2952996808, 3210313671, 3336571891, 3584528711, 113926993, 338241895, 666307205, 773529912, 1294757372, 1396182291, 1695183700, 1986661051, 2177026350, 2456956037, 2730485921, 2820302411, 3259730800, 3345764771, 3516065817, 3600352804, 4094571909, 275423344, 430227734, 506948616, 659060556, 883997877, 958139571, 1322822218, 1537002063, 1747873779, 1955562222, 2024104815, 2227730452, 2361852424, 2428436474, 2756734187, 3204031479, 3329325298]), l2 = new Uint32Array(64), L = class extends B$1 {
  constructor(t3 = 32) {
    super(64, t3, 8, false), this.A = u[0] | 0, this.B = u[1] | 0, this.C = u[2] | 0, this.D = u[3] | 0, this.E = u[4] | 0, this.F = u[5] | 0, this.G = u[6] | 0, this.H = u[7] | 0;
  }
  get() {
    let { A: t3, B: r2, C: n2, D: s2, E: o3, F: i3, G: c2, H: h2 } = this;
    return [t3, r2, n2, s2, o3, i3, c2, h2];
  }
  set(t3, r2, n2, s2, o3, i3, c2, h2) {
    this.A = t3 | 0, this.B = r2 | 0, this.C = n2 | 0, this.D = s2 | 0, this.E = o3 | 0, this.F = i3 | 0, this.G = c2 | 0, this.H = h2 | 0;
  }
  process(t3, r2) {
    for (let f2 = 0; f2 < 16; f2++, r2 += 4) l2[f2] = t3.getUint32(r2, false);
    for (let f2 = 16; f2 < 64; f2++) {
      let y2 = l2[f2 - 15], p2 = l2[f2 - 2], _2 = x2(y2, 7) ^ x2(y2, 18) ^ y2 >>> 3, H2 = x2(p2, 17) ^ x2(p2, 19) ^ p2 >>> 10;
      l2[f2] = H2 + l2[f2 - 7] + _2 + l2[f2 - 16] | 0;
    }
    let { A: n2, B: s2, C: o3, D: i3, E: c2, F: h2, G: a2, H: d2 } = this;
    for (let f2 = 0; f2 < 64; f2++) {
      let y2 = x2(c2, 6) ^ x2(c2, 11) ^ x2(c2, 25), p2 = d2 + y2 + G(c2, h2, a2) + j[f2] + l2[f2] | 0, H2 = (x2(n2, 2) ^ x2(n2, 13) ^ x2(n2, 22)) + T$1(n2, s2, o3) | 0;
      d2 = a2, a2 = h2, h2 = c2, c2 = i3 + p2 | 0, i3 = o3, o3 = s2, s2 = n2, n2 = p2 + H2 | 0;
    }
    n2 = n2 + this.A | 0, s2 = s2 + this.B | 0, o3 = o3 + this.C | 0, i3 = i3 + this.D | 0, c2 = c2 + this.E | 0, h2 = h2 + this.F | 0, a2 = a2 + this.G | 0, d2 = d2 + this.H | 0, this.set(n2, s2, o3, i3, c2, h2, a2, d2);
  }
  roundClean() {
    g(l2);
  }
  destroy() {
    this.set(0, 0, 0, 0, 0, 0, 0, 0), g(this.buffer);
  }
}, S = class extends L {
  constructor() {
    super(28), this.A = b[0] | 0, this.B = b[1] | 0, this.C = b[2] | 0, this.D = b[3] | 0, this.E = b[4] | 0, this.F = b[5] | 0, this.G = b[6] | 0, this.H = b[7] | 0;
  }
};
var V = F$1(() => new S());
var O$1 = class e {
  constructor(t3) {
    this.bytes = t3;
  }
  static fromHex(t3) {
    let r2 = Uint8Array.from(Buffer.from(t3, "hex"));
    if (r2.length !== 32) throw new Error(`Invalid AccountIdentifier: expected 32 bytes, got ${r2.length}.`);
    let n2 = k$1(r2.slice(0, 4)), s2 = r2.slice(4), o3 = k$1(Lt(s2));
    if (n2 !== o3) throw Error(`Checksum mismatch. Expected ${o3}, but got ${n2}.`);
    return new e(r2);
  }
  static fromPrincipal({ principal: t3, subAccount: r2 = C.fromID(0) }) {
    let n2 = St(`
account-id`), s2 = V.create();
    s2.update(_t([...n2, ...t3.toUint8Array(), ...r2.toUint8Array()]));
    let o3 = s2.digest(), i3 = Lt(o3), c2 = new Uint8Array([...i3, ...o3]);
    return new e(c2);
  }
  toHex() {
    return k$1(this.bytes);
  }
  toUint8Array() {
    return this.bytes;
  }
  toNumbers() {
    return Array.from(this.bytes);
  }
  toAccountIdentifierHash() {
    return { hash: this.toUint8Array() };
  }
}, C = class e2 {
  constructor(t3) {
    this.bytes = t3;
  }
  static fromBytes(t3) {
    if (t3.length !== 32) throw new Error("Subaccount length must be 32-bytes");
    return new e2(t3);
  }
  static fromPrincipal(t3) {
    let r2 = new Uint8Array(32).fill(0), n2 = t3.toUint8Array();
    r2[0] = n2.length;
    for (let s2 = 0; s2 < n2.length; s2++) r2[1 + s2] = n2[s2];
    return new e2(r2);
  }
  static fromID(t3) {
    if (t3 < 0) throw new Error("Number cannot be negative");
    if (t3 > Number.MAX_SAFE_INTEGER) throw new Error("Number is too large to fit in 32 bytes.");
    let r2 = new DataView(new ArrayBuffer(32));
    if (typeof r2.setBigUint64 == "function") r2.setBigUint64(24, BigInt(t3));
    else {
      let s2 = BigInt(1) << BigInt(32);
      r2.setUint32(24, Number(BigInt(t3) >> BigInt(32))), r2.setUint32(28, Number(BigInt(t3) % s2));
    }
    let n2 = new Uint8Array(r2.buffer);
    return new e2(n2);
  }
  toUint8Array() {
    return this.bytes;
  }
};
/*! Bundled license information:

@noble/hashes/esm/utils.js:
  (*! noble-hashes - MIT License (c) 2022 Paul Miller (paulmillr.com) *)
*/
var r$1 = Principal$1.fromText("ryjl3-tyaaa-aaaaa-aaaba-cai");
Principal$1.fromText("qhbym-qaaaa-aaaaa-aaafq-cai");
var f = (t3) => t3 instanceof O$1 ? t3 : O$1.fromHex(t3);
var Pe = ({ IDL: e5 }) => {
  let c2 = e5.Vec(e5.Nat8), t3 = e5.Record({ owner: e5.Principal, subaccount: e5.Opt(c2) }), o3 = e5.Record({ icrc2: e5.Bool }), d2 = e5.Record({ icrc1_minting_account: e5.Opt(t3), feature_flags: e5.Opt(o3) }), r2 = e5.Record({ e8s: e5.Nat64 }), s2 = e5.Text, N2 = e5.Record({ secs: e5.Nat64, nanos: e5.Nat32 }), C2 = e5.Record({ num_blocks_to_archive: e5.Nat64, max_transactions_per_response: e5.Opt(e5.Nat64), trigger_threshold: e5.Nat64, more_controller_ids: e5.Opt(e5.Vec(e5.Principal)), max_message_size_bytes: e5.Opt(e5.Nat64), cycles_for_archive_creation: e5.Opt(e5.Nat64), node_max_memory_size_bytes: e5.Opt(e5.Nat64), controller_id: e5.Principal }), P2 = e5.Record({ send_whitelist: e5.Vec(e5.Principal), token_symbol: e5.Opt(e5.Text), transfer_fee: e5.Opt(r2), minting_account: s2, transaction_window: e5.Opt(N2), max_message_size_bytes: e5.Opt(e5.Nat64), icrc1_minting_account: e5.Opt(t3), archive_options: e5.Opt(C2), initial_values: e5.Vec(e5.Tuple(s2, r2)), token_name: e5.Opt(e5.Text), feature_flags: e5.Opt(o3) });
  e5.Variant({ Upgrade: e5.Opt(d2), Init: P2 });
  let a2 = e5.Vec(e5.Nat8), E2 = e5.Record({ account: a2 }), S2 = e5.Record({ account: s2 }), U2 = e5.Record({ canister_id: e5.Principal }), M2 = e5.Record({ archives: e5.Vec(U2) }), G2 = e5.Record({ prev_spender_id: e5.Opt(s2), from_account_id: s2, take: e5.Opt(e5.Nat64) }), Q2 = e5.Vec(e5.Record({ from_account_id: s2, to_spender_id: s2, allowance: r2, expires_at: e5.Opt(e5.Nat64) })), n2 = e5.Nat, z2 = e5.Variant({ Int: e5.Int, Nat: e5.Nat, Blob: e5.Vec(e5.Nat8), Text: e5.Text }), u2 = e5.Nat64, H2 = e5.Record({ to: t3, fee: e5.Opt(n2), memo: e5.Opt(e5.Vec(e5.Nat8)), from_subaccount: e5.Opt(c2), created_at_time: e5.Opt(u2), amount: n2 }), l3 = e5.Nat, J2 = e5.Variant({ GenericError: e5.Record({ message: e5.Text, error_code: e5.Nat }), TemporarilyUnavailable: e5.Null, BadBurn: e5.Record({ min_burn_amount: n2 }), Duplicate: e5.Record({ duplicate_of: l3 }), BadFee: e5.Record({ expected_fee: n2 }), CreatedInFuture: e5.Record({ ledger_time: e5.Nat64 }), TooOld: e5.Null, InsufficientFunds: e5.Record({ balance: n2 }) }), $2 = e5.Variant({ Ok: l3, Err: J2 }), y2 = e5.Record({ utc_offset_minutes: e5.Opt(e5.Int16), language: e5.Text }), K2 = e5.Record({ metadata: y2, device_spec: e5.Opt(e5.Variant({ GenericDisplay: e5.Null, FieldsDisplay: e5.Null })) }), Y2 = e5.Record({ arg: e5.Vec(e5.Nat8), method: e5.Text, user_preferences: K2 }), j2 = e5.Variant({ Text: e5.Record({ content: e5.Text }), TokenAmount: e5.Record({ decimals: e5.Nat8, amount: e5.Nat64, symbol: e5.Text }), TimestampSeconds: e5.Record({ amount: e5.Nat64 }), DurationSeconds: e5.Record({ amount: e5.Nat64 }) }), W2 = e5.Record({ fields: e5.Vec(e5.Tuple(e5.Text, j2)), intent: e5.Text }), X2 = e5.Variant({ FieldsDisplayMessage: W2, GenericDisplayMessage: e5.Text }), Z2 = e5.Record({ metadata: y2, consent_message: X2 }), g2 = e5.Record({ description: e5.Text }), I2 = e5.Variant({ GenericError: e5.Record({ description: e5.Text, error_code: e5.Nat }), InsufficientPayment: g2, UnsupportedCanisterCall: g2, ConsentMessageUnavailable: g2 }), D2 = e5.Variant({ Ok: Z2, Err: I2 }), L2 = e5.Record({ account: t3, spender: t3 }), ee = e5.Record({ allowance: n2, expires_at: e5.Opt(u2) }), te = e5.Record({ fee: e5.Opt(n2), memo: e5.Opt(e5.Vec(e5.Nat8)), from_subaccount: e5.Opt(c2), created_at_time: e5.Opt(u2), amount: n2, expected_allowance: e5.Opt(n2), expires_at: e5.Opt(u2), spender: t3 }), ce = e5.Variant({ GenericError: e5.Record({ message: e5.Text, error_code: e5.Nat }), TemporarilyUnavailable: e5.Null, Duplicate: e5.Record({ duplicate_of: l3 }), BadFee: e5.Record({ expected_fee: n2 }), AllowanceChanged: e5.Record({ current_allowance: n2 }), CreatedInFuture: e5.Record({ ledger_time: e5.Nat64 }), TooOld: e5.Null, Expired: e5.Record({ ledger_time: e5.Nat64 }), InsufficientFunds: e5.Record({ balance: n2 }) }), F2 = e5.Variant({ Ok: l3, Err: ce }), re2 = e5.Record({ to: t3, fee: e5.Opt(n2), spender_subaccount: e5.Opt(c2), from: t3, memo: e5.Opt(e5.Vec(e5.Nat8)), created_at_time: e5.Opt(u2), amount: n2 }), ne = e5.Variant({ GenericError: e5.Record({ message: e5.Text, error_code: e5.Nat }), TemporarilyUnavailable: e5.Null, InsufficientAllowance: e5.Record({ allowance: n2 }), BadBurn: e5.Record({ min_burn_amount: n2 }), Duplicate: e5.Record({ duplicate_of: l3 }), BadFee: e5.Record({ expected_fee: n2 }), CreatedInFuture: e5.Record({ ledger_time: u2 }), TooOld: e5.Null, InsufficientFunds: e5.Record({ balance: n2 }) }), oe = e5.Variant({ Ok: l3, Err: ne }), i3 = e5.Nat64, f2 = e5.Record({ start: i3, length: e5.Nat64 }), x3 = e5.Nat64, _2 = e5.Record({ timestamp_nanos: e5.Nat64 }), ae = e5.Variant({ Approve: e5.Record({ fee: r2, from: a2, allowance_e8s: e5.Int, allowance: r2, expected_allowance: e5.Opt(r2), expires_at: e5.Opt(_2), spender: a2 }), Burn: e5.Record({ from: a2, amount: r2, spender: e5.Opt(a2) }), Mint: e5.Record({ to: a2, amount: r2 }), Transfer: e5.Record({ to: a2, fee: r2, from: a2, amount: r2, spender: e5.Opt(e5.Vec(e5.Nat8)) }) }), se = e5.Record({ memo: x3, icrc1_memo: e5.Opt(e5.Vec(e5.Nat8)), operation: e5.Opt(ae), created_at_time: _2 }), b2 = e5.Record({ transaction: se, timestamp: _2, parent_hash: e5.Opt(e5.Vec(e5.Nat8)) }), ie = e5.Record({ blocks: e5.Vec(b2) }), V2 = e5.Variant({ BadFirstBlockIndex: e5.Record({ requested_index: i3, first_valid_index: i3 }), Other: e5.Record({ error_message: e5.Text, error_code: e5.Nat64 }) }), de = e5.Variant({ Ok: ie, Err: V2 }), ue = e5.Func([f2], [de], []), le = e5.Record({ callback: ue, start: i3, length: e5.Nat64 }), pe = e5.Record({ certificate: e5.Opt(e5.Vec(e5.Nat8)), blocks: e5.Vec(b2), chain_length: e5.Nat64, first_block_index: i3, archived_blocks: e5.Vec(le) }), _e = e5.Record({ callback: e5.Func([f2], [e5.Variant({ Ok: e5.Vec(e5.Vec(e5.Nat8)), Err: V2 })], []), start: e5.Nat64, length: e5.Nat64 }), me = e5.Record({ certificate: e5.Opt(e5.Vec(e5.Nat8)), blocks: e5.Vec(e5.Vec(e5.Nat8)), chain_length: e5.Nat64, first_block_index: e5.Nat64, archived_blocks: e5.Vec(_e) }), fe = e5.Record({ fee: e5.Opt(n2), from_subaccount: e5.Opt(c2), spender: a2 }), Re = e5.Record({ to: s2, fee: r2, memo: x3, from_subaccount: e5.Opt(c2), created_at_time: e5.Opt(_2), amount: r2 }), ge = e5.Record({ certification: e5.Opt(e5.Vec(e5.Nat8)), tip_index: i3 }), xe = e5.Record({ to: a2, fee: r2, memo: x3, from_subaccount: e5.Opt(c2), created_at_time: e5.Opt(_2), amount: r2 }), Oe = e5.Variant({ TxTooOld: e5.Record({ allowed_window_nanos: e5.Nat64 }), BadFee: e5.Record({ expected_fee: r2 }), TxDuplicate: e5.Record({ duplicate_of: i3 }), TxCreatedInFuture: e5.Null, InsufficientFunds: e5.Record({ balance: r2 }) }), Te = e5.Variant({ Ok: i3, Err: Oe }), Ne = e5.Record({}), ye = e5.Record({ transfer_fee: r2 });
  return e5.Service({ account_balance: e5.Func([E2], [r2], []), account_balance_dfx: e5.Func([S2], [r2], []), account_identifier: e5.Func([t3], [a2], []), archives: e5.Func([], [M2], []), decimals: e5.Func([], [e5.Record({ decimals: e5.Nat32 })], []), get_allowances: e5.Func([G2], [Q2], []), icrc10_supported_standards: e5.Func([], [e5.Vec(e5.Record({ url: e5.Text, name: e5.Text }))], []), icrc1_balance_of: e5.Func([t3], [n2], []), icrc1_decimals: e5.Func([], [e5.Nat8], []), icrc1_fee: e5.Func([], [n2], []), icrc1_metadata: e5.Func([], [e5.Vec(e5.Tuple(e5.Text, z2))], []), icrc1_minting_account: e5.Func([], [e5.Opt(t3)], []), icrc1_name: e5.Func([], [e5.Text], []), icrc1_supported_standards: e5.Func([], [e5.Vec(e5.Record({ url: e5.Text, name: e5.Text }))], []), icrc1_symbol: e5.Func([], [e5.Text], []), icrc1_total_supply: e5.Func([], [n2], []), icrc1_transfer: e5.Func([H2], [$2], []), icrc21_canister_call_consent_message: e5.Func([Y2], [D2], []), icrc2_allowance: e5.Func([L2], [ee], []), icrc2_approve: e5.Func([te], [F2], []), icrc2_transfer_from: e5.Func([re2], [oe], []), is_ledger_ready: e5.Func([], [e5.Bool], ["query"]), name: e5.Func([], [e5.Record({ name: e5.Text })], []), query_blocks: e5.Func([f2], [pe], []), query_encoded_blocks: e5.Func([f2], [me], []), remove_approval: e5.Func([fe], [F2], []), send_dfx: e5.Func([Re], [i3], []), symbol: e5.Func([], [e5.Record({ symbol: e5.Text })], []), tip_of_chain: e5.Func([], [ge], []), transfer: e5.Func([xe], [Te], []), transfer_fee: e5.Func([Ne], [ye], []) });
};
var Ee = ({ IDL: e5 }) => {
  let c2 = e5.Vec(e5.Nat8), t3 = e5.Record({ owner: e5.Principal, subaccount: e5.Opt(c2) }), o3 = e5.Record({ icrc2: e5.Bool }), d2 = e5.Record({ icrc1_minting_account: e5.Opt(t3), feature_flags: e5.Opt(o3) }), r2 = e5.Record({ e8s: e5.Nat64 }), s2 = e5.Text, N2 = e5.Record({ secs: e5.Nat64, nanos: e5.Nat32 }), C2 = e5.Record({ num_blocks_to_archive: e5.Nat64, max_transactions_per_response: e5.Opt(e5.Nat64), trigger_threshold: e5.Nat64, more_controller_ids: e5.Opt(e5.Vec(e5.Principal)), max_message_size_bytes: e5.Opt(e5.Nat64), cycles_for_archive_creation: e5.Opt(e5.Nat64), node_max_memory_size_bytes: e5.Opt(e5.Nat64), controller_id: e5.Principal }), P2 = e5.Record({ send_whitelist: e5.Vec(e5.Principal), token_symbol: e5.Opt(e5.Text), transfer_fee: e5.Opt(r2), minting_account: s2, transaction_window: e5.Opt(N2), max_message_size_bytes: e5.Opt(e5.Nat64), icrc1_minting_account: e5.Opt(t3), archive_options: e5.Opt(C2), initial_values: e5.Vec(e5.Tuple(s2, r2)), token_name: e5.Opt(e5.Text), feature_flags: e5.Opt(o3) });
  e5.Variant({ Upgrade: e5.Opt(d2), Init: P2 });
  let a2 = e5.Vec(e5.Nat8), E2 = e5.Record({ account: a2 }), S2 = e5.Record({ account: s2 }), U2 = e5.Record({ canister_id: e5.Principal }), M2 = e5.Record({ archives: e5.Vec(U2) }), G2 = e5.Record({ prev_spender_id: e5.Opt(s2), from_account_id: s2, take: e5.Opt(e5.Nat64) }), Q2 = e5.Vec(e5.Record({ from_account_id: s2, to_spender_id: s2, allowance: r2, expires_at: e5.Opt(e5.Nat64) })), n2 = e5.Nat, z2 = e5.Variant({ Int: e5.Int, Nat: e5.Nat, Blob: e5.Vec(e5.Nat8), Text: e5.Text }), u2 = e5.Nat64, H2 = e5.Record({ to: t3, fee: e5.Opt(n2), memo: e5.Opt(e5.Vec(e5.Nat8)), from_subaccount: e5.Opt(c2), created_at_time: e5.Opt(u2), amount: n2 }), l3 = e5.Nat, J2 = e5.Variant({ GenericError: e5.Record({ message: e5.Text, error_code: e5.Nat }), TemporarilyUnavailable: e5.Null, BadBurn: e5.Record({ min_burn_amount: n2 }), Duplicate: e5.Record({ duplicate_of: l3 }), BadFee: e5.Record({ expected_fee: n2 }), CreatedInFuture: e5.Record({ ledger_time: e5.Nat64 }), TooOld: e5.Null, InsufficientFunds: e5.Record({ balance: n2 }) }), $2 = e5.Variant({ Ok: l3, Err: J2 }), y2 = e5.Record({ utc_offset_minutes: e5.Opt(e5.Int16), language: e5.Text }), K2 = e5.Record({ metadata: y2, device_spec: e5.Opt(e5.Variant({ GenericDisplay: e5.Null, FieldsDisplay: e5.Null })) }), Y2 = e5.Record({ arg: e5.Vec(e5.Nat8), method: e5.Text, user_preferences: K2 }), j2 = e5.Variant({ Text: e5.Record({ content: e5.Text }), TokenAmount: e5.Record({ decimals: e5.Nat8, amount: e5.Nat64, symbol: e5.Text }), TimestampSeconds: e5.Record({ amount: e5.Nat64 }), DurationSeconds: e5.Record({ amount: e5.Nat64 }) }), W2 = e5.Record({ fields: e5.Vec(e5.Tuple(e5.Text, j2)), intent: e5.Text }), X2 = e5.Variant({ FieldsDisplayMessage: W2, GenericDisplayMessage: e5.Text }), Z2 = e5.Record({ metadata: y2, consent_message: X2 }), g2 = e5.Record({ description: e5.Text }), I2 = e5.Variant({ GenericError: e5.Record({ description: e5.Text, error_code: e5.Nat }), InsufficientPayment: g2, UnsupportedCanisterCall: g2, ConsentMessageUnavailable: g2 }), D2 = e5.Variant({ Ok: Z2, Err: I2 }), L2 = e5.Record({ account: t3, spender: t3 }), ee = e5.Record({ allowance: n2, expires_at: e5.Opt(u2) }), te = e5.Record({ fee: e5.Opt(n2), memo: e5.Opt(e5.Vec(e5.Nat8)), from_subaccount: e5.Opt(c2), created_at_time: e5.Opt(u2), amount: n2, expected_allowance: e5.Opt(n2), expires_at: e5.Opt(u2), spender: t3 }), ce = e5.Variant({ GenericError: e5.Record({ message: e5.Text, error_code: e5.Nat }), TemporarilyUnavailable: e5.Null, Duplicate: e5.Record({ duplicate_of: l3 }), BadFee: e5.Record({ expected_fee: n2 }), AllowanceChanged: e5.Record({ current_allowance: n2 }), CreatedInFuture: e5.Record({ ledger_time: e5.Nat64 }), TooOld: e5.Null, Expired: e5.Record({ ledger_time: e5.Nat64 }), InsufficientFunds: e5.Record({ balance: n2 }) }), F2 = e5.Variant({ Ok: l3, Err: ce }), re2 = e5.Record({ to: t3, fee: e5.Opt(n2), spender_subaccount: e5.Opt(c2), from: t3, memo: e5.Opt(e5.Vec(e5.Nat8)), created_at_time: e5.Opt(u2), amount: n2 }), ne = e5.Variant({ GenericError: e5.Record({ message: e5.Text, error_code: e5.Nat }), TemporarilyUnavailable: e5.Null, InsufficientAllowance: e5.Record({ allowance: n2 }), BadBurn: e5.Record({ min_burn_amount: n2 }), Duplicate: e5.Record({ duplicate_of: l3 }), BadFee: e5.Record({ expected_fee: n2 }), CreatedInFuture: e5.Record({ ledger_time: u2 }), TooOld: e5.Null, InsufficientFunds: e5.Record({ balance: n2 }) }), oe = e5.Variant({ Ok: l3, Err: ne }), i3 = e5.Nat64, f2 = e5.Record({ start: i3, length: e5.Nat64 }), x3 = e5.Nat64, _2 = e5.Record({ timestamp_nanos: e5.Nat64 }), ae = e5.Variant({ Approve: e5.Record({ fee: r2, from: a2, allowance_e8s: e5.Int, allowance: r2, expected_allowance: e5.Opt(r2), expires_at: e5.Opt(_2), spender: a2 }), Burn: e5.Record({ from: a2, amount: r2, spender: e5.Opt(a2) }), Mint: e5.Record({ to: a2, amount: r2 }), Transfer: e5.Record({ to: a2, fee: r2, from: a2, amount: r2, spender: e5.Opt(e5.Vec(e5.Nat8)) }) }), se = e5.Record({ memo: x3, icrc1_memo: e5.Opt(e5.Vec(e5.Nat8)), operation: e5.Opt(ae), created_at_time: _2 }), b2 = e5.Record({ transaction: se, timestamp: _2, parent_hash: e5.Opt(e5.Vec(e5.Nat8)) }), ie = e5.Record({ blocks: e5.Vec(b2) }), V2 = e5.Variant({ BadFirstBlockIndex: e5.Record({ requested_index: i3, first_valid_index: i3 }), Other: e5.Record({ error_message: e5.Text, error_code: e5.Nat64 }) }), de = e5.Variant({ Ok: ie, Err: V2 }), ue = e5.Func([f2], [de], ["query"]), le = e5.Record({ callback: ue, start: i3, length: e5.Nat64 }), pe = e5.Record({ certificate: e5.Opt(e5.Vec(e5.Nat8)), blocks: e5.Vec(b2), chain_length: e5.Nat64, first_block_index: i3, archived_blocks: e5.Vec(le) }), _e = e5.Record({ callback: e5.Func([f2], [e5.Variant({ Ok: e5.Vec(e5.Vec(e5.Nat8)), Err: V2 })], ["query"]), start: e5.Nat64, length: e5.Nat64 }), me = e5.Record({ certificate: e5.Opt(e5.Vec(e5.Nat8)), blocks: e5.Vec(e5.Vec(e5.Nat8)), chain_length: e5.Nat64, first_block_index: e5.Nat64, archived_blocks: e5.Vec(_e) }), fe = e5.Record({ fee: e5.Opt(n2), from_subaccount: e5.Opt(c2), spender: a2 }), Re = e5.Record({ to: s2, fee: r2, memo: x3, from_subaccount: e5.Opt(c2), created_at_time: e5.Opt(_2), amount: r2 }), ge = e5.Record({ certification: e5.Opt(e5.Vec(e5.Nat8)), tip_index: i3 }), xe = e5.Record({ to: a2, fee: r2, memo: x3, from_subaccount: e5.Opt(c2), created_at_time: e5.Opt(_2), amount: r2 }), Oe = e5.Variant({ TxTooOld: e5.Record({ allowed_window_nanos: e5.Nat64 }), BadFee: e5.Record({ expected_fee: r2 }), TxDuplicate: e5.Record({ duplicate_of: i3 }), TxCreatedInFuture: e5.Null, InsufficientFunds: e5.Record({ balance: r2 }) }), Te = e5.Variant({ Ok: i3, Err: Oe }), Ne = e5.Record({}), ye = e5.Record({ transfer_fee: r2 });
  return e5.Service({ account_balance: e5.Func([E2], [r2], ["query"]), account_balance_dfx: e5.Func([S2], [r2], ["query"]), account_identifier: e5.Func([t3], [a2], ["query"]), archives: e5.Func([], [M2], ["query"]), decimals: e5.Func([], [e5.Record({ decimals: e5.Nat32 })], ["query"]), get_allowances: e5.Func([G2], [Q2], ["query"]), icrc10_supported_standards: e5.Func([], [e5.Vec(e5.Record({ url: e5.Text, name: e5.Text }))], ["query"]), icrc1_balance_of: e5.Func([t3], [n2], ["query"]), icrc1_decimals: e5.Func([], [e5.Nat8], ["query"]), icrc1_fee: e5.Func([], [n2], ["query"]), icrc1_metadata: e5.Func([], [e5.Vec(e5.Tuple(e5.Text, z2))], ["query"]), icrc1_minting_account: e5.Func([], [e5.Opt(t3)], ["query"]), icrc1_name: e5.Func([], [e5.Text], ["query"]), icrc1_supported_standards: e5.Func([], [e5.Vec(e5.Record({ url: e5.Text, name: e5.Text }))], ["query"]), icrc1_symbol: e5.Func([], [e5.Text], ["query"]), icrc1_total_supply: e5.Func([], [n2], ["query"]), icrc1_transfer: e5.Func([H2], [$2], []), icrc21_canister_call_consent_message: e5.Func([Y2], [D2], []), icrc2_allowance: e5.Func([L2], [ee], ["query"]), icrc2_approve: e5.Func([te], [F2], []), icrc2_transfer_from: e5.Func([re2], [oe], []), is_ledger_ready: e5.Func([], [e5.Bool], ["query"]), name: e5.Func([], [e5.Record({ name: e5.Text })], ["query"]), query_blocks: e5.Func([f2], [pe], ["query"]), query_encoded_blocks: e5.Func([f2], [me], ["query"]), remove_approval: e5.Func([fe], [F2], []), send_dfx: e5.Func([Re], [i3], []), symbol: e5.Func([], [e5.Record({ symbol: e5.Text })], ["query"]), tip_of_chain: e5.Func([], [ge], ["query"]), transfer: e5.Func([xe], [Te], []), transfer_fee: e5.Func([Ne], [ye], ["query"]) });
};
BigInt(1095062083);
BigInt(1347768404);
var h$1 = BigInt(1e4);
BigInt(1e8);
var Se = (e5) => ({ e8s: e5 }), Ue = ({ to: e5, amount: c2, memo: t3, fee: o3, fromSubAccount: d2, createdAt: r2 }) => ({ to: e5.toUint8Array(), fee: Se(o3 ?? h$1), amount: Se(c2), memo: t3 ?? BigInt(0), created_at_time: r2 !== void 0 ? [{ timestamp_nanos: r2 }] : [], from_subaccount: d2 === void 0 ? [] : [_t(d2)] }), Me = ({ fromSubAccount: e5, to: c2, amount: t3, fee: o3, icrc1Memo: d2, createdAt: r2 }) => ({ to: c2, fee: re(o3 ?? h$1), amount: t3, memo: re(d2), created_at_time: re(r2), from_subaccount: re(e5) }), Ge = ({ fee: e5, createdAt: c2, icrc1Memo: t3, fromSubAccount: o3, expected_allowance: d2, expires_at: r2, amount: s2, ...N2 }) => ({ ...N2, fee: re(e5 ?? h$1), memo: re(t3), from_subaccount: re(o3), created_at_time: re(c2), amount: s2, expected_allowance: re(d2), expires_at: re(r2) }), Qe = ({ userPreferences: { metadata: { utcOffsetMinutes: e5, language: c2 }, deriveSpec: t3 }, ...o3 }) => ({ ...o3, user_preferences: { metadata: { language: c2, utc_offset_minutes: re(e5) }, device_spec: u$2(t3) ? re() : re("GenericDisplay" in t3 ? { GenericDisplay: null } : { FieldsDisplay: null }) } });
var O = class extends Error {
}, R = class extends O {
}, m = class extends O {
}, T = class extends O {
}, A3 = class extends R {
  constructor(t3) {
    super();
    this.balance = t3;
  }
}, w3 = class extends R {
  constructor(t3) {
    super();
    this.allowed_window_secs = t3;
  }
}, v$1 = class v extends R {
}, B2 = class extends R {
  constructor(t3) {
    super();
    this.duplicateOf = t3;
  }
}, k = class extends O {
  constructor(t3) {
    super();
    this.expectedFee = t3;
  }
}, q = class extends m {
  constructor(t3, o3) {
    super();
    this.message = t3;
    this.error_code = o3;
  }
}, Fe = class extends m {
}, be = class extends m {
  constructor(t3) {
    super();
    this.duplicateOf = t3;
  }
}, Ve = class extends m {
  constructor(t3) {
    super();
    this.currentAllowance = t3;
  }
}, Ae = class extends m {
}, ke = class extends m {
}, he = class extends m {
  constructor(t3) {
    super();
    this.ledgerTime = t3;
  }
}, we = class extends T {
}, ve = class extends T {
}, Be = class extends T {
}, Je = (e5) => "TxDuplicate" in e5 ? new B2(e5.TxDuplicate.duplicate_of) : "InsufficientFunds" in e5 ? new A3(e5.InsufficientFunds.balance.e8s) : "TxCreatedInFuture" in e5 ? new v$1() : "TxTooOld" in e5 ? new w3(Number(e5.TxTooOld.allowed_window_nanos)) : "BadFee" in e5 ? new k(e5.BadFee.expected_fee.e8s) : new R(`Unknown error type ${JSON.stringify(e5)}`), $e = (e5) => "Duplicate" in e5 ? new B2(e5.Duplicate.duplicate_of) : "InsufficientFunds" in e5 ? new A3(e5.InsufficientFunds.balance) : "CreatedInFuture" in e5 ? new v$1() : "TooOld" in e5 ? new w3() : "BadFee" in e5 ? new k(e5.BadFee.expected_fee) : new R(`Unknown error type ${JSON.stringify(e5)}`), Ke = (e5) => "GenericError" in e5 ? new q(e5.GenericError.message, e5.GenericError.error_code) : "TemporarilyUnavailable" in e5 ? new Fe() : "Duplicate" in e5 ? new be(e5.Duplicate.duplicate_of) : "BadFee" in e5 ? new k(e5.BadFee.expected_fee) : "AllowanceChanged" in e5 ? new Ve(e5.AllowanceChanged.current_allowance) : "CreatedInFuture" in e5 ? new Ae() : "TooOld" in e5 ? new ke() : "Expired" in e5 ? new he(e5.Expired.ledger_time) : "InsufficientFunds" in e5 ? new A3(e5.InsufficientFunds.balance) : new m(`Unknown error type ${JSON.stringify(e5)}`), Ye = (e5) => "GenericError" in e5 ? new q(e5.GenericError.description, e5.GenericError.error_code) : "InsufficientPayment" in e5 ? new we(e5.InsufficientPayment.description) : "UnsupportedCanisterCall" in e5 ? new ve(e5.UnsupportedCanisterCall.description) : "ConsentMessageUnavailable" in e5 ? new Be(e5.ConsentMessageUnavailable.description) : new T(`Unknown error type ${JSON.stringify(e5)}`);
var je = class e3 extends w$3 {
  static create(c2 = {}) {
    let t3 = c2.canisterId ?? r$1, { service: o3, certifiedService: d2 } = lt({ options: { ...c2, canisterId: t3 }, idlFactory: Ee, certifiedIdlFactory: Pe });
    return new e3(t3, o3, d2);
  }
  accountBalance = async ({ accountIdentifier: c2, certified: t3 = true }) => {
    let o3 = f(c2);
    return (await (t3 ? this.certifiedService : this.service).account_balance({ account: o3.toUint8Array() })).e8s;
  };
  metadata = (c2) => {
    let { icrc1_metadata: t3 } = this.caller(c2);
    return t3();
  };
  transactionFee = async (c2 = { certified: false }) => {
    let { transfer_fee: t3 } = this.caller(c2), { transfer_fee: { e8s: o3 } } = await t3({});
    return o3;
  };
  transfer = async (c2) => {
    let t3 = Ue(c2), o3 = await this.certifiedService.transfer(t3);
    if ("Err" in o3) throw Je(o3.Err);
    return o3.Ok;
  };
  icrc1Transfer = async (c2) => {
    let t3 = Me(c2), o3 = await this.certifiedService.icrc1_transfer(t3);
    if ("Err" in o3) throw $e(o3.Err);
    return o3.Ok;
  };
  icrc2Approve = async (c2) => {
    let { icrc2_approve: t3 } = this.caller({ certified: true }), o3 = await t3(Ge(c2));
    if ("Err" in o3) throw Ke(o3.Err);
    return o3.Ok;
  };
  icrc21ConsentMessage = async (c2) => {
    let { icrc21_canister_call_consent_message: t3 } = this.caller({ certified: true }), o3 = await t3(Qe(c2));
    if ("Err" in o3) throw Ye(o3.Err);
    return o3.Ok;
  };
};
class LedgerApi {
  async ledgerApi() {
    const agent = await createHttpAgent();
    return je.create({
      agent
    });
  }
  async balance() {
    try {
      const agent = await createHttpAgent();
      const principal = await agent.getPrincipal();
      const accountIdentifier = O$1.fromPrincipal({
        principal
      });
      const ledger = await this.ledgerApi();
      return await ledger.accountBalance({
        accountIdentifier
      });
    } catch (error) {
      reportError(NETWORK_ERROR_MESSAGE, error);
      throw error;
    }
  }
  async canisterBalance() {
    try {
      const canister = await canisterId();
      const accountIdentifier = O$1.fromPrincipal({
        principal: canister
      });
      const ledger = await this.ledgerApi();
      return await ledger.accountBalance({
        accountIdentifier
      });
    } catch (error) {
      reportError(NETWORK_ERROR_MESSAGE, error);
      throw error;
    }
  }
  async transfer(to, subAccount, amount, memo, fee) {
    try {
      const ledger = await this.ledgerApi();
      return await ledger.icrc1Transfer({
        to: {
          owner: to,
          subaccount: [subAccount]
        },
        amount,
        icrc1Memo: memo,
        fee
      });
    } catch (error) {
      reportError(NETWORK_ERROR_MESSAGE, error);
      throw error;
    }
  }
}
var e4 = class extends Error {
}, n = class extends Error {
}, o2 = class extends Error {
}, r = class extends Error {
}, i2 = class extends Error {
}, s = ({ Err: t3 }) => {
  throw "Refunded" in t3 ? new e4(t3.Refunded.reason) : "InvalidTransaction" in t3 ? new n(t3.InvalidTransaction) : "Processing" in t3 ? new r() : "TransactionTooOld" in t3 ? new i2() : "Other" in t3 ? new o2(`Error in CMC with code ${t3.Other.error_code}: ${t3.Other.error_message}`) : new Error(`Unsupported error type ${JSON.stringify(t3)}`);
};
var h = ({ IDL: t3 }) => {
  let n2 = t3.Variant({ Set: t3.Principal, Unset: t3.Null }), e5 = t3.Text;
  t3.Record({ exchange_rate_canister: t3.Opt(n2), cycles_ledger_canister_id: t3.Opt(t3.Principal), last_purged_notification: t3.Opt(t3.Nat64), governance_canister_id: t3.Opt(t3.Principal), minting_account_id: t3.Opt(e5), ledger_canister_id: t3.Opt(t3.Principal) });
  let c2 = t3.Record({ subnet_type: t3.Opt(t3.Text) }), a2 = t3.Variant({ Filter: c2, Subnet: t3.Record({ subnet: t3.Principal }) }), p2 = t3.Variant({ controllers: t3.Null, public: t3.Null }), o3 = t3.Record({ freezing_threshold: t3.Opt(t3.Nat), wasm_memory_threshold: t3.Opt(t3.Nat), controllers: t3.Opt(t3.Vec(t3.Principal)), reserved_cycles_limit: t3.Opt(t3.Nat), log_visibility: t3.Opt(p2), wasm_memory_limit: t3.Opt(t3.Nat), memory_allocation: t3.Opt(t3.Nat), compute_allocation: t3.Opt(t3.Nat) }), l3 = t3.Record({ subnet_selection: t3.Opt(a2), settings: t3.Opt(o3), subnet_type: t3.Opt(t3.Text) }), _2 = t3.Variant({ Refunded: t3.Record({ create_error: t3.Text, refund_amount: t3.Nat }) }), d2 = t3.Variant({ Ok: t3.Principal, Err: _2 }), u2 = t3.Record({ xdr_permyriad_per_icp: t3.Nat64, timestamp_seconds: t3.Nat64 }), y2 = t3.Record({ certificate: t3.Vec(t3.Nat8), data: u2, hash_tree: t3.Vec(t3.Nat8) }), O2 = t3.Record({ data: t3.Vec(t3.Tuple(t3.Principal, t3.Vec(t3.Principal))) }), C2 = t3.Record({ data: t3.Vec(t3.Tuple(t3.Text, t3.Vec(t3.Principal))) }), r2 = t3.Nat64, g2 = t3.Record({ controller: t3.Principal, block_index: r2, subnet_selection: t3.Opt(a2), settings: t3.Opt(o3), subnet_type: t3.Opt(t3.Text) }), i3 = t3.Variant({ Refunded: t3.Record({ block_index: t3.Opt(r2), reason: t3.Text }), InvalidTransaction: t3.Text, Other: t3.Record({ error_message: t3.Text, error_code: t3.Nat64 }), Processing: t3.Null, TransactionTooOld: r2 }), N2 = t3.Variant({ Ok: t3.Principal, Err: i3 }), m2 = t3.Opt(t3.Vec(t3.Nat8)), b2 = t3.Opt(t3.Vec(t3.Nat8)), f2 = t3.Record({ block_index: r2, deposit_memo: m2, to_subaccount: b2 }), R2 = t3.Record({ balance: t3.Nat, block_index: t3.Nat, minted: t3.Nat }), P2 = t3.Variant({ Ok: R2, Err: i3 }), T2 = t3.Record({ block_index: r2, canister_id: t3.Principal }), x3 = t3.Nat, S2 = t3.Variant({ Ok: x3, Err: i3 });
  return t3.Service({ create_canister: t3.Func([l3], [d2], []), get_build_metadata: t3.Func([], [t3.Text], []), get_default_subnets: t3.Func([], [t3.Vec(t3.Principal)], []), get_icp_xdr_conversion_rate: t3.Func([], [y2], []), get_principals_authorized_to_create_canisters_to_subnets: t3.Func([], [O2], []), get_subnet_types_to_subnets: t3.Func([], [C2], []), notify_create_canister: t3.Func([g2], [N2], []), notify_mint_cycles: t3.Func([f2], [P2], []), notify_top_up: t3.Func([T2], [S2], []) });
};
var v2 = ({ IDL: t3 }) => {
  let n2 = t3.Variant({ Set: t3.Principal, Unset: t3.Null }), e5 = t3.Text;
  t3.Record({ exchange_rate_canister: t3.Opt(n2), cycles_ledger_canister_id: t3.Opt(t3.Principal), last_purged_notification: t3.Opt(t3.Nat64), governance_canister_id: t3.Opt(t3.Principal), minting_account_id: t3.Opt(e5), ledger_canister_id: t3.Opt(t3.Principal) });
  let c2 = t3.Record({ subnet_type: t3.Opt(t3.Text) }), a2 = t3.Variant({ Filter: c2, Subnet: t3.Record({ subnet: t3.Principal }) }), p2 = t3.Variant({ controllers: t3.Null, public: t3.Null }), o3 = t3.Record({ freezing_threshold: t3.Opt(t3.Nat), wasm_memory_threshold: t3.Opt(t3.Nat), controllers: t3.Opt(t3.Vec(t3.Principal)), reserved_cycles_limit: t3.Opt(t3.Nat), log_visibility: t3.Opt(p2), wasm_memory_limit: t3.Opt(t3.Nat), memory_allocation: t3.Opt(t3.Nat), compute_allocation: t3.Opt(t3.Nat) }), l3 = t3.Record({ subnet_selection: t3.Opt(a2), settings: t3.Opt(o3), subnet_type: t3.Opt(t3.Text) }), _2 = t3.Variant({ Refunded: t3.Record({ create_error: t3.Text, refund_amount: t3.Nat }) }), d2 = t3.Variant({ Ok: t3.Principal, Err: _2 }), u2 = t3.Record({ xdr_permyriad_per_icp: t3.Nat64, timestamp_seconds: t3.Nat64 }), y2 = t3.Record({ certificate: t3.Vec(t3.Nat8), data: u2, hash_tree: t3.Vec(t3.Nat8) }), O2 = t3.Record({ data: t3.Vec(t3.Tuple(t3.Principal, t3.Vec(t3.Principal))) }), C2 = t3.Record({ data: t3.Vec(t3.Tuple(t3.Text, t3.Vec(t3.Principal))) }), r2 = t3.Nat64, g2 = t3.Record({ controller: t3.Principal, block_index: r2, subnet_selection: t3.Opt(a2), settings: t3.Opt(o3), subnet_type: t3.Opt(t3.Text) }), i3 = t3.Variant({ Refunded: t3.Record({ block_index: t3.Opt(r2), reason: t3.Text }), InvalidTransaction: t3.Text, Other: t3.Record({ error_message: t3.Text, error_code: t3.Nat64 }), Processing: t3.Null, TransactionTooOld: r2 }), N2 = t3.Variant({ Ok: t3.Principal, Err: i3 }), m2 = t3.Opt(t3.Vec(t3.Nat8)), b2 = t3.Opt(t3.Vec(t3.Nat8)), f2 = t3.Record({ block_index: r2, deposit_memo: m2, to_subaccount: b2 }), R2 = t3.Record({ balance: t3.Nat, block_index: t3.Nat, minted: t3.Nat }), P2 = t3.Variant({ Ok: R2, Err: i3 }), T2 = t3.Record({ block_index: r2, canister_id: t3.Principal }), x3 = t3.Nat, S2 = t3.Variant({ Ok: x3, Err: i3 });
  return t3.Service({ create_canister: t3.Func([l3], [d2], []), get_build_metadata: t3.Func([], [t3.Text], ["query"]), get_default_subnets: t3.Func([], [t3.Vec(t3.Principal)], ["query"]), get_icp_xdr_conversion_rate: t3.Func([], [y2], ["query"]), get_principals_authorized_to_create_canisters_to_subnets: t3.Func([], [O2], ["query"]), get_subnet_types_to_subnets: t3.Func([], [C2], ["query"]), notify_create_canister: t3.Func([g2], [N2], []), notify_mint_cycles: t3.Func([f2], [P2], []), notify_top_up: t3.Func([T2], [S2], []) });
};
var F = class t2 extends w$3 {
  static create(n2) {
    let { service: e5, certifiedService: s2, canisterId: c2 } = lt({ options: n2, idlFactory: v2, certifiedIdlFactory: h });
    return new t2(c2, e5, s2);
  }
  getIcpToCyclesConversionRate = async ({ certified: n2 } = {}) => {
    let { data: e5 } = await this.caller({ certified: n2 }).get_icp_xdr_conversion_rate();
    return e5.xdr_permyriad_per_icp;
  };
  notifyCreateCanister = async (n2) => {
    let e5 = await this.service.notify_create_canister(n2);
    if ("Err" in e5 && s(e5), "Ok" in e5) return e5.Ok;
    throw new Error(`Unsupported response type in notifyCreateCanister ${JSON.stringify(e5)}`);
  };
  notifyTopUp = async (n2) => {
    let e5 = await this.service.notify_top_up(n2);
    if ("Err" in e5 && s(e5), "Ok" in e5) return e5.Ok;
    throw new Error(`Unsupported response type in notifyTopUp ${JSON.stringify(e5)}`);
  };
  getDefaultSubnets = ({ certified: n2 } = {}) => {
    let { get_default_subnets: e5 } = this.caller({ certified: n2 });
    return e5();
  };
  getSubnetTypesToSubnets = ({ certified: n2 } = {}) => {
    let { get_subnet_types_to_subnets: e5 } = this.caller({ certified: n2 });
    return e5();
  };
};
class CMCApi {
  async cmcApi() {
    const agent = await createHttpAgent();
    return F.create({
      agent,
      canisterId: Principal$1.fromText(CMC_CANISTER_ID)
    });
  }
  async notifyTopUp(canisterId2, blockIndex) {
    try {
      const cmc = await this.cmcApi();
      return await cmc.notifyTopUp({
        canister_id: Principal$1.fromText(canisterId2),
        block_index: blockIndex
      });
    } catch (error) {
      reportError(NETWORK_ERROR_MESSAGE, error);
      throw error;
    }
  }
}
class TopupManager {
  constructor() {
  }
  static async create() {
    const instance = new TopupManager();
    await instance.fetchAndRenderBalance();
    instance.attachEventListeners();
    return instance;
  }
  async fetchAndRenderBalance() {
    const ledgerApi = new LedgerApi();
    const balance = await ledgerApi.balance();
    const formattedBalance = formatIcpBalance(balance);
    updateBalanceDisplay(formattedBalance);
    const authManager = await AuthManager.create();
    const principal = await authManager.getPrincipal();
    updateIcrc1AccountDisplay(principal.toText());
  }
  attachEventListeners() {
    addEventListener("top-up-btn", "click", () => this.performTopUp());
    addEventListener(
      "refresh-balance-btn",
      "click",
      () => this.refreshBalance()
    );
  }
  async refreshBalance() {
    showLoading();
    try {
      await this.fetchAndRenderBalance();
    } catch (e5) {
      reportError(NETWORK_ERROR_MESSAGE, e5);
    } finally {
      hideLoading();
    }
  }
  async performTopUp() {
    showLoading();
    try {
      const hasEnoughBalance = await this.checkBalanceForTopUp();
      if (!hasEnoughBalance) {
        showError(INSUFFICIENT_BALANCE_MESSAGE);
        return;
      }
      const ledgerApi = new LedgerApi();
      const balance = await ledgerApi.balance();
      const transferAmount = balance - ICP_TX_FEE;
      const blockHeight = await this.transferToCMC(transferAmount);
      const cmcApi = new CMCApi();
      const canisterIdPrincipal = await canisterId();
      const canisterIdString = canisterIdPrincipal.toString();
      await cmcApi.notifyTopUp(canisterIdString, blockHeight);
      await this.updateBalanceAndStatus();
    } catch (e5) {
      reportError(NETWORK_ERROR_MESSAGE, e5);
    } finally {
      hideLoading();
    }
  }
  async updateBalanceAndStatus() {
    await StatusManager.create();
    await this.fetchAndRenderBalance();
  }
  async checkBalanceForTopUp() {
    const ledgerApi = new LedgerApi();
    const balance = await ledgerApi.balance();
    const minimumBalance = ICP_TX_FEE * 2n;
    return balance >= minimumBalance;
  }
  async transferToCMC(amount) {
    const ledgerApi = new LedgerApi();
    const canisterIdPrincipal = await canisterId();
    const subaccount = principalToSubaccount(canisterIdPrincipal);
    const cmcPrincipal = Principal$1.fromText(CMC_CANISTER_ID);
    const blockHeight = await ledgerApi.transfer(
      cmcPrincipal,
      subaccount,
      amount,
      TPUP_MEMO,
      ICP_TX_FEE
    );
    return blockHeight;
  }
}
class ControllersManager {
  canisterId;
  iiPrincipal;
  controllersList = [];
  constructor(canisterId2, iiPrincipal) {
    this.canisterId = canisterId2;
    this.iiPrincipal = iiPrincipal;
  }
  static async create(canisterId2, iiPrincipal) {
    const instance = new ControllersManager(canisterId2, iiPrincipal);
    const managementApi = new ManagementApi();
    const status = await managementApi.getCanisterStatus();
    instance.controllersList = status.settings.controllers;
    instance.renderControllersContent();
    instance.attachEventListeners();
    return instance;
  }
  renderControllersContent() {
    const controllersList = getElement("controllers-list");
    const controllersListHtml = this.controllersList.map(
      (controller) => `<li class="data-display">${controller.toString()}</li>`
    ).join("");
    controllersList.innerHTML = controllersListHtml;
    this.attachEventListeners();
  }
  attachEventListeners() {
    addEventListener("controller-add", "click", () => this.handleAdd());
    addEventListener("controller-remove", "click", () => this.handleRemove());
  }
  async handleAdd() {
    const principalText = getInputValue("controller-input");
    if (!principalText) {
      return;
    }
    if (!isValidPrincipal(principalText)) {
      showError(INVALID_PRINCIPAL_MESSAGE);
      clearInput("controller-input");
      return;
    }
    const newController = Principal$1.fromText(principalText);
    const updatedControllers = [...this.controllersList, newController];
    const controllerStrings = updatedControllers.map((c2) => c2.toString());
    const hasDuplicates = controllerStrings.length !== new Set(controllerStrings).size;
    if (hasDuplicates) {
      showError(DUPLICATE_CONTROLLER_MESSAGE);
      clearInput("controller-input");
      return;
    }
    if (!this.hasRequiredPrincipals(updatedControllers)) {
      showError(REQUIRED_CONTROLLERS_MESSAGE);
      clearInput("controller-input");
      return;
    }
    showLoading();
    try {
      const managementApi = new ManagementApi();
      await managementApi.updateControllers(updatedControllers);
      this.controllersList = updatedControllers;
      clearInput("controller-input");
      this.renderControllersContent();
    } catch (e5) {
      reportError(NETWORK_ERROR_MESSAGE, e5);
    } finally {
      hideLoading();
    }
  }
  async handleRemove() {
    const principalText = getInputValue("controller-input");
    if (!principalText) return;
    if (!isValidPrincipal(principalText)) {
      showError(INVALID_PRINCIPAL_MESSAGE);
      clearInput("controller-input");
      return;
    }
    const controllerToRemove = Principal$1.fromText(principalText);
    const controllerExists = this.controllersList.some(
      (controller) => controller.toString() === controllerToRemove.toString()
    );
    if (!controllerExists) {
      showError(CONTROLLER_NOT_FOUND_MESSAGE);
      clearInput("controller-input");
      return;
    }
    const updatedControllers = this.controllersList.filter(
      (controller) => controller.toString() !== controllerToRemove.toString()
    );
    if (!this.hasRequiredPrincipals(updatedControllers)) {
      showError(REQUIRED_CONTROLLERS_MESSAGE);
      clearInput("controller-input");
      return;
    }
    showLoading();
    try {
      const managementApi = new ManagementApi();
      await managementApi.updateControllers(updatedControllers);
      this.controllersList = updatedControllers;
      clearInput("controller-input");
      this.renderControllersContent();
    } catch (e5) {
      reportError(NETWORK_ERROR_MESSAGE, e5);
    } finally {
      hideLoading();
    }
  }
  hasRequiredPrincipals(controllers) {
    const hasCanisterId = controllers.some(
      (controller) => controller.toString() === this.canisterId.toString()
    );
    const hasIIPrincipal = controllers.some(
      (controller) => controller.toString() === this.iiPrincipal.toString()
    );
    return hasCanisterId && hasIIPrincipal;
  }
}
class CanisterApi {
  canisterApi;
  ready;
  constructor() {
    this.ready = this.create();
  }
  async create() {
    const agent = await createHttpAgent();
    const canisterIdPrincipal = await canisterId();
    this.canisterApi = N$1({
      agent,
      canisterId: canisterIdPrincipal
    });
  }
  async manageAlternativeOrigins(arg) {
    try {
      await this.ready;
      return await this.canisterApi.manage_alternative_origins(arg);
    } catch (error) {
      reportError(NETWORK_ERROR_MESSAGE, error);
      throw error;
    }
  }
  async manageTopUpRule(arg) {
    try {
      await this.ready;
      return await this.canisterApi.manage_top_up_rule(arg);
    } catch (error) {
      reportError(NETWORK_ERROR_MESSAGE, error);
      throw error;
    }
  }
}
const IC_UPDATE_CALL_DELAY = 3e3;
class AlternativeOriginsManager {
  canisterApi;
  constructor() {
    this.canisterApi = new CanisterApi();
  }
  static async create() {
    const instance = new AlternativeOriginsManager();
    await instance.initializeDisplay();
    instance.attachEventListeners();
    return instance;
  }
  async initializeDisplay() {
    const origins = await this.fetchAlternativeOrigins();
    const originsList = origins.map((origin) => `<li class="data-display">${origin}</li>`).join("");
    this.renderAlternativeOriginsContent(originsList);
  }
  renderAlternativeOriginsContent(originsList) {
    const alternativeOriginsList = getElement("alternative-origins-list");
    alternativeOriginsList.innerHTML = originsList;
  }
  async fetchAlternativeOrigins() {
    try {
      const response = await fetch("/.well-known/ii-alternative-origins");
      const data = await response.json();
      return data.alternativeOrigins;
    } catch (error) {
      reportError(NETWORK_ERROR_MESSAGE, error);
      return [];
    }
  }
  attachEventListeners() {
    addEventListener("alternative-origin-add", "click", () => this.handleAdd());
    addEventListener(
      "alternative-origin-remove",
      "click",
      () => this.handleRemove()
    );
  }
  async handleAdd() {
    const origin = getInputValue("alternative-origin-input");
    if (!origin) return;
    if (!isValidOrigin(origin)) {
      showError(INVALID_ORIGIN_MESSAGE);
      clearInput("alternative-origin-input");
      return;
    }
    showLoading();
    try {
      const result = await this.canisterApi.manageAlternativeOrigins({
        Add: origin
      });
      if ("Ok" in result) {
        await new Promise((resolve) => setTimeout(resolve, IC_UPDATE_CALL_DELAY));
        await this.initializeDisplay();
        clearInput("alternative-origin-input");
      } else if ("Err" in result) {
        const err = result.Err;
        reportError(NETWORK_ERROR_MESSAGE + ` (${err})`);
      } else {
        reportError("Unknown error adding alternative origin");
        reportError(UNKNOWN_ADD_ALT_ORIGIN_MESSAGE);
      }
    } catch (e5) {
      reportError(FAILED_ADD_ALT_ORIGIN_MESSAGE_PREFIX, e5);
    } finally {
      hideLoading();
    }
  }
  async handleRemove() {
    const origin = getInputValue("alternative-origin-input");
    if (!origin) return;
    showLoading();
    try {
      const result = await this.canisterApi.manageAlternativeOrigins({
        Remove: origin
      });
      if ("Ok" in result) {
        await new Promise((resolve) => setTimeout(resolve, IC_UPDATE_CALL_DELAY));
        await this.initializeDisplay();
        clearInput("alternative-origin-input");
      } else if ("Err" in result) {
        const err = result.Err;
        reportError(NETWORK_ERROR_MESSAGE + ` (${err})`);
      } else {
        reportError("Unknown error removing alternative origin");
        reportError(UNKNOWN_REMOVE_ALT_ORIGIN_MESSAGE);
      }
    } catch (e5) {
      reportError(FAILED_REMOVE_ALT_ORIGIN_MESSAGE_PREFIX, e5);
    } finally {
      hideLoading();
    }
  }
}
class CanisterLogsManager {
  constructor() {
  }
  static async create() {
    const instance = new CanisterLogsManager();
    await instance.renderLogs();
    instance.attachEventListeners();
    return instance;
  }
  attachEventListeners() {
    addEventListener("refresh-logs-btn", "click", () => this.refreshLogs());
  }
  async refreshLogs() {
    showLoading();
    await this.renderLogs();
    hideLoading();
  }
  async renderLogs() {
    try {
      const managementApi = new ManagementApi();
      const { canister_log_records } = await managementApi.getCanisterLogs();
      const logsList = getElement("logs-list");
      if (canister_log_records.length === 0) {
        logsList.innerHTML = '<li class="data-display">No logs found.</li>';
        return;
      }
      const items = canister_log_records.reverse().map((record) => {
        const contentBytes = record.content instanceof Uint8Array ? record.content : Uint8Array.from(record.content);
        const rawMessage = new TextDecoder().decode(contentBytes);
        const timestampMs = Number(record.timestamp_nanos / 1000000n);
        const date = new Date(timestampMs);
        const ts = isNaN(date.getTime()) ? "Unknown time" : formatSimpleDateTime(date);
        const idx = record.idx.toString();
        const message = escapeHtml(rawMessage).replace(/\r\n|\n|\r/g, "<br>");
        return `<li class="data-display">[${ts}] (#${idx})<br>${message}</li>`;
      }).join("");
      logsList.innerHTML = items;
    } catch (e5) {
      reportError(NETWORK_ERROR_MESSAGE, e5);
    }
  }
}
function pad2(n2) {
  return n2.toString().padStart(2, "0");
}
function formatSimpleDateTime(d2) {
  const yyyy = d2.getFullYear();
  const mm = pad2(d2.getMonth() + 1);
  const dd = pad2(d2.getDate());
  const hh = pad2(d2.getHours());
  const mi = pad2(d2.getMinutes());
  const ss = pad2(d2.getSeconds());
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
}
function escapeHtml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
class TopUpRuleManager {
  api = new CanisterApi();
  constructor() {
  }
  static async create() {
    const instance = new TopUpRuleManager();
    await Promise.all([
      instance.fetchAndRender(),
      instance.renderCanisterInfo()
    ]);
    instance.attachEventListeners();
    return instance;
  }
  async renderCanisterInfo() {
    const canisterIdPrincipal = await canisterId();
    const canisterBalance = await new LedgerApi().canisterBalance();
    const canisterIdText = canisterIdPrincipal.toString();
    const formattedCanisterBalance = formatIcpBalance(canisterBalance);
    updateCanisterInfo(canisterIdText, formattedCanisterBalance);
  }
  attachEventListeners() {
    addEventListener("top-up-rule-set", "click", () => this.handleSet());
    addEventListener("top-up-rule-clear", "click", () => this.handleClear());
  }
  async fetchAndRender() {
    try {
      this.render(await this.api.manageTopUpRule({ Get: null }));
    } catch (e5) {
      reportError(NETWORK_ERROR_MESSAGE, e5);
    }
  }
  render(result) {
    if ("Err" in result)
      return showError(TOP_UP_RULE_ERROR_PREFIX + " " + result.Err);
    if ("Ok" in result) {
      const rule = result.Ok[0];
      updateTopUpRuleDisplay(rule ? formatRule(rule) : null);
    }
  }
  async handleSet() {
    const intervalValue = getSelectValue("top-up-rule-interval");
    const thresholdValue = getSelectValue("top-up-rule-threshold");
    const amountValue = getSelectValue("top-up-rule-amount");
    if (!thresholdValue || !amountValue)
      return showError(SELECT_THRESHOLD_AMOUNT_MESSAGE);
    showLoading();
    try {
      const res = await this.api.manageTopUpRule({
        Add: {
          interval: buildInterval(intervalValue),
          cycles_threshold: buildCyclesAmount(thresholdValue),
          cycles_amount: buildCyclesAmount(amountValue)
        }
      });
      if ("Err" in res) return showError(res.Err);
      await this.fetchAndRender();
    } catch (e5) {
      reportError(TOP_UP_ERROR_PREFIX + " " + NETWORK_ERROR_MESSAGE, e5);
    } finally {
      hideLoading();
    }
  }
  async handleClear() {
    showLoading();
    try {
      const res = await this.api.manageTopUpRule({ Clear: null });
      if ("Err" in res)
        return showError(TOP_UP_RULE_ERROR_PREFIX + " " + res.Err);
      await this.fetchAndRender();
    } catch (e5) {
      reportError(TOP_UP_ERROR_PREFIX + " " + NETWORK_ERROR_MESSAGE, e5);
    } finally {
      hideLoading();
    }
  }
}
function firstKey(obj) {
  if (!obj) return void 0;
  return Object.keys(obj)[0];
}
function formatCyclesAmount(ca) {
  const key = firstKey(ca);
  if (!key) return "Unknown";
  return key.replace(/^_/, "").replace("_", ".");
}
function formatInterval(interval) {
  return firstKey(interval) || "Unknown";
}
function formatRule(rule) {
  return [
    `Interval: ${formatInterval(rule.interval)}`,
    `Threshold: ${formatCyclesAmount(rule.cycles_threshold)} cycles`,
    `Amount: ${formatCyclesAmount(rule.cycles_amount)} cycles`
  ].join("\n");
}
function buildCyclesAmount(variantKey) {
  return { [variantKey]: null };
}
function buildInterval(key) {
  const allowed = /* @__PURE__ */ new Set(["Hourly", "Daily", "Weekly", "Monthly"]);
  const safe = allowed.has(key) ? key : "Monthly";
  return { [safe]: null };
}
class Dashboard {
  authManager = null;
  currentState = "initializing";
  // Manager instances for lifecycle control
  managers = {
    topup: null,
    topUpRule: null,
    status: null,
    controllers: null,
    alternativeOrigins: null,
    canisterLogs: null
  };
  constructor() {
    void this.initialize();
  }
  async initialize() {
    try {
      this.setState(
        "initializing"
        /* INITIALIZING */
      );
      showLoading();
      this.authManager = await AuthManager.create();
      await this.checkAuthenticationState();
    } catch (error) {
      console.error("Dashboard initialization error:", error);
      this.setState(
        "error"
        /* ERROR */
      );
      showError(DASHBOARD_INIT_ERROR_MESSAGE);
    } finally {
      hideLoading();
    }
  }
  async checkAuthenticationState() {
    if (!this.authManager)
      return reportError(AUTH_MANAGER_NOT_INITIALIZED_MESSAGE);
    try {
      const isAuthed = await this.authManager.isAuthenticated();
      if (isAuthed) {
        await this.transitionToLoggedIn();
      } else {
        this.transitionToLoggedOut();
      }
    } catch (error) {
      console.error("Authentication check failed:", error);
      this.transitionToLoggedOut();
    }
  }
  async transitionToLoggedIn() {
    if (!this.authManager)
      return reportError(AUTH_MANAGER_NOT_INITIALIZED_MESSAGE);
    try {
      this.setState(
        "logged-in"
        /* LOGGED_IN */
      );
      const iiPrincipal = await this.authManager.getPrincipal();
      const principalText = iiPrincipal.toText();
      setLoggedInState(principalText, () => this.handleLogout());
      const canisterIdPrincipal = await canisterId();
      await this.initializeManagers(canisterIdPrincipal, iiPrincipal);
    } catch (error) {
      console.error("Failed to transition to logged in state:", error);
      this.transitionToLoggedOut();
    }
  }
  transitionToLoggedOut() {
    this.setState(
      "logged-out"
      /* LOGGED_OUT */
    );
    this.clearManagers();
    setLoggedOutState(() => this.handleLogin());
  }
  setState(newState) {
    console.log(
      `Dashboard state transition: ${this.currentState} -> ${newState}`
    );
    this.currentState = newState;
  }
  async initializeManagers(canisterIdPrincipal, iiPrincipal) {
    try {
      showLoading();
      this.managers.topup = await TopupManager.create();
      this.managers.topUpRule = await TopUpRuleManager.create();
      this.managers.status = await StatusManager.create();
      this.managers.controllers = await ControllersManager.create(
        canisterIdPrincipal,
        iiPrincipal
      );
      this.managers.alternativeOrigins = await AlternativeOriginsManager.create();
      this.managers.canisterLogs = await CanisterLogsManager.create();
    } finally {
      hideLoading();
    }
  }
  clearManagers() {
    this.managers.topup = null;
    this.managers.topUpRule = null;
    this.managers.status = null;
    this.managers.controllers = null;
    this.managers.alternativeOrigins = null;
    this.managers.canisterLogs = null;
  }
  async handleLogin() {
    if (!this.authManager)
      return reportError(AUTH_MANAGER_NOT_INITIALIZED_MESSAGE);
    if (this.currentState === "logging-in") {
      return;
    }
    try {
      await this.authManager.logout().catch(() => void 0);
      this.setState(
        "logging-in"
        /* LOGGING_IN */
      );
      showLoading();
      clearErrors();
      await this.authManager.login();
      if (await this.authManager.isAuthenticated()) {
        await this.transitionToLoggedIn();
      } else {
        this.transitionToLoggedOut();
      }
    } catch (error) {
      console.error("Login failed:", error);
      this.setState(
        "error"
        /* ERROR */
      );
      this.transitionToLoggedOut();
    } finally {
      hideLoading();
    }
  }
  async handleLogout() {
    if (!this.authManager)
      return reportError(AUTH_MANAGER_NOT_INITIALIZED_MESSAGE);
    try {
      showLoading();
      clearErrors();
      await this.authManager.logout();
      this.transitionToLoggedOut();
    } catch (error) {
      console.error("Logout failed:", error);
      showError(LOGOUT_FAILED_MESSAGE);
    } finally {
      hideLoading();
    }
  }
}
document.addEventListener("DOMContentLoaded", () => {
  new Dashboard();
});
