/* eslint-disable class-methods-use-this */
import {
  ValidatorConstraint,
  // eslint-disable-next-line no-unused-vars
  ValidatorConstraintInterface,
  // eslint-disable-next-line no-unused-vars
  ValidationOptions,
  registerDecorator,
  // eslint-disable-next-line no-unused-vars
  ValidationArguments,
} from 'class-validator';
import { getManager } from 'typeorm';
import Personality from '@app/db/entity/Personality';

@ValidatorConstraint({ async: true })
export class IsValidPersonalityArrayConstraint implements ValidatorConstraintInterface {
  private invalidIds: number[] = [];

  async validate(ids: number[]) {
    const validIds: number[] = await getManager()
      .find(Personality, {
        select: ['id'],
        where: ids.map((id) => {
          return { id };
        }),
      })
      .then((validPersonalities) => validPersonalities.map((personality) => personality.id));

    this.invalidIds = ids.filter((id) => {
      return validIds.indexOf(id) === -1;
    });

    return this.invalidIds.length === 0;
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property} personalities must be valid identifiers, ${JSON.stringify(
      this.invalidIds
    )} ${this.invalidIds.length === 1 ? 'is' : 'are'} unknown`;
  }
}

export default function IsValidPersonalityArray(validationOptions?: ValidationOptions) {
  return (object: Object, propertyName: string) => {
    registerDecorator({
      name: 'isValidPersonalityArray',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: IsValidPersonalityArrayConstraint,
    });
  };
}
