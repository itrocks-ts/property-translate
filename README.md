[![npm version](https://img.shields.io/npm/v/@itrocks/property-translate?logo=npm)](https://www.npmjs.org/package/@itrocks/property-translate)
[![npm downloads](https://img.shields.io/npm/dm/@itrocks/property-translate)](https://www.npmjs.org/package/@itrocks/property-translate)
[![GitHub](https://img.shields.io/github/last-commit/itrocks-ts/property-translate?color=2dba4e&label=commit&logo=github)](https://github.com/itrocks-ts/property-translate)
[![issues](https://img.shields.io/github/issues/itrocks-ts/property-translate)](https://github.com/itrocks-ts/property-translate/issues)
[![discord](https://img.shields.io/discord/1314141024020467782?color=7289da&label=discord&logo=discord&logoColor=white)](https://25.re/ditr)

# property-translate

A @Translate property decorator that translates a property's value at display time.

*This documentation was written by an artificial intelligence and may contain errors or approximations.
It has not yet been fully reviewed by a human. If anything seems unclear or incomplete,
please feel free to contact the author of this package.*

## Installation

```bash
npm i @itrocks/property-translate
```

## Usage

`@itrocks/property-translate` provides a property decorator `@Translate()`
that marks a field as “translatable”: instead of displaying the raw stored
value, the value is passed through your translation system when rendered
to the user (for example with `@itrocks/transformer` and `@itrocks/translate`).

You can:

- decorate properties with `@Translate()` so their display value is
  automatically translated,
- inspect a property with `translateOf()` to know whether translation is
  enabled,
- plug the package into your transformer pipeline using
  `propertyTranslateDependsOn()` and the helpers from the
  `@itrocks/property-translate/transformers` sub-module.

### Minimal example

```ts
import { Translate } from '@itrocks/property-translate'

class Product {
  // The stored value is a translation key, e.g. "product.name.book"
  @Translate()
  name = ''

  // Raw value, never translated automatically
  sku  = ''
}
```

In this example, any display logic that is aware of `@Translate()` can
apply the translation before showing `name` (for instance in a table,
detail view or template), while `sku` is output as-is.

### Complete example with transformer wiring

In a typical application you combine this package with
`@itrocks/transformer` and `@itrocks/translate`. The wiring below is
high-level and intentionally simplified: the exact integration will
depend on how you configure your framework.

```ts
import type { ObjectOrType } from '@itrocks/class-type'
import { applyTransformer, HTML, OUTPUT } from '@itrocks/transformer'
import { tr } from '@itrocks/translate'
import {
  Translate,
  propertyTranslateDependsOn,
} from '@itrocks/property-translate'
import {
  setPropertyTranslateTransformers,
} from '@itrocks/property-translate/transformers'

// Tell the translation decorator how to register its transformers
propertyTranslateDependsOn({
  setTransformers: setPropertyTranslateTransformers,
})

class Product {
  // Will be translated at display time using tr('product.name.book')
  @Translate()
  name = 'product.name.book'

  // Not translated
  description = ''
}

async function propertyOutput<T extends object>(
  object: T,
  property: keyof T,
): Promise<string> {
  // In a real app this function is usually provided by the framework
  return applyTransformer(
    await (object as any)[property],
    object as T,
    property as any,
    HTML,
    OUTPUT,
  ) as Promise<string>
}

async function showProduct(product: Product) {
  console.log(await propertyOutput(product, 'name'))
  console.log(await propertyOutput(product, 'description'))
}
```

Here, `name` is stored as a translation key and is automatically passed
through `tr()` when displayed, while `description` is displayed as-is.

## API

### `function propertyTranslateDependsOn(dependencies: Partial<Dependencies>): void`

Registers how `@Translate()` should configure its transformers. This is
typically called once at application startup.

#### Parameters

- `dependencies` – an object that can provide the following optional
  field:
  - `setTransformers` – function that receives a target object and
    property name, and installs the transformers used to translate the
    property at display time.

#### Typical usage

You normally pass `setPropertyTranslateTransformers` from the
`@itrocks/property-translate/transformers` module:

```ts
import { propertyTranslateDependsOn } from '@itrocks/property-translate'
import { setPropertyTranslateTransformers } from '@itrocks/property-translate/transformers'

propertyTranslateDependsOn({
  setTransformers: setPropertyTranslateTransformers,
})
```

---

### `function Translate<T extends object>(value?: boolean): DecorateCaller<T>`

Property decorator indicating that a field should be translated at
display time.

#### Parameters

- `value` *(optional, default: `true`)* – enables or disables the
  translation marker on the property. In everyday code you will usually
  write simply `@Translate()`. Passing `false` can be useful in advanced
  scenarios to remove or override an inherited translation marker.

#### Return value

- `DecorateCaller<T>` – function from `@itrocks/decorator/property`
  used internally by TypeScript to apply the decorator. You normally do
  not call it directly; you just apply `@Translate()` to the property.

#### Example

```ts
class Category {
  // Uses translation
  @Translate()
  label = 'category.label.food'

  // Explicitly disabled (no translation)
  @Translate(false)
  rawCode = 'FOOD'
}
```

---

### `function translateOf<T extends object>(target: ObjectOrType<T>, property: KeyOf<T>): boolean`

Checks whether a given property is marked with `@Translate()`.

#### Parameters

- `target` – the class (`Product`) or instance (`new Product()`) that
  owns the property to check.
- `property` – the name of the property to inspect.

#### Return value

- `boolean` – `true` if the property is currently marked as
  translatable, `false` otherwise.

#### Example

```ts
import type { ObjectOrType } from '@itrocks/class-type'
import { Translate, translateOf } from '@itrocks/property-translate'

class Product {
  @Translate()
  name = 'product.name.book'

  sku = ''
}

function isTranslatable<T extends object>(
  type: ObjectOrType<T>,
  property: keyof T,
): boolean {
  return translateOf(type, property)
}

isTranslatable(Product, 'name') // true
isTranslatable(Product, 'sku')  // false
```

---

## Transformers sub-module

The `@itrocks/property-translate/transformers` sub-module exposes
helpers that integrate `@Translate()` with the generic transformer
pipeline used by the framework.

### `function setPropertyTranslateHtmlTransformers<T extends object>(target: ObjectOrType<T>, property: KeyOf<T>): void`

Registers the transformers required to translate a property when
generating HTML output.

You rarely call this directly. It is mainly used internally by
`setPropertyTranslateTransformers`, but it can be useful if you only
want HTML-level integration and manage other kinds of output yourself.

### `function setPropertyTranslateTransformers<T extends object>(target: ObjectOrType<T>, property: KeyOf<T>): void`

Registers all transformers used by `@Translate()` for a given property.
This is the function you usually reference from
`propertyTranslateDependsOn`.

#### Example

```ts
import { propertyTranslateDependsOn } from '@itrocks/property-translate'
import { setPropertyTranslateTransformers } from '@itrocks/property-translate/transformers'

// Called once at startup
propertyTranslateDependsOn({
  setTransformers: setPropertyTranslateTransformers,
})
```

## Typical use cases

- Store translation keys in your domain models (`'product.name.book'`)
  and automatically translate them when generating user-visible output.
- Mark only some properties of a model as translatable (labels, titles,
  status names) while leaving others as raw values or codes.
- Build a generic UI (tables, forms, detail views) that inspects
  decorator metadata (`translateOf`) to decide whether a field should be
  passed through the translation system.
- Integrate property-level translation with the `@itrocks/transformer`
  pipeline using `propertyTranslateDependsOn` and
  `setPropertyTranslateTransformers`.
