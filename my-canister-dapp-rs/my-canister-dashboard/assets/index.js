var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value2) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value: value2 }) : obj[key] = value2;
var __publicField = (obj, key, value2) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value2);
(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) {
    return;
  }
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) {
    processPreload(link);
  }
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") {
        continue;
      }
      for (const node of mutation.addedNodes) {
        if (node.tagName === "LINK" && node.rel === "modulepreload")
          processPreload(node);
      }
    }
  }).observe(document, { childList: true, subtree: true });
  function getFetchOpts(link) {
    const fetchOpts = {};
    if (link.integrity) fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials")
      fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
    else fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep)
      return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
})();
function getDefaultExportFromCjs(x2) {
  return x2 && x2.__esModule && Object.prototype.hasOwnProperty.call(x2, "default") ? x2["default"] : x2;
}
var buffer$1 = {};
var base64Js = {};
var hasRequiredBase64Js;
function requireBase64Js() {
  if (hasRequiredBase64Js) return base64Js;
  hasRequiredBase64Js = 1;
  base64Js.byteLength = byteLength;
  base64Js.toByteArray = toByteArray;
  base64Js.fromByteArray = fromByteArray;
  var lookup = [];
  var revLookup = [];
  var Arr = typeof Uint8Array !== "undefined" ? Uint8Array : Array;
  var code = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  for (var i3 = 0, len = code.length; i3 < len; ++i3) {
    lookup[i3] = code[i3];
    revLookup[code.charCodeAt(i3)] = i3;
  }
  revLookup["-".charCodeAt(0)] = 62;
  revLookup["_".charCodeAt(0)] = 63;
  function getLens(b64) {
    var len2 = b64.length;
    if (len2 % 4 > 0) {
      throw new Error("Invalid string. Length must be a multiple of 4");
    }
    var validLen = b64.indexOf("=");
    if (validLen === -1) validLen = len2;
    var placeHoldersLen = validLen === len2 ? 0 : 4 - validLen % 4;
    return [validLen, placeHoldersLen];
  }
  function byteLength(b64) {
    var lens = getLens(b64);
    var validLen = lens[0];
    var placeHoldersLen = lens[1];
    return (validLen + placeHoldersLen) * 3 / 4 - placeHoldersLen;
  }
  function _byteLength(b64, validLen, placeHoldersLen) {
    return (validLen + placeHoldersLen) * 3 / 4 - placeHoldersLen;
  }
  function toByteArray(b64) {
    var tmp;
    var lens = getLens(b64);
    var validLen = lens[0];
    var placeHoldersLen = lens[1];
    var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen));
    var curByte = 0;
    var len2 = placeHoldersLen > 0 ? validLen - 4 : validLen;
    var i4;
    for (i4 = 0; i4 < len2; i4 += 4) {
      tmp = revLookup[b64.charCodeAt(i4)] << 18 | revLookup[b64.charCodeAt(i4 + 1)] << 12 | revLookup[b64.charCodeAt(i4 + 2)] << 6 | revLookup[b64.charCodeAt(i4 + 3)];
      arr[curByte++] = tmp >> 16 & 255;
      arr[curByte++] = tmp >> 8 & 255;
      arr[curByte++] = tmp & 255;
    }
    if (placeHoldersLen === 2) {
      tmp = revLookup[b64.charCodeAt(i4)] << 2 | revLookup[b64.charCodeAt(i4 + 1)] >> 4;
      arr[curByte++] = tmp & 255;
    }
    if (placeHoldersLen === 1) {
      tmp = revLookup[b64.charCodeAt(i4)] << 10 | revLookup[b64.charCodeAt(i4 + 1)] << 4 | revLookup[b64.charCodeAt(i4 + 2)] >> 2;
      arr[curByte++] = tmp >> 8 & 255;
      arr[curByte++] = tmp & 255;
    }
    return arr;
  }
  function tripletToBase64(num) {
    return lookup[num >> 18 & 63] + lookup[num >> 12 & 63] + lookup[num >> 6 & 63] + lookup[num & 63];
  }
  function encodeChunk(uint8, start, end) {
    var tmp;
    var output = [];
    for (var i4 = start; i4 < end; i4 += 3) {
      tmp = (uint8[i4] << 16 & 16711680) + (uint8[i4 + 1] << 8 & 65280) + (uint8[i4 + 2] & 255);
      output.push(tripletToBase64(tmp));
    }
    return output.join("");
  }
  function fromByteArray(uint8) {
    var tmp;
    var len2 = uint8.length;
    var extraBytes = len2 % 3;
    var parts = [];
    var maxChunkLength = 16383;
    for (var i4 = 0, len22 = len2 - extraBytes; i4 < len22; i4 += maxChunkLength) {
      parts.push(encodeChunk(uint8, i4, i4 + maxChunkLength > len22 ? len22 : i4 + maxChunkLength));
    }
    if (extraBytes === 1) {
      tmp = uint8[len2 - 1];
      parts.push(
        lookup[tmp >> 2] + lookup[tmp << 4 & 63] + "=="
      );
    } else if (extraBytes === 2) {
      tmp = (uint8[len2 - 2] << 8) + uint8[len2 - 1];
      parts.push(
        lookup[tmp >> 10] + lookup[tmp >> 4 & 63] + lookup[tmp << 2 & 63] + "="
      );
    }
    return parts.join("");
  }
  return base64Js;
}
var ieee754 = {};
/*! ieee754. BSD-3-Clause License. Feross Aboukhadijeh <https://feross.org/opensource> */
var hasRequiredIeee754;
function requireIeee754() {
  if (hasRequiredIeee754) return ieee754;
  hasRequiredIeee754 = 1;
  ieee754.read = function(buffer2, offset, isLE, mLen, nBytes) {
    var e5, m2;
    var eLen = nBytes * 8 - mLen - 1;
    var eMax = (1 << eLen) - 1;
    var eBias = eMax >> 1;
    var nBits = -7;
    var i3 = isLE ? nBytes - 1 : 0;
    var d2 = isLE ? -1 : 1;
    var s2 = buffer2[offset + i3];
    i3 += d2;
    e5 = s2 & (1 << -nBits) - 1;
    s2 >>= -nBits;
    nBits += eLen;
    for (; nBits > 0; e5 = e5 * 256 + buffer2[offset + i3], i3 += d2, nBits -= 8) {
    }
    m2 = e5 & (1 << -nBits) - 1;
    e5 >>= -nBits;
    nBits += mLen;
    for (; nBits > 0; m2 = m2 * 256 + buffer2[offset + i3], i3 += d2, nBits -= 8) {
    }
    if (e5 === 0) {
      e5 = 1 - eBias;
    } else if (e5 === eMax) {
      return m2 ? NaN : (s2 ? -1 : 1) * Infinity;
    } else {
      m2 = m2 + Math.pow(2, mLen);
      e5 = e5 - eBias;
    }
    return (s2 ? -1 : 1) * m2 * Math.pow(2, e5 - mLen);
  };
  ieee754.write = function(buffer2, value2, offset, isLE, mLen, nBytes) {
    var e5, m2, c;
    var eLen = nBytes * 8 - mLen - 1;
    var eMax = (1 << eLen) - 1;
    var eBias = eMax >> 1;
    var rt = mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0;
    var i3 = isLE ? 0 : nBytes - 1;
    var d2 = isLE ? 1 : -1;
    var s2 = value2 < 0 || value2 === 0 && 1 / value2 < 0 ? 1 : 0;
    value2 = Math.abs(value2);
    if (isNaN(value2) || value2 === Infinity) {
      m2 = isNaN(value2) ? 1 : 0;
      e5 = eMax;
    } else {
      e5 = Math.floor(Math.log(value2) / Math.LN2);
      if (value2 * (c = Math.pow(2, -e5)) < 1) {
        e5--;
        c *= 2;
      }
      if (e5 + eBias >= 1) {
        value2 += rt / c;
      } else {
        value2 += rt * Math.pow(2, 1 - eBias);
      }
      if (value2 * c >= 2) {
        e5++;
        c /= 2;
      }
      if (e5 + eBias >= eMax) {
        m2 = 0;
        e5 = eMax;
      } else if (e5 + eBias >= 1) {
        m2 = (value2 * c - 1) * Math.pow(2, mLen);
        e5 = e5 + eBias;
      } else {
        m2 = value2 * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
        e5 = 0;
      }
    }
    for (; mLen >= 8; buffer2[offset + i3] = m2 & 255, i3 += d2, m2 /= 256, mLen -= 8) {
    }
    e5 = e5 << mLen | m2;
    eLen += mLen;
    for (; eLen > 0; buffer2[offset + i3] = e5 & 255, i3 += d2, e5 /= 256, eLen -= 8) {
    }
    buffer2[offset + i3 - d2] |= s2 * 128;
  };
  return ieee754;
}
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */
var hasRequiredBuffer$1;
function requireBuffer$1() {
  if (hasRequiredBuffer$1) return buffer$1;
  hasRequiredBuffer$1 = 1;
  (function(exports) {
    const base64 = requireBase64Js();
    const ieee7542 = requireIeee754();
    const customInspectSymbol = typeof Symbol === "function" && typeof Symbol["for"] === "function" ? Symbol["for"]("nodejs.util.inspect.custom") : null;
    exports.Buffer = Buffer2;
    exports.SlowBuffer = SlowBuffer;
    exports.INSPECT_MAX_BYTES = 50;
    const K_MAX_LENGTH = 2147483647;
    exports.kMaxLength = K_MAX_LENGTH;
    Buffer2.TYPED_ARRAY_SUPPORT = typedArraySupport();
    if (!Buffer2.TYPED_ARRAY_SUPPORT && typeof console !== "undefined" && typeof console.error === "function") {
      console.error(
        "This browser lacks typed array (Uint8Array) support which is required by `buffer` v5.x. Use `buffer` v4.x if you require old browser support."
      );
    }
    function typedArraySupport() {
      try {
        const arr = new Uint8Array(1);
        const proto = { foo: function() {
          return 42;
        } };
        Object.setPrototypeOf(proto, Uint8Array.prototype);
        Object.setPrototypeOf(arr, proto);
        return arr.foo() === 42;
      } catch (e5) {
        return false;
      }
    }
    Object.defineProperty(Buffer2.prototype, "parent", {
      enumerable: true,
      get: function() {
        if (!Buffer2.isBuffer(this)) return void 0;
        return this.buffer;
      }
    });
    Object.defineProperty(Buffer2.prototype, "offset", {
      enumerable: true,
      get: function() {
        if (!Buffer2.isBuffer(this)) return void 0;
        return this.byteOffset;
      }
    });
    function createBuffer(length) {
      if (length > K_MAX_LENGTH) {
        throw new RangeError('The value "' + length + '" is invalid for option "size"');
      }
      const buf = new Uint8Array(length);
      Object.setPrototypeOf(buf, Buffer2.prototype);
      return buf;
    }
    function Buffer2(arg, encodingOrOffset, length) {
      if (typeof arg === "number") {
        if (typeof encodingOrOffset === "string") {
          throw new TypeError(
            'The "string" argument must be of type string. Received type number'
          );
        }
        return allocUnsafe(arg);
      }
      return from(arg, encodingOrOffset, length);
    }
    Buffer2.poolSize = 8192;
    function from(value2, encodingOrOffset, length) {
      if (typeof value2 === "string") {
        return fromString(value2, encodingOrOffset);
      }
      if (ArrayBuffer.isView(value2)) {
        return fromArrayView(value2);
      }
      if (value2 == null) {
        throw new TypeError(
          "The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " + typeof value2
        );
      }
      if (isInstance(value2, ArrayBuffer) || value2 && isInstance(value2.buffer, ArrayBuffer)) {
        return fromArrayBuffer(value2, encodingOrOffset, length);
      }
      if (typeof SharedArrayBuffer !== "undefined" && (isInstance(value2, SharedArrayBuffer) || value2 && isInstance(value2.buffer, SharedArrayBuffer))) {
        return fromArrayBuffer(value2, encodingOrOffset, length);
      }
      if (typeof value2 === "number") {
        throw new TypeError(
          'The "value" argument must not be of type number. Received type number'
        );
      }
      const valueOf = value2.valueOf && value2.valueOf();
      if (valueOf != null && valueOf !== value2) {
        return Buffer2.from(valueOf, encodingOrOffset, length);
      }
      const b2 = fromObject(value2);
      if (b2) return b2;
      if (typeof Symbol !== "undefined" && Symbol.toPrimitive != null && typeof value2[Symbol.toPrimitive] === "function") {
        return Buffer2.from(value2[Symbol.toPrimitive]("string"), encodingOrOffset, length);
      }
      throw new TypeError(
        "The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " + typeof value2
      );
    }
    Buffer2.from = function(value2, encodingOrOffset, length) {
      return from(value2, encodingOrOffset, length);
    };
    Object.setPrototypeOf(Buffer2.prototype, Uint8Array.prototype);
    Object.setPrototypeOf(Buffer2, Uint8Array);
    function assertSize(size) {
      if (typeof size !== "number") {
        throw new TypeError('"size" argument must be of type number');
      } else if (size < 0) {
        throw new RangeError('The value "' + size + '" is invalid for option "size"');
      }
    }
    function alloc(size, fill, encoding) {
      assertSize(size);
      if (size <= 0) {
        return createBuffer(size);
      }
      if (fill !== void 0) {
        return typeof encoding === "string" ? createBuffer(size).fill(fill, encoding) : createBuffer(size).fill(fill);
      }
      return createBuffer(size);
    }
    Buffer2.alloc = function(size, fill, encoding) {
      return alloc(size, fill, encoding);
    };
    function allocUnsafe(size) {
      assertSize(size);
      return createBuffer(size < 0 ? 0 : checked(size) | 0);
    }
    Buffer2.allocUnsafe = function(size) {
      return allocUnsafe(size);
    };
    Buffer2.allocUnsafeSlow = function(size) {
      return allocUnsafe(size);
    };
    function fromString(string, encoding) {
      if (typeof encoding !== "string" || encoding === "") {
        encoding = "utf8";
      }
      if (!Buffer2.isEncoding(encoding)) {
        throw new TypeError("Unknown encoding: " + encoding);
      }
      const length = byteLength(string, encoding) | 0;
      let buf = createBuffer(length);
      const actual = buf.write(string, encoding);
      if (actual !== length) {
        buf = buf.slice(0, actual);
      }
      return buf;
    }
    function fromArrayLike(array) {
      const length = array.length < 0 ? 0 : checked(array.length) | 0;
      const buf = createBuffer(length);
      for (let i3 = 0; i3 < length; i3 += 1) {
        buf[i3] = array[i3] & 255;
      }
      return buf;
    }
    function fromArrayView(arrayView) {
      if (isInstance(arrayView, Uint8Array)) {
        const copy = new Uint8Array(arrayView);
        return fromArrayBuffer(copy.buffer, copy.byteOffset, copy.byteLength);
      }
      return fromArrayLike(arrayView);
    }
    function fromArrayBuffer(array, byteOffset, length) {
      if (byteOffset < 0 || array.byteLength < byteOffset) {
        throw new RangeError('"offset" is outside of buffer bounds');
      }
      if (array.byteLength < byteOffset + (length || 0)) {
        throw new RangeError('"length" is outside of buffer bounds');
      }
      let buf;
      if (byteOffset === void 0 && length === void 0) {
        buf = new Uint8Array(array);
      } else if (length === void 0) {
        buf = new Uint8Array(array, byteOffset);
      } else {
        buf = new Uint8Array(array, byteOffset, length);
      }
      Object.setPrototypeOf(buf, Buffer2.prototype);
      return buf;
    }
    function fromObject(obj) {
      if (Buffer2.isBuffer(obj)) {
        const len = checked(obj.length) | 0;
        const buf = createBuffer(len);
        if (buf.length === 0) {
          return buf;
        }
        obj.copy(buf, 0, 0, len);
        return buf;
      }
      if (obj.length !== void 0) {
        if (typeof obj.length !== "number" || numberIsNaN(obj.length)) {
          return createBuffer(0);
        }
        return fromArrayLike(obj);
      }
      if (obj.type === "Buffer" && Array.isArray(obj.data)) {
        return fromArrayLike(obj.data);
      }
    }
    function checked(length) {
      if (length >= K_MAX_LENGTH) {
        throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x" + K_MAX_LENGTH.toString(16) + " bytes");
      }
      return length | 0;
    }
    function SlowBuffer(length) {
      if (+length != length) {
        length = 0;
      }
      return Buffer2.alloc(+length);
    }
    Buffer2.isBuffer = function isBuffer(b2) {
      return b2 != null && b2._isBuffer === true && b2 !== Buffer2.prototype;
    };
    Buffer2.compare = function compare2(a, b2) {
      if (isInstance(a, Uint8Array)) a = Buffer2.from(a, a.offset, a.byteLength);
      if (isInstance(b2, Uint8Array)) b2 = Buffer2.from(b2, b2.offset, b2.byteLength);
      if (!Buffer2.isBuffer(a) || !Buffer2.isBuffer(b2)) {
        throw new TypeError(
          'The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array'
        );
      }
      if (a === b2) return 0;
      let x2 = a.length;
      let y = b2.length;
      for (let i3 = 0, len = Math.min(x2, y); i3 < len; ++i3) {
        if (a[i3] !== b2[i3]) {
          x2 = a[i3];
          y = b2[i3];
          break;
        }
      }
      if (x2 < y) return -1;
      if (y < x2) return 1;
      return 0;
    };
    Buffer2.isEncoding = function isEncoding(encoding) {
      switch (String(encoding).toLowerCase()) {
        case "hex":
        case "utf8":
        case "utf-8":
        case "ascii":
        case "latin1":
        case "binary":
        case "base64":
        case "ucs2":
        case "ucs-2":
        case "utf16le":
        case "utf-16le":
          return true;
        default:
          return false;
      }
    };
    Buffer2.concat = function concat2(list, length) {
      if (!Array.isArray(list)) {
        throw new TypeError('"list" argument must be an Array of Buffers');
      }
      if (list.length === 0) {
        return Buffer2.alloc(0);
      }
      let i3;
      if (length === void 0) {
        length = 0;
        for (i3 = 0; i3 < list.length; ++i3) {
          length += list[i3].length;
        }
      }
      const buffer2 = Buffer2.allocUnsafe(length);
      let pos = 0;
      for (i3 = 0; i3 < list.length; ++i3) {
        let buf = list[i3];
        if (isInstance(buf, Uint8Array)) {
          if (pos + buf.length > buffer2.length) {
            if (!Buffer2.isBuffer(buf)) buf = Buffer2.from(buf);
            buf.copy(buffer2, pos);
          } else {
            Uint8Array.prototype.set.call(
              buffer2,
              buf,
              pos
            );
          }
        } else if (!Buffer2.isBuffer(buf)) {
          throw new TypeError('"list" argument must be an Array of Buffers');
        } else {
          buf.copy(buffer2, pos);
        }
        pos += buf.length;
      }
      return buffer2;
    };
    function byteLength(string, encoding) {
      if (Buffer2.isBuffer(string)) {
        return string.length;
      }
      if (ArrayBuffer.isView(string) || isInstance(string, ArrayBuffer)) {
        return string.byteLength;
      }
      if (typeof string !== "string") {
        throw new TypeError(
          'The "string" argument must be one of type string, Buffer, or ArrayBuffer. Received type ' + typeof string
        );
      }
      const len = string.length;
      const mustMatch = arguments.length > 2 && arguments[2] === true;
      if (!mustMatch && len === 0) return 0;
      let loweredCase = false;
      for (; ; ) {
        switch (encoding) {
          case "ascii":
          case "latin1":
          case "binary":
            return len;
          case "utf8":
          case "utf-8":
            return utf8ToBytes2(string).length;
          case "ucs2":
          case "ucs-2":
          case "utf16le":
          case "utf-16le":
            return len * 2;
          case "hex":
            return len >>> 1;
          case "base64":
            return base64ToBytes(string).length;
          default:
            if (loweredCase) {
              return mustMatch ? -1 : utf8ToBytes2(string).length;
            }
            encoding = ("" + encoding).toLowerCase();
            loweredCase = true;
        }
      }
    }
    Buffer2.byteLength = byteLength;
    function slowToString(encoding, start, end) {
      let loweredCase = false;
      if (start === void 0 || start < 0) {
        start = 0;
      }
      if (start > this.length) {
        return "";
      }
      if (end === void 0 || end > this.length) {
        end = this.length;
      }
      if (end <= 0) {
        return "";
      }
      end >>>= 0;
      start >>>= 0;
      if (end <= start) {
        return "";
      }
      if (!encoding) encoding = "utf8";
      while (true) {
        switch (encoding) {
          case "hex":
            return hexSlice(this, start, end);
          case "utf8":
          case "utf-8":
            return utf8Slice(this, start, end);
          case "ascii":
            return asciiSlice(this, start, end);
          case "latin1":
          case "binary":
            return latin1Slice(this, start, end);
          case "base64":
            return base64Slice(this, start, end);
          case "ucs2":
          case "ucs-2":
          case "utf16le":
          case "utf-16le":
            return utf16leSlice(this, start, end);
          default:
            if (loweredCase) throw new TypeError("Unknown encoding: " + encoding);
            encoding = (encoding + "").toLowerCase();
            loweredCase = true;
        }
      }
    }
    Buffer2.prototype._isBuffer = true;
    function swap(b2, n2, m2) {
      const i3 = b2[n2];
      b2[n2] = b2[m2];
      b2[m2] = i3;
    }
    Buffer2.prototype.swap16 = function swap16() {
      const len = this.length;
      if (len % 2 !== 0) {
        throw new RangeError("Buffer size must be a multiple of 16-bits");
      }
      for (let i3 = 0; i3 < len; i3 += 2) {
        swap(this, i3, i3 + 1);
      }
      return this;
    };
    Buffer2.prototype.swap32 = function swap32() {
      const len = this.length;
      if (len % 4 !== 0) {
        throw new RangeError("Buffer size must be a multiple of 32-bits");
      }
      for (let i3 = 0; i3 < len; i3 += 4) {
        swap(this, i3, i3 + 3);
        swap(this, i3 + 1, i3 + 2);
      }
      return this;
    };
    Buffer2.prototype.swap64 = function swap64() {
      const len = this.length;
      if (len % 8 !== 0) {
        throw new RangeError("Buffer size must be a multiple of 64-bits");
      }
      for (let i3 = 0; i3 < len; i3 += 8) {
        swap(this, i3, i3 + 7);
        swap(this, i3 + 1, i3 + 6);
        swap(this, i3 + 2, i3 + 5);
        swap(this, i3 + 3, i3 + 4);
      }
      return this;
    };
    Buffer2.prototype.toString = function toString() {
      const length = this.length;
      if (length === 0) return "";
      if (arguments.length === 0) return utf8Slice(this, 0, length);
      return slowToString.apply(this, arguments);
    };
    Buffer2.prototype.toLocaleString = Buffer2.prototype.toString;
    Buffer2.prototype.equals = function equals(b2) {
      if (!Buffer2.isBuffer(b2)) throw new TypeError("Argument must be a Buffer");
      if (this === b2) return true;
      return Buffer2.compare(this, b2) === 0;
    };
    Buffer2.prototype.inspect = function inspect() {
      let str = "";
      const max = exports.INSPECT_MAX_BYTES;
      str = this.toString("hex", 0, max).replace(/(.{2})/g, "$1 ").trim();
      if (this.length > max) str += " ... ";
      return "<Buffer " + str + ">";
    };
    if (customInspectSymbol) {
      Buffer2.prototype[customInspectSymbol] = Buffer2.prototype.inspect;
    }
    Buffer2.prototype.compare = function compare2(target, start, end, thisStart, thisEnd) {
      if (isInstance(target, Uint8Array)) {
        target = Buffer2.from(target, target.offset, target.byteLength);
      }
      if (!Buffer2.isBuffer(target)) {
        throw new TypeError(
          'The "target" argument must be one of type Buffer or Uint8Array. Received type ' + typeof target
        );
      }
      if (start === void 0) {
        start = 0;
      }
      if (end === void 0) {
        end = target ? target.length : 0;
      }
      if (thisStart === void 0) {
        thisStart = 0;
      }
      if (thisEnd === void 0) {
        thisEnd = this.length;
      }
      if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
        throw new RangeError("out of range index");
      }
      if (thisStart >= thisEnd && start >= end) {
        return 0;
      }
      if (thisStart >= thisEnd) {
        return -1;
      }
      if (start >= end) {
        return 1;
      }
      start >>>= 0;
      end >>>= 0;
      thisStart >>>= 0;
      thisEnd >>>= 0;
      if (this === target) return 0;
      let x2 = thisEnd - thisStart;
      let y = end - start;
      const len = Math.min(x2, y);
      const thisCopy = this.slice(thisStart, thisEnd);
      const targetCopy = target.slice(start, end);
      for (let i3 = 0; i3 < len; ++i3) {
        if (thisCopy[i3] !== targetCopy[i3]) {
          x2 = thisCopy[i3];
          y = targetCopy[i3];
          break;
        }
      }
      if (x2 < y) return -1;
      if (y < x2) return 1;
      return 0;
    };
    function bidirectionalIndexOf(buffer2, val, byteOffset, encoding, dir) {
      if (buffer2.length === 0) return -1;
      if (typeof byteOffset === "string") {
        encoding = byteOffset;
        byteOffset = 0;
      } else if (byteOffset > 2147483647) {
        byteOffset = 2147483647;
      } else if (byteOffset < -2147483648) {
        byteOffset = -2147483648;
      }
      byteOffset = +byteOffset;
      if (numberIsNaN(byteOffset)) {
        byteOffset = dir ? 0 : buffer2.length - 1;
      }
      if (byteOffset < 0) byteOffset = buffer2.length + byteOffset;
      if (byteOffset >= buffer2.length) {
        if (dir) return -1;
        else byteOffset = buffer2.length - 1;
      } else if (byteOffset < 0) {
        if (dir) byteOffset = 0;
        else return -1;
      }
      if (typeof val === "string") {
        val = Buffer2.from(val, encoding);
      }
      if (Buffer2.isBuffer(val)) {
        if (val.length === 0) {
          return -1;
        }
        return arrayIndexOf(buffer2, val, byteOffset, encoding, dir);
      } else if (typeof val === "number") {
        val = val & 255;
        if (typeof Uint8Array.prototype.indexOf === "function") {
          if (dir) {
            return Uint8Array.prototype.indexOf.call(buffer2, val, byteOffset);
          } else {
            return Uint8Array.prototype.lastIndexOf.call(buffer2, val, byteOffset);
          }
        }
        return arrayIndexOf(buffer2, [val], byteOffset, encoding, dir);
      }
      throw new TypeError("val must be string, number or Buffer");
    }
    function arrayIndexOf(arr, val, byteOffset, encoding, dir) {
      let indexSize = 1;
      let arrLength = arr.length;
      let valLength = val.length;
      if (encoding !== void 0) {
        encoding = String(encoding).toLowerCase();
        if (encoding === "ucs2" || encoding === "ucs-2" || encoding === "utf16le" || encoding === "utf-16le") {
          if (arr.length < 2 || val.length < 2) {
            return -1;
          }
          indexSize = 2;
          arrLength /= 2;
          valLength /= 2;
          byteOffset /= 2;
        }
      }
      function read(buf, i4) {
        if (indexSize === 1) {
          return buf[i4];
        } else {
          return buf.readUInt16BE(i4 * indexSize);
        }
      }
      let i3;
      if (dir) {
        let foundIndex = -1;
        for (i3 = byteOffset; i3 < arrLength; i3++) {
          if (read(arr, i3) === read(val, foundIndex === -1 ? 0 : i3 - foundIndex)) {
            if (foundIndex === -1) foundIndex = i3;
            if (i3 - foundIndex + 1 === valLength) return foundIndex * indexSize;
          } else {
            if (foundIndex !== -1) i3 -= i3 - foundIndex;
            foundIndex = -1;
          }
        }
      } else {
        if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength;
        for (i3 = byteOffset; i3 >= 0; i3--) {
          let found = true;
          for (let j2 = 0; j2 < valLength; j2++) {
            if (read(arr, i3 + j2) !== read(val, j2)) {
              found = false;
              break;
            }
          }
          if (found) return i3;
        }
      }
      return -1;
    }
    Buffer2.prototype.includes = function includes(val, byteOffset, encoding) {
      return this.indexOf(val, byteOffset, encoding) !== -1;
    };
    Buffer2.prototype.indexOf = function indexOf(val, byteOffset, encoding) {
      return bidirectionalIndexOf(this, val, byteOffset, encoding, true);
    };
    Buffer2.prototype.lastIndexOf = function lastIndexOf(val, byteOffset, encoding) {
      return bidirectionalIndexOf(this, val, byteOffset, encoding, false);
    };
    function hexWrite(buf, string, offset, length) {
      offset = Number(offset) || 0;
      const remaining = buf.length - offset;
      if (!length) {
        length = remaining;
      } else {
        length = Number(length);
        if (length > remaining) {
          length = remaining;
        }
      }
      const strLen = string.length;
      if (length > strLen / 2) {
        length = strLen / 2;
      }
      let i3;
      for (i3 = 0; i3 < length; ++i3) {
        const parsed = parseInt(string.substr(i3 * 2, 2), 16);
        if (numberIsNaN(parsed)) return i3;
        buf[offset + i3] = parsed;
      }
      return i3;
    }
    function utf8Write(buf, string, offset, length) {
      return blitBuffer(utf8ToBytes2(string, buf.length - offset), buf, offset, length);
    }
    function asciiWrite(buf, string, offset, length) {
      return blitBuffer(asciiToBytes(string), buf, offset, length);
    }
    function base64Write(buf, string, offset, length) {
      return blitBuffer(base64ToBytes(string), buf, offset, length);
    }
    function ucs2Write(buf, string, offset, length) {
      return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length);
    }
    Buffer2.prototype.write = function write(string, offset, length, encoding) {
      if (offset === void 0) {
        encoding = "utf8";
        length = this.length;
        offset = 0;
      } else if (length === void 0 && typeof offset === "string") {
        encoding = offset;
        length = this.length;
        offset = 0;
      } else if (isFinite(offset)) {
        offset = offset >>> 0;
        if (isFinite(length)) {
          length = length >>> 0;
          if (encoding === void 0) encoding = "utf8";
        } else {
          encoding = length;
          length = void 0;
        }
      } else {
        throw new Error(
          "Buffer.write(string, encoding, offset[, length]) is no longer supported"
        );
      }
      const remaining = this.length - offset;
      if (length === void 0 || length > remaining) length = remaining;
      if (string.length > 0 && (length < 0 || offset < 0) || offset > this.length) {
        throw new RangeError("Attempt to write outside buffer bounds");
      }
      if (!encoding) encoding = "utf8";
      let loweredCase = false;
      for (; ; ) {
        switch (encoding) {
          case "hex":
            return hexWrite(this, string, offset, length);
          case "utf8":
          case "utf-8":
            return utf8Write(this, string, offset, length);
          case "ascii":
          case "latin1":
          case "binary":
            return asciiWrite(this, string, offset, length);
          case "base64":
            return base64Write(this, string, offset, length);
          case "ucs2":
          case "ucs-2":
          case "utf16le":
          case "utf-16le":
            return ucs2Write(this, string, offset, length);
          default:
            if (loweredCase) throw new TypeError("Unknown encoding: " + encoding);
            encoding = ("" + encoding).toLowerCase();
            loweredCase = true;
        }
      }
    };
    Buffer2.prototype.toJSON = function toJSON() {
      return {
        type: "Buffer",
        data: Array.prototype.slice.call(this._arr || this, 0)
      };
    };
    function base64Slice(buf, start, end) {
      if (start === 0 && end === buf.length) {
        return base64.fromByteArray(buf);
      } else {
        return base64.fromByteArray(buf.slice(start, end));
      }
    }
    function utf8Slice(buf, start, end) {
      end = Math.min(buf.length, end);
      const res = [];
      let i3 = start;
      while (i3 < end) {
        const firstByte = buf[i3];
        let codePoint = null;
        let bytesPerSequence = firstByte > 239 ? 4 : firstByte > 223 ? 3 : firstByte > 191 ? 2 : 1;
        if (i3 + bytesPerSequence <= end) {
          let secondByte, thirdByte, fourthByte, tempCodePoint;
          switch (bytesPerSequence) {
            case 1:
              if (firstByte < 128) {
                codePoint = firstByte;
              }
              break;
            case 2:
              secondByte = buf[i3 + 1];
              if ((secondByte & 192) === 128) {
                tempCodePoint = (firstByte & 31) << 6 | secondByte & 63;
                if (tempCodePoint > 127) {
                  codePoint = tempCodePoint;
                }
              }
              break;
            case 3:
              secondByte = buf[i3 + 1];
              thirdByte = buf[i3 + 2];
              if ((secondByte & 192) === 128 && (thirdByte & 192) === 128) {
                tempCodePoint = (firstByte & 15) << 12 | (secondByte & 63) << 6 | thirdByte & 63;
                if (tempCodePoint > 2047 && (tempCodePoint < 55296 || tempCodePoint > 57343)) {
                  codePoint = tempCodePoint;
                }
              }
              break;
            case 4:
              secondByte = buf[i3 + 1];
              thirdByte = buf[i3 + 2];
              fourthByte = buf[i3 + 3];
              if ((secondByte & 192) === 128 && (thirdByte & 192) === 128 && (fourthByte & 192) === 128) {
                tempCodePoint = (firstByte & 15) << 18 | (secondByte & 63) << 12 | (thirdByte & 63) << 6 | fourthByte & 63;
                if (tempCodePoint > 65535 && tempCodePoint < 1114112) {
                  codePoint = tempCodePoint;
                }
              }
          }
        }
        if (codePoint === null) {
          codePoint = 65533;
          bytesPerSequence = 1;
        } else if (codePoint > 65535) {
          codePoint -= 65536;
          res.push(codePoint >>> 10 & 1023 | 55296);
          codePoint = 56320 | codePoint & 1023;
        }
        res.push(codePoint);
        i3 += bytesPerSequence;
      }
      return decodeCodePointsArray(res);
    }
    const MAX_ARGUMENTS_LENGTH = 4096;
    function decodeCodePointsArray(codePoints) {
      const len = codePoints.length;
      if (len <= MAX_ARGUMENTS_LENGTH) {
        return String.fromCharCode.apply(String, codePoints);
      }
      let res = "";
      let i3 = 0;
      while (i3 < len) {
        res += String.fromCharCode.apply(
          String,
          codePoints.slice(i3, i3 += MAX_ARGUMENTS_LENGTH)
        );
      }
      return res;
    }
    function asciiSlice(buf, start, end) {
      let ret = "";
      end = Math.min(buf.length, end);
      for (let i3 = start; i3 < end; ++i3) {
        ret += String.fromCharCode(buf[i3] & 127);
      }
      return ret;
    }
    function latin1Slice(buf, start, end) {
      let ret = "";
      end = Math.min(buf.length, end);
      for (let i3 = start; i3 < end; ++i3) {
        ret += String.fromCharCode(buf[i3]);
      }
      return ret;
    }
    function hexSlice(buf, start, end) {
      const len = buf.length;
      if (!start || start < 0) start = 0;
      if (!end || end < 0 || end > len) end = len;
      let out = "";
      for (let i3 = start; i3 < end; ++i3) {
        out += hexSliceLookupTable[buf[i3]];
      }
      return out;
    }
    function utf16leSlice(buf, start, end) {
      const bytes = buf.slice(start, end);
      let res = "";
      for (let i3 = 0; i3 < bytes.length - 1; i3 += 2) {
        res += String.fromCharCode(bytes[i3] + bytes[i3 + 1] * 256);
      }
      return res;
    }
    Buffer2.prototype.slice = function slice(start, end) {
      const len = this.length;
      start = ~~start;
      end = end === void 0 ? len : ~~end;
      if (start < 0) {
        start += len;
        if (start < 0) start = 0;
      } else if (start > len) {
        start = len;
      }
      if (end < 0) {
        end += len;
        if (end < 0) end = 0;
      } else if (end > len) {
        end = len;
      }
      if (end < start) end = start;
      const newBuf = this.subarray(start, end);
      Object.setPrototypeOf(newBuf, Buffer2.prototype);
      return newBuf;
    };
    function checkOffset(offset, ext, length) {
      if (offset % 1 !== 0 || offset < 0) throw new RangeError("offset is not uint");
      if (offset + ext > length) throw new RangeError("Trying to access beyond buffer length");
    }
    Buffer2.prototype.readUintLE = Buffer2.prototype.readUIntLE = function readUIntLE2(offset, byteLength2, noAssert) {
      offset = offset >>> 0;
      byteLength2 = byteLength2 >>> 0;
      if (!noAssert) checkOffset(offset, byteLength2, this.length);
      let val = this[offset];
      let mul = 1;
      let i3 = 0;
      while (++i3 < byteLength2 && (mul *= 256)) {
        val += this[offset + i3] * mul;
      }
      return val;
    };
    Buffer2.prototype.readUintBE = Buffer2.prototype.readUIntBE = function readUIntBE(offset, byteLength2, noAssert) {
      offset = offset >>> 0;
      byteLength2 = byteLength2 >>> 0;
      if (!noAssert) {
        checkOffset(offset, byteLength2, this.length);
      }
      let val = this[offset + --byteLength2];
      let mul = 1;
      while (byteLength2 > 0 && (mul *= 256)) {
        val += this[offset + --byteLength2] * mul;
      }
      return val;
    };
    Buffer2.prototype.readUint8 = Buffer2.prototype.readUInt8 = function readUInt8(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert) checkOffset(offset, 1, this.length);
      return this[offset];
    };
    Buffer2.prototype.readUint16LE = Buffer2.prototype.readUInt16LE = function readUInt16LE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert) checkOffset(offset, 2, this.length);
      return this[offset] | this[offset + 1] << 8;
    };
    Buffer2.prototype.readUint16BE = Buffer2.prototype.readUInt16BE = function readUInt16BE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert) checkOffset(offset, 2, this.length);
      return this[offset] << 8 | this[offset + 1];
    };
    Buffer2.prototype.readUint32LE = Buffer2.prototype.readUInt32LE = function readUInt32LE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert) checkOffset(offset, 4, this.length);
      return (this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16) + this[offset + 3] * 16777216;
    };
    Buffer2.prototype.readUint32BE = Buffer2.prototype.readUInt32BE = function readUInt32BE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert) checkOffset(offset, 4, this.length);
      return this[offset] * 16777216 + (this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3]);
    };
    Buffer2.prototype.readBigUInt64LE = defineBigIntMethod(function readBigUInt64LE(offset) {
      offset = offset >>> 0;
      validateNumber(offset, "offset");
      const first = this[offset];
      const last = this[offset + 7];
      if (first === void 0 || last === void 0) {
        boundsError(offset, this.length - 8);
      }
      const lo = first + this[++offset] * 2 ** 8 + this[++offset] * 2 ** 16 + this[++offset] * 2 ** 24;
      const hi = this[++offset] + this[++offset] * 2 ** 8 + this[++offset] * 2 ** 16 + last * 2 ** 24;
      return BigInt(lo) + (BigInt(hi) << BigInt(32));
    });
    Buffer2.prototype.readBigUInt64BE = defineBigIntMethod(function readBigUInt64BE(offset) {
      offset = offset >>> 0;
      validateNumber(offset, "offset");
      const first = this[offset];
      const last = this[offset + 7];
      if (first === void 0 || last === void 0) {
        boundsError(offset, this.length - 8);
      }
      const hi = first * 2 ** 24 + this[++offset] * 2 ** 16 + this[++offset] * 2 ** 8 + this[++offset];
      const lo = this[++offset] * 2 ** 24 + this[++offset] * 2 ** 16 + this[++offset] * 2 ** 8 + last;
      return (BigInt(hi) << BigInt(32)) + BigInt(lo);
    });
    Buffer2.prototype.readIntLE = function readIntLE2(offset, byteLength2, noAssert) {
      offset = offset >>> 0;
      byteLength2 = byteLength2 >>> 0;
      if (!noAssert) checkOffset(offset, byteLength2, this.length);
      let val = this[offset];
      let mul = 1;
      let i3 = 0;
      while (++i3 < byteLength2 && (mul *= 256)) {
        val += this[offset + i3] * mul;
      }
      mul *= 128;
      if (val >= mul) val -= Math.pow(2, 8 * byteLength2);
      return val;
    };
    Buffer2.prototype.readIntBE = function readIntBE(offset, byteLength2, noAssert) {
      offset = offset >>> 0;
      byteLength2 = byteLength2 >>> 0;
      if (!noAssert) checkOffset(offset, byteLength2, this.length);
      let i3 = byteLength2;
      let mul = 1;
      let val = this[offset + --i3];
      while (i3 > 0 && (mul *= 256)) {
        val += this[offset + --i3] * mul;
      }
      mul *= 128;
      if (val >= mul) val -= Math.pow(2, 8 * byteLength2);
      return val;
    };
    Buffer2.prototype.readInt8 = function readInt8(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert) checkOffset(offset, 1, this.length);
      if (!(this[offset] & 128)) return this[offset];
      return (255 - this[offset] + 1) * -1;
    };
    Buffer2.prototype.readInt16LE = function readInt16LE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert) checkOffset(offset, 2, this.length);
      const val = this[offset] | this[offset + 1] << 8;
      return val & 32768 ? val | 4294901760 : val;
    };
    Buffer2.prototype.readInt16BE = function readInt16BE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert) checkOffset(offset, 2, this.length);
      const val = this[offset + 1] | this[offset] << 8;
      return val & 32768 ? val | 4294901760 : val;
    };
    Buffer2.prototype.readInt32LE = function readInt32LE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert) checkOffset(offset, 4, this.length);
      return this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16 | this[offset + 3] << 24;
    };
    Buffer2.prototype.readInt32BE = function readInt32BE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert) checkOffset(offset, 4, this.length);
      return this[offset] << 24 | this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3];
    };
    Buffer2.prototype.readBigInt64LE = defineBigIntMethod(function readBigInt64LE(offset) {
      offset = offset >>> 0;
      validateNumber(offset, "offset");
      const first = this[offset];
      const last = this[offset + 7];
      if (first === void 0 || last === void 0) {
        boundsError(offset, this.length - 8);
      }
      const val = this[offset + 4] + this[offset + 5] * 2 ** 8 + this[offset + 6] * 2 ** 16 + (last << 24);
      return (BigInt(val) << BigInt(32)) + BigInt(first + this[++offset] * 2 ** 8 + this[++offset] * 2 ** 16 + this[++offset] * 2 ** 24);
    });
    Buffer2.prototype.readBigInt64BE = defineBigIntMethod(function readBigInt64BE(offset) {
      offset = offset >>> 0;
      validateNumber(offset, "offset");
      const first = this[offset];
      const last = this[offset + 7];
      if (first === void 0 || last === void 0) {
        boundsError(offset, this.length - 8);
      }
      const val = (first << 24) + // Overflow
      this[++offset] * 2 ** 16 + this[++offset] * 2 ** 8 + this[++offset];
      return (BigInt(val) << BigInt(32)) + BigInt(this[++offset] * 2 ** 24 + this[++offset] * 2 ** 16 + this[++offset] * 2 ** 8 + last);
    });
    Buffer2.prototype.readFloatLE = function readFloatLE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert) checkOffset(offset, 4, this.length);
      return ieee7542.read(this, offset, true, 23, 4);
    };
    Buffer2.prototype.readFloatBE = function readFloatBE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert) checkOffset(offset, 4, this.length);
      return ieee7542.read(this, offset, false, 23, 4);
    };
    Buffer2.prototype.readDoubleLE = function readDoubleLE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert) checkOffset(offset, 8, this.length);
      return ieee7542.read(this, offset, true, 52, 8);
    };
    Buffer2.prototype.readDoubleBE = function readDoubleBE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert) checkOffset(offset, 8, this.length);
      return ieee7542.read(this, offset, false, 52, 8);
    };
    function checkInt(buf, value2, offset, ext, max, min) {
      if (!Buffer2.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance');
      if (value2 > max || value2 < min) throw new RangeError('"value" argument is out of bounds');
      if (offset + ext > buf.length) throw new RangeError("Index out of range");
    }
    Buffer2.prototype.writeUintLE = Buffer2.prototype.writeUIntLE = function writeUIntLE2(value2, offset, byteLength2, noAssert) {
      value2 = +value2;
      offset = offset >>> 0;
      byteLength2 = byteLength2 >>> 0;
      if (!noAssert) {
        const maxBytes = Math.pow(2, 8 * byteLength2) - 1;
        checkInt(this, value2, offset, byteLength2, maxBytes, 0);
      }
      let mul = 1;
      let i3 = 0;
      this[offset] = value2 & 255;
      while (++i3 < byteLength2 && (mul *= 256)) {
        this[offset + i3] = value2 / mul & 255;
      }
      return offset + byteLength2;
    };
    Buffer2.prototype.writeUintBE = Buffer2.prototype.writeUIntBE = function writeUIntBE(value2, offset, byteLength2, noAssert) {
      value2 = +value2;
      offset = offset >>> 0;
      byteLength2 = byteLength2 >>> 0;
      if (!noAssert) {
        const maxBytes = Math.pow(2, 8 * byteLength2) - 1;
        checkInt(this, value2, offset, byteLength2, maxBytes, 0);
      }
      let i3 = byteLength2 - 1;
      let mul = 1;
      this[offset + i3] = value2 & 255;
      while (--i3 >= 0 && (mul *= 256)) {
        this[offset + i3] = value2 / mul & 255;
      }
      return offset + byteLength2;
    };
    Buffer2.prototype.writeUint8 = Buffer2.prototype.writeUInt8 = function writeUInt8(value2, offset, noAssert) {
      value2 = +value2;
      offset = offset >>> 0;
      if (!noAssert) checkInt(this, value2, offset, 1, 255, 0);
      this[offset] = value2 & 255;
      return offset + 1;
    };
    Buffer2.prototype.writeUint16LE = Buffer2.prototype.writeUInt16LE = function writeUInt16LE(value2, offset, noAssert) {
      value2 = +value2;
      offset = offset >>> 0;
      if (!noAssert) checkInt(this, value2, offset, 2, 65535, 0);
      this[offset] = value2 & 255;
      this[offset + 1] = value2 >>> 8;
      return offset + 2;
    };
    Buffer2.prototype.writeUint16BE = Buffer2.prototype.writeUInt16BE = function writeUInt16BE(value2, offset, noAssert) {
      value2 = +value2;
      offset = offset >>> 0;
      if (!noAssert) checkInt(this, value2, offset, 2, 65535, 0);
      this[offset] = value2 >>> 8;
      this[offset + 1] = value2 & 255;
      return offset + 2;
    };
    Buffer2.prototype.writeUint32LE = Buffer2.prototype.writeUInt32LE = function writeUInt32LE(value2, offset, noAssert) {
      value2 = +value2;
      offset = offset >>> 0;
      if (!noAssert) checkInt(this, value2, offset, 4, 4294967295, 0);
      this[offset + 3] = value2 >>> 24;
      this[offset + 2] = value2 >>> 16;
      this[offset + 1] = value2 >>> 8;
      this[offset] = value2 & 255;
      return offset + 4;
    };
    Buffer2.prototype.writeUint32BE = Buffer2.prototype.writeUInt32BE = function writeUInt32BE(value2, offset, noAssert) {
      value2 = +value2;
      offset = offset >>> 0;
      if (!noAssert) checkInt(this, value2, offset, 4, 4294967295, 0);
      this[offset] = value2 >>> 24;
      this[offset + 1] = value2 >>> 16;
      this[offset + 2] = value2 >>> 8;
      this[offset + 3] = value2 & 255;
      return offset + 4;
    };
    function wrtBigUInt64LE(buf, value2, offset, min, max) {
      checkIntBI(value2, min, max, buf, offset, 7);
      let lo = Number(value2 & BigInt(4294967295));
      buf[offset++] = lo;
      lo = lo >> 8;
      buf[offset++] = lo;
      lo = lo >> 8;
      buf[offset++] = lo;
      lo = lo >> 8;
      buf[offset++] = lo;
      let hi = Number(value2 >> BigInt(32) & BigInt(4294967295));
      buf[offset++] = hi;
      hi = hi >> 8;
      buf[offset++] = hi;
      hi = hi >> 8;
      buf[offset++] = hi;
      hi = hi >> 8;
      buf[offset++] = hi;
      return offset;
    }
    function wrtBigUInt64BE(buf, value2, offset, min, max) {
      checkIntBI(value2, min, max, buf, offset, 7);
      let lo = Number(value2 & BigInt(4294967295));
      buf[offset + 7] = lo;
      lo = lo >> 8;
      buf[offset + 6] = lo;
      lo = lo >> 8;
      buf[offset + 5] = lo;
      lo = lo >> 8;
      buf[offset + 4] = lo;
      let hi = Number(value2 >> BigInt(32) & BigInt(4294967295));
      buf[offset + 3] = hi;
      hi = hi >> 8;
      buf[offset + 2] = hi;
      hi = hi >> 8;
      buf[offset + 1] = hi;
      hi = hi >> 8;
      buf[offset] = hi;
      return offset + 8;
    }
    Buffer2.prototype.writeBigUInt64LE = defineBigIntMethod(function writeBigUInt64LE(value2, offset = 0) {
      return wrtBigUInt64LE(this, value2, offset, BigInt(0), BigInt("0xffffffffffffffff"));
    });
    Buffer2.prototype.writeBigUInt64BE = defineBigIntMethod(function writeBigUInt64BE(value2, offset = 0) {
      return wrtBigUInt64BE(this, value2, offset, BigInt(0), BigInt("0xffffffffffffffff"));
    });
    Buffer2.prototype.writeIntLE = function writeIntLE2(value2, offset, byteLength2, noAssert) {
      value2 = +value2;
      offset = offset >>> 0;
      if (!noAssert) {
        const limit = Math.pow(2, 8 * byteLength2 - 1);
        checkInt(this, value2, offset, byteLength2, limit - 1, -limit);
      }
      let i3 = 0;
      let mul = 1;
      let sub = 0;
      this[offset] = value2 & 255;
      while (++i3 < byteLength2 && (mul *= 256)) {
        if (value2 < 0 && sub === 0 && this[offset + i3 - 1] !== 0) {
          sub = 1;
        }
        this[offset + i3] = (value2 / mul >> 0) - sub & 255;
      }
      return offset + byteLength2;
    };
    Buffer2.prototype.writeIntBE = function writeIntBE(value2, offset, byteLength2, noAssert) {
      value2 = +value2;
      offset = offset >>> 0;
      if (!noAssert) {
        const limit = Math.pow(2, 8 * byteLength2 - 1);
        checkInt(this, value2, offset, byteLength2, limit - 1, -limit);
      }
      let i3 = byteLength2 - 1;
      let mul = 1;
      let sub = 0;
      this[offset + i3] = value2 & 255;
      while (--i3 >= 0 && (mul *= 256)) {
        if (value2 < 0 && sub === 0 && this[offset + i3 + 1] !== 0) {
          sub = 1;
        }
        this[offset + i3] = (value2 / mul >> 0) - sub & 255;
      }
      return offset + byteLength2;
    };
    Buffer2.prototype.writeInt8 = function writeInt8(value2, offset, noAssert) {
      value2 = +value2;
      offset = offset >>> 0;
      if (!noAssert) checkInt(this, value2, offset, 1, 127, -128);
      if (value2 < 0) value2 = 255 + value2 + 1;
      this[offset] = value2 & 255;
      return offset + 1;
    };
    Buffer2.prototype.writeInt16LE = function writeInt16LE(value2, offset, noAssert) {
      value2 = +value2;
      offset = offset >>> 0;
      if (!noAssert) checkInt(this, value2, offset, 2, 32767, -32768);
      this[offset] = value2 & 255;
      this[offset + 1] = value2 >>> 8;
      return offset + 2;
    };
    Buffer2.prototype.writeInt16BE = function writeInt16BE(value2, offset, noAssert) {
      value2 = +value2;
      offset = offset >>> 0;
      if (!noAssert) checkInt(this, value2, offset, 2, 32767, -32768);
      this[offset] = value2 >>> 8;
      this[offset + 1] = value2 & 255;
      return offset + 2;
    };
    Buffer2.prototype.writeInt32LE = function writeInt32LE(value2, offset, noAssert) {
      value2 = +value2;
      offset = offset >>> 0;
      if (!noAssert) checkInt(this, value2, offset, 4, 2147483647, -2147483648);
      this[offset] = value2 & 255;
      this[offset + 1] = value2 >>> 8;
      this[offset + 2] = value2 >>> 16;
      this[offset + 3] = value2 >>> 24;
      return offset + 4;
    };
    Buffer2.prototype.writeInt32BE = function writeInt32BE(value2, offset, noAssert) {
      value2 = +value2;
      offset = offset >>> 0;
      if (!noAssert) checkInt(this, value2, offset, 4, 2147483647, -2147483648);
      if (value2 < 0) value2 = 4294967295 + value2 + 1;
      this[offset] = value2 >>> 24;
      this[offset + 1] = value2 >>> 16;
      this[offset + 2] = value2 >>> 8;
      this[offset + 3] = value2 & 255;
      return offset + 4;
    };
    Buffer2.prototype.writeBigInt64LE = defineBigIntMethod(function writeBigInt64LE(value2, offset = 0) {
      return wrtBigUInt64LE(this, value2, offset, -BigInt("0x8000000000000000"), BigInt("0x7fffffffffffffff"));
    });
    Buffer2.prototype.writeBigInt64BE = defineBigIntMethod(function writeBigInt64BE(value2, offset = 0) {
      return wrtBigUInt64BE(this, value2, offset, -BigInt("0x8000000000000000"), BigInt("0x7fffffffffffffff"));
    });
    function checkIEEE754(buf, value2, offset, ext, max, min) {
      if (offset + ext > buf.length) throw new RangeError("Index out of range");
      if (offset < 0) throw new RangeError("Index out of range");
    }
    function writeFloat(buf, value2, offset, littleEndian, noAssert) {
      value2 = +value2;
      offset = offset >>> 0;
      if (!noAssert) {
        checkIEEE754(buf, value2, offset, 4);
      }
      ieee7542.write(buf, value2, offset, littleEndian, 23, 4);
      return offset + 4;
    }
    Buffer2.prototype.writeFloatLE = function writeFloatLE(value2, offset, noAssert) {
      return writeFloat(this, value2, offset, true, noAssert);
    };
    Buffer2.prototype.writeFloatBE = function writeFloatBE(value2, offset, noAssert) {
      return writeFloat(this, value2, offset, false, noAssert);
    };
    function writeDouble(buf, value2, offset, littleEndian, noAssert) {
      value2 = +value2;
      offset = offset >>> 0;
      if (!noAssert) {
        checkIEEE754(buf, value2, offset, 8);
      }
      ieee7542.write(buf, value2, offset, littleEndian, 52, 8);
      return offset + 8;
    }
    Buffer2.prototype.writeDoubleLE = function writeDoubleLE(value2, offset, noAssert) {
      return writeDouble(this, value2, offset, true, noAssert);
    };
    Buffer2.prototype.writeDoubleBE = function writeDoubleBE(value2, offset, noAssert) {
      return writeDouble(this, value2, offset, false, noAssert);
    };
    Buffer2.prototype.copy = function copy(target, targetStart, start, end) {
      if (!Buffer2.isBuffer(target)) throw new TypeError("argument should be a Buffer");
      if (!start) start = 0;
      if (!end && end !== 0) end = this.length;
      if (targetStart >= target.length) targetStart = target.length;
      if (!targetStart) targetStart = 0;
      if (end > 0 && end < start) end = start;
      if (end === start) return 0;
      if (target.length === 0 || this.length === 0) return 0;
      if (targetStart < 0) {
        throw new RangeError("targetStart out of bounds");
      }
      if (start < 0 || start >= this.length) throw new RangeError("Index out of range");
      if (end < 0) throw new RangeError("sourceEnd out of bounds");
      if (end > this.length) end = this.length;
      if (target.length - targetStart < end - start) {
        end = target.length - targetStart + start;
      }
      const len = end - start;
      if (this === target && typeof Uint8Array.prototype.copyWithin === "function") {
        this.copyWithin(targetStart, start, end);
      } else {
        Uint8Array.prototype.set.call(
          target,
          this.subarray(start, end),
          targetStart
        );
      }
      return len;
    };
    Buffer2.prototype.fill = function fill(val, start, end, encoding) {
      if (typeof val === "string") {
        if (typeof start === "string") {
          encoding = start;
          start = 0;
          end = this.length;
        } else if (typeof end === "string") {
          encoding = end;
          end = this.length;
        }
        if (encoding !== void 0 && typeof encoding !== "string") {
          throw new TypeError("encoding must be a string");
        }
        if (typeof encoding === "string" && !Buffer2.isEncoding(encoding)) {
          throw new TypeError("Unknown encoding: " + encoding);
        }
        if (val.length === 1) {
          const code = val.charCodeAt(0);
          if (encoding === "utf8" && code < 128 || encoding === "latin1") {
            val = code;
          }
        }
      } else if (typeof val === "number") {
        val = val & 255;
      } else if (typeof val === "boolean") {
        val = Number(val);
      }
      if (start < 0 || this.length < start || this.length < end) {
        throw new RangeError("Out of range index");
      }
      if (end <= start) {
        return this;
      }
      start = start >>> 0;
      end = end === void 0 ? this.length : end >>> 0;
      if (!val) val = 0;
      let i3;
      if (typeof val === "number") {
        for (i3 = start; i3 < end; ++i3) {
          this[i3] = val;
        }
      } else {
        const bytes = Buffer2.isBuffer(val) ? val : Buffer2.from(val, encoding);
        const len = bytes.length;
        if (len === 0) {
          throw new TypeError('The value "' + val + '" is invalid for argument "value"');
        }
        for (i3 = 0; i3 < end - start; ++i3) {
          this[i3 + start] = bytes[i3 % len];
        }
      }
      return this;
    };
    const errors = {};
    function E2(sym, getMessage, Base) {
      errors[sym] = class NodeError extends Base {
        constructor() {
          super();
          Object.defineProperty(this, "message", {
            value: getMessage.apply(this, arguments),
            writable: true,
            configurable: true
          });
          this.name = `${this.name} [${sym}]`;
          this.stack;
          delete this.name;
        }
        get code() {
          return sym;
        }
        set code(value2) {
          Object.defineProperty(this, "code", {
            configurable: true,
            enumerable: true,
            value: value2,
            writable: true
          });
        }
        toString() {
          return `${this.name} [${sym}]: ${this.message}`;
        }
      };
    }
    E2(
      "ERR_BUFFER_OUT_OF_BOUNDS",
      function(name) {
        if (name) {
          return `${name} is outside of buffer bounds`;
        }
        return "Attempt to access memory outside buffer bounds";
      },
      RangeError
    );
    E2(
      "ERR_INVALID_ARG_TYPE",
      function(name, actual) {
        return `The "${name}" argument must be of type number. Received type ${typeof actual}`;
      },
      TypeError
    );
    E2(
      "ERR_OUT_OF_RANGE",
      function(str, range, input) {
        let msg = `The value of "${str}" is out of range.`;
        let received = input;
        if (Number.isInteger(input) && Math.abs(input) > 2 ** 32) {
          received = addNumericalSeparator(String(input));
        } else if (typeof input === "bigint") {
          received = String(input);
          if (input > BigInt(2) ** BigInt(32) || input < -(BigInt(2) ** BigInt(32))) {
            received = addNumericalSeparator(received);
          }
          received += "n";
        }
        msg += ` It must be ${range}. Received ${received}`;
        return msg;
      },
      RangeError
    );
    function addNumericalSeparator(val) {
      let res = "";
      let i3 = val.length;
      const start = val[0] === "-" ? 1 : 0;
      for (; i3 >= start + 4; i3 -= 3) {
        res = `_${val.slice(i3 - 3, i3)}${res}`;
      }
      return `${val.slice(0, i3)}${res}`;
    }
    function checkBounds(buf, offset, byteLength2) {
      validateNumber(offset, "offset");
      if (buf[offset] === void 0 || buf[offset + byteLength2] === void 0) {
        boundsError(offset, buf.length - (byteLength2 + 1));
      }
    }
    function checkIntBI(value2, min, max, buf, offset, byteLength2) {
      if (value2 > max || value2 < min) {
        const n2 = typeof min === "bigint" ? "n" : "";
        let range;
        {
          if (min === 0 || min === BigInt(0)) {
            range = `>= 0${n2} and < 2${n2} ** ${(byteLength2 + 1) * 8}${n2}`;
          } else {
            range = `>= -(2${n2} ** ${(byteLength2 + 1) * 8 - 1}${n2}) and < 2 ** ${(byteLength2 + 1) * 8 - 1}${n2}`;
          }
        }
        throw new errors.ERR_OUT_OF_RANGE("value", range, value2);
      }
      checkBounds(buf, offset, byteLength2);
    }
    function validateNumber(value2, name) {
      if (typeof value2 !== "number") {
        throw new errors.ERR_INVALID_ARG_TYPE(name, "number", value2);
      }
    }
    function boundsError(value2, length, type) {
      if (Math.floor(value2) !== value2) {
        validateNumber(value2, type);
        throw new errors.ERR_OUT_OF_RANGE("offset", "an integer", value2);
      }
      if (length < 0) {
        throw new errors.ERR_BUFFER_OUT_OF_BOUNDS();
      }
      throw new errors.ERR_OUT_OF_RANGE(
        "offset",
        `>= ${0} and <= ${length}`,
        value2
      );
    }
    const INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g;
    function base64clean(str) {
      str = str.split("=")[0];
      str = str.trim().replace(INVALID_BASE64_RE, "");
      if (str.length < 2) return "";
      while (str.length % 4 !== 0) {
        str = str + "=";
      }
      return str;
    }
    function utf8ToBytes2(string, units) {
      units = units || Infinity;
      let codePoint;
      const length = string.length;
      let leadSurrogate = null;
      const bytes = [];
      for (let i3 = 0; i3 < length; ++i3) {
        codePoint = string.charCodeAt(i3);
        if (codePoint > 55295 && codePoint < 57344) {
          if (!leadSurrogate) {
            if (codePoint > 56319) {
              if ((units -= 3) > -1) bytes.push(239, 191, 189);
              continue;
            } else if (i3 + 1 === length) {
              if ((units -= 3) > -1) bytes.push(239, 191, 189);
              continue;
            }
            leadSurrogate = codePoint;
            continue;
          }
          if (codePoint < 56320) {
            if ((units -= 3) > -1) bytes.push(239, 191, 189);
            leadSurrogate = codePoint;
            continue;
          }
          codePoint = (leadSurrogate - 55296 << 10 | codePoint - 56320) + 65536;
        } else if (leadSurrogate) {
          if ((units -= 3) > -1) bytes.push(239, 191, 189);
        }
        leadSurrogate = null;
        if (codePoint < 128) {
          if ((units -= 1) < 0) break;
          bytes.push(codePoint);
        } else if (codePoint < 2048) {
          if ((units -= 2) < 0) break;
          bytes.push(
            codePoint >> 6 | 192,
            codePoint & 63 | 128
          );
        } else if (codePoint < 65536) {
          if ((units -= 3) < 0) break;
          bytes.push(
            codePoint >> 12 | 224,
            codePoint >> 6 & 63 | 128,
            codePoint & 63 | 128
          );
        } else if (codePoint < 1114112) {
          if ((units -= 4) < 0) break;
          bytes.push(
            codePoint >> 18 | 240,
            codePoint >> 12 & 63 | 128,
            codePoint >> 6 & 63 | 128,
            codePoint & 63 | 128
          );
        } else {
          throw new Error("Invalid code point");
        }
      }
      return bytes;
    }
    function asciiToBytes(str) {
      const byteArray = [];
      for (let i3 = 0; i3 < str.length; ++i3) {
        byteArray.push(str.charCodeAt(i3) & 255);
      }
      return byteArray;
    }
    function utf16leToBytes(str, units) {
      let c, hi, lo;
      const byteArray = [];
      for (let i3 = 0; i3 < str.length; ++i3) {
        if ((units -= 2) < 0) break;
        c = str.charCodeAt(i3);
        hi = c >> 8;
        lo = c % 256;
        byteArray.push(lo);
        byteArray.push(hi);
      }
      return byteArray;
    }
    function base64ToBytes(str) {
      return base64.toByteArray(base64clean(str));
    }
    function blitBuffer(src2, dst, offset, length) {
      let i3;
      for (i3 = 0; i3 < length; ++i3) {
        if (i3 + offset >= dst.length || i3 >= src2.length) break;
        dst[i3 + offset] = src2[i3];
      }
      return i3;
    }
    function isInstance(obj, type) {
      return obj instanceof type || obj != null && obj.constructor != null && obj.constructor.name != null && obj.constructor.name === type.name;
    }
    function numberIsNaN(obj) {
      return obj !== obj;
    }
    const hexSliceLookupTable = function() {
      const alphabet2 = "0123456789abcdef";
      const table = new Array(256);
      for (let i3 = 0; i3 < 16; ++i3) {
        const i16 = i3 * 16;
        for (let j2 = 0; j2 < 16; ++j2) {
          table[i16 + j2] = alphabet2[i3] + alphabet2[j2];
        }
      }
      return table;
    }();
    function defineBigIntMethod(fn) {
      return typeof BigInt === "undefined" ? BufferBigIntNotDefined : fn;
    }
    function BufferBigIntNotDefined() {
      throw new Error("BigInt not supported");
    }
  })(buffer$1);
  return buffer$1;
}
var bufferExports = requireBuffer$1();
var ReplicaRejectCode;
(function(ReplicaRejectCode2) {
  ReplicaRejectCode2[ReplicaRejectCode2["SysFatal"] = 1] = "SysFatal";
  ReplicaRejectCode2[ReplicaRejectCode2["SysTransient"] = 2] = "SysTransient";
  ReplicaRejectCode2[ReplicaRejectCode2["DestinationInvalid"] = 3] = "DestinationInvalid";
  ReplicaRejectCode2[ReplicaRejectCode2["CanisterReject"] = 4] = "CanisterReject";
  ReplicaRejectCode2[ReplicaRejectCode2["CanisterError"] = 5] = "CanisterError";
})(ReplicaRejectCode || (ReplicaRejectCode = {}));
const scriptRel = "modulepreload";
const assetsURL = function(dep) {
  return "/canister-dashboard/" + dep;
};
const seen = {};
const __vitePreload = function preload(baseModule, deps, importerUrl) {
  let promise = Promise.resolve();
  if (deps && deps.length > 0) {
    let allSettled2 = function(promises) {
      return Promise.all(
        promises.map(
          (p) => Promise.resolve(p).then(
            (value2) => ({ status: "fulfilled", value: value2 }),
            (reason) => ({ status: "rejected", reason })
          )
        )
      );
    };
    document.getElementsByTagName("link");
    const cspNonceMeta = document.querySelector(
      "meta[property=csp-nonce]"
    );
    const cspNonce = (cspNonceMeta == null ? void 0 : cspNonceMeta.nonce) || (cspNonceMeta == null ? void 0 : cspNonceMeta.getAttribute("nonce"));
    promise = allSettled2(
      deps.map((dep) => {
        dep = assetsURL(dep);
        if (dep in seen) return;
        seen[dep] = true;
        const isCss = dep.endsWith(".css");
        const cssSelector = isCss ? '[rel="stylesheet"]' : "";
        if (document.querySelector(`link[href="${dep}"]${cssSelector}`)) {
          return;
        }
        const link = document.createElement("link");
        link.rel = isCss ? "stylesheet" : scriptRel;
        if (!isCss) {
          link.as = "script";
        }
        link.crossOrigin = "";
        link.href = dep;
        if (cspNonce) {
          link.setAttribute("nonce", cspNonce);
        }
        document.head.appendChild(link);
        if (isCss) {
          return new Promise((res, rej) => {
            link.addEventListener("load", res);
            link.addEventListener(
              "error",
              () => rej(new Error(`Unable to preload CSS for ${dep}`))
            );
          });
        }
      })
    );
  }
  function handlePreloadError(err) {
    const e5 = new Event("vite:preloadError", {
      cancelable: true
    });
    e5.payload = err;
    window.dispatchEvent(e5);
    if (!e5.defaultPrevented) {
      throw err;
    }
  }
  return promise.then((res) => {
    for (const item of res || []) {
      if (item.status !== "rejected") continue;
      handlePreloadError(item.reason);
    }
    return baseModule().catch(handlePreloadError);
  });
};
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
  let o2 = 0;
  function decodeChar(char) {
    let val = lookupTable[char.toLowerCase()];
    if (val === void 0) {
      throw new Error(`Invalid character: ${JSON.stringify(char)}`);
    }
    val <<= 3;
    byte |= val >>> skip;
    skip += 5;
    if (skip >= 8) {
      output[o2++] = byte;
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
  return output.slice(0, o2);
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
  const b2 = new Uint8Array(buf);
  let crc = -1;
  for (let i3 = 0; i3 < b2.length; i3++) {
    const byte = b2[i3];
    const t3 = (byte ^ crc) & 255;
    crc = lookUpTable[t3] ^ crc >>> 8;
  }
  return (crc ^ -1) >>> 0;
}
const crypto$1 = typeof globalThis === "object" && "crypto" in globalThis ? globalThis.crypto : void 0;
/*! noble-hashes - MIT License (c) 2022 Paul Miller (paulmillr.com) */
function isBytes(a) {
  return a instanceof Uint8Array || ArrayBuffer.isView(a) && a.constructor.name === "Uint8Array";
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
    const a = arrays[i3];
    abytes(a);
    sum += a.length;
  }
  const res = new Uint8Array(sum);
  for (let i3 = 0, pad = 0; i3 < arrays.length; i3++) {
    const a = arrays[i3];
    res.set(a, pad);
    pad += a.length;
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
function setBigUint64(view, byteOffset, value2, isLE) {
  if (typeof view.setBigUint64 === "function")
    return view.setBigUint64(byteOffset, value2, isLE);
  const _32n2 = BigInt(32);
  const _u32_max = BigInt(4294967295);
  const wh = Number(value2 >> _32n2 & _u32_max);
  const wl = Number(value2 & _u32_max);
  const h3 = isLE ? 4 : 0;
  const l = isLE ? 0 : 4;
  view.setUint32(byteOffset + h3, wh, isLE);
  view.setUint32(byteOffset + l, wl, isLE);
}
function Chi(a, b2, c) {
  return a & b2 ^ ~a & c;
}
function Maj(a, b2, c) {
  return a & b2 ^ a & c ^ b2 & c;
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
    const { view, buffer: buffer2, blockLen } = this;
    const len = data.length;
    for (let pos = 0; pos < len; ) {
      const take = Math.min(blockLen - this.pos, len - pos);
      if (take === blockLen) {
        const dataView = createView(data);
        for (; blockLen <= len - pos; pos += blockLen)
          this.process(dataView, pos);
        continue;
      }
      buffer2.set(data.subarray(pos, pos + take), this.pos);
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
    const { buffer: buffer2, view, blockLen, isLE } = this;
    let { pos } = this;
    buffer2[pos++] = 128;
    clean(this.buffer.subarray(pos));
    if (this.padOffset > blockLen - pos) {
      this.process(view, 0);
      pos = 0;
    }
    for (let i3 = pos; i3 < blockLen; i3++)
      buffer2[i3] = 0;
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
    const { buffer: buffer2, outputLen } = this;
    this.digestInto(buffer2);
    const res = buffer2.slice(0, outputLen);
    this.destroy();
    return res;
  }
  _cloneInto(to) {
    to || (to = new this.constructor());
    to.set(...this.get());
    const { blockLen, buffer: buffer2, length, finished, destroyed, pos } = this;
    to.destroyed = destroyed;
    to.finished = finished;
    to.length = length;
    to.pos = pos;
    if (length % blockLen)
      to.buffer.set(buffer2);
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
    const { h: h3, l } = fromBig(lst[i3], le);
    [Ah[i3], Al[i3]] = [h3, l];
  }
  return [Ah, Al];
}
const shrSH = (h3, _l, s2) => h3 >>> s2;
const shrSL = (h3, l, s2) => h3 << 32 - s2 | l >>> s2;
const rotrSH = (h3, l, s2) => h3 >>> s2 | l << 32 - s2;
const rotrSL = (h3, l, s2) => h3 << 32 - s2 | l >>> s2;
const rotrBH = (h3, l, s2) => h3 << 64 - s2 | l >>> s2 - 32;
const rotrBL = (h3, l, s2) => h3 >>> s2 - 32 | l << 64 - s2;
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
    const { A: A3, B: B2, C: C2, D: D2, E: E2, F: F2, G: G2, H: H2 } = this;
    return [A3, B2, C2, D2, E2, F2, G2, H2];
  }
  // prettier-ignore
  set(A3, B2, C2, D2, E2, F2, G2, H2) {
    this.A = A3 | 0;
    this.B = B2 | 0;
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
    let { A: A3, B: B2, C: C2, D: D2, E: E2, F: F2, G: G2, H: H2 } = this;
    for (let i3 = 0; i3 < 64; i3++) {
      const sigma1 = rotr(E2, 6) ^ rotr(E2, 11) ^ rotr(E2, 25);
      const T1 = H2 + sigma1 + Chi(E2, F2, G2) + SHA256_K[i3] + SHA256_W[i3] | 0;
      const sigma0 = rotr(A3, 2) ^ rotr(A3, 13) ^ rotr(A3, 22);
      const T2 = sigma0 + Maj(A3, B2, C2) | 0;
      H2 = G2;
      G2 = F2;
      F2 = E2;
      E2 = D2 + T1 | 0;
      D2 = C2;
      C2 = B2;
      B2 = A3;
      A3 = T1 + T2 | 0;
    }
    A3 = A3 + this.A | 0;
    B2 = B2 + this.B | 0;
    C2 = C2 + this.C | 0;
    D2 = D2 + this.D | 0;
    E2 = E2 + this.E | 0;
    F2 = F2 + this.F | 0;
    G2 = G2 + this.G | 0;
    H2 = H2 + this.H | 0;
    this.set(A3, B2, C2, D2, E2, F2, G2, H2);
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
const sha256$1 = /* @__PURE__ */ createHasher$1(() => new SHA256());
const sha224$2 = /* @__PURE__ */ createHasher$1(() => new SHA224());
const sha512 = /* @__PURE__ */ createHasher$1(() => new SHA512());
const sha256 = sha256$1;
const sha224$1 = sha224$2;
function sha224(data) {
  return sha224$1.create().update(new Uint8Array(data)).digest();
}
const JSON_KEY_PRINCIPAL = "__principal__";
const SELF_AUTHENTICATING_SUFFIX = 2;
const ANONYMOUS_SUFFIX = 4;
const MANAGEMENT_CANISTER_PRINCIPAL_TEXT_STR = "aaaaa-aa";
const fromHexString = (hexString) => {
  var _a2;
  return new Uint8Array(((_a2 = hexString.match(/.{1,2}/g)) !== null && _a2 !== void 0 ? _a2 : []).map((byte) => parseInt(byte, 16)));
};
const toHexString = (bytes) => bytes.reduce((str, byte) => str + byte.toString(16).padStart(2, "0"), "");
let Principal$1 = class Principal {
  constructor(_arr) {
    this._arr = _arr;
    this._isPrincipal = true;
  }
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
    } else if (typeof other === "object" && other !== null && other._isPrincipal === true) {
      return new Principal(other._arr);
    }
    throw new Error(`Impossible to convert ${JSON.stringify(other)} to Principal.`);
  }
  static fromHex(hex) {
    return new this(fromHexString(hex));
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
  isAnonymous() {
    return this._arr.byteLength === 1 && this._arr[0] === ANONYMOUS_SUFFIX;
  }
  toUint8Array() {
    return this._arr;
  }
  toHex() {
    return toHexString(this._arr).toUpperCase();
  }
  toText() {
    const checksumArrayBuf = new ArrayBuffer(4);
    const view = new DataView(checksumArrayBuf);
    view.setUint32(0, getCrc32(this._arr));
    const checksum = new Uint8Array(checksumArrayBuf);
    const bytes = Uint8Array.from(this._arr);
    const array = new Uint8Array([...checksum, ...bytes]);
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
function concat$1(...buffers) {
  const result = new Uint8Array(buffers.reduce((acc, curr) => acc + curr.byteLength, 0));
  let index2 = 0;
  for (const b2 of buffers) {
    result.set(new Uint8Array(b2), index2);
    index2 += b2.byteLength;
  }
  return result.buffer;
}
function toHex(buffer2) {
  return [...new Uint8Array(buffer2)].map((x2) => x2.toString(16).padStart(2, "0")).join("");
}
const hexRe = new RegExp(/^[0-9a-fA-F]+$/);
function fromHex(hex) {
  if (!hexRe.test(hex)) {
    throw new Error("Invalid hexadecimal string.");
  }
  const buffer2 = [...hex].reduce((acc, curr, i3) => {
    acc[i3 / 2 | 0] = (acc[i3 / 2 | 0] || "") + curr;
    return acc;
  }, []).map((x2) => Number.parseInt(x2, 16));
  return new Uint8Array(buffer2).buffer;
}
function compare(b1, b2) {
  if (b1.byteLength !== b2.byteLength) {
    return b1.byteLength - b2.byteLength;
  }
  const u1 = new Uint8Array(b1);
  const u2 = new Uint8Array(b2);
  for (let i3 = 0; i3 < u1.length; i3++) {
    if (u1[i3] !== u2[i3]) {
      return u1[i3] - u2[i3];
    }
  }
  return 0;
}
function bufEquals(b1, b2) {
  return compare(b1, b2) === 0;
}
function uint8ToBuf$1(arr) {
  return new DataView(arr.buffer, arr.byteOffset, arr.byteLength).buffer;
}
function bufFromBufLike$1(bufLike) {
  if (bufLike instanceof Uint8Array) {
    return uint8ToBuf$1(bufLike);
  }
  if (bufLike instanceof ArrayBuffer) {
    return bufLike;
  }
  if (Array.isArray(bufLike)) {
    return uint8ToBuf$1(new Uint8Array(bufLike));
  }
  if ("buffer" in bufLike) {
    return bufFromBufLike$1(bufLike.buffer);
  }
  return uint8ToBuf$1(new Uint8Array(bufLike));
}
class AgentError extends Error {
  constructor(message) {
    super(message);
    this.message = message;
    this.name = "AgentError";
    this.__proto__ = AgentError.prototype;
    Object.setPrototypeOf(this, AgentError.prototype);
  }
}
function concat(...buffers) {
  const result = new Uint8Array(buffers.reduce((acc, curr) => acc + curr.byteLength, 0));
  let index2 = 0;
  for (const b2 of buffers) {
    result.set(new Uint8Array(b2), index2);
    index2 += b2.byteLength;
  }
  return result;
}
class PipeArrayBuffer {
  /**
   * Creates a new instance of a pipe
   * @param buffer an optional buffer to start with
   * @param length an optional amount of bytes to use for the length.
   */
  constructor(buffer2, length = (buffer2 === null || buffer2 === void 0 ? void 0 : buffer2.byteLength) || 0) {
    this._buffer = bufFromBufLike(buffer2 || new ArrayBuffer(0));
    this._view = new Uint8Array(this._buffer, 0, length);
  }
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
    this._view = checkPoint;
  }
  get buffer() {
    return bufFromBufLike(this._view.slice());
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
    return result.slice().buffer;
  }
  readUint8() {
    const result = this._view[0];
    this._view = this._view.subarray(1);
    return result;
  }
  /**
   * Write a buffer to the end of the pipe.
   * @param buf The bytes to write.
   */
  write(buf) {
    const b2 = new Uint8Array(buf);
    const offset = this._view.byteLength;
    if (this._view.byteOffset + this._view.byteLength + b2.byteLength >= this._buffer.byteLength) {
      this.alloc(b2.byteLength);
    } else {
      this._view = new Uint8Array(this._buffer, this._view.byteOffset, this._view.byteLength + b2.byteLength);
    }
    this._view.set(b2, offset);
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
    const b2 = new ArrayBuffer((this._buffer.byteLength + amount) * 1.2 | 0);
    const v3 = new Uint8Array(b2, 0, this._view.byteLength + amount);
    v3.set(this._view);
    this._buffer = b2;
    this._view = v3;
  }
}
function uint8ToBuf(arr) {
  return new DataView(arr.buffer, arr.byteOffset, arr.byteLength).buffer;
}
function bufFromBufLike(bufLike) {
  if (bufLike instanceof Uint8Array) {
    return uint8ToBuf(bufLike);
  }
  if (bufLike instanceof ArrayBuffer) {
    return bufLike;
  }
  if (Array.isArray(bufLike)) {
    return uint8ToBuf(new Uint8Array(bufLike));
  }
  if ("buffer" in bufLike) {
    return bufFromBufLike(bufLike.buffer);
  }
  return uint8ToBuf(new Uint8Array(bufLike));
}
function idlHash(s2) {
  const utf8encoder = new TextEncoder();
  const array = utf8encoder.encode(s2);
  let h3 = 0;
  for (const c of array) {
    h3 = (h3 * 223 + c) % 2 ** 32;
  }
  return h3;
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
function lebEncode(value2) {
  if (typeof value2 === "number") {
    value2 = BigInt(value2);
  }
  if (value2 < BigInt(0)) {
    throw new Error("Cannot leb encode negative values.");
  }
  const byteLength = (value2 === BigInt(0) ? 0 : Math.ceil(Math.log2(Number(value2)))) + 1;
  const pipe = new PipeArrayBuffer(new ArrayBuffer(byteLength), 0);
  while (true) {
    const i3 = Number(value2 & BigInt(127));
    value2 /= BigInt(128);
    if (value2 === BigInt(0)) {
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
  let value2 = BigInt(0);
  let byte;
  do {
    byte = safeReadUint8(pipe);
    value2 += BigInt(byte & 127).valueOf() * weight;
    weight *= BigInt(128);
  } while (byte >= 128);
  return value2;
}
function slebEncode(value2) {
  if (typeof value2 === "number") {
    value2 = BigInt(value2);
  }
  const isNeg = value2 < BigInt(0);
  if (isNeg) {
    value2 = -value2 - BigInt(1);
  }
  const byteLength = (value2 === BigInt(0) ? 0 : Math.ceil(Math.log2(Number(value2)))) + 1;
  const pipe = new PipeArrayBuffer(new ArrayBuffer(byteLength), 0);
  while (true) {
    const i3 = getLowerBytes(value2);
    value2 /= BigInt(128);
    if (isNeg && value2 === BigInt(0) && (i3 & 64) !== 0 || !isNeg && value2 === BigInt(0) && (i3 & 64) === 0) {
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
  let value2 = BigInt(0);
  for (let i3 = bytes.byteLength - 1; i3 >= 0; i3--) {
    value2 = value2 * BigInt(128) + BigInt(128 - (bytes[i3] & 127) - 1);
  }
  return -value2 - BigInt(1);
}
function writeUIntLE(value2, byteLength) {
  if (BigInt(value2) < BigInt(0)) {
    throw new Error("Cannot write negative values.");
  }
  return writeIntLE(value2, byteLength);
}
function writeIntLE(value2, byteLength) {
  value2 = BigInt(value2);
  const pipe = new PipeArrayBuffer(new ArrayBuffer(Math.min(1, byteLength)), 0);
  let i3 = 0;
  let mul = BigInt(256);
  let sub = BigInt(0);
  let byte = Number(value2 % mul);
  pipe.write(new Uint8Array([byte]));
  while (++i3 < byteLength) {
    if (value2 < 0 && sub === BigInt(0) && byte !== 0) {
      sub = BigInt(1);
    }
    byte = Number((value2 / mul - sub) % BigInt(256));
    pipe.write(new Uint8Array([byte]));
    mul *= BigInt(256);
  }
  return pipe.buffer;
}
function readUIntLE(pipe, byteLength) {
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
  let val = readUIntLE(pipe, byteLength);
  const mul = BigInt(2) ** (BigInt(8) * BigInt(byteLength - 1) + BigInt(7));
  if (val >= mul) {
    val -= mul * BigInt(2);
  }
  return val;
}
function iexp2(n2) {
  const nBig = BigInt(n2);
  if (n2 < 0) {
    throw new RangeError("Input must be non-negative");
  }
  return BigInt(1) << nBig;
}
const magicNumber = "DIDL";
const toReadableString_max = 400;
function zipWith(xs, ys, f2) {
  return xs.map((x2, i3) => f2(x2, ys[i3]));
}
class TypeTable {
  constructor() {
    this._typs = [];
    this._idx = /* @__PURE__ */ new Map();
  }
  has(obj) {
    return this._idx.has(obj.name);
  }
  add(type, buf) {
    const idx = this._typs.length;
    this._idx.set(type.name, idx);
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
    this._typs.splice(knotIdx, 1);
    this._idx.delete(knot);
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
  visitType(t3, data) {
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
  visitVec(t3, ty, data) {
    return this.visitConstruct(t3, data);
  }
  visitOpt(t3, ty, data) {
    return this.visitConstruct(t3, data);
  }
  visitRecord(t3, fields, data) {
    return this.visitConstruct(t3, data);
  }
  visitTuple(t3, components, data) {
    const fields = components.map((ty, i3) => [`_${i3}_`, ty]);
    return this.visitRecord(t3, fields, data);
  }
  visitVariant(t3, fields, data) {
    return this.visitConstruct(t3, data);
  }
  visitRec(t3, ty, data) {
    return this.visitConstruct(ty, data);
  }
  visitFunc(t3, data) {
    return this.visitConstruct(t3, data);
  }
  visitService(t3, data) {
    return this.visitConstruct(t3, data);
  }
}
class Type {
  /* Display type name */
  display() {
    return this.name;
  }
  valueToString(x2) {
    return toReadableString(x2);
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _buildTypeTableImpl(typeTable) {
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
  accept(v3, d2) {
    return v3.visitEmpty(this, d2);
  }
  covariant(x2) {
    throw new Error(`Invalid ${this.display()} argument: ${toReadableString(x2)}`);
  }
  encodeValue() {
    throw new Error("Empty cannot appear as a function argument");
  }
  valueToString() {
    throw new Error("Empty cannot appear as a value");
  }
  encodeType() {
    return slebEncode(
      -17
      /* IDLTypeIds.Empty */
    );
  }
  decodeValue() {
    throw new Error("Empty cannot appear as an output");
  }
  get name() {
    return "empty";
  }
}
class UnknownClass extends Type {
  checkType(t3) {
    throw new Error("Method not implemented for unknown.");
  }
  accept(v3, d2) {
    throw v3.visitType(this, d2);
  }
  covariant(x2) {
    throw new Error(`Invalid ${this.display()} argument: ${toReadableString(x2)}`);
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
  accept(v3, d2) {
    return v3.visitBool(this, d2);
  }
  covariant(x2) {
    if (typeof x2 === "boolean")
      return true;
    throw new Error(`Invalid ${this.display()} argument: ${toReadableString(x2)}`);
  }
  encodeValue(x2) {
    return new Uint8Array([x2 ? 1 : 0]);
  }
  encodeType() {
    return slebEncode(
      -2
      /* IDLTypeIds.Bool */
    );
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
  accept(v3, d2) {
    return v3.visitNull(this, d2);
  }
  covariant(x2) {
    if (x2 === null)
      return true;
    throw new Error(`Invalid ${this.display()} argument: ${toReadableString(x2)}`);
  }
  encodeValue() {
    return new ArrayBuffer(0);
  }
  encodeType() {
    return slebEncode(
      -1
      /* IDLTypeIds.Null */
    );
  }
  decodeValue(b2, t3) {
    this.checkType(t3);
    return null;
  }
  get name() {
    return "null";
  }
}
class ReservedClass extends PrimitiveType {
  accept(v3, d2) {
    return v3.visitReserved(this, d2);
  }
  covariant(x2) {
    return true;
  }
  encodeValue() {
    return new ArrayBuffer(0);
  }
  encodeType() {
    return slebEncode(
      -16
      /* IDLTypeIds.Reserved */
    );
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
  accept(v3, d2) {
    return v3.visitText(this, d2);
  }
  covariant(x2) {
    if (typeof x2 === "string")
      return true;
    throw new Error(`Invalid ${this.display()} argument: ${toReadableString(x2)}`);
  }
  encodeValue(x2) {
    const buf = new TextEncoder().encode(x2);
    const len = lebEncode(buf.byteLength);
    return concat(len, buf);
  }
  encodeType() {
    return slebEncode(
      -15
      /* IDLTypeIds.Text */
    );
  }
  decodeValue(b2, t3) {
    this.checkType(t3);
    const len = lebDecode(b2);
    const buf = safeRead(b2, Number(len));
    const decoder2 = new TextDecoder("utf8", { fatal: true });
    return decoder2.decode(buf);
  }
  get name() {
    return "text";
  }
  valueToString(x2) {
    return '"' + x2 + '"';
  }
}
class IntClass extends PrimitiveType {
  accept(v3, d2) {
    return v3.visitInt(this, d2);
  }
  covariant(x2) {
    if (typeof x2 === "bigint" || Number.isInteger(x2))
      return true;
    throw new Error(`Invalid ${this.display()} argument: ${toReadableString(x2)}`);
  }
  encodeValue(x2) {
    return slebEncode(x2);
  }
  encodeType() {
    return slebEncode(
      -4
      /* IDLTypeIds.Int */
    );
  }
  decodeValue(b2, t3) {
    this.checkType(t3);
    return slebDecode(b2);
  }
  get name() {
    return "int";
  }
  valueToString(x2) {
    return x2.toString();
  }
}
class NatClass extends PrimitiveType {
  accept(v3, d2) {
    return v3.visitNat(this, d2);
  }
  covariant(x2) {
    if (typeof x2 === "bigint" && x2 >= BigInt(0) || Number.isInteger(x2) && x2 >= 0)
      return true;
    throw new Error(`Invalid ${this.display()} argument: ${toReadableString(x2)}`);
  }
  encodeValue(x2) {
    return lebEncode(x2);
  }
  encodeType() {
    return slebEncode(
      -3
      /* IDLTypeIds.Nat */
    );
  }
  decodeValue(b2, t3) {
    this.checkType(t3);
    return lebDecode(b2);
  }
  get name() {
    return "nat";
  }
  valueToString(x2) {
    return x2.toString();
  }
}
class FloatClass extends PrimitiveType {
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
  covariant(x2) {
    if (typeof x2 === "number" || x2 instanceof Number)
      return true;
    throw new Error(`Invalid ${this.display()} argument: ${toReadableString(x2)}`);
  }
  encodeValue(x2) {
    const buf = new ArrayBuffer(this._bits / 8);
    const view = new DataView(buf);
    if (this._bits === 32) {
      view.setFloat32(0, x2, true);
    } else {
      view.setFloat64(0, x2, true);
    }
    return buf;
  }
  encodeType() {
    const opcode = this._bits === 32 ? -13 : -14;
    return slebEncode(opcode);
  }
  decodeValue(b2, t3) {
    this.checkType(t3);
    const bytes = safeRead(b2, this._bits / 8);
    const view = new DataView(bytes);
    if (this._bits === 32) {
      return view.getFloat32(0, true);
    } else {
      return view.getFloat64(0, true);
    }
  }
  get name() {
    return "float" + this._bits;
  }
  valueToString(x2) {
    return x2.toString();
  }
}
class FixedIntClass extends PrimitiveType {
  constructor(_bits) {
    super();
    this._bits = _bits;
  }
  accept(v3, d2) {
    return v3.visitFixedInt(this, d2);
  }
  covariant(x2) {
    const min = iexp2(this._bits - 1) * BigInt(-1);
    const max = iexp2(this._bits - 1) - BigInt(1);
    let ok = false;
    if (typeof x2 === "bigint") {
      ok = x2 >= min && x2 <= max;
    } else if (Number.isInteger(x2)) {
      const v3 = BigInt(x2);
      ok = v3 >= min && v3 <= max;
    } else {
      ok = false;
    }
    if (ok)
      return true;
    throw new Error(`Invalid ${this.display()} argument: ${toReadableString(x2)}`);
  }
  encodeValue(x2) {
    return writeIntLE(x2, this._bits / 8);
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
  valueToString(x2) {
    return x2.toString();
  }
}
class FixedNatClass extends PrimitiveType {
  constructor(_bits) {
    super();
    this._bits = _bits;
  }
  accept(v3, d2) {
    return v3.visitFixedNat(this, d2);
  }
  covariant(x2) {
    const max = iexp2(this._bits);
    let ok = false;
    if (typeof x2 === "bigint" && x2 >= BigInt(0)) {
      ok = x2 < max;
    } else if (Number.isInteger(x2) && x2 >= 0) {
      const v3 = BigInt(x2);
      ok = v3 < max;
    } else {
      ok = false;
    }
    if (ok)
      return true;
    throw new Error(`Invalid ${this.display()} argument: ${toReadableString(x2)}`);
  }
  encodeValue(x2) {
    return writeUIntLE(x2, this._bits / 8);
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
  valueToString(x2) {
    return x2.toString();
  }
}
class VecClass extends ConstructType {
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
  covariant(x2) {
    const bits = this._type instanceof FixedNatClass ? this._type._bits : this._type instanceof FixedIntClass ? this._type._bits : 0;
    if (ArrayBuffer.isView(x2) && bits == x2.BYTES_PER_ELEMENT * 8 || Array.isArray(x2) && x2.every((v3, idx) => {
      try {
        return this._type.covariant(v3);
      } catch (e5) {
        throw new Error(`Invalid ${this.display()} argument: 

index ${idx} -> ${e5.message}`);
      }
    }))
      return true;
    throw new Error(`Invalid ${this.display()} argument: ${toReadableString(x2)}`);
  }
  encodeValue(x2) {
    const len = lebEncode(x2.length);
    if (this._blobOptimization) {
      return concat(len, new Uint8Array(x2));
    }
    if (ArrayBuffer.isView(x2)) {
      return concat(len, new Uint8Array(x2.buffer));
    }
    const buf = new PipeArrayBuffer(new ArrayBuffer(len.byteLength + x2.length), 0);
    buf.write(len);
    for (const d2 of x2) {
      const encoded = this._type.encodeValue(d2);
      buf.write(new Uint8Array(encoded));
    }
    return buf.buffer;
  }
  _buildTypeTableImpl(typeTable) {
    this._type.buildTypeTable(typeTable);
    const opCode = slebEncode(
      -19
      /* IDLTypeIds.Vector */
    );
    const buffer2 = this._type.encodeType(typeTable);
    typeTable.add(this, concat(opCode, buffer2));
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
        return new Uint16Array(b2.read(len * 2));
      }
      if (this._type._bits == 32) {
        return new Uint32Array(b2.read(len * 4));
      }
      if (this._type._bits == 64) {
        return new BigUint64Array(b2.read(len * 8));
      }
    }
    if (this._type instanceof FixedIntClass) {
      if (this._type._bits == 8) {
        return new Int8Array(b2.read(len));
      }
      if (this._type._bits == 16) {
        return new Int16Array(b2.read(len * 2));
      }
      if (this._type._bits == 32) {
        return new Int32Array(b2.read(len * 4));
      }
      if (this._type._bits == 64) {
        return new BigInt64Array(b2.read(len * 8));
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
  valueToString(x2) {
    const elements = x2.map((e5) => this._type.valueToString(e5));
    return "vec {" + elements.join("; ") + "}";
  }
}
class OptClass extends ConstructType {
  constructor(_type) {
    super();
    this._type = _type;
  }
  accept(v3, d2) {
    return v3.visitOpt(this, this._type, d2);
  }
  covariant(x2) {
    try {
      if (Array.isArray(x2) && (x2.length === 0 || x2.length === 1 && this._type.covariant(x2[0])))
        return true;
    } catch (e5) {
      throw new Error(`Invalid ${this.display()} argument: ${toReadableString(x2)} 

-> ${e5.message}`);
    }
    throw new Error(`Invalid ${this.display()} argument: ${toReadableString(x2)}`);
  }
  encodeValue(x2) {
    if (x2.length === 0) {
      return new Uint8Array([0]);
    } else {
      return concat(new Uint8Array([1]), this._type.encodeValue(x2[0]));
    }
  }
  _buildTypeTableImpl(typeTable) {
    this._type.buildTypeTable(typeTable);
    const opCode = slebEncode(
      -18
      /* IDLTypeIds.Opt */
    );
    const buffer2 = this._type.encodeType(typeTable);
    typeTable.add(this, concat(opCode, buffer2));
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
    } else if (this._type instanceof NullClass || this._type instanceof OptClass || this._type instanceof ReservedClass) {
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
  valueToString(x2) {
    if (x2.length === 0) {
      return "null";
    } else {
      return `opt ${this._type.valueToString(x2[0])}`;
    }
  }
}
class RecordClass extends ConstructType {
  constructor(fields = {}) {
    super();
    this._fields = Object.entries(fields).sort((a, b2) => idlLabelToId(a[0]) - idlLabelToId(b2[0]));
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
  covariant(x2) {
    if (typeof x2 === "object" && this._fields.every(([k2, t3]) => {
      if (!x2.hasOwnProperty(k2)) {
        throw new Error(`Record is missing key "${k2}".`);
      }
      try {
        return t3.covariant(x2[k2]);
      } catch (e5) {
        throw new Error(`Invalid ${this.display()} argument: 

field ${k2} -> ${e5.message}`);
      }
    }))
      return true;
    throw new Error(`Invalid ${this.display()} argument: ${toReadableString(x2)}`);
  }
  encodeValue(x2) {
    const values = this._fields.map(([key]) => x2[key]);
    const bufs = zipWith(this._fields, values, ([, c], d2) => c.encodeValue(d2));
    return concat(...bufs);
  }
  _buildTypeTableImpl(T2) {
    this._fields.forEach(([_2, value2]) => value2.buildTypeTable(T2));
    const opCode = slebEncode(
      -20
      /* IDLTypeIds.Record */
    );
    const len = lebEncode(this._fields.length);
    const fields = this._fields.map(([key, value2]) => concat(lebEncode(idlLabelToId(key)), value2.encodeType(T2)));
    T2.add(this, concat(opCode, len, concat(...fields)));
  }
  decodeValue(b2, t3) {
    const record = this.checkType(t3);
    if (!(record instanceof RecordClass)) {
      throw new Error("Not a record type");
    }
    const x2 = {};
    let expectedRecordIdx = 0;
    let actualRecordIdx = 0;
    while (actualRecordIdx < record._fields.length) {
      const [hash2, type] = record._fields[actualRecordIdx];
      if (expectedRecordIdx >= this._fields.length) {
        type.decodeValue(b2, type);
        actualRecordIdx++;
        continue;
      }
      const [expectKey, expectType] = this._fields[expectedRecordIdx];
      const expectedId = idlLabelToId(this._fields[expectedRecordIdx][0]);
      const actualId = idlLabelToId(hash2);
      if (expectedId === actualId) {
        x2[expectKey] = expectType.decodeValue(b2, type);
        expectedRecordIdx++;
        actualRecordIdx++;
      } else if (actualId > expectedId) {
        if (expectType instanceof OptClass || expectType instanceof ReservedClass) {
          x2[expectKey] = [];
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
        x2[expectKey] = [];
      } else {
        throw new Error("Cannot find required field " + expectKey);
      }
    }
    return x2;
  }
  get name() {
    const fields = this._fields.map(([key, value2]) => key + ":" + value2.name);
    return `record {${fields.join("; ")}}`;
  }
  display() {
    const fields = this._fields.map(([key, value2]) => key + ":" + value2.display());
    return `record {${fields.join("; ")}}`;
  }
  valueToString(x2) {
    const values = this._fields.map(([key]) => x2[key]);
    const fields = zipWith(this._fields, values, ([k2, c], d2) => k2 + "=" + c.valueToString(d2));
    return `record {${fields.join("; ")}}`;
  }
}
class TupleClass extends RecordClass {
  constructor(_components) {
    const x2 = {};
    _components.forEach((e5, i3) => x2["_" + i3 + "_"] = e5);
    super(x2);
    this._components = _components;
  }
  accept(v3, d2) {
    return v3.visitTuple(this, this._components, d2);
  }
  covariant(x2) {
    if (Array.isArray(x2) && x2.length >= this._fields.length && this._components.every((t3, i3) => {
      try {
        return t3.covariant(x2[i3]);
      } catch (e5) {
        throw new Error(`Invalid ${this.display()} argument: 

index ${i3} -> ${e5.message}`);
      }
    }))
      return true;
    throw new Error(`Invalid ${this.display()} argument: ${toReadableString(x2)}`);
  }
  encodeValue(x2) {
    const bufs = zipWith(this._components, x2, (c, d2) => c.encodeValue(d2));
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
    const fields = this._components.map((value2) => value2.display());
    return `record {${fields.join("; ")}}`;
  }
  valueToString(values) {
    const fields = zipWith(this._components, values, (c, d2) => c.valueToString(d2));
    return `record {${fields.join("; ")}}`;
  }
}
class VariantClass extends ConstructType {
  constructor(fields = {}) {
    super();
    this._fields = Object.entries(fields).sort((a, b2) => idlLabelToId(a[0]) - idlLabelToId(b2[0]));
  }
  accept(v3, d2) {
    return v3.visitVariant(this, this._fields, d2);
  }
  covariant(x2) {
    if (typeof x2 === "object" && Object.entries(x2).length === 1 && this._fields.every(([k2, v3]) => {
      try {
        return !x2.hasOwnProperty(k2) || v3.covariant(x2[k2]);
      } catch (e5) {
        throw new Error(`Invalid ${this.display()} argument: 

variant ${k2} -> ${e5.message}`);
      }
    }))
      return true;
    throw new Error(`Invalid ${this.display()} argument: ${toReadableString(x2)}`);
  }
  encodeValue(x2) {
    for (let i3 = 0; i3 < this._fields.length; i3++) {
      const [name, type] = this._fields[i3];
      if (x2.hasOwnProperty(name)) {
        const idx = lebEncode(i3);
        const buf = type.encodeValue(x2[name]);
        return concat(idx, buf);
      }
    }
    throw Error("Variant has no data: " + x2);
  }
  _buildTypeTableImpl(typeTable) {
    this._fields.forEach(([, type]) => {
      type.buildTypeTable(typeTable);
    });
    const opCode = slebEncode(
      -21
      /* IDLTypeIds.Variant */
    );
    const len = lebEncode(this._fields.length);
    const fields = this._fields.map(([key, value2]) => concat(lebEncode(idlLabelToId(key)), value2.encodeType(typeTable)));
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
        const value2 = expectType.decodeValue(b2, wireType);
        return { [key]: value2 };
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
  valueToString(x2) {
    for (const [name, type] of this._fields) {
      if (x2.hasOwnProperty(name)) {
        const value2 = type.valueToString(x2[name]);
        if (value2 === "null") {
          return `variant {${name}}`;
        } else {
          return `variant {${name}=${value2}}`;
        }
      }
    }
    throw new Error("Variant has no data: " + x2);
  }
}
class RecClass extends ConstructType {
  constructor() {
    super(...arguments);
    this._id = RecClass._counter++;
    this._type = void 0;
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
  covariant(x2) {
    if (this._type ? this._type.covariant(x2) : false)
      return true;
    throw new Error(`Invalid ${this.display()} argument: ${toReadableString(x2)}`);
  }
  encodeValue(x2) {
    if (!this._type) {
      throw Error("Recursive type uninitialized.");
    }
    return this._type.encodeValue(x2);
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
  valueToString(x2) {
    if (!this._type) {
      throw Error("Recursive type uninitialized.");
    }
    return this._type.valueToString(x2);
  }
}
RecClass._counter = 0;
function decodePrincipalId(b2) {
  const x2 = safeReadUint8(b2);
  if (x2 !== 1) {
    throw new Error("Cannot decode principal");
  }
  const len = Number(lebDecode(b2));
  return Principal$1.fromUint8Array(new Uint8Array(safeRead(b2, len)));
}
class PrincipalClass extends PrimitiveType {
  accept(v3, d2) {
    return v3.visitPrincipal(this, d2);
  }
  covariant(x2) {
    if (x2 && x2._isPrincipal)
      return true;
    throw new Error(`Invalid ${this.display()} argument: ${toReadableString(x2)}`);
  }
  encodeValue(x2) {
    const buf = x2.toUint8Array();
    const len = lebEncode(buf.byteLength);
    return concat(new Uint8Array([1]), len, buf);
  }
  encodeType() {
    return slebEncode(
      -24
      /* IDLTypeIds.Principal */
    );
  }
  decodeValue(b2, t3) {
    this.checkType(t3);
    return decodePrincipalId(b2);
  }
  get name() {
    return "principal";
  }
  valueToString(x2) {
    return `${this.name} "${x2.toText()}"`;
  }
}
class FuncClass extends ConstructType {
  constructor(argTypes, retTypes, annotations = []) {
    super();
    this.argTypes = argTypes;
    this.retTypes = retTypes;
    this.annotations = annotations;
  }
  static argsToString(types, v3) {
    if (types.length !== v3.length) {
      throw new Error("arity mismatch");
    }
    return "(" + types.map((t3, i3) => t3.valueToString(v3[i3])).join(", ") + ")";
  }
  accept(v3, d2) {
    return v3.visitFunc(this, d2);
  }
  covariant(x2) {
    if (Array.isArray(x2) && x2.length === 2 && x2[0] && x2[0]._isPrincipal && typeof x2[1] === "string")
      return true;
    throw new Error(`Invalid ${this.display()} argument: ${toReadableString(x2)}`);
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
    const opCode = slebEncode(
      -22
      /* IDLTypeIds.Func */
    );
    const argLen = lebEncode(this.argTypes.length);
    const args = concat(...this.argTypes.map((arg) => arg.encodeType(T2)));
    const retLen = lebEncode(this.retTypes.length);
    const rets = concat(...this.retTypes.map((arg) => arg.encodeType(T2)));
    const annLen = lebEncode(this.annotations.length);
    const anns = concat(...this.annotations.map((a) => this.encodeAnnotation(a)));
    T2.add(this, concat(opCode, argLen, args, retLen, rets, annLen, anns));
  }
  decodeValue(b2) {
    const x2 = safeReadUint8(b2);
    if (x2 !== 1) {
      throw new Error("Cannot decode function reference");
    }
    const canister = decodePrincipalId(b2);
    const mLen = Number(lebDecode(b2));
    const buf = safeRead(b2, mLen);
    const decoder2 = new TextDecoder("utf8", { fatal: true });
    const method = decoder2.decode(buf);
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
  constructor(fields) {
    super();
    this._fields = Object.entries(fields).sort((a, b2) => {
      if (a[0] < b2[0]) {
        return -1;
      }
      if (a[0] > b2[0]) {
        return 1;
      }
      return 0;
    });
  }
  accept(v3, d2) {
    return v3.visitService(this, d2);
  }
  covariant(x2) {
    if (x2 && x2._isPrincipal)
      return true;
    throw new Error(`Invalid ${this.display()} argument: ${toReadableString(x2)}`);
  }
  encodeValue(x2) {
    const buf = x2.toUint8Array();
    const len = lebEncode(buf.length);
    return concat(new Uint8Array([1]), len, buf);
  }
  _buildTypeTableImpl(T2) {
    this._fields.forEach(([_2, func]) => func.buildTypeTable(T2));
    const opCode = slebEncode(
      -23
      /* IDLTypeIds.Service */
    );
    const len = lebEncode(this._fields.length);
    const meths = this._fields.map(([label, func]) => {
      const labelBuf = new TextEncoder().encode(label);
      const labelLen = lebEncode(labelBuf.length);
      return concat(labelLen, labelBuf, func.encodeType(T2));
    });
    T2.add(this, concat(opCode, len, ...meths));
  }
  decodeValue(b2) {
    return decodePrincipalId(b2);
  }
  get name() {
    const fields = this._fields.map(([key, value2]) => key + ":" + value2.name);
    return `service {${fields.join("; ")}}`;
  }
  valueToString(x2) {
    return `service "${x2.toText()}"`;
  }
}
function toReadableString(x2) {
  const str = JSON.stringify(x2, (_key, value2) => typeof value2 === "bigint" ? `BigInt(${value2})` : value2);
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
  const vals = concat(...zipWith(argTypes, args, (t3, x2) => {
    try {
      t3.covariant(x2);
    } catch (e5) {
      const err = new Error(e5.message + "\n\n");
      throw err;
    }
    return t3.encodeValue(x2);
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
        case -18:
        case -19: {
          const t3 = Number(slebDecode(pipe));
          typeTable.push([ty, t3]);
          break;
        }
        case -20:
        case -21: {
          const fields = [];
          let objectLength = Number(lebDecode(pipe));
          let prevHash;
          while (objectLength--) {
            const hash2 = Number(lebDecode(pipe));
            if (hash2 >= Math.pow(2, 32)) {
              throw new Error("field id out of 32-bit range");
            }
            if (typeof prevHash === "number" && prevHash >= hash2) {
              throw new Error("field id collision or not sorted");
            }
            prevHash = hash2;
            const t3 = Number(slebDecode(pipe));
            fields.push([hash2, t3]);
          }
          typeTable.push([ty, fields]);
          break;
        }
        case -22: {
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
        case -23: {
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
      case -19: {
        const ty = getType(entry[1]);
        return Vec(ty);
      }
      case -18: {
        const ty = getType(entry[1]);
        return Opt(ty);
      }
      case -20: {
        const fields = {};
        for (const [hash2, ty] of entry[1]) {
          const name = `_${hash2}_`;
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
      case -21: {
        const fields = {};
        for (const [hash2, ty] of entry[1]) {
          const name = `_${hash2}_`;
          fields[name] = getType(ty);
        }
        return Variant(fields);
      }
      case -22: {
        const [args, returnValues, annotations] = entry[1];
        return Func(args.map((t3) => getType(t3)), returnValues.map((t3) => getType(t3)), annotations);
      }
      case -23: {
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
    if (entry[0] === -22) {
      const t3 = buildType(entry);
      table[i3].fill(t3);
    }
  });
  rawTable.forEach((entry, i3) => {
    if (entry[0] !== -22) {
      const t3 = buildType(entry);
      table[i3].fill(t3);
    }
  });
  const types = rawTypes.map((t3) => getType(t3));
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
  encode: encode$1
}, Symbol.toStringTag, { value: "Module" }));
var src$1 = {};
var buffer = {};
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */
var hasRequiredBuffer;
function requireBuffer() {
  if (hasRequiredBuffer) return buffer;
  hasRequiredBuffer = 1;
  (function(exports) {
    var base64 = requireBase64Js();
    var ieee7542 = requireIeee754();
    var customInspectSymbol = typeof Symbol === "function" && typeof Symbol["for"] === "function" ? Symbol["for"]("nodejs.util.inspect.custom") : null;
    exports.Buffer = Buffer2;
    exports.SlowBuffer = SlowBuffer;
    exports.INSPECT_MAX_BYTES = 50;
    var K_MAX_LENGTH = 2147483647;
    exports.kMaxLength = K_MAX_LENGTH;
    Buffer2.TYPED_ARRAY_SUPPORT = typedArraySupport();
    if (!Buffer2.TYPED_ARRAY_SUPPORT && typeof console !== "undefined" && typeof console.error === "function") {
      console.error(
        "This browser lacks typed array (Uint8Array) support which is required by `buffer` v5.x. Use `buffer` v4.x if you require old browser support."
      );
    }
    function typedArraySupport() {
      try {
        var arr = new Uint8Array(1);
        var proto = { foo: function() {
          return 42;
        } };
        Object.setPrototypeOf(proto, Uint8Array.prototype);
        Object.setPrototypeOf(arr, proto);
        return arr.foo() === 42;
      } catch (e5) {
        return false;
      }
    }
    Object.defineProperty(Buffer2.prototype, "parent", {
      enumerable: true,
      get: function() {
        if (!Buffer2.isBuffer(this)) return void 0;
        return this.buffer;
      }
    });
    Object.defineProperty(Buffer2.prototype, "offset", {
      enumerable: true,
      get: function() {
        if (!Buffer2.isBuffer(this)) return void 0;
        return this.byteOffset;
      }
    });
    function createBuffer(length) {
      if (length > K_MAX_LENGTH) {
        throw new RangeError('The value "' + length + '" is invalid for option "size"');
      }
      var buf = new Uint8Array(length);
      Object.setPrototypeOf(buf, Buffer2.prototype);
      return buf;
    }
    function Buffer2(arg, encodingOrOffset, length) {
      if (typeof arg === "number") {
        if (typeof encodingOrOffset === "string") {
          throw new TypeError(
            'The "string" argument must be of type string. Received type number'
          );
        }
        return allocUnsafe(arg);
      }
      return from(arg, encodingOrOffset, length);
    }
    Buffer2.poolSize = 8192;
    function from(value2, encodingOrOffset, length) {
      if (typeof value2 === "string") {
        return fromString(value2, encodingOrOffset);
      }
      if (ArrayBuffer.isView(value2)) {
        return fromArrayView(value2);
      }
      if (value2 == null) {
        throw new TypeError(
          "The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " + typeof value2
        );
      }
      if (isInstance(value2, ArrayBuffer) || value2 && isInstance(value2.buffer, ArrayBuffer)) {
        return fromArrayBuffer(value2, encodingOrOffset, length);
      }
      if (typeof SharedArrayBuffer !== "undefined" && (isInstance(value2, SharedArrayBuffer) || value2 && isInstance(value2.buffer, SharedArrayBuffer))) {
        return fromArrayBuffer(value2, encodingOrOffset, length);
      }
      if (typeof value2 === "number") {
        throw new TypeError(
          'The "value" argument must not be of type number. Received type number'
        );
      }
      var valueOf = value2.valueOf && value2.valueOf();
      if (valueOf != null && valueOf !== value2) {
        return Buffer2.from(valueOf, encodingOrOffset, length);
      }
      var b2 = fromObject(value2);
      if (b2) return b2;
      if (typeof Symbol !== "undefined" && Symbol.toPrimitive != null && typeof value2[Symbol.toPrimitive] === "function") {
        return Buffer2.from(
          value2[Symbol.toPrimitive]("string"),
          encodingOrOffset,
          length
        );
      }
      throw new TypeError(
        "The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " + typeof value2
      );
    }
    Buffer2.from = function(value2, encodingOrOffset, length) {
      return from(value2, encodingOrOffset, length);
    };
    Object.setPrototypeOf(Buffer2.prototype, Uint8Array.prototype);
    Object.setPrototypeOf(Buffer2, Uint8Array);
    function assertSize(size) {
      if (typeof size !== "number") {
        throw new TypeError('"size" argument must be of type number');
      } else if (size < 0) {
        throw new RangeError('The value "' + size + '" is invalid for option "size"');
      }
    }
    function alloc(size, fill, encoding) {
      assertSize(size);
      if (size <= 0) {
        return createBuffer(size);
      }
      if (fill !== void 0) {
        return typeof encoding === "string" ? createBuffer(size).fill(fill, encoding) : createBuffer(size).fill(fill);
      }
      return createBuffer(size);
    }
    Buffer2.alloc = function(size, fill, encoding) {
      return alloc(size, fill, encoding);
    };
    function allocUnsafe(size) {
      assertSize(size);
      return createBuffer(size < 0 ? 0 : checked(size) | 0);
    }
    Buffer2.allocUnsafe = function(size) {
      return allocUnsafe(size);
    };
    Buffer2.allocUnsafeSlow = function(size) {
      return allocUnsafe(size);
    };
    function fromString(string, encoding) {
      if (typeof encoding !== "string" || encoding === "") {
        encoding = "utf8";
      }
      if (!Buffer2.isEncoding(encoding)) {
        throw new TypeError("Unknown encoding: " + encoding);
      }
      var length = byteLength(string, encoding) | 0;
      var buf = createBuffer(length);
      var actual = buf.write(string, encoding);
      if (actual !== length) {
        buf = buf.slice(0, actual);
      }
      return buf;
    }
    function fromArrayLike(array) {
      var length = array.length < 0 ? 0 : checked(array.length) | 0;
      var buf = createBuffer(length);
      for (var i3 = 0; i3 < length; i3 += 1) {
        buf[i3] = array[i3] & 255;
      }
      return buf;
    }
    function fromArrayView(arrayView) {
      if (isInstance(arrayView, Uint8Array)) {
        var copy = new Uint8Array(arrayView);
        return fromArrayBuffer(copy.buffer, copy.byteOffset, copy.byteLength);
      }
      return fromArrayLike(arrayView);
    }
    function fromArrayBuffer(array, byteOffset, length) {
      if (byteOffset < 0 || array.byteLength < byteOffset) {
        throw new RangeError('"offset" is outside of buffer bounds');
      }
      if (array.byteLength < byteOffset + (length || 0)) {
        throw new RangeError('"length" is outside of buffer bounds');
      }
      var buf;
      if (byteOffset === void 0 && length === void 0) {
        buf = new Uint8Array(array);
      } else if (length === void 0) {
        buf = new Uint8Array(array, byteOffset);
      } else {
        buf = new Uint8Array(array, byteOffset, length);
      }
      Object.setPrototypeOf(buf, Buffer2.prototype);
      return buf;
    }
    function fromObject(obj) {
      if (Buffer2.isBuffer(obj)) {
        var len = checked(obj.length) | 0;
        var buf = createBuffer(len);
        if (buf.length === 0) {
          return buf;
        }
        obj.copy(buf, 0, 0, len);
        return buf;
      }
      if (obj.length !== void 0) {
        if (typeof obj.length !== "number" || numberIsNaN(obj.length)) {
          return createBuffer(0);
        }
        return fromArrayLike(obj);
      }
      if (obj.type === "Buffer" && Array.isArray(obj.data)) {
        return fromArrayLike(obj.data);
      }
    }
    function checked(length) {
      if (length >= K_MAX_LENGTH) {
        throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x" + K_MAX_LENGTH.toString(16) + " bytes");
      }
      return length | 0;
    }
    function SlowBuffer(length) {
      if (+length != length) {
        length = 0;
      }
      return Buffer2.alloc(+length);
    }
    Buffer2.isBuffer = function isBuffer(b2) {
      return b2 != null && b2._isBuffer === true && b2 !== Buffer2.prototype;
    };
    Buffer2.compare = function compare2(a, b2) {
      if (isInstance(a, Uint8Array)) a = Buffer2.from(a, a.offset, a.byteLength);
      if (isInstance(b2, Uint8Array)) b2 = Buffer2.from(b2, b2.offset, b2.byteLength);
      if (!Buffer2.isBuffer(a) || !Buffer2.isBuffer(b2)) {
        throw new TypeError(
          'The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array'
        );
      }
      if (a === b2) return 0;
      var x2 = a.length;
      var y = b2.length;
      for (var i3 = 0, len = Math.min(x2, y); i3 < len; ++i3) {
        if (a[i3] !== b2[i3]) {
          x2 = a[i3];
          y = b2[i3];
          break;
        }
      }
      if (x2 < y) return -1;
      if (y < x2) return 1;
      return 0;
    };
    Buffer2.isEncoding = function isEncoding(encoding) {
      switch (String(encoding).toLowerCase()) {
        case "hex":
        case "utf8":
        case "utf-8":
        case "ascii":
        case "latin1":
        case "binary":
        case "base64":
        case "ucs2":
        case "ucs-2":
        case "utf16le":
        case "utf-16le":
          return true;
        default:
          return false;
      }
    };
    Buffer2.concat = function concat2(list, length) {
      if (!Array.isArray(list)) {
        throw new TypeError('"list" argument must be an Array of Buffers');
      }
      if (list.length === 0) {
        return Buffer2.alloc(0);
      }
      var i3;
      if (length === void 0) {
        length = 0;
        for (i3 = 0; i3 < list.length; ++i3) {
          length += list[i3].length;
        }
      }
      var buffer2 = Buffer2.allocUnsafe(length);
      var pos = 0;
      for (i3 = 0; i3 < list.length; ++i3) {
        var buf = list[i3];
        if (isInstance(buf, Uint8Array)) {
          if (pos + buf.length > buffer2.length) {
            Buffer2.from(buf).copy(buffer2, pos);
          } else {
            Uint8Array.prototype.set.call(
              buffer2,
              buf,
              pos
            );
          }
        } else if (!Buffer2.isBuffer(buf)) {
          throw new TypeError('"list" argument must be an Array of Buffers');
        } else {
          buf.copy(buffer2, pos);
        }
        pos += buf.length;
      }
      return buffer2;
    };
    function byteLength(string, encoding) {
      if (Buffer2.isBuffer(string)) {
        return string.length;
      }
      if (ArrayBuffer.isView(string) || isInstance(string, ArrayBuffer)) {
        return string.byteLength;
      }
      if (typeof string !== "string") {
        throw new TypeError(
          'The "string" argument must be one of type string, Buffer, or ArrayBuffer. Received type ' + typeof string
        );
      }
      var len = string.length;
      var mustMatch = arguments.length > 2 && arguments[2] === true;
      if (!mustMatch && len === 0) return 0;
      var loweredCase = false;
      for (; ; ) {
        switch (encoding) {
          case "ascii":
          case "latin1":
          case "binary":
            return len;
          case "utf8":
          case "utf-8":
            return utf8ToBytes2(string).length;
          case "ucs2":
          case "ucs-2":
          case "utf16le":
          case "utf-16le":
            return len * 2;
          case "hex":
            return len >>> 1;
          case "base64":
            return base64ToBytes(string).length;
          default:
            if (loweredCase) {
              return mustMatch ? -1 : utf8ToBytes2(string).length;
            }
            encoding = ("" + encoding).toLowerCase();
            loweredCase = true;
        }
      }
    }
    Buffer2.byteLength = byteLength;
    function slowToString(encoding, start, end) {
      var loweredCase = false;
      if (start === void 0 || start < 0) {
        start = 0;
      }
      if (start > this.length) {
        return "";
      }
      if (end === void 0 || end > this.length) {
        end = this.length;
      }
      if (end <= 0) {
        return "";
      }
      end >>>= 0;
      start >>>= 0;
      if (end <= start) {
        return "";
      }
      if (!encoding) encoding = "utf8";
      while (true) {
        switch (encoding) {
          case "hex":
            return hexSlice(this, start, end);
          case "utf8":
          case "utf-8":
            return utf8Slice(this, start, end);
          case "ascii":
            return asciiSlice(this, start, end);
          case "latin1":
          case "binary":
            return latin1Slice(this, start, end);
          case "base64":
            return base64Slice(this, start, end);
          case "ucs2":
          case "ucs-2":
          case "utf16le":
          case "utf-16le":
            return utf16leSlice(this, start, end);
          default:
            if (loweredCase) throw new TypeError("Unknown encoding: " + encoding);
            encoding = (encoding + "").toLowerCase();
            loweredCase = true;
        }
      }
    }
    Buffer2.prototype._isBuffer = true;
    function swap(b2, n2, m2) {
      var i3 = b2[n2];
      b2[n2] = b2[m2];
      b2[m2] = i3;
    }
    Buffer2.prototype.swap16 = function swap16() {
      var len = this.length;
      if (len % 2 !== 0) {
        throw new RangeError("Buffer size must be a multiple of 16-bits");
      }
      for (var i3 = 0; i3 < len; i3 += 2) {
        swap(this, i3, i3 + 1);
      }
      return this;
    };
    Buffer2.prototype.swap32 = function swap32() {
      var len = this.length;
      if (len % 4 !== 0) {
        throw new RangeError("Buffer size must be a multiple of 32-bits");
      }
      for (var i3 = 0; i3 < len; i3 += 4) {
        swap(this, i3, i3 + 3);
        swap(this, i3 + 1, i3 + 2);
      }
      return this;
    };
    Buffer2.prototype.swap64 = function swap64() {
      var len = this.length;
      if (len % 8 !== 0) {
        throw new RangeError("Buffer size must be a multiple of 64-bits");
      }
      for (var i3 = 0; i3 < len; i3 += 8) {
        swap(this, i3, i3 + 7);
        swap(this, i3 + 1, i3 + 6);
        swap(this, i3 + 2, i3 + 5);
        swap(this, i3 + 3, i3 + 4);
      }
      return this;
    };
    Buffer2.prototype.toString = function toString() {
      var length = this.length;
      if (length === 0) return "";
      if (arguments.length === 0) return utf8Slice(this, 0, length);
      return slowToString.apply(this, arguments);
    };
    Buffer2.prototype.toLocaleString = Buffer2.prototype.toString;
    Buffer2.prototype.equals = function equals(b2) {
      if (!Buffer2.isBuffer(b2)) throw new TypeError("Argument must be a Buffer");
      if (this === b2) return true;
      return Buffer2.compare(this, b2) === 0;
    };
    Buffer2.prototype.inspect = function inspect() {
      var str = "";
      var max = exports.INSPECT_MAX_BYTES;
      str = this.toString("hex", 0, max).replace(/(.{2})/g, "$1 ").trim();
      if (this.length > max) str += " ... ";
      return "<Buffer " + str + ">";
    };
    if (customInspectSymbol) {
      Buffer2.prototype[customInspectSymbol] = Buffer2.prototype.inspect;
    }
    Buffer2.prototype.compare = function compare2(target, start, end, thisStart, thisEnd) {
      if (isInstance(target, Uint8Array)) {
        target = Buffer2.from(target, target.offset, target.byteLength);
      }
      if (!Buffer2.isBuffer(target)) {
        throw new TypeError(
          'The "target" argument must be one of type Buffer or Uint8Array. Received type ' + typeof target
        );
      }
      if (start === void 0) {
        start = 0;
      }
      if (end === void 0) {
        end = target ? target.length : 0;
      }
      if (thisStart === void 0) {
        thisStart = 0;
      }
      if (thisEnd === void 0) {
        thisEnd = this.length;
      }
      if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
        throw new RangeError("out of range index");
      }
      if (thisStart >= thisEnd && start >= end) {
        return 0;
      }
      if (thisStart >= thisEnd) {
        return -1;
      }
      if (start >= end) {
        return 1;
      }
      start >>>= 0;
      end >>>= 0;
      thisStart >>>= 0;
      thisEnd >>>= 0;
      if (this === target) return 0;
      var x2 = thisEnd - thisStart;
      var y = end - start;
      var len = Math.min(x2, y);
      var thisCopy = this.slice(thisStart, thisEnd);
      var targetCopy = target.slice(start, end);
      for (var i3 = 0; i3 < len; ++i3) {
        if (thisCopy[i3] !== targetCopy[i3]) {
          x2 = thisCopy[i3];
          y = targetCopy[i3];
          break;
        }
      }
      if (x2 < y) return -1;
      if (y < x2) return 1;
      return 0;
    };
    function bidirectionalIndexOf(buffer2, val, byteOffset, encoding, dir) {
      if (buffer2.length === 0) return -1;
      if (typeof byteOffset === "string") {
        encoding = byteOffset;
        byteOffset = 0;
      } else if (byteOffset > 2147483647) {
        byteOffset = 2147483647;
      } else if (byteOffset < -2147483648) {
        byteOffset = -2147483648;
      }
      byteOffset = +byteOffset;
      if (numberIsNaN(byteOffset)) {
        byteOffset = dir ? 0 : buffer2.length - 1;
      }
      if (byteOffset < 0) byteOffset = buffer2.length + byteOffset;
      if (byteOffset >= buffer2.length) {
        if (dir) return -1;
        else byteOffset = buffer2.length - 1;
      } else if (byteOffset < 0) {
        if (dir) byteOffset = 0;
        else return -1;
      }
      if (typeof val === "string") {
        val = Buffer2.from(val, encoding);
      }
      if (Buffer2.isBuffer(val)) {
        if (val.length === 0) {
          return -1;
        }
        return arrayIndexOf(buffer2, val, byteOffset, encoding, dir);
      } else if (typeof val === "number") {
        val = val & 255;
        if (typeof Uint8Array.prototype.indexOf === "function") {
          if (dir) {
            return Uint8Array.prototype.indexOf.call(buffer2, val, byteOffset);
          } else {
            return Uint8Array.prototype.lastIndexOf.call(buffer2, val, byteOffset);
          }
        }
        return arrayIndexOf(buffer2, [val], byteOffset, encoding, dir);
      }
      throw new TypeError("val must be string, number or Buffer");
    }
    function arrayIndexOf(arr, val, byteOffset, encoding, dir) {
      var indexSize = 1;
      var arrLength = arr.length;
      var valLength = val.length;
      if (encoding !== void 0) {
        encoding = String(encoding).toLowerCase();
        if (encoding === "ucs2" || encoding === "ucs-2" || encoding === "utf16le" || encoding === "utf-16le") {
          if (arr.length < 2 || val.length < 2) {
            return -1;
          }
          indexSize = 2;
          arrLength /= 2;
          valLength /= 2;
          byteOffset /= 2;
        }
      }
      function read(buf, i4) {
        if (indexSize === 1) {
          return buf[i4];
        } else {
          return buf.readUInt16BE(i4 * indexSize);
        }
      }
      var i3;
      if (dir) {
        var foundIndex = -1;
        for (i3 = byteOffset; i3 < arrLength; i3++) {
          if (read(arr, i3) === read(val, foundIndex === -1 ? 0 : i3 - foundIndex)) {
            if (foundIndex === -1) foundIndex = i3;
            if (i3 - foundIndex + 1 === valLength) return foundIndex * indexSize;
          } else {
            if (foundIndex !== -1) i3 -= i3 - foundIndex;
            foundIndex = -1;
          }
        }
      } else {
        if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength;
        for (i3 = byteOffset; i3 >= 0; i3--) {
          var found = true;
          for (var j2 = 0; j2 < valLength; j2++) {
            if (read(arr, i3 + j2) !== read(val, j2)) {
              found = false;
              break;
            }
          }
          if (found) return i3;
        }
      }
      return -1;
    }
    Buffer2.prototype.includes = function includes(val, byteOffset, encoding) {
      return this.indexOf(val, byteOffset, encoding) !== -1;
    };
    Buffer2.prototype.indexOf = function indexOf(val, byteOffset, encoding) {
      return bidirectionalIndexOf(this, val, byteOffset, encoding, true);
    };
    Buffer2.prototype.lastIndexOf = function lastIndexOf(val, byteOffset, encoding) {
      return bidirectionalIndexOf(this, val, byteOffset, encoding, false);
    };
    function hexWrite(buf, string, offset, length) {
      offset = Number(offset) || 0;
      var remaining = buf.length - offset;
      if (!length) {
        length = remaining;
      } else {
        length = Number(length);
        if (length > remaining) {
          length = remaining;
        }
      }
      var strLen = string.length;
      if (length > strLen / 2) {
        length = strLen / 2;
      }
      for (var i3 = 0; i3 < length; ++i3) {
        var parsed = parseInt(string.substr(i3 * 2, 2), 16);
        if (numberIsNaN(parsed)) return i3;
        buf[offset + i3] = parsed;
      }
      return i3;
    }
    function utf8Write(buf, string, offset, length) {
      return blitBuffer(utf8ToBytes2(string, buf.length - offset), buf, offset, length);
    }
    function asciiWrite(buf, string, offset, length) {
      return blitBuffer(asciiToBytes(string), buf, offset, length);
    }
    function base64Write(buf, string, offset, length) {
      return blitBuffer(base64ToBytes(string), buf, offset, length);
    }
    function ucs2Write(buf, string, offset, length) {
      return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length);
    }
    Buffer2.prototype.write = function write(string, offset, length, encoding) {
      if (offset === void 0) {
        encoding = "utf8";
        length = this.length;
        offset = 0;
      } else if (length === void 0 && typeof offset === "string") {
        encoding = offset;
        length = this.length;
        offset = 0;
      } else if (isFinite(offset)) {
        offset = offset >>> 0;
        if (isFinite(length)) {
          length = length >>> 0;
          if (encoding === void 0) encoding = "utf8";
        } else {
          encoding = length;
          length = void 0;
        }
      } else {
        throw new Error(
          "Buffer.write(string, encoding, offset[, length]) is no longer supported"
        );
      }
      var remaining = this.length - offset;
      if (length === void 0 || length > remaining) length = remaining;
      if (string.length > 0 && (length < 0 || offset < 0) || offset > this.length) {
        throw new RangeError("Attempt to write outside buffer bounds");
      }
      if (!encoding) encoding = "utf8";
      var loweredCase = false;
      for (; ; ) {
        switch (encoding) {
          case "hex":
            return hexWrite(this, string, offset, length);
          case "utf8":
          case "utf-8":
            return utf8Write(this, string, offset, length);
          case "ascii":
          case "latin1":
          case "binary":
            return asciiWrite(this, string, offset, length);
          case "base64":
            return base64Write(this, string, offset, length);
          case "ucs2":
          case "ucs-2":
          case "utf16le":
          case "utf-16le":
            return ucs2Write(this, string, offset, length);
          default:
            if (loweredCase) throw new TypeError("Unknown encoding: " + encoding);
            encoding = ("" + encoding).toLowerCase();
            loweredCase = true;
        }
      }
    };
    Buffer2.prototype.toJSON = function toJSON() {
      return {
        type: "Buffer",
        data: Array.prototype.slice.call(this._arr || this, 0)
      };
    };
    function base64Slice(buf, start, end) {
      if (start === 0 && end === buf.length) {
        return base64.fromByteArray(buf);
      } else {
        return base64.fromByteArray(buf.slice(start, end));
      }
    }
    function utf8Slice(buf, start, end) {
      end = Math.min(buf.length, end);
      var res = [];
      var i3 = start;
      while (i3 < end) {
        var firstByte = buf[i3];
        var codePoint = null;
        var bytesPerSequence = firstByte > 239 ? 4 : firstByte > 223 ? 3 : firstByte > 191 ? 2 : 1;
        if (i3 + bytesPerSequence <= end) {
          var secondByte, thirdByte, fourthByte, tempCodePoint;
          switch (bytesPerSequence) {
            case 1:
              if (firstByte < 128) {
                codePoint = firstByte;
              }
              break;
            case 2:
              secondByte = buf[i3 + 1];
              if ((secondByte & 192) === 128) {
                tempCodePoint = (firstByte & 31) << 6 | secondByte & 63;
                if (tempCodePoint > 127) {
                  codePoint = tempCodePoint;
                }
              }
              break;
            case 3:
              secondByte = buf[i3 + 1];
              thirdByte = buf[i3 + 2];
              if ((secondByte & 192) === 128 && (thirdByte & 192) === 128) {
                tempCodePoint = (firstByte & 15) << 12 | (secondByte & 63) << 6 | thirdByte & 63;
                if (tempCodePoint > 2047 && (tempCodePoint < 55296 || tempCodePoint > 57343)) {
                  codePoint = tempCodePoint;
                }
              }
              break;
            case 4:
              secondByte = buf[i3 + 1];
              thirdByte = buf[i3 + 2];
              fourthByte = buf[i3 + 3];
              if ((secondByte & 192) === 128 && (thirdByte & 192) === 128 && (fourthByte & 192) === 128) {
                tempCodePoint = (firstByte & 15) << 18 | (secondByte & 63) << 12 | (thirdByte & 63) << 6 | fourthByte & 63;
                if (tempCodePoint > 65535 && tempCodePoint < 1114112) {
                  codePoint = tempCodePoint;
                }
              }
          }
        }
        if (codePoint === null) {
          codePoint = 65533;
          bytesPerSequence = 1;
        } else if (codePoint > 65535) {
          codePoint -= 65536;
          res.push(codePoint >>> 10 & 1023 | 55296);
          codePoint = 56320 | codePoint & 1023;
        }
        res.push(codePoint);
        i3 += bytesPerSequence;
      }
      return decodeCodePointsArray(res);
    }
    var MAX_ARGUMENTS_LENGTH = 4096;
    function decodeCodePointsArray(codePoints) {
      var len = codePoints.length;
      if (len <= MAX_ARGUMENTS_LENGTH) {
        return String.fromCharCode.apply(String, codePoints);
      }
      var res = "";
      var i3 = 0;
      while (i3 < len) {
        res += String.fromCharCode.apply(
          String,
          codePoints.slice(i3, i3 += MAX_ARGUMENTS_LENGTH)
        );
      }
      return res;
    }
    function asciiSlice(buf, start, end) {
      var ret = "";
      end = Math.min(buf.length, end);
      for (var i3 = start; i3 < end; ++i3) {
        ret += String.fromCharCode(buf[i3] & 127);
      }
      return ret;
    }
    function latin1Slice(buf, start, end) {
      var ret = "";
      end = Math.min(buf.length, end);
      for (var i3 = start; i3 < end; ++i3) {
        ret += String.fromCharCode(buf[i3]);
      }
      return ret;
    }
    function hexSlice(buf, start, end) {
      var len = buf.length;
      if (!start || start < 0) start = 0;
      if (!end || end < 0 || end > len) end = len;
      var out = "";
      for (var i3 = start; i3 < end; ++i3) {
        out += hexSliceLookupTable[buf[i3]];
      }
      return out;
    }
    function utf16leSlice(buf, start, end) {
      var bytes = buf.slice(start, end);
      var res = "";
      for (var i3 = 0; i3 < bytes.length - 1; i3 += 2) {
        res += String.fromCharCode(bytes[i3] + bytes[i3 + 1] * 256);
      }
      return res;
    }
    Buffer2.prototype.slice = function slice(start, end) {
      var len = this.length;
      start = ~~start;
      end = end === void 0 ? len : ~~end;
      if (start < 0) {
        start += len;
        if (start < 0) start = 0;
      } else if (start > len) {
        start = len;
      }
      if (end < 0) {
        end += len;
        if (end < 0) end = 0;
      } else if (end > len) {
        end = len;
      }
      if (end < start) end = start;
      var newBuf = this.subarray(start, end);
      Object.setPrototypeOf(newBuf, Buffer2.prototype);
      return newBuf;
    };
    function checkOffset(offset, ext, length) {
      if (offset % 1 !== 0 || offset < 0) throw new RangeError("offset is not uint");
      if (offset + ext > length) throw new RangeError("Trying to access beyond buffer length");
    }
    Buffer2.prototype.readUintLE = Buffer2.prototype.readUIntLE = function readUIntLE2(offset, byteLength2, noAssert) {
      offset = offset >>> 0;
      byteLength2 = byteLength2 >>> 0;
      if (!noAssert) checkOffset(offset, byteLength2, this.length);
      var val = this[offset];
      var mul = 1;
      var i3 = 0;
      while (++i3 < byteLength2 && (mul *= 256)) {
        val += this[offset + i3] * mul;
      }
      return val;
    };
    Buffer2.prototype.readUintBE = Buffer2.prototype.readUIntBE = function readUIntBE(offset, byteLength2, noAssert) {
      offset = offset >>> 0;
      byteLength2 = byteLength2 >>> 0;
      if (!noAssert) {
        checkOffset(offset, byteLength2, this.length);
      }
      var val = this[offset + --byteLength2];
      var mul = 1;
      while (byteLength2 > 0 && (mul *= 256)) {
        val += this[offset + --byteLength2] * mul;
      }
      return val;
    };
    Buffer2.prototype.readUint8 = Buffer2.prototype.readUInt8 = function readUInt8(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert) checkOffset(offset, 1, this.length);
      return this[offset];
    };
    Buffer2.prototype.readUint16LE = Buffer2.prototype.readUInt16LE = function readUInt16LE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert) checkOffset(offset, 2, this.length);
      return this[offset] | this[offset + 1] << 8;
    };
    Buffer2.prototype.readUint16BE = Buffer2.prototype.readUInt16BE = function readUInt16BE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert) checkOffset(offset, 2, this.length);
      return this[offset] << 8 | this[offset + 1];
    };
    Buffer2.prototype.readUint32LE = Buffer2.prototype.readUInt32LE = function readUInt32LE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert) checkOffset(offset, 4, this.length);
      return (this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16) + this[offset + 3] * 16777216;
    };
    Buffer2.prototype.readUint32BE = Buffer2.prototype.readUInt32BE = function readUInt32BE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert) checkOffset(offset, 4, this.length);
      return this[offset] * 16777216 + (this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3]);
    };
    Buffer2.prototype.readIntLE = function readIntLE2(offset, byteLength2, noAssert) {
      offset = offset >>> 0;
      byteLength2 = byteLength2 >>> 0;
      if (!noAssert) checkOffset(offset, byteLength2, this.length);
      var val = this[offset];
      var mul = 1;
      var i3 = 0;
      while (++i3 < byteLength2 && (mul *= 256)) {
        val += this[offset + i3] * mul;
      }
      mul *= 128;
      if (val >= mul) val -= Math.pow(2, 8 * byteLength2);
      return val;
    };
    Buffer2.prototype.readIntBE = function readIntBE(offset, byteLength2, noAssert) {
      offset = offset >>> 0;
      byteLength2 = byteLength2 >>> 0;
      if (!noAssert) checkOffset(offset, byteLength2, this.length);
      var i3 = byteLength2;
      var mul = 1;
      var val = this[offset + --i3];
      while (i3 > 0 && (mul *= 256)) {
        val += this[offset + --i3] * mul;
      }
      mul *= 128;
      if (val >= mul) val -= Math.pow(2, 8 * byteLength2);
      return val;
    };
    Buffer2.prototype.readInt8 = function readInt8(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert) checkOffset(offset, 1, this.length);
      if (!(this[offset] & 128)) return this[offset];
      return (255 - this[offset] + 1) * -1;
    };
    Buffer2.prototype.readInt16LE = function readInt16LE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert) checkOffset(offset, 2, this.length);
      var val = this[offset] | this[offset + 1] << 8;
      return val & 32768 ? val | 4294901760 : val;
    };
    Buffer2.prototype.readInt16BE = function readInt16BE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert) checkOffset(offset, 2, this.length);
      var val = this[offset + 1] | this[offset] << 8;
      return val & 32768 ? val | 4294901760 : val;
    };
    Buffer2.prototype.readInt32LE = function readInt32LE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert) checkOffset(offset, 4, this.length);
      return this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16 | this[offset + 3] << 24;
    };
    Buffer2.prototype.readInt32BE = function readInt32BE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert) checkOffset(offset, 4, this.length);
      return this[offset] << 24 | this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3];
    };
    Buffer2.prototype.readFloatLE = function readFloatLE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert) checkOffset(offset, 4, this.length);
      return ieee7542.read(this, offset, true, 23, 4);
    };
    Buffer2.prototype.readFloatBE = function readFloatBE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert) checkOffset(offset, 4, this.length);
      return ieee7542.read(this, offset, false, 23, 4);
    };
    Buffer2.prototype.readDoubleLE = function readDoubleLE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert) checkOffset(offset, 8, this.length);
      return ieee7542.read(this, offset, true, 52, 8);
    };
    Buffer2.prototype.readDoubleBE = function readDoubleBE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert) checkOffset(offset, 8, this.length);
      return ieee7542.read(this, offset, false, 52, 8);
    };
    function checkInt(buf, value2, offset, ext, max, min) {
      if (!Buffer2.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance');
      if (value2 > max || value2 < min) throw new RangeError('"value" argument is out of bounds');
      if (offset + ext > buf.length) throw new RangeError("Index out of range");
    }
    Buffer2.prototype.writeUintLE = Buffer2.prototype.writeUIntLE = function writeUIntLE2(value2, offset, byteLength2, noAssert) {
      value2 = +value2;
      offset = offset >>> 0;
      byteLength2 = byteLength2 >>> 0;
      if (!noAssert) {
        var maxBytes = Math.pow(2, 8 * byteLength2) - 1;
        checkInt(this, value2, offset, byteLength2, maxBytes, 0);
      }
      var mul = 1;
      var i3 = 0;
      this[offset] = value2 & 255;
      while (++i3 < byteLength2 && (mul *= 256)) {
        this[offset + i3] = value2 / mul & 255;
      }
      return offset + byteLength2;
    };
    Buffer2.prototype.writeUintBE = Buffer2.prototype.writeUIntBE = function writeUIntBE(value2, offset, byteLength2, noAssert) {
      value2 = +value2;
      offset = offset >>> 0;
      byteLength2 = byteLength2 >>> 0;
      if (!noAssert) {
        var maxBytes = Math.pow(2, 8 * byteLength2) - 1;
        checkInt(this, value2, offset, byteLength2, maxBytes, 0);
      }
      var i3 = byteLength2 - 1;
      var mul = 1;
      this[offset + i3] = value2 & 255;
      while (--i3 >= 0 && (mul *= 256)) {
        this[offset + i3] = value2 / mul & 255;
      }
      return offset + byteLength2;
    };
    Buffer2.prototype.writeUint8 = Buffer2.prototype.writeUInt8 = function writeUInt8(value2, offset, noAssert) {
      value2 = +value2;
      offset = offset >>> 0;
      if (!noAssert) checkInt(this, value2, offset, 1, 255, 0);
      this[offset] = value2 & 255;
      return offset + 1;
    };
    Buffer2.prototype.writeUint16LE = Buffer2.prototype.writeUInt16LE = function writeUInt16LE(value2, offset, noAssert) {
      value2 = +value2;
      offset = offset >>> 0;
      if (!noAssert) checkInt(this, value2, offset, 2, 65535, 0);
      this[offset] = value2 & 255;
      this[offset + 1] = value2 >>> 8;
      return offset + 2;
    };
    Buffer2.prototype.writeUint16BE = Buffer2.prototype.writeUInt16BE = function writeUInt16BE(value2, offset, noAssert) {
      value2 = +value2;
      offset = offset >>> 0;
      if (!noAssert) checkInt(this, value2, offset, 2, 65535, 0);
      this[offset] = value2 >>> 8;
      this[offset + 1] = value2 & 255;
      return offset + 2;
    };
    Buffer2.prototype.writeUint32LE = Buffer2.prototype.writeUInt32LE = function writeUInt32LE(value2, offset, noAssert) {
      value2 = +value2;
      offset = offset >>> 0;
      if (!noAssert) checkInt(this, value2, offset, 4, 4294967295, 0);
      this[offset + 3] = value2 >>> 24;
      this[offset + 2] = value2 >>> 16;
      this[offset + 1] = value2 >>> 8;
      this[offset] = value2 & 255;
      return offset + 4;
    };
    Buffer2.prototype.writeUint32BE = Buffer2.prototype.writeUInt32BE = function writeUInt32BE(value2, offset, noAssert) {
      value2 = +value2;
      offset = offset >>> 0;
      if (!noAssert) checkInt(this, value2, offset, 4, 4294967295, 0);
      this[offset] = value2 >>> 24;
      this[offset + 1] = value2 >>> 16;
      this[offset + 2] = value2 >>> 8;
      this[offset + 3] = value2 & 255;
      return offset + 4;
    };
    Buffer2.prototype.writeIntLE = function writeIntLE2(value2, offset, byteLength2, noAssert) {
      value2 = +value2;
      offset = offset >>> 0;
      if (!noAssert) {
        var limit = Math.pow(2, 8 * byteLength2 - 1);
        checkInt(this, value2, offset, byteLength2, limit - 1, -limit);
      }
      var i3 = 0;
      var mul = 1;
      var sub = 0;
      this[offset] = value2 & 255;
      while (++i3 < byteLength2 && (mul *= 256)) {
        if (value2 < 0 && sub === 0 && this[offset + i3 - 1] !== 0) {
          sub = 1;
        }
        this[offset + i3] = (value2 / mul >> 0) - sub & 255;
      }
      return offset + byteLength2;
    };
    Buffer2.prototype.writeIntBE = function writeIntBE(value2, offset, byteLength2, noAssert) {
      value2 = +value2;
      offset = offset >>> 0;
      if (!noAssert) {
        var limit = Math.pow(2, 8 * byteLength2 - 1);
        checkInt(this, value2, offset, byteLength2, limit - 1, -limit);
      }
      var i3 = byteLength2 - 1;
      var mul = 1;
      var sub = 0;
      this[offset + i3] = value2 & 255;
      while (--i3 >= 0 && (mul *= 256)) {
        if (value2 < 0 && sub === 0 && this[offset + i3 + 1] !== 0) {
          sub = 1;
        }
        this[offset + i3] = (value2 / mul >> 0) - sub & 255;
      }
      return offset + byteLength2;
    };
    Buffer2.prototype.writeInt8 = function writeInt8(value2, offset, noAssert) {
      value2 = +value2;
      offset = offset >>> 0;
      if (!noAssert) checkInt(this, value2, offset, 1, 127, -128);
      if (value2 < 0) value2 = 255 + value2 + 1;
      this[offset] = value2 & 255;
      return offset + 1;
    };
    Buffer2.prototype.writeInt16LE = function writeInt16LE(value2, offset, noAssert) {
      value2 = +value2;
      offset = offset >>> 0;
      if (!noAssert) checkInt(this, value2, offset, 2, 32767, -32768);
      this[offset] = value2 & 255;
      this[offset + 1] = value2 >>> 8;
      return offset + 2;
    };
    Buffer2.prototype.writeInt16BE = function writeInt16BE(value2, offset, noAssert) {
      value2 = +value2;
      offset = offset >>> 0;
      if (!noAssert) checkInt(this, value2, offset, 2, 32767, -32768);
      this[offset] = value2 >>> 8;
      this[offset + 1] = value2 & 255;
      return offset + 2;
    };
    Buffer2.prototype.writeInt32LE = function writeInt32LE(value2, offset, noAssert) {
      value2 = +value2;
      offset = offset >>> 0;
      if (!noAssert) checkInt(this, value2, offset, 4, 2147483647, -2147483648);
      this[offset] = value2 & 255;
      this[offset + 1] = value2 >>> 8;
      this[offset + 2] = value2 >>> 16;
      this[offset + 3] = value2 >>> 24;
      return offset + 4;
    };
    Buffer2.prototype.writeInt32BE = function writeInt32BE(value2, offset, noAssert) {
      value2 = +value2;
      offset = offset >>> 0;
      if (!noAssert) checkInt(this, value2, offset, 4, 2147483647, -2147483648);
      if (value2 < 0) value2 = 4294967295 + value2 + 1;
      this[offset] = value2 >>> 24;
      this[offset + 1] = value2 >>> 16;
      this[offset + 2] = value2 >>> 8;
      this[offset + 3] = value2 & 255;
      return offset + 4;
    };
    function checkIEEE754(buf, value2, offset, ext, max, min) {
      if (offset + ext > buf.length) throw new RangeError("Index out of range");
      if (offset < 0) throw new RangeError("Index out of range");
    }
    function writeFloat(buf, value2, offset, littleEndian, noAssert) {
      value2 = +value2;
      offset = offset >>> 0;
      if (!noAssert) {
        checkIEEE754(buf, value2, offset, 4);
      }
      ieee7542.write(buf, value2, offset, littleEndian, 23, 4);
      return offset + 4;
    }
    Buffer2.prototype.writeFloatLE = function writeFloatLE(value2, offset, noAssert) {
      return writeFloat(this, value2, offset, true, noAssert);
    };
    Buffer2.prototype.writeFloatBE = function writeFloatBE(value2, offset, noAssert) {
      return writeFloat(this, value2, offset, false, noAssert);
    };
    function writeDouble(buf, value2, offset, littleEndian, noAssert) {
      value2 = +value2;
      offset = offset >>> 0;
      if (!noAssert) {
        checkIEEE754(buf, value2, offset, 8);
      }
      ieee7542.write(buf, value2, offset, littleEndian, 52, 8);
      return offset + 8;
    }
    Buffer2.prototype.writeDoubleLE = function writeDoubleLE(value2, offset, noAssert) {
      return writeDouble(this, value2, offset, true, noAssert);
    };
    Buffer2.prototype.writeDoubleBE = function writeDoubleBE(value2, offset, noAssert) {
      return writeDouble(this, value2, offset, false, noAssert);
    };
    Buffer2.prototype.copy = function copy(target, targetStart, start, end) {
      if (!Buffer2.isBuffer(target)) throw new TypeError("argument should be a Buffer");
      if (!start) start = 0;
      if (!end && end !== 0) end = this.length;
      if (targetStart >= target.length) targetStart = target.length;
      if (!targetStart) targetStart = 0;
      if (end > 0 && end < start) end = start;
      if (end === start) return 0;
      if (target.length === 0 || this.length === 0) return 0;
      if (targetStart < 0) {
        throw new RangeError("targetStart out of bounds");
      }
      if (start < 0 || start >= this.length) throw new RangeError("Index out of range");
      if (end < 0) throw new RangeError("sourceEnd out of bounds");
      if (end > this.length) end = this.length;
      if (target.length - targetStart < end - start) {
        end = target.length - targetStart + start;
      }
      var len = end - start;
      if (this === target && typeof Uint8Array.prototype.copyWithin === "function") {
        this.copyWithin(targetStart, start, end);
      } else {
        Uint8Array.prototype.set.call(
          target,
          this.subarray(start, end),
          targetStart
        );
      }
      return len;
    };
    Buffer2.prototype.fill = function fill(val, start, end, encoding) {
      if (typeof val === "string") {
        if (typeof start === "string") {
          encoding = start;
          start = 0;
          end = this.length;
        } else if (typeof end === "string") {
          encoding = end;
          end = this.length;
        }
        if (encoding !== void 0 && typeof encoding !== "string") {
          throw new TypeError("encoding must be a string");
        }
        if (typeof encoding === "string" && !Buffer2.isEncoding(encoding)) {
          throw new TypeError("Unknown encoding: " + encoding);
        }
        if (val.length === 1) {
          var code = val.charCodeAt(0);
          if (encoding === "utf8" && code < 128 || encoding === "latin1") {
            val = code;
          }
        }
      } else if (typeof val === "number") {
        val = val & 255;
      } else if (typeof val === "boolean") {
        val = Number(val);
      }
      if (start < 0 || this.length < start || this.length < end) {
        throw new RangeError("Out of range index");
      }
      if (end <= start) {
        return this;
      }
      start = start >>> 0;
      end = end === void 0 ? this.length : end >>> 0;
      if (!val) val = 0;
      var i3;
      if (typeof val === "number") {
        for (i3 = start; i3 < end; ++i3) {
          this[i3] = val;
        }
      } else {
        var bytes = Buffer2.isBuffer(val) ? val : Buffer2.from(val, encoding);
        var len = bytes.length;
        if (len === 0) {
          throw new TypeError('The value "' + val + '" is invalid for argument "value"');
        }
        for (i3 = 0; i3 < end - start; ++i3) {
          this[i3 + start] = bytes[i3 % len];
        }
      }
      return this;
    };
    var INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g;
    function base64clean(str) {
      str = str.split("=")[0];
      str = str.trim().replace(INVALID_BASE64_RE, "");
      if (str.length < 2) return "";
      while (str.length % 4 !== 0) {
        str = str + "=";
      }
      return str;
    }
    function utf8ToBytes2(string, units) {
      units = units || Infinity;
      var codePoint;
      var length = string.length;
      var leadSurrogate = null;
      var bytes = [];
      for (var i3 = 0; i3 < length; ++i3) {
        codePoint = string.charCodeAt(i3);
        if (codePoint > 55295 && codePoint < 57344) {
          if (!leadSurrogate) {
            if (codePoint > 56319) {
              if ((units -= 3) > -1) bytes.push(239, 191, 189);
              continue;
            } else if (i3 + 1 === length) {
              if ((units -= 3) > -1) bytes.push(239, 191, 189);
              continue;
            }
            leadSurrogate = codePoint;
            continue;
          }
          if (codePoint < 56320) {
            if ((units -= 3) > -1) bytes.push(239, 191, 189);
            leadSurrogate = codePoint;
            continue;
          }
          codePoint = (leadSurrogate - 55296 << 10 | codePoint - 56320) + 65536;
        } else if (leadSurrogate) {
          if ((units -= 3) > -1) bytes.push(239, 191, 189);
        }
        leadSurrogate = null;
        if (codePoint < 128) {
          if ((units -= 1) < 0) break;
          bytes.push(codePoint);
        } else if (codePoint < 2048) {
          if ((units -= 2) < 0) break;
          bytes.push(
            codePoint >> 6 | 192,
            codePoint & 63 | 128
          );
        } else if (codePoint < 65536) {
          if ((units -= 3) < 0) break;
          bytes.push(
            codePoint >> 12 | 224,
            codePoint >> 6 & 63 | 128,
            codePoint & 63 | 128
          );
        } else if (codePoint < 1114112) {
          if ((units -= 4) < 0) break;
          bytes.push(
            codePoint >> 18 | 240,
            codePoint >> 12 & 63 | 128,
            codePoint >> 6 & 63 | 128,
            codePoint & 63 | 128
          );
        } else {
          throw new Error("Invalid code point");
        }
      }
      return bytes;
    }
    function asciiToBytes(str) {
      var byteArray = [];
      for (var i3 = 0; i3 < str.length; ++i3) {
        byteArray.push(str.charCodeAt(i3) & 255);
      }
      return byteArray;
    }
    function utf16leToBytes(str, units) {
      var c, hi, lo;
      var byteArray = [];
      for (var i3 = 0; i3 < str.length; ++i3) {
        if ((units -= 2) < 0) break;
        c = str.charCodeAt(i3);
        hi = c >> 8;
        lo = c % 256;
        byteArray.push(lo);
        byteArray.push(hi);
      }
      return byteArray;
    }
    function base64ToBytes(str) {
      return base64.toByteArray(base64clean(str));
    }
    function blitBuffer(src2, dst, offset, length) {
      for (var i3 = 0; i3 < length; ++i3) {
        if (i3 + offset >= dst.length || i3 >= src2.length) break;
        dst[i3 + offset] = src2[i3];
      }
      return i3;
    }
    function isInstance(obj, type) {
      return obj instanceof type || obj != null && obj.constructor != null && obj.constructor.name != null && obj.constructor.name === type.name;
    }
    function numberIsNaN(obj) {
      return obj !== obj;
    }
    var hexSliceLookupTable = function() {
      var alphabet2 = "0123456789abcdef";
      var table = new Array(256);
      for (var i3 = 0; i3 < 16; ++i3) {
        var i16 = i3 * 16;
        for (var j2 = 0; j2 < 16; ++j2) {
          table[i16 + j2] = alphabet2[i3] + alphabet2[j2];
        }
      }
      return table;
    }();
  })(buffer);
  return buffer;
}
var bignumber$1 = { exports: {} };
var bignumber = bignumber$1.exports;
var hasRequiredBignumber;
function requireBignumber() {
  if (hasRequiredBignumber) return bignumber$1.exports;
  hasRequiredBignumber = 1;
  (function(module) {
    (function(globalObject) {
      var BigNumber, isNumeric = /^-?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i, mathceil = Math.ceil, mathfloor = Math.floor, bignumberError = "[BigNumber Error] ", tooManyDigits = bignumberError + "Number primitive has more than 15 significant digits: ", BASE = 1e14, LOG_BASE = 14, MAX_SAFE_INTEGER = 9007199254740991, POWS_TEN = [1, 10, 100, 1e3, 1e4, 1e5, 1e6, 1e7, 1e8, 1e9, 1e10, 1e11, 1e12, 1e13], SQRT_BASE = 1e7, MAX = 1e9;
      function clone(configObject) {
        var div, convertBase, parseNumeric, P2 = BigNumber2.prototype = { constructor: BigNumber2, toString: null, valueOf: null }, ONE = new BigNumber2(1), DECIMAL_PLACES = 20, ROUNDING_MODE = 4, TO_EXP_NEG = -7, TO_EXP_POS = 21, MIN_EXP = -1e7, MAX_EXP = 1e7, CRYPTO = false, MODULO_MODE = 1, POW_PRECISION = 0, FORMAT = {
          prefix: "",
          groupSize: 3,
          secondaryGroupSize: 0,
          groupSeparator: ",",
          decimalSeparator: ".",
          fractionGroupSize: 0,
          fractionGroupSeparator: " ",
          // non-breaking space
          suffix: ""
        }, ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyz", alphabetHasNormalDecimalDigits = true;
        function BigNumber2(v3, b2) {
          var alphabet2, c, caseChanged, e5, i3, isNum, len, str, x2 = this;
          if (!(x2 instanceof BigNumber2)) return new BigNumber2(v3, b2);
          if (b2 == null) {
            if (v3 && v3._isBigNumber === true) {
              x2.s = v3.s;
              if (!v3.c || v3.e > MAX_EXP) {
                x2.c = x2.e = null;
              } else if (v3.e < MIN_EXP) {
                x2.c = [x2.e = 0];
              } else {
                x2.e = v3.e;
                x2.c = v3.c.slice();
              }
              return;
            }
            if ((isNum = typeof v3 == "number") && v3 * 0 == 0) {
              x2.s = 1 / v3 < 0 ? (v3 = -v3, -1) : 1;
              if (v3 === ~~v3) {
                for (e5 = 0, i3 = v3; i3 >= 10; i3 /= 10, e5++) ;
                if (e5 > MAX_EXP) {
                  x2.c = x2.e = null;
                } else {
                  x2.e = e5;
                  x2.c = [v3];
                }
                return;
              }
              str = String(v3);
            } else {
              if (!isNumeric.test(str = String(v3))) return parseNumeric(x2, str, isNum);
              x2.s = str.charCodeAt(0) == 45 ? (str = str.slice(1), -1) : 1;
            }
            if ((e5 = str.indexOf(".")) > -1) str = str.replace(".", "");
            if ((i3 = str.search(/e/i)) > 0) {
              if (e5 < 0) e5 = i3;
              e5 += +str.slice(i3 + 1);
              str = str.substring(0, i3);
            } else if (e5 < 0) {
              e5 = str.length;
            }
          } else {
            intCheck(b2, 2, ALPHABET.length, "Base");
            if (b2 == 10 && alphabetHasNormalDecimalDigits) {
              x2 = new BigNumber2(v3);
              return round(x2, DECIMAL_PLACES + x2.e + 1, ROUNDING_MODE);
            }
            str = String(v3);
            if (isNum = typeof v3 == "number") {
              if (v3 * 0 != 0) return parseNumeric(x2, str, isNum, b2);
              x2.s = 1 / v3 < 0 ? (str = str.slice(1), -1) : 1;
              if (BigNumber2.DEBUG && str.replace(/^0\.0*|\./, "").length > 15) {
                throw Error(tooManyDigits + v3);
              }
            } else {
              x2.s = str.charCodeAt(0) === 45 ? (str = str.slice(1), -1) : 1;
            }
            alphabet2 = ALPHABET.slice(0, b2);
            e5 = i3 = 0;
            for (len = str.length; i3 < len; i3++) {
              if (alphabet2.indexOf(c = str.charAt(i3)) < 0) {
                if (c == ".") {
                  if (i3 > e5) {
                    e5 = len;
                    continue;
                  }
                } else if (!caseChanged) {
                  if (str == str.toUpperCase() && (str = str.toLowerCase()) || str == str.toLowerCase() && (str = str.toUpperCase())) {
                    caseChanged = true;
                    i3 = -1;
                    e5 = 0;
                    continue;
                  }
                }
                return parseNumeric(x2, String(v3), isNum, b2);
              }
            }
            isNum = false;
            str = convertBase(str, b2, 10, x2.s);
            if ((e5 = str.indexOf(".")) > -1) str = str.replace(".", "");
            else e5 = str.length;
          }
          for (i3 = 0; str.charCodeAt(i3) === 48; i3++) ;
          for (len = str.length; str.charCodeAt(--len) === 48; ) ;
          if (str = str.slice(i3, ++len)) {
            len -= i3;
            if (isNum && BigNumber2.DEBUG && len > 15 && (v3 > MAX_SAFE_INTEGER || v3 !== mathfloor(v3))) {
              throw Error(tooManyDigits + x2.s * v3);
            }
            if ((e5 = e5 - i3 - 1) > MAX_EXP) {
              x2.c = x2.e = null;
            } else if (e5 < MIN_EXP) {
              x2.c = [x2.e = 0];
            } else {
              x2.e = e5;
              x2.c = [];
              i3 = (e5 + 1) % LOG_BASE;
              if (e5 < 0) i3 += LOG_BASE;
              if (i3 < len) {
                if (i3) x2.c.push(+str.slice(0, i3));
                for (len -= LOG_BASE; i3 < len; ) {
                  x2.c.push(+str.slice(i3, i3 += LOG_BASE));
                }
                i3 = LOG_BASE - (str = str.slice(i3)).length;
              } else {
                i3 -= len;
              }
              for (; i3--; str += "0") ;
              x2.c.push(+str);
            }
          } else {
            x2.c = [x2.e = 0];
          }
        }
        BigNumber2.clone = clone;
        BigNumber2.ROUND_UP = 0;
        BigNumber2.ROUND_DOWN = 1;
        BigNumber2.ROUND_CEIL = 2;
        BigNumber2.ROUND_FLOOR = 3;
        BigNumber2.ROUND_HALF_UP = 4;
        BigNumber2.ROUND_HALF_DOWN = 5;
        BigNumber2.ROUND_HALF_EVEN = 6;
        BigNumber2.ROUND_HALF_CEIL = 7;
        BigNumber2.ROUND_HALF_FLOOR = 8;
        BigNumber2.EUCLID = 9;
        BigNumber2.config = BigNumber2.set = function(obj) {
          var p, v3;
          if (obj != null) {
            if (typeof obj == "object") {
              if (obj.hasOwnProperty(p = "DECIMAL_PLACES")) {
                v3 = obj[p];
                intCheck(v3, 0, MAX, p);
                DECIMAL_PLACES = v3;
              }
              if (obj.hasOwnProperty(p = "ROUNDING_MODE")) {
                v3 = obj[p];
                intCheck(v3, 0, 8, p);
                ROUNDING_MODE = v3;
              }
              if (obj.hasOwnProperty(p = "EXPONENTIAL_AT")) {
                v3 = obj[p];
                if (v3 && v3.pop) {
                  intCheck(v3[0], -MAX, 0, p);
                  intCheck(v3[1], 0, MAX, p);
                  TO_EXP_NEG = v3[0];
                  TO_EXP_POS = v3[1];
                } else {
                  intCheck(v3, -MAX, MAX, p);
                  TO_EXP_NEG = -(TO_EXP_POS = v3 < 0 ? -v3 : v3);
                }
              }
              if (obj.hasOwnProperty(p = "RANGE")) {
                v3 = obj[p];
                if (v3 && v3.pop) {
                  intCheck(v3[0], -MAX, -1, p);
                  intCheck(v3[1], 1, MAX, p);
                  MIN_EXP = v3[0];
                  MAX_EXP = v3[1];
                } else {
                  intCheck(v3, -MAX, MAX, p);
                  if (v3) {
                    MIN_EXP = -(MAX_EXP = v3 < 0 ? -v3 : v3);
                  } else {
                    throw Error(bignumberError + p + " cannot be zero: " + v3);
                  }
                }
              }
              if (obj.hasOwnProperty(p = "CRYPTO")) {
                v3 = obj[p];
                if (v3 === !!v3) {
                  if (v3) {
                    if (typeof crypto != "undefined" && crypto && (crypto.getRandomValues || crypto.randomBytes)) {
                      CRYPTO = v3;
                    } else {
                      CRYPTO = !v3;
                      throw Error(bignumberError + "crypto unavailable");
                    }
                  } else {
                    CRYPTO = v3;
                  }
                } else {
                  throw Error(bignumberError + p + " not true or false: " + v3);
                }
              }
              if (obj.hasOwnProperty(p = "MODULO_MODE")) {
                v3 = obj[p];
                intCheck(v3, 0, 9, p);
                MODULO_MODE = v3;
              }
              if (obj.hasOwnProperty(p = "POW_PRECISION")) {
                v3 = obj[p];
                intCheck(v3, 0, MAX, p);
                POW_PRECISION = v3;
              }
              if (obj.hasOwnProperty(p = "FORMAT")) {
                v3 = obj[p];
                if (typeof v3 == "object") FORMAT = v3;
                else throw Error(bignumberError + p + " not an object: " + v3);
              }
              if (obj.hasOwnProperty(p = "ALPHABET")) {
                v3 = obj[p];
                if (typeof v3 == "string" && !/^.?$|[+\-.\s]|(.).*\1/.test(v3)) {
                  alphabetHasNormalDecimalDigits = v3.slice(0, 10) == "0123456789";
                  ALPHABET = v3;
                } else {
                  throw Error(bignumberError + p + " invalid: " + v3);
                }
              }
            } else {
              throw Error(bignumberError + "Object expected: " + obj);
            }
          }
          return {
            DECIMAL_PLACES,
            ROUNDING_MODE,
            EXPONENTIAL_AT: [TO_EXP_NEG, TO_EXP_POS],
            RANGE: [MIN_EXP, MAX_EXP],
            CRYPTO,
            MODULO_MODE,
            POW_PRECISION,
            FORMAT,
            ALPHABET
          };
        };
        BigNumber2.isBigNumber = function(v3) {
          if (!v3 || v3._isBigNumber !== true) return false;
          if (!BigNumber2.DEBUG) return true;
          var i3, n2, c = v3.c, e5 = v3.e, s2 = v3.s;
          out: if ({}.toString.call(c) == "[object Array]") {
            if ((s2 === 1 || s2 === -1) && e5 >= -MAX && e5 <= MAX && e5 === mathfloor(e5)) {
              if (c[0] === 0) {
                if (e5 === 0 && c.length === 1) return true;
                break out;
              }
              i3 = (e5 + 1) % LOG_BASE;
              if (i3 < 1) i3 += LOG_BASE;
              if (String(c[0]).length == i3) {
                for (i3 = 0; i3 < c.length; i3++) {
                  n2 = c[i3];
                  if (n2 < 0 || n2 >= BASE || n2 !== mathfloor(n2)) break out;
                }
                if (n2 !== 0) return true;
              }
            }
          } else if (c === null && e5 === null && (s2 === null || s2 === 1 || s2 === -1)) {
            return true;
          }
          throw Error(bignumberError + "Invalid BigNumber: " + v3);
        };
        BigNumber2.maximum = BigNumber2.max = function() {
          return maxOrMin(arguments, -1);
        };
        BigNumber2.minimum = BigNumber2.min = function() {
          return maxOrMin(arguments, 1);
        };
        BigNumber2.random = function() {
          var pow2_53 = 9007199254740992;
          var random53bitInt = Math.random() * pow2_53 & 2097151 ? function() {
            return mathfloor(Math.random() * pow2_53);
          } : function() {
            return (Math.random() * 1073741824 | 0) * 8388608 + (Math.random() * 8388608 | 0);
          };
          return function(dp) {
            var a, b2, e5, k2, v3, i3 = 0, c = [], rand = new BigNumber2(ONE);
            if (dp == null) dp = DECIMAL_PLACES;
            else intCheck(dp, 0, MAX);
            k2 = mathceil(dp / LOG_BASE);
            if (CRYPTO) {
              if (crypto.getRandomValues) {
                a = crypto.getRandomValues(new Uint32Array(k2 *= 2));
                for (; i3 < k2; ) {
                  v3 = a[i3] * 131072 + (a[i3 + 1] >>> 11);
                  if (v3 >= 9e15) {
                    b2 = crypto.getRandomValues(new Uint32Array(2));
                    a[i3] = b2[0];
                    a[i3 + 1] = b2[1];
                  } else {
                    c.push(v3 % 1e14);
                    i3 += 2;
                  }
                }
                i3 = k2 / 2;
              } else if (crypto.randomBytes) {
                a = crypto.randomBytes(k2 *= 7);
                for (; i3 < k2; ) {
                  v3 = (a[i3] & 31) * 281474976710656 + a[i3 + 1] * 1099511627776 + a[i3 + 2] * 4294967296 + a[i3 + 3] * 16777216 + (a[i3 + 4] << 16) + (a[i3 + 5] << 8) + a[i3 + 6];
                  if (v3 >= 9e15) {
                    crypto.randomBytes(7).copy(a, i3);
                  } else {
                    c.push(v3 % 1e14);
                    i3 += 7;
                  }
                }
                i3 = k2 / 7;
              } else {
                CRYPTO = false;
                throw Error(bignumberError + "crypto unavailable");
              }
            }
            if (!CRYPTO) {
              for (; i3 < k2; ) {
                v3 = random53bitInt();
                if (v3 < 9e15) c[i3++] = v3 % 1e14;
              }
            }
            k2 = c[--i3];
            dp %= LOG_BASE;
            if (k2 && dp) {
              v3 = POWS_TEN[LOG_BASE - dp];
              c[i3] = mathfloor(k2 / v3) * v3;
            }
            for (; c[i3] === 0; c.pop(), i3--) ;
            if (i3 < 0) {
              c = [e5 = 0];
            } else {
              for (e5 = -1; c[0] === 0; c.splice(0, 1), e5 -= LOG_BASE) ;
              for (i3 = 1, v3 = c[0]; v3 >= 10; v3 /= 10, i3++) ;
              if (i3 < LOG_BASE) e5 -= LOG_BASE - i3;
            }
            rand.e = e5;
            rand.c = c;
            return rand;
          };
        }();
        BigNumber2.sum = function() {
          var i3 = 1, args = arguments, sum = new BigNumber2(args[0]);
          for (; i3 < args.length; ) sum = sum.plus(args[i3++]);
          return sum;
        };
        convertBase = /* @__PURE__ */ function() {
          var decimal = "0123456789";
          function toBaseOut(str, baseIn, baseOut, alphabet2) {
            var j2, arr = [0], arrL, i3 = 0, len = str.length;
            for (; i3 < len; ) {
              for (arrL = arr.length; arrL--; arr[arrL] *= baseIn) ;
              arr[0] += alphabet2.indexOf(str.charAt(i3++));
              for (j2 = 0; j2 < arr.length; j2++) {
                if (arr[j2] > baseOut - 1) {
                  if (arr[j2 + 1] == null) arr[j2 + 1] = 0;
                  arr[j2 + 1] += arr[j2] / baseOut | 0;
                  arr[j2] %= baseOut;
                }
              }
            }
            return arr.reverse();
          }
          return function(str, baseIn, baseOut, sign, callerIsToString) {
            var alphabet2, d2, e5, k2, r2, x2, xc, y, i3 = str.indexOf("."), dp = DECIMAL_PLACES, rm = ROUNDING_MODE;
            if (i3 >= 0) {
              k2 = POW_PRECISION;
              POW_PRECISION = 0;
              str = str.replace(".", "");
              y = new BigNumber2(baseIn);
              x2 = y.pow(str.length - i3);
              POW_PRECISION = k2;
              y.c = toBaseOut(
                toFixedPoint(coeffToString(x2.c), x2.e, "0"),
                10,
                baseOut,
                decimal
              );
              y.e = y.c.length;
            }
            xc = toBaseOut(str, baseIn, baseOut, callerIsToString ? (alphabet2 = ALPHABET, decimal) : (alphabet2 = decimal, ALPHABET));
            e5 = k2 = xc.length;
            for (; xc[--k2] == 0; xc.pop()) ;
            if (!xc[0]) return alphabet2.charAt(0);
            if (i3 < 0) {
              --e5;
            } else {
              x2.c = xc;
              x2.e = e5;
              x2.s = sign;
              x2 = div(x2, y, dp, rm, baseOut);
              xc = x2.c;
              r2 = x2.r;
              e5 = x2.e;
            }
            d2 = e5 + dp + 1;
            i3 = xc[d2];
            k2 = baseOut / 2;
            r2 = r2 || d2 < 0 || xc[d2 + 1] != null;
            r2 = rm < 4 ? (i3 != null || r2) && (rm == 0 || rm == (x2.s < 0 ? 3 : 2)) : i3 > k2 || i3 == k2 && (rm == 4 || r2 || rm == 6 && xc[d2 - 1] & 1 || rm == (x2.s < 0 ? 8 : 7));
            if (d2 < 1 || !xc[0]) {
              str = r2 ? toFixedPoint(alphabet2.charAt(1), -dp, alphabet2.charAt(0)) : alphabet2.charAt(0);
            } else {
              xc.length = d2;
              if (r2) {
                for (--baseOut; ++xc[--d2] > baseOut; ) {
                  xc[d2] = 0;
                  if (!d2) {
                    ++e5;
                    xc = [1].concat(xc);
                  }
                }
              }
              for (k2 = xc.length; !xc[--k2]; ) ;
              for (i3 = 0, str = ""; i3 <= k2; str += alphabet2.charAt(xc[i3++])) ;
              str = toFixedPoint(str, e5, alphabet2.charAt(0));
            }
            return str;
          };
        }();
        div = /* @__PURE__ */ function() {
          function multiply(x2, k2, base) {
            var m2, temp, xlo, xhi, carry = 0, i3 = x2.length, klo = k2 % SQRT_BASE, khi = k2 / SQRT_BASE | 0;
            for (x2 = x2.slice(); i3--; ) {
              xlo = x2[i3] % SQRT_BASE;
              xhi = x2[i3] / SQRT_BASE | 0;
              m2 = khi * xlo + xhi * klo;
              temp = klo * xlo + m2 % SQRT_BASE * SQRT_BASE + carry;
              carry = (temp / base | 0) + (m2 / SQRT_BASE | 0) + khi * xhi;
              x2[i3] = temp % base;
            }
            if (carry) x2 = [carry].concat(x2);
            return x2;
          }
          function compare22(a, b2, aL, bL) {
            var i3, cmp;
            if (aL != bL) {
              cmp = aL > bL ? 1 : -1;
            } else {
              for (i3 = cmp = 0; i3 < aL; i3++) {
                if (a[i3] != b2[i3]) {
                  cmp = a[i3] > b2[i3] ? 1 : -1;
                  break;
                }
              }
            }
            return cmp;
          }
          function subtract(a, b2, aL, base) {
            var i3 = 0;
            for (; aL--; ) {
              a[aL] -= i3;
              i3 = a[aL] < b2[aL] ? 1 : 0;
              a[aL] = i3 * base + a[aL] - b2[aL];
            }
            for (; !a[0] && a.length > 1; a.splice(0, 1)) ;
          }
          return function(x2, y, dp, rm, base) {
            var cmp, e5, i3, more, n2, prod, prodL, q, qc, rem, remL, rem0, xi, xL, yc0, yL, yz, s2 = x2.s == y.s ? 1 : -1, xc = x2.c, yc = y.c;
            if (!xc || !xc[0] || !yc || !yc[0]) {
              return new BigNumber2(
                // Return NaN if either NaN, or both Infinity or 0.
                !x2.s || !y.s || (xc ? yc && xc[0] == yc[0] : !yc) ? NaN : (
                  // Return ±0 if x is ±0 or y is ±Infinity, or return ±Infinity as y is ±0.
                  xc && xc[0] == 0 || !yc ? s2 * 0 : s2 / 0
                )
              );
            }
            q = new BigNumber2(s2);
            qc = q.c = [];
            e5 = x2.e - y.e;
            s2 = dp + e5 + 1;
            if (!base) {
              base = BASE;
              e5 = bitFloor(x2.e / LOG_BASE) - bitFloor(y.e / LOG_BASE);
              s2 = s2 / LOG_BASE | 0;
            }
            for (i3 = 0; yc[i3] == (xc[i3] || 0); i3++) ;
            if (yc[i3] > (xc[i3] || 0)) e5--;
            if (s2 < 0) {
              qc.push(1);
              more = true;
            } else {
              xL = xc.length;
              yL = yc.length;
              i3 = 0;
              s2 += 2;
              n2 = mathfloor(base / (yc[0] + 1));
              if (n2 > 1) {
                yc = multiply(yc, n2, base);
                xc = multiply(xc, n2, base);
                yL = yc.length;
                xL = xc.length;
              }
              xi = yL;
              rem = xc.slice(0, yL);
              remL = rem.length;
              for (; remL < yL; rem[remL++] = 0) ;
              yz = yc.slice();
              yz = [0].concat(yz);
              yc0 = yc[0];
              if (yc[1] >= base / 2) yc0++;
              do {
                n2 = 0;
                cmp = compare22(yc, rem, yL, remL);
                if (cmp < 0) {
                  rem0 = rem[0];
                  if (yL != remL) rem0 = rem0 * base + (rem[1] || 0);
                  n2 = mathfloor(rem0 / yc0);
                  if (n2 > 1) {
                    if (n2 >= base) n2 = base - 1;
                    prod = multiply(yc, n2, base);
                    prodL = prod.length;
                    remL = rem.length;
                    while (compare22(prod, rem, prodL, remL) == 1) {
                      n2--;
                      subtract(prod, yL < prodL ? yz : yc, prodL, base);
                      prodL = prod.length;
                      cmp = 1;
                    }
                  } else {
                    if (n2 == 0) {
                      cmp = n2 = 1;
                    }
                    prod = yc.slice();
                    prodL = prod.length;
                  }
                  if (prodL < remL) prod = [0].concat(prod);
                  subtract(rem, prod, remL, base);
                  remL = rem.length;
                  if (cmp == -1) {
                    while (compare22(yc, rem, yL, remL) < 1) {
                      n2++;
                      subtract(rem, yL < remL ? yz : yc, remL, base);
                      remL = rem.length;
                    }
                  }
                } else if (cmp === 0) {
                  n2++;
                  rem = [0];
                }
                qc[i3++] = n2;
                if (rem[0]) {
                  rem[remL++] = xc[xi] || 0;
                } else {
                  rem = [xc[xi]];
                  remL = 1;
                }
              } while ((xi++ < xL || rem[0] != null) && s2--);
              more = rem[0] != null;
              if (!qc[0]) qc.splice(0, 1);
            }
            if (base == BASE) {
              for (i3 = 1, s2 = qc[0]; s2 >= 10; s2 /= 10, i3++) ;
              round(q, dp + (q.e = i3 + e5 * LOG_BASE - 1) + 1, rm, more);
            } else {
              q.e = e5;
              q.r = +more;
            }
            return q;
          };
        }();
        function format(n2, i3, rm, id) {
          var c0, e5, ne, len, str;
          if (rm == null) rm = ROUNDING_MODE;
          else intCheck(rm, 0, 8);
          if (!n2.c) return n2.toString();
          c0 = n2.c[0];
          ne = n2.e;
          if (i3 == null) {
            str = coeffToString(n2.c);
            str = id == 1 || id == 2 && (ne <= TO_EXP_NEG || ne >= TO_EXP_POS) ? toExponential(str, ne) : toFixedPoint(str, ne, "0");
          } else {
            n2 = round(new BigNumber2(n2), i3, rm);
            e5 = n2.e;
            str = coeffToString(n2.c);
            len = str.length;
            if (id == 1 || id == 2 && (i3 <= e5 || e5 <= TO_EXP_NEG)) {
              for (; len < i3; str += "0", len++) ;
              str = toExponential(str, e5);
            } else {
              i3 -= ne + (id === 2 && e5 > ne);
              str = toFixedPoint(str, e5, "0");
              if (e5 + 1 > len) {
                if (--i3 > 0) for (str += "."; i3--; str += "0") ;
              } else {
                i3 += e5 - len;
                if (i3 > 0) {
                  if (e5 + 1 == len) str += ".";
                  for (; i3--; str += "0") ;
                }
              }
            }
          }
          return n2.s < 0 && c0 ? "-" + str : str;
        }
        function maxOrMin(args, n2) {
          var k2, y, i3 = 1, x2 = new BigNumber2(args[0]);
          for (; i3 < args.length; i3++) {
            y = new BigNumber2(args[i3]);
            if (!y.s || (k2 = compare2(x2, y)) === n2 || k2 === 0 && x2.s === n2) {
              x2 = y;
            }
          }
          return x2;
        }
        function normalise(n2, c, e5) {
          var i3 = 1, j2 = c.length;
          for (; !c[--j2]; c.pop()) ;
          for (j2 = c[0]; j2 >= 10; j2 /= 10, i3++) ;
          if ((e5 = i3 + e5 * LOG_BASE - 1) > MAX_EXP) {
            n2.c = n2.e = null;
          } else if (e5 < MIN_EXP) {
            n2.c = [n2.e = 0];
          } else {
            n2.e = e5;
            n2.c = c;
          }
          return n2;
        }
        parseNumeric = /* @__PURE__ */ function() {
          var basePrefix = /^(-?)0([xbo])(?=\w[\w.]*$)/i, dotAfter = /^([^.]+)\.$/, dotBefore = /^\.([^.]+)$/, isInfinityOrNaN = /^-?(Infinity|NaN)$/, whitespaceOrPlus = /^\s*\+(?=[\w.])|^\s+|\s+$/g;
          return function(x2, str, isNum, b2) {
            var base, s2 = isNum ? str : str.replace(whitespaceOrPlus, "");
            if (isInfinityOrNaN.test(s2)) {
              x2.s = isNaN(s2) ? null : s2 < 0 ? -1 : 1;
            } else {
              if (!isNum) {
                s2 = s2.replace(basePrefix, function(m2, p1, p2) {
                  base = (p2 = p2.toLowerCase()) == "x" ? 16 : p2 == "b" ? 2 : 8;
                  return !b2 || b2 == base ? p1 : m2;
                });
                if (b2) {
                  base = b2;
                  s2 = s2.replace(dotAfter, "$1").replace(dotBefore, "0.$1");
                }
                if (str != s2) return new BigNumber2(s2, base);
              }
              if (BigNumber2.DEBUG) {
                throw Error(bignumberError + "Not a" + (b2 ? " base " + b2 : "") + " number: " + str);
              }
              x2.s = null;
            }
            x2.c = x2.e = null;
          };
        }();
        function round(x2, sd, rm, r2) {
          var d2, i3, j2, k2, n2, ni, rd, xc = x2.c, pows10 = POWS_TEN;
          if (xc) {
            out: {
              for (d2 = 1, k2 = xc[0]; k2 >= 10; k2 /= 10, d2++) ;
              i3 = sd - d2;
              if (i3 < 0) {
                i3 += LOG_BASE;
                j2 = sd;
                n2 = xc[ni = 0];
                rd = mathfloor(n2 / pows10[d2 - j2 - 1] % 10);
              } else {
                ni = mathceil((i3 + 1) / LOG_BASE);
                if (ni >= xc.length) {
                  if (r2) {
                    for (; xc.length <= ni; xc.push(0)) ;
                    n2 = rd = 0;
                    d2 = 1;
                    i3 %= LOG_BASE;
                    j2 = i3 - LOG_BASE + 1;
                  } else {
                    break out;
                  }
                } else {
                  n2 = k2 = xc[ni];
                  for (d2 = 1; k2 >= 10; k2 /= 10, d2++) ;
                  i3 %= LOG_BASE;
                  j2 = i3 - LOG_BASE + d2;
                  rd = j2 < 0 ? 0 : mathfloor(n2 / pows10[d2 - j2 - 1] % 10);
                }
              }
              r2 = r2 || sd < 0 || // Are there any non-zero digits after the rounding digit?
              // The expression  n % pows10[d - j - 1]  returns all digits of n to the right
              // of the digit at j, e.g. if n is 908714 and j is 2, the expression gives 714.
              xc[ni + 1] != null || (j2 < 0 ? n2 : n2 % pows10[d2 - j2 - 1]);
              r2 = rm < 4 ? (rd || r2) && (rm == 0 || rm == (x2.s < 0 ? 3 : 2)) : rd > 5 || rd == 5 && (rm == 4 || r2 || rm == 6 && // Check whether the digit to the left of the rounding digit is odd.
              (i3 > 0 ? j2 > 0 ? n2 / pows10[d2 - j2] : 0 : xc[ni - 1]) % 10 & 1 || rm == (x2.s < 0 ? 8 : 7));
              if (sd < 1 || !xc[0]) {
                xc.length = 0;
                if (r2) {
                  sd -= x2.e + 1;
                  xc[0] = pows10[(LOG_BASE - sd % LOG_BASE) % LOG_BASE];
                  x2.e = -sd || 0;
                } else {
                  xc[0] = x2.e = 0;
                }
                return x2;
              }
              if (i3 == 0) {
                xc.length = ni;
                k2 = 1;
                ni--;
              } else {
                xc.length = ni + 1;
                k2 = pows10[LOG_BASE - i3];
                xc[ni] = j2 > 0 ? mathfloor(n2 / pows10[d2 - j2] % pows10[j2]) * k2 : 0;
              }
              if (r2) {
                for (; ; ) {
                  if (ni == 0) {
                    for (i3 = 1, j2 = xc[0]; j2 >= 10; j2 /= 10, i3++) ;
                    j2 = xc[0] += k2;
                    for (k2 = 1; j2 >= 10; j2 /= 10, k2++) ;
                    if (i3 != k2) {
                      x2.e++;
                      if (xc[0] == BASE) xc[0] = 1;
                    }
                    break;
                  } else {
                    xc[ni] += k2;
                    if (xc[ni] != BASE) break;
                    xc[ni--] = 0;
                    k2 = 1;
                  }
                }
              }
              for (i3 = xc.length; xc[--i3] === 0; xc.pop()) ;
            }
            if (x2.e > MAX_EXP) {
              x2.c = x2.e = null;
            } else if (x2.e < MIN_EXP) {
              x2.c = [x2.e = 0];
            }
          }
          return x2;
        }
        function valueOf(n2) {
          var str, e5 = n2.e;
          if (e5 === null) return n2.toString();
          str = coeffToString(n2.c);
          str = e5 <= TO_EXP_NEG || e5 >= TO_EXP_POS ? toExponential(str, e5) : toFixedPoint(str, e5, "0");
          return n2.s < 0 ? "-" + str : str;
        }
        P2.absoluteValue = P2.abs = function() {
          var x2 = new BigNumber2(this);
          if (x2.s < 0) x2.s = 1;
          return x2;
        };
        P2.comparedTo = function(y, b2) {
          return compare2(this, new BigNumber2(y, b2));
        };
        P2.decimalPlaces = P2.dp = function(dp, rm) {
          var c, n2, v3, x2 = this;
          if (dp != null) {
            intCheck(dp, 0, MAX);
            if (rm == null) rm = ROUNDING_MODE;
            else intCheck(rm, 0, 8);
            return round(new BigNumber2(x2), dp + x2.e + 1, rm);
          }
          if (!(c = x2.c)) return null;
          n2 = ((v3 = c.length - 1) - bitFloor(this.e / LOG_BASE)) * LOG_BASE;
          if (v3 = c[v3]) for (; v3 % 10 == 0; v3 /= 10, n2--) ;
          if (n2 < 0) n2 = 0;
          return n2;
        };
        P2.dividedBy = P2.div = function(y, b2) {
          return div(this, new BigNumber2(y, b2), DECIMAL_PLACES, ROUNDING_MODE);
        };
        P2.dividedToIntegerBy = P2.idiv = function(y, b2) {
          return div(this, new BigNumber2(y, b2), 0, 1);
        };
        P2.exponentiatedBy = P2.pow = function(n2, m2) {
          var half, isModExp, i3, k2, more, nIsBig, nIsNeg, nIsOdd, y, x2 = this;
          n2 = new BigNumber2(n2);
          if (n2.c && !n2.isInteger()) {
            throw Error(bignumberError + "Exponent not an integer: " + valueOf(n2));
          }
          if (m2 != null) m2 = new BigNumber2(m2);
          nIsBig = n2.e > 14;
          if (!x2.c || !x2.c[0] || x2.c[0] == 1 && !x2.e && x2.c.length == 1 || !n2.c || !n2.c[0]) {
            y = new BigNumber2(Math.pow(+valueOf(x2), nIsBig ? n2.s * (2 - isOdd(n2)) : +valueOf(n2)));
            return m2 ? y.mod(m2) : y;
          }
          nIsNeg = n2.s < 0;
          if (m2) {
            if (m2.c ? !m2.c[0] : !m2.s) return new BigNumber2(NaN);
            isModExp = !nIsNeg && x2.isInteger() && m2.isInteger();
            if (isModExp) x2 = x2.mod(m2);
          } else if (n2.e > 9 && (x2.e > 0 || x2.e < -1 || (x2.e == 0 ? x2.c[0] > 1 || nIsBig && x2.c[1] >= 24e7 : x2.c[0] < 8e13 || nIsBig && x2.c[0] <= 9999975e7))) {
            k2 = x2.s < 0 && isOdd(n2) ? -0 : 0;
            if (x2.e > -1) k2 = 1 / k2;
            return new BigNumber2(nIsNeg ? 1 / k2 : k2);
          } else if (POW_PRECISION) {
            k2 = mathceil(POW_PRECISION / LOG_BASE + 2);
          }
          if (nIsBig) {
            half = new BigNumber2(0.5);
            if (nIsNeg) n2.s = 1;
            nIsOdd = isOdd(n2);
          } else {
            i3 = Math.abs(+valueOf(n2));
            nIsOdd = i3 % 2;
          }
          y = new BigNumber2(ONE);
          for (; ; ) {
            if (nIsOdd) {
              y = y.times(x2);
              if (!y.c) break;
              if (k2) {
                if (y.c.length > k2) y.c.length = k2;
              } else if (isModExp) {
                y = y.mod(m2);
              }
            }
            if (i3) {
              i3 = mathfloor(i3 / 2);
              if (i3 === 0) break;
              nIsOdd = i3 % 2;
            } else {
              n2 = n2.times(half);
              round(n2, n2.e + 1, 1);
              if (n2.e > 14) {
                nIsOdd = isOdd(n2);
              } else {
                i3 = +valueOf(n2);
                if (i3 === 0) break;
                nIsOdd = i3 % 2;
              }
            }
            x2 = x2.times(x2);
            if (k2) {
              if (x2.c && x2.c.length > k2) x2.c.length = k2;
            } else if (isModExp) {
              x2 = x2.mod(m2);
            }
          }
          if (isModExp) return y;
          if (nIsNeg) y = ONE.div(y);
          return m2 ? y.mod(m2) : k2 ? round(y, POW_PRECISION, ROUNDING_MODE, more) : y;
        };
        P2.integerValue = function(rm) {
          var n2 = new BigNumber2(this);
          if (rm == null) rm = ROUNDING_MODE;
          else intCheck(rm, 0, 8);
          return round(n2, n2.e + 1, rm);
        };
        P2.isEqualTo = P2.eq = function(y, b2) {
          return compare2(this, new BigNumber2(y, b2)) === 0;
        };
        P2.isFinite = function() {
          return !!this.c;
        };
        P2.isGreaterThan = P2.gt = function(y, b2) {
          return compare2(this, new BigNumber2(y, b2)) > 0;
        };
        P2.isGreaterThanOrEqualTo = P2.gte = function(y, b2) {
          return (b2 = compare2(this, new BigNumber2(y, b2))) === 1 || b2 === 0;
        };
        P2.isInteger = function() {
          return !!this.c && bitFloor(this.e / LOG_BASE) > this.c.length - 2;
        };
        P2.isLessThan = P2.lt = function(y, b2) {
          return compare2(this, new BigNumber2(y, b2)) < 0;
        };
        P2.isLessThanOrEqualTo = P2.lte = function(y, b2) {
          return (b2 = compare2(this, new BigNumber2(y, b2))) === -1 || b2 === 0;
        };
        P2.isNaN = function() {
          return !this.s;
        };
        P2.isNegative = function() {
          return this.s < 0;
        };
        P2.isPositive = function() {
          return this.s > 0;
        };
        P2.isZero = function() {
          return !!this.c && this.c[0] == 0;
        };
        P2.minus = function(y, b2) {
          var i3, j2, t3, xLTy, x2 = this, a = x2.s;
          y = new BigNumber2(y, b2);
          b2 = y.s;
          if (!a || !b2) return new BigNumber2(NaN);
          if (a != b2) {
            y.s = -b2;
            return x2.plus(y);
          }
          var xe2 = x2.e / LOG_BASE, ye2 = y.e / LOG_BASE, xc = x2.c, yc = y.c;
          if (!xe2 || !ye2) {
            if (!xc || !yc) return xc ? (y.s = -b2, y) : new BigNumber2(yc ? x2 : NaN);
            if (!xc[0] || !yc[0]) {
              return yc[0] ? (y.s = -b2, y) : new BigNumber2(xc[0] ? x2 : (
                // IEEE 754 (2008) 6.3: n - n = -0 when rounding to -Infinity
                ROUNDING_MODE == 3 ? -0 : 0
              ));
            }
          }
          xe2 = bitFloor(xe2);
          ye2 = bitFloor(ye2);
          xc = xc.slice();
          if (a = xe2 - ye2) {
            if (xLTy = a < 0) {
              a = -a;
              t3 = xc;
            } else {
              ye2 = xe2;
              t3 = yc;
            }
            t3.reverse();
            for (b2 = a; b2--; t3.push(0)) ;
            t3.reverse();
          } else {
            j2 = (xLTy = (a = xc.length) < (b2 = yc.length)) ? a : b2;
            for (a = b2 = 0; b2 < j2; b2++) {
              if (xc[b2] != yc[b2]) {
                xLTy = xc[b2] < yc[b2];
                break;
              }
            }
          }
          if (xLTy) {
            t3 = xc;
            xc = yc;
            yc = t3;
            y.s = -y.s;
          }
          b2 = (j2 = yc.length) - (i3 = xc.length);
          if (b2 > 0) for (; b2--; xc[i3++] = 0) ;
          b2 = BASE - 1;
          for (; j2 > a; ) {
            if (xc[--j2] < yc[j2]) {
              for (i3 = j2; i3 && !xc[--i3]; xc[i3] = b2) ;
              --xc[i3];
              xc[j2] += BASE;
            }
            xc[j2] -= yc[j2];
          }
          for (; xc[0] == 0; xc.splice(0, 1), --ye2) ;
          if (!xc[0]) {
            y.s = ROUNDING_MODE == 3 ? -1 : 1;
            y.c = [y.e = 0];
            return y;
          }
          return normalise(y, xc, ye2);
        };
        P2.modulo = P2.mod = function(y, b2) {
          var q, s2, x2 = this;
          y = new BigNumber2(y, b2);
          if (!x2.c || !y.s || y.c && !y.c[0]) {
            return new BigNumber2(NaN);
          } else if (!y.c || x2.c && !x2.c[0]) {
            return new BigNumber2(x2);
          }
          if (MODULO_MODE == 9) {
            s2 = y.s;
            y.s = 1;
            q = div(x2, y, 0, 3);
            y.s = s2;
            q.s *= s2;
          } else {
            q = div(x2, y, 0, MODULO_MODE);
          }
          y = x2.minus(q.times(y));
          if (!y.c[0] && MODULO_MODE == 1) y.s = x2.s;
          return y;
        };
        P2.multipliedBy = P2.times = function(y, b2) {
          var c, e5, i3, j2, k2, m2, xcL, xlo, xhi, ycL, ylo, yhi, zc, base, sqrtBase, x2 = this, xc = x2.c, yc = (y = new BigNumber2(y, b2)).c;
          if (!xc || !yc || !xc[0] || !yc[0]) {
            if (!x2.s || !y.s || xc && !xc[0] && !yc || yc && !yc[0] && !xc) {
              y.c = y.e = y.s = null;
            } else {
              y.s *= x2.s;
              if (!xc || !yc) {
                y.c = y.e = null;
              } else {
                y.c = [0];
                y.e = 0;
              }
            }
            return y;
          }
          e5 = bitFloor(x2.e / LOG_BASE) + bitFloor(y.e / LOG_BASE);
          y.s *= x2.s;
          xcL = xc.length;
          ycL = yc.length;
          if (xcL < ycL) {
            zc = xc;
            xc = yc;
            yc = zc;
            i3 = xcL;
            xcL = ycL;
            ycL = i3;
          }
          for (i3 = xcL + ycL, zc = []; i3--; zc.push(0)) ;
          base = BASE;
          sqrtBase = SQRT_BASE;
          for (i3 = ycL; --i3 >= 0; ) {
            c = 0;
            ylo = yc[i3] % sqrtBase;
            yhi = yc[i3] / sqrtBase | 0;
            for (k2 = xcL, j2 = i3 + k2; j2 > i3; ) {
              xlo = xc[--k2] % sqrtBase;
              xhi = xc[k2] / sqrtBase | 0;
              m2 = yhi * xlo + xhi * ylo;
              xlo = ylo * xlo + m2 % sqrtBase * sqrtBase + zc[j2] + c;
              c = (xlo / base | 0) + (m2 / sqrtBase | 0) + yhi * xhi;
              zc[j2--] = xlo % base;
            }
            zc[j2] = c;
          }
          if (c) {
            ++e5;
          } else {
            zc.splice(0, 1);
          }
          return normalise(y, zc, e5);
        };
        P2.negated = function() {
          var x2 = new BigNumber2(this);
          x2.s = -x2.s || null;
          return x2;
        };
        P2.plus = function(y, b2) {
          var t3, x2 = this, a = x2.s;
          y = new BigNumber2(y, b2);
          b2 = y.s;
          if (!a || !b2) return new BigNumber2(NaN);
          if (a != b2) {
            y.s = -b2;
            return x2.minus(y);
          }
          var xe2 = x2.e / LOG_BASE, ye2 = y.e / LOG_BASE, xc = x2.c, yc = y.c;
          if (!xe2 || !ye2) {
            if (!xc || !yc) return new BigNumber2(a / 0);
            if (!xc[0] || !yc[0]) return yc[0] ? y : new BigNumber2(xc[0] ? x2 : a * 0);
          }
          xe2 = bitFloor(xe2);
          ye2 = bitFloor(ye2);
          xc = xc.slice();
          if (a = xe2 - ye2) {
            if (a > 0) {
              ye2 = xe2;
              t3 = yc;
            } else {
              a = -a;
              t3 = xc;
            }
            t3.reverse();
            for (; a--; t3.push(0)) ;
            t3.reverse();
          }
          a = xc.length;
          b2 = yc.length;
          if (a - b2 < 0) {
            t3 = yc;
            yc = xc;
            xc = t3;
            b2 = a;
          }
          for (a = 0; b2; ) {
            a = (xc[--b2] = xc[b2] + yc[b2] + a) / BASE | 0;
            xc[b2] = BASE === xc[b2] ? 0 : xc[b2] % BASE;
          }
          if (a) {
            xc = [a].concat(xc);
            ++ye2;
          }
          return normalise(y, xc, ye2);
        };
        P2.precision = P2.sd = function(sd, rm) {
          var c, n2, v3, x2 = this;
          if (sd != null && sd !== !!sd) {
            intCheck(sd, 1, MAX);
            if (rm == null) rm = ROUNDING_MODE;
            else intCheck(rm, 0, 8);
            return round(new BigNumber2(x2), sd, rm);
          }
          if (!(c = x2.c)) return null;
          v3 = c.length - 1;
          n2 = v3 * LOG_BASE + 1;
          if (v3 = c[v3]) {
            for (; v3 % 10 == 0; v3 /= 10, n2--) ;
            for (v3 = c[0]; v3 >= 10; v3 /= 10, n2++) ;
          }
          if (sd && x2.e + 1 > n2) n2 = x2.e + 1;
          return n2;
        };
        P2.shiftedBy = function(k2) {
          intCheck(k2, -MAX_SAFE_INTEGER, MAX_SAFE_INTEGER);
          return this.times("1e" + k2);
        };
        P2.squareRoot = P2.sqrt = function() {
          var m2, n2, r2, rep, t3, x2 = this, c = x2.c, s2 = x2.s, e5 = x2.e, dp = DECIMAL_PLACES + 4, half = new BigNumber2("0.5");
          if (s2 !== 1 || !c || !c[0]) {
            return new BigNumber2(!s2 || s2 < 0 && (!c || c[0]) ? NaN : c ? x2 : 1 / 0);
          }
          s2 = Math.sqrt(+valueOf(x2));
          if (s2 == 0 || s2 == 1 / 0) {
            n2 = coeffToString(c);
            if ((n2.length + e5) % 2 == 0) n2 += "0";
            s2 = Math.sqrt(+n2);
            e5 = bitFloor((e5 + 1) / 2) - (e5 < 0 || e5 % 2);
            if (s2 == 1 / 0) {
              n2 = "5e" + e5;
            } else {
              n2 = s2.toExponential();
              n2 = n2.slice(0, n2.indexOf("e") + 1) + e5;
            }
            r2 = new BigNumber2(n2);
          } else {
            r2 = new BigNumber2(s2 + "");
          }
          if (r2.c[0]) {
            e5 = r2.e;
            s2 = e5 + dp;
            if (s2 < 3) s2 = 0;
            for (; ; ) {
              t3 = r2;
              r2 = half.times(t3.plus(div(x2, t3, dp, 1)));
              if (coeffToString(t3.c).slice(0, s2) === (n2 = coeffToString(r2.c)).slice(0, s2)) {
                if (r2.e < e5) --s2;
                n2 = n2.slice(s2 - 3, s2 + 1);
                if (n2 == "9999" || !rep && n2 == "4999") {
                  if (!rep) {
                    round(t3, t3.e + DECIMAL_PLACES + 2, 0);
                    if (t3.times(t3).eq(x2)) {
                      r2 = t3;
                      break;
                    }
                  }
                  dp += 4;
                  s2 += 4;
                  rep = 1;
                } else {
                  if (!+n2 || !+n2.slice(1) && n2.charAt(0) == "5") {
                    round(r2, r2.e + DECIMAL_PLACES + 2, 1);
                    m2 = !r2.times(r2).eq(x2);
                  }
                  break;
                }
              }
            }
          }
          return round(r2, r2.e + DECIMAL_PLACES + 1, ROUNDING_MODE, m2);
        };
        P2.toExponential = function(dp, rm) {
          if (dp != null) {
            intCheck(dp, 0, MAX);
            dp++;
          }
          return format(this, dp, rm, 1);
        };
        P2.toFixed = function(dp, rm) {
          if (dp != null) {
            intCheck(dp, 0, MAX);
            dp = dp + this.e + 1;
          }
          return format(this, dp, rm);
        };
        P2.toFormat = function(dp, rm, format2) {
          var str, x2 = this;
          if (format2 == null) {
            if (dp != null && rm && typeof rm == "object") {
              format2 = rm;
              rm = null;
            } else if (dp && typeof dp == "object") {
              format2 = dp;
              dp = rm = null;
            } else {
              format2 = FORMAT;
            }
          } else if (typeof format2 != "object") {
            throw Error(bignumberError + "Argument not an object: " + format2);
          }
          str = x2.toFixed(dp, rm);
          if (x2.c) {
            var i3, arr = str.split("."), g1 = +format2.groupSize, g2 = +format2.secondaryGroupSize, groupSeparator = format2.groupSeparator || "", intPart = arr[0], fractionPart = arr[1], isNeg = x2.s < 0, intDigits = isNeg ? intPart.slice(1) : intPart, len = intDigits.length;
            if (g2) {
              i3 = g1;
              g1 = g2;
              g2 = i3;
              len -= i3;
            }
            if (g1 > 0 && len > 0) {
              i3 = len % g1 || g1;
              intPart = intDigits.substr(0, i3);
              for (; i3 < len; i3 += g1) intPart += groupSeparator + intDigits.substr(i3, g1);
              if (g2 > 0) intPart += groupSeparator + intDigits.slice(i3);
              if (isNeg) intPart = "-" + intPart;
            }
            str = fractionPart ? intPart + (format2.decimalSeparator || "") + ((g2 = +format2.fractionGroupSize) ? fractionPart.replace(
              new RegExp("\\d{" + g2 + "}\\B", "g"),
              "$&" + (format2.fractionGroupSeparator || "")
            ) : fractionPart) : intPart;
          }
          return (format2.prefix || "") + str + (format2.suffix || "");
        };
        P2.toFraction = function(md) {
          var d2, d0, d1, d22, e5, exp, n2, n0, n1, q, r2, s2, x2 = this, xc = x2.c;
          if (md != null) {
            n2 = new BigNumber2(md);
            if (!n2.isInteger() && (n2.c || n2.s !== 1) || n2.lt(ONE)) {
              throw Error(bignumberError + "Argument " + (n2.isInteger() ? "out of range: " : "not an integer: ") + valueOf(n2));
            }
          }
          if (!xc) return new BigNumber2(x2);
          d2 = new BigNumber2(ONE);
          n1 = d0 = new BigNumber2(ONE);
          d1 = n0 = new BigNumber2(ONE);
          s2 = coeffToString(xc);
          e5 = d2.e = s2.length - x2.e - 1;
          d2.c[0] = POWS_TEN[(exp = e5 % LOG_BASE) < 0 ? LOG_BASE + exp : exp];
          md = !md || n2.comparedTo(d2) > 0 ? e5 > 0 ? d2 : n1 : n2;
          exp = MAX_EXP;
          MAX_EXP = 1 / 0;
          n2 = new BigNumber2(s2);
          n0.c[0] = 0;
          for (; ; ) {
            q = div(n2, d2, 0, 1);
            d22 = d0.plus(q.times(d1));
            if (d22.comparedTo(md) == 1) break;
            d0 = d1;
            d1 = d22;
            n1 = n0.plus(q.times(d22 = n1));
            n0 = d22;
            d2 = n2.minus(q.times(d22 = d2));
            n2 = d22;
          }
          d22 = div(md.minus(d0), d1, 0, 1);
          n0 = n0.plus(d22.times(n1));
          d0 = d0.plus(d22.times(d1));
          n0.s = n1.s = x2.s;
          e5 = e5 * 2;
          r2 = div(n1, d1, e5, ROUNDING_MODE).minus(x2).abs().comparedTo(
            div(n0, d0, e5, ROUNDING_MODE).minus(x2).abs()
          ) < 1 ? [n1, d1] : [n0, d0];
          MAX_EXP = exp;
          return r2;
        };
        P2.toNumber = function() {
          return +valueOf(this);
        };
        P2.toPrecision = function(sd, rm) {
          if (sd != null) intCheck(sd, 1, MAX);
          return format(this, sd, rm, 2);
        };
        P2.toString = function(b2) {
          var str, n2 = this, s2 = n2.s, e5 = n2.e;
          if (e5 === null) {
            if (s2) {
              str = "Infinity";
              if (s2 < 0) str = "-" + str;
            } else {
              str = "NaN";
            }
          } else {
            if (b2 == null) {
              str = e5 <= TO_EXP_NEG || e5 >= TO_EXP_POS ? toExponential(coeffToString(n2.c), e5) : toFixedPoint(coeffToString(n2.c), e5, "0");
            } else if (b2 === 10 && alphabetHasNormalDecimalDigits) {
              n2 = round(new BigNumber2(n2), DECIMAL_PLACES + e5 + 1, ROUNDING_MODE);
              str = toFixedPoint(coeffToString(n2.c), n2.e, "0");
            } else {
              intCheck(b2, 2, ALPHABET.length, "Base");
              str = convertBase(toFixedPoint(coeffToString(n2.c), e5, "0"), 10, b2, s2, true);
            }
            if (s2 < 0 && n2.c[0]) str = "-" + str;
          }
          return str;
        };
        P2.valueOf = P2.toJSON = function() {
          return valueOf(this);
        };
        P2._isBigNumber = true;
        if (configObject != null) BigNumber2.set(configObject);
        return BigNumber2;
      }
      function bitFloor(n2) {
        var i3 = n2 | 0;
        return n2 > 0 || n2 === i3 ? i3 : i3 - 1;
      }
      function coeffToString(a) {
        var s2, z2, i3 = 1, j2 = a.length, r2 = a[0] + "";
        for (; i3 < j2; ) {
          s2 = a[i3++] + "";
          z2 = LOG_BASE - s2.length;
          for (; z2--; s2 = "0" + s2) ;
          r2 += s2;
        }
        for (j2 = r2.length; r2.charCodeAt(--j2) === 48; ) ;
        return r2.slice(0, j2 + 1 || 1);
      }
      function compare2(x2, y) {
        var a, b2, xc = x2.c, yc = y.c, i3 = x2.s, j2 = y.s, k2 = x2.e, l = y.e;
        if (!i3 || !j2) return null;
        a = xc && !xc[0];
        b2 = yc && !yc[0];
        if (a || b2) return a ? b2 ? 0 : -j2 : i3;
        if (i3 != j2) return i3;
        a = i3 < 0;
        b2 = k2 == l;
        if (!xc || !yc) return b2 ? 0 : !xc ^ a ? 1 : -1;
        if (!b2) return k2 > l ^ a ? 1 : -1;
        j2 = (k2 = xc.length) < (l = yc.length) ? k2 : l;
        for (i3 = 0; i3 < j2; i3++) if (xc[i3] != yc[i3]) return xc[i3] > yc[i3] ^ a ? 1 : -1;
        return k2 == l ? 0 : k2 > l ^ a ? 1 : -1;
      }
      function intCheck(n2, min, max, name) {
        if (n2 < min || n2 > max || n2 !== mathfloor(n2)) {
          throw Error(bignumberError + (name || "Argument") + (typeof n2 == "number" ? n2 < min || n2 > max ? " out of range: " : " not an integer: " : " not a primitive number: ") + String(n2));
        }
      }
      function isOdd(n2) {
        var k2 = n2.c.length - 1;
        return bitFloor(n2.e / LOG_BASE) == k2 && n2.c[k2] % 2 != 0;
      }
      function toExponential(str, e5) {
        return (str.length > 1 ? str.charAt(0) + "." + str.slice(1) : str) + (e5 < 0 ? "e" : "e+") + e5;
      }
      function toFixedPoint(str, e5, z2) {
        var len, zs;
        if (e5 < 0) {
          for (zs = z2 + "."; ++e5; zs += z2) ;
          str = zs + str;
        } else {
          len = str.length;
          if (++e5 > len) {
            for (zs = z2, e5 -= len; --e5; zs += z2) ;
            str += zs;
          } else if (e5 < len) {
            str = str.slice(0, e5) + "." + str.slice(e5);
          }
        }
        return str;
      }
      BigNumber = clone();
      BigNumber["default"] = BigNumber.BigNumber = BigNumber;
      if (module.exports) {
        module.exports = BigNumber;
      } else {
        if (!globalObject) {
          globalObject = typeof self != "undefined" && self ? self : window;
        }
        globalObject.BigNumber = BigNumber;
      }
    })(bignumber);
  })(bignumber$1);
  return bignumber$1.exports;
}
var decoder_asm;
var hasRequiredDecoder_asm;
function requireDecoder_asm() {
  if (hasRequiredDecoder_asm) return decoder_asm;
  hasRequiredDecoder_asm = 1;
  decoder_asm = function decodeAsm(stdlib, foreign, buffer2) {
    ;
    var heap = new stdlib.Uint8Array(buffer2);
    var pushInt = foreign.pushInt;
    var pushInt32 = foreign.pushInt32;
    var pushInt32Neg = foreign.pushInt32Neg;
    var pushInt64 = foreign.pushInt64;
    var pushInt64Neg = foreign.pushInt64Neg;
    var pushFloat = foreign.pushFloat;
    var pushFloatSingle = foreign.pushFloatSingle;
    var pushFloatDouble = foreign.pushFloatDouble;
    var pushTrue = foreign.pushTrue;
    var pushFalse = foreign.pushFalse;
    var pushUndefined = foreign.pushUndefined;
    var pushNull = foreign.pushNull;
    var pushInfinity = foreign.pushInfinity;
    var pushInfinityNeg = foreign.pushInfinityNeg;
    var pushNaN = foreign.pushNaN;
    var pushNaNNeg = foreign.pushNaNNeg;
    var pushArrayStart = foreign.pushArrayStart;
    var pushArrayStartFixed = foreign.pushArrayStartFixed;
    var pushArrayStartFixed32 = foreign.pushArrayStartFixed32;
    var pushArrayStartFixed64 = foreign.pushArrayStartFixed64;
    var pushObjectStart = foreign.pushObjectStart;
    var pushObjectStartFixed = foreign.pushObjectStartFixed;
    var pushObjectStartFixed32 = foreign.pushObjectStartFixed32;
    var pushObjectStartFixed64 = foreign.pushObjectStartFixed64;
    var pushByteString = foreign.pushByteString;
    var pushByteStringStart = foreign.pushByteStringStart;
    var pushUtf8String = foreign.pushUtf8String;
    var pushUtf8StringStart = foreign.pushUtf8StringStart;
    var pushSimpleUnassigned = foreign.pushSimpleUnassigned;
    var pushTagStart = foreign.pushTagStart;
    var pushTagStart4 = foreign.pushTagStart4;
    var pushTagStart8 = foreign.pushTagStart8;
    var pushTagUnassigned = foreign.pushTagUnassigned;
    var pushBreak = foreign.pushBreak;
    var pow = stdlib.Math.pow;
    var offset = 0;
    var inputLength = 0;
    var code = 0;
    function parse(input) {
      input = input | 0;
      offset = 0;
      inputLength = input;
      while ((offset | 0) < (inputLength | 0)) {
        code = jumpTable[heap[offset] & 255](heap[offset] | 0) | 0;
        if ((code | 0) > 0) {
          break;
        }
      }
      return code | 0;
    }
    function checkOffset(n2) {
      n2 = n2 | 0;
      if (((offset | 0) + (n2 | 0) | 0) < (inputLength | 0)) {
        return 0;
      }
      return 1;
    }
    function readUInt16(n2) {
      n2 = n2 | 0;
      return heap[n2 | 0] << 8 | heap[n2 + 1 | 0] | 0;
    }
    function readUInt32(n2) {
      n2 = n2 | 0;
      return heap[n2 | 0] << 24 | heap[n2 + 1 | 0] << 16 | heap[n2 + 2 | 0] << 8 | heap[n2 + 3 | 0] | 0;
    }
    function INT_P(octet) {
      octet = octet | 0;
      pushInt(octet | 0);
      offset = offset + 1 | 0;
      return 0;
    }
    function UINT_P_8(octet) {
      octet = octet | 0;
      if (checkOffset(1) | 0) {
        return 1;
      }
      pushInt(heap[offset + 1 | 0] | 0);
      offset = offset + 2 | 0;
      return 0;
    }
    function UINT_P_16(octet) {
      octet = octet | 0;
      if (checkOffset(2) | 0) {
        return 1;
      }
      pushInt(
        readUInt16(offset + 1 | 0) | 0
      );
      offset = offset + 3 | 0;
      return 0;
    }
    function UINT_P_32(octet) {
      octet = octet | 0;
      if (checkOffset(4) | 0) {
        return 1;
      }
      pushInt32(
        readUInt16(offset + 1 | 0) | 0,
        readUInt16(offset + 3 | 0) | 0
      );
      offset = offset + 5 | 0;
      return 0;
    }
    function UINT_P_64(octet) {
      octet = octet | 0;
      if (checkOffset(8) | 0) {
        return 1;
      }
      pushInt64(
        readUInt16(offset + 1 | 0) | 0,
        readUInt16(offset + 3 | 0) | 0,
        readUInt16(offset + 5 | 0) | 0,
        readUInt16(offset + 7 | 0) | 0
      );
      offset = offset + 9 | 0;
      return 0;
    }
    function INT_N(octet) {
      octet = octet | 0;
      pushInt(-1 - (octet - 32 | 0) | 0);
      offset = offset + 1 | 0;
      return 0;
    }
    function UINT_N_8(octet) {
      octet = octet | 0;
      if (checkOffset(1) | 0) {
        return 1;
      }
      pushInt(
        -1 - (heap[offset + 1 | 0] | 0) | 0
      );
      offset = offset + 2 | 0;
      return 0;
    }
    function UINT_N_16(octet) {
      octet = octet | 0;
      var val = 0;
      if (checkOffset(2) | 0) {
        return 1;
      }
      val = readUInt16(offset + 1 | 0) | 0;
      pushInt(-1 - (val | 0) | 0);
      offset = offset + 3 | 0;
      return 0;
    }
    function UINT_N_32(octet) {
      octet = octet | 0;
      if (checkOffset(4) | 0) {
        return 1;
      }
      pushInt32Neg(
        readUInt16(offset + 1 | 0) | 0,
        readUInt16(offset + 3 | 0) | 0
      );
      offset = offset + 5 | 0;
      return 0;
    }
    function UINT_N_64(octet) {
      octet = octet | 0;
      if (checkOffset(8) | 0) {
        return 1;
      }
      pushInt64Neg(
        readUInt16(offset + 1 | 0) | 0,
        readUInt16(offset + 3 | 0) | 0,
        readUInt16(offset + 5 | 0) | 0,
        readUInt16(offset + 7 | 0) | 0
      );
      offset = offset + 9 | 0;
      return 0;
    }
    function BYTE_STRING(octet) {
      octet = octet | 0;
      var start = 0;
      var end = 0;
      var step = 0;
      step = octet - 64 | 0;
      if (checkOffset(step | 0) | 0) {
        return 1;
      }
      start = offset + 1 | 0;
      end = (offset + 1 | 0) + (step | 0) | 0;
      pushByteString(start | 0, end | 0);
      offset = end | 0;
      return 0;
    }
    function BYTE_STRING_8(octet) {
      octet = octet | 0;
      var start = 0;
      var end = 0;
      var length = 0;
      if (checkOffset(1) | 0) {
        return 1;
      }
      length = heap[offset + 1 | 0] | 0;
      start = offset + 2 | 0;
      end = (offset + 2 | 0) + (length | 0) | 0;
      if (checkOffset(length + 1 | 0) | 0) {
        return 1;
      }
      pushByteString(start | 0, end | 0);
      offset = end | 0;
      return 0;
    }
    function BYTE_STRING_16(octet) {
      octet = octet | 0;
      var start = 0;
      var end = 0;
      var length = 0;
      if (checkOffset(2) | 0) {
        return 1;
      }
      length = readUInt16(offset + 1 | 0) | 0;
      start = offset + 3 | 0;
      end = (offset + 3 | 0) + (length | 0) | 0;
      if (checkOffset(length + 2 | 0) | 0) {
        return 1;
      }
      pushByteString(start | 0, end | 0);
      offset = end | 0;
      return 0;
    }
    function BYTE_STRING_32(octet) {
      octet = octet | 0;
      var start = 0;
      var end = 0;
      var length = 0;
      if (checkOffset(4) | 0) {
        return 1;
      }
      length = readUInt32(offset + 1 | 0) | 0;
      start = offset + 5 | 0;
      end = (offset + 5 | 0) + (length | 0) | 0;
      if (checkOffset(length + 4 | 0) | 0) {
        return 1;
      }
      pushByteString(start | 0, end | 0);
      offset = end | 0;
      return 0;
    }
    function BYTE_STRING_64(octet) {
      octet = octet | 0;
      return 1;
    }
    function BYTE_STRING_BREAK(octet) {
      octet = octet | 0;
      pushByteStringStart();
      offset = offset + 1 | 0;
      return 0;
    }
    function UTF8_STRING(octet) {
      octet = octet | 0;
      var start = 0;
      var end = 0;
      var step = 0;
      step = octet - 96 | 0;
      if (checkOffset(step | 0) | 0) {
        return 1;
      }
      start = offset + 1 | 0;
      end = (offset + 1 | 0) + (step | 0) | 0;
      pushUtf8String(start | 0, end | 0);
      offset = end | 0;
      return 0;
    }
    function UTF8_STRING_8(octet) {
      octet = octet | 0;
      var start = 0;
      var end = 0;
      var length = 0;
      if (checkOffset(1) | 0) {
        return 1;
      }
      length = heap[offset + 1 | 0] | 0;
      start = offset + 2 | 0;
      end = (offset + 2 | 0) + (length | 0) | 0;
      if (checkOffset(length + 1 | 0) | 0) {
        return 1;
      }
      pushUtf8String(start | 0, end | 0);
      offset = end | 0;
      return 0;
    }
    function UTF8_STRING_16(octet) {
      octet = octet | 0;
      var start = 0;
      var end = 0;
      var length = 0;
      if (checkOffset(2) | 0) {
        return 1;
      }
      length = readUInt16(offset + 1 | 0) | 0;
      start = offset + 3 | 0;
      end = (offset + 3 | 0) + (length | 0) | 0;
      if (checkOffset(length + 2 | 0) | 0) {
        return 1;
      }
      pushUtf8String(start | 0, end | 0);
      offset = end | 0;
      return 0;
    }
    function UTF8_STRING_32(octet) {
      octet = octet | 0;
      var start = 0;
      var end = 0;
      var length = 0;
      if (checkOffset(4) | 0) {
        return 1;
      }
      length = readUInt32(offset + 1 | 0) | 0;
      start = offset + 5 | 0;
      end = (offset + 5 | 0) + (length | 0) | 0;
      if (checkOffset(length + 4 | 0) | 0) {
        return 1;
      }
      pushUtf8String(start | 0, end | 0);
      offset = end | 0;
      return 0;
    }
    function UTF8_STRING_64(octet) {
      octet = octet | 0;
      return 1;
    }
    function UTF8_STRING_BREAK(octet) {
      octet = octet | 0;
      pushUtf8StringStart();
      offset = offset + 1 | 0;
      return 0;
    }
    function ARRAY(octet) {
      octet = octet | 0;
      pushArrayStartFixed(octet - 128 | 0);
      offset = offset + 1 | 0;
      return 0;
    }
    function ARRAY_8(octet) {
      octet = octet | 0;
      if (checkOffset(1) | 0) {
        return 1;
      }
      pushArrayStartFixed(heap[offset + 1 | 0] | 0);
      offset = offset + 2 | 0;
      return 0;
    }
    function ARRAY_16(octet) {
      octet = octet | 0;
      if (checkOffset(2) | 0) {
        return 1;
      }
      pushArrayStartFixed(
        readUInt16(offset + 1 | 0) | 0
      );
      offset = offset + 3 | 0;
      return 0;
    }
    function ARRAY_32(octet) {
      octet = octet | 0;
      if (checkOffset(4) | 0) {
        return 1;
      }
      pushArrayStartFixed32(
        readUInt16(offset + 1 | 0) | 0,
        readUInt16(offset + 3 | 0) | 0
      );
      offset = offset + 5 | 0;
      return 0;
    }
    function ARRAY_64(octet) {
      octet = octet | 0;
      if (checkOffset(8) | 0) {
        return 1;
      }
      pushArrayStartFixed64(
        readUInt16(offset + 1 | 0) | 0,
        readUInt16(offset + 3 | 0) | 0,
        readUInt16(offset + 5 | 0) | 0,
        readUInt16(offset + 7 | 0) | 0
      );
      offset = offset + 9 | 0;
      return 0;
    }
    function ARRAY_BREAK(octet) {
      octet = octet | 0;
      pushArrayStart();
      offset = offset + 1 | 0;
      return 0;
    }
    function MAP(octet) {
      octet = octet | 0;
      var step = 0;
      step = octet - 160 | 0;
      if (checkOffset(step | 0) | 0) {
        return 1;
      }
      pushObjectStartFixed(step | 0);
      offset = offset + 1 | 0;
      return 0;
    }
    function MAP_8(octet) {
      octet = octet | 0;
      if (checkOffset(1) | 0) {
        return 1;
      }
      pushObjectStartFixed(heap[offset + 1 | 0] | 0);
      offset = offset + 2 | 0;
      return 0;
    }
    function MAP_16(octet) {
      octet = octet | 0;
      if (checkOffset(2) | 0) {
        return 1;
      }
      pushObjectStartFixed(
        readUInt16(offset + 1 | 0) | 0
      );
      offset = offset + 3 | 0;
      return 0;
    }
    function MAP_32(octet) {
      octet = octet | 0;
      if (checkOffset(4) | 0) {
        return 1;
      }
      pushObjectStartFixed32(
        readUInt16(offset + 1 | 0) | 0,
        readUInt16(offset + 3 | 0) | 0
      );
      offset = offset + 5 | 0;
      return 0;
    }
    function MAP_64(octet) {
      octet = octet | 0;
      if (checkOffset(8) | 0) {
        return 1;
      }
      pushObjectStartFixed64(
        readUInt16(offset + 1 | 0) | 0,
        readUInt16(offset + 3 | 0) | 0,
        readUInt16(offset + 5 | 0) | 0,
        readUInt16(offset + 7 | 0) | 0
      );
      offset = offset + 9 | 0;
      return 0;
    }
    function MAP_BREAK(octet) {
      octet = octet | 0;
      pushObjectStart();
      offset = offset + 1 | 0;
      return 0;
    }
    function TAG_KNOWN(octet) {
      octet = octet | 0;
      pushTagStart(octet - 192 | 0 | 0);
      offset = offset + 1 | 0;
      return 0;
    }
    function TAG_BIGNUM_POS(octet) {
      octet = octet | 0;
      pushTagStart(octet | 0);
      offset = offset + 1 | 0;
      return 0;
    }
    function TAG_BIGNUM_NEG(octet) {
      octet = octet | 0;
      pushTagStart(octet | 0);
      offset = offset + 1 | 0;
      return 0;
    }
    function TAG_FRAC(octet) {
      octet = octet | 0;
      pushTagStart(octet | 0);
      offset = offset + 1 | 0;
      return 0;
    }
    function TAG_BIGNUM_FLOAT(octet) {
      octet = octet | 0;
      pushTagStart(octet | 0);
      offset = offset + 1 | 0;
      return 0;
    }
    function TAG_UNASSIGNED(octet) {
      octet = octet | 0;
      pushTagStart(octet - 192 | 0 | 0);
      offset = offset + 1 | 0;
      return 0;
    }
    function TAG_BASE64_URL(octet) {
      octet = octet | 0;
      pushTagStart(octet | 0);
      offset = offset + 1 | 0;
      return 0;
    }
    function TAG_BASE64(octet) {
      octet = octet | 0;
      pushTagStart(octet | 0);
      offset = offset + 1 | 0;
      return 0;
    }
    function TAG_BASE16(octet) {
      octet = octet | 0;
      pushTagStart(octet | 0);
      offset = offset + 1 | 0;
      return 0;
    }
    function TAG_MORE_1(octet) {
      octet = octet | 0;
      if (checkOffset(1) | 0) {
        return 1;
      }
      pushTagStart(heap[offset + 1 | 0] | 0);
      offset = offset + 2 | 0;
      return 0;
    }
    function TAG_MORE_2(octet) {
      octet = octet | 0;
      if (checkOffset(2) | 0) {
        return 1;
      }
      pushTagStart(
        readUInt16(offset + 1 | 0) | 0
      );
      offset = offset + 3 | 0;
      return 0;
    }
    function TAG_MORE_4(octet) {
      octet = octet | 0;
      if (checkOffset(4) | 0) {
        return 1;
      }
      pushTagStart4(
        readUInt16(offset + 1 | 0) | 0,
        readUInt16(offset + 3 | 0) | 0
      );
      offset = offset + 5 | 0;
      return 0;
    }
    function TAG_MORE_8(octet) {
      octet = octet | 0;
      if (checkOffset(8) | 0) {
        return 1;
      }
      pushTagStart8(
        readUInt16(offset + 1 | 0) | 0,
        readUInt16(offset + 3 | 0) | 0,
        readUInt16(offset + 5 | 0) | 0,
        readUInt16(offset + 7 | 0) | 0
      );
      offset = offset + 9 | 0;
      return 0;
    }
    function SIMPLE_UNASSIGNED(octet) {
      octet = octet | 0;
      pushSimpleUnassigned((octet | 0) - 224 | 0);
      offset = offset + 1 | 0;
      return 0;
    }
    function SIMPLE_FALSE(octet) {
      octet = octet | 0;
      pushFalse();
      offset = offset + 1 | 0;
      return 0;
    }
    function SIMPLE_TRUE(octet) {
      octet = octet | 0;
      pushTrue();
      offset = offset + 1 | 0;
      return 0;
    }
    function SIMPLE_NULL(octet) {
      octet = octet | 0;
      pushNull();
      offset = offset + 1 | 0;
      return 0;
    }
    function SIMPLE_UNDEFINED(octet) {
      octet = octet | 0;
      pushUndefined();
      offset = offset + 1 | 0;
      return 0;
    }
    function SIMPLE_BYTE(octet) {
      octet = octet | 0;
      if (checkOffset(1) | 0) {
        return 1;
      }
      pushSimpleUnassigned(heap[offset + 1 | 0] | 0);
      offset = offset + 2 | 0;
      return 0;
    }
    function SIMPLE_FLOAT_HALF(octet) {
      octet = octet | 0;
      var f2 = 0;
      var g2 = 0;
      var sign = 1;
      var exp = 0;
      var mant = 0;
      var r2 = 0;
      if (checkOffset(2) | 0) {
        return 1;
      }
      f2 = heap[offset + 1 | 0] | 0;
      g2 = heap[offset + 2 | 0] | 0;
      if ((f2 | 0) & 128) {
        sign = -1;
      }
      exp = +(((f2 | 0) & 124) >> 2);
      mant = +(((f2 | 0) & 3) << 8 | g2);
      if (+exp == 0) {
        pushFloat(+(+sign * 5960464477539063e-23 * +mant));
      } else if (+exp == 31) {
        if (+sign == 1) {
          if (+mant > 0) {
            pushNaN();
          } else {
            pushInfinity();
          }
        } else {
          if (+mant > 0) {
            pushNaNNeg();
          } else {
            pushInfinityNeg();
          }
        }
      } else {
        pushFloat(+(+sign * pow(2, +(+exp - 25)) * +(1024 + mant)));
      }
      offset = offset + 3 | 0;
      return 0;
    }
    function SIMPLE_FLOAT_SINGLE(octet) {
      octet = octet | 0;
      if (checkOffset(4) | 0) {
        return 1;
      }
      pushFloatSingle(
        heap[offset + 1 | 0] | 0,
        heap[offset + 2 | 0] | 0,
        heap[offset + 3 | 0] | 0,
        heap[offset + 4 | 0] | 0
      );
      offset = offset + 5 | 0;
      return 0;
    }
    function SIMPLE_FLOAT_DOUBLE(octet) {
      octet = octet | 0;
      if (checkOffset(8) | 0) {
        return 1;
      }
      pushFloatDouble(
        heap[offset + 1 | 0] | 0,
        heap[offset + 2 | 0] | 0,
        heap[offset + 3 | 0] | 0,
        heap[offset + 4 | 0] | 0,
        heap[offset + 5 | 0] | 0,
        heap[offset + 6 | 0] | 0,
        heap[offset + 7 | 0] | 0,
        heap[offset + 8 | 0] | 0
      );
      offset = offset + 9 | 0;
      return 0;
    }
    function ERROR(octet) {
      octet = octet | 0;
      return 1;
    }
    function BREAK(octet) {
      octet = octet | 0;
      pushBreak();
      offset = offset + 1 | 0;
      return 0;
    }
    var jumpTable = [
      // Integer 0x00..0x17 (0..23)
      INT_P,
      // 0x00
      INT_P,
      // 0x01
      INT_P,
      // 0x02
      INT_P,
      // 0x03
      INT_P,
      // 0x04
      INT_P,
      // 0x05
      INT_P,
      // 0x06
      INT_P,
      // 0x07
      INT_P,
      // 0x08
      INT_P,
      // 0x09
      INT_P,
      // 0x0A
      INT_P,
      // 0x0B
      INT_P,
      // 0x0C
      INT_P,
      // 0x0D
      INT_P,
      // 0x0E
      INT_P,
      // 0x0F
      INT_P,
      // 0x10
      INT_P,
      // 0x11
      INT_P,
      // 0x12
      INT_P,
      // 0x13
      INT_P,
      // 0x14
      INT_P,
      // 0x15
      INT_P,
      // 0x16
      INT_P,
      // 0x17
      // Unsigned integer (one-byte uint8_t follows)
      UINT_P_8,
      // 0x18
      // Unsigned integer (two-byte uint16_t follows)
      UINT_P_16,
      // 0x19
      // Unsigned integer (four-byte uint32_t follows)
      UINT_P_32,
      // 0x1a
      // Unsigned integer (eight-byte uint64_t follows)
      UINT_P_64,
      // 0x1b
      ERROR,
      // 0x1c
      ERROR,
      // 0x1d
      ERROR,
      // 0x1e
      ERROR,
      // 0x1f
      // Negative integer -1-0x00..-1-0x17 (-1..-24)
      INT_N,
      // 0x20
      INT_N,
      // 0x21
      INT_N,
      // 0x22
      INT_N,
      // 0x23
      INT_N,
      // 0x24
      INT_N,
      // 0x25
      INT_N,
      // 0x26
      INT_N,
      // 0x27
      INT_N,
      // 0x28
      INT_N,
      // 0x29
      INT_N,
      // 0x2A
      INT_N,
      // 0x2B
      INT_N,
      // 0x2C
      INT_N,
      // 0x2D
      INT_N,
      // 0x2E
      INT_N,
      // 0x2F
      INT_N,
      // 0x30
      INT_N,
      // 0x31
      INT_N,
      // 0x32
      INT_N,
      // 0x33
      INT_N,
      // 0x34
      INT_N,
      // 0x35
      INT_N,
      // 0x36
      INT_N,
      // 0x37
      // Negative integer -1-n (one-byte uint8_t for n follows)
      UINT_N_8,
      // 0x38
      // Negative integer -1-n (two-byte uint16_t for n follows)
      UINT_N_16,
      // 0x39
      // Negative integer -1-n (four-byte uint32_t for nfollows)
      UINT_N_32,
      // 0x3a
      // Negative integer -1-n (eight-byte uint64_t for n follows)
      UINT_N_64,
      // 0x3b
      ERROR,
      // 0x3c
      ERROR,
      // 0x3d
      ERROR,
      // 0x3e
      ERROR,
      // 0x3f
      // byte string (0x00..0x17 bytes follow)
      BYTE_STRING,
      // 0x40
      BYTE_STRING,
      // 0x41
      BYTE_STRING,
      // 0x42
      BYTE_STRING,
      // 0x43
      BYTE_STRING,
      // 0x44
      BYTE_STRING,
      // 0x45
      BYTE_STRING,
      // 0x46
      BYTE_STRING,
      // 0x47
      BYTE_STRING,
      // 0x48
      BYTE_STRING,
      // 0x49
      BYTE_STRING,
      // 0x4A
      BYTE_STRING,
      // 0x4B
      BYTE_STRING,
      // 0x4C
      BYTE_STRING,
      // 0x4D
      BYTE_STRING,
      // 0x4E
      BYTE_STRING,
      // 0x4F
      BYTE_STRING,
      // 0x50
      BYTE_STRING,
      // 0x51
      BYTE_STRING,
      // 0x52
      BYTE_STRING,
      // 0x53
      BYTE_STRING,
      // 0x54
      BYTE_STRING,
      // 0x55
      BYTE_STRING,
      // 0x56
      BYTE_STRING,
      // 0x57
      // byte string (one-byte uint8_t for n, and then n bytes follow)
      BYTE_STRING_8,
      // 0x58
      // byte string (two-byte uint16_t for n, and then n bytes follow)
      BYTE_STRING_16,
      // 0x59
      // byte string (four-byte uint32_t for n, and then n bytes follow)
      BYTE_STRING_32,
      // 0x5a
      // byte string (eight-byte uint64_t for n, and then n bytes follow)
      BYTE_STRING_64,
      // 0x5b
      ERROR,
      // 0x5c
      ERROR,
      // 0x5d
      ERROR,
      // 0x5e
      // byte string, byte strings follow, terminated by "break"
      BYTE_STRING_BREAK,
      // 0x5f
      // UTF-8 string (0x00..0x17 bytes follow)
      UTF8_STRING,
      // 0x60
      UTF8_STRING,
      // 0x61
      UTF8_STRING,
      // 0x62
      UTF8_STRING,
      // 0x63
      UTF8_STRING,
      // 0x64
      UTF8_STRING,
      // 0x65
      UTF8_STRING,
      // 0x66
      UTF8_STRING,
      // 0x67
      UTF8_STRING,
      // 0x68
      UTF8_STRING,
      // 0x69
      UTF8_STRING,
      // 0x6A
      UTF8_STRING,
      // 0x6B
      UTF8_STRING,
      // 0x6C
      UTF8_STRING,
      // 0x6D
      UTF8_STRING,
      // 0x6E
      UTF8_STRING,
      // 0x6F
      UTF8_STRING,
      // 0x70
      UTF8_STRING,
      // 0x71
      UTF8_STRING,
      // 0x72
      UTF8_STRING,
      // 0x73
      UTF8_STRING,
      // 0x74
      UTF8_STRING,
      // 0x75
      UTF8_STRING,
      // 0x76
      UTF8_STRING,
      // 0x77
      // UTF-8 string (one-byte uint8_t for n, and then n bytes follow)
      UTF8_STRING_8,
      // 0x78
      // UTF-8 string (two-byte uint16_t for n, and then n bytes follow)
      UTF8_STRING_16,
      // 0x79
      // UTF-8 string (four-byte uint32_t for n, and then n bytes follow)
      UTF8_STRING_32,
      // 0x7a
      // UTF-8 string (eight-byte uint64_t for n, and then n bytes follow)
      UTF8_STRING_64,
      // 0x7b
      // UTF-8 string, UTF-8 strings follow, terminated by "break"
      ERROR,
      // 0x7c
      ERROR,
      // 0x7d
      ERROR,
      // 0x7e
      UTF8_STRING_BREAK,
      // 0x7f
      // array (0x00..0x17 data items follow)
      ARRAY,
      // 0x80
      ARRAY,
      // 0x81
      ARRAY,
      // 0x82
      ARRAY,
      // 0x83
      ARRAY,
      // 0x84
      ARRAY,
      // 0x85
      ARRAY,
      // 0x86
      ARRAY,
      // 0x87
      ARRAY,
      // 0x88
      ARRAY,
      // 0x89
      ARRAY,
      // 0x8A
      ARRAY,
      // 0x8B
      ARRAY,
      // 0x8C
      ARRAY,
      // 0x8D
      ARRAY,
      // 0x8E
      ARRAY,
      // 0x8F
      ARRAY,
      // 0x90
      ARRAY,
      // 0x91
      ARRAY,
      // 0x92
      ARRAY,
      // 0x93
      ARRAY,
      // 0x94
      ARRAY,
      // 0x95
      ARRAY,
      // 0x96
      ARRAY,
      // 0x97
      // array (one-byte uint8_t fo, and then n data items follow)
      ARRAY_8,
      // 0x98
      // array (two-byte uint16_t for n, and then n data items follow)
      ARRAY_16,
      // 0x99
      // array (four-byte uint32_t for n, and then n data items follow)
      ARRAY_32,
      // 0x9a
      // array (eight-byte uint64_t for n, and then n data items follow)
      ARRAY_64,
      // 0x9b
      // array, data items follow, terminated by "break"
      ERROR,
      // 0x9c
      ERROR,
      // 0x9d
      ERROR,
      // 0x9e
      ARRAY_BREAK,
      // 0x9f
      // map (0x00..0x17 pairs of data items follow)
      MAP,
      // 0xa0
      MAP,
      // 0xa1
      MAP,
      // 0xa2
      MAP,
      // 0xa3
      MAP,
      // 0xa4
      MAP,
      // 0xa5
      MAP,
      // 0xa6
      MAP,
      // 0xa7
      MAP,
      // 0xa8
      MAP,
      // 0xa9
      MAP,
      // 0xaA
      MAP,
      // 0xaB
      MAP,
      // 0xaC
      MAP,
      // 0xaD
      MAP,
      // 0xaE
      MAP,
      // 0xaF
      MAP,
      // 0xb0
      MAP,
      // 0xb1
      MAP,
      // 0xb2
      MAP,
      // 0xb3
      MAP,
      // 0xb4
      MAP,
      // 0xb5
      MAP,
      // 0xb6
      MAP,
      // 0xb7
      // map (one-byte uint8_t for n, and then n pairs of data items follow)
      MAP_8,
      // 0xb8
      // map (two-byte uint16_t for n, and then n pairs of data items follow)
      MAP_16,
      // 0xb9
      // map (four-byte uint32_t for n, and then n pairs of data items follow)
      MAP_32,
      // 0xba
      // map (eight-byte uint64_t for n, and then n pairs of data items follow)
      MAP_64,
      // 0xbb
      ERROR,
      // 0xbc
      ERROR,
      // 0xbd
      ERROR,
      // 0xbe
      // map, pairs of data items follow, terminated by "break"
      MAP_BREAK,
      // 0xbf
      // Text-based date/time (data item follows; see Section 2.4.1)
      TAG_KNOWN,
      // 0xc0
      // Epoch-based date/time (data item follows; see Section 2.4.1)
      TAG_KNOWN,
      // 0xc1
      // Positive bignum (data item "byte string" follows)
      TAG_KNOWN,
      // 0xc2
      // Negative bignum (data item "byte string" follows)
      TAG_KNOWN,
      // 0xc3
      // Decimal Fraction (data item "array" follows; see Section 2.4.3)
      TAG_KNOWN,
      // 0xc4
      // Bigfloat (data item "array" follows; see Section 2.4.3)
      TAG_KNOWN,
      // 0xc5
      // (tagged item)
      TAG_UNASSIGNED,
      // 0xc6
      TAG_UNASSIGNED,
      // 0xc7
      TAG_UNASSIGNED,
      // 0xc8
      TAG_UNASSIGNED,
      // 0xc9
      TAG_UNASSIGNED,
      // 0xca
      TAG_UNASSIGNED,
      // 0xcb
      TAG_UNASSIGNED,
      // 0xcc
      TAG_UNASSIGNED,
      // 0xcd
      TAG_UNASSIGNED,
      // 0xce
      TAG_UNASSIGNED,
      // 0xcf
      TAG_UNASSIGNED,
      // 0xd0
      TAG_UNASSIGNED,
      // 0xd1
      TAG_UNASSIGNED,
      // 0xd2
      TAG_UNASSIGNED,
      // 0xd3
      TAG_UNASSIGNED,
      // 0xd4
      // Expected Conversion (data item follows; see Section 2.4.4.2)
      TAG_UNASSIGNED,
      // 0xd5
      TAG_UNASSIGNED,
      // 0xd6
      TAG_UNASSIGNED,
      // 0xd7
      // (more tagged items, 1/2/4/8 bytes and then a data item follow)
      TAG_MORE_1,
      // 0xd8
      TAG_MORE_2,
      // 0xd9
      TAG_MORE_4,
      // 0xda
      TAG_MORE_8,
      // 0xdb
      ERROR,
      // 0xdc
      ERROR,
      // 0xdd
      ERROR,
      // 0xde
      ERROR,
      // 0xdf
      // (simple value)
      SIMPLE_UNASSIGNED,
      // 0xe0
      SIMPLE_UNASSIGNED,
      // 0xe1
      SIMPLE_UNASSIGNED,
      // 0xe2
      SIMPLE_UNASSIGNED,
      // 0xe3
      SIMPLE_UNASSIGNED,
      // 0xe4
      SIMPLE_UNASSIGNED,
      // 0xe5
      SIMPLE_UNASSIGNED,
      // 0xe6
      SIMPLE_UNASSIGNED,
      // 0xe7
      SIMPLE_UNASSIGNED,
      // 0xe8
      SIMPLE_UNASSIGNED,
      // 0xe9
      SIMPLE_UNASSIGNED,
      // 0xea
      SIMPLE_UNASSIGNED,
      // 0xeb
      SIMPLE_UNASSIGNED,
      // 0xec
      SIMPLE_UNASSIGNED,
      // 0xed
      SIMPLE_UNASSIGNED,
      // 0xee
      SIMPLE_UNASSIGNED,
      // 0xef
      SIMPLE_UNASSIGNED,
      // 0xf0
      SIMPLE_UNASSIGNED,
      // 0xf1
      SIMPLE_UNASSIGNED,
      // 0xf2
      SIMPLE_UNASSIGNED,
      // 0xf3
      // False
      SIMPLE_FALSE,
      // 0xf4
      // True
      SIMPLE_TRUE,
      // 0xf5
      // Null
      SIMPLE_NULL,
      // 0xf6
      // Undefined
      SIMPLE_UNDEFINED,
      // 0xf7
      // (simple value, one byte follows)
      SIMPLE_BYTE,
      // 0xf8
      // Half-Precision Float (two-byte IEEE 754)
      SIMPLE_FLOAT_HALF,
      // 0xf9
      // Single-Precision Float (four-byte IEEE 754)
      SIMPLE_FLOAT_SINGLE,
      // 0xfa
      // Double-Precision Float (eight-byte IEEE 754)
      SIMPLE_FLOAT_DOUBLE,
      // 0xfb
      ERROR,
      // 0xfc
      ERROR,
      // 0xfd
      ERROR,
      // 0xfe
      // "break" stop code
      BREAK
      // 0xff
    ];
    return {
      parse
    };
  };
  return decoder_asm;
}
var utils = {};
var constants = {};
var hasRequiredConstants;
function requireConstants() {
  if (hasRequiredConstants) return constants;
  hasRequiredConstants = 1;
  const Bignumber = requireBignumber().BigNumber;
  constants.MT = {
    POS_INT: 0,
    NEG_INT: 1,
    BYTE_STRING: 2,
    UTF8_STRING: 3,
    ARRAY: 4,
    MAP: 5,
    TAG: 6,
    SIMPLE_FLOAT: 7
  };
  constants.TAG = {
    DATE_STRING: 0,
    DATE_EPOCH: 1,
    POS_BIGINT: 2,
    NEG_BIGINT: 3,
    DECIMAL_FRAC: 4,
    BIGFLOAT: 5,
    BASE64URL_EXPECTED: 21,
    BASE64_EXPECTED: 22,
    BASE16_EXPECTED: 23,
    CBOR: 24,
    URI: 32,
    BASE64URL: 33,
    BASE64: 34,
    REGEXP: 35,
    MIME: 36
  };
  constants.NUMBYTES = {
    ZERO: 0,
    ONE: 24,
    TWO: 25,
    FOUR: 26,
    EIGHT: 27,
    INDEFINITE: 31
  };
  constants.SIMPLE = {
    FALSE: 20,
    TRUE: 21,
    NULL: 22,
    UNDEFINED: 23
  };
  constants.SYMS = {
    NULL: Symbol("null"),
    UNDEFINED: Symbol("undef"),
    PARENT: Symbol("parent"),
    BREAK: Symbol("break"),
    STREAM: Symbol("stream")
  };
  constants.SHIFT32 = Math.pow(2, 32);
  constants.SHIFT16 = Math.pow(2, 16);
  constants.MAX_SAFE_HIGH = 2097151;
  constants.NEG_ONE = new Bignumber(-1);
  constants.TEN = new Bignumber(10);
  constants.TWO = new Bignumber(2);
  constants.PARENT = {
    ARRAY: 0,
    OBJECT: 1,
    MAP: 2,
    TAG: 3,
    BYTE_STRING: 4,
    UTF8_STRING: 5
  };
  return constants;
}
var hasRequiredUtils;
function requireUtils() {
  if (hasRequiredUtils) return utils;
  hasRequiredUtils = 1;
  (function(exports) {
    const { Buffer: Buffer2 } = requireBuffer();
    const Bignumber = requireBignumber().BigNumber;
    const constants2 = requireConstants();
    const SHIFT32 = constants2.SHIFT32;
    const SHIFT16 = constants2.SHIFT16;
    const MAX_SAFE_HIGH = 2097151;
    exports.parseHalf = function parseHalf(buf) {
      var exp, mant, sign;
      sign = buf[0] & 128 ? -1 : 1;
      exp = (buf[0] & 124) >> 2;
      mant = (buf[0] & 3) << 8 | buf[1];
      if (!exp) {
        return sign * 5960464477539063e-23 * mant;
      } else if (exp === 31) {
        return sign * (mant ? 0 / 0 : Infinity);
      } else {
        return sign * Math.pow(2, exp - 25) * (1024 + mant);
      }
    };
    function toHex2(n2) {
      if (n2 < 16) {
        return "0" + n2.toString(16);
      }
      return n2.toString(16);
    }
    exports.arrayBufferToBignumber = function(buf) {
      const len = buf.byteLength;
      let res = "";
      for (let i3 = 0; i3 < len; i3++) {
        res += toHex2(buf[i3]);
      }
      return new Bignumber(res, 16);
    };
    exports.buildMap = (obj) => {
      const res = /* @__PURE__ */ new Map();
      const keys = Object.keys(obj);
      const length = keys.length;
      for (let i3 = 0; i3 < length; i3++) {
        res.set(keys[i3], obj[keys[i3]]);
      }
      return res;
    };
    exports.buildInt32 = (f2, g2) => {
      return f2 * SHIFT16 + g2;
    };
    exports.buildInt64 = (f1, f2, g1, g2) => {
      const f3 = exports.buildInt32(f1, f2);
      const g3 = exports.buildInt32(g1, g2);
      if (f3 > MAX_SAFE_HIGH) {
        return new Bignumber(f3).times(SHIFT32).plus(g3);
      } else {
        return f3 * SHIFT32 + g3;
      }
    };
    exports.writeHalf = function writeHalf(buf, half) {
      const u32 = Buffer2.allocUnsafe(4);
      u32.writeFloatBE(half, 0);
      const u2 = u32.readUInt32BE(0);
      if ((u2 & 8191) !== 0) {
        return false;
      }
      var s16 = u2 >> 16 & 32768;
      const exp = u2 >> 23 & 255;
      const mant = u2 & 8388607;
      if (exp >= 113 && exp <= 142) {
        s16 += (exp - 112 << 10) + (mant >> 13);
      } else if (exp >= 103 && exp < 113) {
        if (mant & (1 << 126 - exp) - 1) {
          return false;
        }
        s16 += mant + 8388608 >> 126 - exp;
      } else {
        return false;
      }
      buf.writeUInt16BE(s16, 0);
      return true;
    };
    exports.keySorter = function(a, b2) {
      var lenA = a[0].byteLength;
      var lenB = b2[0].byteLength;
      if (lenA > lenB) {
        return 1;
      }
      if (lenB > lenA) {
        return -1;
      }
      return a[0].compare(b2[0]);
    };
    exports.isNegativeZero = (x2) => {
      return x2 === 0 && 1 / x2 < 0;
    };
    exports.nextPowerOf2 = (n2) => {
      let count = 0;
      if (n2 && !(n2 & n2 - 1)) {
        return n2;
      }
      while (n2 !== 0) {
        n2 >>= 1;
        count += 1;
      }
      return 1 << count;
    };
  })(utils);
  return utils;
}
var simple;
var hasRequiredSimple;
function requireSimple() {
  if (hasRequiredSimple) return simple;
  hasRequiredSimple = 1;
  const constants2 = requireConstants();
  const MT = constants2.MT;
  const SIMPLE = constants2.SIMPLE;
  const SYMS = constants2.SYMS;
  class Simple {
    /**
     * Creates an instance of Simple.
     *
     * @param {integer} value - the simple value's integer value
     */
    constructor(value2) {
      if (typeof value2 !== "number") {
        throw new Error("Invalid Simple type: " + typeof value2);
      }
      if (value2 < 0 || value2 > 255 || (value2 | 0) !== value2) {
        throw new Error("value must be a small positive integer: " + value2);
      }
      this.value = value2;
    }
    /**
     * Debug string for simple value
     *
     * @returns {string} simple(value)
     */
    toString() {
      return "simple(" + this.value + ")";
    }
    /**
     * Debug string for simple value
     *
     * @returns {string} simple(value)
     */
    inspect() {
      return "simple(" + this.value + ")";
    }
    /**
     * Push the simple value onto the CBOR stream
     *
     * @param {cbor.Encoder} gen The generator to push onto
     * @returns {number}
     */
    encodeCBOR(gen) {
      return gen._pushInt(this.value, MT.SIMPLE_FLOAT);
    }
    /**
     * Is the given object a Simple?
     *
     * @param {any} obj - object to test
     * @returns {bool} - is it Simple?
     */
    static isSimple(obj) {
      return obj instanceof Simple;
    }
    /**
     * Decode from the CBOR additional information into a JavaScript value.
     * If the CBOR item has no parent, return a "safe" symbol instead of
     * `null` or `undefined`, so that the value can be passed through a
     * stream in object mode.
     *
     * @param {Number} val - the CBOR additional info to convert
     * @param {bool} hasParent - Does the CBOR item have a parent?
     * @returns {(null|undefined|Boolean|Symbol)} - the decoded value
     */
    static decode(val, hasParent) {
      if (hasParent == null) {
        hasParent = true;
      }
      switch (val) {
        case SIMPLE.FALSE:
          return false;
        case SIMPLE.TRUE:
          return true;
        case SIMPLE.NULL:
          if (hasParent) {
            return null;
          } else {
            return SYMS.NULL;
          }
        case SIMPLE.UNDEFINED:
          if (hasParent) {
            return void 0;
          } else {
            return SYMS.UNDEFINED;
          }
        case -1:
          if (!hasParent) {
            throw new Error("Invalid BREAK");
          }
          return SYMS.BREAK;
        default:
          return new Simple(val);
      }
    }
  }
  simple = Simple;
  return simple;
}
var tagged;
var hasRequiredTagged;
function requireTagged() {
  if (hasRequiredTagged) return tagged;
  hasRequiredTagged = 1;
  class Tagged {
    /**
     * Creates an instance of Tagged.
     *
     * @param {Number} tag - the number of the tag
     * @param {any} value - the value inside the tag
     * @param {Error} err - the error that was thrown parsing the tag, or null
     */
    constructor(tag, value2, err) {
      this.tag = tag;
      this.value = value2;
      this.err = err;
      if (typeof this.tag !== "number") {
        throw new Error("Invalid tag type (" + typeof this.tag + ")");
      }
      if (this.tag < 0 || (this.tag | 0) !== this.tag) {
        throw new Error("Tag must be a positive integer: " + this.tag);
      }
    }
    /**
     * Convert to a String
     *
     * @returns {String} string of the form '1(2)'
     */
    toString() {
      return `${this.tag}(${JSON.stringify(this.value)})`;
    }
    /**
     * Push the simple value onto the CBOR stream
     *
     * @param {cbor.Encoder} gen The generator to push onto
     * @returns {number}
     */
    encodeCBOR(gen) {
      gen._pushTag(this.tag);
      return gen.pushAny(this.value);
    }
    /**
     * If we have a converter for this type, do the conversion.  Some converters
     * are built-in.  Additional ones can be passed in.  If you want to remove
     * a built-in converter, pass a converter in whose value is 'null' instead
     * of a function.
     *
     * @param {Object} converters - keys in the object are a tag number, the value
     *   is a function that takes the decoded CBOR and returns a JavaScript value
     *   of the appropriate type.  Throw an exception in the function on errors.
     * @returns {any} - the converted item
     */
    convert(converters) {
      var er, f2;
      f2 = converters != null ? converters[this.tag] : void 0;
      if (typeof f2 !== "function") {
        f2 = Tagged["_tag" + this.tag];
        if (typeof f2 !== "function") {
          return this;
        }
      }
      try {
        return f2.call(Tagged, this.value);
      } catch (error) {
        er = error;
        this.err = er;
        return this;
      }
    }
  }
  tagged = Tagged;
  return tagged;
}
var urlBrowser;
var hasRequiredUrlBrowser;
function requireUrlBrowser() {
  if (hasRequiredUrlBrowser) return urlBrowser;
  hasRequiredUrlBrowser = 1;
  const defaultBase = self.location ? self.location.protocol + "//" + self.location.host : "";
  const URL2 = self.URL;
  class URLWithLegacySupport {
    constructor(url = "", base = defaultBase) {
      this.super = new URL2(url, base);
      this.path = this.pathname + this.search;
      this.auth = this.username && this.password ? this.username + ":" + this.password : null;
      this.query = this.search && this.search.startsWith("?") ? this.search.slice(1) : null;
    }
    get hash() {
      return this.super.hash;
    }
    get host() {
      return this.super.host;
    }
    get hostname() {
      return this.super.hostname;
    }
    get href() {
      return this.super.href;
    }
    get origin() {
      return this.super.origin;
    }
    get password() {
      return this.super.password;
    }
    get pathname() {
      return this.super.pathname;
    }
    get port() {
      return this.super.port;
    }
    get protocol() {
      return this.super.protocol;
    }
    get search() {
      return this.super.search;
    }
    get searchParams() {
      return this.super.searchParams;
    }
    get username() {
      return this.super.username;
    }
    set hash(hash2) {
      this.super.hash = hash2;
    }
    set host(host) {
      this.super.host = host;
    }
    set hostname(hostname) {
      this.super.hostname = hostname;
    }
    set href(href) {
      this.super.href = href;
    }
    set origin(origin) {
      this.super.origin = origin;
    }
    set password(password) {
      this.super.password = password;
    }
    set pathname(pathname) {
      this.super.pathname = pathname;
    }
    set port(port) {
      this.super.port = port;
    }
    set protocol(protocol) {
      this.super.protocol = protocol;
    }
    set search(search) {
      this.super.search = search;
    }
    set searchParams(searchParams) {
      this.super.searchParams = searchParams;
    }
    set username(username) {
      this.super.username = username;
    }
    createObjectURL(o2) {
      return this.super.createObjectURL(o2);
    }
    revokeObjectURL(o2) {
      this.super.revokeObjectURL(o2);
    }
    toJSON() {
      return this.super.toJSON();
    }
    toString() {
      return this.super.toString();
    }
    format() {
      return this.toString();
    }
  }
  function format(obj) {
    if (typeof obj === "string") {
      const url = new URL2(obj);
      return url.toString();
    }
    if (!(obj instanceof URL2)) {
      const userPass = obj.username && obj.password ? `${obj.username}:${obj.password}@` : "";
      const auth = obj.auth ? obj.auth + "@" : "";
      const port = obj.port ? ":" + obj.port : "";
      const protocol = obj.protocol ? obj.protocol + "//" : "";
      const host = obj.host || "";
      const hostname = obj.hostname || "";
      const search = obj.search || (obj.query ? "?" + obj.query : "");
      const hash2 = obj.hash || "";
      const pathname = obj.pathname || "";
      const path = obj.path || pathname + search;
      return `${protocol}${userPass || auth}${host || hostname + port}${path}${hash2}`;
    }
  }
  urlBrowser = {
    URLWithLegacySupport,
    URLSearchParams: self.URLSearchParams,
    defaultBase,
    format
  };
  return urlBrowser;
}
var relative;
var hasRequiredRelative;
function requireRelative() {
  if (hasRequiredRelative) return relative;
  hasRequiredRelative = 1;
  const { URLWithLegacySupport, format } = requireUrlBrowser();
  relative = (url, location2 = {}, protocolMap = {}, defaultProtocol) => {
    let protocol = location2.protocol ? location2.protocol.replace(":", "") : "http";
    protocol = (protocolMap[protocol] || defaultProtocol || protocol) + ":";
    let urlParsed;
    try {
      urlParsed = new URLWithLegacySupport(url);
    } catch (err) {
      urlParsed = {};
    }
    const base = Object.assign({}, location2, {
      protocol: protocol || urlParsed.protocol,
      host: location2.host || urlParsed.host
    });
    return new URLWithLegacySupport(url, format(base)).toString();
  };
  return relative;
}
var isoUrl;
var hasRequiredIsoUrl;
function requireIsoUrl() {
  if (hasRequiredIsoUrl) return isoUrl;
  hasRequiredIsoUrl = 1;
  const {
    URLWithLegacySupport,
    format,
    URLSearchParams,
    defaultBase
  } = requireUrlBrowser();
  const relative2 = requireRelative();
  isoUrl = {
    URL: URLWithLegacySupport,
    URLSearchParams,
    format,
    relative: relative2,
    defaultBase
  };
  return isoUrl;
}
var decoder;
var hasRequiredDecoder;
function requireDecoder() {
  if (hasRequiredDecoder) return decoder;
  hasRequiredDecoder = 1;
  const { Buffer: Buffer2 } = requireBuffer();
  const ieee7542 = requireIeee754();
  const Bignumber = requireBignumber().BigNumber;
  const parser = requireDecoder_asm();
  const utils2 = requireUtils();
  const c = requireConstants();
  const Simple = requireSimple();
  const Tagged = requireTagged();
  const { URL: URL2 } = requireIsoUrl();
  class Decoder {
    /**
     * @param {Object} [opts={}]
     * @param {number} [opts.size=65536] - Size of the allocated heap.
     */
    constructor(opts) {
      opts = opts || {};
      if (!opts.size || opts.size < 65536) {
        opts.size = 65536;
      } else {
        opts.size = utils2.nextPowerOf2(opts.size);
      }
      this._heap = new ArrayBuffer(opts.size);
      this._heap8 = new Uint8Array(this._heap);
      this._buffer = Buffer2.from(this._heap);
      this._reset();
      this._knownTags = Object.assign({
        0: (val) => new Date(val),
        1: (val) => new Date(val * 1e3),
        2: (val) => utils2.arrayBufferToBignumber(val),
        3: (val) => c.NEG_ONE.minus(utils2.arrayBufferToBignumber(val)),
        4: (v3) => {
          return c.TEN.pow(v3[0]).times(v3[1]);
        },
        5: (v3) => {
          return c.TWO.pow(v3[0]).times(v3[1]);
        },
        32: (val) => new URL2(val),
        35: (val) => new RegExp(val)
      }, opts.tags);
      this.parser = parser(globalThis, {
        // eslint-disable-next-line no-console
        log: console.log.bind(console),
        pushInt: this.pushInt.bind(this),
        pushInt32: this.pushInt32.bind(this),
        pushInt32Neg: this.pushInt32Neg.bind(this),
        pushInt64: this.pushInt64.bind(this),
        pushInt64Neg: this.pushInt64Neg.bind(this),
        pushFloat: this.pushFloat.bind(this),
        pushFloatSingle: this.pushFloatSingle.bind(this),
        pushFloatDouble: this.pushFloatDouble.bind(this),
        pushTrue: this.pushTrue.bind(this),
        pushFalse: this.pushFalse.bind(this),
        pushUndefined: this.pushUndefined.bind(this),
        pushNull: this.pushNull.bind(this),
        pushInfinity: this.pushInfinity.bind(this),
        pushInfinityNeg: this.pushInfinityNeg.bind(this),
        pushNaN: this.pushNaN.bind(this),
        pushNaNNeg: this.pushNaNNeg.bind(this),
        pushArrayStart: this.pushArrayStart.bind(this),
        pushArrayStartFixed: this.pushArrayStartFixed.bind(this),
        pushArrayStartFixed32: this.pushArrayStartFixed32.bind(this),
        pushArrayStartFixed64: this.pushArrayStartFixed64.bind(this),
        pushObjectStart: this.pushObjectStart.bind(this),
        pushObjectStartFixed: this.pushObjectStartFixed.bind(this),
        pushObjectStartFixed32: this.pushObjectStartFixed32.bind(this),
        pushObjectStartFixed64: this.pushObjectStartFixed64.bind(this),
        pushByteString: this.pushByteString.bind(this),
        pushByteStringStart: this.pushByteStringStart.bind(this),
        pushUtf8String: this.pushUtf8String.bind(this),
        pushUtf8StringStart: this.pushUtf8StringStart.bind(this),
        pushSimpleUnassigned: this.pushSimpleUnassigned.bind(this),
        pushTagUnassigned: this.pushTagUnassigned.bind(this),
        pushTagStart: this.pushTagStart.bind(this),
        pushTagStart4: this.pushTagStart4.bind(this),
        pushTagStart8: this.pushTagStart8.bind(this),
        pushBreak: this.pushBreak.bind(this)
      }, this._heap);
    }
    get _depth() {
      return this._parents.length;
    }
    get _currentParent() {
      return this._parents[this._depth - 1];
    }
    get _ref() {
      return this._currentParent.ref;
    }
    // Finish the current parent
    _closeParent() {
      var p = this._parents.pop();
      if (p.length > 0) {
        throw new Error(`Missing ${p.length} elements`);
      }
      switch (p.type) {
        case c.PARENT.TAG:
          this._push(
            this.createTag(p.ref[0], p.ref[1])
          );
          break;
        case c.PARENT.BYTE_STRING:
          this._push(this.createByteString(p.ref, p.length));
          break;
        case c.PARENT.UTF8_STRING:
          this._push(this.createUtf8String(p.ref, p.length));
          break;
        case c.PARENT.MAP:
          if (p.values % 2 > 0) {
            throw new Error("Odd number of elements in the map");
          }
          this._push(this.createMap(p.ref, p.length));
          break;
        case c.PARENT.OBJECT:
          if (p.values % 2 > 0) {
            throw new Error("Odd number of elements in the map");
          }
          this._push(this.createObject(p.ref, p.length));
          break;
        case c.PARENT.ARRAY:
          this._push(this.createArray(p.ref, p.length));
          break;
      }
      if (this._currentParent && this._currentParent.type === c.PARENT.TAG) {
        this._dec();
      }
    }
    // Reduce the expected length of the current parent by one
    _dec() {
      const p = this._currentParent;
      if (p.length < 0) {
        return;
      }
      p.length--;
      if (p.length === 0) {
        this._closeParent();
      }
    }
    // Push any value to the current parent
    _push(val, hasChildren) {
      const p = this._currentParent;
      p.values++;
      switch (p.type) {
        case c.PARENT.ARRAY:
        case c.PARENT.BYTE_STRING:
        case c.PARENT.UTF8_STRING:
          if (p.length > -1) {
            this._ref[this._ref.length - p.length] = val;
          } else {
            this._ref.push(val);
          }
          this._dec();
          break;
        case c.PARENT.OBJECT:
          if (p.tmpKey != null) {
            this._ref[p.tmpKey] = val;
            p.tmpKey = null;
            this._dec();
          } else {
            p.tmpKey = val;
            if (typeof p.tmpKey !== "string") {
              p.type = c.PARENT.MAP;
              p.ref = utils2.buildMap(p.ref);
            }
          }
          break;
        case c.PARENT.MAP:
          if (p.tmpKey != null) {
            this._ref.set(p.tmpKey, val);
            p.tmpKey = null;
            this._dec();
          } else {
            p.tmpKey = val;
          }
          break;
        case c.PARENT.TAG:
          this._ref.push(val);
          if (!hasChildren) {
            this._dec();
          }
          break;
        default:
          throw new Error("Unknown parent type");
      }
    }
    // Create a new parent in the parents list
    _createParent(obj, type, len) {
      this._parents[this._depth] = {
        type,
        length: len,
        ref: obj,
        values: 0,
        tmpKey: null
      };
    }
    // Reset all state back to the beginning, also used for initiatlization
    _reset() {
      this._res = [];
      this._parents = [{
        type: c.PARENT.ARRAY,
        length: -1,
        ref: this._res,
        values: 0,
        tmpKey: null
      }];
    }
    // -- Interface to customize deoding behaviour
    createTag(tagNumber, value2) {
      const typ = this._knownTags[tagNumber];
      if (!typ) {
        return new Tagged(tagNumber, value2);
      }
      return typ(value2);
    }
    createMap(obj, len) {
      return obj;
    }
    createObject(obj, len) {
      return obj;
    }
    createArray(arr, len) {
      return arr;
    }
    createByteString(raw, len) {
      return Buffer2.concat(raw);
    }
    createByteStringFromHeap(start, end) {
      if (start === end) {
        return Buffer2.alloc(0);
      }
      return Buffer2.from(this._heap.slice(start, end));
    }
    createInt(val) {
      return val;
    }
    createInt32(f2, g2) {
      return utils2.buildInt32(f2, g2);
    }
    createInt64(f1, f2, g1, g2) {
      return utils2.buildInt64(f1, f2, g1, g2);
    }
    createFloat(val) {
      return val;
    }
    createFloatSingle(a, b2, c2, d2) {
      return ieee7542.read([a, b2, c2, d2], 0, false, 23, 4);
    }
    createFloatDouble(a, b2, c2, d2, e5, f2, g2, h3) {
      return ieee7542.read([a, b2, c2, d2, e5, f2, g2, h3], 0, false, 52, 8);
    }
    createInt32Neg(f2, g2) {
      return -1 - utils2.buildInt32(f2, g2);
    }
    createInt64Neg(f1, f2, g1, g2) {
      const f3 = utils2.buildInt32(f1, f2);
      const g3 = utils2.buildInt32(g1, g2);
      if (f3 > c.MAX_SAFE_HIGH) {
        return c.NEG_ONE.minus(new Bignumber(f3).times(c.SHIFT32).plus(g3));
      }
      return -1 - (f3 * c.SHIFT32 + g3);
    }
    createTrue() {
      return true;
    }
    createFalse() {
      return false;
    }
    createNull() {
      return null;
    }
    createUndefined() {
      return void 0;
    }
    createInfinity() {
      return Infinity;
    }
    createInfinityNeg() {
      return -Infinity;
    }
    createNaN() {
      return NaN;
    }
    createNaNNeg() {
      return NaN;
    }
    createUtf8String(raw, len) {
      return raw.join("");
    }
    createUtf8StringFromHeap(start, end) {
      if (start === end) {
        return "";
      }
      return this._buffer.toString("utf8", start, end);
    }
    createSimpleUnassigned(val) {
      return new Simple(val);
    }
    // -- Interface for decoder.asm.js
    pushInt(val) {
      this._push(this.createInt(val));
    }
    pushInt32(f2, g2) {
      this._push(this.createInt32(f2, g2));
    }
    pushInt64(f1, f2, g1, g2) {
      this._push(this.createInt64(f1, f2, g1, g2));
    }
    pushFloat(val) {
      this._push(this.createFloat(val));
    }
    pushFloatSingle(a, b2, c2, d2) {
      this._push(this.createFloatSingle(a, b2, c2, d2));
    }
    pushFloatDouble(a, b2, c2, d2, e5, f2, g2, h3) {
      this._push(this.createFloatDouble(a, b2, c2, d2, e5, f2, g2, h3));
    }
    pushInt32Neg(f2, g2) {
      this._push(this.createInt32Neg(f2, g2));
    }
    pushInt64Neg(f1, f2, g1, g2) {
      this._push(this.createInt64Neg(f1, f2, g1, g2));
    }
    pushTrue() {
      this._push(this.createTrue());
    }
    pushFalse() {
      this._push(this.createFalse());
    }
    pushNull() {
      this._push(this.createNull());
    }
    pushUndefined() {
      this._push(this.createUndefined());
    }
    pushInfinity() {
      this._push(this.createInfinity());
    }
    pushInfinityNeg() {
      this._push(this.createInfinityNeg());
    }
    pushNaN() {
      this._push(this.createNaN());
    }
    pushNaNNeg() {
      this._push(this.createNaNNeg());
    }
    pushArrayStart() {
      this._createParent([], c.PARENT.ARRAY, -1);
    }
    pushArrayStartFixed(len) {
      this._createArrayStartFixed(len);
    }
    pushArrayStartFixed32(len1, len2) {
      const len = utils2.buildInt32(len1, len2);
      this._createArrayStartFixed(len);
    }
    pushArrayStartFixed64(len1, len2, len3, len4) {
      const len = utils2.buildInt64(len1, len2, len3, len4);
      this._createArrayStartFixed(len);
    }
    pushObjectStart() {
      this._createObjectStartFixed(-1);
    }
    pushObjectStartFixed(len) {
      this._createObjectStartFixed(len);
    }
    pushObjectStartFixed32(len1, len2) {
      const len = utils2.buildInt32(len1, len2);
      this._createObjectStartFixed(len);
    }
    pushObjectStartFixed64(len1, len2, len3, len4) {
      const len = utils2.buildInt64(len1, len2, len3, len4);
      this._createObjectStartFixed(len);
    }
    pushByteStringStart() {
      this._parents[this._depth] = {
        type: c.PARENT.BYTE_STRING,
        length: -1,
        ref: [],
        values: 0,
        tmpKey: null
      };
    }
    pushByteString(start, end) {
      this._push(this.createByteStringFromHeap(start, end));
    }
    pushUtf8StringStart() {
      this._parents[this._depth] = {
        type: c.PARENT.UTF8_STRING,
        length: -1,
        ref: [],
        values: 0,
        tmpKey: null
      };
    }
    pushUtf8String(start, end) {
      this._push(this.createUtf8StringFromHeap(start, end));
    }
    pushSimpleUnassigned(val) {
      this._push(this.createSimpleUnassigned(val));
    }
    pushTagStart(tag) {
      this._parents[this._depth] = {
        type: c.PARENT.TAG,
        length: 1,
        ref: [tag]
      };
    }
    pushTagStart4(f2, g2) {
      this.pushTagStart(utils2.buildInt32(f2, g2));
    }
    pushTagStart8(f1, f2, g1, g2) {
      this.pushTagStart(utils2.buildInt64(f1, f2, g1, g2));
    }
    pushTagUnassigned(tagNumber) {
      this._push(this.createTag(tagNumber));
    }
    pushBreak() {
      if (this._currentParent.length > -1) {
        throw new Error("Unexpected break");
      }
      this._closeParent();
    }
    _createObjectStartFixed(len) {
      if (len === 0) {
        this._push(this.createObject({}));
        return;
      }
      this._createParent({}, c.PARENT.OBJECT, len);
    }
    _createArrayStartFixed(len) {
      if (len === 0) {
        this._push(this.createArray([]));
        return;
      }
      this._createParent(new Array(len), c.PARENT.ARRAY, len);
    }
    _decode(input) {
      if (input.byteLength === 0) {
        throw new Error("Input too short");
      }
      this._reset();
      this._heap8.set(input);
      const code = this.parser.parse(input.byteLength);
      if (this._depth > 1) {
        while (this._currentParent.length === 0) {
          this._closeParent();
        }
        if (this._depth > 1) {
          throw new Error("Undeterminated nesting");
        }
      }
      if (code > 0) {
        throw new Error("Failed to parse");
      }
      if (this._res.length === 0) {
        throw new Error("No valid result");
      }
    }
    // -- Public Interface
    decodeFirst(input) {
      this._decode(input);
      return this._res[0];
    }
    decodeAll(input) {
      this._decode(input);
      return this._res;
    }
    /**
     * Decode the first cbor object.
     *
     * @param {Buffer|string} input
     * @param {string} [enc='hex'] - Encoding used if a string is passed.
     * @returns {*}
     */
    static decode(input, enc) {
      if (typeof input === "string") {
        input = Buffer2.from(input, enc || "hex");
      }
      const dec = new Decoder({ size: input.length });
      return dec.decodeFirst(input);
    }
    /**
     * Decode all cbor objects.
     *
     * @param {Buffer|string} input
     * @param {string} [enc='hex'] - Encoding used if a string is passed.
     * @returns {Array<*>}
     */
    static decodeAll(input, enc) {
      if (typeof input === "string") {
        input = Buffer2.from(input, enc || "hex");
      }
      const dec = new Decoder({ size: input.length });
      return dec.decodeAll(input);
    }
  }
  Decoder.decodeFirst = Decoder.decode;
  decoder = Decoder;
  return decoder;
}
var diagnose;
var hasRequiredDiagnose;
function requireDiagnose() {
  if (hasRequiredDiagnose) return diagnose;
  hasRequiredDiagnose = 1;
  const { Buffer: Buffer2 } = requireBuffer();
  const Decoder = requireDecoder();
  const utils2 = requireUtils();
  class Diagnose extends Decoder {
    createTag(tagNumber, value2) {
      return `${tagNumber}(${value2})`;
    }
    createInt(val) {
      return super.createInt(val).toString();
    }
    createInt32(f2, g2) {
      return super.createInt32(f2, g2).toString();
    }
    createInt64(f1, f2, g1, g2) {
      return super.createInt64(f1, f2, g1, g2).toString();
    }
    createInt32Neg(f2, g2) {
      return super.createInt32Neg(f2, g2).toString();
    }
    createInt64Neg(f1, f2, g1, g2) {
      return super.createInt64Neg(f1, f2, g1, g2).toString();
    }
    createTrue() {
      return "true";
    }
    createFalse() {
      return "false";
    }
    createFloat(val) {
      const fl = super.createFloat(val);
      if (utils2.isNegativeZero(val)) {
        return "-0_1";
      }
      return `${fl}_1`;
    }
    createFloatSingle(a, b2, c, d2) {
      const fl = super.createFloatSingle(a, b2, c, d2);
      return `${fl}_2`;
    }
    createFloatDouble(a, b2, c, d2, e5, f2, g2, h3) {
      const fl = super.createFloatDouble(a, b2, c, d2, e5, f2, g2, h3);
      return `${fl}_3`;
    }
    createByteString(raw, len) {
      const val = raw.join(", ");
      if (len === -1) {
        return `(_ ${val})`;
      }
      return `h'${val}`;
    }
    createByteStringFromHeap(start, end) {
      const val = Buffer2.from(
        super.createByteStringFromHeap(start, end)
      ).toString("hex");
      return `h'${val}'`;
    }
    createInfinity() {
      return "Infinity_1";
    }
    createInfinityNeg() {
      return "-Infinity_1";
    }
    createNaN() {
      return "NaN_1";
    }
    createNaNNeg() {
      return "-NaN_1";
    }
    createNull() {
      return "null";
    }
    createUndefined() {
      return "undefined";
    }
    createSimpleUnassigned(val) {
      return `simple(${val})`;
    }
    createArray(arr, len) {
      const val = super.createArray(arr, len);
      if (len === -1) {
        return `[_ ${val.join(", ")}]`;
      }
      return `[${val.join(", ")}]`;
    }
    createMap(map, len) {
      const val = super.createMap(map);
      const list = Array.from(val.keys()).reduce(collectObject(val), "");
      if (len === -1) {
        return `{_ ${list}}`;
      }
      return `{${list}}`;
    }
    createObject(obj, len) {
      const val = super.createObject(obj);
      const map = Object.keys(val).reduce(collectObject(val), "");
      if (len === -1) {
        return `{_ ${map}}`;
      }
      return `{${map}}`;
    }
    createUtf8String(raw, len) {
      const val = raw.join(", ");
      if (len === -1) {
        return `(_ ${val})`;
      }
      return `"${val}"`;
    }
    createUtf8StringFromHeap(start, end) {
      const val = Buffer2.from(
        super.createUtf8StringFromHeap(start, end)
      ).toString("utf8");
      return `"${val}"`;
    }
    static diagnose(input, enc) {
      if (typeof input === "string") {
        input = Buffer2.from(input, enc || "hex");
      }
      const dec = new Diagnose();
      return dec.decodeFirst(input);
    }
  }
  diagnose = Diagnose;
  function collectObject(val) {
    return (acc, key) => {
      if (acc) {
        return `${acc}, ${key}: ${val[key]}`;
      }
      return `${key}: ${val[key]}`;
    };
  }
  return diagnose;
}
var encoder;
var hasRequiredEncoder;
function requireEncoder() {
  if (hasRequiredEncoder) return encoder;
  hasRequiredEncoder = 1;
  const { Buffer: Buffer2 } = requireBuffer();
  const { URL: URL2 } = requireIsoUrl();
  const Bignumber = requireBignumber().BigNumber;
  const utils2 = requireUtils();
  const constants2 = requireConstants();
  const MT = constants2.MT;
  const NUMBYTES = constants2.NUMBYTES;
  const SHIFT32 = constants2.SHIFT32;
  const SYMS = constants2.SYMS;
  const TAG = constants2.TAG;
  const HALF = constants2.MT.SIMPLE_FLOAT << 5 | constants2.NUMBYTES.TWO;
  const FLOAT = constants2.MT.SIMPLE_FLOAT << 5 | constants2.NUMBYTES.FOUR;
  const DOUBLE = constants2.MT.SIMPLE_FLOAT << 5 | constants2.NUMBYTES.EIGHT;
  const TRUE = constants2.MT.SIMPLE_FLOAT << 5 | constants2.SIMPLE.TRUE;
  const FALSE = constants2.MT.SIMPLE_FLOAT << 5 | constants2.SIMPLE.FALSE;
  const UNDEFINED = constants2.MT.SIMPLE_FLOAT << 5 | constants2.SIMPLE.UNDEFINED;
  const NULL = constants2.MT.SIMPLE_FLOAT << 5 | constants2.SIMPLE.NULL;
  const MAXINT_BN = new Bignumber("0x20000000000000");
  const BUF_NAN = Buffer2.from("f97e00", "hex");
  const BUF_INF_NEG = Buffer2.from("f9fc00", "hex");
  const BUF_INF_POS = Buffer2.from("f97c00", "hex");
  function toType(obj) {
    return {}.toString.call(obj).slice(8, -1);
  }
  class Encoder {
    /**
     * @param {Object} [options={}]
     * @param {function(Buffer)} options.stream
     */
    constructor(options) {
      options = options || {};
      this.streaming = typeof options.stream === "function";
      this.onData = options.stream;
      this.semanticTypes = [
        [URL2, this._pushUrl],
        [Bignumber, this._pushBigNumber]
      ];
      const addTypes = options.genTypes || [];
      const len = addTypes.length;
      for (let i3 = 0; i3 < len; i3++) {
        this.addSemanticType(
          addTypes[i3][0],
          addTypes[i3][1]
        );
      }
      this._reset();
    }
    addSemanticType(type, fun) {
      const len = this.semanticTypes.length;
      for (let i3 = 0; i3 < len; i3++) {
        const typ = this.semanticTypes[i3][0];
        if (typ === type) {
          const old = this.semanticTypes[i3][1];
          this.semanticTypes[i3][1] = fun;
          return old;
        }
      }
      this.semanticTypes.push([type, fun]);
      return null;
    }
    push(val) {
      if (!val) {
        return true;
      }
      this.result[this.offset] = val;
      this.resultMethod[this.offset] = 0;
      this.resultLength[this.offset] = val.length;
      this.offset++;
      if (this.streaming) {
        this.onData(this.finalize());
      }
      return true;
    }
    pushWrite(val, method, len) {
      this.result[this.offset] = val;
      this.resultMethod[this.offset] = method;
      this.resultLength[this.offset] = len;
      this.offset++;
      if (this.streaming) {
        this.onData(this.finalize());
      }
      return true;
    }
    _pushUInt8(val) {
      return this.pushWrite(val, 1, 1);
    }
    _pushUInt16BE(val) {
      return this.pushWrite(val, 2, 2);
    }
    _pushUInt32BE(val) {
      return this.pushWrite(val, 3, 4);
    }
    _pushDoubleBE(val) {
      return this.pushWrite(val, 4, 8);
    }
    _pushNaN() {
      return this.push(BUF_NAN);
    }
    _pushInfinity(obj) {
      const half = obj < 0 ? BUF_INF_NEG : BUF_INF_POS;
      return this.push(half);
    }
    _pushFloat(obj) {
      const b2 = Buffer2.allocUnsafe(2);
      if (utils2.writeHalf(b2, obj)) {
        if (utils2.parseHalf(b2) === obj) {
          return this._pushUInt8(HALF) && this.push(b2);
        }
      }
      const b4 = Buffer2.allocUnsafe(4);
      b4.writeFloatBE(obj, 0);
      if (b4.readFloatBE(0) === obj) {
        return this._pushUInt8(FLOAT) && this.push(b4);
      }
      return this._pushUInt8(DOUBLE) && this._pushDoubleBE(obj);
    }
    _pushInt(obj, mt, orig) {
      const m2 = mt << 5;
      if (obj < 24) {
        return this._pushUInt8(m2 | obj);
      }
      if (obj <= 255) {
        return this._pushUInt8(m2 | NUMBYTES.ONE) && this._pushUInt8(obj);
      }
      if (obj <= 65535) {
        return this._pushUInt8(m2 | NUMBYTES.TWO) && this._pushUInt16BE(obj);
      }
      if (obj <= 4294967295) {
        return this._pushUInt8(m2 | NUMBYTES.FOUR) && this._pushUInt32BE(obj);
      }
      if (obj <= Number.MAX_SAFE_INTEGER) {
        return this._pushUInt8(m2 | NUMBYTES.EIGHT) && this._pushUInt32BE(Math.floor(obj / SHIFT32)) && this._pushUInt32BE(obj % SHIFT32);
      }
      if (mt === MT.NEG_INT) {
        return this._pushFloat(orig);
      }
      return this._pushFloat(obj);
    }
    _pushIntNum(obj) {
      if (obj < 0) {
        return this._pushInt(-obj - 1, MT.NEG_INT, obj);
      } else {
        return this._pushInt(obj, MT.POS_INT);
      }
    }
    _pushNumber(obj) {
      switch (false) {
        case obj === obj:
          return this._pushNaN(obj);
        case isFinite(obj):
          return this._pushInfinity(obj);
        case obj % 1 !== 0:
          return this._pushIntNum(obj);
        default:
          return this._pushFloat(obj);
      }
    }
    _pushString(obj) {
      const len = Buffer2.byteLength(obj, "utf8");
      return this._pushInt(len, MT.UTF8_STRING) && this.pushWrite(obj, 5, len);
    }
    _pushBoolean(obj) {
      return this._pushUInt8(obj ? TRUE : FALSE);
    }
    _pushUndefined(obj) {
      return this._pushUInt8(UNDEFINED);
    }
    _pushArray(gen, obj) {
      const len = obj.length;
      if (!gen._pushInt(len, MT.ARRAY)) {
        return false;
      }
      for (let j2 = 0; j2 < len; j2++) {
        if (!gen.pushAny(obj[j2])) {
          return false;
        }
      }
      return true;
    }
    _pushTag(tag) {
      return this._pushInt(tag, MT.TAG);
    }
    _pushDate(gen, obj) {
      return gen._pushTag(TAG.DATE_EPOCH) && gen.pushAny(Math.round(obj / 1e3));
    }
    _pushBuffer(gen, obj) {
      return gen._pushInt(obj.length, MT.BYTE_STRING) && gen.push(obj);
    }
    _pushNoFilter(gen, obj) {
      return gen._pushBuffer(gen, obj.slice());
    }
    _pushRegexp(gen, obj) {
      return gen._pushTag(TAG.REGEXP) && gen.pushAny(obj.source);
    }
    _pushSet(gen, obj) {
      if (!gen._pushInt(obj.size, MT.ARRAY)) {
        return false;
      }
      for (const x2 of obj) {
        if (!gen.pushAny(x2)) {
          return false;
        }
      }
      return true;
    }
    _pushUrl(gen, obj) {
      return gen._pushTag(TAG.URI) && gen.pushAny(obj.format());
    }
    _pushBigint(obj) {
      let tag = TAG.POS_BIGINT;
      if (obj.isNegative()) {
        obj = obj.negated().minus(1);
        tag = TAG.NEG_BIGINT;
      }
      let str = obj.toString(16);
      if (str.length % 2) {
        str = "0" + str;
      }
      const buf = Buffer2.from(str, "hex");
      return this._pushTag(tag) && this._pushBuffer(this, buf);
    }
    _pushBigNumber(gen, obj) {
      if (obj.isNaN()) {
        return gen._pushNaN();
      }
      if (!obj.isFinite()) {
        return gen._pushInfinity(obj.isNegative() ? -Infinity : Infinity);
      }
      if (obj.isInteger()) {
        return gen._pushBigint(obj);
      }
      if (!(gen._pushTag(TAG.DECIMAL_FRAC) && gen._pushInt(2, MT.ARRAY))) {
        return false;
      }
      const dec = obj.decimalPlaces();
      const slide = obj.multipliedBy(new Bignumber(10).pow(dec));
      if (!gen._pushIntNum(-dec)) {
        return false;
      }
      if (slide.abs().isLessThan(MAXINT_BN)) {
        return gen._pushIntNum(slide.toNumber());
      } else {
        return gen._pushBigint(slide);
      }
    }
    _pushMap(gen, obj) {
      if (!gen._pushInt(obj.size, MT.MAP)) {
        return false;
      }
      return this._pushRawMap(
        obj.size,
        Array.from(obj)
      );
    }
    _pushObject(obj) {
      if (!obj) {
        return this._pushUInt8(NULL);
      }
      var len = this.semanticTypes.length;
      for (var i3 = 0; i3 < len; i3++) {
        if (obj instanceof this.semanticTypes[i3][0]) {
          return this.semanticTypes[i3][1].call(obj, this, obj);
        }
      }
      var f2 = obj.encodeCBOR;
      if (typeof f2 === "function") {
        return f2.call(obj, this);
      }
      var keys = Object.keys(obj);
      var keyLength = keys.length;
      if (!this._pushInt(keyLength, MT.MAP)) {
        return false;
      }
      return this._pushRawMap(
        keyLength,
        keys.map((k2) => [k2, obj[k2]])
      );
    }
    _pushRawMap(len, map) {
      map = map.map(function(a) {
        a[0] = Encoder.encode(a[0]);
        return a;
      }).sort(utils2.keySorter);
      for (var j2 = 0; j2 < len; j2++) {
        if (!this.push(map[j2][0])) {
          return false;
        }
        if (!this.pushAny(map[j2][1])) {
          return false;
        }
      }
      return true;
    }
    /**
     * Alias for `.pushAny`
     *
     * @param {*} obj
     * @returns {boolean} true on success
     */
    write(obj) {
      return this.pushAny(obj);
    }
    /**
     * Push any supported type onto the encoded stream
     *
     * @param {any} obj
     * @returns {boolean} true on success
     */
    pushAny(obj) {
      var typ = toType(obj);
      switch (typ) {
        case "Number":
          return this._pushNumber(obj);
        case "String":
          return this._pushString(obj);
        case "Boolean":
          return this._pushBoolean(obj);
        case "Object":
          return this._pushObject(obj);
        case "Array":
          return this._pushArray(this, obj);
        case "Uint8Array":
          return this._pushBuffer(this, Buffer2.isBuffer(obj) ? obj : Buffer2.from(obj));
        case "Null":
          return this._pushUInt8(NULL);
        case "Undefined":
          return this._pushUndefined(obj);
        case "Map":
          return this._pushMap(this, obj);
        case "Set":
          return this._pushSet(this, obj);
        case "URL":
          return this._pushUrl(this, obj);
        case "BigNumber":
          return this._pushBigNumber(this, obj);
        case "Date":
          return this._pushDate(this, obj);
        case "RegExp":
          return this._pushRegexp(this, obj);
        case "Symbol":
          switch (obj) {
            case SYMS.NULL:
              return this._pushObject(null);
            case SYMS.UNDEFINED:
              return this._pushUndefined(void 0);
            // TODO: Add pluggable support for other symbols
            default:
              throw new Error("Unknown symbol: " + obj.toString());
          }
        default:
          throw new Error("Unknown type: " + typeof obj + ", " + (obj ? obj.toString() : ""));
      }
    }
    finalize() {
      if (this.offset === 0) {
        return null;
      }
      var result = this.result;
      var resultLength = this.resultLength;
      var resultMethod = this.resultMethod;
      var offset = this.offset;
      var size = 0;
      var i3 = 0;
      for (; i3 < offset; i3++) {
        size += resultLength[i3];
      }
      var res = Buffer2.allocUnsafe(size);
      var index2 = 0;
      var length = 0;
      for (i3 = 0; i3 < offset; i3++) {
        length = resultLength[i3];
        switch (resultMethod[i3]) {
          case 0:
            result[i3].copy(res, index2);
            break;
          case 1:
            res.writeUInt8(result[i3], index2, true);
            break;
          case 2:
            res.writeUInt16BE(result[i3], index2, true);
            break;
          case 3:
            res.writeUInt32BE(result[i3], index2, true);
            break;
          case 4:
            res.writeDoubleBE(result[i3], index2, true);
            break;
          case 5:
            res.write(result[i3], index2, length, "utf8");
            break;
          default:
            throw new Error("unkown method");
        }
        index2 += length;
      }
      var tmp = res;
      this._reset();
      return tmp;
    }
    _reset() {
      this.result = [];
      this.resultMethod = [];
      this.resultLength = [];
      this.offset = 0;
    }
    /**
     * Encode the given value
     * @param {*} o
     * @returns {Buffer}
     */
    static encode(o2) {
      const enc = new Encoder();
      const ret = enc.pushAny(o2);
      if (!ret) {
        throw new Error("Failed to encode input");
      }
      return enc.finalize();
    }
  }
  encoder = Encoder;
  return encoder;
}
var hasRequiredSrc$1;
function requireSrc$1() {
  if (hasRequiredSrc$1) return src$1;
  hasRequiredSrc$1 = 1;
  (function(exports) {
    exports.Diagnose = requireDiagnose();
    exports.Decoder = requireDecoder();
    exports.Encoder = requireEncoder();
    exports.Simple = requireSimple();
    exports.Tagged = requireTagged();
    exports.decodeAll = exports.Decoder.decodeAll;
    exports.decodeFirst = exports.Decoder.decodeFirst;
    exports.diagnose = exports.Diagnose.diagnose;
    exports.encode = exports.Encoder.encode;
    exports.decode = exports.Decoder.decode;
    exports.leveldb = {
      decode: exports.Decoder.decodeAll,
      encode: exports.Encoder.encode,
      buffer: true,
      name: "cbor"
    };
  })(src$1);
  return src$1;
}
var srcExports$1 = requireSrc$1();
const borc = /* @__PURE__ */ getDefaultExportFromCjs(srcExports$1);
function hash(data) {
  return uint8ToBuf$1(sha256.create().update(new Uint8Array(data)).digest());
}
function hashValue(value2) {
  if (value2 instanceof borc.Tagged) {
    return hashValue(value2.value);
  } else if (typeof value2 === "string") {
    return hashString(value2);
  } else if (typeof value2 === "number") {
    return hash(lebEncode(value2));
  } else if (value2 instanceof ArrayBuffer || ArrayBuffer.isView(value2)) {
    return hash(value2);
  } else if (Array.isArray(value2)) {
    const vals = value2.map(hashValue);
    return hash(concat$1(...vals));
  } else if (value2 && typeof value2 === "object" && value2._isPrincipal) {
    return hash(value2.toUint8Array());
  } else if (typeof value2 === "object" && value2 !== null && typeof value2.toHash === "function") {
    return hashValue(value2.toHash());
  } else if (typeof value2 === "object") {
    return hashOfMap(value2);
  } else if (typeof value2 === "bigint") {
    return hash(lebEncode(value2));
  }
  throw Object.assign(new Error(`Attempt to hash a value of unsupported type: ${value2}`), {
    // include so logs/callers can understand the confusing value.
    // (when stringified in error message, prototype info is lost)
    value: value2
  });
}
const hashString = (value2) => {
  const encoded = new TextEncoder().encode(value2);
  return hash(encoded);
};
function requestIdOf(request2) {
  return hashOfMap(request2);
}
function hashOfMap(map) {
  const hashed = Object.entries(map).filter(([, value2]) => value2 !== void 0).map(([key, value2]) => {
    const hashedKey = hashString(key);
    const hashedValue = hashValue(value2);
    return [hashedKey, hashedValue];
  });
  const traversed = hashed;
  const sorted = traversed.sort(([k1], [k2]) => {
    return compare(k1, k2);
  });
  const concatenated = concat$1(...sorted.map((x2) => concat$1(...x2)));
  const result = hash(concatenated);
  return result;
}
var __rest$1 = function(s2, e5) {
  var t3 = {};
  for (var p in s2) if (Object.prototype.hasOwnProperty.call(s2, p) && e5.indexOf(p) < 0)
    t3[p] = s2[p];
  if (s2 != null && typeof Object.getOwnPropertySymbols === "function")
    for (var i3 = 0, p = Object.getOwnPropertySymbols(s2); i3 < p.length; i3++) {
      if (e5.indexOf(p[i3]) < 0 && Object.prototype.propertyIsEnumerable.call(s2, p[i3]))
        t3[p[i3]] = s2[p[i3]];
    }
  return t3;
};
const domainSeparator$1 = new TextEncoder().encode("\nic-request");
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
    const { body } = request2, fields = __rest$1(request2, ["body"]);
    const requestId = requestIdOf(body);
    return Object.assign(Object.assign({}, fields), { body: {
      content: body,
      sender_pubkey: this.getPublicKey().toDer(),
      sender_sig: await this.sign(concat$1(domainSeparator$1, requestId))
    } });
  }
}
class AnonymousIdentity {
  getPrincipal() {
    return Principal$1.anonymous();
  }
  async transformRequest(request2) {
    return Object.assign(Object.assign({}, request2), { body: { content: request2.body } });
  }
}
var src = {};
var serializer$1 = {};
var value = {};
var hasRequiredValue;
function requireValue() {
  if (hasRequiredValue) return value;
  hasRequiredValue = 1;
  Object.defineProperty(value, "__esModule", { value: true });
  const MAX_U64_NUMBER = 9007199254740992;
  function _concat(a, ...args) {
    const newBuffer = new Uint8Array(a.byteLength + args.reduce((acc, b2) => acc + b2.byteLength, 0));
    newBuffer.set(new Uint8Array(a), 0);
    let i3 = a.byteLength;
    for (const b2 of args) {
      newBuffer.set(new Uint8Array(b2), i3);
      i3 += b2.byteLength;
    }
    return newBuffer.buffer;
  }
  function _serializeValue(major, minor, value2) {
    value2 = value2.replace(/[^0-9a-fA-F]/g, "");
    const length = 2 ** (minor - 24);
    value2 = value2.slice(-length * 2).padStart(length * 2, "0");
    const bytes2 = [(major << 5) + minor].concat(value2.match(/../g).map((byte) => parseInt(byte, 16)));
    return new Uint8Array(bytes2).buffer;
  }
  function _serializeNumber(major, value2) {
    if (value2 < 24) {
      return new Uint8Array([(major << 5) + value2]).buffer;
    } else {
      const minor = value2 <= 255 ? 24 : value2 <= 65535 ? 25 : value2 <= 4294967295 ? 26 : 27;
      return _serializeValue(major, minor, value2.toString(16));
    }
  }
  function _serializeString(str) {
    const utf8 = [];
    for (let i3 = 0; i3 < str.length; i3++) {
      let charcode = str.charCodeAt(i3);
      if (charcode < 128) {
        utf8.push(charcode);
      } else if (charcode < 2048) {
        utf8.push(192 | charcode >> 6, 128 | charcode & 63);
      } else if (charcode < 55296 || charcode >= 57344) {
        utf8.push(224 | charcode >> 12, 128 | charcode >> 6 & 63, 128 | charcode & 63);
      } else {
        i3++;
        charcode = (charcode & 1023) << 10 | str.charCodeAt(i3) & 1023;
        utf8.push(240 | charcode >> 18, 128 | charcode >> 12 & 63, 128 | charcode >> 6 & 63, 128 | charcode & 63);
      }
    }
    return _concat(new Uint8Array(_serializeNumber(3, str.length)), new Uint8Array(utf8));
  }
  function tagged2(tag, value2) {
    if (tag == 14277111) {
      return _concat(new Uint8Array([217, 217, 247]), value2);
    }
    if (tag < 24) {
      return _concat(new Uint8Array([(6 << 5) + tag]), value2);
    } else {
      const minor = tag <= 255 ? 24 : tag <= 65535 ? 25 : tag <= 4294967295 ? 26 : 27;
      const length = 2 ** (minor - 24);
      const value3 = tag.toString(16).slice(-length * 2).padStart(length * 2, "0");
      const bytes2 = [(6 << 5) + minor].concat(value3.match(/../g).map((byte) => parseInt(byte, 16)));
      return new Uint8Array(bytes2).buffer;
    }
  }
  value.tagged = tagged2;
  function raw(bytes2) {
    return new Uint8Array(bytes2).buffer;
  }
  value.raw = raw;
  function uSmall(n2) {
    if (isNaN(n2)) {
      throw new RangeError("Invalid number.");
    }
    n2 = Math.min(Math.max(0, n2), 23);
    const bytes2 = [(0 << 5) + n2];
    return new Uint8Array(bytes2).buffer;
  }
  value.uSmall = uSmall;
  function u8(u82, radix) {
    u82 = parseInt("" + u82, radix);
    if (isNaN(u82)) {
      throw new RangeError("Invalid number.");
    }
    u82 = Math.min(Math.max(0, u82), 255);
    u82 = u82.toString(16);
    return _serializeValue(0, 24, u82);
  }
  value.u8 = u8;
  function u16(u162, radix) {
    u162 = parseInt("" + u162, radix);
    if (isNaN(u162)) {
      throw new RangeError("Invalid number.");
    }
    u162 = Math.min(Math.max(0, u162), 65535);
    u162 = u162.toString(16);
    return _serializeValue(0, 25, u162);
  }
  value.u16 = u16;
  function u32(u322, radix) {
    u322 = parseInt("" + u322, radix);
    if (isNaN(u322)) {
      throw new RangeError("Invalid number.");
    }
    u322 = Math.min(Math.max(0, u322), 4294967295);
    u322 = u322.toString(16);
    return _serializeValue(0, 26, u322);
  }
  value.u32 = u32;
  function u64(u642, radix) {
    if (typeof u642 == "string" && radix == 16) {
      if (u642.match(/[^0-9a-fA-F]/)) {
        throw new RangeError("Invalid number.");
      }
      return _serializeValue(0, 27, u642);
    }
    u642 = parseInt("" + u642, radix);
    if (isNaN(u642)) {
      throw new RangeError("Invalid number.");
    }
    u642 = Math.min(Math.max(0, u642), MAX_U64_NUMBER);
    u642 = u642.toString(16);
    return _serializeValue(0, 27, u642);
  }
  value.u64 = u64;
  function iSmall(n2) {
    if (isNaN(n2)) {
      throw new RangeError("Invalid number.");
    }
    if (n2 === 0) {
      return uSmall(0);
    }
    n2 = Math.min(Math.max(0, -n2), 24) - 1;
    const bytes2 = [(1 << 5) + n2];
    return new Uint8Array(bytes2).buffer;
  }
  value.iSmall = iSmall;
  function i8(i82, radix) {
    i82 = parseInt("" + i82, radix);
    if (isNaN(i82)) {
      throw new RangeError("Invalid number.");
    }
    i82 = Math.min(Math.max(0, -i82 - 1), 255);
    i82 = i82.toString(16);
    return _serializeValue(1, 24, i82);
  }
  value.i8 = i8;
  function i16(i162, radix) {
    i162 = parseInt("" + i162, radix);
    if (isNaN(i162)) {
      throw new RangeError("Invalid number.");
    }
    i162 = Math.min(Math.max(0, -i162 - 1), 65535);
    i162 = i162.toString(16);
    return _serializeValue(1, 25, i162);
  }
  value.i16 = i16;
  function i32(i322, radix) {
    i322 = parseInt("" + i322, radix);
    if (isNaN(i322)) {
      throw new RangeError("Invalid number.");
    }
    i322 = Math.min(Math.max(0, -i322 - 1), 4294967295);
    i322 = i322.toString(16);
    return _serializeValue(1, 26, i322);
  }
  value.i32 = i32;
  function i64(i642, radix) {
    if (typeof i642 == "string" && radix == 16) {
      if (i642.startsWith("-")) {
        i642 = i642.slice(1);
      } else {
        i642 = "0";
      }
      if (i642.match(/[^0-9a-fA-F]/) || i642.length > 16) {
        throw new RangeError("Invalid number.");
      }
      let done = false;
      let newI64 = i642.split("").reduceRight((acc, x2) => {
        if (done) {
          return x2 + acc;
        }
        let n2 = parseInt(x2, 16) - 1;
        if (n2 >= 0) {
          done = true;
          return n2.toString(16) + acc;
        } else {
          return "f" + acc;
        }
      }, "");
      if (!done) {
        return u64(0);
      }
      return _serializeValue(1, 27, newI64);
    }
    i642 = parseInt("" + i642, radix);
    if (isNaN(i642)) {
      throw new RangeError("Invalid number.");
    }
    i642 = Math.min(Math.max(0, -i642 - 1), 9007199254740992);
    i642 = i642.toString(16);
    return _serializeValue(1, 27, i642);
  }
  value.i64 = i64;
  function number(n2) {
    if (n2 >= 0) {
      if (n2 < 24) {
        return uSmall(n2);
      } else if (n2 <= 255) {
        return u8(n2);
      } else if (n2 <= 65535) {
        return u16(n2);
      } else if (n2 <= 4294967295) {
        return u32(n2);
      } else {
        return u64(n2);
      }
    } else {
      if (n2 >= -24) {
        return iSmall(n2);
      } else if (n2 >= -255) {
        return i8(n2);
      } else if (n2 >= -65535) {
        return i16(n2);
      } else if (n2 >= -4294967295) {
        return i32(n2);
      } else {
        return i64(n2);
      }
    }
  }
  value.number = number;
  function bytes(bytes2) {
    return _concat(_serializeNumber(2, bytes2.byteLength), bytes2);
  }
  value.bytes = bytes;
  function string(str) {
    return _serializeString(str);
  }
  value.string = string;
  function array(items) {
    return _concat(_serializeNumber(4, items.length), ...items);
  }
  value.array = array;
  function map(items, stable = false) {
    if (!(items instanceof Map)) {
      items = new Map(Object.entries(items));
    }
    let entries = Array.from(items.entries());
    if (stable) {
      entries = entries.sort(([keyA], [keyB]) => keyA.localeCompare(keyB));
    }
    return _concat(_serializeNumber(5, items.size), ...entries.map(([k2, v3]) => _concat(_serializeString(k2), v3)));
  }
  value.map = map;
  function singleFloat(f2) {
    const single = new Float32Array([f2]);
    return _concat(new Uint8Array([(7 << 5) + 26]), new Uint8Array(single.buffer));
  }
  value.singleFloat = singleFloat;
  function doubleFloat(f2) {
    const single = new Float64Array([f2]);
    return _concat(new Uint8Array([(7 << 5) + 27]), new Uint8Array(single.buffer));
  }
  value.doubleFloat = doubleFloat;
  function bool(v3) {
    return v3 ? true_() : false_();
  }
  value.bool = bool;
  function true_() {
    return raw(new Uint8Array([(7 << 5) + 21]));
  }
  value.true_ = true_;
  function false_() {
    return raw(new Uint8Array([(7 << 5) + 20]));
  }
  value.false_ = false_;
  function null_() {
    return raw(new Uint8Array([(7 << 5) + 22]));
  }
  value.null_ = null_;
  function undefined_() {
    return raw(new Uint8Array([(7 << 5) + 23]));
  }
  value.undefined_ = undefined_;
  return value;
}
var hasRequiredSerializer;
function requireSerializer() {
  if (hasRequiredSerializer) return serializer$1;
  hasRequiredSerializer = 1;
  var __importStar = serializer$1 && serializer$1.__importStar || function(mod2) {
    if (mod2 && mod2.__esModule) return mod2;
    var result = {};
    if (mod2 != null) {
      for (var k2 in mod2) if (Object.hasOwnProperty.call(mod2, k2)) result[k2] = mod2[k2];
    }
    result["default"] = mod2;
    return result;
  };
  Object.defineProperty(serializer$1, "__esModule", { value: true });
  const cbor = __importStar(requireValue());
  const BufferClasses = [
    ArrayBuffer,
    Uint8Array,
    Uint16Array,
    Uint32Array,
    Int8Array,
    Int16Array,
    Int32Array,
    Float32Array,
    Float64Array
  ];
  class JsonDefaultCborEncoder {
    // @param _serializer The CBOR Serializer to use.
    // @param _stable Whether or not keys from objects should be sorted (stable). This is
    //     particularly useful when testing encodings between JSON objects.
    constructor(_serializer, _stable = false) {
      this._serializer = _serializer;
      this._stable = _stable;
      this.name = "jsonDefault";
      this.priority = -100;
    }
    match(value2) {
      return ["undefined", "boolean", "number", "string", "object"].indexOf(typeof value2) != -1;
    }
    encode(value2) {
      switch (typeof value2) {
        case "undefined":
          return cbor.undefined_();
        case "boolean":
          return cbor.bool(value2);
        case "number":
          if (Math.floor(value2) === value2) {
            return cbor.number(value2);
          } else {
            return cbor.doubleFloat(value2);
          }
        case "string":
          return cbor.string(value2);
        case "object":
          if (value2 === null) {
            return cbor.null_();
          } else if (Array.isArray(value2)) {
            return cbor.array(value2.map((x2) => this._serializer.serializeValue(x2)));
          } else if (BufferClasses.find((x2) => value2 instanceof x2)) {
            return cbor.bytes(value2.buffer);
          } else if (Object.getOwnPropertyNames(value2).indexOf("toJSON") !== -1) {
            return this.encode(value2.toJSON());
          } else if (value2 instanceof Map) {
            const m2 = /* @__PURE__ */ new Map();
            for (const [key, item] of value2.entries()) {
              m2.set(key, this._serializer.serializeValue(item));
            }
            return cbor.map(m2, this._stable);
          } else {
            const m2 = /* @__PURE__ */ new Map();
            for (const [key, item] of Object.entries(value2)) {
              m2.set(key, this._serializer.serializeValue(item));
            }
            return cbor.map(m2, this._stable);
          }
        default:
          throw new Error("Invalid value.");
      }
    }
  }
  serializer$1.JsonDefaultCborEncoder = JsonDefaultCborEncoder;
  class ToCborEncoder {
    constructor() {
      this.name = "cborEncoder";
      this.priority = -90;
    }
    match(value2) {
      return typeof value2 == "object" && typeof value2["toCBOR"] == "function";
    }
    encode(value2) {
      return value2.toCBOR();
    }
  }
  serializer$1.ToCborEncoder = ToCborEncoder;
  class CborSerializer {
    constructor() {
      this._encoders = /* @__PURE__ */ new Set();
    }
    static withDefaultEncoders(stable = false) {
      const s2 = new this();
      s2.addEncoder(new JsonDefaultCborEncoder(s2, stable));
      s2.addEncoder(new ToCborEncoder());
      return s2;
    }
    removeEncoder(name) {
      for (const encoder2 of this._encoders.values()) {
        if (encoder2.name == name) {
          this._encoders.delete(encoder2);
        }
      }
    }
    addEncoder(encoder2) {
      this._encoders.add(encoder2);
    }
    getEncoderFor(value2) {
      let chosenEncoder = null;
      for (const encoder2 of this._encoders) {
        if (!chosenEncoder || encoder2.priority > chosenEncoder.priority) {
          if (encoder2.match(value2)) {
            chosenEncoder = encoder2;
          }
        }
      }
      if (chosenEncoder === null) {
        throw new Error("Could not find an encoder for value.");
      }
      return chosenEncoder;
    }
    serializeValue(value2) {
      return this.getEncoderFor(value2).encode(value2);
    }
    serialize(value2) {
      return this.serializeValue(value2);
    }
  }
  serializer$1.CborSerializer = CborSerializer;
  class SelfDescribeCborSerializer extends CborSerializer {
    serialize(value2) {
      return cbor.raw(new Uint8Array([
        // Self describe CBOR.
        ...new Uint8Array([217, 217, 247]),
        ...new Uint8Array(super.serializeValue(value2))
      ]));
    }
  }
  serializer$1.SelfDescribeCborSerializer = SelfDescribeCborSerializer;
  return serializer$1;
}
var hasRequiredSrc;
function requireSrc() {
  if (hasRequiredSrc) return src;
  hasRequiredSrc = 1;
  (function(exports) {
    function __export(m2) {
      for (var p in m2) if (!exports.hasOwnProperty(p)) exports[p] = m2[p];
    }
    var __importStar = src && src.__importStar || function(mod2) {
      if (mod2 && mod2.__esModule) return mod2;
      var result = {};
      if (mod2 != null) {
        for (var k2 in mod2) if (Object.hasOwnProperty.call(mod2, k2)) result[k2] = mod2[k2];
      }
      result["default"] = mod2;
      return result;
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    __export(requireSerializer());
    const value2 = __importStar(requireValue());
    exports.value = value2;
  })(src);
  return src;
}
var srcExports = requireSrc();
class PrincipalEncoder {
  get name() {
    return "Principal";
  }
  get priority() {
    return 0;
  }
  match(value2) {
    return value2 && value2._isPrincipal === true;
  }
  encode(v3) {
    return srcExports.value.bytes(v3.toUint8Array());
  }
}
class BufferEncoder {
  get name() {
    return "Buffer";
  }
  get priority() {
    return 1;
  }
  match(value2) {
    return value2 instanceof ArrayBuffer || ArrayBuffer.isView(value2);
  }
  encode(v3) {
    return srcExports.value.bytes(new Uint8Array(v3));
  }
}
class BigIntEncoder {
  get name() {
    return "BigInt";
  }
  get priority() {
    return 1;
  }
  match(value2) {
    return typeof value2 === `bigint`;
  }
  encode(v3) {
    if (v3 > BigInt(0)) {
      return srcExports.value.tagged(2, srcExports.value.bytes(fromHex(v3.toString(16))));
    } else {
      return srcExports.value.tagged(3, srcExports.value.bytes(fromHex((BigInt("-1") * v3).toString(16))));
    }
  }
}
const serializer = srcExports.SelfDescribeCborSerializer.withDefaultEncoders(true);
serializer.addEncoder(new PrincipalEncoder());
serializer.addEncoder(new BufferEncoder());
serializer.addEncoder(new BigIntEncoder());
var CborTag;
(function(CborTag2) {
  CborTag2[CborTag2["Uint64LittleEndian"] = 71] = "Uint64LittleEndian";
  CborTag2[CborTag2["Semantic"] = 55799] = "Semantic";
})(CborTag || (CborTag = {}));
function encode(value2) {
  return serializer.serialize(value2);
}
function decodePositiveBigInt(buf) {
  const len = buf.byteLength;
  let res = BigInt(0);
  for (let i3 = 0; i3 < len; i3++) {
    res = res * BigInt(256) + BigInt(buf[i3]);
  }
  return res;
}
class Uint8ArrayDecoder extends borc.Decoder {
  createByteString(raw) {
    return concat$1(...raw);
  }
  createByteStringFromHeap(start, end) {
    if (start === end) {
      return new ArrayBuffer(0);
    }
    return new Uint8Array(this._heap.slice(start, end));
  }
}
function decode(input) {
  const buffer2 = new Uint8Array(input);
  const decoder2 = new Uint8ArrayDecoder({
    size: buffer2.byteLength,
    tags: {
      // Override tags 2 and 3 for BigInt support (borc supports only BigNumber).
      2: (val) => decodePositiveBigInt(val),
      3: (val) => -decodePositiveBigInt(val),
      [CborTag.Semantic]: (value2) => value2
    }
  });
  try {
    return decoder2.decodeFirst(buffer2);
  } catch (e5) {
    throw new Error(`Failed to decode CBOR: ${e5}, input: ${toHex(buffer2)}`);
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
var SubmitRequestType;
(function(SubmitRequestType2) {
  SubmitRequestType2["Call"] = "call";
})(SubmitRequestType || (SubmitRequestType = {}));
function makeNonce() {
  const buffer2 = new ArrayBuffer(16);
  const view = new DataView(buffer2);
  const rand1 = randomNumber();
  const rand2 = randomNumber();
  const rand3 = randomNumber();
  const rand4 = randomNumber();
  view.setUint32(0, rand1);
  view.setUint32(4, rand2);
  view.setUint32(8, rand3);
  view.setUint32(12, rand4);
  return buffer2;
}
const NANOSECONDS_PER_MILLISECONDS = BigInt(1e6);
const REPLICA_PERMITTED_DRIFT_MILLISECONDS = 60 * 1e3;
class Expiry {
  constructor(deltaInMSec) {
    if (deltaInMSec < 90 * 1e3) {
      const raw_value2 = BigInt(Date.now() + deltaInMSec) * NANOSECONDS_PER_MILLISECONDS;
      const ingress_as_seconds2 = raw_value2 / BigInt(1e9);
      this._value = ingress_as_seconds2 * BigInt(1e9);
      return;
    }
    const raw_value = BigInt(Math.floor(Date.now() + deltaInMSec - REPLICA_PERMITTED_DRIFT_MILLISECONDS)) * NANOSECONDS_PER_MILLISECONDS;
    const ingress_as_seconds = raw_value / BigInt(1e9);
    const ingress_as_minutes = ingress_as_seconds / BigInt(60);
    const rounded_down_nanos = ingress_as_minutes * BigInt(60) * BigInt(1e9);
    this._value = rounded_down_nanos;
  }
  toCBOR() {
    return srcExports.value.u64(this._value.toString(16), 16);
  }
  toHash() {
    return lebEncode(this._value);
  }
}
function makeNonceTransform(nonceFn = makeNonce) {
  return async (request2) => {
    const headers = request2.request.headers;
    request2.request.headers = headers;
    if (request2.endpoint === "call") {
      request2.body.nonce = nonceFn();
    }
  };
}
function httpHeadersTransform(headers) {
  const headerFields = [];
  headers.forEach((value2, key) => {
    headerFields.push([key, value2]);
  });
  return headerFields;
}
class AgentHTTPResponseError extends AgentError {
  constructor(message, response) {
    super(message);
    this.response = response;
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
class AgentCallError extends AgentError {
  constructor(message, response, requestId, senderPubkey, senderSig, ingressExpiry) {
    super(message);
    this.response = response;
    this.requestId = requestId;
    this.senderPubkey = senderPubkey;
    this.senderSig = senderSig;
    this.ingressExpiry = ingressExpiry;
    this.name = "AgentCallError";
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
class AgentQueryError extends AgentError {
  constructor(message, response, requestId, senderPubkey, senderSig, ingressExpiry) {
    super(message);
    this.response = response;
    this.requestId = requestId;
    this.senderPubkey = senderPubkey;
    this.senderSig = senderSig;
    this.ingressExpiry = ingressExpiry;
    this.name = "AgentQueryError";
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
class AgentReadStateError extends AgentError {
  constructor(message, response, requestId, senderPubkey, senderSig, ingressExpiry) {
    super(message);
    this.response = response;
    this.requestId = requestId;
    this.senderPubkey = senderPubkey;
    this.senderSig = senderSig;
    this.ingressExpiry = ingressExpiry;
    this.name = "AgentReadStateError";
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
const _0n$7 = /* @__PURE__ */ BigInt(0);
const _1n$8 = /* @__PURE__ */ BigInt(1);
function _abool2(value2, title = "") {
  if (typeof value2 !== "boolean") {
    const prefix = title && `"${title}"`;
    throw new Error(prefix + "expected boolean, got type=" + typeof value2);
  }
  return value2;
}
function _abytes2(value2, length, title = "") {
  const bytes = isBytes(value2);
  const len = value2 == null ? void 0 : value2.length;
  const needsLen = length !== void 0;
  if (!bytes || needsLen && len !== length) {
    const prefix = title && `"${title}" `;
    const ofLen = needsLen ? ` of length ${length}` : "";
    const got = bytes ? `length=${len}` : `type=${typeof value2}`;
    throw new Error(prefix + "expected Uint8Array" + ofLen + ", got " + got);
  }
  return value2;
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
function mod(a, b2) {
  const result = a % b2;
  return result >= _0n$6 ? result : b2 + result;
}
function pow2(x2, power, modulo) {
  let res = x2;
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
  let a = mod(number, modulo);
  let b2 = modulo;
  let x2 = _0n$6, u2 = _1n$7;
  while (a !== _0n$6) {
    const q = b2 / a;
    const r2 = b2 % a;
    const m2 = x2 - u2 * q;
    b2 = a, a = r2, x2 = u2, u2 = m2;
  }
  const gcd = b2;
  if (gcd !== _1n$7)
    throw new Error("invert: does not exist");
  return mod(x2, modulo);
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
  let Q = P2 - _1n$7;
  let S2 = 0;
  while (Q % _2n$6 === _0n$6) {
    Q /= _2n$6;
    S2++;
  }
  let Z = _2n$6;
  const _Fp = Field(P2);
  while (FpLegendre(_Fp, Z) === 1) {
    if (Z++ > 1e3)
      throw new Error("Cannot find square root: probably non-prime P");
  }
  if (S2 === 1)
    return sqrt3mod4;
  let cc = _Fp.pow(Z, Q);
  const Q1div2 = (Q + _1n$7) / _2n$6;
  return function tonelliSlow(Fp3, n2) {
    if (Fp3.is0(n2))
      return n2;
    if (FpLegendre(Fp3, n2) !== 1)
      throw new Error("Cannot find square root");
    let M2 = S2;
    let c = Fp3.mul(Fp3.ONE, cc);
    let t3 = Fp3.pow(n2, Q);
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
      const b2 = Fp3.pow(c, exponent);
      M2 = i3;
      c = Fp3.sqr(b2);
      t3 = Fp3.mul(t3, c);
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
  let p = Fp3.ONE;
  let d2 = num;
  while (power > _0n$6) {
    if (power & _1n$7)
      p = Fp3.mul(p, d2);
    d2 = Fp3.sqr(d2);
    power >>= _1n$7;
  }
  return p;
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
    cmov: (a, b2, c) => c ? b2 : a
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
function normalizeZ(c, points) {
  const invertedZs = FpInvertBatch(c.Fp, points.map((p) => p.Z));
  return points.map((p, i3) => c.fromAffine(p.toAffine(invertedZs[i3])));
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
function validateMSMPoints(points, c) {
  if (!Array.isArray(points))
    throw new Error("array expected");
  points.forEach((p, i3) => {
    if (!(p instanceof c))
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
  _unsafeLadder(elm, n2, p = this.ZERO) {
    let d2 = elm;
    while (n2 > _0n$5) {
      if (n2 & _1n$6)
        p = p.add(d2);
      d2 = d2.double();
      n2 >>= _1n$6;
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
  precomputeWindow(point, W2) {
    const { windows, windowSize } = calcWOpts(W2, this.bits);
    const points = [];
    let p = point;
    let base = p;
    for (let window2 = 0; window2 < windows; window2++) {
      base = p;
      points.push(base);
      for (let i3 = 1; i3 < windowSize; i3++) {
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
  wNAF(W2, precomputes, n2) {
    if (!this.Fn.isValid(n2))
      throw new Error("invalid scalar");
    let p = this.ZERO;
    let f2 = this.BASE;
    const wo = calcWOpts(W2, this.bits);
    for (let window2 = 0; window2 < wo.windows; window2++) {
      const { nextN, offset, isZero, isNeg, isNegF, offsetF } = calcOffsets(n2, window2, wo);
      n2 = nextN;
      if (isZero) {
        f2 = f2.add(negateCt(isNegF, precomputes[offsetF]));
      } else {
        p = p.add(negateCt(isNeg, precomputes[offset]));
      }
    }
    assert0(n2);
    return { p, f: f2 };
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
  for (const p of ["p", "n", "h"]) {
    const val = CURVE[p];
    if (!(typeof val === "bigint" && val > _0n$5))
      throw new Error(`CURVE.${p} must be positive bigint`);
  }
  const Fp3 = createField(CURVE.p, curveOpts.Fp, FpFnLE);
  const Fn = createField(CURVE.n, curveOpts.Fn, FpFnLE);
  const _b2 = type === "weierstrass" ? "b" : "d";
  const params = ["Gx", "Gy", "a", _b2];
  for (const p of params) {
    if (!Fp3.isValid(CURVE[p]))
      throw new Error(`CURVE.${p} must be valid field element of CURVE.Fp`);
  }
  CURVE = Object.freeze(Object.assign({}, CURVE));
  return { CURVE, Fp: Fp3, Fn };
}
const os2ip = bytesToNumberBE;
function i2osp(value2, length) {
  anum(value2);
  anum(length);
  if (value2 < 0 || value2 >= 1 << 8 * length)
    throw new Error("invalid I2OSP input: " + value2);
  const res = Array.from({ length }).fill(0);
  for (let i3 = length - 1; i3 >= 0; i3--) {
    res[i3] = value2 & 255;
    value2 >>>= 8;
  }
  return new Uint8Array(res);
}
function strxor(a, b2) {
  const arr = new Uint8Array(a.length);
  for (let i3 = 0; i3 < a.length; i3++) {
    arr[i3] = a[i3] ^ b2[i3];
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
  const { p, k: k2, m: m2, hash: hash2, expand, DST } = options;
  if (!isHash(options.hash))
    throw new Error("expected valid hash");
  abytes(msg);
  anum(count);
  const log2p = p.toString(2).length;
  const L2 = Math.ceil((log2p + k2) / 8);
  const len_in_bytes = count * m2 * L2;
  let prb;
  if (expand === "xmd") {
    prb = expand_message_xmd(msg, DST, len_in_bytes, hash2);
  } else if (expand === "xof") {
    prb = expand_message_xof(msg, DST, len_in_bytes, k2, hash2);
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
      e5[j2] = mod(os2ip(tv), p);
    }
    u2[i3] = e5;
  }
  return u2;
}
function isogenyMap(field, map) {
  const coeff = map.map((i3) => Array.from(i3).reverse());
  return (x2, y) => {
    const [xn, xd, yn, yd] = coeff.map((val) => val.reduce((acc, i3) => field.add(field.mul(acc, x2), i3)));
    const [xd_inv, yd_inv] = FpInvertBatch(field, [xd, yd], true);
    x2 = field.mul(xn, xd_inv);
    y = field.mul(y, field.mul(yn, yd_inv));
    return { x: x2, y };
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
    const { x: x2, y } = point.toAffine();
    const bx = Fp3.toBytes(x2);
    _abool2(isCompressed, "isCompressed");
    if (isCompressed) {
      assertCompressionIsSupported();
      const hasEvenY = !Fp3.isOdd(y);
      return concatBytes(pprefix(hasEvenY), bx);
    } else {
      return concatBytes(Uint8Array.of(4), bx, Fp3.toBytes(y));
    }
  }
  function pointFromBytes(bytes) {
    _abytes2(bytes, void 0, "Point");
    const { publicKey: comp, publicKeyUncompressed: uncomp } = lengths;
    const length = bytes.length;
    const head = bytes[0];
    const tail = bytes.subarray(1);
    if (length === comp && (head === 2 || head === 3)) {
      const x2 = Fp3.fromBytes(tail);
      if (!Fp3.isValid(x2))
        throw new Error("bad point: is not on curve, wrong x");
      const y2 = weierstrassEquation(x2);
      let y;
      try {
        y = Fp3.sqrt(y2);
      } catch (sqrtError) {
        const err = sqrtError instanceof Error ? ": " + sqrtError.message : "";
        throw new Error("bad point: is not on curve, sqrt error" + err);
      }
      assertCompressionIsSupported();
      const isYOdd = Fp3.isOdd(y);
      const isHeadOdd = (head & 1) === 1;
      if (isHeadOdd !== isYOdd)
        y = Fp3.neg(y);
      return { x: x2, y };
    } else if (length === uncomp && head === 4) {
      const L2 = Fp3.BYTES;
      const x2 = Fp3.fromBytes(tail.subarray(0, L2));
      const y = Fp3.fromBytes(tail.subarray(L2, L2 * 2));
      if (!isValidXY(x2, y))
        throw new Error("bad point: is not on curve");
      return { x: x2, y };
    } else {
      throw new Error(`bad point: got length ${length}, expected compressed=${comp} or uncompressed=${uncomp}`);
    }
  }
  const encodePoint = extraOpts.toBytes || pointToBytes;
  const decodePoint = extraOpts.fromBytes || pointFromBytes;
  function weierstrassEquation(x2) {
    const x22 = Fp3.sqr(x2);
    const x3 = Fp3.mul(x22, x2);
    return Fp3.add(Fp3.add(x3, Fp3.mul(x2, CURVE.a)), CURVE.b);
  }
  function isValidXY(x2, y) {
    const left = Fp3.sqr(y);
    const right = weierstrassEquation(x2);
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
  const toAffineMemo = memoized((p, iz) => {
    const { X, Y, Z } = p;
    if (Fp3.eql(Z, Fp3.ONE))
      return { x: X, y: Y };
    const is0 = p.is0();
    if (iz == null)
      iz = is0 ? Fp3.ONE : Fp3.inv(Z);
    const x2 = Fp3.mul(X, iz);
    const y = Fp3.mul(Y, iz);
    const zz = Fp3.mul(Z, iz);
    if (is0)
      return { x: Fp3.ZERO, y: Fp3.ZERO };
    if (!Fp3.eql(zz, Fp3.ONE))
      throw new Error("invZ was invalid");
    return { x: x2, y };
  });
  const assertValidMemo = memoized((p) => {
    if (p.is0()) {
      if (extraOpts.allowInfinityPoint && !Fp3.is0(p.Y))
        return;
      throw new Error("bad point: ZERO");
    }
    const { x: x2, y } = p.toAffine();
    if (!Fp3.isValid(x2) || !Fp3.isValid(y))
      throw new Error("bad point: x or y not field elements");
    if (!isValidXY(x2, y))
      throw new Error("bad point: equation left != right");
    if (!p.isTorsionFree())
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
    constructor(X, Y, Z) {
      this.X = acoord("x", X);
      this.Y = acoord("y", Y, true);
      this.Z = acoord("z", Z);
      Object.freeze(this);
    }
    static CURVE() {
      return CURVE;
    }
    /** Does NOT validate if the point is valid. Use `.assertValidity()`. */
    static fromAffine(p) {
      const { x: x2, y } = p || {};
      if (!p || !Fp3.isValid(x2) || !Fp3.isValid(y))
        throw new Error("invalid affine point");
      if (p instanceof Point)
        throw new Error("projective point not allowed");
      if (Fp3.is0(x2) && Fp3.is0(y))
        return Point.ZERO;
      return new Point(x2, y, Fp3.ONE);
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
      const { y } = this.toAffine();
      if (!Fp3.isOdd)
        throw new Error("Field doesn't support isOdd");
      return !Fp3.isOdd(y);
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
      const { a, b: b2 } = CURVE;
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
      X3 = Fp3.mul(a, Z3);
      Y3 = Fp3.mul(b3, t22);
      Y3 = Fp3.add(X3, Y3);
      X3 = Fp3.sub(t1, Y3);
      Y3 = Fp3.add(t1, Y3);
      Y3 = Fp3.mul(X3, Y3);
      X3 = Fp3.mul(t3, X3);
      Z3 = Fp3.mul(b3, Z3);
      t22 = Fp3.mul(a, t22);
      t3 = Fp3.sub(t0, t22);
      t3 = Fp3.mul(a, t3);
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
      const a = CURVE.a;
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
      Z3 = Fp3.mul(a, t4);
      X3 = Fp3.mul(b3, t22);
      Z3 = Fp3.add(X3, Z3);
      X3 = Fp3.sub(t1, Z3);
      Z3 = Fp3.add(t1, Z3);
      Y3 = Fp3.mul(X3, Z3);
      t1 = Fp3.add(t0, t0);
      t1 = Fp3.add(t1, t0);
      t22 = Fp3.mul(a, t22);
      t4 = Fp3.mul(b3, t4);
      t1 = Fp3.add(t1, t22);
      t22 = Fp3.sub(t0, t22);
      t22 = Fp3.mul(a, t22);
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
      const mul = (n2) => wnaf.cached(this, n2, (p) => normalizeZ(Point, p));
      if (endo2) {
        const { k1neg, k1, k2neg, k2 } = splitEndoScalarN(scalar);
        const { p: k1p, f: k1f } = mul(k1);
        const { p: k2p, f: k2f } = mul(k2);
        fake = k1f.add(k2f);
        point = finishEndo(endo2.beta, k1p, k2p, k1neg, k2neg);
      } else {
        const { p, f: f2 } = mul(scalar);
        point = p;
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
      const p = this;
      if (!Fn.isValid(sc))
        throw new Error("invalid scalar: out of range");
      if (sc === _0n$4 || p.is0())
        return Point.ZERO;
      if (sc === _1n$5)
        return p;
      if (wnaf.hasCache(this))
        return this.multiply(sc);
      if (endo2) {
        const { k1neg, k1, k2neg, k2 } = splitEndoScalarN(sc);
        const { p1, p2 } = mulEndoUnsafe(Point, p, k1, k2);
        return finishEndo(endo2.beta, p1, p2, k1neg, k2neg);
      } else {
        return wnaf.unsafe(p, sc);
      }
    }
    multiplyAndAddUnsafe(Q, a, b2) {
      const sum = this.multiplyUnsafe(a).add(Q.multiplyUnsafe(b2));
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
function SWUFpSqrtRatio(Fp3, Z) {
  const q = Fp3.ORDER;
  let l = _0n$4;
  for (let o2 = q - _1n$5; o2 % _2n$5 === _0n$4; o2 /= _2n$5)
    l += _1n$5;
  const c1 = l;
  const _2n_pow_c1_1 = _2n$5 << c1 - _1n$5 - _1n$5;
  const _2n_pow_c1 = _2n_pow_c1_1 * _2n$5;
  const c2 = (q - _1n$5) / _2n_pow_c1;
  const c3 = (c2 - _1n$5) / _2n$5;
  const c4 = _2n_pow_c1 - _1n$5;
  const c5 = _2n_pow_c1_1;
  const c6 = Fp3.pow(Z, c2);
  const c7 = Fp3.pow(Z, (c2 + _1n$5) / _2n$5);
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
    const c22 = Fp3.sqrt(Fp3.neg(Z));
    sqrtRatio = (u2, v3) => {
      let tv1 = Fp3.sqr(v3);
      const tv2 = Fp3.mul(u2, v3);
      tv1 = Fp3.mul(tv1, tv2);
      let y1 = Fp3.pow(tv1, c12);
      y1 = Fp3.mul(y1, tv2);
      const y2 = Fp3.mul(y1, c22);
      const tv3 = Fp3.mul(Fp3.sqr(y1), v3);
      const isQR = Fp3.eql(tv3, u2);
      let y = Fp3.cmov(y2, y1, isQR);
      return { isValid: isQR, value: y };
    };
  }
  return sqrtRatio;
}
function mapToCurveSimpleSWU(Fp3, opts) {
  validateField(Fp3);
  const { A: A3, B: B2, Z } = opts;
  if (!Fp3.isValid(A3) || !Fp3.isValid(B2) || !Fp3.isValid(Z))
    throw new Error("mapToCurveSimpleSWU: invalid opts");
  const sqrtRatio = SWUFpSqrtRatio(Fp3, Z);
  if (!Fp3.isOdd)
    throw new Error("Field does not have .isOdd()");
  return (u2) => {
    let tv1, tv2, tv3, tv4, tv5, tv6, x2, y;
    tv1 = Fp3.sqr(u2);
    tv1 = Fp3.mul(tv1, Z);
    tv2 = Fp3.sqr(tv1);
    tv2 = Fp3.add(tv2, tv1);
    tv3 = Fp3.add(tv2, Fp3.ONE);
    tv3 = Fp3.mul(tv3, B2);
    tv4 = Fp3.cmov(Z, Fp3.neg(tv2), !Fp3.eql(tv2, Fp3.ZERO));
    tv4 = Fp3.mul(tv4, A3);
    tv2 = Fp3.sqr(tv3);
    tv6 = Fp3.sqr(tv4);
    tv5 = Fp3.mul(tv6, A3);
    tv2 = Fp3.add(tv2, tv5);
    tv2 = Fp3.mul(tv2, tv3);
    tv6 = Fp3.mul(tv6, tv4);
    tv5 = Fp3.mul(tv6, B2);
    tv2 = Fp3.add(tv2, tv5);
    x2 = Fp3.mul(tv1, tv3);
    const { isValid, value: value2 } = sqrtRatio(tv2, tv6);
    y = Fp3.mul(tv1, u2);
    y = Fp3.mul(y, value2);
    x2 = Fp3.cmov(x2, tv3, isValid);
    y = Fp3.cmov(y, value2, isValid);
    const e1 = Fp3.isOdd(u2) === Fp3.isOdd(y);
    y = Fp3.cmov(Fp3.neg(y), y, e1);
    const tv4_inv = FpInvertBatch(Fp3, [tv4], true)[0];
    x2 = Fp3.mul(x2, tv4_inv);
    return { x: x2, y };
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
function weierstrassPoints(c) {
  const { CURVE, curveOpts } = _weierstrass_legacy_opts_to_new(c);
  const Point = weierstrassN(CURVE, curveOpts);
  return _weierstrass_new_output_to_legacy(c, Point);
}
function _weierstrass_legacy_opts_to_new(c) {
  const CURVE = {
    a: c.a,
    b: c.b,
    p: c.Fp.ORDER,
    n: c.n,
    h: c.h,
    Gx: c.Gx,
    Gy: c.Gy
  };
  const Fp3 = c.Fp;
  let allowedLengths = c.allowedPrivateKeyLengths ? Array.from(new Set(c.allowedPrivateKeyLengths.map((l) => Math.ceil(l / 2)))) : void 0;
  const Fn = Field(CURVE.n, {
    BITS: c.nBitLength,
    allowedLengths,
    modFromBytes: c.wrapPrivateKey
  });
  const curveOpts = {
    Fp: Fp3,
    Fn,
    allowInfinityPoint: c.allowInfinityPoint,
    endo: c.endo,
    isTorsionFree: c.isTorsionFree,
    clearCofactor: c.clearCofactor,
    fromBytes: c.fromBytes,
    toBytes: c.toBytes
  };
  return { CURVE, curveOpts };
}
function _legacyHelperEquat(Fp3, a, b2) {
  function weierstrassEquation(x2) {
    const x22 = Fp3.sqr(x2);
    const x3 = Fp3.mul(x22, x2);
    return Fp3.add(Fp3.add(x3, Fp3.mul(x2, a)), b2);
  }
  return weierstrassEquation;
}
function _weierstrass_new_output_to_legacy(c, Point) {
  const { Fp: Fp3, Fn } = Point;
  function isWithinCurveOrder(num) {
    return inRange(num, _1n$5, Fn.ORDER);
  }
  const weierstrassEquation = _legacyHelperEquat(Fp3, c.a, c.b);
  return Object.assign({}, {
    CURVE: c,
    Point,
    ProjectivePoint: Point,
    normPrivateKeyToScalar: (key) => _normFnElement(Fn, key),
    weierstrassEquation,
    isWithinCurveOrder
  });
}
/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
const _0n$3 = BigInt(0), _1n$4 = BigInt(1), _2n$4 = BigInt(2), _3n$2 = BigInt(3);
function NAfDecomposition(a) {
  const res = [];
  for (; a > _1n$4; a >>= _1n$4) {
    if ((a & _1n$4) === _0n$3)
      res.unshift(0);
    else if ((a & _3n$2) === _3n$2) {
      res.unshift(-1);
      a += _1n$4;
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
    const p = point;
    const { x: x2, y } = p.toAffine();
    const Qx = x2, Qy = y, negQy = Fp22.neg(y);
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
  function pairing(Q, P2, withFinalExponent = true) {
    return pairingBatch([{ g1: Q, g2: P2 }], withFinalExponent);
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
  const pair = !isSigG1 ? (a, b2) => ({ g1: a, g2: b2 }) : (a, b2) => ({ g1: b2, g2: a });
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
      const agg = publicKeys.reduce((sum, p) => sum.add(p), PubCurve.Point.ZERO);
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
  const utils2 = {
    randomSecretKey,
    randomPrivateKey: randomSecretKey,
    calcPairingPrecomputes
  };
  const { ShortSignature } = CURVE.G1;
  const { Signature } = CURVE.G2;
  function normP1Hash(point, htfOpts) {
    return point instanceof G1.Point ? point : shortSignatures.hash(ensureBytes("point", point), htfOpts == null ? void 0 : htfOpts.DST);
  }
  function normP2Hash(point, htfOpts) {
    return point instanceof G2.Point ? point : longSignatures.hash(ensureBytes("point", point), htfOpts == null ? void 0 : htfOpts.DST);
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
    utils: utils2,
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
    const a = BigInt(i3 + 1);
    const powers = [];
    for (let j2 = 0, qPower = _1n$3; j2 < degree; j2++) {
      const power = (a * qPower - a) / _divisor % towerModulus;
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
  function psi(x2, y) {
    const x22 = Fp22.mul(Fp22.frobeniusMap(x2, 1), PSI_X);
    const y2 = Fp22.mul(Fp22.frobeniusMap(y, 1), PSI_Y);
    return [x22, y2];
  }
  const PSI2_X = Fp22.pow(base, (Fp3.ORDER ** _2n$3 - _1n$3) / _3n$1);
  const PSI2_Y = Fp22.pow(base, (Fp3.ORDER ** _2n$3 - _1n$3) / _2n$3);
  if (!Fp22.eql(PSI2_Y, Fp22.neg(Fp22.ONE)))
    throw new Error("psiFrobenius: PSI2_Y!==-1");
  function psi2(x2, y) {
    return [Fp22.mul(x2, PSI2_X), Fp22.neg(y)];
  }
  const mapAffine = (fn) => (c, P2) => {
    const affine = P2.toAffine();
    const p = fn(affine.x, affine.y);
    return c.fromAffine({ x: p[0], y: p[1] });
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
    const a = Fp3.add(c0, c1);
    const b2 = Fp3.sub(c0, c1);
    const c = Fp3.add(c0, c0);
    return { c0: Fp3.mul(a, b2), c1: Fp3.mul(c, c1) };
  }
  // NonNormalized stuff
  addN(a, b2) {
    return this.add(a, b2);
  }
  subN(a, b2) {
    return this.sub(a, b2);
  }
  mulN(a, b2) {
    return this.mul(a, b2);
  }
  sqrN(a) {
    return this.sqr(a);
  }
  // Why inversion for bigint inside Fp instead of Fp2? it is even used in that context?
  div(lhs, rhs) {
    const { Fp: Fp3 } = this;
    return this.mul(lhs, typeof rhs === "bigint" ? Fp3.inv(Fp3.create(rhs)) : this.inv(rhs));
  }
  inv({ c0: a, c1: b2 }) {
    const { Fp: Fp3 } = this;
    const factor = Fp3.inv(Fp3.create(a * a + b2 * b2));
    return { c0: Fp3.mul(factor, Fp3.create(a)), c1: Fp3.mul(factor, Fp3.create(-b2)) };
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
    const a = Fp3.sqrt(Fp3.sub(Fp3.sqr(c0), Fp3.mul(Fp3.sqr(c1), this.Fp_NONRESIDUE)));
    let d2 = Fp3.mul(Fp3.add(a, c0), this.Fp_div2);
    const legendre = FpLegendre(Fp3, d2);
    if (legendre === -1)
      d2 = Fp3.sub(d2, a);
    const a0 = Fp3.sqrt(d2);
    const candidateSqrt = Fp22.create({ c0: a0, c1: Fp3.div(Fp3.mul(c1, this.Fp_div2), a0) });
    if (!Fp22.eql(Fp22.sqr(candidateSqrt), num))
      throw new Error("Cannot find square root");
    const x1 = candidateSqrt;
    const x2 = Fp22.neg(x1);
    const { re: re1, im: im1 } = Fp22.reim(x1);
    const { re: re2, im: im2 } = Fp22.reim(x2);
    if (im1 > im2 || im1 === im2 && re1 > re2)
      return x1;
    return x2;
  }
  // Same as sgn0_m_eq_2 in RFC 9380
  isOdd(x2) {
    const { re: x0, im: x1 } = this.reim(x2);
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
  cmov({ c0, c1 }, { c0: r0, c1: r1 }, c) {
    return {
      c0: this.Fp.cmov(c0, r0, c),
      c1: this.Fp.cmov(c1, r1, c)
    };
  }
  reim({ c0, c1 }) {
    return { re: c0, im: c1 };
  }
  Fp4Square(a, b2) {
    const Fp22 = this;
    const a2 = Fp22.sqr(a);
    const b22 = Fp22.sqr(b2);
    return {
      first: Fp22.add(Fp22.mulByNonresidue(b22), a2),
      // b² * Nonresidue + a²
      second: Fp22.sub(Fp22.sub(Fp22.sqr(Fp22.add(a, b2)), a2), b22)
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
  addN(a, b2) {
    return this.add(a, b2);
  }
  subN(a, b2) {
    return this.sub(a, b2);
  }
  mulN(a, b2) {
    return this.mul(a, b2);
  }
  sqrN(a) {
    return this.sqr(a);
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
    const B2 = Fp22.BYTES;
    return {
      c0: Fp22.fromBytes(b2.subarray(0, B2)),
      c1: Fp22.fromBytes(b2.subarray(B2, B2 * 2)),
      c2: Fp22.fromBytes(b2.subarray(2 * B2))
    };
  }
  toBytes({ c0, c1, c2 }) {
    const { Fp2: Fp22 } = this;
    return concatBytes(Fp22.toBytes(c0), Fp22.toBytes(c1), Fp22.toBytes(c2));
  }
  cmov({ c0, c1, c2 }, { c0: r0, c1: r1, c2: r2 }, c) {
    const { Fp2: Fp22 } = this;
    return {
      c0: Fp22.cmov(c0, r0, c),
      c1: Fp22.cmov(c1, r1, c),
      c2: Fp22.cmov(c2, r2, c)
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
  addN(a, b2) {
    return this.add(a, b2);
  }
  subN(a, b2) {
    return this.sub(a, b2);
  }
  mulN(a, b2) {
    return this.mul(a, b2);
  }
  sqrN(a) {
    return this.sqr(a);
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
  cmov({ c0, c1 }, { c0: r0, c1: r1 }, c) {
    const { Fp6: Fp62 } = this;
    return {
      c0: Fp62.cmov(c0, r0, c),
      c1: Fp62.cmov(c1, r1, c)
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
    const a = Fp62.create({
      c0: Fp22.mul(c0.c0, o0),
      c1: Fp22.mul(c0.c1, o0),
      c2: Fp22.mul(c0.c2, o0)
    });
    const b2 = Fp62.mul01(c1, o3, o4);
    const e5 = Fp62.mul01(Fp62.add(c0, c1), Fp22.add(o0, o3), o4);
    return {
      c0: Fp62.add(Fp62.mulByNonresidue(b2), a),
      c1: Fp62.sub(e5, Fp62.add(a, b2))
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
    const x2 = BLS_X;
    const t0 = Fp12.div(Fp12.frobeniusMap(num, 6), num);
    const t1 = Fp12.mul(Fp12.frobeniusMap(t0, 2), t0);
    const t22 = Fp12.conjugate(Fp12._cyclotomicExp(t1, x2));
    const t3 = Fp12.mul(Fp12.conjugate(Fp12._cyclotomicSquare(t1)), t22);
    const t4 = Fp12.conjugate(Fp12._cyclotomicExp(t3, x2));
    const t5 = Fp12.conjugate(Fp12._cyclotomicExp(t4, x2));
    const t6 = Fp12.mul(Fp12.conjugate(Fp12._cyclotomicExp(t5, x2)), Fp12._cyclotomicSquare(t22));
    const t7 = Fp12.conjugate(Fp12._cyclotomicExp(t6, x2));
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
  hash: sha256$1
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
  const { x: x2, y } = point.toAffine();
  if (isComp) {
    if (is0)
      return COMPZERO.slice();
    const sort = Boolean(y * _2n$2 / P2);
    return setMask(numberToBytesBE(x2, L2), { compressed: true, sort });
  } else {
    if (is0) {
      return concatBytes(Uint8Array.of(64), new Uint8Array(2 * L2 - 1));
    } else {
      return concatBytes(numberToBytesBE(x2, L2), numberToBytesBE(y, L2));
    }
  }
}
function signatureG1ToBytes(point) {
  point.assertValidity();
  const { BYTES: L2, ORDER: P2 } = Fp$1;
  const { x: x2, y } = point.toAffine();
  if (point.is0())
    return COMPZERO.slice();
  const sort = Boolean(y * _2n$2 / P2);
  return setMask(numberToBytesBE(x2, L2), { compressed: true, sort });
}
function pointG1FromBytes(bytes) {
  const { compressed, infinity, sort, value: value2 } = parseMask(bytes);
  const { BYTES: L2, ORDER: P2 } = Fp$1;
  if (value2.length === 48 && compressed) {
    const compressedValue = bytesToNumberBE(value2);
    const x2 = Fp$1.create(compressedValue & bitMask(Fp$1.BITS));
    if (infinity) {
      if (x2 !== _0n$1)
        throw new Error("invalid G1 point: non-empty, at infinity, with compression");
      return { x: _0n$1, y: _0n$1 };
    }
    const right = Fp$1.add(Fp$1.pow(x2, _3n), Fp$1.create(bls12_381_CURVE_G1.b));
    let y = Fp$1.sqrt(right);
    if (!y)
      throw new Error("invalid G1 point: compressed point");
    if (y * _2n$2 / P2 !== BigInt(sort))
      y = Fp$1.neg(y);
    return { x: Fp$1.create(x2), y: Fp$1.create(y) };
  } else if (value2.length === 96 && !compressed) {
    const x2 = bytesToNumberBE(value2.subarray(0, L2));
    const y = bytesToNumberBE(value2.subarray(L2));
    if (infinity) {
      if (x2 !== _0n$1 || y !== _0n$1)
        throw new Error("G1: non-empty point at infinity");
      return bls12_381.G1.Point.ZERO.toAffine();
    }
    return { x: Fp$1.create(x2), y: Fp$1.create(y) };
  } else {
    throw new Error("invalid G1 point: expected 48/96 bytes");
  }
}
function signatureG1FromBytes(hex) {
  const { infinity, sort, value: value2 } = parseMask(ensureBytes("signatureHex", hex, 48));
  const P2 = Fp$1.ORDER;
  const Point = bls12_381.G1.Point;
  const compressedValue = bytesToNumberBE(value2);
  if (infinity)
    return Point.ZERO;
  const x2 = Fp$1.create(compressedValue & bitMask(Fp$1.BITS));
  const right = Fp$1.add(Fp$1.pow(x2, _3n), Fp$1.create(bls12_381_CURVE_G1.b));
  let y = Fp$1.sqrt(right);
  if (!y)
    throw new Error("invalid G1 point: compressed");
  const aflag = BigInt(sort);
  if (y * _2n$2 / P2 !== aflag)
    y = Fp$1.neg(y);
  const point = Point.fromAffine({ x: x2, y });
  point.assertValidity();
  return point;
}
function pointG2ToBytes(_c, point, isComp) {
  const { BYTES: L2, ORDER: P2 } = Fp$1;
  const is0 = point.is0();
  const { x: x2, y } = point.toAffine();
  if (isComp) {
    if (is0)
      return concatBytes(COMPZERO, numberToBytesBE(_0n$1, L2));
    const flag = Boolean(y.c1 === _0n$1 ? y.c0 * _2n$2 / P2 : y.c1 * _2n$2 / P2);
    return concatBytes(setMask(numberToBytesBE(x2.c1, L2), { compressed: true, sort: flag }), numberToBytesBE(x2.c0, L2));
  } else {
    if (is0)
      return concatBytes(Uint8Array.of(64), new Uint8Array(4 * L2 - 1));
    const { re: x0, im: x1 } = Fp2.reim(x2);
    const { re: y0, im: y1 } = Fp2.reim(y);
    return concatBytes(numberToBytesBE(x1, L2), numberToBytesBE(x0, L2), numberToBytesBE(y1, L2), numberToBytesBE(y0, L2));
  }
}
function signatureG2ToBytes(point) {
  point.assertValidity();
  const { BYTES: L2 } = Fp$1;
  if (point.is0())
    return concatBytes(COMPZERO, numberToBytesBE(_0n$1, L2));
  const { x: x2, y } = point.toAffine();
  const { re: x0, im: x1 } = Fp2.reim(x2);
  const { re: y0, im: y1 } = Fp2.reim(y);
  const tmp = y1 > _0n$1 ? y1 * _2n$2 : y0 * _2n$2;
  const sort = Boolean(tmp / Fp$1.ORDER & _1n$2);
  const z2 = x0;
  return concatBytes(setMask(numberToBytesBE(x1, L2), { sort, compressed: true }), numberToBytesBE(z2, L2));
}
function pointG2FromBytes(bytes) {
  const { BYTES: L2, ORDER: P2 } = Fp$1;
  const { compressed, infinity, sort, value: value2 } = parseMask(bytes);
  if (!compressed && !infinity && sort || // 00100000
  !compressed && infinity && sort || // 01100000
  sort && infinity && compressed) {
    throw new Error("invalid encoding flag: " + (bytes[0] & 224));
  }
  const slc = (b2, from, to) => bytesToNumberBE(b2.slice(from, to));
  if (value2.length === 96 && compressed) {
    if (infinity) {
      if (value2.reduce((p, c) => p !== 0 ? c + 1 : c, 0) > 0) {
        throw new Error("invalid G2 point: compressed");
      }
      return { x: Fp2.ZERO, y: Fp2.ZERO };
    }
    const x_1 = slc(value2, 0, L2);
    const x_0 = slc(value2, L2, 2 * L2);
    const x2 = Fp2.create({ c0: Fp$1.create(x_0), c1: Fp$1.create(x_1) });
    const right = Fp2.add(Fp2.pow(x2, _3n), bls12_381_CURVE_G2.b);
    let y = Fp2.sqrt(right);
    const Y_bit = y.c1 === _0n$1 ? y.c0 * _2n$2 / P2 : y.c1 * _2n$2 / P2 ? _1n$2 : _0n$1;
    y = sort && Y_bit > 0 ? y : Fp2.neg(y);
    return { x: x2, y };
  } else if (value2.length === 192 && !compressed) {
    if (infinity) {
      if (value2.reduce((p, c) => p !== 0 ? c + 1 : c, 0) > 0) {
        throw new Error("invalid G2 point: uncompressed");
      }
      return { x: Fp2.ZERO, y: Fp2.ZERO };
    }
    const x1 = slc(value2, 0 * L2, 1 * L2);
    const x0 = slc(value2, 1 * L2, 2 * L2);
    const y1 = slc(value2, 2 * L2, 3 * L2);
    const y0 = slc(value2, 3 * L2, 4 * L2);
    return { x: Fp2.fromBigTuple([x0, x1]), y: Fp2.fromBigTuple([y0, y1]) };
  } else {
    throw new Error("invalid G2 point: expected 96/192 bytes");
  }
}
function signatureG2FromBytes(hex) {
  const { ORDER: P2 } = Fp$1;
  const { infinity, sort, value: value2 } = parseMask(ensureBytes("signatureHex", hex));
  const Point = bls12_381.G2.Point;
  const half = value2.length / 2;
  if (half !== 48 && half !== 96)
    throw new Error("invalid compressed signature length, expected 96/192 bytes");
  const z1 = bytesToNumberBE(value2.slice(0, half));
  const z2 = bytesToNumberBE(value2.slice(half));
  if (infinity)
    return Point.ZERO;
  const x1 = Fp$1.create(z1 & bitMask(Fp$1.BITS));
  const x2 = Fp$1.create(z2);
  const x3 = Fp2.create({ c0: x2, c1: x1 });
  const y2 = Fp2.add(Fp2.pow(x3, _3n), bls12_381_CURVE_G2.b);
  let y = Fp2.sqrt(y2);
  if (!y)
    throw new Error("Failed to find a square root");
  const { re: y0, im: y1 } = Fp2.reim(y);
  const aflag1 = BigInt(sort);
  const isGreater = y1 > _0n$1 && y1 * _2n$2 / P2 !== aflag1;
  const is0 = y1 === _0n$1 && y0 * _2n$2 / P2 !== aflag1;
  if (isGreater || is0)
    y = Fp2.neg(y);
  const point = Point.fromAffine({ x: x3, y });
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
    isTorsionFree: (c, point) => {
      const beta = BigInt("0x5f19672fdf76ce51ba69c6076a0f77eaddb3a93be6f89688de17d813620a00022e01fffffffefffe");
      const phi = new c(Fp$1.mul(point.X, beta), point.Y, point.Z);
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
    isTorsionFree: (c, P2) => {
      return P2.multiplyUnsafe(BLS_X).negate().equals(G2psi(c, P2));
    },
    // Maps the point into the prime-order subgroup G2.
    // clear_cofactor_bls12381_g2 from RFC 9380.
    // https://eprint.iacr.org/2017/419.pdf
    // prettier-ignore
    clearCofactor: (c, P2) => {
      const x2 = BLS_X;
      let t1 = P2.multiplyUnsafe(x2).negate();
      let t22 = G2psi(c, P2);
      let t3 = P2.double();
      t3 = G2psi2(c, t3);
      t3 = t3.subtract(t22);
      t22 = t1.add(t22);
      t22 = t22.multiplyUnsafe(x2).negate();
      t3 = t3.add(t22);
      t3 = t3.subtract(t1);
      const Q = t3.subtract(P2);
      return Q;
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
  const { x: x2, y } = G1_SWU(Fp$1.create(scalars[0]));
  return isogenyMapG1(x2, y);
}
function mapToG2(scalars) {
  const { x: x2, y } = G2_SWU(Fp2.fromBigTuple(scalars));
  return isogenyMapG2(x2, y);
}
function blsVerify(pk, sig, msg) {
  const primaryKey = typeof pk === "string" ? pk : toHex(pk);
  const signature = typeof sig === "string" ? sig : toHex(sig);
  const message = typeof msg === "string" ? msg : toHex(msg);
  return bls12_381.verifyShortSignature(signature, message, primaryKey);
}
const decodeLeb128 = (buf) => {
  return lebDecode(new PipeArrayBuffer(buf));
};
const decodeTime = (buf) => {
  const decoded = decodeLeb128(buf);
  return new Date(Number(decoded) / 1e6);
};
var __classPrivateFieldSet$8 = function(receiver, state, value2, kind, f2) {
  if (kind === "m") throw new TypeError("Private method is not writable");
  if (kind === "a" && !f2) throw new TypeError("Private accessor was defined without a setter");
  if (typeof state === "function" ? receiver !== state || !f2 : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
  return kind === "a" ? f2.call(receiver, value2) : f2 ? f2.value = value2 : state.set(receiver, value2), value2;
};
var __classPrivateFieldGet$8 = function(receiver, state, kind, f2) {
  if (kind === "a" && !f2) throw new TypeError("Private accessor was defined without a getter");
  if (typeof state === "function" ? receiver !== state || !f2 : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
  return kind === "m" ? f2 : kind === "a" ? f2.call(receiver) : f2 ? f2.value : state.get(receiver);
};
var _Certificate_disableTimeVerification;
class CertificateVerificationError extends AgentError {
  constructor(reason) {
    super(`Invalid certificate: ${reason}`);
  }
}
var NodeType;
(function(NodeType2) {
  NodeType2[NodeType2["Empty"] = 0] = "Empty";
  NodeType2[NodeType2["Fork"] = 1] = "Fork";
  NodeType2[NodeType2["Labeled"] = 2] = "Labeled";
  NodeType2[NodeType2["Leaf"] = 3] = "Leaf";
  NodeType2[NodeType2["Pruned"] = 4] = "Pruned";
})(NodeType || (NodeType = {}));
function isBufferGreaterThan(a, b2) {
  const a8 = new Uint8Array(a);
  const b8 = new Uint8Array(b2);
  for (let i3 = 0; i3 < a8.length; i3++) {
    if (a8[i3] > b8[i3]) {
      return true;
    }
  }
  return false;
}
class Certificate {
  constructor(certificate, _rootKey, _canisterId, _blsVerify, _maxAgeInMinutes = 5, disableTimeVerification = false) {
    this._rootKey = _rootKey;
    this._canisterId = _canisterId;
    this._blsVerify = _blsVerify;
    this._maxAgeInMinutes = _maxAgeInMinutes;
    _Certificate_disableTimeVerification.set(this, false);
    __classPrivateFieldSet$8(this, _Certificate_disableTimeVerification, disableTimeVerification, "f");
    this.cert = decode(new Uint8Array(certificate));
  }
  /**
   * Create a new instance of a certificate, automatically verifying it. Throws a
   * CertificateVerificationError if the certificate cannot be verified.
   * @constructs  Certificate
   * @param {CreateCertificateOptions} options {@link CreateCertificateOptions}
   * @param {ArrayBuffer} options.certificate The bytes of the certificate
   * @param {ArrayBuffer} options.rootKey The root key to verify against
   * @param {Principal} options.canisterId The effective or signing canister ID
   * @param {number} options.maxAgeInMinutes The maximum age of the certificate in minutes. Default is 5 minutes.
   * @throws {CertificateVerificationError}
   */
  static async create(options) {
    const cert = Certificate.createUnverified(options);
    await cert.verify();
    return cert;
  }
  static createUnverified(options) {
    let blsVerify$1 = options.blsVerify;
    if (!blsVerify$1) {
      blsVerify$1 = blsVerify;
    }
    return new Certificate(options.certificate, options.rootKey, options.canisterId, blsVerify$1, options.maxAgeInMinutes, options.disableTimeVerification);
  }
  lookup(path) {
    return lookup_path(path, this.cert.tree);
  }
  lookup_label(label) {
    return this.lookup([label]);
  }
  async verify() {
    const rootHash = await reconstruct(this.cert.tree);
    const derKey = await this._checkDelegationAndGetKey(this.cert.delegation);
    const sig = this.cert.signature;
    const key = extractDER(derKey);
    const msg = concat$1(domain_sep("ic-state-root"), rootHash);
    let sigVer = false;
    const lookupTime = lookupResultToBuffer(this.lookup(["time"]));
    if (!lookupTime) {
      throw new CertificateVerificationError("Certificate does not contain a time");
    }
    if (!__classPrivateFieldGet$8(this, _Certificate_disableTimeVerification, "f")) {
      const FIVE_MINUTES_IN_MSEC2 = 5 * 60 * 1e3;
      const MAX_AGE_IN_MSEC = this._maxAgeInMinutes * 60 * 1e3;
      const now = Date.now();
      const earliestCertificateTime = now - MAX_AGE_IN_MSEC;
      const fiveMinutesFromNow = now + FIVE_MINUTES_IN_MSEC2;
      const certTime = decodeTime(lookupTime);
      if (certTime.getTime() < earliestCertificateTime) {
        throw new CertificateVerificationError(`Certificate is signed more than ${this._maxAgeInMinutes} minutes in the past. Certificate time: ` + certTime.toISOString() + " Current time: " + new Date(now).toISOString());
      } else if (certTime.getTime() > fiveMinutesFromNow) {
        throw new CertificateVerificationError("Certificate is signed more than 5 minutes in the future. Certificate time: " + certTime.toISOString() + " Current time: " + new Date(now).toISOString());
      }
    }
    try {
      sigVer = await this._blsVerify(new Uint8Array(key), new Uint8Array(sig), new Uint8Array(msg));
    } catch (err) {
      sigVer = false;
    }
    if (!sigVer) {
      throw new CertificateVerificationError("Signature verification failed");
    }
  }
  async _checkDelegationAndGetKey(d2) {
    if (!d2) {
      return this._rootKey;
    }
    const cert = await Certificate.createUnverified({
      certificate: d2.certificate,
      rootKey: this._rootKey,
      canisterId: this._canisterId,
      blsVerify: this._blsVerify,
      // Do not check max age for delegation certificates
      maxAgeInMinutes: Infinity
    });
    if (cert.cert.delegation) {
      throw new CertificateVerificationError("Delegation certificates cannot be nested");
    }
    await cert.verify();
    if (this._canisterId.toString() !== MANAGEMENT_CANISTER_ID) {
      const canisterInRange = check_canister_ranges({
        canisterId: this._canisterId,
        subnetId: Principal$1.fromUint8Array(new Uint8Array(d2.subnet_id)),
        tree: cert.cert.tree
      });
      if (!canisterInRange) {
        throw new CertificateVerificationError(`Canister ${this._canisterId} not in range of delegations for subnet 0x${toHex(d2.subnet_id)}`);
      }
    }
    const publicKeyLookup = lookupResultToBuffer(cert.lookup(["subnet", d2.subnet_id, "public_key"]));
    if (!publicKeyLookup) {
      throw new Error(`Could not find subnet key for subnet 0x${toHex(d2.subnet_id)}`);
    }
    return publicKeyLookup;
  }
}
_Certificate_disableTimeVerification = /* @__PURE__ */ new WeakMap();
const DER_PREFIX = fromHex("308182301d060d2b0601040182dc7c0503010201060c2b0601040182dc7c05030201036100");
const KEY_LENGTH = 96;
function extractDER(buf) {
  const expectedLength = DER_PREFIX.byteLength + KEY_LENGTH;
  if (buf.byteLength !== expectedLength) {
    throw new TypeError(`BLS DER-encoded public key must be ${expectedLength} bytes long`);
  }
  const prefix = buf.slice(0, DER_PREFIX.byteLength);
  if (!bufEquals(prefix, DER_PREFIX)) {
    throw new TypeError(`BLS DER-encoded public key is invalid. Expect the following prefix: ${DER_PREFIX}, but get ${prefix}`);
  }
  return buf.slice(DER_PREFIX.byteLength);
}
function lookupResultToBuffer(result) {
  if (result.status !== LookupStatus.Found) {
    return void 0;
  }
  if (result.value instanceof ArrayBuffer) {
    return result.value;
  }
  if (result.value instanceof Uint8Array) {
    return result.value.buffer;
  }
  return void 0;
}
async function reconstruct(t3) {
  switch (t3[0]) {
    case NodeType.Empty:
      return hash(domain_sep("ic-hashtree-empty"));
    case NodeType.Pruned:
      return t3[1];
    case NodeType.Leaf:
      return hash(concat$1(domain_sep("ic-hashtree-leaf"), t3[1]));
    case NodeType.Labeled:
      return hash(concat$1(domain_sep("ic-hashtree-labeled"), t3[1], await reconstruct(t3[2])));
    case NodeType.Fork:
      return hash(concat$1(domain_sep("ic-hashtree-fork"), await reconstruct(t3[1]), await reconstruct(t3[2])));
    default:
      throw new Error("unreachable");
  }
}
function domain_sep(s2) {
  const len = new Uint8Array([s2.length]);
  const str = new TextEncoder().encode(s2);
  return concat$1(len, str);
}
var LookupStatus;
(function(LookupStatus2) {
  LookupStatus2["Unknown"] = "unknown";
  LookupStatus2["Absent"] = "absent";
  LookupStatus2["Found"] = "found";
})(LookupStatus || (LookupStatus = {}));
var LabelLookupStatus;
(function(LabelLookupStatus2) {
  LabelLookupStatus2["Less"] = "less";
  LabelLookupStatus2["Greater"] = "greater";
})(LabelLookupStatus || (LabelLookupStatus = {}));
function lookup_path(path, tree) {
  if (path.length === 0) {
    switch (tree[0]) {
      case NodeType.Leaf: {
        if (!tree[1]) {
          throw new Error("Invalid tree structure for leaf");
        }
        if (tree[1] instanceof ArrayBuffer) {
          return {
            status: LookupStatus.Found,
            value: tree[1]
          };
        }
        if (tree[1] instanceof Uint8Array) {
          return {
            status: LookupStatus.Found,
            value: tree[1].buffer
          };
        }
        return {
          status: LookupStatus.Found,
          value: tree[1]
        };
      }
      default: {
        return {
          status: LookupStatus.Found,
          value: tree
        };
      }
    }
  }
  const label = typeof path[0] === "string" ? new TextEncoder().encode(path[0]) : path[0];
  const lookupResult = find_label(label, tree);
  switch (lookupResult.status) {
    case LookupStatus.Found: {
      return lookup_path(path.slice(1), lookupResult.value);
    }
    case LabelLookupStatus.Greater:
    case LabelLookupStatus.Less: {
      return {
        status: LookupStatus.Absent
      };
    }
    default: {
      return lookupResult;
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
          status: LabelLookupStatus.Greater
        };
      }
      if (bufEquals(label, tree[1])) {
        return {
          status: LookupStatus.Found,
          value: tree[2]
        };
      }
      return {
        status: LabelLookupStatus.Less
      };
    // if we have a fork node, we need to search both sides, starting with the left
    case NodeType.Fork:
      const leftLookupResult = find_label(label, tree[1]);
      switch (leftLookupResult.status) {
        // if the label we're searching for is greater than the left node lookup,
        // we need to search the right node
        case LabelLookupStatus.Greater: {
          const rightLookupResult = find_label(label, tree[2]);
          if (rightLookupResult.status === LabelLookupStatus.Less) {
            return {
              status: LookupStatus.Absent
            };
          }
          return rightLookupResult;
        }
        // if the left node returns an uncertain result, we need to search the
        // right node
        case LookupStatus.Unknown: {
          let rightLookupResult = find_label(label, tree[2]);
          if (rightLookupResult.status === LabelLookupStatus.Less) {
            return {
              status: LookupStatus.Unknown
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
    // if we encounter a Pruned node, we can't know for certain if the label
    // we're searching for is present or not
    case NodeType.Pruned:
      return {
        status: LookupStatus.Unknown
      };
    // if the current node is Empty, or a Leaf, we can stop searching because
    // we know for sure that the label we're searching for is not present
    default:
      return {
        status: LookupStatus.Absent
      };
  }
}
function check_canister_ranges(params) {
  const { canisterId: canisterId2, subnetId, tree } = params;
  const rangeLookup = lookup_path(["subnet", subnetId.toUint8Array(), "canister_ranges"], tree);
  if (rangeLookup.status !== LookupStatus.Found || !(rangeLookup.value instanceof ArrayBuffer)) {
    throw new Error(`Could not find canister ranges for subnet ${subnetId}`);
  }
  const ranges_arr = decode(rangeLookup.value);
  const ranges = ranges_arr.map((v3) => [
    Principal$1.fromUint8Array(v3[0]),
    Principal$1.fromUint8Array(v3[1])
  ]);
  const canisterInRange = ranges.some((r2) => r2[0].ltEq(canisterId2) && r2[1].gtEq(canisterId2));
  return canisterInRange;
}
class CustomPath {
  constructor(key, path, decodeStrategy) {
    this.key = key;
    this.path = path;
    this.decodeStrategy = decodeStrategy;
  }
}
const request = async (options) => {
  const { agent, paths } = options;
  const canisterId2 = Principal$1.from(options.canisterId);
  const uniquePaths = [...new Set(paths)];
  const encodedPaths = uniquePaths.map((path) => {
    return encodePath(path, canisterId2);
  });
  const status = /* @__PURE__ */ new Map();
  const promises = uniquePaths.map((path, index2) => {
    return (async () => {
      var _a2;
      try {
        const response = await agent.readState(canisterId2, {
          paths: [encodedPaths[index2]]
        });
        if (agent.rootKey == null) {
          throw new Error("Agent is missing root key");
        }
        const cert = await Certificate.create({
          certificate: response.certificate,
          rootKey: agent.rootKey,
          canisterId: canisterId2,
          disableTimeVerification: true
        });
        const lookup = (cert2, path3) => {
          if (path3 === "subnet") {
            if (agent.rootKey == null) {
              throw new Error("Agent is missing root key");
            }
            const data2 = fetchNodeKeys(response.certificate, canisterId2, agent.rootKey);
            return {
              path: path3,
              data: data2
            };
          } else {
            return {
              path: path3,
              data: lookupResultToBuffer(cert2.lookup(encodePath(path3, canisterId2)))
            };
          }
        };
        const { path: path2, data } = lookup(cert, uniquePaths[index2]);
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
              status.set(path2, decodeHex(data));
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
                    status.set(path2.key, decodeCbor(data));
                    break;
                  }
                  case "hex": {
                    status.set(path2.key, decodeHex(data));
                    break;
                  }
                  case "utf-8": {
                    status.set(path2.key, decodeUtf8(data));
                  }
                }
              }
            }
          }
        }
      } catch (error) {
        if ((_a2 = error === null || error === void 0 ? void 0 : error.message) === null || _a2 === void 0 ? void 0 : _a2.includes("Invalid certificate")) {
          throw new AgentError(error.message);
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
    throw new Error("Invalid canisterId");
  }
  const cert = decode(new Uint8Array(certificate));
  const tree = cert.tree;
  let delegation = cert.delegation;
  let subnetId;
  if (delegation && delegation.subnet_id) {
    subnetId = Principal$1.fromUint8Array(new Uint8Array(delegation.subnet_id));
  } else if (!delegation && typeof root_key !== "undefined") {
    subnetId = Principal$1.selfAuthenticating(new Uint8Array(root_key));
    delegation = {
      subnet_id: subnetId.toUint8Array(),
      certificate: new ArrayBuffer(0)
    };
  } else {
    subnetId = Principal$1.selfAuthenticating(Principal$1.fromText("tdb26-jop6k-aogll-7ltgs-eruif-6kk7m-qpktf-gdiqx-mxtrf-vb5e6-eqe").toUint8Array());
    delegation = {
      subnet_id: subnetId.toUint8Array(),
      certificate: new ArrayBuffer(0)
    };
  }
  const canisterInRange = check_canister_ranges({ canisterId: canisterId2, subnetId, tree });
  if (!canisterInRange) {
    throw new Error("Canister not in range");
  }
  const subnetLookupResult = lookup_path(["subnet", delegation.subnet_id, "node"], tree);
  if (subnetLookupResult.status !== LookupStatus.Found) {
    throw new Error("Node not found");
  }
  if (subnetLookupResult.value instanceof ArrayBuffer) {
    throw new Error("Invalid node tree");
  }
  const nodeForks = flatten_forks(subnetLookupResult.value);
  const nodeKeys = /* @__PURE__ */ new Map();
  nodeForks.forEach((fork) => {
    const node_id = Principal$1.from(new Uint8Array(fork[1])).toText();
    const publicKeyLookupResult = lookup_path(["public_key"], fork[2]);
    if (publicKeyLookupResult.status !== LookupStatus.Found) {
      throw new Error("Public key not found");
    }
    const derEncodedPublicKey = publicKeyLookupResult.value;
    if (derEncodedPublicKey.byteLength !== 44) {
      throw new Error("Invalid public key length");
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
  const encoder2 = new TextEncoder();
  const encode2 = (arg) => {
    return new DataView(encoder2.encode(arg).buffer).buffer;
  };
  const canisterBuffer = new DataView(canisterId2.toUint8Array().buffer).buffer;
  switch (path) {
    case "time":
      return [encode2("time")];
    case "controllers":
      return [encode2("canister"), canisterBuffer, encode2("controllers")];
    case "module_hash":
      return [encode2("canister"), canisterBuffer, encode2("module_hash")];
    case "subnet":
      return [encode2("subnet")];
    case "candid":
      return [encode2("canister"), canisterBuffer, encode2("metadata"), encode2("candid:service")];
    default: {
      if ("key" in path && "path" in path) {
        if (typeof path["path"] === "string" || path["path"] instanceof ArrayBuffer) {
          const metaPath = path.path;
          const encoded = typeof metaPath === "string" ? encode2(metaPath) : metaPath;
          return [encode2("canister"), canisterBuffer, encode2("metadata"), encoded];
        } else {
          return path["path"];
        }
      }
    }
  }
  throw new Error(`An unexpeected error was encountered while encoding your path for canister status. Please ensure that your path, ${path} was formatted correctly.`);
};
const decodeHex = (buf) => {
  return toHex(buf);
};
const decodeCbor = (buf) => {
  return decode(buf);
};
const decodeUtf8 = (buf) => {
  return new TextDecoder().decode(buf);
};
const decodeControllers = (buf) => {
  const controllersRaw = decodeCbor(buf);
  return controllersRaw.map((buf2) => {
    return Principal$1.fromUint8Array(new Uint8Array(buf2));
  });
};
const index = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  CustomPath,
  encodePath,
  fetchNodeKeys,
  request
}, Symbol.toStringTag, { value: "Module" }));
/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
const _0n = BigInt(0), _1n$1 = BigInt(1), _2n$1 = BigInt(2), _8n$1 = BigInt(8);
function isEdValidXY(Fp3, CURVE, x2, y) {
  const x22 = Fp3.sqr(x2);
  const y2 = Fp3.sqr(y);
  const left = Fp3.add(Fp3.mul(CURVE.a, x22), y2);
  const right = Fp3.add(Fp3.ONE, Fp3.mul(CURVE.d, Fp3.mul(x22, y2)));
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
  const toAffineMemo = memoized((p, iz) => {
    const { X, Y, Z } = p;
    const is0 = p.is0();
    if (iz == null)
      iz = is0 ? _8n$1 : Fp3.inv(Z);
    const x2 = modP(X * iz);
    const y = modP(Y * iz);
    const zz = Fp3.mul(Z, iz);
    if (is0)
      return { x: _0n, y: _1n$1 };
    if (zz !== _1n$1)
      throw new Error("invZ was invalid");
    return { x: x2, y };
  });
  const assertValidMemo = memoized((p) => {
    const { a, d: d2 } = CURVE;
    if (p.is0())
      throw new Error("bad point: ZERO");
    const { X, Y, Z, T: T2 } = p;
    const X2 = modP(X * X);
    const Y2 = modP(Y * Y);
    const Z2 = modP(Z * Z);
    const Z4 = modP(Z2 * Z2);
    const aX2 = modP(X2 * a);
    const left = modP(Z2 * modP(aX2 + Y2));
    const right = modP(Z4 + modP(d2 * modP(X2 * Y2)));
    if (left !== right)
      throw new Error("bad point: equation left != right (1)");
    const XY = modP(X * Y);
    const ZT = modP(Z * T2);
    if (XY !== ZT)
      throw new Error("bad point: equation left != right (2)");
    return true;
  });
  class Point {
    constructor(X, Y, Z, T2) {
      this.X = acoord("x", X);
      this.Y = acoord("y", Y);
      this.Z = acoord("z", Z, true);
      this.T = acoord("t", T2);
      Object.freeze(this);
    }
    static CURVE() {
      return CURVE;
    }
    static fromAffine(p) {
      if (p instanceof Point)
        throw new Error("extended point not allowed");
      const { x: x2, y } = p || {};
      acoord("x", x2);
      acoord("y", y);
      return new Point(x2, y, _1n$1, modP(x2 * y));
    }
    // Uses algo from RFC8032 5.1.3.
    static fromBytes(bytes, zip215 = false) {
      const len = Fp3.BYTES;
      const { a, d: d2 } = CURVE;
      bytes = copyBytes(_abytes2(bytes, len, "point"));
      _abool2(zip215, "zip215");
      const normed = copyBytes(bytes);
      const lastByte = bytes[len - 1];
      normed[len - 1] = lastByte & -129;
      const y = bytesToNumberLE(normed);
      const max = zip215 ? MASK : Fp3.ORDER;
      aInRange("point.y", y, _0n, max);
      const y2 = modP(y * y);
      const u2 = modP(y2 - _1n$1);
      const v3 = modP(d2 * y2 - a);
      let { isValid, value: x2 } = uvRatio2(u2, v3);
      if (!isValid)
        throw new Error("bad point: invalid y coordinate");
      const isXOdd = (x2 & _1n$1) === _1n$1;
      const isLastByteOdd = (lastByte & 128) !== 0;
      if (!zip215 && x2 === _0n && isLastByteOdd)
        throw new Error("bad point: x=0 and x_0=1");
      if (isLastByteOdd !== isXOdd)
        x2 = modP(-x2);
      return Point.fromAffine({ x: x2, y });
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
      const A3 = modP(X1 * X1);
      const B2 = modP(Y1 * Y1);
      const C2 = modP(_2n$1 * modP(Z1 * Z1));
      const D2 = modP(a * A3);
      const x1y1 = X1 + Y1;
      const E2 = modP(modP(x1y1 * x1y1) - A3 - B2);
      const G2 = D2 + B2;
      const F2 = G2 - C2;
      const H2 = D2 - B2;
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
      const { a, d: d2 } = CURVE;
      const { X: X1, Y: Y1, Z: Z1, T: T1 } = this;
      const { X: X2, Y: Y2, Z: Z2, T: T2 } = other;
      const A3 = modP(X1 * X2);
      const B2 = modP(Y1 * Y2);
      const C2 = modP(T1 * d2 * T2);
      const D2 = modP(Z1 * Z2);
      const E2 = modP((X1 + Y1) * (X2 + Y2) - A3 - B2);
      const F2 = D2 - C2;
      const G2 = D2 + C2;
      const H2 = modP(B2 - a * A3);
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
      const { p, f: f2 } = wnaf.cached(this, scalar, (p2) => normalizeZ(Point, p2));
      return normalizeZ(Point, [p, f2])[0];
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
      const { x: x2, y } = this.toAffine();
      const bytes = Fp3.toBytes(y);
      bytes[bytes.length - 1] |= x2 & _1n$1 ? 128 : 0;
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
  function modN_LE(hash2) {
    return Fn.create(bytesToNumberLE(hash2));
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
    let A3, R2, SB;
    try {
      A3 = Point.fromBytes(publicKey, zip215);
      R2 = Point.fromBytes(r2, zip215);
      SB = BASE.multiplyUnsafe(s2);
    } catch (error) {
      return false;
    }
    if (!zip215 && A3.isSmallOrder())
      return false;
    const k2 = hashDomainToScalar(context, R2.toBytes(), A3.toBytes(), msg);
    const RkA = R2.add(A3.multiplyUnsafe(k2));
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
    const secretKey = utils2.randomSecretKey(seed);
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
  const utils2 = {
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
      const u2 = is25519 ? Fp3.div(_1n$1 + y, _1n$1 - y) : Fp3.div(y - _1n$1, y + _1n$1);
      return Fp3.toBytes(u2);
    },
    toMontgomeryPriv(secretKey) {
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
    utils: utils2,
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
  const Fp3 = c.Fp;
  const Fn = Field(CURVE.n, c.nBitLength, true);
  const curveOpts = { Fp: Fp3, Fn, uvRatio: c.uvRatio };
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
  const { CURVE, curveOpts, hash: hash2, eddsaOpts } = _eddsa_legacy_opts_to_new(c);
  const Point = edwards(CURVE, curveOpts);
  const EDDSA = eddsa(Point, hash2, eddsaOpts);
  return _eddsa_new_output_to_legacy(c, EDDSA);
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
function ed25519_pow_2_252_3(x2) {
  const _10n = BigInt(10), _20n = BigInt(20), _40n = BigInt(40), _80n = BigInt(80);
  const P2 = ed25519_CURVE_p;
  const x22 = x2 * x2 % P2;
  const b2 = x22 * x2 % P2;
  const b4 = pow2(b2, _2n, P2) * b2 % P2;
  const b5 = pow2(b4, _1n, P2) * x2 % P2;
  const b10 = pow2(b5, _5n, P2) * b5 % P2;
  const b20 = pow2(b10, _10n, P2) * b10 % P2;
  const b40 = pow2(b20, _20n, P2) * b20 % P2;
  const b80 = pow2(b40, _40n, P2) * b40 % P2;
  const b160 = pow2(b80, _80n, P2) * b80 % P2;
  const b240 = pow2(b160, _80n, P2) * b80 % P2;
  const b250 = pow2(b240, _10n, P2) * b10 % P2;
  const pow_p_5_8 = pow2(b250, _2n, P2) * x2 % P2;
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
  let x2 = mod(u2 * v32 * pow, P2);
  const vx2 = mod(v3 * x2 * x2, P2);
  const root1 = x2;
  const root2 = mod(x2 * ED25519_SQRT_M1, P2);
  const useRoot1 = vx2 === u2;
  const useRoot2 = vx2 === mod(-u2, P2);
  const noRoot = vx2 === mod(-u2 * ED25519_SQRT_M1, P2);
  if (useRoot1)
    x2 = root1;
  if (useRoot2 || noRoot)
    x2 = root2;
  if (isNegativeLE(x2, P2))
    x2 = mod(-x2, P2);
  return { isValid: useRoot1 || useRoot2, value: x2 };
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
var __classPrivateFieldSet$7 = function(receiver, state, value2, kind, f2) {
  if (kind === "m") throw new TypeError("Private method is not writable");
  if (kind === "a" && !f2) throw new TypeError("Private accessor was defined without a setter");
  if (typeof state === "function" ? receiver !== state || !f2 : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
  return kind === "a" ? f2.call(receiver, value2) : f2 ? f2.value = value2 : state.set(receiver, value2), value2;
};
var __classPrivateFieldGet$7 = function(receiver, state, kind, f2) {
  if (kind === "a" && !f2) throw new TypeError("Private accessor was defined without a getter");
  if (typeof state === "function" ? receiver !== state || !f2 : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
  return kind === "m" ? f2 : kind === "a" ? f2.call(receiver) : f2 ? f2.value : state.get(receiver);
};
var _ExpirableMap_inner, _ExpirableMap_expirationTime, _a, _b;
class ExpirableMap {
  /**
   * Create a new ExpirableMap.
   * @param {ExpirableMapOptions<any, any>} options - options for the map.
   * @param {Iterable<[any, any]>} options.source - an optional source of entries to initialize the map with.
   * @param {number} options.expirationTime - the time in milliseconds after which entries will expire.
   */
  constructor(options = {}) {
    _ExpirableMap_inner.set(this, void 0);
    _ExpirableMap_expirationTime.set(this, void 0);
    this[_a] = this.entries.bind(this);
    this[_b] = "ExpirableMap";
    const { source = [], expirationTime = 10 * 60 * 1e3 } = options;
    const currentTime = Date.now();
    __classPrivateFieldSet$7(this, _ExpirableMap_inner, new Map([...source].map(([key, value2]) => [key, { value: value2, timestamp: currentTime }])), "f");
    __classPrivateFieldSet$7(this, _ExpirableMap_expirationTime, expirationTime, "f");
  }
  /**
   * Prune removes all expired entries.
   */
  prune() {
    const currentTime = Date.now();
    for (const [key, entry] of __classPrivateFieldGet$7(this, _ExpirableMap_inner, "f").entries()) {
      if (currentTime - entry.timestamp > __classPrivateFieldGet$7(this, _ExpirableMap_expirationTime, "f")) {
        __classPrivateFieldGet$7(this, _ExpirableMap_inner, "f").delete(key);
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
  set(key, value2) {
    this.prune();
    const entry = {
      value: value2,
      timestamp: Date.now()
    };
    __classPrivateFieldGet$7(this, _ExpirableMap_inner, "f").set(key, entry);
    return this;
  }
  /**
   * Get the value associated with the key, if it exists and has not expired.
   * @param key K
   * @returns the value associated with the key, or undefined if the key is not present or has expired.
   */
  get(key) {
    const entry = __classPrivateFieldGet$7(this, _ExpirableMap_inner, "f").get(key);
    if (entry === void 0) {
      return void 0;
    }
    if (Date.now() - entry.timestamp > __classPrivateFieldGet$7(this, _ExpirableMap_expirationTime, "f")) {
      __classPrivateFieldGet$7(this, _ExpirableMap_inner, "f").delete(key);
      return void 0;
    }
    return entry.value;
  }
  /**
   * Clear all entries.
   */
  clear() {
    __classPrivateFieldGet$7(this, _ExpirableMap_inner, "f").clear();
  }
  /**
   * Entries returns the entries of the map, without the expiration time.
   * @returns an iterator over the entries of the map.
   */
  entries() {
    const iterator = __classPrivateFieldGet$7(this, _ExpirableMap_inner, "f").entries();
    const generator = function* () {
      for (const [key, value2] of iterator) {
        yield [key, value2.value];
      }
    };
    return generator();
  }
  /**
   * Values returns the values of the map, without the expiration time.
   * @returns an iterator over the values of the map.
   */
  values() {
    const iterator = __classPrivateFieldGet$7(this, _ExpirableMap_inner, "f").values();
    const generator = function* () {
      for (const value2 of iterator) {
        yield value2.value;
      }
    };
    return generator();
  }
  /**
   * Keys returns the keys of the map
   * @returns an iterator over the keys of the map.
   */
  keys() {
    return __classPrivateFieldGet$7(this, _ExpirableMap_inner, "f").keys();
  }
  /**
   * forEach calls the callbackfn on each entry of the map.
   * @param callbackfn to call on each entry
   * @param thisArg to use as this when calling the callbackfn
   */
  forEach(callbackfn, thisArg) {
    for (const [key, value2] of __classPrivateFieldGet$7(this, _ExpirableMap_inner, "f").entries()) {
      callbackfn.call(thisArg, value2.value, key, this);
    }
  }
  /**
   * has returns true if the key exists and has not expired.
   * @param key K
   * @returns true if the key exists and has not expired.
   */
  has(key) {
    return __classPrivateFieldGet$7(this, _ExpirableMap_inner, "f").has(key);
  }
  /**
   * delete the entry for the given key.
   * @param key K
   * @returns true if the key existed and has been deleted.
   */
  delete(key) {
    return __classPrivateFieldGet$7(this, _ExpirableMap_inner, "f").delete(key);
  }
  /**
   * get size of the map.
   * @returns the size of the map.
   */
  get size() {
    return __classPrivateFieldGet$7(this, _ExpirableMap_inner, "f").size;
  }
}
_ExpirableMap_inner = /* @__PURE__ */ new WeakMap(), _ExpirableMap_expirationTime = /* @__PURE__ */ new WeakMap(), _a = Symbol.iterator, _b = Symbol.toStringTag;
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
    throw new Error("Length too long (> 4 bytes)");
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
    throw new Error("Length too long (> 4 bytes)");
  }
};
const decodeLenBytes = (buf, offset) => {
  if (buf[offset] < 128)
    return 1;
  if (buf[offset] === 128)
    throw new Error("Invalid length 0");
  if (buf[offset] === 129)
    return 2;
  if (buf[offset] === 130)
    return 3;
  if (buf[offset] === 131)
    return 4;
  throw new Error("Length too long (> 4 bytes)");
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
  throw new Error("Length too long (> 4 bytes)");
};
Uint8Array.from([
  ...[48, 12],
  ...[6, 10],
  ...[43, 6, 1, 4, 1, 131, 184, 67, 1, 1]
  // DER encoded COSE
]);
const ED25519_OID = Uint8Array.from([
  ...[48, 5],
  ...[6, 3],
  ...[43, 101, 112]
  // id-Ed25519 OID
]);
Uint8Array.from([
  ...[48, 16],
  ...[6, 7],
  ...[42, 134, 72, 206, 61, 2, 1],
  ...[6, 5],
  ...[43, 129, 4, 0, 10]
  // OID secp256k1
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
      throw new Error("Expected: " + msg);
    }
  };
  const buf = new Uint8Array(derEncoded);
  expect(48, "sequence");
  offset += decodeLenBytes(buf, offset);
  if (!bufEquals(buf.slice(offset, offset + oid.byteLength), oid)) {
    throw new Error("Not the expected OID.");
  }
  offset += oid.byteLength;
  expect(3, "bit string");
  const payloadLen = decodeLen(buf, offset) - 1;
  offset += decodeLenBytes(buf, offset);
  expect(0, "0 padding");
  const result = buf.slice(offset);
  if (payloadLen !== result.length) {
    throw new Error(`DER payload mismatch: Expected length ${payloadLen} actual length ${result.length}`);
  }
  return result;
};
var __classPrivateFieldSet$6 = function(receiver, state, value2, kind, f2) {
  if (kind === "m") throw new TypeError("Private method is not writable");
  if (kind === "a" && !f2) throw new TypeError("Private accessor was defined without a setter");
  if (typeof state === "function" ? receiver !== state || !f2 : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
  return kind === "a" ? f2.call(receiver, value2) : f2 ? f2.value = value2 : state.set(receiver, value2), value2;
};
var __classPrivateFieldGet$6 = function(receiver, state, kind, f2) {
  if (kind === "a" && !f2) throw new TypeError("Private accessor was defined without a getter");
  if (typeof state === "function" ? receiver !== state || !f2 : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
  return kind === "m" ? f2 : kind === "a" ? f2.call(receiver) : f2 ? f2.value : state.get(receiver);
};
var _Ed25519PublicKey_rawKey$1, _Ed25519PublicKey_derKey$1;
let Ed25519PublicKey$1 = class Ed25519PublicKey {
  // `fromRaw` and `fromDer` should be used for instantiation, not this constructor.
  constructor(key) {
    _Ed25519PublicKey_rawKey$1.set(this, void 0);
    _Ed25519PublicKey_derKey$1.set(this, void 0);
    if (key.byteLength !== Ed25519PublicKey.RAW_KEY_LENGTH) {
      throw new Error("An Ed25519 public key must be exactly 32bytes long");
    }
    __classPrivateFieldSet$6(this, _Ed25519PublicKey_rawKey$1, key, "f");
    __classPrivateFieldSet$6(this, _Ed25519PublicKey_derKey$1, Ed25519PublicKey.derEncode(key), "f");
  }
  static from(key) {
    return this.fromDer(key.toDer());
  }
  static fromRaw(rawKey) {
    return new Ed25519PublicKey(rawKey);
  }
  static fromDer(derKey) {
    return new Ed25519PublicKey(this.derDecode(derKey));
  }
  static derEncode(publicKey) {
    return wrapDER(publicKey, ED25519_OID).buffer;
  }
  static derDecode(key) {
    const unwrapped = unwrapDER(key, ED25519_OID);
    if (unwrapped.length !== this.RAW_KEY_LENGTH) {
      throw new Error("An Ed25519 public key must be exactly 32bytes long");
    }
    return unwrapped;
  }
  get rawKey() {
    return __classPrivateFieldGet$6(this, _Ed25519PublicKey_rawKey$1, "f");
  }
  get derKey() {
    return __classPrivateFieldGet$6(this, _Ed25519PublicKey_derKey$1, "f");
  }
  toDer() {
    return this.derKey;
  }
  toRaw() {
    return this.rawKey;
  }
};
_Ed25519PublicKey_rawKey$1 = /* @__PURE__ */ new WeakMap(), _Ed25519PublicKey_derKey$1 = /* @__PURE__ */ new WeakMap();
Ed25519PublicKey$1.RAW_KEY_LENGTH = 32;
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
var __classPrivateFieldSet$5 = function(receiver, state, value2, kind, f2) {
  if (kind === "m") throw new TypeError("Private method is not writable");
  if (kind === "a" && !f2) throw new TypeError("Private accessor was defined without a setter");
  if (typeof state === "function" ? receiver !== state || !f2 : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
  return kind === "a" ? f2.call(receiver, value2) : f2 ? f2.value = value2 : state.set(receiver, value2), value2;
};
var __classPrivateFieldGet$5 = function(receiver, state, kind, f2) {
  if (kind === "a" && !f2) throw new TypeError("Private accessor was defined without a getter");
  if (typeof state === "function" ? receiver !== state || !f2 : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
  return kind === "m" ? f2 : kind === "a" ? f2.call(receiver) : f2 ? f2.value : state.get(receiver);
};
var _ExponentialBackoff_currentInterval, _ExponentialBackoff_randomizationFactor, _ExponentialBackoff_multiplier, _ExponentialBackoff_maxInterval, _ExponentialBackoff_startTime, _ExponentialBackoff_maxElapsedTime, _ExponentialBackoff_maxIterations, _ExponentialBackoff_date, _ExponentialBackoff_count;
const RANDOMIZATION_FACTOR = 0.5;
const MULTIPLIER = 1.5;
const INITIAL_INTERVAL_MSEC = 500;
const MAX_INTERVAL_MSEC = 6e4;
const MAX_ELAPSED_TIME_MSEC = 9e5;
const MAX_ITERATIONS = 10;
class ExponentialBackoff {
  constructor(options = ExponentialBackoff.default) {
    _ExponentialBackoff_currentInterval.set(this, void 0);
    _ExponentialBackoff_randomizationFactor.set(this, void 0);
    _ExponentialBackoff_multiplier.set(this, void 0);
    _ExponentialBackoff_maxInterval.set(this, void 0);
    _ExponentialBackoff_startTime.set(this, void 0);
    _ExponentialBackoff_maxElapsedTime.set(this, void 0);
    _ExponentialBackoff_maxIterations.set(this, void 0);
    _ExponentialBackoff_date.set(this, void 0);
    _ExponentialBackoff_count.set(this, 0);
    const { initialInterval = INITIAL_INTERVAL_MSEC, randomizationFactor = RANDOMIZATION_FACTOR, multiplier = MULTIPLIER, maxInterval = MAX_INTERVAL_MSEC, maxElapsedTime = MAX_ELAPSED_TIME_MSEC, maxIterations = MAX_ITERATIONS, date = Date } = options;
    __classPrivateFieldSet$5(this, _ExponentialBackoff_currentInterval, initialInterval, "f");
    __classPrivateFieldSet$5(this, _ExponentialBackoff_randomizationFactor, randomizationFactor, "f");
    __classPrivateFieldSet$5(this, _ExponentialBackoff_multiplier, multiplier, "f");
    __classPrivateFieldSet$5(this, _ExponentialBackoff_maxInterval, maxInterval, "f");
    __classPrivateFieldSet$5(this, _ExponentialBackoff_date, date, "f");
    __classPrivateFieldSet$5(this, _ExponentialBackoff_startTime, date.now(), "f");
    __classPrivateFieldSet$5(this, _ExponentialBackoff_maxElapsedTime, maxElapsedTime, "f");
    __classPrivateFieldSet$5(this, _ExponentialBackoff_maxIterations, maxIterations, "f");
  }
  get ellapsedTimeInMsec() {
    return __classPrivateFieldGet$5(this, _ExponentialBackoff_date, "f").now() - __classPrivateFieldGet$5(this, _ExponentialBackoff_startTime, "f");
  }
  get currentInterval() {
    return __classPrivateFieldGet$5(this, _ExponentialBackoff_currentInterval, "f");
  }
  get count() {
    return __classPrivateFieldGet$5(this, _ExponentialBackoff_count, "f");
  }
  get randomValueFromInterval() {
    const delta = __classPrivateFieldGet$5(this, _ExponentialBackoff_randomizationFactor, "f") * __classPrivateFieldGet$5(this, _ExponentialBackoff_currentInterval, "f");
    const min = __classPrivateFieldGet$5(this, _ExponentialBackoff_currentInterval, "f") - delta;
    const max = __classPrivateFieldGet$5(this, _ExponentialBackoff_currentInterval, "f") + delta;
    return Math.random() * (max - min) + min;
  }
  incrementCurrentInterval() {
    var _a2;
    __classPrivateFieldSet$5(this, _ExponentialBackoff_currentInterval, Math.min(__classPrivateFieldGet$5(this, _ExponentialBackoff_currentInterval, "f") * __classPrivateFieldGet$5(this, _ExponentialBackoff_multiplier, "f"), __classPrivateFieldGet$5(this, _ExponentialBackoff_maxInterval, "f")), "f");
    __classPrivateFieldSet$5(this, _ExponentialBackoff_count, (_a2 = __classPrivateFieldGet$5(this, _ExponentialBackoff_count, "f"), _a2++, _a2), "f");
    return __classPrivateFieldGet$5(this, _ExponentialBackoff_currentInterval, "f");
  }
  next() {
    if (this.ellapsedTimeInMsec >= __classPrivateFieldGet$5(this, _ExponentialBackoff_maxElapsedTime, "f") || __classPrivateFieldGet$5(this, _ExponentialBackoff_count, "f") >= __classPrivateFieldGet$5(this, _ExponentialBackoff_maxIterations, "f")) {
      return null;
    } else {
      this.incrementCurrentInterval();
      return this.randomValueFromInterval;
    }
  }
}
_ExponentialBackoff_currentInterval = /* @__PURE__ */ new WeakMap(), _ExponentialBackoff_randomizationFactor = /* @__PURE__ */ new WeakMap(), _ExponentialBackoff_multiplier = /* @__PURE__ */ new WeakMap(), _ExponentialBackoff_maxInterval = /* @__PURE__ */ new WeakMap(), _ExponentialBackoff_startTime = /* @__PURE__ */ new WeakMap(), _ExponentialBackoff_maxElapsedTime = /* @__PURE__ */ new WeakMap(), _ExponentialBackoff_maxIterations = /* @__PURE__ */ new WeakMap(), _ExponentialBackoff_date = /* @__PURE__ */ new WeakMap(), _ExponentialBackoff_count = /* @__PURE__ */ new WeakMap();
ExponentialBackoff.default = {
  initialInterval: INITIAL_INTERVAL_MSEC,
  randomizationFactor: RANDOMIZATION_FACTOR,
  multiplier: MULTIPLIER,
  maxInterval: MAX_INTERVAL_MSEC,
  // 1 minute
  maxElapsedTime: MAX_ELAPSED_TIME_MSEC,
  maxIterations: MAX_ITERATIONS,
  date: Date
};
var __classPrivateFieldSet$4 = function(receiver, state, value2, kind, f2) {
  if (typeof state === "function" ? receiver !== state || true : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
  return state.set(receiver, value2), value2;
};
var __classPrivateFieldGet$4 = function(receiver, state, kind, f2) {
  if (kind === "a" && !f2) throw new TypeError("Private accessor was defined without a getter");
  if (typeof state === "function" ? receiver !== state || !f2 : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
  return kind === "m" ? f2 : kind === "a" ? f2.call(receiver) : f2 ? f2.value : state.get(receiver);
};
var _HttpAgent_instances, _HttpAgent_rootKeyPromise, _HttpAgent_shouldFetchRootKey, _HttpAgent_identity, _HttpAgent_fetch, _HttpAgent_fetchOptions, _HttpAgent_callOptions, _HttpAgent_timeDiffMsecs, _HttpAgent_credentials, _HttpAgent_retryTimes, _HttpAgent_backoffStrategy, _HttpAgent_maxIngressExpiryInMinutes, _HttpAgent_waterMark, _HttpAgent_queryPipeline, _HttpAgent_updatePipeline, _HttpAgent_subnetKeys, _HttpAgent_verifyQuerySignatures, _HttpAgent_requestAndRetryQuery, _HttpAgent_requestAndRetry, _HttpAgent_verifyQueryResponse, _HttpAgent_rootKeyGuard;
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
const IC_ROOT_KEY = "308182301d060d2b0601040182dc7c0503010201060c2b0601040182dc7c05030201036100814c0e6ec71fab583b08bd81373c255c3c371b2e84863c98a4f1e08b74235d14fb5d9c0cd546d9685f913a0c0b2cc5341583bf4b4392e467db96d65b9bb4cb717112f8472e0d5a4d14505ffd7484b01291091c5f87b98883463f98091a0baaae";
const MANAGEMENT_CANISTER_ID = "aaaaa-aa";
const IC0_DOMAIN = "ic0.app";
const IC0_SUB_DOMAIN = ".ic0.app";
const ICP0_DOMAIN = "icp0.io";
const ICP0_SUB_DOMAIN = ".icp0.io";
const ICP_API_DOMAIN = "icp-api.io";
const ICP_API_SUB_DOMAIN = ".icp-api.io";
class HttpDefaultFetchError extends AgentError {
  constructor(message) {
    super(message);
    this.message = message;
  }
}
class IdentityInvalidError extends AgentError {
  constructor(message) {
    super(message);
    this.message = message;
  }
}
function getDefaultFetch() {
  let defaultFetch;
  if (typeof window !== "undefined") {
    if (window.fetch) {
      defaultFetch = window.fetch.bind(window);
    } else {
      throw new HttpDefaultFetchError("Fetch implementation was not available. You appear to be in a browser context, but window.fetch was not present.");
    }
  } else if (typeof globalThis !== "undefined") {
    if (globalThis.fetch) {
      defaultFetch = globalThis.fetch.bind(globalThis);
    } else {
      throw new HttpDefaultFetchError("Fetch implementation was not available. You appear to be in a Node.js context, but global.fetch was not available.");
    }
  } else if (typeof self !== "undefined") {
    if (self.fetch) {
      defaultFetch = self.fetch.bind(self);
    }
  }
  if (defaultFetch) {
    return defaultFetch;
  }
  throw new HttpDefaultFetchError("Fetch implementation was not available. Please provide fetch to the HttpAgent constructor, or ensure it is available in the window or global context.");
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
    const hostname = location2 === null || location2 === void 0 ? void 0 : location2.hostname;
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
  /**
   * @param options - Options for the HttpAgent
   * @deprecated Use `HttpAgent.create` or `HttpAgent.createSync` instead
   */
  constructor(options = {}) {
    var _a2, _b2;
    _HttpAgent_instances.add(this);
    _HttpAgent_rootKeyPromise.set(this, null);
    _HttpAgent_shouldFetchRootKey.set(this, false);
    _HttpAgent_identity.set(this, void 0);
    _HttpAgent_fetch.set(this, void 0);
    _HttpAgent_fetchOptions.set(this, void 0);
    _HttpAgent_callOptions.set(this, void 0);
    _HttpAgent_timeDiffMsecs.set(this, 0);
    _HttpAgent_credentials.set(this, void 0);
    _HttpAgent_retryTimes.set(this, void 0);
    _HttpAgent_backoffStrategy.set(this, void 0);
    _HttpAgent_maxIngressExpiryInMinutes.set(this, void 0);
    this._isAgent = true;
    this.config = {};
    _HttpAgent_waterMark.set(this, 0);
    this.log = new ObservableLog();
    _HttpAgent_queryPipeline.set(this, []);
    _HttpAgent_updatePipeline.set(this, []);
    _HttpAgent_subnetKeys.set(this, new ExpirableMap({
      expirationTime: 5 * 60 * 1e3
      // 5 minutes
    }));
    _HttpAgent_verifyQuerySignatures.set(this, true);
    _HttpAgent_verifyQueryResponse.set(this, (queryResponse, subnetStatus) => {
      if (__classPrivateFieldGet$4(this, _HttpAgent_verifyQuerySignatures, "f") === false) {
        return queryResponse;
      }
      if (!subnetStatus) {
        throw new CertificateVerificationError("Invalid signature from replica signed query: no matching node key found.");
      }
      const { status, signatures = [], requestId } = queryResponse;
      const domainSeparator2 = bufFromBufLike$1(new TextEncoder().encode("\vic-response"));
      for (const sig of signatures) {
        const { timestamp, identity } = sig;
        const nodeId = Principal$1.fromUint8Array(identity).toText();
        let hash2;
        if (status === "replied") {
          const { reply } = queryResponse;
          hash2 = hashOfMap({
            status,
            reply,
            timestamp: BigInt(timestamp),
            request_id: requestId
          });
        } else if (status === "rejected") {
          const { reject_code, reject_message, error_code } = queryResponse;
          hash2 = hashOfMap({
            status,
            reject_code,
            reject_message,
            error_code,
            timestamp: BigInt(timestamp),
            request_id: requestId
          });
        } else {
          throw new Error(`Unknown status: ${status}`);
        }
        const separatorWithHash = concat$1(domainSeparator2, bufFromBufLike$1(new Uint8Array(hash2)));
        const pubKey = subnetStatus === null || subnetStatus === void 0 ? void 0 : subnetStatus.nodeKeys.get(nodeId);
        if (!pubKey) {
          throw new CertificateVerificationError("Invalid signature from replica signed query: no matching node key found.");
        }
        const rawKey = Ed25519PublicKey$1.fromDer(pubKey).rawKey;
        const valid = ed25519.verify(sig.signature, new Uint8Array(separatorWithHash), new Uint8Array(rawKey));
        if (valid)
          return queryResponse;
        throw new CertificateVerificationError(`Invalid signature from replica ${nodeId} signed query.`);
      }
      return queryResponse;
    });
    this.config = options;
    __classPrivateFieldSet$4(this, _HttpAgent_fetch, options.fetch || getDefaultFetch() || fetch.bind(globalThis));
    __classPrivateFieldSet$4(this, _HttpAgent_fetchOptions, options.fetchOptions);
    __classPrivateFieldSet$4(this, _HttpAgent_callOptions, options.callOptions);
    __classPrivateFieldSet$4(this, _HttpAgent_shouldFetchRootKey, (_a2 = options.shouldFetchRootKey) !== null && _a2 !== void 0 ? _a2 : false);
    if (options.rootKey) {
      this.rootKey = options.rootKey;
    } else if (__classPrivateFieldGet$4(this, _HttpAgent_shouldFetchRootKey, "f")) {
      this.rootKey = null;
    } else {
      this.rootKey = fromHex(IC_ROOT_KEY);
    }
    const host = determineHost(options.host);
    this.host = new URL(host);
    if (options.verifyQuerySignatures !== void 0) {
      __classPrivateFieldSet$4(this, _HttpAgent_verifyQuerySignatures, options.verifyQuerySignatures);
    }
    __classPrivateFieldSet$4(this, _HttpAgent_retryTimes, (_b2 = options.retryTimes) !== null && _b2 !== void 0 ? _b2 : 3);
    const defaultBackoffFactory = () => new ExponentialBackoff({
      maxIterations: __classPrivateFieldGet$4(this, _HttpAgent_retryTimes, "f")
    });
    __classPrivateFieldSet$4(this, _HttpAgent_backoffStrategy, options.backoffStrategy || defaultBackoffFactory);
    if (this.host.hostname.endsWith(IC0_SUB_DOMAIN)) {
      this.host.hostname = IC0_DOMAIN;
    } else if (this.host.hostname.endsWith(ICP0_SUB_DOMAIN)) {
      this.host.hostname = ICP0_DOMAIN;
    } else if (this.host.hostname.endsWith(ICP_API_SUB_DOMAIN)) {
      this.host.hostname = ICP_API_DOMAIN;
    }
    if (options.credentials) {
      const { name, password } = options.credentials;
      __classPrivateFieldSet$4(this, _HttpAgent_credentials, `${name}${password ? ":" + password : ""}`);
    }
    __classPrivateFieldSet$4(this, _HttpAgent_identity, Promise.resolve(options.identity || new AnonymousIdentity()));
    if (options.ingressExpiryInMinutes && options.ingressExpiryInMinutes > 5) {
      throw new AgentError(`The maximum ingress expiry time is 5 minutes. Provided ingress expiry time is ${options.ingressExpiryInMinutes} minutes.`);
    }
    if (options.ingressExpiryInMinutes && options.ingressExpiryInMinutes <= 0) {
      throw new AgentError(`Ingress expiry time must be greater than 0. Provided ingress expiry time is ${options.ingressExpiryInMinutes} minutes.`);
    }
    __classPrivateFieldSet$4(this, _HttpAgent_maxIngressExpiryInMinutes, options.ingressExpiryInMinutes || 5);
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
  get waterMark() {
    return __classPrivateFieldGet$4(this, _HttpAgent_waterMark, "f");
  }
  static createSync(options = {}) {
    return new this(Object.assign({}, options));
  }
  static async create(options = {
    shouldFetchRootKey: false
  }) {
    const agent = HttpAgent.createSync(options);
    const initPromises = [agent.syncTime()];
    if (agent.host.toString() !== "https://icp-api.io" && options.shouldFetchRootKey) {
      initPromises.push(agent.fetchRootKey());
    }
    await Promise.all(initPromises);
    return agent;
  }
  static async from(agent) {
    var _a2;
    try {
      if ("config" in agent) {
        return await HttpAgent.create(agent.config);
      }
      return await HttpAgent.create({
        fetch: agent._fetch,
        fetchOptions: agent._fetchOptions,
        callOptions: agent._callOptions,
        host: agent._host.toString(),
        identity: (_a2 = agent._identity) !== null && _a2 !== void 0 ? _a2 : void 0
      });
    } catch (_b2) {
      throw new AgentError("Failed to create agent from provided agent");
    }
  }
  isLocal() {
    const hostname = this.host.hostname;
    return hostname === "127.0.0.1" || hostname.endsWith("127.0.0.1");
  }
  addTransform(type, fn, priority = fn.priority || 0) {
    if (type === "update") {
      const i3 = __classPrivateFieldGet$4(this, _HttpAgent_updatePipeline, "f").findIndex((x2) => (x2.priority || 0) < priority);
      __classPrivateFieldGet$4(this, _HttpAgent_updatePipeline, "f").splice(i3 >= 0 ? i3 : __classPrivateFieldGet$4(this, _HttpAgent_updatePipeline, "f").length, 0, Object.assign(fn, { priority }));
    } else if (type === "query") {
      const i3 = __classPrivateFieldGet$4(this, _HttpAgent_queryPipeline, "f").findIndex((x2) => (x2.priority || 0) < priority);
      __classPrivateFieldGet$4(this, _HttpAgent_queryPipeline, "f").splice(i3 >= 0 ? i3 : __classPrivateFieldGet$4(this, _HttpAgent_queryPipeline, "f").length, 0, Object.assign(fn, { priority }));
    }
  }
  async getPrincipal() {
    if (!__classPrivateFieldGet$4(this, _HttpAgent_identity, "f")) {
      throw new IdentityInvalidError("This identity has expired due this application's security policy. Please refresh your authentication.");
    }
    return (await __classPrivateFieldGet$4(this, _HttpAgent_identity, "f")).getPrincipal();
  }
  /**
   * Makes a call to a canister method.
   * @param canisterId - The ID of the canister to call. Can be a Principal or a string.
   * @param options - Options for the call.
   * @param options.methodName - The name of the method to call.
   * @param options.arg - The argument to pass to the method, as an ArrayBuffer.
   * @param options.effectiveCanisterId - (Optional) The effective canister ID, if different from the target canister ID.
   * @param options.callSync - (Optional) Whether to use synchronous call mode. Defaults to true.
   * @param options.nonce - (Optional) A unique nonce for the request. If provided, it will override any nonce set by transforms.
   * @param identity - (Optional) The identity to use for the call. If not provided, the agent's current identity will be used.
   * @returns A promise that resolves to the response of the call, including the request ID and response details.
   */
  async call(canisterId2, options, identity) {
    var _a2, _b2;
    await __classPrivateFieldGet$4(this, _HttpAgent_instances, "m", _HttpAgent_rootKeyGuard).call(this);
    const callSync = (_a2 = options.callSync) !== null && _a2 !== void 0 ? _a2 : true;
    const id = await (identity !== void 0 ? await identity : await __classPrivateFieldGet$4(this, _HttpAgent_identity, "f"));
    if (!id) {
      throw new IdentityInvalidError("This identity has expired due this application's security policy. Please refresh your authentication.");
    }
    const canister = Principal$1.from(canisterId2);
    const ecid = options.effectiveCanisterId ? Principal$1.from(options.effectiveCanisterId) : canister;
    const sender = id.getPrincipal() || Principal$1.anonymous();
    let ingress_expiry = new Expiry(__classPrivateFieldGet$4(this, _HttpAgent_maxIngressExpiryInMinutes, "f") * MINUTE_TO_MSECS);
    if (Math.abs(__classPrivateFieldGet$4(this, _HttpAgent_timeDiffMsecs, "f")) > 1e3 * 30) {
      ingress_expiry = new Expiry(__classPrivateFieldGet$4(this, _HttpAgent_maxIngressExpiryInMinutes, "f") * MINUTE_TO_MSECS + __classPrivateFieldGet$4(this, _HttpAgent_timeDiffMsecs, "f"));
    }
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
        headers: Object.assign({ "Content-Type": "application/cbor" }, __classPrivateFieldGet$4(this, _HttpAgent_credentials, "f") ? { Authorization: "Basic " + btoa(__classPrivateFieldGet$4(this, _HttpAgent_credentials, "f")) } : {})
      },
      endpoint: "call",
      body: submit
    });
    let nonce;
    if (options === null || options === void 0 ? void 0 : options.nonce) {
      nonce = toNonce(options.nonce);
    } else if (transformedRequest.body.nonce) {
      nonce = toNonce(transformedRequest.body.nonce);
    } else {
      nonce = void 0;
    }
    submit.nonce = nonce;
    function toNonce(buf) {
      return new Uint8Array(buf);
    }
    transformedRequest = await id.transformRequest(transformedRequest);
    const body = encode(transformedRequest.body);
    const backoff2 = __classPrivateFieldGet$4(this, _HttpAgent_backoffStrategy, "f").call(this);
    const requestId = requestIdOf(submit);
    try {
      const requestSync = () => {
        this.log.print(`fetching "/api/v3/canister/${ecid.toText()}/call" with request:`, transformedRequest);
        return __classPrivateFieldGet$4(this, _HttpAgent_fetch, "f").call(this, "" + new URL(`/api/v3/canister/${ecid.toText()}/call`, this.host), Object.assign(Object.assign(Object.assign({}, __classPrivateFieldGet$4(this, _HttpAgent_callOptions, "f")), transformedRequest.request), { body }));
      };
      const requestAsync = () => {
        this.log.print(`fetching "/api/v2/canister/${ecid.toText()}/call" with request:`, transformedRequest);
        return __classPrivateFieldGet$4(this, _HttpAgent_fetch, "f").call(this, "" + new URL(`/api/v2/canister/${ecid.toText()}/call`, this.host), Object.assign(Object.assign(Object.assign({}, __classPrivateFieldGet$4(this, _HttpAgent_callOptions, "f")), transformedRequest.request), { body }));
      };
      const request2 = __classPrivateFieldGet$4(this, _HttpAgent_instances, "m", _HttpAgent_requestAndRetry).call(this, {
        request: callSync ? requestSync : requestAsync,
        backoff: backoff2,
        tries: 0
      });
      const response = await request2;
      const responseBuffer = await response.arrayBuffer();
      const responseBody = response.status === 200 && responseBuffer.byteLength > 0 ? decode(responseBuffer) : null;
      if (responseBody && "certificate" in responseBody) {
        const time = await this.parseTimeFromResponse({
          certificate: responseBody.certificate
        });
        __classPrivateFieldSet$4(this, _HttpAgent_waterMark, time, "f");
      }
      return {
        requestId,
        response: {
          ok: response.ok,
          status: response.status,
          statusText: response.statusText,
          body: responseBody,
          headers: httpHeadersTransform(response.headers)
        },
        requestDetails: submit
      };
    } catch (error) {
      if (error.message.includes("v3 api not supported.")) {
        this.log.warn("v3 api not supported. Fall back to v2");
        return this.call(canisterId2, Object.assign(Object.assign({}, options), {
          // disable v3 api
          callSync: false
        }), identity);
      }
      const message = `Error while making call: ${(_b2 = error.message) !== null && _b2 !== void 0 ? _b2 : String(error)}`;
      const callError = new AgentCallError(message, error, toHex(requestId), toHex(transformedRequest.body.sender_pubkey), toHex(transformedRequest.body.sender_sig), String(transformedRequest.body.content.ingress_expiry["_value"]));
      this.log.error(message, callError);
      throw callError;
    }
  }
  async query(canisterId2, fields, identity) {
    var _a2, _b2, _c, _d;
    await __classPrivateFieldGet$4(this, _HttpAgent_instances, "m", _HttpAgent_rootKeyGuard).call(this);
    const backoff2 = __classPrivateFieldGet$4(this, _HttpAgent_backoffStrategy, "f").call(this);
    const ecid = fields.effectiveCanisterId ? Principal$1.from(fields.effectiveCanisterId) : Principal$1.from(canisterId2);
    this.log.print(`ecid ${ecid.toString()}`);
    this.log.print(`canisterId ${canisterId2.toString()}`);
    let transformedRequest = void 0;
    let queryResult;
    const id = await (identity !== void 0 ? identity : __classPrivateFieldGet$4(this, _HttpAgent_identity, "f"));
    if (!id) {
      throw new IdentityInvalidError("This identity has expired due this application's security policy. Please refresh your authentication.");
    }
    const canister = Principal$1.from(canisterId2);
    const sender = (id === null || id === void 0 ? void 0 : id.getPrincipal()) || Principal$1.anonymous();
    const request2 = {
      request_type: "query",
      canister_id: canister,
      method_name: fields.methodName,
      arg: fields.arg,
      sender,
      ingress_expiry: new Expiry(__classPrivateFieldGet$4(this, _HttpAgent_maxIngressExpiryInMinutes, "f") * MINUTE_TO_MSECS)
    };
    const requestId = requestIdOf(request2);
    transformedRequest = await this._transform({
      request: {
        method: "POST",
        headers: Object.assign({ "Content-Type": "application/cbor" }, __classPrivateFieldGet$4(this, _HttpAgent_credentials, "f") ? { Authorization: "Basic " + btoa(__classPrivateFieldGet$4(this, _HttpAgent_credentials, "f")) } : {})
      },
      endpoint: "read",
      body: request2
    });
    transformedRequest = await (id === null || id === void 0 ? void 0 : id.transformRequest(transformedRequest));
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
      return {
        requestDetails: request2,
        query: await __classPrivateFieldGet$4(this, _HttpAgent_instances, "m", _HttpAgent_requestAndRetryQuery).call(this, args)
      };
    };
    const getSubnetStatus = async () => {
      if (!__classPrivateFieldGet$4(this, _HttpAgent_verifyQuerySignatures, "f")) {
        return void 0;
      }
      const subnetStatus = __classPrivateFieldGet$4(this, _HttpAgent_subnetKeys, "f").get(ecid.toString());
      if (subnetStatus) {
        return subnetStatus;
      }
      await this.fetchSubnetKeys(ecid.toString());
      return __classPrivateFieldGet$4(this, _HttpAgent_subnetKeys, "f").get(ecid.toString());
    };
    try {
      const [_queryResult, subnetStatus] = await Promise.all([makeQuery(), getSubnetStatus()]);
      queryResult = _queryResult;
      const { requestDetails, query } = queryResult;
      const queryWithDetails = Object.assign(Object.assign({}, query), { requestDetails });
      this.log.print("Query response:", queryWithDetails);
      if (!__classPrivateFieldGet$4(this, _HttpAgent_verifyQuerySignatures, "f")) {
        return queryWithDetails;
      }
      try {
        return __classPrivateFieldGet$4(this, _HttpAgent_verifyQueryResponse, "f").call(this, queryWithDetails, subnetStatus);
      } catch (_e) {
        this.log.warn("Query response verification failed. Retrying with fresh subnet keys.");
        __classPrivateFieldGet$4(this, _HttpAgent_subnetKeys, "f").delete(canisterId2.toString());
        await this.fetchSubnetKeys(ecid.toString());
        const updatedSubnetStatus = __classPrivateFieldGet$4(this, _HttpAgent_subnetKeys, "f").get(canisterId2.toString());
        if (!updatedSubnetStatus) {
          throw new CertificateVerificationError("Invalid signature from replica signed query: no matching node key found.");
        }
        return __classPrivateFieldGet$4(this, _HttpAgent_verifyQueryResponse, "f").call(this, queryWithDetails, updatedSubnetStatus);
      }
    } catch (error) {
      const message = `Error while making call: ${(_a2 = error.message) !== null && _a2 !== void 0 ? _a2 : String(error)}`;
      const queryError = new AgentQueryError(message, error, String(requestId), toHex((_b2 = transformedRequest === null || transformedRequest === void 0 ? void 0 : transformedRequest.body) === null || _b2 === void 0 ? void 0 : _b2.sender_pubkey), toHex((_c = transformedRequest === null || transformedRequest === void 0 ? void 0 : transformedRequest.body) === null || _c === void 0 ? void 0 : _c.sender_sig), String((_d = transformedRequest === null || transformedRequest === void 0 ? void 0 : transformedRequest.body) === null || _d === void 0 ? void 0 : _d.content.ingress_expiry["_value"]));
      this.log.error(message, queryError);
      throw queryError;
    }
  }
  async createReadStateRequest(fields, identity) {
    await __classPrivateFieldGet$4(this, _HttpAgent_instances, "m", _HttpAgent_rootKeyGuard).call(this);
    const id = await (identity !== void 0 ? await identity : await __classPrivateFieldGet$4(this, _HttpAgent_identity, "f"));
    if (!id) {
      throw new IdentityInvalidError("This identity has expired due this application's security policy. Please refresh your authentication.");
    }
    const sender = (id === null || id === void 0 ? void 0 : id.getPrincipal()) || Principal$1.anonymous();
    const transformedRequest = await this._transform({
      request: {
        method: "POST",
        headers: Object.assign({ "Content-Type": "application/cbor" }, __classPrivateFieldGet$4(this, _HttpAgent_credentials, "f") ? { Authorization: "Basic " + btoa(__classPrivateFieldGet$4(this, _HttpAgent_credentials, "f")) } : {})
      },
      endpoint: "read_state",
      body: {
        request_type: "read_state",
        paths: fields.paths,
        sender,
        ingress_expiry: new Expiry(__classPrivateFieldGet$4(this, _HttpAgent_maxIngressExpiryInMinutes, "f") * MINUTE_TO_MSECS)
      }
    });
    return id === null || id === void 0 ? void 0 : id.transformRequest(transformedRequest);
  }
  async readState(canisterId2, fields, identity, request2) {
    var _a2, _b2, _c, _d;
    function getRequestId(fields2) {
      for (const path of fields2.paths) {
        const [pathName, value2] = path;
        const request_status = bufFromBufLike$1(new TextEncoder().encode("request_status"));
        if (bufEquals(pathName, request_status)) {
          return value2;
        }
      }
    }
    const requestId = getRequestId(fields);
    await __classPrivateFieldGet$4(this, _HttpAgent_instances, "m", _HttpAgent_rootKeyGuard).call(this);
    const canister = typeof canisterId2 === "string" ? Principal$1.fromText(canisterId2) : canisterId2;
    const transformedRequest = request2 !== null && request2 !== void 0 ? request2 : await this.createReadStateRequest(fields, identity);
    const body = encode(transformedRequest.body);
    this.log.print(`fetching "/api/v2/canister/${canister}/read_state" with request:`, transformedRequest);
    const backoff2 = __classPrivateFieldGet$4(this, _HttpAgent_backoffStrategy, "f").call(this);
    try {
      const response = await __classPrivateFieldGet$4(this, _HttpAgent_instances, "m", _HttpAgent_requestAndRetry).call(this, {
        request: () => __classPrivateFieldGet$4(this, _HttpAgent_fetch, "f").call(this, "" + new URL(`/api/v2/canister/${canister.toString()}/read_state`, this.host), Object.assign(Object.assign(Object.assign({}, __classPrivateFieldGet$4(this, _HttpAgent_fetchOptions, "f")), transformedRequest.request), { body })),
        backoff: backoff2,
        tries: 0
      });
      if (!response.ok) {
        throw new Error(`Server returned an error:
  Code: ${response.status} (${response.statusText})
  Body: ${await response.text()}
`);
      }
      const decodedResponse = decode(await response.arrayBuffer());
      this.log.print("Read state response:", decodedResponse);
      const parsedTime = await this.parseTimeFromResponse(decodedResponse);
      if (parsedTime > 0) {
        this.log.print("Read state response time:", parsedTime);
        __classPrivateFieldSet$4(this, _HttpAgent_waterMark, parsedTime, "f");
      }
      return decodedResponse;
    } catch (error) {
      const message = `Caught exception while attempting to read state: ${(_a2 = error.message) !== null && _a2 !== void 0 ? _a2 : String(error)}`;
      const readStateError = new AgentReadStateError(message, error, String(requestId), toHex((_b2 = transformedRequest === null || transformedRequest === void 0 ? void 0 : transformedRequest.body) === null || _b2 === void 0 ? void 0 : _b2.sender_pubkey), toHex((_c = transformedRequest === null || transformedRequest === void 0 ? void 0 : transformedRequest.body) === null || _c === void 0 ? void 0 : _c.sender_sig), String((_d = transformedRequest === null || transformedRequest === void 0 ? void 0 : transformedRequest.body) === null || _d === void 0 ? void 0 : _d.content.ingress_expiry["_value"]));
      this.log.error(message, readStateError);
      throw readStateError;
    }
  }
  async parseTimeFromResponse(response) {
    let tree;
    if (response.certificate) {
      const decoded = decode(response.certificate);
      if (decoded && "tree" in decoded) {
        tree = decoded.tree;
      } else {
        throw new Error("Could not decode time from response");
      }
      const timeLookup = lookup_path(["time"], tree);
      if (timeLookup.status !== LookupStatus.Found) {
        throw new Error("Time was not found in the response or was not in its expected format.");
      }
      if (!(timeLookup.value instanceof ArrayBuffer) && !ArrayBuffer.isView(timeLookup)) {
        throw new Error("Time was not found in the response or was not in its expected format.");
      }
      const date = decodeTime(bufFromBufLike$1(timeLookup.value));
      this.log.print("Time from response:", date);
      this.log.print("Time from response in milliseconds:", Number(date));
      return Number(date);
    } else {
      this.log.warn("No certificate found in response");
    }
    return 0;
  }
  /**
   * Allows agent to sync its time with the network. Can be called during intialization or mid-lifecycle if the device's clock has drifted away from the network time. This is necessary to set the Expiry for a request
   * @param {Principal} canisterId - Pass a canister ID if you need to sync the time with a particular replica. Uses the management canister by default
   */
  async syncTime(canisterId2) {
    await __classPrivateFieldGet$4(this, _HttpAgent_instances, "m", _HttpAgent_rootKeyGuard).call(this);
    const CanisterStatus = await __vitePreload(() => Promise.resolve().then(() => index), true ? void 0 : void 0);
    const callTime = Date.now();
    try {
      if (!canisterId2) {
        this.log.print("Syncing time with the IC. No canisterId provided, so falling back to ryjl3-tyaaa-aaaaa-aaaba-cai");
      }
      const anonymousAgent = HttpAgent.createSync({
        identity: new AnonymousIdentity(),
        host: this.host.toString(),
        fetch: __classPrivateFieldGet$4(this, _HttpAgent_fetch, "f"),
        retryTimes: 0
      });
      const status = await CanisterStatus.request({
        // Fall back with canisterId of the ICP Ledger
        canisterId: canisterId2 !== null && canisterId2 !== void 0 ? canisterId2 : Principal$1.from("ryjl3-tyaaa-aaaaa-aaaba-cai"),
        agent: anonymousAgent,
        paths: ["time"]
      });
      const replicaTime = status.get("time");
      if (replicaTime) {
        __classPrivateFieldSet$4(this, _HttpAgent_timeDiffMsecs, Number(replicaTime) - Number(callTime), "f");
        this.log.notify({
          message: `Syncing time: offset of ${__classPrivateFieldGet$4(this, _HttpAgent_timeDiffMsecs, "f")}`,
          level: "info"
        });
      }
    } catch (error) {
      this.log.error("Caught exception while attempting to sync time", error);
    }
  }
  async status() {
    const headers = __classPrivateFieldGet$4(this, _HttpAgent_credentials, "f") ? {
      Authorization: "Basic " + btoa(__classPrivateFieldGet$4(this, _HttpAgent_credentials, "f"))
    } : {};
    this.log.print(`fetching "/api/v2/status"`);
    const backoff2 = __classPrivateFieldGet$4(this, _HttpAgent_backoffStrategy, "f").call(this);
    const response = await __classPrivateFieldGet$4(this, _HttpAgent_instances, "m", _HttpAgent_requestAndRetry).call(this, {
      backoff: backoff2,
      request: () => __classPrivateFieldGet$4(this, _HttpAgent_fetch, "f").call(this, "" + new URL(`/api/v2/status`, this.host), Object.assign({ headers }, __classPrivateFieldGet$4(this, _HttpAgent_fetchOptions, "f"))),
      tries: 0
    });
    return decode(await response.arrayBuffer());
  }
  async fetchRootKey() {
    let result;
    if (__classPrivateFieldGet$4(this, _HttpAgent_rootKeyPromise, "f")) {
      result = await __classPrivateFieldGet$4(this, _HttpAgent_rootKeyPromise, "f");
    } else {
      __classPrivateFieldSet$4(this, _HttpAgent_rootKeyPromise, new Promise((resolve, reject) => {
        this.status().then((value2) => {
          const rootKey = value2.root_key;
          this.rootKey = rootKey;
          resolve(rootKey);
        }).catch(reject);
      }));
      result = await __classPrivateFieldGet$4(this, _HttpAgent_rootKeyPromise, "f");
    }
    __classPrivateFieldSet$4(this, _HttpAgent_rootKeyPromise, null);
    return result;
  }
  invalidateIdentity() {
    __classPrivateFieldSet$4(this, _HttpAgent_identity, null);
  }
  replaceIdentity(identity) {
    __classPrivateFieldSet$4(this, _HttpAgent_identity, Promise.resolve(identity));
  }
  async fetchSubnetKeys(canisterId2) {
    await __classPrivateFieldGet$4(this, _HttpAgent_instances, "m", _HttpAgent_rootKeyGuard).call(this);
    const effectiveCanisterId = Principal$1.from(canisterId2);
    const response = await request({
      canisterId: effectiveCanisterId,
      paths: ["subnet"],
      agent: this
    });
    const subnetResponse = response.get("subnet");
    if (subnetResponse && typeof subnetResponse === "object" && "nodeKeys" in subnetResponse) {
      __classPrivateFieldGet$4(this, _HttpAgent_subnetKeys, "f").set(effectiveCanisterId.toText(), subnetResponse);
      return subnetResponse;
    }
    return void 0;
  }
  _transform(request2) {
    let p = Promise.resolve(request2);
    if (request2.endpoint === "call") {
      for (const fn of __classPrivateFieldGet$4(this, _HttpAgent_updatePipeline, "f")) {
        p = p.then((r2) => fn(r2).then((r22) => r22 || r2));
      }
    } else {
      for (const fn of __classPrivateFieldGet$4(this, _HttpAgent_queryPipeline, "f")) {
        p = p.then((r2) => fn(r2).then((r22) => r22 || r2));
      }
    }
    return p;
  }
}
_HttpAgent_rootKeyPromise = /* @__PURE__ */ new WeakMap(), _HttpAgent_shouldFetchRootKey = /* @__PURE__ */ new WeakMap(), _HttpAgent_identity = /* @__PURE__ */ new WeakMap(), _HttpAgent_fetch = /* @__PURE__ */ new WeakMap(), _HttpAgent_fetchOptions = /* @__PURE__ */ new WeakMap(), _HttpAgent_callOptions = /* @__PURE__ */ new WeakMap(), _HttpAgent_timeDiffMsecs = /* @__PURE__ */ new WeakMap(), _HttpAgent_credentials = /* @__PURE__ */ new WeakMap(), _HttpAgent_retryTimes = /* @__PURE__ */ new WeakMap(), _HttpAgent_backoffStrategy = /* @__PURE__ */ new WeakMap(), _HttpAgent_maxIngressExpiryInMinutes = /* @__PURE__ */ new WeakMap(), _HttpAgent_waterMark = /* @__PURE__ */ new WeakMap(), _HttpAgent_queryPipeline = /* @__PURE__ */ new WeakMap(), _HttpAgent_updatePipeline = /* @__PURE__ */ new WeakMap(), _HttpAgent_subnetKeys = /* @__PURE__ */ new WeakMap(), _HttpAgent_verifyQuerySignatures = /* @__PURE__ */ new WeakMap(), _HttpAgent_verifyQueryResponse = /* @__PURE__ */ new WeakMap(), _HttpAgent_instances = /* @__PURE__ */ new WeakSet(), _HttpAgent_requestAndRetryQuery = async function _HttpAgent_requestAndRetryQuery2(args) {
  var _a2, _b2;
  const { ecid, transformedRequest, body, requestId, backoff: backoff2, tries } = args;
  const delay = tries === 0 ? 0 : backoff2.next();
  this.log.print(`fetching "/api/v2/canister/${ecid.toString()}/query" with tries:`, {
    tries,
    backoff: backoff2,
    delay
  });
  if (delay === null) {
    throw new AgentError(`Timestamp failed to pass the watermark after retrying the configured ${__classPrivateFieldGet$4(this, _HttpAgent_retryTimes, "f")} times. We cannot guarantee the integrity of the response since it could be a replay attack.`);
  }
  if (delay > 0) {
    await new Promise((resolve) => setTimeout(resolve, delay));
  }
  let response;
  try {
    this.log.print(`fetching "/api/v2/canister/${ecid.toString()}/query" with request:`, transformedRequest);
    const fetchResponse = await __classPrivateFieldGet$4(this, _HttpAgent_fetch, "f").call(this, "" + new URL(`/api/v2/canister/${ecid.toString()}/query`, this.host), Object.assign(Object.assign(Object.assign({}, __classPrivateFieldGet$4(this, _HttpAgent_fetchOptions, "f")), transformedRequest.request), { body }));
    if (fetchResponse.status === 200) {
      const queryResponse = decode(await fetchResponse.arrayBuffer());
      response = Object.assign(Object.assign({}, queryResponse), { httpDetails: {
        ok: fetchResponse.ok,
        status: fetchResponse.status,
        statusText: fetchResponse.statusText,
        headers: httpHeadersTransform(fetchResponse.headers)
      }, requestId });
    } else {
      throw new AgentHTTPResponseError(`Gateway returned an error:
  Code: ${fetchResponse.status} (${fetchResponse.statusText})
  Body: ${await fetchResponse.text()}
`, {
        ok: fetchResponse.ok,
        status: fetchResponse.status,
        statusText: fetchResponse.statusText,
        headers: httpHeadersTransform(fetchResponse.headers)
      });
    }
  } catch (error) {
    if (tries < __classPrivateFieldGet$4(this, _HttpAgent_retryTimes, "f")) {
      this.log.warn(`Caught exception while attempting to make query:
  ${error}
  Retrying query.`);
      return await __classPrivateFieldGet$4(this, _HttpAgent_instances, "m", _HttpAgent_requestAndRetryQuery2).call(this, Object.assign(Object.assign({}, args), { tries: tries + 1 }));
    }
    throw error;
  }
  const timestamp = (_b2 = (_a2 = response.signatures) === null || _a2 === void 0 ? void 0 : _a2[0]) === null || _b2 === void 0 ? void 0 : _b2.timestamp;
  if (!__classPrivateFieldGet$4(this, _HttpAgent_verifyQuerySignatures, "f")) {
    return response;
  }
  if (!timestamp) {
    throw new Error("Timestamp not found in query response. This suggests a malformed or malicious response.");
  }
  const timeStampInMs = Number(BigInt(timestamp) / BigInt(1e6));
  this.log.print("watermark and timestamp", {
    waterMark: this.waterMark,
    timestamp: timeStampInMs
  });
  if (Number(this.waterMark) > timeStampInMs) {
    const error = new AgentError("Timestamp is below the watermark. Retrying query.");
    this.log.error("Timestamp is below", error, {
      timestamp,
      waterMark: this.waterMark
    });
    if (tries < __classPrivateFieldGet$4(this, _HttpAgent_retryTimes, "f")) {
      return await __classPrivateFieldGet$4(this, _HttpAgent_instances, "m", _HttpAgent_requestAndRetryQuery2).call(this, Object.assign(Object.assign({}, args), { tries: tries + 1 }));
    }
    {
      throw new AgentError(`Timestamp failed to pass the watermark after retrying the configured ${__classPrivateFieldGet$4(this, _HttpAgent_retryTimes, "f")} times. We cannot guarantee the integrity of the response since it could be a replay attack.`);
    }
  }
  return response;
}, _HttpAgent_requestAndRetry = async function _HttpAgent_requestAndRetry2(args) {
  const { request: request2, backoff: backoff2, tries } = args;
  const delay = tries === 0 ? 0 : backoff2.next();
  if (delay === null) {
    throw new AgentError(`Timestamp failed to pass the watermark after retrying the configured ${__classPrivateFieldGet$4(this, _HttpAgent_retryTimes, "f")} times. We cannot guarantee the integrity of the response since it could be a replay attack.`);
  }
  if (delay > 0) {
    await new Promise((resolve) => setTimeout(resolve, delay));
  }
  let response;
  try {
    response = await request2();
  } catch (error) {
    if (__classPrivateFieldGet$4(this, _HttpAgent_retryTimes, "f") > tries) {
      this.log.warn(`Caught exception while attempting to make request:
  ${error}
  Retrying request.`);
      return await __classPrivateFieldGet$4(this, _HttpAgent_instances, "m", _HttpAgent_requestAndRetry2).call(this, { request: request2, backoff: backoff2, tries: tries + 1 });
    }
    throw error;
  }
  if (response.ok) {
    return response;
  }
  const responseText = await response.clone().text();
  const errorMessage = `Server returned an error:
  Code: ${response.status} (${response.statusText})
  Body: ${responseText}
`;
  if (response.status === 404 && response.url.includes("api/v3")) {
    throw new AgentHTTPResponseError("v3 api not supported. Fall back to v2", {
      ok: response.ok,
      status: response.status,
      statusText: response.statusText,
      headers: httpHeadersTransform(response.headers)
    });
  }
  if (tries < __classPrivateFieldGet$4(this, _HttpAgent_retryTimes, "f")) {
    return await __classPrivateFieldGet$4(this, _HttpAgent_instances, "m", _HttpAgent_requestAndRetry2).call(this, { request: request2, backoff: backoff2, tries: tries + 1 });
  }
  throw new AgentHTTPResponseError(errorMessage, {
    ok: response.ok,
    status: response.status,
    statusText: response.statusText,
    headers: httpHeadersTransform(response.headers)
  });
}, _HttpAgent_rootKeyGuard = async function _HttpAgent_rootKeyGuard2() {
  if (this.rootKey) {
    return;
  } else if (this.rootKey === null && __classPrivateFieldGet$4(this, _HttpAgent_shouldFetchRootKey, "f")) {
    await this.fetchRootKey();
  } else {
    throw new AgentError(`Invalid root key detected. The root key for this agent is ${this.rootKey} and the shouldFetchRootKey value is set to ${__classPrivateFieldGet$4(this, _HttpAgent_shouldFetchRootKey, "f")}. The root key should only be unknown if you are in local development. Otherwise you should avoid fetching and use the default IC Root Key or the known root key of your environment.`);
  }
};
var ProxyMessageKind;
(function(ProxyMessageKind2) {
  ProxyMessageKind2["Error"] = "err";
  ProxyMessageKind2["GetPrincipal"] = "gp";
  ProxyMessageKind2["GetPrincipalResponse"] = "gpr";
  ProxyMessageKind2["Query"] = "q";
  ProxyMessageKind2["QueryResponse"] = "qr";
  ProxyMessageKind2["Call"] = "c";
  ProxyMessageKind2["CallResponse"] = "cr";
  ProxyMessageKind2["ReadState"] = "rs";
  ProxyMessageKind2["ReadStateResponse"] = "rsr";
  ProxyMessageKind2["Status"] = "s";
  ProxyMessageKind2["StatusResponse"] = "sr";
})(ProxyMessageKind || (ProxyMessageKind = {}));
function getDefaultAgent() {
  const agent = typeof window === "undefined" ? typeof globalThis === "undefined" ? typeof self === "undefined" ? void 0 : self.ic.agent : globalThis.ic.agent : window.ic.agent;
  if (!agent) {
    throw new Error("No Agent could be found.");
  }
  return agent;
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
  return async (canisterId2, requestId, status) => {
    if (Date.now() > end) {
      throw new Error(`Request timed out after ${timeInMsec} msec:
  Request ID: ${toHex(requestId)}
  Request status: ${status}
`);
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
    for (const a of strategies) {
      await a(canisterId2, requestId, status);
    }
  };
}
async function pollForResponse(agent, canisterId2, requestId, strategy = defaultStrategy(), request2, blsVerify2) {
  var _a2;
  const path = [new TextEncoder().encode("request_status"), requestId];
  const currentRequest = request2 !== null && request2 !== void 0 ? request2 : await ((_a2 = agent.createReadStateRequest) === null || _a2 === void 0 ? void 0 : _a2.call(agent, { paths: [path] }));
  const state = await agent.readState(canisterId2, { paths: [path] }, void 0, currentRequest);
  if (agent.rootKey == null)
    throw new Error("Agent root key not initialized before polling");
  const cert = await Certificate.create({
    certificate: state.certificate,
    rootKey: agent.rootKey,
    canisterId: canisterId2,
    blsVerify: blsVerify2
  });
  const maybeBuf = lookupResultToBuffer(cert.lookup([...path, new TextEncoder().encode("status")]));
  let status;
  if (typeof maybeBuf === "undefined") {
    status = RequestStatusResponseStatus.Unknown;
  } else {
    status = new TextDecoder().decode(maybeBuf);
  }
  switch (status) {
    case RequestStatusResponseStatus.Replied: {
      return {
        reply: lookupResultToBuffer(cert.lookup([...path, "reply"])),
        certificate: cert
      };
    }
    case RequestStatusResponseStatus.Received:
    case RequestStatusResponseStatus.Unknown:
    case RequestStatusResponseStatus.Processing:
      await strategy(canisterId2, requestId, status);
      return pollForResponse(agent, canisterId2, requestId, strategy, currentRequest, blsVerify2);
    case RequestStatusResponseStatus.Rejected: {
      const rejectCode = new Uint8Array(lookupResultToBuffer(cert.lookup([...path, "reject_code"])))[0];
      const rejectMessage = new TextDecoder().decode(lookupResultToBuffer(cert.lookup([...path, "reject_message"])));
      throw new Error(`Call was rejected:
  Request ID: ${toHex(requestId)}
  Reject code: ${rejectCode}
  Reject text: ${rejectMessage}
`);
    }
    case RequestStatusResponseStatus.Done:
      throw new Error(`Call was marked as done but we never saw the reply:
  Request ID: ${toHex(requestId)}
`);
  }
  throw new Error("unreachable");
}
const managementCanisterIdl = ({ IDL: IDL2 }) => {
  const bitcoin_network = IDL2.Variant({
    mainnet: IDL2.Null,
    testnet: IDL2.Null
  });
  const bitcoin_address = IDL2.Text;
  const bitcoin_get_balance_args = IDL2.Record({
    network: bitcoin_network,
    address: bitcoin_address,
    min_confirmations: IDL2.Opt(IDL2.Nat32)
  });
  const satoshi = IDL2.Nat64;
  const bitcoin_get_balance_result = satoshi;
  const bitcoin_block_height = IDL2.Nat32;
  const bitcoin_get_block_headers_args = IDL2.Record({
    start_height: bitcoin_block_height,
    end_height: IDL2.Opt(bitcoin_block_height),
    network: bitcoin_network
  });
  const bitcoin_block_header = IDL2.Vec(IDL2.Nat8);
  const bitcoin_get_block_headers_result = IDL2.Record({
    tip_height: bitcoin_block_height,
    block_headers: IDL2.Vec(bitcoin_block_header)
  });
  const bitcoin_get_current_fee_percentiles_args = IDL2.Record({
    network: bitcoin_network
  });
  const millisatoshi_per_byte = IDL2.Nat64;
  const bitcoin_get_current_fee_percentiles_result = IDL2.Vec(millisatoshi_per_byte);
  const bitcoin_get_utxos_args = IDL2.Record({
    network: bitcoin_network,
    filter: IDL2.Opt(IDL2.Variant({
      page: IDL2.Vec(IDL2.Nat8),
      min_confirmations: IDL2.Nat32
    })),
    address: bitcoin_address
  });
  const bitcoin_block_hash = IDL2.Vec(IDL2.Nat8);
  const outpoint = IDL2.Record({
    txid: IDL2.Vec(IDL2.Nat8),
    vout: IDL2.Nat32
  });
  const utxo = IDL2.Record({
    height: IDL2.Nat32,
    value: satoshi,
    outpoint
  });
  const bitcoin_get_utxos_result = IDL2.Record({
    next_page: IDL2.Opt(IDL2.Vec(IDL2.Nat8)),
    tip_height: bitcoin_block_height,
    tip_block_hash: bitcoin_block_hash,
    utxos: IDL2.Vec(utxo)
  });
  const bitcoin_send_transaction_args = IDL2.Record({
    transaction: IDL2.Vec(IDL2.Nat8),
    network: bitcoin_network
  });
  const canister_id = IDL2.Principal;
  const canister_info_args = IDL2.Record({
    canister_id,
    num_requested_changes: IDL2.Opt(IDL2.Nat64)
  });
  const change_origin = IDL2.Variant({
    from_user: IDL2.Record({ user_id: IDL2.Principal }),
    from_canister: IDL2.Record({
      canister_version: IDL2.Opt(IDL2.Nat64),
      canister_id: IDL2.Principal
    })
  });
  const snapshot_id = IDL2.Vec(IDL2.Nat8);
  const change_details = IDL2.Variant({
    creation: IDL2.Record({ controllers: IDL2.Vec(IDL2.Principal) }),
    code_deployment: IDL2.Record({
      mode: IDL2.Variant({
        reinstall: IDL2.Null,
        upgrade: IDL2.Null,
        install: IDL2.Null
      }),
      module_hash: IDL2.Vec(IDL2.Nat8)
    }),
    load_snapshot: IDL2.Record({
      canister_version: IDL2.Nat64,
      taken_at_timestamp: IDL2.Nat64,
      snapshot_id
    }),
    controllers_change: IDL2.Record({
      controllers: IDL2.Vec(IDL2.Principal)
    }),
    code_uninstall: IDL2.Null
  });
  const change = IDL2.Record({
    timestamp_nanos: IDL2.Nat64,
    canister_version: IDL2.Nat64,
    origin: change_origin,
    details: change_details
  });
  const canister_info_result = IDL2.Record({
    controllers: IDL2.Vec(IDL2.Principal),
    module_hash: IDL2.Opt(IDL2.Vec(IDL2.Nat8)),
    recent_changes: IDL2.Vec(change),
    total_num_changes: IDL2.Nat64
  });
  const canister_status_args = IDL2.Record({ canister_id });
  const log_visibility = IDL2.Variant({
    controllers: IDL2.Null,
    public: IDL2.Null,
    allowed_viewers: IDL2.Vec(IDL2.Principal)
  });
  const definite_canister_settings = IDL2.Record({
    freezing_threshold: IDL2.Nat,
    controllers: IDL2.Vec(IDL2.Principal),
    reserved_cycles_limit: IDL2.Nat,
    log_visibility,
    wasm_memory_limit: IDL2.Nat,
    memory_allocation: IDL2.Nat,
    compute_allocation: IDL2.Nat
  });
  const canister_status_result = IDL2.Record({
    status: IDL2.Variant({
      stopped: IDL2.Null,
      stopping: IDL2.Null,
      running: IDL2.Null
    }),
    memory_size: IDL2.Nat,
    cycles: IDL2.Nat,
    settings: definite_canister_settings,
    query_stats: IDL2.Record({
      response_payload_bytes_total: IDL2.Nat,
      num_instructions_total: IDL2.Nat,
      num_calls_total: IDL2.Nat,
      request_payload_bytes_total: IDL2.Nat
    }),
    idle_cycles_burned_per_day: IDL2.Nat,
    module_hash: IDL2.Opt(IDL2.Vec(IDL2.Nat8)),
    reserved_cycles: IDL2.Nat
  });
  const clear_chunk_store_args = IDL2.Record({ canister_id });
  const canister_settings = IDL2.Record({
    freezing_threshold: IDL2.Opt(IDL2.Nat),
    controllers: IDL2.Opt(IDL2.Vec(IDL2.Principal)),
    reserved_cycles_limit: IDL2.Opt(IDL2.Nat),
    log_visibility: IDL2.Opt(log_visibility),
    wasm_memory_limit: IDL2.Opt(IDL2.Nat),
    memory_allocation: IDL2.Opt(IDL2.Nat),
    compute_allocation: IDL2.Opt(IDL2.Nat)
  });
  const create_canister_args = IDL2.Record({
    settings: IDL2.Opt(canister_settings),
    sender_canister_version: IDL2.Opt(IDL2.Nat64)
  });
  const create_canister_result = IDL2.Record({ canister_id });
  const delete_canister_args = IDL2.Record({ canister_id });
  const delete_canister_snapshot_args = IDL2.Record({
    canister_id,
    snapshot_id
  });
  const deposit_cycles_args = IDL2.Record({ canister_id });
  const ecdsa_curve = IDL2.Variant({ secp256k1: IDL2.Null });
  const ecdsa_public_key_args = IDL2.Record({
    key_id: IDL2.Record({ name: IDL2.Text, curve: ecdsa_curve }),
    canister_id: IDL2.Opt(canister_id),
    derivation_path: IDL2.Vec(IDL2.Vec(IDL2.Nat8))
  });
  const ecdsa_public_key_result = IDL2.Record({
    public_key: IDL2.Vec(IDL2.Nat8),
    chain_code: IDL2.Vec(IDL2.Nat8)
  });
  const fetch_canister_logs_args = IDL2.Record({ canister_id });
  const canister_log_record = IDL2.Record({
    idx: IDL2.Nat64,
    timestamp_nanos: IDL2.Nat64,
    content: IDL2.Vec(IDL2.Nat8)
  });
  const fetch_canister_logs_result = IDL2.Record({
    canister_log_records: IDL2.Vec(canister_log_record)
  });
  const http_header = IDL2.Record({ value: IDL2.Text, name: IDL2.Text });
  const http_request_result = IDL2.Record({
    status: IDL2.Nat,
    body: IDL2.Vec(IDL2.Nat8),
    headers: IDL2.Vec(http_header)
  });
  const http_request_args = IDL2.Record({
    url: IDL2.Text,
    method: IDL2.Variant({
      get: IDL2.Null,
      head: IDL2.Null,
      post: IDL2.Null
    }),
    max_response_bytes: IDL2.Opt(IDL2.Nat64),
    body: IDL2.Opt(IDL2.Vec(IDL2.Nat8)),
    transform: IDL2.Opt(IDL2.Record({
      function: IDL2.Func([
        IDL2.Record({
          context: IDL2.Vec(IDL2.Nat8),
          response: http_request_result
        })
      ], [http_request_result], ["query"]),
      context: IDL2.Vec(IDL2.Nat8)
    })),
    headers: IDL2.Vec(http_header)
  });
  const canister_install_mode = IDL2.Variant({
    reinstall: IDL2.Null,
    upgrade: IDL2.Opt(IDL2.Record({
      wasm_memory_persistence: IDL2.Opt(IDL2.Variant({ keep: IDL2.Null, replace: IDL2.Null })),
      skip_pre_upgrade: IDL2.Opt(IDL2.Bool)
    })),
    install: IDL2.Null
  });
  const chunk_hash = IDL2.Record({ hash: IDL2.Vec(IDL2.Nat8) });
  const install_chunked_code_args = IDL2.Record({
    arg: IDL2.Vec(IDL2.Nat8),
    wasm_module_hash: IDL2.Vec(IDL2.Nat8),
    mode: canister_install_mode,
    chunk_hashes_list: IDL2.Vec(chunk_hash),
    target_canister: canister_id,
    store_canister: IDL2.Opt(canister_id),
    sender_canister_version: IDL2.Opt(IDL2.Nat64)
  });
  const wasm_module = IDL2.Vec(IDL2.Nat8);
  const install_code_args = IDL2.Record({
    arg: IDL2.Vec(IDL2.Nat8),
    wasm_module,
    mode: canister_install_mode,
    canister_id,
    sender_canister_version: IDL2.Opt(IDL2.Nat64)
  });
  const list_canister_snapshots_args = IDL2.Record({
    canister_id
  });
  const snapshot = IDL2.Record({
    id: snapshot_id,
    total_size: IDL2.Nat64,
    taken_at_timestamp: IDL2.Nat64
  });
  const list_canister_snapshots_result = IDL2.Vec(snapshot);
  const load_canister_snapshot_args = IDL2.Record({
    canister_id,
    sender_canister_version: IDL2.Opt(IDL2.Nat64),
    snapshot_id
  });
  const node_metrics_history_args = IDL2.Record({
    start_at_timestamp_nanos: IDL2.Nat64,
    subnet_id: IDL2.Principal
  });
  const node_metrics = IDL2.Record({
    num_block_failures_total: IDL2.Nat64,
    node_id: IDL2.Principal,
    num_blocks_proposed_total: IDL2.Nat64
  });
  const node_metrics_history_result = IDL2.Vec(IDL2.Record({
    timestamp_nanos: IDL2.Nat64,
    node_metrics: IDL2.Vec(node_metrics)
  }));
  const provisional_create_canister_with_cycles_args = IDL2.Record({
    settings: IDL2.Opt(canister_settings),
    specified_id: IDL2.Opt(canister_id),
    amount: IDL2.Opt(IDL2.Nat),
    sender_canister_version: IDL2.Opt(IDL2.Nat64)
  });
  const provisional_create_canister_with_cycles_result = IDL2.Record({
    canister_id
  });
  const provisional_top_up_canister_args = IDL2.Record({
    canister_id,
    amount: IDL2.Nat
  });
  const raw_rand_result = IDL2.Vec(IDL2.Nat8);
  const schnorr_algorithm = IDL2.Variant({
    ed25519: IDL2.Null,
    bip340secp256k1: IDL2.Null
  });
  const schnorr_public_key_args = IDL2.Record({
    key_id: IDL2.Record({
      algorithm: schnorr_algorithm,
      name: IDL2.Text
    }),
    canister_id: IDL2.Opt(canister_id),
    derivation_path: IDL2.Vec(IDL2.Vec(IDL2.Nat8))
  });
  const schnorr_public_key_result = IDL2.Record({
    public_key: IDL2.Vec(IDL2.Nat8),
    chain_code: IDL2.Vec(IDL2.Nat8)
  });
  const sign_with_ecdsa_args = IDL2.Record({
    key_id: IDL2.Record({ name: IDL2.Text, curve: ecdsa_curve }),
    derivation_path: IDL2.Vec(IDL2.Vec(IDL2.Nat8)),
    message_hash: IDL2.Vec(IDL2.Nat8)
  });
  const sign_with_ecdsa_result = IDL2.Record({
    signature: IDL2.Vec(IDL2.Nat8)
  });
  const schnorr_aux = IDL2.Variant({
    bip341: IDL2.Record({ merkle_root_hash: IDL2.Vec(IDL2.Nat8) })
  });
  const sign_with_schnorr_args = IDL2.Record({
    aux: IDL2.Opt(schnorr_aux),
    key_id: IDL2.Record({
      algorithm: schnorr_algorithm,
      name: IDL2.Text
    }),
    derivation_path: IDL2.Vec(IDL2.Vec(IDL2.Nat8)),
    message: IDL2.Vec(IDL2.Nat8)
  });
  const sign_with_schnorr_result = IDL2.Record({
    signature: IDL2.Vec(IDL2.Nat8)
  });
  const start_canister_args = IDL2.Record({ canister_id });
  const stop_canister_args = IDL2.Record({ canister_id });
  const stored_chunks_args = IDL2.Record({ canister_id });
  const stored_chunks_result = IDL2.Vec(chunk_hash);
  const subnet_info_args = IDL2.Record({ subnet_id: IDL2.Principal });
  const subnet_info_result = IDL2.Record({ replica_version: IDL2.Text });
  const take_canister_snapshot_args = IDL2.Record({
    replace_snapshot: IDL2.Opt(snapshot_id),
    canister_id
  });
  const take_canister_snapshot_result = snapshot;
  const uninstall_code_args = IDL2.Record({
    canister_id,
    sender_canister_version: IDL2.Opt(IDL2.Nat64)
  });
  const update_settings_args = IDL2.Record({
    canister_id: IDL2.Principal,
    settings: canister_settings,
    sender_canister_version: IDL2.Opt(IDL2.Nat64)
  });
  const upload_chunk_args = IDL2.Record({
    chunk: IDL2.Vec(IDL2.Nat8),
    canister_id: IDL2.Principal
  });
  const upload_chunk_result = chunk_hash;
  return IDL2.Service({
    bitcoin_get_balance: IDL2.Func([bitcoin_get_balance_args], [bitcoin_get_balance_result], []),
    bitcoin_get_block_headers: IDL2.Func([bitcoin_get_block_headers_args], [bitcoin_get_block_headers_result], []),
    bitcoin_get_current_fee_percentiles: IDL2.Func([bitcoin_get_current_fee_percentiles_args], [bitcoin_get_current_fee_percentiles_result], []),
    bitcoin_get_utxos: IDL2.Func([bitcoin_get_utxos_args], [bitcoin_get_utxos_result], []),
    bitcoin_send_transaction: IDL2.Func([bitcoin_send_transaction_args], [], []),
    canister_info: IDL2.Func([canister_info_args], [canister_info_result], []),
    canister_status: IDL2.Func([canister_status_args], [canister_status_result], []),
    clear_chunk_store: IDL2.Func([clear_chunk_store_args], [], []),
    create_canister: IDL2.Func([create_canister_args], [create_canister_result], []),
    delete_canister: IDL2.Func([delete_canister_args], [], []),
    delete_canister_snapshot: IDL2.Func([delete_canister_snapshot_args], [], []),
    deposit_cycles: IDL2.Func([deposit_cycles_args], [], []),
    ecdsa_public_key: IDL2.Func([ecdsa_public_key_args], [ecdsa_public_key_result], []),
    fetch_canister_logs: IDL2.Func([fetch_canister_logs_args], [fetch_canister_logs_result], ["query"]),
    http_request: IDL2.Func([http_request_args], [http_request_result], []),
    install_chunked_code: IDL2.Func([install_chunked_code_args], [], []),
    install_code: IDL2.Func([install_code_args], [], []),
    list_canister_snapshots: IDL2.Func([list_canister_snapshots_args], [list_canister_snapshots_result], []),
    load_canister_snapshot: IDL2.Func([load_canister_snapshot_args], [], []),
    node_metrics_history: IDL2.Func([node_metrics_history_args], [node_metrics_history_result], []),
    provisional_create_canister_with_cycles: IDL2.Func([provisional_create_canister_with_cycles_args], [provisional_create_canister_with_cycles_result], []),
    provisional_top_up_canister: IDL2.Func([provisional_top_up_canister_args], [], []),
    raw_rand: IDL2.Func([], [raw_rand_result], []),
    schnorr_public_key: IDL2.Func([schnorr_public_key_args], [schnorr_public_key_result], []),
    sign_with_ecdsa: IDL2.Func([sign_with_ecdsa_args], [sign_with_ecdsa_result], []),
    sign_with_schnorr: IDL2.Func([sign_with_schnorr_args], [sign_with_schnorr_result], []),
    start_canister: IDL2.Func([start_canister_args], [], []),
    stop_canister: IDL2.Func([stop_canister_args], [], []),
    stored_chunks: IDL2.Func([stored_chunks_args], [stored_chunks_result], []),
    subnet_info: IDL2.Func([subnet_info_args], [subnet_info_result], []),
    take_canister_snapshot: IDL2.Func([take_canister_snapshot_args], [take_canister_snapshot_result], []),
    uninstall_code: IDL2.Func([uninstall_code_args], [], []),
    update_settings: IDL2.Func([update_settings_args], [], []),
    upload_chunk: IDL2.Func([upload_chunk_args], [upload_chunk_result], [])
  });
};
class ActorCallError extends AgentError {
  constructor(canisterId2, methodName, type, props) {
    super([
      `Call failed:`,
      `  Canister: ${canisterId2.toText()}`,
      `  Method: ${methodName} (${type})`,
      ...Object.getOwnPropertyNames(props).map((n2) => `  "${n2}": ${JSON.stringify(props[n2])}`)
    ].join("\n"));
    this.canisterId = canisterId2;
    this.methodName = methodName;
    this.type = type;
    this.props = props;
  }
}
class QueryCallRejectedError extends ActorCallError {
  constructor(canisterId2, methodName, result) {
    var _a2;
    super(canisterId2, methodName, "query", {
      Status: result.status,
      Code: (_a2 = ReplicaRejectCode[result.reject_code]) !== null && _a2 !== void 0 ? _a2 : `Unknown Code "${result.reject_code}"`,
      Message: result.reject_message
    });
    this.result = result;
  }
}
class UpdateCallRejectedError extends ActorCallError {
  constructor(canisterId2, methodName, requestId, response, reject_code, reject_message, error_code) {
    super(canisterId2, methodName, "update", Object.assign({ "Request ID": toHex(requestId) }, response.body ? Object.assign(Object.assign({}, error_code ? {
      "Error code": error_code
    } : {}), { "Reject code": String(reject_code), "Reject message": reject_message }) : {
      "HTTP status code": response.status.toString(),
      "HTTP status text": response.statusText
    }));
    this.requestId = requestId;
    this.response = response;
    this.reject_code = reject_code;
    this.reject_message = reject_message;
    this.error_code = error_code;
  }
}
const metadataSymbol = Symbol.for("ic-agent-metadata");
class Actor {
  constructor(metadata) {
    this[metadataSymbol] = Object.freeze(metadata);
  }
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
  static async install(fields, config) {
    const mode = fields.mode === void 0 ? { install: null } : fields.mode;
    const arg = fields.arg ? [...new Uint8Array(fields.arg)] : [];
    const wasmModule = [...new Uint8Array(fields.module)];
    const canisterId2 = typeof config.canisterId === "string" ? Principal$1.fromText(config.canisterId) : config.canisterId;
    await getManagementCanister(config).install_code({
      mode,
      arg,
      wasm_module: wasmModule,
      canister_id: canisterId2,
      sender_canister_version: []
    });
  }
  static async createCanister(config, settings) {
    function settingsToCanisterSettings(settings2) {
      return [
        {
          controllers: settings2.controllers ? [settings2.controllers] : [],
          compute_allocation: settings2.compute_allocation ? [settings2.compute_allocation] : [],
          freezing_threshold: settings2.freezing_threshold ? [settings2.freezing_threshold] : [],
          memory_allocation: settings2.memory_allocation ? [settings2.memory_allocation] : [],
          reserved_cycles_limit: [],
          log_visibility: [],
          wasm_memory_limit: []
        }
      ];
    }
    const { canister_id: canisterId2 } = await getManagementCanister(config || {}).provisional_create_canister_with_cycles({
      amount: [],
      settings: settingsToCanisterSettings(settings || {}),
      specified_id: [],
      sender_canister_version: []
    });
    return canisterId2;
  }
  static async createAndInstallCanister(interfaceFactory, fields, config) {
    const canisterId2 = await this.createCanister(config);
    await this.install(Object.assign({}, fields), Object.assign(Object.assign({}, config), { canisterId: canisterId2 }));
    return this.createActor(interfaceFactory, Object.assign(Object.assign({}, config), { canisterId: canisterId2 }));
  }
  static createActorClass(interfaceFactory, options) {
    const service = interfaceFactory({ IDL });
    class CanisterActor extends Actor {
      constructor(config) {
        if (!config.canisterId)
          throw new AgentError(`Canister ID is required, but received ${typeof config.canisterId} instead. If you are using automatically generated declarations, this may be because your application is not setting the canister ID in process.env correctly.`);
        const canisterId2 = typeof config.canisterId === "string" ? Principal$1.fromText(config.canisterId) : config.canisterId;
        super({
          config: Object.assign(Object.assign(Object.assign({}, DEFAULT_ACTOR_CONFIG), config), { canisterId: canisterId2 }),
          service
        });
        for (const [methodName, func] of service._fields) {
          if (options === null || options === void 0 ? void 0 : options.httpDetails) {
            func.annotations.push(ACTOR_METHOD_WITH_HTTP_DETAILS);
          }
          if (options === null || options === void 0 ? void 0 : options.certificate) {
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
      throw new AgentError(`Canister ID is required, but received ${typeof configuration.canisterId} instead. If you are using automatically generated declarations, this may be because your application is not setting the canister ID in process.env correctly.`);
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
}
function decodeReturnValue(types, msg) {
  const returnValues = decode$1(types, bufferExports.Buffer.from(msg));
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
  pollingStrategyFactory: defaultStrategy
};
const ACTOR_METHOD_WITH_HTTP_DETAILS = "http-details";
const ACTOR_METHOD_WITH_CERTIFICATE = "certificate";
function _createActorMethod(actor, methodName, func, blsVerify2) {
  let caller;
  if (func.annotations.includes("query") || func.annotations.includes("composite_query")) {
    caller = async (options, ...args) => {
      var _a2, _b2;
      options = Object.assign(Object.assign({}, options), (_b2 = (_a2 = actor[metadataSymbol].config).queryTransform) === null || _b2 === void 0 ? void 0 : _b2.call(_a2, methodName, args, Object.assign(Object.assign({}, actor[metadataSymbol].config), options)));
      const agent = options.agent || actor[metadataSymbol].config.agent || getDefaultAgent();
      const cid = Principal$1.from(options.canisterId || actor[metadataSymbol].config.canisterId);
      const arg = encode$1(func.argTypes, args);
      const result = await agent.query(cid, {
        methodName,
        arg,
        effectiveCanisterId: options.effectiveCanisterId
      });
      const httpDetails = Object.assign(Object.assign({}, result.httpDetails), { requestDetails: result.requestDetails });
      switch (result.status) {
        case "rejected":
          throw new QueryCallRejectedError(cid, methodName, result);
        case "replied":
          return func.annotations.includes(ACTOR_METHOD_WITH_HTTP_DETAILS) ? {
            httpDetails,
            result: decodeReturnValue(func.retTypes, result.reply.arg)
          } : decodeReturnValue(func.retTypes, result.reply.arg);
      }
    };
  } else {
    caller = async (options, ...args) => {
      var _a2, _b2;
      options = Object.assign(Object.assign({}, options), (_b2 = (_a2 = actor[metadataSymbol].config).callTransform) === null || _b2 === void 0 ? void 0 : _b2.call(_a2, methodName, args, Object.assign(Object.assign({}, actor[metadataSymbol].config), options)));
      const agent = options.agent || actor[metadataSymbol].config.agent || getDefaultAgent();
      const { canisterId: canisterId2, effectiveCanisterId, pollingStrategyFactory } = Object.assign(Object.assign(Object.assign({}, DEFAULT_ACTOR_CONFIG), actor[metadataSymbol].config), options);
      const cid = Principal$1.from(canisterId2);
      const ecid = effectiveCanisterId !== void 0 ? Principal$1.from(effectiveCanisterId) : cid;
      const arg = encode$1(func.argTypes, args);
      const { requestId, response, requestDetails } = await agent.call(cid, {
        methodName,
        arg,
        effectiveCanisterId: ecid
      });
      let reply;
      let certificate;
      if (response.body && response.body.certificate) {
        if (agent.rootKey == null) {
          throw new Error("Agent is missing root key");
        }
        const cert = response.body.certificate;
        certificate = await Certificate.create({
          certificate: bufFromBufLike(cert),
          rootKey: agent.rootKey,
          canisterId: Principal$1.from(canisterId2),
          blsVerify: blsVerify2
        });
        const path = [new TextEncoder().encode("request_status"), requestId];
        const status = new TextDecoder().decode(lookupResultToBuffer(certificate.lookup([...path, "status"])));
        switch (status) {
          case "replied":
            reply = lookupResultToBuffer(certificate.lookup([...path, "reply"]));
            break;
          case "rejected": {
            const rejectCode = new Uint8Array(lookupResultToBuffer(certificate.lookup([...path, "reject_code"])))[0];
            const rejectMessage = new TextDecoder().decode(lookupResultToBuffer(certificate.lookup([...path, "reject_message"])));
            const error_code_buf = lookupResultToBuffer(certificate.lookup([...path, "error_code"]));
            const error_code = error_code_buf ? new TextDecoder().decode(error_code_buf) : void 0;
            throw new UpdateCallRejectedError(cid, methodName, requestId, response, rejectCode, rejectMessage, error_code);
          }
        }
      } else if (response.body && "reject_message" in response.body) {
        const { reject_code, reject_message, error_code } = response.body;
        throw new UpdateCallRejectedError(cid, methodName, requestId, response, reject_code, reject_message, error_code);
      }
      if (response.status === 202) {
        const pollStrategy = pollingStrategyFactory();
        const response2 = await pollForResponse(agent, ecid, requestId, pollStrategy, blsVerify2);
        certificate = response2.certificate;
        reply = response2.reply;
      }
      const shouldIncludeHttpDetails = func.annotations.includes(ACTOR_METHOD_WITH_HTTP_DETAILS);
      const shouldIncludeCertificate = func.annotations.includes(ACTOR_METHOD_WITH_CERTIFICATE);
      const httpDetails = Object.assign(Object.assign({}, response), { requestDetails });
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
      } else if (func.retTypes.length === 0) {
        return shouldIncludeHttpDetails ? {
          httpDetails: response,
          result: void 0
        } : void 0;
      } else {
        throw new Error(`Call was returned undefined, but type [${func.retTypes.join(",")}].`);
      }
    };
  }
  const handler = (...args) => caller({}, ...args);
  handler.withOptions = (options) => (...args) => caller(options, ...args);
  return handler;
}
function getManagementCanister(config) {
  function transform(methodName, args) {
    if (config.effectiveCanisterId) {
      return { effectiveCanisterId: Principal$1.from(config.effectiveCanisterId) };
    }
    const first = args[0];
    let effectiveCanisterId = Principal$1.fromHex("");
    if (first && typeof first === "object" && first.target_canister && methodName === "install_chunked_code") {
      effectiveCanisterId = Principal$1.from(first.target_canister);
    }
    if (first && typeof first === "object" && first.canister_id) {
      effectiveCanisterId = Principal$1.from(first.canister_id);
    }
    return { effectiveCanisterId };
  }
  return Actor.createActor(managementCanisterIdl, Object.assign(Object.assign(Object.assign({}, config), { canisterId: Principal$1.fromHex("") }), {
    callTransform: transform,
    queryTransform: transform
  }));
}
var __classPrivateFieldSet$3 = function(receiver, state, value2, kind, f2) {
  if (kind === "m") throw new TypeError("Private method is not writable");
  if (kind === "a" && !f2) throw new TypeError("Private accessor was defined without a setter");
  if (typeof state === "function" ? receiver !== state || !f2 : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
  return kind === "a" ? f2.call(receiver, value2) : f2 ? f2.value = value2 : state.set(receiver, value2), value2;
};
var __classPrivateFieldGet$3 = function(receiver, state, kind, f2) {
  if (kind === "a" && !f2) throw new TypeError("Private accessor was defined without a getter");
  if (typeof state === "function" ? receiver !== state || !f2 : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
  return kind === "m" ? f2 : kind === "a" ? f2.call(receiver) : f2 ? f2.value : state.get(receiver);
};
var _Ed25519PublicKey_rawKey, _Ed25519PublicKey_derKey, _Ed25519KeyIdentity_publicKey, _Ed25519KeyIdentity_privateKey;
function isObject(value2) {
  return value2 !== null && typeof value2 === "object";
}
class Ed25519PublicKey2 {
  // `fromRaw` and `fromDer` should be used for instantiation, not this constructor.
  constructor(key) {
    _Ed25519PublicKey_rawKey.set(this, void 0);
    _Ed25519PublicKey_derKey.set(this, void 0);
    if (key.byteLength !== Ed25519PublicKey2.RAW_KEY_LENGTH) {
      throw new Error("An Ed25519 public key must be exactly 32bytes long");
    }
    __classPrivateFieldSet$3(this, _Ed25519PublicKey_rawKey, bufFromBufLike$1(key), "f");
    __classPrivateFieldSet$3(this, _Ed25519PublicKey_derKey, Ed25519PublicKey2.derEncode(key), "f");
  }
  /**
   * Construct Ed25519PublicKey from an existing PublicKey
   * @param {unknown} maybeKey - existing PublicKey, ArrayBuffer, DerEncodedPublicKey, or hex string
   * @returns {Ed25519PublicKey} Instance of Ed25519PublicKey
   */
  static from(maybeKey) {
    if (typeof maybeKey === "string") {
      const key = fromHex(maybeKey);
      return this.fromRaw(key);
    } else if (isObject(maybeKey)) {
      const key = maybeKey;
      if (isObject(key) && Object.hasOwnProperty.call(key, "__derEncodedPublicKey__")) {
        return this.fromDer(key);
      } else if (ArrayBuffer.isView(key)) {
        const view = key;
        return this.fromRaw(bufFromBufLike$1(view.buffer));
      } else if (key instanceof ArrayBuffer) {
        return this.fromRaw(key);
      } else if ("rawKey" in key) {
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
    return new Ed25519PublicKey2(rawKey);
  }
  static fromDer(derKey) {
    return new Ed25519PublicKey2(this.derDecode(derKey));
  }
  static derEncode(publicKey) {
    const key = wrapDER(publicKey, ED25519_OID).buffer;
    key.__derEncodedPublicKey__ = void 0;
    return key;
  }
  static derDecode(key) {
    const unwrapped = unwrapDER(key, ED25519_OID);
    if (unwrapped.length !== this.RAW_KEY_LENGTH) {
      throw new Error("An Ed25519 public key must be exactly 32bytes long");
    }
    return bufFromBufLike$1(unwrapped);
  }
  get rawKey() {
    return __classPrivateFieldGet$3(this, _Ed25519PublicKey_rawKey, "f");
  }
  get derKey() {
    return __classPrivateFieldGet$3(this, _Ed25519PublicKey_derKey, "f");
  }
  toDer() {
    return this.derKey;
  }
  toRaw() {
    return this.rawKey;
  }
}
_Ed25519PublicKey_rawKey = /* @__PURE__ */ new WeakMap(), _Ed25519PublicKey_derKey = /* @__PURE__ */ new WeakMap();
Ed25519PublicKey2.RAW_KEY_LENGTH = 32;
class Ed25519KeyIdentity extends SignIdentity {
  // `fromRaw` and `fromDer` should be used for instantiation, not this constructor.
  constructor(publicKey, privateKey) {
    super();
    _Ed25519KeyIdentity_publicKey.set(this, void 0);
    _Ed25519KeyIdentity_privateKey.set(this, void 0);
    __classPrivateFieldSet$3(this, _Ed25519KeyIdentity_publicKey, Ed25519PublicKey2.from(publicKey), "f");
    __classPrivateFieldSet$3(this, _Ed25519KeyIdentity_privateKey, new Uint8Array(privateKey), "f");
  }
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
    if (bufEquals(seed, new Uint8Array(new Array(32).fill(0)))) {
      console.warn("Seed is all zeros. This is not a secure seed. Please provide a seed with sufficient entropy if this is a production environment.");
    }
    const sk = new Uint8Array(32);
    for (let i3 = 0; i3 < 32; i3++)
      sk[i3] = new Uint8Array(seed)[i3];
    const pk = ed25519.getPublicKey(sk);
    return Ed25519KeyIdentity.fromKeyPair(pk, sk);
  }
  static fromParsedJson(obj) {
    const [publicKeyDer, privateKeyRaw] = obj;
    return new Ed25519KeyIdentity(Ed25519PublicKey2.fromDer(fromHex(publicKeyDer)), fromHex(privateKeyRaw));
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
    return new Ed25519KeyIdentity(Ed25519PublicKey2.fromRaw(publicKey), privateKey);
  }
  static fromSecretKey(secretKey) {
    const publicKey = ed25519.getPublicKey(new Uint8Array(secretKey));
    return Ed25519KeyIdentity.fromKeyPair(publicKey, secretKey);
  }
  /**
   * Serialize this key to JSON.
   */
  toJSON() {
    return [toHex(__classPrivateFieldGet$3(this, _Ed25519KeyIdentity_publicKey, "f").toDer()), toHex(__classPrivateFieldGet$3(this, _Ed25519KeyIdentity_privateKey, "f"))];
  }
  /**
   * Return a copy of the key pair.
   */
  getKeyPair() {
    return {
      secretKey: __classPrivateFieldGet$3(this, _Ed25519KeyIdentity_privateKey, "f"),
      publicKey: __classPrivateFieldGet$3(this, _Ed25519KeyIdentity_publicKey, "f")
    };
  }
  /**
   * Return the public key.
   */
  getPublicKey() {
    return __classPrivateFieldGet$3(this, _Ed25519KeyIdentity_publicKey, "f");
  }
  /**
   * Signs a blob of data, with this identity's private key.
   * @param challenge - challenge to sign with this identity's secretKey, producing a signature
   */
  async sign(challenge) {
    const blob = new Uint8Array(challenge);
    const signature = uint8ToBuf$1(ed25519.sign(blob, __classPrivateFieldGet$3(this, _Ed25519KeyIdentity_privateKey, "f").slice(0, 32)));
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
    const [signature, message, publicKey] = [sig, msg, pk].map((x2) => {
      if (typeof x2 === "string") {
        x2 = fromHex(x2);
      }
      if (x2 instanceof Uint8Array) {
        x2 = bufFromBufLike$1(x2.buffer);
      }
      return new Uint8Array(x2);
    });
    return ed25519.verify(signature, message, publicKey);
  }
}
_Ed25519KeyIdentity_publicKey = /* @__PURE__ */ new WeakMap(), _Ed25519KeyIdentity_privateKey = /* @__PURE__ */ new WeakMap();
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
  // `fromKeyPair` and `generate` should be used for instantiation, not this constructor.
  constructor(keyPair, derKey, subtleCrypto) {
    super();
    this._keyPair = keyPair;
    this._derKey = derKey;
    this._subtleCrypto = subtleCrypto;
  }
  /**
   * Generates a randomly generated identity for use in calls to the Internet Computer.
   * @param {CryptoKeyOptions} options optional settings
   * @param {CryptoKeyOptions['extractable']} options.extractable - whether the key should allow itself to be used. Set to false for maximum security.
   * @param {CryptoKeyOptions['keyUsages']} options.keyUsages - a list of key usages that the key can be used for
   * @param {CryptoKeyOptions['subtleCrypto']} options.subtleCrypto interface
   * @constructs ECDSAKeyIdentity
   * @returns a {@link ECDSAKeyIdentity}
   */
  static async generate(options) {
    const { extractable = false, keyUsages = ["sign", "verify"], subtleCrypto } = options !== null && options !== void 0 ? options : {};
    const effectiveCrypto = _getEffectiveCrypto(subtleCrypto);
    const keyPair = await effectiveCrypto.generateKey({
      name: "ECDSA",
      namedCurve: "P-256"
    }, extractable, keyUsages);
    const derKey = await effectiveCrypto.exportKey("spki", keyPair.publicKey);
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
    const derKey = await effectiveCrypto.exportKey("spki", keyPair.publicKey);
    return new ECDSAKeyIdentity(keyPair, derKey, effectiveCrypto);
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
   * @param {ArrayBuffer} challenge - challenge to sign with this identity's secretKey, producing a signature
   * @returns {Promise<Signature>} signature
   */
  async sign(challenge) {
    const params = {
      name: "ECDSA",
      hash: { name: "SHA-256" }
    };
    const signature = await this._subtleCrypto.sign(params, this._keyPair.privateKey, challenge);
    return signature;
  }
}
var __classPrivateFieldSet$2 = function(receiver, state, value2, kind, f2) {
  if (kind === "m") throw new TypeError("Private method is not writable");
  if (kind === "a" && !f2) throw new TypeError("Private accessor was defined without a setter");
  if (typeof state === "function" ? receiver !== state || !f2 : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
  return kind === "a" ? f2.call(receiver, value2) : f2 ? f2.value = value2 : state.set(receiver, value2), value2;
};
var __classPrivateFieldGet$2 = function(receiver, state, kind, f2) {
  if (kind === "a" && !f2) throw new TypeError("Private accessor was defined without a getter");
  if (typeof state === "function" ? receiver !== state || !f2 : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
  return kind === "m" ? f2 : kind === "a" ? f2.call(receiver) : f2 ? f2.value : state.get(receiver);
};
var _PartialIdentity_inner;
class PartialIdentity {
  constructor(inner) {
    _PartialIdentity_inner.set(this, void 0);
    __classPrivateFieldSet$2(this, _PartialIdentity_inner, inner, "f");
  }
  /**
   * The raw public key of this identity.
   */
  get rawKey() {
    return __classPrivateFieldGet$2(this, _PartialIdentity_inner, "f").rawKey;
  }
  /**
   * The DER-encoded public key of this identity.
   */
  get derKey() {
    return __classPrivateFieldGet$2(this, _PartialIdentity_inner, "f").derKey;
  }
  /**
   * The DER-encoded public key of this identity.
   */
  toDer() {
    return __classPrivateFieldGet$2(this, _PartialIdentity_inner, "f").toDer();
  }
  /**
   * The inner {@link PublicKey} used by this identity.
   */
  getPublicKey() {
    return __classPrivateFieldGet$2(this, _PartialIdentity_inner, "f");
  }
  /**
   * The {@link Principal} of this identity.
   */
  getPrincipal() {
    if (!__classPrivateFieldGet$2(this, _PartialIdentity_inner, "f").rawKey) {
      throw new Error("Cannot get principal from a public key without a raw key.");
    }
    return Principal$1.fromUint8Array(new Uint8Array(__classPrivateFieldGet$2(this, _PartialIdentity_inner, "f").rawKey));
  }
  /**
   * Required for the Identity interface, but cannot implemented for just a public key.
   */
  transformRequest() {
    return Promise.reject("Not implemented. You are attempting to use a partial identity to sign calls, but this identity only has access to the public key.To sign calls, use a DelegationIdentity instead.");
  }
}
_PartialIdentity_inner = /* @__PURE__ */ new WeakMap();
var __classPrivateFieldSet$1 = function(receiver, state, value2, kind, f2) {
  if (kind === "m") throw new TypeError("Private method is not writable");
  if (kind === "a" && !f2) throw new TypeError("Private accessor was defined without a setter");
  if (typeof state === "function" ? receiver !== state || !f2 : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
  return kind === "a" ? f2.call(receiver, value2) : f2 ? f2.value = value2 : state.set(receiver, value2), value2;
};
var __classPrivateFieldGet$1 = function(receiver, state, kind, f2) {
  if (kind === "a" && !f2) throw new TypeError("Private accessor was defined without a getter");
  if (typeof state === "function" ? receiver !== state || !f2 : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
  return kind === "m" ? f2 : kind === "a" ? f2.call(receiver) : f2 ? f2.value : state.get(receiver);
};
var __rest = function(s2, e5) {
  var t3 = {};
  for (var p in s2) if (Object.prototype.hasOwnProperty.call(s2, p) && e5.indexOf(p) < 0)
    t3[p] = s2[p];
  if (s2 != null && typeof Object.getOwnPropertySymbols === "function")
    for (var i3 = 0, p = Object.getOwnPropertySymbols(s2); i3 < p.length; i3++) {
      if (e5.indexOf(p[i3]) < 0 && Object.prototype.propertyIsEnumerable.call(s2, p[i3]))
        t3[p[i3]] = s2[p[i3]];
    }
  return t3;
};
var _PartialDelegationIdentity_delegation;
const domainSeparator = new TextEncoder().encode("ic-request-auth-delegation");
const requestDomainSeparator = new TextEncoder().encode("\nic-request");
function _parseBlob(value2) {
  if (typeof value2 !== "string" || value2.length < 64) {
    throw new Error("Invalid public key.");
  }
  return fromHex(value2);
}
class Delegation {
  constructor(pubkey, expiration, targets) {
    this.pubkey = pubkey;
    this.expiration = expiration;
    this.targets = targets;
  }
  toCBOR() {
    return srcExports.value.map(Object.assign({ pubkey: srcExports.value.bytes(this.pubkey), expiration: srcExports.value.u64(this.expiration.toString(16), 16) }, this.targets && {
      targets: srcExports.value.array(this.targets.map((t3) => srcExports.value.bytes(bufFromBufLike(t3.toUint8Array()))))
    }));
  }
  toJSON() {
    return Object.assign({ expiration: this.expiration.toString(16), pubkey: toHex(this.pubkey) }, this.targets && { targets: this.targets.map((p) => p.toHex()) });
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
    ...domainSeparator,
    ...new Uint8Array(requestIdOf(Object.assign({}, delegation)))
  ]);
  const signature = await from.sign(bufFromBufLike(challenge));
  return {
    delegation,
    signature
  };
}
class DelegationChain {
  constructor(delegations, publicKey) {
    this.delegations = delegations;
    this.publicKey = publicKey;
  }
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
    var _a2, _b2;
    const delegation = await _createSingleDelegation(from, to, expiration, options.targets);
    return new DelegationChain([...((_a2 = options.previous) === null || _a2 === void 0 ? void 0 : _a2.delegations) || [], delegation], ((_b2 = options.previous) === null || _b2 === void 0 ? void 0 : _b2.publicKey) || from.getPublicKey().toDer());
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
  toJSON() {
    return {
      delegations: this.delegations.map((signedDelegation) => {
        const { delegation, signature } = signedDelegation;
        const { targets } = delegation;
        return {
          delegation: Object.assign({ expiration: delegation.expiration.toString(16), pubkey: toHex(delegation.pubkey) }, targets && {
            targets: targets.map((t3) => t3.toHex())
          }),
          signature: toHex(signature)
        };
      }),
      publicKey: toHex(this.publicKey)
    };
  }
}
class DelegationIdentity extends SignIdentity {
  constructor(_inner, _delegation) {
    super();
    this._inner = _inner;
    this._delegation = _delegation;
  }
  /**
   * Create a delegation without having access to delegateKey.
   * @param key The key used to sign the requests.
   * @param delegation A delegation object created using `createDelegation`.
   */
  static fromDelegation(key, delegation) {
    return new this(key, delegation);
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
    const { body } = request2, fields = __rest(request2, ["body"]);
    const requestId = await requestIdOf(body);
    return Object.assign(Object.assign({}, fields), { body: {
      content: body,
      sender_sig: await this.sign(bufFromBufLike(new Uint8Array([...requestDomainSeparator, ...new Uint8Array(requestId)]))),
      sender_delegation: this._delegation.delegations,
      sender_pubkey: this._delegation.publicKey
    } });
  }
}
class PartialDelegationIdentity extends PartialIdentity {
  constructor(inner, delegation) {
    super(inner);
    _PartialDelegationIdentity_delegation.set(this, void 0);
    __classPrivateFieldSet$1(this, _PartialDelegationIdentity_delegation, delegation, "f");
  }
  /**
   * The Delegation Chain of this identity.
   */
  get delegation() {
    return __classPrivateFieldGet$1(this, _PartialDelegationIdentity_delegation, "f");
  }
  /**
   * Create a {@link PartialDelegationIdentity} from a {@link PublicKey} and a {@link DelegationChain}.
   * @param key The {@link PublicKey} to delegate to.
   * @param delegation a {@link DelegationChain} targeting the inner key.
   * @constructs PartialDelegationIdentity
   */
  static fromDelegation(key, delegation) {
    return new PartialDelegationIdentity(key, delegation);
  }
}
_PartialDelegationIdentity_delegation = /* @__PURE__ */ new WeakMap();
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
var PubKeyCoseAlgo;
(function(PubKeyCoseAlgo2) {
  PubKeyCoseAlgo2[PubKeyCoseAlgo2["ECDSA_WITH_SHA256"] = -7] = "ECDSA_WITH_SHA256";
})(PubKeyCoseAlgo || (PubKeyCoseAlgo = {}));
const events = ["mousedown", "mousemove", "keydown", "touchstart", "wheel"];
class IdleManager {
  /**
   * @protected
   * @param options {@link IdleManagerOptions}
   */
  constructor(options = {}) {
    var _a2;
    this.callbacks = [];
    this.idleTimeout = 10 * 60 * 1e3;
    this.timeoutID = void 0;
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
    if (options === null || options === void 0 ? void 0 : options.captureScroll) {
      const scroll = debounce(_resetTimer, (_a2 = options === null || options === void 0 ? void 0 : options.scrollDebounce) !== null && _a2 !== void 0 ? _a2 : 100);
      window.addEventListener("scroll", scroll, true);
    }
    _resetTimer();
  }
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
  promise.then((value2) => {
    if (value2 instanceof IDBCursor) {
      cursorRequestMap.set(value2, request2);
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
  set(target, prop, value2) {
    target[prop] = value2;
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
function transformCachableValue(value2) {
  if (typeof value2 === "function")
    return wrapFunction(value2);
  if (value2 instanceof IDBTransaction)
    cacheDonePromiseForTransaction(value2);
  if (instanceOfAny(value2, getIdbProxyableTypes()))
    return new Proxy(value2, idbProxyTraps);
  return value2;
}
function wrap(value2) {
  if (value2 instanceof IDBRequest)
    return promisifyRequest(value2);
  if (transformCache.has(value2))
    return transformCache.get(value2);
  const newValue = transformCachableValue(value2);
  if (newValue !== value2) {
    transformCache.set(value2, newValue);
    reverseTransformCache.set(newValue, value2);
  }
  return newValue;
}
const unwrap = (value2) => reverseTransformCache.get(value2);
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
  if (isBrowser && (localStorage === null || localStorage === void 0 ? void 0 : localStorage.getItem(KEY_STORAGE_DELEGATION))) {
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
async function _setValue(db, storeName, key, value2) {
  return await db.put(storeName, value2, key);
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
   * @constructs an {@link IdbKeyVal}
   */
  static async create(options) {
    const { dbName = AUTH_DB_NAME, storeName = OBJECT_STORE_NAME, version = DB_VERSION } = options !== null && options !== void 0 ? options : {};
    const db = await _openDbStore(dbName, storeName, version);
    return new IdbKeyVal(db, storeName);
  }
  /**
   * Basic setter
   * @param {IDBValidKey} key string | number | Date | BufferSource | IDBValidKey[]
   * @param value value to set
   * @returns void
   */
  async set(key, value2) {
    return await _setValue(this._db, this._storeName, key, value2);
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
    var _a2;
    return (_a2 = await _getValue(this._db, this._storeName, key)) !== null && _a2 !== void 0 ? _a2 : null;
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
var __classPrivateFieldSet = function(receiver, state, value2, kind, f2) {
  if (typeof state === "function" ? receiver !== state || true : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
  return state.set(receiver, value2), value2;
};
var __classPrivateFieldGet = function(receiver, state, kind, f2) {
  if (typeof state === "function" ? receiver !== state || !f2 : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
  return kind === "m" ? f2 : state.get(receiver);
};
var _IdbStorage_options;
const KEY_STORAGE_KEY = "identity";
const KEY_STORAGE_DELEGATION = "delegation";
const KEY_VECTOR = "iv";
const DB_VERSION = 1;
const isBrowser = typeof window !== "undefined";
class LocalStorage {
  constructor(prefix = "ic-", _localStorage) {
    this.prefix = prefix;
    this._localStorage = _localStorage;
  }
  get(key) {
    return Promise.resolve(this._getLocalStorage().getItem(this.prefix + key));
  }
  set(key, value2) {
    this._getLocalStorage().setItem(this.prefix + key, value2);
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
  /**
   * @param options - DBCreateOptions
   * @param options.dbName - name for the indexeddb database
   * @param options.storeName - name for the indexeddb Data Store
   * @param options.version - version of the database. Increment to safely upgrade
   * @constructs an {@link IdbStorage}
   * @example
   * ```typescript
   * const storage = new IdbStorage({ dbName: 'my-db', storeName: 'my-store', version: 2 });
   * ```
   */
  constructor(options) {
    _IdbStorage_options.set(this, void 0);
    __classPrivateFieldSet(this, _IdbStorage_options, options !== null && options !== void 0 ? options : {});
  }
  get _db() {
    return new Promise((resolve) => {
      if (this.initializedDb) {
        resolve(this.initializedDb);
        return;
      }
      IdbKeyVal.create(__classPrivateFieldGet(this, _IdbStorage_options, "f")).then((db) => {
        this.initializedDb = db;
        resolve(db);
      });
    });
  }
  async get(key) {
    const db = await this._db;
    return await db.get(key);
  }
  async set(key, value2) {
    const db = await this._db;
    await db.set(key, value2);
  }
  async remove(key) {
    const db = await this._db;
    await db.remove(key);
  }
}
_IdbStorage_options = /* @__PURE__ */ new WeakMap();
const IDENTITY_PROVIDER_DEFAULT = "https://identity.internetcomputer.org";
const IDENTITY_PROVIDER_ENDPOINT = "#authorize";
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
   * @constructs
   * @param {AuthClientCreateOptions} options - Options for creating an {@link AuthClient}
   * @see {@link AuthClientCreateOptions}
   * @param options.identity Optional Identity to use as the base
   * @see {@link SignIdentity}
   * @param options.storage Storage mechanism for delegration credentials
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
    var _a2, _b2, _c;
    const storage = (_a2 = options.storage) !== null && _a2 !== void 0 ? _a2 : new IdbStorage();
    const keyType = (_b2 = options.keyType) !== null && _b2 !== void 0 ? _b2 : ECDSA_KEY_LABEL;
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
              key = await Ed25519KeyIdentity.fromJSON(maybeIdentityStorage);
            } else {
              key = await ECDSAKeyIdentity.fromKeyPair(maybeIdentityStorage);
            }
          } else if (typeof maybeIdentityStorage === "string") {
            key = Ed25519KeyIdentity.fromJSON(maybeIdentityStorage);
          }
        } catch (_d) {
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
    let idleManager = void 0;
    if ((_c = options.idleOptions) === null || _c === void 0 ? void 0 : _c.disableIdle) {
      idleManager = void 0;
    } else if (chain2 || options.identity) {
      idleManager = IdleManager.create(options.idleOptions);
    }
    if (!key) {
      if (keyType === ED25519_KEY_LABEL) {
        key = await Ed25519KeyIdentity.generate();
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
  _registerDefaultIdleCallback() {
    var _a2, _b2;
    const idleOptions = (_a2 = this._createOptions) === null || _a2 === void 0 ? void 0 : _a2.idleOptions;
    if (!(idleOptions === null || idleOptions === void 0 ? void 0 : idleOptions.onIdle) && !(idleOptions === null || idleOptions === void 0 ? void 0 : idleOptions.disableDefaultIdleCallback)) {
      (_b2 = this.idleManager) === null || _b2 === void 0 ? void 0 : _b2.registerCallback(() => {
        this.logout();
        location.reload();
      });
    }
  }
  async _handleSuccess(message, onSuccess) {
    var _a2, _b2;
    const delegations = message.delegations.map((signedDelegation) => {
      return {
        delegation: new Delegation(signedDelegation.delegation.pubkey, signedDelegation.delegation.expiration, signedDelegation.delegation.targets),
        signature: signedDelegation.signature.buffer
      };
    });
    const delegationChain = DelegationChain.fromDelegations(delegations, message.userPublicKey.buffer);
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
    (_a2 = this._idpWindow) === null || _a2 === void 0 ? void 0 : _a2.close();
    const idleOptions = (_b2 = this._createOptions) === null || _b2 === void 0 ? void 0 : _b2.idleOptions;
    if (!this.idleManager && !(idleOptions === null || idleOptions === void 0 ? void 0 : idleOptions.disableIdle)) {
      this.idleManager = IdleManager.create(idleOptions);
      this._registerDefaultIdleCallback();
    }
    this._removeEventListener();
    delete this._idpWindow;
    if (this._chain) {
      await this._storage.set(KEY_STORAGE_DELEGATION, JSON.stringify(this._chain.toJSON()));
    }
    onSuccess === null || onSuccess === void 0 ? void 0 : onSuccess(message);
  }
  getIdentity() {
    return this._identity;
  }
  async isAuthenticated() {
    return !this.getIdentity().getPrincipal().isAnonymous() && this._chain !== null;
  }
  /**
   * AuthClient Login -
   * Opens up a new window to authenticate with Internet Identity
   * @param {AuthClientLoginOptions} options - Options for logging in
   * @param options.identityProvider Identity provider
   * @param options.maxTimeToLive Expiration of the authentication in nanoseconds
   * @param options.allowPinAuthentication If present, indicates whether or not the Identity Provider should allow the user to authenticate and/or register using a temporary key/PIN identity. Authenticating dapps may want to prevent users from using Temporary keys/PIN identities because Temporary keys/PIN identities are less secure than Passkeys (webauthn credentials) and because Temporary keys/PIN identities generally only live in a browser database (which may get cleared by the browser/OS).
   * @param options.derivationOrigin Origin for Identity Provider to use while generating the delegated identity
   * @param options.windowOpenerFeatures Configures the opened authentication window
   * @param options.onSuccess Callback once login has completed
   * @param options.onError Callback in case authentication fails
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
    var _a2, _b2, _c, _d;
    const defaultTimeToLive = (
      /* hours */
      BigInt(8) * /* nanoseconds */
      BigInt(36e11)
    );
    const identityProviderUrl = new URL(((_a2 = options === null || options === void 0 ? void 0 : options.identityProvider) === null || _a2 === void 0 ? void 0 : _a2.toString()) || IDENTITY_PROVIDER_DEFAULT);
    identityProviderUrl.hash = IDENTITY_PROVIDER_ENDPOINT;
    (_b2 = this._idpWindow) === null || _b2 === void 0 ? void 0 : _b2.close();
    this._removeEventListener();
    this._eventHandler = this._getEventHandler(identityProviderUrl, Object.assign({ maxTimeToLive: (_c = options === null || options === void 0 ? void 0 : options.maxTimeToLive) !== null && _c !== void 0 ? _c : defaultTimeToLive }, options));
    window.addEventListener("message", this._eventHandler);
    this._idpWindow = (_d = window.open(identityProviderUrl.toString(), "idpWindow", options === null || options === void 0 ? void 0 : options.windowOpenerFeatures)) !== null && _d !== void 0 ? _d : void 0;
    const checkInterruption = () => {
      if (this._idpWindow) {
        if (this._idpWindow.closed) {
          this._handleFailure(ERROR_USER_INTERRUPT, options === null || options === void 0 ? void 0 : options.onError);
        } else {
          setTimeout(checkInterruption, INTERRUPT_CHECK_INTERVAL);
        }
      }
    };
    checkInterruption();
  }
  _getEventHandler(identityProviderUrl, options) {
    return async (event) => {
      var _a2, _b2, _c;
      if (event.origin !== identityProviderUrl.origin) {
        return;
      }
      const message = event.data;
      switch (message.kind) {
        case "authorize-ready": {
          const request2 = Object.assign({ kind: "authorize-client", sessionPublicKey: new Uint8Array((_a2 = this._key) === null || _a2 === void 0 ? void 0 : _a2.getPublicKey().toDer()), maxTimeToLive: options === null || options === void 0 ? void 0 : options.maxTimeToLive, allowPinAuthentication: options === null || options === void 0 ? void 0 : options.allowPinAuthentication, derivationOrigin: (_b2 = options === null || options === void 0 ? void 0 : options.derivationOrigin) === null || _b2 === void 0 ? void 0 : _b2.toString() }, options === null || options === void 0 ? void 0 : options.customValues);
          (_c = this._idpWindow) === null || _c === void 0 ? void 0 : _c.postMessage(request2, identityProviderUrl.origin);
          break;
        }
        case "authorize-client-success":
          try {
            await this._handleSuccess(message, options === null || options === void 0 ? void 0 : options.onSuccess);
          } catch (err) {
            this._handleFailure(err.message, options === null || options === void 0 ? void 0 : options.onError);
          }
          break;
        case "authorize-client-failure":
          this._handleFailure(message.text, options === null || options === void 0 ? void 0 : options.onError);
          break;
      }
    };
  }
  _handleFailure(errorMessage, onError) {
    var _a2;
    (_a2 = this._idpWindow) === null || _a2 === void 0 ? void 0 : _a2.close();
    onError === null || onError === void 0 ? void 0 : onError(errorMessage);
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
      } catch (_a2) {
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
class AuthManager {
  constructor() {
    __publicField(this, "authClient", null);
  }
  async create() {
    this.authClient = await AuthClient.create();
  }
  async login() {
    if (!this.authClient) {
      throw new Error("Auth client not initialized");
    }
    const isAuthed = await this.authClient.isAuthenticated();
    if (isAuthed) {
      return;
    }
    const config = await getConfig();
    return new Promise((resolve, reject) => {
      this.authClient.login({
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
  }
  async logout() {
    if (!this.authClient) {
      throw new Error("Auth client not initialized");
    }
    await this.authClient.logout();
  }
  async isAuthenticated() {
    if (!this.authClient) {
      throw new Error("Auth client not initialized");
    }
    return this.authClient.isAuthenticated();
  }
  async getPrincipal() {
    if (!this.authClient) {
      throw new Error("Auth client not initialized");
    }
    const isAuthed = await this.authClient.isAuthenticated();
    if (!isAuthed) {
      throw new Error("User is not authenticated");
    }
    return this.authClient.getIdentity().getPrincipal();
  }
}
var I = ((n2) => (n2[n2.FractionalMoreThan8Decimals = 0] = "FractionalMoreThan8Decimals", n2[n2.InvalidFormat = 1] = "InvalidFormat", n2[n2.FractionalTooManyDecimals = 2] = "FractionalTooManyDecimals", n2))(I || {});
BigInt(1e8);
var w$2 = class w {
  constructor(t3, r2, n2) {
    this.id = t3;
    this.service = r2;
    this.certifiedService = n2;
    this.caller = ({ certified: t4 = true }) => t4 ? this.certifiedService : this.service;
  }
  get canisterId() {
    return this.id;
  }
};
var b$2 = (e5) => e5 == null, s$1 = (e5) => !b$2(e5);
var O$2 = () => HttpAgent.createSync({ host: "https://icp-api.io", identity: new AnonymousIdentity() });
var lt = ({ options: { canisterId: e5, serviceOverride: t3, certifiedServiceOverride: r2, agent: n2, callTransform: o2, queryTransform: i3 }, idlFactory: c, certifiedIdlFactory: a }) => {
  let d2 = n2 ?? O$2(), m2 = t3 ?? Actor.createActor(c, { agent: d2, canisterId: e5, callTransform: o2, queryTransform: i3 }), x2 = r2 ?? Actor.createActor(a, { agent: d2, canisterId: e5, callTransform: o2, queryTransform: i3 });
  return { service: m2, certifiedService: x2, agent: d2, canisterId: e5 };
};
var A$2 = class A extends Error {
}, f$1 = (e5, t3) => {
  if (e5 == null) throw new A$2(t3);
};
var _t = (e5) => new Uint8Array(e5), St = (e5) => Array.from(e5).map((t3) => t3.charCodeAt(0)), wt = (e5) => {
  let t3 = e5.match(/.{1,2}/g);
  return f$1(t3, "Invalid hex string."), Uint8Array.from(t3.map((r2) => parseInt(r2, 16)));
}, k$2 = (e5) => (e5 instanceof Uint8Array || (e5 = Uint8Array.from(e5)), e5.reduce((t3, r2) => t3 + r2.toString(16).padStart(2, "0"), ""));
var g$1 = "abcdefghijklmnopqrstuvwxyz234567", u$1 = /* @__PURE__ */ Object.create(null);
for (let e5 = 0; e5 < g$1.length; e5++) u$1[g$1[e5]] = e5;
u$1[0] = u$1.o;
u$1[1] = u$1.i;
var $$1 = new Uint32Array([0, 1996959894, 3993919788, 2567524794, 124634137, 1886057615, 3915621685, 2657392035, 249268274, 2044508324, 3772115230, 2547177864, 162941995, 2125561021, 3887607047, 2428444049, 498536548, 1789927666, 4089016648, 2227061214, 450548861, 1843258603, 4107580753, 2211677639, 325883990, 1684777152, 4251122042, 2321926636, 335633487, 1661365465, 4195302755, 2366115317, 997073096, 1281953886, 3579855332, 2724688242, 1006888145, 1258607687, 3524101629, 2768942443, 901097722, 1119000684, 3686517206, 2898065728, 853044451, 1172266101, 3705015759, 2882616665, 651767980, 1373503546, 3369554304, 3218104598, 565507253, 1454621731, 3485111705, 3099436303, 671266974, 1594198024, 3322730930, 2970347812, 795835527, 1483230225, 3244367275, 3060149565, 1994146192, 31158534, 2563907772, 4023717930, 1907459465, 112637215, 2680153253, 3904427059, 2013776290, 251722036, 2517215374, 3775830040, 2137656763, 141376813, 2439277719, 3865271297, 1802195444, 476864866, 2238001368, 4066508878, 1812370925, 453092731, 2181625025, 4111451223, 1706088902, 314042704, 2344532202, 4240017532, 1658658271, 366619977, 2362670323, 4224994405, 1303535960, 984961486, 2747007092, 3569037538, 1256170817, 1037604311, 2765210733, 3554079995, 1131014506, 879679996, 2909243462, 3663771856, 1141124467, 855842277, 2852801631, 3708648649, 1342533948, 654459306, 3188396048, 3373015174, 1466479909, 544179635, 3110523913, 3462522015, 1591671054, 702138776, 2966460450, 3352799412, 1504918807, 783551873, 3082640443, 3233442989, 3988292384, 2596254646, 62317068, 1957810842, 3939845945, 2647816111, 81470997, 1943803523, 3814918930, 2489596804, 225274430, 2053790376, 3826175755, 2466906013, 167816743, 2097651377, 4027552580, 2265490386, 503444072, 1762050814, 4150417245, 2154129355, 426522225, 1852507879, 4275313526, 2312317920, 282753626, 1742555852, 4189708143, 2394877945, 397917763, 1622183637, 3604390888, 2714866558, 953729732, 1340076626, 3518719985, 2797360999, 1068828381, 1219638859, 3624741850, 2936675148, 906185462, 1090812512, 3747672003, 2825379669, 829329135, 1181335161, 3412177804, 3160834842, 628085408, 1382605366, 3423369109, 3138078467, 570562233, 1426400815, 3317316542, 2998733608, 733239954, 1555261956, 3268935591, 3050360625, 752459403, 1541320221, 2607071920, 3965973030, 1969922972, 40735498, 2617837225, 3943577151, 1913087877, 83908371, 2512341634, 3803740692, 2075208622, 213261112, 2463272603, 3855990285, 2094854071, 198958881, 2262029012, 4057260610, 1759359992, 534414190, 2176718541, 4139329115, 1873836001, 414664567, 2282248934, 4279200368, 1711684554, 285281116, 2405801727, 4167216745, 1634467795, 376229701, 2685067896, 3608007406, 1308918612, 956543938, 2808555105, 3495958263, 1231636301, 1047427035, 2932959818, 3654703836, 1088359270, 936918e3, 2847714899, 3736837829, 1202900863, 817233897, 3183342108, 3401237130, 1404277552, 615818150, 3134207493, 3453421203, 1423857449, 601450431, 3009837614, 3294710456, 1567103746, 711928724, 3020668471, 3272380065, 1510334235, 755167117]), J$2 = (e5) => {
  let t3 = -1;
  for (let r2 = 0; r2 < e5.length; r2++) {
    let o2 = (e5[r2] ^ t3) & 255;
    t3 = $$1[o2] ^ t3 >>> 8;
  }
  return (t3 ^ -1) >>> 0;
}, Lt = (e5) => {
  let t3 = new ArrayBuffer(4);
  return new DataView(t3).setUint32(0, J$2(e5), false), new Uint8Array(t3);
};
var ee = (e5) => s$1(e5) ? [e5] : [], L$1 = (e5) => e5 == null ? void 0 : e5[0];
var u = ((t3) => (t3[t3.Controllers = 0] = "Controllers", t3[t3.Public = 1] = "Public", t3))(u || {}), i$1 = class i extends Error {
}, P$1 = ({ controllers: r2, freezingThreshold: a, memoryAllocation: t3, computeAllocation: s2, reservedCyclesLimit: o2, logVisibility: n2, wasmMemoryLimit: l, wasmMemoryThreshold: c } = {}) => {
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
  return { controllers: ee(r2 == null ? void 0 : r2.map((d2) => Principal$1.fromText(d2))), freezing_threshold: ee(a), memory_allocation: ee(t3), compute_allocation: ee(s2), reserved_cycles_limit: ee(o2), log_visibility: b$2(n2) ? [] : [m2()], wasm_memory_limit: ee(l), wasm_memory_threshold: ee(c) };
};
var Et = ({ IDL: t22 }) => {
  let e5 = t22.Variant({ mainnet: t22.Null, testnet: t22.Null }), n2 = t22.Text, c = t22.Record({ network: e5, address: n2, min_confirmations: t22.Opt(t22.Nat32) }), r2 = t22.Nat64, i3 = r2, o2 = t22.Nat32, u2 = t22.Record({ start_height: o2, end_height: t22.Opt(o2), network: e5 }), F2 = t22.Vec(t22.Nat8), O2 = t22.Record({ tip_height: o2, block_headers: t22.Vec(F2) }), P2 = t22.Record({ network: e5 }), x2 = t22.Nat64, w4 = t22.Vec(x2), C2 = t22.Record({ network: e5, filter: t22.Opt(t22.Variant({ page: t22.Vec(t22.Nat8), min_confirmations: t22.Nat32 })), address: n2 }), T2 = t22.Vec(t22.Nat8), S2 = t22.Record({ txid: t22.Vec(t22.Nat8), vout: t22.Nat32 }), z2 = t22.Record({ height: t22.Nat32, value: r2, outpoint: S2 }), q = t22.Record({ next_page: t22.Opt(t22.Vec(t22.Nat8)), tip_height: o2, tip_block_hash: T2, utxos: t22.Vec(z2) }), U2 = t22.Record({ transaction: t22.Vec(t22.Nat8), network: e5 }), s2 = t22.Principal, A3 = t22.Record({ canister_id: s2, num_requested_changes: t22.Opt(t22.Nat64) }), W2 = t22.Variant({ from_user: t22.Record({ user_id: t22.Principal }), from_canister: t22.Record({ canister_version: t22.Opt(t22.Nat64), canister_id: t22.Principal }) }), _2 = t22.Vec(t22.Nat8), B2 = t22.Variant({ creation: t22.Record({ controllers: t22.Vec(t22.Principal) }), code_deployment: t22.Record({ mode: t22.Variant({ reinstall: t22.Null, upgrade: t22.Null, install: t22.Null }), module_hash: t22.Vec(t22.Nat8) }), load_snapshot: t22.Record({ canister_version: t22.Nat64, taken_at_timestamp: t22.Nat64, snapshot_id: _2 }), controllers_change: t22.Record({ controllers: t22.Vec(t22.Principal) }), code_uninstall: t22.Null }), E2 = t22.Record({ timestamp_nanos: t22.Nat64, canister_version: t22.Nat64, origin: W2, details: B2 }), M2 = t22.Record({ controllers: t22.Vec(t22.Principal), module_hash: t22.Opt(t22.Vec(t22.Nat8)), recent_changes: t22.Vec(E2), total_num_changes: t22.Nat64 }), Q = t22.Record({ canister_id: s2 }), h3 = t22.Variant({ controllers: t22.Null, public: t22.Null, allowed_viewers: t22.Vec(t22.Principal) }), j2 = t22.Record({ freezing_threshold: t22.Nat, wasm_memory_threshold: t22.Nat, controllers: t22.Vec(t22.Principal), reserved_cycles_limit: t22.Nat, log_visibility: h3, wasm_memory_limit: t22.Nat, memory_allocation: t22.Nat, compute_allocation: t22.Nat }), H2 = t22.Record({ memory_metrics: t22.Record({ wasm_binary_size: t22.Nat, wasm_chunk_store_size: t22.Nat, canister_history_size: t22.Nat, stable_memory_size: t22.Nat, snapshots_size: t22.Nat, wasm_memory_size: t22.Nat, global_memory_size: t22.Nat, custom_sections_size: t22.Nat }), status: t22.Variant({ stopped: t22.Null, stopping: t22.Null, running: t22.Null }), memory_size: t22.Nat, cycles: t22.Nat, settings: j2, query_stats: t22.Record({ response_payload_bytes_total: t22.Nat, num_instructions_total: t22.Nat, num_calls_total: t22.Nat, request_payload_bytes_total: t22.Nat }), idle_cycles_burned_per_day: t22.Nat, module_hash: t22.Opt(t22.Vec(t22.Nat8)), reserved_cycles: t22.Nat }), G2 = t22.Record({ canister_id: s2 }), d2 = t22.Record({ freezing_threshold: t22.Opt(t22.Nat), wasm_memory_threshold: t22.Opt(t22.Nat), controllers: t22.Opt(t22.Vec(t22.Principal)), reserved_cycles_limit: t22.Opt(t22.Nat), log_visibility: t22.Opt(h3), wasm_memory_limit: t22.Opt(t22.Nat), memory_allocation: t22.Opt(t22.Nat), compute_allocation: t22.Opt(t22.Nat) }), J2 = t22.Record({ settings: t22.Opt(d2), sender_canister_version: t22.Opt(t22.Nat64) }), K2 = t22.Record({ canister_id: s2 }), X = t22.Record({ canister_id: s2 }), Y = t22.Record({ canister_id: s2, snapshot_id: _2 }), Z = t22.Record({ canister_id: s2 }), m2 = t22.Variant({ secp256k1: t22.Null }), $2 = t22.Record({ key_id: t22.Record({ name: t22.Text, curve: m2 }), canister_id: t22.Opt(s2), derivation_path: t22.Vec(t22.Vec(t22.Nat8)) }), I2 = t22.Record({ public_key: t22.Vec(t22.Nat8), chain_code: t22.Vec(t22.Nat8) }), L2 = t22.Record({ canister_id: s2 }), D2 = t22.Record({ idx: t22.Nat64, timestamp_nanos: t22.Nat64, content: t22.Vec(t22.Nat8) }), tt = t22.Record({ canister_log_records: t22.Vec(D2) }), g2 = t22.Record({ value: t22.Text, name: t22.Text }), l = t22.Record({ status: t22.Nat, body: t22.Vec(t22.Nat8), headers: t22.Vec(g2) }), et = t22.Record({ url: t22.Text, method: t22.Variant({ get: t22.Null, head: t22.Null, post: t22.Null }), max_response_bytes: t22.Opt(t22.Nat64), body: t22.Opt(t22.Vec(t22.Nat8)), transform: t22.Opt(t22.Record({ function: t22.Func([t22.Record({ context: t22.Vec(t22.Nat8), response: l })], [l], []), context: t22.Vec(t22.Nat8) })), headers: t22.Vec(g2) }), N2 = t22.Variant({ reinstall: t22.Null, upgrade: t22.Opt(t22.Record({ wasm_memory_persistence: t22.Opt(t22.Variant({ keep: t22.Null, replace: t22.Null })), skip_pre_upgrade: t22.Opt(t22.Bool) })), install: t22.Null }), p = t22.Record({ hash: t22.Vec(t22.Nat8) }), st = t22.Record({ arg: t22.Vec(t22.Nat8), wasm_module_hash: t22.Vec(t22.Nat8), mode: N2, chunk_hashes_list: t22.Vec(p), target_canister: s2, store_canister: t22.Opt(s2), sender_canister_version: t22.Opt(t22.Nat64) }), nt = t22.Vec(t22.Nat8), ct = t22.Record({ arg: t22.Vec(t22.Nat8), wasm_module: nt, mode: N2, canister_id: s2, sender_canister_version: t22.Opt(t22.Nat64) }), rt = t22.Record({ canister_id: s2 }), y = t22.Record({ id: _2, total_size: t22.Nat64, taken_at_timestamp: t22.Nat64 }), at = t22.Vec(y), it = t22.Record({ canister_id: s2, sender_canister_version: t22.Opt(t22.Nat64), snapshot_id: _2 }), ot = t22.Record({ start_at_timestamp_nanos: t22.Nat64, subnet_id: t22.Principal }), _t2 = t22.Record({ num_block_failures_total: t22.Nat64, node_id: t22.Principal, num_blocks_proposed_total: t22.Nat64 }), dt = t22.Vec(t22.Record({ timestamp_nanos: t22.Nat64, node_metrics: t22.Vec(_t2) })), lt2 = t22.Record({ settings: t22.Opt(d2), specified_id: t22.Opt(s2), amount: t22.Opt(t22.Nat), sender_canister_version: t22.Opt(t22.Nat64) }), pt = t22.Record({ canister_id: s2 }), ut = t22.Record({ canister_id: s2, amount: t22.Nat }), ht = t22.Vec(t22.Nat8), k2 = t22.Variant({ ed25519: t22.Null, bip340secp256k1: t22.Null }), mt = t22.Record({ key_id: t22.Record({ algorithm: k2, name: t22.Text }), canister_id: t22.Opt(s2), derivation_path: t22.Vec(t22.Vec(t22.Nat8)) }), gt = t22.Record({ public_key: t22.Vec(t22.Nat8), chain_code: t22.Vec(t22.Nat8) }), Nt = t22.Record({ key_id: t22.Record({ name: t22.Text, curve: m2 }), derivation_path: t22.Vec(t22.Vec(t22.Nat8)), message_hash: t22.Vec(t22.Nat8) }), yt = t22.Record({ signature: t22.Vec(t22.Nat8) }), kt = t22.Variant({ bip341: t22.Record({ merkle_root_hash: t22.Vec(t22.Nat8) }) }), Rt = t22.Record({ aux: t22.Opt(kt), key_id: t22.Record({ algorithm: k2, name: t22.Text }), derivation_path: t22.Vec(t22.Vec(t22.Nat8)), message: t22.Vec(t22.Nat8) }), Vt = t22.Record({ signature: t22.Vec(t22.Nat8) }), vt = t22.Record({ canister_id: s2 }), bt = t22.Record({ canister_id: s2 }), ft = t22.Record({ canister_id: s2 }), Ft = t22.Vec(p), Ot = t22.Record({ subnet_id: t22.Principal }), Pt = t22.Record({ replica_version: t22.Text }), xt = t22.Record({ replace_snapshot: t22.Opt(_2), canister_id: s2 }), wt2 = y, Ct = t22.Record({ canister_id: s2, sender_canister_version: t22.Opt(t22.Nat64) }), Tt = t22.Record({ canister_id: t22.Principal, settings: d2, sender_canister_version: t22.Opt(t22.Nat64) }), St2 = t22.Record({ chunk: t22.Vec(t22.Nat8), canister_id: t22.Principal }), zt = p, R2 = t22.Variant({ bls12_381_g2: t22.Null }), qt = t22.Record({ context: t22.Vec(t22.Nat8), key_id: t22.Record({ name: t22.Text, curve: R2 }), input: t22.Vec(t22.Nat8), transport_public_key: t22.Vec(t22.Nat8) }), Ut = t22.Record({ encrypted_key: t22.Vec(t22.Nat8) }), At = t22.Record({ context: t22.Vec(t22.Nat8), key_id: t22.Record({ name: t22.Text, curve: R2 }), canister_id: t22.Opt(s2) }), Wt = t22.Record({ public_key: t22.Vec(t22.Nat8) });
  return t22.Service({ bitcoin_get_balance: t22.Func([c], [i3], []), bitcoin_get_block_headers: t22.Func([u2], [O2], []), bitcoin_get_current_fee_percentiles: t22.Func([P2], [w4], []), bitcoin_get_utxos: t22.Func([C2], [q], []), bitcoin_send_transaction: t22.Func([U2], [], []), canister_info: t22.Func([A3], [M2], []), canister_status: t22.Func([Q], [H2], []), clear_chunk_store: t22.Func([G2], [], []), create_canister: t22.Func([J2], [K2], []), delete_canister: t22.Func([X], [], []), delete_canister_snapshot: t22.Func([Y], [], []), deposit_cycles: t22.Func([Z], [], []), ecdsa_public_key: t22.Func([$2], [I2], []), fetch_canister_logs: t22.Func([L2], [tt], []), http_request: t22.Func([et], [l], []), install_chunked_code: t22.Func([st], [], []), install_code: t22.Func([ct], [], []), list_canister_snapshots: t22.Func([rt], [at], []), load_canister_snapshot: t22.Func([it], [], []), node_metrics_history: t22.Func([ot], [dt], []), provisional_create_canister_with_cycles: t22.Func([lt2], [pt], []), provisional_top_up_canister: t22.Func([ut], [], []), raw_rand: t22.Func([], [ht], []), schnorr_public_key: t22.Func([mt], [gt], []), sign_with_ecdsa: t22.Func([Nt], [yt], []), sign_with_schnorr: t22.Func([Rt], [Vt], []), start_canister: t22.Func([vt], [], []), stop_canister: t22.Func([bt], [], []), stored_chunks: t22.Func([ft], [Ft], []), subnet_info: t22.Func([Ot], [Pt], []), take_canister_snapshot: t22.Func([xt], [wt2], []), uninstall_code: t22.Func([Ct], [], []), update_settings: t22.Func([Tt], [], []), upload_chunk: t22.Func([St2], [zt], []), vetkd_derive_key: t22.Func([qt], [Ut], []), vetkd_public_key: t22.Func([At], [Wt], []) });
};
var Mt = ({ IDL: t22 }) => {
  let e5 = t22.Variant({ mainnet: t22.Null, testnet: t22.Null }), n2 = t22.Text, c = t22.Record({ network: e5, address: n2, min_confirmations: t22.Opt(t22.Nat32) }), r2 = t22.Nat64, i3 = r2, o2 = t22.Nat32, u2 = t22.Record({ start_height: o2, end_height: t22.Opt(o2), network: e5 }), F2 = t22.Vec(t22.Nat8), O2 = t22.Record({ tip_height: o2, block_headers: t22.Vec(F2) }), P2 = t22.Record({ network: e5 }), x2 = t22.Nat64, w4 = t22.Vec(x2), C2 = t22.Record({ network: e5, filter: t22.Opt(t22.Variant({ page: t22.Vec(t22.Nat8), min_confirmations: t22.Nat32 })), address: n2 }), T2 = t22.Vec(t22.Nat8), S2 = t22.Record({ txid: t22.Vec(t22.Nat8), vout: t22.Nat32 }), z2 = t22.Record({ height: t22.Nat32, value: r2, outpoint: S2 }), q = t22.Record({ next_page: t22.Opt(t22.Vec(t22.Nat8)), tip_height: o2, tip_block_hash: T2, utxos: t22.Vec(z2) }), U2 = t22.Record({ transaction: t22.Vec(t22.Nat8), network: e5 }), s2 = t22.Principal, A3 = t22.Record({ canister_id: s2, num_requested_changes: t22.Opt(t22.Nat64) }), W2 = t22.Variant({ from_user: t22.Record({ user_id: t22.Principal }), from_canister: t22.Record({ canister_version: t22.Opt(t22.Nat64), canister_id: t22.Principal }) }), _2 = t22.Vec(t22.Nat8), B2 = t22.Variant({ creation: t22.Record({ controllers: t22.Vec(t22.Principal) }), code_deployment: t22.Record({ mode: t22.Variant({ reinstall: t22.Null, upgrade: t22.Null, install: t22.Null }), module_hash: t22.Vec(t22.Nat8) }), load_snapshot: t22.Record({ canister_version: t22.Nat64, taken_at_timestamp: t22.Nat64, snapshot_id: _2 }), controllers_change: t22.Record({ controllers: t22.Vec(t22.Principal) }), code_uninstall: t22.Null }), E2 = t22.Record({ timestamp_nanos: t22.Nat64, canister_version: t22.Nat64, origin: W2, details: B2 }), M2 = t22.Record({ controllers: t22.Vec(t22.Principal), module_hash: t22.Opt(t22.Vec(t22.Nat8)), recent_changes: t22.Vec(E2), total_num_changes: t22.Nat64 }), Q = t22.Record({ canister_id: s2 }), h3 = t22.Variant({ controllers: t22.Null, public: t22.Null, allowed_viewers: t22.Vec(t22.Principal) }), j2 = t22.Record({ freezing_threshold: t22.Nat, wasm_memory_threshold: t22.Nat, controllers: t22.Vec(t22.Principal), reserved_cycles_limit: t22.Nat, log_visibility: h3, wasm_memory_limit: t22.Nat, memory_allocation: t22.Nat, compute_allocation: t22.Nat }), H2 = t22.Record({ memory_metrics: t22.Record({ wasm_binary_size: t22.Nat, wasm_chunk_store_size: t22.Nat, canister_history_size: t22.Nat, stable_memory_size: t22.Nat, snapshots_size: t22.Nat, wasm_memory_size: t22.Nat, global_memory_size: t22.Nat, custom_sections_size: t22.Nat }), status: t22.Variant({ stopped: t22.Null, stopping: t22.Null, running: t22.Null }), memory_size: t22.Nat, cycles: t22.Nat, settings: j2, query_stats: t22.Record({ response_payload_bytes_total: t22.Nat, num_instructions_total: t22.Nat, num_calls_total: t22.Nat, request_payload_bytes_total: t22.Nat }), idle_cycles_burned_per_day: t22.Nat, module_hash: t22.Opt(t22.Vec(t22.Nat8)), reserved_cycles: t22.Nat }), G2 = t22.Record({ canister_id: s2 }), d2 = t22.Record({ freezing_threshold: t22.Opt(t22.Nat), wasm_memory_threshold: t22.Opt(t22.Nat), controllers: t22.Opt(t22.Vec(t22.Principal)), reserved_cycles_limit: t22.Opt(t22.Nat), log_visibility: t22.Opt(h3), wasm_memory_limit: t22.Opt(t22.Nat), memory_allocation: t22.Opt(t22.Nat), compute_allocation: t22.Opt(t22.Nat) }), J2 = t22.Record({ settings: t22.Opt(d2), sender_canister_version: t22.Opt(t22.Nat64) }), K2 = t22.Record({ canister_id: s2 }), X = t22.Record({ canister_id: s2 }), Y = t22.Record({ canister_id: s2, snapshot_id: _2 }), Z = t22.Record({ canister_id: s2 }), m2 = t22.Variant({ secp256k1: t22.Null }), $2 = t22.Record({ key_id: t22.Record({ name: t22.Text, curve: m2 }), canister_id: t22.Opt(s2), derivation_path: t22.Vec(t22.Vec(t22.Nat8)) }), I2 = t22.Record({ public_key: t22.Vec(t22.Nat8), chain_code: t22.Vec(t22.Nat8) }), L2 = t22.Record({ canister_id: s2 }), D2 = t22.Record({ idx: t22.Nat64, timestamp_nanos: t22.Nat64, content: t22.Vec(t22.Nat8) }), tt = t22.Record({ canister_log_records: t22.Vec(D2) }), g2 = t22.Record({ value: t22.Text, name: t22.Text }), l = t22.Record({ status: t22.Nat, body: t22.Vec(t22.Nat8), headers: t22.Vec(g2) }), et = t22.Record({ url: t22.Text, method: t22.Variant({ get: t22.Null, head: t22.Null, post: t22.Null }), max_response_bytes: t22.Opt(t22.Nat64), body: t22.Opt(t22.Vec(t22.Nat8)), transform: t22.Opt(t22.Record({ function: t22.Func([t22.Record({ context: t22.Vec(t22.Nat8), response: l })], [l], ["query"]), context: t22.Vec(t22.Nat8) })), headers: t22.Vec(g2) }), N2 = t22.Variant({ reinstall: t22.Null, upgrade: t22.Opt(t22.Record({ wasm_memory_persistence: t22.Opt(t22.Variant({ keep: t22.Null, replace: t22.Null })), skip_pre_upgrade: t22.Opt(t22.Bool) })), install: t22.Null }), p = t22.Record({ hash: t22.Vec(t22.Nat8) }), st = t22.Record({ arg: t22.Vec(t22.Nat8), wasm_module_hash: t22.Vec(t22.Nat8), mode: N2, chunk_hashes_list: t22.Vec(p), target_canister: s2, store_canister: t22.Opt(s2), sender_canister_version: t22.Opt(t22.Nat64) }), nt = t22.Vec(t22.Nat8), ct = t22.Record({ arg: t22.Vec(t22.Nat8), wasm_module: nt, mode: N2, canister_id: s2, sender_canister_version: t22.Opt(t22.Nat64) }), rt = t22.Record({ canister_id: s2 }), y = t22.Record({ id: _2, total_size: t22.Nat64, taken_at_timestamp: t22.Nat64 }), at = t22.Vec(y), it = t22.Record({ canister_id: s2, sender_canister_version: t22.Opt(t22.Nat64), snapshot_id: _2 }), ot = t22.Record({ start_at_timestamp_nanos: t22.Nat64, subnet_id: t22.Principal }), _t2 = t22.Record({ num_block_failures_total: t22.Nat64, node_id: t22.Principal, num_blocks_proposed_total: t22.Nat64 }), dt = t22.Vec(t22.Record({ timestamp_nanos: t22.Nat64, node_metrics: t22.Vec(_t2) })), lt2 = t22.Record({ settings: t22.Opt(d2), specified_id: t22.Opt(s2), amount: t22.Opt(t22.Nat), sender_canister_version: t22.Opt(t22.Nat64) }), pt = t22.Record({ canister_id: s2 }), ut = t22.Record({ canister_id: s2, amount: t22.Nat }), ht = t22.Vec(t22.Nat8), k2 = t22.Variant({ ed25519: t22.Null, bip340secp256k1: t22.Null }), mt = t22.Record({ key_id: t22.Record({ algorithm: k2, name: t22.Text }), canister_id: t22.Opt(s2), derivation_path: t22.Vec(t22.Vec(t22.Nat8)) }), gt = t22.Record({ public_key: t22.Vec(t22.Nat8), chain_code: t22.Vec(t22.Nat8) }), Nt = t22.Record({ key_id: t22.Record({ name: t22.Text, curve: m2 }), derivation_path: t22.Vec(t22.Vec(t22.Nat8)), message_hash: t22.Vec(t22.Nat8) }), yt = t22.Record({ signature: t22.Vec(t22.Nat8) }), kt = t22.Variant({ bip341: t22.Record({ merkle_root_hash: t22.Vec(t22.Nat8) }) }), Rt = t22.Record({ aux: t22.Opt(kt), key_id: t22.Record({ algorithm: k2, name: t22.Text }), derivation_path: t22.Vec(t22.Vec(t22.Nat8)), message: t22.Vec(t22.Nat8) }), Vt = t22.Record({ signature: t22.Vec(t22.Nat8) }), vt = t22.Record({ canister_id: s2 }), bt = t22.Record({ canister_id: s2 }), ft = t22.Record({ canister_id: s2 }), Ft = t22.Vec(p), Ot = t22.Record({ subnet_id: t22.Principal }), Pt = t22.Record({ replica_version: t22.Text }), xt = t22.Record({ replace_snapshot: t22.Opt(_2), canister_id: s2 }), wt2 = y, Ct = t22.Record({ canister_id: s2, sender_canister_version: t22.Opt(t22.Nat64) }), Tt = t22.Record({ canister_id: t22.Principal, settings: d2, sender_canister_version: t22.Opt(t22.Nat64) }), St2 = t22.Record({ chunk: t22.Vec(t22.Nat8), canister_id: t22.Principal }), zt = p, R2 = t22.Variant({ bls12_381_g2: t22.Null }), qt = t22.Record({ context: t22.Vec(t22.Nat8), key_id: t22.Record({ name: t22.Text, curve: R2 }), input: t22.Vec(t22.Nat8), transport_public_key: t22.Vec(t22.Nat8) }), Ut = t22.Record({ encrypted_key: t22.Vec(t22.Nat8) }), At = t22.Record({ context: t22.Vec(t22.Nat8), key_id: t22.Record({ name: t22.Text, curve: R2 }), canister_id: t22.Opt(s2) }), Wt = t22.Record({ public_key: t22.Vec(t22.Nat8) });
  return t22.Service({ bitcoin_get_balance: t22.Func([c], [i3], []), bitcoin_get_block_headers: t22.Func([u2], [O2], []), bitcoin_get_current_fee_percentiles: t22.Func([P2], [w4], []), bitcoin_get_utxos: t22.Func([C2], [q], []), bitcoin_send_transaction: t22.Func([U2], [], []), canister_info: t22.Func([A3], [M2], []), canister_status: t22.Func([Q], [H2], []), clear_chunk_store: t22.Func([G2], [], []), create_canister: t22.Func([J2], [K2], []), delete_canister: t22.Func([X], [], []), delete_canister_snapshot: t22.Func([Y], [], []), deposit_cycles: t22.Func([Z], [], []), ecdsa_public_key: t22.Func([$2], [I2], []), fetch_canister_logs: t22.Func([L2], [tt], ["query"]), http_request: t22.Func([et], [l], []), install_chunked_code: t22.Func([st], [], []), install_code: t22.Func([ct], [], []), list_canister_snapshots: t22.Func([rt], [at], []), load_canister_snapshot: t22.Func([it], [], []), node_metrics_history: t22.Func([ot], [dt], []), provisional_create_canister_with_cycles: t22.Func([lt2], [pt], []), provisional_top_up_canister: t22.Func([ut], [], []), raw_rand: t22.Func([], [ht], []), schnorr_public_key: t22.Func([mt], [gt], []), sign_with_ecdsa: t22.Func([Nt], [yt], []), sign_with_schnorr: t22.Func([Rt], [Vt], []), start_canister: t22.Func([vt], [], []), stop_canister: t22.Func([bt], [], []), stored_chunks: t22.Func([ft], [Ft], []), subnet_info: t22.Func([Ot], [Pt], []), take_canister_snapshot: t22.Func([xt], [wt2], []), uninstall_code: t22.Func([Ct], [], []), update_settings: t22.Func([Tt], [], []), upload_chunk: t22.Func([St2], [zt], []), vetkd_derive_key: t22.Func([qt], [Ut], []), vetkd_public_key: t22.Func([At], [Wt], []) });
};
var Gt = (t22) => wt(t22), b$1 = (t22) => typeof t22 == "string" ? Gt(t22) : t22;
var Bt = (t22, e5, n2) => {
  let [c] = e5;
  if (s$1(c) && typeof c == "object") {
    if (t22 === "install_chunked_code" && s$1(c.target_canister)) return { effectiveCanisterId: Principal$1.from(c.target_canister) };
    if (t22 === "provisional_create_canister_with_cycles" && s$1(c.specified_id)) {
      let r2 = L$1(c.specified_id);
      if (s$1(r2)) return { effectiveCanisterId: Principal$1.from(r2) };
    }
    if (s$1(c.canister_id)) return { effectiveCanisterId: Principal$1.from(c.canister_id) };
  }
  return { effectiveCanisterId: Principal$1.fromHex("") };
};
var Qt = class t {
  constructor(e5) {
    __publicField(this, "createCanister", async ({ settings: e5, senderCanisterVersion: n2 } = {}) => {
      let { create_canister: c } = this.service, { canister_id: r2 } = await c({ settings: ee(P$1(e5)), sender_canister_version: ee(n2) });
      return r2;
    });
    __publicField(this, "updateSettings", ({ canisterId: e5, senderCanisterVersion: n2, settings: c }) => {
      let { update_settings: r2 } = this.service;
      return r2({ canister_id: e5, sender_canister_version: ee(n2), settings: P$1(c) });
    });
    __publicField(this, "installCode", ({ canisterId: e5, wasmModule: n2, senderCanisterVersion: c, ...r2 }) => {
      let { install_code: i3 } = this.service;
      return i3({ ...r2, canister_id: e5, wasm_module: n2, sender_canister_version: ee(c) });
    });
    __publicField(this, "uploadChunk", ({ canisterId: e5, ...n2 }) => {
      let { upload_chunk: c } = this.service;
      return c({ canister_id: e5, ...n2 });
    });
    __publicField(this, "clearChunkStore", async ({ canisterId: e5 }) => {
      let { clear_chunk_store: n2 } = this.service;
      await n2({ canister_id: e5 });
    });
    __publicField(this, "storedChunks", ({ canisterId: e5 }) => {
      let { stored_chunks: n2 } = this.service;
      return n2({ canister_id: e5 });
    });
    __publicField(this, "installChunkedCode", async ({ senderCanisterVersion: e5, chunkHashesList: n2, targetCanisterId: c, storeCanisterId: r2, wasmModuleHash: i3, ...o2 }) => {
      let { install_chunked_code: u2 } = this.service;
      await u2({ ...o2, target_canister: c, store_canister: ee(r2), sender_canister_version: ee(e5), chunk_hashes_list: n2, wasm_module_hash: typeof i3 == "string" ? wt(i3) : i3 });
    });
    __publicField(this, "uninstallCode", ({ canisterId: e5, senderCanisterVersion: n2 }) => {
      let { uninstall_code: c } = this.service;
      return c({ canister_id: e5, sender_canister_version: ee(n2) });
    });
    __publicField(this, "startCanister", (e5) => {
      let { start_canister: n2 } = this.service;
      return n2({ canister_id: e5 });
    });
    __publicField(this, "stopCanister", (e5) => {
      let { stop_canister: n2 } = this.service;
      return n2({ canister_id: e5 });
    });
    __publicField(this, "canisterStatus", (e5) => {
      let { canister_status: n2 } = this.service;
      return n2({ canister_id: e5 });
    });
    __publicField(this, "deleteCanister", (e5) => {
      let { delete_canister: n2 } = this.service;
      return n2({ canister_id: e5 });
    });
    __publicField(this, "provisionalCreateCanisterWithCycles", async ({ settings: e5, amount: n2, canisterId: c } = {}) => {
      let { provisional_create_canister_with_cycles: r2 } = this.service, { canister_id: i3 } = await r2({ settings: ee(P$1(e5)), amount: ee(n2), specified_id: ee(c), sender_canister_version: [] });
      return i3;
    });
    __publicField(this, "fetchCanisterLogs", (e5) => {
      let { fetch_canister_logs: n2 } = this.service;
      return n2({ canister_id: e5 });
    });
    __publicField(this, "takeCanisterSnapshot", ({ canisterId: e5, snapshotId: n2 }) => {
      let { take_canister_snapshot: c } = this.service;
      return c({ canister_id: e5, replace_snapshot: ee(s$1(n2) ? b$1(n2) : void 0) });
    });
    __publicField(this, "listCanisterSnapshots", ({ canisterId: e5 }) => {
      let { list_canister_snapshots: n2 } = this.service;
      return n2({ canister_id: e5 });
    });
    __publicField(this, "loadCanisterSnapshot", async ({ canisterId: e5, snapshotId: n2, senderCanisterVersion: c }) => {
      let { load_canister_snapshot: r2 } = this.service;
      await r2({ canister_id: e5, snapshot_id: b$1(n2), sender_canister_version: ee(c) });
    });
    __publicField(this, "deleteCanisterSnapshot", async ({ canisterId: e5, snapshotId: n2 }) => {
      let { delete_canister_snapshot: c } = this.service;
      await c({ canister_id: e5, snapshot_id: b$1(n2) });
    });
    this.service = e5;
    this.service = e5;
  }
  static create(e5) {
    let { service: n2 } = lt({ options: { ...e5, canisterId: Principal$1.fromHex(""), callTransform: Bt, queryTransform: Bt }, idlFactory: Mt, certifiedIdlFactory: Et });
    return new t(n2);
  }
};
function V$2() {
  const t3 = window.location.hostname, e5 = window.location.protocol, r2 = /^([a-z0-9-]+)\.localhost$/.exec(t3);
  if ((r2 == null ? void 0 : r2[1]) != null) {
    if (e5 !== "http:")
      throw new Error(
        `Invalid protocol for localhost: ${e5}. Only http: is allowed for localhost.`
      );
    return Principal$1.fromText(r2[1]);
  }
  const a = /^([a-z0-9-]+)\.icp0\.io$/.exec(t3);
  if ((a == null ? void 0 : a[1]) != null) {
    if (e5 !== "https:")
      throw new Error(
        `Invalid protocol for production: ${e5}. Only https: is allowed for icp0.io.`
      );
    return Principal$1.fromText(a[1]);
  }
  throw new Error(`Could not infer canister ID from hostname: ${t3}`);
}
function getElement(id) {
  const element = document.getElementById(id);
  if (!element) {
    throw new Error(`Element with id '${id}' not found`);
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
function addEventListener(id, event, handler) {
  const element = getElement(id);
  element.addEventListener(event, async () => {
    await handler();
  });
}
function setLoggedInState(principalText, onLogout) {
  const authBtn = getElement("auth-btn");
  authBtn.textContent = "Logout";
  authBtn.onclick = async () => {
    try {
      await onLogout();
    } catch {
      showError("Logout failed. Please try again.");
    }
  };
  toggleVisibility("ii-principal", true);
  setText("ii-principal", principalText);
  toggleVisibility("authenticated-content", true);
}
function setLoggedOutState(onLogin) {
  const authBtn = getElement("auth-btn");
  authBtn.textContent = "Login";
  authBtn.onclick = async () => {
    try {
      await onLogin();
    } catch {
      showError("Login failed. Please try again.");
    }
  };
  toggleVisibility("ii-principal", false);
  setText("ii-principal", "");
  toggleVisibility("authenticated-content", false);
  toggleVisibility("error-section", false);
  setText("error-section", "");
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
function getInputValue(id) {
  const input = getElement(id);
  return input.value.trim();
}
function clearInput(id) {
  const input = getElement(id);
  input.value = "";
}
const NETWORK_ERROR_MESSAGE = "Network error occurred. Please try again.";
const INVALID_PRINCIPAL_MESSAGE = "Invalid principal format.";
const INSUFFICIENT_BALANCE_MESSAGE = "Insufficient balance for this operation.";
const DUPLICATE_CONTROLLER_MESSAGE = "Controller already exists.";
const CONTROLLER_NOT_FOUND_MESSAGE = "Controller not found.";
const REQUIRED_CONTROLLERS_MESSAGE = "Cannot remove required controllers.";
const INVALID_ORIGIN_MESSAGE = "Invalid origin format.";
const CANISTER_ID_ERROR_MESSAGE = "Unable to determine canister ID.";
const HTTP_AGENT_ERROR_MESSAGE = "Failed to create HTTP agent.";
const DASHBOARD_INIT_ERROR_MESSAGE = "Failed to initialize dashboard.";
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
    new URL(text);
    return true;
  } catch {
    return false;
  }
}
async function canisterId() {
  try {
    return V$2();
  } catch {
    const config = await getConfig();
    if (config.canisterId !== void 0) {
      return Principal$1.fromText(config.canisterId);
    }
    showError(CANISTER_ID_ERROR_MESSAGE);
    throw new Error("No canister ID available");
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
    showError(HTTP_AGENT_ERROR_MESSAGE);
    throw error;
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
      showError(NETWORK_ERROR_MESSAGE);
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
      showError(NETWORK_ERROR_MESSAGE);
      throw error;
    }
  }
  async getCanisterLogs() {
    try {
      const icManagement = await this.managmentApi();
      const canisterIdPrincipal = await canisterId();
      return await icManagement.fetchCanisterLogs(canisterIdPrincipal);
    } catch (error) {
      showError(NETWORK_ERROR_MESSAGE);
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
  async create() {
    const managementApi = new ManagementApi();
    const status = await managementApi.getCanisterStatus();
    const { statusText, memorySizeFormatted, cyclesFormatted, moduleHashHex } = this.formatStatusData(status);
    updateStatusDisplay(
      statusText,
      memorySizeFormatted,
      cyclesFormatted,
      moduleHashHex
    );
  }
  formatStatusData(status) {
    const statusText = "running" in status.status ? "Running" : "stopped" in status.status ? "Stopped" : "stopping" in status.status ? "Stopping" : "Unknown";
    const memorySizeFormatted = formatMemorySize(status.memory_size);
    const cyclesFormatted = formatCycles(status.cycles);
    const moduleHashHex = status.module_hash.length > 0 ? k$2(status.module_hash[0]) : "N/A";
    return { statusText, memorySizeFormatted, cyclesFormatted, moduleHashHex };
  }
}
var N$1 = Object.create;
var H = Object.defineProperty;
var F$1 = Object.getOwnPropertyDescriptor;
var j = Object.getOwnPropertyNames;
var V$1 = Object.getPrototypeOf, G = Object.prototype.hasOwnProperty;
var z = (e5, t3) => () => (t3 || e5((t3 = { exports: {} }).exports, t3), t3.exports);
var v$2 = (e5, t3, n2, r2) => {
  if (t3 && typeof t3 == "object" || typeof t3 == "function") for (let o2 of j(t3)) !G.call(e5, o2) && o2 !== n2 && H(e5, o2, { get: () => t3[o2], enumerable: !(r2 = F$1(t3, o2)) || r2.enumerable });
  return e5;
};
var J$1 = (e5, t3, n2) => (n2 = e5 != null ? N$1(V$1(e5)) : {}, v$2(!e5 || !e5.__esModule ? H(n2, "default", { value: e5, enumerable: true }) : n2, e5));
function W(e5) {
  return e5 instanceof Uint8Array || e5 != null && typeof e5 == "object" && e5.constructor.name === "Uint8Array";
}
function A$1(e5, ...t3) {
  if (!W(e5)) throw new Error("Uint8Array expected");
  if (t3.length > 0 && !t3.includes(e5.length)) throw new Error(`Uint8Array expected of length ${t3}, not of length=${e5.length}`);
}
function U(e5, t3 = true) {
  if (e5.destroyed) throw new Error("Hash instance has been destroyed");
  if (t3 && e5.finished) throw new Error("Hash#digest() has already been called");
}
function S(e5, t3) {
  A$1(e5);
  let n2 = t3.outputLen;
  if (e5.length < n2) throw new Error(`digestInto() expects output buffer of length at least ${n2}`);
}
var g = (e5) => new DataView(e5.buffer, e5.byteOffset, e5.byteLength), h$2 = (e5, t3) => e5 << 32 - t3 | e5 >>> t3;
new Uint8Array(new Uint32Array([287454020]).buffer)[0] === 68;
function $(e5) {
  if (typeof e5 != "string") throw new Error(`utf8ToBytes expected string, got ${typeof e5}`);
  return new Uint8Array(new TextEncoder().encode(e5));
}
function B$1(e5) {
  return typeof e5 == "string" && (e5 = $(e5)), A$1(e5), e5;
}
var d = class {
  clone() {
    return this._cloneInto();
  }
};
function T(e5) {
  let t3 = (r2) => e5().update(B$1(r2)).digest(), n2 = e5();
  return t3.outputLen = n2.outputLen, t3.blockLen = n2.blockLen, t3.create = () => e5(), t3;
}
function M(e5, t3, n2, r2) {
  if (typeof e5.setBigUint64 == "function") return e5.setBigUint64(t3, n2, r2);
  let o2 = BigInt(32), c = BigInt(4294967295), i3 = Number(n2 >> o2 & c), s2 = Number(n2 & c), u2 = r2 ? 4 : 0, a = r2 ? 0 : 4;
  e5.setUint32(t3 + u2, i3, r2), e5.setUint32(t3 + a, s2, r2);
}
var C = (e5, t3, n2) => e5 & t3 ^ ~e5 & n2, k$1 = (e5, t3, n2) => e5 & t3 ^ e5 & n2 ^ t3 & n2, w$1 = class w2 extends d {
  constructor(t3, n2, r2, o2) {
    super(), this.blockLen = t3, this.outputLen = n2, this.padOffset = r2, this.isLE = o2, this.finished = false, this.length = 0, this.pos = 0, this.destroyed = false, this.buffer = new Uint8Array(t3), this.view = g(this.buffer);
  }
  update(t3) {
    U(this);
    let { view: n2, buffer: r2, blockLen: o2 } = this;
    t3 = B$1(t3);
    let c = t3.length;
    for (let i3 = 0; i3 < c; ) {
      let s2 = Math.min(o2 - this.pos, c - i3);
      if (s2 === o2) {
        let u2 = g(t3);
        for (; o2 <= c - i3; i3 += o2) this.process(u2, i3);
        continue;
      }
      r2.set(t3.subarray(i3, i3 + s2), this.pos), this.pos += s2, i3 += s2, this.pos === o2 && (this.process(n2, 0), this.pos = 0);
    }
    return this.length += t3.length, this.roundClean(), this;
  }
  digestInto(t3) {
    U(this), S(t3, this), this.finished = true;
    let { buffer: n2, view: r2, blockLen: o2, isLE: c } = this, { pos: i3 } = this;
    n2[i3++] = 128, this.buffer.subarray(i3).fill(0), this.padOffset > o2 - i3 && (this.process(r2, 0), i3 = 0);
    for (let f2 = i3; f2 < o2; f2++) n2[f2] = 0;
    M(r2, o2 - 8, BigInt(this.length * 8), c), this.process(r2, 0);
    let s2 = g(t3), u2 = this.outputLen;
    if (u2 % 4) throw new Error("_sha2: outputLen should be aligned to 32bit");
    let a = u2 / 4, p = this.get();
    if (a > p.length) throw new Error("_sha2: outputLen bigger than state");
    for (let f2 = 0; f2 < a; f2++) s2.setUint32(4 * f2, p[f2], c);
  }
  digest() {
    let { buffer: t3, outputLen: n2 } = this;
    this.digestInto(t3);
    let r2 = t3.slice(0, n2);
    return this.destroy(), r2;
  }
  _cloneInto(t3) {
    t3 || (t3 = new this.constructor()), t3.set(...this.get());
    let { blockLen: n2, buffer: r2, length: o2, finished: c, destroyed: i3, pos: s2 } = this;
    return t3.length = o2, t3.pos = s2, t3.finished = c, t3.destroyed = i3, o2 % n2 && t3.buffer.set(r2), t3;
  }
};
var P = new Uint32Array([1116352408, 1899447441, 3049323471, 3921009573, 961987163, 1508970993, 2453635748, 2870763221, 3624381080, 310598401, 607225278, 1426881987, 1925078388, 2162078206, 2614888103, 3248222580, 3835390401, 4022224774, 264347078, 604807628, 770255983, 1249150122, 1555081692, 1996064986, 2554220882, 2821834349, 2952996808, 3210313671, 3336571891, 3584528711, 113926993, 338241895, 666307205, 773529912, 1294757372, 1396182291, 1695183700, 1986661051, 2177026350, 2456956037, 2730485921, 2820302411, 3259730800, 3345764771, 3516065817, 3600352804, 4094571909, 275423344, 430227734, 506948616, 659060556, 883997877, 958139571, 1322822218, 1537002063, 1747873779, 1955562222, 2024104815, 2227730452, 2361852424, 2428436474, 2756734187, 3204031479, 3329325298]), x = new Uint32Array([1779033703, 3144134277, 1013904242, 2773480762, 1359893119, 2600822924, 528734635, 1541459225]), b = new Uint32Array(64), E = class extends w$1 {
  constructor() {
    super(64, 32, 8, false), this.A = x[0] | 0, this.B = x[1] | 0, this.C = x[2] | 0, this.D = x[3] | 0, this.E = x[4] | 0, this.F = x[5] | 0, this.G = x[6] | 0, this.H = x[7] | 0;
  }
  get() {
    let { A: t3, B: n2, C: r2, D: o2, E: c, F: i3, G: s2, H: u2 } = this;
    return [t3, n2, r2, o2, c, i3, s2, u2];
  }
  set(t3, n2, r2, o2, c, i3, s2, u2) {
    this.A = t3 | 0, this.B = n2 | 0, this.C = r2 | 0, this.D = o2 | 0, this.E = c | 0, this.F = i3 | 0, this.G = s2 | 0, this.H = u2 | 0;
  }
  process(t3, n2) {
    for (let f2 = 0; f2 < 16; f2++, n2 += 4) b[f2] = t3.getUint32(n2, false);
    for (let f2 = 16; f2 < 64; f2++) {
      let y = b[f2 - 15], l = b[f2 - 2], I2 = h$2(y, 7) ^ h$2(y, 18) ^ y >>> 3, m2 = h$2(l, 17) ^ h$2(l, 19) ^ l >>> 10;
      b[f2] = m2 + b[f2 - 7] + I2 + b[f2 - 16] | 0;
    }
    let { A: r2, B: o2, C: c, D: i3, E: s2, F: u2, G: a, H: p } = this;
    for (let f2 = 0; f2 < 64; f2++) {
      let y = h$2(s2, 6) ^ h$2(s2, 11) ^ h$2(s2, 25), l = p + y + C(s2, u2, a) + P[f2] + b[f2] | 0, m2 = (h$2(r2, 2) ^ h$2(r2, 13) ^ h$2(r2, 22)) + k$1(r2, o2, c) | 0;
      p = a, a = u2, u2 = s2, s2 = i3 + l | 0, i3 = c, c = o2, o2 = r2, r2 = l + m2 | 0;
    }
    r2 = r2 + this.A | 0, o2 = o2 + this.B | 0, c = c + this.C | 0, i3 = i3 + this.D | 0, s2 = s2 + this.E | 0, u2 = u2 + this.F | 0, a = a + this.G | 0, p = p + this.H | 0, this.set(r2, o2, c, i3, s2, u2, a, p);
  }
  roundClean() {
    b.fill(0);
  }
  destroy() {
    this.set(0, 0, 0, 0, 0, 0, 0, 0), this.buffer.fill(0);
  }
}, L = class extends E {
  constructor() {
    super(), this.A = -1056596264, this.B = 914150663, this.C = 812702999, this.D = -150054599, this.E = -4191439, this.F = 1750603025, this.G = 1694076839, this.H = -1090891868, this.outputLen = 28;
  }
};
var O$1 = T(() => new L());
var D = class e {
  constructor(t3) {
    this.bytes = t3;
  }
  static fromHex(t3) {
    return new e(Uint8Array.from(Buffer.from(t3, "hex")));
  }
  static fromPrincipal({ principal: t3, subAccount: n2 = _.fromID(0) }) {
    let r2 = St(`
account-id`), o2 = O$1.create();
    o2.update(_t([...r2, ...t3.toUint8Array(), ...n2.toUint8Array()]));
    let c = o2.digest(), i3 = Lt(c), s2 = new Uint8Array([...i3, ...c]);
    return new e(s2);
  }
  toHex() {
    return k$2(this.bytes);
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
}, _ = class e2 {
  constructor(t3) {
    this.bytes = t3;
  }
  static fromBytes(t3) {
    return t3.length != 32 ? Error("Subaccount length must be 32-bytes") : new e2(t3);
  }
  static fromPrincipal(t3) {
    let n2 = new Uint8Array(32).fill(0), r2 = t3.toUint8Array();
    n2[0] = r2.length;
    for (let o2 = 0; o2 < r2.length; o2++) n2[1 + o2] = r2[o2];
    return new e2(n2);
  }
  static fromID(t3) {
    if (t3 < 0) throw new Error("Number cannot be negative");
    if (t3 > Number.MAX_SAFE_INTEGER) throw new Error("Number is too large to fit in 32 bytes.");
    let n2 = new DataView(new ArrayBuffer(32));
    if (typeof n2.setBigUint64 == "function") n2.setBigUint64(24, BigInt(t3));
    else {
      let o2 = BigInt(1) << BigInt(32);
      n2.setUint32(24, Number(BigInt(t3) >> BigInt(32))), n2.setUint32(28, Number(BigInt(t3) % o2));
    }
    let r2 = new Uint8Array(n2.buffer);
    return new e2(r2);
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
var f = (t3) => t3 instanceof D ? t3 : D.fromHex(t3);
var he = ({ IDL: e5 }) => {
  let o2 = e5.Vec(e5.Nat8), t3 = e5.Record({ owner: e5.Principal, subaccount: e5.Opt(o2) }), a = e5.Record({ icrc2: e5.Bool }), n2 = e5.Record({ icrc1_minting_account: e5.Opt(t3), feature_flags: e5.Opt(a) }), c = e5.Record({ e8s: e5.Nat64 }), _2 = e5.Text, T2 = e5.Record({ secs: e5.Nat64, nanos: e5.Nat32 }), q = e5.Record({ num_blocks_to_archive: e5.Nat64, max_transactions_per_response: e5.Opt(e5.Nat64), trigger_threshold: e5.Nat64, more_controller_ids: e5.Opt(e5.Vec(e5.Principal)), max_message_size_bytes: e5.Opt(e5.Nat64), cycles_for_archive_creation: e5.Opt(e5.Nat64), node_max_memory_size_bytes: e5.Opt(e5.Nat64), controller_id: e5.Principal }), C2 = e5.Record({ send_whitelist: e5.Vec(e5.Principal), token_symbol: e5.Opt(e5.Text), transfer_fee: e5.Opt(c), minting_account: _2, transaction_window: e5.Opt(T2), max_message_size_bytes: e5.Opt(e5.Nat64), icrc1_minting_account: e5.Opt(t3), archive_options: e5.Opt(q), initial_values: e5.Vec(e5.Tuple(_2, c)), token_name: e5.Opt(e5.Text), feature_flags: e5.Opt(a) });
  e5.Variant({ Upgrade: e5.Opt(n2), Init: C2 });
  let s2 = e5.Vec(e5.Nat8), P2 = e5.Record({ account: s2 }), E2 = e5.Record({ account: _2 }), U2 = e5.Record({ canister_id: e5.Principal }), M2 = e5.Record({ archives: e5.Vec(U2) }), r2 = e5.Nat, S2 = e5.Variant({ Int: e5.Int, Nat: e5.Nat, Blob: e5.Vec(e5.Nat8), Text: e5.Text }), d2 = e5.Nat64, G2 = e5.Record({ to: t3, fee: e5.Opt(r2), memo: e5.Opt(e5.Vec(e5.Nat8)), from_subaccount: e5.Opt(o2), created_at_time: e5.Opt(d2), amount: r2 }), u2 = e5.Nat, Q = e5.Variant({ GenericError: e5.Record({ message: e5.Text, error_code: e5.Nat }), TemporarilyUnavailable: e5.Null, BadBurn: e5.Record({ min_burn_amount: r2 }), Duplicate: e5.Record({ duplicate_of: u2 }), BadFee: e5.Record({ expected_fee: r2 }), CreatedInFuture: e5.Record({ ledger_time: e5.Nat64 }), TooOld: e5.Null, InsufficientFunds: e5.Record({ balance: r2 }) }), z2 = e5.Variant({ Ok: u2, Err: Q }), y = e5.Record({ utc_offset_minutes: e5.Opt(e5.Int16), language: e5.Text }), H2 = e5.Record({ metadata: y, device_spec: e5.Opt(e5.Variant({ GenericDisplay: e5.Null, LineDisplay: e5.Record({ characters_per_line: e5.Nat16, lines_per_page: e5.Nat16 }) })) }), J2 = e5.Record({ arg: e5.Vec(e5.Nat8), method: e5.Text, user_preferences: H2 }), $2 = e5.Variant({ LineDisplayMessage: e5.Record({ pages: e5.Vec(e5.Record({ lines: e5.Vec(e5.Text) })) }), GenericDisplayMessage: e5.Text }), K2 = e5.Record({ metadata: y, consent_message: $2 }), g2 = e5.Record({ description: e5.Text }), Y = e5.Variant({ GenericError: e5.Record({ description: e5.Text, error_code: e5.Nat }), InsufficientPayment: g2, UnsupportedCanisterCall: g2, ConsentMessageUnavailable: g2 }), j2 = e5.Variant({ Ok: K2, Err: Y }), W2 = e5.Record({ account: t3, spender: t3 }), X = e5.Record({ allowance: r2, expires_at: e5.Opt(d2) }), Z = e5.Record({ fee: e5.Opt(r2), memo: e5.Opt(e5.Vec(e5.Nat8)), from_subaccount: e5.Opt(o2), created_at_time: e5.Opt(d2), amount: r2, expected_allowance: e5.Opt(r2), expires_at: e5.Opt(d2), spender: t3 }), I2 = e5.Variant({ GenericError: e5.Record({ message: e5.Text, error_code: e5.Nat }), TemporarilyUnavailable: e5.Null, Duplicate: e5.Record({ duplicate_of: u2 }), BadFee: e5.Record({ expected_fee: r2 }), AllowanceChanged: e5.Record({ current_allowance: r2 }), CreatedInFuture: e5.Record({ ledger_time: e5.Nat64 }), TooOld: e5.Null, Expired: e5.Record({ ledger_time: e5.Nat64 }), InsufficientFunds: e5.Record({ balance: r2 }) }), D2 = e5.Variant({ Ok: u2, Err: I2 }), L2 = e5.Record({ to: t3, fee: e5.Opt(r2), spender_subaccount: e5.Opt(o2), from: t3, memo: e5.Opt(e5.Vec(e5.Nat8)), created_at_time: e5.Opt(d2), amount: r2 }), ee2 = e5.Variant({ GenericError: e5.Record({ message: e5.Text, error_code: e5.Nat }), TemporarilyUnavailable: e5.Null, InsufficientAllowance: e5.Record({ allowance: r2 }), BadBurn: e5.Record({ min_burn_amount: r2 }), Duplicate: e5.Record({ duplicate_of: u2 }), BadFee: e5.Record({ expected_fee: r2 }), CreatedInFuture: e5.Record({ ledger_time: d2 }), TooOld: e5.Null, InsufficientFunds: e5.Record({ balance: r2 }) }), te = e5.Variant({ Ok: u2, Err: ee2 }), i3 = e5.Nat64, f2 = e5.Record({ start: i3, length: e5.Nat64 }), x2 = e5.Nat64, p = e5.Record({ timestamp_nanos: e5.Nat64 }), ce = e5.Variant({ Approve: e5.Record({ fee: c, from: s2, allowance_e8s: e5.Int, allowance: c, expected_allowance: e5.Opt(c), expires_at: e5.Opt(p), spender: s2 }), Burn: e5.Record({ from: s2, amount: c, spender: e5.Opt(s2) }), Mint: e5.Record({ to: s2, amount: c }), Transfer: e5.Record({ to: s2, fee: c, from: s2, amount: c, spender: e5.Opt(e5.Vec(e5.Nat8)) }) }), re = e5.Record({ memo: x2, icrc1_memo: e5.Opt(e5.Vec(e5.Nat8)), operation: e5.Opt(ce), created_at_time: p }), b2 = e5.Record({ transaction: re, timestamp: p, parent_hash: e5.Opt(e5.Vec(e5.Nat8)) }), ne = e5.Record({ blocks: e5.Vec(b2) }), F2 = e5.Variant({ BadFirstBlockIndex: e5.Record({ requested_index: i3, first_valid_index: i3 }), Other: e5.Record({ error_message: e5.Text, error_code: e5.Nat64 }) }), ae = e5.Variant({ Ok: ne, Err: F2 }), oe = e5.Func([f2], [ae], []), se = e5.Record({ callback: oe, start: i3, length: e5.Nat64 }), ie = e5.Record({ certificate: e5.Opt(e5.Vec(e5.Nat8)), blocks: e5.Vec(b2), chain_length: e5.Nat64, first_block_index: i3, archived_blocks: e5.Vec(se) }), de = e5.Record({ callback: e5.Func([f2], [e5.Variant({ Ok: e5.Vec(e5.Vec(e5.Nat8)), Err: F2 })], []), start: e5.Nat64, length: e5.Nat64 }), ue = e5.Record({ certificate: e5.Opt(e5.Vec(e5.Nat8)), blocks: e5.Vec(e5.Vec(e5.Nat8)), chain_length: e5.Nat64, first_block_index: e5.Nat64, archived_blocks: e5.Vec(de) }), le = e5.Record({ to: _2, fee: c, memo: x2, from_subaccount: e5.Opt(o2), created_at_time: e5.Opt(p), amount: c }), _e = e5.Record({ to: s2, fee: c, memo: x2, from_subaccount: e5.Opt(o2), created_at_time: e5.Opt(p), amount: c }), pe = e5.Variant({ TxTooOld: e5.Record({ allowed_window_nanos: e5.Nat64 }), BadFee: e5.Record({ expected_fee: c }), TxDuplicate: e5.Record({ duplicate_of: i3 }), TxCreatedInFuture: e5.Null, InsufficientFunds: e5.Record({ balance: c }) }), me = e5.Variant({ Ok: i3, Err: pe }), fe = e5.Record({}), Re = e5.Record({ transfer_fee: c });
  return e5.Service({ account_balance: e5.Func([P2], [c], []), account_balance_dfx: e5.Func([E2], [c], []), account_identifier: e5.Func([t3], [s2], []), archives: e5.Func([], [M2], []), decimals: e5.Func([], [e5.Record({ decimals: e5.Nat32 })], []), icrc10_supported_standards: e5.Func([], [e5.Vec(e5.Record({ url: e5.Text, name: e5.Text }))], []), icrc1_balance_of: e5.Func([t3], [r2], []), icrc1_decimals: e5.Func([], [e5.Nat8], []), icrc1_fee: e5.Func([], [r2], []), icrc1_metadata: e5.Func([], [e5.Vec(e5.Tuple(e5.Text, S2))], []), icrc1_minting_account: e5.Func([], [e5.Opt(t3)], []), icrc1_name: e5.Func([], [e5.Text], []), icrc1_supported_standards: e5.Func([], [e5.Vec(e5.Record({ url: e5.Text, name: e5.Text }))], []), icrc1_symbol: e5.Func([], [e5.Text], []), icrc1_total_supply: e5.Func([], [r2], []), icrc1_transfer: e5.Func([G2], [z2], []), icrc21_canister_call_consent_message: e5.Func([J2], [j2], []), icrc2_allowance: e5.Func([W2], [X], []), icrc2_approve: e5.Func([Z], [D2], []), icrc2_transfer_from: e5.Func([L2], [te], []), is_ledger_ready: e5.Func([], [e5.Bool], []), name: e5.Func([], [e5.Record({ name: e5.Text })], []), query_blocks: e5.Func([f2], [ie], []), query_encoded_blocks: e5.Func([f2], [ue], []), send_dfx: e5.Func([le], [i3], []), symbol: e5.Func([], [e5.Record({ symbol: e5.Text })], []), transfer: e5.Func([_e], [me], []), transfer_fee: e5.Func([fe], [Re], []) });
};
var we = ({ IDL: e5 }) => {
  let o2 = e5.Vec(e5.Nat8), t3 = e5.Record({ owner: e5.Principal, subaccount: e5.Opt(o2) }), a = e5.Record({ icrc2: e5.Bool }), n2 = e5.Record({ icrc1_minting_account: e5.Opt(t3), feature_flags: e5.Opt(a) }), c = e5.Record({ e8s: e5.Nat64 }), _2 = e5.Text, T2 = e5.Record({ secs: e5.Nat64, nanos: e5.Nat32 }), q = e5.Record({ num_blocks_to_archive: e5.Nat64, max_transactions_per_response: e5.Opt(e5.Nat64), trigger_threshold: e5.Nat64, more_controller_ids: e5.Opt(e5.Vec(e5.Principal)), max_message_size_bytes: e5.Opt(e5.Nat64), cycles_for_archive_creation: e5.Opt(e5.Nat64), node_max_memory_size_bytes: e5.Opt(e5.Nat64), controller_id: e5.Principal }), C2 = e5.Record({ send_whitelist: e5.Vec(e5.Principal), token_symbol: e5.Opt(e5.Text), transfer_fee: e5.Opt(c), minting_account: _2, transaction_window: e5.Opt(T2), max_message_size_bytes: e5.Opt(e5.Nat64), icrc1_minting_account: e5.Opt(t3), archive_options: e5.Opt(q), initial_values: e5.Vec(e5.Tuple(_2, c)), token_name: e5.Opt(e5.Text), feature_flags: e5.Opt(a) });
  e5.Variant({ Upgrade: e5.Opt(n2), Init: C2 });
  let s2 = e5.Vec(e5.Nat8), P2 = e5.Record({ account: s2 }), E2 = e5.Record({ account: _2 }), U2 = e5.Record({ canister_id: e5.Principal }), M2 = e5.Record({ archives: e5.Vec(U2) }), r2 = e5.Nat, S2 = e5.Variant({ Int: e5.Int, Nat: e5.Nat, Blob: e5.Vec(e5.Nat8), Text: e5.Text }), d2 = e5.Nat64, G2 = e5.Record({ to: t3, fee: e5.Opt(r2), memo: e5.Opt(e5.Vec(e5.Nat8)), from_subaccount: e5.Opt(o2), created_at_time: e5.Opt(d2), amount: r2 }), u2 = e5.Nat, Q = e5.Variant({ GenericError: e5.Record({ message: e5.Text, error_code: e5.Nat }), TemporarilyUnavailable: e5.Null, BadBurn: e5.Record({ min_burn_amount: r2 }), Duplicate: e5.Record({ duplicate_of: u2 }), BadFee: e5.Record({ expected_fee: r2 }), CreatedInFuture: e5.Record({ ledger_time: e5.Nat64 }), TooOld: e5.Null, InsufficientFunds: e5.Record({ balance: r2 }) }), z2 = e5.Variant({ Ok: u2, Err: Q }), y = e5.Record({ utc_offset_minutes: e5.Opt(e5.Int16), language: e5.Text }), H2 = e5.Record({ metadata: y, device_spec: e5.Opt(e5.Variant({ GenericDisplay: e5.Null, LineDisplay: e5.Record({ characters_per_line: e5.Nat16, lines_per_page: e5.Nat16 }) })) }), J2 = e5.Record({ arg: e5.Vec(e5.Nat8), method: e5.Text, user_preferences: H2 }), $2 = e5.Variant({ LineDisplayMessage: e5.Record({ pages: e5.Vec(e5.Record({ lines: e5.Vec(e5.Text) })) }), GenericDisplayMessage: e5.Text }), K2 = e5.Record({ metadata: y, consent_message: $2 }), g2 = e5.Record({ description: e5.Text }), Y = e5.Variant({ GenericError: e5.Record({ description: e5.Text, error_code: e5.Nat }), InsufficientPayment: g2, UnsupportedCanisterCall: g2, ConsentMessageUnavailable: g2 }), j2 = e5.Variant({ Ok: K2, Err: Y }), W2 = e5.Record({ account: t3, spender: t3 }), X = e5.Record({ allowance: r2, expires_at: e5.Opt(d2) }), Z = e5.Record({ fee: e5.Opt(r2), memo: e5.Opt(e5.Vec(e5.Nat8)), from_subaccount: e5.Opt(o2), created_at_time: e5.Opt(d2), amount: r2, expected_allowance: e5.Opt(r2), expires_at: e5.Opt(d2), spender: t3 }), I2 = e5.Variant({ GenericError: e5.Record({ message: e5.Text, error_code: e5.Nat }), TemporarilyUnavailable: e5.Null, Duplicate: e5.Record({ duplicate_of: u2 }), BadFee: e5.Record({ expected_fee: r2 }), AllowanceChanged: e5.Record({ current_allowance: r2 }), CreatedInFuture: e5.Record({ ledger_time: e5.Nat64 }), TooOld: e5.Null, Expired: e5.Record({ ledger_time: e5.Nat64 }), InsufficientFunds: e5.Record({ balance: r2 }) }), D2 = e5.Variant({ Ok: u2, Err: I2 }), L2 = e5.Record({ to: t3, fee: e5.Opt(r2), spender_subaccount: e5.Opt(o2), from: t3, memo: e5.Opt(e5.Vec(e5.Nat8)), created_at_time: e5.Opt(d2), amount: r2 }), ee2 = e5.Variant({ GenericError: e5.Record({ message: e5.Text, error_code: e5.Nat }), TemporarilyUnavailable: e5.Null, InsufficientAllowance: e5.Record({ allowance: r2 }), BadBurn: e5.Record({ min_burn_amount: r2 }), Duplicate: e5.Record({ duplicate_of: u2 }), BadFee: e5.Record({ expected_fee: r2 }), CreatedInFuture: e5.Record({ ledger_time: d2 }), TooOld: e5.Null, InsufficientFunds: e5.Record({ balance: r2 }) }), te = e5.Variant({ Ok: u2, Err: ee2 }), i3 = e5.Nat64, f2 = e5.Record({ start: i3, length: e5.Nat64 }), x2 = e5.Nat64, p = e5.Record({ timestamp_nanos: e5.Nat64 }), ce = e5.Variant({ Approve: e5.Record({ fee: c, from: s2, allowance_e8s: e5.Int, allowance: c, expected_allowance: e5.Opt(c), expires_at: e5.Opt(p), spender: s2 }), Burn: e5.Record({ from: s2, amount: c, spender: e5.Opt(s2) }), Mint: e5.Record({ to: s2, amount: c }), Transfer: e5.Record({ to: s2, fee: c, from: s2, amount: c, spender: e5.Opt(e5.Vec(e5.Nat8)) }) }), re = e5.Record({ memo: x2, icrc1_memo: e5.Opt(e5.Vec(e5.Nat8)), operation: e5.Opt(ce), created_at_time: p }), b2 = e5.Record({ transaction: re, timestamp: p, parent_hash: e5.Opt(e5.Vec(e5.Nat8)) }), ne = e5.Record({ blocks: e5.Vec(b2) }), F2 = e5.Variant({ BadFirstBlockIndex: e5.Record({ requested_index: i3, first_valid_index: i3 }), Other: e5.Record({ error_message: e5.Text, error_code: e5.Nat64 }) }), ae = e5.Variant({ Ok: ne, Err: F2 }), oe = e5.Func([f2], [ae], ["query"]), se = e5.Record({ callback: oe, start: i3, length: e5.Nat64 }), ie = e5.Record({ certificate: e5.Opt(e5.Vec(e5.Nat8)), blocks: e5.Vec(b2), chain_length: e5.Nat64, first_block_index: i3, archived_blocks: e5.Vec(se) }), de = e5.Record({ callback: e5.Func([f2], [e5.Variant({ Ok: e5.Vec(e5.Vec(e5.Nat8)), Err: F2 })], ["query"]), start: e5.Nat64, length: e5.Nat64 }), ue = e5.Record({ certificate: e5.Opt(e5.Vec(e5.Nat8)), blocks: e5.Vec(e5.Vec(e5.Nat8)), chain_length: e5.Nat64, first_block_index: e5.Nat64, archived_blocks: e5.Vec(de) }), le = e5.Record({ to: _2, fee: c, memo: x2, from_subaccount: e5.Opt(o2), created_at_time: e5.Opt(p), amount: c }), _e = e5.Record({ to: s2, fee: c, memo: x2, from_subaccount: e5.Opt(o2), created_at_time: e5.Opt(p), amount: c }), pe = e5.Variant({ TxTooOld: e5.Record({ allowed_window_nanos: e5.Nat64 }), BadFee: e5.Record({ expected_fee: c }), TxDuplicate: e5.Record({ duplicate_of: i3 }), TxCreatedInFuture: e5.Null, InsufficientFunds: e5.Record({ balance: c }) }), me = e5.Variant({ Ok: i3, Err: pe }), fe = e5.Record({}), Re = e5.Record({ transfer_fee: c });
  return e5.Service({ account_balance: e5.Func([P2], [c], ["query"]), account_balance_dfx: e5.Func([E2], [c], ["query"]), account_identifier: e5.Func([t3], [s2], ["query"]), archives: e5.Func([], [M2], ["query"]), decimals: e5.Func([], [e5.Record({ decimals: e5.Nat32 })], ["query"]), icrc10_supported_standards: e5.Func([], [e5.Vec(e5.Record({ url: e5.Text, name: e5.Text }))], ["query"]), icrc1_balance_of: e5.Func([t3], [r2], ["query"]), icrc1_decimals: e5.Func([], [e5.Nat8], ["query"]), icrc1_fee: e5.Func([], [r2], ["query"]), icrc1_metadata: e5.Func([], [e5.Vec(e5.Tuple(e5.Text, S2))], ["query"]), icrc1_minting_account: e5.Func([], [e5.Opt(t3)], ["query"]), icrc1_name: e5.Func([], [e5.Text], ["query"]), icrc1_supported_standards: e5.Func([], [e5.Vec(e5.Record({ url: e5.Text, name: e5.Text }))], ["query"]), icrc1_symbol: e5.Func([], [e5.Text], ["query"]), icrc1_total_supply: e5.Func([], [r2], ["query"]), icrc1_transfer: e5.Func([G2], [z2], []), icrc21_canister_call_consent_message: e5.Func([J2], [j2], []), icrc2_allowance: e5.Func([W2], [X], ["query"]), icrc2_approve: e5.Func([Z], [D2], []), icrc2_transfer_from: e5.Func([L2], [te], []), is_ledger_ready: e5.Func([], [e5.Bool], ["query"]), name: e5.Func([], [e5.Record({ name: e5.Text })], ["query"]), query_blocks: e5.Func([f2], [ie], ["query"]), query_encoded_blocks: e5.Func([f2], [ue], ["query"]), send_dfx: e5.Func([le], [i3], []), symbol: e5.Func([], [e5.Record({ symbol: e5.Text })], ["query"]), transfer: e5.Func([_e], [me], []), transfer_fee: e5.Func([fe], [Re], ["query"]) });
};
BigInt(1095062083);
BigInt(1347768404);
var A2 = BigInt(1e4);
BigInt(1e8);
var ve = (e5) => ({ e8s: e5 }), Be = ({ to: e5, amount: o2, memo: t3, fee: a, fromSubAccount: n2, createdAt: c }) => ({ to: e5.toUint8Array(), fee: ve(a ?? A2), amount: ve(o2), memo: t3 ?? BigInt(0), created_at_time: c !== void 0 ? [{ timestamp_nanos: c }] : [], from_subaccount: n2 === void 0 ? [] : [_t(n2)] }), qe = ({ fromSubAccount: e5, to: o2, amount: t3, fee: a, icrc1Memo: n2, createdAt: c }) => ({ to: o2, fee: ee(a ?? A2), amount: t3, memo: ee(n2), created_at_time: ee(c), from_subaccount: ee(e5) }), Ce = ({ fee: e5, createdAt: o2, icrc1Memo: t3, fromSubAccount: a, expected_allowance: n2, expires_at: c, amount: _2, ...T2 }) => ({ ...T2, fee: ee(e5 ?? A2), memo: ee(t3), from_subaccount: ee(a), created_at_time: ee(o2), amount: _2, expected_allowance: ee(n2), expires_at: ee(c) }), Pe = ({ userPreferences: { metadata: { utcOffsetMinutes: e5, language: o2 }, deriveSpec: t3 }, ...a }) => ({ ...a, user_preferences: { metadata: { language: o2, utc_offset_minutes: ee(e5) }, device_spec: b$2(t3) ? ee() : ee("GenericDisplay" in t3 ? { GenericDisplay: null } : { LineDisplay: { characters_per_line: t3.LineDisplay.charactersPerLine, lines_per_page: t3.LineDisplay.linesPerPage } }) } });
var O = class extends Error {
}, R = class extends O {
}, m = class extends O {
}, N = class extends O {
}, V = class extends R {
  constructor(t3) {
    super();
    this.balance = t3;
  }
}, h$1 = class h extends R {
  constructor(t3) {
    super();
    this.allowed_window_secs = t3;
  }
}, w3 = class extends R {
}, v$1 = class v extends R {
  constructor(t3) {
    super();
    this.duplicateOf = t3;
  }
}, k = class extends O {
  constructor(t3) {
    super();
    this.expectedFee = t3;
  }
}, B = class extends m {
  constructor(t3, a) {
    super();
    this.message = t3;
    this.error_code = a;
  }
}, ge = class extends m {
}, xe = class extends m {
  constructor(t3) {
    super();
    this.duplicateOf = t3;
  }
}, Oe = class extends m {
  constructor(t3) {
    super();
    this.currentAllowance = t3;
  }
}, Ne = class extends m {
}, Te = class extends m {
}, ye = class extends m {
  constructor(t3) {
    super();
    this.ledgerTime = t3;
  }
}, be = class extends N {
}, Fe = class extends N {
}, Ve = class extends N {
}, Me = (e5) => "TxDuplicate" in e5 ? new v$1(e5.TxDuplicate.duplicate_of) : "InsufficientFunds" in e5 ? new V(e5.InsufficientFunds.balance.e8s) : "TxCreatedInFuture" in e5 ? new w3() : "TxTooOld" in e5 ? new h$1(Number(e5.TxTooOld.allowed_window_nanos)) : "BadFee" in e5 ? new k(e5.BadFee.expected_fee.e8s) : new R(`Unknown error type ${JSON.stringify(e5)}`), Se = (e5) => "Duplicate" in e5 ? new v$1(e5.Duplicate.duplicate_of) : "InsufficientFunds" in e5 ? new V(e5.InsufficientFunds.balance) : "CreatedInFuture" in e5 ? new w3() : "TooOld" in e5 ? new h$1() : "BadFee" in e5 ? new k(e5.BadFee.expected_fee) : new R(`Unknown error type ${JSON.stringify(e5)}`), Ge = (e5) => "GenericError" in e5 ? new B(e5.GenericError.message, e5.GenericError.error_code) : "TemporarilyUnavailable" in e5 ? new ge() : "Duplicate" in e5 ? new xe(e5.Duplicate.duplicate_of) : "BadFee" in e5 ? new k(e5.BadFee.expected_fee) : "AllowanceChanged" in e5 ? new Oe(e5.AllowanceChanged.current_allowance) : "CreatedInFuture" in e5 ? new Ne() : "TooOld" in e5 ? new Te() : "Expired" in e5 ? new ye(e5.Expired.ledger_time) : "InsufficientFunds" in e5 ? new V(e5.InsufficientFunds.balance) : new m(`Unknown error type ${JSON.stringify(e5)}`), Qe = (e5) => "GenericError" in e5 ? new B(e5.GenericError.description, e5.GenericError.error_code) : "InsufficientPayment" in e5 ? new be(e5.InsufficientPayment.description) : "UnsupportedCanisterCall" in e5 ? new Fe(e5.UnsupportedCanisterCall.description) : "ConsentMessageUnavailable" in e5 ? new Ve(e5.ConsentMessageUnavailable.description) : new N(`Unknown error type ${JSON.stringify(e5)}`);
var ze = class e3 extends w$2 {
  constructor() {
    super(...arguments);
    this.accountBalance = async ({ accountIdentifier: t3, certified: a = true }) => {
      let n2 = f(t3);
      return (await (a ? this.certifiedService : this.service).account_balance({ account: n2.toUint8Array() })).e8s;
    };
    this.metadata = (t3) => {
      let { icrc1_metadata: a } = this.caller(t3);
      return a();
    };
    this.transactionFee = async (t3 = { certified: false }) => {
      let { transfer_fee: a } = this.caller(t3), { transfer_fee: { e8s: n2 } } = await a({});
      return n2;
    };
    this.transfer = async (t3) => {
      let a = Be(t3), n2 = await this.certifiedService.transfer(a);
      if ("Err" in n2) throw Me(n2.Err);
      return n2.Ok;
    };
    this.icrc1Transfer = async (t3) => {
      let a = qe(t3), n2 = await this.certifiedService.icrc1_transfer(a);
      if ("Err" in n2) throw Se(n2.Err);
      return n2.Ok;
    };
    this.icrc2Approve = async (t3) => {
      let { icrc2_approve: a } = this.caller({ certified: true }), n2 = await a(Ce(t3));
      if ("Err" in n2) throw Ge(n2.Err);
      return n2.Ok;
    };
    this.icrc21ConsentMessage = async (t3) => {
      let { icrc21_canister_call_consent_message: a } = this.caller({ certified: true }), n2 = await a(Pe(t3));
      if ("Err" in n2) throw Qe(n2.Err);
      return n2.Ok;
    };
  }
  static create(t3 = {}) {
    let a = t3.canisterId ?? r$1, { service: n2, certifiedService: c } = lt({ options: { ...t3, canisterId: a }, idlFactory: we, certifiedIdlFactory: he });
    return new e3(a, n2, c);
  }
};
var J = z((S2) => {
  S2.byteLength = gr;
  S2.toByteArray = Ar;
  S2.fromByteArray = Tr;
  var B2 = [], x2 = [], Er = typeof Uint8Array < "u" ? Uint8Array : Array, M2 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  for (g2 = 0, X = M2.length; g2 < X; ++g2) B2[g2] = M2[g2], x2[M2.charCodeAt(g2)] = g2;
  var g2, X;
  x2[45] = 62;
  x2[95] = 63;
  function z2(i3) {
    var r2 = i3.length;
    if (r2 % 4 > 0) throw new Error("Invalid string. Length must be a multiple of 4");
    var t3 = i3.indexOf("=");
    t3 === -1 && (t3 = r2);
    var e5 = t3 === r2 ? 0 : 4 - t3 % 4;
    return [t3, e5];
  }
  function gr(i3) {
    var r2 = z2(i3), t3 = r2[0], e5 = r2[1];
    return (t3 + e5) * 3 / 4 - e5;
  }
  function Ir(i3, r2, t3) {
    return (r2 + t3) * 3 / 4 - t3;
  }
  function Ar(i3) {
    var r2, t3 = z2(i3), e5 = t3[0], n2 = t3[1], o2 = new Er(Ir(i3, e5, n2)), u2 = 0, f2 = n2 > 0 ? e5 - 4 : e5, h3;
    for (h3 = 0; h3 < f2; h3 += 4) r2 = x2[i3.charCodeAt(h3)] << 18 | x2[i3.charCodeAt(h3 + 1)] << 12 | x2[i3.charCodeAt(h3 + 2)] << 6 | x2[i3.charCodeAt(h3 + 3)], o2[u2++] = r2 >> 16 & 255, o2[u2++] = r2 >> 8 & 255, o2[u2++] = r2 & 255;
    return n2 === 2 && (r2 = x2[i3.charCodeAt(h3)] << 2 | x2[i3.charCodeAt(h3 + 1)] >> 4, o2[u2++] = r2 & 255), n2 === 1 && (r2 = x2[i3.charCodeAt(h3)] << 10 | x2[i3.charCodeAt(h3 + 1)] << 4 | x2[i3.charCodeAt(h3 + 2)] >> 2, o2[u2++] = r2 >> 8 & 255, o2[u2++] = r2 & 255), o2;
  }
  function Fr(i3) {
    return B2[i3 >> 18 & 63] + B2[i3 >> 12 & 63] + B2[i3 >> 6 & 63] + B2[i3 & 63];
  }
  function Ur(i3, r2, t3) {
    for (var e5, n2 = [], o2 = r2; o2 < t3; o2 += 3) e5 = (i3[o2] << 16 & 16711680) + (i3[o2 + 1] << 8 & 65280) + (i3[o2 + 2] & 255), n2.push(Fr(e5));
    return n2.join("");
  }
  function Tr(i3) {
    for (var r2, t3 = i3.length, e5 = t3 % 3, n2 = [], o2 = 16383, u2 = 0, f2 = t3 - e5; u2 < f2; u2 += o2) n2.push(Ur(i3, u2, u2 + o2 > f2 ? f2 : u2 + o2));
    return e5 === 1 ? (r2 = i3[t3 - 1], n2.push(B2[r2 >> 2] + B2[r2 << 4 & 63] + "==")) : e5 === 2 && (r2 = (i3[t3 - 2] << 8) + i3[t3 - 1], n2.push(B2[r2 >> 10] + B2[r2 >> 4 & 63] + B2[r2 << 2 & 63] + "=")), n2.join("");
  }
});
var K = z(($2) => {
  $2.read = function(i3, r2, t3, e5, n2) {
    var o2, u2, f2 = n2 * 8 - e5 - 1, h3 = (1 << f2) - 1, l = h3 >> 1, s2 = -7, p = t3 ? n2 - 1 : 0, A3 = t3 ? -1 : 1, w4 = i3[r2 + p];
    for (p += A3, o2 = w4 & (1 << -s2) - 1, w4 >>= -s2, s2 += f2; s2 > 0; o2 = o2 * 256 + i3[r2 + p], p += A3, s2 -= 8) ;
    for (u2 = o2 & (1 << -s2) - 1, o2 >>= -s2, s2 += e5; s2 > 0; u2 = u2 * 256 + i3[r2 + p], p += A3, s2 -= 8) ;
    if (o2 === 0) o2 = 1 - l;
    else {
      if (o2 === h3) return u2 ? NaN : (w4 ? -1 : 1) * (1 / 0);
      u2 = u2 + Math.pow(2, e5), o2 = o2 - l;
    }
    return (w4 ? -1 : 1) * u2 * Math.pow(2, o2 - e5);
  };
  $2.write = function(i3, r2, t3, e5, n2, o2) {
    var u2, f2, h3, l = o2 * 8 - n2 - 1, s2 = (1 << l) - 1, p = s2 >> 1, A3 = n2 === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0, w4 = e5 ? 0 : o2 - 1, b2 = e5 ? 1 : -1, yr = r2 < 0 || r2 === 0 && 1 / r2 < 0 ? 1 : 0;
    for (r2 = Math.abs(r2), isNaN(r2) || r2 === 1 / 0 ? (f2 = isNaN(r2) ? 1 : 0, u2 = s2) : (u2 = Math.floor(Math.log(r2) / Math.LN2), r2 * (h3 = Math.pow(2, -u2)) < 1 && (u2--, h3 *= 2), u2 + p >= 1 ? r2 += A3 / h3 : r2 += A3 * Math.pow(2, 1 - p), r2 * h3 >= 2 && (u2++, h3 /= 2), u2 + p >= s2 ? (f2 = 0, u2 = s2) : u2 + p >= 1 ? (f2 = (r2 * h3 - 1) * Math.pow(2, n2), u2 = u2 + p) : (f2 = r2 * Math.pow(2, p - 1) * Math.pow(2, n2), u2 = 0)); n2 >= 8; i3[t3 + w4] = f2 & 255, w4 += b2, f2 /= 256, n2 -= 8) ;
    for (u2 = u2 << n2 | f2, l += n2; l > 0; i3[t3 + w4] = u2 & 255, w4 += b2, u2 /= 256, l -= 8) ;
    i3[t3 + w4 - b2] |= yr * 128;
  };
});
var ar = z((R2) => {
  var D2 = J(), U2 = K(), Z = typeof Symbol == "function" && typeof Symbol.for == "function" ? Symbol.for("nodejs.util.inspect.custom") : null;
  R2.Buffer = c;
  R2.SlowBuffer = br;
  R2.INSPECT_MAX_BYTES = 50;
  var _2 = 2147483647;
  R2.kMaxLength = _2;
  c.TYPED_ARRAY_SUPPORT = Rr();
  !c.TYPED_ARRAY_SUPPORT && typeof console < "u" && typeof console.error == "function" && console.error("This browser lacks typed array (Uint8Array) support which is required by `buffer` v5.x. Use `buffer` v4.x if you require old browser support.");
  function Rr() {
    try {
      let i3 = new Uint8Array(1), r2 = { foo: function() {
        return 42;
      } };
      return Object.setPrototypeOf(r2, Uint8Array.prototype), Object.setPrototypeOf(i3, r2), i3.foo() === 42;
    } catch {
      return false;
    }
  }
  Object.defineProperty(c.prototype, "parent", { enumerable: true, get: function() {
    if (c.isBuffer(this)) return this.buffer;
  } });
  Object.defineProperty(c.prototype, "offset", { enumerable: true, get: function() {
    if (c.isBuffer(this)) return this.byteOffset;
  } });
  function m2(i3) {
    if (i3 > _2) throw new RangeError('The value "' + i3 + '" is invalid for option "size"');
    let r2 = new Uint8Array(i3);
    return Object.setPrototypeOf(r2, c.prototype), r2;
  }
  function c(i3, r2, t3) {
    if (typeof i3 == "number") {
      if (typeof r2 == "string") throw new TypeError('The "string" argument must be of type string. Received type number');
      return G2(i3);
    }
    return tr(i3, r2, t3);
  }
  c.poolSize = 8192;
  function tr(i3, r2, t3) {
    if (typeof i3 == "string") return Sr(i3, r2);
    if (ArrayBuffer.isView(i3)) return _r(i3);
    if (i3 == null) throw new TypeError("The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " + typeof i3);
    if (d2(i3, ArrayBuffer) || i3 && d2(i3.buffer, ArrayBuffer) || typeof SharedArrayBuffer < "u" && (d2(i3, SharedArrayBuffer) || i3 && d2(i3.buffer, SharedArrayBuffer))) return O2(i3, r2, t3);
    if (typeof i3 == "number") throw new TypeError('The "value" argument must not be of type number. Received type number');
    let e5 = i3.valueOf && i3.valueOf();
    if (e5 != null && e5 !== i3) return c.from(e5, r2, t3);
    let n2 = kr(i3);
    if (n2) return n2;
    if (typeof Symbol < "u" && Symbol.toPrimitive != null && typeof i3[Symbol.toPrimitive] == "function") return c.from(i3[Symbol.toPrimitive]("string"), r2, t3);
    throw new TypeError("The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " + typeof i3);
  }
  c.from = function(i3, r2, t3) {
    return tr(i3, r2, t3);
  };
  Object.setPrototypeOf(c.prototype, Uint8Array.prototype);
  Object.setPrototypeOf(c, Uint8Array);
  function ir(i3) {
    if (typeof i3 != "number") throw new TypeError('"size" argument must be of type number');
    if (i3 < 0) throw new RangeError('The value "' + i3 + '" is invalid for option "size"');
  }
  function Cr(i3, r2, t3) {
    return ir(i3), i3 <= 0 ? m2(i3) : r2 !== void 0 ? typeof t3 == "string" ? m2(i3).fill(r2, t3) : m2(i3).fill(r2) : m2(i3);
  }
  c.alloc = function(i3, r2, t3) {
    return Cr(i3, r2, t3);
  };
  function G2(i3) {
    return ir(i3), m2(i3 < 0 ? 0 : H2(i3) | 0);
  }
  c.allocUnsafe = function(i3) {
    return G2(i3);
  };
  c.allocUnsafeSlow = function(i3) {
    return G2(i3);
  };
  function Sr(i3, r2) {
    if ((typeof r2 != "string" || r2 === "") && (r2 = "utf8"), !c.isEncoding(r2)) throw new TypeError("Unknown encoding: " + r2);
    let t3 = er(i3, r2) | 0, e5 = m2(t3), n2 = e5.write(i3, r2);
    return n2 !== t3 && (e5 = e5.slice(0, n2)), e5;
  }
  function P2(i3) {
    let r2 = i3.length < 0 ? 0 : H2(i3.length) | 0, t3 = m2(r2);
    for (let e5 = 0; e5 < r2; e5 += 1) t3[e5] = i3[e5] & 255;
    return t3;
  }
  function _r(i3) {
    if (d2(i3, Uint8Array)) {
      let r2 = new Uint8Array(i3);
      return O2(r2.buffer, r2.byteOffset, r2.byteLength);
    }
    return P2(i3);
  }
  function O2(i3, r2, t3) {
    if (r2 < 0 || i3.byteLength < r2) throw new RangeError('"offset" is outside of buffer bounds');
    if (i3.byteLength < r2 + (t3 || 0)) throw new RangeError('"length" is outside of buffer bounds');
    let e5;
    return r2 === void 0 && t3 === void 0 ? e5 = new Uint8Array(i3) : t3 === void 0 ? e5 = new Uint8Array(i3, r2) : e5 = new Uint8Array(i3, r2, t3), Object.setPrototypeOf(e5, c.prototype), e5;
  }
  function kr(i3) {
    if (c.isBuffer(i3)) {
      let r2 = H2(i3.length) | 0, t3 = m2(r2);
      return t3.length === 0 || i3.copy(t3, 0, 0, r2), t3;
    }
    if (i3.length !== void 0) return typeof i3.length != "number" || W2(i3.length) ? m2(0) : P2(i3);
    if (i3.type === "Buffer" && Array.isArray(i3.data)) return P2(i3.data);
  }
  function H2(i3) {
    if (i3 >= _2) throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x" + _2.toString(16) + " bytes");
    return i3 | 0;
  }
  function br(i3) {
    return +i3 != i3 && (i3 = 0), c.alloc(+i3);
  }
  c.isBuffer = function(r2) {
    return r2 != null && r2._isBuffer === true && r2 !== c.prototype;
  };
  c.compare = function(r2, t3) {
    if (d2(r2, Uint8Array) && (r2 = c.from(r2, r2.offset, r2.byteLength)), d2(t3, Uint8Array) && (t3 = c.from(t3, t3.offset, t3.byteLength)), !c.isBuffer(r2) || !c.isBuffer(t3)) throw new TypeError('The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array');
    if (r2 === t3) return 0;
    let e5 = r2.length, n2 = t3.length;
    for (let o2 = 0, u2 = Math.min(e5, n2); o2 < u2; ++o2) if (r2[o2] !== t3[o2]) {
      e5 = r2[o2], n2 = t3[o2];
      break;
    }
    return e5 < n2 ? -1 : n2 < e5 ? 1 : 0;
  };
  c.isEncoding = function(r2) {
    switch (String(r2).toLowerCase()) {
      case "hex":
      case "utf8":
      case "utf-8":
      case "ascii":
      case "latin1":
      case "binary":
      case "base64":
      case "ucs2":
      case "ucs-2":
      case "utf16le":
      case "utf-16le":
        return true;
      default:
        return false;
    }
  };
  c.concat = function(r2, t3) {
    if (!Array.isArray(r2)) throw new TypeError('"list" argument must be an Array of Buffers');
    if (r2.length === 0) return c.alloc(0);
    let e5;
    if (t3 === void 0) for (t3 = 0, e5 = 0; e5 < r2.length; ++e5) t3 += r2[e5].length;
    let n2 = c.allocUnsafe(t3), o2 = 0;
    for (e5 = 0; e5 < r2.length; ++e5) {
      let u2 = r2[e5];
      if (d2(u2, Uint8Array)) o2 + u2.length > n2.length ? (c.isBuffer(u2) || (u2 = c.from(u2)), u2.copy(n2, o2)) : Uint8Array.prototype.set.call(n2, u2, o2);
      else if (c.isBuffer(u2)) u2.copy(n2, o2);
      else throw new TypeError('"list" argument must be an Array of Buffers');
      o2 += u2.length;
    }
    return n2;
  };
  function er(i3, r2) {
    if (c.isBuffer(i3)) return i3.length;
    if (ArrayBuffer.isView(i3) || d2(i3, ArrayBuffer)) return i3.byteLength;
    if (typeof i3 != "string") throw new TypeError('The "string" argument must be one of type string, Buffer, or ArrayBuffer. Received type ' + typeof i3);
    let t3 = i3.length, e5 = arguments.length > 2 && arguments[2] === true;
    if (!e5 && t3 === 0) return 0;
    let n2 = false;
    for (; ; ) switch (r2) {
      case "ascii":
      case "latin1":
      case "binary":
        return t3;
      case "utf8":
      case "utf-8":
        return q(i3).length;
      case "ucs2":
      case "ucs-2":
      case "utf16le":
      case "utf-16le":
        return t3 * 2;
      case "hex":
        return t3 >>> 1;
      case "base64":
        return lr(i3).length;
      default:
        if (n2) return e5 ? -1 : q(i3).length;
        r2 = ("" + r2).toLowerCase(), n2 = true;
    }
  }
  c.byteLength = er;
  function Lr(i3, r2, t3) {
    let e5 = false;
    if ((r2 === void 0 || r2 < 0) && (r2 = 0), r2 > this.length || ((t3 === void 0 || t3 > this.length) && (t3 = this.length), t3 <= 0) || (t3 >>>= 0, r2 >>>= 0, t3 <= r2)) return "";
    for (i3 || (i3 = "utf8"); ; ) switch (i3) {
      case "hex":
        return Yr(this, r2, t3);
      case "utf8":
      case "utf-8":
        return or(this, r2, t3);
      case "ascii":
        return Gr(this, r2, t3);
      case "latin1":
      case "binary":
        return Hr(this, r2, t3);
      case "base64":
        return Or(this, r2, t3);
      case "ucs2":
      case "ucs-2":
      case "utf16le":
      case "utf-16le":
        return Wr(this, r2, t3);
      default:
        if (e5) throw new TypeError("Unknown encoding: " + i3);
        i3 = (i3 + "").toLowerCase(), e5 = true;
    }
  }
  c.prototype._isBuffer = true;
  function I2(i3, r2, t3) {
    let e5 = i3[r2];
    i3[r2] = i3[t3], i3[t3] = e5;
  }
  c.prototype.swap16 = function() {
    let r2 = this.length;
    if (r2 % 2 !== 0) throw new RangeError("Buffer size must be a multiple of 16-bits");
    for (let t3 = 0; t3 < r2; t3 += 2) I2(this, t3, t3 + 1);
    return this;
  };
  c.prototype.swap32 = function() {
    let r2 = this.length;
    if (r2 % 4 !== 0) throw new RangeError("Buffer size must be a multiple of 32-bits");
    for (let t3 = 0; t3 < r2; t3 += 4) I2(this, t3, t3 + 3), I2(this, t3 + 1, t3 + 2);
    return this;
  };
  c.prototype.swap64 = function() {
    let r2 = this.length;
    if (r2 % 8 !== 0) throw new RangeError("Buffer size must be a multiple of 64-bits");
    for (let t3 = 0; t3 < r2; t3 += 8) I2(this, t3, t3 + 7), I2(this, t3 + 1, t3 + 6), I2(this, t3 + 2, t3 + 5), I2(this, t3 + 3, t3 + 4);
    return this;
  };
  c.prototype.toString = function() {
    let r2 = this.length;
    return r2 === 0 ? "" : arguments.length === 0 ? or(this, 0, r2) : Lr.apply(this, arguments);
  };
  c.prototype.toLocaleString = c.prototype.toString;
  c.prototype.equals = function(r2) {
    if (!c.isBuffer(r2)) throw new TypeError("Argument must be a Buffer");
    return this === r2 ? true : c.compare(this, r2) === 0;
  };
  c.prototype.inspect = function() {
    let r2 = "", t3 = R2.INSPECT_MAX_BYTES;
    return r2 = this.toString("hex", 0, t3).replace(/(.{2})/g, "$1 ").trim(), this.length > t3 && (r2 += " ... "), "<Buffer " + r2 + ">";
  };
  Z && (c.prototype[Z] = c.prototype.inspect);
  c.prototype.compare = function(r2, t3, e5, n2, o2) {
    if (d2(r2, Uint8Array) && (r2 = c.from(r2, r2.offset, r2.byteLength)), !c.isBuffer(r2)) throw new TypeError('The "target" argument must be one of type Buffer or Uint8Array. Received type ' + typeof r2);
    if (t3 === void 0 && (t3 = 0), e5 === void 0 && (e5 = r2 ? r2.length : 0), n2 === void 0 && (n2 = 0), o2 === void 0 && (o2 = this.length), t3 < 0 || e5 > r2.length || n2 < 0 || o2 > this.length) throw new RangeError("out of range index");
    if (n2 >= o2 && t3 >= e5) return 0;
    if (n2 >= o2) return -1;
    if (t3 >= e5) return 1;
    if (t3 >>>= 0, e5 >>>= 0, n2 >>>= 0, o2 >>>= 0, this === r2) return 0;
    let u2 = o2 - n2, f2 = e5 - t3, h3 = Math.min(u2, f2), l = this.slice(n2, o2), s2 = r2.slice(t3, e5);
    for (let p = 0; p < h3; ++p) if (l[p] !== s2[p]) {
      u2 = l[p], f2 = s2[p];
      break;
    }
    return u2 < f2 ? -1 : f2 < u2 ? 1 : 0;
  };
  function nr(i3, r2, t3, e5, n2) {
    if (i3.length === 0) return -1;
    if (typeof t3 == "string" ? (e5 = t3, t3 = 0) : t3 > 2147483647 ? t3 = 2147483647 : t3 < -2147483648 && (t3 = -2147483648), t3 = +t3, W2(t3) && (t3 = n2 ? 0 : i3.length - 1), t3 < 0 && (t3 = i3.length + t3), t3 >= i3.length) {
      if (n2) return -1;
      t3 = i3.length - 1;
    } else if (t3 < 0) if (n2) t3 = 0;
    else return -1;
    if (typeof r2 == "string" && (r2 = c.from(r2, e5)), c.isBuffer(r2)) return r2.length === 0 ? -1 : Q(i3, r2, t3, e5, n2);
    if (typeof r2 == "number") return r2 = r2 & 255, typeof Uint8Array.prototype.indexOf == "function" ? n2 ? Uint8Array.prototype.indexOf.call(i3, r2, t3) : Uint8Array.prototype.lastIndexOf.call(i3, r2, t3) : Q(i3, [r2], t3, e5, n2);
    throw new TypeError("val must be string, number or Buffer");
  }
  function Q(i3, r2, t3, e5, n2) {
    let o2 = 1, u2 = i3.length, f2 = r2.length;
    if (e5 !== void 0 && (e5 = String(e5).toLowerCase(), e5 === "ucs2" || e5 === "ucs-2" || e5 === "utf16le" || e5 === "utf-16le")) {
      if (i3.length < 2 || r2.length < 2) return -1;
      o2 = 2, u2 /= 2, f2 /= 2, t3 /= 2;
    }
    function h3(s2, p) {
      return o2 === 1 ? s2[p] : s2.readUInt16BE(p * o2);
    }
    let l;
    if (n2) {
      let s2 = -1;
      for (l = t3; l < u2; l++) if (h3(i3, l) === h3(r2, s2 === -1 ? 0 : l - s2)) {
        if (s2 === -1 && (s2 = l), l - s2 + 1 === f2) return s2 * o2;
      } else s2 !== -1 && (l -= l - s2), s2 = -1;
    } else for (t3 + f2 > u2 && (t3 = u2 - f2), l = t3; l >= 0; l--) {
      let s2 = true;
      for (let p = 0; p < f2; p++) if (h3(i3, l + p) !== h3(r2, p)) {
        s2 = false;
        break;
      }
      if (s2) return l;
    }
    return -1;
  }
  c.prototype.includes = function(r2, t3, e5) {
    return this.indexOf(r2, t3, e5) !== -1;
  };
  c.prototype.indexOf = function(r2, t3, e5) {
    return nr(this, r2, t3, e5, true);
  };
  c.prototype.lastIndexOf = function(r2, t3, e5) {
    return nr(this, r2, t3, e5, false);
  };
  function Nr(i3, r2, t3, e5) {
    t3 = Number(t3) || 0;
    let n2 = i3.length - t3;
    e5 ? (e5 = Number(e5), e5 > n2 && (e5 = n2)) : e5 = n2;
    let o2 = r2.length;
    e5 > o2 / 2 && (e5 = o2 / 2);
    let u2;
    for (u2 = 0; u2 < e5; ++u2) {
      let f2 = parseInt(r2.substr(u2 * 2, 2), 16);
      if (W2(f2)) return u2;
      i3[t3 + u2] = f2;
    }
    return u2;
  }
  function Mr(i3, r2, t3, e5) {
    return k2(q(r2, i3.length - t3), i3, t3, e5);
  }
  function $r(i3, r2, t3, e5) {
    return k2(zr(r2), i3, t3, e5);
  }
  function Dr(i3, r2, t3, e5) {
    return k2(lr(r2), i3, t3, e5);
  }
  function Pr(i3, r2, t3, e5) {
    return k2(Jr(r2, i3.length - t3), i3, t3, e5);
  }
  c.prototype.write = function(r2, t3, e5, n2) {
    if (t3 === void 0) n2 = "utf8", e5 = this.length, t3 = 0;
    else if (e5 === void 0 && typeof t3 == "string") n2 = t3, e5 = this.length, t3 = 0;
    else if (isFinite(t3)) t3 = t3 >>> 0, isFinite(e5) ? (e5 = e5 >>> 0, n2 === void 0 && (n2 = "utf8")) : (n2 = e5, e5 = void 0);
    else throw new Error("Buffer.write(string, encoding, offset[, length]) is no longer supported");
    let o2 = this.length - t3;
    if ((e5 === void 0 || e5 > o2) && (e5 = o2), r2.length > 0 && (e5 < 0 || t3 < 0) || t3 > this.length) throw new RangeError("Attempt to write outside buffer bounds");
    n2 || (n2 = "utf8");
    let u2 = false;
    for (; ; ) switch (n2) {
      case "hex":
        return Nr(this, r2, t3, e5);
      case "utf8":
      case "utf-8":
        return Mr(this, r2, t3, e5);
      case "ascii":
      case "latin1":
      case "binary":
        return $r(this, r2, t3, e5);
      case "base64":
        return Dr(this, r2, t3, e5);
      case "ucs2":
      case "ucs-2":
      case "utf16le":
      case "utf-16le":
        return Pr(this, r2, t3, e5);
      default:
        if (u2) throw new TypeError("Unknown encoding: " + n2);
        n2 = ("" + n2).toLowerCase(), u2 = true;
    }
  };
  c.prototype.toJSON = function() {
    return { type: "Buffer", data: Array.prototype.slice.call(this._arr || this, 0) };
  };
  function Or(i3, r2, t3) {
    return r2 === 0 && t3 === i3.length ? D2.fromByteArray(i3) : D2.fromByteArray(i3.slice(r2, t3));
  }
  function or(i3, r2, t3) {
    t3 = Math.min(i3.length, t3);
    let e5 = [], n2 = r2;
    for (; n2 < t3; ) {
      let o2 = i3[n2], u2 = null, f2 = o2 > 239 ? 4 : o2 > 223 ? 3 : o2 > 191 ? 2 : 1;
      if (n2 + f2 <= t3) {
        let h3, l, s2, p;
        switch (f2) {
          case 1:
            o2 < 128 && (u2 = o2);
            break;
          case 2:
            h3 = i3[n2 + 1], (h3 & 192) === 128 && (p = (o2 & 31) << 6 | h3 & 63, p > 127 && (u2 = p));
            break;
          case 3:
            h3 = i3[n2 + 1], l = i3[n2 + 2], (h3 & 192) === 128 && (l & 192) === 128 && (p = (o2 & 15) << 12 | (h3 & 63) << 6 | l & 63, p > 2047 && (p < 55296 || p > 57343) && (u2 = p));
            break;
          case 4:
            h3 = i3[n2 + 1], l = i3[n2 + 2], s2 = i3[n2 + 3], (h3 & 192) === 128 && (l & 192) === 128 && (s2 & 192) === 128 && (p = (o2 & 15) << 18 | (h3 & 63) << 12 | (l & 63) << 6 | s2 & 63, p > 65535 && p < 1114112 && (u2 = p));
        }
      }
      u2 === null ? (u2 = 65533, f2 = 1) : u2 > 65535 && (u2 -= 65536, e5.push(u2 >>> 10 & 1023 | 55296), u2 = 56320 | u2 & 1023), e5.push(u2), n2 += f2;
    }
    return qr(e5);
  }
  var v3 = 4096;
  function qr(i3) {
    let r2 = i3.length;
    if (r2 <= v3) return String.fromCharCode.apply(String, i3);
    let t3 = "", e5 = 0;
    for (; e5 < r2; ) t3 += String.fromCharCode.apply(String, i3.slice(e5, e5 += v3));
    return t3;
  }
  function Gr(i3, r2, t3) {
    let e5 = "";
    t3 = Math.min(i3.length, t3);
    for (let n2 = r2; n2 < t3; ++n2) e5 += String.fromCharCode(i3[n2] & 127);
    return e5;
  }
  function Hr(i3, r2, t3) {
    let e5 = "";
    t3 = Math.min(i3.length, t3);
    for (let n2 = r2; n2 < t3; ++n2) e5 += String.fromCharCode(i3[n2]);
    return e5;
  }
  function Yr(i3, r2, t3) {
    let e5 = i3.length;
    (!r2 || r2 < 0) && (r2 = 0), (!t3 || t3 < 0 || t3 > e5) && (t3 = e5);
    let n2 = "";
    for (let o2 = r2; o2 < t3; ++o2) n2 += Kr[i3[o2]];
    return n2;
  }
  function Wr(i3, r2, t3) {
    let e5 = i3.slice(r2, t3), n2 = "";
    for (let o2 = 0; o2 < e5.length - 1; o2 += 2) n2 += String.fromCharCode(e5[o2] + e5[o2 + 1] * 256);
    return n2;
  }
  c.prototype.slice = function(r2, t3) {
    let e5 = this.length;
    r2 = ~~r2, t3 = t3 === void 0 ? e5 : ~~t3, r2 < 0 ? (r2 += e5, r2 < 0 && (r2 = 0)) : r2 > e5 && (r2 = e5), t3 < 0 ? (t3 += e5, t3 < 0 && (t3 = 0)) : t3 > e5 && (t3 = e5), t3 < r2 && (t3 = r2);
    let n2 = this.subarray(r2, t3);
    return Object.setPrototypeOf(n2, c.prototype), n2;
  };
  function a(i3, r2, t3) {
    if (i3 % 1 !== 0 || i3 < 0) throw new RangeError("offset is not uint");
    if (i3 + r2 > t3) throw new RangeError("Trying to access beyond buffer length");
  }
  c.prototype.readUintLE = c.prototype.readUIntLE = function(r2, t3, e5) {
    r2 = r2 >>> 0, t3 = t3 >>> 0, e5 || a(r2, t3, this.length);
    let n2 = this[r2], o2 = 1, u2 = 0;
    for (; ++u2 < t3 && (o2 *= 256); ) n2 += this[r2 + u2] * o2;
    return n2;
  };
  c.prototype.readUintBE = c.prototype.readUIntBE = function(r2, t3, e5) {
    r2 = r2 >>> 0, t3 = t3 >>> 0, e5 || a(r2, t3, this.length);
    let n2 = this[r2 + --t3], o2 = 1;
    for (; t3 > 0 && (o2 *= 256); ) n2 += this[r2 + --t3] * o2;
    return n2;
  };
  c.prototype.readUint8 = c.prototype.readUInt8 = function(r2, t3) {
    return r2 = r2 >>> 0, t3 || a(r2, 1, this.length), this[r2];
  };
  c.prototype.readUint16LE = c.prototype.readUInt16LE = function(r2, t3) {
    return r2 = r2 >>> 0, t3 || a(r2, 2, this.length), this[r2] | this[r2 + 1] << 8;
  };
  c.prototype.readUint16BE = c.prototype.readUInt16BE = function(r2, t3) {
    return r2 = r2 >>> 0, t3 || a(r2, 2, this.length), this[r2] << 8 | this[r2 + 1];
  };
  c.prototype.readUint32LE = c.prototype.readUInt32LE = function(r2, t3) {
    return r2 = r2 >>> 0, t3 || a(r2, 4, this.length), (this[r2] | this[r2 + 1] << 8 | this[r2 + 2] << 16) + this[r2 + 3] * 16777216;
  };
  c.prototype.readUint32BE = c.prototype.readUInt32BE = function(r2, t3) {
    return r2 = r2 >>> 0, t3 || a(r2, 4, this.length), this[r2] * 16777216 + (this[r2 + 1] << 16 | this[r2 + 2] << 8 | this[r2 + 3]);
  };
  c.prototype.readBigUInt64LE = E2(function(r2) {
    r2 = r2 >>> 0, T2(r2, "offset");
    let t3 = this[r2], e5 = this[r2 + 7];
    (t3 === void 0 || e5 === void 0) && C2(r2, this.length - 8);
    let n2 = t3 + this[++r2] * 2 ** 8 + this[++r2] * 2 ** 16 + this[++r2] * 2 ** 24, o2 = this[++r2] + this[++r2] * 2 ** 8 + this[++r2] * 2 ** 16 + e5 * 2 ** 24;
    return BigInt(n2) + (BigInt(o2) << BigInt(32));
  });
  c.prototype.readBigUInt64BE = E2(function(r2) {
    r2 = r2 >>> 0, T2(r2, "offset");
    let t3 = this[r2], e5 = this[r2 + 7];
    (t3 === void 0 || e5 === void 0) && C2(r2, this.length - 8);
    let n2 = t3 * 2 ** 24 + this[++r2] * 2 ** 16 + this[++r2] * 2 ** 8 + this[++r2], o2 = this[++r2] * 2 ** 24 + this[++r2] * 2 ** 16 + this[++r2] * 2 ** 8 + e5;
    return (BigInt(n2) << BigInt(32)) + BigInt(o2);
  });
  c.prototype.readIntLE = function(r2, t3, e5) {
    r2 = r2 >>> 0, t3 = t3 >>> 0, e5 || a(r2, t3, this.length);
    let n2 = this[r2], o2 = 1, u2 = 0;
    for (; ++u2 < t3 && (o2 *= 256); ) n2 += this[r2 + u2] * o2;
    return o2 *= 128, n2 >= o2 && (n2 -= Math.pow(2, 8 * t3)), n2;
  };
  c.prototype.readIntBE = function(r2, t3, e5) {
    r2 = r2 >>> 0, t3 = t3 >>> 0, e5 || a(r2, t3, this.length);
    let n2 = t3, o2 = 1, u2 = this[r2 + --n2];
    for (; n2 > 0 && (o2 *= 256); ) u2 += this[r2 + --n2] * o2;
    return o2 *= 128, u2 >= o2 && (u2 -= Math.pow(2, 8 * t3)), u2;
  };
  c.prototype.readInt8 = function(r2, t3) {
    return r2 = r2 >>> 0, t3 || a(r2, 1, this.length), this[r2] & 128 ? (255 - this[r2] + 1) * -1 : this[r2];
  };
  c.prototype.readInt16LE = function(r2, t3) {
    r2 = r2 >>> 0, t3 || a(r2, 2, this.length);
    let e5 = this[r2] | this[r2 + 1] << 8;
    return e5 & 32768 ? e5 | 4294901760 : e5;
  };
  c.prototype.readInt16BE = function(r2, t3) {
    r2 = r2 >>> 0, t3 || a(r2, 2, this.length);
    let e5 = this[r2 + 1] | this[r2] << 8;
    return e5 & 32768 ? e5 | 4294901760 : e5;
  };
  c.prototype.readInt32LE = function(r2, t3) {
    return r2 = r2 >>> 0, t3 || a(r2, 4, this.length), this[r2] | this[r2 + 1] << 8 | this[r2 + 2] << 16 | this[r2 + 3] << 24;
  };
  c.prototype.readInt32BE = function(r2, t3) {
    return r2 = r2 >>> 0, t3 || a(r2, 4, this.length), this[r2] << 24 | this[r2 + 1] << 16 | this[r2 + 2] << 8 | this[r2 + 3];
  };
  c.prototype.readBigInt64LE = E2(function(r2) {
    r2 = r2 >>> 0, T2(r2, "offset");
    let t3 = this[r2], e5 = this[r2 + 7];
    (t3 === void 0 || e5 === void 0) && C2(r2, this.length - 8);
    let n2 = this[r2 + 4] + this[r2 + 5] * 2 ** 8 + this[r2 + 6] * 2 ** 16 + (e5 << 24);
    return (BigInt(n2) << BigInt(32)) + BigInt(t3 + this[++r2] * 2 ** 8 + this[++r2] * 2 ** 16 + this[++r2] * 2 ** 24);
  });
  c.prototype.readBigInt64BE = E2(function(r2) {
    r2 = r2 >>> 0, T2(r2, "offset");
    let t3 = this[r2], e5 = this[r2 + 7];
    (t3 === void 0 || e5 === void 0) && C2(r2, this.length - 8);
    let n2 = (t3 << 24) + this[++r2] * 2 ** 16 + this[++r2] * 2 ** 8 + this[++r2];
    return (BigInt(n2) << BigInt(32)) + BigInt(this[++r2] * 2 ** 24 + this[++r2] * 2 ** 16 + this[++r2] * 2 ** 8 + e5);
  });
  c.prototype.readFloatLE = function(r2, t3) {
    return r2 = r2 >>> 0, t3 || a(r2, 4, this.length), U2.read(this, r2, true, 23, 4);
  };
  c.prototype.readFloatBE = function(r2, t3) {
    return r2 = r2 >>> 0, t3 || a(r2, 4, this.length), U2.read(this, r2, false, 23, 4);
  };
  c.prototype.readDoubleLE = function(r2, t3) {
    return r2 = r2 >>> 0, t3 || a(r2, 8, this.length), U2.read(this, r2, true, 52, 8);
  };
  c.prototype.readDoubleBE = function(r2, t3) {
    return r2 = r2 >>> 0, t3 || a(r2, 8, this.length), U2.read(this, r2, false, 52, 8);
  };
  function y(i3, r2, t3, e5, n2, o2) {
    if (!c.isBuffer(i3)) throw new TypeError('"buffer" argument must be a Buffer instance');
    if (r2 > n2 || r2 < o2) throw new RangeError('"value" argument is out of bounds');
    if (t3 + e5 > i3.length) throw new RangeError("Index out of range");
  }
  c.prototype.writeUintLE = c.prototype.writeUIntLE = function(r2, t3, e5, n2) {
    if (r2 = +r2, t3 = t3 >>> 0, e5 = e5 >>> 0, !n2) {
      let f2 = Math.pow(2, 8 * e5) - 1;
      y(this, r2, t3, e5, f2, 0);
    }
    let o2 = 1, u2 = 0;
    for (this[t3] = r2 & 255; ++u2 < e5 && (o2 *= 256); ) this[t3 + u2] = r2 / o2 & 255;
    return t3 + e5;
  };
  c.prototype.writeUintBE = c.prototype.writeUIntBE = function(r2, t3, e5, n2) {
    if (r2 = +r2, t3 = t3 >>> 0, e5 = e5 >>> 0, !n2) {
      let f2 = Math.pow(2, 8 * e5) - 1;
      y(this, r2, t3, e5, f2, 0);
    }
    let o2 = e5 - 1, u2 = 1;
    for (this[t3 + o2] = r2 & 255; --o2 >= 0 && (u2 *= 256); ) this[t3 + o2] = r2 / u2 & 255;
    return t3 + e5;
  };
  c.prototype.writeUint8 = c.prototype.writeUInt8 = function(r2, t3, e5) {
    return r2 = +r2, t3 = t3 >>> 0, e5 || y(this, r2, t3, 1, 255, 0), this[t3] = r2 & 255, t3 + 1;
  };
  c.prototype.writeUint16LE = c.prototype.writeUInt16LE = function(r2, t3, e5) {
    return r2 = +r2, t3 = t3 >>> 0, e5 || y(this, r2, t3, 2, 65535, 0), this[t3] = r2 & 255, this[t3 + 1] = r2 >>> 8, t3 + 2;
  };
  c.prototype.writeUint16BE = c.prototype.writeUInt16BE = function(r2, t3, e5) {
    return r2 = +r2, t3 = t3 >>> 0, e5 || y(this, r2, t3, 2, 65535, 0), this[t3] = r2 >>> 8, this[t3 + 1] = r2 & 255, t3 + 2;
  };
  c.prototype.writeUint32LE = c.prototype.writeUInt32LE = function(r2, t3, e5) {
    return r2 = +r2, t3 = t3 >>> 0, e5 || y(this, r2, t3, 4, 4294967295, 0), this[t3 + 3] = r2 >>> 24, this[t3 + 2] = r2 >>> 16, this[t3 + 1] = r2 >>> 8, this[t3] = r2 & 255, t3 + 4;
  };
  c.prototype.writeUint32BE = c.prototype.writeUInt32BE = function(r2, t3, e5) {
    return r2 = +r2, t3 = t3 >>> 0, e5 || y(this, r2, t3, 4, 4294967295, 0), this[t3] = r2 >>> 24, this[t3 + 1] = r2 >>> 16, this[t3 + 2] = r2 >>> 8, this[t3 + 3] = r2 & 255, t3 + 4;
  };
  function ur(i3, r2, t3, e5, n2) {
    sr(r2, e5, n2, i3, t3, 7);
    let o2 = Number(r2 & BigInt(4294967295));
    i3[t3++] = o2, o2 = o2 >> 8, i3[t3++] = o2, o2 = o2 >> 8, i3[t3++] = o2, o2 = o2 >> 8, i3[t3++] = o2;
    let u2 = Number(r2 >> BigInt(32) & BigInt(4294967295));
    return i3[t3++] = u2, u2 = u2 >> 8, i3[t3++] = u2, u2 = u2 >> 8, i3[t3++] = u2, u2 = u2 >> 8, i3[t3++] = u2, t3;
  }
  function cr(i3, r2, t3, e5, n2) {
    sr(r2, e5, n2, i3, t3, 7);
    let o2 = Number(r2 & BigInt(4294967295));
    i3[t3 + 7] = o2, o2 = o2 >> 8, i3[t3 + 6] = o2, o2 = o2 >> 8, i3[t3 + 5] = o2, o2 = o2 >> 8, i3[t3 + 4] = o2;
    let u2 = Number(r2 >> BigInt(32) & BigInt(4294967295));
    return i3[t3 + 3] = u2, u2 = u2 >> 8, i3[t3 + 2] = u2, u2 = u2 >> 8, i3[t3 + 1] = u2, u2 = u2 >> 8, i3[t3] = u2, t3 + 8;
  }
  c.prototype.writeBigUInt64LE = E2(function(r2, t3 = 0) {
    return ur(this, r2, t3, BigInt(0), BigInt("0xffffffffffffffff"));
  });
  c.prototype.writeBigUInt64BE = E2(function(r2, t3 = 0) {
    return cr(this, r2, t3, BigInt(0), BigInt("0xffffffffffffffff"));
  });
  c.prototype.writeIntLE = function(r2, t3, e5, n2) {
    if (r2 = +r2, t3 = t3 >>> 0, !n2) {
      let h3 = Math.pow(2, 8 * e5 - 1);
      y(this, r2, t3, e5, h3 - 1, -h3);
    }
    let o2 = 0, u2 = 1, f2 = 0;
    for (this[t3] = r2 & 255; ++o2 < e5 && (u2 *= 256); ) r2 < 0 && f2 === 0 && this[t3 + o2 - 1] !== 0 && (f2 = 1), this[t3 + o2] = (r2 / u2 >> 0) - f2 & 255;
    return t3 + e5;
  };
  c.prototype.writeIntBE = function(r2, t3, e5, n2) {
    if (r2 = +r2, t3 = t3 >>> 0, !n2) {
      let h3 = Math.pow(2, 8 * e5 - 1);
      y(this, r2, t3, e5, h3 - 1, -h3);
    }
    let o2 = e5 - 1, u2 = 1, f2 = 0;
    for (this[t3 + o2] = r2 & 255; --o2 >= 0 && (u2 *= 256); ) r2 < 0 && f2 === 0 && this[t3 + o2 + 1] !== 0 && (f2 = 1), this[t3 + o2] = (r2 / u2 >> 0) - f2 & 255;
    return t3 + e5;
  };
  c.prototype.writeInt8 = function(r2, t3, e5) {
    return r2 = +r2, t3 = t3 >>> 0, e5 || y(this, r2, t3, 1, 127, -128), r2 < 0 && (r2 = 255 + r2 + 1), this[t3] = r2 & 255, t3 + 1;
  };
  c.prototype.writeInt16LE = function(r2, t3, e5) {
    return r2 = +r2, t3 = t3 >>> 0, e5 || y(this, r2, t3, 2, 32767, -32768), this[t3] = r2 & 255, this[t3 + 1] = r2 >>> 8, t3 + 2;
  };
  c.prototype.writeInt16BE = function(r2, t3, e5) {
    return r2 = +r2, t3 = t3 >>> 0, e5 || y(this, r2, t3, 2, 32767, -32768), this[t3] = r2 >>> 8, this[t3 + 1] = r2 & 255, t3 + 2;
  };
  c.prototype.writeInt32LE = function(r2, t3, e5) {
    return r2 = +r2, t3 = t3 >>> 0, e5 || y(this, r2, t3, 4, 2147483647, -2147483648), this[t3] = r2 & 255, this[t3 + 1] = r2 >>> 8, this[t3 + 2] = r2 >>> 16, this[t3 + 3] = r2 >>> 24, t3 + 4;
  };
  c.prototype.writeInt32BE = function(r2, t3, e5) {
    return r2 = +r2, t3 = t3 >>> 0, e5 || y(this, r2, t3, 4, 2147483647, -2147483648), r2 < 0 && (r2 = 4294967295 + r2 + 1), this[t3] = r2 >>> 24, this[t3 + 1] = r2 >>> 16, this[t3 + 2] = r2 >>> 8, this[t3 + 3] = r2 & 255, t3 + 4;
  };
  c.prototype.writeBigInt64LE = E2(function(r2, t3 = 0) {
    return ur(this, r2, t3, -BigInt("0x8000000000000000"), BigInt("0x7fffffffffffffff"));
  });
  c.prototype.writeBigInt64BE = E2(function(r2, t3 = 0) {
    return cr(this, r2, t3, -BigInt("0x8000000000000000"), BigInt("0x7fffffffffffffff"));
  });
  function fr(i3, r2, t3, e5, n2, o2) {
    if (t3 + e5 > i3.length) throw new RangeError("Index out of range");
    if (t3 < 0) throw new RangeError("Index out of range");
  }
  function hr(i3, r2, t3, e5, n2) {
    return r2 = +r2, t3 = t3 >>> 0, n2 || fr(i3, r2, t3, 4), U2.write(i3, r2, t3, e5, 23, 4), t3 + 4;
  }
  c.prototype.writeFloatLE = function(r2, t3, e5) {
    return hr(this, r2, t3, true, e5);
  };
  c.prototype.writeFloatBE = function(r2, t3, e5) {
    return hr(this, r2, t3, false, e5);
  };
  function pr(i3, r2, t3, e5, n2) {
    return r2 = +r2, t3 = t3 >>> 0, n2 || fr(i3, r2, t3, 8), U2.write(i3, r2, t3, e5, 52, 8), t3 + 8;
  }
  c.prototype.writeDoubleLE = function(r2, t3, e5) {
    return pr(this, r2, t3, true, e5);
  };
  c.prototype.writeDoubleBE = function(r2, t3, e5) {
    return pr(this, r2, t3, false, e5);
  };
  c.prototype.copy = function(r2, t3, e5, n2) {
    if (!c.isBuffer(r2)) throw new TypeError("argument should be a Buffer");
    if (e5 || (e5 = 0), !n2 && n2 !== 0 && (n2 = this.length), t3 >= r2.length && (t3 = r2.length), t3 || (t3 = 0), n2 > 0 && n2 < e5 && (n2 = e5), n2 === e5 || r2.length === 0 || this.length === 0) return 0;
    if (t3 < 0) throw new RangeError("targetStart out of bounds");
    if (e5 < 0 || e5 >= this.length) throw new RangeError("Index out of range");
    if (n2 < 0) throw new RangeError("sourceEnd out of bounds");
    n2 > this.length && (n2 = this.length), r2.length - t3 < n2 - e5 && (n2 = r2.length - t3 + e5);
    let o2 = n2 - e5;
    return this === r2 && typeof Uint8Array.prototype.copyWithin == "function" ? this.copyWithin(t3, e5, n2) : Uint8Array.prototype.set.call(r2, this.subarray(e5, n2), t3), o2;
  };
  c.prototype.fill = function(r2, t3, e5, n2) {
    if (typeof r2 == "string") {
      if (typeof t3 == "string" ? (n2 = t3, t3 = 0, e5 = this.length) : typeof e5 == "string" && (n2 = e5, e5 = this.length), n2 !== void 0 && typeof n2 != "string") throw new TypeError("encoding must be a string");
      if (typeof n2 == "string" && !c.isEncoding(n2)) throw new TypeError("Unknown encoding: " + n2);
      if (r2.length === 1) {
        let u2 = r2.charCodeAt(0);
        (n2 === "utf8" && u2 < 128 || n2 === "latin1") && (r2 = u2);
      }
    } else typeof r2 == "number" ? r2 = r2 & 255 : typeof r2 == "boolean" && (r2 = Number(r2));
    if (t3 < 0 || this.length < t3 || this.length < e5) throw new RangeError("Out of range index");
    if (e5 <= t3) return this;
    t3 = t3 >>> 0, e5 = e5 === void 0 ? this.length : e5 >>> 0, r2 || (r2 = 0);
    let o2;
    if (typeof r2 == "number") for (o2 = t3; o2 < e5; ++o2) this[o2] = r2;
    else {
      let u2 = c.isBuffer(r2) ? r2 : c.from(r2, n2), f2 = u2.length;
      if (f2 === 0) throw new TypeError('The value "' + r2 + '" is invalid for argument "value"');
      for (o2 = 0; o2 < e5 - t3; ++o2) this[o2 + t3] = u2[o2 % f2];
    }
    return this;
  };
  var F2 = {};
  function Y(i3, r2, t3) {
    F2[i3] = class extends t3 {
      constructor() {
        super(), Object.defineProperty(this, "message", { value: r2.apply(this, arguments), writable: true, configurable: true }), this.name = `${this.name} [${i3}]`, this.stack, delete this.name;
      }
      get code() {
        return i3;
      }
      set code(n2) {
        Object.defineProperty(this, "code", { configurable: true, enumerable: true, value: n2, writable: true });
      }
      toString() {
        return `${this.name} [${i3}]: ${this.message}`;
      }
    };
  }
  Y("ERR_BUFFER_OUT_OF_BOUNDS", function(i3) {
    return i3 ? `${i3} is outside of buffer bounds` : "Attempt to access memory outside buffer bounds";
  }, RangeError);
  Y("ERR_INVALID_ARG_TYPE", function(i3, r2) {
    return `The "${i3}" argument must be of type number. Received type ${typeof r2}`;
  }, TypeError);
  Y("ERR_OUT_OF_RANGE", function(i3, r2, t3) {
    let e5 = `The value of "${i3}" is out of range.`, n2 = t3;
    return Number.isInteger(t3) && Math.abs(t3) > 2 ** 32 ? n2 = rr(String(t3)) : typeof t3 == "bigint" && (n2 = String(t3), (t3 > BigInt(2) ** BigInt(32) || t3 < -(BigInt(2) ** BigInt(32))) && (n2 = rr(n2)), n2 += "n"), e5 += ` It must be ${r2}. Received ${n2}`, e5;
  }, RangeError);
  function rr(i3) {
    let r2 = "", t3 = i3.length, e5 = i3[0] === "-" ? 1 : 0;
    for (; t3 >= e5 + 4; t3 -= 3) r2 = `_${i3.slice(t3 - 3, t3)}${r2}`;
    return `${i3.slice(0, t3)}${r2}`;
  }
  function jr(i3, r2, t3) {
    T2(r2, "offset"), (i3[r2] === void 0 || i3[r2 + t3] === void 0) && C2(r2, i3.length - (t3 + 1));
  }
  function sr(i3, r2, t3, e5, n2, o2) {
    if (i3 > t3 || i3 < r2) {
      let u2 = typeof r2 == "bigint" ? "n" : "", f2;
      throw r2 === 0 || r2 === BigInt(0) ? f2 = `>= 0${u2} and < 2${u2} ** ${(o2 + 1) * 8}${u2}` : f2 = `>= -(2${u2} ** ${(o2 + 1) * 8 - 1}${u2}) and < 2 ** ${(o2 + 1) * 8 - 1}${u2}`, new F2.ERR_OUT_OF_RANGE("value", f2, i3);
    }
    jr(e5, n2, o2);
  }
  function T2(i3, r2) {
    if (typeof i3 != "number") throw new F2.ERR_INVALID_ARG_TYPE(r2, "number", i3);
  }
  function C2(i3, r2, t3) {
    throw Math.floor(i3) !== i3 ? (T2(i3, t3), new F2.ERR_OUT_OF_RANGE("offset", "an integer", i3)) : r2 < 0 ? new F2.ERR_BUFFER_OUT_OF_BOUNDS() : new F2.ERR_OUT_OF_RANGE("offset", `>= ${0} and <= ${r2}`, i3);
  }
  var Vr = /[^+/0-9A-Za-z-_]/g;
  function Xr(i3) {
    if (i3 = i3.split("=")[0], i3 = i3.trim().replace(Vr, ""), i3.length < 2) return "";
    for (; i3.length % 4 !== 0; ) i3 = i3 + "=";
    return i3;
  }
  function q(i3, r2) {
    r2 = r2 || 1 / 0;
    let t3, e5 = i3.length, n2 = null, o2 = [];
    for (let u2 = 0; u2 < e5; ++u2) {
      if (t3 = i3.charCodeAt(u2), t3 > 55295 && t3 < 57344) {
        if (!n2) {
          if (t3 > 56319) {
            (r2 -= 3) > -1 && o2.push(239, 191, 189);
            continue;
          } else if (u2 + 1 === e5) {
            (r2 -= 3) > -1 && o2.push(239, 191, 189);
            continue;
          }
          n2 = t3;
          continue;
        }
        if (t3 < 56320) {
          (r2 -= 3) > -1 && o2.push(239, 191, 189), n2 = t3;
          continue;
        }
        t3 = (n2 - 55296 << 10 | t3 - 56320) + 65536;
      } else n2 && (r2 -= 3) > -1 && o2.push(239, 191, 189);
      if (n2 = null, t3 < 128) {
        if ((r2 -= 1) < 0) break;
        o2.push(t3);
      } else if (t3 < 2048) {
        if ((r2 -= 2) < 0) break;
        o2.push(t3 >> 6 | 192, t3 & 63 | 128);
      } else if (t3 < 65536) {
        if ((r2 -= 3) < 0) break;
        o2.push(t3 >> 12 | 224, t3 >> 6 & 63 | 128, t3 & 63 | 128);
      } else if (t3 < 1114112) {
        if ((r2 -= 4) < 0) break;
        o2.push(t3 >> 18 | 240, t3 >> 12 & 63 | 128, t3 >> 6 & 63 | 128, t3 & 63 | 128);
      } else throw new Error("Invalid code point");
    }
    return o2;
  }
  function zr(i3) {
    let r2 = [];
    for (let t3 = 0; t3 < i3.length; ++t3) r2.push(i3.charCodeAt(t3) & 255);
    return r2;
  }
  function Jr(i3, r2) {
    let t3, e5, n2, o2 = [];
    for (let u2 = 0; u2 < i3.length && !((r2 -= 2) < 0); ++u2) t3 = i3.charCodeAt(u2), e5 = t3 >> 8, n2 = t3 % 256, o2.push(n2), o2.push(e5);
    return o2;
  }
  function lr(i3) {
    return D2.toByteArray(Xr(i3));
  }
  function k2(i3, r2, t3, e5) {
    let n2;
    for (n2 = 0; n2 < e5 && !(n2 + t3 >= r2.length || n2 >= i3.length); ++n2) r2[n2 + t3] = i3[n2];
    return n2;
  }
  function d2(i3, r2) {
    return i3 instanceof r2 || i3 != null && i3.constructor != null && i3.constructor.name != null && i3.constructor.name === r2.name;
  }
  function W2(i3) {
    return i3 !== i3;
  }
  var Kr = function() {
    let i3 = "0123456789abcdef", r2 = new Array(256);
    for (let t3 = 0; t3 < 16; ++t3) {
      let e5 = t3 * 16;
      for (let n2 = 0; n2 < 16; ++n2) r2[e5 + n2] = i3[t3] + i3[n2];
    }
    return r2;
  }();
  function E2(i3) {
    return typeof BigInt > "u" ? Zr : i3;
  }
  function Zr() {
    throw new Error("BigInt not supported");
  }
});
J$1(ar());
/*! Bundled license information:

ieee754/index.js:
  (*! ieee754. BSD-3-Clause License. Feross Aboukhadijeh <https://feross.org/opensource> *)

buffer/index.js:
  (*!
   * The buffer module from node.js, for the browser.
   *
   * @author   Feross Aboukhadijeh <https://feross.org>
   * @license  MIT
   *)
*/
class LedgerApi {
  async ledgerApi() {
    const agent = await createHttpAgent();
    return ze.create({
      agent
    });
  }
  async balance() {
    try {
      const agent = await createHttpAgent();
      const principal = await agent.getPrincipal();
      const accountIdentifier = D.fromPrincipal({
        principal
      });
      const ledger = await this.ledgerApi();
      return await ledger.accountBalance({
        accountIdentifier
      });
    } catch (error) {
      showError(NETWORK_ERROR_MESSAGE);
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
      showError(NETWORK_ERROR_MESSAGE);
      throw error;
    }
  }
}
var e4 = class extends Error {
}, n = class extends Error {
}, o = class extends Error {
}, r = class extends Error {
}, i2 = class extends Error {
}, s = ({ Err: t3 }) => {
  throw "Refunded" in t3 ? new e4(t3.Refunded.reason) : "InvalidTransaction" in t3 ? new n(t3.InvalidTransaction) : "Processing" in t3 ? new r() : "TransactionTooOld" in t3 ? new i2() : "Other" in t3 ? new o(`Error in CMC with code ${t3.Other.error_code}: ${t3.Other.error_message}`) : new Error(`Unsupported error type ${JSON.stringify(t3)}`);
};
var h2 = ({ IDL: t3 }) => {
  let s2 = t3.Variant({ Set: t3.Principal, Unset: t3.Null }), n2 = t3.Text;
  t3.Record({ exchange_rate_canister: t3.Opt(s2), cycles_ledger_canister_id: t3.Opt(t3.Principal), last_purged_notification: t3.Opt(t3.Nat64), governance_canister_id: t3.Opt(t3.Principal), minting_account_id: t3.Opt(n2), ledger_canister_id: t3.Opt(t3.Principal) });
  let a = t3.Record({ subnet_type: t3.Opt(t3.Text) }), i3 = t3.Variant({ Filter: a, Subnet: t3.Record({ subnet: t3.Principal }) }), p = t3.Variant({ controllers: t3.Null, public: t3.Null }), o2 = t3.Record({ freezing_threshold: t3.Opt(t3.Nat), wasm_memory_threshold: t3.Opt(t3.Nat), controllers: t3.Opt(t3.Vec(t3.Principal)), reserved_cycles_limit: t3.Opt(t3.Nat), log_visibility: t3.Opt(p), wasm_memory_limit: t3.Opt(t3.Nat), memory_allocation: t3.Opt(t3.Nat), compute_allocation: t3.Opt(t3.Nat) }), l = t3.Record({ subnet_selection: t3.Opt(i3), settings: t3.Opt(o2), subnet_type: t3.Opt(t3.Text) }), _2 = t3.Variant({ Refunded: t3.Record({ create_error: t3.Text, refund_amount: t3.Nat }) }), d2 = t3.Variant({ Ok: t3.Principal, Err: _2 }), u2 = t3.Record({ xdr_permyriad_per_icp: t3.Nat64, timestamp_seconds: t3.Nat64 }), y = t3.Record({ certificate: t3.Vec(t3.Nat8), data: u2, hash_tree: t3.Vec(t3.Nat8) }), O2 = t3.Record({ data: t3.Vec(t3.Tuple(t3.Principal, t3.Vec(t3.Principal))) }), C2 = t3.Record({ data: t3.Vec(t3.Tuple(t3.Text, t3.Vec(t3.Principal))) }), r2 = t3.Nat64, g2 = t3.Record({ controller: t3.Principal, block_index: r2, subnet_selection: t3.Opt(i3), settings: t3.Opt(o2), subnet_type: t3.Opt(t3.Text) }), c = t3.Variant({ Refunded: t3.Record({ block_index: t3.Opt(r2), reason: t3.Text }), InvalidTransaction: t3.Text, Other: t3.Record({ error_message: t3.Text, error_code: t3.Nat64 }), Processing: t3.Null, TransactionTooOld: r2 }), N2 = t3.Variant({ Ok: t3.Principal, Err: c }), m2 = t3.Opt(t3.Vec(t3.Nat8)), b2 = t3.Opt(t3.Vec(t3.Nat8)), f2 = t3.Record({ block_index: r2, deposit_memo: m2, to_subaccount: b2 }), R2 = t3.Record({ balance: t3.Nat, block_index: t3.Nat, minted: t3.Nat }), P2 = t3.Variant({ Ok: R2, Err: c }), T2 = t3.Record({ block_index: r2, canister_id: t3.Principal }), x2 = t3.Nat, S2 = t3.Variant({ Ok: x2, Err: c });
  return t3.Service({ create_canister: t3.Func([l], [d2], []), get_build_metadata: t3.Func([], [t3.Text], []), get_default_subnets: t3.Func([], [t3.Vec(t3.Principal)], []), get_icp_xdr_conversion_rate: t3.Func([], [y], []), get_principals_authorized_to_create_canisters_to_subnets: t3.Func([], [O2], []), get_subnet_types_to_subnets: t3.Func([], [C2], []), notify_create_canister: t3.Func([g2], [N2], []), notify_mint_cycles: t3.Func([f2], [P2], []), notify_top_up: t3.Func([T2], [S2], []) });
};
var v2 = ({ IDL: t3 }) => {
  let s2 = t3.Variant({ Set: t3.Principal, Unset: t3.Null }), n2 = t3.Text;
  t3.Record({ exchange_rate_canister: t3.Opt(s2), cycles_ledger_canister_id: t3.Opt(t3.Principal), last_purged_notification: t3.Opt(t3.Nat64), governance_canister_id: t3.Opt(t3.Principal), minting_account_id: t3.Opt(n2), ledger_canister_id: t3.Opt(t3.Principal) });
  let a = t3.Record({ subnet_type: t3.Opt(t3.Text) }), i3 = t3.Variant({ Filter: a, Subnet: t3.Record({ subnet: t3.Principal }) }), p = t3.Variant({ controllers: t3.Null, public: t3.Null }), o2 = t3.Record({ freezing_threshold: t3.Opt(t3.Nat), wasm_memory_threshold: t3.Opt(t3.Nat), controllers: t3.Opt(t3.Vec(t3.Principal)), reserved_cycles_limit: t3.Opt(t3.Nat), log_visibility: t3.Opt(p), wasm_memory_limit: t3.Opt(t3.Nat), memory_allocation: t3.Opt(t3.Nat), compute_allocation: t3.Opt(t3.Nat) }), l = t3.Record({ subnet_selection: t3.Opt(i3), settings: t3.Opt(o2), subnet_type: t3.Opt(t3.Text) }), _2 = t3.Variant({ Refunded: t3.Record({ create_error: t3.Text, refund_amount: t3.Nat }) }), d2 = t3.Variant({ Ok: t3.Principal, Err: _2 }), u2 = t3.Record({ xdr_permyriad_per_icp: t3.Nat64, timestamp_seconds: t3.Nat64 }), y = t3.Record({ certificate: t3.Vec(t3.Nat8), data: u2, hash_tree: t3.Vec(t3.Nat8) }), O2 = t3.Record({ data: t3.Vec(t3.Tuple(t3.Principal, t3.Vec(t3.Principal))) }), C2 = t3.Record({ data: t3.Vec(t3.Tuple(t3.Text, t3.Vec(t3.Principal))) }), r2 = t3.Nat64, g2 = t3.Record({ controller: t3.Principal, block_index: r2, subnet_selection: t3.Opt(i3), settings: t3.Opt(o2), subnet_type: t3.Opt(t3.Text) }), c = t3.Variant({ Refunded: t3.Record({ block_index: t3.Opt(r2), reason: t3.Text }), InvalidTransaction: t3.Text, Other: t3.Record({ error_message: t3.Text, error_code: t3.Nat64 }), Processing: t3.Null, TransactionTooOld: r2 }), N2 = t3.Variant({ Ok: t3.Principal, Err: c }), m2 = t3.Opt(t3.Vec(t3.Nat8)), b2 = t3.Opt(t3.Vec(t3.Nat8)), f2 = t3.Record({ block_index: r2, deposit_memo: m2, to_subaccount: b2 }), R2 = t3.Record({ balance: t3.Nat, block_index: t3.Nat, minted: t3.Nat }), P2 = t3.Variant({ Ok: R2, Err: c }), T2 = t3.Record({ block_index: r2, canister_id: t3.Principal }), x2 = t3.Nat, S2 = t3.Variant({ Ok: x2, Err: c });
  return t3.Service({ create_canister: t3.Func([l], [d2], []), get_build_metadata: t3.Func([], [t3.Text], ["query"]), get_default_subnets: t3.Func([], [t3.Vec(t3.Principal)], ["query"]), get_icp_xdr_conversion_rate: t3.Func([], [y], ["query"]), get_principals_authorized_to_create_canisters_to_subnets: t3.Func([], [O2], ["query"]), get_subnet_types_to_subnets: t3.Func([], [C2], ["query"]), notify_create_canister: t3.Func([g2], [N2], []), notify_mint_cycles: t3.Func([f2], [P2], []), notify_top_up: t3.Func([T2], [S2], []) });
};
var F = class t2 extends w$2 {
  constructor() {
    super(...arguments);
    this.getIcpToCyclesConversionRate = async ({ certified: n2 } = {}) => {
      let { data: e5 } = await this.caller({ certified: n2 }).get_icp_xdr_conversion_rate();
      return e5.xdr_permyriad_per_icp;
    };
    this.notifyCreateCanister = async (n2) => {
      let e5 = await this.service.notify_create_canister(n2);
      if ("Err" in e5 && s(e5), "Ok" in e5) return e5.Ok;
      throw new Error(`Unsupported response type in notifyCreateCanister ${JSON.stringify(e5)}`);
    };
    this.notifyTopUp = async (n2) => {
      let e5 = await this.service.notify_top_up(n2);
      if ("Err" in e5 && s(e5), "Ok" in e5) return e5.Ok;
      throw new Error(`Unsupported response type in notifyTopUp ${JSON.stringify(e5)}`);
    };
    this.getDefaultSubnets = async ({ certified: n2 } = {}) => {
      let { get_default_subnets: e5 } = this.caller({ certified: n2 });
      return e5();
    };
    this.getSubnetTypesToSubnets = async ({ certified: n2 } = {}) => {
      let { get_subnet_types_to_subnets: e5 } = this.caller({ certified: n2 });
      return e5();
    };
  }
  static create(n2) {
    let { service: e5, certifiedService: a, canisterId: i3 } = lt({ options: n2, idlFactory: v2, certifiedIdlFactory: h2 });
    return new t2(i3, e5, a);
  }
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
      showError(NETWORK_ERROR_MESSAGE);
      throw error;
    }
  }
}
class TopupManager {
  async create() {
    await this.fetchAndRenderBalance();
    this.attachEventListeners();
  }
  async fetchAndRenderBalance() {
    const ledgerApi = new LedgerApi();
    const balance = await ledgerApi.balance();
    const formattedBalance = formatIcpBalance(balance);
    updateBalanceDisplay(formattedBalance);
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
    await this.fetchAndRenderBalance();
    hideLoading();
  }
  async performTopUp() {
    showLoading();
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
    hideLoading();
  }
  async updateBalanceAndStatus() {
    const statusManager = new StatusManager();
    await statusManager.create();
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
  constructor(canisterId2, iiPrincipal) {
    __publicField(this, "canisterId");
    __publicField(this, "iiPrincipal");
    __publicField(this, "controllersList", []);
    this.canisterId = canisterId2;
    this.iiPrincipal = iiPrincipal;
  }
  async create() {
    const managementApi = new ManagementApi();
    const status = await managementApi.getCanisterStatus();
    this.controllersList = status.settings.controllers;
    this.renderControllersContent();
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
    const controllerStrings = updatedControllers.map((c) => c.toString());
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
    const managementApi = new ManagementApi();
    await managementApi.updateControllers(updatedControllers);
    this.controllersList = updatedControllers;
    clearInput("controller-input");
    this.renderControllersContent();
    hideLoading();
  }
  async handleRemove() {
    const principalText = getInputValue("controller-input");
    if (!principalText) {
      throw new Error("Principal input is required");
    }
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
    const managementApi = new ManagementApi();
    await managementApi.updateControllers(updatedControllers);
    this.controllersList = updatedControllers;
    clearInput("controller-input");
    this.renderControllersContent();
    hideLoading();
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
const idlFactory = ({ IDL: IDL2 }) => {
  const HttpRequest = IDL2.Record({
    "url": IDL2.Text,
    "method": IDL2.Text,
    "body": IDL2.Vec(IDL2.Nat8),
    "headers": IDL2.Vec(IDL2.Tuple(IDL2.Text, IDL2.Text))
  });
  const HttpResponse = IDL2.Record({
    "body": IDL2.Vec(IDL2.Nat8),
    "headers": IDL2.Vec(IDL2.Tuple(IDL2.Text, IDL2.Text)),
    "status_code": IDL2.Nat16
  });
  const ManageAlternativeOriginsArg = IDL2.Variant({
    "Add": IDL2.Text,
    "Remove": IDL2.Text
  });
  const ManageAlternativeOriginsResult = IDL2.Variant({
    "Ok": IDL2.Null,
    "Err": IDL2.Text
  });
  const ManageIIPrincipalArg = IDL2.Variant({
    "Get": IDL2.Null,
    "Set": IDL2.Principal
  });
  const ManageIIPrincipalResult = IDL2.Variant({
    "Ok": IDL2.Principal,
    "Err": IDL2.Text
  });
  const TopUpInterval = IDL2.Variant({
    "Hourly": IDL2.Null,
    "Weekly": IDL2.Null,
    "Daily": IDL2.Null,
    "Monthly": IDL2.Null
  });
  const TopUpRule = IDL2.Record({
    "interval": TopUpInterval,
    "cycles_amount": IDL2.Nat,
    "cycles_threshold": IDL2.Nat
  });
  const ManageTopUpRuleArg = IDL2.Variant({
    "Add": TopUpRule,
    "Get": IDL2.Null,
    "Clear": IDL2.Null
  });
  const ManageTopUpRuleResult = IDL2.Variant({
    "Ok": IDL2.Opt(TopUpRule),
    "Err": IDL2.Text
  });
  const WasmStatus = IDL2.Record({
    "memo": IDL2.Opt(IDL2.Text),
    "name": IDL2.Text,
    "version": IDL2.Nat16
  });
  return IDL2.Service({
    "http_request": IDL2.Func([HttpRequest], [HttpResponse], ["query"]),
    "manage_alternative_origins": IDL2.Func(
      [ManageAlternativeOriginsArg],
      [ManageAlternativeOriginsResult],
      []
    ),
    "manage_ii_principal": IDL2.Func(
      [ManageIIPrincipalArg],
      [ManageIIPrincipalResult],
      []
    ),
    "manage_top_up_rule": IDL2.Func(
      [ManageTopUpRuleArg],
      [ManageTopUpRuleResult],
      []
    ),
    "wasm_status": IDL2.Func([], [WasmStatus], ["query"])
  });
};
class CanisterApi {
  constructor() {
    __publicField(this, "canisterApi");
    void this.create();
  }
  async create() {
    const agent = await createHttpAgent();
    const canisterIdPrincipal = await canisterId();
    this.canisterApi = Actor.createActor(idlFactory, {
      agent,
      canisterId: canisterIdPrincipal
    });
  }
  async manageAlternativeOrigins(arg) {
    try {
      return await this.canisterApi.manage_alternative_origins(arg);
    } catch (error) {
      showError(NETWORK_ERROR_MESSAGE);
      throw error;
    }
  }
  async manageTopUpRule(arg) {
    try {
      return await this.canisterApi.manage_top_up_rule(arg);
    } catch (error) {
      showError(NETWORK_ERROR_MESSAGE);
      throw error;
    }
  }
}
const IC_UPDATE_CALL_DELAY = 3e3;
class AlternativeOriginsManager {
  constructor() {
    __publicField(this, "canisterApi");
    this.canisterApi = new CanisterApi();
  }
  async create() {
    const origins = await this.fetchAlternativeOrigins();
    const originsList = origins.map((origin) => `<li class="data-display">${origin}</li>`).join("");
    this.renderAlternativeOriginsContent(originsList);
    this.attachEventListeners();
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
      showError(NETWORK_ERROR_MESSAGE);
      throw error;
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
    if (!origin) {
      throw new Error("Origin input is required");
    }
    if (!isValidOrigin(origin)) {
      showError(INVALID_ORIGIN_MESSAGE);
      clearInput("alternative-origin-input");
      return;
    }
    showLoading();
    const result = await this.canisterApi.manageAlternativeOrigins({
      Add: origin
    });
    if ("Ok" in result) {
      await new Promise((resolve) => setTimeout(resolve, IC_UPDATE_CALL_DELAY));
      await this.create();
      clearInput("alternative-origin-input");
    } else if ("Err" in result) {
      const err = result.Err;
      showError(NETWORK_ERROR_MESSAGE);
      throw new Error(`Failed to add alternative origin: ${err}`);
    } else {
      showError("Unknown error");
      throw new Error("Unknown error adding alternative origin");
    }
    hideLoading();
  }
  async handleRemove() {
    const origin = getInputValue("alternative-origin-input");
    if (!origin) {
      throw new Error("Origin input is required");
    }
    if (!isValidOrigin(origin)) {
      showError(INVALID_ORIGIN_MESSAGE);
      clearInput("alternative-origin-input");
      return;
    }
    showLoading();
    const result = await this.canisterApi.manageAlternativeOrigins({
      Remove: origin
    });
    if ("Ok" in result) {
      await new Promise((resolve) => setTimeout(resolve, IC_UPDATE_CALL_DELAY));
      await this.create();
      clearInput("alternative-origin-input");
    } else if ("Err" in result) {
      const err = result.Err;
      showError(NETWORK_ERROR_MESSAGE);
      throw new Error(`Failed to remove alternative origin: ${err}`);
    } else {
      showError("Unknown error");
      throw new Error("Unknown error removing alternative origin");
    }
    hideLoading();
  }
}
class CanisterLogsManager {
  async create() {
    await this.renderLogs();
    this.attachEventListeners();
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
    const managementApi = new ManagementApi();
    const { canister_log_records } = await managementApi.getCanisterLogs();
    const logsList = getElement("logs-list");
    if (canister_log_records.length === 0) {
      logsList.innerHTML = '<li class="data-display">No logs found.</li>';
      return;
    }
    const items = canister_log_records.map((record) => {
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
function formatRule(rule) {
  let interval = "Unknown";
  const intervalObj = rule.interval;
  if (intervalObj !== null && typeof intervalObj === "object" && !Array.isArray(intervalObj)) {
    if ("Hourly" in intervalObj) interval = "Hourly";
    else if ("Daily" in intervalObj) interval = "Daily";
    else if ("Weekly" in intervalObj) interval = "Weekly";
    else if ("Monthly" in intervalObj) interval = "Monthly";
  }
  return `Interval: ${interval}, Threshold: ${rule.cycles_threshold} cycles, Amount: ${rule.cycles_amount} cycles`;
}
class TopUpRuleManager {
  constructor() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    __publicField(this, "canisterApi");
    this.canisterApi = new CanisterApi();
  }
  async create() {
    await this.fetchAndRender();
    this.attachEventListeners();
  }
  attachEventListeners() {
    addEventListener("top-up-rule-set", "click", () => this.handleSet());
    addEventListener("top-up-rule-clear", "click", () => this.handleClear());
  }
  async fetchAndRender() {
    try {
      const res = await this.canisterApi.manageTopUpRule({ Get: null });
      this.render(res);
    } catch {
      showError(NETWORK_ERROR_MESSAGE);
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  render(result) {
    const display = getElement("top-up-rule-display");
    if (result && typeof result === "object") {
      if ("Ok" in result && Array.isArray(result.Ok)) {
        if (result.Ok.length === 0) {
          display.textContent = "No rule set";
        } else {
          display.textContent = formatRule(result.Ok[0]);
        }
      } else if ("Err" in result && typeof result.Err === "string") {
        showError(result.Err);
      } else {
        display.textContent = "Unknown result";
      }
    } else {
      display.textContent = "Unknown result";
    }
  }
  async handleSet() {
    const intervalElem = getElement("top-up-rule-interval");
    let intervalValue = "";
    if (intervalElem instanceof HTMLSelectElement) {
      intervalValue = intervalElem.value;
    }
    const thresholdStr = getInputValue("top-up-rule-threshold");
    const amountStr = getInputValue("top-up-rule-amount");
    if (!thresholdStr || !amountStr) {
      showError("Please provide threshold and amount.");
      return;
    }
    let threshold, amount;
    try {
      threshold = BigInt(thresholdStr);
      amount = BigInt(amountStr);
      if (threshold < 0n || amount < 0n) throw new Error("negative");
    } catch {
      showError("Threshold and amount must be non-negative integers.");
      return;
    }
    let interval;
    if (intervalValue === "Hourly") interval = { Hourly: null };
    else if (intervalValue === "Daily") interval = { Daily: null };
    else if (intervalValue === "Weekly") interval = { Weekly: null };
    else interval = { Monthly: null };
    showLoading();
    try {
      const result = await this.canisterApi.manageTopUpRule({
        Add: {
          interval,
          cycles_threshold: threshold,
          cycles_amount: amount
        }
      });
      if (result && typeof result === "object") {
        if ("Ok" in result) {
          await this.fetchAndRender();
        } else if ("Err" in result && typeof result.Err === "string") {
          showError(result.Err);
        } else {
          showError("Unknown error");
        }
      } else {
        showError("Unknown error");
      }
    } catch {
      showError(NETWORK_ERROR_MESSAGE);
    } finally {
      hideLoading();
    }
  }
  async handleClear() {
    showLoading();
    try {
      const result = await this.canisterApi.manageTopUpRule({ Clear: null });
      if (result && typeof result === "object") {
        if ("Ok" in result) {
          await this.fetchAndRender();
        } else if ("Err" in result && typeof result.Err === "string") {
          showError(result.Err);
        } else {
          showError("Unknown error");
        }
      } else {
        showError("Unknown error");
      }
    } catch {
      showError(NETWORK_ERROR_MESSAGE);
    } finally {
      hideLoading();
    }
  }
}
class Dashboard {
  constructor() {
    __publicField(this, "authManager", null);
    void this.create();
  }
  async create() {
    try {
      await getConfig();
      this.authManager = new AuthManager();
      await this.authManager.create();
      await this.initializeAuthenticatedState();
    } catch (error) {
      showError(DASHBOARD_INIT_ERROR_MESSAGE);
      throw error;
    }
  }
  async initializeAuthenticatedState() {
    if (!this.authManager) {
      throw new Error("Auth manager not initialized");
    }
    const isAuthed = await this.authManager.isAuthenticated();
    if (isAuthed) {
      const iiPrincipal = await this.authManager.getPrincipal();
      const principalText = iiPrincipal.toText();
      this.setLoggedInState(principalText);
      const canisterIdPrincipal = await canisterId();
      const topupManager = new TopupManager();
      const topUpRuleManager = new TopUpRuleManager();
      const statusManager = new StatusManager();
      const controllersManager = new ControllersManager(
        canisterIdPrincipal,
        iiPrincipal
      );
      const alternativeOriginsManager = new AlternativeOriginsManager();
      const canisterLogsManager = new CanisterLogsManager();
      await topupManager.create();
      await topUpRuleManager.create();
      await statusManager.create();
      await controllersManager.create();
      await alternativeOriginsManager.create();
      await canisterLogsManager.create();
    } else {
      this.setLoggedOutState();
    }
  }
  setLoggedInState(principalText) {
    setLoggedInState(principalText, () => this.handleLogout());
  }
  setLoggedOutState() {
    setLoggedOutState(() => this.handleLogin());
  }
  async handleLogin() {
    if (!this.authManager) {
      throw new Error("Auth manager not initialized");
    }
    await this.authManager.login();
    await this.initializeAuthenticatedState();
  }
  async handleLogout() {
    if (!this.authManager) {
      throw new Error("Auth manager not initialized");
    }
    await this.authManager.logout();
    this.setLoggedOutState();
  }
}
document.addEventListener("DOMContentLoaded", () => {
  new Dashboard();
});
