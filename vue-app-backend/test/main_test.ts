import { expect } from 'jsr:@std/expect';

import { unzip, zip } from '../src/util.ts';

Deno.test('zipTest', async () => {

  const jsonSample = '{ "foo": 42, "bar 🪴": [43, 44], "baz": null }';

  const archive = await zip(jsonSample);
  const unzipped = await unzip(archive)

  expect(unzipped).toEqual(jsonSample);
});
