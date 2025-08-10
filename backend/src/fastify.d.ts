declare module 'fastify' {
  interface FastifyInstance {
    authenticate: any;
    rbac: (roles: string[]) => any;
  }
  interface FastifyRequest {
    user: any;
  }
}
