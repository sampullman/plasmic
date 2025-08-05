import { ChoiceValue, ComponentChoiceType } from "./choice-type";
import { ComponentContextConfig } from "./shared-controls";

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
