
function openKv() {
  const token = Deno.env.get("DENO_KV_ACCESS_TOKEN");
  return token ? Deno.openKv("https://api.deno.com/databases/d33ab03b-86a5-4e0d-b1c3-2698462b7aaf/connect") : Deno.openKv();
}

async function purge() {
  const kv = await openKv();
  const rows = kv.list({prefix:[]});
  let counter = 0;
  for await (const row of rows) {
    await kv.delete(row.key);
    counter++;
  }
  console.log('purged', counter, 'rows');
}

purge().then();
