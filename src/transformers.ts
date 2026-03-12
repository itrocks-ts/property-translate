import { ObjectOrType }            from '@itrocks/class-type'
import { EDIT, HTML, OUTPUT }      from '@itrocks/transformer'
import { setPropertyTransformers } from '@itrocks/transformer'
import { tr }                      from '@itrocks/translate'

export function setPropertyTranslateHtmlTransformers<T extends object>(target: ObjectOrType<T>, property: keyof T)
{
	setPropertyTransformers(target, property, [
		{ format: HTML, direction: EDIT,   transformer: (value: string) => tr(value) },
		{ format: HTML, direction: OUTPUT, transformer: (value: string) => tr(value) }
	])
}

export function setPropertyTranslateTransformers<T extends object>(target: ObjectOrType<T>, property: keyof T)
{
	setPropertyTranslateHtmlTransformers(target, property)
}
