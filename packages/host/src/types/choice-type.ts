import {
  ComponentControlContext,
  FunctionControlContext,
  FunctionMeta,
  Maybe,
  PropTypeBaseDefault,
} from "./shared-controls";

export type ChoiceValue = string | number | boolean;
export type ChoiceObject<T> = { label: string; value: T };
export type ChoiceOption<T extends ChoiceValue = ChoiceValue> =
  | T
  | ChoiceObject<T>;
export type ChoiceOptions<T extends ChoiceValue = ChoiceValue> =
  ChoiceOption<T>[];

interface ChoiceCore<Ctx extends any[], T extends ChoiceValue> {
  type: "choice";
  options: Maybe<Ctx, ChoiceOptions<T>>;
  multiSelect?: Maybe<Ctx, boolean>;
  allowSearch?: boolean;
  filterOption?: boolean;
  onSearch?: Maybe<Ctx, ((v: string) => void) | undefined>;
}

export type ComponentChoiceType<
  P,
  Opt extends ChoiceValue = ChoiceValue,
  Val = Opt | Opt[]
> = PropTypeBaseDefault<P, Val> & ChoiceCore<ComponentControlContext<P>, Opt>;

export type ToTuple<T> = T extends any[] ? T : never;

export type FunctionChoiceType<
  Args,
  Opt extends ChoiceValue = ChoiceValue
> = FunctionMeta<ToTuple<Args>> &
  ChoiceCore<FunctionControlContext<ToTuple<Args>>, Opt>;
