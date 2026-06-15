const KEY = "tag";
class Foo {
  static {
    this.prototype[KEY] = undefined;
    this.prototype.name = undefined;
  }
  [KEY];
  name;
}
