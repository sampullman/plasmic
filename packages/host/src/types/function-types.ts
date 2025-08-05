import { ChoiceValue, FunctionChoiceType, ToTuple } from "./choice-type";
import { FunctionContextConfig } from "./shared-controls";

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

export type ChoiceType<P> =
  | SingleChoiceType<P>
  | MultiChoiceType<P>
  | CustomChoiceType<P>;
