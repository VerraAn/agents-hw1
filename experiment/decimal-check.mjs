for (const version of ['direct', 'with-spec']) {
  const { validate } = await import(`../${version}/domain.mjs`);
  for (const [input, expected] of [['0x10', false], ['.5', true], [',5', true], ['0,5', true]]) {
    const accepted = !validate('Конспект', input).hours;
    console.log(`${version} ${JSON.stringify(input)}: ${accepted ? 'принято' : 'отклонено'} (${accepted === expected ? 'OK' : 'FAIL'})`);
    if (accepted !== expected) process.exitCode = 1;
  }
}
