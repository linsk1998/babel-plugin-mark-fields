class Animal {
  static {
    this.prototype.name = undefined;
  }
  name;
  speak() {
    return "hello";
  }
  get type() {
    return "dog";
  }
  set type(v) {}
}
