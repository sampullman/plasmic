// Generic tuple specialized by code-components and custom-functions
export type GenericContext<Props, Data, Extra = unknown> = [Props, Data, Extra];

/**
 * Config option that takes the context (e.g., props) of the component instance
 * or function to dynamically set its value.
 */
export type ContextDependentConfig<Ctx extends any[], R> = (...args: Ctx) => R;

export type Maybe<Ctx extends any[], V> = V | ContextDependentConfig<Ctx, V>;

export interface CanvasComponentProps<Data = any> {
  /**
   * This prop is only provided within the canvas of Plasmic Studio.
   * Allows the component to set data to be consumed by the props' controls.
   */
  setControlContextData?: (data: Data) => void;
}

export type ControlExtras = {
  path: (string | number)[];
  item?: any;
};

export type InferDataType<P> = P extends CanvasComponentProps<infer Data>
  ? Data
  : any;

export type ComponentControlContext<P> = GenericContext<
  P, // Full component props
  InferDataType<P> | null, // Canvas data
  ControlExtras
>;

export type ComponentContextConfig<Props, R> = ContextDependentConfig<
  ComponentControlContext<Props>,
  R
>;

interface CommonTypeBase<P extends any[]> {
  displayName?: string;
  description?: string;
  helpText?: string;
  required?: boolean;
  /**
   * If the user has chosen to use a dynamic expression for this prop, provide
   * a hint as to the expected values that the expression should evaluate to.
   * This hint will be displayed alongside the code editor.  You may use
   * markdown in the text here.
   */
  exprHint?: string;
  /**
   * Function for whether this prop should be hidden in the right panel,
   * given the current props for this component
   */
  hidden?: ContextDependentConfig<P, boolean>;
  /**
   * If true, does not allow the user to use a dynamic expression for this prop
   */
  disableDynamicValue?: boolean;
}

export interface PropTypeBase<P extends any[]> extends CommonTypeBase<P> {
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

export type FunctionControlContext<P> = GenericContext<
  Partial<P>, // Partial function props
  any
>;

export type FunctionContextConfig<
  Args extends any[],
  R
> = ContextDependentConfig<FunctionControlContext<Args>, R>;

export interface FunctionMeta<Args extends any[] = any>
  extends CommonTypeBase<FunctionControlContext<Args>> {
  rest?: boolean;
}
