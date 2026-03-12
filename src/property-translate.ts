import { ObjectOrType }      from '@itrocks/class-type'
import { decorate }          from '@itrocks/decorator/property'
import { DecorateCaller }    from '@itrocks/decorator/property'
import { decoratorOf }       from '@itrocks/decorator/property'
import { parameterProperty } from '@itrocks/decorator/property'

const PROPERTY_TRANSLATE = Symbol('translate')

type Dependencies = {
	setTransformers?: <T extends object>(target: T, property: keyof T) => void
}

const depends: Dependencies = {
}

export function propertyTranslateDependsOn(dependencies: Partial<Dependencies>)
{
	Object.assign(depends, dependencies)
}

export function Translate<T extends object>(value = true): DecorateCaller<T>
{
	const parent = decorate<T>(PROPERTY_TRANSLATE, value)
	return value
		? (target, property, index) => {
			const [targetObject, parameterName] = parameterProperty(target, property, index)
			depends.setTransformers?.(targetObject, parameterName)
			parent(target, property)
		}
		: parent
}

export function translateOf<T extends object>(target: ObjectOrType<T>, property: keyof T)
{
	return decoratorOf(target, property, PROPERTY_TRANSLATE, false)
}
