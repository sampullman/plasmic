import { expectAssignable, expectNotAssignable, expectType } from "tsd-lite";
import {
  AnyType,
  ArrayType,
  BooleanType,
  GraphQLType,
  MultiChoiceType,
  NumberType,
  ObjectType,
  PlainStringType,
  SingleChoiceType,
  StringType,
} from "../registerFunction";

// Dummy props context for the generic <P>
type Ctx = {};

describe("custom-function param type regression tests", () => {
  // Primitive param types
  it("PlainStringType keeps its discriminant", () => {
    const sample: PlainStringType<""> = { name: "mystr", type: "string" };
    expectType<PlainStringType<"">>(sample);
  });

  it("BooleanType accepts only boolean-typed variants", () => {
    const ok: BooleanType<Ctx> = { name: "flag", type: "boolean" };
    expectAssignable<BooleanType<Ctx>>(ok);

    // wrong discriminant
    expectNotAssignable<BooleanType<Ctx>>({ name: "bad", type: "number" });
  });

  it("NumberType accepts only number-typed variants", () => {
    const ok: NumberType<Ctx> = { name: "age", type: "number" };
    expectAssignable<NumberType<Ctx>>(ok);

    expectNotAssignable<NumberType<Ctx>>({ name: "bad", type: "string" });
  });

  it('StringType can be literal "string" or object form', () => {
    const lit = "string" as const;
    expectAssignable<StringType<Ctx>>(lit);

    const obj: StringType<Ctx> = { name: "title", type: "string" };
    expectAssignable<StringType<Ctx>>(obj);
  });

  // Choice-based param types
  it("SingleChoiceType requires multiSelect=false|undefined and flat options", () => {
    const single: SingleChoiceType<Ctx, "red" | "blue"> = {
      name: "color",
      type: "choice",
      options: ["red", "blue"],
      // multiSelect defaults to false
    };
    expectType<SingleChoiceType<Ctx, "red" | "blue">>(single);

    // `multiSelect: true` is not allowed for SingleChoiceType
    expectNotAssignable<SingleChoiceType<Ctx, "red" | "blue">>({
      ...single,
      multiSelect: true,
    });
  });

  it("MultiChoiceType requires multiSelect=true and nested options", () => {
    const multi: MultiChoiceType<Ctx, "red" | "blue"> = {
      name: "colors",
      type: "choice",
      multiSelect: true,
      // T = "red" | "blue" -> options expects string[][]
      options: [["red", "blue"], ["red"]],
    };
    expectType<MultiChoiceType<Ctx, "red" | "blue">>(multi);

    // `multiSelect: false` (or missing) is not allowed for MultiChoiceType
    expectNotAssignable<MultiChoiceType<Ctx, "red" | "blue">>({
      ...multi,
      multiSelect: false,
    });
  });

  // Any / GraphQL / Structural param types
  it('AnyType allows the bare "any" discriminant', () => {
    const anyParam: AnyType = { name: "whatever", type: "any" };
    expectType<AnyType>(anyParam);
  });

  it("GraphQLType enforces required shape", () => {
    const gql: GraphQLType<Ctx> = {
      name: "GetUsers",
      type: "code",
      lang: "graphql",
      endpoint: "/api/graphql",
    };
    expectType<GraphQLType<Ctx>>(gql);

    // Missing `type: "code"` should fail
    expectNotAssignable<GraphQLType<Ctx>>({
      ...gql,
      type: "graphql",
    });
  });

  it("ArrayType and ObjectType discriminants work", () => {
    const arr: ArrayType = { name: "items", type: "array" };
    expectAssignable<ArrayType>(arr);

    const obj: ObjectType = { name: "payload", type: "object" };
    expectAssignable<ObjectType>(obj);

    // Wrong discriminant
    expectNotAssignable<ArrayType>({ name: "nope", type: "object" });
    expectNotAssignable<ObjectType>({ name: "nope", type: "array" });
  });
});
