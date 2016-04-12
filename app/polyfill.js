if (!Array.isArray) {
  Array.isArray = function(arg) {
    return Object.prototype.toString.call(arg) === '[object Array]';
  };
}

if (!Array.prototype.contains) {
  Array.prototype.contains = function(item) {
    for (i in this) {
      if (this[i] == item) return true;
    }
    return false;
  }
}

if (!Array.prototype.includes) {
  Array.prototype.includes = function(searchElement /*, fromIndex*/ ) {
    'use strict';
    var O = Object(this);
    var len = parseInt(O.length) || 0;
    if (len === 0) {
      return false;
    }
    var n = parseInt(arguments[1]) || 0;
    var k;
    if (n >= 0) {
      k = n;
    } else {
      k = len + n;
      if (k < 0) {k = 0;}
    }
    var currentElement;
    while (k < len) {
      currentElement = O[k];
      if (searchElement === currentElement ||
         (searchElement !== searchElement && currentElement !== currentElement)) { // NaN !== NaN
        return true;
      }
      k++;
    }
    return false;
  };
}

function titleTransform(entity) {
  return { slug: entity.instanceSlug, title: entity.title };
}

// Expand an object by finding its match in a collection 'all'
// and applying a transform function 'transform(entity)'.
Array.prototype.expand = function(all,transform) {

  if (!all) return [];
  if (!transform) transform = titleTransform;

  var outbound = [];
  this.forEach(function(slug) {
    filtered = all.filter(function(genre) { return genre.instanceSlug === slug});
    if (filtered && filtered[0]) {
      outbound.push(transform(filtered[0],slug));
    } else {
      outbound.push({slug:slug});
    }
  });
  return outbound;

};

if (!Array.prototype.find) {
  Array.prototype.find = function(predicate) {
    if (this === null) {
      throw new TypeError('Array.prototype.find called on null or undefined');
    }
    if (typeof predicate !== 'function') {
      throw new TypeError('predicate must be a function');
    }
    var list = Object(this);
    var length = list.length >>> 0;
    var thisArg = arguments[1];
    var value;

    for (var i = 0; i < length; i++) {
      value = list[i];
      if (predicate.call(thisArg, value, i, list)) {
        return value;
      }
    }
    return undefined;
  };
}

Array.prototype.findBySlug = function(slug) {
  return this.find(function(el) { return el.instanceSlug === slug; })
}

if (!String.prototype.startsWith) {
    String.prototype.startsWith = function(searchString, position){
      position = position || 0;
      return this.substr(position, searchString.length) === searchString;
  };
}

if (!String.prototype.contains) {
  String.prototype.contains = function(it) { return this.indexOf(it) != -1; };
}

if (!String.prototype.matchesSequence) {
  String.prototype.matchesSequence = function(sequence) {
    if (!sequence) return false;
    if (sequence === "") return true;
    var pattern = sequence.split("").join(".*");
    var exp = new RegExp(pattern);
    return exp.test(this);
  };
}

if (!String.prototype.walkDirectory) {
  String.prototype.walkDirectory = function(fileCallback) {
    var dir = this;
    var list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = dir + '/' + file;
        var stat = fs.statSync(file);
        if (stat && stat.isDirectory()) walk(file,fileCallback);
        else fileCallback(file);
    })
  }
}
