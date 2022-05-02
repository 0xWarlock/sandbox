const { TestScheduler } = require('rxjs/testing');
const {
  distinct,
  from,
  interval,
  map,
  Subject,
  takeUntil,
  throttleTime,
  toArray,
  timer
} = require('rxjs');

const testScheduler = new TestScheduler((actual, expected) => {
  // asserting the two objects are equal - required
  // for TestScheduler assertions to work via your test framework
  // e.g. using chai.
  expect(actual).toEqual(expected);
});

// This test runs synchronously.
test('generates the stream correctly', () => {
  testScheduler.run((helpers) => {
    const { cold, time, expectObservable, expectSubscriptions } = helpers;
    const e1 = cold(' -a--b--c---|');
    const e1subs = '  ^----------!';
    const t = time('   ---|       '); // t = 3
    const expected = '-a-----c---|';

    expectObservable(e1.pipe(throttleTime(t))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });
});

function turns({ commands, ticksPerTurn }) {
  console.log(commands);
  const commandObservables = commands
    .pipe(distinct(c => c.userId));

  return commandObservables;
}

function generateCommands(commands) {
  return from(commands);
}

test('throttles characters', done => {
  const commands = generateCommands([
    {
      tick: 0,
      userId: 'u0',
      commandId: 'c0',
    },
    {
      tick: 1,
      userId: 'u0',
      commandId: 'c1',
    },
    {
      tick: 2,
      userId: 'u1',
      commandId: 'c2'
    }
  ]);
  
  const ts = turns({
    commands,
    ticksPerTurn: 5,
  });

  const recordedTurns = [];

  ts.subscribe(turn => {
    if (recordedTurns.length == 2) {
      done('Too many turns');
    }

    recordedTurns.push(turn);
    
    if (recordedTurns.length == 2) {
      expect(recordedTurns).toEqual([
        {
          tick: 0,
          userId: 'u0',
          commandId: 'c0',
        },
        {
          tick: 2,
          userId: 'u1',
          commandId: 'c2',
        },
      ]);
      done();
    }
  });
});
