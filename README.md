# babel-plugin-mark-fields

[![npm](https://img.shields.io/npm/v/babel-plugin-mark-fields)](https://www.npmjs.com/package/babel-plugin-mark-fields)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![CI Status](https://github.com/linsk1998/babel-plugin-mark-fields/actions/workflows/ci.yml/badge.svg)](https://github.com/linsk1998/babel-plugin-mark-fields/actions)

Babel 插件，自动在 class 中插入 `static {}` 块，将实例字段标记到 prototype 上。目的是让运行时代码能在实例创建前就提前知道有哪些字段。

## 示例

**输入：**

```js
const TAG = "tag";

class Animal {
  static count = 0;
  name;
  type = "dog";
  [TAG];
  legs = 4;
}
```

**输出：**

```js
const TAG = "tag";

class Animal {
  static {
    this.prototype.name = undefined;
    this.prototype.type = undefined;
    this.prototype[TAG] = undefined;
    this.prototype.legs = undefined;
  }
  static count = 0;
  name;
  type = "dog";
  [TAG];
  legs = 4;
}
```

`static {}` 中的 `this` 指向类自身，因此对具名类和匿名类均有效：

```js
// 匿名类同样支持
const Cat = class {
  name;
};
// → 自动生成 static { this.prototype.name = undefined; }
```

## 安装

```bash
npm install --save-dev babel-plugin-mark-fields
```

## 使用

```json
// babel.config.json
{
  "plugins": [
    "babel-plugin-mark-fields",
    ["@babel/plugin-transform-class-properties", { "loose": false }]
  ]
}
```

> **注意**：`babel-plugin-mark-fields` 需在 `@babel/plugin-transform-class-properties` 之前执行，以确保在 class properties 被转换前先读取到字段信息。

## 与 class-properties 协同

1. `mark-fields` 先运行，生成 `static { this.prototype.xxx = undefined }` 标记所有字段
2. `class-properties` 再运行，在 constructor 中用 `this.xxx = ...` 或 `Object.defineProperty` 赋实际值

这样在任何实例创建之前，`Animal.prototype` 上就已经有字段标记了，运行时代码可以提前做反射/校验。

## 字段处理规则

| 类型 | 处理 |
|---|---|
| 普通字段 (`name`) | ✅ 标记 |
| 带初始值 (`type = "dog"`) | ✅ 标记 |
| static 字段 | ❌ 跳过 |
| private 字段 (`#internal`) | ❌ 跳过 |
| computed key (`[expr]`) | ✅ 标记为 `prototype[expr]` |
| 带 decorator 的字段 | ✅ 标记 |
| 字符串 key (`"my-field"`) | ✅ 标记为 `prototype["my-field"]` |
| 匿名 class expression | ✅ 支持 |

## 适用场景

- 装饰器方案的补充：无论字段是否写了装饰器，插件都会补上 prototype 标记
- 运行时反射：框架需要在实例化之前知道类有哪些字段
- ORM / 序列化库：提前收集字段元数据
