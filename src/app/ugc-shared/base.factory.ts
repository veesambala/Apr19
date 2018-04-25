
export class BaseFactory {
  public static validateObject<TYP>(object: any, objectName: string,
                                    enforce: boolean, validationErrors: string[]): TYP {
    if (!object) {
      BaseFactory.handleValidationError(objectName + ' must not truthy', enforce, validationErrors);

      return {} as TYP;
    }

    return object as TYP;
  }

  public static validateObjectField<TYP>(object: any, objectName: string, fieldName: string,
                                         valDefault: TYP, enforce: boolean, validationErrors: string[]) {
    if (!object) {
      throw new Error('object must be truthy');
    }

    if (!object.hasOwnProperty(fieldName)) {
      BaseFactory.handleValidationError(fieldName + ' is not in ' + objectName, enforce, validationErrors);
      object[fieldName] = valDefault;
    }
  }

  public static handleValidationError(error: string, enforce: boolean, errors: string[]): void {
    if (enforce) {
      throw new Error(error);
    }

    errors.push(error);
  }
}