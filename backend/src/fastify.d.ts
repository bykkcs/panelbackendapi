// Augment fastify's built-in types so the custom decorators we
// register in `server.ts` are recognized by TypeScript. Without the
// explicit generic parameters the interface declaration would override
// fastify's own `FastifyInstance` definition which removed core route
// methods like `get` and `post`.  By re-declaring the full generic
// signature we extend the existing interface instead of replacing it.

import type {
  RawServerBase,
  RawServerDefault,
  RawRequestDefaultExpression,
  RawReplyDefaultExpression,
} from 'fastify';

declare module 'fastify' {
  interface FastifyInstance<
    RawServer extends RawServerBase = RawServerDefault,
    RawRequest = RawRequestDefaultExpression,
    RawReply = RawReplyDefaultExpression
  > {
    authenticate: any;
    rbac: (roles: string[]) => any;
  }

  interface FastifyRequest {
    user: any;
  }
}
