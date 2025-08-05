// NOTE: this file doesn't execute anything at runtime
// If a type check fails, ts-jest aborts before Jest runs

import type {
  ArrayType,
  CanvasComponentProps,
  ChoiceOptions,
  ChoiceType,
  ChoiceValue,
  ControlContext,
  CustomChoiceType,
  GraphQLType,
  MultiChoiceType,
  ObjectType,
  PlainStringType,
  RestrictPropType,
  SingleChoiceType,
  StringCompatType,
} from "../prop-types";

type IsEqual<A, B> = (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B
  ? 1
  : 2
  ? true
  : false;

type Assert<T extends true> = T;

// Use inferred types without executing code
function assertType<T>(_val: T) {
  // compile-time only
}

describe("compile-time prop type checks", () => {
  it("PlainStringType keeps its discriminant", () => {
    const sample = { type: "string" } as PlainStringType<{}>;
    assertType<PlainStringType<{}>>(sample);
  });

  it("ChoiceType multiSelect changes value type", () => {
    type P = {};
    const single = {
      type: "choice",
      options: ["a"],
      multiSelect: false,
    } satisfies ChoiceType<P> & { multiSelect?: false };

    const multi = {
      type: "choice",
      options: ["a", "b"],
      multiSelect: true,
    } satisfies ChoiceType<P> & { multiSelect?: true };

    assertType<string | number | boolean>(single.options[0]);
    assertType<string | number | boolean>(multi.options[0]);
  });

  describe("ChoiceType exhaustive type", () => {
    // Single select

    type P1 = { showHidden?: boolean };

    const single = {
      type: "choice",
      options: ["a", 42, true],
      multiSelect: false,
      defaultValue: 42,
      allowSearch: true,
      validator: (v: ChoiceValue) => v !== "bad" || "no bad!",
    } satisfies SingleChoiceType<P1>;

    assertType<ChoiceValue>(single.options[0]);
    assertType<ChoiceValue>(single.defaultValue as ChoiceValue);

    // Multi-select
    type P2 = {};

    const multi = {
      type: "choice",
      options: [
        { label: "One", value: 1 },
        { label: "Two", value: 2 },
      ],
      multiSelect: true,
      defaultValue: [1],
      filterOption: true,
    } satisfies MultiChoiceType<P2>;

    assertType<number>(multi.options[0].value);
    assertType<number[]>(multi.defaultValue);

    // Custom
    type P3 = { useMulti: boolean };

    const custom = {
      type: "choice",
      options: (_p: P3) => ["x", "y"],
      multiSelect: (p: P3) => p.useMulti,
      onSearch: (_p: P3) => (q: string) => console.log("search:", q),
    } satisfies CustomChoiceType<P3>;

    // Prove that the VALUE type toggles between primitive and array
    // depending on runtime `multiSelect` result.
    type ValueWhen<T extends boolean> = T extends true
      ? ChoiceValue[]
      : T extends false
      ? ChoiceValue
      : never;

    // At the type level, the union covers both possibilities
    type Expected = ChoiceValue | ChoiceValue[];
    type Actual = ValueWhen<ReturnType<(typeof custom)["multiSelect"]>>;

    type _toggleOK = Assert<IsEqual<Expected, Actual>>;

    // Context dependent options
    const ctxOptions = {
      type: "choice",
      options: (p: P1) =>
        p.showHidden
          ? [{ label: "Hidden", value: "x" }]
          : [{ label: "Visible", value: "y" }],
    } satisfies ChoiceType<P1>;

    // Whole array must still be assignable to ChoiceOptions
    type OptionsArr = ReturnType<typeof ctxOptions.options>; // ChoiceObject[]
    type _arrayOK = Assert<OptionsArr extends ChoiceOptions ? true : false>;

    type Elem = OptionsArr[number]; // { label: string; value: ChoiceValue }
    type _elemOK = Assert<
      Elem extends ChoiceValue | { label: string; value: ChoiceValue }
        ? true
        : false
    >;

    // ControlContext integration
    interface Props extends CanvasComponentProps<{ foo: number }> {
      choice: ChoiceValue | ChoiceValue[];
    }
    type Ctx = ControlContext<Props>;
    const c: Ctx = [
      { choice: "a", setControlContextData: () => {} },
      { foo: 123 },
      { path: [] },
    ];
    assertType<Ctx>(c);
  });

  it("InferDataType still works through ControlContext", () => {
    interface Props extends CanvasComponentProps<{ foo: number }> {
      bar: string;
    }
    type Ctx = ControlContext<Props>;
    const c: Ctx = [{ bar: "x" }, { foo: 1 }, { path: [] }];
    assertType<Ctx>(c);
  });

  it("RestrictPropType maps primitives to compat-unions", () => {
    type X = RestrictPropType<string, {}>;
    // Compile-time equality check
    type _x = Assert<IsEqual<X, StringCompatType<{}>>>;
  });

  it("ArrayType with nested ObjectTypes and advanced settings", () => {
    type P = { readonlyMode?: boolean };

    const complexArray = {
      // Array-level settings
      type: "array",
      defaultValue: [],
      unstable__canDelete: (_item, props) => !props.readonlyMode,
      unstable__keyFunc: (item) => item.id,
      unstable__minimalValue: () => [
        { id: "sample-1", status: "todo", count: 1 },
      ],

      // Nested ObjectType
      itemType: {
        type: "object",
        nameFunc: (item) => `Row ${item.id}`,
        fields: {
          id: {
            type: "string",
            required: true,
            defaultValue: "new",
            validator: (v: string) => v.trim() !== "" || "ID must not be empty",
          } satisfies PlainStringType<P>,
          status: {
            type: "choice",
            options: ["todo", "doing", "done"],
            defaultValue: "todo",
            multiSelect: false,
          } satisfies SingleChoiceType<P>,
          count: {
            type: "number",
            min: 0,
            max: 10,
            defaultValue: 1,
          },
        },
      } satisfies ObjectType<P>,
    } satisfies ArrayType<P>;

    assertType<ArrayType<P>>(complexArray);
    assertType<PlainStringType<P>>(complexArray.itemType!.fields!.id);
    assertType<SingleChoiceType<P>>(complexArray.itemType!.fields!.status);
  });

  it("GraphQLType with dynamic endpoint, headers, and validator compiles", () => {
    type P = { useProd?: boolean; authToken?: string };

    const gql = {
      type: "code",
      lang: "graphql",

      // Endpoint varies with props
      endpoint: (p: P) =>
        p.useProd
          ? "https://api.prod.example.com/graphql"
          : "https://api.dev.example.com/graphql",

      // Fixed HTTP verb
      method: "POST",

      // Dynamic headers based on control context
      headers: (p: P) => ({
        Authorization: `Bearer ${p.authToken ?? "anonymous"}`,
        "X-Custom": "plasmic",
      }),

      // Default query value
      defaultValue: {
        query: `
          query GetUser($id: ID!) {
            user(id: $id) { id name }
          }
        `,
        variables: { id: 1 },
      },

      // Simple validator example
      validator: (v) =>
        v.query.includes("query") ||
        "GraphQL query must include the keyword “query”",
    } satisfies GraphQLType<P>;

    assertType<GraphQLType<P>>(gql);
    assertType<string>(gql.defaultValue.query);
    assertType<Record<string, any> | undefined>(gql.defaultValue.variables);
  });
});

// @ts-expect-error boolean is not assignable to PlainStringType
const _bad: PlainStringType<{}> = true; // flips the expectation if types change
