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

// Expand an object by finding its match in a collection 'all'
// and applying a transform function 'transform(entity,key,value)'.
Object.prototype.expand = function(all,transform) {

  if (!all) return [];
  if (!transform) transform = titleTransform;

  var outbound = [];
  var _this = this;

  Object.keys(this).forEach(function(slug) {
    filtered = all.filter(function(genre) { return genre.instanceSlug === slug});
    if (filtered && filtered[0]) {
      outbound.push(transform(filtered[0],slug,_this[slug]));
    } else {
      outbound.push({slug:slug});
    }
  });

  console.log("Object.prototype.expand: outbound",outbound);
  return outbound;

};

if (!String.prototype.startsWith) {
    String.prototype.startsWith = function(searchString, position){
      position = position || 0;
      return this.substr(position, searchString.length) === searchString;
  };
}

if (!String.prototype.contains) {
  String.prototype.contains = function(it) { return this.indexOf(it) != -1; };
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
