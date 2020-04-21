import {
  // eslint-disable-next-line no-unused-vars
  ValidationOptions,
  registerDecorator,
  ValidatorConstraint,
  // eslint-disable-next-line no-unused-vars
  ValidatorConstraintInterface,
  // eslint-disable-next-line no-unused-vars
  ValidationArguments,
} from 'class-validator';
import { getManager } from 'typeorm';
import AnimalBreed from '@app/db/entity/AnimalBreed';

@ValidatorConstraint({ async: true })
export class IsValidAnimalBreedArrayConstraint implements ValidatorConstraintInterface {
  private invalidIds: number[] = [];

  async validate(ids: number[]) {
    if (ids.length === 0) return true;

    const validIds: number[] = await getManager()
      .find(AnimalBreed, {
        select: ['id'],
        where: ids.map((id) => {
          return { id };
        }),
      })
      .then((validBreeds) => validBreeds.map((breed) => breed.id));

    this.invalidIds = ids.filter((id) => validIds.indexOf(id) === -1);

    return this.invalidIds.length === 0;
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property} must contain valid identifiers, ${JSON.stringify(this.invalidIds)} ${
      this.invalidIds.length === 1 ? 'is' : 'are'
    } unknown`;
  }
}

export default function IsValidAnimalBreedArray(validationOptions?: ValidationOptions) {
  return (object: Object, propertyName: string) => {
    registerDecorator({
      name: 'isValidAnimalBreedArray',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: IsValidAnimalBreedArrayConstraint,
    });
  };
}
