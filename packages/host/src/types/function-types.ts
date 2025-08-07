import { ChoiceValue, FunctionChoiceType, ToTuple } from "./choice-type";
import {
  CommonTypeBase,
  ContextDependentConfig,
  GenericContext,
} from "./shared-controls";

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
  name: string;
  rest?: boolean;
}

export interface SingleChoiceType<P, Opt extends ChoiceValue = ChoiceValue>
  extends FunctionChoiceType<P, Opt> {
  multiSelect?: false;
}

export interface MultiChoiceType<P, Opt extends ChoiceValue = ChoiceValue>
  extends FunctionChoiceType<P, Opt> {
  multiSelect: true;
}

export interface CustomChoiceType<P, Opt extends ChoiceValue = ChoiceValue>
  extends FunctionChoiceType<P, Opt> {
  multiSelect: FunctionContextConfig<ToTuple<P>, boolean>;
}

export type ChoiceType<P, T extends ChoiceValue = ChoiceValue> =
  | SingleChoiceType<P, T>
  | MultiChoiceType<P, T>
  | CustomChoiceType<P, T>;
