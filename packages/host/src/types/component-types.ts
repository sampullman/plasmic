import { ChoiceValue, ComponentChoiceType } from "./choice-type";
import {
  CommonTypeBase,
  ContextDependentConfig,
  ControlExtras,
  GenericContext,
  InferDataType,
} from "./shared-controls";

export type ComponentControlContext<P> = GenericContext<
  P, // Full component props
  InferDataType<P> | null, // Canvas data
  ControlExtras
>;

export type ComponentContextConfig<Props, R> = ContextDependentConfig<
  ComponentControlContext<Props>,
  R
>;

export interface PropTypeBase<P extends any[]> extends CommonTypeBase<P> {
  displayName?: string;
  readOnly?: boolean | ContextDependentConfig<P, boolean>;
  /**
   * If true, will hide the prop in a collapsed section; good for props that
   * should not usually be used.
   */
  advanced?: boolean;
  /**
   * If set to true, the component will be remounted when the prop value is updated.
   * (This behavior only applies to canvas)
   */
  forceRemount?: boolean;
  /**
   * If true, the prop can't be overriden in different variants.
   */
  invariantable?: boolean;
}

export interface Defaultable<P extends any[], T> {
  /**
   * Default value to set for this prop when the component is instantiated
   */
  defaultValue?: T;

  /**
   * If no prop is given, the component uses a default; specify what
   * that default is so the Plasmic user can see it in the studio UI
   */
  defaultValueHint?: T | ContextDependentConfig<P, T | undefined>;

  /**
   * Use a dynamic value expression as the default instead
   */
  defaultExpr?: string;
  defaultExprHint?: string;

  /**
   * This function validates whether the prop value is valid.
   * If the value is invalid, it returns an error message. Otherwise, it returns true.
   */
  validator?: (
    value: T,
    ...args: ComponentControlContext<P>
  ) => (string | true) | Promise<string | true>;
}

export interface Controllable {
  /**
   * If true, this is a prop that should only be used inside Plasmic
   * Studio for rendering artboards; will not be actually used in
   * generated code.
   */
  editOnly?: boolean;
  /**
   * If specified, the value used for this prop will instead be
   * mapped to the uncontrolledProp when generating code. This is
   * useful if, for example, in the artboard, you want to use `value`
   * prop to control the component, but in generated code, you want to
   * map it to `defaultValue`.
   */
  uncontrolledProp?: string;
}

export interface PropTypeBaseDefault<P, T>
  extends PropTypeBase<ComponentControlContext<P>>,
    Defaultable<ComponentControlContext<P>, T>,
    Controllable {}

export interface SingleChoiceType<P, Opt extends ChoiceValue = ChoiceValue>
  extends ComponentChoiceType<P, Opt, Opt> {
  multiSelect?: false;
}

export interface MultiChoiceType<P, Opt extends ChoiceValue = ChoiceValue>
  extends ComponentChoiceType<P, Opt, Opt[]> {
  multiSelect: true;
}

export interface CustomChoiceType<P>
  extends ComponentChoiceType<P, ChoiceValue, ChoiceValue | ChoiceValue[]> {
  multiSelect: ComponentContextConfig<P, boolean>;
}

export type ChoiceType<P> =
  | SingleChoiceType<P>
  | MultiChoiceType<P>
  | CustomChoiceType<P>;
