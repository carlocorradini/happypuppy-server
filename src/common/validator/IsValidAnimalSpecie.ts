/* eslint-disable class-methods-use-this */
import {
  ValidatorConstraint,
  // eslint-disable-next-line no-unused-vars
  ValidatorConstraintInterface,
  // eslint-disable-next-line no-unused-vars
  ValidationOptions,
  registerDecorator,
} from 'class-validator';
import { getManager } from 'typeorm';

@ValidatorConstraint({ async: true })
export class IsValidAnimalSpecieConstraint implements ValidatorConstraintInterface {
  validate(id: any) {
    // TODO FindOne with object Entity
    return getManager()
      .findOne('AnimalSpecie', id)
      .then((animalSpecie) => {
        return animalSpecie !== undefined;
      });
  }

  defaultMessage() {
    return `$property must be a valid Animal Specie identifier`;
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
