import { registerDecorator, ValidationOptions } from 'class-validator';

export const IsNotBlank = (validationOptions?: ValidationOptions) => {
  return function (object: NonNullable<unknown>, propertyName: string) {
    registerDecorator({
      name: 'isNotBlank',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          return typeof value === 'string' && value.trim().length > 0;
        },
        defaultMessage() {
          return `${propertyName} is blank`;
        },
      },
    });
  };
};
