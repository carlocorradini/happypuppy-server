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
import AnimalSpecie from '@app/db/entity/AnimalSpecie';

@ValidatorConstraint({ async: true })
export class IsValidAnimalSpecieConstraint implements ValidatorConstraintInterface {
  async validate(id: number) {
    return (await getManager().findOne(AnimalSpecie, id)) !== undefined;
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property} must be a valid identifier, ${args.value} is unknown`;
  }
}

export default function IsValidAnimalSpecie(validationOptions?: ValidationOptions) {
  return (object: Object, propertyName: string) => {
    registerDecorator({
      name: 'isValidAnimalSpecie',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: IsValidAnimalSpecieConstraint,
    });
  };
}
