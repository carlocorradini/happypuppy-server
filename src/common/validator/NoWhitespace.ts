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
export class NoWhitespaceConstraint implements ValidatorConstraintInterface {
  public validate(value: string) {
    return typeof value === 'string' && !/\s/.test(value);
  }

  public defaultMessage() {
    return `$property must not contains any whitespace`;
  }
}

export default function NoWhitespace(validationOptions?: ValidationOptions) {
  return (object: Object, propertyName: string) => {
    registerDecorator({
      name: 'noWhitespace',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: NoWhitespaceConstraint,
    });
  };
}
