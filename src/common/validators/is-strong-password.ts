import {
  isNotEmpty,
  matches,
  maxLength,
  minLength,
  registerDecorator,
  ValidationOptions,
} from 'class-validator';

export const IsStrongPassword = (validationOptions?: ValidationOptions) => {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isStrongPassword',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          const isEmpty = !isNotEmpty(value);
          const isTooShort = !minLength(value, 8);
          const isTooLong = !maxLength(value, 255);
          const pattern =
            /((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/;
          const doesNotMatchPattern = !matches(value, pattern);

          return !(isEmpty || isTooShort || isTooLong || doesNotMatchPattern);
        },
        defaultMessage() {
          return 'Password is too weak';
        },
      },
    });
  };
};
