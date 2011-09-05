(function (window) {
var qCanver = (function (undefined) {
    var slice = Array.prototype.slice,
        toString = Object.prototype.toString,
        rtype = /\[object\s(.*)\]/,
        _QCanver = (function () {
            var _QCanver = function (id, canvas) {
                this._layers = {};
                this._styleSets = {};
                this._events = {};
                this._data = {};
                this.context = canvas.getContext("2d");
                this.id = id;
                this.element = canvas;
                this.width = canvas.width || 300;
                this.height = canvas.height || 150;
            };
            _QCanver.prototype.execute = function (/*func, [arg1, arg2, ...]*/) {
                var args = qCanver.toArray(arguments),
                    func = args.shift();
                    args.unshift(this.context);
                return func.apply(this, args);
            };
            _QCanver.prototype.setData = function (name, obj) {
                if (!qCanver.type(name) === "string") {
                    return;
                }

                this._data[name] = obj;
                return this;
            };
            _QCanver.prototype.getData = function (name) {
                return qCanver.type(name) === "string" ? this._data[name]
                                                       : undefined;
            };

            return _QCanver;
        })(),
        qCanver = (function (_QCanver) {
            var cache = {},
                qCanver = function(id, noCache) {
                   var canvas = document.getElementById(id);
                    if (canvas && canvas.getContext) {
                        if (!noCache) {
                            if (cache[id]) {
                                return cache[id];
                            }
                        }
                        return cache[id] = new _QCanver(id, canvas);
                    } else {
                        return null;
                    }
                };

            qCanver.Version = "0.0.1";
            qCanver.create = function (id, width, height) {
                var canvas = document.createElement("canvas");
                canvas.setAttribute("id", id);
                if (qCanver.type(width) === "number") {
                    canvas.setAttribute("width", width);
                }
                if (qCanver.type(height) === "number") {
                    canvas.setAttribute("height", height);
                }
                
                return new _QCanver(id, canvas);
            };
            qCanver.extend = function (/*(name, f) | obj*/) {
                if (qCanver.validType(arguments, ["object"])) {
                    var obj = arguments[0];
                    for (var p in obj) {
                        if (qCanver.type(p) === "string" 
                            && qCanver.type(obj[p]) === "function") {
                            _QCanver.prototype[p] = obj[p];
                        }
                    }
                } else if (qCanver.validType(arguments, "string function".split(" "))) {
                    _QCanver.prototype[arguments[0]] = arguments[1];
                } else {
                    return;
                }
            };
            qCanver.type = function (obj) {
                return obj == null ? String(obj) 
                                   : rtype.exec(toString.call(obj))[1].toLowerCase();
            };
            qCanver.validType =  function (args, types) {
                if (args.length === types.length) {
                    for (var i = 0, len = args.length; i < len; i++) {
                        if (qCanver.type(args[i]) !== types[i]) {
                            return false;
                        }
                    }
                    return true;
                } else {
                    return false;
                }
            };
            qCanver.toArray = function (ary) {
                return slice.call(ary);
            };
            qCanver.toRadian = function (deg) {
                return deg * Math.PI / 180;
            };
            qCanver.toRGBString = function (r, g, b) {
                if (qCanver.validType(arguments, "number number number".split(" "))) {
                    var rgb = qCanver.toArray(arguments).join(",");
                    return "rgb(" + rgb + ")";
                } else {
                    return "";
                }
            };
            qCanver.toRGBAString = function (r, g, b, a) {
                if (qCanver.validType(arguments, "number number number number".split(" "))) {
                    var rgba = qCanver.toArray(arguments).join(",");
                    return "rgba(" + rgba + ")";
                } else {
                    return "";
                }
            };
            qCanver.getMousePosition = function (event) {
                var offsetX = event.clientX || 0,
                    offsetY = event.clientY || 0,
                    rect;
                if (event.target.getBoundingClientRect) {
                    rect = event.target.getBoundingClientRect();
                }
                return {
                    "x": offsetX - rect.left,
                    "y": offsetY - rect.top
                };
            };

            return qCanver;
        })(_QCanver);
    
    return qCanver;
})();

(function (qCanver) {
    qCanver.extend({
        setLayer: function (name, func) {
            if (qCanver.validType(arguments, "string function".split(" "))) {
                var layer = qCanver.create(name, this.width, this.height);
                layer.setData("qcanver.setLayer", func);
                this._layers[name] = layer;
            }
            return this;
        },
        removeLayer: function (name) {
            if (this._layers[name]) {
                delete this._layers[name];
            }
            return this;
        },
        removeAllLayer: function () {
            this._layers = {};
            return this;
        },
        drawLayer: function (name) {
            var layers = this._layers,
                layer;
            if (name == null) {
                for (var p in layers) {
                    layer = layers[p];
                    layer.execute(layer.getData("qcanver.setLayer"), this);
                    this.drawImg(layer.element, 0, 0);
                }
            } else {
                if (layers[name]) {
                    layer = layers[name];
                    ret = layer.execute(layer.getData("qcanver.setLayer"), this);
                    this.drawImg(layer.element, 0, 0);
                }
            }
            return this;
        },
        animateLayer: function () {
            var that = this,
                layers = this._layers,
                layer,
                timerId;
            for (var p in layers) {
                layer = layers[p];
                layer.execute(layer.getData("qcanver.setLayer"), this);
            }
            timerId = setInterval(function () {
                that.clear();
                for (var p in layers) {
                    that.drawImg(layers[p].element, 0, 0);
                }
            }, 0);
            this.setData("qcanver.animateLayer", timerId);
            return this;
        },
        stopAnimateLayer: function () {
            var timerId = this.getData("qcanver.animateLayer");
            clearInterval(timerId);
            return this;
        }
    });
})(qCanver);

(function (qCanver) {
    qCanver.extend({
        clear: function () {
            this.context.clearRect(0, 0, this.width, this.height);
            return this;
        },
        fillRect: function (x, y, w, h) {
            this.context.fillRect(x, y, w, h);
            return this;
        },
        strokeRect: function (x, y, w, h) {
            this.context.strokeRect(x, y, w, h);
            return this;
        },
        fillCircle: function (x, y, radius, clockwise) {
            var ctx = this.context;
            ctx.beginPath();
            this.circle(x, y, radius, clockwise);
            ctx.fill();
            return this;
        },
        strokeCircle: function (x, y, raidus, clockwise) {
            var ctx = this.context;
            ctx.beginPath();
            this.circle(x, y, radius, clockwise);
            ctx.stroke();
            return this;
        },
        circle: function (x, y, radius, anticlockwise) {
            this.context.arc(x, y, radius, 0, Math.PI*2, anticlockwise);
            return this;
        },
        arc: function (x, y, radius, start, end, anticlockwise) {
            this.context.arc(x, y, radius, start, end, anticlockwise);
            return this;
        },
        rect: function (x, y, w, h) {
            this.context.rect(x, y, w, h);
            return this;
        },
        begin: function (x, y) {
            this.context.beginPath();
            if (qCanver.validType(arguments, "number number".split(" "))) {
                this.context.moveTo(x, y);
            }
            return this;
        },
        move: function (x, y) {
            this.context.moveTo(x, y);
            return this;
        },
        line: function (x, y) {
            this.context.lineTo(x, y);
            return this;
        },
        close: function () {
            this.context.closePath();
            return this;
        },
        draw: function (mode) {
            var args = arguments,
                type;
            if (args.length === 0) {
                this.fire("draw", this.context);
            } else {
                type = qCanver.type(args[0]);
                if (type === "function") {
                    this.execute(args[0]);
                } else if (type === "string") {
                    if (mode === "fill") {
                        this.context.fill();
                    } else if (mode === "stroke") {
                        this.context.stroke();
                    }
                }
            }
            return this;
        },
        cBezier: function (cp1x, cp1y, cp2x, cp2y, x, y) {
            this.context.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);
            return this;
        },
        qBezier: function (cp1x, cp1y, x, y) {
            this.context.quadraticCurveTo(cp1x, cp1y, x, y);
            return this;
        },
        drawImg: function () {
            this.context.drawImage.apply(this.context, arguments);
            return this;
        }
    });
})(qCanver);

(function (qCanver) {
    qCanver.extend({
        animate: function (opt, func) {
            var x = opt["x"] || 0,
                y = opt["y"] || 0,
                offsetX = opt["offsetX"] || 0,
                offsetY = opt["offsetY"] || 0,
                duration = opt["duration"] || 0,
                clear = (opt["clear"] === undefined) ? true : opt["clear"],
                timerId,
                that = this,
                ctx = this.context;

            timerId = setInterval(function () {
                if (clear) {
                    that.clear();
                }
                that.execute(func, x, y, offsetX, offsetY);
                x += offsetX;
                y += offsetY;
            }, duration);

            this.setData("qcanver.animate", timerId);
            return this;
        },
        stopAnimate: function () {
            var timerId = this.getData("qcanver.animate");
            clearInterval(timerId);

            return this;
        }
    });
})(qCanver);

(function (qCanver) {
    qCanver.extend({
        observe: function (type, handler) {
            if (!this._events[type]) {
                this._events[type] = [];
            }
            if (qCanver.type(handler) === "function") {
                this._events[type].push(handler);
            }
            return this;
        },
        fire: function (/*type, [arg1,arg2, ... ]*/) {
            var args = qCanver.toArray(arguments),
                type = args.shift(),
                events = this._events;
            if (events[type]) {
                for (var i = 0, len = events[type].length; i < len; i++) {
                    events[type][i].apply(this, args);
                }
            }
        },
        addEvent: function (type, handler) {
            this.element.addEventListener(type, handler, false);
            return this;
        },
        removeEvent: function (type, handler) {
            this.element.removeEventListener(type, handler, false);
        },
        mouseover: function (handler) {
            this.addEvent("mouseover", handler);
            return this;
        },
        mouseout: function (handler) {
            this.addEvent("mouseout", handler);
            return this;
        },
        mouseup: function (handler) {
            this.addEvent("mouseup", handler);
            return this;
        },
        mousedown: function (handler) {
            this.addEvent("mousedown", handler);
            return this;
        },
        mousemove: function (handler) {
            this.addEvent("mousemove", handler);
            return this;
        }
    });
})(qCanver);

(function (qCanver) {
    qCanver.extend({
        save: function () {
            this.context.save();
            return this;
        },
        restore: function () {
            this.context.restore();
            return this;
        },
        setStyleSet: function (name, func) {
            if (qCanver.validType(arguments, "string function".split(" "))) {
                this._styleSets[name] = func;
            }
            return this;
        },
        loadStyleSet: function (name) {
            if (this._styleSets[name]) {
                this.execute(this._styleSets[name]);
            }
            return this;
        },
        setStrokeStyle: function (style) {
            this.context.strokeStyle = style;
            return this;
        },
        setFillStyle: function (style) {
            this.context.fillStyle = style;
            return this;
        },
        setAlpha: function (alpha) {
            this.context.globalAlpha = alpha;
            return this;
        },
        strokeRGB: function (r, g, b) {
            return this.setStrokeStyle(qCanver.toRGBString(r, g, b));
        },
        fillRGB: function (r, g, b) {
            var rgb = [r, g, b];
            return this.setFillStyle(qCanver.toRGBString(r, g, b));
        },
        strokeRGBA: function (r, g, b, a) {
            return this.setStrokeStyle(qCanver.toRGBAString(r, g, b, a));
        },
        fillRGBA: function (r, g, b, a) {
            return this.setFillStyle(qCanver.toRGBAString(r, g, b, a));
        }
    });
})(qCanver);

(function (qCanver) {
    qCanver.extend({
        _linearGradient: function (ax, ay, bx, by, colors) {
            var gradient = this.context.createLinearGradient(ax, ay, bx, by);
            for (var color in colors) {
                if (qCanver.validType([color["offset"], color["color"]], "number string".split(" "))) {
                    gradient.addColorStop(color["offset"], color["color"]);
                }
            }
            return gradient;
        },
        fillLinearGradient: function (ax, ay, bx, by, colors, store) {
            var gradient = this._linearGradient(ax, ay, bx, by, colors);
            if (store) {
                this.store(store, gradient);
            }
            this.setFillStyle(gradient);
            return this;
        },
        strokeLinearGradient: function (ax, ay, bx, by, colors, store) {
            var gradient = this._linearGradient(xa, ya, xb, yb, colors);
            if (store) {
                this.store(store, gradient);
            }
            this.setStrokeStyle(gradient);
            return this;
        },
        _radialGradient: function (ax, ay, ar, bx, by, br, colors) {
            var gradient = this.context.createRadialGradient(ax, ay, ar, bx, by, br);
            for (var color in colors) {
                if (qCanver.validType([color["offset"], color["color"]], "number string".split(" "))) {
                    gradient.addColorStop(color["offset"], color["color"]);
                }
            }
            return gradient;
        },
        fillRadialGradient: function (ax, ay, ar, bx, by, br, colors, store) {
            var gradient = this._radialGradient(ax, ay, ar, bx, by, br, colors);
            if (store) {
                this.store(store, gradient);
            }
            this.setFillStyle(gradient);
            return this;
        },
        strokeRadialGradient: function (ax, ay, ar, bx, by, br, colors, store) {
            var gradient = this._radialGradient(ax, ay, ar, bx, by, br, colors);
            if (store) {
                this.store(store, gradient);
            }
            this.setStrokeStyle(gradient);
            return this;
        },
        setLineStyle: function (width, cap, join, limit) {
            var ctx = this.context;
            if (width != null) {
                ctx.lineWidth = width;
            }
            if (cap != null) {
                ctx.lineCap = cap;
            }
            if (join != null) {
                ctx.lineJoin = join;
            }
            if (limit != null) {
                ctx.miterLimit = limit;
            }
            
            return this;
        },
        setFontStyle: function (styles, size, family) {
            var style = styles.join(" ");
            family = family ? ("'" + family + "'") : "";

            this.context.font = style + " " + size + " " + family;
            return this;
        },
        setTextAlign: function (align, baseline) {
            this.context.textAlign = align;
            this.context.textBaseline = baseline;
            return this;
        },
        setTextStyle: function (styles, size, family, align, baseline) {
            this.setFontStyle(styles, size, family)
                .setTextAlign(align, baseline);
            return this;
        },
        setShadowStyle: function (color, x, y, blur) {
            var ctx = this.context;
            ctx.shadowColor = color;
            ctx.shadowOffsetX = qCanver.type(x) === "number" ? x : 0;
            ctx.shadowOffsetY = qCanver.type(y) === "number" ? y : 0;
            ctx.shadowBlur = qCanver.type(blur) === "number" ? blur : 0;
            return this;
        },
        _pattern: function (id, repetition) {
            var img = document.getElementById(id);
            return this.context.createPattern(img, repetition);
        },
        setFillPattern: function (id, repetition) {
            var pattern = this._pattern(id, repetition);
            this.setFillStyle(pattern);
            return this;
        },
        setStrokePattern: function (id, repetition) {
            var pattern = this._pattern(id, repetition);
            this.setStrokeStyle(pattern);
            return this;
        },
        setComposite: function (composite) {
            this.context.globalCompositeOperation = composite;
        }
    });
})(qCanver);

(function (qCanver) {
    qCanver.extend({
        scale: function (x, y) {
            this.context.scale(x, y);
            return this;
        },
        rotate: function (angle) {
            this.context.rotate(angle);
            return this;
        },
        translate: function (x, y) {
            this.context.translate(x, y);
            return this;
        },
        setTransform: function (m11, m12, m21, m22, dx, dy) {
            this.context.setTransform(m11, m12, m21, m22, dx, dy);
            return this;
        },
        transform: function (m11, m12, m21, m22, dx, dy) {
            this.context.transform(m11, m12, m21, m22, dx, dy);
            return this;
        }
    });
})(qCanver);

(function (qCanver) {
    qCanver.extend({
        loop: function (count, func) {
            if (!qCanver.validType(arguments, "number function".split(" "))) {
                throw new TypeError();
            }
            for (var i = 0; i < count; i++) {
                this.execute(func, i);
            }

            return this;
        },
        range: function (start, stop, step, func) {
            if (!qCanver.validType(arguments, "number number number function".split(" "))) {
                throw new TypeError();
            }
            if (step <=  0) {
                throw new TypeError();
            }
            for (var i = start; i < stop; i += step) {
                this.execute(func, i);
            }

            return this;
        },
        each: function (ary, func) {
            if (!qCanver.validType(arguments, "array function".split(" "))) {
                throw new TypeError();
            }
            for (var i = 0, len = ary.length; i < len; i++) {
                this.execute(func, ary[i], i, ary);
            }

            return this;
        }
    });
})(qCanver);


    window.qCanver = qCanver;
})(window);