class Animal {
  static {
    this.prototype.name = undefined;
  }
  static {
    console.log("loaded");
  }
  name;
}
