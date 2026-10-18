/* Pure catalog, cart and checkout rules. No DOM, storage or network access. */
(function (root, factory) {
  "use strict";
  var api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
  } else {
    root.RoStore = api;
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  function normalize(text) {
    return String(text == null ? "" : text)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  }

  function productList(products) {
    return Array.isArray(products) ? products.filter(function (product) {
      return product && typeof product === "object";
    }) : [];
  }

  function compact(text) {
    return normalize(text).replace(/[^a-z0-9]/g, "");
  }

  function searchableFields(product) {
    var fields = [product.name, product.fullName, product.brand, product.code, product.summary, product.categoryName];
    if (Array.isArray(product.highlights)) fields = fields.concat(product.highlights);
    return fields.filter(function (value) {
      return typeof value === "string" || typeof value === "number";
    }).map(normalize);
  }

  function filterProducts(products, options) {
    var settings = options && typeof options === "object" ? options : {};
    var query = normalize(settings.query);
    var terms = query ? query.split(/\s+/) : [];
    var category = normalize(settings.category);
    var brands = new Set((Array.isArray(settings.brands) ? settings.brands : [])
      .map(normalize).filter(Boolean));

    var result = productList(products).filter(function (product) {
      if (category && normalize(product.categoryId) !== category) return false;
      if (brands.size && !brands.has(normalize(product.brand))) return false;
      if (!terms.length) return true;
      var fields = searchableFields(product);
      return terms.every(function (term) {
        var condensedTerm = compact(term);
        return fields.some(function (field) {
          return field.indexOf(term) !== -1 ||
            (condensedTerm.length > 0 && compact(field).indexOf(condensedTerm) !== -1);
        });
      });
    });

    var sort = settings.sort || "recommended";
    if (sort === "recommended" || ["price-asc", "price-desc", "name"].indexOf(sort) === -1) {
      return result;
    }
    // Keep the original relative order for equal prices or names.
    return result.map(function (product, index) {
      return { product: product, index: index };
    }).sort(function (left, right) {
      var comparison;
      if (sort === "name") {
        comparison = normalize(left.product.name).localeCompare(normalize(right.product.name), "ro", {
          sensitivity: "base", numeric: true
        });
      } else {
        var leftPrice = Number(left.product.price);
        var rightPrice = Number(right.product.price);
        var leftValid = Number.isFinite(leftPrice) && leftPrice >= 0;
        var rightValid = Number.isFinite(rightPrice) && rightPrice >= 0;
        if (!leftValid || !rightValid) {
          comparison = leftValid ? -1 : rightValid ? 1 : 0;
        } else {
          comparison = (leftPrice - rightPrice) * (sort === "price-desc" ? -1 : 1);
        }
      }
      return comparison || left.index - right.index;
    }).map(function (entry) { return entry.product; });
  }

  function productIndex(products) {
    var index = new Map();
    productList(products).forEach(function (product) {
      if (typeof product.id !== "string" && typeof product.id !== "number") return;
      var id = String(product.id);
      if (id && !index.has(id)) index.set(id, product);
    });
    return index;
  }

  function quantityValue(value, allowZero) {
    if (typeof value !== "number" && typeof value !== "string") return null;
    if (typeof value === "string" && !/^\d+$/.test(value.trim())) return null;
    var number = Number(value);
    if (!Number.isFinite(number) || !Number.isInteger(number)) return null;
    if (number < (allowZero ? 0 : 1)) return null;
    return Math.min(number, 99);
  }

  function writeQuantity(cart, id, quantity) {
    // Define an own data property, including for a pathological trusted ID.
    // This avoids invoking Object.prototype's __proto__ setter.
    Object.defineProperty(cart, id, {
      value: quantity, writable: true, enumerable: true, configurable: true
    });
  }

  function sanitizeCart(raw, products) {
    var clean = {};
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) return clean;
    var known = productIndex(products);
    Object.keys(raw).forEach(function (id) {
      if (!known.has(id)) return;
      var quantity = quantityValue(raw[id], false);
      if (quantity !== null) writeQuantity(clean, id, quantity);
    });
    return clean;
  }

  function addToCart(cart, id, products, quantity) {
    var clean = sanitizeCart(cart, products);
    var known = productIndex(products);
    var key = typeof id === "string" || typeof id === "number" ? String(id) : "";
    var amount = quantityValue(quantity === undefined ? 1 : quantity, false);
    if (!known.has(key) || amount === null) return clean;
    var current = Object.prototype.hasOwnProperty.call(clean, key) ? clean[key] : 0;
    writeQuantity(clean, key, Math.min(current + amount, 99));
    return clean;
  }

  function setQuantity(cart, id, quantity, products) {
    var clean = sanitizeCart(cart, products);
    var known = productIndex(products);
    var key = typeof id === "string" || typeof id === "number" ? String(id) : "";
    var amount = quantityValue(quantity, true);
    if (!known.has(key) || amount === null) return clean;
    if (amount === 0) delete clean[key];
    else writeQuantity(clean, key, amount);
    return clean;
  }

  function priceInBani(product) {
    var price = Number(product.price);
    return Number.isFinite(price) && price >= 0 ? Math.round((price + Number.EPSILON) * 100) : 0;
  }

  function cartSummary(cart, products) {
    var clean = sanitizeCart(cart, products);
    var known = productIndex(products);
    var count = 0;
    var subtotalBani = 0;
    var items = Object.keys(clean).map(function (id) {
      var product = known.get(id);
      var quantity = clean[id];
      var lineBani = priceInBani(product) * quantity;
      count += quantity;
      subtotalBani += lineBani;
      return { product: product, quantity: quantity, lineTotal: lineBani / 100 };
    });
    return { items: items, count: count, subtotal: subtotalBani / 100 };
  }

  function parseStoredCart(string, products) {
    if (typeof string !== "string") return {};
    try {
      return sanitizeCart(JSON.parse(string), products);
    } catch (error) {
      return {};
    }
  }

  function fieldText(value) {
    return typeof value === "string" ? value.trim() : "";
  }

  function validPhone(value) {
    var phone = fieldText(value);
    if (!/^[+\d\s().-]+$/.test(phone)) return false;
    phone = phone.replace(/[\s().-]/g, "");
    var national;
    if (phone.indexOf("+40") === 0) national = phone.slice(3);
    else if (phone.indexOf("0040") === 0) national = phone.slice(4);
    else if (phone.indexOf("0") === 0 && phone.indexOf("00") !== 0) national = phone.slice(1);
    else return false;
    return /^[1-9]\d{8}$/.test(national);
  }

  function validateCheckout(values) {
    var fields = values && typeof values === "object" ? values : {};
    var errors = {};
    if (fieldText(fields.name).length < 2) {
      errors.name = "Introdu numele complet (cel puțin 2 caractere).";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fieldText(fields.email))) {
      errors.email = "Introdu o adresă de email validă.";
    }
    if (!validPhone(fields.phone)) {
      errors.phone = "Introdu un număr de telefon românesc valid, cu prefixul 0, +40 sau 0040.";
    }
    if (fieldText(fields.county).length < 2) {
      errors.county = "Completează județul.";
    }
    if (fieldText(fields.city).length < 2) {
      errors.city = "Completează localitatea.";
    }
    if (fieldText(fields.address).length < 5) {
      errors.address = "Completează adresa de livrare (cel puțin 5 caractere).";
    }
    if (fields.acknowledge !== true) {
      errors.acknowledge = "Confirmă că ai înțeles că aceasta este o comandă demonstrativă.";
    }
    return errors;
  }

  return Object.freeze({
    normalize: normalize,
    filterProducts: filterProducts,
    sanitizeCart: sanitizeCart,
    addToCart: addToCart,
    setQuantity: setQuantity,
    cartSummary: cartSummary,
    parseStoredCart: parseStoredCart,
    validateCheckout: validateCheckout
  });
});
