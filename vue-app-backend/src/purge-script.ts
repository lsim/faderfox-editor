
async function purge() {
  const kv = await Deno.openKv();
  const rows = kv.list({prefix:[]});
  let counter = 0;
  for await (const row of rows) {
    await kv.delete(row.key);
    counter++;
  }
  console.log('purged', counter, 'rows');
}

purge().then();
