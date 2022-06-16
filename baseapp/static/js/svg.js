document.getElementById('close').onmousedown = (e) => {
    e.preventDefault();
    document.getElementById('info').style.display = 'none';
    return false;
  };
  
  //-------------------------------------------------
  
  class Vector {
    constructor (x, y) {
      this.x = x || 0;
      this.y = y || 0;
    }
  
    sub (v) {
      if (v.x != null && v.y != null) {
        this.x -= v.x;
        this.y -= v.y;
      } else {
        this.x -= v;
        this.y -= v;
      }
  
      return this;
    }
  
    add (v) {
      if (v.x != null && v.y != null) {
        this.x += v.x;
        this.y += v.y;
      } else {
        this.x += v;
        this.y += v;
      }
  
      return this;
    }
  
    mul (v) {
      if (v.x != null && v.y != null) {
        this.x *= v.x;
        this.y *= v.y;
      } else {
        this.x *= v;
        this.y *= v;
      }
  
      return this;
    }
  
    div (v) {
      if (v.x != null && v.y != null) {
        this.x /= v.x;
        this.y /= v.y;
      } else {
        this.x /= v;
        this.y /= v;
      }
  
      return this;
    }
  
    normalize () {
      const length = this.length();
      if (length > 0) {
        this.x /= length;
        this.y /= length;
      }
      return this;
    }
  
    length () {
      return Math.sqrt(this.x * this.x + this.y * this.y);
    }
  
    distance (v) {
      const x = this.x - v.x;
      const y = this.y - v.y;
      return Math.sqrt(x * x + y * y);
    }
  
    reset () {
      this.x = 0;
      this.y = 0;
      return this;
    }
  
    neg () {
      this.x *= -1;
      this.y *= -1;
      return this;
    }
  
    static add (v1, v2) {
      if (v2.x != null && v2.y != null) {
        return new Vector(
          v1.x + v2.x,
          v1.y + v2.y
        );
      } else {
        return new Vector(
          v1.x + v2,
          v1.y + v2
        );
      }
    }
  
    static sub (v1, v2) {
      if (v2.x != null && v2.y != null) {
        return new Vector(
          v1.x - v2.x,
          v1.y - v2.y
        );
      } else {
        return new Vector(
          v1.x - v2,
          v1.y - v2
        );
      }
    }
  
    static mul (v1, v2) {
      if (v2.x != null && v2.y != null) {
        return new Vector(
          v1.x * v2.x,
          v1.y * v2.y
        );
      } else {
        return new Vector(
          v1.x * v2,
          v1.y * v2
        );
      }
    }
  
    static div (v1, v2) {
      if (v2.x != null && v2.y != null) {
        return new Vector(
          v1.x / v2.x,
          v1.y / v2.y
        );
      } else {
        return new Vector(
          v1.x / v2,
          v1.y / v2
        );
      }
    }
  }
  
  //-------------------------------------------------
  
  class Point {
    constructor (x, y, fixed) {
      this.pos = new Vector(x, y);
      this.pre = new Vector(x, y);
      this.acc = new Vector();
      this.fixed = fixed;
    }
  
    move (v) {
      if (this.fixed) return;
      this.pos.add(v);
    }
  
    addForce (v) {
      if (this.fixed) return;
      this.acc.add(v);
    }
  
    update (delta) {
      if (this.fixed) return;
  
      delta *= delta;
  
      const x = this.pos.x;
      const y = this.pos.y;
  
      this.acc.mul(delta);
  
      this.pos.x += x - this.pre.x + this.acc.x;
      this.pos.y += y - this.pre.y + this.acc.y;
  
      this.acc.reset();
    
      this.pre.x = x;
      this.pre.y = y;
    }
  
    checkWalls (x, y, w, h) {
      this.pos.x = Math.max(x + 1, Math.min(w - 1, this.pos.x));
      this.pos.y = Math.max(y + 1, Math.min(h - 1, this.pos.y));
  
      if (this.pos.y >= h - 1) {
        this.pos.x -= (this.pos.x - this.pre.x + this.acc.x);
      }
    }
  
    draw (ctx, size) {
      if (this.fixed) {
        ctx.fillStyle = 'rgba(255,255,255,0.2)';
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, size * 3, 0, Math.PI * 2, false);
        ctx.fill();
      }
  
      ctx.fillStyle = (this.fixed) ? '#EDEA26' : '#aaa';
      ctx.beginPath();
      ctx.arc(this.pos.x, this.pos.y, size, 0, Math.PI * 2, false);
      ctx.fill();
    }
  }
  
  //-------------------------------------------------
  
  class Constraint {
    constructor (p1, p2) {
      this.p1 = p1;
      this.p2 = p2;
      this.length = p1.pos.distance(p2.pos);
      this.stretch = this.length * 0.15;
    }
  
    resolve () {
      const dists  = Vector.sub(this.p2.pos, this.p1.pos);
      const length = dists.length();
      const diff   = length - this.length;
  
      dists.normalize();
  
      const f = dists.mul(diff * 0.5);
      this.p1.move(f);
      this.p2.move(f.neg());
    }
  
    draw (ctx, stress) {
      if (stress) {
        const diff = this.length - this.p1.pos.distance(this.p2.pos);
        const per = Math.round(Math.min(Math.abs(diff / this.stretch), 1) * 255);
        ctx.strokeStyle = 'rgba(255, '+(255 - per)+', '+(255 - per)+', 0.8)';
      } else {
        ctx.strokeStyle = 'rgba(255,255,255,0.8)';
      }
  
      ctx.beginPath();
      ctx.moveTo(this.p1.pos.x, this.p1.pos.y);
      ctx.lineTo(this.p2.pos.x, this.p2.pos.y);
      ctx.stroke();
    }
  }
  
  //-------------------------------------------------
  
  class JSVerlet {
    constructor (canvas, options) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.ctx.lineWidth = 1;
  
      this.width = canvas.width;
      this.height = canvas.height;
      this.options = options || {};
  
      this.constraints = [];
      this.points = [];
      this.draw_points = [];
  
      this.mouse = new Vector();
      this.gravity = this.options.gravity || new Vector(0, 0.98);
      this.point_size = this.options.point_size || 2;
      this.show_stress = this.options.show_stress;
  
      this.key = {
        ctrl: false,
        alt: false
      };
  
      canvas.oncontextmenu = (e) => {
        e.preventDefault();
      };
  
      if (this.options.edit) {
        document.onkeydown = (e) => {
          if (e.keyCode == 17) {
            this.key.ctrl = true;
          } else if (e.keyCode == 16) {
            this.draw_points = [];
          } else if (e.keyCode == 18) {
            this.key.alt = true;
          }
        };
  
        document.onkeyup = (e) => {
          if (e.keyCode == 17) {
            this.key.ctrl = false;
            this.draw_points = [];
          } else if (e.keyCode == 18) {
            this.key.alt = false;
          }
        };
      }
  
      if (this.options.edit || this.options.drag) {
        canvas.onmousedown = (e) => {
          const rect = this.canvas.getBoundingClientRect();
          this.mouse.x = e.clientX - rect.left;
          this.mouse.y = e.clientY - rect.top;
          this.mouse.down = true;
  
          if (this.options.edit) {
            if (e.which == 3) {
              if (this.getMousePoint()) {
                this.removePoint(this.getMousePoint());
              }
            } else {
              if (this.key.ctrl) {
                let p = this.getMousePoint();
  
                if (!p) {
                  p = new Point(this.mouse.x, this.mouse.y, this.key.alt);
                  this.points.push(p);
                }
  
                if (this.draw_points.length) {
                  this.constraints.push(
                    new Constraint(
                      p,
                      this.draw_points[this.draw_points.length - 1]
                    )
                  );
                }
  
                this.draw_points.push(p);
              } else if (this.options.drag) {
                  this.mouse_point = this.getMousePoint();
              }
            }
          } else if (this.options.drag) {
            this.mouse_point = this.getMousePoint();
          }
        };
  
        canvas.onmouseup = (e) => {
          this.mouse.down = false;
          this.mouse_point = null;
        };
  
        canvas.onmousemove = (e) => {
          const rect = this.canvas.getBoundingClientRect();
          this.mouse.x = e.clientX - rect.left;
          this.mouse.y = e.clientY - rect.top;
        };
      }
    }
  
    draw (ctx) {
      ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  
      let i = this.constraints.length;
      while(i--) this.constraints[i].draw(ctx, this.show_stress);
  
      i = this.points.length;
      while(i--) this.points[i].draw(ctx, this.point_size);
    
      if (this.mouse_point) {
        ctx.beginPath();
        ctx.arc(this.mouse_point.pos.x, this.mouse_point.pos.y, this.point_size * 3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.fill();
  
        ctx.beginPath();
        ctx.arc(this.mouse_point.pos.x, this.mouse_point.pos.y, this.point_size, 0, Math.PI * 2);
        ctx.fillStyle = (this.mouse_point.fixed) ? '#EDEA26' : '#aaa';
        ctx.fill();
      }
    
      if (this.draw_points.length) {
        const point = this.draw_points[this.draw_points.length - 1];
  
        ctx.beginPath();
        ctx.arc(point.pos.x, point.pos.y, this.point_size * 3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.fill();
  
        ctx.beginPath();
        ctx.arc(point.pos.x, point.pos.y, this.point_size, 0, Math.PI * 2);
        ctx.fillStyle = '#aaa';
        ctx.fill();
      }
    }
  
    update (iter = 6) {
      if(this.key.ctrl) return;
  
      const delta = 1 / iter;
      
      let n = iter;
      while (n--) {
        if (this.mouse_point) {
          this.mouse_point.pos.x += (this.mouse.x - this.mouse_point.pos.x)/iter;
          this.mouse_point.pos.y += (this.mouse.y - this.mouse_point.pos.y)/iter;
        }
  
        let i = this.points.length;
        while(i--) {
          const point = this.points[i];
          point.addForce(this.gravity);
          point.update(delta);
          point.checkWalls(0, 0, this.width, this.height);
        }
  
        i = this.constraints.length;
        while(i--) this.constraints[i].resolve();
      }
    }
  
    removePoint (point) {
      let i = this.constraints.length;
      while (i--) {
        const constraint = this.constraints[i];
        if (constraint.p1 == point || constraint.p2 == point) {
          this.constraints.splice(this.constraints.indexOf(constraint), 1);
        }
      }
    
      if (this.points.indexOf(point) != -1) {
        this.points.splice(this.points.indexOf(point), 1);
      }
    }
  
    getMousePoint () {
      let closest;
      let i = this.points.length;
      while (i--) {
        const point = this.points[i];
        if (point.pos.distance(this.mouse) < 10) {
          closest = point;
        }
      }
    
      return closest;
    }
  
    addPoint (x, y, fixed) {
      const point = new Point(x, y, fixed);
      this.points.push(point);
      return point;
    }
  
    addConstraint (p1, p2) {
      this.constraints.push(new Constraint(p1, p2));
    }
  
    addShape (shapes) {
      if (!(shapes instanceof Array)) {
        if (!(shapes instanceof Shape)) {
          console.log('Error: shape is not an instance of Shape.');
          return false;
        }
  
        this.points = this.points.concat(shapes.points);
        this.constraints = this.constraints.concat(shapes.constraints);
  
        return true;
      }
    
      let i = shapes.length;
      while (i--) {
        const shape = shapes[i];
        if (!(shape instanceof Shape)) {
          console.log('Error: shape[' + i + '] is not an instance of Shape.');
          return false;
        }
  
        this.points = this.points.concat(shape.points);
        this.constraints = this.constraints.concat(shape.constraints);
      }
    
      return true;
    }
  }
  
  //-------------------------------------------------
  
  class Shape {}
  
  //-------------------------------------------------
  
  class Rectangle extends Shape {
    constructor (x, y, w, h) {
      super();
  
      const p1 = new Point(x, y);
      const p2 = new Point(x + w, y);
      const p3 = new Point(x, y + h);
      const p4 = new Point(x + w, y + h);
  
      const c1 = new Constraint(p1, p2);
      const c2 = new Constraint(p2, p3);
      const c3 = new Constraint(p3, p4);
      const c4 = new Constraint(p4, p1);
      const c5 = new Constraint(p1, p3);
      const c6 = new Constraint(p2, p4);
  
      this.points = [p1, p2, p3, p4];
      this.constraints = [c1, c2, c3, c4, c5, c6];
    }
  }
  
  //-------------------------------------------------
  
  window.onload = () => {
    const canvas = document.getElementById('c');
    const ctx = canvas.getContext('2d');
    canvas.width = 1000;
    canvas.height = 340;
  
    const jsv = new JSVerlet(canvas, {drag: true, edit: true, show_stress: true});
  
    const p1  = jsv.addPoint(90, 40, false);
    const p2  = jsv.addPoint(160, 40, false);
    const p3  = jsv.addPoint(90, 110, false);
    const p4  = jsv.addPoint(160, 110, false);
    const p5  = jsv.addPoint(90, 180, false);
    const p6  = jsv.addPoint(160, 180, false);
    const p7  = jsv.addPoint(90, 250, false);
    const p8  = jsv.addPoint(160, 250, false);
    const p9  = jsv.addPoint(90, 320, true);
    const p10 = jsv.addPoint(160, 320, true);
    const p11 = jsv.addPoint(300, 40, false);
    const p12 = jsv.addPoint(365, 198, false);
    const p13 = jsv.addPoint(345, 218, false);
    const p14 = jsv.addPoint(385, 218, false);
  
    jsv.addConstraint(p1, p2);
    jsv.addConstraint(p3, p4);
    jsv.addConstraint(p5, p6);
    jsv.addConstraint(p7, p8);
    jsv.addConstraint(p1, p3);
    jsv.addConstraint(p3, p5);
    jsv.addConstraint(p5, p7);
    jsv.addConstraint(p7, p9);
    jsv.addConstraint(p2, p4);
    jsv.addConstraint(p4, p6);
    jsv.addConstraint(p6, p8);
    jsv.addConstraint(p8, p10);
    jsv.addConstraint(p1, p4);
    jsv.addConstraint(p2, p3);
    jsv.addConstraint(p3, p6);
    jsv.addConstraint(p4, p5);
    jsv.addConstraint(p5, p8);
    jsv.addConstraint(p6, p7);
    jsv.addConstraint(p7, p10);
    jsv.addConstraint(p8, p9);
    jsv.addConstraint(p2, p11);
    jsv.addConstraint(p4, p11);
    jsv.addConstraint(p11, p12);
    jsv.addConstraint(p12, p13);
    jsv.addConstraint(p12, p14);
    jsv.addConstraint(p13, p14);
  
    const square = new Rectangle(630, 70, 50, 50);
    square.points[1].fixed = true;
    
    jsv.addShape(new Rectangle(500, 70, 70, 70));
    jsv.addShape(square);
  
    const loop =() => {
      jsv.update(16);
      jsv.draw(ctx);
      window.requestAnimationFrame(loop);
    };
  
    loop();
  };