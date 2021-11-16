import { Action } from '../Action';
import { ActionMetadata } from './ActionMetadata';
import { ParamMetadataArgs } from './args/ParamMetadataArgs';
import { ParamType } from './types/ParamType';

/**
 * Action Parameter metadata.
 */
export class ParamMetadata {
  // -------------------------------------------------------------------------
  // Properties
  // -------------------------------------------------------------------------

  /**
   * Parameter's action.
   */
  actionMetadata: ActionMetadata;

  /**
   * Object on which's method's parameter this parameter is attached.
   */
  object: any;

  /**
   * Method on which's parameter is attached.
   */
  method: string;

  /**
   * Index (# number) of the parameter in the method signature.
   */
  index: number;

  /**
   * Parameter type.
   */
  type: ParamType;

  /**
   * Parameter name.
   */
  name: string;

  /**
   * Parameter target type.
   */
  targetType?: any;

  /**
   * Parameter target type's name in lowercase.
   */
  targetName = '';

  /**
   * Indicates if target type is an object.
   */
  isTargetObject = false;

  /**
   * Indicates if this parameter is required or not
   */
  required: boolean;

  /**
   * Transforms the value.
   */
  transform?: (action: Action, value?: any) => Promise<any> | any;

  // -------------------------------------------------------------------------
  // Constructor
  // -------------------------------------------------------------------------

  constructor(actionMetadata: ActionMetadata, args: ParamMetadataArgs) {
    this.actionMetadata = actionMetadata;

    this.method = args.method;
    this.index = args.index;
    this.type = args.type;
    this.name = args.name ?? '';
    this.required = args.required;
    this.transform = args.transform;

    const ParamTypes = (Reflect as any).getMetadata('design:paramtypes', args.object, args.method);
    if (typeof ParamTypes !== 'undefined') {
      this.targetType = ParamTypes[args.index];
    }

    if (this.targetType) {
      if (this.targetType instanceof Function && this.targetType.name) {
        this.targetName = this.targetType.name.toLowerCase();
      } else if (typeof this.targetType === 'string') {
        this.targetName = this.targetType.toLowerCase();
      }
      this.isTargetObject = this.targetType instanceof Function || this.targetType.toLowerCase() === 'object';
    }
  }
}
