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
import AnimalSpecie from '@app/db/entity/AnimalSpecie';
// eslint-disable-next-line no-unused-vars
import Puppy from '@app/db/entity/Puppy';

@ValidatorConstraint({ async: true })
export class IsAnimalBreedArrayBelongToAnimalSpecieConstraint
  implements ValidatorConstraintInterface {
  private invalidIds: number[] = [];

  private specie: AnimalSpecie | undefined = undefined;

  async validate(ids: number[], args: ValidationArguments) {
    if (ids.length === 0) return true;

    this.specie = getManager().create(AnimalSpecie, {
      id: ((args.object as Puppy).specie as unknown) as number,
    });

    const validIds: number[] = await getManager()
      .find(AnimalBreed, {
        where: ids.map((id) => {
          return { id, specie: this.specie };
        }),
      })
      .then((validBreeds) => validBreeds.map((breed) => breed.id));

    this.invalidIds = ids.filter((id) => validIds.indexOf(id) === -1);

    return this.invalidIds.length === 0;
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property} must contain identifiers for the same specie, ${JSON.stringify(
      this.invalidIds
    )} does not belong to specie ${this.specie?.id}`;
  }
}

export default function IsAnimalBreedArrayBelongToAnimalSpecie(
  validationOptions?: ValidationOptions
) {
  return (object: Object, propertyName: string) => {
    registerDecorator({
      name: 'isAnimalBreedArrayBelongToAnimalSpecie',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: IsAnimalBreedArrayBelongToAnimalSpecieConstraint,
    });
  };
}
