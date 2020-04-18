/* eslint-disable class-methods-use-this */
import {
  registerDecorator,
  // eslint-disable-next-line no-unused-vars
  ValidationOptions,
  // eslint-disable-next-line no-unused-vars
  ValidatorConstraintInterface,
  ValidatorConstraint,
} from 'class-validator';

@ValidatorConstraint()
export class HasNoWhitespaceConstraint implements ValidatorConstraintInterface {
  validate(value: string) {
    return typeof value === 'string' && !/\s/.test(value);
  }

  defaultMessage() {
    return `$property must not contains any whitespace`;
  }
}

export default function HasNoWhitespace(validationOptions?: ValidationOptions) {
  return (object: Object, propertyName: string) => {
    registerDecorator({
      name: 'hasNoWhitespace',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: HasNoWhitespaceConstraint,
    });
  };
}
