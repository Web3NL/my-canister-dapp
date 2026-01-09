var __typeError = (msg) => {
  throw TypeError(msg);
};
var __accessCheck = (obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg);
var __privateGet = (obj, member, getter) => (__accessCheck(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
var __privateAdd = (obj, member, value) => member.has(obj) ? __typeError("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
var __privateSet = (obj, member, value, setter) => (__accessCheck(obj, member, "write to private field"), setter ? setter.call(obj, value) : member.set(obj, value), value);
(function() {
  "use strict";
  var _rawKey, _derKey;
  const alphabet = "abcdefghijklmnopqrstuvwxyz234567";
  const lookupTable = /* @__PURE__ */ Object.create(null);
  for (let i = 0; i < alphabet.length; i++) {
    lookupTable[alphabet[i]] = i;
  }
  lookupTable["0"] = lookupTable.o;
  lookupTable["1"] = lookupTable.i;
  function base32Encode(input) {
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
    for (let i = 0; i < input.length; ) {
      i += encodeByte(input[i]);
    }
    return output + (skip < 0 ? alphabet[bits >> 3] : "");
  }
  function base32Decode(input) {
    let skip = 0;
    let byte = 0;
    const output = new Uint8Array(input.length * 4 / 3 | 0);
    let o = 0;
    function decodeChar(char) {
      let val = lookupTable[char.toLowerCase()];
      if (val === void 0) {
        throw new Error(`Invalid character: ${JSON.stringify(char)}`);
      }
      val <<= 3;
      byte |= val >>> skip;
      skip += 5;
      if (skip >= 8) {
        output[o++] = byte;
        skip -= 8;
        if (skip > 0) {
          byte = val << 5 - skip & 255;
        } else {
          byte = 0;
        }
      }
    }
    for (const c of input) {
      decodeChar(c);
    }
    return output.slice(0, o);
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
    for (let i = 0; i < buf.length; i++) {
      const byte = buf[i];
      const t = (byte ^ crc) & 255;
      crc = lookUpTable[t] ^ crc >>> 8;
    }
    return (crc ^ -1) >>> 0;
  }
  const crypto$1 = typeof globalThis === "object" && "crypto" in globalThis ? globalThis.crypto : void 0;
  function isBytes(a) {
    return a instanceof Uint8Array || ArrayBuffer.isView(a) && a.constructor.name === "Uint8Array";
  }
  function anumber(n) {
    if (!Number.isSafeInteger(n) || n < 0)
      throw new Error("positive integer expected, got " + n);
  }
  function abytes(b, ...lengths) {
    if (!isBytes(b))
      throw new Error("Uint8Array expected");
    if (lengths.length > 0 && !lengths.includes(b.length))
      throw new Error("Uint8Array expected of length " + lengths + ", got length=" + b.length);
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
    for (let i = 0; i < arrays.length; i++) {
      arrays[i].fill(0);
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
  const hexes = /* @__PURE__ */ Array.from({ length: 256 }, (_, i) => i.toString(16).padStart(2, "0"));
  function bytesToHex(bytes) {
    abytes(bytes);
    if (hasHexBuiltin)
      return bytes.toHex();
    let hex = "";
    for (let i = 0; i < bytes.length; i++) {
      hex += hexes[bytes[i]];
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
    for (let i = 0; i < arrays.length; i++) {
      const a = arrays[i];
      abytes(a);
      sum += a.length;
    }
    const res = new Uint8Array(sum);
    for (let i = 0, pad = 0; i < arrays.length; i++) {
      const a = arrays[i];
      res.set(a, pad);
      pad += a.length;
    }
    return res;
  }
  class Hash {
  }
  function createHasher(hashCons) {
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
    const h = isLE ? 4 : 0;
    const l = isLE ? 0 : 4;
    view.setUint32(byteOffset + h, wh, isLE);
    view.setUint32(byteOffset + l, wl, isLE);
  }
  function Chi(a, b, c) {
    return a & b ^ ~a & c;
  }
  function Maj(a, b, c) {
    return a & b ^ a & c ^ b & c;
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
      for (let i = pos; i < blockLen; i++)
        buffer[i] = 0;
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
      for (let i = 0; i < outLen; i++)
        oview.setUint32(4 * i, state[i], isLE);
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
  function fromBig(n, le = false) {
    if (le)
      return { h: Number(n & U32_MASK64), l: Number(n >> _32n & U32_MASK64) };
    return { h: Number(n >> _32n & U32_MASK64) | 0, l: Number(n & U32_MASK64) | 0 };
  }
  function split(lst, le = false) {
    const len = lst.length;
    let Ah = new Uint32Array(len);
    let Al = new Uint32Array(len);
    for (let i = 0; i < len; i++) {
      const { h, l } = fromBig(lst[i], le);
      [Ah[i], Al[i]] = [h, l];
    }
    return [Ah, Al];
  }
  const shrSH = (h, _l, s) => h >>> s;
  const shrSL = (h, l, s) => h << 32 - s | l >>> s;
  const rotrSH = (h, l, s) => h >>> s | l << 32 - s;
  const rotrSL = (h, l, s) => h << 32 - s | l >>> s;
  const rotrBH = (h, l, s) => h << 64 - s | l >>> s - 32;
  const rotrBL = (h, l, s) => h >>> s - 32 | l << 64 - s;
  function add(Ah, Al, Bh, Bl) {
    const l = (Al >>> 0) + (Bl >>> 0);
    return { h: Ah + Bh + (l / 2 ** 32 | 0) | 0, l: l | 0 };
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
      const { A, B, C, D, E, F, G, H } = this;
      return [A, B, C, D, E, F, G, H];
    }
    // prettier-ignore
    set(A, B, C, D, E, F, G, H) {
      this.A = A | 0;
      this.B = B | 0;
      this.C = C | 0;
      this.D = D | 0;
      this.E = E | 0;
      this.F = F | 0;
      this.G = G | 0;
      this.H = H | 0;
    }
    process(view, offset) {
      for (let i = 0; i < 16; i++, offset += 4)
        SHA256_W[i] = view.getUint32(offset, false);
      for (let i = 16; i < 64; i++) {
        const W15 = SHA256_W[i - 15];
        const W2 = SHA256_W[i - 2];
        const s0 = rotr(W15, 7) ^ rotr(W15, 18) ^ W15 >>> 3;
        const s1 = rotr(W2, 17) ^ rotr(W2, 19) ^ W2 >>> 10;
        SHA256_W[i] = s1 + SHA256_W[i - 7] + s0 + SHA256_W[i - 16] | 0;
      }
      let { A, B, C, D, E, F, G, H } = this;
      for (let i = 0; i < 64; i++) {
        const sigma1 = rotr(E, 6) ^ rotr(E, 11) ^ rotr(E, 25);
        const T1 = H + sigma1 + Chi(E, F, G) + SHA256_K[i] + SHA256_W[i] | 0;
        const sigma0 = rotr(A, 2) ^ rotr(A, 13) ^ rotr(A, 22);
        const T2 = sigma0 + Maj(A, B, C) | 0;
        H = G;
        G = F;
        F = E;
        E = D + T1 | 0;
        D = C;
        C = B;
        B = A;
        A = T1 + T2 | 0;
      }
      A = A + this.A | 0;
      B = B + this.B | 0;
      C = C + this.C | 0;
      D = D + this.D | 0;
      E = E + this.E | 0;
      F = F + this.F | 0;
      G = G + this.G | 0;
      H = H + this.H | 0;
      this.set(A, B, C, D, E, F, G, H);
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
  ].map((n) => BigInt(n))))();
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
      for (let i = 0; i < 16; i++, offset += 4) {
        SHA512_W_H[i] = view.getUint32(offset);
        SHA512_W_L[i] = view.getUint32(offset += 4);
      }
      for (let i = 16; i < 80; i++) {
        const W15h = SHA512_W_H[i - 15] | 0;
        const W15l = SHA512_W_L[i - 15] | 0;
        const s0h = rotrSH(W15h, W15l, 1) ^ rotrSH(W15h, W15l, 8) ^ shrSH(W15h, W15l, 7);
        const s0l = rotrSL(W15h, W15l, 1) ^ rotrSL(W15h, W15l, 8) ^ shrSL(W15h, W15l, 7);
        const W2h = SHA512_W_H[i - 2] | 0;
        const W2l = SHA512_W_L[i - 2] | 0;
        const s1h = rotrSH(W2h, W2l, 19) ^ rotrBH(W2h, W2l, 61) ^ shrSH(W2h, W2l, 6);
        const s1l = rotrSL(W2h, W2l, 19) ^ rotrBL(W2h, W2l, 61) ^ shrSL(W2h, W2l, 6);
        const SUMl = add4L(s0l, s1l, SHA512_W_L[i - 7], SHA512_W_L[i - 16]);
        const SUMh = add4H(SUMl, s0h, s1h, SHA512_W_H[i - 7], SHA512_W_H[i - 16]);
        SHA512_W_H[i] = SUMh | 0;
        SHA512_W_L[i] = SUMl | 0;
      }
      let { Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl } = this;
      for (let i = 0; i < 80; i++) {
        const sigma1h = rotrSH(Eh, El, 14) ^ rotrSH(Eh, El, 18) ^ rotrBH(Eh, El, 41);
        const sigma1l = rotrSL(Eh, El, 14) ^ rotrSL(Eh, El, 18) ^ rotrBL(Eh, El, 41);
        const CHIh = Eh & Fh ^ ~Eh & Gh;
        const CHIl = El & Fl ^ ~El & Gl;
        const T1ll = add5L(Hl, sigma1l, CHIl, SHA512_Kl[i], SHA512_W_L[i]);
        const T1h = add5H(T1ll, Hh, sigma1h, CHIh, SHA512_Kh[i], SHA512_W_H[i]);
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
  const sha256 = /* @__PURE__ */ createHasher(() => new SHA256());
  const sha224 = /* @__PURE__ */ createHasher(() => new SHA224());
  const sha512 = /* @__PURE__ */ createHasher(() => new SHA512());
  const JSON_KEY_PRINCIPAL = "__principal__";
  const SELF_AUTHENTICATING_SUFFIX = 2;
  const ANONYMOUS_SUFFIX = 4;
  const MANAGEMENT_CANISTER_PRINCIPAL_TEXT_STR = "aaaaa-aa";
  class Principal {
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
      let arr = base32Decode(canisterIdNoDash);
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
      const result = base32Encode(array);
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
      for (let i = 0; i < Math.min(this._arr.length, other._arr.length); i++) {
        if (this._arr[i] < other._arr[i])
          return "lt";
        else if (this._arr[i] > other._arr[i])
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
  }
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
  class InputError extends ErrorKind {
    constructor(code) {
      super(code, ErrorKindEnum.Input);
      this.name = "InputError";
      Object.setPrototypeOf(this, InputError.prototype);
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
      const b = new Uint8Array((this._buffer.byteLength + amount) * 1.2 | 0);
      const v = new Uint8Array(b.buffer, 0, this._view.byteLength + amount);
      v.set(this._view);
      this._buffer = b;
      this._view = v;
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
    for (let i = 0; i < u1.length; i++) {
      if (u1[i] !== u2[i]) {
        return u1[i] - u2[i];
      }
    }
    return 0;
  }
  function uint8Equals$1(u1, u2) {
    return compare(u1, u2) === 0;
  }
  function ilog2(n) {
    const nBig = BigInt(n);
    if (n <= 0) {
      throw new RangeError("Input must be positive");
    }
    return nBig.toString(2).length - 1;
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
      const i = Number(value & BigInt(127));
      value /= BigInt(128);
      if (value === BigInt(0)) {
        pipe.write(new Uint8Array([i]));
        break;
      } else {
        pipe.write(new Uint8Array([i | 128]));
      }
    }
    return pipe.buffer;
  }
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
  function uint8Equals(a, b) {
    if (a.length !== b.length)
      return false;
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i])
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
  function requestIdOf(request) {
    return hashOfMap(request);
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
    const concatenated = concatBytes(...sorted.map((x) => concatBytes(...x)));
    const result = sha256(concatenated);
    return result;
  }
  new TextEncoder().encode("\ric-state-root");
  const IC_REQUEST_DOMAIN_SEPARATOR = new TextEncoder().encode("\nic-request");
  new TextEncoder().encode("\vic-response");
  const IC_REQUEST_AUTH_DELEGATION_DOMAIN_SEPARATOR = new TextEncoder().encode("ic-request-auth-delegation");
  class SignIdentity {
    /**
     * Get the principal represented by this identity. Normally should be a
     * `Principal.selfAuthenticating()`.
     */
    getPrincipal() {
      if (!this._principal) {
        this._principal = Principal.selfAuthenticating(new Uint8Array(this.getPublicKey().toDer()));
      }
      return this._principal;
    }
    /**
     * Transform a request into a signed version of the request. This is done last
     * after the transforms on the body of a request. The returned object can be
     * anything, but must be serializable to CBOR.
     * @param request - internet computer request to transform
     */
    async transformRequest(request) {
      const { body, ...fields } = request;
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
      return Principal.anonymous();
    }
    async transformRequest(request) {
      return {
        ...request,
        body: { content: request.body }
      };
    }
  }
  const _0n$3 = /* @__PURE__ */ BigInt(0);
  const _1n$4 = /* @__PURE__ */ BigInt(1);
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
    return hex === "" ? _0n$3 : BigInt("0x" + hex);
  }
  function bytesToNumberBE(bytes) {
    return hexToNumber(bytesToHex(bytes));
  }
  function bytesToNumberLE(bytes) {
    abytes(bytes);
    return hexToNumber(bytesToHex(Uint8Array.from(bytes).reverse()));
  }
  function numberToBytesBE(n, len) {
    return hexToBytes(n.toString(16).padStart(len * 2, "0"));
  }
  function numberToBytesLE(n, len) {
    return numberToBytesBE(n, len).reverse();
  }
  function ensureBytes(title, hex, expectedLength) {
    let res;
    if (typeof hex === "string") {
      try {
        res = hexToBytes(hex);
      } catch (e) {
        throw new Error(title + " must be hex string or Uint8Array, cause: " + e);
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
  const isPosBig = (n) => typeof n === "bigint" && _0n$3 <= n;
  function inRange(n, min, max) {
    return isPosBig(n) && isPosBig(min) && isPosBig(max) && min <= n && n < max;
  }
  function aInRange(title, n, min, max) {
    if (!inRange(n, min, max))
      throw new Error("expected valid " + title + ": " + min + " <= n < " + max + ", got " + n);
  }
  function bitLen(n) {
    let len;
    for (len = 0; n > _0n$3; n >>= _1n$4, len += 1)
      ;
    return len;
  }
  const bitMask = (n) => (_1n$4 << BigInt(n)) - _1n$4;
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
    Object.entries(fields).forEach(([k, v]) => checkField(k, v, false));
    Object.entries(optFields).forEach(([k, v]) => checkField(k, v, true));
  }
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
  const _0n$2 = BigInt(0), _1n$3 = BigInt(1), _2n$2 = /* @__PURE__ */ BigInt(2), _3n = /* @__PURE__ */ BigInt(3);
  const _4n = /* @__PURE__ */ BigInt(4), _5n$1 = /* @__PURE__ */ BigInt(5), _7n = /* @__PURE__ */ BigInt(7);
  const _8n$2 = /* @__PURE__ */ BigInt(8), _9n = /* @__PURE__ */ BigInt(9), _16n = /* @__PURE__ */ BigInt(16);
  function mod(a, b) {
    const result = a % b;
    return result >= _0n$2 ? result : b + result;
  }
  function pow2(x, power, modulo) {
    let res = x;
    while (power-- > _0n$2) {
      res *= res;
      res %= modulo;
    }
    return res;
  }
  function invert(number, modulo) {
    if (number === _0n$2)
      throw new Error("invert: expected non-zero number");
    if (modulo <= _0n$2)
      throw new Error("invert: expected positive modulus, got " + modulo);
    let a = mod(number, modulo);
    let b = modulo;
    let x = _0n$2, u = _1n$3;
    while (a !== _0n$2) {
      const q = b / a;
      const r = b % a;
      const m = x - u * q;
      b = a, a = r, x = u, u = m;
    }
    const gcd = b;
    if (gcd !== _1n$3)
      throw new Error("invert: does not exist");
    return mod(x, modulo);
  }
  function assertIsSquare(Fp2, root, n) {
    if (!Fp2.eql(Fp2.sqr(root), n))
      throw new Error("Cannot find square root");
  }
  function sqrt3mod4(Fp2, n) {
    const p1div4 = (Fp2.ORDER + _1n$3) / _4n;
    const root = Fp2.pow(n, p1div4);
    assertIsSquare(Fp2, root, n);
    return root;
  }
  function sqrt5mod8(Fp2, n) {
    const p5div8 = (Fp2.ORDER - _5n$1) / _8n$2;
    const n2 = Fp2.mul(n, _2n$2);
    const v = Fp2.pow(n2, p5div8);
    const nv = Fp2.mul(n, v);
    const i = Fp2.mul(Fp2.mul(nv, _2n$2), v);
    const root = Fp2.mul(nv, Fp2.sub(i, Fp2.ONE));
    assertIsSquare(Fp2, root, n);
    return root;
  }
  function sqrt9mod16(P) {
    const Fp_ = Field(P);
    const tn = tonelliShanks(P);
    const c1 = tn(Fp_, Fp_.neg(Fp_.ONE));
    const c2 = tn(Fp_, c1);
    const c3 = tn(Fp_, Fp_.neg(c1));
    const c4 = (P + _7n) / _16n;
    return (Fp2, n) => {
      let tv1 = Fp2.pow(n, c4);
      let tv2 = Fp2.mul(tv1, c1);
      const tv3 = Fp2.mul(tv1, c2);
      const tv4 = Fp2.mul(tv1, c3);
      const e1 = Fp2.eql(Fp2.sqr(tv2), n);
      const e2 = Fp2.eql(Fp2.sqr(tv3), n);
      tv1 = Fp2.cmov(tv1, tv2, e1);
      tv2 = Fp2.cmov(tv4, tv3, e2);
      const e3 = Fp2.eql(Fp2.sqr(tv2), n);
      const root = Fp2.cmov(tv1, tv2, e3);
      assertIsSquare(Fp2, root, n);
      return root;
    };
  }
  function tonelliShanks(P) {
    if (P < _3n)
      throw new Error("sqrt is not defined for small field");
    let Q = P - _1n$3;
    let S = 0;
    while (Q % _2n$2 === _0n$2) {
      Q /= _2n$2;
      S++;
    }
    let Z = _2n$2;
    const _Fp = Field(P);
    while (FpLegendre(_Fp, Z) === 1) {
      if (Z++ > 1e3)
        throw new Error("Cannot find square root: probably non-prime P");
    }
    if (S === 1)
      return sqrt3mod4;
    let cc = _Fp.pow(Z, Q);
    const Q1div2 = (Q + _1n$3) / _2n$2;
    return function tonelliSlow(Fp2, n) {
      if (Fp2.is0(n))
        return n;
      if (FpLegendre(Fp2, n) !== 1)
        throw new Error("Cannot find square root");
      let M = S;
      let c = Fp2.mul(Fp2.ONE, cc);
      let t = Fp2.pow(n, Q);
      let R = Fp2.pow(n, Q1div2);
      while (!Fp2.eql(t, Fp2.ONE)) {
        if (Fp2.is0(t))
          return Fp2.ZERO;
        let i = 1;
        let t_tmp = Fp2.sqr(t);
        while (!Fp2.eql(t_tmp, Fp2.ONE)) {
          i++;
          t_tmp = Fp2.sqr(t_tmp);
          if (i === M)
            throw new Error("Cannot find square root");
        }
        const exponent = _1n$3 << BigInt(M - i - 1);
        const b = Fp2.pow(c, exponent);
        M = i;
        c = Fp2.sqr(b);
        t = Fp2.mul(t, c);
        R = Fp2.mul(R, b);
      }
      return R;
    };
  }
  function FpSqrt(P) {
    if (P % _4n === _3n)
      return sqrt3mod4;
    if (P % _8n$2 === _5n$1)
      return sqrt5mod8;
    if (P % _16n === _9n)
      return sqrt9mod16(P);
    return tonelliShanks(P);
  }
  const isNegativeLE = (num, modulo) => (mod(num, modulo) & _1n$3) === _1n$3;
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
  function FpPow(Fp2, num, power) {
    if (power < _0n$2)
      throw new Error("invalid exponent, negatives unsupported");
    if (power === _0n$2)
      return Fp2.ONE;
    if (power === _1n$3)
      return num;
    let p = Fp2.ONE;
    let d = num;
    while (power > _0n$2) {
      if (power & _1n$3)
        p = Fp2.mul(p, d);
      d = Fp2.sqr(d);
      power >>= _1n$3;
    }
    return p;
  }
  function FpInvertBatch(Fp2, nums, passZero = false) {
    const inverted = new Array(nums.length).fill(passZero ? Fp2.ZERO : void 0);
    const multipliedAcc = nums.reduce((acc, num, i) => {
      if (Fp2.is0(num))
        return acc;
      inverted[i] = acc;
      return Fp2.mul(acc, num);
    }, Fp2.ONE);
    const invertedAcc = Fp2.inv(multipliedAcc);
    nums.reduceRight((acc, num, i) => {
      if (Fp2.is0(num))
        return acc;
      inverted[i] = Fp2.mul(acc, inverted[i]);
      return Fp2.mul(acc, num);
    }, invertedAcc);
    return inverted;
  }
  function FpLegendre(Fp2, n) {
    const p1mod2 = (Fp2.ORDER - _1n$3) / _2n$2;
    const powered = Fp2.pow(n, p1mod2);
    const yes = Fp2.eql(powered, Fp2.ONE);
    const zero = Fp2.eql(powered, Fp2.ZERO);
    const no = Fp2.eql(powered, Fp2.neg(Fp2.ONE));
    if (!yes && !zero && !no)
      throw new Error("invalid Legendre symbol result");
    return yes ? 1 : zero ? 0 : -1;
  }
  function nLength(n, nBitLength) {
    if (nBitLength !== void 0)
      anumber(nBitLength);
    const _nBitLength = nBitLength !== void 0 ? nBitLength : n.toString(2).length;
    const nByteLength = Math.ceil(_nBitLength / 8);
    return { nBitLength: _nBitLength, nByteLength };
  }
  function Field(ORDER, bitLenOrOpts, isLE = false, opts = {}) {
    if (ORDER <= _0n$2)
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
    const f = Object.freeze({
      ORDER,
      isLE,
      BITS,
      BYTES,
      MASK: bitMask(BITS),
      ZERO: _0n$2,
      ONE: _1n$3,
      allowedLengths,
      create: (num) => mod(num, ORDER),
      isValid: (num) => {
        if (typeof num !== "bigint")
          throw new Error("invalid field element: expected bigint, got " + typeof num);
        return _0n$2 <= num && num < ORDER;
      },
      is0: (num) => num === _0n$2,
      // is valid and invertible
      isValidNot0: (num) => !f.is0(num) && f.isValid(num),
      isOdd: (num) => (num & _1n$3) === _1n$3,
      neg: (num) => mod(-num, ORDER),
      eql: (lhs, rhs) => lhs === rhs,
      sqr: (num) => mod(num * num, ORDER),
      add: (lhs, rhs) => mod(lhs + rhs, ORDER),
      sub: (lhs, rhs) => mod(lhs - rhs, ORDER),
      mul: (lhs, rhs) => mod(lhs * rhs, ORDER),
      pow: (num, power) => FpPow(f, num, power),
      div: (lhs, rhs) => mod(lhs * invert(rhs, ORDER), ORDER),
      // Same as above, but doesn't normalize
      sqrN: (num) => num * num,
      addN: (lhs, rhs) => lhs + rhs,
      subN: (lhs, rhs) => lhs - rhs,
      mulN: (lhs, rhs) => lhs * rhs,
      inv: (num) => invert(num, ORDER),
      sqrt: _sqrt || ((n) => {
        if (!sqrtP)
          sqrtP = FpSqrt(ORDER);
        return sqrtP(f, n);
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
          if (!f.isValid(scalar))
            throw new Error("invalid field element: outside of range 0..ORDER");
        }
        return scalar;
      },
      // TODO: we don't need it here, move out to separate fn
      invertBatch: (lst) => FpInvertBatch(f, lst),
      // We can't move this out because Fp6, Fp12 implement it
      // and it's unclear what to return in there.
      cmov: (a, b, c) => c ? b : a
    });
    return Object.freeze(f);
  }
  const _0n$1 = BigInt(0);
  const _1n$2 = BigInt(1);
  function negateCt(condition, item) {
    const neg = item.negate();
    return condition ? neg : item;
  }
  function normalizeZ(c, points) {
    const invertedZs = FpInvertBatch(c.Fp, points.map((p) => p.Z));
    return points.map((p, i) => c.fromAffine(p.toAffine(invertedZs[i])));
  }
  function validateW(W, bits) {
    if (!Number.isSafeInteger(W) || W <= 0 || W > bits)
      throw new Error("invalid window size, expected [1.." + bits + "], got W=" + W);
  }
  function calcWOpts(W, scalarBits) {
    validateW(W, scalarBits);
    const windows = Math.ceil(scalarBits / W) + 1;
    const windowSize = 2 ** (W - 1);
    const maxNumber = 2 ** W;
    const mask = bitMask(W);
    const shiftBy = BigInt(W);
    return { windows, windowSize, mask, maxNumber, shiftBy };
  }
  function calcOffsets(n, window2, wOpts) {
    const { windowSize, mask, maxNumber, shiftBy } = wOpts;
    let wbits = Number(n & mask);
    let nextN = n >> shiftBy;
    if (wbits > windowSize) {
      wbits -= maxNumber;
      nextN += _1n$2;
    }
    const offsetStart = window2 * windowSize;
    const offset = offsetStart + Math.abs(wbits) - 1;
    const isZero = wbits === 0;
    const isNeg = wbits < 0;
    const isNegF = window2 % 2 !== 0;
    const offsetF = offsetStart;
    return { nextN, offset, isZero, isNeg, isNegF, offsetF };
  }
  function validateMSMPoints(points, c) {
    if (!Array.isArray(points))
      throw new Error("array expected");
    points.forEach((p, i) => {
      if (!(p instanceof c))
        throw new Error("invalid point at index " + i);
    });
  }
  function validateMSMScalars(scalars, field) {
    if (!Array.isArray(scalars))
      throw new Error("array of scalars expected");
    scalars.forEach((s, i) => {
      if (!field.isValid(s))
        throw new Error("invalid scalar at index " + i);
    });
  }
  const pointPrecomputes = /* @__PURE__ */ new WeakMap();
  const pointWindowSizes = /* @__PURE__ */ new WeakMap();
  function getW(P) {
    return pointWindowSizes.get(P) || 1;
  }
  function assert0(n) {
    if (n !== _0n$1)
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
    _unsafeLadder(elm, n, p = this.ZERO) {
      let d = elm;
      while (n > _0n$1) {
        if (n & _1n$2)
          p = p.add(d);
        d = d.double();
        n >>= _1n$2;
      }
      return p;
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
    precomputeWindow(point, W) {
      const { windows, windowSize } = calcWOpts(W, this.bits);
      const points = [];
      let p = point;
      let base = p;
      for (let window2 = 0; window2 < windows; window2++) {
        base = p;
        points.push(base);
        for (let i = 1; i < windowSize; i++) {
          base = base.add(p);
          points.push(base);
        }
        p = base.double();
      }
      return points;
    }
    /**
     * Implements ec multiplication using precomputed tables and w-ary non-adjacent form.
     * More compact implementation:
     * https://github.com/paulmillr/noble-secp256k1/blob/47cb1669b6e506ad66b35fe7d76132ae97465da2/index.ts#L502-L541
     * @returns real and fake (for const-time) points
     */
    wNAF(W, precomputes, n) {
      if (!this.Fn.isValid(n))
        throw new Error("invalid scalar");
      let p = this.ZERO;
      let f = this.BASE;
      const wo = calcWOpts(W, this.bits);
      for (let window2 = 0; window2 < wo.windows; window2++) {
        const { nextN, offset, isZero, isNeg, isNegF, offsetF } = calcOffsets(n, window2, wo);
        n = nextN;
        if (isZero) {
          f = f.add(negateCt(isNegF, precomputes[offsetF]));
        } else {
          p = p.add(negateCt(isNeg, precomputes[offset]));
        }
      }
      assert0(n);
      return { p, f };
    }
    /**
     * Implements ec unsafe (non const-time) multiplication using precomputed tables and w-ary non-adjacent form.
     * @param acc accumulator point to add result of multiplication
     * @returns point
     */
    wNAFUnsafe(W, precomputes, n, acc = this.ZERO) {
      const wo = calcWOpts(W, this.bits);
      for (let window2 = 0; window2 < wo.windows; window2++) {
        if (n === _0n$1)
          break;
        const { nextN, offset, isZero, isNeg } = calcOffsets(n, window2, wo);
        n = nextN;
        if (isZero) {
          continue;
        } else {
          const item = precomputes[offset];
          acc = acc.add(isNeg ? item.negate() : item);
        }
      }
      assert0(n);
      return acc;
    }
    getPrecomputes(W, point, transform) {
      let comp = pointPrecomputes.get(point);
      if (!comp) {
        comp = this.precomputeWindow(point, W);
        if (W !== 1) {
          if (typeof transform === "function")
            comp = transform(comp);
          pointPrecomputes.set(point, comp);
        }
      }
      return comp;
    }
    cached(point, scalar, transform) {
      const W = getW(point);
      return this.wNAF(W, this.getPrecomputes(W, point, transform), scalar);
    }
    unsafe(point, scalar, transform, prev) {
      const W = getW(point);
      if (W === 1)
        return this._unsafeLadder(point, scalar, prev);
      return this.wNAFUnsafe(W, this.getPrecomputes(W, point, transform), scalar, prev);
    }
    // We calculate precomputes for elliptic curve point multiplication
    // using windowed method. This specifies window size and
    // stores precomputed values. Usually only base point would be precomputed.
    createCache(P, W) {
      validateW(W, this.bits);
      pointWindowSizes.set(P, W);
      pointPrecomputes.delete(P);
    }
    hasCache(elm) {
      return getW(elm) !== 1;
    }
  }
  function pippenger(c, fieldN, points, scalars) {
    validateMSMPoints(points, c);
    validateMSMScalars(scalars, fieldN);
    const plength = points.length;
    const slength = scalars.length;
    if (plength !== slength)
      throw new Error("arrays of points and scalars must have equal length");
    const zero = c.ZERO;
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
    for (let i = lastBits; i >= 0; i -= windowSize) {
      buckets.fill(zero);
      for (let j = 0; j < slength; j++) {
        const scalar = scalars[j];
        const wbits2 = Number(scalar >> BigInt(i) & MASK);
        buckets[wbits2] = buckets[wbits2].add(points[j]);
      }
      let resI = zero;
      for (let j = buckets.length - 1, sumI = zero; j > 0; j--) {
        sumI = sumI.add(buckets[j]);
        resI = resI.add(sumI);
      }
      sum = sum.add(resI);
      if (i !== 0)
        for (let j = 0; j < windowSize; j++)
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
    for (const p of ["p", "n", "h"]) {
      const val = CURVE[p];
      if (!(typeof val === "bigint" && val > _0n$1))
        throw new Error(`CURVE.${p} must be positive bigint`);
    }
    const Fp2 = createField(CURVE.p, curveOpts.Fp, FpFnLE);
    const Fn = createField(CURVE.n, curveOpts.Fn, FpFnLE);
    const _b = "d";
    const params = ["Gx", "Gy", "a", _b];
    for (const p of params) {
      if (!Fp2.isValid(CURVE[p]))
        throw new Error(`CURVE.${p} must be valid field element of CURVE.Fp`);
    }
    CURVE = Object.freeze(Object.assign({}, CURVE));
    return { CURVE, Fp: Fp2, Fn };
  }
  const _0n = BigInt(0), _1n$1 = BigInt(1), _2n$1 = BigInt(2), _8n$1 = BigInt(8);
  function isEdValidXY(Fp2, CURVE, x, y) {
    const x2 = Fp2.sqr(x);
    const y2 = Fp2.sqr(y);
    const left = Fp2.add(Fp2.mul(CURVE.a, x2), y2);
    const right = Fp2.add(Fp2.ONE, Fp2.mul(CURVE.d, Fp2.mul(x2, y2)));
    return Fp2.eql(left, right);
  }
  function edwards(params, extraOpts = {}) {
    const validated = _createCurveFields("edwards", params, extraOpts, extraOpts.FpFnLE);
    const { Fp: Fp2, Fn } = validated;
    let CURVE = validated.CURVE;
    const { h: cofactor } = CURVE;
    _validateObject(extraOpts, {}, { uvRatio: "function" });
    const MASK = _2n$1 << BigInt(Fn.BYTES * 8) - _1n$1;
    const modP = (n) => Fp2.create(n);
    const uvRatio2 = extraOpts.uvRatio || ((u, v) => {
      try {
        return { isValid: true, value: Fp2.sqrt(Fp2.div(u, v)) };
      } catch (e) {
        return { isValid: false, value: _0n };
      }
    });
    if (!isEdValidXY(Fp2, CURVE, CURVE.Gx, CURVE.Gy))
      throw new Error("bad curve params: generator point");
    function acoord(title, n, banZero = false) {
      const min = banZero ? _1n$1 : _0n;
      aInRange("coordinate " + title, n, min, MASK);
      return n;
    }
    function aextpoint(other) {
      if (!(other instanceof Point))
        throw new Error("ExtendedPoint expected");
    }
    const toAffineMemo = memoized((p, iz) => {
      const { X, Y, Z } = p;
      const is0 = p.is0();
      if (iz == null)
        iz = is0 ? _8n$1 : Fp2.inv(Z);
      const x = modP(X * iz);
      const y = modP(Y * iz);
      const zz = Fp2.mul(Z, iz);
      if (is0)
        return { x: _0n, y: _1n$1 };
      if (zz !== _1n$1)
        throw new Error("invZ was invalid");
      return { x, y };
    });
    const assertValidMemo = memoized((p) => {
      const { a, d } = CURVE;
      if (p.is0())
        throw new Error("bad point: ZERO");
      const { X, Y, Z, T } = p;
      const X2 = modP(X * X);
      const Y2 = modP(Y * Y);
      const Z2 = modP(Z * Z);
      const Z4 = modP(Z2 * Z2);
      const aX2 = modP(X2 * a);
      const left = modP(Z2 * modP(aX2 + Y2));
      const right = modP(Z4 + modP(d * modP(X2 * Y2)));
      if (left !== right)
        throw new Error("bad point: equation left != right (1)");
      const XY = modP(X * Y);
      const ZT = modP(Z * T);
      if (XY !== ZT)
        throw new Error("bad point: equation left != right (2)");
      return true;
    });
    class Point {
      constructor(X, Y, Z, T) {
        this.X = acoord("x", X);
        this.Y = acoord("y", Y);
        this.Z = acoord("z", Z, true);
        this.T = acoord("t", T);
        Object.freeze(this);
      }
      static CURVE() {
        return CURVE;
      }
      static fromAffine(p) {
        if (p instanceof Point)
          throw new Error("extended point not allowed");
        const { x, y } = p || {};
        acoord("x", x);
        acoord("y", y);
        return new Point(x, y, _1n$1, modP(x * y));
      }
      // Uses algo from RFC8032 5.1.3.
      static fromBytes(bytes, zip215 = false) {
        const len = Fp2.BYTES;
        const { a, d } = CURVE;
        bytes = copyBytes(_abytes2(bytes, len, "point"));
        _abool2(zip215, "zip215");
        const normed = copyBytes(bytes);
        const lastByte = bytes[len - 1];
        normed[len - 1] = lastByte & -129;
        const y = bytesToNumberLE(normed);
        const max = zip215 ? MASK : Fp2.ORDER;
        aInRange("point.y", y, _0n, max);
        const y2 = modP(y * y);
        const u = modP(y2 - _1n$1);
        const v = modP(d * y2 - a);
        let { isValid, value: x } = uvRatio2(u, v);
        if (!isValid)
          throw new Error("bad point: invalid y coordinate");
        const isXOdd = (x & _1n$1) === _1n$1;
        const isLastByteOdd = (lastByte & 128) !== 0;
        if (!zip215 && x === _0n && isLastByteOdd)
          throw new Error("bad point: x=0 and x_0=1");
        if (isLastByteOdd !== isXOdd)
          x = modP(-x);
        return Point.fromAffine({ x, y });
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
        const { a } = CURVE;
        const { X: X1, Y: Y1, Z: Z1 } = this;
        const A = modP(X1 * X1);
        const B = modP(Y1 * Y1);
        const C = modP(_2n$1 * modP(Z1 * Z1));
        const D = modP(a * A);
        const x1y1 = X1 + Y1;
        const E = modP(modP(x1y1 * x1y1) - A - B);
        const G = D + B;
        const F = G - C;
        const H = D - B;
        const X3 = modP(E * F);
        const Y3 = modP(G * H);
        const T3 = modP(E * H);
        const Z3 = modP(F * G);
        return new Point(X3, Y3, Z3, T3);
      }
      // Fast algo for adding 2 Extended Points.
      // https://hyperelliptic.org/EFD/g1p/auto-twisted-extended.html#addition-add-2008-hwcd
      // Cost: 9M + 1*a + 1*d + 7add.
      add(other) {
        aextpoint(other);
        const { a, d } = CURVE;
        const { X: X1, Y: Y1, Z: Z1, T: T1 } = this;
        const { X: X2, Y: Y2, Z: Z2, T: T2 } = other;
        const A = modP(X1 * X2);
        const B = modP(Y1 * Y2);
        const C = modP(T1 * d * T2);
        const D = modP(Z1 * Z2);
        const E = modP((X1 + Y1) * (X2 + Y2) - A - B);
        const F = D - C;
        const G = D + C;
        const H = modP(B - a * A);
        const X3 = modP(E * F);
        const Y3 = modP(G * H);
        const T3 = modP(E * H);
        const Z3 = modP(F * G);
        return new Point(X3, Y3, Z3, T3);
      }
      subtract(other) {
        return this.add(other.negate());
      }
      // Constant-time multiplication.
      multiply(scalar) {
        if (!Fn.isValidNot0(scalar))
          throw new Error("invalid scalar: expected 1 <= sc < curve.n");
        const { p, f } = wnaf.cached(this, scalar, (p2) => normalizeZ(Point, p2));
        return normalizeZ(Point, [p, f])[0];
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
        return wnaf.unsafe(this, scalar, (p) => normalizeZ(Point, p), acc);
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
        const { x, y } = this.toAffine();
        const bytes = Fp2.toBytes(y);
        bytes[bytes.length - 1] |= x & _1n$1 ? 128 : 0;
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
    Point.Fp = Fp2;
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
    const { BASE, Fp: Fp2, Fn } = Point;
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
      const r = hashDomainToScalar(options.context, prefix, msg);
      const R = BASE.multiply(r).toBytes();
      const k = hashDomainToScalar(options.context, R, pointBytes, msg);
      const s = Fn.create(r + k * scalar);
      if (!Fn.isValid(s))
        throw new Error("sign failed: invalid s");
      const rs = concatBytes(R, Fn.toBytes(s));
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
      const r = sig.subarray(0, mid);
      const s = bytesToNumberLE(sig.subarray(mid, len));
      let A, R, SB;
      try {
        A = Point.fromBytes(publicKey, zip215);
        R = Point.fromBytes(r, zip215);
        SB = BASE.multiplyUnsafe(s);
      } catch (error) {
        return false;
      }
      if (!zip215 && A.isSmallOrder())
        return false;
      const k = hashDomainToScalar(context, R.toBytes(), A.toBytes(), msg);
      const RkA = R.add(A.multiplyUnsafe(k));
      return RkA.subtract(SB).clearCofactor().is0();
    }
    const _size = Fp2.BYTES;
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
        const { y } = Point.fromBytes(publicKey);
        const size = lengths.publicKey;
        const is25519 = size === 32;
        if (!is25519 && size !== 57)
          throw new Error("only defined for 25519 and 448");
        const u = is25519 ? Fp2.div(_1n$1 + y, _1n$1 - y) : Fp2.div(y - _1n$1, y + _1n$1);
        return Fp2.toBytes(u);
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
  function _eddsa_legacy_opts_to_new(c) {
    const CURVE = {
      a: c.a,
      d: c.d,
      p: c.Fp.ORDER,
      n: c.n,
      h: c.h,
      Gx: c.Gx,
      Gy: c.Gy
    };
    const Fp2 = c.Fp;
    const Fn = Field(CURVE.n, c.nBitLength, true);
    const curveOpts = { Fp: Fp2, Fn, uvRatio: c.uvRatio };
    const eddsaOpts = {
      randomBytes: c.randomBytes,
      adjustScalarBytes: c.adjustScalarBytes,
      domain: c.domain,
      prehash: c.prehash,
      mapToCurve: c.mapToCurve
    };
    return { CURVE, curveOpts, hash: c.hash, eddsaOpts };
  }
  function _eddsa_new_output_to_legacy(c, eddsa2) {
    const Point = eddsa2.Point;
    const legacy = Object.assign({}, eddsa2, {
      ExtendedPoint: Point,
      CURVE: c,
      nBitLength: Point.Fn.BITS,
      nByteLength: Point.Fn.BYTES
    });
    return legacy;
  }
  function twistedEdwards(c) {
    const { CURVE, curveOpts, hash, eddsaOpts } = _eddsa_legacy_opts_to_new(c);
    const Point = edwards(CURVE, curveOpts);
    const EDDSA = eddsa(Point, hash, eddsaOpts);
    return _eddsa_new_output_to_legacy(c, EDDSA);
  }
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
  function ed25519_pow_2_252_3(x) {
    const _10n = BigInt(10), _20n = BigInt(20), _40n = BigInt(40), _80n = BigInt(80);
    const P = ed25519_CURVE_p;
    const x2 = x * x % P;
    const b2 = x2 * x % P;
    const b4 = pow2(b2, _2n, P) * b2 % P;
    const b5 = pow2(b4, _1n, P) * x % P;
    const b10 = pow2(b5, _5n, P) * b5 % P;
    const b20 = pow2(b10, _10n, P) * b10 % P;
    const b40 = pow2(b20, _20n, P) * b20 % P;
    const b80 = pow2(b40, _40n, P) * b40 % P;
    const b160 = pow2(b80, _80n, P) * b80 % P;
    const b240 = pow2(b160, _80n, P) * b80 % P;
    const b250 = pow2(b240, _10n, P) * b10 % P;
    const pow_p_5_8 = pow2(b250, _2n, P) * x % P;
    return { pow_p_5_8, b2 };
  }
  function adjustScalarBytes(bytes) {
    bytes[0] &= 248;
    bytes[31] &= 127;
    bytes[31] |= 64;
    return bytes;
  }
  const ED25519_SQRT_M1 = /* @__PURE__ */ BigInt("19681161376707505956807079304988542015446066515923890162744021073123829784752");
  function uvRatio(u, v) {
    const P = ed25519_CURVE_p;
    const v3 = mod(v * v * v, P);
    const v7 = mod(v3 * v3 * v, P);
    const pow = ed25519_pow_2_252_3(u * v7).pow_p_5_8;
    let x = mod(u * v3 * pow, P);
    const vx2 = mod(v * x * x, P);
    const root1 = x;
    const root2 = mod(x * ED25519_SQRT_M1, P);
    const useRoot1 = vx2 === u;
    const useRoot2 = vx2 === mod(-u, P);
    const noRoot = vx2 === mod(-u * ED25519_SQRT_M1, P);
    if (useRoot1)
      x = root1;
    if (useRoot2 || noRoot)
      x = root2;
    if (isNegativeLE(x, P))
      x = mod(-x, P);
    return { isValid: useRoot1 || useRoot2, value: x };
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
    const expect = (n, msg) => {
      if (buf[offset++] !== n) {
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
  function isObject(value) {
    return value !== null && typeof value === "object";
  }
  const _Ed25519PublicKey = class _Ed25519PublicKey {
    // `fromRaw` and `fromDer` should be used for instantiation, not this constructor.
    constructor(key) {
      __privateAdd(this, _rawKey);
      __privateAdd(this, _derKey);
      if (key.byteLength !== _Ed25519PublicKey.RAW_KEY_LENGTH) {
        throw new Error("An Ed25519 public key must be exactly 32bytes long");
      }
      __privateSet(this, _rawKey, key);
      __privateSet(this, _derKey, _Ed25519PublicKey.derEncode(key));
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
  };
  _rawKey = new WeakMap();
  _derKey = new WeakMap();
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
      for (let i = 0; i < 32; i++) {
        sk[i] = seed[i];
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
      const [signature, message, publicKey] = [sig, msg, pk].map((x) => {
        if (typeof x === "string") {
          x = hexToBytes(x);
        }
        return uint8FromBufLike$1(x);
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
    if (typeof global !== "undefined" && global["crypto"] && global["crypto"]["subtle"]) {
      return global["crypto"]["subtle"];
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
      return Principal.fromUint8Array(new Uint8Array(this.#inner.rawKey));
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
  function safeBytesToHex(data) {
    if (data instanceof Uint8Array) {
      return bytesToHex(data);
    }
    return bytesToHex(new Uint8Array(data));
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
        pubkey: safeBytesToHex(this.pubkey),
        ...this.targets && { targets: this.targets.map((p) => p.toHex()) }
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
            targets && targets.map((t) => {
              if (typeof t !== "string") {
                throw new Error("Invalid target.");
              }
              return Principal.fromHex(t);
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
              pubkey: safeBytesToHex(delegation.pubkey),
              ...targets && {
                targets: targets.map((t) => t.toHex())
              }
            },
            signature: safeBytesToHex(signature)
          };
        }),
        publicKey: safeBytesToHex(this.publicKey)
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
    constructor(_inner, _delegation) {
      super();
      this._inner = _inner;
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
    async transformRequest(request) {
      const { body, ...fields } = request;
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
  function isDelegationValid(chain, checks) {
    for (const { delegation } of chain.delegations) {
      if (+new Date(Number(delegation.expiration / BigInt(1e6))) <= +Date.now()) {
        return false;
      }
    }
    const scopes = [];
    for (const s of scopes) {
      const scope = s.toText();
      for (const { delegation } of chain.delegations) {
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
      return new IdleManager(options);
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
      events.forEach((name) => {
        document.addEventListener(name, _resetTimer, true);
      });
      const debounce = (func, wait) => {
        let timeout;
        return (...args) => {
          const context = this;
          const later = () => {
            timeout = void 0;
            func.apply(context, args);
          };
          clearTimeout(timeout);
          timeout = window.setTimeout(later, wait);
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
      events.forEach((name) => {
        document.removeEventListener(name, _resetTimer, true);
      });
      this.callbacks.forEach((cb) => {
        cb();
      });
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
  const instanceOfAny = (object, constructors) => constructors.some((c) => object instanceof c);
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
  function promisifyRequest(request) {
    const promise = new Promise((resolve, reject) => {
      const unlisten = () => {
        request.removeEventListener("success", success);
        request.removeEventListener("error", error);
      };
      const success = () => {
        resolve(wrap(request.result));
        unlisten();
      };
      const error = () => {
        reject(request.error);
        unlisten();
      };
      request.addEventListener("success", success);
      request.addEventListener("error", error);
    });
    promise.then((value) => {
      if (value instanceof IDBCursor) {
        cursorRequestMap.set(value, request);
      }
    }).catch(() => {
    });
    reverseTransformCache.set(promise, request);
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
    const request = indexedDB.open(name, version);
    const openPromise = wrap(request);
    if (upgrade) {
      request.addEventListener("upgradeneeded", (event) => {
        upgrade(wrap(request.result), event.oldVersion, event.newVersion, wrap(request.transaction), event);
      });
    }
    if (blocked) {
      request.addEventListener("blocked", (event) => blocked(
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
    if (globalThis.localStorage?.getItem(KEY_STORAGE_DELEGATION)) {
      globalThis.localStorage.removeItem(KEY_STORAGE_DELEGATION);
      globalThis.localStorage.removeItem(KEY_STORAGE_KEY);
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
    // Do not use - instead prefer create
    constructor(_db, _storeName) {
      this._db = _db;
      this._storeName = _storeName;
    }
    /**
     * @param {DBCreateOptions} options - DBCreateOptions
     * @param {DBCreateOptions['dbName']} options.dbName name for the indexeddb database
     * @default
     * @param {DBCreateOptions['storeName']} options.storeName name for the indexeddb Data Store
     * @default
     * @param {DBCreateOptions['version']} options.version version of the database. Increment to safely upgrade
     */
    static async create(options) {
      const {
        dbName = AUTH_DB_NAME,
        storeName = OBJECT_STORE_NAME,
        version = DB_VERSION
      } = options ?? {};
      const db = await _openDbStore(dbName, storeName, version);
      return new IdbKeyVal(db, storeName);
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
  class LocalStorage {
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
      const ls = globalThis.localStorage;
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
      return new Promise((resolve, reject) => {
        if (this.initializedDb) {
          resolve(this.initializedDb);
          return;
        }
        IdbKeyVal.create(this.#options).then((db) => {
          this.initializedDb = db;
          resolve(db);
        }).catch(reject);
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
        if (!maybeIdentityStorage) {
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
            console.error(`error while attempting to recover localstorage: ${error}`);
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
      let chain = null;
      if (key) {
        try {
          const chainStorage = await storage.get(KEY_STORAGE_DELEGATION);
          if (typeof chainStorage === "object" && chainStorage !== null) {
            throw new Error(
              "Delegation chain is incorrectly stored. A delegation chain should be stored as a string."
            );
          }
          if (options.identity) {
            identity = options.identity;
          } else if (chainStorage) {
            chain = DelegationChain.fromJSON(chainStorage);
            if (!isDelegationValid(chain)) {
              await _deleteStorage(storage);
              key = null;
            } else {
              if ("toDer" in key) {
                identity = PartialDelegationIdentity.fromDelegation(key, chain);
              } else {
                identity = DelegationIdentity.fromDelegation(key, chain);
              }
            }
          }
        } catch (e) {
          console.error(e);
          await _deleteStorage(storage);
          key = null;
        }
      }
      let idleManager;
      if (options.idleOptions?.disableIdle) {
        idleManager = void 0;
      } else if (chain || options.identity) {
        idleManager = IdleManager.create(options.idleOptions);
      }
      if (!key) {
        if (keyType === ED25519_KEY_LABEL) {
          key = Ed25519KeyIdentity.generate();
        } else {
          if (options.storage && keyType === ECDSA_KEY_LABEL) {
            console.warn(
              `You are using a custom storage provider that may not support CryptoKey storage. If you are using a custom storage provider that does not support CryptoKey storage, you should use '${ED25519_KEY_LABEL}' as the key type, as it can serialize to a string`
            );
          }
          key = await ECDSAKeyIdentity.generate();
        }
        await persistKey(storage, key);
      }
      return new AuthClient(identity, key, chain, storage, idleManager, options);
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
          delegation: new Delegation(
            signedDelegation.delegation.pubkey,
            signedDelegation.delegation.expiration,
            signedDelegation.delegation.targets
          ),
          signature: signedDelegation.signature
        };
      });
      const delegationChain = DelegationChain.fromDelegations(
        delegations,
        message.userPublicKey
      );
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
      await persistKey(this._storage, this._key);
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
      const identityProviderUrl = new URL(
        loginOptions?.identityProvider?.toString() || IDENTITY_PROVIDER_DEFAULT
      );
      identityProviderUrl.hash = IDENTITY_PROVIDER_ENDPOINT;
      this._idpWindow?.close();
      this._removeEventListener();
      this._eventHandler = this._getEventHandler(identityProviderUrl, {
        maxTimeToLive,
        ...loginOptions
      });
      window.addEventListener("message", this._eventHandler);
      this._idpWindow = window.open(
        identityProviderUrl.toString(),
        "idpWindow",
        loginOptions?.windowOpenerFeatures
      ) ?? void 0;
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
            const request = {
              kind: "authorize-client",
              sessionPublicKey: new Uint8Array(this._key?.getPublicKey().toDer()),
              maxTimeToLive: options?.maxTimeToLive,
              allowPinAuthentication: options?.allowPinAuthentication,
              derivationOrigin: options?.derivationOrigin?.toString(),
              // Pass any custom values to the IDP.
              ...options?.customValues
            };
            this._idpWindow?.postMessage(request, identityProviderUrl.origin);
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
  function toStoredKey(key) {
    if (key instanceof ECDSAKeyIdentity) {
      return key.getKeyPair();
    }
    if (key instanceof Ed25519KeyIdentity) {
      return JSON.stringify(key.toJSON());
    }
    throw new Error("Unsupported key type");
  }
  async function persistKey(storage, key) {
    const serialized = toStoredKey(key);
    await storage.set(KEY_STORAGE_KEY, serialized);
  }
  async function performAuth(identityProvider, derivationOrigin) {
    return new Promise((resolve, reject) => {
      AuthClient.create({
        keyType: "Ed25519"
      }).then(async (client) => {
        try {
          const loginOptions = {
            identityProvider,
            onSuccess: async () => {
              const identity = client.getIdentity();
              const principal = identity.getPrincipal();
              const principalText = principal.toText();
              Principal.fromText(principalText);
              resolve(principalText);
            },
            onError: (error) => {
              reject(new Error(`Authentication failed: ${String(error)}`));
            }
          };
          if (derivationOrigin != null) {
            loginOptions.derivationOrigin = derivationOrigin;
          }
          await client.login(loginOptions);
        } catch (error) {
          reject(new Error(`Auth client error: ${String(error)}`));
        }
      }).catch(reject);
    });
  }
  function createAuthButton() {
    const existing = document.querySelector('[data-tid="derive-ii-auth-btn"]');
    if (existing) {
      existing.remove();
    }
    const button = document.createElement("button");
    button.setAttribute("data-tid", "derive-ii-auth-btn");
    button.textContent = "Derive II Principal";
    const resultDiv = document.createElement("div");
    resultDiv.setAttribute("data-tid", "derive-ii-auth-result");
    document.body.appendChild(button);
    document.body.appendChild(resultDiv);
  }
  window.DeriveIIPrincipal = {
    performAuth,
    createAuthButton
  };
  createAuthButton();
})();
