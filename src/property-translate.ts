import { KeyOf }              from '@itrocks/class-type'
import { ObjectOrType }       from '@itrocks/class-type'
import { decorate }           from '@itrocks/decorator/property'
import { DecorateCaller }     from '@itrocks/decorator/property'
import { decoratorOf }        from '@itrocks/decorator/property'
import { parameterDecorator } from '@itrocks/decorator/property'

const PROPERTY_TRANSLATE = Symbol('translate')

type Dependencies = {
	setTransformers?: <T extends object>(target: T, property: KeyOf<T>) => void
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
			[target, property] = parameterDecorator(PROPERTY_TRANSLATE, target, property, index)
			depends.setTransformers?.(target, property)
			parent(target, property)
		}
		: parent
}

export function translateOf<T extends object>(target: ObjectOrType<T>, property: KeyOf<T>)
{
	return decoratorOf(target, property, PROPERTY_TRANSLATE, false)
}
