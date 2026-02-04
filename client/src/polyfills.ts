(() => {
  if (typeof globalThis !== "object") {
    try {
      // eslint-disable-next-line no-new-func
      const getGlobal = Function("return this") as () => any;
      const global = getGlobal();
      if (global && typeof global === "object") {
        (global as any).globalThis = global;
      }
    } catch {
      // ignore
    }
  }

  if (typeof Object.assign !== "function") {
    Object.assign = function assign(target: any, ...sources: any[]) {
      if (target == null) {
        throw new TypeError("Cannot convert undefined or null to object");
      }
      const output = Object(target);
      for (let i = 0; i < sources.length; i += 1) {
        const source = sources[i];
        if (source == null) {
          continue;
        }
        const keys = Object.keys(Object(source));
        for (let j = 0; j < keys.length; j += 1) {
          const key = keys[j];
          (output as any)[key] = (source as any)[key];
        }
      }
      return output;
    };
  }

  if (typeof Object.entries !== "function") {
    Object.entries = function entries(obj: any) {
      const keys = Object.keys(Object(obj));
      const result = new Array(keys.length);
      for (let i = 0; i < keys.length; i += 1) {
        const key = keys[i];
        result[i] = [key, (obj as any)[key]];
      }
      return result;
    };
  }

  if (typeof Object.values !== "function") {
    Object.values = function values(obj: any) {
      const keys = Object.keys(Object(obj));
      const result = new Array(keys.length);
      for (let i = 0; i < keys.length; i += 1) {
        const key = keys[i];
        result[i] = (obj as any)[key];
      }
      return result;
    };
  }

  if (typeof Object.fromEntries !== "function") {
    Object.fromEntries = function fromEntries(entries: any) {
      const output: Record<string, any> = {};
      if (entries == null) {
        return output;
      }
      if (typeof Symbol === "function" && (entries as any)[Symbol.iterator]) {
        const iterator = (entries as any)[Symbol.iterator]();
        let step = iterator.next();
        while (!step.done) {
          const entry = step.value;
          if (entry) {
            output[String((entry as any)[0])] = (entry as any)[1];
          }
          step = iterator.next();
        }
        return output;
      }

      const list = Array.isArray(entries) ? entries : Array.prototype.slice.call(entries);
      for (let i = 0; i < list.length; i += 1) {
        const entry = list[i];
        if (!entry) {
          continue;
        }
        output[String((entry as any)[0])] = (entry as any)[1];
      }
      return output;
    };
  }

  if (typeof Object.setPrototypeOf !== "function") {
    try {
      Object.setPrototypeOf = function setPrototypeOf(obj, proto) {
        if (obj == null) {
          return obj as any;
        }

        if ("__proto__" in Object(obj)) {
          // eslint-disable-next-line no-proto
          (obj as any).__proto__ = proto;
          return obj;
        }

        const props = Object.getOwnPropertyNames(proto || {});
        for (let i = 0; i < props.length; i += 1) {
          const key = props[i];
          if (key in obj) {
            continue;
          }
          const desc = Object.getOwnPropertyDescriptor(proto, key);
          if (desc) {
            try {
              Object.defineProperty(obj, key, desc);
              continue;
            } catch {
              // fall through to direct assignment
            }
          }
          try {
            (obj as any)[key] = (proto as any)[key];
          } catch {
            // ignore failures on non-writable properties
          }
        }

        return obj;
      };
    } catch {
      // If we cannot patch, let runtime fail naturally.
    }
  }

  const toInteger = (value: unknown) => {
    const number = Number(value);
    if (!number) {
      return 0;
    }
    if (typeof Math.trunc === "function") {
      return Math.trunc(number);
    }
    return number < 0 ? Math.ceil(number) : Math.floor(number);
  };

  if (typeof Array.prototype.includes !== "function") {
    Object.defineProperty(Array.prototype, "includes", {
      value: function includes(
        this: ArrayLike<unknown>,
        searchElement: unknown,
        fromIndex?: number,
      ) {
        const len = this.length >>> 0;
        if (len === 0) {
          return false;
        }
        let n = toInteger(fromIndex ?? 0);
        if (n < 0) {
          n = Math.max(len + n, 0);
        }
        for (let i = n; i < len; i += 1) {
          const value = (this as any)[i];
          if (value === searchElement || (value !== value && searchElement !== searchElement)) {
            return true;
          }
        }
        return false;
      },
      writable: true,
      configurable: true,
    });
  }

  if (typeof Array.prototype.flat !== "function") {
    Object.defineProperty(Array.prototype, "flat", {
      value: function flat(this: unknown[], depth?: number) {
        const depthNum = depth === undefined ? 1 : Math.max(0, toInteger(depth));
        const flatten = (input: unknown[], level: number): unknown[] => {
          const result: unknown[] = [];
          for (let i = 0; i < input.length; i += 1) {
            if (!Object.prototype.hasOwnProperty.call(input, i)) {
              continue;
            }
            const value = input[i];
            if (Array.isArray(value) && level > 0) {
              result.push(...flatten(value, level - 1));
            } else {
              result.push(value);
            }
          }
          return result;
        };
        return flatten(this, depthNum);
      },
      writable: true,
      configurable: true,
    });
  }

  if (typeof Array.prototype.flatMap !== "function") {
    Object.defineProperty(Array.prototype, "flatMap", {
      value: function flatMap(
        this: unknown[],
        callback: (value: unknown, index: number, array: unknown[]) => unknown,
        thisArg?: unknown,
      ) {
        if (typeof callback !== "function") {
          throw new TypeError("Callback must be a function");
        }
        const mapped = new Array(this.length);
        for (let i = 0; i < this.length; i += 1) {
          if (!Object.prototype.hasOwnProperty.call(this, i)) {
            continue;
          }
          mapped[i] = callback.call(thisArg, (this as any)[i], i, this);
        }
        return (mapped as unknown[]).flat(1);
      },
      writable: true,
      configurable: true,
    });
  }

  if (typeof Array.prototype.at !== "function") {
    Object.defineProperty(Array.prototype, "at", {
      value: function at(this: ArrayLike<unknown>, index: number) {
        const len = this.length >>> 0;
        let n = toInteger(index);
        if (n < 0) {
          n += len;
        }
        if (n < 0 || n >= len) {
          return undefined;
        }
        return (this as any)[n];
      },
      writable: true,
      configurable: true,
    });
  }

  if (typeof String.prototype.includes !== "function") {
    Object.defineProperty(String.prototype, "includes", {
      value: function includes(this: unknown, search: string, start?: number) {
        const str = String(this);
        const pos = start ? Math.max(0, toInteger(start)) : 0;
        return str.indexOf(String(search), pos) !== -1;
      },
      writable: true,
      configurable: true,
    });
  }

  if (typeof String.prototype.startsWith !== "function") {
    Object.defineProperty(String.prototype, "startsWith", {
      value: function startsWith(this: unknown, search: string, start?: number) {
        const str = String(this);
        const pos = start ? Math.max(0, toInteger(start)) : 0;
        return str.slice(pos, pos + search.length) === String(search);
      },
      writable: true,
      configurable: true,
    });
  }

  if (typeof String.prototype.endsWith !== "function") {
    Object.defineProperty(String.prototype, "endsWith", {
      value: function endsWith(this: unknown, search: string, length?: number) {
        const str = String(this);
        const len = length === undefined ? str.length : Math.max(0, toInteger(length));
        const start = len - search.length;
        if (start < 0) {
          return false;
        }
        return str.slice(start, len) === String(search);
      },
      writable: true,
      configurable: true,
    });
  }

  if (typeof String.prototype.at !== "function") {
    Object.defineProperty(String.prototype, "at", {
      value: function at(this: unknown, index: number) {
        const str = String(this);
        const len = str.length >>> 0;
        let n = toInteger(index);
        if (n < 0) {
          n += len;
        }
        if (n < 0 || n >= len) {
          return undefined;
        }
        return str.charAt(n);
      },
      writable: true,
      configurable: true,
    });
  }
})();
