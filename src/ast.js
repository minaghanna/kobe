import fs from "fs";
import ohm from "ohm-js";
import * as core from "./core.js";

const kobeGrammar = ohm.grammar(fs.readFileSync("src/kobe.ohm"));

const astBuilder = kobeGrammar.createSemantics().addOperation("ast", {
  Program(statements) {
    return new core.Program(statements.ast());
  },
  Statement_vardec(type, id, _eq, initializer) {
    return new core.VariableDeclaration(
      type.ast(),
      id.ast(),
      initializer.ast()
    );
  },
  Statement_fundec(returnType, _job, id, _open, params, _close, chunk) {
    return new core.FunctionDeclaration(
      new core.Function(id.ast(), params.asIteration().ast(), returnType.ast()),
      chunk.ast()
    );
  },
  Statement_assign(type, id, _eq, expression) {
    return new core.Assignment(type.ast(), id.ast(), expression.ast());
  },
  Statement_print(_print, _open, argument, _close) {
    return new core.PrintStatement(argument.ast());
  },
  Statement_while(_grindUntil, test, chunk) {
    return new core.WhileStatement(test.ast(), chunk.ast());
  },
  Chunk(_open, body, _close) {
    return body.ast();
  },
  Exp_unary(op, operand) {
    return new core.UnaryExpression(op.sourceString, operand.ast());
  },
  Exp_binary(left, _or, right) {
    return new core.BinaryExpression("or", left.ast(), right.ast());
  },
  Exp1_binary(left, _and, right) {
    return new core.BinaryExpression("and", left.ast(), right.ast());
  },
  Exp2_binary(left, compare, right) {
    return new core.BinaryExpression(
      compare.sourceString,
      left.ast(),
      right.ast()
    );
  },
  Exp3_binary(left, addop, right) {
    return new core.BinaryExpression(
      addop.sourceString,
      left.ast(),
      right.ast()
    );
  },
  Exp4_binary(left, mulop, right) {
    return new core.BinaryExpression(
      mulop.sourceString,
      left.ast(),
      right.ast()
    );
  },
  Exp5_binary(left, _power, right) {
    return new core.BinaryExpression("to the", left.ast(), right.ast());
  },
  Exp6_parens(_open, expression, _close) {
    return expression.ast();
  },
  Call(id, _open, args, _close) {
    return new core.Call(id.ast(), args.asIteration().ast());
  },
  id(_first, _rest) {
    return new core.Token("Id", this.source);
  },
  true(_) {
    return new core.Token("Baal", this.source);
  },
  false(_) {
    return new core.Token("Baal", this.source);
  },
  num(_whole, _point, _fraction, _e, _sign, _exponent) {
    return new core.Token("Num", this.source);
  },
  _terminal() {
    return new core.Token("Sym", this.source);
  },
  _iter(...children) {
    return children.map((child) => child.ast());
  },
});

export default function ast(sourceCode) {
  const match = kobeGrammar.match(sourceCode);
  if (!match.succeeded()) core.error(match.message);
  return astBuilder(match).ast();
}
