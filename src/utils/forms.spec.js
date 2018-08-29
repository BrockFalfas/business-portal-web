import {
  makeEmptyInitialValues,
  makeValidationSchema,
  yupDateTransformer,
  validateFieldsSchema,
} from './forms';

describe('utils: forms', () => {
  describe('validateFieldsSchema', () => {
    it('should throw if param is not an object', () => {
      expect(() => validateFieldsSchema(1)).toThrow();
      expect(() => validateFieldsSchema(true)).toThrow();
      expect(() => validateFieldsSchema(undefined)).toThrow();
    });

    it('should throw if object is empty', () => {
      expect(() => validateFieldsSchema({})).toThrow();
    });

    it('should not throw if object is a valid schema', () => {
      expect(() => validateFieldsSchema({ email: {} })).not.toThrow();
    });
  });

  describe('makeEmptyInitialValues', () => {
    it('should throw an exception on invalid schema', () => {
      expect(() => makeEmptyInitialValues(null)).toThrow();
      expect(() => makeEmptyInitialValues(undefined)).toThrow();
      expect(() => makeEmptyInitialValues({})).toThrow();
    });

    it('should return the schema structure with empty strings as values', () => {
      const schema = {
        username: { icon: 'fake icon' },
        email: { something: true },
      };
      const result = makeEmptyInitialValues(schema);
      expect(result).toEqual({
        username: '',
        email: '',
      });
    });

    it('should work with nested structures using "fields" property', () => {
      const schema = {
        user: {
          fields: {
            firstName: {},
            lastName: {},
          },
        },
        email: {},
      };
      expect(makeEmptyInitialValues(schema)).toEqual({
        user: {
          firstName: '',
          lastName: '',
        },
        email: '',
      });
    });

    it('should use provided default values', () => {
      const schema = {
        user: {
          fields: {
            firstName: {},
            lastName: {},
          },
        },
        email: {},
        city: {},
      };
      const values = {
        user: {
          lastName: 'Tester',
        },
        city: 'Seattle',
      };
      expect(makeEmptyInitialValues(schema, values)).toEqual({
        user: {
          firstName: '',
          lastName: 'Tester',
        },
        email: '',
        city: 'Seattle',
      });
    });
  });

  describe('makeValidationSchema', () => {
    const makeFakeValidator = () => ({ fake: 'validator' });
    const makeFakeValidatorWithLabel = () => ({
      fake: 'validator',
      label: jest.fn(l => 'used label validator'),
    });
    const nodeValidator = node => ({ ...node, node: 'injected' });

    it('should throw an exception on invalid schema', () => {
      expect(() => makeValidationSchema(null)).toThrow();
      expect(() => makeValidationSchema(undefined)).toThrow();
      expect(() => makeValidationSchema({})).toThrow();
    });

    it('should generate validators for each field', () => {
      const userValidator = makeFakeValidator();
      const emailValidator = makeFakeValidator();

      const schema = {
        user: { validator: userValidator },
        email: { validator: emailValidator },
      };

      expect(makeValidationSchema(schema, nodeValidator)).toEqual({
        user: { fake: 'validator' },
        email: { fake: 'validator' },
        node: 'injected',
      });
    });

    it('should work with nested structures using "fields" property', () => {
      const userValidator = makeFakeValidator();
      const emailValidator = makeFakeValidator();
      const firstNestedValidator = makeFakeValidator();

      const schema = {
        user: { validator: userValidator },
        email: { validator: emailValidator },
        nested: {
          fields: {
            first: { validator: firstNestedValidator },
          },
        },
      };

      expect(makeValidationSchema(schema, nodeValidator)).toEqual({
        user: { fake: 'validator' },
        email: { fake: 'validator' },
        nested: {
          first: { fake: 'validator' },
          node: 'injected',
        },
        node: 'injected',
      });
    });

    it('should add label validator for better error message, if label is present', () => {
      const userValidator = makeFakeValidatorWithLabel();
      const emailValidator = makeFakeValidatorWithLabel();

      const schema = {
        user: { label: 'User name', validator: userValidator },
        email: { label: 'E-mail', validator: emailValidator },
      };

      expect(makeValidationSchema(schema, nodeValidator)).toEqual({
        user: 'used label validator',
        email: 'used label validator',
        node: 'injected',
      });

      expect(userValidator.label).toHaveBeenCalledWith('User name');
      expect(emailValidator.label).toHaveBeenCalledWith('E-mail');
    });
  });

  describe('yupDateTransformer', () => {
    it('should return a function', () => {
      expect(yupDateTransformer('YYYY/DD/MM')).toBeInstanceOf(Function);
    });

    const FakeSchema = {
      isType: jest.fn(),
    };

    it('should return current value if it is already properly transformed', () => {
      FakeSchema.isType.mockReturnValueOnce(true);
      const transformer = yupDateTransformer('YYYY/DD/MM').bind(FakeSchema);
      const currentValue = 'current';
      const originalValue = 'original';
      const result = transformer(currentValue, originalValue);
      expect(result).toBe(currentValue);
    });

    it('should return original value as Date if it is valid', () => {
      FakeSchema.isType.mockReturnValueOnce(false);
      const transformer = yupDateTransformer('YYYY/DD/MM').bind(FakeSchema);
      const currentValue = '2010-01-01';
      const originalValue = '2010/01/01';
      const result = transformer(currentValue, originalValue);
      expect(result).toEqual(new Date('2010-01-01T00:00:00'));
    });

    it('should return current date as Date if original value is invalid', () => {
      FakeSchema.isType.mockReturnValueOnce(false);
      const transformer = yupDateTransformer('YYYY/DD/MM').bind(FakeSchema);
      const currentValue = '2010-71-01';
      const originalValue = '2010/01/71';
      const result = transformer(currentValue, originalValue);
      expect(result).toBeInstanceOf(Date);
    });
  });
});
