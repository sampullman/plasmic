import { expectAssignable, expectNotAssignable, expectType } from "tsd-lite";
import {
  ArgType,
  ArrayType,
  CanvasComponentProps,
  ChoiceOptions,
  ChoiceType,
  ChoiceValue,
  ControlContext,
  CustomChoiceType,
  CustomControl,
  CustomType,
  DataPickerType,
  DataSourceType,
  DateRangeStringsType,
  DateStringType,
  EventHandlerType,
  ExprEditorType,
  FormValidationRulesType,
  GraphQLType,
  ImageUrlType,
  JSONLikeType,
  MultiChoiceType,
  NumberType,
  ObjectType,
  PlainStringType,
  RestrictPropType,
  RichDataPickerType,
  RichExprEditorType,
  RichSlotType,
  SingleChoiceType,
  SlotType,
  StringCompatType,
  StringType,
} from "../prop-types";

describe("prop-types type regression tests", () => {
  it("PlainStringType keeps its discriminant", () => {
    const sample: PlainStringType<{}> = { type: "string" };
    expectType<PlainStringType<{}>>(sample);
  });

  it("StringType literal and rich variants", () => {
    type P = {};

    expectAssignable<StringType<P>>("string");
    expectAssignable<StringType<P>>("href");
    expectAssignable<StringType<P>>({ type: "string" } as const);

    // should NOT accept numbers
    expectNotAssignable<StringType<P>>(42);
  });

  it("NumberType literal and slider variants", () => {
    type P = {};

    expectAssignable<NumberType<P>>("number");
    expectAssignable<NumberType<P>>({
      type: "number",
      control: "slider",
      step: 0.1,
    } as const);
    expectNotAssignable<NumberType<P>>("string");
  });

  it("JSONLikeType accepts plain literal, ObjectType and ArrayType", () => {
    type P = {};

    const obj: ObjectType<P> = { type: "object", fields: {} };
    const arr: ArrayType<P> = { type: "array" };
    expectAssignable<JSONLikeType<P>>("object");
    expectAssignable<JSONLikeType<P>>(obj);
    expectAssignable<JSONLikeType<P>>(arr);
  });

  it("DataSourceType requires datasource", () => {
    type P = {};
    expectAssignable<DataSourceType<P>>({
      type: "dataSource",
      dataSource: "airtable",
    } as const);

    expectAssignable<DataSourceType<P>>({
      type: "dataSource",
      dataSource: "cms",
    } as const);
    expectNotAssignable<DataSourceType<P>>({ type: "dataSource" });
  });

  it("DataPickerType – literal vs rich", () => {
    type P = {};

    expectAssignable<DataPickerType<P>>("dataPicker");

    const rich: RichDataPickerType<P> = {
      type: "dataSelector",
      data: { foo: 1 },
      defaultValue: "foo",
    };
    expectAssignable<DataPickerType<P>>(rich);
  });

  it("ExprEditorType – literal vs rich", () => {
    type P = {};

    expectAssignable<ExprEditorType<P>>("exprEditor");

    const rich: RichExprEditorType<P> = {
      type: "exprEditor",
      data: (_p: P) => ({ now: Date.now() }),
      defaultValue: ["abc"],
    };
    expectAssignable<ExprEditorType<P>>(rich);
  });

  it("FormValidationRulesType basic shape", () => {
    type P = {};

    expectAssignable<FormValidationRulesType<P>>({
      type: "formValidationRules",
    } as const);
  });

  it("EventHandlerType with argTypes", () => {
    type P = {};

    const handler: EventHandlerType<P> = {
      type: "eventHandler",
      argTypes: [
        {
          name: "event",
          type: { type: "string" } as ArgType<any>,
        },
      ],
    };
    expectAssignable<EventHandlerType<P>>(handler);
  });

  it("CustomType – control component and rich object", () => {
    type P = {};

    const Dummy: CustomControl<P> = (_props) => null;
    expectAssignable<CustomType<P>>(Dummy);

    expectAssignable<CustomType<P>>({
      type: "custom",
      control: Dummy,
      defaultValue: 123,
    } as const);
  });

  it("ImageUrlType literal and rich", () => {
    type P = {};

    expectAssignable<ImageUrlType<P>>("imageUrl");
    expectAssignable<ImageUrlType<P>>({ type: "imageUrl" } as const);
  });

  it("SlotType literal and rich", () => {
    type P = {};

    expectAssignable<SlotType<P>>("slot");

    const rich: RichSlotType<P> = {
      type: "slot",
      allowedComponents: ["Card"],
      displayName: "Body",
    };
    expectAssignable<SlotType<P>>(rich);
  });

  it("DateStringType and DateRangeStringsType", () => {
    type P = {};

    expectAssignable<DateStringType<P>>({ type: "dateString" } as const);
    expectAssignable<DateRangeStringsType<P>>({
      type: "dateRangeStrings",
      defaultValue: ["2025-01-01", "2025-01-31"] as [string, string],
    } as const);
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
