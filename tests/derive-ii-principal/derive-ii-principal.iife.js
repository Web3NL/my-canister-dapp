(function() {
  "use strict";
  var commonjsGlobal = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : {};
  function getDefaultExportFromCjs(x) {
    return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, "default") ? x["default"] : x;
  }
  var buffer$1 = {};
  var base64Js$1 = {};
  var hasRequiredBase64Js$1;
  function requireBase64Js$1() {
    if (hasRequiredBase64Js$1) return base64Js$1;
    hasRequiredBase64Js$1 = 1;
    base64Js$1.byteLength = byteLength;
    base64Js$1.toByteArray = toByteArray;
    base64Js$1.fromByteArray = fromByteArray;
    var lookup = [];
    var revLookup = [];
    var Arr = typeof Uint8Array !== "undefined" ? Uint8Array : Array;
    var code = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    for (var i = 0, len = code.length; i < len; ++i) {
      lookup[i] = code[i];
      revLookup[code.charCodeAt(i)] = i;
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
      var i2;
      for (i2 = 0; i2 < len2; i2 += 4) {
        tmp = revLookup[b64.charCodeAt(i2)] << 18 | revLookup[b64.charCodeAt(i2 + 1)] << 12 | revLookup[b64.charCodeAt(i2 + 2)] << 6 | revLookup[b64.charCodeAt(i2 + 3)];
        arr[curByte++] = tmp >> 16 & 255;
        arr[curByte++] = tmp >> 8 & 255;
        arr[curByte++] = tmp & 255;
      }
      if (placeHoldersLen === 2) {
        tmp = revLookup[b64.charCodeAt(i2)] << 2 | revLookup[b64.charCodeAt(i2 + 1)] >> 4;
        arr[curByte++] = tmp & 255;
      }
      if (placeHoldersLen === 1) {
        tmp = revLookup[b64.charCodeAt(i2)] << 10 | revLookup[b64.charCodeAt(i2 + 1)] << 4 | revLookup[b64.charCodeAt(i2 + 2)] >> 2;
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
      for (var i2 = start; i2 < end; i2 += 3) {
        tmp = (uint8[i2] << 16 & 16711680) + (uint8[i2 + 1] << 8 & 65280) + (uint8[i2 + 2] & 255);
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
      for (var i2 = 0, len22 = len2 - extraBytes; i2 < len22; i2 += maxChunkLength) {
        parts.push(encodeChunk(uint8, i2, i2 + maxChunkLength > len22 ? len22 : i2 + maxChunkLength));
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
    return base64Js$1;
  }
  var ieee754$1 = {};
  /*! ieee754. BSD-3-Clause License. Feross Aboukhadijeh <https://feross.org/opensource> */
  var hasRequiredIeee754$1;
  function requireIeee754$1() {
    if (hasRequiredIeee754$1) return ieee754$1;
    hasRequiredIeee754$1 = 1;
    ieee754$1.read = function(buffer2, offset, isLE, mLen, nBytes) {
      var e, m;
      var eLen = nBytes * 8 - mLen - 1;
      var eMax = (1 << eLen) - 1;
      var eBias = eMax >> 1;
      var nBits = -7;
      var i = isLE ? nBytes - 1 : 0;
      var d = isLE ? -1 : 1;
      var s = buffer2[offset + i];
      i += d;
      e = s & (1 << -nBits) - 1;
      s >>= -nBits;
      nBits += eLen;
      for (; nBits > 0; e = e * 256 + buffer2[offset + i], i += d, nBits -= 8) {
      }
      m = e & (1 << -nBits) - 1;
      e >>= -nBits;
      nBits += mLen;
      for (; nBits > 0; m = m * 256 + buffer2[offset + i], i += d, nBits -= 8) {
      }
      if (e === 0) {
        e = 1 - eBias;
      } else if (e === eMax) {
        return m ? NaN : (s ? -1 : 1) * Infinity;
      } else {
        m = m + Math.pow(2, mLen);
        e = e - eBias;
      }
      return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
    };
    ieee754$1.write = function(buffer2, value2, offset, isLE, mLen, nBytes) {
      var e, m, c;
      var eLen = nBytes * 8 - mLen - 1;
      var eMax = (1 << eLen) - 1;
      var eBias = eMax >> 1;
      var rt = mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0;
      var i = isLE ? 0 : nBytes - 1;
      var d = isLE ? 1 : -1;
      var s = value2 < 0 || value2 === 0 && 1 / value2 < 0 ? 1 : 0;
      value2 = Math.abs(value2);
      if (isNaN(value2) || value2 === Infinity) {
        m = isNaN(value2) ? 1 : 0;
        e = eMax;
      } else {
        e = Math.floor(Math.log(value2) / Math.LN2);
        if (value2 * (c = Math.pow(2, -e)) < 1) {
          e--;
          c *= 2;
        }
        if (e + eBias >= 1) {
          value2 += rt / c;
        } else {
          value2 += rt * Math.pow(2, 1 - eBias);
        }
        if (value2 * c >= 2) {
          e++;
          c /= 2;
        }
        if (e + eBias >= eMax) {
          m = 0;
          e = eMax;
        } else if (e + eBias >= 1) {
          m = (value2 * c - 1) * Math.pow(2, mLen);
          e = e + eBias;
        } else {
          m = value2 * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
          e = 0;
        }
      }
      for (; mLen >= 8; buffer2[offset + i] = m & 255, i += d, m /= 256, mLen -= 8) {
      }
      e = e << mLen | m;
      eLen += mLen;
      for (; eLen > 0; buffer2[offset + i] = e & 255, i += d, e /= 256, eLen -= 8) {
      }
      buffer2[offset + i - d] |= s * 128;
    };
    return ieee754$1;
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
      const base64 = requireBase64Js$1();
      const ieee7542 = requireIeee754$1();
      const customInspectSymbol = typeof Symbol === "function" && typeof Symbol["for"] === "function" ? Symbol["for"]("nodejs.util.inspect.custom") : null;
      exports.Buffer = Buffer;
      exports.SlowBuffer = SlowBuffer;
      exports.INSPECT_MAX_BYTES = 50;
      const K_MAX_LENGTH = 2147483647;
      exports.kMaxLength = K_MAX_LENGTH;
      Buffer.TYPED_ARRAY_SUPPORT = typedArraySupport();
      if (!Buffer.TYPED_ARRAY_SUPPORT && typeof console !== "undefined" && typeof console.error === "function") {
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
        } catch (e) {
          return false;
        }
      }
      Object.defineProperty(Buffer.prototype, "parent", {
        enumerable: true,
        get: function() {
          if (!Buffer.isBuffer(this)) return void 0;
          return this.buffer;
        }
      });
      Object.defineProperty(Buffer.prototype, "offset", {
        enumerable: true,
        get: function() {
          if (!Buffer.isBuffer(this)) return void 0;
          return this.byteOffset;
        }
      });
      function createBuffer(length) {
        if (length > K_MAX_LENGTH) {
          throw new RangeError('The value "' + length + '" is invalid for option "size"');
        }
        const buf = new Uint8Array(length);
        Object.setPrototypeOf(buf, Buffer.prototype);
        return buf;
      }
      function Buffer(arg, encodingOrOffset, length) {
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
      Buffer.poolSize = 8192;
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
          return Buffer.from(valueOf, encodingOrOffset, length);
        }
        const b = fromObject(value2);
        if (b) return b;
        if (typeof Symbol !== "undefined" && Symbol.toPrimitive != null && typeof value2[Symbol.toPrimitive] === "function") {
          return Buffer.from(value2[Symbol.toPrimitive]("string"), encodingOrOffset, length);
        }
        throw new TypeError(
          "The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " + typeof value2
        );
      }
      Buffer.from = function(value2, encodingOrOffset, length) {
        return from(value2, encodingOrOffset, length);
      };
      Object.setPrototypeOf(Buffer.prototype, Uint8Array.prototype);
      Object.setPrototypeOf(Buffer, Uint8Array);
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
      Buffer.alloc = function(size, fill, encoding) {
        return alloc(size, fill, encoding);
      };
      function allocUnsafe(size) {
        assertSize(size);
        return createBuffer(size < 0 ? 0 : checked(size) | 0);
      }
      Buffer.allocUnsafe = function(size) {
        return allocUnsafe(size);
      };
      Buffer.allocUnsafeSlow = function(size) {
        return allocUnsafe(size);
      };
      function fromString(string, encoding) {
        if (typeof encoding !== "string" || encoding === "") {
          encoding = "utf8";
        }
        if (!Buffer.isEncoding(encoding)) {
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
        for (let i = 0; i < length; i += 1) {
          buf[i] = array[i] & 255;
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
        Object.setPrototypeOf(buf, Buffer.prototype);
        return buf;
      }
      function fromObject(obj) {
        if (Buffer.isBuffer(obj)) {
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
        return Buffer.alloc(+length);
      }
      Buffer.isBuffer = function isBuffer(b) {
        return b != null && b._isBuffer === true && b !== Buffer.prototype;
      };
      Buffer.compare = function compare2(a, b) {
        if (isInstance(a, Uint8Array)) a = Buffer.from(a, a.offset, a.byteLength);
        if (isInstance(b, Uint8Array)) b = Buffer.from(b, b.offset, b.byteLength);
        if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
          throw new TypeError(
            'The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array'
          );
        }
        if (a === b) return 0;
        let x = a.length;
        let y = b.length;
        for (let i = 0, len = Math.min(x, y); i < len; ++i) {
          if (a[i] !== b[i]) {
            x = a[i];
            y = b[i];
            break;
          }
        }
        if (x < y) return -1;
        if (y < x) return 1;
        return 0;
      };
      Buffer.isEncoding = function isEncoding(encoding) {
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
      Buffer.concat = function concat2(list, length) {
        if (!Array.isArray(list)) {
          throw new TypeError('"list" argument must be an Array of Buffers');
        }
        if (list.length === 0) {
          return Buffer.alloc(0);
        }
        let i;
        if (length === void 0) {
          length = 0;
          for (i = 0; i < list.length; ++i) {
            length += list[i].length;
          }
        }
        const buffer2 = Buffer.allocUnsafe(length);
        let pos = 0;
        for (i = 0; i < list.length; ++i) {
          let buf = list[i];
          if (isInstance(buf, Uint8Array)) {
            if (pos + buf.length > buffer2.length) {
              if (!Buffer.isBuffer(buf)) buf = Buffer.from(buf);
              buf.copy(buffer2, pos);
            } else {
              Uint8Array.prototype.set.call(
                buffer2,
                buf,
                pos
              );
            }
          } else if (!Buffer.isBuffer(buf)) {
            throw new TypeError('"list" argument must be an Array of Buffers');
          } else {
            buf.copy(buffer2, pos);
          }
          pos += buf.length;
        }
        return buffer2;
      };
      function byteLength(string, encoding) {
        if (Buffer.isBuffer(string)) {
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
      Buffer.byteLength = byteLength;
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
      Buffer.prototype._isBuffer = true;
      function swap(b, n, m) {
        const i = b[n];
        b[n] = b[m];
        b[m] = i;
      }
      Buffer.prototype.swap16 = function swap16() {
        const len = this.length;
        if (len % 2 !== 0) {
          throw new RangeError("Buffer size must be a multiple of 16-bits");
        }
        for (let i = 0; i < len; i += 2) {
          swap(this, i, i + 1);
        }
        return this;
      };
      Buffer.prototype.swap32 = function swap32() {
        const len = this.length;
        if (len % 4 !== 0) {
          throw new RangeError("Buffer size must be a multiple of 32-bits");
        }
        for (let i = 0; i < len; i += 4) {
          swap(this, i, i + 3);
          swap(this, i + 1, i + 2);
        }
        return this;
      };
      Buffer.prototype.swap64 = function swap64() {
        const len = this.length;
        if (len % 8 !== 0) {
          throw new RangeError("Buffer size must be a multiple of 64-bits");
        }
        for (let i = 0; i < len; i += 8) {
          swap(this, i, i + 7);
          swap(this, i + 1, i + 6);
          swap(this, i + 2, i + 5);
          swap(this, i + 3, i + 4);
        }
        return this;
      };
      Buffer.prototype.toString = function toString() {
        const length = this.length;
        if (length === 0) return "";
        if (arguments.length === 0) return utf8Slice(this, 0, length);
        return slowToString.apply(this, arguments);
      };
      Buffer.prototype.toLocaleString = Buffer.prototype.toString;
      Buffer.prototype.equals = function equals(b) {
        if (!Buffer.isBuffer(b)) throw new TypeError("Argument must be a Buffer");
        if (this === b) return true;
        return Buffer.compare(this, b) === 0;
      };
      Buffer.prototype.inspect = function inspect() {
        let str = "";
        const max = exports.INSPECT_MAX_BYTES;
        str = this.toString("hex", 0, max).replace(/(.{2})/g, "$1 ").trim();
        if (this.length > max) str += " ... ";
        return "<Buffer " + str + ">";
      };
      if (customInspectSymbol) {
        Buffer.prototype[customInspectSymbol] = Buffer.prototype.inspect;
      }
      Buffer.prototype.compare = function compare2(target, start, end, thisStart, thisEnd) {
        if (isInstance(target, Uint8Array)) {
          target = Buffer.from(target, target.offset, target.byteLength);
        }
        if (!Buffer.isBuffer(target)) {
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
        let x = thisEnd - thisStart;
        let y = end - start;
        const len = Math.min(x, y);
        const thisCopy = this.slice(thisStart, thisEnd);
        const targetCopy = target.slice(start, end);
        for (let i = 0; i < len; ++i) {
          if (thisCopy[i] !== targetCopy[i]) {
            x = thisCopy[i];
            y = targetCopy[i];
            break;
          }
        }
        if (x < y) return -1;
        if (y < x) return 1;
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
          val = Buffer.from(val, encoding);
        }
        if (Buffer.isBuffer(val)) {
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
        function read(buf, i2) {
          if (indexSize === 1) {
            return buf[i2];
          } else {
            return buf.readUInt16BE(i2 * indexSize);
          }
        }
        let i;
        if (dir) {
          let foundIndex = -1;
          for (i = byteOffset; i < arrLength; i++) {
            if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
              if (foundIndex === -1) foundIndex = i;
              if (i - foundIndex + 1 === valLength) return foundIndex * indexSize;
            } else {
              if (foundIndex !== -1) i -= i - foundIndex;
              foundIndex = -1;
            }
          }
        } else {
          if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength;
          for (i = byteOffset; i >= 0; i--) {
            let found = true;
            for (let j = 0; j < valLength; j++) {
              if (read(arr, i + j) !== read(val, j)) {
                found = false;
                break;
              }
            }
            if (found) return i;
          }
        }
        return -1;
      }
      Buffer.prototype.includes = function includes(val, byteOffset, encoding) {
        return this.indexOf(val, byteOffset, encoding) !== -1;
      };
      Buffer.prototype.indexOf = function indexOf(val, byteOffset, encoding) {
        return bidirectionalIndexOf(this, val, byteOffset, encoding, true);
      };
      Buffer.prototype.lastIndexOf = function lastIndexOf(val, byteOffset, encoding) {
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
        let i;
        for (i = 0; i < length; ++i) {
          const parsed = parseInt(string.substr(i * 2, 2), 16);
          if (numberIsNaN(parsed)) return i;
          buf[offset + i] = parsed;
        }
        return i;
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
      Buffer.prototype.write = function write(string, offset, length, encoding) {
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
      Buffer.prototype.toJSON = function toJSON() {
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
        let i = start;
        while (i < end) {
          const firstByte = buf[i];
          let codePoint = null;
          let bytesPerSequence = firstByte > 239 ? 4 : firstByte > 223 ? 3 : firstByte > 191 ? 2 : 1;
          if (i + bytesPerSequence <= end) {
            let secondByte, thirdByte, fourthByte, tempCodePoint;
            switch (bytesPerSequence) {
              case 1:
                if (firstByte < 128) {
                  codePoint = firstByte;
                }
                break;
              case 2:
                secondByte = buf[i + 1];
                if ((secondByte & 192) === 128) {
                  tempCodePoint = (firstByte & 31) << 6 | secondByte & 63;
                  if (tempCodePoint > 127) {
                    codePoint = tempCodePoint;
                  }
                }
                break;
              case 3:
                secondByte = buf[i + 1];
                thirdByte = buf[i + 2];
                if ((secondByte & 192) === 128 && (thirdByte & 192) === 128) {
                  tempCodePoint = (firstByte & 15) << 12 | (secondByte & 63) << 6 | thirdByte & 63;
                  if (tempCodePoint > 2047 && (tempCodePoint < 55296 || tempCodePoint > 57343)) {
                    codePoint = tempCodePoint;
                  }
                }
                break;
              case 4:
                secondByte = buf[i + 1];
                thirdByte = buf[i + 2];
                fourthByte = buf[i + 3];
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
          i += bytesPerSequence;
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
        let i = 0;
        while (i < len) {
          res += String.fromCharCode.apply(
            String,
            codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
          );
        }
        return res;
      }
      function asciiSlice(buf, start, end) {
        let ret = "";
        end = Math.min(buf.length, end);
        for (let i = start; i < end; ++i) {
          ret += String.fromCharCode(buf[i] & 127);
        }
        return ret;
      }
      function latin1Slice(buf, start, end) {
        let ret = "";
        end = Math.min(buf.length, end);
        for (let i = start; i < end; ++i) {
          ret += String.fromCharCode(buf[i]);
        }
        return ret;
      }
      function hexSlice(buf, start, end) {
        const len = buf.length;
        if (!start || start < 0) start = 0;
        if (!end || end < 0 || end > len) end = len;
        let out = "";
        for (let i = start; i < end; ++i) {
          out += hexSliceLookupTable[buf[i]];
        }
        return out;
      }
      function utf16leSlice(buf, start, end) {
        const bytes = buf.slice(start, end);
        let res = "";
        for (let i = 0; i < bytes.length - 1; i += 2) {
          res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256);
        }
        return res;
      }
      Buffer.prototype.slice = function slice(start, end) {
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
        Object.setPrototypeOf(newBuf, Buffer.prototype);
        return newBuf;
      };
      function checkOffset(offset, ext, length) {
        if (offset % 1 !== 0 || offset < 0) throw new RangeError("offset is not uint");
        if (offset + ext > length) throw new RangeError("Trying to access beyond buffer length");
      }
      Buffer.prototype.readUintLE = Buffer.prototype.readUIntLE = function readUIntLE2(offset, byteLength2, noAssert) {
        offset = offset >>> 0;
        byteLength2 = byteLength2 >>> 0;
        if (!noAssert) checkOffset(offset, byteLength2, this.length);
        let val = this[offset];
        let mul = 1;
        let i = 0;
        while (++i < byteLength2 && (mul *= 256)) {
          val += this[offset + i] * mul;
        }
        return val;
      };
      Buffer.prototype.readUintBE = Buffer.prototype.readUIntBE = function readUIntBE(offset, byteLength2, noAssert) {
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
      Buffer.prototype.readUint8 = Buffer.prototype.readUInt8 = function readUInt8(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 1, this.length);
        return this[offset];
      };
      Buffer.prototype.readUint16LE = Buffer.prototype.readUInt16LE = function readUInt16LE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 2, this.length);
        return this[offset] | this[offset + 1] << 8;
      };
      Buffer.prototype.readUint16BE = Buffer.prototype.readUInt16BE = function readUInt16BE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 2, this.length);
        return this[offset] << 8 | this[offset + 1];
      };
      Buffer.prototype.readUint32LE = Buffer.prototype.readUInt32LE = function readUInt32LE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 4, this.length);
        return (this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16) + this[offset + 3] * 16777216;
      };
      Buffer.prototype.readUint32BE = Buffer.prototype.readUInt32BE = function readUInt32BE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 4, this.length);
        return this[offset] * 16777216 + (this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3]);
      };
      Buffer.prototype.readBigUInt64LE = defineBigIntMethod(function readBigUInt64LE(offset) {
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
      Buffer.prototype.readBigUInt64BE = defineBigIntMethod(function readBigUInt64BE(offset) {
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
      Buffer.prototype.readIntLE = function readIntLE2(offset, byteLength2, noAssert) {
        offset = offset >>> 0;
        byteLength2 = byteLength2 >>> 0;
        if (!noAssert) checkOffset(offset, byteLength2, this.length);
        let val = this[offset];
        let mul = 1;
        let i = 0;
        while (++i < byteLength2 && (mul *= 256)) {
          val += this[offset + i] * mul;
        }
        mul *= 128;
        if (val >= mul) val -= Math.pow(2, 8 * byteLength2);
        return val;
      };
      Buffer.prototype.readIntBE = function readIntBE(offset, byteLength2, noAssert) {
        offset = offset >>> 0;
        byteLength2 = byteLength2 >>> 0;
        if (!noAssert) checkOffset(offset, byteLength2, this.length);
        let i = byteLength2;
        let mul = 1;
        let val = this[offset + --i];
        while (i > 0 && (mul *= 256)) {
          val += this[offset + --i] * mul;
        }
        mul *= 128;
        if (val >= mul) val -= Math.pow(2, 8 * byteLength2);
        return val;
      };
      Buffer.prototype.readInt8 = function readInt8(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 1, this.length);
        if (!(this[offset] & 128)) return this[offset];
        return (255 - this[offset] + 1) * -1;
      };
      Buffer.prototype.readInt16LE = function readInt16LE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 2, this.length);
        const val = this[offset] | this[offset + 1] << 8;
        return val & 32768 ? val | 4294901760 : val;
      };
      Buffer.prototype.readInt16BE = function readInt16BE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 2, this.length);
        const val = this[offset + 1] | this[offset] << 8;
        return val & 32768 ? val | 4294901760 : val;
      };
      Buffer.prototype.readInt32LE = function readInt32LE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 4, this.length);
        return this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16 | this[offset + 3] << 24;
      };
      Buffer.prototype.readInt32BE = function readInt32BE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 4, this.length);
        return this[offset] << 24 | this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3];
      };
      Buffer.prototype.readBigInt64LE = defineBigIntMethod(function readBigInt64LE(offset) {
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
      Buffer.prototype.readBigInt64BE = defineBigIntMethod(function readBigInt64BE(offset) {
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
      Buffer.prototype.readFloatLE = function readFloatLE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 4, this.length);
        return ieee7542.read(this, offset, true, 23, 4);
      };
      Buffer.prototype.readFloatBE = function readFloatBE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 4, this.length);
        return ieee7542.read(this, offset, false, 23, 4);
      };
      Buffer.prototype.readDoubleLE = function readDoubleLE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 8, this.length);
        return ieee7542.read(this, offset, true, 52, 8);
      };
      Buffer.prototype.readDoubleBE = function readDoubleBE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 8, this.length);
        return ieee7542.read(this, offset, false, 52, 8);
      };
      function checkInt(buf, value2, offset, ext, max, min) {
        if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance');
        if (value2 > max || value2 < min) throw new RangeError('"value" argument is out of bounds');
        if (offset + ext > buf.length) throw new RangeError("Index out of range");
      }
      Buffer.prototype.writeUintLE = Buffer.prototype.writeUIntLE = function writeUIntLE2(value2, offset, byteLength2, noAssert) {
        value2 = +value2;
        offset = offset >>> 0;
        byteLength2 = byteLength2 >>> 0;
        if (!noAssert) {
          const maxBytes = Math.pow(2, 8 * byteLength2) - 1;
          checkInt(this, value2, offset, byteLength2, maxBytes, 0);
        }
        let mul = 1;
        let i = 0;
        this[offset] = value2 & 255;
        while (++i < byteLength2 && (mul *= 256)) {
          this[offset + i] = value2 / mul & 255;
        }
        return offset + byteLength2;
      };
      Buffer.prototype.writeUintBE = Buffer.prototype.writeUIntBE = function writeUIntBE(value2, offset, byteLength2, noAssert) {
        value2 = +value2;
        offset = offset >>> 0;
        byteLength2 = byteLength2 >>> 0;
        if (!noAssert) {
          const maxBytes = Math.pow(2, 8 * byteLength2) - 1;
          checkInt(this, value2, offset, byteLength2, maxBytes, 0);
        }
        let i = byteLength2 - 1;
        let mul = 1;
        this[offset + i] = value2 & 255;
        while (--i >= 0 && (mul *= 256)) {
          this[offset + i] = value2 / mul & 255;
        }
        return offset + byteLength2;
      };
      Buffer.prototype.writeUint8 = Buffer.prototype.writeUInt8 = function writeUInt8(value2, offset, noAssert) {
        value2 = +value2;
        offset = offset >>> 0;
        if (!noAssert) checkInt(this, value2, offset, 1, 255, 0);
        this[offset] = value2 & 255;
        return offset + 1;
      };
      Buffer.prototype.writeUint16LE = Buffer.prototype.writeUInt16LE = function writeUInt16LE(value2, offset, noAssert) {
        value2 = +value2;
        offset = offset >>> 0;
        if (!noAssert) checkInt(this, value2, offset, 2, 65535, 0);
        this[offset] = value2 & 255;
        this[offset + 1] = value2 >>> 8;
        return offset + 2;
      };
      Buffer.prototype.writeUint16BE = Buffer.prototype.writeUInt16BE = function writeUInt16BE(value2, offset, noAssert) {
        value2 = +value2;
        offset = offset >>> 0;
        if (!noAssert) checkInt(this, value2, offset, 2, 65535, 0);
        this[offset] = value2 >>> 8;
        this[offset + 1] = value2 & 255;
        return offset + 2;
      };
      Buffer.prototype.writeUint32LE = Buffer.prototype.writeUInt32LE = function writeUInt32LE(value2, offset, noAssert) {
        value2 = +value2;
        offset = offset >>> 0;
        if (!noAssert) checkInt(this, value2, offset, 4, 4294967295, 0);
        this[offset + 3] = value2 >>> 24;
        this[offset + 2] = value2 >>> 16;
        this[offset + 1] = value2 >>> 8;
        this[offset] = value2 & 255;
        return offset + 4;
      };
      Buffer.prototype.writeUint32BE = Buffer.prototype.writeUInt32BE = function writeUInt32BE(value2, offset, noAssert) {
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
      Buffer.prototype.writeBigUInt64LE = defineBigIntMethod(function writeBigUInt64LE(value2, offset = 0) {
        return wrtBigUInt64LE(this, value2, offset, BigInt(0), BigInt("0xffffffffffffffff"));
      });
      Buffer.prototype.writeBigUInt64BE = defineBigIntMethod(function writeBigUInt64BE(value2, offset = 0) {
        return wrtBigUInt64BE(this, value2, offset, BigInt(0), BigInt("0xffffffffffffffff"));
      });
      Buffer.prototype.writeIntLE = function writeIntLE2(value2, offset, byteLength2, noAssert) {
        value2 = +value2;
        offset = offset >>> 0;
        if (!noAssert) {
          const limit = Math.pow(2, 8 * byteLength2 - 1);
          checkInt(this, value2, offset, byteLength2, limit - 1, -limit);
        }
        let i = 0;
        let mul = 1;
        let sub = 0;
        this[offset] = value2 & 255;
        while (++i < byteLength2 && (mul *= 256)) {
          if (value2 < 0 && sub === 0 && this[offset + i - 1] !== 0) {
            sub = 1;
          }
          this[offset + i] = (value2 / mul >> 0) - sub & 255;
        }
        return offset + byteLength2;
      };
      Buffer.prototype.writeIntBE = function writeIntBE(value2, offset, byteLength2, noAssert) {
        value2 = +value2;
        offset = offset >>> 0;
        if (!noAssert) {
          const limit = Math.pow(2, 8 * byteLength2 - 1);
          checkInt(this, value2, offset, byteLength2, limit - 1, -limit);
        }
        let i = byteLength2 - 1;
        let mul = 1;
        let sub = 0;
        this[offset + i] = value2 & 255;
        while (--i >= 0 && (mul *= 256)) {
          if (value2 < 0 && sub === 0 && this[offset + i + 1] !== 0) {
            sub = 1;
          }
          this[offset + i] = (value2 / mul >> 0) - sub & 255;
        }
        return offset + byteLength2;
      };
      Buffer.prototype.writeInt8 = function writeInt8(value2, offset, noAssert) {
        value2 = +value2;
        offset = offset >>> 0;
        if (!noAssert) checkInt(this, value2, offset, 1, 127, -128);
        if (value2 < 0) value2 = 255 + value2 + 1;
        this[offset] = value2 & 255;
        return offset + 1;
      };
      Buffer.prototype.writeInt16LE = function writeInt16LE(value2, offset, noAssert) {
        value2 = +value2;
        offset = offset >>> 0;
        if (!noAssert) checkInt(this, value2, offset, 2, 32767, -32768);
        this[offset] = value2 & 255;
        this[offset + 1] = value2 >>> 8;
        return offset + 2;
      };
      Buffer.prototype.writeInt16BE = function writeInt16BE(value2, offset, noAssert) {
        value2 = +value2;
        offset = offset >>> 0;
        if (!noAssert) checkInt(this, value2, offset, 2, 32767, -32768);
        this[offset] = value2 >>> 8;
        this[offset + 1] = value2 & 255;
        return offset + 2;
      };
      Buffer.prototype.writeInt32LE = function writeInt32LE(value2, offset, noAssert) {
        value2 = +value2;
        offset = offset >>> 0;
        if (!noAssert) checkInt(this, value2, offset, 4, 2147483647, -2147483648);
        this[offset] = value2 & 255;
        this[offset + 1] = value2 >>> 8;
        this[offset + 2] = value2 >>> 16;
        this[offset + 3] = value2 >>> 24;
        return offset + 4;
      };
      Buffer.prototype.writeInt32BE = function writeInt32BE(value2, offset, noAssert) {
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
      Buffer.prototype.writeBigInt64LE = defineBigIntMethod(function writeBigInt64LE(value2, offset = 0) {
        return wrtBigUInt64LE(this, value2, offset, -BigInt("0x8000000000000000"), BigInt("0x7fffffffffffffff"));
      });
      Buffer.prototype.writeBigInt64BE = defineBigIntMethod(function writeBigInt64BE(value2, offset = 0) {
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
      Buffer.prototype.writeFloatLE = function writeFloatLE(value2, offset, noAssert) {
        return writeFloat(this, value2, offset, true, noAssert);
      };
      Buffer.prototype.writeFloatBE = function writeFloatBE(value2, offset, noAssert) {
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
      Buffer.prototype.writeDoubleLE = function writeDoubleLE(value2, offset, noAssert) {
        return writeDouble(this, value2, offset, true, noAssert);
      };
      Buffer.prototype.writeDoubleBE = function writeDoubleBE(value2, offset, noAssert) {
        return writeDouble(this, value2, offset, false, noAssert);
      };
      Buffer.prototype.copy = function copy(target, targetStart, start, end) {
        if (!Buffer.isBuffer(target)) throw new TypeError("argument should be a Buffer");
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
      Buffer.prototype.fill = function fill(val, start, end, encoding) {
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
          if (typeof encoding === "string" && !Buffer.isEncoding(encoding)) {
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
        let i;
        if (typeof val === "number") {
          for (i = start; i < end; ++i) {
            this[i] = val;
          }
        } else {
          const bytes = Buffer.isBuffer(val) ? val : Buffer.from(val, encoding);
          const len = bytes.length;
          if (len === 0) {
            throw new TypeError('The value "' + val + '" is invalid for argument "value"');
          }
          for (i = 0; i < end - start; ++i) {
            this[i + start] = bytes[i % len];
          }
        }
        return this;
      };
      const errors = {};
      function E(sym, getMessage, Base) {
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
      E(
        "ERR_BUFFER_OUT_OF_BOUNDS",
        function(name) {
          if (name) {
            return `${name} is outside of buffer bounds`;
          }
          return "Attempt to access memory outside buffer bounds";
        },
        RangeError
      );
      E(
        "ERR_INVALID_ARG_TYPE",
        function(name, actual) {
          return `The "${name}" argument must be of type number. Received type ${typeof actual}`;
        },
        TypeError
      );
      E(
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
        let i = val.length;
        const start = val[0] === "-" ? 1 : 0;
        for (; i >= start + 4; i -= 3) {
          res = `_${val.slice(i - 3, i)}${res}`;
        }
        return `${val.slice(0, i)}${res}`;
      }
      function checkBounds(buf, offset, byteLength2) {
        validateNumber(offset, "offset");
        if (buf[offset] === void 0 || buf[offset + byteLength2] === void 0) {
          boundsError(offset, buf.length - (byteLength2 + 1));
        }
      }
      function checkIntBI(value2, min, max, buf, offset, byteLength2) {
        if (value2 > max || value2 < min) {
          const n = typeof min === "bigint" ? "n" : "";
          let range;
          {
            if (min === 0 || min === BigInt(0)) {
              range = `>= 0${n} and < 2${n} ** ${(byteLength2 + 1) * 8}${n}`;
            } else {
              range = `>= -(2${n} ** ${(byteLength2 + 1) * 8 - 1}${n}) and < 2 ** ${(byteLength2 + 1) * 8 - 1}${n}`;
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
        for (let i = 0; i < length; ++i) {
          codePoint = string.charCodeAt(i);
          if (codePoint > 55295 && codePoint < 57344) {
            if (!leadSurrogate) {
              if (codePoint > 56319) {
                if ((units -= 3) > -1) bytes.push(239, 191, 189);
                continue;
              } else if (i + 1 === length) {
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
        for (let i = 0; i < str.length; ++i) {
          byteArray.push(str.charCodeAt(i) & 255);
        }
        return byteArray;
      }
      function utf16leToBytes(str, units) {
        let c, hi, lo;
        const byteArray = [];
        for (let i = 0; i < str.length; ++i) {
          if ((units -= 2) < 0) break;
          c = str.charCodeAt(i);
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
        let i;
        for (i = 0; i < length; ++i) {
          if (i + offset >= dst.length || i >= src2.length) break;
          dst[i + offset] = src2[i];
        }
        return i;
      }
      function isInstance(obj, type) {
        return obj instanceof type || obj != null && obj.constructor != null && obj.constructor.name != null && obj.constructor.name === type.name;
      }
      function numberIsNaN(obj) {
        return obj !== obj;
      }
      const hexSliceLookupTable = (function() {
        const alphabet2 = "0123456789abcdef";
        const table = new Array(256);
        for (let i = 0; i < 16; ++i) {
          const i16 = i * 16;
          for (let j = 0; j < 16; ++j) {
            table[i16 + j] = alphabet2[i] + alphabet2[j];
          }
        }
        return table;
      })();
      function defineBigIntMethod(fn) {
        return typeof BigInt === "undefined" ? BufferBigIntNotDefined : fn;
      }
      function BufferBigIntNotDefined() {
        throw new Error("BigInt not supported");
      }
    })(buffer$1);
    return buffer$1;
  }
  requireBuffer$1();
  var ReplicaRejectCode;
  (function(ReplicaRejectCode2) {
    ReplicaRejectCode2[ReplicaRejectCode2["SysFatal"] = 1] = "SysFatal";
    ReplicaRejectCode2[ReplicaRejectCode2["SysTransient"] = 2] = "SysTransient";
    ReplicaRejectCode2[ReplicaRejectCode2["DestinationInvalid"] = 3] = "DestinationInvalid";
    ReplicaRejectCode2[ReplicaRejectCode2["CanisterReject"] = 4] = "CanisterReject";
    ReplicaRejectCode2[ReplicaRejectCode2["CanisterError"] = 5] = "CanisterError";
  })(ReplicaRejectCode || (ReplicaRejectCode = {}));
  const alphabet = "abcdefghijklmnopqrstuvwxyz234567";
  const lookupTable = /* @__PURE__ */ Object.create(null);
  for (let i = 0; i < alphabet.length; i++) {
    lookupTable[alphabet[i]] = i;
  }
  lookupTable["0"] = lookupTable.o;
  lookupTable["1"] = lookupTable.i;
  function encode(input) {
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
  function decode(input) {
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
    const b = new Uint8Array(buf);
    let crc = -1;
    for (let i = 0; i < b.length; i++) {
      const byte = b[i];
      const t = (byte ^ crc) & 255;
      crc = lookUpTable[t] ^ crc >>> 8;
    }
    return (crc ^ -1) >>> 0;
  }
  const crypto$1 = typeof globalThis === "object" && "crypto" in globalThis ? globalThis.crypto : void 0;
  /*! noble-hashes - MIT License (c) 2022 Paul Miller (paulmillr.com) */
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
  function setBigUint64(view, byteOffset, value2, isLE) {
    if (typeof view.setBigUint64 === "function")
      return view.setBigUint64(byteOffset, value2, isLE);
    const _32n2 = BigInt(32);
    const _u32_max = BigInt(4294967295);
    const wh = Number(value2 >> _32n2 & _u32_max);
    const wl = Number(value2 & _u32_max);
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
      for (let i = pos; i < blockLen; i++)
        buffer2[i] = 0;
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
  const sha256$1 = /* @__PURE__ */ createHasher(() => new SHA256());
  const sha224$2 = /* @__PURE__ */ createHasher(() => new SHA224());
  const sha512 = /* @__PURE__ */ createHasher(() => new SHA512());
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
    var _a;
    return new Uint8Array(((_a = hexString.match(/.{1,2}/g)) !== null && _a !== void 0 ? _a : []).map((byte) => parseInt(byte, 16)));
  };
  const toHexString = (bytes) => bytes.reduce((str, byte) => str + byte.toString(16).padStart(2, "0"), "");
  class Principal {
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
      let arr = decode(canisterIdNoDash);
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
      const result = encode(array);
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
  function concat(...buffers) {
    const result = new Uint8Array(buffers.reduce((acc, curr) => acc + curr.byteLength, 0));
    let index = 0;
    for (const b of buffers) {
      result.set(new Uint8Array(b), index);
      index += b.byteLength;
    }
    return result.buffer;
  }
  function toHex(buffer2) {
    return [...new Uint8Array(buffer2)].map((x) => x.toString(16).padStart(2, "0")).join("");
  }
  const hexRe = new RegExp(/^[0-9a-fA-F]+$/);
  function fromHex(hex) {
    if (!hexRe.test(hex)) {
      throw new Error("Invalid hexadecimal string.");
    }
    const buffer2 = [...hex].reduce((acc, curr, i) => {
      acc[i / 2 | 0] = (acc[i / 2 | 0] || "") + curr;
      return acc;
    }, []).map((x) => Number.parseInt(x, 16));
    return new Uint8Array(buffer2).buffer;
  }
  function compare(b1, b2) {
    if (b1.byteLength !== b2.byteLength) {
      return b1.byteLength - b2.byteLength;
    }
    const u1 = new Uint8Array(b1);
    const u2 = new Uint8Array(b2);
    for (let i = 0; i < u1.length; i++) {
      if (u1[i] !== u2[i]) {
        return u1[i] - u2[i];
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
      const b = new Uint8Array(buf);
      const offset = this._view.byteLength;
      if (this._view.byteOffset + this._view.byteLength + b.byteLength >= this._buffer.byteLength) {
        this.alloc(b.byteLength);
      } else {
        this._view = new Uint8Array(this._buffer, this._view.byteOffset, this._view.byteLength + b.byteLength);
      }
      this._view.set(b, offset);
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
      const b = new ArrayBuffer((this._buffer.byteLength + amount) * 1.2 | 0);
      const v = new Uint8Array(b, 0, this._view.byteLength + amount);
      v.set(this._view);
      this._buffer = b;
      this._view = v;
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
      const i = Number(value2 & BigInt(127));
      value2 /= BigInt(128);
      if (value2 === BigInt(0)) {
        pipe.write(new Uint8Array([i]));
        break;
      } else {
        pipe.write(new Uint8Array([i | 128]));
      }
    }
    return pipe.buffer;
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
      const i = getLowerBytes(value2);
      value2 /= BigInt(128);
      if (isNeg && value2 === BigInt(0) && (i & 64) !== 0 || !isNeg && value2 === BigInt(0) && (i & 64) === 0) {
        pipe.write(new Uint8Array([i]));
        break;
      } else {
        pipe.write(new Uint8Array([i | 128]));
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
  function writeUIntLE(value2, byteLength) {
    if (BigInt(value2) < BigInt(0)) {
      throw new Error("Cannot write negative values.");
    }
    return writeIntLE(value2, byteLength);
  }
  function writeIntLE(value2, byteLength) {
    value2 = BigInt(value2);
    const pipe = new PipeArrayBuffer(new ArrayBuffer(Math.min(1, byteLength)), 0);
    let i = 0;
    let mul = BigInt(256);
    let sub = BigInt(0);
    let byte = Number(value2 % mul);
    pipe.write(new Uint8Array([byte]));
    while (++i < byteLength) {
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
    let i = 0;
    while (++i < byteLength) {
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
  function iexp2(n) {
    const nBig = BigInt(n);
    if (n < 0) {
      throw new RangeError("Input must be non-negative");
    }
    return BigInt(1) << nBig;
  }
  const toReadableString_max = 400;
  class Type {
    /* Display type name */
    display() {
      return this.name;
    }
    valueToString(x) {
      return toReadableString(x);
    }
    /* Implement `T` in the IDL spec, only needed for non-primitive types */
    buildTypeTable(typeTable) {
      if (!typeTable.has(this)) {
        this._buildTypeTableImpl(typeTable);
      }
    }
  }
  class PrimitiveType extends Type {
    checkType(t) {
      if (this.name !== t.name) {
        throw new Error(`type mismatch: type on the wire ${t.name}, expect type ${this.name}`);
      }
      return t;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _buildTypeTableImpl(typeTable) {
      return;
    }
  }
  class ConstructType extends Type {
    checkType(t) {
      if (t instanceof RecClass) {
        const ty = t.getType();
        if (typeof ty === "undefined") {
          throw new Error("type mismatch with uninitialized type");
        }
        return ty;
      }
      throw new Error(`type mismatch: type on the wire ${t.name}, expect type ${this.name}`);
    }
    encodeType(typeTable) {
      return typeTable.indexOf(this.name);
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
    accept(v, d) {
      return v.visitFloat(this, d);
    }
    covariant(x) {
      if (typeof x === "number" || x instanceof Number)
        return true;
      throw new Error(`Invalid ${this.display()} argument: ${toReadableString(x)}`);
    }
    encodeValue(x) {
      const buf = new ArrayBuffer(this._bits / 8);
      const view = new DataView(buf);
      if (this._bits === 32) {
        view.setFloat32(0, x, true);
      } else {
        view.setFloat64(0, x, true);
      }
      return buf;
    }
    encodeType() {
      const opcode = this._bits === 32 ? -13 : -14;
      return slebEncode(opcode);
    }
    decodeValue(b, t) {
      this.checkType(t);
      const bytes = safeRead(b, this._bits / 8);
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
    valueToString(x) {
      return x.toString();
    }
  }
  class FixedIntClass extends PrimitiveType {
    constructor(_bits) {
      super();
      this._bits = _bits;
    }
    accept(v, d) {
      return v.visitFixedInt(this, d);
    }
    covariant(x) {
      const min = iexp2(this._bits - 1) * BigInt(-1);
      const max = iexp2(this._bits - 1) - BigInt(1);
      let ok = false;
      if (typeof x === "bigint") {
        ok = x >= min && x <= max;
      } else if (Number.isInteger(x)) {
        const v = BigInt(x);
        ok = v >= min && v <= max;
      } else {
        ok = false;
      }
      if (ok)
        return true;
      throw new Error(`Invalid ${this.display()} argument: ${toReadableString(x)}`);
    }
    encodeValue(x) {
      return writeIntLE(x, this._bits / 8);
    }
    encodeType() {
      const offset = Math.log2(this._bits) - 3;
      return slebEncode(-9 - offset);
    }
    decodeValue(b, t) {
      this.checkType(t);
      const num = readIntLE(b, this._bits / 8);
      if (this._bits <= 32) {
        return Number(num);
      } else {
        return num;
      }
    }
    get name() {
      return `int${this._bits}`;
    }
    valueToString(x) {
      return x.toString();
    }
  }
  class FixedNatClass extends PrimitiveType {
    constructor(_bits) {
      super();
      this._bits = _bits;
    }
    accept(v, d) {
      return v.visitFixedNat(this, d);
    }
    covariant(x) {
      const max = iexp2(this._bits);
      let ok = false;
      if (typeof x === "bigint" && x >= BigInt(0)) {
        ok = x < max;
      } else if (Number.isInteger(x) && x >= 0) {
        const v = BigInt(x);
        ok = v < max;
      } else {
        ok = false;
      }
      if (ok)
        return true;
      throw new Error(`Invalid ${this.display()} argument: ${toReadableString(x)}`);
    }
    encodeValue(x) {
      return writeUIntLE(x, this._bits / 8);
    }
    encodeType() {
      const offset = Math.log2(this._bits) - 3;
      return slebEncode(-5 - offset);
    }
    decodeValue(b, t) {
      this.checkType(t);
      const num = readUIntLE(b, this._bits / 8);
      if (this._bits <= 32) {
        return Number(num);
      } else {
        return num;
      }
    }
    get name() {
      return `nat${this._bits}`;
    }
    valueToString(x) {
      return x.toString();
    }
  }
  class RecClass extends ConstructType {
    constructor() {
      super(...arguments);
      this._id = RecClass._counter++;
      this._type = void 0;
    }
    accept(v, d) {
      if (!this._type) {
        throw Error("Recursive type uninitialized.");
      }
      return v.visitRec(this, this._type, d);
    }
    fill(t) {
      this._type = t;
    }
    getType() {
      return this._type;
    }
    covariant(x) {
      if (this._type ? this._type.covariant(x) : false)
        return true;
      throw new Error(`Invalid ${this.display()} argument: ${toReadableString(x)}`);
    }
    encodeValue(x) {
      if (!this._type) {
        throw Error("Recursive type uninitialized.");
      }
      return this._type.encodeValue(x);
    }
    _buildTypeTableImpl(typeTable) {
      if (!this._type) {
        throw Error("Recursive type uninitialized.");
      }
      typeTable.add(this, new Uint8Array([]));
      this._type.buildTypeTable(typeTable);
      typeTable.merge(this, this._type.name);
    }
    decodeValue(b, t) {
      if (!this._type) {
        throw Error("Recursive type uninitialized.");
      }
      return this._type.decodeValue(b, t);
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
    valueToString(x) {
      if (!this._type) {
        throw Error("Recursive type uninitialized.");
      }
      return this._type.valueToString(x);
    }
  }
  RecClass._counter = 0;
  function toReadableString(x) {
    const str = JSON.stringify(x, (_key, value2) => typeof value2 === "bigint" ? `BigInt(${value2})` : value2);
    return str && str.length > toReadableString_max ? str.substring(0, toReadableString_max - 3) + "..." : str;
  }
  new FloatClass(32);
  new FloatClass(64);
  new FixedIntClass(8);
  new FixedIntClass(16);
  new FixedIntClass(32);
  new FixedIntClass(64);
  new FixedNatClass(8);
  new FixedNatClass(16);
  new FixedNatClass(32);
  new FixedNatClass(64);
  var src$1 = {};
  var buffer = {};
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
    for (var i = 0, len = code.length; i < len; ++i) {
      lookup[i] = code[i];
      revLookup[code.charCodeAt(i)] = i;
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
      var i2;
      for (i2 = 0; i2 < len2; i2 += 4) {
        tmp = revLookup[b64.charCodeAt(i2)] << 18 | revLookup[b64.charCodeAt(i2 + 1)] << 12 | revLookup[b64.charCodeAt(i2 + 2)] << 6 | revLookup[b64.charCodeAt(i2 + 3)];
        arr[curByte++] = tmp >> 16 & 255;
        arr[curByte++] = tmp >> 8 & 255;
        arr[curByte++] = tmp & 255;
      }
      if (placeHoldersLen === 2) {
        tmp = revLookup[b64.charCodeAt(i2)] << 2 | revLookup[b64.charCodeAt(i2 + 1)] >> 4;
        arr[curByte++] = tmp & 255;
      }
      if (placeHoldersLen === 1) {
        tmp = revLookup[b64.charCodeAt(i2)] << 10 | revLookup[b64.charCodeAt(i2 + 1)] << 4 | revLookup[b64.charCodeAt(i2 + 2)] >> 2;
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
      for (var i2 = start; i2 < end; i2 += 3) {
        tmp = (uint8[i2] << 16 & 16711680) + (uint8[i2 + 1] << 8 & 65280) + (uint8[i2 + 2] & 255);
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
      for (var i2 = 0, len22 = len2 - extraBytes; i2 < len22; i2 += maxChunkLength) {
        parts.push(encodeChunk(uint8, i2, i2 + maxChunkLength > len22 ? len22 : i2 + maxChunkLength));
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
      var e, m;
      var eLen = nBytes * 8 - mLen - 1;
      var eMax = (1 << eLen) - 1;
      var eBias = eMax >> 1;
      var nBits = -7;
      var i = isLE ? nBytes - 1 : 0;
      var d = isLE ? -1 : 1;
      var s = buffer2[offset + i];
      i += d;
      e = s & (1 << -nBits) - 1;
      s >>= -nBits;
      nBits += eLen;
      for (; nBits > 0; e = e * 256 + buffer2[offset + i], i += d, nBits -= 8) {
      }
      m = e & (1 << -nBits) - 1;
      e >>= -nBits;
      nBits += mLen;
      for (; nBits > 0; m = m * 256 + buffer2[offset + i], i += d, nBits -= 8) {
      }
      if (e === 0) {
        e = 1 - eBias;
      } else if (e === eMax) {
        return m ? NaN : (s ? -1 : 1) * Infinity;
      } else {
        m = m + Math.pow(2, mLen);
        e = e - eBias;
      }
      return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
    };
    ieee754.write = function(buffer2, value2, offset, isLE, mLen, nBytes) {
      var e, m, c;
      var eLen = nBytes * 8 - mLen - 1;
      var eMax = (1 << eLen) - 1;
      var eBias = eMax >> 1;
      var rt = mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0;
      var i = isLE ? 0 : nBytes - 1;
      var d = isLE ? 1 : -1;
      var s = value2 < 0 || value2 === 0 && 1 / value2 < 0 ? 1 : 0;
      value2 = Math.abs(value2);
      if (isNaN(value2) || value2 === Infinity) {
        m = isNaN(value2) ? 1 : 0;
        e = eMax;
      } else {
        e = Math.floor(Math.log(value2) / Math.LN2);
        if (value2 * (c = Math.pow(2, -e)) < 1) {
          e--;
          c *= 2;
        }
        if (e + eBias >= 1) {
          value2 += rt / c;
        } else {
          value2 += rt * Math.pow(2, 1 - eBias);
        }
        if (value2 * c >= 2) {
          e++;
          c /= 2;
        }
        if (e + eBias >= eMax) {
          m = 0;
          e = eMax;
        } else if (e + eBias >= 1) {
          m = (value2 * c - 1) * Math.pow(2, mLen);
          e = e + eBias;
        } else {
          m = value2 * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
          e = 0;
        }
      }
      for (; mLen >= 8; buffer2[offset + i] = m & 255, i += d, m /= 256, mLen -= 8) {
      }
      e = e << mLen | m;
      eLen += mLen;
      for (; eLen > 0; buffer2[offset + i] = e & 255, i += d, e /= 256, eLen -= 8) {
      }
      buffer2[offset + i - d] |= s * 128;
    };
    return ieee754;
  }
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
      exports.Buffer = Buffer;
      exports.SlowBuffer = SlowBuffer;
      exports.INSPECT_MAX_BYTES = 50;
      var K_MAX_LENGTH = 2147483647;
      exports.kMaxLength = K_MAX_LENGTH;
      Buffer.TYPED_ARRAY_SUPPORT = typedArraySupport();
      if (!Buffer.TYPED_ARRAY_SUPPORT && typeof console !== "undefined" && typeof console.error === "function") {
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
        } catch (e) {
          return false;
        }
      }
      Object.defineProperty(Buffer.prototype, "parent", {
        enumerable: true,
        get: function() {
          if (!Buffer.isBuffer(this)) return void 0;
          return this.buffer;
        }
      });
      Object.defineProperty(Buffer.prototype, "offset", {
        enumerable: true,
        get: function() {
          if (!Buffer.isBuffer(this)) return void 0;
          return this.byteOffset;
        }
      });
      function createBuffer(length) {
        if (length > K_MAX_LENGTH) {
          throw new RangeError('The value "' + length + '" is invalid for option "size"');
        }
        var buf = new Uint8Array(length);
        Object.setPrototypeOf(buf, Buffer.prototype);
        return buf;
      }
      function Buffer(arg, encodingOrOffset, length) {
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
      Buffer.poolSize = 8192;
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
          return Buffer.from(valueOf, encodingOrOffset, length);
        }
        var b = fromObject(value2);
        if (b) return b;
        if (typeof Symbol !== "undefined" && Symbol.toPrimitive != null && typeof value2[Symbol.toPrimitive] === "function") {
          return Buffer.from(
            value2[Symbol.toPrimitive]("string"),
            encodingOrOffset,
            length
          );
        }
        throw new TypeError(
          "The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " + typeof value2
        );
      }
      Buffer.from = function(value2, encodingOrOffset, length) {
        return from(value2, encodingOrOffset, length);
      };
      Object.setPrototypeOf(Buffer.prototype, Uint8Array.prototype);
      Object.setPrototypeOf(Buffer, Uint8Array);
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
      Buffer.alloc = function(size, fill, encoding) {
        return alloc(size, fill, encoding);
      };
      function allocUnsafe(size) {
        assertSize(size);
        return createBuffer(size < 0 ? 0 : checked(size) | 0);
      }
      Buffer.allocUnsafe = function(size) {
        return allocUnsafe(size);
      };
      Buffer.allocUnsafeSlow = function(size) {
        return allocUnsafe(size);
      };
      function fromString(string, encoding) {
        if (typeof encoding !== "string" || encoding === "") {
          encoding = "utf8";
        }
        if (!Buffer.isEncoding(encoding)) {
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
        for (var i = 0; i < length; i += 1) {
          buf[i] = array[i] & 255;
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
        Object.setPrototypeOf(buf, Buffer.prototype);
        return buf;
      }
      function fromObject(obj) {
        if (Buffer.isBuffer(obj)) {
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
        return Buffer.alloc(+length);
      }
      Buffer.isBuffer = function isBuffer(b) {
        return b != null && b._isBuffer === true && b !== Buffer.prototype;
      };
      Buffer.compare = function compare2(a, b) {
        if (isInstance(a, Uint8Array)) a = Buffer.from(a, a.offset, a.byteLength);
        if (isInstance(b, Uint8Array)) b = Buffer.from(b, b.offset, b.byteLength);
        if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
          throw new TypeError(
            'The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array'
          );
        }
        if (a === b) return 0;
        var x = a.length;
        var y = b.length;
        for (var i = 0, len = Math.min(x, y); i < len; ++i) {
          if (a[i] !== b[i]) {
            x = a[i];
            y = b[i];
            break;
          }
        }
        if (x < y) return -1;
        if (y < x) return 1;
        return 0;
      };
      Buffer.isEncoding = function isEncoding(encoding) {
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
      Buffer.concat = function concat2(list, length) {
        if (!Array.isArray(list)) {
          throw new TypeError('"list" argument must be an Array of Buffers');
        }
        if (list.length === 0) {
          return Buffer.alloc(0);
        }
        var i;
        if (length === void 0) {
          length = 0;
          for (i = 0; i < list.length; ++i) {
            length += list[i].length;
          }
        }
        var buffer2 = Buffer.allocUnsafe(length);
        var pos = 0;
        for (i = 0; i < list.length; ++i) {
          var buf = list[i];
          if (isInstance(buf, Uint8Array)) {
            if (pos + buf.length > buffer2.length) {
              Buffer.from(buf).copy(buffer2, pos);
            } else {
              Uint8Array.prototype.set.call(
                buffer2,
                buf,
                pos
              );
            }
          } else if (!Buffer.isBuffer(buf)) {
            throw new TypeError('"list" argument must be an Array of Buffers');
          } else {
            buf.copy(buffer2, pos);
          }
          pos += buf.length;
        }
        return buffer2;
      };
      function byteLength(string, encoding) {
        if (Buffer.isBuffer(string)) {
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
      Buffer.byteLength = byteLength;
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
      Buffer.prototype._isBuffer = true;
      function swap(b, n, m) {
        var i = b[n];
        b[n] = b[m];
        b[m] = i;
      }
      Buffer.prototype.swap16 = function swap16() {
        var len = this.length;
        if (len % 2 !== 0) {
          throw new RangeError("Buffer size must be a multiple of 16-bits");
        }
        for (var i = 0; i < len; i += 2) {
          swap(this, i, i + 1);
        }
        return this;
      };
      Buffer.prototype.swap32 = function swap32() {
        var len = this.length;
        if (len % 4 !== 0) {
          throw new RangeError("Buffer size must be a multiple of 32-bits");
        }
        for (var i = 0; i < len; i += 4) {
          swap(this, i, i + 3);
          swap(this, i + 1, i + 2);
        }
        return this;
      };
      Buffer.prototype.swap64 = function swap64() {
        var len = this.length;
        if (len % 8 !== 0) {
          throw new RangeError("Buffer size must be a multiple of 64-bits");
        }
        for (var i = 0; i < len; i += 8) {
          swap(this, i, i + 7);
          swap(this, i + 1, i + 6);
          swap(this, i + 2, i + 5);
          swap(this, i + 3, i + 4);
        }
        return this;
      };
      Buffer.prototype.toString = function toString() {
        var length = this.length;
        if (length === 0) return "";
        if (arguments.length === 0) return utf8Slice(this, 0, length);
        return slowToString.apply(this, arguments);
      };
      Buffer.prototype.toLocaleString = Buffer.prototype.toString;
      Buffer.prototype.equals = function equals(b) {
        if (!Buffer.isBuffer(b)) throw new TypeError("Argument must be a Buffer");
        if (this === b) return true;
        return Buffer.compare(this, b) === 0;
      };
      Buffer.prototype.inspect = function inspect() {
        var str = "";
        var max = exports.INSPECT_MAX_BYTES;
        str = this.toString("hex", 0, max).replace(/(.{2})/g, "$1 ").trim();
        if (this.length > max) str += " ... ";
        return "<Buffer " + str + ">";
      };
      if (customInspectSymbol) {
        Buffer.prototype[customInspectSymbol] = Buffer.prototype.inspect;
      }
      Buffer.prototype.compare = function compare2(target, start, end, thisStart, thisEnd) {
        if (isInstance(target, Uint8Array)) {
          target = Buffer.from(target, target.offset, target.byteLength);
        }
        if (!Buffer.isBuffer(target)) {
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
        var x = thisEnd - thisStart;
        var y = end - start;
        var len = Math.min(x, y);
        var thisCopy = this.slice(thisStart, thisEnd);
        var targetCopy = target.slice(start, end);
        for (var i = 0; i < len; ++i) {
          if (thisCopy[i] !== targetCopy[i]) {
            x = thisCopy[i];
            y = targetCopy[i];
            break;
          }
        }
        if (x < y) return -1;
        if (y < x) return 1;
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
          val = Buffer.from(val, encoding);
        }
        if (Buffer.isBuffer(val)) {
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
        function read(buf, i2) {
          if (indexSize === 1) {
            return buf[i2];
          } else {
            return buf.readUInt16BE(i2 * indexSize);
          }
        }
        var i;
        if (dir) {
          var foundIndex = -1;
          for (i = byteOffset; i < arrLength; i++) {
            if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
              if (foundIndex === -1) foundIndex = i;
              if (i - foundIndex + 1 === valLength) return foundIndex * indexSize;
            } else {
              if (foundIndex !== -1) i -= i - foundIndex;
              foundIndex = -1;
            }
          }
        } else {
          if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength;
          for (i = byteOffset; i >= 0; i--) {
            var found = true;
            for (var j = 0; j < valLength; j++) {
              if (read(arr, i + j) !== read(val, j)) {
                found = false;
                break;
              }
            }
            if (found) return i;
          }
        }
        return -1;
      }
      Buffer.prototype.includes = function includes(val, byteOffset, encoding) {
        return this.indexOf(val, byteOffset, encoding) !== -1;
      };
      Buffer.prototype.indexOf = function indexOf(val, byteOffset, encoding) {
        return bidirectionalIndexOf(this, val, byteOffset, encoding, true);
      };
      Buffer.prototype.lastIndexOf = function lastIndexOf(val, byteOffset, encoding) {
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
        for (var i = 0; i < length; ++i) {
          var parsed = parseInt(string.substr(i * 2, 2), 16);
          if (numberIsNaN(parsed)) return i;
          buf[offset + i] = parsed;
        }
        return i;
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
      Buffer.prototype.write = function write(string, offset, length, encoding) {
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
      Buffer.prototype.toJSON = function toJSON() {
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
        var i = start;
        while (i < end) {
          var firstByte = buf[i];
          var codePoint = null;
          var bytesPerSequence = firstByte > 239 ? 4 : firstByte > 223 ? 3 : firstByte > 191 ? 2 : 1;
          if (i + bytesPerSequence <= end) {
            var secondByte, thirdByte, fourthByte, tempCodePoint;
            switch (bytesPerSequence) {
              case 1:
                if (firstByte < 128) {
                  codePoint = firstByte;
                }
                break;
              case 2:
                secondByte = buf[i + 1];
                if ((secondByte & 192) === 128) {
                  tempCodePoint = (firstByte & 31) << 6 | secondByte & 63;
                  if (tempCodePoint > 127) {
                    codePoint = tempCodePoint;
                  }
                }
                break;
              case 3:
                secondByte = buf[i + 1];
                thirdByte = buf[i + 2];
                if ((secondByte & 192) === 128 && (thirdByte & 192) === 128) {
                  tempCodePoint = (firstByte & 15) << 12 | (secondByte & 63) << 6 | thirdByte & 63;
                  if (tempCodePoint > 2047 && (tempCodePoint < 55296 || tempCodePoint > 57343)) {
                    codePoint = tempCodePoint;
                  }
                }
                break;
              case 4:
                secondByte = buf[i + 1];
                thirdByte = buf[i + 2];
                fourthByte = buf[i + 3];
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
          i += bytesPerSequence;
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
        var i = 0;
        while (i < len) {
          res += String.fromCharCode.apply(
            String,
            codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
          );
        }
        return res;
      }
      function asciiSlice(buf, start, end) {
        var ret = "";
        end = Math.min(buf.length, end);
        for (var i = start; i < end; ++i) {
          ret += String.fromCharCode(buf[i] & 127);
        }
        return ret;
      }
      function latin1Slice(buf, start, end) {
        var ret = "";
        end = Math.min(buf.length, end);
        for (var i = start; i < end; ++i) {
          ret += String.fromCharCode(buf[i]);
        }
        return ret;
      }
      function hexSlice(buf, start, end) {
        var len = buf.length;
        if (!start || start < 0) start = 0;
        if (!end || end < 0 || end > len) end = len;
        var out = "";
        for (var i = start; i < end; ++i) {
          out += hexSliceLookupTable[buf[i]];
        }
        return out;
      }
      function utf16leSlice(buf, start, end) {
        var bytes = buf.slice(start, end);
        var res = "";
        for (var i = 0; i < bytes.length - 1; i += 2) {
          res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256);
        }
        return res;
      }
      Buffer.prototype.slice = function slice(start, end) {
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
        Object.setPrototypeOf(newBuf, Buffer.prototype);
        return newBuf;
      };
      function checkOffset(offset, ext, length) {
        if (offset % 1 !== 0 || offset < 0) throw new RangeError("offset is not uint");
        if (offset + ext > length) throw new RangeError("Trying to access beyond buffer length");
      }
      Buffer.prototype.readUintLE = Buffer.prototype.readUIntLE = function readUIntLE2(offset, byteLength2, noAssert) {
        offset = offset >>> 0;
        byteLength2 = byteLength2 >>> 0;
        if (!noAssert) checkOffset(offset, byteLength2, this.length);
        var val = this[offset];
        var mul = 1;
        var i = 0;
        while (++i < byteLength2 && (mul *= 256)) {
          val += this[offset + i] * mul;
        }
        return val;
      };
      Buffer.prototype.readUintBE = Buffer.prototype.readUIntBE = function readUIntBE(offset, byteLength2, noAssert) {
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
      Buffer.prototype.readUint8 = Buffer.prototype.readUInt8 = function readUInt8(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 1, this.length);
        return this[offset];
      };
      Buffer.prototype.readUint16LE = Buffer.prototype.readUInt16LE = function readUInt16LE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 2, this.length);
        return this[offset] | this[offset + 1] << 8;
      };
      Buffer.prototype.readUint16BE = Buffer.prototype.readUInt16BE = function readUInt16BE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 2, this.length);
        return this[offset] << 8 | this[offset + 1];
      };
      Buffer.prototype.readUint32LE = Buffer.prototype.readUInt32LE = function readUInt32LE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 4, this.length);
        return (this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16) + this[offset + 3] * 16777216;
      };
      Buffer.prototype.readUint32BE = Buffer.prototype.readUInt32BE = function readUInt32BE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 4, this.length);
        return this[offset] * 16777216 + (this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3]);
      };
      Buffer.prototype.readIntLE = function readIntLE2(offset, byteLength2, noAssert) {
        offset = offset >>> 0;
        byteLength2 = byteLength2 >>> 0;
        if (!noAssert) checkOffset(offset, byteLength2, this.length);
        var val = this[offset];
        var mul = 1;
        var i = 0;
        while (++i < byteLength2 && (mul *= 256)) {
          val += this[offset + i] * mul;
        }
        mul *= 128;
        if (val >= mul) val -= Math.pow(2, 8 * byteLength2);
        return val;
      };
      Buffer.prototype.readIntBE = function readIntBE(offset, byteLength2, noAssert) {
        offset = offset >>> 0;
        byteLength2 = byteLength2 >>> 0;
        if (!noAssert) checkOffset(offset, byteLength2, this.length);
        var i = byteLength2;
        var mul = 1;
        var val = this[offset + --i];
        while (i > 0 && (mul *= 256)) {
          val += this[offset + --i] * mul;
        }
        mul *= 128;
        if (val >= mul) val -= Math.pow(2, 8 * byteLength2);
        return val;
      };
      Buffer.prototype.readInt8 = function readInt8(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 1, this.length);
        if (!(this[offset] & 128)) return this[offset];
        return (255 - this[offset] + 1) * -1;
      };
      Buffer.prototype.readInt16LE = function readInt16LE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 2, this.length);
        var val = this[offset] | this[offset + 1] << 8;
        return val & 32768 ? val | 4294901760 : val;
      };
      Buffer.prototype.readInt16BE = function readInt16BE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 2, this.length);
        var val = this[offset + 1] | this[offset] << 8;
        return val & 32768 ? val | 4294901760 : val;
      };
      Buffer.prototype.readInt32LE = function readInt32LE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 4, this.length);
        return this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16 | this[offset + 3] << 24;
      };
      Buffer.prototype.readInt32BE = function readInt32BE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 4, this.length);
        return this[offset] << 24 | this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3];
      };
      Buffer.prototype.readFloatLE = function readFloatLE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 4, this.length);
        return ieee7542.read(this, offset, true, 23, 4);
      };
      Buffer.prototype.readFloatBE = function readFloatBE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 4, this.length);
        return ieee7542.read(this, offset, false, 23, 4);
      };
      Buffer.prototype.readDoubleLE = function readDoubleLE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 8, this.length);
        return ieee7542.read(this, offset, true, 52, 8);
      };
      Buffer.prototype.readDoubleBE = function readDoubleBE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 8, this.length);
        return ieee7542.read(this, offset, false, 52, 8);
      };
      function checkInt(buf, value2, offset, ext, max, min) {
        if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance');
        if (value2 > max || value2 < min) throw new RangeError('"value" argument is out of bounds');
        if (offset + ext > buf.length) throw new RangeError("Index out of range");
      }
      Buffer.prototype.writeUintLE = Buffer.prototype.writeUIntLE = function writeUIntLE2(value2, offset, byteLength2, noAssert) {
        value2 = +value2;
        offset = offset >>> 0;
        byteLength2 = byteLength2 >>> 0;
        if (!noAssert) {
          var maxBytes = Math.pow(2, 8 * byteLength2) - 1;
          checkInt(this, value2, offset, byteLength2, maxBytes, 0);
        }
        var mul = 1;
        var i = 0;
        this[offset] = value2 & 255;
        while (++i < byteLength2 && (mul *= 256)) {
          this[offset + i] = value2 / mul & 255;
        }
        return offset + byteLength2;
      };
      Buffer.prototype.writeUintBE = Buffer.prototype.writeUIntBE = function writeUIntBE(value2, offset, byteLength2, noAssert) {
        value2 = +value2;
        offset = offset >>> 0;
        byteLength2 = byteLength2 >>> 0;
        if (!noAssert) {
          var maxBytes = Math.pow(2, 8 * byteLength2) - 1;
          checkInt(this, value2, offset, byteLength2, maxBytes, 0);
        }
        var i = byteLength2 - 1;
        var mul = 1;
        this[offset + i] = value2 & 255;
        while (--i >= 0 && (mul *= 256)) {
          this[offset + i] = value2 / mul & 255;
        }
        return offset + byteLength2;
      };
      Buffer.prototype.writeUint8 = Buffer.prototype.writeUInt8 = function writeUInt8(value2, offset, noAssert) {
        value2 = +value2;
        offset = offset >>> 0;
        if (!noAssert) checkInt(this, value2, offset, 1, 255, 0);
        this[offset] = value2 & 255;
        return offset + 1;
      };
      Buffer.prototype.writeUint16LE = Buffer.prototype.writeUInt16LE = function writeUInt16LE(value2, offset, noAssert) {
        value2 = +value2;
        offset = offset >>> 0;
        if (!noAssert) checkInt(this, value2, offset, 2, 65535, 0);
        this[offset] = value2 & 255;
        this[offset + 1] = value2 >>> 8;
        return offset + 2;
      };
      Buffer.prototype.writeUint16BE = Buffer.prototype.writeUInt16BE = function writeUInt16BE(value2, offset, noAssert) {
        value2 = +value2;
        offset = offset >>> 0;
        if (!noAssert) checkInt(this, value2, offset, 2, 65535, 0);
        this[offset] = value2 >>> 8;
        this[offset + 1] = value2 & 255;
        return offset + 2;
      };
      Buffer.prototype.writeUint32LE = Buffer.prototype.writeUInt32LE = function writeUInt32LE(value2, offset, noAssert) {
        value2 = +value2;
        offset = offset >>> 0;
        if (!noAssert) checkInt(this, value2, offset, 4, 4294967295, 0);
        this[offset + 3] = value2 >>> 24;
        this[offset + 2] = value2 >>> 16;
        this[offset + 1] = value2 >>> 8;
        this[offset] = value2 & 255;
        return offset + 4;
      };
      Buffer.prototype.writeUint32BE = Buffer.prototype.writeUInt32BE = function writeUInt32BE(value2, offset, noAssert) {
        value2 = +value2;
        offset = offset >>> 0;
        if (!noAssert) checkInt(this, value2, offset, 4, 4294967295, 0);
        this[offset] = value2 >>> 24;
        this[offset + 1] = value2 >>> 16;
        this[offset + 2] = value2 >>> 8;
        this[offset + 3] = value2 & 255;
        return offset + 4;
      };
      Buffer.prototype.writeIntLE = function writeIntLE2(value2, offset, byteLength2, noAssert) {
        value2 = +value2;
        offset = offset >>> 0;
        if (!noAssert) {
          var limit = Math.pow(2, 8 * byteLength2 - 1);
          checkInt(this, value2, offset, byteLength2, limit - 1, -limit);
        }
        var i = 0;
        var mul = 1;
        var sub = 0;
        this[offset] = value2 & 255;
        while (++i < byteLength2 && (mul *= 256)) {
          if (value2 < 0 && sub === 0 && this[offset + i - 1] !== 0) {
            sub = 1;
          }
          this[offset + i] = (value2 / mul >> 0) - sub & 255;
        }
        return offset + byteLength2;
      };
      Buffer.prototype.writeIntBE = function writeIntBE(value2, offset, byteLength2, noAssert) {
        value2 = +value2;
        offset = offset >>> 0;
        if (!noAssert) {
          var limit = Math.pow(2, 8 * byteLength2 - 1);
          checkInt(this, value2, offset, byteLength2, limit - 1, -limit);
        }
        var i = byteLength2 - 1;
        var mul = 1;
        var sub = 0;
        this[offset + i] = value2 & 255;
        while (--i >= 0 && (mul *= 256)) {
          if (value2 < 0 && sub === 0 && this[offset + i + 1] !== 0) {
            sub = 1;
          }
          this[offset + i] = (value2 / mul >> 0) - sub & 255;
        }
        return offset + byteLength2;
      };
      Buffer.prototype.writeInt8 = function writeInt8(value2, offset, noAssert) {
        value2 = +value2;
        offset = offset >>> 0;
        if (!noAssert) checkInt(this, value2, offset, 1, 127, -128);
        if (value2 < 0) value2 = 255 + value2 + 1;
        this[offset] = value2 & 255;
        return offset + 1;
      };
      Buffer.prototype.writeInt16LE = function writeInt16LE(value2, offset, noAssert) {
        value2 = +value2;
        offset = offset >>> 0;
        if (!noAssert) checkInt(this, value2, offset, 2, 32767, -32768);
        this[offset] = value2 & 255;
        this[offset + 1] = value2 >>> 8;
        return offset + 2;
      };
      Buffer.prototype.writeInt16BE = function writeInt16BE(value2, offset, noAssert) {
        value2 = +value2;
        offset = offset >>> 0;
        if (!noAssert) checkInt(this, value2, offset, 2, 32767, -32768);
        this[offset] = value2 >>> 8;
        this[offset + 1] = value2 & 255;
        return offset + 2;
      };
      Buffer.prototype.writeInt32LE = function writeInt32LE(value2, offset, noAssert) {
        value2 = +value2;
        offset = offset >>> 0;
        if (!noAssert) checkInt(this, value2, offset, 4, 2147483647, -2147483648);
        this[offset] = value2 & 255;
        this[offset + 1] = value2 >>> 8;
        this[offset + 2] = value2 >>> 16;
        this[offset + 3] = value2 >>> 24;
        return offset + 4;
      };
      Buffer.prototype.writeInt32BE = function writeInt32BE(value2, offset, noAssert) {
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
      Buffer.prototype.writeFloatLE = function writeFloatLE(value2, offset, noAssert) {
        return writeFloat(this, value2, offset, true, noAssert);
      };
      Buffer.prototype.writeFloatBE = function writeFloatBE(value2, offset, noAssert) {
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
      Buffer.prototype.writeDoubleLE = function writeDoubleLE(value2, offset, noAssert) {
        return writeDouble(this, value2, offset, true, noAssert);
      };
      Buffer.prototype.writeDoubleBE = function writeDoubleBE(value2, offset, noAssert) {
        return writeDouble(this, value2, offset, false, noAssert);
      };
      Buffer.prototype.copy = function copy(target, targetStart, start, end) {
        if (!Buffer.isBuffer(target)) throw new TypeError("argument should be a Buffer");
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
      Buffer.prototype.fill = function fill(val, start, end, encoding) {
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
          if (typeof encoding === "string" && !Buffer.isEncoding(encoding)) {
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
        var i;
        if (typeof val === "number") {
          for (i = start; i < end; ++i) {
            this[i] = val;
          }
        } else {
          var bytes = Buffer.isBuffer(val) ? val : Buffer.from(val, encoding);
          var len = bytes.length;
          if (len === 0) {
            throw new TypeError('The value "' + val + '" is invalid for argument "value"');
          }
          for (i = 0; i < end - start; ++i) {
            this[i + start] = bytes[i % len];
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
        for (var i = 0; i < length; ++i) {
          codePoint = string.charCodeAt(i);
          if (codePoint > 55295 && codePoint < 57344) {
            if (!leadSurrogate) {
              if (codePoint > 56319) {
                if ((units -= 3) > -1) bytes.push(239, 191, 189);
                continue;
              } else if (i + 1 === length) {
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
        for (var i = 0; i < str.length; ++i) {
          byteArray.push(str.charCodeAt(i) & 255);
        }
        return byteArray;
      }
      function utf16leToBytes(str, units) {
        var c, hi, lo;
        var byteArray = [];
        for (var i = 0; i < str.length; ++i) {
          if ((units -= 2) < 0) break;
          c = str.charCodeAt(i);
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
        for (var i = 0; i < length; ++i) {
          if (i + offset >= dst.length || i >= src2.length) break;
          dst[i + offset] = src2[i];
        }
        return i;
      }
      function isInstance(obj, type) {
        return obj instanceof type || obj != null && obj.constructor != null && obj.constructor.name != null && obj.constructor.name === type.name;
      }
      function numberIsNaN(obj) {
        return obj !== obj;
      }
      var hexSliceLookupTable = (function() {
        var alphabet2 = "0123456789abcdef";
        var table = new Array(256);
        for (var i = 0; i < 16; ++i) {
          var i16 = i * 16;
          for (var j = 0; j < 16; ++j) {
            table[i16 + j] = alphabet2[i] + alphabet2[j];
          }
        }
        return table;
      })();
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
          var div, convertBase, parseNumeric, P = BigNumber2.prototype = { constructor: BigNumber2, toString: null, valueOf: null }, ONE = new BigNumber2(1), DECIMAL_PLACES = 20, ROUNDING_MODE = 4, TO_EXP_NEG = -7, TO_EXP_POS = 21, MIN_EXP = -1e7, MAX_EXP = 1e7, CRYPTO = false, MODULO_MODE = 1, POW_PRECISION = 0, FORMAT = {
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
          function BigNumber2(v, b) {
            var alphabet2, c, caseChanged, e, i, isNum, len, str, x = this;
            if (!(x instanceof BigNumber2)) return new BigNumber2(v, b);
            if (b == null) {
              if (v && v._isBigNumber === true) {
                x.s = v.s;
                if (!v.c || v.e > MAX_EXP) {
                  x.c = x.e = null;
                } else if (v.e < MIN_EXP) {
                  x.c = [x.e = 0];
                } else {
                  x.e = v.e;
                  x.c = v.c.slice();
                }
                return;
              }
              if ((isNum = typeof v == "number") && v * 0 == 0) {
                x.s = 1 / v < 0 ? (v = -v, -1) : 1;
                if (v === ~~v) {
                  for (e = 0, i = v; i >= 10; i /= 10, e++) ;
                  if (e > MAX_EXP) {
                    x.c = x.e = null;
                  } else {
                    x.e = e;
                    x.c = [v];
                  }
                  return;
                }
                str = String(v);
              } else {
                if (!isNumeric.test(str = String(v))) return parseNumeric(x, str, isNum);
                x.s = str.charCodeAt(0) == 45 ? (str = str.slice(1), -1) : 1;
              }
              if ((e = str.indexOf(".")) > -1) str = str.replace(".", "");
              if ((i = str.search(/e/i)) > 0) {
                if (e < 0) e = i;
                e += +str.slice(i + 1);
                str = str.substring(0, i);
              } else if (e < 0) {
                e = str.length;
              }
            } else {
              intCheck(b, 2, ALPHABET.length, "Base");
              if (b == 10 && alphabetHasNormalDecimalDigits) {
                x = new BigNumber2(v);
                return round(x, DECIMAL_PLACES + x.e + 1, ROUNDING_MODE);
              }
              str = String(v);
              if (isNum = typeof v == "number") {
                if (v * 0 != 0) return parseNumeric(x, str, isNum, b);
                x.s = 1 / v < 0 ? (str = str.slice(1), -1) : 1;
                if (BigNumber2.DEBUG && str.replace(/^0\.0*|\./, "").length > 15) {
                  throw Error(tooManyDigits + v);
                }
              } else {
                x.s = str.charCodeAt(0) === 45 ? (str = str.slice(1), -1) : 1;
              }
              alphabet2 = ALPHABET.slice(0, b);
              e = i = 0;
              for (len = str.length; i < len; i++) {
                if (alphabet2.indexOf(c = str.charAt(i)) < 0) {
                  if (c == ".") {
                    if (i > e) {
                      e = len;
                      continue;
                    }
                  } else if (!caseChanged) {
                    if (str == str.toUpperCase() && (str = str.toLowerCase()) || str == str.toLowerCase() && (str = str.toUpperCase())) {
                      caseChanged = true;
                      i = -1;
                      e = 0;
                      continue;
                    }
                  }
                  return parseNumeric(x, String(v), isNum, b);
                }
              }
              isNum = false;
              str = convertBase(str, b, 10, x.s);
              if ((e = str.indexOf(".")) > -1) str = str.replace(".", "");
              else e = str.length;
            }
            for (i = 0; str.charCodeAt(i) === 48; i++) ;
            for (len = str.length; str.charCodeAt(--len) === 48; ) ;
            if (str = str.slice(i, ++len)) {
              len -= i;
              if (isNum && BigNumber2.DEBUG && len > 15 && (v > MAX_SAFE_INTEGER || v !== mathfloor(v))) {
                throw Error(tooManyDigits + x.s * v);
              }
              if ((e = e - i - 1) > MAX_EXP) {
                x.c = x.e = null;
              } else if (e < MIN_EXP) {
                x.c = [x.e = 0];
              } else {
                x.e = e;
                x.c = [];
                i = (e + 1) % LOG_BASE;
                if (e < 0) i += LOG_BASE;
                if (i < len) {
                  if (i) x.c.push(+str.slice(0, i));
                  for (len -= LOG_BASE; i < len; ) {
                    x.c.push(+str.slice(i, i += LOG_BASE));
                  }
                  i = LOG_BASE - (str = str.slice(i)).length;
                } else {
                  i -= len;
                }
                for (; i--; str += "0") ;
                x.c.push(+str);
              }
            } else {
              x.c = [x.e = 0];
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
            var p, v;
            if (obj != null) {
              if (typeof obj == "object") {
                if (obj.hasOwnProperty(p = "DECIMAL_PLACES")) {
                  v = obj[p];
                  intCheck(v, 0, MAX, p);
                  DECIMAL_PLACES = v;
                }
                if (obj.hasOwnProperty(p = "ROUNDING_MODE")) {
                  v = obj[p];
                  intCheck(v, 0, 8, p);
                  ROUNDING_MODE = v;
                }
                if (obj.hasOwnProperty(p = "EXPONENTIAL_AT")) {
                  v = obj[p];
                  if (v && v.pop) {
                    intCheck(v[0], -MAX, 0, p);
                    intCheck(v[1], 0, MAX, p);
                    TO_EXP_NEG = v[0];
                    TO_EXP_POS = v[1];
                  } else {
                    intCheck(v, -MAX, MAX, p);
                    TO_EXP_NEG = -(TO_EXP_POS = v < 0 ? -v : v);
                  }
                }
                if (obj.hasOwnProperty(p = "RANGE")) {
                  v = obj[p];
                  if (v && v.pop) {
                    intCheck(v[0], -MAX, -1, p);
                    intCheck(v[1], 1, MAX, p);
                    MIN_EXP = v[0];
                    MAX_EXP = v[1];
                  } else {
                    intCheck(v, -MAX, MAX, p);
                    if (v) {
                      MIN_EXP = -(MAX_EXP = v < 0 ? -v : v);
                    } else {
                      throw Error(bignumberError + p + " cannot be zero: " + v);
                    }
                  }
                }
                if (obj.hasOwnProperty(p = "CRYPTO")) {
                  v = obj[p];
                  if (v === !!v) {
                    if (v) {
                      if (typeof crypto != "undefined" && crypto && (crypto.getRandomValues || crypto.randomBytes)) {
                        CRYPTO = v;
                      } else {
                        CRYPTO = !v;
                        throw Error(bignumberError + "crypto unavailable");
                      }
                    } else {
                      CRYPTO = v;
                    }
                  } else {
                    throw Error(bignumberError + p + " not true or false: " + v);
                  }
                }
                if (obj.hasOwnProperty(p = "MODULO_MODE")) {
                  v = obj[p];
                  intCheck(v, 0, 9, p);
                  MODULO_MODE = v;
                }
                if (obj.hasOwnProperty(p = "POW_PRECISION")) {
                  v = obj[p];
                  intCheck(v, 0, MAX, p);
                  POW_PRECISION = v;
                }
                if (obj.hasOwnProperty(p = "FORMAT")) {
                  v = obj[p];
                  if (typeof v == "object") FORMAT = v;
                  else throw Error(bignumberError + p + " not an object: " + v);
                }
                if (obj.hasOwnProperty(p = "ALPHABET")) {
                  v = obj[p];
                  if (typeof v == "string" && !/^.?$|[+\-.\s]|(.).*\1/.test(v)) {
                    alphabetHasNormalDecimalDigits = v.slice(0, 10) == "0123456789";
                    ALPHABET = v;
                  } else {
                    throw Error(bignumberError + p + " invalid: " + v);
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
          BigNumber2.isBigNumber = function(v) {
            if (!v || v._isBigNumber !== true) return false;
            if (!BigNumber2.DEBUG) return true;
            var i, n, c = v.c, e = v.e, s = v.s;
            out: if ({}.toString.call(c) == "[object Array]") {
              if ((s === 1 || s === -1) && e >= -MAX && e <= MAX && e === mathfloor(e)) {
                if (c[0] === 0) {
                  if (e === 0 && c.length === 1) return true;
                  break out;
                }
                i = (e + 1) % LOG_BASE;
                if (i < 1) i += LOG_BASE;
                if (String(c[0]).length == i) {
                  for (i = 0; i < c.length; i++) {
                    n = c[i];
                    if (n < 0 || n >= BASE || n !== mathfloor(n)) break out;
                  }
                  if (n !== 0) return true;
                }
              }
            } else if (c === null && e === null && (s === null || s === 1 || s === -1)) {
              return true;
            }
            throw Error(bignumberError + "Invalid BigNumber: " + v);
          };
          BigNumber2.maximum = BigNumber2.max = function() {
            return maxOrMin(arguments, -1);
          };
          BigNumber2.minimum = BigNumber2.min = function() {
            return maxOrMin(arguments, 1);
          };
          BigNumber2.random = (function() {
            var pow2_53 = 9007199254740992;
            var random53bitInt = Math.random() * pow2_53 & 2097151 ? function() {
              return mathfloor(Math.random() * pow2_53);
            } : function() {
              return (Math.random() * 1073741824 | 0) * 8388608 + (Math.random() * 8388608 | 0);
            };
            return function(dp) {
              var a, b, e, k, v, i = 0, c = [], rand = new BigNumber2(ONE);
              if (dp == null) dp = DECIMAL_PLACES;
              else intCheck(dp, 0, MAX);
              k = mathceil(dp / LOG_BASE);
              if (CRYPTO) {
                if (crypto.getRandomValues) {
                  a = crypto.getRandomValues(new Uint32Array(k *= 2));
                  for (; i < k; ) {
                    v = a[i] * 131072 + (a[i + 1] >>> 11);
                    if (v >= 9e15) {
                      b = crypto.getRandomValues(new Uint32Array(2));
                      a[i] = b[0];
                      a[i + 1] = b[1];
                    } else {
                      c.push(v % 1e14);
                      i += 2;
                    }
                  }
                  i = k / 2;
                } else if (crypto.randomBytes) {
                  a = crypto.randomBytes(k *= 7);
                  for (; i < k; ) {
                    v = (a[i] & 31) * 281474976710656 + a[i + 1] * 1099511627776 + a[i + 2] * 4294967296 + a[i + 3] * 16777216 + (a[i + 4] << 16) + (a[i + 5] << 8) + a[i + 6];
                    if (v >= 9e15) {
                      crypto.randomBytes(7).copy(a, i);
                    } else {
                      c.push(v % 1e14);
                      i += 7;
                    }
                  }
                  i = k / 7;
                } else {
                  CRYPTO = false;
                  throw Error(bignumberError + "crypto unavailable");
                }
              }
              if (!CRYPTO) {
                for (; i < k; ) {
                  v = random53bitInt();
                  if (v < 9e15) c[i++] = v % 1e14;
                }
              }
              k = c[--i];
              dp %= LOG_BASE;
              if (k && dp) {
                v = POWS_TEN[LOG_BASE - dp];
                c[i] = mathfloor(k / v) * v;
              }
              for (; c[i] === 0; c.pop(), i--) ;
              if (i < 0) {
                c = [e = 0];
              } else {
                for (e = -1; c[0] === 0; c.splice(0, 1), e -= LOG_BASE) ;
                for (i = 1, v = c[0]; v >= 10; v /= 10, i++) ;
                if (i < LOG_BASE) e -= LOG_BASE - i;
              }
              rand.e = e;
              rand.c = c;
              return rand;
            };
          })();
          BigNumber2.sum = function() {
            var i = 1, args = arguments, sum = new BigNumber2(args[0]);
            for (; i < args.length; ) sum = sum.plus(args[i++]);
            return sum;
          };
          convertBase = /* @__PURE__ */ (function() {
            var decimal = "0123456789";
            function toBaseOut(str, baseIn, baseOut, alphabet2) {
              var j, arr = [0], arrL, i = 0, len = str.length;
              for (; i < len; ) {
                for (arrL = arr.length; arrL--; arr[arrL] *= baseIn) ;
                arr[0] += alphabet2.indexOf(str.charAt(i++));
                for (j = 0; j < arr.length; j++) {
                  if (arr[j] > baseOut - 1) {
                    if (arr[j + 1] == null) arr[j + 1] = 0;
                    arr[j + 1] += arr[j] / baseOut | 0;
                    arr[j] %= baseOut;
                  }
                }
              }
              return arr.reverse();
            }
            return function(str, baseIn, baseOut, sign, callerIsToString) {
              var alphabet2, d, e, k, r, x, xc, y, i = str.indexOf("."), dp = DECIMAL_PLACES, rm = ROUNDING_MODE;
              if (i >= 0) {
                k = POW_PRECISION;
                POW_PRECISION = 0;
                str = str.replace(".", "");
                y = new BigNumber2(baseIn);
                x = y.pow(str.length - i);
                POW_PRECISION = k;
                y.c = toBaseOut(
                  toFixedPoint(coeffToString(x.c), x.e, "0"),
                  10,
                  baseOut,
                  decimal
                );
                y.e = y.c.length;
              }
              xc = toBaseOut(str, baseIn, baseOut, callerIsToString ? (alphabet2 = ALPHABET, decimal) : (alphabet2 = decimal, ALPHABET));
              e = k = xc.length;
              for (; xc[--k] == 0; xc.pop()) ;
              if (!xc[0]) return alphabet2.charAt(0);
              if (i < 0) {
                --e;
              } else {
                x.c = xc;
                x.e = e;
                x.s = sign;
                x = div(x, y, dp, rm, baseOut);
                xc = x.c;
                r = x.r;
                e = x.e;
              }
              d = e + dp + 1;
              i = xc[d];
              k = baseOut / 2;
              r = r || d < 0 || xc[d + 1] != null;
              r = rm < 4 ? (i != null || r) && (rm == 0 || rm == (x.s < 0 ? 3 : 2)) : i > k || i == k && (rm == 4 || r || rm == 6 && xc[d - 1] & 1 || rm == (x.s < 0 ? 8 : 7));
              if (d < 1 || !xc[0]) {
                str = r ? toFixedPoint(alphabet2.charAt(1), -dp, alphabet2.charAt(0)) : alphabet2.charAt(0);
              } else {
                xc.length = d;
                if (r) {
                  for (--baseOut; ++xc[--d] > baseOut; ) {
                    xc[d] = 0;
                    if (!d) {
                      ++e;
                      xc = [1].concat(xc);
                    }
                  }
                }
                for (k = xc.length; !xc[--k]; ) ;
                for (i = 0, str = ""; i <= k; str += alphabet2.charAt(xc[i++])) ;
                str = toFixedPoint(str, e, alphabet2.charAt(0));
              }
              return str;
            };
          })();
          div = /* @__PURE__ */ (function() {
            function multiply(x, k, base) {
              var m, temp, xlo, xhi, carry = 0, i = x.length, klo = k % SQRT_BASE, khi = k / SQRT_BASE | 0;
              for (x = x.slice(); i--; ) {
                xlo = x[i] % SQRT_BASE;
                xhi = x[i] / SQRT_BASE | 0;
                m = khi * xlo + xhi * klo;
                temp = klo * xlo + m % SQRT_BASE * SQRT_BASE + carry;
                carry = (temp / base | 0) + (m / SQRT_BASE | 0) + khi * xhi;
                x[i] = temp % base;
              }
              if (carry) x = [carry].concat(x);
              return x;
            }
            function compare3(a, b, aL, bL) {
              var i, cmp;
              if (aL != bL) {
                cmp = aL > bL ? 1 : -1;
              } else {
                for (i = cmp = 0; i < aL; i++) {
                  if (a[i] != b[i]) {
                    cmp = a[i] > b[i] ? 1 : -1;
                    break;
                  }
                }
              }
              return cmp;
            }
            function subtract(a, b, aL, base) {
              var i = 0;
              for (; aL--; ) {
                a[aL] -= i;
                i = a[aL] < b[aL] ? 1 : 0;
                a[aL] = i * base + a[aL] - b[aL];
              }
              for (; !a[0] && a.length > 1; a.splice(0, 1)) ;
            }
            return function(x, y, dp, rm, base) {
              var cmp, e, i, more, n, prod, prodL, q, qc, rem, remL, rem0, xi, xL, yc0, yL, yz, s = x.s == y.s ? 1 : -1, xc = x.c, yc = y.c;
              if (!xc || !xc[0] || !yc || !yc[0]) {
                return new BigNumber2(
                  // Return NaN if either NaN, or both Infinity or 0.
                  !x.s || !y.s || (xc ? yc && xc[0] == yc[0] : !yc) ? NaN : (
                    // Return ±0 if x is ±0 or y is ±Infinity, or return ±Infinity as y is ±0.
                    xc && xc[0] == 0 || !yc ? s * 0 : s / 0
                  )
                );
              }
              q = new BigNumber2(s);
              qc = q.c = [];
              e = x.e - y.e;
              s = dp + e + 1;
              if (!base) {
                base = BASE;
                e = bitFloor(x.e / LOG_BASE) - bitFloor(y.e / LOG_BASE);
                s = s / LOG_BASE | 0;
              }
              for (i = 0; yc[i] == (xc[i] || 0); i++) ;
              if (yc[i] > (xc[i] || 0)) e--;
              if (s < 0) {
                qc.push(1);
                more = true;
              } else {
                xL = xc.length;
                yL = yc.length;
                i = 0;
                s += 2;
                n = mathfloor(base / (yc[0] + 1));
                if (n > 1) {
                  yc = multiply(yc, n, base);
                  xc = multiply(xc, n, base);
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
                  n = 0;
                  cmp = compare3(yc, rem, yL, remL);
                  if (cmp < 0) {
                    rem0 = rem[0];
                    if (yL != remL) rem0 = rem0 * base + (rem[1] || 0);
                    n = mathfloor(rem0 / yc0);
                    if (n > 1) {
                      if (n >= base) n = base - 1;
                      prod = multiply(yc, n, base);
                      prodL = prod.length;
                      remL = rem.length;
                      while (compare3(prod, rem, prodL, remL) == 1) {
                        n--;
                        subtract(prod, yL < prodL ? yz : yc, prodL, base);
                        prodL = prod.length;
                        cmp = 1;
                      }
                    } else {
                      if (n == 0) {
                        cmp = n = 1;
                      }
                      prod = yc.slice();
                      prodL = prod.length;
                    }
                    if (prodL < remL) prod = [0].concat(prod);
                    subtract(rem, prod, remL, base);
                    remL = rem.length;
                    if (cmp == -1) {
                      while (compare3(yc, rem, yL, remL) < 1) {
                        n++;
                        subtract(rem, yL < remL ? yz : yc, remL, base);
                        remL = rem.length;
                      }
                    }
                  } else if (cmp === 0) {
                    n++;
                    rem = [0];
                  }
                  qc[i++] = n;
                  if (rem[0]) {
                    rem[remL++] = xc[xi] || 0;
                  } else {
                    rem = [xc[xi]];
                    remL = 1;
                  }
                } while ((xi++ < xL || rem[0] != null) && s--);
                more = rem[0] != null;
                if (!qc[0]) qc.splice(0, 1);
              }
              if (base == BASE) {
                for (i = 1, s = qc[0]; s >= 10; s /= 10, i++) ;
                round(q, dp + (q.e = i + e * LOG_BASE - 1) + 1, rm, more);
              } else {
                q.e = e;
                q.r = +more;
              }
              return q;
            };
          })();
          function format(n, i, rm, id) {
            var c0, e, ne, len, str;
            if (rm == null) rm = ROUNDING_MODE;
            else intCheck(rm, 0, 8);
            if (!n.c) return n.toString();
            c0 = n.c[0];
            ne = n.e;
            if (i == null) {
              str = coeffToString(n.c);
              str = id == 1 || id == 2 && (ne <= TO_EXP_NEG || ne >= TO_EXP_POS) ? toExponential(str, ne) : toFixedPoint(str, ne, "0");
            } else {
              n = round(new BigNumber2(n), i, rm);
              e = n.e;
              str = coeffToString(n.c);
              len = str.length;
              if (id == 1 || id == 2 && (i <= e || e <= TO_EXP_NEG)) {
                for (; len < i; str += "0", len++) ;
                str = toExponential(str, e);
              } else {
                i -= ne + (id === 2 && e > ne);
                str = toFixedPoint(str, e, "0");
                if (e + 1 > len) {
                  if (--i > 0) for (str += "."; i--; str += "0") ;
                } else {
                  i += e - len;
                  if (i > 0) {
                    if (e + 1 == len) str += ".";
                    for (; i--; str += "0") ;
                  }
                }
              }
            }
            return n.s < 0 && c0 ? "-" + str : str;
          }
          function maxOrMin(args, n) {
            var k, y, i = 1, x = new BigNumber2(args[0]);
            for (; i < args.length; i++) {
              y = new BigNumber2(args[i]);
              if (!y.s || (k = compare2(x, y)) === n || k === 0 && x.s === n) {
                x = y;
              }
            }
            return x;
          }
          function normalise(n, c, e) {
            var i = 1, j = c.length;
            for (; !c[--j]; c.pop()) ;
            for (j = c[0]; j >= 10; j /= 10, i++) ;
            if ((e = i + e * LOG_BASE - 1) > MAX_EXP) {
              n.c = n.e = null;
            } else if (e < MIN_EXP) {
              n.c = [n.e = 0];
            } else {
              n.e = e;
              n.c = c;
            }
            return n;
          }
          parseNumeric = /* @__PURE__ */ (function() {
            var basePrefix = /^(-?)0([xbo])(?=\w[\w.]*$)/i, dotAfter = /^([^.]+)\.$/, dotBefore = /^\.([^.]+)$/, isInfinityOrNaN = /^-?(Infinity|NaN)$/, whitespaceOrPlus = /^\s*\+(?=[\w.])|^\s+|\s+$/g;
            return function(x, str, isNum, b) {
              var base, s = isNum ? str : str.replace(whitespaceOrPlus, "");
              if (isInfinityOrNaN.test(s)) {
                x.s = isNaN(s) ? null : s < 0 ? -1 : 1;
              } else {
                if (!isNum) {
                  s = s.replace(basePrefix, function(m, p1, p2) {
                    base = (p2 = p2.toLowerCase()) == "x" ? 16 : p2 == "b" ? 2 : 8;
                    return !b || b == base ? p1 : m;
                  });
                  if (b) {
                    base = b;
                    s = s.replace(dotAfter, "$1").replace(dotBefore, "0.$1");
                  }
                  if (str != s) return new BigNumber2(s, base);
                }
                if (BigNumber2.DEBUG) {
                  throw Error(bignumberError + "Not a" + (b ? " base " + b : "") + " number: " + str);
                }
                x.s = null;
              }
              x.c = x.e = null;
            };
          })();
          function round(x, sd, rm, r) {
            var d, i, j, k, n, ni, rd, xc = x.c, pows10 = POWS_TEN;
            if (xc) {
              out: {
                for (d = 1, k = xc[0]; k >= 10; k /= 10, d++) ;
                i = sd - d;
                if (i < 0) {
                  i += LOG_BASE;
                  j = sd;
                  n = xc[ni = 0];
                  rd = mathfloor(n / pows10[d - j - 1] % 10);
                } else {
                  ni = mathceil((i + 1) / LOG_BASE);
                  if (ni >= xc.length) {
                    if (r) {
                      for (; xc.length <= ni; xc.push(0)) ;
                      n = rd = 0;
                      d = 1;
                      i %= LOG_BASE;
                      j = i - LOG_BASE + 1;
                    } else {
                      break out;
                    }
                  } else {
                    n = k = xc[ni];
                    for (d = 1; k >= 10; k /= 10, d++) ;
                    i %= LOG_BASE;
                    j = i - LOG_BASE + d;
                    rd = j < 0 ? 0 : mathfloor(n / pows10[d - j - 1] % 10);
                  }
                }
                r = r || sd < 0 || // Are there any non-zero digits after the rounding digit?
                // The expression  n % pows10[d - j - 1]  returns all digits of n to the right
                // of the digit at j, e.g. if n is 908714 and j is 2, the expression gives 714.
                xc[ni + 1] != null || (j < 0 ? n : n % pows10[d - j - 1]);
                r = rm < 4 ? (rd || r) && (rm == 0 || rm == (x.s < 0 ? 3 : 2)) : rd > 5 || rd == 5 && (rm == 4 || r || rm == 6 && // Check whether the digit to the left of the rounding digit is odd.
                (i > 0 ? j > 0 ? n / pows10[d - j] : 0 : xc[ni - 1]) % 10 & 1 || rm == (x.s < 0 ? 8 : 7));
                if (sd < 1 || !xc[0]) {
                  xc.length = 0;
                  if (r) {
                    sd -= x.e + 1;
                    xc[0] = pows10[(LOG_BASE - sd % LOG_BASE) % LOG_BASE];
                    x.e = -sd || 0;
                  } else {
                    xc[0] = x.e = 0;
                  }
                  return x;
                }
                if (i == 0) {
                  xc.length = ni;
                  k = 1;
                  ni--;
                } else {
                  xc.length = ni + 1;
                  k = pows10[LOG_BASE - i];
                  xc[ni] = j > 0 ? mathfloor(n / pows10[d - j] % pows10[j]) * k : 0;
                }
                if (r) {
                  for (; ; ) {
                    if (ni == 0) {
                      for (i = 1, j = xc[0]; j >= 10; j /= 10, i++) ;
                      j = xc[0] += k;
                      for (k = 1; j >= 10; j /= 10, k++) ;
                      if (i != k) {
                        x.e++;
                        if (xc[0] == BASE) xc[0] = 1;
                      }
                      break;
                    } else {
                      xc[ni] += k;
                      if (xc[ni] != BASE) break;
                      xc[ni--] = 0;
                      k = 1;
                    }
                  }
                }
                for (i = xc.length; xc[--i] === 0; xc.pop()) ;
              }
              if (x.e > MAX_EXP) {
                x.c = x.e = null;
              } else if (x.e < MIN_EXP) {
                x.c = [x.e = 0];
              }
            }
            return x;
          }
          function valueOf(n) {
            var str, e = n.e;
            if (e === null) return n.toString();
            str = coeffToString(n.c);
            str = e <= TO_EXP_NEG || e >= TO_EXP_POS ? toExponential(str, e) : toFixedPoint(str, e, "0");
            return n.s < 0 ? "-" + str : str;
          }
          P.absoluteValue = P.abs = function() {
            var x = new BigNumber2(this);
            if (x.s < 0) x.s = 1;
            return x;
          };
          P.comparedTo = function(y, b) {
            return compare2(this, new BigNumber2(y, b));
          };
          P.decimalPlaces = P.dp = function(dp, rm) {
            var c, n, v, x = this;
            if (dp != null) {
              intCheck(dp, 0, MAX);
              if (rm == null) rm = ROUNDING_MODE;
              else intCheck(rm, 0, 8);
              return round(new BigNumber2(x), dp + x.e + 1, rm);
            }
            if (!(c = x.c)) return null;
            n = ((v = c.length - 1) - bitFloor(this.e / LOG_BASE)) * LOG_BASE;
            if (v = c[v]) for (; v % 10 == 0; v /= 10, n--) ;
            if (n < 0) n = 0;
            return n;
          };
          P.dividedBy = P.div = function(y, b) {
            return div(this, new BigNumber2(y, b), DECIMAL_PLACES, ROUNDING_MODE);
          };
          P.dividedToIntegerBy = P.idiv = function(y, b) {
            return div(this, new BigNumber2(y, b), 0, 1);
          };
          P.exponentiatedBy = P.pow = function(n, m) {
            var half, isModExp, i, k, more, nIsBig, nIsNeg, nIsOdd, y, x = this;
            n = new BigNumber2(n);
            if (n.c && !n.isInteger()) {
              throw Error(bignumberError + "Exponent not an integer: " + valueOf(n));
            }
            if (m != null) m = new BigNumber2(m);
            nIsBig = n.e > 14;
            if (!x.c || !x.c[0] || x.c[0] == 1 && !x.e && x.c.length == 1 || !n.c || !n.c[0]) {
              y = new BigNumber2(Math.pow(+valueOf(x), nIsBig ? n.s * (2 - isOdd(n)) : +valueOf(n)));
              return m ? y.mod(m) : y;
            }
            nIsNeg = n.s < 0;
            if (m) {
              if (m.c ? !m.c[0] : !m.s) return new BigNumber2(NaN);
              isModExp = !nIsNeg && x.isInteger() && m.isInteger();
              if (isModExp) x = x.mod(m);
            } else if (n.e > 9 && (x.e > 0 || x.e < -1 || (x.e == 0 ? x.c[0] > 1 || nIsBig && x.c[1] >= 24e7 : x.c[0] < 8e13 || nIsBig && x.c[0] <= 9999975e7))) {
              k = x.s < 0 && isOdd(n) ? -0 : 0;
              if (x.e > -1) k = 1 / k;
              return new BigNumber2(nIsNeg ? 1 / k : k);
            } else if (POW_PRECISION) {
              k = mathceil(POW_PRECISION / LOG_BASE + 2);
            }
            if (nIsBig) {
              half = new BigNumber2(0.5);
              if (nIsNeg) n.s = 1;
              nIsOdd = isOdd(n);
            } else {
              i = Math.abs(+valueOf(n));
              nIsOdd = i % 2;
            }
            y = new BigNumber2(ONE);
            for (; ; ) {
              if (nIsOdd) {
                y = y.times(x);
                if (!y.c) break;
                if (k) {
                  if (y.c.length > k) y.c.length = k;
                } else if (isModExp) {
                  y = y.mod(m);
                }
              }
              if (i) {
                i = mathfloor(i / 2);
                if (i === 0) break;
                nIsOdd = i % 2;
              } else {
                n = n.times(half);
                round(n, n.e + 1, 1);
                if (n.e > 14) {
                  nIsOdd = isOdd(n);
                } else {
                  i = +valueOf(n);
                  if (i === 0) break;
                  nIsOdd = i % 2;
                }
              }
              x = x.times(x);
              if (k) {
                if (x.c && x.c.length > k) x.c.length = k;
              } else if (isModExp) {
                x = x.mod(m);
              }
            }
            if (isModExp) return y;
            if (nIsNeg) y = ONE.div(y);
            return m ? y.mod(m) : k ? round(y, POW_PRECISION, ROUNDING_MODE, more) : y;
          };
          P.integerValue = function(rm) {
            var n = new BigNumber2(this);
            if (rm == null) rm = ROUNDING_MODE;
            else intCheck(rm, 0, 8);
            return round(n, n.e + 1, rm);
          };
          P.isEqualTo = P.eq = function(y, b) {
            return compare2(this, new BigNumber2(y, b)) === 0;
          };
          P.isFinite = function() {
            return !!this.c;
          };
          P.isGreaterThan = P.gt = function(y, b) {
            return compare2(this, new BigNumber2(y, b)) > 0;
          };
          P.isGreaterThanOrEqualTo = P.gte = function(y, b) {
            return (b = compare2(this, new BigNumber2(y, b))) === 1 || b === 0;
          };
          P.isInteger = function() {
            return !!this.c && bitFloor(this.e / LOG_BASE) > this.c.length - 2;
          };
          P.isLessThan = P.lt = function(y, b) {
            return compare2(this, new BigNumber2(y, b)) < 0;
          };
          P.isLessThanOrEqualTo = P.lte = function(y, b) {
            return (b = compare2(this, new BigNumber2(y, b))) === -1 || b === 0;
          };
          P.isNaN = function() {
            return !this.s;
          };
          P.isNegative = function() {
            return this.s < 0;
          };
          P.isPositive = function() {
            return this.s > 0;
          };
          P.isZero = function() {
            return !!this.c && this.c[0] == 0;
          };
          P.minus = function(y, b) {
            var i, j, t, xLTy, x = this, a = x.s;
            y = new BigNumber2(y, b);
            b = y.s;
            if (!a || !b) return new BigNumber2(NaN);
            if (a != b) {
              y.s = -b;
              return x.plus(y);
            }
            var xe = x.e / LOG_BASE, ye = y.e / LOG_BASE, xc = x.c, yc = y.c;
            if (!xe || !ye) {
              if (!xc || !yc) return xc ? (y.s = -b, y) : new BigNumber2(yc ? x : NaN);
              if (!xc[0] || !yc[0]) {
                return yc[0] ? (y.s = -b, y) : new BigNumber2(xc[0] ? x : (
                  // IEEE 754 (2008) 6.3: n - n = -0 when rounding to -Infinity
                  ROUNDING_MODE == 3 ? -0 : 0
                ));
              }
            }
            xe = bitFloor(xe);
            ye = bitFloor(ye);
            xc = xc.slice();
            if (a = xe - ye) {
              if (xLTy = a < 0) {
                a = -a;
                t = xc;
              } else {
                ye = xe;
                t = yc;
              }
              t.reverse();
              for (b = a; b--; t.push(0)) ;
              t.reverse();
            } else {
              j = (xLTy = (a = xc.length) < (b = yc.length)) ? a : b;
              for (a = b = 0; b < j; b++) {
                if (xc[b] != yc[b]) {
                  xLTy = xc[b] < yc[b];
                  break;
                }
              }
            }
            if (xLTy) {
              t = xc;
              xc = yc;
              yc = t;
              y.s = -y.s;
            }
            b = (j = yc.length) - (i = xc.length);
            if (b > 0) for (; b--; xc[i++] = 0) ;
            b = BASE - 1;
            for (; j > a; ) {
              if (xc[--j] < yc[j]) {
                for (i = j; i && !xc[--i]; xc[i] = b) ;
                --xc[i];
                xc[j] += BASE;
              }
              xc[j] -= yc[j];
            }
            for (; xc[0] == 0; xc.splice(0, 1), --ye) ;
            if (!xc[0]) {
              y.s = ROUNDING_MODE == 3 ? -1 : 1;
              y.c = [y.e = 0];
              return y;
            }
            return normalise(y, xc, ye);
          };
          P.modulo = P.mod = function(y, b) {
            var q, s, x = this;
            y = new BigNumber2(y, b);
            if (!x.c || !y.s || y.c && !y.c[0]) {
              return new BigNumber2(NaN);
            } else if (!y.c || x.c && !x.c[0]) {
              return new BigNumber2(x);
            }
            if (MODULO_MODE == 9) {
              s = y.s;
              y.s = 1;
              q = div(x, y, 0, 3);
              y.s = s;
              q.s *= s;
            } else {
              q = div(x, y, 0, MODULO_MODE);
            }
            y = x.minus(q.times(y));
            if (!y.c[0] && MODULO_MODE == 1) y.s = x.s;
            return y;
          };
          P.multipliedBy = P.times = function(y, b) {
            var c, e, i, j, k, m, xcL, xlo, xhi, ycL, ylo, yhi, zc, base, sqrtBase, x = this, xc = x.c, yc = (y = new BigNumber2(y, b)).c;
            if (!xc || !yc || !xc[0] || !yc[0]) {
              if (!x.s || !y.s || xc && !xc[0] && !yc || yc && !yc[0] && !xc) {
                y.c = y.e = y.s = null;
              } else {
                y.s *= x.s;
                if (!xc || !yc) {
                  y.c = y.e = null;
                } else {
                  y.c = [0];
                  y.e = 0;
                }
              }
              return y;
            }
            e = bitFloor(x.e / LOG_BASE) + bitFloor(y.e / LOG_BASE);
            y.s *= x.s;
            xcL = xc.length;
            ycL = yc.length;
            if (xcL < ycL) {
              zc = xc;
              xc = yc;
              yc = zc;
              i = xcL;
              xcL = ycL;
              ycL = i;
            }
            for (i = xcL + ycL, zc = []; i--; zc.push(0)) ;
            base = BASE;
            sqrtBase = SQRT_BASE;
            for (i = ycL; --i >= 0; ) {
              c = 0;
              ylo = yc[i] % sqrtBase;
              yhi = yc[i] / sqrtBase | 0;
              for (k = xcL, j = i + k; j > i; ) {
                xlo = xc[--k] % sqrtBase;
                xhi = xc[k] / sqrtBase | 0;
                m = yhi * xlo + xhi * ylo;
                xlo = ylo * xlo + m % sqrtBase * sqrtBase + zc[j] + c;
                c = (xlo / base | 0) + (m / sqrtBase | 0) + yhi * xhi;
                zc[j--] = xlo % base;
              }
              zc[j] = c;
            }
            if (c) {
              ++e;
            } else {
              zc.splice(0, 1);
            }
            return normalise(y, zc, e);
          };
          P.negated = function() {
            var x = new BigNumber2(this);
            x.s = -x.s || null;
            return x;
          };
          P.plus = function(y, b) {
            var t, x = this, a = x.s;
            y = new BigNumber2(y, b);
            b = y.s;
            if (!a || !b) return new BigNumber2(NaN);
            if (a != b) {
              y.s = -b;
              return x.minus(y);
            }
            var xe = x.e / LOG_BASE, ye = y.e / LOG_BASE, xc = x.c, yc = y.c;
            if (!xe || !ye) {
              if (!xc || !yc) return new BigNumber2(a / 0);
              if (!xc[0] || !yc[0]) return yc[0] ? y : new BigNumber2(xc[0] ? x : a * 0);
            }
            xe = bitFloor(xe);
            ye = bitFloor(ye);
            xc = xc.slice();
            if (a = xe - ye) {
              if (a > 0) {
                ye = xe;
                t = yc;
              } else {
                a = -a;
                t = xc;
              }
              t.reverse();
              for (; a--; t.push(0)) ;
              t.reverse();
            }
            a = xc.length;
            b = yc.length;
            if (a - b < 0) {
              t = yc;
              yc = xc;
              xc = t;
              b = a;
            }
            for (a = 0; b; ) {
              a = (xc[--b] = xc[b] + yc[b] + a) / BASE | 0;
              xc[b] = BASE === xc[b] ? 0 : xc[b] % BASE;
            }
            if (a) {
              xc = [a].concat(xc);
              ++ye;
            }
            return normalise(y, xc, ye);
          };
          P.precision = P.sd = function(sd, rm) {
            var c, n, v, x = this;
            if (sd != null && sd !== !!sd) {
              intCheck(sd, 1, MAX);
              if (rm == null) rm = ROUNDING_MODE;
              else intCheck(rm, 0, 8);
              return round(new BigNumber2(x), sd, rm);
            }
            if (!(c = x.c)) return null;
            v = c.length - 1;
            n = v * LOG_BASE + 1;
            if (v = c[v]) {
              for (; v % 10 == 0; v /= 10, n--) ;
              for (v = c[0]; v >= 10; v /= 10, n++) ;
            }
            if (sd && x.e + 1 > n) n = x.e + 1;
            return n;
          };
          P.shiftedBy = function(k) {
            intCheck(k, -MAX_SAFE_INTEGER, MAX_SAFE_INTEGER);
            return this.times("1e" + k);
          };
          P.squareRoot = P.sqrt = function() {
            var m, n, r, rep, t, x = this, c = x.c, s = x.s, e = x.e, dp = DECIMAL_PLACES + 4, half = new BigNumber2("0.5");
            if (s !== 1 || !c || !c[0]) {
              return new BigNumber2(!s || s < 0 && (!c || c[0]) ? NaN : c ? x : 1 / 0);
            }
            s = Math.sqrt(+valueOf(x));
            if (s == 0 || s == 1 / 0) {
              n = coeffToString(c);
              if ((n.length + e) % 2 == 0) n += "0";
              s = Math.sqrt(+n);
              e = bitFloor((e + 1) / 2) - (e < 0 || e % 2);
              if (s == 1 / 0) {
                n = "5e" + e;
              } else {
                n = s.toExponential();
                n = n.slice(0, n.indexOf("e") + 1) + e;
              }
              r = new BigNumber2(n);
            } else {
              r = new BigNumber2(s + "");
            }
            if (r.c[0]) {
              e = r.e;
              s = e + dp;
              if (s < 3) s = 0;
              for (; ; ) {
                t = r;
                r = half.times(t.plus(div(x, t, dp, 1)));
                if (coeffToString(t.c).slice(0, s) === (n = coeffToString(r.c)).slice(0, s)) {
                  if (r.e < e) --s;
                  n = n.slice(s - 3, s + 1);
                  if (n == "9999" || !rep && n == "4999") {
                    if (!rep) {
                      round(t, t.e + DECIMAL_PLACES + 2, 0);
                      if (t.times(t).eq(x)) {
                        r = t;
                        break;
                      }
                    }
                    dp += 4;
                    s += 4;
                    rep = 1;
                  } else {
                    if (!+n || !+n.slice(1) && n.charAt(0) == "5") {
                      round(r, r.e + DECIMAL_PLACES + 2, 1);
                      m = !r.times(r).eq(x);
                    }
                    break;
                  }
                }
              }
            }
            return round(r, r.e + DECIMAL_PLACES + 1, ROUNDING_MODE, m);
          };
          P.toExponential = function(dp, rm) {
            if (dp != null) {
              intCheck(dp, 0, MAX);
              dp++;
            }
            return format(this, dp, rm, 1);
          };
          P.toFixed = function(dp, rm) {
            if (dp != null) {
              intCheck(dp, 0, MAX);
              dp = dp + this.e + 1;
            }
            return format(this, dp, rm);
          };
          P.toFormat = function(dp, rm, format2) {
            var str, x = this;
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
            str = x.toFixed(dp, rm);
            if (x.c) {
              var i, arr = str.split("."), g1 = +format2.groupSize, g2 = +format2.secondaryGroupSize, groupSeparator = format2.groupSeparator || "", intPart = arr[0], fractionPart = arr[1], isNeg = x.s < 0, intDigits = isNeg ? intPart.slice(1) : intPart, len = intDigits.length;
              if (g2) {
                i = g1;
                g1 = g2;
                g2 = i;
                len -= i;
              }
              if (g1 > 0 && len > 0) {
                i = len % g1 || g1;
                intPart = intDigits.substr(0, i);
                for (; i < len; i += g1) intPart += groupSeparator + intDigits.substr(i, g1);
                if (g2 > 0) intPart += groupSeparator + intDigits.slice(i);
                if (isNeg) intPart = "-" + intPart;
              }
              str = fractionPart ? intPart + (format2.decimalSeparator || "") + ((g2 = +format2.fractionGroupSize) ? fractionPart.replace(
                new RegExp("\\d{" + g2 + "}\\B", "g"),
                "$&" + (format2.fractionGroupSeparator || "")
              ) : fractionPart) : intPart;
            }
            return (format2.prefix || "") + str + (format2.suffix || "");
          };
          P.toFraction = function(md) {
            var d, d0, d1, d2, e, exp, n, n0, n1, q, r, s, x = this, xc = x.c;
            if (md != null) {
              n = new BigNumber2(md);
              if (!n.isInteger() && (n.c || n.s !== 1) || n.lt(ONE)) {
                throw Error(bignumberError + "Argument " + (n.isInteger() ? "out of range: " : "not an integer: ") + valueOf(n));
              }
            }
            if (!xc) return new BigNumber2(x);
            d = new BigNumber2(ONE);
            n1 = d0 = new BigNumber2(ONE);
            d1 = n0 = new BigNumber2(ONE);
            s = coeffToString(xc);
            e = d.e = s.length - x.e - 1;
            d.c[0] = POWS_TEN[(exp = e % LOG_BASE) < 0 ? LOG_BASE + exp : exp];
            md = !md || n.comparedTo(d) > 0 ? e > 0 ? d : n1 : n;
            exp = MAX_EXP;
            MAX_EXP = 1 / 0;
            n = new BigNumber2(s);
            n0.c[0] = 0;
            for (; ; ) {
              q = div(n, d, 0, 1);
              d2 = d0.plus(q.times(d1));
              if (d2.comparedTo(md) == 1) break;
              d0 = d1;
              d1 = d2;
              n1 = n0.plus(q.times(d2 = n1));
              n0 = d2;
              d = n.minus(q.times(d2 = d));
              n = d2;
            }
            d2 = div(md.minus(d0), d1, 0, 1);
            n0 = n0.plus(d2.times(n1));
            d0 = d0.plus(d2.times(d1));
            n0.s = n1.s = x.s;
            e = e * 2;
            r = div(n1, d1, e, ROUNDING_MODE).minus(x).abs().comparedTo(
              div(n0, d0, e, ROUNDING_MODE).minus(x).abs()
            ) < 1 ? [n1, d1] : [n0, d0];
            MAX_EXP = exp;
            return r;
          };
          P.toNumber = function() {
            return +valueOf(this);
          };
          P.toPrecision = function(sd, rm) {
            if (sd != null) intCheck(sd, 1, MAX);
            return format(this, sd, rm, 2);
          };
          P.toString = function(b) {
            var str, n = this, s = n.s, e = n.e;
            if (e === null) {
              if (s) {
                str = "Infinity";
                if (s < 0) str = "-" + str;
              } else {
                str = "NaN";
              }
            } else {
              if (b == null) {
                str = e <= TO_EXP_NEG || e >= TO_EXP_POS ? toExponential(coeffToString(n.c), e) : toFixedPoint(coeffToString(n.c), e, "0");
              } else if (b === 10 && alphabetHasNormalDecimalDigits) {
                n = round(new BigNumber2(n), DECIMAL_PLACES + e + 1, ROUNDING_MODE);
                str = toFixedPoint(coeffToString(n.c), n.e, "0");
              } else {
                intCheck(b, 2, ALPHABET.length, "Base");
                str = convertBase(toFixedPoint(coeffToString(n.c), e, "0"), 10, b, s, true);
              }
              if (s < 0 && n.c[0]) str = "-" + str;
            }
            return str;
          };
          P.valueOf = P.toJSON = function() {
            return valueOf(this);
          };
          P._isBigNumber = true;
          if (configObject != null) BigNumber2.set(configObject);
          return BigNumber2;
        }
        function bitFloor(n) {
          var i = n | 0;
          return n > 0 || n === i ? i : i - 1;
        }
        function coeffToString(a) {
          var s, z, i = 1, j = a.length, r = a[0] + "";
          for (; i < j; ) {
            s = a[i++] + "";
            z = LOG_BASE - s.length;
            for (; z--; s = "0" + s) ;
            r += s;
          }
          for (j = r.length; r.charCodeAt(--j) === 48; ) ;
          return r.slice(0, j + 1 || 1);
        }
        function compare2(x, y) {
          var a, b, xc = x.c, yc = y.c, i = x.s, j = y.s, k = x.e, l = y.e;
          if (!i || !j) return null;
          a = xc && !xc[0];
          b = yc && !yc[0];
          if (a || b) return a ? b ? 0 : -j : i;
          if (i != j) return i;
          a = i < 0;
          b = k == l;
          if (!xc || !yc) return b ? 0 : !xc ^ a ? 1 : -1;
          if (!b) return k > l ^ a ? 1 : -1;
          j = (k = xc.length) < (l = yc.length) ? k : l;
          for (i = 0; i < j; i++) if (xc[i] != yc[i]) return xc[i] > yc[i] ^ a ? 1 : -1;
          return k == l ? 0 : k > l ^ a ? 1 : -1;
        }
        function intCheck(n, min, max, name) {
          if (n < min || n > max || n !== mathfloor(n)) {
            throw Error(bignumberError + (name || "Argument") + (typeof n == "number" ? n < min || n > max ? " out of range: " : " not an integer: " : " not a primitive number: ") + String(n));
          }
        }
        function isOdd(n) {
          var k = n.c.length - 1;
          return bitFloor(n.e / LOG_BASE) == k && n.c[k] % 2 != 0;
        }
        function toExponential(str, e) {
          return (str.length > 1 ? str.charAt(0) + "." + str.slice(1) : str) + (e < 0 ? "e" : "e+") + e;
        }
        function toFixedPoint(str, e, z) {
          var len, zs;
          if (e < 0) {
            for (zs = z + "."; ++e; zs += z) ;
            str = zs + str;
          } else {
            len = str.length;
            if (++e > len) {
              for (zs = z, e -= len; --e; zs += z) ;
              str += zs;
            } else if (e < len) {
              str = str.slice(0, e) + "." + str.slice(e);
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
      function checkOffset(n) {
        n = n | 0;
        if (((offset | 0) + (n | 0) | 0) < (inputLength | 0)) {
          return 0;
        }
        return 1;
      }
      function readUInt16(n) {
        n = n | 0;
        return heap[n | 0] << 8 | heap[n + 1 | 0] | 0;
      }
      function readUInt32(n) {
        n = n | 0;
        return heap[n | 0] << 24 | heap[n + 1 | 0] << 16 | heap[n + 2 | 0] << 8 | heap[n + 3 | 0] | 0;
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
        var f = 0;
        var g = 0;
        var sign = 1;
        var exp = 0;
        var mant = 0;
        var r = 0;
        if (checkOffset(2) | 0) {
          return 1;
        }
        f = heap[offset + 1 | 0] | 0;
        g = heap[offset + 2 | 0] | 0;
        if ((f | 0) & 128) {
          sign = -1;
        }
        exp = +(((f | 0) & 124) >> 2);
        mant = +(((f | 0) & 3) << 8 | g);
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
      const { Buffer } = requireBuffer();
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
      function toHex2(n) {
        if (n < 16) {
          return "0" + n.toString(16);
        }
        return n.toString(16);
      }
      exports.arrayBufferToBignumber = function(buf) {
        const len = buf.byteLength;
        let res = "";
        for (let i = 0; i < len; i++) {
          res += toHex2(buf[i]);
        }
        return new Bignumber(res, 16);
      };
      exports.buildMap = (obj) => {
        const res = /* @__PURE__ */ new Map();
        const keys = Object.keys(obj);
        const length = keys.length;
        for (let i = 0; i < length; i++) {
          res.set(keys[i], obj[keys[i]]);
        }
        return res;
      };
      exports.buildInt32 = (f, g) => {
        return f * SHIFT16 + g;
      };
      exports.buildInt64 = (f1, f2, g1, g2) => {
        const f = exports.buildInt32(f1, f2);
        const g = exports.buildInt32(g1, g2);
        if (f > MAX_SAFE_HIGH) {
          return new Bignumber(f).times(SHIFT32).plus(g);
        } else {
          return f * SHIFT32 + g;
        }
      };
      exports.writeHalf = function writeHalf(buf, half) {
        const u32 = Buffer.allocUnsafe(4);
        u32.writeFloatBE(half, 0);
        const u = u32.readUInt32BE(0);
        if ((u & 8191) !== 0) {
          return false;
        }
        var s16 = u >> 16 & 32768;
        const exp = u >> 23 & 255;
        const mant = u & 8388607;
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
      exports.keySorter = function(a, b) {
        var lenA = a[0].byteLength;
        var lenB = b[0].byteLength;
        if (lenA > lenB) {
          return 1;
        }
        if (lenB > lenA) {
          return -1;
        }
        return a[0].compare(b[0]);
      };
      exports.isNegativeZero = (x) => {
        return x === 0 && 1 / x < 0;
      };
      exports.nextPowerOf2 = (n) => {
        let count = 0;
        if (n && !(n & n - 1)) {
          return n;
        }
        while (n !== 0) {
          n >>= 1;
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
        var er, f;
        f = converters != null ? converters[this.tag] : void 0;
        if (typeof f !== "function") {
          f = Tagged["_tag" + this.tag];
          if (typeof f !== "function") {
            return this;
          }
        }
        try {
          return f.call(Tagged, this.value);
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
      createObjectURL(o) {
        return this.super.createObjectURL(o);
      }
      revokeObjectURL(o) {
        this.super.revokeObjectURL(o);
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
    const { Buffer } = requireBuffer();
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
        this._buffer = Buffer.from(this._heap);
        this._reset();
        this._knownTags = Object.assign({
          0: (val) => new Date(val),
          1: (val) => new Date(val * 1e3),
          2: (val) => utils2.arrayBufferToBignumber(val),
          3: (val) => c.NEG_ONE.minus(utils2.arrayBufferToBignumber(val)),
          4: (v) => {
            return c.TEN.pow(v[0]).times(v[1]);
          },
          5: (v) => {
            return c.TWO.pow(v[0]).times(v[1]);
          },
          32: (val) => new URL2(val),
          35: (val) => new RegExp(val)
        }, opts.tags);
        this.parser = parser(commonjsGlobal, {
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
        return Buffer.concat(raw);
      }
      createByteStringFromHeap(start, end) {
        if (start === end) {
          return Buffer.alloc(0);
        }
        return Buffer.from(this._heap.slice(start, end));
      }
      createInt(val) {
        return val;
      }
      createInt32(f, g) {
        return utils2.buildInt32(f, g);
      }
      createInt64(f1, f2, g1, g2) {
        return utils2.buildInt64(f1, f2, g1, g2);
      }
      createFloat(val) {
        return val;
      }
      createFloatSingle(a, b, c2, d) {
        return ieee7542.read([a, b, c2, d], 0, false, 23, 4);
      }
      createFloatDouble(a, b, c2, d, e, f, g, h) {
        return ieee7542.read([a, b, c2, d, e, f, g, h], 0, false, 52, 8);
      }
      createInt32Neg(f, g) {
        return -1 - utils2.buildInt32(f, g);
      }
      createInt64Neg(f1, f2, g1, g2) {
        const f = utils2.buildInt32(f1, f2);
        const g = utils2.buildInt32(g1, g2);
        if (f > c.MAX_SAFE_HIGH) {
          return c.NEG_ONE.minus(new Bignumber(f).times(c.SHIFT32).plus(g));
        }
        return -1 - (f * c.SHIFT32 + g);
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
      pushInt32(f, g) {
        this._push(this.createInt32(f, g));
      }
      pushInt64(f1, f2, g1, g2) {
        this._push(this.createInt64(f1, f2, g1, g2));
      }
      pushFloat(val) {
        this._push(this.createFloat(val));
      }
      pushFloatSingle(a, b, c2, d) {
        this._push(this.createFloatSingle(a, b, c2, d));
      }
      pushFloatDouble(a, b, c2, d, e, f, g, h) {
        this._push(this.createFloatDouble(a, b, c2, d, e, f, g, h));
      }
      pushInt32Neg(f, g) {
        this._push(this.createInt32Neg(f, g));
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
      pushTagStart4(f, g) {
        this.pushTagStart(utils2.buildInt32(f, g));
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
          input = Buffer.from(input, enc || "hex");
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
          input = Buffer.from(input, enc || "hex");
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
    const { Buffer } = requireBuffer();
    const Decoder = requireDecoder();
    const utils2 = requireUtils();
    class Diagnose extends Decoder {
      createTag(tagNumber, value2) {
        return `${tagNumber}(${value2})`;
      }
      createInt(val) {
        return super.createInt(val).toString();
      }
      createInt32(f, g) {
        return super.createInt32(f, g).toString();
      }
      createInt64(f1, f2, g1, g2) {
        return super.createInt64(f1, f2, g1, g2).toString();
      }
      createInt32Neg(f, g) {
        return super.createInt32Neg(f, g).toString();
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
      createFloatSingle(a, b, c, d) {
        const fl = super.createFloatSingle(a, b, c, d);
        return `${fl}_2`;
      }
      createFloatDouble(a, b, c, d, e, f, g, h) {
        const fl = super.createFloatDouble(a, b, c, d, e, f, g, h);
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
        const val = Buffer.from(
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
        const val = Buffer.from(
          super.createUtf8StringFromHeap(start, end)
        ).toString("utf8");
        return `"${val}"`;
      }
      static diagnose(input, enc) {
        if (typeof input === "string") {
          input = Buffer.from(input, enc || "hex");
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
    const { Buffer } = requireBuffer();
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
    const BUF_NAN = Buffer.from("f97e00", "hex");
    const BUF_INF_NEG = Buffer.from("f9fc00", "hex");
    const BUF_INF_POS = Buffer.from("f97c00", "hex");
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
        for (let i = 0; i < len; i++) {
          this.addSemanticType(
            addTypes[i][0],
            addTypes[i][1]
          );
        }
        this._reset();
      }
      addSemanticType(type, fun) {
        const len = this.semanticTypes.length;
        for (let i = 0; i < len; i++) {
          const typ = this.semanticTypes[i][0];
          if (typ === type) {
            const old = this.semanticTypes[i][1];
            this.semanticTypes[i][1] = fun;
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
        const b2 = Buffer.allocUnsafe(2);
        if (utils2.writeHalf(b2, obj)) {
          if (utils2.parseHalf(b2) === obj) {
            return this._pushUInt8(HALF) && this.push(b2);
          }
        }
        const b4 = Buffer.allocUnsafe(4);
        b4.writeFloatBE(obj, 0);
        if (b4.readFloatBE(0) === obj) {
          return this._pushUInt8(FLOAT) && this.push(b4);
        }
        return this._pushUInt8(DOUBLE) && this._pushDoubleBE(obj);
      }
      _pushInt(obj, mt, orig) {
        const m = mt << 5;
        if (obj < 24) {
          return this._pushUInt8(m | obj);
        }
        if (obj <= 255) {
          return this._pushUInt8(m | NUMBYTES.ONE) && this._pushUInt8(obj);
        }
        if (obj <= 65535) {
          return this._pushUInt8(m | NUMBYTES.TWO) && this._pushUInt16BE(obj);
        }
        if (obj <= 4294967295) {
          return this._pushUInt8(m | NUMBYTES.FOUR) && this._pushUInt32BE(obj);
        }
        if (obj <= Number.MAX_SAFE_INTEGER) {
          return this._pushUInt8(m | NUMBYTES.EIGHT) && this._pushUInt32BE(Math.floor(obj / SHIFT32)) && this._pushUInt32BE(obj % SHIFT32);
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
        const len = Buffer.byteLength(obj, "utf8");
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
        for (let j = 0; j < len; j++) {
          if (!gen.pushAny(obj[j])) {
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
        for (const x of obj) {
          if (!gen.pushAny(x)) {
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
        const buf = Buffer.from(str, "hex");
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
        for (var i = 0; i < len; i++) {
          if (obj instanceof this.semanticTypes[i][0]) {
            return this.semanticTypes[i][1].call(obj, this, obj);
          }
        }
        var f = obj.encodeCBOR;
        if (typeof f === "function") {
          return f.call(obj, this);
        }
        var keys = Object.keys(obj);
        var keyLength = keys.length;
        if (!this._pushInt(keyLength, MT.MAP)) {
          return false;
        }
        return this._pushRawMap(
          keyLength,
          keys.map((k) => [k, obj[k]])
        );
      }
      _pushRawMap(len, map) {
        map = map.map(function(a) {
          a[0] = Encoder.encode(a[0]);
          return a;
        }).sort(utils2.keySorter);
        for (var j = 0; j < len; j++) {
          if (!this.push(map[j][0])) {
            return false;
          }
          if (!this.pushAny(map[j][1])) {
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
            return this._pushBuffer(this, Buffer.isBuffer(obj) ? obj : Buffer.from(obj));
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
        var i = 0;
        for (; i < offset; i++) {
          size += resultLength[i];
        }
        var res = Buffer.allocUnsafe(size);
        var index = 0;
        var length = 0;
        for (i = 0; i < offset; i++) {
          length = resultLength[i];
          switch (resultMethod[i]) {
            case 0:
              result[i].copy(res, index);
              break;
            case 1:
              res.writeUInt8(result[i], index, true);
              break;
            case 2:
              res.writeUInt16BE(result[i], index, true);
              break;
            case 3:
              res.writeUInt32BE(result[i], index, true);
              break;
            case 4:
              res.writeDoubleBE(result[i], index, true);
              break;
            case 5:
              res.write(result[i], index, length, "utf8");
              break;
            default:
              throw new Error("unkown method");
          }
          index += length;
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
      static encode(o) {
        const enc = new Encoder();
        const ret = enc.pushAny(o);
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
      return hash(concat(...vals));
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
  function requestIdOf(request) {
    return hashOfMap(request);
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
    const concatenated = concat(...sorted.map((x) => concat(...x)));
    const result = hash(concatenated);
    return result;
  }
  var __rest$1 = function(s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
      t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
      for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
        if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
          t[p[i]] = s[p[i]];
      }
    return t;
  };
  const domainSeparator$1 = new TextEncoder().encode("\nic-request");
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
      const { body } = request, fields = __rest$1(request, ["body"]);
      const requestId = requestIdOf(body);
      return Object.assign(Object.assign({}, fields), { body: {
        content: body,
        sender_pubkey: this.getPublicKey().toDer(),
        sender_sig: await this.sign(concat(domainSeparator$1, requestId))
      } });
    }
  }
  class AnonymousIdentity {
    getPrincipal() {
      return Principal.anonymous();
    }
    async transformRequest(request) {
      return Object.assign(Object.assign({}, request), { body: { content: request.body } });
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
      const newBuffer = new Uint8Array(a.byteLength + args.reduce((acc, b) => acc + b.byteLength, 0));
      newBuffer.set(new Uint8Array(a), 0);
      let i = a.byteLength;
      for (const b of args) {
        newBuffer.set(new Uint8Array(b), i);
        i += b.byteLength;
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
      for (let i = 0; i < str.length; i++) {
        let charcode = str.charCodeAt(i);
        if (charcode < 128) {
          utf8.push(charcode);
        } else if (charcode < 2048) {
          utf8.push(192 | charcode >> 6, 128 | charcode & 63);
        } else if (charcode < 55296 || charcode >= 57344) {
          utf8.push(224 | charcode >> 12, 128 | charcode >> 6 & 63, 128 | charcode & 63);
        } else {
          i++;
          charcode = (charcode & 1023) << 10 | str.charCodeAt(i) & 1023;
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
    function uSmall(n) {
      if (isNaN(n)) {
        throw new RangeError("Invalid number.");
      }
      n = Math.min(Math.max(0, n), 23);
      const bytes2 = [(0 << 5) + n];
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
    function iSmall(n) {
      if (isNaN(n)) {
        throw new RangeError("Invalid number.");
      }
      if (n === 0) {
        return uSmall(0);
      }
      n = Math.min(Math.max(0, -n), 24) - 1;
      const bytes2 = [(1 << 5) + n];
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
        let newI64 = i642.split("").reduceRight((acc, x) => {
          if (done) {
            return x + acc;
          }
          let n = parseInt(x, 16) - 1;
          if (n >= 0) {
            done = true;
            return n.toString(16) + acc;
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
    function number(n) {
      if (n >= 0) {
        if (n < 24) {
          return uSmall(n);
        } else if (n <= 255) {
          return u8(n);
        } else if (n <= 65535) {
          return u16(n);
        } else if (n <= 4294967295) {
          return u32(n);
        } else {
          return u64(n);
        }
      } else {
        if (n >= -24) {
          return iSmall(n);
        } else if (n >= -255) {
          return i8(n);
        } else if (n >= -65535) {
          return i16(n);
        } else if (n >= -4294967295) {
          return i32(n);
        } else {
          return i64(n);
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
      return _concat(_serializeNumber(5, items.size), ...entries.map(([k, v]) => _concat(_serializeString(k), v)));
    }
    value.map = map;
    function singleFloat(f) {
      const single = new Float32Array([f]);
      return _concat(new Uint8Array([(7 << 5) + 26]), new Uint8Array(single.buffer));
    }
    value.singleFloat = singleFloat;
    function doubleFloat(f) {
      const single = new Float64Array([f]);
      return _concat(new Uint8Array([(7 << 5) + 27]), new Uint8Array(single.buffer));
    }
    value.doubleFloat = doubleFloat;
    function bool(v) {
      return v ? true_() : false_();
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
        for (var k in mod2) if (Object.hasOwnProperty.call(mod2, k)) result[k] = mod2[k];
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
              return cbor.array(value2.map((x) => this._serializer.serializeValue(x)));
            } else if (BufferClasses.find((x) => value2 instanceof x)) {
              return cbor.bytes(value2.buffer);
            } else if (Object.getOwnPropertyNames(value2).indexOf("toJSON") !== -1) {
              return this.encode(value2.toJSON());
            } else if (value2 instanceof Map) {
              const m = /* @__PURE__ */ new Map();
              for (const [key, item] of value2.entries()) {
                m.set(key, this._serializer.serializeValue(item));
              }
              return cbor.map(m, this._stable);
            } else {
              const m = /* @__PURE__ */ new Map();
              for (const [key, item] of Object.entries(value2)) {
                m.set(key, this._serializer.serializeValue(item));
              }
              return cbor.map(m, this._stable);
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
        const s = new this();
        s.addEncoder(new JsonDefaultCborEncoder(s, stable));
        s.addEncoder(new ToCborEncoder());
        return s;
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
      function __export(m) {
        for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
      }
      var __importStar = src && src.__importStar || function(mod2) {
        if (mod2 && mod2.__esModule) return mod2;
        var result = {};
        if (mod2 != null) {
          for (var k in mod2) if (Object.hasOwnProperty.call(mod2, k)) result[k] = mod2[k];
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
    encode(v) {
      return srcExports.value.bytes(v.toUint8Array());
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
    encode(v) {
      return srcExports.value.bytes(new Uint8Array(v));
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
    encode(v) {
      if (v > BigInt(0)) {
        return srcExports.value.tagged(2, srcExports.value.bytes(fromHex(v.toString(16))));
      } else {
        return srcExports.value.tagged(3, srcExports.value.bytes(fromHex((BigInt("-1") * v).toString(16))));
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
  class Uint8ArrayDecoder extends borc.Decoder {
    createByteString(raw) {
      return concat(...raw);
    }
    createByteStringFromHeap(start, end) {
      if (start === end) {
        return new ArrayBuffer(0);
      }
      return new Uint8Array(this._heap.slice(start, end));
    }
  }
  var SubmitRequestType;
  (function(SubmitRequestType2) {
    SubmitRequestType2["Call"] = "call";
  })(SubmitRequestType || (SubmitRequestType = {}));
  BigInt(1e6);
  /*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
  const _0n$3 = /* @__PURE__ */ BigInt(0);
  const _1n$4 = /* @__PURE__ */ BigInt(1);
  function _abool2(value2, title = "") {
    if (typeof value2 !== "boolean") {
      const prefix = title && `"${title}"`;
      throw new Error(prefix + "expected boolean, got type=" + typeof value2);
    }
    return value2;
  }
  function _abytes2(value2, length, title = "") {
    const bytes = isBytes(value2);
    const len = value2?.length;
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
  /*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
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
  /*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
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
  (function(receiver, state, value2, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return kind === "a" ? f.call(receiver, value2) : f ? f.value = value2 : state.set(receiver, value2), value2;
  });
  (function(receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
  });
  var NodeType;
  (function(NodeType2) {
    NodeType2[NodeType2["Empty"] = 0] = "Empty";
    NodeType2[NodeType2["Fork"] = 1] = "Fork";
    NodeType2[NodeType2["Labeled"] = 2] = "Labeled";
    NodeType2[NodeType2["Leaf"] = 3] = "Leaf";
    NodeType2[NodeType2["Pruned"] = 4] = "Pruned";
  })(NodeType || (NodeType = {}));
  fromHex("308182301d060d2b0601040182dc7c0503010201060c2b0601040182dc7c05030201036100");
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
  /*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
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
  (function(receiver, state, value2, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return kind === "a" ? f.call(receiver, value2) : f ? f.value = value2 : state.set(receiver, value2), value2;
  });
  (function(receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
  });
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
    const expect = (n, msg) => {
      if (buf[offset++] !== n) {
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
  (function(receiver, state, value2, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return kind === "a" ? f.call(receiver, value2) : f ? f.value = value2 : state.set(receiver, value2), value2;
  });
  (function(receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
  });
  (function(receiver, state, value2, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return kind === "a" ? f.call(receiver, value2) : f ? f.value = value2 : state.set(receiver, value2), value2;
  });
  (function(receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
  });
  (function(receiver, state, value2, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return kind === "a" ? f.call(receiver, value2) : f ? f.value = value2 : state.set(receiver, value2), value2;
  });
  (function(receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
  });
  var RequestStatusResponseStatus;
  (function(RequestStatusResponseStatus2) {
    RequestStatusResponseStatus2["Received"] = "received";
    RequestStatusResponseStatus2["Processing"] = "processing";
    RequestStatusResponseStatus2["Replied"] = "replied";
    RequestStatusResponseStatus2["Rejected"] = "rejected";
    RequestStatusResponseStatus2["Unknown"] = "unknown";
    RequestStatusResponseStatus2["Done"] = "done";
  })(RequestStatusResponseStatus || (RequestStatusResponseStatus = {}));
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
  var __classPrivateFieldSet$3 = function(receiver, state, value2, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return kind === "a" ? f.call(receiver, value2) : f ? f.value = value2 : state.set(receiver, value2), value2;
  };
  var __classPrivateFieldGet$3 = function(receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
  };
  var _Ed25519PublicKey_rawKey, _Ed25519PublicKey_derKey, _Ed25519KeyIdentity_publicKey, _Ed25519KeyIdentity_privateKey;
  function isObject(value2) {
    return value2 !== null && typeof value2 === "object";
  }
  class Ed25519PublicKey {
    // `fromRaw` and `fromDer` should be used for instantiation, not this constructor.
    constructor(key) {
      _Ed25519PublicKey_rawKey.set(this, void 0);
      _Ed25519PublicKey_derKey.set(this, void 0);
      if (key.byteLength !== Ed25519PublicKey.RAW_KEY_LENGTH) {
        throw new Error("An Ed25519 public key must be exactly 32bytes long");
      }
      __classPrivateFieldSet$3(this, _Ed25519PublicKey_rawKey, bufFromBufLike$1(key), "f");
      __classPrivateFieldSet$3(this, _Ed25519PublicKey_derKey, Ed25519PublicKey.derEncode(key), "f");
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
      return new Ed25519PublicKey(rawKey);
    }
    static fromDer(derKey) {
      return new Ed25519PublicKey(this.derDecode(derKey));
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
  Ed25519PublicKey.RAW_KEY_LENGTH = 32;
  class Ed25519KeyIdentity extends SignIdentity {
    // `fromRaw` and `fromDer` should be used for instantiation, not this constructor.
    constructor(publicKey, privateKey) {
      super();
      _Ed25519KeyIdentity_publicKey.set(this, void 0);
      _Ed25519KeyIdentity_privateKey.set(this, void 0);
      __classPrivateFieldSet$3(this, _Ed25519KeyIdentity_publicKey, Ed25519PublicKey.from(publicKey), "f");
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
      for (let i = 0; i < 32; i++)
        sk[i] = new Uint8Array(seed)[i];
      const pk = ed25519.getPublicKey(sk);
      return Ed25519KeyIdentity.fromKeyPair(pk, sk);
    }
    static fromParsedJson(obj) {
      const [publicKeyDer, privateKeyRaw] = obj;
      return new Ed25519KeyIdentity(Ed25519PublicKey.fromDer(fromHex(publicKeyDer)), fromHex(privateKeyRaw));
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
      const [signature, message, publicKey] = [sig, msg, pk].map((x) => {
        if (typeof x === "string") {
          x = fromHex(x);
        }
        if (x instanceof Uint8Array) {
          x = bufFromBufLike$1(x.buffer);
        }
        return new Uint8Array(x);
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
  var __classPrivateFieldSet$2 = function(receiver, state, value2, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return kind === "a" ? f.call(receiver, value2) : f ? f.value = value2 : state.set(receiver, value2), value2;
  };
  var __classPrivateFieldGet$2 = function(receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
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
      return Principal.fromUint8Array(new Uint8Array(__classPrivateFieldGet$2(this, _PartialIdentity_inner, "f").rawKey));
    }
    /**
     * Required for the Identity interface, but cannot implemented for just a public key.
     */
    transformRequest() {
      return Promise.reject("Not implemented. You are attempting to use a partial identity to sign calls, but this identity only has access to the public key.To sign calls, use a DelegationIdentity instead.");
    }
  }
  _PartialIdentity_inner = /* @__PURE__ */ new WeakMap();
  var __classPrivateFieldSet$1 = function(receiver, state, value2, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return kind === "a" ? f.call(receiver, value2) : f ? f.value = value2 : state.set(receiver, value2), value2;
  };
  var __classPrivateFieldGet$1 = function(receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
  };
  var __rest = function(s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
      t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
      for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
        if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
          t[p[i]] = s[p[i]];
      }
    return t;
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
        targets: srcExports.value.array(this.targets.map((t) => srcExports.value.bytes(bufFromBufLike(t.toUint8Array()))))
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
      var _a, _b;
      const delegation = await _createSingleDelegation(from, to, expiration, options.targets);
      return new DelegationChain([...((_a = options.previous) === null || _a === void 0 ? void 0 : _a.delegations) || [], delegation], ((_b = options.previous) === null || _b === void 0 ? void 0 : _b.publicKey) || from.getPublicKey().toDer());
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
    toJSON() {
      return {
        delegations: this.delegations.map((signedDelegation) => {
          const { delegation, signature } = signedDelegation;
          const { targets } = delegation;
          return {
            delegation: Object.assign({ expiration: delegation.expiration.toString(16), pubkey: toHex(delegation.pubkey) }, targets && {
              targets: targets.map((t) => t.toHex())
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
    async transformRequest(request) {
      const { body } = request, fields = __rest(request, ["body"]);
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
      var _a;
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
        let timeout;
        return (...args) => {
          const context = this;
          const later = function() {
            timeout = void 0;
            func.apply(context, args);
          };
          clearTimeout(timeout);
          timeout = window.setTimeout(later, wait);
        };
      };
      if (options === null || options === void 0 ? void 0 : options.captureScroll) {
        const scroll = debounce(_resetTimer, (_a = options === null || options === void 0 ? void 0 : options.scrollDebounce) !== null && _a !== void 0 ? _a : 100);
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
    promise.then((value2) => {
      if (value2 instanceof IDBCursor) {
        cursorRequestMap.set(value2, request);
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
      var _a;
      return (_a = await _getValue(this._db, this._storeName, key)) !== null && _a !== void 0 ? _a : null;
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
  var __classPrivateFieldSet = function(receiver, state, value2, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return kind === "a" ? f.call(receiver, value2) : f ? f.value = value2 : state.set(receiver, value2), value2;
  };
  var __classPrivateFieldGet = function(receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
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
      const ls = typeof window === "undefined" ? typeof global === "undefined" ? typeof self === "undefined" ? void 0 : self.localStorage : global.localStorage : window.localStorage;
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
      __classPrivateFieldSet(this, _IdbStorage_options, options !== null && options !== void 0 ? options : {}, "f");
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
      var _a, _b, _c;
      const storage = (_a = options.storage) !== null && _a !== void 0 ? _a : new IdbStorage();
      const keyType = (_b = options.keyType) !== null && _b !== void 0 ? _b : ECDSA_KEY_LABEL;
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
      let chain = null;
      if (key) {
        try {
          const chainStorage = await storage.get(KEY_STORAGE_DELEGATION);
          if (typeof chainStorage === "object" && chainStorage !== null) {
            throw new Error("Delegation chain is incorrectly stored. A delegation chain should be stored as a string.");
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
      let idleManager = void 0;
      if ((_c = options.idleOptions) === null || _c === void 0 ? void 0 : _c.disableIdle) {
        idleManager = void 0;
      } else if (chain || options.identity) {
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
      return new this(identity, key, chain, storage, idleManager, options);
    }
    _registerDefaultIdleCallback() {
      var _a, _b;
      const idleOptions = (_a = this._createOptions) === null || _a === void 0 ? void 0 : _a.idleOptions;
      if (!(idleOptions === null || idleOptions === void 0 ? void 0 : idleOptions.onIdle) && !(idleOptions === null || idleOptions === void 0 ? void 0 : idleOptions.disableDefaultIdleCallback)) {
        (_b = this.idleManager) === null || _b === void 0 ? void 0 : _b.registerCallback(() => {
          this.logout();
          location.reload();
        });
      }
    }
    async _handleSuccess(message, onSuccess) {
      var _a, _b;
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
      (_a = this._idpWindow) === null || _a === void 0 ? void 0 : _a.close();
      const idleOptions = (_b = this._createOptions) === null || _b === void 0 ? void 0 : _b.idleOptions;
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
      var _a, _b, _c, _d;
      const defaultTimeToLive = (
        /* hours */
        BigInt(8) * /* nanoseconds */
        BigInt(36e11)
      );
      const identityProviderUrl = new URL(((_a = options === null || options === void 0 ? void 0 : options.identityProvider) === null || _a === void 0 ? void 0 : _a.toString()) || IDENTITY_PROVIDER_DEFAULT);
      identityProviderUrl.hash = IDENTITY_PROVIDER_ENDPOINT;
      (_b = this._idpWindow) === null || _b === void 0 ? void 0 : _b.close();
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
        var _a, _b, _c;
        if (event.origin !== identityProviderUrl.origin) {
          return;
        }
        const message = event.data;
        switch (message.kind) {
          case "authorize-ready": {
            const request = Object.assign({ kind: "authorize-client", sessionPublicKey: new Uint8Array((_a = this._key) === null || _a === void 0 ? void 0 : _a.getPublicKey().toDer()), maxTimeToLive: options === null || options === void 0 ? void 0 : options.maxTimeToLive, allowPinAuthentication: options === null || options === void 0 ? void 0 : options.allowPinAuthentication, derivationOrigin: (_b = options === null || options === void 0 ? void 0 : options.derivationOrigin) === null || _b === void 0 ? void 0 : _b.toString() }, options === null || options === void 0 ? void 0 : options.customValues);
            (_c = this._idpWindow) === null || _c === void 0 ? void 0 : _c.postMessage(request, identityProviderUrl.origin);
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
      var _a;
      (_a = this._idpWindow) === null || _a === void 0 ? void 0 : _a.close();
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
        } catch (_a) {
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
