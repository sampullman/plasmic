import { expectAssignable, expectNotAssignable, expectType } from "tsd-lite";
import {
  ArrayType,
  CanvasComponentProps,
  ChoiceOptions,
  ChoiceType,
  ChoiceValue,
  ControlContext,
  CustomChoiceType,
  GraphQLType,
  MultiChoiceType,
  PlainStringType,
  RestrictPropType,
  SingleChoiceType,
  StringCompatType,
} from "../prop-types";

describe("prop-types type regression tests", () => {
  it("PlainStringType keeps its discriminant", () => {
    const sample: PlainStringType<{}> = { type: "string" };
    expectType<PlainStringType<{}>>(sample);
  });

  it("ChoiceType accepts single and multi-select variants", () => {
    type P = {};

    expectAssignable<ChoiceType<P>>({
      type: "choice" as const,
      options: ["a", "b"],
      multiSelect: false as const,
    });

    expectAssignable<ChoiceType<P>>({
      type: "choice" as const,
      options: ["a", "b"],
      multiSelect: true as const,
    });
  });

  it("ChoiceType exhaustive typing (Single / Multi / Custom)", () => {
    type P1 = { showHidden?: boolean };
    const single = {
      type: "choice" as const,
      options: ["a", 42, true] as ChoiceValue[],
      multiSelect: false as const,
      defaultValue: 42 as ChoiceValue,
    };
    expectAssignable<SingleChoiceType<P1>>(single);
    expectAssignable<ChoiceValue>(single.defaultValue);

    type P2 = {};
    const multi = {
      type: "choice" as const,
      options: [
        { label: "One", value: 1 },
        { label: "Two", value: 2 },
      ] as { label: string; value: number }[],
      multiSelect: true as const,
      defaultValue: [1] as number[],
    };
    expectAssignable<MultiChoiceType<P2>>(multi);
    expectAssignable<number[]>(multi.defaultValue);

    type P3 = { useMulti: boolean };
    const custom = {
      type: "choice" as const,
      options: (_p: P3) => ["x", "y"],
      multiSelect: (p: P3) => p.useMulti,
    };
    expectAssignable<CustomChoiceType<P3>>(custom);

    type ValueWhen<T extends boolean> = T extends true
      ? ChoiceValue[]
      : T extends false
      ? ChoiceValue
      : never;
    type Expected = ChoiceValue | ChoiceValue[];
    type Actual = ValueWhen<ReturnType<(typeof custom)["multiSelect"]>>;
    expectAssignable<Expected>({} as Actual);
    expectAssignable<Actual>({} as Expected);

    const ctxOptions = {
      type: "choice" as const,
      options: (p: P1) =>
        p.showHidden
          ? [{ label: "Hidden", value: "x" }]
          : [{ label: "Visible", value: "y" }],
    };
    type Arr = ReturnType<typeof ctxOptions.options>;
    expectAssignable<ChoiceOptions>({} as Arr);
  });

  it("InferDataType propagates through ControlContext", () => {
    interface Props extends CanvasComponentProps<{ foo: number }> {
      choice: ChoiceValue | ChoiceValue[];
    }
    type Ctx = ControlContext<Props>;
    const ctx: Ctx = [
      { choice: "a", setControlContextData: (_d: { foo: number }) => {} },
      { foo: 123 },
      { path: [] },
    ];
    expectAssignable<Ctx>(ctx);
  });

  it("RestrictPropType maps primitives to compat unions", () => {
    type X = RestrictPropType<string, {}>;
    expectAssignable<StringCompatType<{}>>({} as X);
    expectNotAssignable<StringCompatType<{}>>(42);
  });

  it("ArrayType with nested ObjectType accepts advanced config", () => {
    type P = { readonlyMode?: boolean };

    const complexArray = {
      type: "array",
      defaultValue: [] as any[],
      unstable__canDelete: (_item: unknown, ...[props]: ControlContext<P>) =>
        !props.readonlyMode,
      unstable__keyFunc: (item: { id: string }) => item.id,
      unstable__minimalValue: (..._ctx: ControlContext<P>) => [
        { id: "sample-1", status: "todo", count: 1 },
      ],
      itemType: {
        type: "object",
        nameFunc: (item: { id: string }) => `Row ${item.id}`,
        fields: {
          id: { type: "string" } as PlainStringType<P>,
          status: {
            type: "choice",
            options: ["todo", "doing", "done"],
            defaultValue: "todo",
            multiSelect: false,
          } as SingleChoiceType<P>,
          count: {
            type: "number",
            min: 0,
            max: 10,
            defaultValue: 1,
          },
        },
      },
    } as const;

    expectAssignable<ArrayType<P>>(complexArray);
    expectAssignable<PlainStringType<P>>(complexArray.itemType.fields.id);
    expectAssignable<SingleChoiceType<P>>(complexArray.itemType.fields.status);
  });

  it("GraphQLType handles dynamic endpoint / headers", () => {
    type P = { useProd?: boolean; authToken?: string };
    const gql = {
      type: "code",
      lang: "graphql",
      endpoint: (p: P) =>
        p.useProd
          ? "https://api.prod.example.com/graphql"
          : "https://api.dev.example.com/graphql",
      method: "POST",
      headers: (p: P) => ({
        Authorization: `Bearer ${p.authToken ?? "anonymous"} `,
      }),
      defaultValue: { query: "query Foo { foo }" },
    } as const;
    expectAssignable<GraphQLType<P>>(gql);
    expectAssignable<string>(gql.defaultValue.query);
  });

  it("PlainStringType rejects boolean values", () => {
    expectNotAssignable<PlainStringType<{}>>(true);
  });
});
