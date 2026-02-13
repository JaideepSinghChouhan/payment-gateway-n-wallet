export async function getIdempotentResponse(
  tx:any,
  key: string,
  userId: string,
  endpoint: string
) {
  return tx.idempotencyKey.findUnique({
    where: {
      key_userId_endpoint: { key, userId, endpoint },
    },
  });
}

export async function saveIdempotentResponse(
  tx:any,
  key: string,
  userId: string,
  endpoint: string,
  response: any
) {
  return tx.idempotencyKey.create({
    data: {
      key,
      userId,
      endpoint,
      requestHash: "hash_here",
      response,
    },
  });
}
